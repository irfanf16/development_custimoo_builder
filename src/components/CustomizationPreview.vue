<template>
    <div class="preview-section p-3 d-flex flex-wrap justify-content-center align-items-center" v-if="selectedProduct">
      <template v-for="design in selectedProduct.productstyles[styleIndex].productdesigns">
        <div v-if="design.design_show == 1" class="image-holder" :key="'front'+design.id">
          <Scene v-if="design.back_design" :measurement-ratio="selectedProduct.measurement_ratio" ref="mainScene"
                 :front="{textureUrl: storageUrl+design.front_design.file_base_url, file_extension:design.front_design.file_extension, modelUrl: selectedProduct.productstyles[styleIndex].front? storageUrl+selectedProduct.productstyles[styleIndex].front.file_url : ''}"
                 :back="{textureUrl: storageUrl+design.back_design.file_base_url, file_extension:design.back_design.file_extension, modelUrl: selectedProduct.productstyles[styleIndex].back? storageUrl+selectedProduct.productstyles[styleIndex].back.file_url : ''}"
                 :logos="selectedProduct.productstyles[styleIndex].logo" :logosSettings="selectedProduct.logos_setting" :logoAllowed="Boolean(selectedProduct.is_logo_allowed)"
                 :logosLimit="selectedProduct.allowed_logos_count" :productNamesSetting="selectedProduct.productnames" :productColors="selectedProduct.colors"
                 :colorGrouping="JSON.parse(design.front_design.color_group)" mainPreview="true" :canvasSelection="canvasSelection" :productType="selectedProduct.product_type" />

          <Scene v-else class="view-back" :measurement-ratio="selectedProduct.measurement_ratio" ref="mainScene"
                 :front="{textureUrl: storageUrl+design.front_design.file_base_url, file_extension:design.front_design.file_extension, modelUrl: selectedProduct.productstyles[styleIndex].front? storageUrl+selectedProduct.productstyles[styleIndex].front.file_url : ''}"
                 :logos="selectedProduct.productstyles[styleIndex].logo" :logosSettings="selectedProduct.logos_setting" :logoAllowed="Boolean(selectedProduct.is_logo_allowed)"
                 :logosLimit="selectedProduct.allowed_logos_count" :productNamesSetting="selectedProduct.productnames" :productColors="selectedProduct.colors"
                 :colorGrouping="JSON.parse(design.front_design.color_group)" mainPreview="true" :canvasSelection="canvasSelection" :productType="selectedProduct.product_type" />
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
    @Prop({required: false, default: true}) readonly canvasSelection!: boolean;
    private storageUrl = process.env.VUE_APP_STORAGE_URL

    get selectedProduct(): Record<any, any>{
      return this.$store.getters.getSelectedProduct
    }
    get styleIndex():number{
      return  this.$store.getters.getCurrentStyleIndex
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
