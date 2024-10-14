<template>
<!--  <div class="grid grid-mobile-4 gap-2 pick-item mt-3">-->
  <div class="d-flex gap-1 pick-item mt-1 hide-scroll overflow-auto" :class="{'mt-3': !mobileScreen}">
    <HorizontalScroll v-if="showItems && !animPlayed" />
   <template v-for="(product, index) in products">
     <div :key="index" class="select_product" :class="{'selected_item': selectedItemIndex == index}" :ref="`selected-product-${product.id}`">
       <div :ref="`mobile-product-${index}`" :data-product-index="index">
         <div v-if="product.show_product_in_list" ref="products" v-on:click="productDesigns(index)" :key="product.product_id">
           <template v-for="design in product.productstyles[0].productdesigns.filter(product_design => product_design.is_default)">
             <div class="image-holder" :key="'front'+design.id">
               <Scene canvas-width="150" canvas-height="150" :measurement-ratio="product.measurement_ratio"
                      :front="{
                      textureUrl: storageUrl+design.front_design.file_thumbnail_url, file_extension:design.front_design.file_extension,
                      safe_zone_url: design.frontsafezone_design? storageUrl+design.frontsafezone_design.file_url : '',
                      boundary_url: design.frontboundary_design? storageUrl+design.frontboundary_design.file_url : '',
                      models: product.productstyles[0].front_models
                   }"
                      :svg_parts="design.svg_parts"
                      :logos="product.productstyles[0].logo" :logosSettings="product.logos_setting" :logoAllowed="Boolean(product.is_logo_allowed)"
                      :logosLimit="product.allowed_logos_count" :productNamesSetting="product.productnames" :productColors="product.colors"
                      :colorGrouping="JSON.parse(design.front_design.color_group)" :productType="product.product_type" :product_id="product.id"
                      :product_index="index" :products_fonts="products_fonts" :design_id="design.id"
                      :visual_addons="product.productstyles[0].customized_addons"
               />
             </div>
           </template>
           <h3 class="text-center product_name" :title="product.display_name">{{ product.display_name }}</h3>
         </div>
       </div>
     </div>
   </template>
  </div>
</template>

<script lang="ts">

import Scene from '@/components/Scene.vue'
import HorizontalScroll from '@/components/mobile/animations/HorizontalScroll.vue';
import {Component, Mixins, Prop, Vue, Watch} from 'vue-property-decorator'
import {changeSelectedProduct} from "@/mixins/LockerProduct";

@Component<ItemsGrid>({
  components: {
    HorizontalScroll,
    Scene
  },
  mounted() {
    this.animPlayed = localStorage.getItem(Vue.prototype.$animPlayed_localstorage_key)
    this.products_intersection_observe = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const product_index = entry.target.getAttribute('data-product-index');
        this.$store.commit("UPDATE_PRODUCT", {
          product_index: product_index,
          product_data: { show_product_in_list: entry.isIntersecting ? 1 : 0 }
        });
      });
    })
    this.observeProducts()
  },

})

export default class ItemsGrid extends Mixins(changeSelectedProduct) {
  @Prop({ required: true }) readonly products_fonts!: Record<any, any>
  @Prop({ required: false }) readonly showItems!: boolean
  public storageUrl = process.env.VUE_APP_STORAGE_URL
  public renderComponent = true
  public animPlayed = false
  get selectedItemIndex() {
    return this.$store.getters.getSelectedIndex;
  }
  public products_intersection_observe: IntersectionObserver;

  @Watch('products')
  productsChanged(newVal: Record<any, any>[], oldVal: Record<any, any>[]) {
    const new_products_length = newVal.length
    const old_products_length = oldVal.length
    //remove non-existing refs related to products
    if(new_products_length < old_products_length) {
      for(let i = new_products_length; i<=old_products_length; i++) {
        delete this.$refs[`mobile-product-${i}`]
      }
    }
    /*
    * Timeout is added because the observerProducts method accesses $refs, and inside the watcher,
    * there's a possibility that the ref is not yet created in the template.
    * */
    setTimeout(() => {
      this.observeProducts()
      const selected_product_ref = this.$refs[`selected-product-${this.selectedProduct.id}`]
      //scroll to selected product
      if(selected_product_ref) {
        selected_product_ref[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500)
  }

  public observeProducts() {
   // let intersection_observer = (this as Record<any, any>).$getIntersectionObserverFor('products')
    let intersection_observer: IntersectionObserver = this.products_intersection_observe
    this.products.forEach((product, product_index) => {
      //@ts-ignore
      this.$refs[`mobile-product-${product_index}`].forEach((product_container) => {
        intersection_observer.observe(product_container)
      })
    })
  }

}

</script>

<style lang="scss" scoped>
.pick-item{
  position: relative;

  &>div{
    width: 86px;
    flex-shrink: 0;
  }
  .image-holder{
    position: relative;

    &:after{
      content: "";
      display: block;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 100;
      background: rgba(0,0,0,0);
    }
  }
}
.select_product{
  .product_name{
    overflow: hidden;
    width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.7rem;
    margin-top: 5px;
  }
  &.selected_item{
    background: rgba(24, 144, 118, 0.1);
  }
}
</style>
