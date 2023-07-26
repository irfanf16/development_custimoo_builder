<template>
<!--  <div class="grid grid-mobile-4 gap-2 pick-item mt-3">-->
  <div class="d-flex gap-1 pick-item mt-1 hide-scroll overflow-auto" :class="{'mt-3': !mobileScreen}">
    <HorizontalScroll v-if="showItems && !animPlayed" />
    <div v-for="(product, index) in products" :key="index">
      <div ref="products" v-on:click="productDesigns(index)" :key="product.product_id">
        <template v-for="design in product.productstyles[0].productdesigns.filter(product_design => product_design.is_default)">
          <div class="image-holder" :key="'front'+design.id">
            <Scene canvas-width="150" canvas-height="150" :measurement-ratio="product.measurement_ratio"
                   :front="{
                      textureUrl: storageUrl+design.front_design.file_thumbnail_url, file_extension:design.front_design.file_extension,
                      safe_zone_url: design.frontsafezone_design? storageUrl+design.frontsafezone_design.file_url : '',
                      boundary_url: design.frontboundary_design? storageUrl+design.frontboundary_design.file_url : '',
                      models: product.productstyles[0].front_models
                   }"
                   :logos="product.productstyles[0].logo" :logosSettings="product.logos_setting" :logoAllowed="Boolean(product.is_logo_allowed)"
                   :logosLimit="product.allowed_logos_count" :productNamesSetting="product.productnames" :productColors="product.colors"
                   :colorGrouping="JSON.parse(design.front_design.color_group)" :productType="product.product_type" :product_id="product.id"
                   :product_index="index" :products_fonts="products_fonts" />
          </div>
        </template>
        <h3 class="text-center">{{ product.product_name }}</h3>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import Scene from '@/components/Scene.vue'
import HorizontalScroll from '@/components/mobile/animations/HorizontalScroll.vue';
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
  public animPlayed = false
  public mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  get products() {
    return this.$store.getters.getProducts
  }

  productDesigns(index: number) {
    this.$store.commit('CHANGE_STYLE_INDEX', 0);
    this.$store.dispatch("getModels", this.products[index].product_id);
    this.$store.dispatch('setSelectedIndex', {selectedIndex: index, selected_id: this.products[index].id})
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
    font-size: 0.7rem;
    margin-top: 5px;
  }
}
</style>
