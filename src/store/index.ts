import Vue from 'vue'
import Vuex from 'vuex'
import Auth from "@/store/modules/auth";
import ProductAttributes from "@/store/modules/ProductAttributes";
import Main from "@/store/modules/main";
import Product from "@/store/modules/product";

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    Auth,
    ProductAttributes,
    Main,
    Product
  }
})

