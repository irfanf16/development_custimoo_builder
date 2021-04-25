import { Module } from "vuex";
const Product:Module<any, any> = {
  state:{
    products:[]
  },
  getters:{
    getProducts: (state: any) => state.products
  },
  mutations:{
    SET_PRODUCTS(state: any, payload){
      state.products = payload;
    }
  }
}
export default Product;

