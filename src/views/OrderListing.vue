<template>
  <div>
    <div class="container-fluid my-2">
      <div class="row">
        <div class="col-8">

        </div>
        <div class="col-2">
          <div>
            <b-input-group>
                <template #append>
                  <b-input-group-text style="height: 33px; cursor: pointer" @click="clearFilter"><strong class="text-secondary">X</strong></b-input-group-text>
                </template>
                <b-form-select v-model="params.filter" :options="options" class="mb-3" @change="filterOrders">
                  <!-- This slot appears above the options from 'options' prop -->
                  <template #first>
                    <b-form-select-option :value="null" disabled>-- Please select an option --</b-form-select-option>
                  </template>

                  <!-- These options will appear after the ones from 'options' prop -->
                </b-form-select>
              </b-input-group>

<!--            <div class="mt-3">Selected: <strong>{{ selected }}</strong></div>-->
          </div>
        </div>
        <div class="col-2">
          <div style="max-width: 230px; flex-shrink: 1; padding-left: 4px">
            <b-input-group>
              <template #append>
                <b-input-group-text style="height: 33px; cursor: pointer" @click="clearSearch()"><strong class="text-secondary">X</strong></b-input-group-text>
              </template>
              <b-form-input type="text" style="height: 33px;" placeholder="Search" @keyup.enter="filterOrders" v-model="params.search" />
            </b-input-group>
          </div>
        </div>
      </div>
    </div>
    <table class="order-listing">
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
              {{order.product_count}}
            </td>
            <td>
              <a :href="`${storage_url}${order.design_file}`" target="_blank" class="btn btn-secondary mx-2">PDF</a><router-link  :to="`order/${order.id}/detail`" class="btn btn-secondary mx-2">Details</router-link>
            </td>

          </tr>
          <tr :key="'order-detail'+index" v-if="order.visible">
            <td colspan="4" class="order-detail-container">
              <template v-for="(item,indexItem) in order.items" >
                <div class="order-detail" :key="indexItem+index">
                  <div class="factory-container">
                    <h1 class="factory-name">{{item.factory_name}}</h1>
                  </div>
                  <table class="w-100">
                    <template v-for="(product,indexProduct) in item.factory_products">
                      <tr class="product-details" :key="indexItem + indexProduct + index">
                        <td>{{ product.product_name }}</td>
                        <td class="image"><img :src="`${storage_url}${product.front_image}`" class="img-thumbnail img-fluid" style="width: 80px"></td>
                        <td class="image"><img :src="`${storage_url}${product.back_image}`" class="img-thumbnail img-fluid" style="width: 80px"></td>
                        <td>{{ product.roster_detail[0].quantity }}</td>
                        <td>{{ product.status | Status }}</td>
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
    </table>
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
import {Component, Mixins, Vue} from "vue-property-decorator";
import ErrorMessages from "@/mixins/ErrorMessages";
import {http} from "@/httpCommon";
import moment from "moment";
import {CustimooOrderFlowStatuses} from '@/helpers/Helpers';
import Search from '@/components/Search.vue';

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
    Search
  },
  created(){
    Object.entries(CustimooOrderFlowStatuses).forEach(([key, value]) => {
      this.options.push({
        value: key,
        text: value
      })
    });
    this.getOrders();
  }
})
export default class OrderListing  extends Mixins(ErrorMessages)  {
  private screenWidth = (window.screen.availWidth - 100)
  public storage_url = process.env.VUE_APP_STORAGE_URL
  public params = {
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
  public pagination:Record<any, any> ={
    rows:null,
    currentPage:1,
    perPage:10,
    total:0
  }
  public toggletText =  ['show', 'hide']




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
    }).catch((e) => {
      console.log('e',e)
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

<style scoped>
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
.p-8{
  padding: 8px;
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

table.order-listing{
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
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

.order-detail .factory-container{
  font-weight: bold;
  text-align: left;
  font-size: large;
  text-decoration: underline;
}
.order-detail .factory-container .factory-name {
  margin: 1rem 0;
}
.product-details td {
  text-align: left;
  vertical-align: middle;
}

td.order-detail-container{
  padding: 0rem 0rem 1rem 0rem !important;
}

.product-details td.image{
  text-align: center;
  vertical-align: middle;
}
table.order-listing{
  margin-bottom: 1rem;
}
</style>
