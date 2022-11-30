import { Component, Vue } from 'vue-property-decorator'
import Gleap from 'gleap'
import { getCompany } from '@/helpers/Helpers'
import { i18n } from '@/i18n'
import store from '@/store'
Gleap.initialize("jmnVe5UF34mxObuFCzxan9LvtNeNXVkc");

@Component
export default class CommonImportMixin extends Vue{
  async mounted () {
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
  }
}
