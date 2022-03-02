<template>
  <div>
    <div v-for="(order,index) in orders" :key="index" class="list-item-container">
      <div class="list-item-head p-8">
        <div class="row">
          <div class="col-3">
            {{ order.created_at | orderDate }}
          </div>
          <div class="col-3">
            {{order.order_no}}
          </div>
          <div class="col-3">
            {{order.items_count}}
          </div>
        </div>


        <span class="toggle float-right" @click="toggleHideShow(index,!order.visible)" v-text="toggletText[order.visible * 1]">
      </span>
      </div>
      <div class="list-item-body p-8" v-show="order.visible">
        <h4>asdasdas</h4>
        <h4>wqeqweqw</h4>
      </div>
    </div>
<!--    <b-table striped hover :items="orders" :fields="titles"></b-table>-->
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
<!--  <div :width="screenWidth"
         :resizable="true"
         :scrollable="true"
         height="auto"
         :reset="true"
         :shiftY="0" size="lg" name="orderspopup"  hide-footer  class="event_form"
         id="modal-center-event" centered
         >
    <div class="modal-header d-flex justify-content-between">
      <span class="fs-5 font-weight-bold">Order Listing</span>
      <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hideOrderspopup"><BIconX /></span>
    </div>
    <div class="modal-body">
      <template v-if="customer_orders.length > 0">
        <b-table striped hover :items="customer_orders" :fields="titles"></b-table>
        <b-pagination
          v-model="pagination.currentPage"
          :total-rows="pagination.rows"
          :per-page="pagination.perPage"
          aria-controls="itemList"
          align="center"
          @change="handlePagination"
          v-if="pagination.total > 0"
        ></b-pagination>
      </template>
    </div>
    <div class="loader" v-if="showLoader"><img src="../assets/images/loading.gif" /></div>

  </div>-->


<script lang="ts">
import {Component, Mixins, Vue} from "vue-property-decorator";
import ErrorMessages from "@/mixins/ErrorMessages";
import {http} from "@/httpCommon";
import moment from "moment";

Vue.filter('orderDate', function(value:string) {
  if (value) {
    return moment(value).format('MMMM DD')
  }
})

@Component<OrderListing>({
  mounted(){
    this.getOrders()
  }
})
export default class OrderListing  extends Mixins(ErrorMessages)  {
  private screenWidth = (window.screen.availWidth - 100)
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
  public async getOrders(params:string){
    if(!params)
      params = ''
    http.get('order'+params).then((res:Record<any, any>) => {
      console.log('res',res)
      this.orders =  res.data.result.data
      this.makePagination(res.data.result)
    }).catch((e) => {
      console.log('e',e)
    })
    // const res = await this.$store.dispatch('getOrders', params)
    // if (res.data.status_code == 200){
    //   this.showLoader = false
    //   this.customer_orders = await res.data.result.data
    //   this.makePagination(res.data.result)
    // }
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
    if(this.search) {
      params += '&search='+this.search
    }
    console.log('params',params)
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
</style>
