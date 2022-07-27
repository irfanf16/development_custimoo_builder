import Store from '../store'
import rgbHex from "rgb-hex";
import {getClosestColor} from "@/pantoneColor";
import {default as $} from "jquery";
import Axios, {AxiosError} from "axios";
import Vue from "vue";
// @ts-ignore
import VsToast from '@vuesimple/vs-toast';
import {http} from "@/httpCommon";

const getLogoSettingsObject = () => {
  return {
    id: null,
    product_id: null,
    product_style_id: null,
    rotation: 0,
    width: 57,
    height: 57,
    name_of_placement: "chest",
    side: "front",
    x_axis: 300,
    y_axis: 300,
    is_locked: false
  }
}

const getRandom = (length = 5, type = 'number') => {
  let rand_string: number | string = "";
  if (type === 'number') {
    let max_number: number | string = "9";
    for (let i = 1; i < length; i++) {
      max_number = max_number + "9";
    }
    max_number = parseInt(max_number);
    rand_string = Math.floor(max_number + (Math.random() * max_number));
  } else if (type === 'string') {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    for (let i = 0; i < length; i++) {
      rand_string += chars.charAt(Math.floor(Math.random() * chars.length))
    }
  } else {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
      rand_string += chars.charAt(Math.floor(Math.random() * chars.length))
    }
  }
  return rand_string;
}

const getLogoObject = (index = 0) => {
  const logo_settings_object = getLogoSettingsObject();
  return {
    id: null,
    url: null,
    width: logo_settings_object.width,
    height: logo_settings_object.height,
    x_axis: logo_settings_object.x_axis,
    y_axis: logo_settings_object.y_axis,
    rotation: logo_settings_object.rotation,
    haveControls: !logo_settings_object.is_locked,
    side: "front",
    customLogo: true,
    is_transparent: false,
    original_logo: null,
    transparent_logo: null,
    originalWidth: logo_settings_object.width,
    originalHeight: logo_settings_object.height,
    logoIndex:index
  }
}


/*
* Index = -1 means we are getting all settings rather that getting settings at specific index.When index is given then the return type will be object or null. Otherwise return type will be array. That could be empty
* */

const getLogoSettings = (index = -1, default_obj = true,product_id = 0) => {

  //get logo settings based on product id
  if(product_id > 0) {
    const product = Store.getters.getProducts.find((prd:any) => {
      return prd.id == product_id
    })
    return product && product.logos_setting[index] ? product.logos_setting[index] : {}
  }
  const logo_settings = Store.getters.getSelectedProduct ? Store.getters.getSelectedProduct.logos_setting : [];
  if (logo_settings.length > 0) {
    if (index < 0) {
      return logo_settings;
    } else {
      return index in logo_settings ? logo_settings[index] : default_obj ? getLogoSettingsObject() : null;
    }
  } else {
    if (default_obj) {
      return index == -1 ? [getLogoSettingsObject()] : getLogoSettingsObject();
    } else {
      return index == -1 ? [] : null;
    }
  }
}

const setLogoSettings = (logo_index: number, logo: Record<any, any> | null = null ) => {
  if(logo == null) {
    logo = getLogoObject();
  }
  const logo_settings = getLogoSettings(logo_index, true);
  logo.width =  logo_settings.width;
  logo.height =  logo_settings.height;
  logo.x_axis =  logo_settings.x_axis;
  logo.y_axis =  logo_settings.y_axis;
  logo.side = logo_settings.side;
  logo.rotation =  logo_settings.rotation;
  logo.haveControls =  !logo_settings.is_locked;
  logo.originalWidth =  logo_settings.width;
  logo.originalHeight =  logo_settings.height;
  logo.logoIndex =  logo_index;
  return logo;
}

const getProductLogoSetting = (prd_id:number, index:number) => {
  let logo : Record<any, any> ={}
  const logo_settings = getLogoSettings(index, false, prd_id);
  if (Object.keys(logo_settings).length){
    logo.id = null;
    logo.url = null;
    logo.width =  logo_settings.width;
    logo.height =  logo_settings.height;
    logo.x_axis =  logo_settings.x_axis;
    logo.y_axis =  logo_settings.y_axis;
    logo.rotation =  logo_settings.rotation;
    logo.haveControls =  !logo_settings.is_locked;
    logo.originalWidth =  logo_settings.width;
    logo.originalHeight =  logo_settings.height;
    logo.logoIndex =  index;
    logo.side = logo_settings.side
  }else{
    logo = getLogoObject(index)
  }
  return logo;
}

const getCustomLogos = (default_obj = true, sync_with_store = true) => {
  const custom_logos = Store.getters.getCustomLogos();
  if(custom_logos.length <= 0 && default_obj) {
    const logo = setLogoSettings(0, getLogoObject())
    if(sync_with_store) {
      logo["logoIndex"] =  0
      Store.commit('customLogos', logo)
    }
    return [logo];
  } else {
    return custom_logos;
  }
}

const fileToBase64 =  (file: any) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = function() {
      resolve(reader.result);
    }
    reader.readAsDataURL(file);
  });

}

const processColorsCustom = (colors: []) => {
  const imageColors: any[] = []
  const uniqueColors: string[] = []
  colors.forEach((color: number[]) => {
    const hex = rgbHex(color[0], color[1], color[2])
    if ((!uniqueColors.includes(hex))) {
      uniqueColors.push(hex)
    }
  })
  const deletedCount = uniqueColors.length - 4
  uniqueColors.splice(4, deletedCount)
  const selectProductPantonesList = getSelectedProductPantones()
  uniqueColors.forEach((color: string) => {
    const pantoneColor = getClosestColor(color, selectProductPantonesList);
    //const pantoneColor = getClosestColor(color);
    imageColors.push({hex: pantoneColor.hex, pantone: pantoneColor.pantone, name: pantoneColor.name})
  })
  return imageColors;

}

const getSelectedProductPantones = (product_id: null|number = null) => {
  const productPantones: Record<any, any>[] = []
  let selectedProduct = Store.getters.getSelectedProduct;
  if(product_id){
    const search_product = getProductById(product_id);
    if(search_product)
      selectedProduct = search_product;
  }

    selectedProduct.colors.forEach((product_colors: any, key: number) => {
    if(key == 0){
      const colors = JSON.parse(product_colors.json_data)
      colors.forEach((color: any) => {
        //let pantone = color.name
        let pantone = ''
        if(color.pantone){
          pantone = color.pantone
        }
        productPantones.push({pantone : pantone, name: color.name, hex: color.value});
      })
    }
  })
  return productPantones;
}

const getProductById = (product_id: number) => {
  const products = Store.getters.getProducts;
  const selected_product = products.find((product: Record<any, any>) => product.id == product_id)
   return selected_product
}


const sortTextsArray = (product_names: any) => {
  return product_names.sort((a:any,b:any)=> (a.type > b.type ? 1 : -1));

}

const  fontsColorsManipulation = (selectedProduct:any) => {

  let fontsColors:any = []
  let  firstColor:any = ''
  let  secondColor:any = ''

  selectedProduct.namecolors.forEach((colors: any, key: number) => {
    const finalColor = {color_text: []}
    finalColor.color_text = JSON.parse(colors.json_data)
    fontsColors = fontsColors.concat(finalColor)
  })
  if (fontsColors.length) {
    firstColor = fontsColors[0].color_text[0]
    secondColor = fontsColors[0].color_text? fontsColors[0].color_text[1] : fontsColors[0].color_text[0]
  }

  return {firstColor,secondColor}
}


 const fontsList = (product:any) :any=> {
  const productFonts = product.namefonts;
  const fontOptions:any = [];

   if (productFonts.length){
     const item = JSON.parse(productFonts[0].json_data)
     if(item) {
       item.forEach((fonts: any, key: number) => {
         let fontNameParam = fonts.path.split('/').reverse()
         fontNameParam = fontNameParam[0].split('.')
         const fontName = fontNameParam[0].replace('-', ' ').toUpperCase()
         const font = {
           value: fontNameParam[0] as string,
           text: fontName as string,
           url:`${process.env.VUE_APP_STORAGE_URL}${fonts.path}`,
         }
         fontOptions.push(font)
       })
     }
   }
   return fontOptions
}

const getReminderOptions = () => {

  const optionArray = [];
  optionArray[0] = {value: null, text: 'Choose an option'}
  optionArray[1] = {value: 1440, text: '1 day before'}
  optionArray[2] = {value: 4320, text: '3 days before'}
  optionArray[3] = {value: 10080, text: '7 days before'}
  optionArray[4] = {value: 43200, text: '1 month before'}
  return optionArray;
}

const  setCustomLogo  = async (logo:Record<any, any>, logoIndex:number, prd_id = 0):Promise<void> => {
  const customTabIndex = logoIndex
  const custom_logos = Store.getters.getCustomLogos()
  let logo_url = '';
  const transparent_logo =  logo.transparent_logo_url;
  const smart_transparent_logo = logo.smart_transparent_logo_url;
  const original_logo = logo.logo_url;
  const is_transparent = false;
  logo_url = original_logo;
  const payload = [{
    index: customTabIndex,
    attribute: 'url',
    value: logo_url
  },{
    index: customTabIndex,
    attribute: 'id',
    value: logo.id
  },{
    index: customTabIndex,
    attribute: 'is_transparent',
    value: false
  },
    {
      index: customTabIndex,
      attribute: 'original_logo',
      value: original_logo
    },
    {
      index: customTabIndex,
      attribute: 'transparent_logo',
      value: transparent_logo
    },
    {
      index: customTabIndex,
      attribute: 'smart_transparent_logo',
      value: smart_transparent_logo
    },
    {
      index: customTabIndex,
      attribute: 'is_smart_transparent',
      value: false
    },
    {
      index: customTabIndex,
      attribute: 'original_logo_url',
      value: logo.original_logo_url
    },

  ];
  let getLogos = []
  if (custom_logos.length > 1){
    getLogos = custom_logos.slice(0, -1)
  }else{
    getLogos = custom_logos
  }
  Store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(Store.getters.getCustomLogoObject)), action: 'customLogos' })
  // Store.commit('SET_COLORS_FROM_RECENT',true)
  payload.forEach(async (data) => {
    if (prd_id){
      const new_data = {
        logo: data,
        id:prd_id
      }
      await Store.commit('UPDATE_LOGO_ATTRIBUTE_FOR_EACH_PRODUCT', new_data)
    }else{
      await Store.dispatch('updateCustomLogoAttribute', data)
    }
  })
  if(customTabIndex == 0) {
    //update team logo url in all product logos
    const logo_:any = {}
    logo_.original_logo = original_logo
    logo_.transparent_logo = transparent_logo
    logo_.smart_transparent_logo = smart_transparent_logo
    logo_.is_smart_transparent = false
    logo_.is_transparent = false
    logo_.url = logo_url
    logo_.id = logo.id;
    const payload = {
      customObj : logo_,
    }
    await Store.dispatch('setTeamLogoUrl', payload)
  }
  if(!logo.logo_colors) {
    Store.dispatch("SET_LOGO_COLORS", []);
  }
  else {
    if(customTabIndex == 0) {
      if(logo.logo_colors != null) {
        const image_colors = processColorsCustom(JSON.parse(logo.logo_colors))
        let image_color_count = image_colors.length;
        while(image_color_count < 4 ) {
          image_colors.push({hex: null, pantone: null, name: null});
          ++image_color_count;
        }
        Store.dispatch("SET_LOGO_COLORS", image_colors);
        Store.dispatch("initialLogoColors", JSON.stringify(image_colors));
        Store.commit("UPDATE_USING_COLOR_LOGOS", false);
      }
    }
  }
}

const handleResponseException = (errorResponse: AxiosError | TypeError) => {
  let message = null
  if("isAxiosError" in errorResponse) {
    // errorResponse.response.data object have keys { exception, file, line, message, trace }
    message = errorResponse.response?.data?.message;
    console.error("Error (Axios): ", message)
  } else {
    message = errorResponse.message;
    console.error(`Error (${errorResponse.name}): `, {
      name: errorResponse.name,
      message: errorResponse.message,
      stack: errorResponse.stack
    })
  }
  VsToast.show({
    title: message,
    variant: 'info',
    timeout: 5000
  });
}

const logData = (data: any) => {
  console.info("data logged", data)
}

const CustimooOrderFlowStatuses : Record<any, any> = {
  submitted_for_factory_review: 'Submitted for Factory Review',
  factory_approved: 'Factory Approved',
  factory_rejected: 'Factory Rejected',
  submitted_for_customer_review: 'Submitted for Customer Review',
  customer_approved: 'Customer Approved',
  customer_rejected: 'Customer Rejected',
  in_production: 'In Production',
  shipped: 'Shipped',
  completed: 'Completed',
};

const pathInfo = (file_path: string, ) => {
  const pathArray = file_path.split("/");
  const lastIndex = pathArray.length - 1;
  const name = pathArray[lastIndex];
  const extension = name.substring(name.lastIndexOf(".") + 1);
  return {
    name: name, extension: extension
  };
}

const getActiveProductData = () => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const scene_ref = Store.getters.getCanvasImage.scene
      if (!(scene_ref && scene_ref.mounted)) {
        console.log('not reslove')
        return
      }

      const getCanvasImage = Store.getters.getCanvasImage

      const style_index = Store.getters.getCurrentStyleIndex;
      const selected_product = Store.getters.getSelectedProduct;
      const product_style = selected_product.productstyles[style_index];
      const lockerEditStatus = Store.getters.getEditStatus;
      let product_name = selected_product.product_name
      //selected_design will always return array having single object
      const selected_design = product_style.productdesigns.filter((design: Record<any, any>) => design.design_show == 1)[0];

      let design_name = selected_design.design_name;
      if(lockerEditStatus){
        const lockerEditProductName = Store.getters.getEditProductName;
        if(lockerEditProductName)
          design_name = lockerEditProductName
      }
      product_name = `${product_name} - ${design_name}`;
      const product_models = Store.getters.getProductModels;
      const selected_model_index = Store.getters.getSelectedModelIndex;
      scene_ref.frontCanvas.discardActiveObject().renderAll()
      scene_ref.backCanvas.discardActiveObject().renderAll()
      const post_data: Record<any, any> = {
        back_image: getCanvasImage.ref_back?.toDataURL("image/png"),
        custom_logos: Store.getters.getCustomLogos(),
        measurement_ratio: selected_product.measurement_ratio,
        custom_logo_svgs: [],
        custom_texts: Store.getters.getCustomTexts(),
        custom_text_svgs: [],
        colors: Store.getters.getLogosColors,
        design_id: selected_design.id,
        defaultcolors: Store.getters.getDefaultColors,
        front_image: getCanvasImage.ref_front.toDataURL("image/png"),
        groupcolors: Store.getters.getGroupColors,
        logo_colors: Store.getters.getLogosColors,
        model_id: product_models[selected_model_index].id,
        product_id: selected_product.product_id,
        ecommerce_post_id: selected_product.ecommerce_product_id,
        sync_id: selected_product.sync_id,
        product_type: selected_product.product_type,
        product_name: product_name,
        pdf_file: null,
        production_url: selected_design.production_design?.file_url ? (`${process.env.VUE_APP_STORAGE_URL}${selected_design.production_design.file_url}.svg` ?? null) : null,
        // front_design:front_design,
        roster_detail: Store.getters.getRosterDetails(),
        style_id: product_style.id,
        svg_groups: Store.getters.getSvgGroups,
        ecommerce_cart_id:null
      }
      if(scene_ref.customTextObjects) {
        for (const custom_text_object of scene_ref.customTextObjects) {
          if (custom_text_object && Object.keys(custom_text_object).length > 3) { // logic here is if it is fabric object the it must contain several keys so > 2 is ok
            post_data.custom_text_svgs.push(custom_text_object.toSVG());
          }
        }
      }
      if(scene_ref.customLogoObjects) {
        for (const custom_logo_svg of scene_ref.customLogoObjects) {
          if(custom_logo_svg && Object.keys(custom_logo_svg).length > 3) { // logic here is if it is fabric object the it must contain several keys so > 2 is ok
            post_data.custom_logo_svgs.push(custom_logo_svg);
          }
        }
      }

      clearInterval(interval)
      resolve(post_data)
    }, 500)
  })
}

const initCustomTexts = (retrieved_products: Record<any, any>) => {
  retrieved_products.forEach((product:any) => {
    const custom_texts = Store.getters.getCustomTexts(product.id)
    if(!custom_texts || !(custom_texts && custom_texts.length)) {
      product.productnames.forEach(async (productName: Record<any, any>, index: number) => {
        const obj = fontsColorsManipulation(product)
        //calculate colors pantone on init
        let fill_color_pantone = obj.firstColor.name;

        const selectProductPantonesList = getSelectedProductPantones(product.id)

        const pantone = getClosestColor(obj.firstColor.value, selectProductPantonesList);
        if (pantone && pantone.pantone && pantone.pantone != 'undefined') {
          fill_color_pantone = pantone.pantone;
        }
        let outLine_color_pantone = obj.secondColor.name;
        const opantone = getClosestColor(obj.secondColor.value, selectProductPantonesList);
        if (opantone && opantone.pantone && opantone.pantone != 'undefined') {
          outLine_color_pantone = opantone.pantone;
        }

        const text = {
          text: '',
          type: productName.type,
          width: productName.width,
          height: productName.height,
          x_axis: productName.x_axis,
          y_axis: productName.y_axis,
          rotation: productName.rotation,
          name_of_placement: productName.name_of_placement,
          haveControls: Boolean(!productName.is_locked),
          outlineEnabled: Boolean(productName.outline_enabled),
          side: productName.side,
          fontFamily: fontsList(product)[0].value,
          fillColor: obj.firstColor.value,
          fillColorPantone: fill_color_pantone,
          outLineColor: obj.secondColor.value,
          outLineColorPantone: outLine_color_pantone,
          outLineWidth: 0,
          textIndex: index,
          selectColor: false
        }
        await Store.dispatch('setCustomTexts', {index: index, text: text, prd_id: product.id})
      })
    }
  });
}

const initCustomLogos = (retrieved_products: Record<any, any>) => {
  retrieved_products.forEach((product: Record<any, any>) => {
    if(product.is_logo_allowed) {
      const custom_logos = Store.getters.getCustomLogos(product.id)
      if (!custom_logos || !(custom_logos && custom_logos.length)) {
        if(product.logos_setting.length) {
          const logoSetting = product.logos_setting[0]
          const logo = {
            id: null,
            product_id: null,
            product_style_id: null,
            url: '',
            width: logoSetting.width,
            height: logoSetting.height,
            x_axis: logoSetting.x_axis,
            y_axis: logoSetting.y_axis,
            rotation: logoSetting.rotation as number,
            haveControls: Boolean(!logoSetting.is_locked),
            side: logoSetting.side,
            customLogo: true,
            is_locked: logoSetting.is_locker,
          }
          Store.commit('customLogo', {index: 0, logo: logo, prd_id: product.id})
        } else { // if logo is allowed but there is no setting for logo in product the add default logo object to show team logo
          const logo = getLogoSettingsObject()
          Store.commit('customLogo', {index: 0, logo: logo, prd_id: product.id})
        }
      }
    }
  })
}

const rosterDetailsInit = (retrieved_products: Record<any, any>) => {
  retrieved_products.forEach((product: Record<any, any>) => {
    if(!Store.getters.getAllRosterDetails[product.id]) {
      const payload = getRosterDetailDefaultObject(product)
      console.log('first time roster init')
      Store.dispatch('setRosterDetails', { pid : product.id, index: 0, roster: payload })
    }
  })
}

const getRosterDetailDefaultObject = (product = Store.getters.getSelectedProduct) => {
  if (product.sizes.length){
    const productSizes = JSON.parse(product.sizes[0].json_data)
    return {
      text: '',
      number: '',
      size_index: 0,
      size: productSizes[0].name,
      code: productSizes[0].name,
      quantity: 1,
      information: ''
    }
  }
  return {}
}

const activityStatus = {
  submitted_for_factory_review: {
    title: "Artwork Created",
    message: "Waiting for manufacturer review artwork.",
  },
  factory_approved: {
    title: "Artwork Approved",
    message: "Artwork has been approved by the manufacturer. The manufacturer will now produce a sample and upload it here.",
  },
  factory_rejected: {
    title: "Artwork Rejected",
    message: "Artwork rejected by manufacturer. Please read comments and edit product accordingly.",
  },
  submitted_for_customer_review: {
    title: "Design Sample Submitted",
    message: "Manufacturer has submitted these samples. Please review carefully and take action.",
  },
  customer_approved: {
    title: "Design Sample Approved",
    message: "You have approved samples.",
  },
  customer_rejected: {
    title: "Design Sample Rejected",
    message: "You have rejected the sample. Please wait for new samples from the manufacturer.",
  },
  in_production: {
    title: "In Production",
    message: "The manufacturer has begun creating the products.",
  },
  shipped: {
    title: "Order Shipped",
    message: "The manufacturer has shipped your products.",
  },
  completed: {
    title: "Order Completed",
    message: "You order has completed successfully.",
  },
}

const urlToBase64 =  (url:string) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      if(xhr.status == 200) {
        const reader = new FileReader();
        reader.onloadend = function() {
          resolve(reader.result);
        }
        reader.readAsDataURL(xhr.response);
      } else {
        reject(`Error (status = ${xhr.status}, status text = ${xhr.statusText}) while getting file from url ${xhr.responseURL}`);
      }
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  });
}

const getFileExtensionType = (type: string, file_extension:string) => {
  const extensions: Record<any, any> = {
    raster: ['jpg', 'jpeg', 'png'],
    vector: ['svg', 'ai', 'eps']
  }
  const type_extensions = extensions[type];
  if (file_extension) {
    const extension_index = file_extension.lastIndexOf(".");
    if (extension_index > 0) {
      file_extension = file_extension.substring(extension_index + 1)
    }
    return type_extensions.includes(file_extension);
  }
  return type_extensions;
}
const getUploadedLogoObject = async (res:Record<any, any>) => {
  return{
    original_logo : res.logo_url,
    transparent_logo : res.transparent_logo_url,
    smart_transparent_logo : res.smart_transparent_logo_url,
    is_smart_transparent : false,
    is_transparent: false,
    url : res.logo_url,
    id : res.id
  }
}

const getCompany = async () => {
  const res = await http.get('company').catch(error => {
    handleResponseException(error)
    console.info("error while getting company", error)
  })
  if (res && res.status == 200){
    Store.dispatch("companyAction", res.data.company)
  } else {
    Store.dispatch("companyAction", null)
  }
}

const getPermissions = async () => {
  const res = await http.get('customer/permissions').catch(error => {
    Store.commit('SET_CUSTOMER_PERMISSIONS', [])
    handleResponseException(error)
  })
  if (res && res.status == 200) {
    Store.commit('SET_CUSTOMER_PERMISSIONS', res.data)
    return res.data;
  } else {
    Store.commit('SET_CUSTOMER_PERMISSIONS', [])
    return [];
  }
}

const getEditModeDefaultObjFor = (type:string, for_all_edit_modes= false) => {
  if(for_all_edit_modes) {
    return { editing: false, type: null,
      filters: { customized: true, personalized: false, search_products: '' },
      locker_product_info: { product_id: null, locker_product_id: null, style_id: null, design_id: null },
      cart_product_info: { cart_item_index: null, cart_item_id: null, cart_item_product_index: null, cart_item_product: null },
      order_product_info: { order_item_id:  null, activity_id: null, order_products: null}
    }
  }
  let response_obj = null;
  switch (type) {
    case "filters":
      response_obj = { customized: true, personalized: false, search_products: '' }
      break;
    case "locker_product":
      response_obj = { product_id: null, locker_product_id: null, style_id: null, design_id: null }
      break;
    case "cart_product":
      response_obj = { cart_item_index: null, cart_item_id: null, cart_item_product_index: null, cart_item_product: null }
      break;
    case "order_product":
      response_obj = { order_item_id:  null, activity_id: null, order_products: null}
    break;
    default:
      console.error(`Error while getting edit mode default object. Expecting value (filters, locker_product, cart_product, order_product) while (${type}) is given `)
  }
  return response_obj;
}

//Functions related to SVG parsing start

let svg_pattern_last_value_y = 0;
const INCH_TO_CENTIMETER = 2.54;
let logo_pattern_last_value_y = 0 ;

const fetchUrlContent = async (url:string) => {
  if(url) {
    const fetch_content = await fetch(url);
    const url_content   = await fetch_content.text();
    return url_content;
  } else {
    return "";
  }
}

const getDocFromString = async (doc_string: string, type:DOMParserSupportedType ="image/svg+xml") => {
  const parser = new DOMParser();
  return  parser.parseFromString(doc_string, type);
}
const serializer = (svg_doc: SVGTextElement | Document) => {
  return new Promise((resolve) => {
    const xml = new XMLSerializer()
    const xml_string = xml.serializeToString(svg_doc)
    resolve(xml_string)
  })
}

const parseFactoryProduct = async (factory_product : Record<any, any>) => {
  const default_svg_object = {
    svg : null,
    placement : null,
    width : null,
    height : null,
    scaleX : null,
    scaleY : null,
    rotation:null,
    original_height: null,
  };
  const empty_text = getDocFromString(`<g style="transform: rotate(0deg)"></g>`);

  for (let index = 0; index < factory_product.roster_detail.length; index++) {
    const detail = factory_product.roster_detail[index]
    if(detail) {
      if(Object.prototype.hasOwnProperty.call(detail,'svgs')){
        if(Object.prototype.hasOwnProperty.call(detail.svgs,'name') && detail.svgs.name.svg){
          const group_name_svg = await getDocFromString(detail.svgs.name.svg);
          const svg_name_text = group_name_svg.querySelector('text');
          if(svg_name_text){
            svg_name_text?.setAttribute('font-size',`${detail.svgs.name.original_height}cm`);
          }
          const tspan_name = svg_name_text? svg_name_text.querySelector('tspan') : null;
          if(tspan_name){
            tspan_name.setAttribute('x','0');
            tspan_name.setAttribute('y','0');
          }
          detail.svgs.name.text_svg = svg_name_text? await serializer(svg_name_text) : await serializer(empty_text);
        }
        else{
          const svg_object : Record<any,any> = {};
          svg_object['name'] = default_svg_object;
          if(Object.prototype.hasOwnProperty.call(detail.svgs,'number')){
            svg_object['number'] = detail.svgs.number;
          }
          else{
            svg_object['number'] = default_svg_object;
          }
          detail.svgs = svg_object;
          detail.svgs.name.text_svg = await serializer(empty_text);
        }
        if(Object.prototype.hasOwnProperty.call(detail.svgs,'number') && detail.svgs.number.svg){
          const group_number_svg = await getDocFromString(detail.svgs.number.svg);
          const svg_number_text = group_number_svg.querySelector('text');
          if(svg_number_text){
            svg_number_text?.setAttribute('font-size',`${detail.svgs.number.original_height}cm`);
          }
          const tspan_number = svg_number_text?svg_number_text?.querySelector('tspan') : null;
          if(tspan_number){
            tspan_number?.setAttribute('x','0');
            tspan_number?.setAttribute('y','0');
          }
          detail.svgs.number.text_svg = svg_number_text? await serializer(svg_number_text) : await serializer(empty_text);
        }
        else{
          const svg_object : Record<any,any> = {};
          svg_object['number'] = default_svg_object;
          if(Object.prototype.hasOwnProperty.call(detail.svgs,'name')){
            svg_object['name'] = detail.svgs.name;
          }
          else{
            svg_object['name'] = default_svg_object;
          }
          svg_object['name'] = detail.svgs.name;
          detail.svgs = svg_object;
          detail.svgs.number.text_svg = await serializer(empty_text);
        }
        Object.assign(factory_product.roster_detail[index], detail)
      }
      else {
        const svg_object: Record<any, any> = {};
        svg_object['name'] = default_svg_object;
        svg_object['number'] = default_svg_object;
        detail.svgs = svg_object;
        Object.assign(factory_product.roster_detail[index], detail)
      }
    }
  }
  return factory_product;
}

const applyColorToSVG = (factory_product:Record<any,any>, svg_doc:Record<any,any>) => {
  factory_product.svg_groups.forEach((svg_group_item:Record<any,any>) => {
    $(svg_doc).find(`[id][fill]`).each  (function(doc_item) {
      let doc_elem_id = $(this).attr("id");
      if(doc_elem_id) {
        doc_elem_id = doc_elem_id.search("_") >= 0 ? doc_elem_id.substring(0, doc_elem_id.search("_")) : doc_elem_id
        if(doc_elem_id.toLowerCase() == svg_group_item.id.toLowerCase()) {
          $(this).attr("fill", svg_group_item.color);
        }
      }
    })
  })
}

const generateFontFile = (font_file:Record<any,any>[]) => {
  const font_style = document.createElementNS("http://www.w3.org/2000/svg","style");
  for(const font of font_file){
    font_style.innerHTML += ` @font-face{ font-family: ${font.text}; src: url('${font.url}');  }`;
  }
  return font_style;
}

const getGroupImageTag = (factory_product:Record<any,any>,production_file_info:Record<any,any>,image_side:string) => {
  const group_image_tag = document.createElementNS("http://www.w3.org/2000/svg","g");
  group_image_tag.setAttribute('transform',`matrix(1 0 0 1 ${parseFloat(production_file_info.width)} ${(image_side === 'front_image')? ((parseFloat(production_file_info.width)/2) + 500) : 0 })`);
  const back_image = document.createElementNS("http://www.w3.org/2000/svg","image");
  back_image.setAttribute('xlink:href',`${factory_product[image_side]}`);
  back_image.setAttribute('height',`${(parseFloat(production_file_info.height)/2)}px`);
  back_image.setAttribute('width',`${(parseFloat(production_file_info.height)/2)}px`);
  group_image_tag.appendChild(back_image);
  return group_image_tag;
}

const getSVGPattern = (values:Record<any,any>,measurement_ratio:number) => {
  return `
                <g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 0 ${5000})" style="font-weight: bold;">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">Name </tspan>
                    </text>
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="${1000}" y="0">Number </tspan>
                    </text>
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="${2000}" y="0">Size </tspan>
                    </text>
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="${3000}" y="0">Name Height </tspan>
                    </text>
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="${4000}" y="0">Number Height </tspan>
                    </text>
                </g>
        ${values.map((value:Record<any,any>,index:number) => {
    return `
                <g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 0 ${5000})">
                ${Object.prototype.hasOwnProperty.call(value,'svgs')?
      `<g transform="matrix(1 0 0 1 0 ${500 + index * 1000})">
                      <g style="transform: rotate(${value.svgs.name.rotation?value.svgs.name.rotation : '0'}deg)">${value.svgs.name.text_svg}</g>
                   </g>`
      :
      `<g transform="matrix(1 0 0 1 0 ${500 + index * 1000})">
                      <g style="transform: rotate(0deg)"></g>
                   </g>`
    }
                ${Object.prototype.hasOwnProperty.call(value, 'svgs') ?
      `<g transform="matrix(1 0 0 1 1000 ${500 + index * 1000})" >
                        <g style="transform: rotate(${value.svgs.number.rotation ? value.svgs.number.rotation : '0'}deg)">${value.svgs.number.text_svg}</g>
                    </g>`
      :
      `<g transform="matrix(1 0 0 1 1000 ${500 + index * 1000})">
                      <g style="transform: rotate(0deg)"></g>
                   </g>`
    }
                ${Object.prototype.hasOwnProperty.call(value, 'size') ?
      `<g transform="matrix(1 0 0 1 2000 ${500 + index * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">${value.size ? value.size : ''} </tspan>
                    </text>
                </g>`
      :
      `<g transform="matrix(1 0 0 1 2000 ${500 + index * 1000})">
                        <g style="transform: rotate(0deg)"></g>
                 </g>`
    }
                ${Object.prototype.hasOwnProperty.call(value, 'svgs') ?
      `<g transform="matrix(1 0 0 1 3000 ${500 + index * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">${value.svgs.name.original_height ? value.svgs.name.original_height + 'cm /' + parseFloat(value.svgs.name.original_height / INCH_TO_CENTIMETER).toFixed(2) + 'in' : ''} </tspan>
                    </text>
                </g>`
      :
      `<g transform="matrix(1 0 0 1 3000 ${500 + index * 1000})">
                        <g style="transform: rotate(0deg)"></g>
                 </g>`
    }
                ${Object.prototype.hasOwnProperty.call(value, 'svgs') ?
      `<g transform="matrix(1 0 0 1 4000 ${500 + index * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">${value.svgs.number.original_height? value.svgs.number.original_height + 'cm /' + parseFloat(value.svgs.number.original_height/ INCH_TO_CENTIMETER).toFixed(2) + 'in' : ''} </tspan>
                    </text>
                </g>`
      :
      `<g transform="matrix(1 0 0 1 4000 ${500 + index * 1000})">
                        <g style="transform: rotate(0deg)"></g>
                    </g>`
    }
                ${svg_pattern_last_value_y = ((500 + index * 1000) + 5000)}
                </g>`

  })
  }
        `
}

const getLogoPattern = async (values:Record<any,any>,measurement_ratio:string) => {
  let svg_group_el = `
        <g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 0 ${svg_pattern_last_value_y + 500})" style="font-weight: bold;">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">Logo </tspan>
                    </text>
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="${1000}" y="0">Side </tspan>
                    </text>
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="${2000}" y="0">Size </tspan>
                    </text>
                </g>
       `;
  const index = 0;
  for(let index in values) {
    const value = values[index];
    const original_url = Object.prototype.hasOwnProperty.call(value,'original_logo_url') && value.original_logo_url;
    const updated_url = original_url?value.original_logo_url:value.url;
    const has_base64 = Object.prototype.hasOwnProperty.call(value,'base_64')?true:false;
    if(updated_url !== null && updated_url !== "" && updated_url !== undefined){
      if(getFileExtensionType('raster', updated_url) ){
        if(has_base64){
          svg_group_el += `
                <g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 0 ${svg_pattern_last_value_y + 500})">
                <g transform="matrix(1 0 0 1 0 ${250 + index * 1000})">
                    ${updated_url?`<g style="transform: rotate(${value.rotation}deg)"><image xlink:href="${value.base_64}" height="${(value.actualHeight * value.scaleY)/measurement_ratio}px" width="${(value.actualWidth * value.scaleX)/measurement_ratio}px"/></g>`:''}
                </g>
                <g transform="matrix(1 0 0 1 1000 ${500 + index * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">${value.side? value.side : ''} </tspan>
                    </text>
                </g>
                <g transform="matrix(1 0 0 1 2000 ${500 + index * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">${value.originalWidth? value.originalWidth + 'cm x' + value.originalHeight + 'cm /' + parseFloat(value.originalWidth/INCH_TO_CENTIMETER).toFixed(2) + 'in x' + parseFloat(value.originalHeight/INCH_TO_CENTIMETER).toFixed(2) + 'in' : ''} </tspan>
                    </text>
                </g>
                ${logo_pattern_last_value_y = (((500 + index * 1000) + (svg_pattern_last_value_y + 500)) + 500 +((value.actualHeight * value.scaleY)/measurement_ratio))}
                </g>`
        }
      } else {
        svg_group_el += `
                <g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 0 ${svg_pattern_last_value_y + 500})">
                <g transform="matrix(1 0 0 1 0 ${250 + index * 1000})">
                    ${updated_url?`<g style="transform: rotate(${value.rotation}deg)"><image xlink:href="${process.env.VUE_APP_STORAGE_URL}${updated_url}" height="${(value.actualHeight * value.scaleY)/measurement_ratio}px" width="${(value.actualWidth * value.scaleX)/measurement_ratio}px"/></g>`:''}
                </g>
                <g transform="matrix(1 0 0 1 1000 ${500 + index * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">${value.side? value.side : ''} </tspan>
                    </text>
                </g>
                <g transform="matrix(1 0 0 1 2000 ${500 + index * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">${value.originalWidth? value.originalWidth + 'cm x' + value.originalHeight + 'cm /' + parseFloat(value.originalWidth/INCH_TO_CENTIMETER).toFixed(2) + 'in x' + parseFloat(value.originalHeight/INCH_TO_CENTIMETER).toFixed(2) + 'in' : ''} </tspan>
                    </text>
                </g>
                ${logo_pattern_last_value_y = (((500 + index * 1000) + (svg_pattern_last_value_y + 500)) + 500 +((value.actualHeight * value.scaleY)/measurement_ratio))}
                </g>`
      }
      ++index;
    }
  }
  return svg_group_el;
}

const parseSvgString = async (svg_string:string, factory_product_content: Record<any,any>) => {
  if(svg_string.substring(0, svg_string.lastIndexOf("</g>")) !== '') {
    let production_content = "";

    svg_string = svg_string.substring(0, svg_string.lastIndexOf("</g>"));

    const factory_product:Record<any,any> = await parseFactoryProduct(factory_product_content);
    svg_string += `${getSVGPattern(factory_product.roster_detail,factory_product.measurement_ratio)}\n`

    if((factory_product.custom_logos.length >= 1)){
      const custom_logos_without_base64 = factory_product.custom_logos.filter((custom_logo:Record<any,any>) => {
        return ((custom_logo.url != null || custom_logo.url != ""))
      })
      if(custom_logos_without_base64.length > 0){
        const custom_logos = await Store.dispatch('converturlToBase64',{custom_logos:custom_logos_without_base64});
        svg_string += `${await getLogoPattern(custom_logos.data.custom_logos,factory_product.measurement_ratio)}`
      }
    }
    svg_string += `\n</g>\n</svg>`;
    const svg_doc = await getDocFromString(svg_string);
    const production_file_info = {
      width: $(svg_doc).find("svg").eq(0).attr("width"),
      height: $(svg_doc).find("svg").eq(0).attr("height")
    }
    const scaled_file_info = {
      width : parseFloat(production_file_info.width),
      height : logo_pattern_last_value_y?logo_pattern_last_value_y:svg_pattern_last_value_y,
    };


    //Applying Color on SVG Start
    applyColorToSVG(factory_product,svg_doc);
    //Applying Color on SVG End

    //Add Fonts to SVgs Start
    const font_file = fontsList(Store.getters.getSelectedProduct);
    if(font_file.length > 0){
      const font_style = generateFontFile(font_file);
      $(svg_doc).find("svg").eq(0).prepend(font_style)
    }
    //Add Fonts to SVgs End

    //Add Front and Back Images Shown on SVG Start
    //Back Image
    const group_back_image_tag = getGroupImageTag(factory_product,production_file_info,'back_image');
    $(svg_doc).find("g").eq(0).prepend(group_back_image_tag)
    //Front Image
    const group_front_image_tag = getGroupImageTag(factory_product,production_file_info,'front_image');
    $(svg_doc).find("g").eq(0).prepend(group_front_image_tag)
    //Add Front and Back Images Side wise to svg End

    $(svg_doc).find("svg").eq(0).attr({"width": (scaled_file_info.width * 2) + 'px', height: scaled_file_info.height + 'px'});
    const view_box = svg_doc?.querySelector('svg')?.getAttribute('viewBox');
    const view_box_dimensions = view_box?.split(" ");
    svg_doc?.querySelector('svg')?.setAttribute('viewBox',`${view_box_dimensions[0]} ${view_box_dimensions[1]} ${parseFloat(production_file_info.width) * 2} ${logo_pattern_last_value_y?logo_pattern_last_value_y:svg_pattern_last_value_y}`);
    production_content = await serializer(svg_doc);
    return production_content;
  }
  else{
    return null;
  }
}

//Functions related to SVG parsing end
export {
  getLogoSettingsObject, getLogoObject, getRandom, getLogoSettings, setLogoSettings, getCustomLogos, fileToBase64,
  processColorsCustom,sortTextsArray,fontsColorsManipulation,fontsList,getReminderOptions,setCustomLogo, handleResponseException, logData, pathInfo,
  CustimooOrderFlowStatuses, getActiveProductData, getRosterDetailDefaultObject, activityStatus, urlToBase64, getFileExtensionType, getProductLogoSetting, getCompany, getPermissions,
  getUploadedLogoObject, initCustomLogos, initCustomTexts, rosterDetailsInit, getSelectedProductPantones, getEditModeDefaultObjFor, parseSvgString,fetchUrlContent
};
