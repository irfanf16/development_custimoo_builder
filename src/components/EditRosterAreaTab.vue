<template>
  <div>
    <div class="d-flex gap-2" v-if="!getProductEditInfoObject.editing || ( getProductEditInfoObject.editing && getProductEditInfoObject.type != 'order_product')">
      <b-button class="d-none d-lg-block" @click="show">Edit {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}}</b-button>
<!--      <button class="btn btn-secondary light" v-if="isCustomerAuthenticated && company.platform != 'cdnExceptLogin'" @click="shareRoster">Share {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'roster' }} url</button>-->
    </div>

    <modal id="modal-scrollable" :width="screenWidth"
           :resizable="true"
           :scrollable="true"
           height="auto"
           :reset="true"
           :shiftY="0"
           @opened="$emit('setRosterOpen', true)"
           name="rostermodal" class="roster-modal" size="xl"
             footer-class="hide-modal-footer d-none"
          @closed="close" @before-close="handleRosterModalBeforeClose"
        >
      <div class="modal-header d-flex justify-content-between">
        <span class="fs-5 font-weight-bolder">Edit {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}}</span>
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" v-if="getProductEditInfoObject.type == 'cart_product'" @click="cancelCart"><BIconX /></span>
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" v-else-if="getProductEditInfoObject.type == 'locker_product' && isEditingFromRoster" @click="cancelLocker"><BIconX /></span>
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" v-else @click="close"><BIconX /></span>
      </div>
      <div class="modal-body">
        <div class="d-flex flex-wrap justify-content-between">
          <RosterDetails :productSizes="sizeOptions" ref="rostermodal" @addToCartAnimation="()=>this.$emit('addToCartAnimation')" :lockers="lockers" @addPlayer="rosterDetailsInit" :products_fonts="products_fonts" />
          <div class="roster-preview-area">
            <CustomizationPreview :fromRosterModal="true" :designs="products[designsIndex]" :products_fonts="products_fonts" />
            <div class="d-flex py-2 fs-3 justify-content-end">
              <div>Total:</div>
              <div class="ml-4 font-weight-bolder">{{ rosterTotal }}</div>
            </div>
          </div>
        </div>
      </div>
    </modal>
    <modal :width="screenWidth"
           :resizable="true"
           :scrollable="true"
           height="auto"
           :reset="true"
           :shiftY="0" name="rosterfilemodal"  content-class="upload-logo-disclaimer roster-msg" id="modal-center-uploadroster" centered  size="lg">
      <div class="modal-body">
      <p class="mb-4">The {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Team Roster' | TitleCase}} can be automatically imported from an excel sheet. Please download and use the excel sheet below. No other excel sheets or documents can be used to import data.</p>
      <div class="roster-template-area">
        <b-button @click="downloadTemplate" class="btn btn-secondary fw-bold">Download {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}} Template <a  v-b-tooltip.hover
                                                                                                           title="Enter roster in excel file">
          <font-awesome-icon :icon="['fas', 'info-circle']"/>
        </a></b-button>

        <b-button type="upload" name="Upload Template" @change="onChange" class="btn btn-secondary fw-bold" accept="image/x-png,image/jpeg,pdf">Upload {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}} Template
          <b-form-file  class="mb-2"></b-form-file>
          <a href="#" v-b-tooltip.hover title="Upload the template here to populate the roster">
            <font-awesome-icon :icon="['fas', 'info-circle']"/>
          </a></b-button>
      </div>
      </div>
    </modal>

    <div class="d-lg-none">
      <RosterDetails @addToCartAnimation="()=>this.$emit('addToCartAnimation')" @setActionBeforeLogin="setActionBeforeLogin" :products_fonts="products_fonts" :lockers="lockers" @addPlayer="rosterDetailsInit" :productSizes="productSizes" ref="roster-detail"/>
    </div>
    <div class="team-order-details">
      <OrderDetailsTab :products_fonts="products_fonts" @open-add-to-locker="openAddToLocker" ref="order-details" />
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop,Watch} from 'vue-property-decorator'
import CustomizationPreview from '@/components/CustomizationPreview.vue'
import OrderDetailsTab from '@/components/OrderDetailsTab.vue'
import RosterDetails from '@/components/RosterDetails.vue'
import {http} from "@/httpCommon";
import readXlsxFile from "read-excel-file";
import Scene from "@/components/Scene.vue"
import {getRosterDetailDefaultObject, handleResponseException} from '@/helpers/Helpers'
import { findIndex } from 'lodash'
import ModalAction from "@/mixins/ModalAction";
import {AxiosError, AxiosResponse} from "axios";


@Component<EditRosterAreaTab>({
  components: {
    CustomizationPreview,
    OrderDetailsTab,
    RosterDetails,
    Scene
  },
    async mounted() {
    this.setProductSizes()
    if (this.isCustomerAuthenticated) {
      await this.getLockerProductsRosters()
    }

    await this.setRosterTotal(this.productRosters)
  }
})

export default class EditRosterAreaTab extends Mixins(ModalAction) {
  /*
  * data props starts
  * */

  @Prop({ required: true }) readonly products_fonts!: Record<any, any>
  @Prop({required: true}) productSizes!: any

  /*
  * props ends
  * */

  /*
  * data props starts
  * */

  private products: any[] = []
  public designsIndex = 0
  public sizeOptions: Record<any, any>[] = []
  public fileData: Record<any, any>[] = []
  public lockers: Record<any, any>[] = []
  public ref = this.$refs as Record<any, any>
  public rosterTotal = 0
  private screenWidth = (window.screen.availWidth - 100)

  /*
  * data props ends
  * */

  /* getters/computed props starts */

  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  get company(){
    return this.$store.getters.getCompany
  }

  get allproducts(){
    return this.$store.getters.getProducts
  }

  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails()
  }

  get customer():Record<any, any>{
    return  this.$store.getters.getCustomer
  }

  get productRosters(): [Record<any, any>]{
    return this.$store.getters.getProductRosters(this.selectedProduct.id)
  }

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get isEditingFromRoster():boolean{
    return this.$store.getters.getEditRosterFromLocker;
  }

  get styleIndex(): number {
    return this.$store.getters.getCurrentStyleIndex;
  }

  get notifications(){
    return this.$store.getters.getNotifications
  }

  get getProductEditInfoObject() {
    return this.$store.getters.getProductEditInfoObject
  }

  get customText(): Record<any, any>[] {
    return this.$store.getters.getCustomTexts();
  }

  get custom_name_index() : number {
    return findIndex(this.customText, { type: 'name' })
  }

  get custom_number_index() : number {
    return findIndex(this.customText, { type: 'number' })
  }

  /* getters/computed props ends */

  /*
* watcher starts
* */

  @Watch('productSizes')
  productSizeChanged(){
    this.setProductSizes();
  }

  @Watch('productRosters')
  productRostersChanged(){
    this.setRosterTotal(this.productRosters)
  }

  /*
  * watcher ends
  * */


  /*
  * methods starts
  * */

  public shareRoster(){
    this.ref['order-details'].getLockers();
  }

  private setActionBeforeLogin(val:string){
    this.$emit('setActionBeforeLogin', val)
  }

  public openAddToLocker () {
    this.$emit('open-add-to-locker')
  }

  public async show(){
    this.showVModal('rostermodal')
  }

  public hide(){
    this.hideVModal('rostermodal')
  }

  public close(){
    const self = this as Record<any, any>;
    this.$store.commit('SET_REVERT_ROSTER_BOOL',true);

    self.$modal.hide('rostermodal');

    if(self.isEditingFromRoster){
      self.$eventBus.$emit('cancelLocker');
      self.$modal.show('locker-modal')
    }
  }

  public cancelLocker(){
    const self = this as Record<any, any>;
    self.$eventBus.$emit('cancelLocker');
    self.close()
    self.$modal.show('locker-modal')
  }

  public cancelCart(){
    const self = this as Record<any, any>;
    self.$eventBus.$emit('cancelCart');
    self.close()
    self.$modal.show('cart-modal')
  }

  public rosterDetailsInit(index = 0, product = this.selectedProduct) {
    let payload = getRosterDetailDefaultObject(product)
    if(this.sizeOptions.length > 0) {
      payload.size = this.sizeOptions[0].text;
      payload.code = this.sizeOptions[0].value;
    }
    this.$store.dispatch('setRosterDetails', { pid : product.id, index: index, roster: payload })
  }

  public setProductSizes() {
    this.sizeOptions = [];
    this.productSizes.forEach((size: any, key: number) => {
      let sizes = {value: size.name, text: size.name}
      this.sizeOptions = this.sizeOptions.concat([sizes])
    })
  }

  public setRosterTotal(roster:Record<any, any>[]){
    let total = 0;
    roster && roster.forEach((item:Record<any, any>, index:number)=>{
      total += +item.quantity
    })
    this.rosterTotal = total;
  }

  public changeProduct(designsIndex: number) {
    this.designsIndex = designsIndex
  }

  public getOccurence(val: string) {
    let count = (val.match(/\*/g) || []).length;
    return count
  }
  public onChange(event: Record<any, any>){
    let status = true;
    let loopStatus = true;
    let files = event.target.files ? event.target.files[0] : null;
    let ext = files.name.split('.').pop();
    if (ext != 'xlsx'){
      alert("please upload a valid excel file");
      return false
    }
    readXlsxFile(files).then((rows: any[][]) => {
      if (rows[0].length != 8){
        alert("please upload valid file")
        return false
      }
      for (let i in rows[0]){
        if (i == '3'){
          let count = this.getOccurence(rows[0][i]);
          if (count != 1 || rows[0][i] != "2. SIZE*"){
            status = false
            break;
          }
        }
        if (i == '4'){
          let count = this.getOccurence(rows[0][i]);
          if (count != 2 || rows[0][i] != "3. NAME ON PRODUCT**"){
            status = false
            break;
          }
        }
        if (i == '6'){
          let count = this.getOccurence(rows[0][i]);
          if (count != 3 || rows[0][i] != "OTHER INFORMATION***"){
            status = false
            break;
          }
        }
      }
      if (status) {
        for (let row in rows){
          let obj = {
            text: '',
            number: '',
            size: '',
            quantity: 1,
            information: ''
          };
          if (row == '0'){
            continue
          }
          let objStatus = false;
          for (let i in rows[row]) {
            if (rows[row][2] && this.selectedProduct.product_name == rows[row][2]) {
              objStatus = true
              if (i == '3') {
                obj.size = rows[row][i];
              }
              if (i == '4') {
                obj.text = rows[row][i];
              }
              if (i == '5') {
                obj.number = rows[row][i];
              }
              if (i == '6') {
                obj.information = rows[row][i];
              }
            }
            if (loopStatus == false) {
              break
            }
          }
          if (objStatus) {
            this.fileData.push(obj);
          }
        }
        if (loopStatus == true){
          this.$store.dispatch('updateRoster', this.fileData);
          this.hideVModal('rosterfilemodal');
        }else{
          alert('Size is missing');
          this.hideVModal('rosterfilemodal');
        }
      }else{
        alert("please upload a valid file");
      }
    })
  }

  public async downloadTemplate(){
    await http.get('template/download',{
      responseType: 'blob',
    }).then((res) => {
      let blob = new Blob([res.data],{type:res.headers['content-type']})
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = 'roster_template.xlsx';
      link.click();
    })
  }

  public async getLockerProductsRosters() {
    let response: any = await http.get("lockers_with_rosters").catch((errorResponse: AxiosError) => {
      handleResponseException(errorResponse)
    })
    if(response) {
      let response_data: Record<any, any> = response.data;
      if (response_data.success) {
        this.lockers = response_data.result.lockers
      }
    }
  }

  handleRosterModalBeforeClose() {
    let self:Record<any, any>  = this;
    let first_roster_item = this.$store.getters.getProductRosters(this.selectedProduct.id,0);
    if(this.custom_name_index >= 0) {
      let custom_text_of_type_name = this.customText[this.custom_name_index];
      custom_text_of_type_name.value = first_roster_item.text
      this.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", { index: this.custom_name_index, value: custom_text_of_type_name})
      self.$eventBus.$emit("customTextUpdated", {
        emitter: "input", custom_text_index: this.custom_name_index, custom_text_item_index: null, value: custom_text_of_type_name
      });
    }
    if(this.custom_number_index >= 0) {
      let custom_text_of_type_number = this.customText[this.custom_number_index];
      custom_text_of_type_number.value = first_roster_item.number
      this.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", { index: this.custom_number_index, value: custom_text_of_type_number})
      self.$eventBus.$emit("customTextUpdated", {
        emitter: "input", custom_text_index: this.custom_number_index, custom_text_item_index: null, value: custom_text_of_type_number
      });
    }
  }


  /*
  * methods ends
  * */

}

</script>

<style lang="scss" scoped>
.roster-upload-area{
  overflow: hidden;
  margin: 0 0 15px;
  padding: 0;
  h3{
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 10px;
  }
  .btn{
    margin: 0 0 10px;
    svg{
      fill: #fff;
      color: #fff;
    }
    &:hover{
      svg{
        fill: #219f84;
        color: #219f84;
      }
    }
  }
}
.roster-template-area{
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  .btn-secondary{
    font-size: 14px;
    color: #219F84;
    background: #E7F4F1;
    font-weight: 500;
    flex: 0 0 48%;
    max-width: 48%;
    border-color: #E7F4F1;
    transition: all 0.3s ease;
    position: relative;
    &:hover{
      background: #219f84;
      color: #fff;
      a{color: #fff;}
    }
    .custom-file{
      position: absolute;
      right: 22%;
      left: 0;
      top: 0;
      bottom: 0;
      opacity: 0;
      margin: 0;
      width: auto;
    }
    a {
      color: #219f84;
      margin: 0 0 0 3px;
      position: relative;
      z-index: 9;

      &:hover {
        color: #fff;
      }
    }
  }
}
</style>
