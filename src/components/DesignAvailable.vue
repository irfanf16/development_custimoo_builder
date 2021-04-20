<template>
  <div class="available-designs-section px-3 px-lg-0" v-if="productDesignsData">
    <div class="design-col" v-for="(design, index) in productDesignsData.productstyles[0].productdesigns"
         :key="design.id">
      <a @click="changeDesign(index); showDesign()">
        <Scene :canvas-height="73" :canvas-width="59"
               :front="{textureUrl: apiBaseUrl+'/'+ design.front_design.file_url, modelUrl: apiBaseUrl+'/'+ productDesignsData.productstyles[0].front.file_url}"
               :logos="productDesignsData.productstyles[0].logo"
               :logosSettings="design.logos_setting" :logoAllowed="Boolean(design.is_logo_allowed)" :logosLimit="design.allowed_logos_count" :productColors="design.colors" />
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import Scene from '@/components/Scene.vue'
import manageComponents from '@/store/modules/main'

@Component<DesignAvailable>({
  components: {
    Scene
  }
})

export default class DesignAvailable extends Vue {
  @Prop({required: true}) productDesignsData !: any
  private apiBaseUrl: string = process.env.VUE_APP_API_BASE_URL

  public changeDesign(index: number) {
    this.productDesignsData.productstyles[0].productdesigns.forEach((design: any, key: number) => {
      if (index == key) {
        design.design_show = 1
      } else {
        design.design_show = 0
      }
    })
  }

  public showDesign() {
      if(!manageComponents.mobileScreen){
        this.$store.dispatch('setManageComponents', {index: 'ItemToCustomize', value: false})
        this.$store.dispatch('setManageComponents', {index: 'LogoArea', value: true})
        this.$store.dispatch('setManageComponents', {index: 'CustomizationPreview', value: true})
        this.$store.dispatch('setManageComponents', {index: 'showAdvanceCustomization', value: true})
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
    flex: 0 0 23%;
    max-width: 23%;
    margin-bottom: 10px;

    &:last-child {
      margin-left: 10px;
    }

    a {
      display: block;
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
