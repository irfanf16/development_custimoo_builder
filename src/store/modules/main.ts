import {http, noTokenRequest} from "@/httpCommon";
import { Module } from "vuex";
const mobileScreen = false
const Main:Module<any, any> = {
  state: {
    mobileScreen: mobileScreen,
    manageComponents: {
      mobileScreen: mobileScreen,
      ChooseColor: true,
      UploadLogo: !mobileScreen,
      ChooseInterest: mobileScreen,
      CustomizationPreview: !mobileScreen,
      ItemToCustomize: !mobileScreen,
    }
  },
  mutations: {
    manageComponents(state: Record<any, any>, payload: Record<any, any>) {
      state.manageComponents[payload.index] = payload.value
    }
  },
  getters: {
    getManageComponents: state => {
      return state.manageComponents
    }
  },
  actions: {
    setManageComponents({ commit }, payload) {
      commit('manageComponents', payload)
    },
    setJwtToken() {
      if(!localStorage.getItem('jwtToken')) {
        /***************** THIS LINE ADDED TEMPORARILY  IT WILL REMOVE WHEN JWT TOKEN WILL GET FROM URL *****************/
        localStorage.setItem('jwtToken', process.env.VUE_APP_JWT_TOKEN)
        /*****************************-------------------*******************************/
        const url = "https://dev.customize.ninja/index.php?route=account/kbauthtoken"
        const config = {
          crossDomain: true,
          headers: {'Access-Control-Allow-Origin': '*'}
        };
        noTokenRequest.get(url, config).then((response: any) => {
          if (response.data.accessToken) {
            localStorage.setItem('jwtToken', response.data.accessToken)
          }
        }).catch((e) => {
          console.log(e)
        });
      }
    },
    setBrowserToken(){
      if(!localStorage.getItem('browserToken')) {
        let browserTokenString = ''
        for (let i = 0; i < 8; i++) {
          browserTokenString += Math.random().toString(16).slice(-4)
        }
        localStorage.setItem('browserToken', browserTokenString)
      }
    }
  }
}
export default Main;

