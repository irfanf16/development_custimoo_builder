import { Module } from "vuex";
import {http} from "@/httpCommon";
import {Vue} from "vue-property-decorator";


const Cart:Module<any, any> = {
  state: {
    cart_items: []
  },
  getters: {
    getCartItemsCount(state:Record<any, any>){
      let items_count = 0;
      state.cart_items.forEach((cart_item:Record<any, any>) => {
       items_count = items_count + cart_item.items_count
      })
      return items_count;
    },
    getCartItems(state:Record<any, any>){
      return state.cart_items;
    },
  },
  mutations: {
    ADD_TO_CART(state: Record<any, any>, payload: boolean){
      state.cart_items = payload
    },
  },
  actions: {
    addToCart({commit},payload){
      commit('ADD_TO_CART', payload);
    },
  }
}
export default Cart;

