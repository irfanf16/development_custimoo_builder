<template>
  <div class="page-wrapper m-lg-4" v-cloak>
    <div v-if="showLoader" class="loader">
      <img src="@assets/images/loading.gif" />
    </div>
    <div class="d-flex justify-content-between">
      <div class="fs-4 font-weight-bold">
        {{title}}
      </div>
      <div class="d-flex align-items-center gap-2">
        <div>
          <b-input-group>
            <template #append>
              <b-input-group-text style="height: 33px; cursor: pointer" @click="clearFilter"><strong class="text-secondary">X</strong></b-input-group-text>
            </template>
            <b-form-select v-model="params.filter" :options="options" style="height: 33px; line-height: 33px; padding-top: 0; padding-bottom: 0;" @change="filterOrders">
              <!-- This slot appears above the options from 'options' prop -->
              <template #first>
                <b-form-select-option :value="null" disabled>-- Please select an option --</b-form-select-option>
              </template>

              <!-- These options will appear after the ones from 'options' prop -->
            </b-form-select>
          </b-input-group>
          <!--            <div class="mt-3">Selected: <strong>{{ selected }}</strong></div>-->
        </div>

        <div style="max-width: 230px; flex-shrink: 1;">
          <b-input-group>
            <template #append>
              <b-input-group-text style="height: 33px; cursor: pointer" @click="clearSearch()"><strong class="text-secondary">X</strong></b-input-group-text>
            </template>
            <b-form-input type="text" style="height: 33px;" placeholder="Search" @keyup.enter="filterOrders" v-model="params.search" />
          </b-input-group>
        </div>
      </div>
    </div>

    <div class="orders-container my-4">
      <div class="table-responsive">
        <table class="order-listing">
          <tbody>
          <tr>
            <th>
              {{ page_type == 'order' ? 'Order' : 'Quote' }} No
            </th>
            <th>
              Created At
            </th>
            <th>
              Items Count
            </th>
            <th class="text-left">
              {{ page_type == 'order' ? 'Order' : 'Quote' }} Status
            </th>
            <th>
              {{ page_type == 'order' ? 'Order' : 'Quote' }} Reference
            </th>
            <th>
              Actions
            </th>
          </tr>
          <template v-if="orders.length !== 0">
            <template v-for="(order,index) in orders" >
              <tr  @click="toggleAccordion(index)" :key="index" >
                <td>
                  {{order.order_no}}
                </td>
                <td>
                  {{ order.created_at | orderDate }}
                </td>
                <td>
                  {{order.roster_quantity}}
                </td>
                <td>
                  <div class="d-flex gap-1 flex-wrap">
                    <div v-for="(item, index) in order.items" :key="index" class="d-inline-flex well py-1 px-2 bg-light gap-1 align-items-center">
                      <span class="factory_status submitted_for_factory_review"  v-if="item.status == 'order_approve'">{{ 'submitted_for_factory_review' | Status}}</span>
                      <span class="factory_status" :class="item.status" v-else>{{item.status | Status}}</span>
                    </div>
                  </div>
                </td>
                <td>
                  {{ order.customer_reference_no ? order.customer_reference_no : 'N / A' }}
                </td>
                <td>

                  <a v-if="order.additional_fields && !order.additional_fields.hasOwnProperty('is_manual_order')" @click="openAWSFileFromOrder(order)" class="btn btn-dark mx-2 fs-2">PDF</a>
                  <router-link  :to="`order/${order.id}/detail`" class="btn btn-dark mx-2 fs-2">Details</router-link>
                      <button
                        class="btn btn-dark mx-2 cursor-pointer fs-2" :key="`${order.id}_cancel_${index}`"
                        v-if="order.items.every((item)=> item.status === 'submitted_for_factory_review')"
                        @click.stop="cancelOrder(order)">
                        Cancel
                      </button>
                  <div class="btn d-inline-flex accordion-icon">
                    <b-icon
                      :icon="isAccordionOpen === index ? 'chevron-right' : 'chevron-down'"
                      :class="{ 'rotate-icon': isAccordionOpen === index, 'larger-icon': true }"
                      aria-hidden="true"
                      class="chevron-icon"
                    ></b-icon>
                  </div>
                </td>
              </tr>
              <transition name="fade">
                  <tr :key="'order-detail'+index" class="order-detail-row accordion-body" v-show="isAccordionOpen === index">
                    <td>&nbsp;</td>
                    <td colspan="5" class="order-detail-container bg-light">
                      <template v-for="(item,indexItem) in order.items" >
                        <div class="order-detail" :key="indexItem+index">
                          <div class="factory-container">
                            <h2 class="factory-name d-flex align-items-center gap-1"> {{ 'Factory ' + parseInt(indexItem + 1) }} <span class="factory_status" :class="item.status">{{item.status | Status}}</span></h2>
                          </div>
                          <table class="w-100">
                            <template v-for="(product,factoryProductIndex) in item.factory_products">
                              <tr class="product-details" :key="indexItem + factoryProductIndex + index">
                                <td>{{ product.product_name }}</td>
                                <template v-if="!product.shop_id && product.is_custom_product">
                                  <td class="image"><img :src="`${storage_url}${product.custom_product_placeholder}`" class="img-thumbnail img-fluid" style="width: 80px"></td>
                                  <td class="image"><img :src="`${storage_url}${product.custom_product_placeholder}`" class="img-thumbnail img-fluid" style="width: 80px"></td>
                                </template>
                                <template v-else>
                                  <td class="image"><img :src="`${storage_url}${product.front_image}`" class="img-thumbnail img-fluid" style="width: 80px"></td>
                                  <td class="image">
                                    <img v-if="product.back_image" :src="`${storage_url}${product.back_image}`" class="img-thumbnail img-fluid" style="width: 80px">
                                    <span v-else>
                                      N/A
                                    </span>
                                  </td>
                                </template>
                                <td>{{ product.roster_quantity }}</td>
                                <td style="text-align: center">
                                  <template v-if="page_type == 'order'">
                                    <div class="d-flex w-100 gap-1">
                                      <template>
                                        <template v-if="Object.prototype.hasOwnProperty.call(product, 'is_custom_product') && !product.is_custom_product">
                                          <span class="btn btn-dark btn-sm mx-xxl-2" @click="saveToLockerRoom(product)">Save As</span>
                                          <span  v-if="product.share_design_info.show_loader" class="btn btn-dark light  btn-sm mx-xxl-2" :disabled="true" title="Adding to cart">
                                          <img width="20" height="20" src="@assets/images/loading.gif" />
                                        </span>
                                          <span v-else-if="product.share_design_info.share_url" class="btn btn-dark btn-sm mx-xxl-2" @click="copyShareUrl(product.share_design_info.share_url)">Copy Share Url</span>
                                          <span v-else class="btn btn-dark btn-sm mx-xxl-2" @click="shareDesign(item.id, product)">Share</span>
                                        </template>
                                      </template>
                                      <template>
                                        <span  v-if="product.adding_to_cart" class="btn btn-dark light  btn-sm mx-xxl-2" :disabled="true" title="Adding to cart">
                                          <img width="20" height="20" src="@assets/images/loading.gif" />
                                        </span>
                                        <span v-else class="btn btn-dark btn-sm mx-xxl-2" @click="addToCart(item.id, product)">Add To Cart</span>
                                      </template>
                                      <template v-if="order.order_no && product.can_reorder">
                                        <span class="btn btn-dark btn-sm mx-xxl-2" @click="reorderItem(order, item, product, factoryProductIndex)">Reorder</span>
                                      </template>
                                      <template v-else>
                                        <span class="btn btn-cancel mx-xxl-2" title="The product no longer exists">Reorder</span>
                                      </template>
                                    </div>
                                  </template>
                                  <template v-else>
                                    <div class="d-flex w-100 gap-1">
                                      <span v-if="item.status == 'quote_requested'"
                                            @click="updateOrderProducts(item, item.latest_status_activity.id)"
                                            class="btn btn-dark btn-sm mx-xxl-2">Update Quote</span>
                                    </div>

                                  </template>
                                </td>
                              </tr>
                            </template>
                          </table>
                        </div>
                      </template>
                    </td>
                  </tr>
              </transition>
            </template>
            <template v-if="locker_room_product">
              <AddLockerRoomModal :locker_room_product="locker_room_product" locker_room_product_type="order_product"
                                  :frontPreview="`${storage_url}${locker_room_product.front_image}`"
                                  :backPreview="`${storage_url}${locker_room_product.back_image}`" ref="saveToLockerModal"/>
            </template>
          </template>
          <template v-else>
            <tr class="text-center">
              <td colspan="4">No records found</td>
            </tr>
          </template>
          </tbody>
        </table>
      </div>
      <confirm-modal :message="cancel_confirm_message" ref="confirm_order_cancel" name="confirm_order_cancel"></confirm-modal>
    </div>
    <b-pagination
      v-model="pagination.currentPage"
      :total-rows="pagination.rows"
      :per-page="pagination.perPage"
      aria-controls="itemList"
      align="center"
      @change="handlePagination"
      v-if="pagination.total > 0"
    ></b-pagination>
  </div>
</template>

<script lang="ts">
import AddLockerRoomModal from "@/components/AddLockerRoomModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Search from '@/components/Search.vue';
import {
  CustimooOrderFlowStatuses,
  exitFromEditMode, getReorderDataDefaultObject,
  handleResponseException, isGetCategories, navigateToCustomProduct,
  resetLastActiveProductData, santaClone, updateOrderProducts
} from '@/helpers/Helpers';
import { http } from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";
import ModalAction from "@/mixins/ModalAction";
import moment from "moment";
import { query } from "vue-gtag";
import { Component, Mixins, Prop, Vue } from "vue-property-decorator";

Vue.filter('orderDate', function(value:string) {
  if (value) {
    return moment(value).format('MMMM DD')
  }
})

Vue.filter('Status', function(value:string) {
  if (value) {
    return CustimooOrderFlowStatuses[value];
  }
})

@Component<OrderListing>({
  components:{
    AddLockerRoomModal,
    ConfirmModal,
    Search
  },
  created(){

    if((this.$route as Record<any,any>)?.query?.filter in CustimooOrderFlowStatuses){
      this.params.filter = this.$route.query.filter;
      this.filterOrders();
    }
    else{
      this.getOrders();
    }
  },
  computed: {
    title() {
      this.getOrders();

      let quote_options = ['quote_requested', 'quote_rejected', 'quote_provided'];
      this.options = [];
      Object.entries(CustimooOrderFlowStatuses).forEach(([key, value]) => {
        if(this.page_type == 'quote' && quote_options.includes(key)) {
          this.options.push({
            value: key,
            text: value
          })
        } else if(this.page_type == 'order' && !quote_options.includes(key)) {

          this.options.push({
            value: key,
            text: value
          })
        }
      });

      return this.page_type === 'order' ? 'Orders' : 'Quotes';


    }
  }
})
export default class OrderListing  extends Mixins(ErrorMessages, ModalAction)  {
  @Prop({ required: false, default: 'order' }) readonly page_type!: string;
  private screenWidth = (window.screen.availWidth - 100)
  public storage_url = process.env.VUE_APP_STORAGE_URL
  public params:Record<any,any> = {
    search: '',
    filter : null,
  }
  public options: Record<any, any>[] = [];
  public orders = []
  public showLoader = false
  public search = ''
  public titles:Record<any, any>[] = [
    {key: 'order_no', label: 'Order Number'},
    {key: 'customer_name', label: 'Customer Name'},
    {key: 'order_no', label: 'Order Number'},
    {key: '', label: 'adsasd'},
  ]
  private ref = this.$refs;
  public pagination:Record<any, any> ={
    rows:null,
    currentPage:1,
    perPage:10,
    total:0
  }
  public toggletText =  ['show', 'hide']
  public locker_room_product = null;
  public cancel_confirm_message =  `Are you sure that you want to cancel this order?`
  public isAccordionOpen = null;

  get locker_products(){
    return this.$store.getters.getLockerProducts;
  }

  public async getOrders(params: string | void){
    if(!params) {
      params = this.page_type ? '?page_type='+this.page_type :''
    } else {
     if(this.page_type)
       params += '&page_type='+this.page_type
    }

    http.get('orders'+params).then((res:Record<any, any>) => {
      this.orders =  res.data.result.data
      this.makePagination(res.data.result)
    }).catch((e:any) => {
      this.showError(e.response.data.message)
    })
  }

  public async openAWSFileFromOrder(order){
    try{
      let order_id = order.id

      // Fetch the URL from the Laravel API
      this.showLoader= true;
      const response = await http.get(`designfile/order/${order_id}`);
      this.showLoader = false;
      const url = response.data.result.url;
      if(url){
        window.open(`${url}`, '_blank');
      }
    } catch (error) {
      console.error('Error fetching the PDF URL:', error);
    }
  }

  public hideOrderspopup(){
    this.$modal.hide('orderspopup')
  }
  public async showOdersPopup(){
    this.showLoader = true
    await this.getOrders('')
    this.$modal.show('orderspopup')
  }

  public async cancelOrder(order:Record<any, any>){
    let cancel_confirm_message = `<h3 class="text-primary">Order pending confirmation</h3> Are you sure that you want to cancel this order?`
    if(order.order_no){
       cancel_confirm_message = `<h3 class="text-primary">Order no: <strong class="font-weight-bold">${order.order_no}</strong></h3> Are you sure that you want to cancel this order?`
    }
    this.cancel_confirm_message = cancel_confirm_message;
    const confirm_modal = (this.$refs['confirm_order_cancel'] as Record<any, any>);
    const confirm = await confirm_modal.showConfirm();

    if(confirm){
      this.showLoader = true;
      http.put(`customer-orders/cancel/${order.id}`).then(async (res:Record<any, any>) => {
        console.log('res', res.data)
        if(res.data.success){
          await this.getOrders();
          this.showToast(res.data.message, 'success');
        }else{
          this.showToast('ERROR! Could not cancel the order, please try again.', 'error')
        }

        this.showLoader = false;
      })
    }
  }

  public makePagination(data:Record<any, any>){
    this.pagination.currentPage = data.current_page;
    this.pagination.rows = data.total;
    this.pagination.perPage = data.per_page;
    this.pagination.total = data.total;
  }
  public handlePagination(page:string|''){
    let params = '?page='+page;
    if(this.params.search && this.params.filter) {
      params += 'search='+this.params.search + '&filter=' + this.params.filter;
    }
    else if(this.params.search){
      params += 'search='+this.params.search;
    }
    else if(this.params.filter){
      params += 'filter=' + this.params.filter;
    }
    else{
      params = '?page='+page;
    }
    this.getOrders(params);
  }


  public clearSearch(){
    this.params.search = '';
    this.filterOrders();
  }
  public clearFilter(){
    this.params.filter = null;
    this.filterOrders();
  }
  public filterOrders(){
    let params = '?';
    if(this.params.search && this.params.filter) {
      params += 'search='+this.params.search + '&filter=' + this.params.filter;
    }
    else if(this.params.search){
      params += 'search='+this.params.search;
    }
    else if(this.params.filter){
      params += 'filter=' + this.params.filter;
    }
    else{
      params = '';
    }
    this.getOrders(params);
  }
  public reorderItem(order: Record<any, any>,order_item: Record<any, any>, factory_product: Record<any, any>, factory_product_index: string) {
    const order_item_id: string = order_item.id
    http.post(`product/${factory_product.product_id}/can_reorder`).then(async (res:Record<any, any>) => {
      const res_result = res.data.result
      if(res_result.can_reorder) {
        exitFromEditMode()
        resetLastActiveProductData()
        await this.$store.commit('SET_PRODUCTS', { products: [] });
        if(factory_product.is_custom_product) {
          const reorder_item_obj = getReorderDataDefaultObject();
          reorder_item_obj.order_id = order.id;
          reorder_item_obj.order_number = order.order_no;
          reorder_item_obj.order_item_id = order_item_id;
          reorder_item_obj.factory_id = order_item.factory_id;
          reorder_item_obj.factory_name = order_item.factory_name;
          reorder_item_obj.factory_product_id = factory_product.id;
          let custom_product_object = santaClone(factory_product);
          custom_product_object.reorder_data = reorder_item_obj
          custom_product_object.edit_mode_info_obj = {
            mode: 'reorder', item_id: order_item_id, factory_product_id: factory_product.id, factory_product_index: factory_product_index
          }
          await navigateToCustomProduct(custom_product_object).catch(errorResponse => {
            handleResponseException(errorResponse)
          });
        } else {
          this.$router.push({
            name: 'Home',
            query: {
              is_reorder: 'true', order_id: order.id, order_number: order.order_no , order_item_id: order_item_id,
              factory_product_id:  factory_product.id, active_product_id:  factory_product.product_id,
              style_id: factory_product.style_id, design_id: factory_product.design_id, factory_id: order_item.factory_id,
              factory_name: order_item.factory_name,
            }
          });
        }
      } else {
        this.showError(res.data.message)
      }
    }).catch((e:any) => {
      this.showError(e.response.data.message)
    })

  }
  saveToLockerRoom(product) {
    this.locker_room_product = product;
   setTimeout(() => {
     //@ts-ignore
     this.ref['saveToLockerModal'].showSaveToLockerRoomModal()
   })
  }
  addToCart(order_item_id, product) {
    const cart_data = { order_item_id, product_id: product.product_id, factory_product_id: product.id }
    product.adding_to_cart = true
    http.post(`add_product_to_cart`, cart_data).then(async (successResponse:any) => {
      const response_data = successResponse.data;
      if(response_data.success) {
        this.showToast(response_data.message, "success")
      } else {
        this.showError(response_data.message)
      }
      product.adding_to_cart = false
    }).catch((e:any) => {
      product.adding_to_cart = false
      this.showError(e.response.data.message)
    })
  }

  async shareDesign(order_item_id, product) {
  this.locker_room_product = product;
  product.share_design_info.show_loader = true
    setTimeout(async () => {
      //@ts-ignore
      await this.ref['saveToLockerModal'].shareOrderProductDesignUrl().then(successResponse => {
        product.share_design_info.show_loader = false
        product.share_design_info.share_url = successResponse.data.url
        this.copyShareUrl(product.share_design_info.share_url)
      }).catch(errorResponse => {
        product.share_design_info.show_loader = false
        handleResponseException(errorResponse)
      })
    })
  }

  copyShareUrl(clipboard_string) {
    const clipboard_input_field = document.createElement("input");
    clipboard_input_field.value = clipboard_string;
    document.body.appendChild(clipboard_input_field);
    clipboard_input_field.select();
    document.execCommand("copy");
    document.body.removeChild(clipboard_input_field);
    this.showToast("Design share url copied", "success")
  }
  toggleAccordion(index) {
    this.isAccordionOpen = this.isAccordionOpen === index ? null : index;
  }

  updateOrderProducts(order_item: Record<any, any>, order_item_status_activity: number) {
    updateOrderProducts(order_item, order_item_status_activity);
  }

}
</script>

<style scoped lang="scss">
.loader{
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
  background: rgba(255,255,255,0.9);
  z-index: 1030;
  img{
    max-width: 7%;
    display: block;
    margin: 0 auto;
    height: auto;
  }
  [v-cloak] {
    display: none !important;
  }
}

.list-item-container{
  width: 80%;
  margin: 0 auto;
  background-color: gray;
  margin-bottom: 10px;
}
.list-item-head{
  background-color: #35495E;
  color: #fff;
}
.float-right{
  float: right;
}
.toggle{
  cursor: pointer;
}

.order-listing{
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;

  @media (max-width: 991px) {
    table-layout: auto;
  }

  &>tbody{
    &>tr{
     &>th{
       &:nth-child(1){
         width: 7%;
       }
       &:nth-child(2){
         width: 7%;
       }
       &:nth-child(3){
         width: 7%;
       }
       &:nth-child(4){
         width: 45%;
       }
       &:nth-child(5){
         width: 10%;
       }
       &:nth-child(6){
         width: 23%;
       }
     }
    }
  }
}

table.order-listing td, table.order-listing th {
  border: 1px solid #aec2d6;
  padding: 8px;
}

table.order-listing tr:nth-child(even){background-color: #dee2e6;}

table.order-listing tr:hover {background-color: #ddd;}

table.order-listing th {
  padding-top: 12px;
  padding-bottom: 12px;
  /*background-color: #219F84;*/
  color: black;
  font-weight: bold;
  text-align: center;
}

.order-detail{
  margin: 0 -1px;
}

.order-detail .factory-container{
  font-weight: bold;
  text-align: left;
  font-size: large;
}
.order-detail .factory-container .factory-name {
  margin: 0;
  padding: 15px;
}
.product-details td {
  text-align: left;
  vertical-align: middle;
}

.order-detail-row{
  background: none !important;

  td.order-detail-container{
    padding: 0rem;

    .order-detail{
      background: #f5f5f5;

      table{
        tr{
          background: transparent;

          td{
            background: transparent;
            padding: 5px 10px;
          }
        }
      }
    }
  }
}

.product-details td.image{
  text-align: center;
  vertical-align: middle;
}
table.order-listing{
  margin: 0;
}

.orders-container{
  border: 1px solid #aec2d6;
  border-radius: 10px;
  overflow: hidden;
  padding: 0;

  .order-listing{
    border: none;
    margin: -1px;
    width: calc(100% + 2px);

    th{
      background: #2c3e50;
      color: #fff;
    }
  }
}

.factory_status{
  display: inline-block;
  padding: 7px 10px;
  background: #e3e3e3;
  font-size: 12px;
  border-radius: 4px;
  line-height: normal;
  flex-shrink: 1;

  &:first-letter{
    text-transform: uppercase;
  }

  &.submitted_for_factory_review{
    background: #B997C6;
    color: #fff;
  }
  &.quote_requested{
    background: #B997C6;
    color: #fff;
  }
  &.pending_for_factory_assignment{
    background: #B997C6;
    color: #fff;
  }
  &.quote_provided{
    background: #57A2AC;
    color: #fff;
  }
  &.factory_approved{
    background: #57A2AC;
    color: #fff;
  }
  &.factory_rejected{
    background: #CE2220;
    color: #fff;
  }
  &.quote_rejected{
    background: #CE2220;
    color: #fff;
  }
  &.submitted_for_customer_review{
    background: #B997C6;
    color: #fff;
  }
  &.customer_approved{
    background: #57A2AC;
    color: #fff;
  }
  &.customer_rejected{
    background: #CE2220;
    color: #fff;
  }
  &.in_production{
    background: #D0B440;
    color: #fff;
  }
  &.shipped{
    background: #4E79C4;
    color: #fff;
  }
  &.completed{
    background: #7EB875;
    color: #fff;
  }
  &.unknown_status{

  }
}
/* Add your styling for accordion here */
.accordion-icon {
  cursor: pointer;
  padding: 10px;
}

.accordion-body {
  padding: 10px;
  background-color: #ffffff;
}

.chevron-icon{
  transition: transform 0.5s ease;

  &.rotate-icon {
    transform: rotate(180deg);
  }
}

.larger-icon {
  font-size: 32px; /* Adjust the size as needed */
}

.accordion-fade-enter-active, .accordion-fade-leave-active {
  transition: opacity 0.5s ease; /* Adjust the timing function as needed */
}

.accordion-fade-enter, .accordion-fade-leave-to {
  opacity: 0;
}

</style>
