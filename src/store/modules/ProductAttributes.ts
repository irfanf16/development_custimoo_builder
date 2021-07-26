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
    styleIndex: 0,
    defaultColors: [{title: 'Color One', color: null, pantone: null, name: null}, {title: 'Color Two', color: null, pantone: null, name: null}, {title: 'Color Three', color: null, pantone: null, name: null}, {title: 'Color Four', color: null, pantone: null, name: null}],
    groupColors: {},
    svgGroups: [],
    currentColorApplied: 'group',
    rosterDetails: [],
    productionSVGs: {},
    lockerColors:[],
    logoTabIndex: 0,
    actionBeforeLogin: '',
    undoItems : [{ action: '', data: null}],
    redoItems:[],
    selectedDesignId:0
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
    SET_SELECTED_PRODUCT_DESIGN_ID(state: Record<any, any>, payload: Record<any, any>){
      state.selectedDesignId = payload;
    },
    SET_SELECTED_PRODUCT_AND_STYLE(state: Record<any, any>) {
        if(typeof state.products[state.selectedIndex] === 'undefined'){
          state.selectedIndex = 0;
          state.styleIndex=0;
          state.selectedDesignId =0;
        }else{
          if(typeof state.products[state.selectedIndex].productstyles[state.styleIndex] === 'undefined'){
            state.products[state.selectedIndex].productstyles[state.styleIndex] = 0;
            state.selectedDesignId =0;
          }
        }
    },
    SET_SELECTED_PRODUCT_DESIGN(state: Record<any, any>) {
      if (state.selectedDesignId > 0) {
      const style_index = state.styleIndex;
      const product_index = state.selectedIndex
      if (typeof state.products[product_index].productstyles[style_index] !== 'undefined') {
        let checkDesignFound = false;
        let defaultDesignShow = 0;
        state.products[product_index].productstyles[style_index].productdesigns.map((design: Record<any, any>,index) => {
          if(design.design_show){
            defaultDesignShow = index
          }
          if (design.id == state.selectedDesignId) {
            checkDesignFound = true;
            design.design_show = 1
          } else {
            design.design_show = 0
          }
        });
        if(!checkDesignFound){
          Vue.set(state.products[product_index].productstyles[style_index].productdesigns[defaultDesignShow], 'design_show', 1)
          state.selectedDesignId = state.products[product_index].productstyles[style_index].productdesigns[defaultDesignShow].id
        }
      }
    }
    },
    categories(state: Record<any, any>, categories: Record<any, any>) {
      if(categories){
        state.categories = categories
      }
    },
    customLogos(state: Record<any, any>, customLogo: Record<any, any>) {
      // Vue.set(state.customLogos, state.customLogos.length, customLogo)
      if(customLogo){
        if('logoIndex' in customLogo && customLogo.logoIndex != null) {
          Vue.set(state.customLogos, customLogo.logoIndex, customLogo)
        } else {
          Vue.set(state.customLogos, state.customLogos.length, customLogo)
        }
      }
    },
    customLogoAttribute(state: Record<any, any>, customLogoAttribute: Record<any, any>) {
      if(customLogoAttribute){
        Vue.set(state.customLogos[customLogoAttribute.index], customLogoAttribute.attribute, customLogoAttribute.value)
      }
    },
    CUSTOM_LOGO_WITHOUT_TRIGGER(state: Record<any, any>, customLogoAttribute: Record<any, any>) {
      if(customLogoAttribute){
        if(state.customLogos[customLogoAttribute.index]) {
          Object.assign(state.customLogos[customLogoAttribute.index], customLogoAttribute.data)
        }
      }
    },
    customLogoDelete(state: Record<any, any>, delCustomLogo: Record<any, any>) {
      if(delCustomLogo){
         Vue.set(state.customLogos, delCustomLogo.index, null)
      }
    },
    customLogoTabDelete(state: Record<any, any>, delCustomTabLogo: Record<any, any>) {
      if(delCustomTabLogo){
        // state.customLogos.splice(delCustomLogo.index, 1)
        Vue.delete(state.customLogos, delCustomTabLogo.index)
      }
    },
    setLogoTabMutation(state: Record<any, any>, logoIndex:number) {
      state.logoTabIndex = logoIndex;
      // Vue.set(state.logoTabIndex, logoIndex, logoIndex)
    },
    toggleLogoBackgroudMutation(state: Record<any, any>, logoIndex:number) {
     const logo = state.customLogos[logoIndex];
      const original_logo = logo.original_logo;
      const transparent_logo = logo.transparent_logo;
      let logo_url = '';

     if(logo.is_transparent===true){
        logo_url = transparent_logo;
      }else{
        logo_url = original_logo;
      }
      Vue.set(state.customLogos[logoIndex], 'url', logo_url )

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
    CUSTOM_TEXT_WITHOUT_TRIGGER(state: Record<any, any>, customTextsAttribute: Record<any, any>) {
      if(customTextsAttribute){
        Object.assign(state.customTexts[customTextsAttribute.index], customTextsAttribute.data)
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
        Vue.set(state.defaultColors[color.index], 'name', color.name)
      }
    },

    removeDefaultColor (state: Record<any, any>, removeIndex: number) {
      Vue.set(state.defaultColors[removeIndex], 'color', '')
      Vue.set(state.defaultColors[removeIndex], 'pantone', '')
      Vue.set(state.defaultColors[removeIndex], 'name', '')
    },

    SET_GROUP_COLORS (state: Record<any, any>, groupColors: Record<any, any>) {
      if(groupColors) {
        state.groupColors = groupColors
      }
    },
    UPDATE_GROUP_COLORS (state: Record<any, any>, color: Record<any, any>) {
      if (color) {
        Vue.set(state.groupColors, color.index, { color: color.color, pantone: color.pantone, name: color.name })
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
        Vue.set(state.svgGroups[color.index], 'name', color.name)
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
    OVERRIDE_DEFAULT_COLOR(state:Record<any, any>, payload){
      state.defaultColors = payload;
    },
    OVERRIDE_GROUP_COLORS(state:Record<any, any>, payload){
      state.groupColors = payload;
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
    },
    ADD_LOCKER_ROOM_COLORS(state:Record<any, any>, payload:Record<any, any>){
      payload = payload.map((item: Record<any, any>) => {
         item.color_text = JSON.parse(item.color_text)
        return item
      })
      state.lockerColors = payload
    },
    ACTION_BEFORE_LOGIN(state: Record<any, any>, action: string){
      state.actionBeforeLogin = action
    },
    RESET_STORE(state: Record<any, any>){
      state.customLogos = [];
      state.customTexts.map((item:Record<any, any>) => item.text = '' );
      state.defaultColors = [{title: 'Color One', color: null, pantone: null, name: null}, {title: 'Color Two', color: null, pantone: null, name: null}, {title: 'Color Three', color: null, pantone: null, name: null}, {title: 'Color Four', color: null, pantone: null, name: null}];
      state.groupColors = {};
    },
    UPDATE_UNDO:(state, payload)=> state.undoItems.push(payload),
    UPDATE_REDO:(state, payload) => state.redoItems.push(payload),
    DO_UNDO(state: Record<any, any>) {
      const lastUndo = state.undoItems.pop()
      state.redoItems.push(lastUndo)
      if(lastUndo.action == 'customLogos') {
        state.customLogos = lastUndo.data
      }
      else if (lastUndo.action == 'defaultColor'){
        console.log('sah ley')
      }else if (lastUndo.action == 'groupColor'){
        console.log('sah ley')
      }
    },
    DO_REDO(state:Record<any, any>){
      if (state.redoItems.length){
        const lastUndo = state.undoItems.pop()
        state.redoItems.push(lastUndo)
        if(lastUndo.action == 'customLogos') {
          state.customLogos = lastUndo.data
        }
        else if (lastUndo.action == 'defaultColor'){
          console.log('sah ley')
        }else if (lastUndo.action == 'groupColor'){
          console.log('sah ley')
        }
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
    getActiveLogoIndex: (state: any) => state.logoTabIndex,
    getCurrentStyleIndex: state => {
      return state.styleIndex
    },
    getSelectedDesignId: state => {
      return state.selectedDesignId
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
    getLockerColors: state => {
      return state.lockerColors
    },
    getActionBeforeLogin: state => {
      return state.actionBeforeLogin
    },
    getUndoItems:(state)=> state.undoItems,
    getRedoItems:(state)=> state.redoItems
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
    updateCustomLogoWithoutTrigger({commit}, payload){
      commit('CUSTOM_LOGO_WITHOUT_TRIGGER', payload)
    },
    deleteCustomLogo({commit}, payload){
      commit('customLogoDelete', payload)
    },
    deleteCustomLogoTab({commit}, payload){
      commit('customLogoTabDelete', payload)
    },

    setLogoTab({commit}, payload){
      commit('setLogoTabMutation', payload)
    },
    toggleLogoBackgroud({commit}, index){
      commit('toggleLogoBackgroudMutation', index)
    },
    setCustomTexts({commit}, payload){
      commit('customTexts', payload)
    },
    updateCustomTextAttribute({commit}, payload){
      commit('customTextAttribute', payload)
    },
    updateCustomTextWithoutTrigger({commit}, payload){
      commit('CUSTOM_TEXT_WITHOUT_TRIGGER', payload)
    },
    setDefaultColor ({commit}, payload) {
      commit('defaultColor', payload)
    },
    removeDefaultColor ({commit}, payload) {
      console.log("payload",payload);
      commit('removeDefaultColor', payload)
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
    setSelectedProductDesignID({commit}, payload){
      commit('SET_SELECTED_PRODUCT_DESIGN_ID', payload);
    },
    async setSelectedProductAndStyle({commit}){
      await commit('SET_SELECTED_PRODUCT_AND_STYLE');
    },
    async setSelectedProductDesign({commit}){
      await commit('SET_SELECTED_PRODUCT_DESIGN');
    },
    async ADD_CUSTOMIZED_PRODUCT({commit}, payload:number){
      let done = false;
      await http.get("product?product_id="+payload).then((res) => {
        if (res.status == 200) {
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
    overRideDefaultColors({commit}, payload:Record<any, any>){
      commit('OVERRIDE_DEFAULT_COLOR', payload);
    },
    overRideGroupColors({commit}, payload:Record<any, any>){
      commit('OVERRIDE_GROUP_COLORS', payload);
    },
    removeRoster({commit}, payload:number){
      commit('REMOVE_ROSTER', payload);
    },
    async updateRoster({commit}, payload:Record<any, any>){
     await commit('UPDATE_ROSTER', payload);
    },
    async getLockerRoomColors({commit}){
      await http.get('folder/colors').then(async (res) =>{
       await commit('ADD_LOCKER_ROOM_COLORS', res.data)
      })
    },
    resetStore({commit}){
      commit('RESET_STORE')
    },
    undoAction({commit}, payload){
      commit('DO_UNDO', payload);
    },
    redoAction({commit}, payload){
      commit('DO_REDO', payload)
    },
    async updateSharedProduct({commit}, payload){
      console.log(commit)
      const res = await http.post('updatesharedproduct', payload);
      return res
    }
  }
}
export default ProductAttributes;

