const provider_id = process.env.VUE_APP_PROVIDER_ID
import {noTokenRequest} from "@/httpCommon";
import { Module } from "vuex";
const Auth:Module<any, any> = {
  state:{
    token:'',
    jwtToken:true
  },
  getters:{
    isAuthenticated: (state: any) => state.token || localStorage.getItem("access_token"),
    isCustomerAuthenticated: (state: any) => state.jwtToken
  },
  mutations:{
    AUTH_SUCCESS(state: any, payload){
      state.token = payload;
    },
  },
  actions:{
    async AUTH_LOGIN({commit}){
     await noTokenRequest.post("company/login", {provider_id: provider_id}).then( (res) => {
        localStorage.setItem('access_token', res.data.accessToken)
        commit('AUTH_SUCCESS', res.data.accessToken);
        return true;
      })
    }
  }
}
export default Auth;

