<template>
  <modal :width="screenWidth"
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
    <div class="loader" v-if="showLoader"><img src="../../src/assets/images/loading.gif" /></div>

  </modal>
</template>

<script lang="ts">
import {Component, Mixins, Prop} from "vue-property-decorator";
import ErrorMessages from "@/mixins/ErrorMessages";


@Component<OrderListing>({
  mounted(){
    console.log("orders", this.customer_orders)
  }
})
export default class OrderListing  extends Mixins(ErrorMessages)  {
  private screenWidth = (window.screen.availWidth - 100)
  public customer_orders = []
  public showLoader = false
  public search = ''
  public titles:Record<any, any>[] = [
    {key: 'order_no', label: 'Order Number'},
    {key: 'customer_name', label: 'Customer Name'},
    {key: 'order_no', label: 'Order Number'},
  ]
  public pagination:Record<any, any> ={
    rows:null,
    currentPage:null,
    perPage:null,
    total:0
  }
 public async getOrders(params:string){
   const res = await this.$store.dispatch('getOrders', params)
   if (res.data.status_code == 200){
     this.showLoader = false
     this.customer_orders = await res.data.result.data
     this.makePagination(res.data.result)
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
</style>
