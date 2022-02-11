<template>
  <div class="page-wrapper m-lg-4" v-cloak>
    <div class="fs-3 font-weight-bolder">Order # 12331</div>
    <b-tabs content-class="mt-3">
      <b-tab :key="i" v-for="(item, i) in 3">
        <template #title>
          Factory {{item}}
        </template>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script lang="ts">

import {Component, Mixins} from 'vue-property-decorator'


@Component<Order>({
  components: {

  },
})

export default class Order extends Mixins() {

}
</script>

<style lang="scss" scoped>

</style>
