<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import {
  authenticateUser, checkIsEmpty,
  getCompany,
  getCustomizerIframe, getEditModeDefaultObj, getProductPriceDefaultObject,
  getUrlParameter,
  routerPush,
  initiateLocalStorageKeys
} from '@/helpers/Helpers'
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
  faLock,
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
  faUserSecret, faSignOutAlt, faBell, faCartArrowDown, faFileExport, faSpinner, faSync, faExpand
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
library.add(faLock)
library.add(faCube)
library.add(faSignOutAlt)
library.add(faDiceTwo)
library.add(faBell)
library.add(faFileExport)
library.add(faSpinner)
library.add(faSync)
library.add(faExpand)
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

import SantaModal from "@/plugins/santaModal/SantaModal.js";
Vue.use(SantaModal)

// Extend Vue's type definition
declare module 'vue/types/vue' {
  interface Vue {
    $eventBus: Vue;
    $logData: (data: any) => void;
  }
}

import {eventBus} from "@/event/eventBus"
Vue.prototype.$eventBus = eventBus

import {getDomDocument, logData} from '@/helpers/Helpers'
Vue.prototype.$logData = logData;


initiateLocalStorageKeys();

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
    const company = vnode.context.$store.getters.getCompany as Record<any, any>
    const isLocalPlatform = company.platform !== 'self'
    const doc = getDomDocument(isLocalPlatform);
    const outsideEl = doc.body as Record<any, any>
    outsideEl?.addEventListener('click', el.clickOutsideEvent)
    outsideEl?.addEventListener('touch', el.clickOutsideEvent)
  },
  unbind: function (el:Record<any, any>, binding:Record<any, any>, vnode:Record<any, any>) {
    const company = vnode.context.$store.getters.getCompany as Record<any, any>
    const isLocalPlatform = company.platform !== 'self'
    const doc = getDomDocument(isLocalPlatform);
    const outsideEl = doc.body as Record<any, any>
    outsideEl?.removeEventListener('click', el.clickOutsideEvent)
    outsideEl?.removeEventListener('touch', el.clickOutsideEvent)
  },
});

import VueGtag from "vue-gtag";
import {isEmpty} from "lodash";
import {http} from "@/httpCommon";
Vue.use(VueGtag, {
  config: { id: "GTM-N2985NF" },
  params: {
    send_page_view: true
  }
});

@Component<CommonImportMixin>({
  i18n
})
export default class CommonImportMixin extends Vue{
  async mounted () {
    await getCompany()
    /*
    * Initialize store state default values starts
    * */

    await http.get(`/get-settings`).then((res) => {
      const response_data = res.data;
      const { settings: company_settings,  factory_settings } = response_data.result
      this.$store.commit('SET_SETTING', company_settings)
      this.$store.commit('SET_FACTORY_SETTING', factory_settings)
      if(company_settings && company_settings.currencies) {
        const company_currency_obj = company_settings.currencies
        this.$store.commit('SET_PRODUCT_PRICE_OBJECT', {
          show_price: company_currency_obj.visible,  active_currency: company_currency_obj.currencies[0]
        })
      }
    });

    const product_price_obj = this.$store.getters.getProductPriceObject
    if(checkIsEmpty(product_price_obj)) {
      this.$store.commit('SET_PRODUCT_PRICE_OBJECT', getProductPriceDefaultObject())
    }

    const product_edit_info_obj = this.$store.getters.getProductEditInfoObject
    if(checkIsEmpty(product_edit_info_obj)) {
      this.$store.commit('SET_PRODUCT_EDIT_INFO_OBJECT', getEditModeDefaultObj())
    }

    /*
    * Initialize store state default values ends
    * */

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
      localStorage.setItem(Vue.prototype.$jwtToken_localstorage_key, token)
      localStorage.setItem(Vue.prototype.$adminToken_localstorage_key, token)
      await authenticateUser(token)
      await this.$store.dispatch('resetStore')
      routerPush(this.$router, 'Home')
    } else{
      const storageInterval = setInterval(()=>{
        const jwtToken = localStorage.getItem(Vue.prototype.$jwtToken_localstorage_key);
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

    if(this.company.id){
      if(this.company.enable_accessibe) {
        const s = document.createElement('script');
        const doc = getDomDocument(true);
        s.src = 'https://acsbapp.com/apps/app/dist/js/app.js';
        s.async = true;
        s.onload = function () {
          // @ts-ignore
          acsbJS.init({
            statementLink: '',
            footerHtml: '',
            hideMobile: false,
            hideTrigger: false,
            disableBgProcess: false,
            language: 'en',
            position: 'right',
            leadColor: '#146FF8',
            triggerColor: '#146FF8',
            triggerRadius: '50%',
            triggerPositionX: 'right',
            triggerPositionY: 'bottom',
            triggerIcon: 'people',
            triggerSize: 'bottom',
            triggerOffsetX: 20,
            triggerOffsetY: 20,
            mobile: {
              triggerSize: 'small',
              triggerPositionX: 'right',
              triggerPositionY: 'bottom',
              triggerOffsetX: 10,
              triggerOffsetY: 10,
              triggerRadius: '20'
            }
          });
        };
        doc?.head.appendChild(s);
      }

      const current_locale = i18n.locale;
      i18n.setLocaleMessage(current_locale, this.company.translations[current_locale]);
    }




  }

  created(){
    window.addEventListener('beforeunload', this.saveBeforeExit);
  }
  destroyed(){
    window.removeEventListener('beforeunload', this.saveBeforeExit);
  }

  get company():Record<any, any> {
    return store.getters.getCompany
  }

  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  private saveBeforeExit(e: Event){
    let self: Record<any, any> = this;
    if((self.$store.getters.getUndoItems.length > 0 || self.$store.getters.getRedoItems.length > 0) && !self.$store.getters.getNagivationToCartEcommerce){
      const confirmationMessage = "You have unsaved changes. Are you sure you want to leave?";
      alert(confirmationMessage);
      self.$store.commit("SET_NAVIGATE_TO_CART", false);
      (e as any).returnValue = confirmationMessage;
      return confirmationMessage;
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
