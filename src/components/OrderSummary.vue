<template>
  <div>
    <div class="d-lg-none">
      <RosterDetails @addToCartAnimation="()=>this.$emit('addToCartAnimation')"
                     :products_fonts="products_fonts" :lockers="lockers"
                     @addPlayer="rosterDetailsInit" :productSizes="productSizes"
                     ref="roster-detail"/>
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
    await this.getLockerProductsRosters()

    await this.setRosterTotal(this.productRosters)
  }
})

export default class EditRosterAreaTab extends Mixins(ModalAction) {
  /*
  * data props starts
  * */

  @Prop({ required: true }) readonly products_fonts!: Record<any, any>[]
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
    return this.$store.getters.selectedProductCustomTexts();
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
    if(self.company.platform != 'wordpress' && self.company.platform != 'shopify' ) {
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
    let response: any = this.isCustomerAuthenticated && await http.get("lockers_with_rosters").catch((errorResponse: AxiosError) => {
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
