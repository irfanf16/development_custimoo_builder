import { Module } from "vuex";
import {http} from "@/httpCommon";
import {Vue} from "vue-property-decorator";
import {logoColorInfoDefaultObject} from "@/helpers/Helpers";
const Product:Module<any, any> = {
  state:{
    sku_information: {},
    locker_products:[],
    lockers:[],
    logoColors:[],
    logoUrl:'',
    eyeIndex: 0,
    initialExtractedColors:[],
    active_locker_index:0,
    main_products_info: {
      has_more_products: false,
      next_page: null,
      active_product_id: null
    },
    update_order_item_products: null,
    product_locker_id:0,
    general_settings:{
      color_type: 'pantone-tcx',
      vector_image_constraint:true,
    },
    factory_settings:[],
    product_price_object: {},
    sales_rep_modal_from: '',
    last_sync_id: null,
    copiedRoster: {
      isAnyRosterCopied: false,
      copiedRosterFromId: null,
      rosterData: null
    }
  },
  getters:{
    getSkuInformation(state:Record<any, any>){
      return state.sku_information
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
    },
    getinitialExtractedColors(state:Record<any, any>){
      return state.initialExtractedColors
    },
    getActiveLockerIndex(state:Record<any, any>){
      return state.active_locker_index
    },
    async getMainProductsInfo(state:Record<any, any>){
      return state.main_products_info
    },
    getUpdateOrderItemProducts(state:Record<any, any>){
      return state.update_order_item_products
    },
    getProductLockerId(state:Record<any,any>){
      return state.product_locker_id;
    },
    getSetting: state => (setting_key: string) => {
      return state.general_settings[setting_key]
    },
    getFactorySettings: state => (factory_id:string) => {
      const factory_settings= state.factory_settings.filter(factory_setting => {
        return factory_setting.sourceable_id === factory_id
      });
      const factory_settings_obj: Record<any,any> = {};
      factory_settings.forEach((factory_setting:Record<any,any>) => {
        factory_settings_obj[factory_setting.key_name] = factory_setting.value;
      });
      return factory_settings_obj;
    },
    getProductPriceObject(state:Record<any,any>) {
      return state.product_price_object;
    },
    getSalesRepModalFrom(state: Record<any, any>) {
      return state.sales_rep_modal_from;
    },
    getLastSyncId(state: Record<any, any>) {
      return state.last_sync_id;
    },
    getCopiedRoster(state: Record<any, any>) {
      return state.copiedRoster;
    }
  },
  mutations:{
    SET_SKU_INFORMATION(state: Record<any, any>, paylod: Record<any, any>){
      state.sku_information = paylod;
    },
    SET_LOCKER_PRODUCTS(state: Record<any, any>, payload: Record<any, any>){
      if(payload.locker_index >= 0) {
        Vue.set(state.locker_products[payload.locker_index], 'product', payload.products)
      } else {
        Vue.set(state, 'locker_products', payload)
      }
    },
    SET_LOCKER_ATTRIBUTE(state:Record<any, any>, payload:Record<any, any>){
      Vue.set(state.locker_products[payload.index],payload.attribute , payload.value);
    },
    SET_LOCKER_ACTIVE_INDEX(state:Record<any, any>, payload:number){
      state.active_locker_index = payload
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
    },
    SET_INITIAL_LOGO_COLORS(state:Record<any, any>, payload) {
      state.initialExtractedColors = payload
    },
    UPDATE_COPY_COUNT(state:Record<any, any>, payload){
      state.locker_products[payload.room_ind].product.forEach((element:Record<any, any>) =>{
        if (element.id === payload.id){
          const count = element.copy_count +1
          Vue.set(element, 'copy_count', count)
        }
      })
    },
    UPDATE_MAIN_PRODUCTS_INFO(state:Record<any, any>, payload){
      state.main_products_info = payload
    },
    SET_PRODUCT_LOCKER_ID(state:Record<any,any>,id){
      state.product_locker_id = id;
    },
    SET_SETTING(state:Record<any,any>, setting){
      state.general_settings = { ...state.general_settings, ...setting };
    },
    SET_FACTORY_SETTING(state:Record<any, any>, factory_setting){
      state.factory_settings =  factory_setting
    },
    SET_PRODUCT_PRICE_OBJECT(state: Record<any, any>, payload) {
      state.product_price_object = {...state.product_price_object, ...payload}
    },
    SET_SALES_REP_MODAL_FROM(state: Record<any, any>, payload) {
      state.sales_rep_modal_from = payload
    },
    SET_LAST_SYNC_ID(state: Record<any, any>, payload) {
      state.last_sync_id = payload
    },
    SET_COPIED_ROSTER(state: Record<any, any>, payload: Record<any, any>) {
      state.copiedRoster.isAnyRosterCopied = true
      state.copiedRoster.copiedRosterFromId = payload.copiedRosterFromId;
      state.copiedRoster.rosterData = JSON.parse(JSON.stringify(payload.rosterData));
    }
  },
  actions: {
    async getSkuInformation({commit}, product_id: number) {
      await http.get("product-sku/information/"+product_id).then((res:any)=> {
        commit('SET_SKU_INFORMATION', res.data);
      });
    },
    async SAVE_TO_LOCKER({commit}, payload){
      let err = '';
      return new Promise(function(resolve, reject) {
        http.post("save/product/locker", payload).then((res) => {
          if (res.status == 201){
            commit('ADD_PRODUCT_TO_LOCKER', {room_id : payload.get("room_id"), data: res.data.data})
            resolve(res);
          }
        }).catch((errors)=>{
          console.log(errors);
          if (errors.response.status == 422){
            err =  errors.response.data.errors.name[0];
            reject(err);
          }
          reject(err);
        });
      });
    },
    async SHARE_DESIGN_URL({commit},payload){
      let err = '';
      return new Promise(function(resolve, reject) {
        http.post("share-design-url", payload).then((res) => {
          if (res.status == 201){
            resolve(res);
          }
        }).catch((errors)=>{
          if (errors.response.status == 422){
            err =  errors.response.data.errors.name[0];
            reject(err);
          }
          reject(errors);
        });
      });
    },
    async GET_LOCKER_PRODUCTS({commit}, fetch_all = ''){
      return  await http.get(`locker/products?${fetch_all}`).then(async (res) => {
        if (res.status == 200){
          await commit('SET_LOCKER_PRODUCTS', res.data)
          return true
        }
      }).catch((e) => {
        return false
      })
    },
    getLockers({commit}){
      http.get("lockers").then((res) =>{
        if (res.status == 200){
          commit('SET_LOCKERS', res.data);
        }
      }).catch((e) => {
        commit('SET_LOCKERS', []);
      })
    },
    async getLockerProductDetail({commit}, id){
      return await http.get(`locker/product/detail?id=${id}`).then((res) => {
        if (res.status == 200){
          return res
        }
      }).catch(err => {
        if(err.response.status){
          return err.response.data.message
        }
      })
    },
   async createLocker({commit}, payload:string){
     // let err = '';
      const res = await http.post("locker/create", {name:payload}).then((res:Record<any, any>) =>{
        if (res.status == 201){
          commit('ADD_LOCKER', res.data.data);
          return res;
        }
      }).catch((errors:Record<any, any>)=>{
        if (errors.response.status == 422){
          const data = {
            status:422,
            message:errors.response.data.errors.name[0]
          }
          return data
        }
        // return errors;
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
        return res;
      }).catch(err => {
        return err.response
     })
      return res
    },
    initialLogoColors({commit}, payload){
      commit('SET_INITIAL_LOGO_COLORS', JSON.parse(payload))
    },
    async createYearlyPlanner({commit}, payload){
      const res =  await http.post("locker/create-yearly-planner", payload).then((res) => {
        if (res.status == 201){
          commit('SET_LOCKER_ATTRIBUTE', {index: payload.index, attribute:'have_yearly_planner', value:1 })
          return res;
        }
      })
      return res
    },
    async copyYearlyPlannerEvents({commit}, payload){
      const res =  await http.post("create-planner-from-template", payload).then((res) => {
        if (res.status == 201){
          commit('SET_LOCKER_ATTRIBUTE', {index: payload.index, attribute:'have_yearly_planner', value:1 })
          return res;
        }
      })
      return res
    },
    async deletePlanner({commit}, payload){
     return await http.post("locker/planner/delete", payload)
    },
    async getIcsFile({commit}, payload){
      return await http.post("events/create/ics/file", payload)
    },
    async updateMainProductsInfo({commit}, payload){
      commit('UPDATE_MAIN_PRODUCTS_INFO', payload)
    }

  }
}
export default Product;

