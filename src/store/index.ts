import Vue from 'vue'
import Vuex from 'vuex'
import Auth from "@/store/modules/auth";
import ProductAttributes from "@/store/modules/ProductAttributes";
import Main from "@/store/modules/main";
import Product from "@/store/modules/product";
import Event from "@/store/modules/event";
import Cart from "@/store/modules/cart";
import createPersistedState from "vuex-persistedstate";
import LZString from 'lz-string';
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

let persistant_plugin_key = 'custimoo';
// @ts-ignore
if(typeof custimoo_application_suppage_url !== 'undefined') {
  // @ts-ignore
  if(custimoo_application_suppage_url !== '' && custimoo_application_suppage_url !== null) {
    // @ts-ignore
    persistant_plugin_key += "-" + custimoo_application_suppage_url; // this variable declared in get-app-version js file
  }

}

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    Auth,
    ProductAttributes,
    Main,
    Product,
    Event,
    Cart
  },
  plugins: [createPersistedState({
    // @ts-ignore
    key: persistant_plugin_key, // this variable declared in file get-app-version.js
    paths: [
      'ProductAttributes.selectedIndex',
      'ProductAttributes.selectedPrdId',
      // 'ProductAttributes.customLogos',
      // 'ProductAttributes.product_custom_texts',
      // 'ProductAttributes.defaultColors',
      // 'ProductAttributes.groupColors',
      'ProductAttributes.selectedDesignId',
      'ProductAttributes.products_rosters',
      'ProductAttributes.using_logo_colors',
      'Product.logoColors',
      'Product.initialExtractedColors',
      'Main.tabIndexMain',
      'ProductAttributes.customLogoObjects',
      'Auth.jwtToken',
      'Auth.platform',
      'ProductAttributes.product_edit_info_object',
      'ProductAttributes.last_active_product_data',
      'ProductAttributes.logo_colors_info',
     ],
     storage: {
      getItem: (key) => {
        const compressedValue = localStorage.getItem(key)
        if (compressedValue) {
          return  LZString.decompressFromUTF16(compressedValue)
        }
        return null
      },
      setItem: (key, value) => {
        const compressedValue = LZString.compressToUTF16(value)
        localStorage.setItem(key, compressedValue)
      },
      removeItem: (key) => {
        localStorage.removeItem(key)
      },
    }
    })]
})

