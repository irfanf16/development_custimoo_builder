import Vue from 'vue'
import Vuetify from 'vuetify';
import App from './App.vue'
import './registerServiceWorker'
import store from './store/index'
import 'vuetify/dist/vuetify.min.css';
import vuetify from './plugins/vuetify';

Vue.use(Vuetify);
Vue.config.productionTip = false

new Vue({
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
