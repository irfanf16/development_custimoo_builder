import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import ViewScene from '../views/ViewScene.vue'
import CustomizationProcess from '../views/CustomizationProcess.vue'
import ConfirmOrder from '../views/ConfirmOrder.vue'
import CollectionViewPDF from "@/views/CollectionViewPDF.vue";

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/confirm-order',
    name: 'ConfirmOrder',
    component: ConfirmOrder
  },
  {
    path:'/share/:product/:name',
    name: 'ShareUrl',
    component: Home
  },
  {
    path:'/collection/:collection_file_name/view',
    name: 'CollectionUrl',
    component: CollectionViewPDF
  }
]

const router = new VueRouter({
  routes
})

export default router
