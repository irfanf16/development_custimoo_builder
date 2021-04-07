<template>
  <div class="home">
    <Scene fill-colors="[{color: '#001234'}, {color: '#aa0034'}, {color: null}]" :front="{textureUrl: '/img/images/ChelseaAway2.svg', modelUrl: 'http://api.custimoo.com/files/1/product/base_model/LongSleeve%20details%20layer.png'}"/>
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
