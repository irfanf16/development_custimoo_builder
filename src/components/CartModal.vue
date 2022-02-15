<template>
  <modal :minWidth ="800"
         :minHeight="600" :resizable="true"
         :adaptive="true" name="cart-modal" ref="cart-modal" id="cart-center-lockerroom" size="xl"  title="User Cart" modal-class="modal-fullscreen2"  content-class="lockerroom-modal"
        >


    <table class="table table-bordered b-table-fixed mb-0 w-100" v-if="cartItems">
      <thead class="bg-light">
      <tr>
        <th class="font-weight-bold">
          Design Image
        </th>
        <th class="font-weight-bold">
          Quantity
        </th>
        <th colspan="2" class="font-weight-bold">
          Actions
        </th>
      </tr>
      </thead>
      <tbody>
      <tr :key="cart_item.id" v-for="(cart_item) in cartItems">
        <td><b-img style="width: 80px" thumbnail fluid :src="cart_item.front_image" alt="Front Design"></b-img>
          <b-img style="width: 80px" thumbnail fluid :src="cart_item.back_image" alt="Back Design"></b-img>

        </td>
        <td>{{cart_item.roster_detail | itemQtyCount(cart_item.roster_detail)}}</td>
        <td class="cursor-pointer">   <a data-title="Edit Product" @click="editCartItem(cart_item)">
          <font-awesome-icon
            :icon="['fas', 'edit']"/>
        </a></td>
        <td class="cursor-pointer">  <a data-title="Delete Event"
                                        >
          <font-awesome-icon
            :icon="['fas', 'trash-alt']"/>
        </a></td>
      </tr>
      </tbody>
    </table>

    <template #modal-footer>
      <div class="text-right">
        <b-button   v-b-modal.modal-center-existingCollection variant="secondary" style="margin-right: 5px">Add to existing collection</b-button>

      </div>
    </template>
  </modal>

</template>

<script lang="ts">

import {Component, Mixins, Prop, Vue, Watch} from 'vue-property-decorator'

import {http} from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";
import {getReminderOptions} from "@/helpers/Helpers";
    @Component<CartModal>({
        components: {},
      filters: {
        itemQtyCount: (value: Record<any, any>) => {
          if(value.length > 0) {
            return value.reduce((a, b) => a + (b['quantity'] || 0), 0);
          }
          return 0
        }
      },
      mounted() {
        // this.getColors()
      }
    })
    export default class CartModal extends Mixins(ErrorMessages) {

      public hide() {
        this.$modal.hide('cart-modal')
      }
      public show() {
        console.log('here')
        this.$modal.show('cart-modal')
      }
      get cartItems() {
        return this.$store.getters.getCartItems
      }
      public editCartItem(cart_item:Record<any, any>) {
        console.log('cart_item',cart_item)
      }

    }
</script>

<style lang="scss" scoped>

</style>
