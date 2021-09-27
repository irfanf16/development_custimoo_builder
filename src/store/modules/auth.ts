const provider_id = process.env.VUE_APP_PROVIDER_ID
import Vue from "vue";
import {http, noTokenRequest} from "@/httpCommon";
import { Module } from "vuex";
const Auth:Module<any, any> = {
  state:{
    token:'',
    jwtToken:'',
    customer:''
  },
  getters:{
    isAuthenticated: (state: any) => state.token || localStorage.getItem("access_token"),
    isCustomerAuthenticated: (state: any) => !!state.jwtToken,
    getCustomer:(state:any) => {
      return state.customer || localStorage.getItem("customer") ? JSON.parse(localStorage.getItem("customer") as string) : ''
    }
  },
  mutations:{
    AUTH_SUCCESS(state: any, payload){
      state.token = payload;
    },
    SET_CUSTOMER(state:Record<any, any>, payload){
      localStorage.setItem('jwtToken', payload.access_token)
      localStorage.setItem('customer', JSON.stringify(payload.user))
      state.jwtToken = payload.access_token
      state.customer = payload.user
    },
    REMOVE_CUSTOMER(state:any){
      localStorage.setItem('customer', '')
      localStorage.setItem('jwtToken', '')
      state.customer = ''
      state.jwtToken = ''
    },
    SET_CUSTOMER_TOKEN(state:any){
      state.jwtToken = localStorage.getItem('jwtToken') ? localStorage.getItem('jwtToken') : ''
    }
  },
  actions:{
    async AUTH_LOGIN({commit}){
     await noTokenRequest.post("company/login", {provider_id: provider_id}).then( (res) => {
        localStorage.setItem('access_token', res.data.accessToken)
        commit('AUTH_SUCCESS', res.data.accessToken);
        return true;
      })
    },
    async loginCustomer({commit}, payload){
      const res = await http.post('customer/login', payload);
      commit('SET_CUSTOMER', res.data)
      return res
    },
    async signUpCustomer({commit}, payload){
      const res = await http.post('customer/signup', payload);
      return res
    },
    async logoutCustomer({commit}){
      commit('REMOVE_CUSTOMER')
    },
    async setCustomToken({commit}){
      commit('SET_CUSTOMER_TOKEN')
    },
    async getCustomerFromToken({commit}, token:string){
    let customer = null
     customer = await http.get('customer/from/token', {params: {token:token}}).then((res) => {
        return res.data.customer
      }).catch(err =>{
        if (err.response.status == 404){
          return false
        }
     })
      return customer
    }

  }
}
export default Auth;

