<template>
<!--  <div class="grid grid-mobile-4 gap-2 pick-item mt-3">-->
  <div class="d-flex gap-1 pick-item mt-3 hide-scroll overflow-auto">
    <HorizontalScroll v-if="showItems && !animPlayed" />
    <div v-for="(product, index) in products" :key="index">
      <div ref="products" v-on:click="productDesigns(index)" :key="product.product_id">
        <template v-for="design in product.productstyles[0].productdesigns">
          <div v-if="design.is_default == 1" class="image-holder" :key="'front'+design.id">
            <Scene v-bind:multipleLogo="multipleLogo" canvas-width="150" canvas-height="150" :measurement-ratio="product.measurement_ratio"
              :front="{textureUrl: storageUrl+design.front_design.file_thumbnail_url, file_extension:design.front_design.file_extension, modelUrl: product.productstyles[0].front? storageUrl+product.productstyles[0].front.file_thumbnail_url : ''}"
                   :logos="product.productstyles[0].logo" :logosSettings="product.logos_setting" :logoAllowed="Boolean(product.is_logo_allowed)"
                   :logosLimit="product.allowed_logos_count" :productNamesSetting="product.productnames" :productColors="product.colors"
                   :colorGrouping="JSON.parse(design.front_design.color_group)" :productType="product.product_type" :product_id="product.id" :product_index="index"/>
          </div>
        </template>
        <h3 class="text-center">{{ product.product_name }}</h3>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import Scene from '@/components/Scene.vue'
import HorizontalScroll from "@/components/mobile/animations/HorizontalScroll";
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component<ItemsGrid>({
  components: {
    HorizontalScroll,
    Scene
  },
  mounted() {
    this.animPlayed = localStorage.getItem('animPlayed')
  }
})

export default class ItemsGrid extends Vue {
  @Prop({ required: true }) readonly products_fonts!: Record<any, any>
  @Prop({ required: false }) readonly showItems!: boolean
  public storageUrl = process.env.VUE_APP_STORAGE_URL
  public renderComponent = true
  public multipleLogo = false
  public animPlayed = false

  get products() {
    return this.$store.getters.getProducts
  }

  productDesigns(index: number) {
    this.$store.commit('CHANGE_STYLE_INDEX', 0);
    this.$store.dispatch("getModels", this.products[index].product_id);
    this.$store.dispatch('setSelectedIndex', {selectedIndex: index})
    this.$store.dispatch('setColorSectionVisibility')
  }
}

</script>

<style lang="scss" scoped>
.pick-item{
  position: relative;

  &>div{
    width: 86px;
    flex-shrink: 0;
  }
  .image-holder{
    position: relative;

    &:after{
      content: "";
      display: block;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 100;
      background: rgba(0,0,0,0);
    }
  }
}
.select-item-slider{
  h3{
    overflow: hidden;
    width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.8rem;
    margin-top: 5px;
  }
}
</style>
