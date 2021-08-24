import {http} from "@/httpCommon";
import { Module } from "vuex";
import {Vue} from "vue-property-decorator";
import get = Reflect.get;
const ProductAttributes:Module<any, any> = {
  state: {
    products:[],
    selectedIndex: 0,
    categories: [],
    customLogos: [],
    defaultcustomLogos: false,
    addMoreCollection: false,
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
    undoItems : [],
    redoItems:[],
    selectedDesignId:0,
    hideColorSection : false,
    customized: true,
    personalized: false,
    editStatus: false,
    editProductId: 0,
    editDesignId: 0,
    editStyleId: 0,
    selectedCollectionProducts: {locker_products:[],disabled_products:[],deleted_products:[],collection_id:0},
    collectionItems: {id: "", name: "", link: "", collection_products: []},
    collections: [],
    designCollections: [],
    editProduct:{
      editProductId: 0,
      editStyleId: 0,
      editDesignId: 0,
      mainProductId: 0,
      editStatus: false
    }
  },
  mutations: {
    CHANGE_EDIT_STATUS(state:Record<any, any>, payload){
      if (payload.status){
        state.editProduct.editStatus = payload.status
      }
      if (payload.id) {
        state.editProduct.editProductId = payload.id
      }
      if (payload.designId){
        state.editProduct.editDesignId = payload.designId
      }
      if (payload.styleId){
        state.editProduct.editStyleId = payload.styleId
      }
      if (payload.product_id){
        state.editProduct.mainProductId = payload.product_id
      }
    },
    SET_HIDE_COLOR_SECTION(state: Record<any, any>, payload: boolean){
      state.hideColorSection = payload
    },
    SET_ADD_MORE_COLLECTION(state: Record<any, any>, payload: boolean){
      state.addMoreCollection = payload
    },
    SET_DISABLED_PRODUCTS(state: Record<any, any>, payload: boolean){
      state.selectedCollectionProducts.disabled_products = state.selectedCollectionProducts.locker_products
    },
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
    SET_PRODUCT_TYPE(state: Record<any, any>, payload: Record<any, any>){
      Vue.set(state, payload.prd_type, payload.value)
     /* if(payload.prd_type == 'personalized')
        Vue.set(state, 'personalized', payload.value)
      else
        Vue.set(state, 'customized', payload.value)*/
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
        state.products[product_index].productstyles[style_index].productdesigns.map((design: Record<any, any>, index:number) => {
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
    SET_COLLECTIONS (state: Record<any, any>, collections: Record<any, any>) {
        state.collections = collections

    },
    RESET_STORE(state: Record<any, any>){
      state.customLogos = [];
      state.customTexts.map((item:Record<any, any>) => item.text = '' );
      state.defaultColors = [{title: 'Color One', color: null, pantone: null, name: null}, {title: 'Color Two', color: null, pantone: null, name: null}, {title: 'Color Three', color: null, pantone: null, name: null}, {title: 'Color Four', color: null, pantone: null, name: null}];
      state.groupColors = {};
      const selectedProduct = state.products[state.selectedIndex];
      if (selectedProduct && selectedProduct.is_logo_allowed == 1) {
        let logoSetting = selectedProduct.logos_setting[0]

        if(!logoSetting) {
          logoSetting = {
            width: 200,
            x_axis: 150,
            y_axis: 190,
            rotation: 0,
            haveControls: true,
            side: 'front'
          }
        }

        const logo = {
          url: '',
          width: logoSetting.width,
          height: logoSetting.height,
          x_axis: logoSetting.x_axis,
          y_axis: logoSetting.y_axis,
          rotation: logoSetting.rotation,
          haveControls: Boolean(!logoSetting.is_locked),
          side: logoSetting.side,
          customLogo: true,
          is_transparent: false
        }
        state.customLogos.push(logo);
        state.logoTabIndex = 0;
      }
    },
    UPDATE_UNDO:(state:Record<any, any>, payload:Record<any, any>)=>{
      state.undoItems.push(payload)
    },
    UPDATE_REDO:(state, payload) => state.redoItems.push(payload),
    DO_UNDO(state: Record<any, any>) {
      if (state.undoItems.length) {
        const lastUndo = state.undoItems.pop()
        if (lastUndo.action == 'customLogos') {
          state.redoItems.push({ data: JSON.parse(JSON.stringify(state.customLogos)), action: 'customLogos'})
          state.customLogos = lastUndo.data
        } else if (lastUndo.action == 'defaultColor') {
          state.redoItems.push({ data: JSON.parse(JSON.stringify(state.defaultColors)), action: 'defaultColor'})
          state.defaultColors = lastUndo.data
        } else if (lastUndo.action == 'groupColor') {
          state.redoItems.push({ data: JSON.parse(JSON.stringify(state.groupColors)), action: 'groupColor'})
          state.groupColors = lastUndo.data
        } else if (lastUndo.action == 'customTexts') {
          state.redoItems.push({ data: JSON.parse(JSON.stringify(state.customTexts)), action: 'customTexts'})
          state.customTexts = lastUndo.data
        }
      }else{
        console.log('nothing')
      }
    },
    DO_REDO(state:Record<any, any>){
      if (state.redoItems.length){
        const lastUndo = state.redoItems.pop()
        if(lastUndo.action == 'customLogos') {
          state.undoItems.push({ data: JSON.parse(JSON.stringify(state.customLogos)), action: 'customLogos'})
          state.customLogos = lastUndo.data
        }
        else if (lastUndo.action == 'defaultColor'){
          state.undoItems.push({ data: JSON.parse(JSON.stringify(state.defaultColors)), action: 'defaultColor'})
          state.defaultColors = lastUndo.data
        }
        else if (lastUndo.action == 'groupColor'){
          state.undoItems.push({ data: JSON.parse(JSON.stringify(state.groupColors)), action: 'groupColor'})
          state.groupColors = lastUndo.data
        }
        else if (lastUndo.action == 'customTexts'){
          state.undoItems.push({ data: JSON.parse(JSON.stringify(state.customTexts)), action: 'customTexts'})
          state.customTexts = lastUndo.data
        }
      }
    },
    SET_COLLECTION_ITEMS(state:Record<any, any>, payload:Record<any, any>){
        state.collectionItems = payload;
    },
    SET_COLLECTION_ITEMS_ATTRIBUTE(state:Record<any, any>, payload:Record<any, any>){
     if(payload.index===""){
        Vue.set(state.collectionItems, payload.attribute, payload.value)
      }else{
        Vue.set(state.collectionItems.collection_products[payload.index], payload.attribute, payload.value)
      }
    },
    SET_SELECTED_COLLECTION_PRODUCTS(state:Record<any, any>, payload:Record<any, any>){
      switch (payload.attribute){
        case "locker_products":
          state.selectedCollectionProducts.locker_products = payload.value;
          // console.log(payload.value)
          state.selectedCollectionProducts.deleted_products = state.selectedCollectionProducts.deleted_products.filter((id: number) => !payload.value.includes(id))
         break;
        case "collection_id":
          state.selectedCollectionProducts.collection_id = payload.value
        break;
        case "deleted_products":
          state.selectedCollectionProducts.deleted_products = payload.value
        break;
      }

    },
    DELETE_SELECTED_COLLECTION_PRODUCT(state:Record<any, any>, product_id:number){
      let lockerProds = state.selectedCollectionProducts.locker_products;
      lockerProds = lockerProds.filter((item: number) => item !== product_id)
      state.selectedCollectionProducts.locker_products = lockerProds
    },
    ADD_DELETED_COLLECTION_PRODUCT(state:Record<any, any>, product_id:number){
      state.selectedCollectionProducts.deleted_products.push(product_id)
    },
    DELETE_COLLECTION_ITEM(state:Record<any, any>, product_id:number){
      let lockerItems = state.collectionItems.collection_products;
      lockerItems = lockerItems.filter((item: Record<any, any>) => item.product_locker_room.id !== product_id)
      state.collectionItems.collection_products = lockerItems;
    },
    ADD_DESIGN_COLLECTION(state:Record<any, any>, payload:Record<any, any>){
      const collections = JSON.parse(JSON.stringify(state.designCollections));
      collections.push(payload);
      state.designCollections = collections;
    },
    DELETE_COLLECTION(state:Record<any, any>, payload){
      state.collections.splice(payload.index, 1);
    },
  },
  getters: {
    getAddMoreCollectionStatus: state => {
      return state.addMoreCollection
    },
    getEditMainProductId: state => {
      return state.editProduct.mainProductId
    },
    getEditStatus: state => {
      return state.editProduct.editStatus
    },
    getEditProductId: state => {
      return state.editProduct.editProductId
    },
    getEditStyleId: state => {
      return state.editProduct.editStyleId
    },
    getEditDesignId: state => {
      return state.editProduct.editDesignId
    },
    getHideColorSection: state => {
      return state.hideColorSection
    },
    getProducts: (state: any) => state.products,
    getSelectedIndex: (state: any) => state.selectedIndex,
    getSelectedProduct: (state => {
      if(state.products[state.selectedIndex]) {
        return state.products[state.selectedIndex]
      } else {
        return false
      }
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
    getRedoItems:(state)=> state.redoItems,

    getCustomized: state => {
      return state.customized
    },
    getPersonalized: state => {
      return state.personalized
    },
    getSelectedCollectionProducts(state:Record<any, any>){
      return state.selectedCollectionProducts.locker_products
    },
    getDisabledProducts(state:Record<any, any>){
      return state.selectedCollectionProducts.disabled_products
    },
    getSelectedCollectionParams(state:Record<any, any>){
      return state.selectedCollectionProducts
    },
    getCollections(state:Record<any, any>){
      return state.collections
    },
    getCollectionItems(state:Record<any, any>){
      return state.collectionItems
    },
    getDesignCollections(state:Record<any, any>){
      return state.designCollections
    }
  },
  actions: {
    setSelectedIndex({commit}, payload) {
      commit('SET_SELECTED', payload)
    },
    setProductType({commit}, payload) {
      commit('SET_PRODUCT_TYPE', payload)
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


    async deleteCollection({commit}, payload){
      const resp = await http.delete("collection/"+payload.id);
      commit('DELETE_COLLECTION', payload);
      return resp
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
    async getCollections({commit}){
      await http.get('collection').then(async (res) =>{
        await commit('SET_COLLECTIONS', res.data)
      })
    },
    resetStore({commit}){
      commit('RESET_STORE')
    },
    undoAction({commit}){
      commit('DO_UNDO');
    },
    redoAction({commit}, payload){
      commit('DO_REDO', payload)
    },
    async addDesignCollection({commit}, payload){
      commit('ADD_DESIGN_COLLECTION', payload);
    },
    async updateSharedProduct({commit}, payload){
      console.log(commit)
      const res = await http.post('updatesharedproduct', payload);
      return res
    },
    setColorSectionVisibility({commit, getters}) {
      const selectedProduct = getters.getSelectedProduct;
      if (selectedProduct && selectedProduct.product_type === 'personalized') {
        commit('SET_HIDE_COLOR_SECTION', true);
      } else {
        commit('SET_HIDE_COLOR_SECTION', false);
      }
    },
    async overRideLockerProduct({commit}, payload){
      await http.post('updatelockerproduct', payload).then((res) => {
        if (res.status == 201){
          alert(res.data.message)
        }else if (res.status == 404){
          alert(res.data.message)
        }
      }).catch(err => {
        if(err.response.status){
          alert(err.response.data.message)
          commit('CHANGE_EDIT_STATUS', {status : false, id: 0, designId: 0, styleId: 0})
        }
      })
    },
    async getCollectionItems({getters}){

      const selectedData = getters.getSelectedCollectionParams;
      const payload  = {collection_id:selectedData.collection_id, collection_prd_ids:selectedData.locker_products, delete_ids:selectedData.deleted_products}

      const res =  await http.post('collection-data', payload).then((res) =>{
        return res.data;
      })
      return res
    },
    async createNewCollection({commit},payload:Record<any, any>){
      let resp =  {status:false,message:""};
      await http.post('collection', payload).then((res) => {
        if (res.status == 201){
          resp = {status:true,message:"Collection added successfully"};
        }else if (res.status == 404){
          resp = {status:false,message:"Collection not added"};
        }
      }).catch(err => {
        if(err.response.status){
          resp = {status:false,message:err.response.data.errors};
        }
      })

      return resp;

    },
    async updateNewCollection({commit},payload:Record<any, any>){
      let resp =  {status:false,message:""};
      console.log(payload)
      await http.put(`collection/${payload.collection_id}`, payload).then((res) => {
        if (res.status == 201 || res.status == 200){
          resp = {status:true,message:"Collection updated successfully"};
        }else if (res.status == 404){
          resp = {status:false,message:"Collection not updated"};
        }
      }).catch(err => {
        if(err.response.status){
          resp = {status:false,message:err.response.data.errors};
        }
      })

      return resp;

    },
    async getCollection({commit}, payload){
      return await  http.post('collection-data', {collection_id: payload}).then((res) =>{
        return res.data
      })
    }

  }
}
export default ProductAttributes;

