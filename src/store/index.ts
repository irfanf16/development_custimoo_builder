import Vue from 'vue'
import Vuex from 'vuex'
import Auth from "@/store/modules/auth";
import ProductAttributes from "@/store/modules/ProductAttributes";
import Main from "@/store/modules/main";
import Product from "@/store/modules/product";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    Auth,
    ProductAttributes,
    Main,
    Product
  },
  plugins: [createPersistedState({
    key: 'custimo',
    paths: [
      'ProductAttributes.styleIndex',
      'ProductAttributes.selectedIndex',
      'ProductAttributes.customLogos',
      'ProductAttributes.customTexts',
      'ProductAttributes.defaultColors',
      'ProductAttributes.groupColors',
      'ProductAttributes.selectedDesignId',
      'ProductAttributes.rosterDetails',
      'ProductAttributes.using_logo_colors',
      'Product.logoColors',
      'Product.initialExtractedColors',
      'Main.windowView',
      'Main.tabIndexMain',
     ]


    })]
})

