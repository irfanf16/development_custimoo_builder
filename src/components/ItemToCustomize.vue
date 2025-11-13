<template>
  <div class="item-to-customize text-left">
    <!--  For mobile start  -->
    <div class="px-3 py-1" style="border-bottom: 1px solid #eee" v-if="mobileScreen" >
      <h2 class="fw-bold p-lg-0 mb-lg-4 fz-18 bg-transparent d-flex align-items-center justify-content-between" @click="toggleItems">
        <span style="font-size: 16px">Select Item to Customize</span>
        <span v-if="mobileScreen" class="mt-1 toggleArrow" :class="showItems ? 'opened' : ''"><BIconChevronDown /></span>
      </h2>

      <div class="select-items" :class="{'opened': showItems, 'isMobile':mobileScreen}">
        <div class="d-flex align-items-center" v-if="getProductEditInfoObject.editing==false || (getProductEditInfoObject.editing===true && getProductEditInfoObject.locker_product_info !== null) ">
          <div class="fade-right w-100 py-2" >
            <div class="overflow-auto d-flex align-items-center theme-scroll-h pb-2 pointer gap-2 brandsList ">
              <div  v-for="(category, categoryIndex) in categories" :key="`category_${categoryIndex}`" style="white-space: nowrap"
                    :style="{color: (selectedCategory.index == categoryIndex) ? '#000 !important': '#999 !important'}"
                    :class="{ 'pr-3': categoryIndex + 1 == categories.length, 'activeBrand': (selectedCategory.index == categoryIndex) }"
                    role="button" @click="handleCategoryUpdate(categoryIndex)">
                  <img :src="`${storage_url}${category.image_url}`"  height="30">
                </div>
            </div>
          </div>
        </div>

        <template v-if="hide_filter_if_only_one_exists">
          <div class="collection-btn mt-1 px-1 d-flex align-items-center checkbox_buttons gap-2">
            <template v-if="CustomizedCount > 0">
              <button type="button" :class="$store.getters.getCustomized ? 'btn btn-secondary active' : 'btn btn-secondary'"
                      @click="changeProductType('customized')">
                <span v-if="$store.getters.getCustomized"><b-icon icon="check-circle-fill"></b-icon></span>
                Customized
              </button>
            </template>
            <template v-if="PersonalizedCount > 0">
              <button type="button" :class="$store.getters.getPersonalized ? 'btn btn-secondary active' : 'btn btn-secondary'"
                      @click="changeProductType('personalized')">
                <span v-if="$store.getters.getPersonalized"><b-icon icon="check-circle-fill"></b-icon></span>
                Stock
              </button>
            </template>
            <template v-if="PrivateProductCount > 0">
              <button v-if="isCustomerAuthenticated && PrivateProductCount" type="button" :class="$store.getters.getPrivateProduct ? 'btn btn-secondary active' : 'btn btn-secondary'"
                      @click="changeProductType('private_product')">
                <span v-if="$store.getters.getPrivateProduct"><b-icon icon="check-circle-fill"></b-icon></span>
                Private
              </button>
            </template>
          </div>
        </template>
        <ItemsGrid :showItems="showItems" :products_fonts="products_fonts" />
      </div>
    </div>
    <!--  For mobile start  -->

    <template v-else>
      <div class="collection-btn mb-2 mt-3 d-flex gap-1">
        <template v-if="getProductEditInfoObject.editing && ['cart_product', 'order_product'].includes(getProductEditInfoObject.type)">
          <div class="px-1 d-flex align-items-center checkbox_buttons gap-2">
            <button style="white-space: nowrap" type="button" class="btn btn-secondary active">
              <span><b-icon icon="check-circle-fill"></b-icon></span>
              {{ $store.getters.getPrivateProduct ? "Private" : ( $store.getters.getCustomized? "Customized":"Stock") }}
            </button>
          </div>
        </template>
       <template v-else>
          <template v-if="hide_filter_if_only_one_exists">
            <div class="px-1 d-flex align-items-center checkbox_buttons gap-2"  >
              <template v-if="CustomizedCount > 0">
                <button style="white-space: nowrap" type="button" :class="$store.getters.getCustomized ? 'btn btn-secondary active' : 'btn btn-secondary'"
                        @click="changeProductType('customized')">
                  <span v-if="$store.getters.getCustomized"><b-icon icon="check-circle-fill"></b-icon></span>
                  Customized
                </button>
              </template>
              <template v-if="PersonalizedCount > 0">
                <button style="white-space: nowrap" type="button" :class="$store.getters.getPersonalized ? 'btn btn-secondary active' : 'btn btn-secondary'"
                        @click="changeProductType('personalized')">
                  <span v-if="$store.getters.getPersonalized"><b-icon icon="check-circle-fill"></b-icon></span>
                  Stock
                </button>
              </template>

              <button v-if="isCustomerAuthenticated && PrivateProductCount > 0" style="white-space: nowrap" type="button" :class="$store.getters.getPrivateProduct ? 'btn btn-secondary active' : 'btn btn-secondary'"
                      @click="changeProductType('private_product')">
                <span v-if="$store.getters.getPrivateProduct"><b-icon icon="check-circle-fill"></b-icon></span>
                Private
              </button>
            </div>
          </template>

         <div style="max-width: 230px; flex-shrink: 1; padding-left: 4px">
           <b-input-group>
             <template #append>
               <b-input-group-text style="height: 33px; cursor: pointer" @click="searchProducts(true)"><strong class="text-secondary">X</strong></b-input-group-text>
             </template>
             <b-form-input type="text" style="height: 33px;" placeholder="Search" @keyup="searchProducts(false)" v-model="search" />
           </b-input-group>
         </div>
       </template>
      </div>
      <span class="hover_tooltip" ref="hoover_tooltip"></span>
      <div class="d-flex align-items-center" v-if="getProductEditInfoObject.editing==false || (getProductEditInfoObject.editing===true && getProductEditInfoObject.locker_product_info !== null) ">
        <div class="w-100 py-2 overflow-auto d-flex align-items-center theme-scroll-h pb-2 pointer gap-2 brandsList" >
          <template v-for="(category, categoryIndex) in categories">
            <div @mouseenter="showTooltip" @mouseleave="hideTooltip" :data-title="category.category_name" :key="`category_${categoryIndex}`" style="white-space: nowrap"
                  :style="{color: (selectedCategory.index == categoryIndex) ? '#000 !important': '#999 !important'}"
                  :class="{ 'pr-3': categoryIndex + 1 == categories.length, 'activeBrand': (selectedCategory.index == categoryIndex) }"
                  role="button" @click="handleCategoryUpdate(categoryIndex)">
                <img :src="`${storage_url}${category.image_url}`"  height="30">
              </div>
          </template>
          <!-- <div class="fadedoverlay"></div> -->
        </div>
      </div>
      <template v-if="categories[selectedCategory.index] && categories[selectedCategory.index].subcategories && categories[selectedCategory.index].subcategories.length">
        <div class="d-flex align-items-center">
          <div class="w-100 py-2 overflow-auto d-flex align-items-center theme-scroll-h pb-2 pointer gap-2 brandsList">
              <template v-for="(subCategory, subCategoryIndex) in categories[selectedCategory.index].subcategories">
                <div @mouseenter="showTooltip" @mouseleave="hideTooltip" :data-title="subCategory.category_name" :key="`subCategory_${subCategoryIndex}`" style="white-space: nowrap"
                     :style="{color: (selectedSubCategory.index == subCategoryIndex) ? '#000 !important': '#999 !important'}"
                     :class="{ 'pr-3': subCategoryIndex + 1 == categories[selectedCategory.index].subcategories.length, 'activeBrand': (selectedSubCategory.index == subCategoryIndex) }"
                     role="button" @click="handleSubCategoryUpdate(subCategoryIndex)">
                  <img :src="`${storage_url}${subCategory.image_url}`"  height="30">
                </div>
              </template>
          </div>
        </div>
      </template>

      <SelectItemCarousel v-if="startLoadProducts" ref="itemsCarousel" :products_fonts="products_fonts" />
    </template>

    <h2 v-if="mobileScreen" class="fw-bold px-3 py-1 p-lg-0 mt-lg-5 mb-2 fz-18 available-design-heading d-flex align-items-center justify-content-between" @click="toggleDesigns">
      <span style="font-size: 16px">Designs</span>
      <span class="mt-1 toggleArrow" :class="[showDesigns ? 'opened' : '']"><BIconChevronDown /></span>
    </h2>
    <h2 v-else class="fw-bold p-3 p-lg-0 mt-lg-5 mb-2 fz-18 available-design-heading d-flex align-items-center justify-content-between">
     <span style="font-size: 16px">Designs</span>
      <button v-if="!allow_shuffle_colors && JSON.stringify(this.logoColorsInfo.colors) != JSON.stringify(this.logoColorsInfo.extracted_colors)"
              @click="useShuffledColors()" class="btn btn-secondary btn-sm">
        Use shuffled colors
      </button>
     <template v-if="isCustomerAuthenticated">
       <b-button v-if="getProductSelectionDesignInfo && !isEcommerceCompany()" class="btn btn-secondary btn-sm" @click="customizeProduct">
         Custom design
       </b-button>
       <b-button v-if="getProductSelectionDesignInfo.selected_designs.length > 0" @click="$emit('show-product-design-bulk-save-modal')" class="btn btn-secondary btn-sm">
         Save Designs
       </b-button>
     </template>
    </h2>
    <div class="select-designs" :class="{'opened': showDesigns, 'uploaderOpened': uploaderOpened}">
      <DesignAvailable v-if="startLoadDesigns" :key="this.selectedProduct.productstyles[styleIndex]? this.selectedProduct.productstyles[styleIndex].id : ''" :products_fonts="products_fonts" />
    </div>
  </div>
</template>

<script lang="ts">
import ItemsGrid from "@/components/ItemsGrid.vue";
import Search from '@/components/Search.vue';
import {
  handleResponseException,
  isEcommercePlatform,
  navigateToCustomProduct,
  resetLastActiveProductData
} from '@/helpers/Helpers';
import { ProductsQueryParamsMixin, exitEditMode, handleMainProducts } from "@/mixins/LockerProduct";
import { dragscroll } from 'vue-dragscroll';
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator';
import DesignAvailable from '../components/DesignAvailable.vue';
import SelectItemCarousel from '../components/SelectItemCarousel.vue';


import AddLockerRoomModal from "@/components/AddLockerRoomModal.vue";
import { LogoUploaderColors } from "@/mixins/LogoUploaderColors";
import { FetchCategories } from '@/mixins/SelectedProductMixin';

@Component<ItemToCustomize>({
  components: {
    AddLockerRoomModal,
    ItemsGrid,
    Search,
    SelectItemCarousel,
    DesignAvailable
  },
  directives: {
    dragscroll
  },
  mounted() {
    let self: Record<any, any> = this;
    if(this.mobileScreen){
      this.$emit('switchTabs')
    }

    this.$on('update:search', (search_val: string) => {
      self.search = search_val ? search_val : ''
    })

    let ecommerce_update_id = this.$route.query.update_item;
    if(!ecommerce_update_id && this.categories.length) {
      // this.$store.commit('SET_SELECTED_CATEGORIES', this.categories[0].id) // as this is on mounted so don't need to send get product call again
    }
    this.search = this.search_products;
  }
})


export default class ItemToCustomize extends Mixins(ProductsQueryParamsMixin, exitEditMode, FetchCategories, handleMainProducts, LogoUploaderColors) {
  @Prop({required: true}) uploaderOpened!: any;
  @Prop({ required: true }) readonly products_fonts!: Record<any, any>
  @Prop({default: ''}) search_products!: any;

  public storage_url = process.env.VUE_APP_STORAGE_URL
  private showItems = true;
  private showDesigns = true;
  public personalized = this.$store.getters.getPersonalized
  public customized = this.$store.getters.getCustomized
  public search = '';
  public showLoader = false;
  public timeout:any = 0;

  private toggleItems () {
    this.showItems = !this.showItems
    if(this.showItems){
      this.$emit('hideAll')
    }else{
      this.$emit('switchTabs')
    }
  }

  @Watch('search')
  searchChanged() {
    this.$emit('update:search_products', this.search)
  }

  public setSliderIndex() {
    (this.$refs['itemsCarousel'] as Record<any,any>).setSliderIndex()
  }

  private toggleDesigns () {
    this.showDesigns = !this.showDesigns
  }

  /* getters/computed props starts */

  get hide_filter_if_only_one_exists():boolean {
    return !((this.CustomizedCount === 0 && this.PersonalizedCount === 0) || (this.PersonalizedCount === 0 && this.PrivateProductCount === 0) || (this.CustomizedCount === 0 && this.PrivateProductCount === 0))
  }

  get getPersonalized(): boolean {
    return this.$store.getters.getPersonalized
  }

  get getPrivateProduct(): boolean {
    return this.$store.getters.getPrivateProduct
  }

  get getCustomized(): boolean {
    return this.$store.getters.getCustomized
  }

  get CustomizedCount():number{
    return this.$store.getters.getCustomizedCount
  }
  get PersonalizedCount():number{
    return this.$store.getters.getPersonalizedCount
  }
  get PrivateProductCount():number{
    return this.$store.getters.getPrivateProductCount
  }

  get getProductEditInfoObject() {
    return this.$store.getters.getProductEditInfoObject;
  }

  get getLastActiveProductData() {
    return this.$store.getters.getLastActiveProductData;
  }
  get getSelectedCategory(){
    return this.$store.getters.getSelectedCategory;
  }

  get getSelectedSubCategory() {
    return this.$store.getters.getSelectedSubCategory;
  }

  get selectedSubCategory() {
    return { index: this.getSelectedSubCategory.sub_category_index, id: this.getSelectedSubCategory.sub_category_id }
  }

  get selectedCategory() {
    return { index: this.getSelectedCategory.category_index, id: this.getSelectedCategory.category_id }
  }

  get categories(): Record<any, any>[] {
    return this.$store.getters.getCategories
  }

  get startLoadDesigns(): boolean {
    return this.$store.getters.getStartLoadDesigns
  }

  get startLoadProducts(): boolean {
    return this.$store.getters.getStartLoadProducts
  }

  get getProductSelectionDesignInfo(): Array<any> {
    return this.$store.getters.getProductSelectionDesignInfo
  }

  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }

  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  get styleIndex():number{
    return  this.$store.getters.getCurrentStyleIndex
  }

  get logoColorsInfo() {
    return this.$store.getters.getLogoColorsInfo();
  }

  /* getters/computed props ends */

  /* methods props starts */

  public isEcommerceCompany(): boolean {
    return isEcommercePlatform()
  }

  private showTooltip($event: MouseEvent, leftOffset = 0, topOffset = 0) {
    const tooltip = this.$el.querySelector(".hover_tooltip") as HTMLElement;
    if (!tooltip) return;

    const tooltipText = ($event.target as HTMLElement).getAttribute("data-title");
    if (!tooltipText) return;

    tooltip.innerHTML = tooltipText;
    tooltip.style.opacity = "1";
    tooltip.style.zIndex = "100";
    tooltip.style.position = "fixed"; // important for viewport positioning

    // Small base offsets
    const padding = 10;
    const mouseX = $event.clientX;
    const mouseY = $event.clientY;

    // Temporarily show to measure size
    tooltip.style.left = "0px";
    tooltip.style.top = "0px";
    const rect = tooltip.getBoundingClientRect();

    // Calculate preferred position (right & below cursor)
    let left = mouseX + padding + leftOffset;
    let top = mouseY + padding + topOffset;

    // --- Boundary checks ---
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // If tooltip would go beyond right edge, show on the left instead
    if (left + rect.width > viewportWidth) {
      left = mouseX - rect.width - padding;
    }

    // If tooltip would go beyond bottom edge, move it up
    if (top + rect.height > viewportHeight) {
      top = mouseY - rect.height - padding;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }


  private hideTooltip() {
    let element = this.$el.querySelector(".hover_tooltip") as Record<any, any>
    element.style.opacity = '0'
    element.style.left = '0'
    element.style.top = '0'
    element.style.zIndex = '-10'
  }

  public async searchProducts(isClear:boolean) {
    const confirmed_value = await this.editModeConfirmation();
    const edit_info_obj = this.$store.getters.getProductEditInfoObject;
    if(edit_info_obj.type == "reorder_product" && confirmed_value) {
      this.search = "";
      return false;
    }
    if(isClear) {
      this.search = "";
      this.$emit('update:search_products', this.search)
    }

    if(this.timeout) {
      clearTimeout(this.timeout)
    }
    this.timeout = setTimeout(async () => {
      const confirmed_value = await this.editModeConfirmation();
      const edit_info_obj = this.$store.getters.getProductEditInfoObject;

      if (edit_info_obj.type === "reorder_product" && confirmed_value) {
        return false;
      }

      if(this.logoColorsInfo.using_logo_colors) {
        this.useLogoColors(false)
      }
      this.showLoader = true;
      let product_filter = 'customized=true';
      if(this.search_products) {
        product_filter = `title=${this.search_products}`;
      }
      const categories_promise =  this.fetchCategories(product_filter);

      categories_promise.then(async (cat_response: Record<any, any>) => {
        if(cat_response.no_search_product_found) {
          this.showError('No product found against your search')
        }
        else {
          let query_params: string[] = [];
          query_params.push(
            `customized=${this.$store.getters.getCustomized}`,
            `personalized=${this.$store.getters.getPersonalized}`,
            `private=${this.$store.getters.getPrivateProduct}`
          )
          if(this.getSelectedCategory && this.getSelectedCategory.category_id){
            query_params.push(`category_id=${this.getSelectedCategory.category_id}`)
          }
          if (this.getSelectedSubCategory && this.getSelectedSubCategory.sub_category_id) {
            query_params.push(`sub_category_id=${this.getSelectedSubCategory.sub_category_id}`);
          }
          if(product_filter){
            query_params.push(product_filter)
          }
          await this.retrieveProductsNew(query_params)
        }
      });
    }, 700);
  }

  public async customizeProduct() {
    await navigateToCustomProduct().catch(errorResponse => {
      handleResponseException(errorResponse)
    });
  }

  public useShuffledColors() {
    this.useLogoColors(true)
  }

  public async changeProductType(prd_type: string) {
    let isCustomized = this.$store.getters.getCustomized;
    let isPersonalized = this.$store.getters.getPersonalized;
    let isPrivate = this.$store.getters.getPrivateProduct;

    if (prd_type === "customized" && isCustomized) {
      return; // No further processing needed if customized is already true
    }

    if (prd_type === "personalized" && isPersonalized) {
      return; // No further processing needed if personalized is already true
    }

    if (prd_type === "private_product" && isPrivate) {
      return; // No further processing needed if private_product is already true
    }

    const confirmed_value = await this.editModeConfirmation();
    const edit_info_obj = this.$store.getters.getProductEditInfoObject;

    if (edit_info_obj.type === "reorder_product" && confirmed_value) {
      return false;
    }
    if(this.logoColorsInfo.using_logo_colors) {
      this.useLogoColors(false)
    }

    const categories_promise = this.fetchCategories(prd_type);
    categories_promise.then(async (cat_response: Record<any, any>) => {
      console.log(cat_response)
      const query_params = [
        `category_id=${cat_response.product_category_id}`,
        `customized=${cat_response.customized}`,
        `personalized=${cat_response.personalized}`,
        `private=${cat_response.private_product}`,
      ];
      if(cat_response.product_sub_category_id){
        query_params.push(`sub_category_id=${cat_response.product_sub_category_id}`);
      }
      await this.retrieveProductsNew(query_params);
    });
  }

  public async handleCategoryUpdate(category_index:number) {
    if(this.getSelectedCategory.category_id != this.categories[category_index].id) {
      const confirmed_value = await this.editModeConfirmation();
      const edit_info_obj = this.$store.getters.getProductEditInfoObject;
      if (edit_info_obj.type == "reorder_product" && confirmed_value) {
        return false;
      }
      if(this.logoColorsInfo.using_logo_colors) {
        this.useLogoColors(false)
      }
      let selected_category = this.categories[category_index]
      // await resetLastActiveProductData()
      this.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", { category_index: category_index, category_id: selected_category.id })
      this.$store.commit('SET_SELECTED_CATEGORY', {category_id: selected_category.id, category_index: category_index})
      let query_params: string[] = [
        `customized=${this.getCustomized}`, `personalized=${this.getPersonalized}`
      ];
      if (selected_category && selected_category.id) {
        query_params.push(`category_id=${selected_category.id}`);
        if (selected_category.subcategories.length) {
          const [subcategory] = selected_category.subcategories;
          if(subcategory){
            this.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", { sub_category_index: 0, sub_category_id: subcategory.id })
            this.$store.commit('SET_SELECTED_SUB_CATEGORY', {sub_category_id: subcategory.id, sub_category_index: 0})
            query_params.push(`sub_category_id=${subcategory.id}`);
          }

        }
      }
      if (this.search_products) {
        query_params.push(`title=${this.search_products}`);
      }
      await this.retrieveProductsNew(query_params)
    }
  }

  public async handleSubCategoryUpdate(subcategory_index) {
    if(this.getSelectedSubCategory.sub_category_id != this.categories[this.getSelectedCategory.category_index].subcategories[subcategory_index].id) {
      const confirmed_value = await this.editModeConfirmation();
      const edit_info_obj = this.$store.getters.getProductEditInfoObject;
      if (edit_info_obj.type == "reorder_product" && confirmed_value) {
        return false;
      }
      if(this.logoColorsInfo.using_logo_colors) {
        this.useLogoColors(false)
      }
      let selected_category = this.categories[this.getSelectedCategory.category_index];
      let selected_sub_category = selected_category.subcategories[subcategory_index];
      // await resetLastActiveProductData()
      this.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", { sub_category_index: subcategory_index, sub_category_id: selected_sub_category.id })
      this.$store.commit('SET_SELECTED_SUB_CATEGORY', {sub_category_id: selected_sub_category.id, sub_category_index: subcategory_index})
      let query_params: string[] = [
        `customized=${this.getCustomized}`, `personalized=${this.getPersonalized}`
      ];
      if (selected_category && selected_category.id) {
          query_params.push(`category_id=${selected_category.id}`);
          if (selected_category.subcategories.length) {
            query_params.push(`sub_category_id=${selected_sub_category.id}`);
          }
      }
      if (this.search_products) {
        query_params.push(`title=${this.search_products}`);
      }
      await this.retrieveProductsNew(query_params)
    }
  }

  public toggleDesignSelection() {
    this.$store.commit("UPDATE_product_designs_selection_info", { toggle_selection_mode: true })
  }
  /* methods props ends */

}
</script>

<style scoped lang="scss">
  .select-items{
    overflow: hidden;
    transition: all 0.2s ease;
    overflow-y: auto;

    &.isMobile{
      max-height: 0;
    }

    &.opened{
      max-height: 500px;
    }
  }

  .select-designs{
    overflow: hidden;
    max-height: 0;
    transition: all 0.2s ease;
    overflow-y: auto;

    &.opened{
      max-height: calc(100vh - 285px);

      &.uploaderOpened{
        max-height: calc(100vh - 455px);

        &>.available-designs-section{
          padding-bottom: 0;
        }
      }
    }
  }

  .toggleArrow{
    transition: 0.2s all ease;

    &.opened{
      transform: rotate(-180deg);
    }
  }

  .item-to-customize{
    margin: 0 -15px;
    border-top: 1px solid #EDF2F6;
    @media only screen and (min-width: 992px){
      margin: 0;
      border-top: none;
    }
    h2{
      background: #ffffff;
      @media only screen and (min-width: 992px){
        background: none;
      }
    }
    .available-design-heading{background: none;}
  }
  .customization-nav-area{
    background: #fff;
    @media only screen and (min-width: 992px){
      background: none;
    }
  }

  .collection-btn{
    @media (max-width: 1680px) {
      //flex-direction: column;
      flex-wrap: wrap;
    }
  }

  .brandsList{
    img {
      filter: grayscale(100%);
      opacity: 0.8;
      transform: scale(0.85);
      transition: 0.2s all ease-in-out;
    }

    &>div:not(:last-of-type){
      position: relative;
      padding-bottom: 5px;
      &:after{
        transition: 0.2s all ease-in-out;
        content: "";
        display: block;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        width: 0;
        height: 2px;
        margin: 0 auto;
        background: #2c3e50;
      }
    }

    .activeBrand{
      border-bottom: 2px solid #219F84;
      &:after{
        content: "";
        display: block;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 2px;
        background: #2c3e50;
        margin: 0 auto;
      }

      img{
        opacity: 1;
        filter: none;
        transform: scale(1);
      }
    }
  }
</style>
