import {http} from "@/httpCommon";
import { Module } from "vuex";
import {Vue} from "vue-property-decorator";
import get = Reflect.get;
import {getRosterDetailDefaultObject, setCustomLogo} from "../../helpers/Helpers";

import {
  fontsColorsManipulation, fontsList,
  getLogoObject,
  getLogoSettings,
  setLogoSettings,
  sortTextsArray,
  getProductLogoSetting
} from "../../helpers/Helpers"
import {log} from "fabric/fabric-impl";
import {getClosestColor} from "@/pantoneColor";
import product from "@/store/modules/product";
const ProductAttributes:Module<any, any> = {
  state: {
    stock_count:0,
    searchLoader: false,
    lockerActiveTabIndex:0,
    lockerTabsIndex:0,
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
      id:0,
      base64:"",
      originalBase64:"",
      remove_background:'',
      color:'',
      flood_fill:false

    },
    editLockerProduct: [],
    canvas_ready: false,
    notifications:[],
    customTextObjects:[],
    customLogoObjects:[],
    cartItemId:'',
    editCart: {
      cartId: 0,
      cartItemId: ''
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
    UPDATE_NOTIFICATIONS(state:Record<any, any>, payload){
      if (payload){
        state.notifications.unshift(payload)
      }
    },

    Change_Locker_Active_Tab(state:Record<any, any>, payload) {
      state.lockerActiveTabIndex = payload
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
    SET_EDIT_CART(state: Record<any, any>, payload: Record<any, any>){
      Vue.set(state.editCart,payload.key,payload.value)
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
    SET_SELECTED_PRODUCT_CUSTOM_LOGO(state: Record<any, any>,payload:any) {
      if(state.products[state.selectedIndex]) {
        state.products[state.selectedIndex].customLogos = payload;
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
      if(customLogo && customLogo.custom_logo){
        const newCustomLogo = customLogo.custom_logo
        if('logoIndex' in newCustomLogo && newCustomLogo.logoIndex != null) {
          Vue.set(state.customLogos[state.selectedPrdId], newCustomLogo.logoIndex, {...newCustomLogo})
          state.products.forEach(async (item:Record<any, any>) => {
            if ('adding_tab' in newCustomLogo && newCustomLogo.adding_tab){
              if (item.logos_follows_product && item.id != state.selectedPrdId){
                if (state.customLogos[item.id][newCustomLogo.logoIndex]){
                  newCustomLogo.adding_tab = true
                  newCustomLogo.logoIndex = state.customLogos[item.id].length
                }
                const logo_settings = getProductLogoSetting(item.id, newCustomLogo.logoIndex)
                if (logo_settings) {
                  Vue.set(state.customLogos[item.id], newCustomLogo.logoIndex, {...logo_settings})
                }
              }
            }
            else{
              if (item.logos_follows_product && item.id != state.selectedPrdId){
                console.log("inddex", newCustomLogo.logoIndex)
                await setCustomLogo(customLogo.customObj, newCustomLogo.logoIndex, item.id)
              }
            }
          })
        } else {
          console.log("not in logo index")
          Vue.set(state.customLogos[state.selectedPrdId], state.customLogos[state.selectedPrdId].length, customLogo.custom_logo)
        }
      }
    },
    SET_RECENT_LOGOS(state: Record<any, any>,payload = []) {
      if(payload.length > 0) {
        state.recentLogos = []
        state.recentLogos = payload
      }
      else {
        http.get('logos/recent').then((res) => {
          state.recentLogos = []
          state.recentLogos = res.data.data
        }).catch((e) => {
          console.log('e',e)
        })
      }

    },
    customLogoAttribute(state: Record<any, any>, customLogoAttribute: Record<any, any>) {
      if(customLogoAttribute){
        Vue.set(state.customLogos[state.selectedPrdId][customLogoAttribute.index], customLogoAttribute.attribute, customLogoAttribute.value)
        // if (for_all_products){
          state.products.forEach((item:Record<any, any>) => {
            if (item.logos_follows_product && item.id != state.selectedPrdId){
              state.customLogos[item.id][customLogoAttribute.index][customLogoAttribute.attribute] = customLogoAttribute.value
            }
          })
        // }
      }
    },
    UPDATE_LOGO_ATTRIBUTE_FOR_EACH_PRODUCT(state:Record<any, any>, payload:Record<any, any>){
      if (payload.logo){
        const customLogoAttribute = payload.logo
        if (state.customLogos[payload.id][customLogoAttribute.index])
          Vue.set(state.customLogos[payload.id][customLogoAttribute.index], customLogoAttribute.attribute, customLogoAttribute.value)
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
        state.customLogos[state.selectedPrdId].forEach((custom_logo:any, clIdx:any) => {
          Vue.set(state.customLogos[state.selectedPrdId][clIdx], "logoIndex", clIdx)
        })
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
     // if(logo.is_transparent===true){
     //    logo_url = transparent_logo;
     //  }else{
     //    logo_url = original_logo;
     //  }
     // Vue.set(state.customLogos[payload.index], 'url', logo_url )

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

        Vue.set(state.logoEditor,'base64',state.logoEditor.originalBase64)
        Vue.set(state.logoEditor,'remove_background','')

      }
      else if(payload.type == 'color') {
        if(payload.val) {
          state.colorCheck = true
          //state.backgroundCheck = false
        }
        else {
          state.colorCheck = false
          Vue.set(state.logoEditor,'base64',state.logoEditor.originalBase64)
        }
      }
    },
    EDIT_LOGO(state: Record<any, any>, payload:any) {
      Vue.set(state.logoEditor,payload.key,payload.value)
    },
    UNSET_LOGO_EDITOR(state: Record<any, any>, payload:any) {
      Vue.set(state.logoEditor,'remove_background','')
      state.backgroundCheck = false
      state.colorCheck = true
    },
    CHANGE_STYLE_INDEX(state:  Record<any, any>, payload:number){
      state.styleIndex = payload;
    },
    SET_CUSTOM_OBJ(state:  Record<any, any>,prd_id:number){
      const arr = []
      const default_setting = setLogoSettings(0)
      const prod_logo_setting = getLogoSettings(0,false,prd_id)
      const logo_setting = {...default_setting,...prod_logo_setting}
      arr.push(logo_setting)
      Vue.set(state.customLogos,prd_id,arr)

      //set team logo url of new product
      const custom_obj = JSON.parse(JSON.stringify(state.customLogos))


      for (const prop in custom_obj) {
        const any_logo = custom_obj[prop][0];
        if(any_logo && any_logo.url) {
          logo_setting.original_logo = any_logo.original_logo
          logo_setting.transparent_logo = any_logo.transparent_logo
          logo_setting.smart_transparent_logo = any_logo.smart_transparent_logo
          logo_setting.is_smart_transparent = false
          logo_setting.is_transparent = false
          logo_setting.url = any_logo.url
          Vue.set(state.customLogos[prop],0, logo_setting)
          break;
        }
      }
    },
    SET_TEAM_LOGO_URL(state:  Record<any, any>,logo:any){
      const custom_obj = JSON.parse(JSON.stringify(state.customLogos))
      Object.keys(custom_obj).map(function(key, index) {
        let logo_ = custom_obj[key][0];
        logo_ = {...logo_, ...logo}
        Vue.set(state.customLogos[key],0, logo_)
      });
    },
    async customTexts(state: Record<any, any>, customText: Record<any, any>) {
      if ('follow' in customText){
        if(customText){
          Vue.set(state.customTexts[customText.prd_id], customText.index, {...customText.text})
          state.products.forEach((item:Record<any, any>, prd_index:number) => {
            if (item.text_follows_product && item.id != customText.prd_id){
              Vue.set(state.customTexts[item.id], state.customTexts[item.id].length, {...customText.text})
            }
            var text_count = 0
           state.customTexts[item.id].forEach((text:Record<any, any>, index:number) =>{
              if ('add_type' in state.customTexts[item.id][index]){
                text_count++
                Vue.set(state.customTexts[item.id][index],'added_count', text_count)
              }
            })
          })
        }
      }else{
        if(!state.customTexts[customText.prd_id]) {
          Vue.set(state.customTexts, customText.prd_id, [])
        }
        Vue.set(state.customTexts[customText.prd_id], customText.index, customText.text)
      }
    },
    customTextAttribute(state: Record<any, any>, customTextAttribute: Record<any, any>) {
      if (state.customTexts[state.selectedPrdId][customTextAttribute.index])
        Vue.set(state.customTexts[state.selectedPrdId][customTextAttribute.index], customTextAttribute.attribute, customTextAttribute.value)
      state.products.forEach((item:Record<any, any>) => {
        if (item.id != state.selectedPrdId && item.text_follows_product){
          if(state.customTexts[item.id][customTextAttribute.index])
            Vue.set(state.customTexts[item.id][customTextAttribute.index], customTextAttribute.attribute, customTextAttribute.value)
        }
      })
    },
    CUSTOM_TEXT_WITHOUT_TRIGGER(state: Record<any, any>, customTextsAttribute: Record<any, any>) {
      if(customTextsAttribute){
        if(Object.keys(customTextsAttribute.data).length && state.customTexts[state.selectedPrdId] && state.customTexts[state.selectedPrdId][customTextsAttribute.index]) {
          const product_id = customTextsAttribute.product_id? customTextsAttribute.product_id : state.selectedPrdId
          Object.keys(customTextsAttribute.data).forEach((key: string) => {
            state.customTexts[product_id][customTextsAttribute.index][key] = customTextsAttribute.data[key]
          })
        }
      }
    },
    REMOVE_CUSTOMIZATION_TEXT_ELEMENT(state:Record<any, any>, payload:Record<any, any>){
      if (payload.product_id){
        Vue.set(state.customTexts[payload.product_id], payload.index, {})
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
      if(state.rosterDetails.length > 0) {
        Vue.set(state.rosterDetails[rosterDetailAttribute.index], rosterDetailAttribute.attribute, rosterDetailAttribute.value)
      } else {
        const roster_detail_default_obj: Record<any, any> = getRosterDetailDefaultObject();
        const selected_product = state.products[state.selectedIndex];
        const product_sizes = selected_product.sizes;
        if(product_sizes.length > 0) {
          roster_detail_default_obj.size = product_sizes[0].name;
          roster_detail_default_obj.code = product_sizes[0].code;
        }
        state.rosterDetails.push(roster_detail_default_obj)
      }
    },
    rosterDetailAttributeWithoutTrigger(state: Record<any, any>, rosterDetailAttribute: Record<any, any>) {
      if(state.rosterDetails.length > 0) {
        state.rosterDetails[rosterDetailAttribute.index][rosterDetailAttribute.attribute] = rosterDetailAttribute.value
      }
    },
    productionSVGs(state: Record<any, any>, productionSvg: Record<any, any>) {
      if(productionSvg){
        state.productionSVGs = productionSvg
      } else {
        const roster_detail_default_obj: Record<any, any> = getRosterDetailDefaultObject();
        const selected_product = state.products[state.selectedIndex];
        const product_sizes = selected_product.sizes;
        if(product_sizes.length > 0) {
          roster_detail_default_obj.size = product_sizes[0].name;
          roster_detail_default_obj.code = product_sizes[0].code;
        }
        Object.assign(state.rosterDetails[0], roster_detail_default_obj);
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
      const locker_logos = JSON.parse(payload.custom_logos)
      Object.keys(state.customLogos).map(function(key:any, index:any) {
        if(key == payload.product_id) {
          Vue.set(state.customLogos,key,locker_logos)
        }
        else {
          const logo_setting = getLogoSettings(0,false,key)
          const final_logo = {...locker_logos[0],...logo_setting}
          Vue.set(state.customLogos,key,[final_logo])
        }
      });
    },
    OVERRIDE_TEXT(state:Record<any, any>, payload){
      state.customTexts = {};
      const locker_texts = JSON.parse(payload.text)
      state.products.forEach((product: Record<any, any>) => {
        if(!state.customTexts[product.id]) {
          Vue.set(state.customTexts, product.id, [])
        }
        const obj = fontsColorsManipulation(product)
        //calculate colors pantone on init
        let fill_color_pantone = obj.firstColor.name;
        const pantone = getClosestColor(obj.firstColor.value);
        if(pantone && pantone.pantone && pantone.pantone != 'undefined'){
          fill_color_pantone = pantone.pantone;
        }
        let outLine_color_pantone = obj.secondColor.name;
        const opantone = getClosestColor(obj.secondColor.value);
        if(opantone && opantone.pantone && opantone.pantone != 'undefined'){
          outLine_color_pantone = opantone.pantone;
        }
        if(parseInt(product.id) == parseInt(payload.product_id)) {
          const productTextsArr = JSON.parse(JSON.stringify(product.productnames))
          locker_texts.forEach( (lockerText: Record<any, any>, lockerTextIndex: number) => {
            Vue.set(state.customTexts[product.id], lockerTextIndex, lockerText)
            productTextsArr.shift()
          })
          if(productTextsArr.length > 0) {
            let maxIndex = locker_texts.length - 1
            productTextsArr.forEach(async (productText: Record<any, any>, productTextIndex: number) => {
              maxIndex = maxIndex + 1
              const text = {
                text: '',
                type: productText.type,
                width: productText.width,
                height: productText.height,
                x_axis: productText.x_axis,
                y_axis: productText.y_axis,
                rotation: productText.rotation,
                haveControls: Boolean(!productText.is_locked),
                outlineEnabled: Boolean(productText.outline_enabled),
                side: productText.side,
                fontFamily: fontsList(product)[0].value,
                fillColor: obj.firstColor.value,
                fillColorPantone: fill_color_pantone,
                outLineColor: obj.secondColor.value,
                outLineColorPantone: outLine_color_pantone,
                outLineWidth: 0,
                selectColor: false
              }
              Vue.set(state.customTexts[product.id], maxIndex, text)
            })
          }
        }
        else {
          product.productnames.forEach(async (productName: Record<any, any>, index: number) => {
            const locker_text_str = locker_texts[index] ? locker_texts[index]['text'] : ''
            const text = {
              text: locker_text_str,
              type: productName.type,
              width: productName.width,
              height: productName.height,
              x_axis: productName.x_axis,
              y_axis: productName.y_axis,
              rotation: productName.rotation,
              haveControls: Boolean(!productName.is_locked),
              outlineEnabled: Boolean(productName.outline_enabled),
              side: productName.side,
              fontFamily: fontsList(product)[0].value,
              fillColor: obj.firstColor.value,
              fillColorPantone: fill_color_pantone,
              outLineColor: obj.secondColor.value,
              outLineColorPantone: outLine_color_pantone,
              outLineWidth: 0,
              selectColor: false
            }
            Vue.set(state.customTexts[product.id], index, text)
          })
        }
      })
    },
    OVERRIDE_DEFAULT_COLOR(state:Record<any, any>, payload){
      state.defaultColors = payload;
    },
    OVERRIDE_GROUP_COLORS(state:Record<any, any>, payload){
      state.groupColors = payload;
    },
    REMOVE_ROSTER(state:Record<any, any>, payload:number){
      state.rosterDetails.splice(payload, 1);
    },
    UPDATE_ROSTER(state:Record<any, any>, payload:Record<any, any>){
      if (payload){
        state.rosterDetails = payload;
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
    RESET_STORE(state: Record<any, any>){
      state.undoItems = []
      state.redoItems = []
      state.edit_locker_product = []
      state.customLogos = {};
      //state.customTexts.map((item:Record<any, any>) => item.text = '' );
      state.defaultColors = [{title: 'Color One', color: null, pantone: null, name: null}, {title: 'Color Two', color: null, pantone: null, name: null}, {title: 'Color Three', color: null, pantone: null, name: null}, {title: 'Color Four', color: null, pantone: null, name: null}];
      state.groupColors = {};
      state.using_logo_colors = false;
      state.logoEditor = {
        id:0,
        base64:"",
        originalBase64:"",
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

      state.rosterDetails = []

      const selectedProduct = state.products[state.selectedIndex];
      if (selectedProduct && selectedProduct.is_logo_allowed == 1) {
        let arr:any = []
        state.products.forEach(async (product:any) => {
          const default_setting = setLogoSettings(0)
          const prod_logo_setting = getLogoSettings(0,false,product.id)
          const logo_setting = {...default_setting,...prod_logo_setting}
           arr.push(logo_setting)
          //arr.push(getLogoSettings(0,false,product.id))
          Vue.set(state.customLogos,product.id,arr)
          // Object.assign(state.customLogos,product.id)
          // state.customLogos[product.id] = arr
          arr = []
        })

        //state.customLogos.push(setLogoSettings(0));
        state.logoTabIndex = 0;
        state.customTextObjects = [];
        state.customLogoObjects = [];
      }

      //rest custom texts
      state.customTexts = {}
      state.products.forEach((product:any) => {
        if(!state.customTexts[product.id]) {
          Vue.set(state.customTexts, product.id, [])
        }
        product.productnames =  sortTextsArray(product.productnames);

        product.productnames.forEach(async (productName: Record<any, any>, index: number) => {
          const obj = fontsColorsManipulation(product)

          //calculate colors pantone on init
          let fill_color_pantone = obj.firstColor.name;
          const pantone = getClosestColor(obj.firstColor.value);
          if(pantone && pantone.pantone && pantone.pantone != 'undefined'){
            fill_color_pantone = pantone.pantone;
          }

          let outLine_color_pantone = obj.secondColor.name;
          const opantone = getClosestColor(obj.secondColor.value);
          if(opantone && opantone.pantone && opantone.pantone != 'undefined'){
            outLine_color_pantone = opantone.pantone;
          }
          let textIndex = index
          if(state.customTexts[product.id] && state.customTexts[product.id][index]) {
            textIndex = state.customTexts[product.id][index].textIndex
          }
          const text = {
            text: '',
            type: productName.type,
            width: productName.width,
            height: productName.height,
            x_axis: productName.x_axis,
            y_axis: productName.y_axis,
            rotation: productName.rotation,
            haveControls: Boolean(!productName.is_locked),
            outlineEnabled: Boolean(productName.outline_enabled),
            side: productName.side,
            fontFamily: fontsList(product)[0].value,
            fillColor: obj.firstColor.value,
            fillColorPantone: fill_color_pantone,
            outLineColor: obj.secondColor.value,
            outLineColorPantone: outLine_color_pantone,
            outLineWidth: 0,
            textIndex: textIndex,
            selectColor: false
            }
          Vue.set(state.customTexts[product.id], index, text)
        })
      })
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
    UPDATE_CUSTOM_TEXT_OBJECTS(state:Record<any, any>, payload){
      if(Object.prototype.hasOwnProperty.call(payload, "index")) {
        state.customTextObjects[payload.index] = payload.data
      } else {
        state.customTextObjects.push(payload.data)
      }
    },
    UPDATE_CUSTOM_LOGO_OBJECTS(state:Record<any, any>, payload){
      if(Object.prototype.hasOwnProperty.call(payload, "index")) {
        state.customLogoObjects[payload.index] = payload.data
      } else {
        state.customLogoObjects.push(payload.data)
      }
      state.canvasImage.scene = payload.scene
    }
  },
  getters: {
    getSearchLoader: state => {
      return state.searchLoader
    },
    getEditLockerProduct: state => {
      return state.editLockerProduct
    },
    getEditCart: state => {
      return state.editCart
    },
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
    getSelectedProductId: (state: any) => state.selectedPrdId,
    getCategories: state => {
      return state.categories
    },

    getCustomLogos: state => (prd_id = state.selectedPrdId) => {
      if(!state.customLogos[prd_id]) {
        return []
      }
      return state.customLogos[prd_id]
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
    // getCustomTexts: state => {
    //   return state.customTexts
    // },

    getCustomTexts: state => (prd_id = state.selectedPrdId, for_all_products= false) => {
      if(for_all_products)
        return state.customTexts
      if(!state.customTexts[prd_id]) {
        return []
      }
      return state.customTexts[prd_id]
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
    customTextObjects(state:Record<any, any>){
      return state.customTextObjects
    },
    customLogoObjects(state:Record<any, any>){
      return state.customLogoObjects
    },
    getStockCount(state:Record<any,any>){
      return state.stock_count;
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
    setEditCart({commit}, payload) {
      commit('SET_EDIT_CART', payload)
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
  }
}
export default ProductAttributes;

