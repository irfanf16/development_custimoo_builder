import {http, noTokenRequest} from "@/httpCommon";
import { Object } from "fabric/fabric-impl";
import { Module } from "vuex";
const mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
const Main:Module<any, any> = {
  state: {
    application_mounted: false,
    isSafari: process.env.NODE_ENV === 'staging' ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent) : false,
    manageComponents: {
      mobileScreen: mobileScreen,
      CustomizationPreview: !mobileScreen,
      ItemToCustomize: true,
      DefaultColorShuffleBtn: true,
      ExtractedColors: false,
      CustomizationTabs: !mobileScreen
    },
    hideTab: {
      logoHide: !mobileScreen,
      colorHide: !mobileScreen,
      textHide: !mobileScreen,
      styleHide: !mobileScreen,
      teamHide: !mobileScreen
    },
    tabIndexMain: 0,
    mainTotalTabs: 3,
    popperID: ''

  },
  mutations: {
    SET_APPLICATION_MOUNTED(state:Record<any, any>) {
      state.application_mounted = true
      state.showLoader = false
      state.searchLoader = false
    },
    manageComponents(state: Record<any, any>, payload: Record<any, any>) {
      state.manageComponents[payload.index] = payload.value
    },
    setPopper(state: Record<any, any>, payload: string) {
      if(state.popperID != payload)
      {
        state.popperID = payload
      }
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
    },
    SET_MAIN_TOTAL_TABS(state: Record<any, any>, payload: number) {
      state.mainTotalTabs = payload
    }
  },
  getters: {
    getApplicationMounted: state => {
      return state.application_mounted
    },
    getManageComponents: state => {
      return state.manageComponents
    },
    getHideTab: state => {
      return state.hideTab
    },
    getMainTab: state => {
      return state.tabIndexMain
    },
    getPopperID : state => {
      return state.popperID
    },
    getIsSafari: state => {
      return state.isSafari
    },
    getMainTotalTabs: state => {
      return state.mainTotalTabs
    }
  },
  actions: {
    setManageComponents({ commit }, payload) {
      commit('manageComponents', payload)
    },
    async setHideTab({ commit }, payload) {
      commit('SET_HIDE_TAB', payload)
    },
    setTabMain({ commit }, payload) {
      commit('SET_TAB_MAIN', payload)
    },
    setMainTotalTabs({ commit }, payload) {
      commit('SET_MAIN_TOTAL_TABS', payload)
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
      let browserTokenString = ''
      for (let i = 0; i < 8; i++) {
        browserTokenString += Math.random().toString(16).slice(-4)
      }
      localStorage.setItem('browserToken', browserTokenString)
     }
  }
}
export default Main;

