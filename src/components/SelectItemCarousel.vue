<template>
  <div class="position-relative">
    <div class="loader" v-if="searchLoader"><img src="../../src/assets/images/loading.gif" /></div>
    <slither-slider ref="slider" @changed="loadMoreProduct" v-if="products.length" :options="{numberOfSlides: number_of_slides, adaptiveHeight: false, loop: false, dots: false, gap: 10}" :class="{'one-product' : products.length === 1, 'two-product': products.length === 2, 'three-product': products.length === 3, 'four-product': products.length > 3}" class="select-item-slider p-3 p-lg-0">
      <template v-for="(product, index) in products">
        <a ref="products" v-on:click="productDesigns(index)" :key="product.product_id" v-if="product.productstyles[0] && Object.prototype.hasOwnProperty.call(product.productstyles[0],'productdesigns')">
          <template v-for="design in product.productstyles[0].productdesigns">
            <div v-if="design.is_default == 1" class="image-holder" :key="'front'+design.id">
              <Scene v-bind:multipleLogo="multipleLogo" canvas-width="150" canvas-height="150" :measurement-ratio="product.measurement_ratio"
                     :front="{textureUrl: storageUrl+design.front_design.file_thumbnail_url, file_extension:design.front_design.file_extension, modelUrl: product.productstyles[0].front? storageUrl+product.productstyles[0].front.file_thumbnail_url : ''}"
                     :logos="product.productstyles[0].logo" :logosSettings="product.logos_setting" :logoAllowed="Boolean(product.is_logo_allowed)"
                     :logosLimit="product.allowed_logos_count" :productNamesSetting="product.productnames" :productColors="product.colors"
                     :colorGrouping="JSON.parse(design.front_design.color_group)" :productType="product.product_type" :product_id="product.id" :product_index="index" :products_fonts="products_fonts"/>
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
import {handleMainProducts, exitEditMode} from "@/mixins/LockerProduct";
import {HideUpdateLockerButton} from "@/mixins/SelectedProductMixin";

Vue.use(SlitherSlider)

@Component<SelectItemCarousel>({
  components: {
    Scene
  },
  created() {
    (this.$parent.$parent as Record<any, any>).adjustTotalTabs()
   this.listenSliderEvent()
  }
})


export default class SelectItemCarousel extends Mixins(handleMainProducts, exitEditMode, HideUpdateLockerButton) {
  @Prop({ required: true }) readonly products_fonts!: Record<any, any>

  public storageUrl = process.env.VUE_APP_STORAGE_URL;
  public renderComponent =  true;
  public multipleLogo = false;
  public has_more_products = false;
  public showLoader = false;
  public number_of_slides = 4;

  get searchLoader() {
    return this.$store.getters.getSearchLoader
  }

  get products() {
    return this.$store.getters.getProducts
  }

  get selectedProduct() {
    return this.$store.getters.getSelectedProduct;
  }

  get getProductEditInfoObject() {
    return this.$store.getters.getProductEditInfoObject;
  }

  public async productDesigns(index: number) {
    let self: Record<any, any> = this;
    let style_index = 0;
    this.$store.commit('Change_Locker_Tabs_Index', undefined)
    await this.$store.dispatch('setSelectedIndex', {selectedIndex: index})
    this.$store.commit('CHANGE_STYLE_INDEX', style_index);
    this.$store.dispatch("getModels", this.products[index].product_id);
    this.$store.dispatch('setColorSectionVisibility')
    this.hideLockerProductUpdateButton()
    this.$store.commit('CHANGE_EDIT_STATUS', {status: false, id: 0, designId: 0, styleId: 0, product_id: 0,});
    (this.$parent.$parent as Record<any, any>).adjustTotalTabs()
    let design_index = null;
    let selected_product_design = this.selectedProduct.productstyles[style_index].productdesigns.filter((product_design: Record<any, any>, product_design_index: number) => {
      if(product_design.design_show === 1) {
        design_index = product_design_index;
      }
      return product_design.design_show === 1
    })[0];
    if(selected_product_design) {
      this.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", {
        design_index: design_index, design_id: selected_product_design.id, product_index: index, product_id: this.selectedProduct.id, style_index: style_index,
        style_id:  this.selectedProduct.productstyles[style_index].id
      });
    }
    if(self.getProductEditInfoObject.type == "locker_product" && self.getProductEditInfoObject.locker_product_info.product_id != this.selectedProduct.id) {
      await this.exitFromEditMode()
    }
  }

  public setSliderIndex(slide_no = 0) {
    if(this.$refs && this.$refs.slider)
      (this.$refs as Record<any,any>).slider.goToIndex(slide_no);
  }

  public async loadMoreProduct(slide_index: number) {
    let self = this;
    // let main_products_info = await self.$store.getters.getMainProductsInfo;
    let next_page_no = self.$store.getters.getProductsNextPageNo;
    if(next_page_no) {
      let url = `/list/products?customized=${this.$store.getters.getCustomized}&personalized=${this.$store.getters.getPersonalized}&page=${next_page_no}`;
      if(self.getProductEditInfoObject.editing && ["locker_product", 'share_product'].includes(self.getProductEditInfoObject.type)) {
        url += `&active_product_id=${self.getProductEditInfoObject.locker_product_info.product_id}&offset=${self.$store.getters.getProducts.length}&active_product_type=locker_product`
      }
      // if(main_products_info.active_product_id) {
      //   url += `&active_product_id=${main_products_info.active_product_id}`
      // }
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

  public listenSliderEvent() {
    let self = this;
    this.$root.$on('sliderEvent', (product_index: number) => { // here you need to use the arrow function
      self.goToActiveProductSlide(product_index);
    })
  }

  public goToActiveProductSlide(product_index: number) {
    let last_active_product_data = this.$store.getters.getLastActiveProductData;
    let product_no = product_index + 1
    let product_slide_no = 0;
    if(product_no > 1) {
      product_slide_no = product_index / this.number_of_slides;
      if(!Number.isInteger(product_slide_no)) {
        product_slide_no = Math.floor(product_slide_no);
      }
      else{
        if(product_slide_no !== 0){
          product_slide_no = product_slide_no - 1;
        }
      }
    }
    this.setSliderIndex(product_slide_no)
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
