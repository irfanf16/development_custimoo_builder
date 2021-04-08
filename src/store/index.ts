import Vue from 'vue'
import Vuex from 'vuex'
import Auth from "@/store/modules/auth";
import Colors from "@/store/modules/colors";
import Main from "@/store/modules/main";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    mobileScreen: false
  },
  modules: {
    Auth,
    Colors,
    Main
  }
})

