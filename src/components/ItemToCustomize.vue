<template>
    <div class="item-to-customize text-left py-5">
        <h2 class="fw-bold mb-2 fz-18">Select Item to Customize</h2>
        <div class="customization-nav-area">
            <Search />
        </div>
        <SelectItemCarousel :productListingCarousel="productListing" />
        <h2 class="fw-bold mt-5 mb-2 fz-18">Designs Available</h2>
        <DesignAvailable />
    </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
    import Search from '@/components/Search.vue'
    import SelectItemCarousel from '../components/SelectItemCarousel.vue'
    import DesignAvailable from '../components/DesignAvailable.vue'
import ApiDataService from "@/services/ApiDataService";


@Component<ItemToCustomize>({
    components: {
        Search,
        SelectItemCarousel,
        DesignAvailable
    }
})
export default class ItemToCustomize extends Vue {
  @Prop() productListing!: any

  // retrieveDesigns(): void {
  //
  //   // console.log(productListing)
  //   this.product_id = '1'
  //   this.company_id = '1'
  //   let param = '?product_id='+this.product_id+'&company_id='+this.company_id
  //   ApiDataService.getAll(param)
  //     .then((response: any) => {
  //       setTimeout(function(){
  //         console.log(response.data);
  //       }, 2000)
  //       this.products = response.data.products.data;
  //     })
  //     .catch((e: any) => {
  //       console.log(e)
  //     });
  // }
}
</script>

