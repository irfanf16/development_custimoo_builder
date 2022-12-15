<template>
  <div class="item-to-customize text-left">
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
                      @click="changeProductType(!$store.getters.getCustomized, 'customized')">
                <span v-if="$store.getters.getCustomized"><b-icon icon="check-circle-fill"></b-icon></span>
                Customized
              </button>
            </template>
            <template v-if="PersonalizedCount > 0">
              <button type="button" :class="$store.getters.getPersonalized ? 'btn btn-secondary active' : 'btn btn-secondary'"
                      @click="changeProductType(!$store.getters.getPersonalized, 'personalized')">
                <span v-if="$store.getters.getPersonalized"><b-icon icon="check-circle-fill"></b-icon></span>
                Stock
              </button>
            </template>
            <template v-if="PrivateProductCount > 0">
              <button v-if="isCustomerAuthenticated && PrivateProductCount" type="button" :class="$store.getters.getPrivateProduct ? 'btn btn-secondary active' : 'btn btn-secondary'"
                      @click="changeProductType(!$store.getters.getPrivateProduct, 'private_product')">
                <span v-if="$store.getters.getPrivateProduct"><b-icon icon="check-circle-fill"></b-icon></span>
                Private
              </button>
            </template>
          </div>
        </template>
        <ItemsGrid :showItems="showItems" :products_fonts="products_fonts" />
      </div>
    </div>

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
                        @click="changeProductType(true, 'customized')">
                  <span v-if="$store.getters.getCustomized"><b-icon icon="check-circle-fill"></b-icon></span>
                  Customized
                </button>
              </template>
              <template v-if="PersonalizedCount > 0">
                <button style="white-space: nowrap" type="button" :class="$store.getters.getPersonalized ? 'btn btn-secondary active' : 'btn btn-secondary'"
                        @click="changeProductType(true, 'personalized')">
                  <span v-if="$store.getters.getPersonalized"><b-icon icon="check-circle-fill"></b-icon></span>
                  Stock
                </button>
              </template>

              <button v-if="isCustomerAuthenticated && PrivateProductCount > 0" style="white-space: nowrap" type="button" :class="$store.getters.getPrivateProduct ? 'btn btn-secondary active' : 'btn btn-secondary'"
                      @click="changeProductType(true, 'private_product')">
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

      <SelectItemCarousel @setRosterOpen="setRosterOpen" ref="itemsCarousel" :products_fonts="products_fonts" />

    </template>

    <h2 v-if="mobileScreen" class="fw-bold px-3 py-1 p-lg-0 mt-lg-5 mb-2 fz-18 available-design-heading d-flex align-items-center justify-content-between" @click="toggleDesigns">
      <span style="font-size: 16px">Designs Available</span>
      <span class="mt-1 toggleArrow" :class="[showDesigns ? 'opened' : '']"><BIconChevronDown /></span>
    </h2>
    <h2 v-else class="fw-bold p-3 p-lg-0 mt-lg-5 mb-2 fz-18 available-design-heading d-flex align-items-center justify-content-between">
      <span style="font-size: 16px">Designs Available</span>
    </h2>
    <div class="select-designs" :class="{'opened': showDesigns, 'uploaderOpened': uploaderOpened}">
      <DesignAvailable :key="this.selectedProduct.productstyles[styleIndex]? this.selectedProduct.productstyles[styleIndex].id : ''" :products_fonts="products_fonts" />
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
  import { resetLastActiveProductData } from '@/helpers/Helpers'
  import {ProductsQueryParamsMixin, exitEditMode} from "@/mixins/LockerProduct";
import { FetchCategories } from '@/mixins/SelectedProductMixin'

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
    this.search = this.search_products;
  }
})


export default class ItemToCustomize extends Mixins(ProductsQueryParamsMixin, exitEditMode, FetchCategories) {
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

  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  get styleIndex():number{
    return  this.$store.getters.getCurrentStyleIndex
  }

  public setRosterOpen(val: boolean){
    this.$emit('setRosterOpen', val)
  }

  public async searchProducts(isClear:boolean) {
    let self = this;
    const response = await this.editModeConfirmation();
    if(isClear)
    {
      self.search = "";
      this.$emit('update:search_products', self.search)

    }
    await resetLastActiveProductData()
    await this.exitFromEditMode()
    if(this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(async () => {
      //search function
      await self.$store.dispatch('setSearchLoader', true)
      self.showLoader = true;
      let product_filter : string | null = null;
      if(self.search_products){
        product_filter = `title=${self.search_products}`;
      }
      const categories_promise =  this.fetchCategories(product_filter);
      categories_promise.then(() => {
        let query_params: string[] = [];
        if(this.getSelectedCategory && this.getSelectedCategory.category_id){
          query_params.push(`category_id=${this.getSelectedCategory.category_id}`)
        }
        if(self.search_products){
          query_params.push(`title=${self.search_products}`)
        }
        this.$emit('retrieveProducts', query_params)
      });

    }, 700);
  }

  //  public doSearchDebounced = this.debounce(this.searchProducts,1000);

  public async changeProductType(new_val:boolean, prd_type:string) {
    let self:Record<string, any> = this;
    let customized = this.$store.getters.getCustomized
    let personalized = this.$store.getters.getPersonalized
    let private_product = this.$store.getters.getPrivateProduct
    const itemCarousel = this.$refs['itemsCarousel'] as Record<any, any>
    let retrieve_products = false;
    const response = await this.editModeConfirmation();

    let check = ()=>{
      if(prd_type == "customized"){
        customized = new_val
        personalized = false
        private_product = false
      }

      if(prd_type == "personalized"){
        personalized = new_val
        customized = false
        private_product = false
      }

      if(prd_type == "private_product"){
        personalized = false
        customized = false
        private_product = new_val;
      }
    }
    let categories_promise;
    if(prd_type == 'customized' && customized == false){
      retrieve_products = true
      check()
      categories_promise =  this.fetchCategories('customized');
    } else if(prd_type == 'personalized' && personalized == false){
      retrieve_products = true
      check()
      categories_promise = this.fetchCategories('personalized');
    }
    else {
      retrieve_products = true
      check()
      categories_promise = this.fetchCategories('private_product');
    }
    categories_promise.then( async(response) => {
      if(response){
        if(retrieve_products) {
          await resetLastActiveProductData()
          await this.exitFromEditMode()
          let query_params: string[] = [];
          if(this.getSelectedCategory && this.getSelectedCategory.category_id){
            query_params.push(`category_id=${this.getSelectedCategory.category_id}`)
          }
          if(self.search_products){
            query_params.push(`title=${self.search_products}`)
          }
          this.$emit('retrieveProducts', query_params)
        }
      }
    });
  }

  public async handleCategoryUpdate(category_index:number){
    let self: Record<any, any> = this;
    const response = await this.editModeConfirmation();
    let selected_category = self.categories[category_index]
      await resetLastActiveProductData()
      self.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", {category_index: category_index, category_id: selected_category.id});
      await this.$store.commit('SET_SELECTED_CATEGORY', {category_id:selected_category.id, category_index: category_index })
        let query_params: string[] = [];
       if (selected_category && selected_category.id){
         query_params.push(`category_id=${selected_category.id}`);
        }
        if(self.search_products){
          query_params.push(`title=${self.search_products}`);
        }
        this.$emit('retrieveProducts', query_params)
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

  get selectedCategory() {
    let self = this;
    return { index: this.getSelectedCategory.category_index, id: this.getSelectedCategory.category_id }
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
