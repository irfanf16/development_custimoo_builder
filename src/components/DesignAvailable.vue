<template>
  <div class="available-designs-section px-3 px-lg-0" ref="designs" v-if="selectedProduct">
    <template v-if="selectedProduct.productstyles[styleIndex]">
      <div class="design-col" v-for="(design, index) in selectedProduct.productstyles[styleIndex].productdesigns" :key="design.id" :class="{'selected_design': design.id == selectedDesignId}">
        <a @click="changeDesign(index); showPreview()" v-if="index < itemsPerRow || loadDesigns">
          <Scene canvas-width="150" canvas-height="150" :measurement-ratio="selectedProduct.measurement_ratio"
                 :front="{textureUrl: storageUrl+design.front_design.file_thumbnail_url, file_extension:design.front_design.file_extension, safe_zone_url: design.frontsafezone_design? storageUrl+design.frontsafezone_design.file_url : '',
                 modelUrl: selectedProduct.productstyles[styleIndex].front? storageUrl+selectedProduct.productstyles[styleIndex].front.file_thumbnail_url : '',
                  models: selectedProduct.productstyles[styleIndex].front_models}"
                 :backTextureUrl="design.back_design? design.back_design.file_thumbnail_url: ''"
                 :backTextrueExtension="design.back_design? design.back_design.file_extension: ''"
                 :logos="selectedProduct.productstyles[styleIndex].logo"
                 :logosSettings="selectedProduct.logos_setting" :logoAllowed="Boolean(selectedProduct.is_logo_allowed)" :logosLimit="selectedProduct.allowed_logos_count"
                 :productNamesSetting="selectedProduct.productnames" :productColors="selectedProduct.colors" :colorGrouping="JSON.parse(design.front_design.color_group)"
                 :productType="selectedProduct.product_type" :product_id="selected_product_id" :product_index="selectedProductIndex" :products_fonts="products_fonts" />
        </a>
        <h3>{{ design.design_name }}</h3>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Mixins} from 'vue-property-decorator'
import Scene from '@/components/Scene.vue'
import {HideUpdateLockerButton} from "@/mixins/SelectedProductMixin";

@Component<DesignAvailable>({
  components: {
    Scene
  },
  mounted() {
    (this.$refs['designs'] as Record<any, any>).addEventListener('scroll', ($event:Record<any, any>)=>{this.loadIt($event)});
    (this.$refs['designs'] as Record<any, any>).addEventListener('mousewheel', ($event:Record<any, any>)=>{this.loadIt($event)});
    (this.$refs['designs'] as Record<any, any>).addEventListener('touchmove', ($event:Record<any, any>)=>{this.loadIt($event)});
    this.itemsPerRow = Math.round((this.$refs['designs'] as Record<any, any>).clientHeight / 130) * 4;
  },
  beforeDestroy() {
    (this.$refs['designs'] as Record<any, any>).removeEventListener('scroll', ($event:Record<any, any>)=>{this.loadIt($event)});
    (this.$refs['designs'] as Record<any, any>).removeEventListener('mousewheel', ($event:Record<any, any>)=>{this.loadIt($event)});
    (this.$refs['designs'] as Record<any, any>).removeEventListener('touchmove', ($event:Record<any, any>)=>{this.loadIt($event)});
  }
})

export default class DesignAvailable extends Mixins(HideUpdateLockerButton) {
  @Prop({ required: true }) readonly products_fonts!: Record<any, any>

  private storageUrl = process.env.VUE_APP_STORAGE_URL
  @Prop() activeTab!: number;
  public mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  public itemsPerRow = 16

  get manageComponents(): Record<any, any> {
    return this.$store.getters.getManageComponents
  }
  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }
  get selected_product_id(): number{
    return this.$store.getters.getSelectedProductId
  }
  get selectedProductIndex(): number{
    return this.$store.getters.getSelectedIndex
  }
  get selectedDesignId(): number{
    return this.$store.getters.getSelectedDesignId
  }
  get styleIndex():number{
    return  this.$store.getters.getCurrentStyleIndex;
  }

  get getLastActiveProductData(): Record<any, any> {
    return this.$store.getters.getLastActiveProductData
  }

  public loadDesigns = false

  public loadIt($event:Record<any, any>) {
    $event.stopPropagation()

    let designHt = 1
    if(designHt <= $event.target.scrollTop){
      this.loadDesigns = true
    }else if(this.mobileScreen){
      this.loadDesigns = true
    }
  }

  public changeDesign(index: number) {
    let self: Record<any, any> = this;
    this.$store.commit('SET_LAST_ACTIVE_PRODUCT_DATA', {
      design_index: index, design_id: this.selectedProduct.productstyles[this.styleIndex].productdesigns[index].id
    })
    this.$store.commit('Change_Locker_Tabs_Index', undefined)
    this.$store.dispatch('setActiveTab', -1)
    this.$store.commit('SET_SHUFFLE', false)
    this.selectedProduct.productstyles[this.styleIndex].productdesigns.forEach((design: any, key: number) => {
      if (index == key) {
        Vue.set(design, 'design_show', 1)
        this.$store.dispatch('setSelectedProductDesignID',design.id);
      } else {
        Vue.set(design, 'design_show', 0)
      }
    })
    this.hideLockerProductUpdateButton()
  }

  public showPreview() {
    if(this.manageComponents.mobileScreen){
      this.$store.dispatch('setManageComponents', {index: 'CustomizationPreview', value: true})
      this.$store.dispatch('setManageComponents', {index: 'ItemToCustomize', value: false})
      this.$store.dispatch('setManageComponents', {index: 'CustomizationTabs', value: true})
    }
  }
}
</script>

<style scoped lang="scss">
.available-designs-section {
  display: flex;
  flex-wrap: wrap;
  // justify-content: space-between;
  align-items: center;
  //max-height: 15vh;
  overflow: hidden;
  overflow-y: auto;
  padding-bottom: 13vh;
  //@media only screen and (min-width: 350px){
  //  max-height: 36vh;
  //}
  //@media only screen and (min-width: 374px){
  //  max-height: 32vh;
  //}
  //@media only screen and (min-width: 410px){
  //  max-height: 38vh;
  //}
  //@media only screen and (min-width: 768px){
  //  max-height: 52vh;
  //}

  @media only screen and (min-width: 992px){
    max-height: 50vh;
    padding-bottom: 0;
  }
  &::-webkit-scrollbar{
      width: 7px;
  }
  &::-webkit-scrollbar-track {
      background: #f1f1f1;
  }
  &::-webkit-scrollbar-thumb {
      background: rgba(33, 159, 132, 0.267);
      border-radius: 100px;
  }

  scrollbar-color: #219F84 #f1f1f1;
  scrollbar-width: thin;

  &:hover{
    &::-webkit-scrollbar-thumb {
        background: #219F84;
    }
  }

  // &:after {
  //   content: '';
  //   flex: auto;
  // }

  .design-col {
    margin-bottom: 10px;
    flex-basis: 25%;
    max-width: 25%;
    padding: 5px;
    border-radius: 5px;

    a {
      display: block;
      position: relative;
      z-index: 1;
    }

    h3{
      text-align: center;
      padding: 7px 0 0;
      text-transform: uppercase;
      overflow: hidden;
      font-size: 0.65rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      word-break: break-all;
      word-wrap: break-word;

        @media only screen and (min-width: 768px){
          font-size: 0.85rem;
        }
        @media only screen and (min-width: 1024px){
          font-size: 0.6rem;
        }
      }

    img {
      display: block;
      max-width: 100%;
      margin: 0;
      height: auto;
    }

  }
}
</style>
