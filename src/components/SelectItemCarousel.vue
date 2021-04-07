<template>
  <slither-slider @changed="loadMoreProduct" v-if="productListingCarousel.length" :options="{numberOfSlides: productListingCarousel.length > 3? 4: productListingCarousel.length, loop: false, dots: false}" class="select-item-slider">
    <template v-for="(product, index) in productListingCarousel">
      <a href="#." ref="products" v-on:click="productDesigns(index)" :key="product.product_id">
        <template v-for="design in product.productstyles[0].productdesigns">
          <div v-if="design.is_default == 1" class="image-holder" :key="'front'+design.id">
            <Scene :canvas-width="59" :canvas-height="73" :front="{textureUrl: apiBaseUrl+'/'+ design.front_design.file_url, modelUrl: apiBaseUrl+'/'+ product.productstyles[0].front.file_url}" />
          </div>
        </template>
      </a>
    </template>
  </slither-slider>
</template>

<script>

import SlitherSlider from 'slither-slider';
import Scene from '@/components/Scene.vue'
import Vue from 'vue'
Vue.use(SlitherSlider)

export default {
  components: { Scene },
  props:['productListingCarousel'],
  data: function () {
    return {
      apiBaseUrl: process.env.VUE_APP_API_BASE_URL,
      renderComponent : true
    }
  },
  methods: {
    productDesigns: function (index) {
      this.$emit('designsData', index)
    },
    loadMoreProduct: function (currentIndex) {
      if(this.productListingCarousel.length == currentIndex + 1){
        this.$emit('retrieveProductsC', 1)
      }
    }
  }
}

</script>

<style lang="scss" scoped>

</style>
