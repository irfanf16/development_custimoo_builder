<template>
  <div style="font-family: 'Ubuntu', sans-serif;">
    <Navbar v-if="isEcomCompanyWithOrderTab()" />
    <router-view :key="$store.getters.getAppComponentKey"/>
  </div>
</template>
<script>
import router from './router'
import store from '../store'
import {dom} from '@fortawesome/fontawesome-svg-core'
import CommonImportMixin from '../mixins/CommonImportMixin.vue'
import { getDomDocument, isEcomCompanyWithOrderTab } from '../helpers/Helpers'
import Navbar from '@/components/Navbar.vue';

export default {
  store, router,
  name: "Customizer",
  mixins: [CommonImportMixin],
  components: {
    Navbar
  },
  mounted: async function() {

    // This will only work on your root Vue component since it's using $parent
    const { shadowRoot } = this.$parent.$options

    if(shadowRoot) {
      let ubuntu_font = document.createElement("style")
      ubuntu_font.append = '@import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap")'
      document.head.append(ubuntu_font)
    }

    const id = 'fa-styles'

    if (!shadowRoot.getElementById(`${id}`)) {
      const faStyles = document.createElement('style')
      faStyles.setAttribute('id', id)
      faStyles.textContent = dom.css()
      shadowRoot.appendChild(faStyles)
    }

    const doc = getDomDocument(true) ? getDomDocument(true) : getDomDocument();
    const style1 = doc.createElement('style');
    const style2 = doc.createElement('style');
    style1.innerHTML = `.vm--block-scroll{overflow-y: auto;}`;
    style2.innerHTML = `.vm--block-scroll{overflow-y: auto;}`;
    doc.head.appendChild(style1);
    const customizer = doc.querySelector('v-customizer')
    customizer?.shadowRoot.appendChild(style2)
  },
  methods:{
    isEcomCompanyWithOrderTab
  }
}
</script>
