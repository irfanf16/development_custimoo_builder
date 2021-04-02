<template>
  <carousel @changed="loadMoreProduct" v-if="renderComponent" class="select-item-slider" :items="renderComponent.length > 3? 4: renderComponent.length" :margin="20" :loop="false" :center="true" :touchDrag="true" :dots="false">
    <template v-for="(product, index) in productListingCarousel">
      <a href="#." ref="products" v-on:click="productDesigns(index)"  :key="product.product_id">
        <Scene :canvas-height="73" :canvas-width="59" :front="{textureUrl: apiBaseUrl+'/'+product.productstyles[0].productdesigns[0].front_design.file_url, modelUrl: apiBaseUrl+'/'+product.productstyles[0].front.file_url}"/>
      </a>
    </template>
  </carousel>
</template>

<script>

import carousel from 'vue-owl-carousel'
import Scene from '@/components/Scene.vue'

export default {
  components: { carousel, Scene },
  props:['productListingCarousel'],
  data: function () {
    return {
      apiBaseUrl: process.env.VUE_APP_API_BASE_URL,
      renderComponent : true
    }
  },
  created () {
    const self = this
    setTimeout(() => {
      self.renderComponent = false;

      self.$nextTick(() => {
        // Add the component back in
        self.renderComponent = true;
      });
    }, 1000)
  },
  methods: {
    productDesigns: function (index) {
      this.$emit('designsData', index)
    },
    loadMoreProduct:(e) => {
      console.log(e.item)
    }
  }
}

</script>

<style lang="scss" scoped>

</style>
