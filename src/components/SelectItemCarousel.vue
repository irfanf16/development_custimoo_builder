<template>
  <div class="position-relative">
    <div class="loader" v-if="searchLoader"><img src="../../src/assets/images/loading.gif" /></div>
    <slither-slider ref="slider" @changed="loadMoreProduct" v-if="products.length" :options="{numberOfSlides: 4, adaptiveHeight: false, loop: false, dots: false, gap: 10}" :class="{'one-product' : products.length === 1, 'two-product': products.length === 2, 'three-product': products.length === 3, 'four-product': products.length > 3}" class="select-item-slider p-3 p-lg-0">
      <template v-for="(product, index) in products">
        <a ref="products" v-on:click="productDesigns(index)" :key="product.product_id">
          <template v-for="design in product.productstyles[0].productdesigns">
            <div v-if="design.is_default == 1" class="image-holder" :key="'front'+design.id">
              <Scene v-bind:multipleLogo="multipleLogo" canvas-width="150" canvas-height="150" :measurement-ratio="design.measurement_ratio"
                     :front="{textureUrl: storageUrl+design.front_design.file_thumbnail_url, file_extension:design.front_design.file_extension, modelUrl: product.productstyles[0].front? storageUrl+product.productstyles[0].front.file_thumbnail_url : ''}"
                     :logos="product.productstyles[0].logo" :logosSettings="product.logos_setting" :logoAllowed="Boolean(product.is_logo_allowed)"
                     :logosLimit="product.allowed_logos_count" :productNamesSetting="product.productnames" :productColors="product.colors"
                     :colorGrouping="JSON.parse(design.front_design.color_group)" :productType="product.product_type" :product_id="product.id"/>
            </div>
          </template>
          <h3 class="text-center">{{ product.product_name }}</h3>
        </a>
      </template>
    </slither-slider>
  </div>
</template>

<script lang="ts">
import {Component, Vue, Mixins, Prop} from 'vue-property-decorator'
import SlitherSlider from 'slither-slider';
import Scene from '@/components/Scene.vue'
import {http} from "@/httpCommon";
import {handleMainProducts} from "@/mixins/LockerProduct";

Vue.use(SlitherSlider)

@Component<SelectItemCarousel>({
  components: {
    Scene
  },
  mounted() {
    (this.$parent.$parent as Record<any, any>).adjustTotalTabs()
  }
})


export default class SelectItemCarousel extends Mixins(handleMainProducts) {

  public storageUrl = process.env.VUE_APP_STORAGE_URL;
  public renderComponent =  true;
  public multipleLogo = false;
  public has_more_products = false;
  public showLoader = false;

  get searchLoader() {
    return this.$store.getters.getSearchLoader
  }
  get products() {
    return this.$store.getters.getProducts
  }

  public async productDesigns(index: number) {
    this.$store.commit('Change_Locker_Tabs_Index', undefined)
    await this.$store.dispatch('setSelectedIndex', {selectedIndex: index})
    this.$store.commit('CHANGE_STYLE_INDEX', 0);
    this.$store.dispatch("getModels", this.products[index].product_id);
    this.$store.dispatch('setColorSectionVisibility')
    this.$store.commit('SET_HIDE_SAVE_LOCKER_BUTTON', false)
    this.$store.commit('CHANGE_EDIT_STATUS', {status: false, id: 0, designId: 0, styleId: 0, product_id: 0,});
    (this.$parent.$parent as Record<any, any>).adjustTotalTabs()
  }

  public setSliderIndex() {
    if(this.$refs && this.$refs.slider)
      (this.$refs as Record<any,any>).slider.goToIndex(0);
  }

  public async loadMoreProduct() {
    let self = this;
    let main_products_info = await self.$store.getters.getMainProductsInfo;
    if(main_products_info.has_more_products) {
      let url = `/list/products?customized=${this.$store.getters.getCustomized}&personalized=${this.$store.getters.getPersonalized}&page=${main_products_info.next_page}`;
      if(main_products_info.active_product_id) {
        url += `&active_product_id=${main_products_info.active_product_id}`
      }
      http.get(url).then(async (response: Record<any, any>) => {
        await self.handleMainProducts(response);
        if((self as Record<any,any>)["showLoader"]) {
          (self as Record<any,any>).showLoader = false;
        }
      }, (error) => {
        console.error("Error while getting order detail", error.response.data.message)
      })
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

.loader{
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  img{
    width: 100%;
    max-width: 50px;
  }
}
</style>
