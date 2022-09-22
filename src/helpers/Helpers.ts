import Store from '../store'
import rgbHex from "rgb-hex";
import {getClosestColor} from "@/pantoneColor";
import {default as $} from "jquery";
import {AxiosError} from "axios";
import Vue from "vue";
// @ts-ignore
import VsToast from '@vuesimple/vs-toast';
import {http} from "@/httpCommon";
import {Side} from "three";
import {parseInt} from "lodash";

const getLogoSettingsObject = () => {
  return {
    id: null,
    product_id: null,
    product_style_id: null,
    following_product_ids: null,
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
  const color_type = Store.getters.getColorType;
  uniqueColors.forEach((color: string) => {
    const pantoneColor = getClosestColor(color, selectProductPantonesList,color_type);
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
      const colors = product_colors.json_data
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

  let image_colors = [];
  if(logo.logo_colors != null) {
    image_colors = processColorsCustom(JSON.parse(logo.logo_colors))
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
  let message = null
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
      const roster_details = Store.getters.getSelectedProductRoster()
      const roster_texts : Record<any, any> = {}
      const common : Record<any, any>[] = []


      for(let roster_index = 0; roster_index < roster_details.length; roster_index++) {
        const roster_detail = roster_details[roster_index]
        // console.log('roster_detail', roster_detail)
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
                    svg_height:'',
                    outline_color:'',
                    outline_color_pantone:'',
                    original_height:0,
                    original_width:0,
                    outline_width:0,
                    rotation:0,
                    scaleX:0,
                    scaleY:0,
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
                    path.stroke = custom_text_item.outline_color
                    path.strokeWidth = parseInt(custom_text_item.outline_width)
                    // path.scale = custom_text_item.scaleX / selected_product.measurement_ratio + ' ' + custom_text_item.scaleY / selected_product.measurement_ratio

                    const boundingBox = path.getBoundingBox()
                    boundingBox.y1 = Math.abs(boundingBox.y1)
                    const width = boundingBox.x2 - boundingBox.x1
                    const height = boundingBox.y1 + boundingBox.y2
                    const svg_string = path.toSVG()
                    const parser = new DOMParser();
                    const dom_svg = parser.parseFromString(svg_string, "text/html").body.firstChild as SVGElement;
                    // dom_svg.style.translate = '0px ' + height + 'px'
                    text_item_object.svg_height = height
                    let transform_height = height;
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
                    // console.log('transform_height',transform_height ,' ', height, ' ', text_for_test_char)
                    dom_svg.setAttribute('transform', 'translate(-1 ' + transform_height + ')')

                    const svg_with_tag = '<?xml version="1.0" encoding="utf-8"?>\n' +
                      '<svg style="width:100%; height: auto" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xml:space="preserve" ' +
                      'viewBox="0 0 ' + width + ' ' + height + '"> \n' + dom_svg.outerHTML + '\n</svg>'


                    const converted_width = unitConversion((width * custom_text_item.scaleX) / selected_product.measurement_ratio)
                    const converted_height = unitConversion((height * custom_text_item.scaleY )/ selected_product.measurement_ratio)

                    text_item_object.width = converted_width.value;
                    text_item_object.height = converted_height.value;
                    text_item_object.unit = converted_height.unit;
                    text_item_object.svg = svg_with_tag
                    text_item_object.color.push(text_color_info);
                    text_item_object.outline_color = custom_text_item.outline_color;
                    text_item_object.outline_color_pantone = custom_text_item.outline_color_pantone;
                    text_item_object.outline_width = parseInt(custom_text_item.outline_width);
                    text_item_object.original_height = (height * custom_text_item.scaleY) / selected_product.measurement_ratio;
                    text_item_object.original_width = (width * custom_text_item.scaleX) / selected_product.measurement_ratio;
                    text_item_object.rotation = custom_text_item.rotation;
                    text_item_object.scaleX = custom_text_item.scaleX / selected_product.measurement_ratio;
                    text_item_object.scaleY = custom_text_item.scaleY / selected_product.measurement_ratio;
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

      const getCanvasImage = Store.getters.getCanvasImage
      const style_index = Store.getters.getCurrentStyleIndex;
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
        product_custom_texts: productCustomTexts,
        product_custom_text_objects: {roster: roster_texts, common: common},
        colors: Store.getters.getLogosColors,
        design_id: selected_design.id,
        defaultcolors: Store.getters.getDefaultColors,
        front_image: getCanvasImage.ref_front.toDataURL("image/png"),
        groupcolors: Store.getters.getGroupColors,
        logo_colors: Store.getters.getLogosColors,
        model_id: product_models[selected_model_index].id,
        model_name: product_models[selected_model_index].model_name,
        product_id: selected_product.product_id,
        ecommerce_post_id: selected_product.ecommerce_product_id,
        sync_id: selected_product.sync_id,
        product_type: selected_product.product_type,
        product_name: product_name,
        pdf_file: null,
        production_url: selected_design.production_design?.file_url ? (`${process.env.VUE_APP_STORAGE_URL}${selected_design.production_design.file_url}.svg` ?? null) : null,
        // front_design:front_design,
        product_roster_detail: Store.getters.getSelectedProductRoster(),
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

const setRetrievedProductsCustomTexts = (retrieved_products: Record<any, any>[], reset=false) => {
  const last_active_product_custom_texts = Store.getters.getLastActiveProductData['product_custom_texts']
  const retrieved_products_custom_texts = retrieved_products.map((retrieved_product: Record<any, any>) => {
    if(reset)
      return retrieved_product.product_texts
    const product_id = retrieved_product.id;
    return last_active_product_custom_texts[product_id] ? last_active_product_custom_texts[product_id] : JSON.parse(JSON.stringify(retrieved_product.product_texts));
  })
  Store.commit("SET_PRODUCT_CUSTOM_TEXTS", { append: true, value: retrieved_products_custom_texts })
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
  const empty_text = await getDocFromString(`<g style="transform: rotate(0deg)"></g>`);

  for (let index = 0; index < factory_product.roster_detail.length; index++) {
    const detail = factory_product.roster_detail[index]
    if(detail) {
      if(Object.prototype.hasOwnProperty.call(detail,'svgs')){
        if(Object.prototype.hasOwnProperty.call(detail.svgs,'name') && detail.svgs.name.svg){
          const group_name_svg = await getDocFromString(detail.svgs.name.svg);
          const svg_name_text = (group_name_svg as Record<any,any>).querySelector('text');
          if(svg_name_text){
            svg_name_text?.setAttribute('font-size',`${detail.svgs.name.original_height}cm`);
          }
          const tspan_name = svg_name_text? svg_name_text.querySelector('tspan') : null;
          if(tspan_name){
            tspan_name.setAttribute('x','0');
            tspan_name.setAttribute('y','0');
          }
          detail.svgs.name.text_svg = svg_name_text? await serializer(svg_name_text) : await serializer(empty_text as SVGTextElement | Document);
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
          detail.svgs.name.text_svg = await serializer(empty_text as SVGTextElement | Document);
        }
        if(Object.prototype.hasOwnProperty.call(detail.svgs,'number') && detail.svgs.number.svg){
          const group_number_svg = await getDocFromString(detail.svgs.number.svg);
          const svg_number_text = (group_number_svg as Record<any,any>).querySelector('text');
          if(svg_number_text){
            svg_number_text?.setAttribute('font-size',`${detail.svgs.number.original_height}cm`);
          }
          const tspan_number = svg_number_text?svg_number_text?.querySelector('tspan') : null;
          if(tspan_number){
            tspan_number?.setAttribute('x','0');
            tspan_number?.setAttribute('y','0');
          }
          detail.svgs.number.text_svg = svg_number_text? await serializer(svg_number_text) : await serializer(empty_text as SVGTextElement | Document);
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
          detail.svgs.number.text_svg = await serializer(empty_text as SVGTextElement | Document);
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
                        <tspan x="0" y="0">${value.svgs.name.original_height ? value.svgs.name.original_height + 'cm /' + parseFloat((value.svgs.name.original_height / INCH_TO_CENTIMETER).toFixed(2)) + 'in' : ''} </tspan>
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
                        <tspan x="0" y="0">${value.svgs.number.original_height? value.svgs.number.original_height + 'cm /' + parseFloat((value.svgs.number.original_height/ INCH_TO_CENTIMETER).toFixed(2)) + 'in' : ''} </tspan>
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

const getSVGPatternNew = (roster_details:Record<any,any>,production_file_info:Record<any, any>) => {
  const width = production_file_info.width.includes('px')?production_file_info.width.replace('px',''):8000 ; const height = production_file_info.height.includes('px')?production_file_info.height.replace('px',''):5000;
  return `
                <g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 0 ${height + 500})" style="font-weight: bold;">
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
                        <tspan x="${3000}" y="0">Quantity </tspan>
                    </text>
                </g>
        ${roster_details.map((roster_item:Record<any,any>,index:number) => {
    return `
                <g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 0 ${height + 500})">
                ${roster_item.name !== null?
      `<g transform="matrix(1 0 0 1 0 ${500 + index * 1000})">
                      ${roster_item.name}
                   </g>`
      :
      `<g transform="matrix(1 0 0 1 0 ${500 + index * 1000})">
                   </g>`
    }
                ${roster_item.number !== null ?
      `<g transform="matrix(1 0 0 1 500 ${500 + index * 1000})" >
                        ${roster_item.number}
                    </g>`
      :
      `<g transform="matrix(1 0 0 1 500 ${500 + index * 1000})">
                   </g>`
    }
                ${roster_item.size !== null ?
      `<g transform="matrix(1 0 0 1 1250 ${500 + index * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                           ${roster_item.size}
                    </text>
                </g>`
      :
      `<g transform="matrix(1 0 0 1 1250 ${500 + index * 1000})"></g>`
    }
                ${roster_item.quantity !== null ?
      `<g transform="matrix(1 0 0 1 2500 ${500 + index * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        ${roster_item.quantity}
                    </text>
                </g>`
      :
      `<g transform="matrix(1 0 0 1 2500 ${500 + index * 1000})">
                 </g>`
    }
                ${svg_pattern_last_value_y = ((500 + index * 1000) + height + 500)}
                </g>`

  })
  }
        `
}

const getSVGPatternGulzar = (roster_details:Record<any,any>) => {
  const svg_pattern = `
<svg class="front" viewBox="0 0 376 244" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xhtml="http://www.w3.org/1999/xhtml">
    <foreignObject width="100%" height="50px" y="0">
        <xhtml:body xmlns="http://www.w3.org/1999/xhtml">
            <xhtml:table width="100%">
                <xhtml:tr>
                    <xhtml:th>
                        <xhtml:div style="height:20px">
                        Name
                        </xhtml:div>
                    </xhtml:th>
                    <xhtml:td>
                        <xhtml:div style="height:20px">
                          Number
                        </xhtml:div>
                    </xhtml:td>
                    <xhtml:td>
                        <xhtml:div style="height:20px">
                          Size
                        </xhtml:div>
                    </xhtml:td>
                    <xhtml:td>
                        <xhtml:div style="height:20px">
                          Quantity
                        </xhtml:div>
                    </xhtml:td>
                </xhtml:tr>
                 ${roster_details.map((roster_item:Record<any,any>,index:number) => {
                   return `<xhtml:tr>
                        <xhtml:td>
                            <xhtml:div style="height:20px">
                                ${roster_item.name !== null?roster_item.name: ''}
                            </xhtml:div>
                        </xhtml:td>
                        <xhtml:td>
                            <xhtml:div style="height:20px">
                                ${roster_item.number !== null?roster_item.number: ''}
                            </xhtml:div>
                        </xhtml:td>
                        <xhtml:td>
                            <xhtml:div style="height:20px">
                                ${roster_item.size !== null?roster_item.size: ''}
                            </xhtml:div>
                        </xhtml:td>
                        <xhtml:td>
                            <xhtml:div style="height:20px">
                                ${roster_item.quantity !== null?roster_item.quantity: ''}
                            </xhtml:div>
                        </xhtml:td>
                   </xhtml:tr>`
                })
  }
                 </xhtml:table></xhtml:body></foreignObject></svg>`;
    return svg_pattern;
}

const getLogoPattern = async (values:Record<any,any>, measurement_ratio:string) => {
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
                <g transform="matrix(1 0 0 1 0 ${250 + parseInt(index) * 1000})">
                    ${updated_url?`<g style="transform: rotate(${value.rotation}deg)"><image xlink:href="${value.base_64}" height="${(value.actualHeight * value.scaleY)/parseFloat(measurement_ratio)}px" width="${(value.actualWidth * value.scaleX)/parseFloat(measurement_ratio)}px"/></g>`:''}
                </g>
                <g transform="matrix(1 0 0 1 1000 ${500 + parseInt(index) * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">${value.side? value.side : ''} </tspan>
                    </text>
                </g>
                <g transform="matrix(1 0 0 1 2000 ${500 + parseInt(index) * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">${value.originalWidth? value.originalWidth + 'cm x' + value.originalHeight + 'cm /' + parseFloat((value.originalWidth/INCH_TO_CENTIMETER).toFixed(2)) + 'in x' + parseFloat((value.originalHeight/INCH_TO_CENTIMETER).toFixed(2)) + 'in' : ''} </tspan>
                    </text>
                </g>
                ${logo_pattern_last_value_y = (((500 + parseInt(index) * 1000) + (svg_pattern_last_value_y + 500)) + 500 +((value.actualHeight * value.scaleY)/parseFloat(measurement_ratio)))}
                </g>`
        }
      } else {
        svg_group_el += `
                <g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 0 ${svg_pattern_last_value_y + 500})">
                <g transform="matrix(1 0 0 1 0 ${250 + parseInt(index) * 1000})">
                    ${updated_url?`<g style="transform: rotate(${value.rotation}deg)"><image xlink:href="${process.env.VUE_APP_STORAGE_URL}${updated_url}" height="${(value.actualHeight * value.scaleY)/parseFloat(measurement_ratio)}px" width="${(value.actualWidth * value.scaleX)/parseFloat(measurement_ratio)}px"/></g>`:''}
                </g>
                <g transform="matrix(1 0 0 1 1000 ${500 + parseInt(index) * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">${value.side? value.side : ''} </tspan>
                    </text>
                </g>
                <g transform="matrix(1 0 0 1 2000 ${500 + parseInt(index) * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">${value.originalWidth? value.originalWidth + 'cm x' + value.originalHeight + 'cm /' + parseFloat((value.originalWidth/INCH_TO_CENTIMETER).toFixed(2)) + 'in x' + parseFloat((value.originalHeight/INCH_TO_CENTIMETER).toFixed(2)) + 'in' : ''} </tspan>
                    </text>
                </g>
                ${logo_pattern_last_value_y = (((500 + parseInt(index) * 1000) + (svg_pattern_last_value_y + 500)) + 500 +((value.actualHeight * value.scaleY)/parseFloat(measurement_ratio)))}
                </g>`
      }
      index = index + 1;
    }
  }
  return svg_group_el;
}

const parseSvgString = async (svg_string:string, factory_product: Record<any,any>) => {
  if(svg_string.substring(0, svg_string.lastIndexOf("</g>")) !== '') {
    let production_content = "";
    svg_string = svg_string.substring(0, svg_string.lastIndexOf("</g>"));
    const svg_doc = await getDocFromString(svg_string);
    const production_file_info:Record<any, any> = {
      width: $(svg_doc as SVGTextElement|Document).find("svg").eq(0).attr("width"),
      height: $(svg_doc as SVGTextElement|Document).find("svg").eq(0).attr("height")
    }

    // const factory_product:Record<any,any> = await parseFactoryProduct(factory_product_content);
    const roster_details = parseRosterDetailFromFactoryProduct(factory_product);
    svg_string += `${getSVGPatternNew(roster_details,production_file_info)}\n`

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
    const scaled_file_info : Record<any,any> = {
      width : parseFloat(production_file_info.width),
      height : logo_pattern_last_value_y?logo_pattern_last_value_y:svg_pattern_last_value_y,
    };


    //Applying Color on SVG Start
    applyColorToSVG(factory_product,svg_doc as SVGTextElement|Document);
    //Applying Color on SVG End

    //Add Fonts to SVgs Start
    const font_file = fontsList(Store.getters.getSelectedProduct);
    if(font_file.length > 0){
      const font_style = generateFontFile(font_file);
      $(svg_doc as SVGTextElement|Document).find("svg").eq(0).prepend(font_style)
    }
    //Add Fonts to SVgs End
    // console.log('');
    //Add Front and Back Images Shown on SVG Start
    //Back Image
    const group_back_image_tag = getGroupImageTag(factory_product,production_file_info,'back_image');
    $(svg_doc as SVGTextElement|Document).find("g").eq(0).prepend(group_back_image_tag)
    //Front Image
    const group_front_image_tag = getGroupImageTag(factory_product,production_file_info,'front_image');
    $(svg_doc as SVGTextElement|Document).find("g").eq(0).prepend(group_front_image_tag)
    //Add Front and Back Images Side wise to svg End
    $(svg_doc as SVGTextElement|Document).find("svg").eq(0).attr({"width": (scaled_file_info.width * 2) + 'px', height: scaled_file_info.height + 'px'});
    const view_box = (svg_doc as SVGTextElement|Document)?.querySelector('svg')?.getAttribute('viewBox');
    const view_box_dimensions = view_box?.split(" ");
    // @ts-ignore
    (svg_doc as SVGTextElement|Document)?.querySelector('svg')?.setAttribute('viewBox',`${view_box_dimensions[0]} ${view_box_dimensions[1]} ${parseFloat(production_file_info.width) * 2} ${logo_pattern_last_value_y?logo_pattern_last_value_y:svg_pattern_last_value_y}`);
    production_content = await serializer(svg_doc as SVGTextElement|Document);
    return production_content;
  }
  else{
    return null;
  }
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
        return (custom_logo.url !== "")
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

    // console.log( getSVGNumbers(numbers_array));

    // const factory_product:Record<any,any> = await parseFactoryProduct(factory_product_content);

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
    const production_height = production_file_info.height.replace('px','')?parseFloat(production_file_info.height.replace('px','')):6000;
    const production_width = production_file_info.width.replace('px','')?parseFloat(production_file_info.width.replace('px','')):8000;
    const view_box = (svg_doc as SVGTextElement|Document)?.querySelector('svg')?.getAttribute('viewBox');

    const view_box_dimensions = view_box?.split(" ");

    // @ts-ignore

    const svg_height = calculateSVGHeight(production_height,logo_max_width,svg_numbers_payload.height,names_height,common_height);
    const svg_width = calculateSVGWidth(production_width,logo_max_width,numbers_width,names_width,common_width)

    $(svg_doc as SVGTextElement|Document).find("svg").eq(0).attr({"width": svg_width + 'px', height: svg_height + 'px'});
    // @ts-ignore
    (svg_doc as SVGTextElement|Document)?.querySelector('svg')?.setAttribute('viewBox',`${view_box_dimensions[0]} ${view_box_dimensions[1]} ${svg_width} ${svg_height}`);
    production_content = await serializer(svg_doc as SVGTextElement|Document);
    console.log('Production Content');
    console.log(production_content);
    return production_content;
  }
  else{
    return null;
  }
}

const calculateSVGHeight = (production_file_height:number,logo_max_height:number,number_max_height:number,name_max_height:number,common_height:number) => {
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
const calculateSVGWidth = (production_width:number,logo_max_width:number,numbers_width:number,names_width:number,common_width:number) => {
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

const getSVGNumbers = (numbers_array:Record<any,any>[],logo_width:number,production_file_dimension:Record<any,any>) => {
  // let svg_string = '<?xml version="1.0" encoding="utf-8"?>\n' +
  //   '<svg style="width:100%; height: auto" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xml:space="preserve" ' +
  //   'viewBox="0 0 ' + 2000 + ' ' + 2000 + '"> \n';
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
        svg_string +=`
                     <g transform="matrix(${item.scaleX} 0 0 ${item.scaleY} ${width} ${height})">
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

const getSVGNames = (names_array:Record<any,any>[],production_file_dimension:Record<any,any>,number_svg_width:number) => {
  // let svg_string = '<?xml version="1.0" encoding="utf-8"?>\n' +
  //   '<svg style="width:100%; height: auto" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xml:space="preserve" ' +
  //   'viewBox="0 0 ' + 2000 + ' ' + 2000 + '"> \n';
  const height_of_production_file = production_file_dimension.height? production_file_dimension.height.replace('px',''):6000;
  let height = 0 ;
  let width = 0 ;
  let original_width = 0;
  let svg_string = `<g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 ${number_svg_width} ${height_of_production_file})">`;
  Object.entries(names_array).forEach(([key, value]) => {
    height = 0;
    value.forEach((item:Record<any,any>,index:number) => {
      const svg = item.svg.substring(item.svg.indexOf("<path"),item.svg.lastIndexOf("</svg>"));
      svg_string +=`
                     <g transform="matrix(${item.scaleX} 0 0 ${item.scaleY} ${width} ${height})">
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

const getSVGCommonItems = (common_array:Record<any,any>[],production_file_dimension:Record<any,any>,names_svg_width:number) => {
  // let svg_string = '<?xml version="1.0" encoding="utf-8"?>\n' +
  //   '<svg style="width:100%; height: auto" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xml:space="preserve" ' +
  //   'viewBox="0 0 ' + 2000 + ' ' + 2000 + '"> \n';
  const height_of_production_file = production_file_dimension.height? production_file_dimension.height.replace('px',''):6000;
  let height = 0 ;
  let width = 0 ;
  let original_width = 0;
  let svg_string = `<g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 ${names_svg_width} ${height_of_production_file})">`;
  Object.entries(common_array).forEach(([key, value]) => {
    value.forEach((item:Record<any,any>,index:number) => {
      const svg = item.svg.substring(item.svg.indexOf("<path"),item.svg.lastIndexOf("</svg>"));
      svg_string +=`
                     <g transform="matrix(${item.scaleX} 0 0 ${item.scaleY} ${width} ${height})">
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



const getLogoSVG = (custom_logos:Record<any,any>, measurement_ratio:string,production_file_dimension:Record<any,any>) => {
  const height_of_production_file = production_file_dimension.height? production_file_dimension.height.replace('px',''):6000;
  let svg_string = `<g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 0 ${height_of_production_file})">`;
  let width = 0;
  custom_logos.forEach((custom_logo:Record<any,any>, index:number) => {
    const original_url = Object.prototype.hasOwnProperty.call(custom_logo,'original_png') && custom_logo.original_png;
    const updated_url = original_url?custom_logo.original_url:custom_logo.url;
    const has_base64 = Object.prototype.hasOwnProperty.call(custom_logo,'base_64')?true:false;
    if(updated_url){
      if(has_base64){
        svg_string +=`
                     <g transform="matrix(1 0 0 1 ${width} 1000)">
                        <g style="transform: rotate(${custom_logo.rotation})">
                            <image xlink:href="${custom_logo.base_64}" height="${(custom_logo.actualHeight * custom_logo.scaleY)/parseFloat(measurement_ratio)}px" width="${(custom_logo.actualWidth * custom_logo.scaleX)/parseFloat(measurement_ratio)}px"/>
                        </g>
                     </g>
                `
      }
      else{
        svg_string +=`
                     <g transform="matrix(1 0 0 1 ${width} 1000)">
                        <g style="transform: rotate(${custom_logo.rotation})">
                            <image xlink:href="${process.env.VUE_APP_STORAGE_URL}${updated_url}" height="${(custom_logo.actualHeight * custom_logo.scaleY)/parseFloat(measurement_ratio)}px" width="${(custom_logo.actualWidth * custom_logo.scaleX)/parseFloat(measurement_ratio)}px"/>
                        </g>
                     </g>
                `
      }
    }
      if(Object.prototype.hasOwnProperty.call(custom_logo,'actualWidth')){
        width += ((custom_logo.actualWidth * custom_logo.scaleX)/parseFloat(measurement_ratio)) + 500;
      }
      else{
        width += 0;
      }
  });

  svg_string += `</g>`

  return {svg_string:svg_string,width:width};
}

const heightConvertionPx = (payload:Record<any,any>) =>{
  switch(payload.value){
    case "in":
      return payload.height * 2.54 * 37.7952755906;
    case "cm":
      return payload.height * 37.7952755906;
  }
}

const unitConversion = (value:number) => {
  const setting = Store.getters.getSetting
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

const lastActiveProductDefaultObject = () => {
  return {
    category_index: 0, category_id: null, design_index: 0, design_id: null, product_index: 0, product_id: null, search_products: null, style_index: 0, style_id: null,
    page_no: 1, customized: true, personalized: false, product_custom_texts: {}, custom_logos: [], default_colors: [], group_colors: [], logo_colors: [],
    roster_detail: []
  }
}

const resetLastActiveProductData = async () => {
  const last_active_product_default_object = lastActiveProductDefaultObject()
  Store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", last_active_product_default_object)
}

//Functions related to SVG parsing end
export {
  getLogoSettingsObject, getLogoObject, getRandom, getLogoSettings, setLogoSettings, getCustomLogos, fileToBase64,
  processColorsCustom,sortTextsArray,fontsColorsManipulation,fontsList,getReminderOptions,setCustomLogo, handleResponseException, logData, pathInfo,
  CustimooOrderFlowStatuses, getActiveProductData, getRosterDetailDefaultObject, activityStatus, urlToBase64, getFileExtensionType, getProductLogoSetting, getCompany, getPermissions,
  getUploadedLogoObject, initCustomLogos, getSelectedProductPantones, setRetrievedProductsCustomTexts, getEditModeDefaultObjFor, parseSvgString,fetchUrlContent,
  unitConversion, rosterDefaultItem, authenticateUser, lastActiveProductDefaultObject, resetLastActiveProductData,getSVGNumberArraysFromRoster,getSVGNumbers,getSVGNames,getSVGNameArraysFromRoster,getLogoSVG,parseSvgStringFile
};
