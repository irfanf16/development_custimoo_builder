import Vue from 'vue'
import router from './router'
import store from './store'
import Vue2TouchEvents from 'vue2-touch-events';
Vue.use(Vue2TouchEvents);

import VModal from 'vue-js-modal'
import 'vue-js-modal/dist/styles.css'
Vue.use(VModal, {})

// Vue.directive('tooltip', VTooltip)
// Vue.directive('close-popover', VClosePopover)
// Vue.component('v-popover', VPopover)
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowLeft,
  faArrowRight,
  faBaseballBall,
  faCube,
  faDiceTwo,
  faEdit,
  faEye,
  faEyeSlash,
  faFillDrip,
  faFolder,
  faFutbol,
  faHockeyPuck,
  faImage,
  faInfoCircle,
  faRedoAlt,
  faSearch,
  faShareAlt,
  faUser,
  faSwatchbook,
  faTextHeight,
  faTimes,
  faTrashAlt,
  faTshirt,
  faUserFriends,
  faUserSecret, faSignOutAlt, faBell, faCartArrowDown
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css';
import App from './App.vue'
import {faFacebookF, faGooglePlusG, faLinkedinIn} from "@fortawesome/free-brands-svg-icons";
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
library.add(faUserSecret)
library.add(faSearch)
library.add(faRedoAlt)
library.add(faCartArrowDown)
library.add(faTimes)
library.add(faImage)
library.add(faFillDrip)
library.add(faTextHeight)
library.add(faSwatchbook)
library.add(faUserFriends)
library.add(faShareAlt)
library.add(faTrashAlt)
library.add(faEyeSlash)
library.add(faEye)
library.add(faInfoCircle)
library.add(faArrowRight)
library.add(faArrowLeft)
library.add(faEdit)
library.add(faFutbol)
library.add(faHockeyPuck)
library.add(faBaseballBall)
library.add(faTshirt)
library.add(faFolder)
library.add(faUser)
library.add(faFacebookF)
library.add(faLinkedinIn)
library.add(faGooglePlusG)
library.add(faCube)
library.add(faSignOutAlt)
library.add(faDiceTwo)
library.add(faBell)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

Vue.filter("TitleCase", (value:Record<any,any>) => {
  return value.toLowerCase().replace(/(?:^|\s|-)\S/g, (x:Record<any,any>) => x.toUpperCase());
});

import {eventBus} from "@/event/eventBus"
Vue.prototype.$eventBus = eventBus

import { logData } from '@/helpers/Helpers'
Vue.prototype.$logData = logData;

import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import Gleap from 'gleap'
Gleap.initialize("jmnVe5UF34mxObuFCzxan9LvtNeNXVkc");

Vue.use(VueSweetalert2);

new Vue({
  router,
  store,
  render: h => h(App),
  mounted () {
    const elem = document.createElement('link');
    elem.rel = ' stylesheet'
    elem.type = 'text/css';
    elem.href= 'https://cdn.custimoo.com/gulip/gulip.min.css';//Link of the css file
    document.head.appendChild(elem);

    if(process.env.NODE_ENV === 'production') {
      window.addEventListener('keydown', (e) => {
        if ((e.altKey === true || e.metaKey === true) && (e.key === 'u' ||  e.key === 'U')) {
          Gleap.startFeedbackFlow("bugreporting")
        }
      });
      window.addEventListener('touchstart', (e) => {
        if(e.touches.length > 2) {
          Gleap.startFeedbackFlow("bugreporting")
        }
      })
    }
  }
}).$mount('#santa')
