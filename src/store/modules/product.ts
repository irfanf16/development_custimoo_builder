import { Module } from "vuex";
import {http} from "@/httpCommon";
const Product:Module<any, any> = {
  state:{
    Product_Models:[],
    locker_products:[],
    lockers:[],
    logoColors:[]
  },
  getters:{
    getProductModels(state:Record<any, any>){
      return state.Product_Models;
    },
    getLockerProducts(state:Record<any, any>){
      return state.locker_products
    },
    getLockers(state:Record<any, any>){
      return state.lockers
    },
    getLogosColors(state:Record<any, any>){
      return state.logoColors;
    }
  },
  mutations:{
    SET_MODELS(state:Record<any, any>, paylod:Record<any, any>){
      state.Product_Models = paylod;
    },
    SET_LOCKER_PRODUCTS(state:Record<any, any>, payload:Record<any, any>){
      state.locker_products = payload;
    },
    SET_LOCKERS(state:Record<any, any>, payload:Record<any, any>){
      state.lockers = payload;
    },
    ADD_LOCKER(state:Record<any, any>, payload:Record<any, any>){
      state.lockers.push(payload);
    },
    SET_LOGO_COLORS(state:Record<any, any>, payload:Record<any, any>){
      state.logoColors = payload;
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
    },
    GET_LOCKER_PRODUCTS({commit}){
      http.get("locker/products").then((res) => {
        if (res.status == 200){
          commit('SET_LOCKER_PRODUCTS', res.data)
        }
      })
    },
    getLockers({commit}){
      http.get("lockers").then((res) =>{
        if (res.status == 200){
          commit('SET_LOCKERS', res.data);
        }
      })
    },
    createLocker({commit}, payload:string){
      http.post("locker/create", {name:payload}).then((res) =>{
        if (res.status == 201){
          commit('ADD_LOCKER', res.data.data);
        }
      });
    },
    SET_LOGO_COLORS({commit}, payload:Record<any, any>){
      commit('SET_LOGO_COLORS', payload);
    },

  }
}
export default Product;

