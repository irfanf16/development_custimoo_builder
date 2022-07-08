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
                   :colorGrouping="JSON.parse(design.front_design.color_group)" :productType="product.product_type"/>
          </div>
        </template>
        <h3 class="text-center">{{ product.product_name }}</h3>
      </div>
    </div>
  </div>
</template>

<script>

import Scene from '@/components/Scene.vue'
import HorizontalScroll from "@/components/mobile/animations/HorizontalScroll";

export default {
  components: {HorizontalScroll, Scene },
  data: function () {
    return {
      storageUrl: process.env.VUE_APP_STORAGE_URL,
      renderComponent : true,
      multipleLogo:false,
      animPlayed: false
    }
  },
  props: {
    showItems: Boolean
  },
  mounted() {
    // this.$root.$on('sliderEvent', () => { // here you need to use the arrow function
    //  if(this.$refs && this.$refs.slider)
    //   this.$refs.slider.goToIndex(0);
    // })
    this.animPlayed = localStorage.getItem('animPlayed')
  },
  computed: {
    products: function() {
      return this.$store.getters.getProducts
    }
  },
  methods: {
    productDesigns: function (index) {
      this.$store.commit('CHANGE_STYLE_INDEX', 0);
      this.$store.dispatch("getModels", this.products[index].product_id);
      this.$store.dispatch('setSelectedIndex', {selectedIndex: index})
      this.$store.dispatch('setColorSectionVisibility')
    }
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
