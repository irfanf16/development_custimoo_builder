import {http} from "@/httpCommon";
import { Module } from "vuex";
import {Vue} from "vue-property-decorator";
const ProductAttributes:Module<any, any> = {
  state: {
    categories: [],
    customLogos: [],
    isAssociation: false,
    styleIndex: 0
  },
  mutations: {
    categories(state: Record<any, any>, categories: Record<any, any>) {
      if(categories){
        state.categories = categories
      }
    },
    customLogos(state: Record<any, any>, customLogo: Record<any, any>) {
      if(customLogo){
        Vue.set(state.customLogos, state.customLogos.length, customLogo)
      }
    },
    customLogoAttribute(state: Record<any, any>, customLogoAttribute: Record<any, any>) {
      if(customLogoAttribute){
        Vue.set(state.customLogos[customLogoAttribute.index], customLogoAttribute.attribute, customLogoAttribute.value)
      }
    },
    customLogoDelete(state: Record<any, any>, delCustomLogo: Record<any, any>) {
      if(delCustomLogo){
        state.customLogos.splice(delCustomLogo.index, 1)
      }
    },
    isAssociation(state: Record<any, any>, isAssociation: Record<any, any>) {
      state.isAssociation = isAssociation.associate
      localStorage.setItem('isAssociation', isAssociation.associate)
    },
    CHANGE_STYLE_INDEX(state:  Record<any, any>, payload:number){
      state.styleIndex = payload;
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
    },
    getCurrentStyleIndex: state => {
      return state.styleIndex
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
    updateCustomLogoAttribute({commit}, payload){
      commit('customLogoAttribute', payload)
    },
    deleteCustomLogo({commit}, payload){
      commit('customLogoDelete', payload)
    },
    setIsAssociation({commit}, payload){
        commit('isAssociation', payload)
    }
  }
}
export default ProductAttributes;

