<template>
  <div class="home">
    <Scene/>
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
export default class Home extends Vue {}
</script>
