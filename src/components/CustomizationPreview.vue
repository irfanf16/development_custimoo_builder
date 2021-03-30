<template>
    <div class="preview-section p-3 d-flex flex-wrap justify-content-center align-items-center">
        <div class="image-holder"><img src="@/assets/images/shirt-front.svg" alt="Front View" /></div>
        <div class="image-holder"><img src="@/assets/images/shirt-back.svg" alt="Back View" /></div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
@Component<CustomizationPreview>({
})
    export default class CustomizationPreview extends Vue {}
</script>

<style scoped lang="scss">
  .preview-section{
    overflow: hidden;
    .image-holder{
      margin: 0 1%;
      flex: 0 0 48%;
      max-width: 48%;
      img{
        display: block;
        max-width: 100%;
        margin: 0;
        height: auto;
      }
    }
  }
</style>