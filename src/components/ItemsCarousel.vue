<template>
<div>
  <swiper ref="mySwiper" :options="carouselOptions">
    <swiper-slide v-for="(product, index) in products" :key="index" :index="index">
      <a ref="products" v-on:click="productDesigns(index)" :key="product.product_id">
        <template v-for="design in product.productstyles[0].productdesigns">
          <div v-if="design.is_default == 1" class="image-holder" :key="'front'+design.id">
            <Scene v-bind:multipleLogo="multipleLogo" canvas-width="150" canvas-height="150" :measurement-ratio="selectedProduct.measurement_ratio"
                   :front="{textureUrl: storageUrl+design.front_design.file_thumbnail_url, file_extension:design.front_design.file_extension, safe_zone_url: design.frontsafezone_design? storageUrl+design.frontsafezone_design.file_url : '',
                   modelUrl: product.productstyles[0].front? storageUrl+product.productstyles[0].front.file_thumbnail_url : ''}"
                   :backTextureUrl="design.back_design? design.back_design.file_thumbnail_url: ''"
                   :backTextrueExtension="design.back_design? design.back_design.file_extension: ''"
                   :logos="product.productstyles[0].logo" :logosSettings="product.logos_setting" :logoAllowed="Boolean(product.is_logo_allowed)"
                   :logosLimit="product.allowed_logos_count" :productNamesSetting="product.productnames" :productColors="product.colors"
                   :colorGrouping="JSON.parse(design.front_design.color_group)" :productType="product.product_type"/>
          </div>
        </template>
        <h3 class="text-center">{{ product.display_name }}</h3>
      </a>
    </swiper-slide>
    <div class="swiper-pagination" slot="pagination"></div>
  </swiper>
</div>
</template>

<script>

import { Swiper, SwiperSlide } from 'vue-awesome-swiper/'
import 'swiper/swiper-bundle.css'
import Scene from '@/components/Scene.vue'

export default {
  name: 'items-carousel',
  components: { Scene, Swiper, SwiperSlide },

  data: function () {
    return {
      storageUrl: process.env.VUE_APP_STORAGE_URL,
      renderComponent : true,
      multipleLogo:false,
      carouselOptions: {
        pagination: {
          el: '.swiper-pagination'
        },
        lazy: true
      }
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
      this.$store.dispatch('setColorSectionVisibility')
    },
    loadMoreProduct: function (currentIndex) {
      currentIndex = this.$refs['carousel'].currentSlide;
      if(this.$store.getters.getProducts.length - 5 <= currentIndex){
        this.$emit('retrieveProductsC', 1)
      }
      this.$refs['carousel'].update();
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
