<template>
  <div>
  <div class="customization-tabs">
    <b-tabs>
      <b-tab v-if="selectedProduct.is_logo_allowed == 1">
        <button @click="setHideTab('logoHide', !hideTab.logoHide)" class="tab-close-btn d-lg-none"></button>
        <template #title>
          <a @click="setHideTab('logoHide', true)">
            <div class="icon-holder">
              <font-awesome-icon :icon="['fas', 'image']"/>
            </div>
            Logo
          </a>
        </template>
        <div class="logo-placement-tabs" v-if="hideTab.logoHide">
          <LogoPlacementTabs :numberOfLogosAllowed="selectedProduct.allowed_logos_count" :logosSetting="selectedProduct.logos_setting" />
        </div>
      </b-tab>
      <b-tab>
        <button @click="setHideTab('colorHide', !hideTab.colorHide)" class="tab-close-btn d-lg-none"></button>
        <template #title>
          <a @click="setHideTab('colorHide', true)">
            <div class="icon-holder">
              <font-awesome-icon :icon="['fas', 'fill-drip']"/>
            </div>
          </a>
          Color
        </template>
        <div v-if="hideTab.colorHide">
          <h2 class="fw-bold fz-16 p-3 d-none d-lg-block">Choose Color</h2>
          <div class="d-none d-lg-block">
            <ColorAccordion :productColors="productColors" />
          </div>
          <div class="color-tabs d-lg-none">
            <ColorTabs />
          </div>
        </div>
      </b-tab>
      <b-tab>
        <button @click="setHideTab('textHide', !hideTab.textHide)" class="tab-close-btn d-lg-none"></button>
        <template #title>
          <a @click="setHideTab('textHide', true)">
            <div class="icon-holder">
              <font-awesome-icon :icon="['fas', 'text-height']"/>
            </div>
          </a>
          Text
        </template>
        <div class="d-none d-lg-block">
          <CustomizationText :productFonts="selectedProduct.namefonts" :fontsColors="fontsColors"/>
        </div>
        <div class="mobile-text-tabs d-lg-none" v-if="hideTab.textHide">
          <b-tabs>
            <b-tab>
              <template #title>
                Player Name
              </template>
              <div>
<!--                <CustomizationText :productFonts="selectedProduct.namefonts" :fontsColors="fontsColors"/>-->
              </div>
            </b-tab>
            <b-tab>
              <template #title>
                Player Number
              </template>
              <div>
<!--                <CustomizationText :productFonts="selectedProduct.namefonts" :fontsColors="fontsColors"/>-->
              </div>
            </b-tab>
            <b-tab>
              <template #title>
                Player Name Or Number
              </template>
              <div>
<!--                <CustomizationText :productFonts="selectedProduct.namefonts" :fontsColors="fontsColors"/>-->
              </div>
            </b-tab>
          </b-tabs>
        </div>
      </b-tab>
      <b-tab @click="getModels">
        <button @click="setHideTab('styleHide', !hideTab.styleHide)" class="tab-close-btn d-lg-none"></button>
        <template #title>
          <a @click="setHideTab('styleHide', true)">
            <div class="icon-holder">
              <font-awesome-icon :icon="['fas', 'swatchbook']"/>
            </div>
          </a>
          Style
        </template>
        <div class="collar-section p-4" v-if="hideTab.styleHide">
          <h2 class="fw-bold mb-2 fz-18">Choose Product</h2>
          <CollarStyle  :productModels="productModels"/>
        </div>
      </b-tab>
      <b-tab>
        <button @click="setHideTab('teamHide', !hideTab.teamHide)" class="tab-close-btn d-lg-none"></button>
        <template #title>
          <a @click="setHideTab('teamHide', true)">
            <div class="icon-holder">
              <font-awesome-icon :icon="['fas', 'user-friends']"/>
            </div>
          </a>
          Team
        </template>
        <div class="team-roaster-area p-4" v-if="hideTab.teamHide">
          <h2 class="fw-bold mb-2 fz-18">Roster</h2>
          <EditRosterArea />
        </div>
      </b-tab>
    </b-tabs>
  </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import ColorAccordion from '@/components/ColorAccordion.vue'
import LogoPlacementTabs from './LogoPlacementTabs.vue'
import CustomizationText from '@/components/CustomizationText.vue'
import CollarStyle from '@/components/CollarStyle.vue'
import EditRosterArea from '@/components/EditRosterArea.vue'
import UploadLogo from '@/components/UploadLogo.vue'
import ColorTabs from '@/components/ColorTabs.vue'
import {http} from "@/httpCommon";

@Component<CustomizationProcess>({
  components: {
    ColorAccordion,
    LogoPlacementTabs,
    CustomizationText,
    CollarStyle,
    EditRosterArea,
    ColorTabs,
    UploadLogo
  },
  mounted() {
    this.$store.dispatch('setCustomLogos')
    this.productColorsManipulation()
    this.fontsColorsManipulation()
  },
})
export default class CustomizationProcess extends Vue {
  get manageComponents(): Record<any, any> {
    return this.$store.getters.getManageComponents
  }
  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }
  get productModels():Record<any, any>{
    return  this.$store.getters.getProductModels;
  }
  public productColors: any[] = []
  public fontsColors: any[] = []

  public productColorsManipulation(){
    this.selectedProduct.colors.forEach((colors: any, key: number) => {
      colors.color_text = JSON.parse(colors.color_text)
      colors.selectedColor = ""
      this.productColors = this.productColors.concat(colors)
    })
  }

  public fontsColorsManipulation(){
    this.selectedProduct.namecolors.forEach((colors: any, key: number) => {
      this.fontsColors = JSON.parse(colors.color_text)
    })
  }

  public async getModels(){
    await this.$store.dispatch("getModels", this.selectedProduct.product_id);
  }

  public hideTab = {
    logoHide: !this.manageComponents.mobileScreen,
    colorHide: !this.manageComponents.mobileScreen,
    textHide: !this.manageComponents.mobileScreen,
    styleHide: !this.manageComponents.mobileScreen,
    teamHide: !this.manageComponents.mobileScreen
  }

  public setHideTab(index: string, value: boolean) {
    Vue.set(this.hideTab, index, value)
  }
}
</script>

<style lang="scss" scoped>
  .tab-close-btn{
    display: block;
    width: 100%;
    max-width: 100px;
    margin: 10px auto 0;
    height: 4px;
    background: #DFE5E8;
    border-radius: 10px;
    border: none;
  }
</style>
