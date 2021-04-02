<template>
  <carousel @changed="loadMoreProduct" v-if="renderComponent" class="select-item-slider" :items="renderComponent.length > 3? 4: renderComponent.length" :margin="20" :loop="false" :center="true" :touchDrag="true" :dots="false">
    <template v-for="(product, index) in productListingCarousel">
      <a href="#." ref="products" v-on:click="productDesigns(index)" :key="product.product_id">
        <template v-for="design in product.productstyles[0].productdesigns">
          <div v-if="design.is_default == 1" class="image-holder" :key="'front'+design.id">
            <Scene :canvas-width="59" :canvas-height="73" :front="{textureUrl: apiBaseUrl+'/'+ design.front_design.file_url, modelUrl: apiBaseUrl+'/'+ product.productstyles[0].front.file_url}" />
          </div>
        </template>
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
    this.reRender()
  },
  methods: {
    productDesigns: function (index) {
      this.$emit('designsData', index)
    },
    loadMoreProduct: function (e) {
      console.log(e.item)
      if(e.item.index+1 == e.item.count){
        console.log(e.item.index)
        this.$emit('retrieveProductsC', 1)
      }
    },
    reRender: function () {
        const self = this
        setTimeout(() => {
          self.renderComponent = false;

          self.$nextTick(() => {
            // Add the component back in
            self.renderComponent = true;
          });
        }, 1000)
    }
  }
}

</script>

<style lang="scss" scoped>

</style>
