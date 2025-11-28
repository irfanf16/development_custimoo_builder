<script src="../mixins/LockerProduct.ts"></script>
<template>
  <div style="font-family: 'Ubuntu', sans-serif;">
    <component :is="layoutComponent" />
  </div>
</template>

<script>

import router from '../router'
import store from '../store'
import {dom} from '@fortawesome/fontawesome-svg-core'
import Navbar from '@/components/Navbar.vue';
import Header from '@/components/Header.vue';
import HeaderNavbarLayout from '@/layouts/HeaderNavbarLayout.vue'
import MinimalLayout from '@/layouts/MinimalLayout.vue'

import CommonImportMixin from '../mixins/CommonImportMixin.vue'

import { getDomDocument, getWindowObject } from '../helpers/Helpers'

export default {
  store, router,
  name: "Customizer",
  mixins: [CommonImportMixin],
  components: {
    Navbar, Header ,  HeaderNavbarLayout,
    MinimalLayout
  },
  computed: {
    layoutComponent() {
      const layout = this.$route.meta.layout || 'default'
      return {
        default: 'HeaderNavbarLayout',
        minimal: 'MinimalLayout'
      }[layout]
    }
  },
  mounted: async function() {
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
    if(!ele) {
      // run time adding css for mooressports.com as it is not accept any direct css
      ele = getWindowObject().document.getElementById('df7a18b7-68cc-4c97-8ee7-4ee261b7544d')?.querySelector('[data-ux="Container"]')
    }
    if(!ele) {
      // run time adding css for royalsports1974.com as it is not accept any direct css
      ele = getWindowObject().document.getElementById('8f0c327b-2b7b-4e88-a62a-c3cebee4bc9d')?.querySelector('[data-ux="Container"]')
    }
    if(!ele) {
      // run time adding css for keystonesourceforsports.ca as it is not accept any direct css
      ele = getWindowObject().document.getElementById('04e68071-6532-4228-a74a-7f3cbe5d5971')?.querySelector('[data-ux="Container"]')
    }
    if(!ele) {
      // run time adding css for https://edgewear.ca/customizer as it is not accept any direct css
      ele = getWindowObject().document.getElementById('0105581a-6b1a-4745-a822-ee75618f4d1e')?.querySelector('[data-ux="Container"]')
    }
    if(!ele) {
      // run time adding css for https://edgewear.ca/customizer as it is not accept any direct css
      ele = getWindowObject().document.getElementById('2c792c98-b7dd-4452-b435-1b48c5ed473b')?.querySelector('[data-ux="Container"]')
    }
    if(!ele) {
      // run time adding css for https://belleriverteamworks.godaddysites.com/ as it is not accept any direct css
      ele = getWindowObject().document.getElementById('527c5fae-6830-4434-a7ec-e635c60a81d0')?.querySelector('[data-ux="Container"]')
    }
    if(!ele) {
      // run time adding css for https://brandonsource.com/  as it is not accept any direct css
      ele = getWindowObject().document.getElementById('3d7b2a19-8d69-47ee-af45-fbcc339e9868')?.querySelector('[data-ux="Container"]')
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

    const doc = getDomDocument(true) ? getDomDocument(true) : getDomDocument();
    const style1 = doc.createElement('style');
    const style2 = doc.createElement('style');
    const isOnepage = doc.location.host == 'mckiesports.com';
    style1.innerHTML = `.vm--block-scroll{overflow-y: auto;} ${isOnepage && '.vm--container{top: auto !important}.vm--modal{margin-top: 0px !important}'}`;
    style2.innerHTML = `.vm--block-scroll{overflow-y: auto;} ${isOnepage && '.vm--container{top: auto !important}.vm--modal{margin-top: 0px !important}'}`;
    doc.head.appendChild(style1);
    const customizer = doc.querySelector('v-customizer')
    customizer?.shadowRoot.appendChild(style2)
  }
}
</script>
