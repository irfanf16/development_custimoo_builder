<template>
    <div class="item-to-customize text-left py-5">
        <h2 class="fw-bold mb-2 fz-18">Select Item to Customize</h2>
        <div class="customization-nav-area">
            <Search :categoryListing="categories"/>
        </div>
        <SelectItemCarousel :productListingCarousel="productListing" ref="updateCarousel"  @designsData="setDesigns" @retrieveProductsC="retrieveProductsC" />
        <h2 class="fw-bold mt-5 mb-2 fz-18">Designs Available</h2>
        <DesignAvailable :productDesignsData="productListing[designIndex]" />
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
  public reRenderCarousel(): void{
    console.log('rendered!!')
    // this.$refs.updateCarousel.reRender()
  }
}
</script>

