import { Module } from "vuex";
import {http} from "@/httpCommon";
import {Vue} from "vue-property-decorator";


const Cart:Module<any, any> = {
  state: {
    cart_items: []
  },
  getters: {
    getCartItemsCount(state:Record<any, any>){
      return state.cart_items.length;
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

