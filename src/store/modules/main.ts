import {http, noTokenRequest} from "@/httpCommon";
import { Object } from "fabric/fabric-impl";
import { Module } from "vuex";
import Vue from "vue";
const mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
const iPad = /iPad|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document
const Main:Module<any, any> = {
  state: {
    application_mounted: false,
    isSafari: process.env.NODE_ENV === 'staging' ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent) : false,
    manageComponents: {
      mobileScreen: mobileScreen,
      iPad: iPad,
      CustomizationPreview: !mobileScreen,
      ItemToCustomize: true,
      DefaultColorShuffleBtn: true,
      ExtractedColors: false,
      CustomizationTabs: false
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
    popperID: '',
    index_db_store_time:1000,
    adminSalesRep: [],
    appComponentKey: 0

  },
  mutations: {
    SET_APP_COMPONENT_KEY(state: Record<any, any>) {
      state.appComponentKey = Math.random()
    },
    SET_APPLICATION_MOUNTED(state:Record<any, any>) {
      state.application_mounted = true
      state.showLoader = false
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
    },
    SET_INDEX_DB_STORE_TIME(state: Record<any, any>, payload: number) {
      state.index_db_store_time = payload
    },
    SET_ADMIN_SALES_REP(state: Record<any, any>, payload: number) {
      state.adminSalesRep = payload
    },
  },
  getters: {
    getAppComponentKey: state => {
      return state.appComponentKey
    },
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
    },
    getMobileScreen: state => {
      return state.manageComponents.mobileScreen
    },
    getAdminSalesRep: state => {
      return state.adminSalesRep
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
      if(!localStorage.getItem(Vue.prototype.$jwtToken_localstorage_key)) {
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
            localStorage.setItem(Vue.prototype.$jwtToken_localstorage_key, response.data.access_token)
          }
        }).catch((e) => {
          console.log(e)
        });
      }
    },
    async getSalesRep({commit}) {

        http.get("get-admin-salesrep").then((response: any) => {
          if (response.data) {
            commit('SET_ADMIN_SALES_REP', response.data);
          }
        });
    },
    setBrowserToken(){
      let browserTokenString = ''
      for (let i = 0; i < 8; i++) {
        browserTokenString += Math.random().toString(16).slice(-4)
      }
      localStorage.setItem(Vue.prototype.$browserToken_localstorage_key, browserTokenString)
     }
  }
}
export default Main;

