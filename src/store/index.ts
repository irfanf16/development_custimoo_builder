import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    defaultFillColors: []
  },
  mutations: {
    defaultFillColors(state: Record<any, any>, colors: []) {
      localStorage.setItem('defaultFillColors', JSON.stringify(colors));
      state.defaultFillColors = colors;
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
    }
  },
  actions: {
  },
  modules: {
  }
})
