<template>
    <div class="preview-section p-3 d-flex flex-wrap justify-content-center align-items-center" v-if="selectedProduct">
      <template v-for="design in selectedProduct.productstyles[styleIndex].productdesigns.filter(product_design => product_design.design_show)">
        <div class="image-holder" :key="'front'+design.id">
          <Scene v-if="design.back_design" :measurement-ratio="selectedProduct.measurement_ratio" ref="mainScene"
                 :front="{
                    textureUrl: storageUrl+design.front_design.file_base_url, file_extension:design.front_design.file_extension,
                    safe_zone_url: design.frontsafezone_design? storageUrl+design.frontsafezone_design.file_url : '',
                    boundary_url: design.frontboundary_design? storageUrl+design.frontboundary_design.file_url : '',
                    models: selectedProduct.productstyles[styleIndex].front_models
                 }"
                 :back="{
                    textureUrl: storageUrl+design.back_design.file_base_url, file_extension:design.back_design.file_extension,
                    safe_zone_url: design.backsafezone_design? storageUrl+design.backsafezone_design.file_url : '',
                    boundary_url: design.backboundary_design? storageUrl+design.backboundary_design.file_url : '',
                    models: selectedProduct.productstyles[styleIndex].back_models
                 }"
                 :logos="selectedProduct.productstyles[styleIndex].logo" :logosSettings="selectedProduct.logos_setting" :logoAllowed="Boolean(selectedProduct.is_logo_allowed)"
                 :logosLimit="selectedProduct.allowed_logos_count" :productNamesSetting="selectedProduct.productnames" :productColors="selectedProduct.colors"
                 :colorGrouping="JSON.parse(design.front_design.color_group)" mainPreview="true" :canvasSelection="canvasSelection" :productType="selectedProduct.product_type"
                 :product_id="selectedProduct.id" :product_index="selectedProductIndex" :products_fonts="products_fonts" :fromRosterModal="fromRosterModal" />

          <Scene v-else class="view-back" :measurement-ratio="selectedProduct.measurement_ratio" ref="mainScene"
                 :front="{textureUrl: storageUrl+design.front_design.file_base_url, file_extension:design.front_design.file_extension, safe_zone_url: design.frontsafezone_design? storageUrl+design.frontsafezone_design.file_url : '',
                 models: selectedProduct.productstyles[styleIndex].front_models}"
                 :logos="selectedProduct.productstyles[styleIndex].logo" :logosSettings="selectedProduct.logos_setting" :logoAllowed="Boolean(selectedProduct.is_logo_allowed)"
                 :logosLimit="selectedProduct.allowed_logos_count" :productNamesSetting="selectedProduct.productnames" :productColors="selectedProduct.colors"
                 :colorGrouping="JSON.parse(design.front_design.color_group)" mainPreview="true" :canvasSelection="canvasSelection" :productType="selectedProduct.product_type"
                 :product_id="selectedProduct.id" :product_index="selectedProductIndex" :products_fonts="products_fonts" :fromRosterModal="fromRosterModal" />
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
    @Prop({ required: true }) readonly products_fonts!: Record<any, any>
    @Prop({required: false, default: true}) readonly canvasSelection!: boolean;
    @Prop({required: false, default: false}) readonly fromRosterModal!: boolean;
    private storageUrl = process.env.VUE_APP_STORAGE_URL

    get selectedProduct(): Record<any, any>{
      return this.$store.getters.getSelectedProduct
    }
    get selectedProductIndex(): number{
      return this.$store.getters.getSelectedIndex
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
