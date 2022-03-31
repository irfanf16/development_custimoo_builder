import { Module } from "vuex";
import {http} from "@/httpCommon";
import {Vue} from "vue-property-decorator";


const Cart:Module<any, any> = {
  state: {
    cart_items: [],
    shipping_address: null,
    show_cart_modal:false
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
    getShippingAddress(state:Record<any, any>){
      return state.shipping_address;
    },
    getShowCart(state:Record<any, any>){
      return state.show_cart_modal;
    },
  },
  mutations: {
    ADD_TO_CART(state: Record<any, any>, payload: boolean){
      state.cart_items = payload
    },
    ADD_SHIPPING_ADDRESS(state: Record<any, any>, payload: Record<any, any>){
      state.shipping_address = payload
    },
    SHOW_CART_MODAL(state: Record<any, any>, payload: boolean){
      state.show_cart_modal = payload
    }
  },
  actions: {
    addToCart({commit},payload){
      commit('ADD_TO_CART', payload);
    },
    async getCartServer({commit,state},room_id:number){
      const url = '/carts/cart-items'
     return http.get(url).then((res: any) => {
       console.log('Cart',res);
       if(res.data.success){
          if(res.data.result) {
            const api_res: Record<any, any> = res.data.result
            commit('ADD_TO_CART', api_res.items)
          }
          else{
            commit('ADD_TO_CART', [])
          }
       }else{
         commit('ADD_TO_CART', [])
         console.log('Nothing to show')
       }

      }).catch((e: any) => {
        console.error(e)
      });
    },
    async getCartAddresses({commit}) {
      let address = null
      const response = await http.get(`/addresses`);
      let addresses = response.data.result
      addresses = addresses.filter(obj => obj.default == 1)
      if (addresses.length > 0){
        address = addresses[0]
        commit('ADD_SHIPPING_ADDRESS',addresses[0])
      }

      return address
    }
  }
}
export default Cart;

