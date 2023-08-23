<template>
  <div id="santa" v-cloak>
    <Header />
    <Navbar v-if="company.status" />
    <router-view/>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import Header from '@/components/Header.vue';
import Navbar from '@/components/Navbar.vue';

import CommonImportMixin from '@/mixins/CommonImportMixin.vue'

@Component<App>({
  components: {
    Header,
    Navbar
  },
  mounted(){
    console.log(this.company)
  },
  mixins: [CommonImportMixin],
})
export default class App extends Vue {
  get company(){
    return this.$store.getters.getCompany
  }
}
</script>
