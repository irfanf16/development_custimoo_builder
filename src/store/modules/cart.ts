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
    async getCartServer({commit,state},room_id:number){
      const url = '/carts/cart-items'
     return http.get(url).then((res: any) => {
        const api_res:Record<any, any> = res.data.result
        // let cart_items:Record<any, any>[] = []
        // api_res.items.forEach((item:Record<any, any>) => {
        //   cart_items.push(...item.factory_products)
        // })
        commit('ADD_TO_CART',api_res.items)
      }).catch((e: any) => {
        console.error(e)
      });
    },
  }
}
export default Cart;

