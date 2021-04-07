import Vue from 'vue'
import Vuex from 'vuex'
import Auth from "@/store/modules/auth";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    defaultFillColors: [],
    jwtToken: ''
  },
  mutations: {
    defaultFillColors(state: Record<any, any>, colors: []) {
      localStorage.setItem('defaultFillColors', JSON.stringify(colors));
      state.defaultFillColors = colors;
    },
    jwtToken(state: Record<any, any>, jwtToken) {
      localStorage.setItem('jwtToken', JSON.stringify(jwtToken));
      state.jwtToken = jwtToken;
    },
    initialiseStore(state: Record<any, any>) {
      if (localStorage.getItem('defaultFillColors')) {
        state.defaultFillColors = JSON.parse(localStorage.getItem('defaultFillColors') as string);
      }
    }
  },
  getters: {
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

