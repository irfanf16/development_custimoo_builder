import {http} from "@/httpCommon";
import { Module } from "vuex";
const ProductAttributes:Module<any, any> = {
  state: {
    categories: [],
    DefaultFilledColors: []
  },
  mutations: {
    categories(state: Record<any, any>, categories: Record<any, any>) {
      if(categories){
        state.categories = categories
      }
    }
  },
  getters: {
    getCategories: state => {
      return state.categories
    }
  },
  actions: {
    setCategories({commit}){
      const url = '/product/categories'
      http.get(url).then((response: any) => {
        commit('categories', response.data)
      }).catch((e: any) => {
        console.log(e)
      });
    }
  }
}
export default ProductAttributes;

