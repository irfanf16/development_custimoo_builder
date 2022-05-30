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
      return state.customer || localStorage.getItem("customer") ? JSON.parse(localStorage.getItem("customer") as string) : ''
    },
    getCustomerPermissions:state => {
      return state.customer_permissions
    },
    getCompany: (state: any) => state.company
  },
  mutations:{
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
    },
    SET_CUSTOMER_PERMISSIONS(state:Record<any, any>, payload){
      state.customer_permissions = payload
    },
    SET_COMPANY(state:Record<any, any>, payload){
      state.company = payload
    }
  },
  actions:{
    async loginCustomer({commit}, payload){
      const res = await http.post('customer/login', payload);
      commit('SET_CUSTOMER', res.data)
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
    },
    async companyAction({commit}, payload){
      commit('SET_COMPANY', payload)
    }
  }
}
export default Auth;

