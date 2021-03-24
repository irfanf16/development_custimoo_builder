<template>
    <canvas ref="scene" id="c" class="canvas" width="400" height="500"></canvas>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { fabric } from 'fabric'

export default class Scene extends Vue {
  private el = this.$refs.scene as HTMLCanvasElement;
  private canvas = new fabric.Canvas(this.el, {
    hoverCursor: 'pointer',
    selection: false,
    targetFindTolerance: 2
  });
}

Component<Scene>({
  name: 'Scene'
})
</script>

<style scoped>
.scene {
    width: 100%;
    height: 100%;
}
</style>
