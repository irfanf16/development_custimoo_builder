import { Module } from "vuex";
const Product:Module<any, any> = {
  state:{
    products:[],
    selectedIndex: 0
  },
  getters:{
    getProducts: (state: any) => state.products,
    getSelectedProduct: (state => {
      return state.products[state.selectedIndex]
    })
  },
  mutations:{
    SET_PRODUCTS(state: Record<any, any>, payload: Record<any, any>){
      state.products = payload;
    },
    SET_SELECTED(state: Record<any, any>, payload: Record<any, any>){
      state.selectedIndex = payload.selectedIndex;
    }
  },
  actions: {
    setSelectedIndex({commit}, payload) {
      commit('SET_SELECTED', payload)
    }
  }
}
export default Product;

