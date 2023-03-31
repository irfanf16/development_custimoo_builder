<script src="../mixins/LockerProduct.ts"></script>
<template>
  <div style="font-family: 'Ubuntu', sans-serif;">
    <Header />
    <Navbar />
    <router-view/>
  </div>
</template>

<script>

import router from '../router'
import store from '../store'
import {dom} from '@fortawesome/fontawesome-svg-core'
import Navbar from '@/components/Navbar.vue';
import Header from '@/components/Header.vue';

import CommonImportMixin from '../mixins/CommonImportMixin.vue'

import {getWindowObject} from "../helpers/Helpers";

export default {
  store, router,
  name: "Customizer",
  mixins: [CommonImportMixin],
  components: {
    Navbar, Header
  },
  mounted: async function() {
    getWindowObject().document.querySelector('v-customizer')
    // run time adding css for pringlessportsexcellence.com as it is not accept any direct css
    let ele = getWindowObject().document.getElementById('e88d412d-dfc3-4628-910b-8c0d7237a371')?.querySelector('[data-ux="Container"]')
    if(!ele) {
      // run time adding css for totalteamsales.com as it is not accept any direct css
      ele = getWindowObject().document.getElementById('8031c129-170b-4c6e-8387-bce977db3c36')?.querySelector('[data-ux="Container"]')
    }
    if(!ele) {
      // run time adding css for mooressports.com as it is not accept any direct css
      ele = getWindowObject().document.getElementById('2afb678d-9823-4fba-a546-506062145325')?.querySelector('[data-ux="Container"]')
    }
    if(ele) {
      ele.style.width = '100%'
      ele.style.paddingLeft = '0'
      ele.style.paddingRight = '0'
    }

    if(this.$root.$options.shadowRoot) {
      let ubuntu_font = document.createElement("style")
      ubuntu_font.append = '@import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap")'
      document.head.append(ubuntu_font)
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
  }
}
</script>
