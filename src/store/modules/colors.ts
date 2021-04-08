import {http, noTokenRequest} from "@/httpCommon";
import { Module } from "vuex";
const Colors:Module<any, any> = {
  state: {
    categories: [],
    defaultFillColors: []
  },
  mutations: {
    defaultFillColors(state: Record<any, any>, payload: Record<any, any>) {
      if(payload){
        state.categories = payload.categories
        state.defaultFillColors = JSON.parse(payload.color.color_text)
      }
    },
    initialiseStore(state: Record<any, any>) {
      if (localStorage.getItem('defaultFillColors')) {
        state.defaultFillColors = JSON.parse(localStorage.getItem('defaultFillColors') as string);
      }
    }
  },
  getters: {
    getCategories: state => {
      return state.categories
    },
    getDefaultColors: state => {
      return state.defaultFillColors
    },
    getDefaultFilledColors: state => {
      return state.defaultFillColors.filter((fillColor: Record<any, any>) => fillColor.color != null)
    },
  },
  actions: {
    setDefaultFillColors({commit}){
      const url = '/product/colors?default_color=1'
      http.get(url).then((response: any) => {
        commit('defaultFillColors', response.data.data)
      }).catch((e: any) => {
        console.log(e)
      });
    }
  }
}
export default Colors;

