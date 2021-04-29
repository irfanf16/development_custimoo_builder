<template>
    <div class="preview-section p-3 d-flex flex-wrap justify-content-center align-items-center" v-if="selectedProduct">
      <template v-for="design in selectedProduct.productstyles[styleIndex].productdesigns">
        <div v-if="design.design_show == 1" class="image-holder" :key="'front'+design.id">
          <Scene v-if="selectedProduct.productstyles[styleIndex].back" :canvas-width="300" :canvas-height="360" :front="{textureUrl: apiBaseUrl+'/'+ design.front_design.file_url, modelUrl: apiBaseUrl+'/'+ selectedProduct.productstyles[styleIndex].front.file_url}" :back="{textureUrl: apiBaseUrl+'/'+ design.back_design.file_url, modelUrl: apiBaseUrl+'/'+ selectedProduct.productstyles[styleIndex].back.file_url}" :logos="selectedProduct.productstyles[styleIndex].logo" :logosSettings="selectedProduct.logos_setting" :logoAllowed="Boolean(selectedProduct.is_logo_allowed)" :logosLimit="selectedProduct.allowed_logos_count" :productColors="selectedProduct.colors" />
          <Scene class="view-back" v-else :canvas-width="300" :canvas-height="360" :front="{textureUrl: apiBaseUrl+'/'+ design.front_design.file_url, modelUrl: apiBaseUrl+'/'+ selectedProduct.productstyles[styleIndex].front.file_url}" :logos="selectedProduct.productstyles[styleIndex].logo" :logosSettings="selectedProduct.logos_setting" :logoAllowed="Boolean(selectedProduct.is_logo_allowed)" :logosLimit="selectedProduct.allowed_logos_count" :productColors="selectedProduct.colors"/>
        </div>
      </template>
    </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator'
  import Scene from "@/components/Scene.vue"

  @Component<CustomizationPreview>({
    components: {
      Scene
    }
  })
  export default class CustomizationPreview extends Vue {
    private apiBaseUrl: string =  process.env.VUE_APP_API_BASE_URL

    get selectedProduct(): Record<any, any>{
      return this.$store.getters.getSelectedProduct
    }
    get styleIndex():number{
      return  this.$store.getters.getCurrentStyleIndex;
    }
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
