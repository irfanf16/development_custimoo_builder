import {http} from "@/httpCommon";
import { Module } from "vuex";
const ProductAttributes:Module<any, any> = {
  state: {
    categories: [],
    customLogos: [],
    isAssociation: false,
    DefaultFilledColors: []
  },
  mutations: {
    categories(state: Record<any, any>, categories: Record<any, any>) {
      if(categories){
        state.categories = categories
      }
    },
    customLogos(state: Record<any, any>, customLogo: Record<any, any>) {
      if(customLogo){
        state.customLogos = state.customLogos.concat([customLogo])
      }
    },
    isAssociation(state: Record<any, any>, isAssociation: Record<any, any>) {
      state.isAssociation = isAssociation.associate
      localStorage.setItem('isAssociation', isAssociation.associate)
    }
  },
  getters: {
    getCategories: state => {
      return state.categories
    },
    getCustomLogos: state => {
      return state.customLogos
    },
    getIsAssociation: state => {
      return state.isAssociation
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
      commit('customLogos', payload)
    },
    setIsAssociation({commit}, payload){
        commit('isAssociation', payload)
    }
  }
}
export default ProductAttributes;

