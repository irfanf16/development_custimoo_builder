<template>
  <div class="item-to-customize text-left py-lg-5">
<!--    <div class="customization-nav-area px-3 px-lg-0">-->
<!--      <Search :categoryListing="categories" @search="searchProduct"/>-->
<!--    </div>-->
<!--    <items-carousel @retrieveProductsC="retrieveProductsC"></items-carousel>-->
<!--    <SelectItemCarousel @retrieveProductsC="retrieveProductsC"/>-->
    <div class="p-3" style="border-bottom: 1px solid #eee" v-if="mobileScreen" >
      <h2 class="fw-bold p-lg-0 mb-lg-4 fz-18 bg-transparent d-flex align-items-center justify-content-between" @click="toggleItems">
        <span>Select Item to Customize</span>
        <span v-if="mobileScreen" class="mt-1 toggleArrow" :class="showItems ? 'opened' : ''"><BIconChevronDown /></span>
      </h2>

      <div class="select-items" :class="showItems ? 'opened' : ''">
        <div class="collection-btn mb-2 mt-3 px-1 checkbox_buttons">
          <b-form-checkbox :checked="customized" @change="changeProductType($event,'customized')"  class="mr-3" name="check-button" button key="Customized"><span class="checked"><b-icon icon="check-circle-fill"></b-icon></span> Customized</b-form-checkbox>
          <b-form-checkbox :checked="personalized" @change="changeProductType($event,'personalized')" name="check-button" button key="Personalized"><span class="checked"><b-icon icon="check-circle-fill"></b-icon></span> Stock</b-form-checkbox>
        </div>

        <ItemsGrid @retrieveProductsC="retrieveProductsC" />
      </div>
    </div>

    <SelectItemCarousel v-else ref="itemsCarousel" @retrieveProductsC="retrieveProductsC"/>

    <h2 v-if="mobileScreen" class="fw-bold p-3 p-lg-0 mt-lg-5 mb-2 fz-18 available-design-heading d-flex align-items-center justify-content-between" @click="toggleDesigns">
      <span>Designs Available</span>
      <span class="mt-1 toggleArrow" :class="showDesigns ? 'opened' : ''"><BIconChevronDown /></span>
    </h2>
    <h2 v-else class="fw-bold p-3 p-lg-0 mt-lg-5 mb-2 fz-18 available-design-heading d-flex align-items-center justify-content-between">
      <span>Designs Available</span>
    </h2>
    <div class="select-designs" :class="showDesigns ? 'opened' : ''">
      <DesignAvailable />
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator'
  import Search from '@/components/Search.vue'

  // import ItemsCarousel from '@/components/ItemsCarousel.vue'
  import SelectItemCarousel from '../components/SelectItemCarousel.vue'
  import DesignAvailable from '../components/DesignAvailable.vue'
  import ItemsGrid from "@/components/ItemsGrid.vue";

@Component<ItemToCustomize>({
  components: {
    ItemsGrid,
    Search,
    // ItemsCarousel,
    SelectItemCarousel,
    DesignAvailable
  }
})


export default class ItemToCustomize extends Vue {
  @Prop({required: true}) categories!: any;


  private showItems = false;
  private showDesigns = true;
  public mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  public personalized = this.$store.getters.getPersonalized
  public customized = this.$store.getters.getCustomized

  private toggleItems () {
    this.showItems = !this.showItems
  }
  private toggleDesigns () {
    this.showDesigns = !this.showDesigns
  }

  public retrieveProductsC(index :number){
    //this.$emit('retrieveProducts', index)
    this.$emit('retrieveProducts','/list/products',false,true)
  }
  public searchProduct(param: string, type: string){
    this.$emit('search', param, type)
  }
  public async changeProductType(new_val:boolean, prd_type:string) {
    let self:Record<string, any> = this;
    let old_val = self[prd_type];
    self[prd_type] = new_val;
    const itemCarousel = this.$refs['itemsCarousel'] as Record<any, any>
    if(new_val == false) {
      if(self.customized || self.personalized) {
        await this.$store.dispatch('setProductType', {prd_type: prd_type, value: new_val});
        this.$emit('retrieveProducts','/list/products',false,true)
        itemCarousel.setSliderIndex();
      } else {
        await this.$store.dispatch('setProductType', {prd_type: prd_type, value: old_val});
        self[prd_type] = prd_type == "personalized" ? self.$store.getters.getPersonalized : this.$store.getters.getCustomized;
        itemCarousel.setSliderIndex();
      }
    } else {
      await this.$store.dispatch('setProductType', {prd_type: prd_type, value: new_val});
      this.$emit('retrieveProducts','/list/products',false,true)
      itemCarousel.setSliderIndex();
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
      max-height: calc(85vh - 120px);
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

</style>
