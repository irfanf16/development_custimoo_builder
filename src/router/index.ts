import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import Cart from '../views/Cart.vue'
import Order from '../views/Order.vue'
import OrderDetail from '../views/OrderDetail.vue'
import Orders from '../views/Orders.vue'
import ViewScene from '../views/ViewScene.vue'
import ThreeD from '../views/ThreeD.vue'
import ShareRoster from '../views/ShareRoster.vue'
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
    path: '/cart',
    name: 'Cart',
    component: Cart
  },
  {
    path: '/order',
    name: 'Order',
    component: Order
  },
  {
    path: '/order/:order_id/detail',
    name: 'OrderDetail',
    component: OrderDetail
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders
  },
  {
    path: '/three-d',
    name: 'ThreeD',
    component: ThreeD
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
  },
  {
    path:'/shareRoster/:urlstring',
    name: 'ShareRoster',
    component: ShareRoster
  },
  {
    path:'/admin/login',
    name:'LoginAsAdmin',
    component: Home,
  }
]

const router = new VueRouter({
  routes
})

export default router
