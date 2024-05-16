import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import {persistToken,fetchCustomer} from "@/helpers/Helpers";
import {checkCompanyStatus} from '../../middleware/checkCompany'

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
const Resetpassword = ()=> import("@/views/Resetpassword.vue")
const Dashboard = ()=> import("@/views/Dashboard.vue")
const ThreeDView = ()=> import("@/views/ThreeDView.vue")
const Thankyou = ()=> import("@/views/Thankyou.vue")
const Deactive = ()=> import("@/views/Deactive.vue")
const Payment = ()=> import("@/views/Payment.vue")
const scene3d  = () => import("@/components/3d/scene-3d.vue")
const GLBLoader  = () => import("@/components/3d/glb-loader.vue")
const GLBLoaderNew  = () => import("@/components/3d/glb-loader_new.vue")



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
    component: Thankyou,
    props: true
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
  },
  {
    path:'/deactive',
    name:'Deactive',
    component: Deactive,
  },
  {
    path:'/payment',
    name:'Payment',
    component: Payment,
  },
  {
    path:'/reset-password',
    name:'Resetpassword',
    component: Resetpassword,
  },
  {
    path: '/3dscene',
    component: scene3d
  },
  {
    path: '/three-d-view',
    component: ThreeDView
  },
  {
    path: '/glb',
    component: GLBLoader
  },
  {
    path: '/glb_new',
    component: GLBLoaderNew
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach(async (to, from, next) => {
  const jwtToken:string|null = persistToken(to,from);
  await fetchCustomer(jwtToken as string);

  // remove ! sign from url that cause to customizer not load on page refresh mainly on evolution
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    console.log('observer', location.href)
    console.log('observer1', location)
    if (url !== lastUrl) {
      lastUrl = url;
      history.pushState(null, 'customizer', window.location.href.replace('!', ''));
    }
  }).observe(document, {subtree: false, childList: true});
  window.onhashchange = () => {
    console.log('hash updated')
    if(window.location.hash.startsWith('#/share')) {
      console.log('inside hash reload')
      window.location.reload()
    }
  }

  await checkCompanyStatus(to, from, next)
  next();
})

router.afterEach((to, from) => {
  const jwtToken = localStorage.getItem(Vue.prototype.$jwtToken_localstorage_key)
  if(!jwtToken){
    if(to.name == 'OrderDetail'){
      router.push('/')
    }
  }

})

export default router
