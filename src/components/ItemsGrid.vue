<template>
  <div class="grid grid-mobile-4">
    <div v-for="(product, index) in products" :key="index">
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
        <h3 class="text-center">{{ product.product_name }}</h3>
      </a>
    </div>
  </div>
</template>

<script>

import Scene from '@/components/Scene.vue'

export default {
  components: { Scene },
  data: function () {
    return {
      storageUrl: process.env.VUE_APP_STORAGE_URL,
      renderComponent : true,
      multipleLogo:false
    }
  },
  mounted() {
    // this.$root.$on('sliderEvent', () => { // here you need to use the arrow function
    //  if(this.$refs && this.$refs.slider)
    //   this.$refs.slider.goToIndex(0);
    // })
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
    // loadMoreProduct: function (currentIndex) {
    //   if(this.$store.getters.getProducts.length - 5 <= currentIndex){
    //     this.$emit('retrieveProductsC', 1)
    //   }
    // },
    myfunction: function(){
      alert('here')
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
