import {http, noTokenRequest} from "@/httpCommon";
import { Module } from "vuex";
const mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
const Main:Module<any, any> = {
  state: {
    manageComponents: {
      mobileScreen: mobileScreen,
      ChooseColor: true,
      LogoArea: true,
      ChooseInterest: mobileScreen,
      CustomizationPreview: !mobileScreen,
      ItemToCustomize: !mobileScreen,
      DefaultColorShuffleBtn: !mobileScreen,
      BasicCustomization: true,
      AdvanceCustomization: false,
      ExtractedColors: true,
    },
    hideTab: {
      logoHide: !mobileScreen,
      colorHide: !mobileScreen,
      textHide: !mobileScreen,
      styleHide: !mobileScreen,
      teamHide: !mobileScreen
    }
  },
  mutations: {
    manageComponents(state: Record<any, any>, payload: Record<any, any>) {
      state.manageComponents[payload.index] = payload.value
    },
    SET_HIDE_TAB(state: Record<any, any>, payload: Record<any, any>) {
      state.hideTab[payload.index] = payload.value
    }
  },
  getters: {
    getManageComponents: state => {
      return state.manageComponents
    },
    getHideTab: state => {
      return state.hideTab
    }
  },
  actions: {
    setManageComponents({ commit }, payload) {
      commit('manageComponents', payload)
    },
    setHideTab({ commit }, payload) {
      commit('SET_HIDE_TAB', payload)
    },
    setJwtToken() {
      if(!localStorage.getItem('jwtToken')) {
        /***************** THIS LINE ADDED TEMPORARILY  IT WILL REMOVE WHEN JWT TOKEN WILL GET FROM URL *****************/
        // localStorage.setItem('jwtToken', process.env.VUE_APP_JWT_TOKEN)
        /*****************************-------------------*******************************/
        const url = "https://dev.customize.ninja/index.php?route=account/kbauthtoken"
        const config = {
          crossDomain: true,
          headers: {'Access-Control-Allow-Origin': '*'}
        };
        http.get("oauth/token", config).then((response: any) => {
          if (response.data.access_token) {
            localStorage.setItem('jwtToken', response.data.access_token)
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
        // localStorage.setItem('isAssociation', 'false')
      }
    }
  }
}
export default Main;

