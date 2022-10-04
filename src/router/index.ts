import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import store from '@/store'

const Home = ()=> import('../views/Home.vue')
const Addresses = ()=> import('../views/Addresses.vue')
const Cart = ()=> import('../views/Cart.vue')
const Order = ()=> import('../views/Order.vue')
const OrderDetail = ()=> import('../views/OrderDetail.vue')
const Orders = ()=> import('../views/Orders.vue')
// const ThreeD = ()=> import('../views/ThreeD.vue')
const ShareRoster = ()=> import('../views/ShareRoster.vue')
const CollectionViewPDF = ()=> import('@/views/CollectionViewPDF.vue')
const OrderListing = ()=> import("@/views/OrderListing.vue")
const Dashboard = ()=> import("@/views/Dashboard.vue")
const Thankyou = ()=> import("@/views/Thankyou.vue")


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
    path: '/dashboard',
    name: 'Dashboard',
    component:Dashboard
  },
  {
    path: '/address',
    name: 'Address',
    component:Addresses
  },
  {
    path: '/order',
    name: 'Order',
    component: Order
  },
  {
    path: '/customer-orders',
    name: 'CustomerOrders',
    component: OrderListing
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
  // {
  //   path: '/3d',
  //   name: 'ThreeD',
  //   component: ThreeD
  // },
  {
    path:'/share/:product/:name',
    name: 'ShareUrl',
    component: Home
  },
  {
    path:'/thank-you',
    name: 'Thankyou',
    component: Thankyou
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

router.beforeEach(async (to, from, next) => {

  const app_version = localStorage.getItem('app_version')
  if(app_version != process.env.VUE_APP_VERSION) {
    localStorage.setItem('app_version', process.env.VUE_APP_VERSION)
    await store.dispatch('resetStore')
    location.reload()
  }
  const jwtToken = localStorage.getItem('jwtToken')

  if (!store.getters.getCustomer && jwtToken){
    const customer = await store.dispatch('getCustomerFromToken', jwtToken)
    if (customer){
      const payload = {
        access_token: jwtToken,
        user: customer
      }
      await store.commit('SET_CUSTOMER', payload)
    }
  }

  // remove ! sign from url that cause to customizer not load on page refresh mainly on evolution
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      history.pushState(null, 'customizer', window.location.href.replace('!', ''));
    }
  }).observe(document, {subtree: true, childList: true});

  next()
})

router.afterEach((to, from) => {
  const jwtToken = localStorage.getItem('jwtToken')
  if(!jwtToken){
    if(to.name == 'OrderDetail'){
      router.push('/')
    }
  }

})

export default router
