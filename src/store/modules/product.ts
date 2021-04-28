import { Module } from "vuex";
import {http} from "@/httpCommon";
const Product:Module<any, any> = {
  state:{
    products:[],
    selectedIndex: 0,
    Product_Models:[]
  },
  getters:{
    getProducts: (state: any) => state.products,
    getSelectedProduct: (state => {
      return state.products[state.selectedIndex]
    }),
    getProductModels(state:Record<any, any>){
      return state.Product_Models;
    }
  },
  mutations:{
    SET_PRODUCTS(state: Record<any, any>, payload: Record<any, any>){
      state.products = payload;
    },
    SET_SELECTED(state: Record<any, any>, payload: Record<any, any>){
      state.selectedIndex = payload.selectedIndex;
    },
    SET_MODELS(state:Record<any, any>, paylod:Record<any, any>){
      state.Product_Models = paylod;
    }
  },
  actions: {
    setSelectedIndex({commit}, payload) {
      commit('SET_SELECTED', payload)
    },
    async getModels({commit}, paylod:number){
      await http.get("style/information/"+paylod).then((res:any)=>{
        commit('SET_MODELS', res.data);
      });
    },
    SAVE_TO_LOCKER({commit}, payload){
      http.post("save/product/locker", payload).then((res) => {
        if (res.status == 201){
          console.log(res.data.message);
        }
      });
    }
  }
}
export default Product;

