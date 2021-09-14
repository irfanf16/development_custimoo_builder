import { Module } from "vuex";
import {http} from "@/httpCommon";
import {Vue} from "vue-property-decorator";
const Product:Module<any, any> = {
  state:{
    Product_Models:[],
    locker_products:[],
    lockers:[],
    logoColors:[],
    logoUrl:'',
    eyeIndex: -1,
    selectedModelIndex: 0,
  },
  getters:{
    getProductModels(state:Record<any, any>){
      return state.Product_Models;
    },
    getSelectedModelIndex(state:Record<any, any>) {
      return state.selectedModelIndex
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
    SET_SELECTED_MODEL_INDEX(state:Record<any, any>, selectedModelIndex: number) {
      state.selectedModelIndex = selectedModelIndex;
    },
    SET_LOCKER_PRODUCTS(state:Record<any, any>, payload:Record<any, any>){
      Vue.set(state, 'locker_products', payload)
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
    SET_LOGO_COLOR(state:Record<any, any>, payload:Record<any, any>){
      Vue.set(state.logoColors, payload.index, payload.color_info)
      /*state.logoColors[payload.index] = payload.color_info;*/
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
    },
    ADD_PRODUCT_TO_LOCKER(state:Record<any, any>, payload){
      const room_index = state.locker_products.findIndex((room:Record<any, any>) => room.id == payload.room_id)
      Vue.set(state.locker_products[room_index].product, state.locker_products[room_index].product.length, payload.data);
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
          commit('ADD_PRODUCT_TO_LOCKER', {room_id : payload.room_id, data: res.data.data})
          return res;
        }
      }).catch((errors)=>{
        if (errors.response.status == 422){
          err =  errors.response.data.errors.name[0];
        }
        return err;
      });
      return res;
    },
    async GET_LOCKER_PRODUCTS({commit}){
      return  await http.get("locker/products").then(async (res) => {
        if (res.status == 200){
          await commit('SET_LOCKER_PRODUCTS', res.data)
          return true
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
      return await http.get("deletelocker/"+payload.id).then((res) => {
        if (res.status == 200){
          commit('DELETE_ROOM', payload.index);
          return true
        }
      }).catch(err => {
        if(err.response.status == 404){
          return err.response.data.message
        }
      })
    },
    async deleteRoomProduct({commit}, payload){
      return await http.get("deletelockerproduct/"+payload.id).then((res) => {
        if (res.status == 200){
          commit('DELETE_ROOM_PRODUCT', payload);
          return true
        }
      }).catch(err => {
        if(err.response.status == 404){
          return err.response.data.message
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
    },
    async shareProduct({commit}, payload){
      const res = await http.post('share/product', payload)
      return res
    },
    async getShareProductDetails({commit}, payload){
     const res =  await http.post('shared/details', {url: payload}).then((res) =>{
        return res.data;
      })
      return res
    }

  }
}
export default Product;

