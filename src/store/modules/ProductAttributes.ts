import {http} from "@/httpCommon";
import { Module } from "vuex";
const ProductAttributes:Module<any, any> = {
  state: {
    categories: [],
    customLogos: [],
    DefaultFilledColors: []
  },
  mutations: {
    categories(state: Record<any, any>, categories: Record<any, any>) {
      if(categories){
        state.categories = categories
      }
    },
    customLogos(state: Record<any, any>, customLogos: Record<any, any>) {
      if(customLogos){
        state.customLogos = customLogos
      }
    }
  },
  getters: {
    getCategories: state => {
      return state.categories
    },
    getCustomLogos: state => {
      return state.customLogos
    }
  },
  actions: {
    setCategories({commit}){
      const url = '/product/categories'
      http.get(url).then((response: any) => {
        commit('categories', response.data)
      }).catch((e: any) => {
        console.log(e)
      });
    },
    setCustomLogos({commit}, payload){
        commit('categories', payload)
    }
  }
}
export default ProductAttributes;

