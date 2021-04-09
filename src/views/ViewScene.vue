<template>
  <div class="home">
    <Scene fill-colors="[{color: '#001234'}, {color: '#aa0034'}, {color: null}]"
           :logos="[
             {url: './img/images/logo.png', width: 100, height: 100, x: 100, y: 117, haveControls: true, side: 'front'},
             {url: './img/images/logo.png', width: 100, height: 100, x: 100, y: 117, haveControls: false, side: 'back'}
             ]"
           :front="{textureUrl: '/img/images/Gathered_fittedSize.svg', modelUrl: '/img/images/front_detail.png'}"
           :back="{textureUrl: '/img/images/Gathered_fittedSize.svg', modelUrl: '/img/images/back_detail.png'}"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Scene from '@/components/Scene.vue' // @ is an alias to /src

@Component({
  components: {
    Scene
  },
  mounted () {
    this.$store.dispatch('setDefaultFillColors')
  }
})
export default class ViewScene extends Vue {}
</script>
