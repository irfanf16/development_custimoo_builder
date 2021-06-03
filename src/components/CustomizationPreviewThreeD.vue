<template>
    <div class="preview-section p-3 d-flex flex-wrap justify-content-center align-items-center">
      <div class="sketchfab-embed-wrapper"> <iframe title="Button down test" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="fullscreen; autoplay; vr" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/336b431cd7ba46c1946a30a818695024/embed?autostart=1"> </iframe> </div>
    </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator'
  import Scene from "@/components/Scene.vue"

  @Component<CustomizationPreviewThreeD>({
    
  })
  export default class CustomizationPreviewThreeD extends Vue {
    
  }
</script>

<style scoped lang="scss">
  .preview-section{
    overflow: hidden;
    .image-holder{
      margin: 0 1%;
      img{
        display: block;
        max-width: 100%;
        margin: 0;
        height: auto;
      }
    }
  }
</style>
