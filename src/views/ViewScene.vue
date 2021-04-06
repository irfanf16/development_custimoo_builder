<template>
  <div class="home">
    <Scene fill-color="#001234" :front="{textureUrl: 'http://api.custimoo.com/files/1/product/texture/ChelseaAway2.svg', modelUrl: 'http://api.custimoo.com/files/1/product/base_model/LongSleeve%20details%20layer.png'}"/>
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
