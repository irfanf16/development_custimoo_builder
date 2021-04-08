import Vue from 'vue'
import Vuex from 'vuex'
import { http } from '@/httpCommon'
import Auth from "@/store/modules/auth";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    categories: [],
    defaultFillColors: [],
    jwtToken: ''
  },
  mutations: {
    defaultFillColors(state: Record<any, any>) {
      console.log('here')
      const url = '/product/colors?default_color=1'
      http.get(url).then((response: any) => {
        localStorage.setItem('defaultFillColors', response.data.data.color.color_text);
        state.defaultFillColors = JSON.parse(response.data.data.color.color_text);
        state.categories = response.data.data.categories;
      }).catch((e: any) => {
        console.log(e)
      });
    },
    jwtToken(state: Record<any, any>) {
      const url = 'https://dev.customize.ninja/index.php?route=account/kbauthtoken'
      http.get(url).then((response: any) => {
        localStorage.setItem('jwtToken', response.data.access_token);
        state.jwtToken = response.data.access_token;
      }).catch((e: any) => {
        console.log(e)
      });
    },
    initialiseStore(state: Record<any, any>) {
      if (localStorage.getItem('defaultFillColors')) {
        state.defaultFillColors = JSON.parse(localStorage.getItem('defaultFillColors') as string);
      }
    }
  },
  getters: {
    getCategories: state => {
      return state.categories
    },
    getDefaultColors: state => {
      return state.defaultFillColors
    },
    getDefaultFilledColors: state => {
      return state.defaultFillColors.filter((fillColor: Record<any, any>) => fillColor.color != null)
    },
    getJwtToken: state => {
      return state.jwtToken.filter((jwtToken: Record<any, any>) => jwtToken != null)
    }
  },
  actions: {
  },
  modules: {
    Auth
  }
})

