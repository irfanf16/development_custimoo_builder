<template>
  <div>
    <modal id="modal-scrollable" :width="screenWidth"
           :resizable="true"
           :scrollable="true"
           height="auto"
           :reset="true"
           :shiftY="0"
           @opened="setRosterOpen(true), getLockerProductsRosters()"
           name="rostermodal" class="roster-modal absolute-modals" size="xl"
           footer-class="hide-modal-footer d-none"
           @before-close="handleRosterModalBeforeClose"
        >
      <div class="modal-header d-flex justify-content-between">
        <span class="fs-5 font-weight-bolder">Edit {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}}</span>
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" v-if="getProductEditInfoObject.type == 'cart_product' && goBackToCart" @click="cancelCart"><BIconX /></span>
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" v-else-if="getProductEditInfoObject.type == 'locker_product' && isEditingFromRoster" @click="cancelLocker"><BIconX /></span>
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" v-else @click="close"><BIconX /></span>
      </div>
      <div class="modal-body">
        <div class="d-flex flex-wrap justify-content-between">
          <RosterDetails :productSizes="sizeOptions" ref="roster-detail"
                         @addToCartAnimation="()=>this.$emit('addToCartAnimation')"
                         :lockers="lockers" @addPlayer="rosterDetailsInit" :products_fonts="products_fonts" />
          <div class="roster-preview-area">
            <CustomizationPreview :fromRosterModal="true" :designs="products[designsIndex]" :products_fonts="products_fonts" />
            <div class="d-flex py-2 fs-3 justify-content-end">
              <div>Total:</div>
              <div class="ml-4 font-weight-bolder">{{ productPriceObject.total_quantity }}</div>
            </div>
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop,Watch} from 'vue-property-decorator'
import CustomizationPreview from '@/components/CustomizationPreview.vue'
import OrderDetailsTab from '@/components/OrderDetailsTab.vue'
import RosterDetails from '@/components/RosterDetails.vue'
import {http} from "@/httpCommon";
import Scene from "@/components/Scene.vue"
import {getRosterDetailDefaultObject, handleResponseException, getCustomLockers, isEcommercePlatform} from '@/helpers/Helpers'
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
    await this.setProductSizes()
    await this.getLockerProductsRosters()

    await this.setRosterTotal(this.productRosters)
  }
})

export default class EditRosterAreaTab extends Mixins(ModalAction) {
  /*
  * data props starts
  * */

  @Prop({ required: true }) readonly products_fonts!: Record<any, any>[]

  /*
  * props ends
  * */

  /*
  * data props starts
  * */

  private products: any[] = []
  public designsIndex = 0
  public sizeOptions: Record<any, any>[] = []
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
    return this.$store.getters.selectedProductCustomTexts;
  }

  get custom_name_index() : number {
    return findIndex(this.customText, { type: 'name' })
  }

  get custom_number_index() : number {
    return findIndex(this.customText, { type: 'number' })
  }

  get productPriceObject(): Record<any, any> {
    return this.$store.getters.getProductPriceObject
  }

  get goBackToCart():boolean{
    return this.getProductEditInfoObject.cart_product_info!.meta_info!.back_to_cart
  }
  /* getters/computed props ends */

  /*
* watcher starts
* */

  get productSizes(){
    const selectedProduct = this.$store.getters.getSelectedProduct
    if(selectedProduct) {
      return selectedProduct.sizes[0].json_data
    } else {
      return []
    }
  }
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

  private setRosterOpen(val: boolean) {
    this.$store.commit('SET_IS_ROSTER_OPEN', val)
  }

  public shareRoster(){
    this.ref['order-details'].getLockers();
  }

  public openAddToLocker () {
    this.$emit('open-add-to-locker')
  }

  public hide(){
    this.hideVModal('rostermodal')
  }

  public close(){
    const self = this as Record<any, any>;
    this.$store.commit('SET_REVERT_ROSTER_BOOL',true);

    self.ref['roster-detail'].handleRosterClose()
  }

  public cancelLocker(){
    const self = this as Record<any, any>;
    self.$eventBus.$emit('cancelLocker');
    self.close()
    self.$modal.show('locker-modal');
  }

  public cancelCart(){
    const self = this as Record<any, any>;
    self.close()
    if(!isEcommercePlatform()) {
      self.$modal.show('cart-modal')
    }
    self.$eventBus.$emit('cancelCart');
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
    if(this.productSizes){
      this.productSizes.forEach((size: any, key: number) => {
        let sizes = {value: size.name, text: size.name}
        this.sizeOptions = this.sizeOptions.concat([sizes])
      })
    }
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
    getCustomLockers().then((customer_lockers: Record<any, any>[]) => {
      this.lockers = customer_lockers
    })
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


.loader {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 1030;

  img {
    max-width: 7%;
    display: block;
    margin: 0 auto;
    height: auto;
  }
}
</style>
