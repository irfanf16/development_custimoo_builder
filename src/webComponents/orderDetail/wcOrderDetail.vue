<template>
  <order-detail :ecommerce_order_id="ecommerce_order_id" ></order-detail>
</template>

<script lang="ts">
import OrderDetail from "@/views/OrderDetail.vue";
import store from '../../store'

import VModal from 'vue-js-modal'
Vue.use(VModal, {})

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import Vue from "vue";
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

import router from './router'
import {getCompany} from "@/helpers/Helpers";

import ZoomOnHover from "vue-zoom-on-hover";
Vue.use(ZoomOnHover);

export default {
  store, router,
  name: "WcOrderDetail",
  components: {
    OrderDetail
  },
  props: {
    ecommerce_order_id: {
      type: String,
      default:null
    }
  },
}
</script>

<style lang="scss">
@import '~bootstrap/dist/css/bootstrap.css';
@import '~bootstrap-vue/dist/bootstrap-vue.css';
@import '~vue-js-modal/dist/styles.css';
@import '@/assets/scss/custom';

</style>

