<template>
  <div class="item-to-customize text-left py-lg-5">
    <h2 class="fw-bold p-3 p-lg-0 mb-lg-2 fz-18">Select Item to Customize</h2>
    <div class="customization-nav-area px-3 px-lg-0">
      <Search :categoryListing="categories" @search="searchProduct"/>
    </div>
    <SelectItemCarousel :productListingCarousel="productListing" ref="updateCarousel" @designsData="setDesigns"
                        @retrieveProductsC="retrieveProductsC"/>
    <h2 class="fw-bold p-3 p-lg-0 mt-lg-5 mb-2 fz-18 available-design-heading">Designs Available</h2>
    <DesignAvailable :productDesignsData="productListing[designIndex]"/>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator'
  import Search from '@/components/Search.vue'
  import SelectItemCarousel from '../components/SelectItemCarousel.vue'
  import DesignAvailable from '../components/DesignAvailable.vue'

@Component<ItemToCustomize>({
  components: {
    Search,
    SelectItemCarousel,
    DesignAvailable
  }
})
export default class ItemToCustomize extends Vue {
  public designIndex = 0

  @Prop({required: true}) productListing!: any
  @Prop({required: true}) categories!: any

  public setDesigns(designIndex :number){
    this.designIndex = designIndex
    this.$emit('designsData', designIndex)
  }
  public retrieveProductsC(index :number){
    this.$emit('retrieveProducts', index)
  }
  public searchProduct(param: string, type: string){
    this.$emit('search', param, type)
  }
  public reRenderCarousel(): void{
    console.log('rendered!!')
    // this.$refs.updateCarousel.reRender()
  }
}
</script>

<style scoped lang="scss">
  .item-to-customize{
    margin: 0 -15px;
    border-top: 1px solid #EDF2F6;
    @media only screen and (min-width: 992px){
      margin: 0;
      border-top: none;
    }
    h2{
      background: #fff;
      @media only screen and (min-width: 992px){
        background: none;
      }
    }
    .available-design-heading{background: none;}
  }
  .customization-nav-area{
    background: #fff;
    @media only screen and (min-width: 992px){background: none;}
  }
</style>