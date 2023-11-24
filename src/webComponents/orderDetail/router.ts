import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import {checkCompanyStatus} from "../../../middleware/checkCompany";

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [

]

const router = new VueRouter({
  routes
})

router.beforeEach(async (to, from, next) => {
  await checkCompanyStatus(to, from, next)
  next();
})


export default router
