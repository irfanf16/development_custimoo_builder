import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import {persistToken,fetchCustomer} from "@/helpers/Helpers";
import {checkCompanyStatus} from "../../middleware/checkCompany";

const Home = ()=> import('../views/Home.vue')
const ShareRoster = ()=> import('../views/ShareRoster.vue')
const CollectionViewPDF = ()=> import('@/views/CollectionViewPDF.vue')
const Deactive = ()=> import("@/views/Deactive.vue")
const Payment = ()=> import("@/views/Payment.vue")
const OrderListing = ()=> import("@/views/OrderListing.vue")
const OrderDetail = ()=> import('../views/OrderDetail.vue')
const PrivacyPolicy = ()=> import('@/views/PrivacyPolicy.vue')
const ThirdParty = ()=> import('../views/ThirdPartyFeedback.vue')
const DirectAccessSampleApproval = () => import('@/views/DirectAccessSampleApproval.vue')
const MerchantShop = () => import('@/views/MerchantShop.vue')

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
    path: '/customer-orders',
    name: 'CustomerOrders',
    component: OrderListing,
    props: { page_type: 'order' },
  },
  {
    path: '/order/:order_id/detail',
    name: 'OrderDetail',
    component: OrderDetail
  },
     {
      path: '/privacy-policy',
      name: 'privacyPolicy',
      component: PrivacyPolicy,
      meta: { layout: 'minimal' }
  },
  {
    path: '/merchant-shop/:slug',
    name: 'MerchantShop',
    component: MerchantShop
  },
   {
    path: '/third-party-feedback/:order_item_id',
    name: 'ThirdParty',
    component: ThirdParty,
    meta: { layout: 'minimal' }

    },
    {
    path: '/sample-approval/:order_item_id',
    name: 'DirectAccessSampleApproval',
    component: DirectAccessSampleApproval,
    meta: { layout: 'minimal' }

    },
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
    if (url !== lastUrl) {
      lastUrl = url;
      history.pushState(null, 'customizer', window.location.href.replace('!', ''));
    }
  }).observe(document, {subtree: true, childList: true});
  window.onhashchange = () => {
    if (window.location.hash.startsWith('#/share')) {
      // Extract the current URL and query string
      const currentUrl = new URL(window.location.href);

      // Parse query parameters
      const hashWithoutParams = window.location.hash.split('?')[0]; // The hash route without query params
      const queryParams = new URLSearchParams(window.location.hash.split('?')[1]);
      // Check if 'reloaded' is already present in the query parameters
      if (!queryParams.has('reloaded')) {
        // Add 'reloaded=true' to the query parameters
        queryParams.set('reloaded', 'true');

        // Construct the new URL with hash and query parameters
        const newHash = `${hashWithoutParams}?${queryParams.toString()}`;
        currentUrl.hash = newHash;

        // Update the location to reload the page
        window.location.href = currentUrl.toString();
      }
    }
  }

  await checkCompanyStatus(to, from, next)
  next()
})

export default router
