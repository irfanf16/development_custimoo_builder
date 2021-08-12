<template>
  <slither-slider @changed="loadMoreProduct" v-if="products.length" :options="{numberOfSlides: products.length > 3? 4: products.length, loop: false, dots: false, gap: 10}" :class="{'one-product' : products.length === 1, 'two-product': products.length === 2, 'three-product': products.length === 3, 'four-product': products.length > 3}" class="select-item-slider p-3 p-lg-0">
    <template v-for="(product, index) in products">
      <a ref="products" v-on:click="productDesigns(index)" :key="product.product_id">
        <template v-for="design in product.productstyles[0].productdesigns">
          <div v-if="design.is_default == 1" class="image-holder" :key="'front'+design.id">
            <Scene v-bind:multipleLogo="multipleLogo" canvas-width="150" canvas-height="150" :measurement-ratio="design.measurement_ratio"
              :front="{textureUrl: storageUrl+design.front_design.file_url, modelUrl: product.productstyles[0].front? storageUrl+product.productstyles[0].front.file_url : ''}"
                   :backTextureUrl="design.back_design? design.back_design.file_url: ''"
                   :logos="product.productstyles[0].logo" :logosSettings="product.logos_setting" :logoAllowed="Boolean(product.is_logo_allowed)"
                   :logosLimit="product.allowed_logos_count" :productNamesSetting="product.productnames" :productColors="product.colors"
                   :colorGrouping="JSON.parse(design.front_design.color_group)" :productType="product.product_type"/>
          </div>
        </template>
        <h3 class="text-center">{{ product.display_name }}</h3>
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
      storageUrl: process.env.VUE_APP_STORAGE_URL,
      renderComponent : true,
      multipleLogo:false
    }
  },
  computed: {
    products: function() {
      console.log('yoooo')
      return this.$store.getters.getProducts
    }
  },
  methods: {
    productDesigns: function (index) {
      this.$store.commit('CHANGE_STYLE_INDEX', 0);
      this.$store.dispatch("getModels", this.products[index].product_id);
      this.$store.dispatch('setSelectedIndex', {selectedIndex: index})
      this.$store.dispatch('setColorSectionVisibility')
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
