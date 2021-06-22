import { Module } from "vuex";
import {http} from "@/httpCommon";
const Product:Module<any, any> = {
  state:{
    Product_Models:[],
    locker_products:[],
    lockers:[],
    logoColors:[],
    logoUrl:'',
    eyeIndex: -1
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
    },
    getLogoUrl(state:Record<any, any>){
      return state.logoUrl;
    },
    getEyeIndex(state:Record<any, any>){
      return state.eyeIndex
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
      state.lockers = []
      state.lockers = payload;
    },
    ADD_LOCKER(state:Record<any, any>, payload:Record<any, any>){
      state.lockers.push(payload);
    },
    SET_LOGO_COLORS(state:Record<any, any>, payload:Record<any, any>){
      state.logoColors = payload;
    },
    SET_LOGO_URL(state:Record<any, any>, payload:Record<any, any>){
      state.logoUrl = payload.logoUrl;
    },
    DELETE_ROOM(state:Record<any, any>, payload:number){
      state.lockers.splice(payload, 1);
      state.locker_products.splice(payload, 1);
    },
    DELETE_ROOM_PRODUCT(state:Record<any, any>, payload){
      state.locker_products[payload.room_index].product.splice(payload.product_index, 1);
    },
    CHANGE_EYE_INDEX(state:Record<any, any>, payload){
      state.eyeIndex = payload
    }


  },
  actions: {
    async getModels({commit}, paylod:number){
      await http.get("style/information/"+paylod).then((res:any)=>{
        commit('SET_MODELS', res.data);
      });
    },
    SAVE_TO_LOCKER({commit}, payload){
      let err = '';
      const res = http.post("save/product/locker", payload).then((res) => {
        if (res.status == 201){
          return '';
        }
      }).catch((errors)=>{
        if (errors.response.status == 422){
          err =  errors.response.data.errors.name[0];
        }
        return err;
      });
      return res;
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
   async createLocker({commit}, payload:string){
     let err = '';
      const res = await http.post("locker/create", {name:payload}).then((res:Record<any, any>) =>{
        if (res.status == 201){
          commit('ADD_LOCKER', res.data.data);
          return '';
        }
      }).catch((errors)=>{
        if (errors.response.status == 422){
          err =  errors.response.data.errors.name[0];
        }
        return err;
      });
     return res;
    },
    SET_LOGO_COLORS({commit}, payload:Record<any, any>){
      commit('SET_LOGO_COLORS', payload);
    },
    SET_LOGO_URL({commit}, payload:Record<any, any>){
      commit('SET_LOGO_URL', payload);
    },
    async deleteRoom({commit}, payload){
      await http.get("deletelocker/"+payload.id).then((res) => {
        if (res.status == 200){
          alert(res.data.message);
          commit('DELETE_ROOM', payload.index);
        }
      })
    },
    async deleteRoomProduct({commit}, payload){
      await http.get("deletelockerproduct/"+payload.id).then((res) => {
        if (res.status == 200){
          alert(res.data.message);
          commit('DELETE_ROOM_PRODUCT', payload);
        }
      })
    },
    async storeFolder({commit}, payload){
      let saved = false;
      await  http.post("locker/folder", payload).then((res) => {
        if (res.status == 201){
          saved = true;
        }
      });
      return saved;
    },
    async saveLogo({commit}, payload){
      console.log(commit)
      await http.post("save/locker/asset", payload).then((res) => {
        if (res.status == 201){
          // alert('logo saved');
          console.log(commit)
        }
      })
    }

  }
}
export default Product;

