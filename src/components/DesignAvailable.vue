<template>
  <div class="available-designs-section px-3 px-lg-0" ref="designs" v-if="selectedProduct">
    <template v-if="selectedProduct.productstyles[selected_style_index]">
      <div class="design-col" v-for="(design, index) in selectedProduct.productstyles[selected_style_index].productdesigns" :key="design.id">
        <a @click="changeDesign(index); showPreview()" v-if="index < 12 || loadDesigns">
          <Scene canvas-width="150" canvas-height="150" :measurement-ratio="selectedProduct.measurement_ratio"
                 :front="{textureUrl: storageUrl+design.front_design.file_thumbnail_url, file_extension:design.front_design.file_extension, modelUrl: selectedProduct.productstyles[selected_style_index].front? storageUrl+selectedProduct.productstyles[selected_style_index].front.file_thumbnail_url : ''}"
                 :backTextureUrl="design.back_design? design.back_design.file_thumbnail_url: ''"
                 :backTextrueExtension="design.back_design? design.back_design.file_extension: ''"
                 :logos="selectedProduct.productstyles[selected_style_index].logo"
                 :logosSettings="selectedProduct.logos_setting" :logoAllowed="Boolean(selectedProduct.is_logo_allowed)" :logosLimit="selectedProduct.allowed_logos_count"
                 :productNamesSetting="selectedProduct.productnames" :productColors="selectedProduct.colors" :colorGrouping="JSON.parse(design.front_design.color_group)"
                 :productType="selectedProduct.product_type" :product_id="selectedProduct.id" :product_index="selectedProductIndex" :products_fonts="products_fonts" />
        </a>
        <h3>{{ design.design_name }}</h3>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import Scene from '@/components/Scene.vue'

@Component<DesignAvailable>({
  components: {
    Scene
  },
  mounted() {
    if(this.selectedProduct.productstyles[this.getLastActiveProductData.style_index]) {
      this.selected_style_index = this.getLastActiveProductData.style_index
    }

    (this.$refs['designs'] as Record<any, any>).addEventListener('scroll', ($event:Record<any, any>)=>{this.loadIt($event)});
    (this.$refs['designs'] as Record<any, any>).addEventListener('touchmove', ($event:Record<any, any>)=>{this.loadIt($event)});
    console.log('mounted')
  },
  beforeDestroy() {
    (this.$refs['designs'] as Record<any, any>).removeEventListener('scroll', ($event:Record<any, any>)=>{this.loadIt($event)});
    (this.$refs['designs'] as Record<any, any>).removeEventListener('touchmove', ($event:Record<any, any>)=>{this.loadIt($event)});
  }
})

export default class DesignAvailable extends Vue {
  @Prop({ required: true }) readonly products_fonts!: Record<any, any>

  private storageUrl = process.env.VUE_APP_STORAGE_URL
  @Prop() activeTab!: number;
  public selected_style_index = 0;
  public mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  get manageComponents(): Record<any, any> {
    return this.$store.getters.getManageComponents
  }
  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }
  get selectedProductIndex(): number{
    return this.$store.getters.getSelectedIndex
  }
  get styleIndex():number{
    return  this.$store.getters.getCurrentStyleIndex;
  }

  get getLastActiveProductData(): Record<any, any> {
    return this.$store.getters.getLastActiveProductData
  }

  public loadDesigns = false

  public loadIt($event:Record<any, any>) {
    let designHt = $event.target.clientHeight/3
    if(designHt <= $event.target.scrollTop){
      this.loadDesigns = true
    }else if(this.mobileScreen){
      this.loadDesigns = true
    }
  }

  public changeDesign(index: number) {
    let self: Record<any, any> = this;
    this.$store.commit('SET_LAST_ACTIVE_PRODUCT_DATA', {
      design_index: index, design_id: this.selectedProduct.productstyles[self.selected_style_index].productdesigns[index].id
    })
    this.$store.commit('Change_Locker_Tabs_Index', undefined)
    this.$store.dispatch('setActiveTab', -1)
    this.$store.commit('SET_SUFFLE', false)
    this.selectedProduct.productstyles[self.selected_style_index].productdesigns.forEach((design: any, key: number) => {
      if (index == key) {
        Vue.set(design, 'design_show', 1)
        this.$store.dispatch('setSelectedProductDesignID',design.id);
      } else {
        Vue.set(design, 'design_show', 0)
      }
    })
    this.$store.commit('SET_HIDE_SAVE_LOCKER_BUTTON', false);
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
      width: 3px;
  }
  &::-webkit-scrollbar-track {
      background: #f1f1f1;
  }
  &::-webkit-scrollbar-thumb {
      background: #219F84;
  }

  scrollbar-color: #219F84 #f1f1f1;
  scrollbar-width: thin;

  // &:after {
  //   content: '';
  //   flex: auto;
  // }

  .design-col {
    margin-bottom: 10px;
    flex-basis: 25%;
    max-width: 25%;
    min-height: 150px;

    a {
      display: block;
      position: relative;
      z-index: 1;
    }
    h3{
        text-align: center;
        padding: 0;
        text-transform: uppercase;
        overflow: hidden;
        font-size: 0.65rem;
        min-height: 30px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        @media only screen and (min-width: 768px){
          font-size: 0.85rem;
          min-height: 40px;
          padding: 10px 0 0;
        }
        @media only screen and (min-width: 1024px){
          font-size: 0.6rem;
          padding: 0;
        }
        @media only screen and (min-width: 1360px){
          min-height: 50px;
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
