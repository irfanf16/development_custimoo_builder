import Vue from 'vue'
import VueI18n from 'vue-i18n'
import messages from '@/lang/en.json'
import axios from 'axios'
import store from './store';
import {getCompany} from "@/helpers/Helpers";

Vue.use(VueI18n)

export const i18n = new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages
});

/*getCompany().then(function () {
  console.log('trans loaded');
  i18n.setLocaleMessage(i18n.locale, store.getters.getCompany.translations);
});*/
// function loadTranslations () {
//   return getCompany().then(function (){
//     return store.getters.getCompany.translations;
//     // return axios.get(`http://custimoo-v2-backend.test/api/get-translations`).then(
//     //   messages => {
//     //     return messages.data;
//     //   }
//     // )
//   });
// }

// export default new VueI18n({
//   locale: process.env.VUE_APP_I18N_LOCALE || 'en',
//   fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
//   messages: loadLocaleMessages()
// })
// export function initI18n(): Record<any, any> {
//   //return loadTranslations().then(function(data) {
//     return i18n;
//   //})
// }
