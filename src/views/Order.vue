<template>
  <div class="page-wrapper m-lg-4" v-cloak>
    <div class="order-wrapper">
      <div class="d-flex justify-content-between align-items-center" v-b-toggle.accordion-0>
        <div class="fs-4 font-weight-bolder order-title p-2">Order # 12331</div>
        <div class="fs-4 font-weight-bolder order-title p-2 chevron"><BIconChevronDown /></div>
      </div>
      <b-collapse id="accordion-0" accordion="my-accordion" role="tabpanel">
        <b-tabs content-class="mt-3">
          <b-tab :key="i" v-for="(item, i) in 3">
            <template #title>
              Factory {{item}}
            </template>

            <div class="order-flow">
              <div class="order-step active">
                Order<br>Created
              </div>
              <div class="order-step">
                Artwork<br>Approval
              </div>
              <div class="order-step">
                Sample<br>Design
              </div>
              <div class="order-step">
                In<br>Production
              </div>
              <div class="order-step">
                Order<br>Shipped
              </div>
              <div class="order-step">
                Order<br>Completed
              </div>
            </div>
          </b-tab>
        </b-tabs>
      </b-collapse>
    </div>
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
.order-wrapper{
  padding: 10px;
  background: #efefef;

  .order-title{
    text-align: left;
  }

  .chevron{
    transform: rotate(-180deg);
    transition: 0.3s all ease;
  }
  .collapsed{
    .chevron{
      transform: rotate(0deg);
    }
  }
}
</style>
