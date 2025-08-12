import Vue from "vue";
import {http, noTokenRequest} from "@/httpCommon";
import { Module } from "vuex";
const Auth:Module<any, any> = {
  state:{
    jwtToken:'',
    customer:'',
    customer_permissions:[],
    company: {}
  },
  getters:{
    isCustomerAuthenticated: (state: any) => !!state.jwtToken,
    getCustomer: (state:any) => {
      return state.customer || (localStorage.getItem(Vue.prototype.$customer_localstorage_key ) && localStorage.getItem(Vue.prototype.$customer_localstorage_key ) !='' ) ? JSON.parse(localStorage.getItem(Vue.prototype.$customer_localstorage_key) as string) : ''
    },
    getCustomerPermissions:state => {
      return state.customer_permissions
    },
    getCompany: (state: any) => state.company
  },
  mutations:{
    SET_CUSTOMER(state:Record<any, any>, payload){
      localStorage.setItem(Vue.prototype.$jwtToken_localstorage_key, payload.access_token)
      if(payload && payload.user){
        localStorage.setItem(Vue.prototype.$customer_localstorage_key , JSON.stringify(payload.user))
        state.customer = payload.user
      }
      if(payload && payload.refresh_token) {
        localStorage.setItem(Vue.prototype.$refreshToken_localstorage_key, payload.refresh_token)
      }

      state.jwtToken = payload.access_token
    },
    REMOVE_CUSTOMER(state:any){
      localStorage.setItem(Vue.prototype.$customer_localstorage_key , '')
      localStorage.setItem(Vue.prototype.$jwtToken_localstorage_key, '')
      localStorage.removeItem(Vue.prototype.$adminToken_localstorage_key)
      state.customer = ''
      state.jwtToken = ''
    },
    SET_CUSTOMER_TOKEN(state:any){
      state.jwtToken = localStorage.getItem(Vue.prototype.$jwtToken_localstorage_key) ? localStorage.getItem(Vue.prototype.$jwtToken_localstorage_key) : ''
    },
    SET_CUSTOMER_PERMISSIONS(state:Record<any, any>, payload){
      state.customer_permissions = payload
    },
    SET_COMPANY(state:Record<any, any>, payload){
      state.company = payload
    },
    RESET_CUSTOMER_PASSWORD(state:Record<any, any>, payload){
      //
    }
  },
  actions:{
    async loginCustomer({commit}, payload){
      const res = await http.post('customer/login', payload);
      commit('SET_CUSTOMER', res.data)
      return res
    },
    async forgotPassword({commit}, payload){
      const res = await http.post('customer/forgot-password', payload);
      return res
    },
    async signUpCustomer({commit}, payload){
      const res = await http.post('customer/signup', payload);
      commit('SET_CUSTOMER', res.data)
      return res
    },
    async logoutCustomer({commit}){
      commit('REMOVE_CUSTOMER')
    },
    async setCustomToken({commit}){
      commit('SET_CUSTOMER_TOKEN')
    },
    async resetCustomerPassword({commit}, payload){
      const res = await http.post('customer/reset-customer-password', payload)
      commit('RESET_CUSTOMER_PASSWORD', res.data?.result)
      return res
    },
    async getCustomerFromToken({commit}, token:string){
      let customer = null
      customer = await http.get('customer/from/token', {params: {token:token}}).then((res) => {
        return res.data
      }).catch(err =>{
        if (err.response.status == 404){
          return false
        }
      })
      return customer
    },
    async companyAction({commit}, payload){
      commit('SET_COMPANY', payload)
    }
  }
}
export default Auth;

