<template>
  <div style="font-family: 'Ubuntu', sans-serif;">
<!--    <Header />-->
    <router-view/>
  </div>
</template>

<script>
import Vue from 'vue'
import {LockerProducts} from "@/mixins/LockerProduct";
import router from './router'
import store from '../store'
import Gleap from 'gleap';
Gleap.initialize("jmnVe5UF34mxObuFCzxan9LvtNeNXVkc");
import Vue2TouchEvents from 'vue2-touch-events';
Vue.use(Vue2TouchEvents);
import { config, dom, library } from '@fortawesome/fontawesome-svg-core'
// Make sure you tell Font Awesome to skip auto-inserting CSS into the <head>
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
import {faFacebookF, faGooglePlusG, faLinkedinIn} from "@fortawesome/free-brands-svg-icons";
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
library.add(faUserSecret)
library.add(faSearch)
library.add(faRedoAlt)
library.add(faTimes)
library.add(faImage)
library.add(faFillDrip)
library.add(faCartArrowDown)
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
import VModal from 'vue-js-modal'
Vue.use(VModal)
import Echo from "laravel-echo";
window.io = require('socket.io-client');
window.Echo = new Echo({
  broadcaster: "socket.io",
  transports: ['websocket', 'polling', 'flashsocket'],
  host: window.location.hostname + ':6001',
  auth: {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('access_token'),
    },
  },
});

export default {
  store, router,
  name: "Customizer",
  mixins: [LockerProducts],
  computed: {
    isCustomerAuthenticated: function() {
      return this.$store.getters.isCustomerAuthenticated
    }
  },
  watch: {
    isCustomerAuthenticated: async function(newVal, oldVaL) {
      if(newVal) {
        await this.$store.dispatch('GET_LOCKER_PRODUCTS')
      }
    }
  },
  mounted: async function() {
    let elem = document.createElement('link');
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

    if(this.$root.$options.shadowRoot) {
      let ubuntu_font = document.createElement("style")
      ubuntu_font.append = '@import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap")'
      document.head.append(ubuntu_font)
      console.log("font appended")
    }
    await this.$store.dispatch('getPlatform');
    if (!this.$store.getters.getCustomer && localStorage.getItem('jwtToken')) {
      let token = localStorage.getItem('jwtToken')
      let response = await this.$store.dispatch('getCustomerFromToken', token)
      if (response) {
        let payload = {
          access_token: token,
          user: response
        }
        this.$store.commit('SET_CUSTOMER', payload)
      }
    }

    // This will only work on your root Vue component since it's using $parent
    const { shadowRoot } = this.$parent.$options
    const id = 'fa-styles'

    if (!shadowRoot.getElementById(`${id}`)) {
      const faStyles = document.createElement('style')
      faStyles.setAttribute('id', id)
      faStyles.textContent = dom.css()
      shadowRoot.appendChild(faStyles)
    }
    const token = this.$router.currentRoute.query.token
    if (token){
      let customer = await this.$store.dispatch('getCustomerFromToken', token)
      if (customer){
        let payload = {
          access_token: token,
          user: customer
        }
        this.$store.commit('SET_CUSTOMER', payload)
        if(!localStorage.getItem('browserToken')){
          await this.$store.dispatch('setBrowserToken')
        }
        this.$router.push({name: 'Home'})
        this.$store.commit('RESET_STORE')
      }else{
        alert('no customer')
      }
      this.$store.commit('SET_RECENT_LOGOS')
    }
    const customer =  this.$store.getters.getCustomer;
    window.Echo.channel(`notification.${customer.id}`).listen('RoasterUpdatedEvent',  (e) => {
      this.$store.commit('UPDATE_NOTIFICATIONS', e.notification)
    })
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
@import '~vue-js-modal/dist/styles.css';
@import '../assets/css/custom.css';

#santa {
  font-family: 'Ubuntu', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
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
