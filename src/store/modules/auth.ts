const provider_id = process.env.VUE_APP_PROVIDER_ID
import {http, noTokenRequest} from "@/httpCommon";
import { Module } from "vuex";
const Auth:Module<any, any> = {
  state:{
    token:'',
    jwtToken:true,
    customerToken:'',
    customer:''
  },
  getters:{
    isAuthenticated: (state: any) => state.token || localStorage.getItem("access_token"),
    isCustomerAuthenticated: (state: any) => state.jwtToken,
    checkCustomerAuthenticated:(state:any) => !!state.customerToken || localStorage.getItem("cToken"),
    getCustomer:(state:any) => {
      return state.customer || localStorage.getItem("customer")? JSON.parse(localStorage.getItem("customer") as string) : ''
    }
  },
  mutations:{
    AUTH_SUCCESS(state: any, payload){
      state.token = payload;
    },
    SET_CUSTOMER(state:Record<any, any>, payload){
      localStorage.setItem('cToken', payload.access_token)
      localStorage.setItem('customer', JSON.stringify(payload.user))
      state.customerToken = payload.access_token
      state.customer = payload.user
    },
    REMOVE_CUSTOMER(state:any){
      localStorage.setItem('customer', '')
      localStorage.setItem('cToken', '')
      state.customer = ''
      state.customerToken = ''
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
    }

  }
}
export default Auth;

