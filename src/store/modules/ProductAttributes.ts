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
    defaultColors: [{name: 'Color One', color: null, pantone: null}, {name: 'Color Two', color: null, pantone: null}, {name: 'Color Three', color: null, pantone: null}, {name: 'Color Four', color: null, pantone: null}],
    groupColors: {},
    svgGroups: [],
    currentColorApplied: 'group',
    rosterDetails: [],
    productionSVGs: {}
  },
  mutations: {
    SET_PRODUCTS(state: Record<any, any>, payload: [Record<any, any>]){
      if(payload.length) {
        state.products = [...state.products, ...payload];
      } else {
        state.products = []
      }
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
        Vue.set(state.defaultColors[color.index], 'color', color.color)
        Vue.set(state.defaultColors[color.index], 'pantone', color.pantone)
      }
    },
    SET_GROUP_COLORS (state: Record<any, any>, groupColors: Record<any, any>) {
      if(groupColors) {
        state.groupColors = groupColors
      }
    },
    UPDATE_GROUP_COLORS (state: Record<any, any>, color: Record<any, any>) {
      if (color) {
        Vue.set(state.groupColors, color.index, { color: color.color, pantone: color.pantone })
      }
    },
    SET_SVG_GROUPS (state: Record<any, any>, svgGroups: Record<any, any>) {
      if(svgGroups) {
        state.svgGroups = svgGroups
      }
    },
    UPDATE_SVG_GROUPS (state: Record<any, any>, color: Record<any, any>) {
      if (color) {
        Vue.set(state.svgGroups[color.index], 'color', color.color)
        Vue.set(state.svgGroups[color.index], 'pantone', color.pantone)
      }
    },
    rosterDetails(state: Record<any, any>, rosterDetail: Record<any, any>) {
      if(rosterDetail){
        Vue.set(state.rosterDetails, rosterDetail.index, rosterDetail.roster)
      }
    },
    rosterDetailAttribute(state: Record<any, any>, rosterDetailAttribute: Record<any, any>) {
      if(rosterDetailAttribute){
        Vue.set(state.rosterDetails[rosterDetailAttribute.index], rosterDetailAttribute.attribute, rosterDetailAttribute.value)
      }
    },
    productionSVGs(state: Record<any, any>, productionSvg: Record<any, any>) {
      if(productionSvg){
        state.productionSVGs = productionSvg
      }
    },
    SET_CURRENT_COLOR_APPLIED (state: Record<any, any>, colorApplied: Record<any, any>) {
      if(colorApplied) {
        state.currentColorApplied = colorApplied
      }
    },
    ADD_TO_PRODUCTS(state:Record<any, any>, payload){
      state.products.push(payload);
    },
    OVERRIDE_LOGOS(state:Record<any, any>, payload){
      state.customLogos = payload;
    },
    OVERRIDE_TEXT(state:Record<any, any>, payload){
      state.customTexts = payload;
    },
    REMOVE_ROSTER(state:Record<any, any>, payload:number){
      console.log(payload);
      state.rosterDetails.splice(payload, 1);
    },
    UPDATE_ROSTER(state:Record<any, any>, payload:Record<any, any>){
      state.rosterDetails = payload;
    },
    OVERRIDE_ROSTER(state:Record<any, any>){
      state.rosterDetails = [{
        text: '',
        number: 0,
        size: 'SM',
        quantity: 1,
        information:''
      }];
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
    },
    getGroupColors: state => {
      return state.groupColors
    },
    getSvgGroups: state => {
      return state.svgGroups
    },
    getRosterDetails: state => {
      return state.rosterDetails
    },
    getProductionSVGs: state => {
      return state.productionSVGs
    },
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
    },
    setGroupColors ({commit}, payload) {
      commit('SET_GROUP_COLORS', payload)
    },
    updateGroupColors ({commit}, payload){
      commit('UPDATE_GROUP_COLORS', payload)
    },
    setSvgGroups ({commit}, payload) {
      commit('SET_SVG_GROUPS', payload)
    },
    updateSvgGroups ({commit}, payload){
      commit('UPDATE_SVG_GROUPS', payload)
    },
    setRosterDetails({commit}, payload){
      commit('rosterDetails', payload)
    },
    updateRosterDetailAttribute({commit}, payload){
      commit('rosterDetailAttribute', payload)
    },
    setProductionSVGs({commit}, payload){
      commit('productionSVGs', payload)
    },
    async ADD_CUSTOMIZED_PRODUCT({commit}, payload:number){
      let done = false;
      await http.get("product?product_id="+payload).then((res) => {
        if (res.status == 200) {
          console.log(res.data.products);
          commit('ADD_TO_PRODUCTS', res.data.products);
          done = true;
        }
      });
      return done;
    },
    async OVERRIDE_CUSTOM_LOGOS({commit}, payload:Record<any, any>){
     await commit('OVERRIDE_LOGOS', payload);
    },
    async OVERRIDE_CUSTOM_TEXT({commit}, payload:Record<any, any>){
     await commit('OVERRIDE_TEXT', payload);
    },
    removeRoster({commit}, payload:number){
      commit('REMOVE_ROSTER', payload);
    },
    async updateRoster({commit}, payload:Record<any, any>){
     await commit('UPDATE_ROSTER', payload);
    }
  }
}
export default ProductAttributes;

