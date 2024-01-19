<template>
  <div class="page-wrapper m-lg-4" v-cloak>
    <meta name="viewport" content="width=device-width">
    <b-container fluid>
      <b-row>
        <ThreeDScene :imageData="{model_url: 'threejs/Hummel_Jersey_v1/Textures/Jensen-LS.glb', texture_url: 'threejs/Hummel_Jersey_v1/Textures/Hummel_Normal.png', design_url: 'threejs/Hummel_Jersey_v1/Textures/Test_svg_rectang.svg'}"
                     products_fonts="" :logos="[]" measurement-ratio="10"></ThreeDScene>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">

import {Component, Vue} from 'vue-property-decorator'
import ThreeDScene from "@/components/ThreeDScene.vue";


@Component<ThreeDView>({
  components: {
    ThreeDScene
  },

  async mounted() {
    //get recent logos
  }
})

export default class ThreeDView extends Vue {


}
</script>
