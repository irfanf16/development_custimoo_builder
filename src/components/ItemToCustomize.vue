<template>
  <div class="item-to-customize text-left py-lg-5">
    <h2 class="fw-bold p-3 p-lg-0 mb-lg-4 fz-18">Select Item to Customize</h2>
<!--    <div class="customization-nav-area px-3 px-lg-0">-->
<!--      <Search :categoryListing="categories" @search="searchProduct"/>-->
<!--    </div>-->
    <div class="collection-btn mb-2">
      <b-form-checkbox class="mr-3" name="check-button" button>Customized</b-form-checkbox>
      <b-form-checkbox name="check-button" button>Personalized</b-form-checkbox>
    </div>
    <SelectItemCarousel @retrieveProductsC="retrieveProductsC"/>
    <h2 class="fw-bold p-3 p-lg-0 mt-lg-5 mb-2 fz-18 available-design-heading">Designs Available</h2>
    <DesignAvailable />
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
  @Prop({required: true}) categories!: any

  public retrieveProductsC(index :number){
    this.$emit('retrieveProducts', index)
  }
  public searchProduct(param: string, type: string){
    this.$emit('search', param, type)
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

</style>
