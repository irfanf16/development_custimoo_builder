<template>
  <order-detail></order-detail>
</template>

<script lang="ts">
import OrderDetail from "@/views/OrderDetail.vue";
import store from '../store'

import VModal from 'vue-js-modal'
import 'vue-js-modal/dist/styles.css'
Vue.use(VModal, {})

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import Vue from "vue";
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
Vue.use(VueToast);

export default {
  store,
  name: "WcOrderDetail",
  components: {
    OrderDetail
  }
}
</script>

<style lang="scss" scoped>
@import '~bootstrap/dist/css/bootstrap.css';
@import '~bootstrap-vue/dist/bootstrap-vue.css';
@import '../assets/css/custom.css';

</style>

