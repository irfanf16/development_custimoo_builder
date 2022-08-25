import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import store from '@/store'

const Home = ()=> import('../views/Home.vue')
const ShareRoster = ()=> import('../views/ShareRoster.vue')
const CollectionViewPDF = ()=> import('@/views/CollectionViewPDF.vue')

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home
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

router.beforeEach(async (to, from, next) => {
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

export default router
