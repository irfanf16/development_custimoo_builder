<template>
  <div class="page-wrapper m-lg-4" v-cloak>

    <div class="order-wrapper">
      <div class="d-flex justify-content-between align-items-center" v-b-toggle.accordion-0>
        <div class="fs-4 font-weight-bolder order-title p-2">
          {{ order.created_at | reformDate }}
          Order  {{ order.order_no }}
          {{order.product_names_names ? order.product_names : ''}}
        </div>
        <div class="fs-4 font-weight-bolder order-title p-2 chevron"><BIconChevronDown /></div>
      </div>
      <b-collapse :id="`accordion-${index}`" accordion="my-accordion" role="tabpanel">
        <b-tabs content-class="mt-3">
          <template v-if="order">
            <b-tab :key="i" v-for="(item, i) in order.factories">
              <template #title>
                {{item.name}}
              </template>
              <div class="order-flow">
                <div class="order-step active">Order<br>Created
              </div>
              <div class="order-step">
                Artwork<br>Approval
              </div>O
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
          </template>
        </b-tabs>
      </b-collapse>
    </div>
  </div>
</template>

<script lang="ts">

import {Component, Mixins, Prop, Vue} from 'vue-property-decorator'
import moment from "moment";
Vue.filter('reformDate', function(value:string) {
  if (value) {
    return moment(value).format('MM/DD/YYYY')
  }
})

@Component<Order>({
  components: {

  },
})

export default class Order extends Mixins() {
  @Prop({required: true}) order!: Record<any, any>
  @Prop({required: true}) index!: number
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
