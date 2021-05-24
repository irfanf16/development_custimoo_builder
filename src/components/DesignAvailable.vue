<template>
  <div class="available-designs-section px-3 px-lg-0" v-if="selectedProduct">
    <div class="design-col" v-for="(design, index) in selectedProduct.productstyles[styleIndex].productdesigns"
         :key="design.id">
      <a @click="changeDesign(index); showDesign()">
        <Scene canvas-width="100" canvas-height="100" :measurement-ratio="design.measurement_ratio"
          :front="{textureUrl: apiBaseUrl+'/'+ design.front_design.file_url, modelUrl: apiBaseUrl+'/'+ selectedProduct.productstyles[styleIndex].front.file_url}"
           :backTextureUrl="design.back_design? design.back_design.file_url: ''"
           :logos="selectedProduct.productstyles[styleIndex].logo"
           :logosSettings="selectedProduct.logos_setting" :logoAllowed="Boolean(selectedProduct.is_logo_allowed)" :logosLimit="selectedProduct.allowed_logos_count" :productColors="selectedProduct.colors" />
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import Scene from '@/components/Scene.vue'

@Component<DesignAvailable>({
  components: {
    Scene
  }
})

export default class DesignAvailable extends Vue {
  private apiBaseUrl = process.env.VUE_APP_API_BASE_URL
  get manageComponents(): Record<any, any> {
    return this.$store.getters.getManageComponents
  }
  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }
  get styleIndex():number{
    return  this.$store.getters.getCurrentStyleIndex;
  }

  public changeDesign(index: number) {
    this.selectedProduct.productstyles[this.styleIndex].productdesigns.forEach((design: any, key: number) => {
      if (index == key) {
        Vue.set(design, 'design_show', 1)
      } else {
        Vue.set(design, 'design_show', 0)
      }
    })
  }

  public showDesign() {
    if(this.manageComponents.mobileScreen){
      this.$store.dispatch('setManageComponents', {index: 'ItemToCustomize', value: false})
      this.$store.dispatch('setManageComponents', {index: 'LogoArea', value: true})
      this.$store.dispatch('setManageComponents', {index: 'CustomizationPreview', value: true})
      this.$store.dispatch('setManageComponents', {index: 'showAdvanceCustomization', value: true})
      this.$store.dispatch('setManageComponents', {index: 'AdvanceCustomization', value: true})
    }
  }
}
</script>

<style scoped lang="scss">
.available-designs-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  max-height: 50vh;
  overflow: hidden;
  overflow-y: auto;

  &:after {
    content: '';
    flex: auto;
  }

  .design-col {
    flex: 0 0 22%;
    max-width: 22%;
    margin-bottom: 10px;

    @media only screen and (min-width: 1024px){
      flex: 0 0 30%;
      max-width: 30%;
    }
    @media only screen and (min-width: 1360px){
      flex: 0 0 22%;
      max-width: 22%;
    }

    &:last-child {
      margin-left: 10px;
    }

    a {
      display: block;
      position: relative;
      z-index: 1;
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
