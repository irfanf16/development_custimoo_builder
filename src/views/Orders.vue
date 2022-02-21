<template>
  <div class="page-wrapper m-lg-4" v-cloak>
    <div class="order-wrapper">
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
