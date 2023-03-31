<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import {authenticateUser, getCompany, getCustomizerIframe, getUrlParameter, routerPush} from '@/helpers/Helpers'
import { i18n } from '@/i18n'
import store from '@/store'

import VModal from 'vue-js-modal'
import 'vue-js-modal/dist/styles.css'
import vSelect from "vue-select";
import 'vue-select/dist/vue-select.css';


Vue.use(VModal, {})

Vue.component("v-select", vSelect);

import { config, library } from '@fortawesome/fontawesome-svg-core'
config.autoAddCss = false
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

import Vue2TouchEvents from 'vue2-touch-events';
Vue.use(Vue2TouchEvents);

import Gleap from 'gleap'
Gleap.initialize("jmnVe5UF34mxObuFCzxan9LvtNeNXVkc");
import 'sweetalert2/dist/sweetalert2.min.css';

Vue.config.productionTip = false

Vue.filter("TitleCase", (value:Record<any,any>) => {
  return value.toLowerCase().replace(/(?:^|\s|-)\S/g, (x:Record<any,any>) => x.toUpperCase());
});

import ZoomOnHover from "vue-zoom-on-hover";
Vue.use(ZoomOnHover);

import SantaModal from "@/plugins/santaModal/SantaModal.js";
Vue.use(SantaModal)

import {eventBus} from "@/event/eventBus"
Vue.prototype.$eventBus = eventBus

import {getDomDocument, logData} from '@/helpers/Helpers'
Vue.prototype.$logData = logData;

import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

Vue.use(VueSweetalert2);

Vue.directive('click-outside-custom', {
  bind: function (el:Record<any, any>, binding:Record<any, any>, vnode:Record<any, any>) {
    el.clickOutsideEvent = function (event) {
      // here I check that click was outside the el and his children
      if (!(el == event.target || el.contains(event.target))) {
        // and if it did, call method provided in attribute value
        vnode.context[binding.expression](event);
      }
    };
    const doc = getDomDocument();
    const outsideEl = doc.querySelector('.page-wrapper') as Record<any, any>
    outsideEl.addEventListener('click', el.clickOutsideEvent)
  },
  unbind: function (el:Record<any, any>) {
    const doc = getDomDocument();
    const outsideEl = doc.querySelector('.page-wrapper') as Record<any, any>
    outsideEl.removeEventListener('click', el.clickOutsideEvent)
  },
});

import VueGtag from "vue-gtag";
Vue.use(VueGtag, {
  config: { id: "GTM-N2985NF" },
  params: {
    send_page_view: true
  }
});

@Component
export default class CommonImportMixin extends Vue{
  async mounted () {
    await getCompany();
    const iframe = getCustomizerIframe()
    /*
    * this condition checks if customizer is loaded in iframe. If it's loaded inside iframe then vue router won't work
    * so here we get the url and pass it to customizer to navigate to that route.
    * */
    if(iframe) {
      const url_params = getUrlParameter()
      if(url_params) {
        await this.$router.push(url_params)
      }
    }

    const token = getUrlParameter('token')
    if (token){
      localStorage.setItem('jwtToken', token)
      localStorage.setItem('adminToken', token)
      await authenticateUser(token)
      await this.$store.dispatch('resetStore')
      routerPush(this.$router, 'Home')
    } else{
      const storageInterval = setInterval(()=>{
        const jwtToken = localStorage.getItem('jwtToken');
        if(jwtToken && jwtToken !=''){
          authenticateUser(jwtToken)
          clearInterval(storageInterval);
        }
      }, 500)
    }

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
    await getCompany().then(function (){
      const current_locale = i18n.locale;
      i18n.setLocaleMessage(current_locale, store.getters.getCompany.translations[current_locale]);
    });

    const doc = getDomDocument(true) ? getDomDocument(true) : getDomDocument();
    const style1 = doc.createElement('style');
    const style2 = doc.createElement('style');
    const isOnepage = doc.location.host == 'mckiesports.com';
    style1.innerHTML = `.vm--block-scroll{overflow-y: auto;} ${isOnepage && '.vm--container{top: auto !important}.vm--modal{margin-top: 0px !important}'}`;
    style2.innerHTML = `.vm--block-scroll{overflow-y: auto;} ${isOnepage && '.vm--container{top: auto !important}.vm--modal{margin-top: 0px !important}'}`;
    doc.head.appendChild(style1);
    const customizer = doc.querySelector('v-customizer') as Record<any, any>
    customizer.shadowRoot.appendChild(style2)
  }

  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }
  @Watch('isCustomerAuthenticated')
  async isCustomerAuthenticatedChanged(newVal: boolean, oldVaL: boolean){
    if(newVal) {
      await this.$store.dispatch('GET_LOCKER_PRODUCTS')
    }
  }
}
</script>

<style lang="scss">
* {
  touch-action: manipulation;
}

@import '~vue-popperjs/dist/vue-popper.css';
@import '~bootstrap/dist/css/bootstrap.css';
@import '~bootstrap-vue/dist/bootstrap-vue.css';
@import '~pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.css';
@import '~@fortawesome/fontawesome-svg-core/styles.css';
@import '~vue-js-modal/dist/styles.css';
@import '@/assets/scss/custom';

#santa {
  font-family: 'Ubuntu', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background: #fff;
}

[v-cloak] {display: none}
#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
