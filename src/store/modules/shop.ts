import Vue from "vue";
import { http, noTokenRequest } from "@/httpCommon";
import { Module } from "vuex";
import { getShopDefaultObject } from "@/helpers/Helpers";
const Shop: Module<any, any> = {
  state: {
    shop_mode: null as null | "creating" | "updating",
    shop:{} as Record<any, any>,
    currency: "$",
    cartItems:[] as Record<any, any>[],
    company_shop_products: [],
    shopInfo: {} as Record<any, any>,
  },
  getters: {
    getShopCartItems(state:Record<any, any>){
      const cartItems = JSON.parse(localStorage.getItem("cartData") || "[]");
     if (cartItems && cartItems.constructor.name=== 'Array'){
       return cartItems;
     }else{
       return []
     }
    },
    getShopMode(state: Record<any, any>): null | "creating" | "updating" {
      return state.shop_mode;
    },
    getShop(state: Record<any, any>): Record<any, any> {
      return state.shop;
    },
    getShopCurrency(state: Record<any, any>): string {
      return state.currency;
    },
    getCompanyShopProducts(state: Record<any, any>): Record<any, any> {
      return state.company_shop_products;
    },
    getShopInfo(state: Record<any, any>): Record<any, any> {
      return state.shopInfo;
    }
  },
  mutations: {
    SET_CART_DATA(state:Record<any, any>, payload){
      localStorage.setItem("cartData", JSON.stringify(payload));
    },
    SET_SHOP(state: Record<any, any>, shopData: Record<any, any>) {
      state.shop = shopData;
    },
    SET_SHOP_CURRENCY(state: Record<any, any>, currency: string) {
      state.currency = currency;
    },
    SET_SHOP_MODE(state: Record<any, any>, shopMode: null |"creating" | "updating") {
      state.shop_mode = shopMode;
    },
    UPDATE_SHOP(state: Record<any, any>, payload: Record<any, any>) {
      state.shop = {...state.shop, ...payload.shopUpdatedData};
    },
    RESET_SHOP_STATE(state: Record<any, any>, payload: Record<any, any>) {
      state.shop = {};
      state.shop_mode = null
    },
    SET_COMPANY_PRODUCTS(state: Record<any, any>, companyProducts: Record<any, any>) {
      state.company_shop_products = companyProducts
    },
    REMOVE_PLAYER_FROM_CART_PRODUCT(State: Record<any, any>, payload: number){
    },
    SET_SHOP_INFO(state: Record<any, any>, shopInfo: Record<any, any>) {
      state.shopInfo = shopInfo
    }
  },
  actions: {
    setShop({ commit }, shopData: Record<any, any>) {
      commit("SET_SHOP", shopData);
    },

  },
};
export default Shop;
