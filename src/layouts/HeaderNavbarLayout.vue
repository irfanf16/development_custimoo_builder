<template>
  <div>
    <Header />
    <Navbar v-if="company.status" />
    <router-view />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Header from '@/components/Header.vue'
import Navbar from '@/components/Navbar.vue'
import CommonImportMixin from '@/mixins/CommonImportMixin.vue'

@Component({
  components: {
    Header,
    Navbar
  },
  mixins: [CommonImportMixin]
})
export default class FullLayout extends Vue {
   
}
</script>
