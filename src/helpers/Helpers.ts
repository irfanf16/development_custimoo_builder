import Store from '../store'
import rgbHex from "rgb-hex";
import {getClosestColor} from "@/pantoneColor";
import {default as $} from "jquery";
import Axios, {AxiosError} from "axios";
import Vue from "vue";
import VsToast from '@vuesimple/vs-toast';
import {http} from "@/httpCommon";

const getLogoSettingsObject = () => {
  return {
    id: null,
    product_id: null,
    product_style_id: null,
    rotation: 0,
    width: 100,
    height: 100,
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

const getSelectedProductPantones = (product_id = null) => {
  const productPantones = []
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

const getProductById = (product_id) => {
  const products = Store.getters.getProducts;
  const selected_product = products.find((product) => product.id == product_id)
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
           text: fontName as string
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

const checkSceneMounted = async () => {
  const scene_ref = Store.getters.getCanvasImage.scene
  if(scene_ref.mounted) {
    return true
  } else {
    setTimeout(checkSceneMounted, 500)
  }
}

const getActiveProductData = async () => {
  await checkSceneMounted()
  const scene_ref = Store.getters.getCanvasImage.scene
  const getCanvasImage = Store.getters.getCanvasImage


  if (getCanvasImage) {
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
      measurement_ratio: selected_design.measurement_ratio,
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
          post_data.custom_logo_svgs.push(custom_logo_svg.toSVG());
        }
      }
    }
    return post_data;
  } else {
    VsToast.show({
      title: 'Please let scene load',
      variant: 'info',
      timeout: 5000
    });
    return null;
  }
}

const initCustomTexts = (retrieved_products: Record<any, any>) => {
  retrieved_products.forEach((product:any) => {
    product.productnames.forEach(async (productName: Record<any, any>, index: number) => {
      const custom_texts = Store.getters.getCustomTexts(product.id)
      if(!custom_texts || !(custom_texts && custom_texts.length)) {
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
      }
    })
  });
}

const getRosterDetailDefaultObject = () => {
  const selected_product = Store.getters.getSelectedProduct;
  if (selected_product.sizes.length){
    const productSizes = JSON.parse(selected_product.sizes[0].json_data)
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

export {
  getLogoSettingsObject, getLogoObject, getRandom, getLogoSettings, setLogoSettings, getCustomLogos, fileToBase64,
  processColorsCustom,sortTextsArray,fontsColorsManipulation,fontsList,getReminderOptions,setCustomLogo, handleResponseException, logData, pathInfo,
  CustimooOrderFlowStatuses, getActiveProductData, getRosterDetailDefaultObject, activityStatus, getProductLogoSetting, getCompany, getPermissions,
  getUploadedLogoObject, initCustomTexts, getSelectedProductPantones
};
