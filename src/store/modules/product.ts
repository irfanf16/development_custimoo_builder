import { Module } from "vuex";
import {http} from "@/httpCommon";
const Product:Module<any, any> = {
  state:{
    Product_Models:[]
  },
  getters:{
    getProductModels(state:Record<any, any>){
      return state.Product_Models;
    }
  },
  mutations:{
    SET_MODELS(state:Record<any, any>, paylod:Record<any, any>){
      state.Product_Models = paylod;
    }
  },
  actions: {
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

