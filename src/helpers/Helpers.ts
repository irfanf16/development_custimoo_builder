import Store from '../store'
import rgbHex from "rgb-hex";
import {getClosestColor} from "@/pantoneColor";

const getLogoSettingsObject = () => {
  return {
    id: null,
    product_id: null,
    product_style_id: null,
    rotation: 0,
    width: 200,
    height: 0,
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

const getLogoObject = () => {
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
    base64_logo: null,
    originalWidth: logo_settings_object.width,
    originalHeight: logo_settings_object.height
  }
}


/*
* Index = -1 means we are getting all settings rather that getting settings at specific index.When index is given then the return type will be object or null. Otherwise return type will be array. That could be empty
* */

const getLogoSettings = (index = -1, default_obj = true) => {
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
  logo.rotation =  logo_settings.rotation;
  logo.haveControls =  !logo_settings.is_locked;
  logo.originalWidth =  logo_settings.width;
  logo.originalHeight =  logo_settings.height;
  return logo;
}

const getCustomLogos = (default_obj = true, sync_with_store = true) => {
  const custom_logos = Store.getters.getCustomLogos;
  if(custom_logos.length <= 0 && default_obj) {
    const logo = setLogoSettings(0, getLogoObject())
    if(sync_with_store) {
      logo["logoIndex"] =  0,
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
  uniqueColors.forEach((color: string) => {
    const pantoneColor = getClosestColor(color)
    imageColors.push({hex: pantoneColor.hex, pantone: pantoneColor.pantone, name: pantoneColor.name})
  })
  return imageColors;

}


export {getLogoSettingsObject, getLogoObject, getRandom, getLogoSettings, setLogoSettings, getCustomLogos, fileToBase64, processColorsCustom };
