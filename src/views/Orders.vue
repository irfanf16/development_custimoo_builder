<template>
  <div class="page-wrapper m-lg-4" v-cloak>
    <div class="order-wrapper">
      <h1 class="fs-7 font-weight-bold text-left px-4">Orders Listing</h1>
      <order></order>
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
})

export default class Orders extends Mixins() {

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
