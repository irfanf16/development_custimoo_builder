<template>
  <div class="position-relative">
    <div class="loader" v-if="showLoader"><img src="@assets/images/loading.gif" /></div>
    <slither-slider ref="slider" @changed="loadMoreProduct" v-if="products.length" :options="{numberOfSlides: number_of_slides, adaptiveHeight: false, loop: false, dots: false, gap: 10}" :class="{'one-product' : products.length === 1, 'two-product': products.length === 2, 'three-product': products.length === 3, 'four-product': products.length > 3}" class="select-item-slider p-3 p-lg-0">
      <template v-for="(product, index) in products">
        <a :title="product.display_name" ref="products" v-b-tooltip v-on:click="productDesigns(index)" :class="{'selected_item': selectedItemIndex == index}"
           :key="product.product_id" v-if="product.productstyles[0] && Object.prototype.hasOwnProperty.call(product.productstyles[0],'productdesigns')">
          <template v-for="design in product.productstyles[0].productdesigns.filter(product_design => product_design.is_default)">
            <div class="image-holder" :key="'front'+design.id">
              <Scene canvas-width="150" canvas-height="150" :measurement-ratio="product.measurement_ratio" :key="`scene${product.id}`"
                     :front="{
                        textureUrl: storageUrl+design.front_design.file_thumbnail_url, file_extension:design.front_design.file_extension,
                        safe_zone_url: design.frontsafezone_design? storageUrl+design.frontsafezone_design.file_url : '',
                        boundary_url: design.frontboundary_design? storageUrl+design.frontboundary_design.file_url : '',
                        models: product.productstyles[0].front_models
                      }"
                     :svg_parts="design.svg_parts"
                     :logos="product.productstyles[0].logo" :logosSettings="product.logos_setting" :logoAllowed="Boolean(product.is_logo_allowed)"
                     :logosLimit="product.allowed_logos_count" :productNamesSetting="product.productnames" :productColors="product.colors"
                     :colorGrouping="JSON.parse(design.front_design.color_group)" :productType="product.product_type" :product_id="product.id" :product_index="index"
                     :products_fonts="products_fonts" :design_id="design.id" :visual_addons="product.productstyles[0].customized_addons"
              />
            </div>
          </template>
          <h3 class="text-center">{{ product.display_name }}</h3>
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
import {handleMainProducts, exitEditMode, changeSelectedProduct} from "@/mixins/LockerProduct";
import {FetchCategories, HideUpdateLockerButton} from "@/mixins/SelectedProductMixin";

Vue.use(SlitherSlider)

@Component<SelectItemCarousel>({
  components: {
    Scene
  },
  created() {
   this.listenSliderEvent()
  }
})


export default class SelectItemCarousel extends Mixins(handleMainProducts, exitEditMode, HideUpdateLockerButton,exitEditMode, FetchCategories, changeSelectedProduct) {
  @Prop({ required: true }) readonly products_fonts!: Record<any, any>

  public storageUrl = process.env.VUE_APP_STORAGE_URL;
  public has_more_products = false;
  public number_of_slides = 4;
  get showLoader() {
    return this.$store.getters.getUpdatingLogo
  }
  get getProductEditInfoObject() {
    return this.$store.getters.getProductEditInfoObject;
  }

  get selectedProduct() {
    return this.$store.getters.getSelectedProduct;
  }
  get selectedItemIndex() {
    return this.$store.getters.getSelectedIndex;
  }

  private setRosterOpen(val: boolean) {
    this.$store.commit('SET_IS_ROSTER_OPEN', val)
  }
  public setSliderIndex(slide_no = 0) {
    if(this.$refs && this.$refs.slider)
      (this.$refs as Record<any,any>).slider.goToIndex(slide_no);
  }

  public async loadMoreProduct(slide_index: number) {
    let self = this;
    let next_page_no = self.$store.getters.getProductsNextPageNo;
    if(next_page_no) {
      const is_customized = this.$store.getters.getCustomized;
      const is_personalized = this.$store.getters.getPersonalized;
      const is_private = this.$store.getters.getPrivateProduct;
      const edit_info_object = this.getProductEditInfoObject;
      const selected_category = this.$store.getters.getSelectedCategory;
      let url = `/list/products?customized=${is_customized}&private=${is_private}&personalized=${is_personalized}&page=${next_page_no}`;
      if(edit_info_object.editing) {
        if(["locker_product", 'share_product'].includes(edit_info_object.type)) {
          url += `&active_product_id=${edit_info_object.locker_product_info.product_id}&offset=${this.$store.getters.getProducts.length}&active_product_type=locker_product`
        }
        if(edit_info_object.type == "reorder_product") {
          url += "&is_reorder=true&active_product_type=reorder_product&paginate=false&get_product_detail=false";
          url += `&active_product_id=${edit_info_object.reorder_product_info.active_product_id}&offset=${this.$store.getters.getProducts.length}`
          if(selected_category.category_id) {
            url += `&category_id=${selected_category.category_id}`
          }
        }
      }
      http.get(url).then(async (response: Record<any, any>) => {
        await self.handleMainProducts(response);
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
    font-size: 0.7rem;
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
