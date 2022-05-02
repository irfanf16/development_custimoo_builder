<template>
  <div class="page-wrapper m-lg-4" v-cloak>
    <div class="shadow-sm well col-8 m-auto border-0 bg-light" v-if="orders">
      <h1 class="fs-8 font-weight-bolder" style="color: #219F84;">Thank you for your order</h1>
      <div class="mt-2 fs-3 text-muted">
        The order has been placed successfully and your order no is:
        <router-link :to="`/order/${orders[0].id}/detail`" class="text-dark font-weight-bold">
          {{ orders[0].order_no }}
        </router-link>
      </div>
      <div class="mt-2"><router-link to="/customer-orders" class="btn-link fs-3">View orders</router-link></div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";
import {http} from "@/httpCommon";


@Component<Thankyou >({
  components: {

  },
  async mounted() {
    this.getOrders();
  }
})

export default class Thankyou extends Mixins(ErrorMessages) {
  public orders = []
  public params:Record<any,any> = {
    search: '',
    filter : null,
  }

  public async getOrders(params: string | void){
    if(!params)
      params = ''
    http.get('orders'+params).then((res:Record<any, any>) => {
      this.orders =  res.data.result.data
    }).catch((e:any) => {
      this.showError(e.response.data.message)
    })
  }
}
</script>

<style lang="scss" scoped>

</style>
