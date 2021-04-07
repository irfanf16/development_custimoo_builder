import Vue from 'vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowLeft, faArrowRight, faEdit, faEyeSlash, faFillDrip, faImage, faInfoCircle, faRedoAlt, faSearch, faShareAlt, faSwatchbook, faTextHeight, faTimes, faTrashAlt, faUserFriends, faUserSecret } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import App from './App.vue'
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
library.add(faUserSecret)
library.add(faSearch)
library.add(faRedoAlt)
library.add(faTimes)
library.add(faImage)
library.add(faFillDrip)
library.add(faTextHeight)
library.add(faSwatchbook)
library.add(faUserFriends)
library.add(faShareAlt)
library.add(faTrashAlt)
library.add(faEyeSlash)
library.add(faInfoCircle)
library.add(faArrowRight)
library.add(faArrowLeft)
library.add(faEdit)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

if (store.getters.isAuthenticated) {
  app_instance();
} else{
  store.dispatch('AUTH_LOGIN').then(() => {
    app_instance();
  })
}

function app_instance(){
  return new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
}
