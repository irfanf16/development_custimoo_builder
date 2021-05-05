import {http} from "@/httpCommon";
import { Module } from "vuex";
import {Vue} from "vue-property-decorator";
const ProductAttributes:Module<any, any> = {
  state: {
    products:[],
    selectedIndex: 0,
    categories: [],
    customLogos: [],
    customTexts: [],
    isAssociation: false,
    styleIndex: 0,
    defaultColors: [{name: 'Color One', color: null}, {name: 'Color Two', color: null}, {name: 'Color Three', color: null}, {name: 'Color Four', color: null}]
  },
  mutations: {
    SET_PRODUCTS(state: Record<any, any>, payload: Record<any, any>){
      state.products = payload;
    },
    SET_SELECTED(state: Record<any, any>, payload: Record<any, any>){
      state.selectedIndex = payload.selectedIndex;
    },
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
    },
    customTexts(state: Record<any, any>, customText: Record<any, any>) {
      if(customText){
        Vue.set(state.customTexts, customText.index, customText.text)
      }
    },
    customTextAttribute(state: Record<any, any>, customTextAttribute: Record<any, any>) {
      if(customTextAttribute){
        Vue.set(state.customTexts[customTextAttribute.index], customTextAttribute.attribute, customTextAttribute.value)
      }
    },
    customTextsDelete(state: Record<any, any>, delCustomText: Record<any, any>) {
      if(delCustomText){
        state.customTexts.splice(delCustomText.index, 1)
      }
    },
    defaultColor (state: Record<any, any>, color: Record<any, any>) {
      if(color) {
        Vue.set(state.defaultColors[color.index], 'color', color.value)
      }
    }
  },
  getters: {
    getProducts: (state: any) => state.products,
    getSelectedIndex: (state: any) => state.selectedIndex,
    getSelectedProduct: (state => {
      return state.products[state.selectedIndex]
    }),
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
    },
    getCustomTexts: state => {
      return state.customTexts
    },
    getDefaultColors: state => {
      return state.defaultColors
    }
  },
  actions: {
    setSelectedIndex({commit}, payload) {
      commit('SET_SELECTED', payload)
    },
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
    },
    setCustomTexts({commit}, payload){
      commit('customTexts', payload)
    },
    updateCustomTextAttribute({commit}, payload){
      commit('customTextAttribute', payload)
    },
    setDefaultColor ({commit}, payload) {
      commit('defaultColor', payload)
    }
  }
}
export default ProductAttributes;

