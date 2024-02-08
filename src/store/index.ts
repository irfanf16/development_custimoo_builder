import Vue from 'vue'
import Vuex from 'vuex'
import Auth from "@/store/modules/auth";
import ProductAttributes from "@/store/modules/ProductAttributes";
import Main from "@/store/modules/main";
import Product from "@/store/modules/product";
import Event from "@/store/modules/event";
import Cart from "@/store/modules/cart";
import { saveState, loadState } from '@/indexedDBPersistence.js';

Vue.use(Vuex)

const pathsToPersist = {
  'ProductAttributes': ['selectedIndex', 'selectedPrdId', 'selectedDesignId', 'products_rosters', 'using_logo_colors',
  'product_edit_info_object', 'last_active_product_data', 'logo_colors_info'],
  'Product': ['logoColors', 'initialExtractedColors'],
  'Main': ['tabIndexMain'],
  'Auth': ['jwtToken', 'platform']
}

let timeout;
const plugins = [
  (store) => {
    // Load the state from IndexedDB when the store is initialized
    loadState().then((savedState) => {
      if (savedState) {
        // Merge the loaded state with the existing state
        Object.keys(pathsToPersist).forEach((namespace) => {
          pathsToPersist[namespace].forEach((key) => {
            const path = `${namespace}.${key}`;
            store.commit('SET_STATE', { path, value: savedState[path] });
          });
        });
      }
    });

    // Save the specified paths to IndexedDB whenever the state changes
    store.subscribe((mutation, state) => {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        const stateToPersist = {};

        Object.keys(pathsToPersist).forEach((namespace) => {
          pathsToPersist[namespace].forEach((key) => {
            const path = `${namespace}.${key}`
            // console.log(path, state[namespace][key])
            stateToPersist[path] = state[namespace][key]
          })
        })
        // console.log(stateToPersist)
        saveState(stateToPersist)
      }, state.Main.index_db_store_time)
    })
  },
];

export default new Vuex.Store({
  modules: {
    Auth,
    ProductAttributes,
    Main,
    Product,
    Event,
    Cart
  },
  mutations: {
    SET_STATE(state, { path, value }) {
      // Dynamically set the state based on the path separated by dots
      const keys = path.split('.');
      let currentState = state;

      for (let i = 0; i < keys.length - 1; i++) {
        currentState = currentState[keys[i]];
      }
      currentState[keys[keys.length - 1]] = value;
    },
  },
  plugins
})

