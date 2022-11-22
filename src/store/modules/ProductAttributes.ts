import {http} from "@/httpCommon";
import { Module } from "vuex";
import {Vue} from "vue-property-decorator";
import {
  rosterDefaultItem,
  setRetrievedProductsCustomTexts,
  getRosterDetailDefaultObject,
  initCustomLogosNew,
  setCustomLogo,
  getLogoSettings,
  setLogoSettings,
  getProductLogoSetting,
  logData,
  lastActiveProductDefaultObject,
  recentLogoDefaultObject,
  getLogoSettingsObject, logoColorInfoDefaultObject, getDefaultColorsObject, setDefaultColors
} from '@/helpers/Helpers'
import product from "@/store/modules/product";
import {isEmpty, findIndex} from "lodash";
const ProductAttributes:Module<any, any> = {
  state: {
    stock_count:0,
    private_product_count:0,
    searchLoader: false,
    showLoader:true,
    lockerActiveTabIndex:0,
    lockerTabsIndex:0,
    isShareDesign : false,
    activeLockerProduct:undefined,
    products:[],
    selectedIndex: 0,
    selectedPrdId:0,
    categories: [],
    colorsFromRecent: false,
    customLogos: {},
    recentLogos: [],
    defaultcustomLogos: false,
    selectionMode: {
      readonly:false,
      collectionAddmoreMode:false,
      eventProductMode:false,
      eventCollectionMode:false
    },
    customTexts: {},
    styleIndex: 0,
    // changing defaultColors object will also need to change value in helper method getDefaultColorsObject
    defaultColors: [{title: 'Color One', color: null, pantone: null, name: null}, {title: 'Color Two', color: null, pantone: null, name: null}, {title: 'Color Three', color: null, pantone: null, name: null}, {title: 'Color Four', color: null, pantone: null, name: null}],
    groupColors: {},
    svgGroups: [],
    currentColorApplied: 'group',
    rosterDetails: {},
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
    private_product:false,
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
      editStatus: false,
      productName:null
    },
    activeTab : 0,
    showShuffle : true,
    canvasImage:{
      ref_front:'',
      ref_back:'',
      front:'',
      back:'',
      scene:null
    },
    using_logo_colors: false,
    backgroundCheck: false,
    colorCheck: false,
    showColorsLogoEditor:false,
    logoEditor: {
      id: 0,
      image: '',
      originalImage: '',
      remove_background: '',
      color: '',
      flood_fill: false
    },
    editLockerProduct: [],
    canvas_ready: false,
    notifications:[],
    customLogoObjects:[],
    cartItemId:'',
    editCart: {
      cartId: 0,
      cartItemId: ''
    },
    revertRosterBool:false,
    hideSaveLockerButton: true,
    product_custom_texts: {},
    //could be locker_product, cart_product, order_product
    product_edit_info_object: { editing: false, type: null, filters: null, locker_product_info: null, cart_product_info: null, order_product_info: null},
    last_active_product_data: {}, //it's default value is being set from Home.vue mounted method through commit 'SET_LAST_ACTIVE_PRODUCT_DATA'
    editing_roster_player_index: 0,
    selectedCategories:[],
    products_next_page_no: null, //null value mean has no more pages,
    products_rosters:{},
    active_roster_index:0,
    logo_colors_info: {
      /*
      * while adding/removing property make  sure to add/remove property in helpers method logoColorInfoDefaultObject()
      * */
      using_logo_colors: false,
      is_shuffled: false,
      extracted_colors: [],
      colors: []
    }
  },
  mutations: {
    UPDATE_NOTIFICATION(state:Record<any, any>, payload){
     const index =  state.notifications.findIndex((item:Record<any, any>)=>{
        return item.id == payload.id
      })
      Vue.set(state.notifications[index], 'read_at', payload.date)
    },
    SET_NOTIFICATIONS(state:Record<any, any>, payload) {
      state.notifications  = payload
    },
    setIsShareDesign(state:Record<any, any>, payload) {
      state.isShareDesign  = payload
    },
    UPDATE_NOTIFICATIONS(state:Record<any, any>, payload){
      if (payload){
        state.notifications.unshift(payload)
      }
    },

    Change_Locker_Active_Tab(state:Record<any, any>, payload) {
      state.lockerActiveTabIndex = payload
    },
    setActiveLockerProduct(state:Record<any, any>, payload) {
      state.activeLockerProduct = payload
    },
    Change_Locker_Tabs_Index(state:Record<any, any>, payload) {
      state.lockerTabsIndex = payload
    },
    CHANGE_EDIT_STATUS(state:Record<any, any>, payload){
      if (payload.status == true || payload.status == false){
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
      if (payload.productName){
        state.editProduct.productName = payload.productName
      }
    },

    CHANGE_EDIT_LOCKER_PRODUCT(state:Record<any, any>, payload){
      const exist = state.editLockerProduct.find((x:number) => x == payload.prd_id)
      if(!exist)
        state.editLockerProduct.push(payload.prd_id)
    },
    SET_HIDE_COLOR_SECTION(state: Record<any, any>, payload: boolean){
      state.hideColorSection = payload
    },
    SET_COLORS_FROM_RECENT(state: Record<any, any>, payload: boolean){
      state.colorsFromRecent = payload
    },
    SET_SELECTION_MODE(state: Record<any, any>, payload: boolean){
      state.selectionMode = payload
    },
    SET_DISABLED_PRODUCTS(state: Record<any, any>, payload: boolean){
      state.selectedCollectionProducts.disabled_products = state.selectedCollectionProducts.locker_products
    },
    SET_PRODUCTS(state: Record<any, any>, payload: Record<any, any>){
      if(payload.append_products) {
        state.products = [...state.products, ...payload.products];
      } else {
        state.products = payload.products;
      }
    },
    SET_STOCK_COUNT(state:Record<any,any>, payload:number){
      state.stock_count = payload;
    },
    SET_PRIVATE_PRODUCT_COUNT(state:Record<any,any>, payload:number){
      state.private_product_count = payload;
    },
    SET_SEARCH_LOADER(state: Record<any, any>, payload: boolean){
      state.searchLoader = payload;
    },
    SET_SELECTED(state: Record<any, any>, payload: Record<any, any>){
      state.selectedIndex = payload.selectedIndex;
      state.selectedPrdId = state.products[payload.selectedIndex].id;
    },
    SET_PRODUCT_TYPE(state: Record<any, any>, payload: Record<any, any>){
      Vue.set(state, payload.prd_type, payload.value)
     /* if(payload.prd_type == 'personalized')
        Vue.set(state, 'personalized', payload.value)
      else
        Vue.set(state, 'customized', payload.value)*/
    },
    SET_PRIVATE_PRODUCT(state:Record<any,any>, payload:Record<any,any>){
      state.private_product = payload
    },
    // SET_EDIT_CART(state: Record<any, any>, payload: Record<any, any>){
    //   Vue.set(state.editCart,payload.key,payload.value)
    // },
    SET_SELECTED_PRODUCT_DESIGN_ID(state: Record<any, any>, payload: Record<any, any>){
      state.selectedDesignId = payload;
    },
    SET_SELECTED_PRODUCT_CUSTOM_LOGO(state: Record<any, any>,payload:any) {
      if(state.products[state.selectedIndex]) {
        state.products[state.selectedIndex].customLogos = payload;
      }
    },
    async categories(state: Record<any, any>, categories: Record<any, any>) {
      if(categories){
        state.categories = categories
      }

    },
    SET_SELECTED_CATEGORIES(state: Record<any, any>, category_id: number){
        state.selectedCategories = [];
        state.selectedCategories.push(category_id);
     },
     customLogos(state: Record<any, any>, customLogo: Record<any, any>) {
       if(customLogo && customLogo.custom_logo){
         const newCustomLogo = customLogo.custom_logo
         if('logoIndex' in newCustomLogo && newCustomLogo.logoIndex != null) {
           Vue.set(state.customLogos[state.selectedPrdId], newCustomLogo.logoIndex, {...newCustomLogo})
           const index = state.products.findIndex((item:Record<any, any>) => item.id === state.selectedPrdId)
           const settings = state.products[index]['logos_setting'][newCustomLogo.logoIndex]
             if(settings && settings.logos_follows_product){
             const ids = settings.following_product_ids
             if(ids.length){
               ids.forEach(async (new_item:number)=>{
                 if (state.selectedPrdId != new_item) {
                   let removeLogo = false
                   if ('removeLogo' in newCustomLogo) {
                     removeLogo = true
                   }
                   if ('adding_tab' in newCustomLogo  && newCustomLogo.adding_tab || removeLogo) {
                     if (state.customLogos[new_item] && state.customLogos[new_item][newCustomLogo.logoIndex] && !removeLogo) {
                       newCustomLogo.adding_tab = true
                       newCustomLogo.logoIndex = state.customLogos[new_item].length
                     }
                     const logo_settings = getProductLogoSetting(new_item, newCustomLogo.logoIndex)
                     if (logo_settings && state.customLogos[new_item]) {
                       Vue.set(state.customLogos[new_item], newCustomLogo.logoIndex, {...logo_settings})
                     }
                   } else {
                     await setCustomLogo(customLogo.customObj, newCustomLogo.logoIndex, new_item)
                   }
                 }
               })
             }
           }
         } else {
           Vue.set(state.customLogos[state.selectedPrdId], state.customLogos[state.selectedPrdId].length, customLogo.custom_logo)
         }
       }
    },
    SET_PRODUCT_CUSTOM_LOGOS(state: Record<any, any>, payload: Record<any, any> ) {
      if('append' in payload) {
        state.customLogos = {...state.customLogos, ...payload.data}
      }
      else {
        const product_id = payload.product_id ? payload.product_id : state.selectedPrdId
        const custom_logo_index = payload.logo_index
        let product_custom_logos = state.customLogos[product_id]
        if(custom_logo_index >= 0) {
          let product_custom_logo = product_custom_logos[custom_logo_index]
          product_custom_logo = {...product_custom_logo, ...payload.data}
        }
        else {
          product_custom_logos = payload.data
        }
      }
    },
    SET_CUSTOM_LOGOS(state: Record<any, any>,payload = []) {
      const product_id = payload.product_id ? payload.product_id : state.selectedPrdId
      const logo_index = payload.logo_index
      if(logo_index >= 0) {
        Vue.set(state.customLogos[product_id], logo_index, {...state.customLogos[product_id], ...payload.custom_logos})
      }
      else {
        Vue.set(state.customLogos, product_id, payload.custom_logos)
      }
    },
    SET_RECENT_LOGOS(state: Record<any, any>, payload: Record<any, any>) {
      if(payload) {
        // payload action can have = {prepend, append, assign}
        const action = payload.action ? payload.action : 'prepend'
        payload.data = payload.data.constructor.name == 'Object' ? [ payload.data ] : payload.data
        switch (action) {
          case 'prepend':
            state.recentLogos = [ ...payload.data, ...state.recentLogos ]
            break;
          case 'append':
            state.recentLogos = [ ...state.recentLogos, ...payload.data ]
            break;
          default:
            state.recentLogos = payload.data
        }
      }
      else {
        http.get('logos/recent').then((res) => {
          state.recentLogos = []
          state.recentLogos = recentLogoDefaultObject(res.data.data)
        }).catch((e) => {
          console.log('e',e)
        })
      }

    },
    customLogoAttribute(state: Record<any, any>, customLogoAttribute: Record<any, any>) {
      if(customLogoAttribute){
        Vue.set(state.customLogos[state.selectedPrdId][customLogoAttribute.index], customLogoAttribute.attribute, customLogoAttribute.value)
        const index = state.products.findIndex((item:Record<any, any>) => item.id === state.selectedPrdId)
        const settings = state.products[index]['logos_setting'][customLogoAttribute.index]
        if(settings && settings.logos_follows_product){
          const ids = settings.following_product_ids
          if(ids.length){
            ids.forEach(async (new_item:number)=>{
              if (new_item != state.selectedPrdId && state.customLogos[new_item]){
                state.customLogos[new_item][customLogoAttribute.index][customLogoAttribute.attribute] = customLogoAttribute.value
              }
            })
          }
        }
      }
    },
    UPDATE_LOGO_ATTRIBUTE_FOR_EACH_PRODUCT(state:Record<any, any>, payload:Record<any, any>){
      if (payload.logo){
        const customLogoAttribute = payload.logo
        if (state.customLogos[payload.id] && state.customLogos[payload.id][customLogoAttribute.index]){
          Vue.set(state.customLogos[payload.id][customLogoAttribute.index], customLogoAttribute.attribute, customLogoAttribute.value)
        }
      }
    },
    CUSTOM_LOGO_WITHOUT_TRIGGER(state: Record<any, any>, customLogoAttribute: Record<any, any>) {
      if(customLogoAttribute){
        if(Object.keys(customLogoAttribute.data).length && state.customLogos[state.selectedPrdId] && state.customLogos[state.selectedPrdId][customLogoAttribute.index]) {
          Object.keys(customLogoAttribute.data).forEach((key) => {
            state.customLogos[state.selectedPrdId][customLogoAttribute.index][key] = customLogoAttribute.data[key]
          })
          state.products.forEach((item:Record<any, any>)=>{
            if (item.logos_follows_product && item.id != state.selectedPrdId)
              Object.keys(customLogoAttribute.data).forEach((key) => {
              state.customLogos[item.id][customLogoAttribute.index][key] = customLogoAttribute.data[key]
            })
          })
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
        Vue.delete(state.customLogos[state.selectedPrdId], delCustomTabLogo.index)
        const index = state.products.findIndex((item:Record<any, any>) => item.id === state.selectedPrdId)
        const settings = state.products[index]['logos_setting'][delCustomTabLogo.index]
        if(settings && settings.logos_follows_product){
          const ids = settings.following_product_ids
          if(ids.length){
            ids.forEach(async (new_item:number)=>{
              if (new_item != state.selectedPrdId){
                Vue.delete(state.customLogos[new_item], delCustomTabLogo.index)
              }
              state.customLogos[new_item].forEach((logo:Record<any, any>, ind:number)=>{
                Vue.set(state.customLogos[new_item][ind], 'logoIndex', ind)
              })
            })
          }
        }
      }
    },
    setLogoTabMutation(state: Record<any, any>, logoIndex:number) {
      state.logoTabIndex = logoIndex;
      // Vue.set(state.logoTabIndex, logoIndex, logoIndex)
    },
    toggleLogoBackgroudMutation(state: Record<any, any>, payload:any) {

      const logo = state.customLogos[state.selectedPrdId][payload.index];
      const original_logo = logo.original_logo;
      const transparent_logo = logo.transparent_logo;
      const smart_transparent_logo = logo.smart_transparent_logo;
      let logo_url = '';
      if(payload.type == 'transparent') {
        if(payload.val) {
          Vue.set(state.customLogos[state.selectedPrdId][payload.index], 'is_transparent', true )
          Vue.set(state.customLogos[state.selectedPrdId][payload.index], 'is_smart_transparent', false )
        } else {
          Vue.set(state.customLogos[state.selectedPrdId][payload.index], 'is_transparent', false )
        }
      }
      else {
        if(payload.val) {
          Vue.set(state.customLogos[state.selectedPrdId][payload.index], 'is_smart_transparent', true )
          Vue.set(state.customLogos[state.selectedPrdId][payload.index], 'is_transparent', false )
        } else {
          Vue.set(state.customLogos[state.selectedPrdId][payload.index], 'is_smart_transparent', false )
        }
      }
      const changed_logo = state.customLogos[state.selectedPrdId][payload.index];
      if(changed_logo.is_transparent) {
        logo_url = transparent_logo
      } else if (changed_logo.is_smart_transparent) {
        logo_url = smart_transparent_logo
      }
      else {
        logo_url = original_logo
      }
      Vue.set(state.customLogos[state.selectedPrdId][payload.index], 'url', logo_url )

    },
    TOGGLE_LOGO_CHECK(state: Record<any, any>, payload:any) {
      if(payload.type == 'background') {
        if(payload.val) {
          state.backgroundCheck = true
          //state.colorCheck = false
        }
        else {
          state.backgroundCheck = false
        }

        Vue.set(state.logoEditor,'image', state.logoEditor.originalImage)
        Vue.set(state.logoEditor,'remove_background','')

      }
      else if(payload.type == 'color') {
        if(payload.val) {
          state.colorCheck = true
          //state.backgroundCheck = false
        }
        else {
          state.colorCheck = false
          Vue.set(state.logoEditor,'image',state.logoEditor.originalImage)
        }
      }
    },
    EDIT_LOGO(state: Record<any, any>, payload:any) {
      Vue.set(state.logoEditor, payload.key, payload.value)
    },
    UNSET_LOGO_EDITOR(state: Record<any, any>, payload:any) {
      Vue.set(state.logoEditor,'remove_background','')
      state.backgroundCheck = false
      state.colorCheck = true
    },
    CHANGE_STYLE_INDEX(state:  Record<any, any>, payload:number){
      state.styleIndex = payload;
    },
    SET_CUSTOM_OBJ(state:  Record<any, any>, prd_id:number){
      const arr:Record<any, any> = []
      const default_setting = setLogoSettings(0)
      const prod_logo_setting = getLogoSettings(0,false, prd_id)
      const logo_setting:Record<any, any> = {...default_setting,...prod_logo_setting}
      arr.push(logo_setting)
      Vue.set(state.customLogos, prd_id, arr)

      //set team logo url of new product
      const team_logo_product_id = Object.keys(state.customLogos).find((product_id: string) => {
        if(state.customLogos[product_id] && state.customLogos[product_id][0] && state.customLogos[product_id][0].url) {
          return true
        }
      })
      if(team_logo_product_id) {
        const logo = state.customLogos[team_logo_product_id][0];
        state.products.forEach((product: Record<any, any>) => {
          if(state.customLogos[product.id] && state.customLogos[product.id][0] && !state.customLogos[product.id][0].url) {
            state.customLogos[product.id][0].original_logo = logo.original_logo
            state.customLogos[product.id][0].transparent_logo = logo.transparent_logo
            state.customLogos[product.id][0].smart_transparent_logo = logo.smart_transparent_logo
            state.customLogos[product.id][0].is_smart_transparent = false
            state.customLogos[product.id][0].is_transparent = false
            Vue.set(state.customLogos[product.id][0], 'url', logo.url)
          }
        })
      }
    },
    SET_TEAM_LOGO_URL(state:  Record<any, any>,logo:any){
      const custom_obj = JSON.parse(JSON.stringify(state.customLogos))
      Object.keys(custom_obj).map(function(product_id: string) {
        let logo_ = custom_obj[product_id][0];
        logo_ = {...logo_, ...logo.customObj}
        Vue.set(state.customLogos[product_id],0, logo_)
      });
    },
    REMOVE_TEAM_LOGO(state: Record<any, any>) {
      state.products.forEach((product: Record<any, any>) => {
        if(state.customLogos[product.id]) {
          let logo_default_setting: Record<any, any> = getLogoSettingsObject()
          if(product.logos_setting[0]) {
            logo_default_setting = {...logo_default_setting, ...product.logos_setting[0]}
          }
          Vue.set(state.customLogos[product.id], 0, logo_default_setting)
        }
      })
    },
    async customTexts(state: Record<any, any>, customText: Record<any, any>) {
     if(customText){
        if(!state.customTexts[customText.prd_id]) {
          Vue.set(state.customTexts, customText.prd_id, [])
        }
        Vue.set(state.customTexts[customText.prd_id], customText.index, customText.text)
        let text_count = 0
        state.customTexts[customText.prd_id].forEach((text:Record<any, any>, index:number) =>{
          if ('add_type' in state.customTexts[customText.prd_id][index]){
            text_count++
            Vue.set(state.customTexts[customText.prd_id][index],'added_count', text_count)
          }
        })
      }
    },
    customLogo(state: Record<any, any>, customlogo: Record<any, any>) {
      if(customlogo){
        if(!state.customLogos[customlogo.prd_id]) {
          Vue.set(state.customLogos, customlogo.prd_id, [])
        }
        Vue.set(state.customLogos[customlogo.prd_id], customlogo.index, customlogo.logo)
      }
    },
    customTextAttribute(state: Record<any, any>, customTextAttribute: Record<any, any>) {
      const text_item = state.customTexts[state.selectedPrdId][customTextAttribute.index]
      if (text_item){
        Vue.set(text_item, customTextAttribute.attribute, customTextAttribute.value)
      }
      // @ts-ignore
      const selectedProduct = this.getters.getSelectedProduct;
      const settings = selectedProduct['productnames'][customTextAttribute.index]
      if(settings && settings.text_follows_product){
        const ids = settings.following_product_ids
        if(ids.length){
          ids.forEach((new_item:number)=>{
            if (state.customTexts[new_item]) {
              const item = state.customTexts[new_item][customTextAttribute.index]
              if (item)
                Vue.set(item, customTextAttribute.attribute, customTextAttribute.value)
            }
          })
        }
      }
    },
    CUSTOM_TEXT_WITHOUT_TRIGGER(state: Record<any, any>, customTextsAttribute: Record<any, any>) {
      if(customTextsAttribute){
        if(Object.keys(customTextsAttribute.data).length && state.customTexts[state.selectedPrdId] && state.customTexts[state.selectedPrdId][customTextsAttribute.index]) {
          const product_id = customTextsAttribute.product_id? customTextsAttribute.product_id : state.selectedPrdId
          Object.keys(customTextsAttribute.data).forEach((key: string) => {
            if(state.customTexts[product_id][customTextsAttribute.index]) {
              const obj: Record<any, any> = {}
              obj[key] = customTextsAttribute.data[key]
              Object.assign(state.customTexts[product_id][customTextsAttribute.index], obj)
            }
          })
        }
      }
    },
    REMOVE_CUSTOMIZATION_TEXT_ELEMENT(state:Record<any, any>, payload:Record<any, any>){
      if (payload.product_id){
        Vue.set(state.customTexts[payload.product_id], payload.index, {})
          let count = 0
          state.customTexts[payload.product_id].forEach((text:Record<any, any>, ind:number)=>{
            if ('add_type' in text){
              count++
              Vue.set(state.customTexts[payload.product_id][ind], 'added_count', count)
            }
          })
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
       if(isEmpty(groupColors)){
          state.groupColors = {}
        }else{
          state.groupColors = groupColors
        }

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
        const index = color.index
        delete color.index
        color = {...state.svgGroups[index], ...color}
        Vue.set(state.svgGroups, index, color)
      }
    },
    updateAllRoster(state: Record<any, any>, rosterDetail: [Record<any, any>]){
      state.rosterDetails = rosterDetail
    },
    rosterDetailAttribute(state: Record<any, any>, rosterDetailAttribute: Record<any, any>) {
      if(state.rosterDetails[state.selectedPrdId].length > 0) {
        Vue.set(state.rosterDetails[state.selectedPrdId][rosterDetailAttribute.index], rosterDetailAttribute.attribute, rosterDetailAttribute.value)
      } else {
        const roster_detail_default_obj: Record<any, any> = getRosterDetailDefaultObject();
        state.rosterDetails[state.selectedPrdId].push(roster_detail_default_obj)
      }
    },
    rosterDetailAttributeWithoutTrigger(state: Record<any, any>, rosterDetailAttribute: Record<any, any>) {
      if(state.rosterDetails[state.selectedPrdId].length > 0) {
        state.rosterDetails[state.selectedPrdId][rosterDetailAttribute.index][rosterDetailAttribute.attribute] = rosterDetailAttribute.value
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
    OVERRIDE_LOGOS(state: Record<any, any>, payload) {
      const locker_logos = JSON.parse(payload.custom_logos)
      const products = state.products
      products.forEach((product: Record<any, any>) => {
        if(product.id == payload.product_id) {
          Vue.set(state.customLogos, product.id, locker_logos)
        }
        else {
          const logo_setting = getLogoSettings(0,false, product.id)
          const final_logo = {...locker_logos[0], ...logo_setting}
          delete final_logo.scaleX
          delete final_logo.scaleY
          Vue.set(state.customLogos, product.id,[final_logo])
        }
      })
    },
    OVERRIDE_PRODUCT_CUSTOM_TEXT(state:Record<any, any>, payload) {
     Vue.set(state.product_custom_texts, state.selectedPrdId, payload)
    },
    OVERRIDE_DEFAULT_COLOR(state:Record<any, any>, payload){
      state.defaultColors = payload;
    },
    OVERRIDE_GROUP_COLORS(state:Record<any, any>, payload){
      if(isEmpty(payload)){
        state.groupColors = {};
      }else{
        state.groupColors = payload;
      }

    },
    REMOVE_ROSTER(state:Record<any, any>, payload:number){
      state.rosterDetails[state.selectedPrdId].splice(payload, 1);
    },
    UPDATE_ROSTER(state:Record<any, any>, payload:Record<any, any>){
      if (payload){
        state.rosterDetails[state.selectedPrdId] = payload;
      }
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
      if (payload){
        payload = payload.map((item: Record<any, any>) => {
          if(typeof (item.color_text)  == "string"){
            item.color_text = JSON.parse(item.color_text)
          }
          return item
        })
      }
      state.lockerColors = payload
    },
    ACTION_BEFORE_LOGIN(state: Record<any, any>, action: string){
      state.actionBeforeLogin = action
      if(action) {
        localStorage.setItem('actionBeforeLogin', action)
      } else {
        localStorage.removeItem('actionBeforeLogin')
      }
    },
    SET_COLLECTIONS (state: Record<any, any>, collections: Record<any, any>) {
        state.collections = collections

    },
    async RESET_STORE(state: Record<any, any>){
      state.customized = true
      state.personalized = false
      state.private_product = false
      state.undoItems = []
      state.redoItems = []
      state.edit_locker_product = []
      //state.customTexts.map((item:Record<any, any>) => item.text = '' );
      state.defaultColors = [{title: 'Color One', color: null, pantone: null, name: null}, {title: 'Color Two', color: null, pantone: null, name: null}, {title: 'Color Three', color: null, pantone: null, name: null}, {title: 'Color Four', color: null, pantone: null, name: null}];
      state.groupColors = {};
      state.using_logo_colors = false;
      state.logoEditor = {
        id:0,
        image:"",
        originalImage:"",
        remove_background:'',
        color:'',
        flood_fill:false
      }

      state.editProduct = {
        editProductId: 0,
        editStyleId: 0,
        editDesignId: 0,
        mainProductId: 0,
        editStatus: false
      }

      state.editCart = {
        cartId: 0,
        cartItemId: ''
      }

      state.products_rosters = {}

      state.selectedIndex = 0;
      state.styleIndex = 0 ;
    },
    RESET_CUSTOM_TEXTS: (state: Record<any, any>) => {
      state.product_custom_texts = {}
      setRetrievedProductsCustomTexts(state.products, true)
    },
    RESET_CUSTOM_LOGOS: async (state: Record<any, any>) => {
      state.logoTabIndex = 0;
      state.customLogoObjects = [];
      state.customLogos = {};
      await initCustomLogosNew(state.products)
    },
    RESET_ALL_COLORS: (state: Record<any, any>) => {
      state.defaultColors =  [{title: 'Color One', color: null, pantone: null, name: null}, {title: 'Color Two', color: null, pantone: null, name: null}, {title: 'Color Three', color: null, pantone: null, name: null}, {title: 'Color Four', color: null, pantone: null, name: null}]
     // state.groupColors = {}
      //state.svgGroups = []
    },
    UPDATE_UNDO:(state:Record<any, any>, payload:Record<any, any>)=>{
      state.undoItems.push(payload)
    },
    UPDATE_REDO:(state, payload) => state.redoItems.push(payload),
    RESET_UNDO:(state) => state.undoItems = [],
    RESET_REDO:(state) => state.redoItems = [],
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
          if(isEmpty(lastUndo.data)){
            state.groupColors = {};
          }else{
            state.groupColors = lastUndo.data
          }

        } else if (lastUndo.action == 'customTexts') {
          state.redoItems.push({ data: JSON.parse(JSON.stringify(state.customTexts)), action: 'customTexts'})
          state.customTexts = lastUndo.data
        }
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
          if(isEmpty(lastUndo.data)){
            state.groupColors = {};
          }else{
            state.groupColors = lastUndo.data
          }

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
    SET_ACTIVE_TAB(state:Record<any, any>, payload){
      state.activeTab = payload
    },
    SET_SUFFLE(state:Record<any, any>, payload) {
      state.showShuffle = payload
    },
    UPDATE_USING_COLOR_LOGOS(state:Record<any, any>, payload: boolean){
      state.using_logo_colors = payload
    },
    SET_CANVAS_READY(state:Record<any, any>, payload: boolean){
      state.canvas_ready = payload
    },
    STORE_CANVAS_IMAGE(state:Record<any, any>, payload){
      state.canvasImage.ref_front = payload.scene.$refs.front
      state.canvasImage.ref_back = payload.scene.$refs.back
      state.canvasImage.scene = payload.scene
    },
    UPDATE_CUSTOM_LOGO_OBJECTS(state:Record<any, any>, payload){
      if(Object.prototype.hasOwnProperty.call(payload, "index")) {
        state.customLogoObjects[payload.index] = payload.data
      } else {
        state.customLogoObjects.push(payload.data)
      }
      state.canvasImage.scene = payload.scene
    },
    SET_HIDE_SAVE_LOCKER_BUTTON(state:Record<any, any>, payload){
      state.hideSaveLockerButton = payload
    },
    SET_REVERT_ROSTER_BOOL(state:Record<any, any>, payload){
      state.revertRosterBool = payload;
    },
    SET_PRODUCT_EDIT_INFO_OBJECT(state:Record<any, any>, payload) {
      // const updated_product_info_obj: Record<any, any> = {}
      // for(const [edit_info_obj_key, edit_info_obj_value] of Object.entries(state.product_edit_info_object)) {
      //   if(payload[edit_info_obj_key]) {
      //     updated_product_info_obj[edit_info_obj_key] =  edit_info_obj_value
      //   } else {
      //     updated_product_info_obj[edit_info_obj_key] =  null
      //   }
      // }

      // const updated_payload: Record<any, any> = {};
      // for(const [payload_key, payload_value] of Object.entries(payload)) {
      //   updated_payload[payload_key] = payload_value
      // }
      // state.product_edit_info_object = Object.assign({}, state.product_edit_info_object, updated_payload);
      state.product_edit_info_object = payload;
    },
    SET_LAST_ACTIVE_PRODUCT_DATA(state:Record<any, any>, payload)
    {
      const updated_payload: Record<any, any> = {};
      /*
      * As product custom texts value is being passed by reference so whenever there is change in product_custom_text then that change will be
      * reflected in state.last_active_product_data.product_custom_texts
      * */
      // if('product_custom_textsddddd' in payload) {
      //   state.last_active_product_data.product_custom_texts = {...state.last_active_product_data.product_custom_texts, ...payload.product_custom_texts}
      // }
      // else {
        for (const [payload_key, payload_value] of Object.entries(payload)) {
          /*
          * As product custom texts value is being passed by reference so whenever there is change in product_custom_text then that change will be
          * reflected in state.last_active_product_data.product_custom_texts
          * */
          if(payload_key == 'product_custom_texts') {
            updated_payload[payload_key] = {...state.last_active_product_data.product_custom_texts, ...payload.product_custom_texts}
          } else {
            updated_payload[payload_key] = payload_value
          }
        }
        state.last_active_product_data = Object.assign({}, state.last_active_product_data, updated_payload);
      // }
    },
    RESET_LAST_ACTIVE_DATA(state: Record<any, any>)
    {
      state.last_active_product_data = lastActiveProductDefaultObject()
    },
    SET_EDITING_ROSTER_PLAYER_INDEX(state:Record<any, any>, payload){
      state.editing_roster_player_index = payload;
    },
    SET_PRODUCT_CUSTOM_TEXTS(state:Record<any, any>, payload) {
      if(payload.append) {
        //in case of append payload contains the custom texts of all retrieved products. It will contain arrays custom texts of all products
        const products_custom_texts = payload.value;
        products_custom_texts.forEach((product_custom_texts: Record<any, any>[]) => {
          const product_id = product_custom_texts && product_custom_texts.length > 0 ? product_custom_texts[0].product_id : null;
          if(product_id) {
            Vue.set(state.product_custom_texts, product_id, product_custom_texts)
          }
        })
        return false;
      }
      /*
       * By default we consider active product id to change custom text.If user wants to update custom text other than
       *  selected product then we get that product id
     * */
      const product_id: number = payload.product_id ? payload.product_id : state.selectedPrdId;
      if("index" in payload) {
        /*
        * This if condition checks it the custom text exists in given index or not. If not then we push custom text.
        * This is usually case when user manually add custom text by clicking add new text button
        * */
        if(state.product_custom_texts[product_id][payload.index] == undefined) {
          state.product_custom_texts[product_id].push(payload.value)
          return false
        }
        else {
          /*
          * the index type should be one of "product", "product_text". if index_type = "product" then it means we want to update all custom texts of specific product.
          * if index_type = "product_text" then it means we want to update product specific custom_text of product
          * */
          const index_type: string = payload.index_type ? payload.index_type : 'product_text';
          //if index_type = "product" then we will update all custom texts of product
          if(index_type == "product") {
            Vue.set(state.product_custom_texts, product_id, payload.value)
          }
          else {
            let product_custom_text = state.product_custom_texts[product_id][payload.index];
            product_custom_text = {...product_custom_text, ...payload.value}
            Vue.set(state.product_custom_texts[product_id], payload.index, product_custom_text)
          }
        }
      } else {
        Vue.set(state.product_custom_texts, product_id, payload.value)
      }
    },
    REMOVE_CUSTOM_TEXT(state: Record<any, any>, payload) {
      state.product_custom_texts[state.selectedPrdId].splice(payload, 1)
    },
    SET_PRODUCTS_NEXT_PAGE_NO(state:Record<any, any>, payload){
      state.products_next_page_no = payload;
    },
    SET_PRODUCTS_ROSTERS(state:Record<any, any>, payload: Record<any, any>){
      if(payload && 'product_id' in payload) {
        if('roster_index' in payload) {
          let product_roster_item = state.products_rosters[payload.product_id][payload.roster_index];
          product_roster_item = Object.assign(product_roster_item, payload.roster_data)
          Vue.set(state.products_rosters[payload.product_id], payload.roster_index, product_roster_item)
        } else {
          Vue.set(state.products_rosters, payload.product_id, payload.roster_data)
        }
      } else {
        const products_rosters: Record<any, any> = {}
        if(state.products.length > 0) {
          const last_products_rosters = state.last_active_product_data.products_rosters
          const default_roster_item = rosterDefaultItem()
          state.products.forEach((product: Record<any, any>) => {
            if(last_products_rosters && last_products_rosters[product.id]) {
              products_rosters[product.id] = last_products_rosters[product.id]
            } else {
              const product_first_size_name = product.sizes.length > 0 ? product.sizes[0].json_data[0].name : '';
              const roster_item = Object.assign(default_roster_item, {size: product_first_size_name,  code: product_first_size_name})
              products_rosters[product.id] = [roster_item]
            }
          })
          state.products_rosters = products_rosters;
        } else {
          console.info("No products found. So can't set products roster information")
        }
      }
    },
    REMOVE_ROSTER_ITEM(state:Record<any, any>, payload: number) {
      state.products_rosters[state.selectedPrdId].splice(payload, 1)
    },
    SET_SHOW_LOADER(state:Record<any,any>,payload){
      state.showLoader = payload;
    },
    SET_ACTIVE_ROSTER_INDEX(state:Record<any,any>,index){
      state.active_roster_index = index;
    },
    SET_LOGO_COLORS_INFO(state:Record<any,any>, payload: Record<any, any>) {
      const default_colors_object = getDefaultColorsObject()
      if('reset' in payload) {
        state.logo_colors_info = logoColorInfoDefaultObject()
        state.defaultColors = default_colors_object
      }
      else {
        if('colors' in payload.data) {
          /*
          * sometimes hex property is missing so we add that property if it's not. Like in case of locker edit product
          * defaultColors property does not have hex property
          * */
          payload.data.colors.forEach(color => {
            color.hex = color.hex ? color.hex : color.color
          })
        }
        state.logo_colors_info = {...state.logo_colors_info, ...payload.data}
      }
    },
    SET_DEFAULT_COLORS(state: Record<any, any>, payload: Record<any, any>) {
      state.defaultColors = payload
    }
  },
  getters: {
    selectedProductCustomTexts: state => (custom_text_index = -1) =>  {
      /*
      * if custom_item_index is given then object will be return else array of objects will be return
      * */
      if(custom_text_index != -1)
        return state.product_custom_texts[state.selectedPrdId][custom_text_index]
      return state.product_custom_texts[state.selectedPrdId]
    },
    //this is parameterized getter that's why in vue devtool it will always return function. Also it will not be cached instead it will always executed when we use getter
    productCustomTexts: state => (product_id = "all") =>  {
      if(product_id == "all") {
        return state.product_custom_texts;
      } else {
        return state.product_custom_texts[product_id];
      }
    },
    getSearchLoader: state => {
      return state.searchLoader
    },
    getIsShareDesign: state => {
      return state.isShareDesign
    },
    getActiveLockerProduct: state => {
      return state.activeLockerProduct
    },
    getEditLockerProduct: state => {
      return state.editLockerProduct
    },
    // getEditCart: state => {
    //   return state.editCart
    // },
    getNotifications: state => {
      return state.notifications
    },
    getCanvasReady: state => {
      return state.canvas_ready
    },
    getCanvasImage: state => {
      return state.canvasImage
    },
    getShuffle: state => {
      return state.showShuffle
    },
    getActiveTab: state => {
      return state.activeTab
    },
    getLockerActiveTabIndex: state => {
      return state.lockerActiveTabIndex
    },
    getRemoveBackgroundRadio: state => {
      return state.logoEditor.remove_background
    },
    getLogoEditor: state => {
      return state.logoEditor
    },
    getBackgroundCheck: state => {
      return state.backgroundCheck
    },
    getColorCheck: state => {
      return state.colorCheck
    },
    getShowColorsLogoEditor: state => {
      return state.showColorsLogoEditor
    },
    getLockerTabsIndex: state => {

      return state.lockerTabsIndex
    },
    getColorsFromRecent: state => {
      return state.colorsFromRecent
    },
    getRecentLogos: state => {
      return state.recentLogos
    },
    getSelectionMode: state => {
      return state.selectionMode
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
    getEditProductName: state => {
      return state.editProduct.productName
    },
    getHideColorSection: state => {
      return state.hideColorSection
    },
    getProduct: (state) => (product_id:number = state.selectedPrdId) => {
      return state.products.find((product: Record<any, any>) => product.id == product_id)
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
    getSelectedProductId: (state: any) => state.selectedPrdId,
    getCategories: state => {
      return state.categories
    },
    getSelectedCategories: state => {
      return state.selectedCategories
    },
    /*
    * product_id could be number or string. If product_id = 'all' it will return all products logos and return type will be object.
    * If it's number then it will return custom logos against product id and return type will be array
    * @return [Object | array]
    * */
    getCustomLogos: state => (product_id = state.selectedPrdId, logo_index = -1) => {
      product_id = product_id == null ? state.selectedPrdId : product_id
      if(product_id == 'all')
        return state.customLogos
      if(logo_index >= 0)
        return state.customLogos[product_id][logo_index]
      return state.customLogos[product_id]
    },
    koivna: state => {
      return state.customLogos[state.selectedPrdId]
    },
    getCustomLogoObject: state => {
    return state.customLogos
    },
    getCustomTextObject: state => {
      return state.customTexts
    },
    getActiveLogoIndex: (state: any) => state.logoTabIndex,
    getCurrentStyleIndex: state => {
      return state.styleIndex
    },
    getSelectedDesignId: state => {
      return state.selectedDesignId
    },
    getCustomTexts: state => (for_all_products= false, product_id = state.selectedPrdId) => {
      if(for_all_products)
        return state.product_custom_texts
      return state.product_custom_texts[product_id] ? state.product_custom_texts[product_id] : []
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
    getRosterDetails: state => (prd_id = state.selectedPrdId) => {
      if(!state.rosterDetails[prd_id]) {
        return []
      }
      return state.rosterDetails[prd_id]
    },
    getProductRosters: state => (product_id = state.selectedPrdId, roster_index = -1) => {
      if(product_id == null)
        product_id = state.selectedPrdId
      if(product_id == 'all')
        return state.products_rosters
      if(roster_index >= 0)
        return state.products_rosters[product_id][roster_index]
      return state.products_rosters[product_id]
    },
    getAllRosterDetails: state  => {
      return state.rosterDetails
    },
    getProductionSVGs: state => {
      return state.productionSVGs
    },
    getLockerColors: state => {
      return state.lockerColors
    },
    getActionBeforeLogin: state => {
      if(state.actionBeforeLogin) {
        return state.actionBeforeLogin
      }
      return localStorage.getItem('actionBeforeLogin')
    },
    getUndoItems:(state)=> state.undoItems,
    getRedoItems:(state)=> state.redoItems,

    getCustomized: state => {
      return state.customized
    },
    getPersonalized: state => {
      return state.personalized
    },
    getPrivateProduct: state => {
      return state.private_product;
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
    },
    getUsingColorLogos(state:Record<any, any>){
      return state.using_logo_colors
    },
    customLogoObjects(state:Record<any, any>){
      return state.customLogoObjects
    },
    getStockCount(state:Record<any,any>){
      return state.stock_count;
    },
    getPrivateProductCount(state:Record<any,any>){
      return state.private_product_count;
    },
    getHideSaveLockerButton(state:Record<any,any>){
      return state.hideSaveLockerButton;
    },
    getRevertRosterBool(state:Record<any,any>){
      return state.revertRosterBool;
    },
    getProductEditInfoObject(state:Record<any,any>){
      return state.product_edit_info_object;
    },
    getLastActiveProductData(state:Record<any,any>){
      return state.last_active_product_data;
    },
    getEditingRosterPlayerIndex(state:Record<any,any>){
      return state.editing_roster_player_index;
    },
    getProductsNextPageNo(state:Record<any,any>) {
      return state.products_next_page_no;
    },
    getShowLoader(state:Record<any,any>){
      return state.showLoader;
    },
    getActiveRosterIndex(state:Record<any,any>){
      return state.active_roster_index;
    },
    getLogoColorsInfo: state => (info_for: string|null = null) => {
      if(info_for)
        return state.logo_colors_info[info_for]
      return state.logo_colors_info
    }
  },
  actions: {
    setSearchLoader({commit}, payload){
      commit('SET_SEARCH_LOADER', payload)
    },
    setActiveTab({commit}, payload){
      commit('SET_ACTIVE_TAB', payload)
    },
    setSelectedIndex({commit}, payload) {
      commit('SET_SELECTED', payload)
    },
    async editLogo({commit}, payload) {
      commit('EDIT_LOGO', {key:payload.key,value:payload.value})
    },
    async unsetLogoEditor({commit}, payload) {
      commit('UNSET_LOGO_EDITOR', {})
    },
    setCustomObj({commit},payload) {
      commit('SET_CUSTOM_OBJ',payload)
    },
    setTeamLogoUrl({commit},payload) {
      commit('SET_TEAM_LOGO_URL',payload)
    },
    setProductType({commit}, payload) {
      commit('SET_PRODUCT_TYPE', payload)
    },
    setPrivateProduct({commit},payload){
      commit('SET_PRIVATE_PRODUCT',payload);
    },
    async setCategories({commit}, payload){
      let url = '/product/categories'
      if(payload && 'query_params' in payload) {
        url += `?${payload.query_params}`
      }
      const response = await http.get(url).catch((e: any) => {
        console.error('error while getting categories',e)
      });
      if(response) {
        await commit('categories', response.data)
      }

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
    toggleLogoCheck({commit}, payload){
      commit('TOGGLE_LOGO_CHECK', payload)
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
    setStockCount({commit},payload){
      commit('SET_STOCK_COUNT',payload);
    },
    setPrivateProductCount({commit},payload){
      commit('SET_PRIVATE_PRODUCT_COUNT',payload);
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
    async setSelectedProductCustomLogo({commit},payload){
      await commit('SET_SELECTED_PRODUCT_CUSTOM_LOGO',payload);
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
    async OVERRIDE_PRODUCT_CUSTOM_TEXT({commit}, payload:Record<any, any>){
     await commit('OVERRIDE_PRODUCT_CUSTOM_TEXT', payload);
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
      commit('RESET_CUSTOM_TEXTS')
      commit('RESET_CUSTOM_LOGOS')
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
      return await http.post('updatelockerproduct', payload).then((res) => {
        if (res.status == 201){
          return res
        }else if (res.status == 404){
          alert(res.data.message)
        }
      }).catch(err => {
        if(err.response.status){
          return err.response.data.message
          // commit('CHANGE_EDIT_STATUS', {status : false, id: 0, designId: 0, styleId: 0})
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
      let resp =  {status:false,message:"", collection:{}};
      await http.post('collection', payload).then((res) => {
        if (res.status == 201){
          resp = {status:true,message:"Collection added successfully", collection: res.data.data};
        }else if (res.status == 404){
          resp = {status:false,message:"Collection not added", collection: {}};
        }
      }).catch(err => {
        if(err.response.status){
          resp = {status:false,message:err.response.data.errors, collection: {}};
        }
      })

      return resp;

    },
    async updateNewCollection({commit},payload:Record<any, any>){
      let resp =  {status:false,message:""};
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
    },
    async copyProductDesign({commit}, payload){
     return  await http.post('duplicateProduct', payload).then((res) => {
        if (res.status == 201){
          commit('ADD_PRODUCT_TO_LOCKER', {room_id : payload.room_id, data: res.data.data})
          return res;
        }
      }).catch(err => {
       console.log(err.response)
        return err.response.data.message
      })
    },
    async regenerateRosterLink({commit}, payload){
      return await http.post('regenerate/link', payload).then((res) => {
        if (res.status == 201){
          return res.data
        }
      }).catch(err => {
        console.log(err)
      })
    },
    async getNotifications({commit}){
      try {
        await http.get('customer/notifications').then((res) => {
          commit('SET_NOTIFICATIONS', res.data.data)
        })
      }
      catch (e:any) {
        commit('SET_NOTIFICATIONS', [])
      }

    },
    readNotification({commit}, id){
     return  http.post('read/notification', {id:id}).then((res) => {
        if(res.status == 200){
          const payload = {
            id: id,
            date: res.data.data
          }
          commit('UPDATE_NOTIFICATION', payload)
        }
        return res
      })
    },
    setRevertRosterBOOL({commit},payload){
      commit('SET_REVERT_ROSTER_BOOL',payload);
    },
    converturlToBase64({commit},payload){
      return new Promise(function(resolve, reject) {
        http.post("convert-url-to-base64", payload).then((res) => {
          if (res.status == 200){
            resolve(res);
          }
          else{
            reject(res);
          }
        }).catch((errors)=>{
          reject(errors);
        });
      });
    },
    setLastActiveProductData({commit}, payload) {
      commit('SET_LAST_ACTIVE_PRODUCT_DATA', payload)

    },
    setProductsRosters({commit}, payload) {
      commit('SET_PRODUCTS_ROSTERS', payload)
    },
    setShowLoader({commit},payload){
      commit("SET_SHOW_LOADER",payload);
    },
    setActiveRosterIndex({commit},index){
      commit("SET_ACTIVE_ROSTER_INDEX",index);
    }
  }
}
export default ProductAttributes;

