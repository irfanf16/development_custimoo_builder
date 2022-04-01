<template>
  <div class="page-wrapper m-lg-4" v-cloak>
    <div class="d-flex justify-content-between">
      <div class="fs-4 font-weight-bold">
        Order
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
      <table class="order-listing">
        <tbody>
        <tr>
          <th>
            Order No
          </th>
          <th>
            Created At
          </th>
          <th>
            Items Count
          </th>
          <th class="text-left">
            Order Status
          </th>
          <th>
            Order Reference
          </th>
          <th>
            Actions
          </th>
        </tr>
        <template v-if="orders.length !== 0">
          <template v-for="(order,index) in orders" >
            <tr  @click="toggleHideShow(index,!order.visible)" :key="index" >
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
                    <span class="font-weight-bold">{{item.factory_name}}</span>
                    <span class="factory_status" :class="item.status">{{item.status | Status}}</span>
                  </div>
                  <div v-for="(item, index) in order.items" :key="index" class="d-inline-flex well py-1 px-2 bg-light gap-1 align-items-center">
                    <span class="font-weight-bold">{{item.factory_name}}</span>
                    <span class="factory_status" :class="item.status">{{item.status | Status}}</span>
                  </div>
                  <div v-for="(item, index) in order.items" :key="index" class="d-inline-flex well py-1 px-2 bg-light gap-1 align-items-center">
                    <span class="font-weight-bold">{{item.factory_name}}</span>
                    <span class="factory_status" :class="item.status">{{item.status | Status}}</span>
                  </div>
                </div>
              </td>
              <td>
                {{ order.customer_reference_no ? order.customer_reference_no : 'N / A' }}
              </td>
              <td>
                <a :href="`${storage_url}${order.design_file}`" target="_blank" class="btn btn-dark mx-2">PDF</a>
                <router-link  :to="`order/${order.id}/detail`" class="btn btn-dark mx-2">Details</router-link>
                <button class="btn btn-dark mx-2" @click="showChat(order.id, order.customer_id)">Chat</button>
              </td>
            </tr>
            <tr :key="'order-detail'+index" v-if="order.visible" class="order-detail-row">
              <td>&nbsp;</td>
              <td colspan="5" class="order-detail-container bg-light">
                <template v-for="(item,indexItem) in order.items" >
                  <div class="order-detail" :key="indexItem+index">
                    <div class="factory-container">
                      <h2 class="factory-name d-flex align-items-center gap-1">{{item.factory_name}} <span class="factory_status" :class="item.status">{{item.status | Status}}</span></h2>
                    </div>
                    <table class="w-100">
                      <template v-for="(product,indexProduct) in item.factory_products">
                        <tr class="product-details" :key="indexItem + indexProduct + index">
                          <td>{{ product.product_name }}</td>
                          <td class="image"><img :src="`${storage_url}${product.front_image}`" class="img-thumbnail img-fluid" style="width: 80px"></td>
                          <td class="image"><img :src="`${storage_url}${product.back_image}`" class="img-thumbnail img-fluid" style="width: 80px"></td>
                          <td>{{ product.roster_quantity }}</td>
                          <td><span class="factory_status" :class="product.status">{{ product.status | Status }}</span></td>
                        </tr>
                      </template>
                    </table>

                  </div>
                </template>
              </td>
            </tr>
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
    <b-pagination
      v-model="pagination.currentPage"
      :total-rows="pagination.rows"
      :per-page="pagination.perPage"
      aria-controls="itemList"
      align="center"
      @change="handlePagination"
      v-if="pagination.total > 0"
    ></b-pagination>
    <OrderChat ref="chatOrder" />
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Vue} from "vue-property-decorator";
import ErrorMessages from "@/mixins/ErrorMessages";
import {http} from "@/httpCommon";
import moment from "moment";
import {CustimooOrderFlowStatuses} from '@/helpers/Helpers';
import Search from '@/components/Search.vue';
import OrderChat from "@/components/OrderChat.vue";

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
    Search,
    OrderChat
  },
  created(){
    Object.entries(CustimooOrderFlowStatuses).forEach(([key, value]) => {
      this.options.push({
        value: key,
        text: value
      })
    });
    if((this.$route as Record<any,any>)?.query?.filter in CustimooOrderFlowStatuses){
      this.params.filter = this.$route.query.filter;
      this.filterOrders();
    }
    else{
      this.getOrders();
    }
  }
})
export default class OrderListing  extends Mixins(ErrorMessages)  {
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

  public async showChat(oid:number, cid:number){
    let res = await http.get(`factory/chat/${oid}`)
    this.ref.chatOrder.show(oid, cid, res);
  }


  public toggleHideShow(index:number,val:boolean) {
    console.log(index,val)
    Vue.set(this.orders[index], 'visible', val)
    console.log(this.orders)
  }
  public async getOrders(params: string | void){
    if(!params)
      params = ''
    http.get('orders'+params).then((res:Record<any, any>) => {
      console.log('res',res)
      this.orders =  res.data.result.data
      this.makePagination(res.data.result)
    }).catch((e:any) => {
      console.log('e',e)
      this.showError(e.response.data.message)
    })
  }

  public hideOrderspopup(){
    this.$modal.hide('orderspopup')
  }
  public async showOdersPopup(){
    this.showLoader = true
    await this.getOrders('')
    this.$modal.show('orderspopup')
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
    console.log('params',params)
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

}
</script>

<style scoped lang="scss">
.loader{
  position: fixed;
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
  background: #fff;
  z-index: 1030;
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

  &>tbody{
    &>tr{
     &>th{
       &:nth-child(1){
         width: 10%;
       }
       &:nth-child(2){
         width: 10%;
       }
       &:nth-child(3){
         width: 10%;
       }
       &:nth-child(4){
         width: 45%;
       }
       &:nth-child(5){
         width: 10%;
       }
       &:nth-child(6){
         width: 15%;
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
  &.factory_approved{
    background: #57A2AC;
    color: #fff;
  }
  &.factory_rejected{
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
</style>
