<template>
  <div class="item-to-customize text-left">
    <div class="px-3 py-1" style="border-bottom: 1px solid #eee" v-if="mobileScreen" >
      <h2 class="fw-bold p-lg-0 mb-lg-4 fz-18 bg-transparent d-flex align-items-center justify-content-between" @click="toggleItems">
        <span style="font-size: 16px">Select Item to Customize</span>
        <span v-if="mobileScreen" class="mt-1 toggleArrow" :class="showItems ? 'opened' : ''"><BIconChevronDown /></span>
      </h2>

      <div class="select-items" :class="[showItems ? 'opened' : '']">
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

<!--        <div class="collection-btn mt-1 px-1 d-flex align-items-center checkbox_buttons gap-2" v-if="StockCount > 0">-->
        <div class="collection-btn mt-1 px-1 d-flex align-items-center checkbox_buttons gap-2" v-if="StockCount > 0">
<!--          <b-form-checkbox :checked="customized" @change="changeProductType('customized')"  class="mr-3" name="check-button" button key="Customized"><span class="checked"><b-icon icon="check-circle-fill"></b-icon></span> Customized</b-form-checkbox>-->
<!--          <b-form-checkbox :checked="personalized" @change="changeProductType('personalized')" name="check-button" button key="Personalized"><span class="checked"><b-icon icon="check-circle-fill"></b-icon></span> Stock</b-form-checkbox>-->
          <button type="button" :class="$store.getters.getCustomized ? 'btn btn-secondary active' : 'btn btn-secondary'"
                  @click="changeProductType(!$store.getters.getCustomized, 'customized')">
            <span v-if="$store.getters.getCustomized"><b-icon icon="check-circle-fill"></b-icon></span>
            Customized
          </button>

          <button type="button" :class="$store.getters.getPersonalized ? 'btn btn-secondary active' : 'btn btn-secondary'"
                  @click="changeProductType(!$store.getters.getPersonalized, 'personalized')">
            <span v-if="$store.getters.getPersonalized"><b-icon icon="check-circle-fill"></b-icon></span>
            Stock
          </button>
        </div>
        <ItemsGrid :showItems="showItems" :products_fonts="products_fonts" />
      </div>
    </div>

    <template v-else>
      <div class="collection-btn mb-2 mt-3 d-flex gap-1">
        <template v-if="getProductEditInfoObject.editing && ['cart_product', 'order_product'].includes(getProductEditInfoObject.type)">
          <div class="px-1 d-flex align-items-center checkbox_buttons gap-2">
            <button style="white-space: nowrap" type="button" class="btn btn-secondary active">
              <span><b-icon icon="check-circle-fill"></b-icon></span>
              {{ $store.getters.getCustomized ? "Customized" : "Stock" }}
            </button>
          </div>
        </template>
       <template v-else>
         <div class="px-1 d-flex align-items-center checkbox_buttons gap-2" v-if="StockCount > 0" >
           <button style="white-space: nowrap" type="button" :class="$store.getters.getCustomized ? 'btn btn-secondary active' : 'btn btn-secondary'"
                   @click="changeProductType(!$store.getters.getCustomized, 'customized')">
             <span v-if="$store.getters.getCustomized"><b-icon icon="check-circle-fill"></b-icon></span>
             Customized
           </button>

           <button style="white-space: nowrap" type="button" :class="$store.getters.getPersonalized ? 'btn btn-secondary active' : 'btn btn-secondary'"
                   @click="changeProductType(!$store.getters.getPersonalized, 'personalized')">
             <span v-if="$store.getters.getPersonalized"><b-icon icon="check-circle-fill"></b-icon></span>
             Stock
           </button>
         </div>

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

      <SelectItemCarousel ref="itemsCarousel" :products_fonts="products_fonts" />

    </template>

    <h2 v-if="mobileScreen" class="fw-bold px-3 py-1 p-lg-0 mt-lg-5 mb-2 fz-18 available-design-heading d-flex align-items-center justify-content-between" @click="toggleDesigns">
      <span style="font-size: 16px">Designs Available</span>
      <span class="mt-1 toggleArrow" :class="[showDesigns ? 'opened' : '']"><BIconChevronDown /></span>
    </h2>
    <h2 v-else class="fw-bold p-3 p-lg-0 mt-lg-5 mb-2 fz-18 available-design-heading d-flex align-items-center justify-content-between">
      <span style="font-size: 16px">Designs Available</span>
    </h2>
    <div class="select-designs" :class="{'opened': showDesigns, 'uploaderOpened': uploaderOpened}">
      <DesignAvailable :key="this.selectedProduct.productstyles[styleIndex].id" :products_fonts="products_fonts" />
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop, Vue, Watch} from 'vue-property-decorator'
  import Search from '@/components/Search.vue'
  import SelectItemCarousel from '../components/SelectItemCarousel.vue'
  import DesignAvailable from '../components/DesignAvailable.vue'
  import ItemsGrid from "@/components/ItemsGrid.vue";
  import { dragscroll } from 'vue-dragscroll'
  import _ from 'lodash'
  import {http} from "@/httpCommon";
  import {ProductsQueryParamsMixin, exitEditMode, resetLastActiveProductData} from "@/mixins/LockerProduct";

@Component<ItemToCustomize>({
  components: {
    ItemsGrid,
    Search,
    // ItemsCarousel,
    SelectItemCarousel,
    DesignAvailable
  },
  directives: {
    dragscroll
  },
  mounted() {
    if(this.mobileScreen){
      this.$emit('switchTabs')
    }

    let ecommerce_update_id = this.$route.query.update_item;
    if(!ecommerce_update_id && this.categories.length) {
      // this.$store.commit('SET_SELECTED_CATEGORIES', this.categories[0].id) // as this is on mounted so don't need to send get product call again
    }
    this.search = this.search_products
  }
})


export default class ItemToCustomize extends Mixins(ProductsQueryParamsMixin, exitEditMode, resetLastActiveProductData) {
  // @Prop({required: true}) categories!: any;
  @Prop({required: true}) uploaderOpened!: any;
  @Prop({ required: true }) readonly products_fonts!: Record<any, any>
  @Prop({default: ''}) search_products!: any;

  public storage_url = process.env.VUE_APP_STORAGE_URL
  private showItems = false;
  private showDesigns = true;
  public mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  public personalized = this.$store.getters.getPersonalized
  public customized = this.$store.getters.getCustomized
  public search = '';
  public showLoader = false;
  public searchLoader = false;
  public timeout = 0;



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

  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }

  get styleIndex():number{
    return  this.$store.getters.getCurrentStyleIndex
  }

  public async searchProducts(isClear:boolean) {
    let self = this;
    if(isClear)
    {
      self.search = "";
      this.$emit('update:search_products', self.search)

    }
    await this.resetLastActiveProductData()
    await this.exitFromEditMode()
    if(this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(async () => {
      //search function
      await self.$store.dispatch('setSearchLoader', true)
      self.showLoader = true;
     // const itemCarousel = self.$refs['itemsCarousel'] as Record<any, any>
     //  await self.$store.dispatch("updateMainProductsInfo",  {has_more_products: false, next_page: null});
      // this.$emit('update:search_products', self.search_products)
      let query_params = [`title=${self.search_products}`]
      this.$emit('retrieveProducts', query_params)
     // itemCarousel.setSliderIndex();
    }, 700);
  }

  //  public doSearchDebounced = this.debounce(this.searchProducts,1000);

  public async changeProductType(new_val:boolean, prd_type:string) {
    let self:Record<string, any> = this;
    let customized = self.$store.getters.getCustomized
    let personalized = self.$store.getters.getPersonalized
    const itemCarousel = this.$refs['itemsCarousel'] as Record<any, any>
    let retrieve_products = false;
    if(new_val == false) {
      if(prd_type == "customized" && personalized) {
        retrieve_products = true;
      }
      if(prd_type == "personalized" && customized) {
        retrieve_products = true;
      }
    } else {
      if(prd_type == "customized" && !customized) {
        retrieve_products = true;
      }
      if(prd_type == "personalized" && !personalized) {
        retrieve_products = true;
      }
    }

    // self.$store.dispatch("updateMainProductsInfo",  {has_more_products: false, next_page: null, active_product_id: null});
    if(retrieve_products) {
      await self.resetLastActiveProductData()
      console.log("before new val", eval(prd_type))
      eval(`${prd_type}=${new_val}`)
      console.log("after new val", eval(prd_type))
      await this.$store.dispatch('setProductType', {prd_type: prd_type, value: new_val});
      //exit from edit mode
      await this.exitFromEditMode()

      //self.$store.dispatch("updateMainProductsInfo",  {has_more_products: false, next_page: null});
      //let query_params = await this.setQueryParams()
      this.$emit('retrieveProducts')
      itemCarousel.setSliderIndex();
    }
  }

  public async handleCategoryUpdate(category_index:number){
    let self: Record<any, any> = this;
    let selected_category = self.categories[category_index]
    if(this.getLastActiveProductData.category_id !== selected_category.id){
      await this.$store.commit('SET_SELECTED_CATEGORIES', selected_category.id)
      await this.resetLastActiveProductData()
      self.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", {category_index: category_index, category_id: selected_category.id});
      let query_params = [`category_id=${selected_category.id}`]
      this.$emit('retrieveProducts', query_params)
    }
  }

  /* getters/computed props starts */

  get getPersonalized(): boolean {
    return this.$store.getters.getPersonalized
  }

  get getCustomized(): boolean {
    return this.$store.getters.getCustomized
  }

  get StockCount():number{
    return this.$store.getters.getStockCount
  }

  get getProductEditInfoObject() {
    return this.$store.getters.getProductEditInfoObject;
  }

  get getLastActiveProductData() {
    return this.$store.getters.getLastActiveProductData;
  }

  get selectedCategory() {
    let self = this;
    let category_index = self.getLastActiveProductData.category_index
    let category_id = self.getLastActiveProductData.category_id
    return { index: category_index, id: category_id }
  }

  get categories(): Record<any, any>[] {
    return this.$store.getters.getCategories
  }

  /* getters/computed props ends */
}
</script>

<style scoped lang="scss">
  .select-items{
    overflow: hidden;
    max-height: 0;
    transition: all 0.2s ease;
    overflow-y: auto;

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

    &>div{
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
