import Store from '../store'
import rgbHex from "rgb-hex";
import {getClosestColor} from "@/pantoneColor";
import {default as $} from "jquery";
import {AxiosError} from "axios";
import Vue from "vue";
// @ts-ignore
import VsToast from '@vuesimple/vs-toast';
import {http} from "@/httpCommon";
import {find, findIndex, parseInt} from "lodash";
import {eventBus} from "@/event/eventBus"
import LZString from 'lz-string';
import Router from '../router/index'
import {fabric} from "fabric";
import {loadState, saveState} from "@/indexedDBPersistence";

const getLogoSettingsObject = (default_values = {}) => {
  const default_obj =  { id: null, product_id: null, product_style_id: null, following_product_ids: null, rotation: 0,
    originalWidth: 57, originalHeight: 57, width: 57, height: 57, name_of_placement: "chest", side: "front", x_axis: 300,
    y_axis: 300, x_axis_3d: 0, y_axis_3d: 0, is_locked: false, logo_name: null, original_logo: null, transparent_logo: null,
    smart_transparent_logo: null, original_logo_url: null, is_smart_transparent: null, url: null, haveControls: true,
    logo_colors: [], is_replace_success: false, logo_index: 0, is_vector: false
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
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for (let i = 0; i < length; i++) {
      rand_string += chars.charAt(Math.floor(Math.random() * chars.length))
    }
  } else {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
    x_axis_3d: 0,
    y_axis_3d: 0,
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

const processColorsCustom = (colors: any, logos_count= 4, color_type = 'color_type') => {
  const imageColors: any[] = []
  const uniqueColors: string[] = []
  if(colors && colors.length > 0) {
    if(colors[0] && colors[0].constructor.name == "Object") {
      return colors
    }
  }
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
    const pantoneColor = getClosestColor(color, selectProductPantonesList, getColorType('', null, color_type));
    imageColors.push({hex: pantoneColor.hex, pantone: pantoneColor.pantone, name: pantoneColor.name})
  })
  while(imageColors.length < logos_count ) {
    imageColors.push({hex: null, pantone: null, name: null})
  }
  return imageColors;
}

const getSelectedProductPantones = (product_id: null|number = null, svg_group = '') => {
  const product_pantones: Record<any, any>[] = []
  const product = product_id ? Store.getters.getProduct(product_id) : Store.getters.getProduct()
  if(product) {
    let colors
    if(svg_group && product.svg_group_color_container && product.svg_group_color_container[svg_group]) {
      colors = product.svg_group_color_container[svg_group].json_data
    } else {
      product.colors.forEach((product_colors: any, key: number) => {
        if (key == 0) {
          colors = product_colors.json_data
        }
      })
    }
    colors.forEach((color: Record<any, any>) => {
      const pantone = color.pantone ? color.pantone : ''
      product_pantones.push({pantone: pantone, name: color.name, hex: color.value});
    })
  }
  return product_pantones;
}

const getColorType = (svg_group = '', product_id: number|null = null, color_type = 'color_type') => {
  const product = product_id ? Store.getters.getProduct(product_id) : Store.getters.getProduct()
  if(svg_group && product && product.svg_group_color_container && product.svg_group_color_container[svg_group]) {
    return 'product_color'
  } else if(product && !product.is_custom_color_allowed && color_type == 'color_type') {
    return 'product_color'
  } else if(product.is_custom_color_allowed && Store.getters.getSetting(color_type) == 'product_color') { // if other colors allowed on product and color_type is 'product_color' then use logo_color_type
    return Store.getters.getSetting('logo_color_type')
  }
  return Store.getters.getSetting(color_type);
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
  return message;
}

const CustimooOrderFlowStatuses : Record<any, any> = {
  quote_requested: 'Quote Requested',
  quote_rejected: 'Quote Rejected',
  quote_provided: 'Quote Provided',
  pending_for_factory_assignment: 'Submitted for Factory Review',
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
    eventBus.$emit("storeCanvasImage")
    const interval = setInterval(async () => {
      const scene_ref = Store.getters.getCanvasImage.scene
      if (!(scene_ref && scene_ref.mounted)) {
        eventBus.$emit("storeCanvasImage")
        console.log('not reslove')
        return
      }
      clearInterval(interval)
      const selected_product = Store.getters.getSelectedProduct;
      const productCustomTexts = Store.getters.productCustomTexts(selected_product.id)
      const roster_details = Store.getters.getProductRosters()
      const roster_texts : Record<any, any> = {}
      const common : Record<any, any>[] = []
      const product_edit_info_obj = Store.getters.getProductEditInfoObject

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
              //todo there are some cases where font does not found then load first font. sometime custom text font family is null or font does not exists
              let font = products_fonts[custom_text.font_family]
              if(!font) {
                font = products_fonts[Object.keys(products_fonts)[0]]
              }

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

                      const boundingBox = path.getBoundingBox();
                      const ascenderHeight = Math.abs(boundingBox.y1);
                      const descenderHeight = Math.abs(boundingBox.y2);

                      const width = boundingBox.x2 - boundingBox.x1 + parseInt(custom_text_item.outline_width)
                      const height = ascenderHeight + descenderHeight + parseInt(custom_text_item.outline_width);

                      const svg_string = path.toSVG()
                      const parser = new DOMParser();
                      const dom_svg = parser.parseFromString(svg_string, "text/html").body.firstChild as SVGElement;
                      // dom_svg.style.translate = '0px ' + height + 'px'
                      text_item_object.svg_height = height.toString()

                      // Define padding values (adjust these as needed)
                      const paddingTop = 5; // Adjust top padding
                      const paddingLeft = 5; // Adjust left padding
                      const paddingRight = 5; // Adjust right padding
                      const paddingBottom = 5; // Adjust bottom padding

                      // Calculate the total height and width including padding
                      const totalHeight = ascenderHeight + descenderHeight + parseInt(custom_text_item.outline_width) + paddingTop + paddingBottom;
                      const totalWidth = boundingBox.x2 - boundingBox.x1 + paddingLeft + paddingRight;

                      // Calculate the translation to position the text properly within the SVG
                      const translateY = ascenderHeight + parseInt(custom_text_item.outline_width) / 2 + paddingTop;
                      const translateX = -boundingBox.x1 + paddingLeft;

                      // Apply the translation to the SVG
                      dom_svg.setAttribute('transform', 'translate(' + translateX + ' ' + translateY + ')');

                      // Set SVG width and height to accommodate the padded text
                      dom_svg.setAttribute('width', totalWidth.toString());
                      dom_svg.setAttribute('height', totalHeight.toString());

                      dom_svg.setAttribute('paint-order', 'stroke')
                      dom_svg.setAttribute('stroke-location', 'outside')

                      const svg_with_tag = '<?xml version="1.0" encoding="utf-8"?>\n' +
                        '<svg stroke-location="outside" paint-order="outside" style="width:100%; height: auto;" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xml:space="preserve" ' +
                        'viewBox="0 0 ' + totalWidth + ' ' + totalHeight + '"> \n' + dom_svg.outerHTML + '\n</svg>'

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

      const style_index = Store.getters.getCurrentStyleIndex;
      const product_style = selected_product.productstyles[style_index];
      const {grouped_addons: selected_grouped_addons, ungrouped_addons: selected_ungrouped_addons} = await getStyleSelectedAddons(product_style)
      const productEditInfo = Store.getters.getProductEditInfoObject;
      let product_name = selected_product.display_name;
      const product_display_name = product_name;
      //selected_design will always return array having single object
      const selected_design = product_style.productdesigns.filter((design: Record<any, any>) => design.design_show == 1)[0];

      let design_name = selected_design.design_name;
      if(productEditInfo.editing && productEditInfo.type == 'locker_product') {
        const lockerEditProduct = productEditInfo.locker_product_info;
          design_name = `${lockerEditProduct.locker_product_name} - ${design_name}`
      }
      product_name = `${product_name} - ${design_name}`;
      const sku_information = Store.getters.getSkuInformation;
      const back_image = getImageFromCanvas('back')
      const front_image = getImageFromCanvas('front')
      const fixed_logo_index = Store.getters.getFixedLogoIndex;
      const custom_logos_original = Store.getters.getCustomLogos();
      let custom_logos_filtered = []
      if(custom_logos_original && Object.keys(custom_logos_original).length) {
        custom_logos_filtered = custom_logos_original.filter(custom_logo => {
          return custom_logo && 'id' in custom_logo
        })
      }
      let reorder_data: Record<any, any>|null = {}
      if(product_edit_info_obj && product_edit_info_obj.type == "reorder_product") {
        reorder_data = getReorderDataDefaultObject();
        reorder_data.order_id = product_edit_info_obj.reorder_product_info.order_id
        reorder_data.order_number = product_edit_info_obj.reorder_product_info.order_number
        reorder_data.order_item_id = product_edit_info_obj.reorder_product_info.order_item_id
        reorder_data.factory_id = product_edit_info_obj.reorder_product_info.factory_id
        reorder_data.factory_name = product_edit_info_obj.reorder_product_info.factory_name
        reorder_data.factory_product_id = product_edit_info_obj.reorder_product_info.factory_product_id
      } else if(product_edit_info_obj && product_edit_info_obj.type == "cart_product" && product_edit_info_obj.cart_product_info.reorder_data) {
        reorder_data =  product_edit_info_obj.cart_product_info.reorder_data;
      } else {
        reorder_data = null
      }

      const productPriceObject: Record<any, any> | null = Store.getters.getProductPriceObject;
      let product_price = 0;
      let quantity = 0;
      let currency_code = "";
      let currency_symbol = "";
      if (productPriceObject !== null && productPriceObject !== undefined) {
        product_price = productPriceObject.product_price ? productPriceObject.product_price : 0;
        quantity = productPriceObject.total_quantity ? productPriceObject.total_quantity : 0;
        if (productPriceObject.active_currency) {
          currency_code = productPriceObject.active_currency.code ? productPriceObject.active_currency.code : '';
          currency_symbol = productPriceObject.active_currency.symbol ? productPriceObject.active_currency.symbol : '';
        }
      }

      const post_data: Record<any, any> = {
        back_image: back_image,
        custom_logos: custom_logos_filtered,
        fixed_logo_index: fixed_logo_index,
        measurement_ratio: selected_product.measurement_ratio,
        custom_logo_svgs: [],
        product_custom_texts: productCustomTexts,
        product_custom_text_objects: {roster: roster_texts, common: common},
        colors: Store.getters.getLogosColors,
        design_id: selectedDesign().id,
        defaultcolors: scene_ref.appliedDefaultColors,
        front_image: front_image,
        groupcolors: scene_ref.appliedGroupColors,
        logo_colors: Store.getters.getLogosColors,
        model_description: sku_information.product_model_description,
        sku_number: sku_information.sku_number,
        sizechart_reference: sku_information.sizechart_reference,
        minimum_order_quantity: sku_information.minimum_order_quantity,
        minimum_order_quantity_type: sku_information.minimum_order_quantity_type,
        product_id: selected_product.product_id,
        ecommerce_post_id: (selected_product.ecommerceproduct.length > 0) ? selected_product.ecommerceproduct[0].ecommerce_product_id : '',
        ecommerce_variant_id: (selected_product.ecommerceproduct.length > 0) ? selected_product.ecommerceproduct[0].ecommerce_variant_id : '',
        ecommerce_modifier_id: (selected_product.ecommerceproduct.length > 0) ? selected_product.ecommerceproduct[0].ecommerce_modifier_id : '',
        sync_id: (selected_product.ecommerceproduct.length > 0) ? selected_product.ecommerceproduct[0].sync_id : '',
        size_variants_mapping: (selected_product.ecommerceproduct.length > 0) ? selected_product.ecommerceproduct[0].size_variants : null,
        product_type: selected_product.product_type,
        product_name: product_name,
        product_display_name,
        pdf_file: null,
        production_url: selected_design.production_design?.file_url ? `${process.env.VUE_APP_STORAGE_URL}${selected_design.production_design.file_url}.svg` : null,
        // front_design:front_design,
        product_roster_detail: Store.getters.getProductRosters(),
        style_id: product_style.id,
        style_name: product_style.name,
        addons: selected_product.active_addons.filter(addon => {
          return addon.selected;
        }),
        product_price_object:{ product_price, currency_code, currency_symbol, quantity },
        svg_groups: Store.getters.getSvgGroups,
        svg_parts: scene_ref.parts,
        shuffle_color_number: Store.getters.getShuffleColorNumber,
        ecommerce_cart_id:null,
        reorder_data,
        is_custom_product: false,
        grouped_addons: selected_grouped_addons,
        ungrouped_addons: selected_ungrouped_addons,
        group_patterns: Store.getters.getGroupPatterns,
      }
      let grouped_selected_addons = []
      if(selected_product.group_addons && selected_product.group_addons.length > 0) {
        grouped_selected_addons = selected_product.group_addons.filter((group_addon, group_name) => {
          return group_addon.selected;
        })
        if(grouped_selected_addons.length > 0) {
          post_data.addons = post_data.addons.concat(grouped_selected_addons)
        }
      }


      if(selected_product.is_3d_product) {
        const three_d_scene = Store.getters.getCanvasImage.scene
        const objects = three_d_scene.cloneFabricObjects(three_d_scene.canvas.getObjects())
        const group = new fabric.Group(objects)
        const element = three_d_scene.$refs.temp_canvas as HTMLCanvasElement
        const tempCanvas = new fabric.Canvas(element);
        tempCanvas.setWidth(three_d_scene.canvas.width);
        tempCanvas.setHeight(three_d_scene.canvas.height);
        group.set('flipY', true);
        tempCanvas.add(group);
        tempCanvas.requestRenderAll()

        post_data.svg_content = tempCanvas.toSVG()
        tempCanvas.dispose()
      } else {
        const svg_content = await fetchUrlContent(post_data.production_url);
        const production_file = await parseSvgStringFile(svg_content, post_data);
        post_data.svg_content = production_file
      }

      resolve(post_data)
    }, 500)
  })
}

const selectedDesign = () : Record<any, any> => {
  const style_index = Store.getters.getCurrentStyleIndex;
  const product_style = Store.getters.getSelectedProduct.productstyles[style_index];
  return product_style.productdesigns.filter((design: Record<any, any>) => design.design_show == 1)[0];
}

const syncGroupColorsWithSvgGroups = async() => {
  const groupColors = Store.getters.getGroupColors
  const svgGroups = Store.getters.getSvgGroups

  const group_ids: string[] = []
  svgGroups.forEach((svgGroup: Record<any, any>) => {
    group_ids.push(svgGroup.id)
    if(!groupColors[svgGroup.id]) {
      if (svgGroup.gradient_colors) {
        groupColors[svgGroup.id] = {gradient_colors: svgGroup.gradient_colors}
      } else {
        groupColors[svgGroup.id] = {color: svgGroup.color, name: svgGroup.name, pantone: svgGroup.pantone}
      }
    }
  })
  const group_colors_keys = Object.keys(groupColors)
  group_colors_keys.forEach((group_colors_key) => {
    if(!group_ids.includes(group_colors_key)) {
      delete groupColors[group_colors_key]
    }
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
      size: productSizes[0].name,
      quantity: 1,
      information: ''
    }
  }
  return {}
}

const activityStatus = {
  quote_requested: {
    title: "Quote Requested",
    message: "Quote requested by customer.",
  },
  quote_updated: {
    title: "Quote Updated",
    message: "Quote updated by customer.",
  },
  quote_provided: {
    title: "Quote Provided",
    message: "Quote provided by merchant.",
  },
  quote_rejected: {
    title: "Quote Rejected",
    message: "Quote rejected by customer.",
  },
  submitted_for_factory_review: {
    title: "Order created",
    message: "Your order has been created and is awaiting confirmation.",
  },
  order_approve: {
    title: "Order Confirmed, Pending Artwork",
    message: "Your order has been forwarded to the factory. They will review the logos and design for accuracy and quality, making any necessary adjustments for optimal printing.",
  },
  order_cancel: {
    title: "Cancelled",
    message: "Your order has been cancelled.",
  },
  factory_approved: {
    title: "Artwork Approved, Pending Test Print",
    message: "The factory has approved your artwork. Expect a physical sample to be uploaded within 72 hours (Monday to Friday).",
  },
  factory_rejected: {
    title: "Artwork Rejected",
    message: "You rejected the Artwork. Please wait for the customer to edit and submit the artwork again.",
  },
  submitted_for_customer_review: {
    title: "Design Sample Submitted",
    message: "<p>The factory has provided sample images. Once the test print(s) are approved, full production will begin.</p>\n" +
      "    <p><strong class='font-weight-bold'>Note:</strong> Any changes or comments before test print approval may delay production. Production starts after test print approval.</p>\n" +
      "    \n" +
      "    <ul class=\"square-list\">\n" +
      "        <li><strong class='font-weight-bold'>Sublimation Production Time:</strong> ~2 weeks</li>\n" +
      "        <li><strong class='font-weight-bold'>Tackle Twill Production Time:</strong> 4-5 weeks</li>\n" +
      "    </ul>.",
  },
  customer_approved: {
    title: "Design Sample Approved",
    message: "You have approved samples.",
  },
  customer_rejected: {
    title: "Design Sample Rejected",
    message: "You have rejected the sample. Please wait for new samples from the manufacturer.",
  },
  production_files_uploaded: {
    title: "Production Files uploaded",
    message: "Production Files uploaded",
  },
  in_production: {
    title: "In Production",
    message: "<p>The factory has started manufacturing your products. <strong class='font-weight-bold'>Important:</strong> No further changes can be made at this stage.</p>\n" +
      "    \n" +
      "    <ul class=\"square-list\">\n" +
      "        <li><strong class='font-weight-bold'>Sublimation Production Time:</strong> ~2 weeks</li>\n" +
      "        <li><strong class='font-weight-bold'>Tackle Twill Production Time:</strong> 4-5 weeks</li>\n" +
      "    </ul>",
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
  const company = Store.getters.getCompany
  if(!company.id) {
    const res = await http.get('company').catch(error => {
      handleResponseException(error)
      console.info("error while getting company", error)
    })
    if (res && res.status == 200) {
      Store.dispatch("companyAction", res.data.company)
    } else {
      Store.dispatch("companyAction", null)
    }
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
  Store.commit("SET_PRODUCT_CUSTOM_TEXTS", { append: true, value: santaClone(retrieved_products_custom_texts) })
}
//type could be locker_product, cart_product, order_product, reorder_product
const getEditModeDefaultObj = (prop='') => {
  const cart_product_info = { cart_item_index: null, cart_item_id: null, cart_item_product_index: null, cart_item_product: null, meta_info: null }
  const order_product_info =  {
    activity_items: [], factory_id: null, factory_products: [], active_product_id: null, item_id: null, activity_id: null,
    style_id :null, design_id : null, factory_product_active_index : 0, paginate: false
  }
  const reorder_product_info = {
    order_id: null, order_number: null, order_item_id: null, factory_product_id: null, active_product_id: null, style_id: null,
    design_id: null, factory_id: null,  factory_name: null
  }
  const locker_product_info = { product_id: null, locker_product_id: null, style_id: null, design_id: null, meta_info: null}
  const filters =  { customized: true, personalized: false, search_products: '' }
  const default_obj = {
    editing: false, type: '', filters: filters, locker_product_info: locker_product_info, cart_product_info: cart_product_info,
    order_product_info: order_product_info, reorder_product_info: reorder_product_info
  }
  if(prop) {
    return default_obj[prop] ? default_obj[prop] : null
  } else {
    return default_obj
  }
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

const getDocFromString = (doc_string: string, type: DOMParserSupportedType ="image/svg+xml") => {
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
    $(svg_doc).find(`[id]`).each (function(doc_item, doc_item_element) {
      let doc_elem_id = $(this).attr("id");
      if(doc_elem_id) {
        doc_elem_id = doc_elem_id.search("_") >= 0 ? doc_elem_id.substring(0, doc_elem_id.search("_")) : doc_elem_id
        if(doc_elem_id.toLowerCase() == svg_group_item.id.toLowerCase() && ($(doc_item_element)[0] as Record<any, any>).gradientUnits === undefined) { //exclude gradient item it self
          if(svg_group_item.gradient_colors) {
            let gradient_id = $(doc_item_element).attr('fill') as string
            gradient_id = gradient_id.substring(gradient_id.indexOf('(') + 1, gradient_id.lastIndexOf(')'))
            svg_group_item.gradient_colors.forEach((gradient_color: Record<any, any>, g_index: number) => {
              $(svg_doc).find(gradient_id).children().eq(g_index).css('stop-color', gradient_color.color)
            })
          } else {
            $(doc_item_element).attr("fill", svg_group_item.color);
            if($(doc_item_element).children().length > 0){
              $(doc_item_element).find('path').attr("fill", svg_group_item.color);
            }
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

    let logo_max_width = 0;
    const scene_ref = Store.getters.getCanvasImage.scene
    if((factory_product.custom_logos.length >= 1)) {
      const custom_logos_without_base64 = santaClone(factory_product.custom_logos.filter((custom_logo:Record<any,any>) => {
        return (Object.prototype.hasOwnProperty.call(custom_logo,'url') && custom_logo.url !== "" && custom_logo.url !== null)
      }))
      if(custom_logos_without_base64.length > 0) {
        custom_logos_without_base64.forEach((logo: Record<any, any>) => {
          logo.base_64 = scene_ref.custom_logo_objects[logo.logo_index].getBase64()
        })
        const payload = getLogoSVG(custom_logos_without_base64, factory_product.measurement_ratio, production_file_initial_dimension);
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

    const common_array: Record<any,any> [] = getSVGCommonArraysFromRoster(factory_product);
    const svg_common_payload = getSVGCommonItems(common_array, production_file_initial_dimension, name_logo_number_max_width);
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
    applyColorToSVG(factory_product, svg_doc as SVGTextElement|Document);
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
  return {value: '0', unit: ''};
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
    text: '', number: '', size: '', quantity: 1, information: ''
  }
}

const logData = (...args: Record<any, any>[]) => {
  const data: Record<any, any> = {}
  args.forEach((arg, arg_index) => {
    data[arg_index] = arg
  })
  console.log('Logging data', data)
}

const authenticateUser = async (token: string, only_authenticate= false) => {
  const customer = await Store.dispatch('getCustomerFromToken', token)
  if (customer){
    const payload = {
      access_token: token,
      user: customer
    }
    Store.commit('SET_CUSTOMER', payload)
    if(!localStorage.getItem(Vue.prototype.$browserToken_localstorage_key)){
      await Store.dispatch('setBrowserToken')
    }
    if(only_authenticate) {
      return true;
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
    fixed_logo_index: 0, category_index: 0, category_id: null, design_index: 0, design_id: null, product_index: 0, product_id: null, search_products: null, style_index: 0, style_id: null,
    page_no: 1, customized: true, personalized: false, private_product: false, product_custom_texts: {}, custom_logos: {}, default_colors: [], group_colors: {}, logo_colors: [],
    roster_detail: [], products_rosters: {}, shuffle_color_number: 1, addons_info: {}, group_patterns: {}
  }
  return {...default_obj, ...keys_default_values}
}

const getDataToSetLastActiveProduct = () => {
  let last_active_product_default_object = lastActiveProductDefaultObject();

  const selected_product = Store.getters.getSelectedProduct;
  if(selected_product){
    const style_index = Store.getters.getCurrentStyleIndex;
    const product_style = selected_product.productstyles[style_index];
    const design_index = findIndex(product_style.productdesigns, (design: Record<any, any>) => design.design_show == 1)
    const selected_design = product_style.productdesigns[design_index]
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
    last_active_product_default_object = lastActiveProductDefaultObject({
      category_index: category_index,
      category_id: category_id,
      design_index: design_index,
      design_id: selected_design.id,
      product_index: Store.getters.getSelectedIndex,
      product_id: selected_product.product_id,
      search_products: null,
      style_index: style_index,
      style_id: product_style.id,
      page_no: Store.getters.getProductsNextPageNo? Store.getters.getProductsNextPageNo - 1 : 1,
      customized: Store.getters.getCustomized,
      personalized: Store.getters.getPersonalized,
      private_product: Store.getters.getPrivateProduct,
      product_custom_texts: Store.getters.productCustomTexts(),
      custom_logos: Store.getters.getCustomLogos('all'),
      default_colors: Store.getters.getDefaultColors,
      group_colors: Store.getters.getGroupColors,
      logo_colors: Store.getters.getLogosColors,
      roster_detail: Store.getters.getProductRosters(),
      products_rosters: Store.getters.getProductRosters('all'),
      group_patterns: Store.getters.getGroupPatterns,
    })
  }
  return last_active_product_default_object;
}

const resetLastActiveProductData = async () => {
  Store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", lastActiveProductDefaultObject())
}

const exitFromEditMode = async () => {
  Store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", getEditModeDefaultObj())
}

const persistToken =  (to:Record<any,any>, from:Record<any,any>) => {
  let jwtToken = localStorage.getItem(Vue.prototype.$jwtToken_localstorage_key)
  if(to.query && to.query.token && jwtToken){
    if(jwtToken === to.query.token){
      const adminToken = localStorage.getItem(Vue.prototype.$adminToken_localstorage_key);
      if(adminToken){
        localStorage.setItem(Vue.prototype.$jwtToken_localstorage_key,adminToken);
        jwtToken = localStorage.getItem(Vue.prototype.$jwtToken_localstorage_key);
      }
    }
    else{
      jwtToken = to.query.token;
      if(jwtToken){
        localStorage.setItem(Vue.prototype.$jwtToken_localstorage_key,jwtToken);
        localStorage.setItem(Vue.prototype.$adminToken_localstorage_key,jwtToken);
      }
    }
  }
  else if(!jwtToken){
    const adminToken = localStorage.getItem(Vue.prototype.$adminToken_localstorage_key);
    if(adminToken){
      localStorage.setItem(Vue.prototype.$jwtToken_localstorage_key,adminToken);
      jwtToken = localStorage.getItem(Vue.prototype.$jwtToken_localstorage_key);
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


const getProductLogoTechnologies = (customLogoIndex,customLogo) => {
  let product_logo_technologies:  Record<any, any>[] = []
  const product_id = Store.getters.getSelectedProductId
  const product_obj = Store.getters.getProduct(product_id)

  if(product_obj) {
    const current_logo_settings = getLogoSettings(customLogoIndex,false,product_id);
    for (const logo_setting_id in product_obj.logo_technologies) {      
      if(logo_setting_id == current_logo_settings.id){
        product_logo_technologies = product_obj.logo_technologies[logo_setting_id];
      }
    }
  }
  return product_logo_technologies
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

const getImageFromCanvas = (side: string, options={}, scene=null) => {
  eventBus.$emit("storeCanvasImage")
  const canvas_options = {...{original_width: 600, original_height: 600, image_type: 'image/png', width: 1200, height: 1200, zoom: 2}, ...options}
  const is_3d_product = Store.getters.getSelectedProduct?.is_3d_product
  if(is_3d_product) {
    const three_d_scene = scene? scene : Store.getters.getCanvasImage.scene
    three_d_scene.canvas.discardActiveObject().renderAll()
    if(side == 'back') {
      three_d_scene.backAnimate()
    } else {
      three_d_scene.frontAnimate()
    }
    const base64_image = three_d_scene.renderer.domElement.toDataURL(canvas_options.image_type)
    setTimeout(() => {
      three_d_scene.animate()
    })
    return base64_image;
  }
  //@ts-ignore
  let canvas = scene ? scene.frontCanvas : Store.getters.getCanvasImage.scene.frontCanvas
  if(side == 'back') {
    //@ts-ignore
    canvas = scene ? scene.backCanvas : Store.getters.getCanvasImage.scene.backCanvas
  }
  if(canvas) {
    canvas.discardActiveObject().renderAll()
    const original_transform = canvas.viewportTransform
    canvas.setHeight(canvas_options.height)
    canvas.setWidth(canvas_options.width)
    canvas.viewportTransform = [2, 0, 0, 2, 0, 0]
    canvas.requestRenderAll()
    const base64_image = canvas.toDataURL(canvas_options.image_type)
    canvas.setHeight(canvas_options.original_height)
    canvas.setWidth(canvas_options.original_width)
    canvas.viewportTransform = original_transform
    canvas.requestRenderAll()
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
    {color: null, pantone: null, name: null},
    {color: null, pantone: null, name: null},
    {color: null, pantone: null, name: null},
    {color: null, pantone: null, name: null}]
}

const setDefaultColors = (again_from_logo = false) => {
  const default_colors_object = getDefaultColorsObject()
  let logo_colors = [ ...Store.getters.getLogoColorsInfo('colors') ]
  if(again_from_logo) {
    logo_colors = [ ...Store.getters.getLogoColorsInfo('extracted_colors') ]
  }
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
  let extension = ''
  if(string) {
    extension =  string.substr(string.lastIndexOf('.') + 1).toLowerCase()
  }
  return extension;
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
    if(results[2].includes('?reloaded')) {
      results[2] = results[2].split('?')[0]
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
  // const hash_url = window.parent.window.location.hash
  let hash_url = getWindowObject().window.location.hash
  if(hash_url.includes('?reloaded')) {
    hash_url = hash_url.split('?')[0]
  }
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
//todo when changing props in this method make sure to update the same method in admin project helper.ts file
const getLogoUpdatedProps = (updated_logo: Record<any, any>) => {
  const updated_props: Record<any, any> = {
    id: updated_logo.id, url: updated_logo.url, original_logo: updated_logo.original_logo_url, original_logo_url: updated_logo.original_logo_url,
    transparent_logo: updated_logo.transparent_logo_url, smart_transparent_logo: updated_logo.smart_transparent_logo_url,
    is_smart_transparent: updated_logo.is_smart_transparent ? true : false, is_vector: updated_logo.is_vector ? true : false,
    logo_name: updated_logo.logo_name, is_replace_success: updated_logo.is_replace_success ? true : false,
    logo_colors: updated_logo.logo_colors
  }
  return updated_props
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
    case 'groupPatterns':
      Store.commit('SET_UNDO_REDO_ITEMS', {action: user_action, data: {
          key: items_type, action_on_items: action_on_items, [items_type]: santaClone(await Store.getters.getGroupPatterns)
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

const getSize = (obj): string => {
  const obj_type = obj.constructor.name
  let str = obj;
  if(obj_type == 'Object') {
    str = JSON.stringify(obj);
  }
  const bytes = new Blob([str]).size;
  const megabytes = (bytes / (1024 * 1024)).toFixed(2);
  return megabytes;
}

const getDeviceInfo = () => {
  const user_agent: string = navigator.userAgent ?? '';
  const is_mobile =  /Mobi/.test(user_agent);
  const device_data = {
    is_mobile: is_mobile,
    device: '',
    browser: '',
    agent: user_agent
  }
  // @ts-ignore
  const browser_info = user_agent.match(/(firefox|chrome|safari|opera|edge|trident(?=\/))\/?\s*(\d+)/i);
  device_data.browser = browser_info ? browser_info[1].toLowerCase() : ''
  // @ts-ignore
  const device_info = user_agent.match(/Android|iPhone|iPad|iPod|Windows Phone/i);
  device_data.device = device_info ? device_info[0].toLowerCase() : '';
  return device_data;
}

const getCollectionLogoDefaultObj = (values={}): Record<any, any> => {
  const default_obj =  {
    id: null, collection_id: null, name: null, size: null, extension: null, file: null, path: null, sort_order: 0, is_recent_logo: false
  }
  return {...default_obj, ...values}
}


const getKeyItemFromLocalStorage = (key) => {
  const compressedValue = localStorage.getItem(key)
  if (compressedValue) {
    return  LZString.decompressFromUTF16(compressedValue)
  }
  return null
}

const setKeyItemFromLocalStorage = (key,value) => {
  const compressedValue = LZString.compressToUTF16(value)
  localStorage.setItem(key, compressedValue)
}

const removeKeyItemFromLocalStorage = (key) => {
  localStorage.removeItem(key)
}


const removeKeyInitialPersitantItems = () => {
 /* let persistant_plugin_key = 'custimo';
// @ts-ignore
  if(typeof custimoo_application_suppage_url !== 'undefined') {
    // @ts-ignore
    if(custimoo_application_suppage_url !== '' && custimoo_application_suppage_url !== null) {
      // @ts-ignore
      persistant_plugin_key += "-" + custimoo_application_suppage_url; // this variable declared in get-app-version js file
    }

  }*/
  const custimoo = getKeyItemFromLocalStorage('custimo');
  console.log(custimoo);
}

const getReOrderInfoObject = (default_value= {}): Record<any, any> => {
  //reorder_product will contain the factory product from order_items table that will be reordered
  const default_object = {
    is_reorder: false, order_item_id: null, factory_product_id: null, active_product_id: null, style_id: null, active_style_id: null,
    design_id: null, active_design_id: null, reorder_product: null
  }
  return   {...default_object, ...default_value}
}

const resetReorderInfoObject = (): void => {
  Store.commit('SET_REORDER_INFO_OBJECT', getReOrderInfoObject())
}

const checkIsEmpty = (obj: any) => {
  if(obj) {
    const obj_type = obj.constructor.name
    if(obj_type == "Array") {
      return obj.length == 0
    } else if(obj_type == "Object") {
      return Object.keys(obj).length == 0
    } else {
      return true
    }
  } else {
    return true;
  }
}

const hideLockerProductUpdateButton = async (hide_update_btn: boolean|undefined = undefined) => {
  if(hide_update_btn != undefined) {
    Store.commit('SET_HIDE_SAVE_LOCKER_BUTTON', hide_update_btn);
  }
  else {
    const product_edit_info_obj = Store.getters.getProductEditInfoObject
    const hide_locker_update_btn = Store.getters.getHideSaveLockerButton
    if(product_edit_info_obj.type == 'locker_product' && hide_locker_update_btn == true) {
      Store.commit('SET_HIDE_SAVE_LOCKER_BUTTON', false);
    }
  }
}

const updateLastActiveProductData = async (updated_data={}) => {
  const edit_product_info_obj = Store.getters.getProductEditInfoObject
  if(!edit_product_info_obj.editing) {
    const last_active_product_data = Store.getters.getLastActiveProductData
    const updated_last_active_data = JSON.parse(JSON.stringify({...last_active_product_data, ...updated_data}))
    Store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", updated_last_active_data)
  }
}

const getProductById = async (product_id: number, products: Record<any, any>[]) => {
  if(products.length == 0) {
    products = Store.getters.getProducts;
  }
  return products.find((product: Record<any, any>) => product.id == product_id)
}

const getProductPriceDefaultObject = (update_values={}) => {
  return { ...{
    show_price: false, product_price: 0, product_price_with_quantity: 0, addons_price:0, addons_price_with_quantity:0, logo_tech_price: 0, logo_tech_price_with_quantity:0,
      total_price:0 , total_quantity: 0, currency_code: null, active_currency: null, is_multi_prices: false, product_multi_prices : {}
    }, ...update_values }
}

const handleProductPriceUpdate = async (commit=true, product: Record<any, any>={}, product_sku_info:Record<any, any>={}):Promise<Record<any, any>> => {
  let product_sku = Store.getters.getSkuInformation
  let selected_product = Store.getters.getSelectedProduct
  const active_style_index = Store.getters.getCurrentStyleIndex
  let product_roster = Store.getters.getProductRosters()
  let show_product_price = isShowProductPrice()
  if(!checkIsEmpty(product)) {
    product_sku = product_sku_info
    selected_product = product
    product_roster = product.product_roster
    show_product_price = true
  }
  let roster_quantity_total = 0;
  product_roster.forEach(roster_item => {
    roster_quantity_total += parseInt(roster_item.quantity)
  })
  let product_price_object: Record<any, any> = {
    total_quantity: roster_quantity_total
  }
  if(selected_product && show_product_price) {
    if(!checkIsEmpty(product_sku) && product_sku.prices.length > 0) {
      const product_price = product_sku.prices[0].price ? product_sku.prices[0].price : 0;
      let addons_price = 0;
      let logo_tech_price = 0;
      selected_product.active_addons.forEach(addon => {
        if(addon.selected) {
          if(addon.currencies.length > 0) {
            addons_price =  addons_price + parseFloat(addon.currencies[0].price)
          }
        }
      })
      // grouped addons prices calculate
      const grouped_addons = selected_product.productstyles[active_style_index]?.customized_addons.grouped_addons;
      for(const group_name in grouped_addons) {
        grouped_addons[group_name].forEach(grouped_addon => {
          if(grouped_addon.selected) {
            if(grouped_addon.currencies.length > 0) {
              addons_price =  addons_price + parseFloat(grouped_addon.currencies[0].price)
            }
          }
        })
      }


      // ungrouped addons prices calculate
      selected_product.productstyles[active_style_index]?.customized_addons.ungrouped_addons.forEach(ungrouped_addon => {
        if(ungrouped_addon.selected) {
          if(ungrouped_addon.currencies.length > 0) {
            addons_price =  addons_price + parseFloat(ungrouped_addon.currencies[0].price)
          }
        }
      })
      const customLogos = Store.getters.getCustomLogos();
      if(customLogos && customLogos.length > 0){
        customLogos.forEach((customlogo:any) => {
          // delete customlogo.logo_technologies;
          if(customlogo.logo_technology){
              if(customlogo.logo_technology.price) {
                logo_tech_price =  logo_tech_price + parseFloat(customlogo.logo_technology.price)
              }
          }
        })
      }
      
      // manage logo technology prices. 
      let product_price_with_quantity = product_price * roster_quantity_total;
      const addons_price_with_quantity =  addons_price * roster_quantity_total;
      const logo_tech_price_with_quantity =  logo_tech_price * roster_quantity_total;


      let is_multi_prices = false;
      const product_multi_prices : Record<any, any> = {};
      if(isEcommercePlatform()) {
        const ecommerce_product = selected_product.ecommerceproduct[0];
        if(ecommerce_product.size_variants) {
          is_multi_prices = true;
          const size_variants = ecommerce_product.size_variants;
          product_price_with_quantity = 0;
          product_roster.forEach(roster_item => {
            const roster_price = parseFloat(size_variants[roster_item.size].price);
            const qty =  parseInt(roster_item.quantity);
            if(product_multi_prices[roster_item.size]) {
              const updated_qty =  product_multi_prices[roster_item.size].quantity + qty;
              product_multi_prices[roster_item.size] = { quantity : updated_qty, price : roster_price, sub_price : updated_qty * roster_price }
            }else {
              product_multi_prices[roster_item.size] = { quantity : qty, price : roster_price, sub_price : qty * roster_price }
            }

            product_price_with_quantity += qty * roster_price

          })

        }
      }

      const total_price = product_price_with_quantity + addons_price_with_quantity + logo_tech_price_with_quantity;
      product_price_object = {
        product_price: product_price, product_price_with_quantity: product_price_with_quantity, addons_price: addons_price,
        addons_price_with_quantity: addons_price_with_quantity,logo_tech_price: logo_tech_price, logo_tech_price_with_quantity: logo_tech_price_with_quantity,  total_price: total_price, total_quantity: roster_quantity_total,
        currency_code: product_sku.prices[0].code, active_currency: product_sku.prices[0], show_price: true, is_multi_prices, product_multi_prices
      }
    } else {
      product_price_object = getProductPriceDefaultObject();
    }
  }
  if(commit) {
    Store.commit('SET_PRODUCT_PRICE_OBJECT', product_price_object )
  }
  return product_price_object;
}

const toggleProductAddons = async ():Promise<void> => {
  const selected_product = Store.getters.getSelectedProduct
  if(isShowProductPrice() && selected_product) {
    let addons_price = 0;
    selected_product.active_addons.forEach(addon => {
      if(addon.selected) {
        if(addon.currencies.length > 0) {
          addons_price += addon.currencies[0].price
        }
      }
    })
    Store.commit('SET_PRODUCT_PRICE_OBJECT', { addons_price:  addons_price})
  }
}

const isShowProductPrice = () => {
  const company_currency_info = Store.getters.getSetting('currencies')
  return company_currency_info && company_currency_info.visible
}

const initiateLocalStorageKeys = async ():Promise<void> => {
  const localstorage_keys = ['customer','jwtToken','adminToken','browserToken','actionBeforeLogin','logoDisclaimerInfo',
    'animPlayed','logo_modal_status'];
  localstorage_keys.forEach(key => {
    Vue.prototype['$' + key + '_localstorage_key'] = key;
  });
//Vue.prototype.$logo_modal_status_ls_key
// @ts-ignore
  if(typeof custimoo_application_suppage_url !== 'undefined') {
    // @ts-ignore
    if(custimoo_application_suppage_url !== '' && custimoo_application_suppage_url !== null) {
      localstorage_keys.forEach(key => {
        // @ts-ignore
        Vue.prototype['$' + key + '_localstorage_key'] = `${key}-${custimoo_application_suppage_url}`;
      });
    }
  }
}

const isGetCategories = async () => {
  const product_edit_info_object = Store.getters.getProductEditInfoObject
  const { type: editing_product_type } = product_edit_info_object;
  let get_categories = true;
  if(['cart_product', 'order_product'].includes(editing_product_type) || Router.currentRoute.query.update_cart) {
    get_categories = false;
  }
  return get_categories;
}

const factorial = (n: number) => {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

const getPermutation = (n: number, number_of_parts: number) => {
  const result: number[] = [];
  const sequences: number[] = [];
  const nums = [1, 2, 3, 4]
  let k = n - 1; // Convert to 0-based index

  while (nums.length > 0) {
    const fact = factorial(nums.length - 1);
    const index = Math.floor(k / fact);
    sequences.push(nums.splice(index, 1)[0]);
    k %= fact;
  }

  for (let i = 0; i < Math.ceil(number_of_parts / 4); i++) {
    sequences.forEach((sequence: number) => {
      const value = sequence + i * 4 - 1; // Scale and adjust the sequence value
      if (value < number_of_parts) {
        result.push(value);
      }
    });
  }
  return result;
}

const downloadTemplate = async (prod_id:any, product_name) => {
  await http.get(`template/download/${prod_id}`,{
    responseType: 'blob',
  }).then((res) => {
    const blob = new Blob([res.data],{type:res.headers['content-type']})
    const custom_document = getDomDocument(true);
    const link = custom_document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = 'product_'+ product_name +'_template.xlsx';
    link.click();
  })
}

const isFilePreviewable = (file_name: string) => {
  const extension = getExtensionFromString(file_name)
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension);
}

const getCustomLockers = () => {
  return new Promise((resolve, reject) => {
    const is_customer_authenticated = Store.getters.isCustomerAuthenticated
    let customer_lockers = [];
    if(is_customer_authenticated) {
      http.get("lockers_with_rosters").then((successResponse:Record<any, any>) => {
        const response_data = successResponse.data
        if (response_data.success) {
          customer_lockers = response_data.result.lockers
        }
        resolve(customer_lockers)
      }).catch((errorResponse: AxiosError) => {
        resolve([])
        handleResponseException(errorResponse)
      })
    }
    else {
      resolve([])
    }
  })
}

const getCustomProductData = async (custom_product_data: Record<any, any>={}) => {
  const selected_product: Record<any, any> = Store.getters.getSelectedProduct
  //mode = {cart_edit, order_edit, reorder}
  let edit_mode_info_obj:{ mode: string|null, item_id: number|null, factory_product_id: number|null, factory_product_index: number|null} =
    { mode: null, item_id: null, factory_product_id: null, factory_product_index: null }
  let {
    id: product_id, display_name: product_name, allow_name_number, product_type, sizes= [], productstyles: product_styles = [],
    active_addons = [], company_addons = [], product_addons = [], reorder_data = null, not_uploaded_assets = [],
    measurement_ratio
  } = selected_product;
  let fixed_logo_index = Store.getters.getFixedLogoIndex;
  let sku = Store.getters.getSkuInformation;
  let product_roster = Store.getters.getProductRosters()
  const price_info = Store.getters.getProductPriceObject
  const selected_style_index = Store.getters.getCurrentStyleIndex
  let selected_style_id = selected_style_index >= 0 ? product_styles[selected_style_index]?.id : product_styles[0]?.id;
  let existing_assets: Record<any, any> = []
  //if custom_product_data is not empty then get custom product initial data
  if(!checkIsEmpty(custom_product_data)) {
    const storage_url = process.env.VUE_APP_STORAGE_URL
    product_id = custom_product_data.product_id
    const custom_product_initial_data_response: any = await getCustomProductInitialData(product_id).catch((errorResponse: any) => {
      throw errorResponse;
    });
    const custom_product_initial_data: Record<any, any> = custom_product_initial_data_response.custom_product_initial_data;
    if('existing_assets' in custom_product_data && custom_product_data.existing_assets.length > 0) {
      existing_assets = custom_product_data.existing_assets
      not_uploaded_assets = custom_product_data.assets
    } else {
      existing_assets = custom_product_data.assets
    }
    existing_assets.forEach(existing_asset => {
      existing_asset.existing_asset = true
      existing_asset.path = `${existing_asset.path}`
    })
    fixed_logo_index = ('fixed_logo_index' in custom_product_data) ? custom_product_data.fixed_logo_index : 0;
    edit_mode_info_obj = custom_product_data.edit_mode_info_obj
    reorder_data = custom_product_data.reorder_data ? custom_product_data.reorder_data : null
    product_id = custom_product_data.product_id
    measurement_ratio = custom_product_initial_data.measurement_ratio
    product_name = custom_product_initial_data.display_name
    selected_style_id = custom_product_data.style_id
    allow_name_number = custom_product_initial_data.allow_name_number
    product_type = custom_product_initial_data.product_type
    sizes = custom_product_initial_data.sizes
    product_styles = custom_product_initial_data.productstyles
    active_addons = custom_product_initial_data.active_addons
    company_addons = custom_product_initial_data.company_addons
    product_addons = custom_product_initial_data.product_addons
    sku = custom_product_initial_data.sku
    product_roster = custom_product_data.product_roster_detail
    const existing_addons = custom_product_data.addons
    company_addons = custom_product_initial_data.company_addons
    product_addons = custom_product_initial_data.product_addons
    active_addons = custom_product_initial_data.active_addons
    active_addons = active_addons.map(active_addon => {
      const existing_addon = find(existing_addons, ["addon_id", active_addon.addon_id]);
      active_addon.selected = existing_addon ? !!existing_addon.selected : false
      return active_addon;
    });
  }
  let [{json_data: product_sizes}] = sizes
  product_sizes = product_sizes.map(product_size => ({ id: product_size.name, label: product_size.name}))
  return {
    id: product_id, name: product_name, allow_name_number, product_type: product_type, product_sizes, product_styles,
    selected_style_id: selected_style_id, active_addons, company_addons, product_addons, sku, product_roster, price_info,
    existing_assets, edit_mode_info_obj, reorder_data, not_uploaded_assets, measurement_ratio: measurement_ratio, fixed_logo_index: fixed_logo_index
  };
}

const getCustomProductInitialData = (product_id): Promise<Record<any, any>> => {
  return new Promise((resolve, reject) => {
    http.post(`custom_product/${product_id}/initial_data`).then((successResponse:Record<any, any>) => {
      const response_data = successResponse.data
      if (response_data.success) {
        resolve(response_data.result)
      } else {
        reject(response_data)
      }
    }).catch((errorResponse: AxiosError) => {
      reject(errorResponse)
    })
  })
}

const navigateToCustomProduct = async (factory_custom_product={}) => {
  const custom_product_data = await getCustomProductData(factory_custom_product).catch(errorResponse => {
    throw errorResponse
  })
  if(custom_product_data) {
    //@ts-ignore
    Router.push({
      // name: 'CustomDesign',
      name: 'UploadCustomDesign',
      params: {product_id: custom_product_data.id, customizeProduct: (custom_product_data as unknown) as string }
    });
  }
}

const getReorderDataDefaultObject = (update_values={}): Record<any, any> => {
  const default_object: Record<any, any> =  {
    order_id: null, order_number: null, order_item_id: null, factory_id: null, factory_name: null, factory_product_id: null,
    changes: [], roster_change: false, design_change: false
  }
  return {...default_object, ...update_values}
}

const getOrderUpdateIdentifier = (save_to_store=false) => {
  const date = new Date();
  const update_order_item_identifier =
    `${getRandom(5)}_${date.getDay()}${date.getMonth()}${date.getFullYear()}${date.getMinutes()}${date.getHours()}${date.getMilliseconds()}`;
  if(save_to_store) {
    Store.commit("SET_ORDER_ITEM_UPDATE_IDENTIFIER", update_order_item_identifier)
  }
  return update_order_item_identifier;
}

const createOrUpdateOrderUpdateDataState = async (updated_factory_product_index=-1, updated_factory_product= {}) => {
  const product_edit_info_object = Store.getters.getProductEditInfoObject
  const update_previous_factory_product = !checkIsEmpty(updated_factory_product) && updated_factory_product_index >= 0
  if(product_edit_info_object.type == "order_product") {
    let { factory_product_active_index, factory_products, item_id  } = product_edit_info_object.order_product_info
    factory_products = santaClone(factory_products)
    if(update_previous_factory_product) {
      factory_products[updated_factory_product_index] = updated_factory_product
    }
    let active_factory_product = factory_products[factory_product_active_index]
    const order_existing_updated_data = await loadState("order_updated_data")
    if(order_existing_updated_data ) {
      factory_products = order_existing_updated_data.order_updated_data
      if(update_previous_factory_product) {
        factory_products[updated_factory_product_index] = updated_factory_product
      }
      active_factory_product = factory_products[factory_product_active_index]
    }
    if(update_previous_factory_product || !order_existing_updated_data) {
      let identifier = ''
      if(order_existing_updated_data) {
        identifier = order_existing_updated_data.identifier
      } else {
        identifier = getOrderUpdateIdentifier(true)
      }
      saveState({ id: "order_updated_data", data:  {identifier: identifier, order_updated_data: factory_products  } })
    }
    return { item_id, factory_product_active_index, active_factory_product, factory_products }
  } else {
    return {}
  }
}
const updateOrder = async () => {
  const company = Store.getters.getCompany
  const order_existing_updated_data = await loadState("order_updated_data")
  const order_products_info_obj = Store.getters.getProductEditInfoObject;
  const order_item_id = order_products_info_obj.order_product_info.item_id;
  const url = `order_item/${order_item_id}/update/products`;
  return http.post(url, {factory_products: order_existing_updated_data}).then(async (res: any) => {
    await exitFromEditMode()
    if (res.data.success == true) {
      if (company && company.platform == 'wordpress') {
        window.location.href = `${company.company_domain}/my-account/orders`;
      } else {
        Router.push({name: "OrderDetail", params: {order_id: order_item_id}});
      }
    }
  });
}
const downloadNodeCollectionPDF = (collection_id) => {
  return new Promise((resolve, reject) => {
  http.get('download-collection-pdf/'+collection_id)
    .then(response => {
      if (response.data.error) {
        showError(response.data.message);
        reject(false);
      } else {
        const url = `${process.env.VUE_APP_STORAGE_URL}${response.data.pdf_link}`;
        // Open PDF in a new tab
        const newTab = window.open(url, '_blank');
        if (newTab) {
            newTab.focus();
            resolve(true);
        }
        else{
          reject(false)
        }
      }
    })
    .catch(error => {
      showError('PDF file generation is in progress. Please try again later.');
      reject(false);
    });
  });
}

const updateOrderProducts = (order_item: Record<any, any>, order_item_status_activity: number) => {
  Store.dispatch('resetStore')
  const company = Store.getters.getCompany
  const first_factory_product = order_item.factory_products[0];
  const query_param_obj: Record<any, any> = {
    customized:true, personalized:true, active_product_type: 'order_product', active_product_id: first_factory_product.product_id,
    item_id: order_item.id, activity_id: order_item_status_activity, style_id :first_factory_product.style_id,
    design_id : first_factory_product.design_id, factory_product_active_index : 0, paginate: false
  }
  if(isEcommercePlatform()) {
    const query_string = new URLSearchParams(query_param_obj).toString();
    window.location.href = `${company.company_domain}/${company.customizer_page_url}/#/?${query_string}`;
  } else {
    Router.push({ path: "/", query: query_param_obj });
  }
}




let shopifyExportCollectionStatusCheckerInterval: number | null = null;

const  startExportStatusChecker = () => {
  // Exit if the interval is already running
  if (shopifyExportCollectionStatusCheckerInterval !== null) {
    return;
  }

  shopifyExportCollectionStatusCheckerInterval = window.setInterval(() => {
    const exporting_collections = Store.getters.getExportingCollections.map((collection: { id: number }) => collection.id);

    if (exporting_collections.length > 0) {
      http.post('check-ecommerce-collections-status', { exporting_collection: exporting_collections })
        .then((res) => {
          const exportedCollections = res.data.exported_collections;

          exportedCollections.forEach((id: number) => {
            const collection = Store.getters.getExportingCollections.find((collection: { id: number }) => collection.id === id);
            if (collection) {
              VsToast.show({
                title:  `${collection.name} has been successfully exported.`,
                variant: 'info',
                timeout: 5000,
                position: "bottom-left"
              });
              Store.commit('TOGGLE_EXPORTING_COLLECTION', { id });
              Store.commit('UPDATE_COLLECTION_ECOMMERCE_ID', { collection_id:id, ecommerce_id:true });
            }
          });
        })
        .catch(err => {
          console.error('Failed to check export status:', err);
        });
    } else {
      // Clear the interval if there are no exporting collections
      // @ts-ignore
      clearInterval(shopifyExportCollectionStatusCheckerInterval);
      shopifyExportCollectionStatusCheckerInterval = null; // Reset the interval variable
    }
  }, 30000); // Check after every 30 seconds
}

const getExtensionFromMimeType = (mimetype: string) => {
  if(mimetype) {
    const mimetypes_info = {
      'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/bmp': 'bmp', 'image/svg+xml': 'svg', 'application/pdf': 'pdf',
    };
    return mimetypes_info[mimetype.toLowerCase()] || '';
  } else {
    return ''
  }
}

const getBase64FileInfo = (base64_string: string, base_path='') => {
  const mime_type_matched = base64_string.match(/^data:(.*);base64,/);
  const response_obj = {
    file_name: '', file_path: '', file_extension: '', file_content: base64_string, is_base64_string: true
  }
  if(mime_type_matched) {
    const mimetype: string = mime_type_matched[1];
    const file_extension = getExtensionFromMimeType(mimetype);
    const date_time_formatted = getRandom(5)+'_'+getDateTimeFormatted()
    const file_name =  `${date_time_formatted}.${file_extension}`
    if(base_path) {
      response_obj.file_path = `${base_path}/${file_name}`
    }
    response_obj.file_name = file_name;
    response_obj.file_extension = file_extension;
  }
  return response_obj
}

const getDateTimeFormatted = () => {
  const pad = (num, size) => num.toString().padStart(size, '0');
  const date = new Date()

  const day = pad(date.getDate(), 2);
  const month = pad(date.getMonth() + 1, 2); // Months are zero-indexed
  const year = date.getFullYear();
  const hours = pad(date.getHours() % 12 || 12, 2); // 12-hour format
  const minutes = pad(date.getMinutes(), 2);
  const seconds = pad(date.getSeconds(), 2);
  const milliseconds = pad(date.getMilliseconds(), 3); // Milliseconds
  // Convert milliseconds to microseconds (approximation)
  const microseconds = pad(milliseconds * 1000, 6);
  return `${day}${month}${year}${hours}${minutes}${seconds}${microseconds}`
}

const isEcommercePlatform = () => {
  const company = Store.getters.getCompany
  return ['shopify', 'wordpress', 'bigcommerce'].includes(company?.platform)
}

const isAbandonedSize = (sizes, size_code) => {
  const is_size_found =  find(sizes,  (size) => {
    return size.name == size_code
  })
  return !is_size_found;
}

const getProductAddonInfoDefaultObject = (product_id): {[product_id: string]: {grouped_addons: Record<any, any>, ungrouped_addons: number[], simple_addons: number[]}} => {
  return { [product_id]: { grouped_addons: {}, ungrouped_addons: [], simple_addons: [] } }
}

const includesLoose = (array, value) => {
  return array.some(item => item == value);
};

const handleExistingAddonsSelection = (existing_addons) => {
  const product_ids = Object.keys(existing_addons)
  const products = Store.getters.getProducts.filter(product => {
    return includesLoose(product_ids, product.id)
  })

  products.forEach(product => {
    const product_existing_addons = existing_addons[product.id]
    product.active_addons.forEach(active_addon => {
      if(includesLoose(product_existing_addons.simple_addons, active_addon.addon_id)) {
        active_addon.selected = true
      }
    })
    product.productstyles.forEach(product_style => {
      const { grouped_addons: product_style_grouped_addons, ungrouped_addons: product_style_ungrouped_addons } = product_style.customized_addons;
      product_style_ungrouped_addons.forEach(product_style_ungrouped_addon => {
        if(includesLoose(product_existing_addons.ungrouped_addons, product_style_ungrouped_addon.addon_id)) {
          product_style_ungrouped_addon.selected = true
        }
      })
      for(const group_name in product_style_grouped_addons) {
        const existing_group_selected_addon_id = product_existing_addons.grouped_addons[group_name]
        if(existing_group_selected_addon_id) {
          product_style_grouped_addons[group_name].forEach(product_style_grouped_addon => {
            if(existing_group_selected_addon_id == product_style_grouped_addon.addon_id) {
              product_style_grouped_addon.selected = true
            }
          })
        }
      }
    })
  })
}

const getStyleSelectedAddons = async (style) => {
  const selected_customized_addons = {
    grouped_addons: {}, ungrouped_addons: []
  }
  if(style.customized_addons) {
    const {grouped_addons, ungrouped_addons} = style.customized_addons
    if(ungrouped_addons && ungrouped_addons.length > 0) {
      selected_customized_addons.ungrouped_addons = ungrouped_addons.filter(ungrouped_addons => {
        return ungrouped_addons.selected
      })
    }
    if(grouped_addons && grouped_addons.constructor.name === "Object") {
      for(const group_name in grouped_addons) {
        grouped_addons[group_name].forEach(grouped_addon => {
          if(grouped_addon.selected) {
            selected_customized_addons.grouped_addons[group_name] = grouped_addon
          }
        })  }
    }
  }
  return selected_customized_addons;

}
const hasCompanyPermission = (permission) => {

  const company = Store.getters.getCompany
  const permissions = {
    1: ['show_admin_salerep']
  };

  if(company && permissions[company.id]) {
    return permissions[company.id].includes(permission);
  }

  return false;

}

const onlyCompanyOrderTab = () => {

  const company = Store.getters.getCompany
  const allowed_companies = [169,170];

  if(company) {
    return allowed_companies.includes(company.id);
  }

  return false;

}

const findActivityWithPosition = (activity_items, status, position) => {
  const submittedItems = activity_items.filter(item => item.status === status);
  // Return the second item if it exists, otherwise return the first
  if (submittedItems.length > position) {
    return submittedItems[position];
  } else if (submittedItems.length === 1) {
    return submittedItems[0];
  }
  return [];
}


const findActivity = (status_activities, status, length) => {
  const activities = status_activities.filter( (activity_item) => activity_item.status === status);
  const activity = activities.find((activity_item) => {
    return activity_item.activity_items.length === length
  });
  if(activity){
    return activity
  }
  else {
    return null;
  }
}
const mergeActivityArray = (requested_array, activity_array, status, status_activities, submitted_customer_activity_review = null) => {
  const existingFactoryIds = requested_array.activity_item_data.map(item => item.factory_product_id);
  const activity_items_data = JSON.parse(JSON.stringify(requested_array.activity_item_data));
  const approved_activities = status_activities.filter((status_activity) => status_activity.status === status);
  activity_array.forEach(item => {
    if (!existingFactoryIds.includes(item.factory_product_id)) {
      // Adding the oldone item to activity_item_data in original array
      let skip_customer_approval = null
      if(submitted_customer_activity_review){
        // @ts-ignore
        const submitted_activity = submitted_customer_activity_review?.activity_items?.find((activity) => activity.factory_product_id === item.factory_product_id);
        // @ts-ignore
        skip_customer_approval = submitted_activity?.skip_customer_approval;
      }
      const approved_activity = approved_activities.find((approved_activity) => {
        return approved_activity.activity_items.find((activity_item) =>  activity_item.factory_product_id === item.factory_product_id)
      });
      const activity_item_data = {
        action: (approved_activity.status === status && approved_activity.activity_items.length > 0)? "accept": null,  // default values, you can adjust as needed
        status: status,
        message: null,
        files: item.activity_files,
        factory_product_id: item.factory_product_id,
        skip_customer_approval: skip_customer_approval
      };
      activity_items_data.push(activity_item_data);
    }
  });
  return activity_items_data;

}
const resetCustomizedAddons = () => {
  const products = Store.getters.getProducts
  products.forEach((product) => {
    product.productstyles.forEach((style)=> {
      const grouped_addons = style.customized_addons['grouped_addons'];
      const ungrouped_addons = style.customized_addons['ungrouped_addons'];
      for (const [key, addons] of Object.entries(grouped_addons) as [string: any]) {
        addons?.forEach((addon: Record<any, any>) => {
          addon.selected = false
        })
      }
      ungrouped_addons?.forEach((addon: Record<any, any>) => {
        addon.selected = false
      })
    })
  })
  eventBus.$emit("addAddons")
}

const base64ToFile = (base64String, isBase64String, fileName = '')=>  {
  let response_file: File | null = null
    if(isBase64String){
      const mime_type_matched = base64String.match(/^data:(.*);base64,/);
      const in_valid_base64_string = base64String.includes(',')
      // Ensure the base64 string is valid
      if(mime_type_matched && in_valid_base64_string) {
        const mimetype: string = mime_type_matched[1];
        const file_extension = getExtensionFromMimeType(mimetype);
        if(!fileName) {
          const date_time_formatted = getRandom(5)+'_'+getDateTimeFormatted()
          fileName =  `${date_time_formatted}.${file_extension}`
        }
        // Remove the prefix (if present)
        const base64Data = base64String.split(',')[1];

        // Decode the base64 string
        const byteString = atob(base64Data);

        // Create an array buffer
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const intArray = new Uint8Array(arrayBuffer);

        for (let i = 0; i < byteString.length; i++) {
          intArray[i] = byteString.charCodeAt(i);
        }

        // Create a Blob and then a File
        const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
        response_file =  new File([blob], fileName, { type: 'application/octet-stream' });
      }
    }
    else {
      const blob = new Blob([base64String], { type: 'application/octet-stream' });
      response_file =  new File([blob], fileName, { type: 'application/octet-stream' });
    }
   return response_file;
}
const isBase64File = (str) => {
  return str && typeof str === 'string' && str.startsWith('data:') && str.includes('base64,');
}

const createFormData = (locker) => {
  const formData = new FormData();
  for (const key in locker) {
    if (locker.hasOwnProperty(key)) {
      if (locker[key] instanceof File) {
        // Directly append files
        formData.append(key, locker[key]);
      } else if (Array.isArray(locker[key]) || typeof locker[key] === 'object') {
        // Convert arrays or objects to JSON strings
        formData.append(key, JSON.stringify(locker[key]));
      } else {
        // Append primitive values directly
        formData.append(key, locker[key]);
      }
    }
  }
  return formData;
}

const  decodeHtmlEntities = (encodedStr) => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = encodedStr;
  return textArea.value;
}

const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 10;
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}


export {
  getLogoSettingsObject, getLogoObject, getRandom, getLogoSettings, setLogoSettings, getCustomLogos, fileToBase64, processColorsCustom,
  sortTextsArray, fontsColorsManipulation, fontsList, getReminderOptions, handleResponseException, logData, pathInfo,
  CustimooOrderFlowStatuses, getActiveProductData, getRosterDetailDefaultObject, activityStatus, urlToBase64,
  getFileExtensionType, getProductLogoSetting, getCompany, getPermissions, getUploadedLogoObject, initCustomLogos,
  getSelectedProductPantones, getColorType, setRetrievedProductsCustomTexts, getEditModeDefaultObj, fetchUrlContent,
  unitConversion, rosterDefaultItem, authenticateUser, lastActiveProductDefaultObject, resetLastActiveProductData,
  getSVGNumberArraysFromRoster, getSVGNumbers, getSVGNames, getSVGNameArraysFromRoster, getLogoSVG, parseSvgStringFile,
  persistToken, fetchCustomer, getTeamLogo, getDataToSetLastActiveProduct, getImageFromCanvas, getUrlParameter,
  rosterDetailsInit, initCustomLogosNew, getProductColors, logoColorInfoDefaultObject, recentLogoDefaultObject, getPermutation,
  getDefaultColorsObject, setDefaultColors, getExtensionFromString, exitFromEditMode, getExtensionsFor, validateLogoType, getLogoUpdatedProps,
  routerPush, getSantaModalConfig, getDomDocument, getWebComponentNames, isShadowDom, hideLockerProductSaveBtn, santaClone, setUndoRedoItems,
  classObserver, getCustomizerIframe, getWindowObject, getLockerColors, getSize, getDeviceInfo, syncGroupColorsWithSvgGroups, getCollectionLogoDefaultObj,
  getKeyItemFromLocalStorage,setKeyItemFromLocalStorage,removeKeyItemFromLocalStorage,getReOrderInfoObject, checkIsEmpty, hideLockerProductUpdateButton,
  updateLastActiveProductData, getProductById, getProductPriceDefaultObject, handleProductPriceUpdate, toggleProductAddons, isShowProductPrice, initiateLocalStorageKeys,
  isGetCategories, isFilePreviewable, getCustomLockers, getCustomProductData, getCustomProductInitialData, navigateToCustomProduct,
  getReorderDataDefaultObject, getOrderUpdateIdentifier, createOrUpdateOrderUpdateDataState, updateOrder, downloadNodeCollectionPDF,
  updateOrderProducts, getExtensionFromMimeType, getBase64FileInfo, getDateTimeFormatted, selectedDesign, startExportStatusChecker, isEcommercePlatform, downloadTemplate,
  isAbandonedSize, getProductAddonInfoDefaultObject, includesLoose, handleExistingAddonsSelection, hasCompanyPermission,
  findActivityWithPosition, findActivity, mergeActivityArray, resetCustomizedAddons, getStyleSelectedAddons, base64ToFile, isBase64File, createFormData, decodeHtmlEntities, getProductLogoTechnologies, generateRandomString, onlyCompanyOrderTab
};
