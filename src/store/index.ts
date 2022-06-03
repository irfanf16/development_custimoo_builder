import Vue from 'vue'
import Vuex from 'vuex'
import Auth from "@/store/modules/auth";
import ProductAttributes from "@/store/modules/ProductAttributes";
import Main from "@/store/modules/main";
import Product from "@/store/modules/product";
import Event from "@/store/modules/event";
import Cart from "@/store/modules/cart";
import createPersistedState from "vuex-persistedstate";

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
    key: 'custimo',
    paths: [
      'ProductAttributes.styleIndex',
      'ProductAttributes.selectedIndex',
      'ProductAttributes.selectedPrdId',
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
      'ProductAttributes.customTextObjects',
      'ProductAttributes.customLogoObjects',
      'Auth.jwtToken',
      'Auth.platform',
     ]
    })]
})

