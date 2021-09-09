import {http, noTokenRequest} from "@/httpCommon";
import { Object } from "fabric/fabric-impl";
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
      BasicCustomization: false,
      AdvanceCustomization: true,
      ExtractedColors: true,
    },
    hideTab: {
      logoHide: !mobileScreen,
      colorHide: !mobileScreen,
      textHide: !mobileScreen,
      styleHide: !mobileScreen,
      teamHide: !mobileScreen
    },
    tabIndexMain: 0,
    windowView:1

  },
  mutations: {
    manageComponents(state: Record<any, any>, payload: Record<any, any>) {
      state.manageComponents[payload.index] = payload.value
    },
    setWindowView(state: Record<any, any>, payload: Record<any, any>) {
      state.windowView = payload
    },
    SET_HIDE_TAB(state: Record<any, any>, payload: Record<any, any>) {
      state.hideTab = {
        logoHide: !mobileScreen,
        colorHide: !mobileScreen,
        textHide: !mobileScreen,
        styleHide: !mobileScreen,
        teamHide: !mobileScreen
      }
      state.hideTab[payload.index] = payload.value
    },
    SET_TAB_MAIN(state: Record<any, any>, payload: Record<any, any>) {
      state.tabIndexMain = payload.value
    }
  },
  getters: {
    getManageComponents: state => {
      return state.manageComponents
    },
    getHideTab: state => {
      return state.hideTab
    },
    getMainTab: state => {
      return state.tabIndexMain
    },
    getWindowView: state => {
      return state.windowView
    }
  },
  actions: {
    setManageComponents({ commit }, payload) {
      commit('manageComponents', payload)
    },
    setWindowView({ commit }, payload) {
      commit('setWindowView', payload)
    },
    async setHideTab({ commit }, payload) {
      commit('SET_HIDE_TAB', payload)
    },
    setTabMain({ commit }, payload) {
      commit('SET_TAB_MAIN', payload)
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
  }
}
export default Main;

