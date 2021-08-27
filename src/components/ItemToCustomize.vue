<template>
  <div class="item-to-customize text-left py-lg-5">
    <h2 class="fw-bold p-3 p-lg-0 mb-lg-4 fz-18">Select Item to Customize</h2>
<!--    <div class="customization-nav-area px-3 px-lg-0">-->
<!--      <Search :categoryListing="categories" @search="searchProduct"/>-->
<!--    </div>-->
    <div class="collection-btn mb-2 checkbox_buttons">
      <b-form-checkbox :checked="customized" @change="changeProductType($event,'customized')"  class="mr-3" name="check-button" button key="Customized"><span class="checked"><b-icon icon="check-circle-fill"></b-icon></span> Customized</b-form-checkbox>
      <b-form-checkbox :checked="personalized" @change="changeProductType($event,'personalized')" name="check-button" button key="Personalized"><span class="checked"><b-icon icon="check-circle-fill"></b-icon></span> Personalized</b-form-checkbox>
    </div>
    <items-carousel @retrieveProductsC="retrieveProductsC"></items-carousel>
<!--    <SelectItemCarousel @retrieveProductsC="retrieveProductsC"/>-->
    <h2 class="fw-bold p-3 p-lg-0 mt-lg-5 mb-2 fz-18 available-design-heading">Designs Available</h2>
    <DesignAvailable />
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator'
  import Search from '@/components/Search.vue'
  import ItemsCarousel from '@/components/ItemsCarousel.vue'
  // import SelectItemCarousel from '../components/SelectItemCarousel.vue'
  import DesignAvailable from '../components/DesignAvailable.vue'

@Component<ItemToCustomize>({
  components: {
    Search,
    ItemsCarousel,
    DesignAvailable
  }
})
export default class ItemToCustomize extends Vue {
  @Prop({required: true}) categories!: any


  public personalized = this.$store.getters.getPersonalized
  public customized = this.$store.getters.getCustomized


  public retrieveProductsC(index :number){
    this.$emit('retrieveProducts', index)
  }
  public searchProduct(param: string, type: string){
    this.$emit('search', param, type)
  }
  public async changeProductType(new_val:boolean, prd_type:string) {
    let self:Record<string, any> = this;
    let old_val = self[prd_type];
    self[prd_type] = new_val;
    if(new_val == false) {
      if(self.customized || self.personalized) {
        await this.$store.dispatch('setProductType', {prd_type: prd_type, value: new_val});
        this.$emit('retrieveProducts','/list/products',false,true)
      } else {
        await this.$store.dispatch('setProductType', {prd_type: prd_type, value: old_val});
        self[prd_type] = prd_type == "personalized" ? self.$store.getters.getPersonalized : this.$store.getters.getCustomized;
      }
    } else {
      await this.$store.dispatch('setProductType', {prd_type: prd_type, value: new_val});
      this.$emit('retrieveProducts','/list/products',false,true)
    }
  }
  public async changeProductType_back(prd_type :any){

    let value = false
    if(prd_type == 'personalized')
      value = this.getPersonalized
    else
      value = this.getCustomized

    await this.$store.dispatch('setProductType', {prd_type: prd_type, value: !value});
    this.$emit('retrieveProducts','/list/products',false,true)
  }

  get getPersonalized(): boolean {
    return this.$store.getters.getPersonalized
  }
  get getCustomized(): boolean {
    return this.$store.getters.getCustomized
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
