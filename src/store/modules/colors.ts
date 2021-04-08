import {http} from "@/httpCommon";
import { Module } from "vuex";
const Colors:Module<any, any> = {
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
}
export default Colors;

