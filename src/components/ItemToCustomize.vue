<template>
  <div class="item-to-customize text-left">
    <div class="px-3 py-1" style="border-bottom: 1px solid #eee" v-if="mobileScreen" >
      <h2 class="fw-bold p-lg-0 mb-lg-4 fz-18 bg-transparent d-flex align-items-center justify-content-between" @click="toggleItems">
        <span style="font-size: 16px">Select Item to Customize</span>
        <span v-if="mobileScreen" class="mt-1 toggleArrow" :class="showItems ? 'opened' : ''"><BIconChevronDown /></span>
      </h2>

      <div class="select-items" :class="[showItems ? 'opened' : '']">
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
        <ItemsGrid :showItems="showItems" />
      </div>
    </div>

    <template v-else>
      <div class="collection-btn mb-2 mt-3 d-flex gap-1">
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
            <b-form-input type="text" style="height: 33px;" placeholder="Search" @keyup="searchProducts(false)" v-model="search_products" />
          </b-input-group>
        </div>
<!--        <b-form-checkbox :checked="customized" @change="changeProductType($event,'customized')"  class="mr-3" name="check-button" button key="Customized"><span class="checked"><b-icon icon="check-circle-fill"></b-icon></span> Customized</b-form-checkbox>-->
<!--        <b-form-checkbox :checked="personalized" @change="changeProductType($event,'personalized')" name="check-button" button key="Personalized"><span class="checked"><b-icon icon="check-circle-fill"></b-icon></span> Stock</b-form-checkbox>-->
      </div>

      <div class="d-flex align-items-center">
<!--        <div class="pr-2 font-weight-bold">-->
<!--          Brands:-->
<!--        </div>-->
        <div class="fade-right w-100 py-2">
          <div class="overflow-auto d-flex align-items-center theme-scroll-h pb-2 pointer gap-2 brandsList ">
            <div v-dragscroll="true" v-for="(item, i) in 10" :key="i" style="white-space: nowrap" :style="{color: selectedBrand == i ? '#000 !important': '#999 !important'}"
                 :class="{ 'pr-3': i + 1 == 10, 'activeBrand': selectedBrand == i}" role="button" @click="()=>selectedBrand=i">
              <img src="img/Bauer_Logo.png" height="30" v-if="i==0">
              <img src="img/Hummel_Logo.png" height="30" v-if="i==1">
              <img src="img/NinjaApparel_Logo.png" height="30" v-if="i==2">
              <img src="img/Bauer_Logo.png" height="30" v-if="i==3">
              <img src="img/Hummel_Logo.png" height="30" v-if="i==4">
              <img src="img/NinjaApparel_Logo.png" height="30" v-if="i==5">
              <img src="img/Bauer_Logo.png" height="30" v-if="i==6">
              <img src="img/Hummel_Logo.png" height="30" v-if="i==7">
              <img src="img/NinjaApparel_Logo.png" height="30" v-if="i==8">
            </div>
          </div>
        </div>
      </div>

      <SelectItemCarousel ref="itemsCarousel"/>

    </template>

    <h2 v-if="mobileScreen" class="fw-bold px-3 py-1 p-lg-0 mt-lg-5 mb-2 fz-18 available-design-heading d-flex align-items-center justify-content-between" @click="toggleDesigns">
      <span style="font-size: 16px">Designs Available</span>
      <span class="mt-1 toggleArrow" :class="[showDesigns ? 'opened' : '']"><BIconChevronDown /></span>
    </h2>
    <h2 v-else class="fw-bold p-3 p-lg-0 mt-lg-5 mb-2 fz-18 available-design-heading d-flex align-items-center justify-content-between">
      <span style="font-size: 16px">Designs Available</span>
    </h2>
    <div class="select-designs" :class="{'opened': showDesigns, 'uploaderOpened': uploaderOpened}">
      <DesignAvailable />
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator'
  import Search from '@/components/Search.vue'
  import SelectItemCarousel from '../components/SelectItemCarousel.vue'
  import DesignAvailable from '../components/DesignAvailable.vue'
  import ItemsGrid from "@/components/ItemsGrid.vue";
  import { dragscroll } from 'vue-dragscroll'
  import _ from 'lodash'
  import {http} from "@/httpCommon";

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
  }
})


export default class ItemToCustomize extends Vue {
  @Prop({required: true}) categories!: any;
  @Prop({required: true}) uploaderOpened!: any;


  private showItems = false;
  private showDesigns = true;
  public mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  public personalized = this.$store.getters.getPersonalized
  public customized = this.$store.getters.getCustomized
  public search_products = '';
  public showLoader = false;
  public searchLoader = false;
  public timeout = 0;
  public selectedBrand = 0;


  private toggleItems () {
    this.showItems = !this.showItems
    if(this.showItems){
      this.$emit('hideAll')
    }else{
      this.$emit('switchTabs')
    }
  }
  private toggleDesigns () {
    this.showDesigns = !this.showDesigns
  }

  public async searchProducts(isClear:boolean) {
    let self = this;
    if(isClear)
    {
      self.search_products = "";
    }
    if(this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(async () => {
      //search function
      await self.$store.dispatch('setSearchLoader', true)
      self.showLoader = true;
      const itemCarousel = self.$refs['itemsCarousel'] as Record<any, any>
      await self.$store.dispatch("updateMainProductsInfo",  {has_more_products: false, next_page: null});
      this.$emit('update:search_products', self.search_products)
      this.$emit('retrieveProducts','/list/products')
      itemCarousel.setSliderIndex();
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
    self.$store.dispatch("updateMainProductsInfo",  {has_more_products: false, next_page: null, active_product_id: null});
    if(retrieve_products) {
      await this.$store.dispatch('setProductType', {prd_type: prd_type, value: new_val});
      self.$store.dispatch("updateMainProductsInfo",  {has_more_products: false, next_page: null});
      this.$emit('retrieveProducts','/list/products')
      itemCarousel.setSliderIndex();
    }
  }

  get getPersonalized(): boolean {
    return this.$store.getters.getPersonalized
  }
  get getCustomized(): boolean {
    return this.$store.getters.getCustomized
  }
  get StockCount():number{
    return this.$store.getters.getStockCount
  }
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
