<template>
  <v-app>
    <v-main>
      <scene-obj-loader/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import SceneObjLoader from './components/SceneObjLoader.vue';

  @Component({
    components: {
      SceneObjLoader,
    },
  })
  export default class App extends Vue {}
</script>