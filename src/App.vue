<template>
  <div  id="full-layout" v-cloak>
  <component :is="layoutComponent" :key="$store.getters.getAppComponentKey" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import HeaderNavbarLayout from '@/layouts/HeaderNavbarLayout.vue'
import MinimalLayout from '@/layouts/MinimalLayout.vue'

@Component({
  components: {
    HeaderNavbarLayout,
    MinimalLayout
  }
})
export default class App extends Vue {

  get layoutComponent() {
  const layout = (this.$route.meta && this.$route.meta.layout) || 'default'
  return {
    default: 'HeaderNavbarLayout',
    minimal: 'MinimalLayout'
  }[layout]
}
}


</script>
