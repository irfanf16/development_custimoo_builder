<template>
  <div class="page-wrapper m-lg-4" v-cloak>
    <div class="shadow-sm well col-8 m-auto border-0 bg-light" v-if="order">
      <h1 class="fs-8 font-weight-bolder" style="color: #219F84;">Thank you for your order! </h1>
      <div class="mt-2 fs-3 text-muted">
        You will be notified once the order has been confirmed
        <router-link :to="`/order/${order.order_id}/detail`" class="text-dark font-weight-bold">
          Order Details
        </router-link>
      </div>
      <div class="mt-2"><router-link to="/customer-orders" class="btn-link fs-3">View orders</router-link></div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";
import {http} from "@/httpCommon";


@Component<Thankyou >({
  components: {

  },
  async mounted() {
    if (!this.$props.order) {
      this.$router.push({ name: 'CustomerOrders' })
    } else {
      return;
    }
  }
})

export default class Thankyou extends Mixins(ErrorMessages) {
  @Prop({ required: true }) order: Record<any, any>
}
</script>

<style lang="scss" scoped>

</style>
