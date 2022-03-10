<template>
  <div>
    <h1>Customer Orders</h1>
    <template  v-for="(order, i) in orders">
      <div class="row" :key="i">
        <div class="col-md-6">
          <div class="list-group">
            <a href="#" class="list-group-item text-left">{{ order.order_no }}</a>
          </div>
        </div>
        <div class="col-md-4">
          <b-button @click="openChatModal(order.id, order.customer_id, order.factories)">Inquire About this order</b-button>
        </div>
      </div>
    </template>
    <OrderChat ref="chatmodal"/>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import {http} from "@/httpCommon";
import OrderChat from "@/components/OrderChat.vue";

@Component<CustomerOrders>({
  components: {OrderChat},
  mounted(){
    this.getOrders()
  }
})
export default class CustomerOrders extends Vue{
 public orders:Record<any, any> = []
 public factory_ids:number[] = []
  public ref = this.$refs as Record<any, any>

  public async getOrders(){
    const orders =  await http.get('order')
    this.orders = orders.data.result.data
  }
  public openChatModal(oid:number, cid:number, factories:Record<any, any>){
    factories.forEach((item:Record<any, any>) => {
      this.factory_ids.push(item.id)
    })
   this.ref['chatmodal'].show(oid, cid, this.factory_ids)
  }

}
</script>

<style scoped>

</style>
