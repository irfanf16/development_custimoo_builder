<template>
  <div class="home">
    <Scene :canvas-height="400" :canvas-width="400" :front="{textureUrl: './img/images/HoodieDesign_2.svg', modelUrl: './img/images/HoodieTemplateFront.png'}"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Scene from '@/components/Scene.vue' // @ is an alias to /src

@Component({
  components: {
    Scene
  }
})
export default class ViewScene extends Vue {}
</script>
