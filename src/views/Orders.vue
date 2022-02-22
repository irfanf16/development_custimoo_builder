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


@Component<Orders>({
  components: {
    Order
  },
  async mounted() {
    let res = await this.$store.dispatch('getOrders')
    this.customer_orders = res.data.data
  }
})

export default class Orders extends Mixins() {
  public customer_orders = []
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
