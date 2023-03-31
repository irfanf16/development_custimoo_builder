<template>
  <div style="font-family: 'Ubuntu', sans-serif;">
    <router-view/>
  </div>
</template>
<script>
import router from './router'
import store from '../store'
import {dom} from '@fortawesome/fontawesome-svg-core'
import CommonImportMixin from '../mixins/CommonImportMixin.vue'

export default {
  store, router,
  name: "Customizer",
  mixins: [CommonImportMixin],
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
  }
}
</script>
