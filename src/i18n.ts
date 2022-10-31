import Vue from 'vue'
import VueI18n from 'vue-i18n'
import axios from 'axios'

Vue.use(VueI18n)

function loadTranslations () {
  return axios.get(`http://custimoo-v2-backend.test/api/get-translations`).then(
    messages => {
      return messages.data;
    }
  )
}

// export default new VueI18n({
//   locale: process.env.VUE_APP_I18N_LOCALE || 'en',
//   fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
//   messages: loadLocaleMessages()
// })
export function initI18n(): Record<any, any> {
  return loadTranslations().then(function(data) {
    return new VueI18n({
      locale: process.env.VUE_APP_I18N_LOCALE || 'en',
      fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
      messages: data
    })
  })
}
