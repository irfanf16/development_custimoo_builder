import Store from '../store'
import rgbHex from "rgb-hex";
import {getClosestColor} from "@/pantoneColor";
import {default as $} from "jquery";
import {AxiosError} from "axios";
import Vue from "vue";
// @ts-ignore
import VsToast from '@vuesimple/vs-toast';
import {http} from "@/httpCommon";
import {parseInt, findIndex, isEmpty} from "lodash";
import {Canvas} from "fabric/fabric-impl";
import {eventBus} from "@/event/eventBus"
import VueRouter from 'vue-router'

const getLogoSettingsObject = (default_values = {}) => {
  const default_obj =  { id: null, product_id: null, product_style_id: null, following_product_ids: null, rotation: 0,
    originalWidth: 57, originalHeight: 57, width: 57, height: 57, name_of_placement: "chest", side: "front", x_axis: 300,
    y_axis: 300, is_locked: false, logo_name: null, original_logo: null, transparent_logo: null, smart_transparent_logo: null,
    original_logo_url: null, is_smart_transparent: null, url: null, haveControls: true, logo_colors: [], is_replace_success: false,
    logo_index: 0, is_vector: false
  }
  return {...default_obj, ...default_values}
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

const getLogoSettings = (index = -1, default_obj = true, product_id = 0) => {
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

const processColorsCustom = (colors: [], logos_count=4) => {
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
  const color_type = Store.getters.getSetting('color_type');
  uniqueColors.forEach((color: string) => {
    const pantoneColor = getClosestColor(color, selectProductPantonesList,color_type);
    imageColors.push({hex: pantoneColor.hex, pantone: pantoneColor.pantone, name: pantoneColor.name})
  })
  while(imageColors.length < logos_count ) {
    imageColors.push({hex: null, pantone: null, name: null})
  }
  return imageColors;

}

const getSelectedProductPantones = (product_id: null|number = null) => {
  const product_pantones: Record<any, any>[] = []
  const product = product_id ? Store.getters.getProduct(product_id) : Store.getters.getProduct()
  if(product) {
    product.colors.forEach((product_colors: any, key: number) => {
      if(key == 0){
        const colors = product_colors.json_data
        colors.forEach((color: any) => {
          const pantone = color.pantone ? color.pantone : ''
          product_pantones.push({pantone : pantone, name: color.name, hex: color.value});
        })
      }
    })
  }
  return product_pantones;
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
    finalColor.color_text =colors.json_data
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
     const item = productFonts[0].json_data
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

  const optionArray:Record<any, any> = [];
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

  let image_colors:Record<any, any>[] = [];
  if(logo.logo_colors != null) {
    image_colors = processColorsCustom(logo.logo_colors)
    let image_color_count = image_colors.length;
    while(image_color_count < 4 ) {
      image_colors.push({hex: null, pantone: null, name: null});
      ++image_color_count;
    }
  }


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
    {
      index: customTabIndex,
      attribute: 'logo_colors',
      value: image_colors
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
        Store.dispatch("SET_LOGO_COLORS", image_colors);
        Store.dispatch("initialLogoColors", JSON.stringify(image_colors));
        Store.commit("UPDATE_USING_COLOR_LOGOS", false);
      }
    }
  }
}

const handleResponseException = (errorResponse: AxiosError | TypeError) => {
  let message:string|undefined = ''
  if("isAxiosError" in errorResponse) {
    // errorResponse.response.data object have keys { exception, file, line, message, trace }
    message = errorResponse.response?.data?.message;
    if(!message) {
      message = errorResponse.response?.statusText;
    }
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

const CustimooOrderFlowStatuses : Record<any, any> = {
  submitted_for_factory_review: 'Submitted for Factory Review',
  order_approve: 'Marked to Factory',
  order_cancel: 'Cancelled',
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

const getActiveProductData = (products_fonts: Record<any, any>) => {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      const scene_ref = Store.getters.getCanvasImage.scene
      if (!(scene_ref && scene_ref.mounted)) {
        console.log('not reslove')
        return
      }
      const selected_product = Store.getters.getSelectedProduct;
      const productCustomTexts = Store.getters.productCustomTexts(selected_product.id)
      const roster_details = Store.getters.getProductRosters()
      const roster_texts : Record<any, any> = {}
      const common : Record<any, any>[] = []

      if(roster_details){
        for(let roster_index = 0; roster_index < roster_details.length; roster_index++) {
          const roster_detail = roster_details[roster_index]
          const text_object = {
            size: roster_detail.size,
            quantity: roster_detail.quantity,
            name: {
              label: '',
              placement:'',
              value: roster_detail.text,
              font_family: '',
              items: [] as Record<any, any>[]
            },
            number: {
              label: '',
              placement:'',
              value: roster_detail.number,
              font_family: '',
              items: [] as Record<any, any>[]
            }
          }
          if(productCustomTexts){
            for(let text_index = 0; text_index < productCustomTexts.length; text_index++) {
              const custom_text = productCustomTexts[text_index]
              const common_object = {
                label: '',
                placement:'',
                value: '',
                font_family: '',
                items: [] as Record<any, any>[]
              }
              const font = products_fonts[custom_text.font_family]
              let path: Record<any, any> = {}
              let text_for_test_char = '';
              if(custom_text.is_first_name) {
                text_for_test_char = roster_detail.text
                path = roster_detail.text? font.opentype_font.getPath(roster_detail.text) : {}
              } else if(custom_text.is_first_number) {
                text_for_test_char = roster_detail.number
                path = roster_detail.number? font.opentype_font.getPath(roster_detail.number) : {}
              } else if(roster_index == 0) {
                text_for_test_char = custom_text.value
                path = custom_text.value? font.opentype_font.getPath(custom_text.value) : {}
              }
              if(Object.prototype.hasOwnProperty.call(custom_text, "items")){
                for (let items_index = 0; items_index < custom_text.items.length; items_index++) {
                  const custom_text_item = custom_text.items[items_index]
                  if(custom_text_item.selected){
                    const text_item_object = {
                      label: custom_text_item.label,
                      placement: custom_text_item.placement,
                      width: '',
                      height: '',
                      unit: '',
                      svg: '',
                      color: [] as Record<any, any>[],
                      svg_height: '',
                      outline_color: '',
                      outline_color_pantone: '',
                      original_height: 0,
                      original_width: 0,
                      outline_width: '',
                      rotation: 0,
                      scaleX: 0,
                      scaleY: 0,
                      width_px: 0,
                      height_px: 0,
                    }

                    if (Object.keys(path).length) {

                      const text_color_info = {
                        hex: '',
                        name: '',
                        pantone: ''
                      }
                      text_color_info['hex'] = custom_text_item.color
                      text_color_info['name'] = custom_text_item.color_pantone
                      text_color_info['pantone'] = custom_text_item.color_pantone


                      path.fill = custom_text_item.color
                      if(parseInt(custom_text_item.outline_width) > 0){
                        path.stroke = custom_text_item.outline_color
                      }
                      path.strokeWidth = parseInt(custom_text_item.outline_width)
                      // path.scale = custom_text_item.scaleX / selected_product.measurement_ratio + ' ' + custom_text_item.scaleY / selected_product.measurement_ratio

                      const boundingBox = path.getBoundingBox()
                      boundingBox.y1 = Math.abs(boundingBox.y1)
                      const width = boundingBox.x2 - boundingBox.x1 + parseInt(custom_text_item.outline_width)
                      const height = boundingBox.y1 + boundingBox.y2 + parseInt(custom_text_item.outline_width)
                      const svg_string = path.toSVG()
                      const parser = new DOMParser();
                      const dom_svg = parser.parseFromString(svg_string, "text/html").body.firstChild as SVGElement;
                      // dom_svg.style.translate = '0px ' + height + 'px'
                      text_item_object.svg_height = height
                      let transform_height = height - parseInt(custom_text_item.outline_width) / 2; // As Transform needs half of the stroke width to show top and bottom equally of stroke
                      if (custom_text.type == 'name') {

                        let minus_height = false;
                        if (text_for_test_char.indexOf('y') > -1) {
                          minus_height = true
                        } else if (text_for_test_char.indexOf('q') > -1) {
                          minus_height = true
                        } else if (text_for_test_char.indexOf('j') > -1) {
                          minus_height = true
                        } else if (text_for_test_char.indexOf('p') > -1) {
                          minus_height = true
                        } else if (text_for_test_char.indexOf('g') > -1) {
                          minus_height = true
                        }

                        if (minus_height)
                          transform_height -= 15;
                      }
                      dom_svg.setAttribute('transform', 'translate(0 ' + transform_height + ')')
                      dom_svg.setAttribute('paint-order', 'stroke')
                      dom_svg.setAttribute('stroke-location', 'outside')

                      const svg_with_tag = '<?xml version="1.0" encoding="utf-8"?>\n' +
                        '<svg stroke-location="outside" paint-order="outside" style="width:100%; height: auto;" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xml:space="preserve" ' +
                        'viewBox="0 0 ' + width + ' ' + height + '"> \n' + dom_svg.outerHTML + '\n</svg>'


                      const converted_width = unitConversion((width * custom_text_item.scaleX) * selected_product.measurement_ratio)
                      const converted_height = unitConversion((height * custom_text_item.scaleY ) * selected_product.measurement_ratio)
                      const outline_width = unitConversion((custom_text_item.outline_width * custom_text_item.scaleX ) * selected_product.measurement_ratio)
                      text_item_object.width = converted_width!.value;
                      text_item_object.height = converted_height!.value;
                      text_item_object.unit = converted_height!.unit;
                      text_item_object.svg = svg_with_tag
                      text_item_object.color.push(text_color_info);
                      text_item_object.outline_color = custom_text_item.outline_color;
                      text_item_object.outline_color_pantone = custom_text_item.outline_color_pantone;
                      text_item_object.outline_width = outline_width!.value;
                      text_item_object.original_height = (height * custom_text_item.scaleY) / selected_product.measurement_ratio;
                      text_item_object.original_width = (width * custom_text_item.scaleX) / selected_product.measurement_ratio;
                      text_item_object.rotation = custom_text_item.rotation;
                      text_item_object.scaleX = custom_text_item.scaleX / selected_product.measurement_ratio;
                      text_item_object.scaleY = custom_text_item.scaleY / selected_product.measurement_ratio;
                      text_item_object.width_px = width;
                      text_item_object.height_px = height;
                    }

                    if (custom_text.is_first_name) {
                      text_object.name.label = custom_text.label
                      text_object.name.placement = custom_text.placement
                      text_object.name.font_family = custom_text.font_family
                      text_object.name.items.push(text_item_object)
                    } else if (custom_text.is_first_number) {
                      text_object.number.label = custom_text.label
                      text_object.number.placement = custom_text.placement
                      text_object.number.font_family = custom_text.font_family
                      text_object.number.items.push(text_item_object)
                    } else if (roster_index == 0) {
                      common_object.label = custom_text.label
                      common_object.placement = custom_text.placement
                      common_object.value = custom_text.value
                      common_object.font_family = custom_text.font_family
                      common_object.items.push(text_item_object)

                      if (common_object.value) {
                        Vue.set(common, common.length, common_object)
                      }
                    }
                  }
                }
              }

            }
          }

          Vue.set(roster_texts, roster_index, text_object)
        }
      }



      const getCanvasImage = Store.getters.getCanvasImage
      const style_index = Store.getters.getCurrentStyleIndex;
      const product_style = selected_product.productstyles[style_index];
      const productEditInfo = Store.getters.getProductEditInfoObject;
      let product_name = selected_product.product_name
      //selected_design will always return array having single object
      const selected_design = product_style.productdesigns.filter((design: Record<any, any>) => design.design_show == 1)[0];

      let design_name = selected_design.design_name;
      if(productEditInfo.editing && productEditInfo.type == 'locker_product'){
        const lockerEditProduct = productEditInfo.locker_product_info;
          design_name = lockerEditProduct.locker_product_name
      }
      product_name = `${product_name} - ${design_name}`;
      const product_models = Store.getters.getProductModels;
      const selected_model_index = Store.getters.getSelectedModelIndex;
      const back_image = getImageFromCanvas('back')
      const front_image = getImageFromCanvas('front')

      const post_data: Record<any, any> = {
        back_image: back_image,
        custom_logos: Store.getters.getCustomLogos(),
        measurement_ratio: selected_product.measurement_ratio,
        custom_logo_svgs: [],
        product_custom_texts: productCustomTexts,
        product_custom_text_objects: {roster: roster_texts, common: common},
        colors: Store.getters.getLogosColors,
        design_id: selected_design.id,
        defaultcolors: Store.getters.getDefaultColors,
        front_image: front_image,
        groupcolors: Store.getters.getGroupColors,
        logo_colors: Store.getters.getLogosColors,
        model_id: product_models[selected_model_index].id,
        model_name: product_models[selected_model_index].model_name,
        minimum_order_quantity: product_models[selected_model_index].minimum_order_quantity,
        minimum_order_quantity_type: product_models[selected_model_index].minimum_order_quantity_type,
        product_id: selected_product.product_id,
        ecommerce_post_id: (selected_product.ecommerceproduct.length > 0)?selected_product.ecommerceproduct[0].ecommerce_product_id:'',
        ecommerce_variant_id: (selected_product.ecommerceproduct.length > 0)?selected_product.ecommerceproduct[0].ecommerce_variant_id:'',
        sync_id: (selected_product.ecommerceproduct.length > 0)?selected_product.ecommerceproduct[0].sync_id:'',
        product_type: selected_product.product_type,
        product_name: product_name,
        pdf_file: null,
        production_url: selected_design.production_design?.file_url ? (`${process.env.VUE_APP_STORAGE_URL}${selected_design.production_design.file_url}.svg` ?? null) : null,
        // front_design:front_design,
        product_roster_detail: Store.getters.getProductRosters(),
        style_id: product_style.id,
        svg_groups: Store.getters.getSvgGroups,
        ecommerce_cart_id:null
      }
      if(scene_ref.customLogoObjects) {
        for (const custom_logo_svg of scene_ref.customLogoObjects) {
          if(custom_logo_svg && Object.keys(custom_logo_svg).length > 3) { // logic here is if it is fabric object the it must contain several keys so > 2 is ok
            post_data.custom_logo_svgs.push(custom_logo_svg);
          }
        }
      }
      const svg_content = await fetchUrlContent(post_data.production_url);
      const production_file = await parseSvgStringFile(svg_content,post_data);
      post_data.svg_content = production_file

      clearInterval(interval)
      resolve(post_data)
    }, 500)
  })
}

const initCustomLogos = async(retrieved_products: Record<any, any>) => {
  const team_logo = await getTeamLogo()
  retrieved_products.forEach((product: Record<any, any>) => {
    if(product.is_logo_allowed) {
      const custom_logos = Store.getters.getCustomLogos(product.id)
      if (!custom_logos || !(custom_logos && custom_logos.length)) {
        if(product.logos_setting.length) {
          const logoSetting = product.logos_setting[0]
          let logo = {
            id: null,
            product_id: product.id,
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
          if(team_logo) {
            logo = {...logo, ...team_logo}
          }
          Store.commit('customLogo', {index: 0, logo: logo, prd_id: product.id})
        } else { // if logo is allowed but there is no setting for logo in product the add default logo object to show team logo
          let logo = getLogoSettingsObject()
          logo.product_id = product.id
          if(team_logo) {
            logo = {...logo, ...team_logo}
          }
          Store.commit('customLogo', {index: 0, logo: logo, prd_id: product.id})
        }
      }
    }
  })
}

const initCustomLogosNew = async (retrieved_products: Record<any, any>) => {
  const team_logo = await getTeamLogo()
  const custom_logos_by_products: Record<any, any> = {}
  const existing_custom_logos = Store.getters.getCustomLogos('all')
  retrieved_products.forEach((product: Record<any, any>) => {
    if(product.is_logo_allowed) {
      const product_existing_custom_logos = existing_custom_logos ? existing_custom_logos[product.id] : null
      /*
      * check if product custom logos already exists in persistent state then no need to load custom logos for that product
      * and continue to next iteration
      * */
      if(product_existing_custom_logos && product_existing_custom_logos.length > 0) {
        const dirty_custom_logos = product_existing_custom_logos.filter(custom_logo => custom_logo.product_id != product.id)
        if(dirty_custom_logos.length > 0) {
          product_existing_custom_logos.forEach((product_existing_custom_logo, customLogoIndex) => {
            product_existing_custom_logos[customLogoIndex].product_id = product.id
          })
          Store.commit('SET_PRODUCT_CUSTOM_LOGOS', { product_id: product.id, data: product_existing_custom_logos})
        }
        return false
      }
      let first_logo_setting = getLogoSettingsObject();
      if(product.logos_setting.length) {
        delete product.logos_setting.created_at
        delete product.logos_setting.updated_at
        first_logo_setting = { ...first_logo_setting, ...product.logos_setting[0], ...{id: null} }
      }
      if(team_logo) {
        first_logo_setting = {...first_logo_setting, ...team_logo}
      }
      first_logo_setting.product_id = product.id
      custom_logos_by_products[product.id] = [first_logo_setting]
    }
  })
  if(Object.keys(custom_logos_by_products).length > 0) {
    Store.commit('SET_PRODUCT_CUSTOM_LOGOS', { 'append': true, data: custom_logos_by_products})
  }
  const selected_product_custom_logos = Store.getters.getCustomLogos()
  if(selected_product_custom_logos) {
    /*
    * As selected product custom logos are being passed by reference. So any change in the custom logos of selected product
    * will automatically be reflected in last active product data custom_logos
    * */
    Store.commit('SET_LAST_ACTIVE_PRODUCT_DATA', { custom_logos: selected_product_custom_logos})
  }
  eventBus.$emit('handleNonVectorCustomLogosCount')
}

const rosterDetailsInit = (retrieved_products: Record<any, any>) => {
  retrieved_products.forEach((product: Record<any, any>) => {
    if(!Store.getters.getAllRosterDetails[product.id]) {
      const payload = getRosterDetailDefaultObject(product)
      Store.dispatch('setRosterDetails', { pid : product.id, index: 0, roster: payload })
    }
  })
}
const getRosterDetailDefaultObject = (product = Store.getters.getSelectedProduct) => {
  if (product.sizes.length){
    const productSizes = product.sizes[0].json_data
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
  order_approve: {
    title: "Marked to Factory",
    message: "Order is forwarded to factory.",
  },
  order_cancel: {
    title: "Cancelled",
    message: "Your order has been cancelled.",
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

const setRetrievedProductsCustomTexts = (retrieved_products: Record<any, any>[], reset=false) => {
  const last_active_product_custom_texts = Store.getters.getLastActiveProductData['product_custom_texts']
  const retrieved_products_custom_texts = retrieved_products.map((retrieved_product: Record<any, any>) => {
    if(reset)
      return retrieved_product.product_texts
    const product_id = retrieved_product.id;
    return last_active_product_custom_texts && last_active_product_custom_texts[product_id] ? last_active_product_custom_texts[product_id] : JSON.parse(JSON.stringify(retrieved_product.product_texts));
  })
  Store.commit("SET_PRODUCT_CUSTOM_TEXTS", { append: true, value: retrieved_products_custom_texts })
  /*
  * For commit {SET_LAST_ACTIVE_PRODUCT_CUSTOM_TEXTS} the custom text is being passed by reference so any change in custom text will also be reflected in
  * state.last_active_product_data
   */
  retrieved_products_custom_texts.forEach((product_custom_texts: Record<any, any>[]) => {
    const product_id = product_custom_texts && product_custom_texts.length > 0 ? product_custom_texts[0].product_id : null;
    if(product_id) {
      Store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", {
        product_custom_texts: {[product_id]: product_custom_texts}
      });
    }
  })

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
  let response_obj:Record<any, any> = {};
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

const INCH_TO_CENTIMETER = 2.54;

const fetchUrlContent = async (url:string) => {
  if(url) {
    const fetch_content = await fetch(url);
    const url_content   = await fetch_content.text();
    return url_content;
  } else {
    return "";
  }
}

const getDocFromString = (doc_string: string, type:DOMParserSupportedType ="image/svg+xml") => {
  return new Promise((resolve) => {
    const parser = new DOMParser();
    const parsed = parser.parseFromString(doc_string, type);
    resolve(parsed)
  })
}

const serializer = (svg_doc: SVGTextElement | Document): Promise<string> => {
  return new Promise((resolve) => {
    const xml = new XMLSerializer()
    const xml_string = xml.serializeToString(svg_doc)
    resolve(xml_string)
  })
}

const parseRosterDetailFromFactoryProduct = (factory_product:Record<any,any>) => {

  const temp_array: Record<any,any>[] = [];
  const roster_details :Record<any,any>[] = [];
  if(Object.prototype.hasOwnProperty.call(factory_product,'product_custom_text_objects')){
    if(Object.prototype.hasOwnProperty.call(factory_product.product_custom_text_objects,'roster')){
      Object.entries(factory_product.product_custom_text_objects.roster).forEach(([rosterIndex, roster_item]) => {
        if(Object.prototype.hasOwnProperty.call(roster_item,'name') && (roster_item as Record<any, any>).name.items.length > 0 && Object.prototype.hasOwnProperty.call(roster_item,'number') && (roster_item as Record<any, any>).number.items.length > 0){
          (roster_item as Record<any, any>).name.items.forEach((item:Record<any,any>,index:number)=>{
            const name_svg = item.svg.substring(item.svg.indexOf("<path"),item.svg.indexOf("</svg>"));
            temp_array[parseInt(rosterIndex)] = {name:name_svg};
          });
          (roster_item as Record<any, any>).number.items.forEach((item:Record<any,any>,index:number)=>{
            const number_svg = item.svg.substring(item.svg.indexOf("<path"),item.svg.indexOf("</svg>"));
            roster_details[parseInt(rosterIndex)] = {number:number_svg, name: temp_array[parseInt(rosterIndex)].name, size: (roster_item as Record<any, any>).size, quantity: (roster_item as Record<any, any>).quantity};
          })
        }
        else if(Object.prototype.hasOwnProperty.call(roster_item,'name') && (roster_item as Record<any, any>).name.items.length > 0){
          (roster_item as Record<any, any>).name.items.forEach((item:Record<any,any>,index:number)=>{
            const name_svg = item.svg.substring(item.svg.indexOf("<path"),item.svg.indexOf("</svg>"));
            roster_details[parseInt(rosterIndex)] = {number:null, name: name_svg, size: (roster_item as Record<any, any>).size, quantity: (roster_item as Record<any, any>).quantity}
          })
        }
        else if(Object.prototype.hasOwnProperty.call(roster_item,'number') && (roster_item as Record<any, any>).number.items.length > 0){
          (roster_item as Record<any, any>).number.items.forEach((item:Record<any,any>,index:number)=>{
            const number_svg = item.svg.substring(item.svg.indexOf("<path"),item.svg.indexOf("</svg>"));
            roster_details[parseInt(rosterIndex)] = {number:number_svg, name: null, size: (roster_item as Record<any, any>).size, quantity: (roster_item as Record<any, any>).quantity}
          })
        }
      });
    }
    if(Object.prototype.hasOwnProperty.call(factory_product.product_custom_text_objects,'common') && factory_product.product_custom_text_objects.common.length > 0){
      const index_for_common:number = roster_details.length;
      factory_product.product_custom_text_objects.common.forEach((common_item:Record<any,any>,commonIndex:number) => {
        common_item.items.forEach((item:Record<any,any>,index:number)=>{
          const name_svg = item.svg.substring(item.svg.indexOf("<path"),item.svg.indexOf("</svg>"));
          roster_details[index_for_common + commonIndex] = {number:null, name: name_svg, size: null, quantity: null}
        })
      });
    }
  }
  return roster_details;
}

const applyColorToSVG = (factory_product:Record<any,any>, svg_doc:Record<any,any>) => {
  factory_product.svg_groups.forEach((svg_group_item:Record<any,any>) => {
    $(svg_doc).find(`[id]`).each (function(doc_item,doc_item_element) {
      let doc_elem_id = $(this).attr("id");
      if(doc_elem_id) {
        doc_elem_id = doc_elem_id.search("_") >= 0 ? doc_elem_id.substring(0, doc_elem_id.search("_")) : doc_elem_id
        if(doc_elem_id.toLowerCase() == svg_group_item.id.toLowerCase()) {
          $(doc_item_element).attr("fill", svg_group_item.color);
          if($(doc_item_element).children().length > 0){
            $(doc_item_element).find('path').attr("fill", svg_group_item.color);
          }
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

const getGroupImageTag = (factory_product:Record<any,any>, production_file_info:Record<any,any>,image_side:string) => {
  const group_image_tag = document.createElementNS("http://www.w3.org/2000/svg","g");
  group_image_tag.setAttribute('transform',`matrix(1 0 0 1 ${parseFloat(production_file_info.width)} ${(image_side === 'front_image')? ((parseFloat(production_file_info.width)/2) + 500) : 0 })`);
  const back_image = document.createElementNS("http://www.w3.org/2000/svg","image");
  back_image.setAttribute('xlink:href',`${factory_product[image_side]}`);
  back_image.setAttribute('height',`${(parseFloat(production_file_info.height)/2)}px`);
  back_image.setAttribute('width',`${(parseFloat(production_file_info.height)/2)}px`);
  group_image_tag.appendChild(back_image);
  return group_image_tag;
}

const parseSvgStringFile = async (svg_string:string, factory_product: Record<any,any>) => {
  if(svg_string.substring(0, svg_string.lastIndexOf("</g>")) !== '') {
    let production_content = "";
    svg_string = svg_string.substring(0, svg_string.lastIndexOf("</g>"));
    const svg_doc_initial = await getDocFromString(svg_string);
    const production_file_initial_dimension:Record<any, any> = {
      width: $(svg_doc_initial as SVGTextElement|Document).find("svg").eq(0).attr("width"),
      height: $(svg_doc_initial as SVGTextElement|Document).find("svg").eq(0).attr("height")
    }

    let logo_max_width = 0 ;
    if((factory_product.custom_logos.length >= 1)){
      const custom_logos_without_base64 = factory_product.custom_logos.filter((custom_logo:Record<any,any>) => {
        return (Object.prototype.hasOwnProperty.call(custom_logo,'url') && custom_logo.url !== "" && custom_logo.url !== null)
      })
      if(custom_logos_without_base64.length > 0){
        const custom_logos = await Store.dispatch('converturlToBase64',{custom_logos:custom_logos_without_base64});
        const payload = getLogoSVG(custom_logos.data.custom_logos,factory_product.measurement_ratio,production_file_initial_dimension);
        logo_max_width = payload.width;
        svg_string += `${payload.svg_string}`
      }
    }
    const numbers_array:Record<any,any>[] = getSVGNumberArraysFromRoster(factory_product);
    const svg_numbers_payload = getSVGNumbers(numbers_array,logo_max_width,production_file_initial_dimension);
    svg_string += `${svg_numbers_payload.svg_string}`;
    const numbers_width = svg_numbers_payload.width?svg_numbers_payload.width + 500:0;
    const logo_max_width_and_number_max_width = logo_max_width + numbers_width;

    const names_array:Record<any,any>[] = getSVGNameArraysFromRoster(factory_product);
    const svg_names_payload = getSVGNames(names_array,production_file_initial_dimension,logo_max_width_and_number_max_width);
    svg_string += `${svg_names_payload.svg_string}`;
    const names_height = svg_names_payload.height;
    const names_width = svg_names_payload.width;

    const name_logo_number_max_width = logo_max_width + numbers_width + names_width;

    const common_array:Record<any,any> [] = getSVGCommonArraysFromRoster(factory_product);
    const svg_common_payload = getSVGCommonItems(common_array,production_file_initial_dimension,name_logo_number_max_width);
    const common_width = svg_common_payload.width;
    const common_height = svg_common_payload.height;

    svg_string += `${svg_common_payload.svg_string}`;

    svg_string += `\n</g>\n</svg>`;

    const svg_doc = await getDocFromString(svg_string);
    const production_file_info:Record<any, any> = {
      width: $(svg_doc as SVGTextElement|Document).find("svg").eq(0).attr("width"),
      height: $(svg_doc as SVGTextElement|Document).find("svg").eq(0).attr("height")
    }

    //Applying Color on SVG Start
    applyColorToSVG(factory_product,svg_doc as SVGTextElement|Document);
    //Applying Color on SVG End

    //Back Image
    const group_back_image_tag = getGroupImageTag(factory_product,production_file_info,'back_image');
    $(svg_doc as SVGTextElement|Document).find("g").eq(0).prepend(group_back_image_tag);

    //Front Image
    const group_front_image_tag = getGroupImageTag(factory_product,production_file_info,'front_image');
    $(svg_doc as SVGTextElement|Document).find("g").eq(0).prepend(group_front_image_tag)
    //Add Front and Back Images Side wise to svg End
    const production_height = production_file_info.height? parseFloat(production_file_info.height.replace('px','')):6000;
    const production_width = production_file_info.width? parseFloat(production_file_info.width.replace('px','')):8000;
    const view_box = (svg_doc as SVGTextElement|Document)?.querySelector('svg')?.getAttribute('viewBox');

    const view_box_dimensions = view_box?.split(" ");

    // @ts-ignore

    const svg_height = calculateSVGHeight(production_height,logo_max_width,svg_numbers_payload.height,names_height,common_height);
    const svg_width = calculateSVGWidth(production_width,logo_max_width,numbers_width,names_width,common_width)

    $(svg_doc as SVGTextElement|Document).find("svg").eq(0).attr({"width": svg_width + 'px', height: svg_height + 'px'});
    // @ts-ignore
    (svg_doc as SVGTextElement|Document)?.querySelector('svg')?.setAttribute('viewBox',`${view_box_dimensions[0]} ${view_box_dimensions[1]} ${svg_width} ${svg_height}`);
    production_content = await serializer(svg_doc as SVGTextElement|Document);

    return production_content;
  }
  else{
    return null;
  }
}

const calculateSVGHeight = (production_file_height:number, logo_max_height:number, number_max_height:number, name_max_height:number, common_height:number) => {
  if(production_file_height && logo_max_height && number_max_height && name_max_height){
     return production_file_height + number_max_height + 1000;
  }
  else if (production_file_height && logo_max_height && number_max_height){
    return production_file_height + number_max_height + 1000;
  }
  else if (production_file_height && logo_max_height && name_max_height || production_file_height && logo_max_height && name_max_height && common_height){
    if(name_max_height > logo_max_height && name_max_height > common_height){
      return production_file_height + (name_max_height * 3);
    }
    else if(common_height > logo_max_height && common_height > name_max_height){
      return production_file_height + (name_max_height * 3);
    }
    else{
      return production_file_height + (logo_max_height * 3);
    }
  }
  else if (production_file_height && name_max_height || production_file_height && name_max_height && common_height){
    if(name_max_height > common_height){
      return production_file_height + (name_max_height * 3);
    }
    else{
      return production_file_height + (common_height * 3);
    }

  }
  else if (production_file_height && logo_max_height || production_file_height && logo_max_height && common_height){
    return production_file_height + (logo_max_height * 2);
  }
  else if (production_file_height || production_file_height && common_height){
    if(production_file_height && common_height){
      return production_file_height + common_height +  1000
    }else{
      return production_file_height + 1000
    }

  }
}
const calculateSVGWidth = (production_width:number, logo_max_width:number, numbers_width:number, names_width:number, common_width:number) => {
  const max_width = logo_max_width + numbers_width + names_width + common_width + 500 ;
  const production_file_scaled_width = production_width * 2 ;
  return max_width > production_file_scaled_width ? max_width : production_file_scaled_width;
}

const getSVGNumberArraysFromRoster = (factory_product:Record<any,any>) => {
  const labels:Record<any,any>[] = [];
  if(Object.prototype.hasOwnProperty.call(factory_product,'product_custom_text_objects') && factory_product.product_custom_text_objects){
    if(Object.prototype.hasOwnProperty.call(factory_product.product_custom_text_objects,'roster') && factory_product.product_custom_text_objects.roster){
      Object.entries(factory_product.product_custom_text_objects.roster).forEach(([rosterIndex, roster_item]) => {
        if(Object.prototype.hasOwnProperty.call(roster_item,'number') && (roster_item as Record<any, any>).number){
          if(Object.prototype.hasOwnProperty.call((roster_item as Record<any, any>).number,'items') && (roster_item as Record<any, any>).number.items.length > 0){
            (roster_item as Record<any, any>).number.items.forEach((item:Record<any,any>) => {
              if(labels[item.label] && labels[item.label].length > 0){
                labels[item.label].push(item);
              }
              else{
                labels[item.label] = [];
                labels[item.label].push(item);
              }
            })
          }
        }
      });
    }
  }
  return labels;
}


const getSVGNameArraysFromRoster = (factory_product:Record<any,any>) => {
  const labels:Record<any,any>[] = [];
  if(Object.prototype.hasOwnProperty.call(factory_product,'product_custom_text_objects') && factory_product.product_custom_text_objects){
    if(Object.prototype.hasOwnProperty.call(factory_product.product_custom_text_objects,'roster') && factory_product.product_custom_text_objects.roster){
      Object.entries(factory_product.product_custom_text_objects.roster).forEach(([rosterIndex, roster_item]) => {
        if(Object.prototype.hasOwnProperty.call(roster_item,'name') && (roster_item as Record<any, any>).name){
          if(Object.prototype.hasOwnProperty.call((roster_item as Record<any, any>).name,'items') && (roster_item as Record<any, any>).name.items.length > 0){
            (roster_item as Record<any, any>).name.items.forEach((item:Record<any,any>) => {
              if(labels[item.label] && labels[item.label].length > 0){
                labels[item.label].push(item);
              }
              else{
                labels[item.label] = [];
                labels[item.label].push(item);
              }
            })
          }
        }
      });
    }
  }
  return labels;
}

const getSVGCommonArraysFromRoster = (factory_product:Record<any,any>) => {
  const labels:Record<any,any>[] = [];
  if(Object.prototype.hasOwnProperty.call(factory_product,'product_custom_text_objects') && factory_product.product_custom_text_objects){
    if(Object.prototype.hasOwnProperty.call(factory_product.product_custom_text_objects,'common') && factory_product.product_custom_text_objects.common){
      Object.entries(factory_product.product_custom_text_objects.common).forEach(([commonIndex, common_item]) => {
          if(Object.prototype.hasOwnProperty.call((common_item as Record<any, any>),'items') && (common_item as Record<any, any>).items.length > 0){
            (common_item as Record<any, any>).items.forEach((item:Record<any,any>) => {
              if(labels[item.label] && labels[item.label].length > 0){
                labels[item.label].push(item);
              }
              else{
                labels[item.label] = [];
                labels[item.label].push(item);
              }
            })
          }
      });
    }
  }
  return labels;
}

const getSVGNumbers = (numbers_array:Record<any,any>[], logo_width:number, production_file_dimension:Record<any,any>) => {
  const height_of_production_file = production_file_dimension.height? production_file_dimension.height.replace('px',''):6000;
  let height = 0 ;
  let width = 0 ;
  let svg_string = `<g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 ${logo_width?logo_width + 500: 0} ${height_of_production_file})">`;
  let main_index = 0;
  const height_array_for_sort:Record<any,any> = [];
  let original_width = 0 ;
  Object.entries(numbers_array).forEach(([key, value]) => {
      height = 0 ;
      height_array_for_sort[key] = 0;
      value.forEach((item:Record<any,any>,index:number) => {
        height_array_for_sort[key] += parseFloat(item.original_height) + 500;

        const svg = item.svg.substring(item.svg.indexOf("<path"),item.svg.lastIndexOf("</svg>"));
        const scaleX =  transformUnit(item.width_px,item.width)? transformUnit(item.width_px,item.width):1;
        const scaleY =  transformUnit(item.height_px,item.height)?transformUnit(item.height_px,item.height):1;
        svg_string +=`
                     <g transform="matrix(${scaleX} 0 0 ${scaleY} ${width} ${height})">
                        <g style="transform: rotate(0)">${svg}</g>
                     </g>
                `
          original_width = parseFloat(item.original_width);
          height += parseFloat(item.original_height) + 500;
      })
    width += original_width + 500;
    main_index += 1;
    })
    let max_height = 0
    Object.entries(height_array_for_sort).forEach(([key, value]) => {
      if(parseFloat(value) > max_height){
        max_height = parseFloat(value);
      }
    });

  svg_string += `</g>`

  return {
    svg_string:svg_string,
    width:width,
    height:max_height,
  };
}

const getSVGNames = (names_array:Record<any,any>[], production_file_dimension:Record<any,any>, number_svg_width:number) => {
  const height_of_production_file = production_file_dimension.height? production_file_dimension.height.replace('px',''):6000;
  let height = 0 ;
  let width = 0 ;
  let original_width = 0;
  let svg_string = `<g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 ${number_svg_width} ${height_of_production_file})">`;
  Object.entries(names_array).forEach(([key, value]) => {
    height = 0;
    value.forEach((item:Record<any,any>,index:number) => {
      const svg = item.svg.substring(item.svg.indexOf("<path"),item.svg.lastIndexOf("</svg>"));
      const scaleX =  transformUnit(item.width_px,item.width)? transformUnit(item.width_px,item.width):1;
      const scaleY =  transformUnit(item.height_px,item.height)?transformUnit(item.height_px,item.height):1;
      svg_string +=`
                     <g transform="matrix(${scaleX} 0 0 ${scaleY} ${width} ${height})">
                        <g style="transform: rotate(${item.rotation})">${svg}</g>
                     </g>
                `;
      original_width = parseFloat(item.original_width);
      height += parseFloat(item.original_height) + 500;
    })
    width += original_width + 500;
  })

  svg_string += `</g>`
  return {
    svg_string:svg_string,
    height:height,
    width: width
  };
}

const getSVGCommonItems = (common_array:Record<any,any>[], production_file_dimension:Record<any,any>, names_svg_width:number) => {
  const height_of_production_file = production_file_dimension.height? production_file_dimension.height.replace('px',''):6000;
  let height = 0 ;
  let width = 0 ;
  let original_width = 0;
  let svg_string = `<g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 ${names_svg_width} ${height_of_production_file})">`;
  Object.entries(common_array).forEach(([key, value]) => {
    value.forEach((item:Record<any,any>,index:number) => {
      const svg = item.svg.substring(item.svg.indexOf("<path"),item.svg.lastIndexOf("</svg>"));
      const scaleX =  transformUnit(item.width_px,item.width)? transformUnit(item.width_px,item.width):1;
      const scaleY =  transformUnit(item.height_px,item.height)?transformUnit(item.height_px,item.height):1;
      svg_string +=`
                     <g transform="matrix(${scaleX} 0 0 ${scaleY} ${width} ${height})">
                        <g style="transform: rotate(${item.rotation})">${svg}</g>
                     </g>
                `;
      original_width = parseFloat(item.original_width);
      height += parseFloat(item.original_height) + 500;
    })
  })
  width += original_width + 500;

  svg_string += `</g>`

  return {
    svg_string:svg_string,
    height:height,
    width: width
  };
}



const getLogoSVG = (custom_logos:Record<any,any>, measurement_ratio:string, production_file_dimension:Record<any,any>) => {
  const height_of_production_file = production_file_dimension.height? production_file_dimension.height.replace('px',''):6000;
  let svg_string = `<g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 0 ${height_of_production_file})">`;
  let width = 0;
  const setting = Store.getters.getSetting('measurement_unit')
  custom_logos.forEach((custom_logo:Record<any,any>, index:number) => {
    const original_url = Object.prototype.hasOwnProperty.call(custom_logo,'original_png') && custom_logo.original_png;
    const updated_url = original_url?custom_logo.original_url:custom_logo.url;
    const has_base64 = Object.prototype.hasOwnProperty.call(custom_logo,'base_64')?true:false;
    if(updated_url){
      if(has_base64){
        svg_string +=`
                     <g transform="matrix(1 0 0 1 ${width} 1000)">
                        <g style="transform: rotate(${custom_logo.rotation})">
                            <image xlink:href="${custom_logo.base_64}" height="${custom_logo.originalHeight}${setting.unit}" width="${custom_logo.originalWidth}${setting.unit}"/>
                        </g>
                     </g>
                `
      }
      else{
        svg_string +=`
                     <g transform="matrix(1 0 0 1 ${width} 1000)">
                        <g style="transform: rotate(${custom_logo.rotation})">
                            <image xlink:href="${process.env.VUE_APP_STORAGE_URL}${updated_url}" height="${custom_logo.originalHeight}${setting.unit}" width="${custom_logo.originalWidth}${setting.unit}"/>
                        </g>
                     </g>
                `
      }
    }
      if(Object.prototype.hasOwnProperty.call(custom_logo,'actualWidth')){
        const scaleX = Object.prototype.hasOwnProperty.call(custom_logo,'scaleX')? Object.prototype.hasOwnProperty.call(custom_logo,'scaleX'): 1;
        width += ((custom_logo.actualWidth * scaleX)/parseFloat(measurement_ratio)) + 500;
      }
      else{
        width += 0;
      }
  });

  svg_string += `</g>`
  return {svg_string:svg_string,width:width};
}

const unitConversion = (value:number) => {
  const setting = Store.getters.getSetting('measurement_unit')
  if(setting){
    switch( setting.conversion_operator ) {
      case 'multiply':
        return { value: (value * (parseFloat(setting.conversion_value))).toFixed(1), unit: setting.unit }
        break;
      case 'divide':
        return { value: (value / (parseFloat(setting.conversion_value))).toFixed(1), unit: setting.unit }
        break;
      default: {
        const value_string = value ? value.toString() : '';
        return {value: parseFloat(value_string).toFixed(1), unit: setting.unit}
      }
    }
  }
}

const transformUnit = (dimension_px:number,unit_value:string) => {
    const setting = Store.getters.getSetting('measurement_unit');
    const PIXEL_IN_INCH = 72;
    const CM_IN_INCH = 2.54;
    const dimension_unit = parseFloat(unit_value);
    if(setting){
      switch( setting.conversion_operator ) {
        case 'multiply':
        {
          const conversion_from_px = dimension_px/PIXEL_IN_INCH;
          const conversion_from_cm = dimension_unit/CM_IN_INCH;
          return (conversion_from_cm / conversion_from_px).toFixed(2);
          break;
        }
        case 'divide':
        {
          const conversion_from_px = dimension_px/PIXEL_IN_INCH;
          return (dimension_unit / conversion_from_px).toFixed(2);
          break;
        }
        default: {
          return null
        }
      }
    }
}

const rosterDefaultItem = () => {
  return {
    text: '',  number: '',  size_index: 0,  size: '',  code: '', quantity: 1, information: ''
  }
}

const logData = (...args: Record<any, any>[]) => {
  const data: Record<any, any> = {}
  args.forEach((arg, arg_index) => {
    data[arg_index] = arg
  })
  console.log('Logging data', data)
}

const authenticateUser = async (token: string) => {
  const customer = await Store.dispatch('getCustomerFromToken', token)
  if (customer){
    const payload = {
      access_token: token,
      user: customer
    }
    Store.commit('SET_CUSTOMER', payload)
    if(!localStorage.getItem('browserToken')){
      await Store.dispatch('setBrowserToken')
    }
    await Store.dispatch("getLockers");
    await Store.commit("SET_RECENT_LOGOS");
    await Store.dispatch('getLockerRoomColors')
    await Store.dispatch('getCartServer', {})
    await Store.dispatch('getNotifications')
    await getPermissions()

  }else{
    alert('no customer')
  }
  Store.commit('SET_RECENT_LOGOS')
}

const lastActiveProductDefaultObject = (keys_default_values = {}) => {
  const default_obj = {
    category_index: 0, category_id: null, design_index: 0, design_id: null, product_index: 0, product_id: null, search_products: null, style_index: 0, style_id: null,
    page_no: 1, customized: true, personalized: false, private_product: false, product_custom_texts: {}, custom_logos: [], default_colors: [], group_colors: [], logo_colors: [],
    roster_detail: [], products_rosters: {}
  }
  return {...default_obj, ...keys_default_values}
}

const resetLastActiveProductData = async () => {
  const last_active_product_default_object = lastActiveProductDefaultObject()
  Store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", last_active_product_default_object)
}

const exitFromEditMode = () => {
  Store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", { editing: false, type: null, filters: null, locker_product_info: null, cart_product_info: null, order_product_info: null })
}

const persistToken =  (to:Record<any,any>, from:Record<any,any>) => {
  let jwtToken = localStorage.getItem('jwtToken')
  if(to.query && to.query.token && jwtToken){
    if(jwtToken === to.query.token){
      const adminToken = localStorage.getItem('adminToken');
      if(adminToken){
        localStorage.setItem('jwtToken',adminToken);
        jwtToken = localStorage.getItem('jwtToken');
      }
    }
    else{
      jwtToken = to.query.token;
      if(jwtToken){
        localStorage.setItem('jwtToken',jwtToken);
        localStorage.setItem('adminToken',jwtToken);
      }
    }
  }
  else if(!jwtToken){
    const adminToken = localStorage.getItem('adminToken');
    if(adminToken){
      localStorage.setItem('jwtToken',adminToken);
      jwtToken = localStorage.getItem('jwtToken');
    }
  }
  return jwtToken;
}

const fetchCustomer = async (jwtToken:string) => {
  if (!Store.getters.getCustomer && jwtToken){
    const customer = await Store.dispatch('getCustomerFromToken', jwtToken)
    if (customer){
      const payload = {
        access_token: jwtToken,
        user: customer
      }
      await Store.commit('SET_CUSTOMER', payload)
    }
  }
}

const setVueVersion = async () => {
  const is_loggedIn = await localStorage.getItem('jwtToken');
  let customer_id = 0;
  if(is_loggedIn) {
    const customer = Store.getters.getCustomer;
    customer_id = customer.id;
    if(customer_id) {
      await http.get('get-reset-store?customer_id='+customer_id).then((res) => {
        if(typeof res.data.company != 'undefined' && res.data.company.reset_store == 1) {
          if(is_loggedIn && res.data.isCustomerStoreReset == 0){
            http.post('set-reset-store', {company_id:res.data.company.id,customer_id:customer_id}).then(() => {
              restore();
            })
          }
        }
      })
    }
  }
}

async function restore(){
  await Store.dispatch('resetStore');
  setTimeout(() => {
    location.reload()
  }, 2500)
}

const getProductColors = (product_id = null, append_locker_colors = true ) => {
  let product_colors: Record<any, any>[] = []
  product_id = product_id ? product_id : Store.getters.getSelectedProductId
  const product_obj = Store.getters.getProduct(product_id)
  if(product_obj) {
    product_obj.colors.forEach((colors: any, key: number) => {
      const final_color = {color_text: [], selectedColor: "", name: colors.file_name.substr(0, colors.file_name.indexOf('.'))}
      final_color.color_text = colors.json_data
      product_colors = product_colors.concat(final_color)
    })
    if(append_locker_colors) {
      product_colors = product_colors.concat(Store.getters.getLockerColors)
    }
  }
  return product_colors
}

const logoColorInfoDefaultObject = () => {
  return { using_logo_colors: false,  is_shuffled: false,  extracted_colors: [],  colors: [] }
}

const recentLogoDefaultObject = (default_values: Record<any, any> | Record<any, any>[] = {}): Record<any, any> | Record<any, any>[] => {
  const default_object = {
    id: null, browser_key: null, company_id: null, logo_colors: [], logo_name: null, logo_url: null, original_logo_url: null,
    original_png: null, product_id: null, recent_delete: false, smart_transparent_logo_url: null,
    transparent_logo_url: null
  }
  if(default_values.constructor.name == 'Object') {
    return {...default_object, ...default_values}
  }
  else {
    return default_values.map((default_values_object: Record<any, any>) => {
      return {...default_object, ...default_values_object}
    })
  }
}

const getTeamLogo = (product_id: number|null = null) => {
  const custom_logos_by_products = Store.getters.getCustomLogoObject
  if(product_id) {
    return custom_logos_by_products[product_id][0]
  }
  let team_logo:Record<any, any> = {}
  for(const product_id in custom_logos_by_products) {
    if(custom_logos_by_products[product_id][0] && custom_logos_by_products[product_id][0].original_logo) {
      team_logo = custom_logos_by_products[product_id][0]
      break
    }
  }
  if(Object.keys(team_logo).length > 0) {
    return {
      "id": team_logo.id,
      "url": team_logo.url,
      "original_logo": team_logo.original_logo,
      "original_logo_url": team_logo.original_logo_url,
      "transparent_logo": team_logo.transparent_logo,
      "smart_transparent_logo": team_logo.smart_transparent_logo,
      "is_smart_transparent": team_logo.is_smart_transparent,
      "is_transparent": team_logo.is_transparent,
      "is_vector": team_logo.is_vector,
      "logo_name": team_logo.logo_name,
    }
  } else {
    return team_logo
  }
}

const getSelectedProductData = (selected_product_custom_texts = true) => {
  const selected_product = Store.getters.getSelectedProduct;
  const style_index = Store.getters.getCurrentStyleIndex;
  const productCustomTexts = selected_product_custom_texts ? Store.getters.productCustomTexts(selected_product.id) : Store.getters.productCustomTexts()
  const product_style = selected_product.productstyles[style_index];
  const design_index = findIndex(product_style.productdesigns, (design: Record<any, any>) => design.design_show == 1)
  const selected_design = product_style.productdesigns[design_index]
  const product_models = Store.getters.getProductModels;
  const selected_model_index = Store.getters.getSelectedModelIndex;
  const categories = Store.getters.getCategories
  let category_id = null
  let category_index = 0
  if(categories.length > 0) {
    const selected_category = Store.getters.getSelectedCategory
    category_id = selected_category.category_id ? selected_category.category_id : null
    if(category_id) {
      category_index = findIndex(categories, ['id', category_id])
      if(category_index == -1) {
        category_index = 0
      }
    }
  }
  return {
    back_image: getImageFromCanvas('back'),
    front_image: getImageFromCanvas('front'),
    custom_logos: Store.getters.getCustomLogos(),
    measurement_ratio: selected_product.measurement_ratio,
    custom_logo_svgs: [],
    product_custom_texts: productCustomTexts,
    colors: Store.getters.getLogosColors,
    default_colors: Store.getters.getDefaultColors,
    group_colors: Store.getters.getGroupColors,
    design_index: design_index,
    design_id: selected_design.id,
    logo_colors: Store.getters.getLogosColors,
    model_id: product_models[selected_model_index].id,
    model_name: product_models[selected_model_index].model_name,
    product_id: selected_product.product_id,
    ecommerce_post_id: (selected_product.ecommerceproduct.length > 0)?selected_product.ecommerceproduct[0].ecommerce_product_id:'',
    sync_id: (selected_product.ecommerceproduct.length > 0)?selected_product.ecommerceproduct[0].sync_id:'',
    product_type: selected_product.product_type,
    product_name: selected_product.product_name,
    pdf_file: null,
    production_url: selected_design.production_design?.file_url ? (`${process.env.VUE_APP_STORAGE_URL}${selected_design.production_design.file_url}.svg` ?? null) : null,
    product_roster_detail: Store.getters.getProductRosters(),
    style_id: product_style.id,
    style_index: style_index,
    svg_groups: Store.getters.getSvgGroups,
    ecommerce_cart_id:null,
    category_index: category_index,
    category_id: category_id,
    customized: Store.getters.getCustomized,
    personalized: Store.getters.getPersonalized,
    private_product: Store.getters.getPrivateProduct,
  }
}

const getImageFromCanvas = (side: string, options={}) => {
  const canvas_options = {...{original_width: 600, original_height: 600, image_type: 'image/png', width: 1200, height: 1200, zoom: 2}, ...options}
  let canvas = Store.getters.getCanvasImage.scene.frontCanvas
  if(side == 'back') {
    canvas = Store.getters.getCanvasImage.scene.backCanvas
  }
  if(canvas) {
    canvas.discardActiveObject().renderAll()
    const original_transform = canvas.viewportTransform
    const original_zoom = canvas.getZoom()
    canvas.setHeight(canvas_options.height)
    canvas.setWidth(canvas_options.width)
    canvas.viewportTransform = Store.getters.getCanvasImage.scene.default_view_port
    canvas.setZoom(canvas_options.zoom)
    const base64_image = canvas.toDataURL(canvas_options.image_type)
    canvas.setHeight(canvas_options.original_height)
    canvas.setWidth(canvas_options.original_width)
    canvas.viewportTransform = original_transform
    canvas.setZoom(original_zoom)
    return base64_image
  }
  return ""
}

const classObserver = (elems:Record<any, any>, callMethod:any, disconnect = false) => {
  const attrObserver = new MutationObserver((mutations) => {
    mutations.forEach(mu => {
      if (mu.type !== "attributes" && mu.attributeName !== "class") return;
      callMethod(mu)
    });
  });

  elems.forEach(el => attrObserver.observe(el, {attributes: true}));
  if(disconnect){
    elems.forEach(el => attrObserver.disconnect());
  }
}

const getDefaultColorsObject = () => {
  return [
    {title: 'Color One', color: null, pantone: null, name: null},
    {title: 'Color Two', color: null, pantone: null, name: null},
    {title: 'Color Three', color: null, pantone: null, name: null},
    {title: 'Color Four', color: null, pantone: null, name: null}]
}

const setDefaultColors = () => {
  const default_colors_object = getDefaultColorsObject()
  const logo_colors = Store.getters.getLogoColorsInfo('colors')
  logo_colors.forEach((logo_color, logoColorIndex) => {
    default_colors_object[logoColorIndex].color = logo_color.hex
    default_colors_object[logoColorIndex].pantone = logo_color.pantone
    default_colors_object[logoColorIndex].name = logo_color.name
  })
  Store.commit('SET_DEFAULT_COLORS', default_colors_object)
}

const getExtensionsFor = (type = '') => {
  const type_extensions = {
    raster: ['jpg','gif','png','jpeg'],
    vector: ['svg', 'pdf', 'ai', 'eps', 'tiff']
  }
  if(type) {
    return type_extensions[type]
  } else {
    return [...type_extensions['raster'], ...type_extensions['vector']]
  }
}

const validateLogoType = (type: string, file_name:string) => {
  const type_extensions = getExtensionsFor(type)
  const file_extension = getExtensionFromString(file_name)
  return type_extensions.includes(file_extension)
}

const getExtensionFromString = (string: string) => {
  let extension: string|null = null
  if(string) {
    extension =  string.substr(string.lastIndexOf('.') + 1).toLowerCase()
  }
  return extension
}

const getUrlParameter = (name = '') => {
  if(name) {
    // const url = window.parent.window.location.href
    const url = getWindowObject().window.location.href
    name = name.replace(/[[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
  // const hash_url = window.parent.window.location.hash
  const hash_url = getWindowObject().window.location.hash
  return hash_url.replace('#/', '')
}

const routerPush = (router, route_name) => {
  const router_url = router.resolve({name: route_name})
  if(router_url) {
    // window.parent.window.location.hash = router_url.href;
    getWindowObject().window.location.hash = router_url.href;
  }
}

const showError = (err) => {
  if (typeof err === 'string') {
    VsToast.show({
      title: err,
      variant: 'error',
      timeout: 5000,
      position: "bottom-left"
    });
  } else {
    const errors = err.response.data.errors;
    const errArr: string[] = [];
    Object.keys(errors).map((field) => {
      errArr.push(errors[field][0]);
    });
    errArr.forEach(element => {
      VsToast.show({
        title: element,
        variant: 'error',
        duration: 5000,
        position: 'bottom-left'
      });
    })
  }
}

const getLogoUpdatedProps = (updated_logo: Record<any, any>) => {
  return {
    id: updated_logo.id, url: updated_logo.url, original_logo: updated_logo.original_logo_url, original_logo_url: updated_logo.original_logo_url,
    transparent_logo: updated_logo.transparent_logo_url, smart_transparent_logo: updated_logo.smart_transparent_logo_url,
    is_smart_transparent: updated_logo.is_smart_transparent ? true : false, is_vector: updated_logo.is_vector ? true : false,
    logo_name: updated_logo.logo_name, is_replace_success: updated_logo.is_replace_success ? true : false
  }
}

const getSantaModalConfig = () => {
  /*
  * icon = {success, error, info}
  * */
  return {
    name: 'santa-confirm-modal', icon: 'success', title: '', text: 'This is default text', confirm_text: 'Ok', cancel_text: null,
    click_to_close: false, close_on_confirm: false
  }
}

const getDomDocument = (parent_doc= false) => {
  if(parent_doc) {
    // return window.parent.document
    return getWindowObject().document
  }
  const dom_document = document.querySelector(getWebComponentNames())
  return dom_document ? dom_document?.shadowRoot : document
}

const getLockerColors = async (callback ?:(any) ) => {
  const is_auth = Store.getters.isCustomerAuthenticated
  if(is_auth) {
    const response: any = await http.get("locker_with_colors").catch((errorResponse: AxiosError) => {
      handleResponseException(errorResponse)
    })
    if(response) {
      const response_data: Record<any, any> = response.data;
      if (response_data) {
        await Store.dispatch('setLockerroomColors', response_data);
        if(callback){
          await callback();
        }
      }
    }
  }
}

const urlToBase64 = async (urls) => {
  const response = await http.post('url_to_base64', {file_urls: urls}).catch((errorResponse) => {
    console.error('Error while converting url to base64', errorResponse)
  })
  return response ? response.data.result.base64_files : []
}

const getWebComponentNames = (return_string = true): any => {
  if(return_string) {
    return "v-customizer, v-order-detail"
  } else {
    return ["v-customizer, v-order-detail"]
  }
}

const isShadowDom = () => {
  return document.querySelector(getWebComponentNames()) ? true : false
}

const hideLockerProductSaveBtn = (hide_save_button = false) => {
  const product_edit_info_obj = Store.getters.getProductEditInfoObject
  const hide_locker_update_btn = Store.getters.getHideSaveLockerButton
  if(product_edit_info_obj.type == 'locker_product' && hide_locker_update_btn == true) {
    Store.commit('SET_HIDE_SAVE_LOCKER_BUTTON', hide_save_button);
  }
}

const santaClone = (object: any) => {
  return JSON.parse(JSON.stringify(object))
}

const setUndoRedoItems = async (items_type: string, action_on_items: string, user_action = 'undo') => {
  switch (items_type) {
    case 'customLogos':
      Store.commit('SET_UNDO_REDO_ITEMS', {action: user_action, data: {
          key: items_type, action_on_items: action_on_items, [items_type]: santaClone(await Store.getters.getCustomLogos()),
          meta: {
            logo_colors_info: santaClone(await Store.getters.getLogoColorsInfo())
          }
        }})
      break;
    case 'groupColors':
      Store.commit('SET_UNDO_REDO_ITEMS', {action: user_action, data: {
          key: items_type, action_on_items: action_on_items, [items_type]: santaClone(await Store.getters.getGroupColors)
        }})
      break;
    case 'customTexts':
      Store.commit('SET_UNDO_REDO_ITEMS', {action: user_action, data: {
        key: items_type, action_on_items: action_on_items, [items_type]: santaClone(await Store.getters.getCustomTexts())
      }})
      break;
    case 'defaultColors':
      Store.commit('SET_UNDO_REDO_ITEMS', {action: user_action, data: {
          key: items_type, action_on_items: action_on_items, [items_type]: santaClone(await Store.getters.getDefaultColors),
          meta: {
            logo_colors_info: santaClone(await Store.getters.getLogoColorsInfo())
          }
        }})
      break;
    default:
      console.info(`In setUndoRedoItems the items type (${items_type}) is not handled`)
  }
}

const getCustomizerIframe = () => {
  // const iframes =  window.parent.document.querySelectorAll('iframe')
  const iframes =  getWindowObject().document.querySelectorAll('iframe')
  let customizer_iframe: any = null
  Array.from(iframes, (iframe) => {
    const get_customizer = iframe?.contentDocument?.querySelector('v-customizer')
    if(get_customizer) {
      customizer_iframe = iframe
    }
  })
  return customizer_iframe
}

const getWindowObject = () => {
  try {
    return window.parent
  } catch (error) {
    return window
    console.info('Error while getting window object', error)
  }
}



export {
  getLogoSettingsObject, getLogoObject, getRandom, getLogoSettings, setLogoSettings, getCustomLogos, fileToBase64, processColorsCustom,
  sortTextsArray, fontsColorsManipulation, fontsList, getReminderOptions, handleResponseException, logData, pathInfo,
  CustimooOrderFlowStatuses, getActiveProductData, getRosterDetailDefaultObject, activityStatus, urlToBase64,
  getFileExtensionType, getProductLogoSetting, getCompany, getPermissions, getUploadedLogoObject, initCustomLogos,
  getSelectedProductPantones, setRetrievedProductsCustomTexts, getEditModeDefaultObjFor, fetchUrlContent,
  unitConversion, rosterDefaultItem, authenticateUser, lastActiveProductDefaultObject, resetLastActiveProductData,
  getSVGNumberArraysFromRoster, getSVGNumbers, getSVGNames, getSVGNameArraysFromRoster, getLogoSVG, parseSvgStringFile,
  persistToken, fetchCustomer, setVueVersion, getTeamLogo, getSelectedProductData,getImageFromCanvas,getUrlParameter,
  rosterDetailsInit, initCustomLogosNew, getProductColors, logoColorInfoDefaultObject, recentLogoDefaultObject,
  getDefaultColorsObject, setDefaultColors, getExtensionFromString, exitFromEditMode, getExtensionsFor, validateLogoType, getLogoUpdatedProps,
  routerPush, getSantaModalConfig, getDomDocument, getWebComponentNames, isShadowDom, hideLockerProductSaveBtn, santaClone, setUndoRedoItems,
  classObserver, getCustomizerIframe, getWindowObject, getLockerColors
};
