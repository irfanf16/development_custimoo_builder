<template>
    <carousel class="select-item-slider" :items="4" :margin="20" :loop="true" :center="true" :touchDrag="true" :dots="false">
        <a href="#." v-for="product in productListingCarousel" :key="product.product_id">
          <Scene :canvas-height="73" :canvas-width="59" :front="{textureUrl: apiBaseUrl+'/'+product.productstyles[0].front.file_url, modelUrl: apiBaseUrl+'/'+product.productstyles[0].productdesigns[0].front_design.file_url}"/>
        </a>
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
      apiBaseUrl: process.env.VUE_APP_API_BASE_URL
    }
  }
}
console.log(process.env.VUE_APP_API_BASE_URL)
</script>

<style lang="scss" scoped>

</style>
