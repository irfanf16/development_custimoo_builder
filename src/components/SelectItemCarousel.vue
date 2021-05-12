<template>
  <slither-slider @changed="loadMoreProduct" v-if="products.length" :options="{numberOfSlides: products.length > 3? 4: products.length, loop: false, dots: false, gap: 10}" class="select-item-slider p-3 p-lg-0">
    <template v-for="(product, index) in products">
      <a ref="products" v-on:click="productDesigns(index)" :key="product.product_id">
        <template v-for="design in product.productstyles[0].productdesigns">
          <div v-if="design.is_default == 1" class="image-holder" :key="'front'+design.id">
            <Scene :canvas-width="300" :canvas-height="360"
                   :front="{textureUrl: apiBaseUrl+'/'+ design.front_design.file_url, modelUrl: apiBaseUrl+'/'+ product.productstyles[0].front.file_url}"
                   :backTextureUrl="design.back_design? design.back_design.file_url: ''"
                   :logos="product.productstyles[0].logo" :logosSettings="product.logos_setting" :logoAllowed="Boolean(product.is_logo_allowed)"
                   :logosLimit="product.allowed_logos_count" :productColors="product.colors"/>
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
  data: function () {
    return {
      apiBaseUrl: process.env.VUE_APP_API_BASE_URL,
      renderComponent : true,
    }
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
    },
    loadMoreProduct: function (currentIndex) {
      if(this.$store.getters.getProducts.length - 5 <= currentIndex){
        this.$emit('retrieveProductsC', 1)
      }
    }
  }
}

</script>

<style lang="scss" scoped>

</style>
