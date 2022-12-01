<template>
  <div class="page-wrapper m-lg-4" v-cloak>
    <div class="order-wrapper">
      <h1 class="fs-7 font-weight-bold text-left px-4">Orders Listing</h1>
      <template v-if="customer_orders.length">
        <order v-for="(order, i) in customer_orders" :order="order" :index="i" :key="i"></order>
      </template>
    </div>
  </div>
</template>

<script lang="ts">

import {Component, Mixins} from 'vue-property-decorator'
import Order from './Order.vue';
import {http} from "@/httpCommon";


@Component<Orders>({
  components: {
    Order
  },
  async mounted() {
    this.getOrders();
  }
})

export default class Orders extends Mixins() {
  public customer_orders = []
  public pagination:Record<any, any> ={
    rows:null,
    currentPage:1,
    perPage:10,
    total:0
  }
  public showLoader = false;

  public async getOrders(params:string|void){
    const res =  await http.get('order').then((successResponse) => {
      let response_data = successResponse.data;
      this.showLoader = false
      if(response_data.success) {
        this.customer_orders = response_data.result.data;
        this.makePagination(response_data.result)
      }
      console.log("shsha", successResponse)

    }).catch((errorResponse) => {
      console.log("error", errorResponse)
    })
  }

  public makePagination(data:Record<any, any>){
    this.pagination.currentPage = data.current_page;
    this.pagination.rows = data.total;
    this.pagination.perPage = data.per_page;
    this.pagination.total = data.total;
  }
}
</script>

<style lang="scss" scoped>
.order-wrapper{
  padding: 10px;

  .order-title{
    text-align: left;
  }
}
</style>
