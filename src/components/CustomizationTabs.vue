<template>
  <div>
    <LazyLoader :loader="trigger"/>
    <div class="customization-tabs">
      <b-tabs v-model="tabIndex">
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
            <LogoPlacementTabs :numberOfLogosAllowed="selectedProduct.allowed_logos_count"
                               :logosSetting="selectedProduct.logos_setting"/>
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
              <ColorAccordion :productColors="productColors"/>
            </div>
            <div class="color-tabs d-lg-none">
              <ColorTabs :productColors="productColors"/>
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
            <div v-for="(customText, index) in customTexts" :key="index">
              <CustomizationText :productFonts="selectedProduct.namefonts" :customTextIndex="index"
                                 :fontsColors="fontsColors" :fontOptions="fontOptions"/>
            </div>
            <!-- <div class="px-3 pt-3 p-lg-4 text-right">
              <b-button class="add-logo-btn" @click="addTab(customTexts.length)">
                +
              </b-button>
            </div> -->
          </div>
          <div class="mobile-text-tabs d-lg-none" v-if="hideTab.textHide">
            <b-tabs>
              <!-- <div class="p-lg-4 text-right">
                <b-button class="add-logo-btn" @click="addTab(customTexts.length)">
                  +
                </b-button>
              </div> -->
              <b-tab v-for="(customText, index) in customTexts" :key="index">
                <template #title>
                  Player Name
                </template>
                <div>
                  <CustomizationText :productFonts="selectedProduct.namefonts" :customTextIndex="index"
                                     :fontsColors="fontsColors" :fontOptions="fontOptions"/>
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
            <CollarStyle :productModels="productModels"/>
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
            <EditRosterArea :productSizes="selectedProduct.sizes"/>
          </div>
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import ColorAccordion from '@/components/ColorAccordion.vue'
import LogoPlacementTabs from './LogoPlacementTabs.vue'
import CustomizationText from '@/components/CustomizationText.vue'
import CollarStyle from '@/components/CollarStyle.vue'
import EditRosterArea from '@/components/EditRosterArea.vue'
import UploadLogo from '@/components/UploadLogo.vue'
import ColorTabs from '@/components/ColorTabs.vue'
import {default as $} from 'jquery';
import LazyLoader from "@/components/LazyLoader.vue";

@Component<CustomizationProcess>({
  components: {
    LazyLoader,
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
    this.fontsList()
    this.customTextInit()
  },
})
export default class CustomizationProcess extends Vue {
  @Prop({required: false, default:0}) tabIndexNew!: number
  public fontOptions: Record<any, any>[] = []

  get manageComponents(): Record<any, any> {
    return this.$store.getters.getManageComponents
  }

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get productModels(): Record<any, any> {
    return this.$store.getters.getProductModels;
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts
  }

  get productNames() {
    return this.$store.getters.getSelectedProduct.productnames;
  }

  public tabIndex = 0

  public trigger = false

  public productColors: any[] = []
  public fontsColors: any[] = []
  public firstColor!: Record<any, any>
  public secondColor!: Record<any, any>
  private apiBaseUrl = process.env.VUE_APP_API_BASE_URL

  get hideTab(): Record<any, any> {
    return this.$store.getters.getHideTab
  }
  get lockerColors(){
    return this.$store.getters.getLockerColors
  }

  @Watch('tabIndexNew', {
    immediate: true, deep: true
  })

  tabIndexNewChanged() {
    this.tabIndex = this.tabIndexNew
  }

  @Watch('tabIndex', {
    immediate: true, deep: true
  })

  tabIndexChanged() {
    this.$emit('tabIndexChange', this.tabIndex)
    this.trigger = true
  }

  public productColorsManipulation() {
    this.selectedProduct.colors.forEach((colors: any, key: number) => {
      let finalColor = {color_text: [], selectedColor: "", name: colors.file_name.indexOf('.') != -1? colors.file_name.substr(0, colors.file_name.indexOf('.')) : colors.file_name}
      finalColor.color_text = JSON.parse(colors.color_text)
      this.productColors = this.productColors.concat(finalColor)
    })
    this.productColors = this.productColors.concat(this.lockerColors)
    console.log(this.productColors)
  }

  public fontsColorsManipulation() {
    this.selectedProduct.namecolors.forEach((colors: any, key: number) => {
      let finalColor = {color_text: []}
      finalColor.color_text = JSON.parse(colors.color_text)
      this.fontsColors = this.fontsColors.concat(finalColor)
    })
    if (this.fontsColors.length) {
      this.firstColor = this.fontsColors[0].color_text[0]
      this.secondColor = this.fontsColors[0].color_text? this.fontsColors[0].color_text[1] : this.fontsColors[0].color_text[0]
    }
  }

  public async getModels() {
    await this.$store.dispatch("getModels", this.selectedProduct.product_id);
  }

  public setHideTab(index: string, value: boolean) {
    this.$store.dispatch('setHideTab', {index: index, value: value})
  }

  public customTextInit() {
    this.productNames.forEach((productName: Record<any, any>, index: number) => {
      if (this.customTexts[index] && !this.customTexts[index].action) {
        let text = {
          text: this.customTexts[index].text,
          type: productName.type,
          width: productName.width,
          height: productName.height,
          x_axis: productName.x_axis,
          y_axis: productName.y_axis,
          rotation: productName.rotation,
          haveControls: Boolean(!productName.is_locked),
          outlineEnabled: Boolean(productName.outline_enabled),
          side: productName.side,
          fontFamily: this.customTexts[index].fontFamily ? this.customTexts[index].fontFamily : this.fontOptions[0].value,
          fillColor: this.customTexts[index].fillColor ? this.customTexts[index].fillColor : this.firstColor.value,
          fillColorPantone: this.customTexts[index].fillColor ? this.customTexts[index].fillColor : this.firstColor.name,
          outLineColor: this.customTexts[index].outLineColor ? this.customTexts[index].outLineColor : this.secondColor.value,
          outLineColorPantone: this.customTexts[index].outLineColor ? this.customTexts[index].outLineColor : this.secondColor.name,
          outLineWidth: 0,
          selectColor: false
        }
        this.$store.dispatch('setCustomTexts', {index: index, text: text})
      } else if (!this.customTexts[index]) {
        let text = {
          text: '',
          type: productName.type,
          width: productName.width,
          height: productName.height,
          x_axis: productName.x_axis,
          y_axis: productName.y_axis,
          rotation: productName.rotation,
          haveControls: Boolean(!productName.is_locked),
          outlineEnabled: Boolean(productName.outline_enabled),
          side: productName.side,
          fontFamily: this.fontOptions[0] ? this.fontOptions[0].value : '',
          fillColor: this.firstColor.value,
          fillColorPantone: this.firstColor.name,
          outLineColor: this.secondColor.value,
          outLineColorPantone: this.secondColor.name,
          outLineWidth: 0,
          selectColor: false
        }
        this.$store.dispatch('setCustomTexts', {index: index, text: text})
      }
    })
  }

  public fontsList(): void {
    let productFonts = this.selectedProduct.namefonts
    productFonts.forEach((fonts: any, key: number) => {
      let fontNameParam = fonts.file_url.split('/').reverse()
      fontNameParam = fontNameParam[0].split('.')
      let fontName = fontNameParam[0].replace('-', ' ').toUpperCase()
      let font = {
        value: fontNameParam[0] as string,
        text: fontName as string
      }
      this.fontOptions = this.fontOptions.concat([font])
      let fontUrl = this.apiBaseUrl + '/' + fonts.file_url
      const headElement = document.querySelector('head') as HTMLHeadElement
      headElement.innerHTML += "<style type='text/css'> @font-face{font-family: " + font.value + "; src: url('" + fontUrl + "')}</style>";
      $("#app").append('<p id="delete_after_load" style="visibility: hidden; font-family: '+font.value+'">aa</p>')
      setTimeout(() => {
        $("#delete_after_load").remove()
      }, 1000)
    })
  }

  public addTab(index: number) {
    let text = {
      text: '',
      type: 'name',
      width: 50,
      height: 50,
      x_axis: 300,
      y_axis: 180,
      rotation: 0,
      haveControls: true,
      outlineEnabled: true,
      side: 'back',
      fontFamily: this.fontOptions[0] ? this.fontOptions[0].value : '',
      fillColor: this.firstColor.value,
      fillColorPantone: this.firstColor.name,
      outLineColor: this.secondColor.value,
      outLineColorPantone: this.secondColor.name,
      outLineWidth: 0
    }

    this.$store.dispatch('setCustomTexts', {index: this.customTexts.length, text: text})
  }
}
</script>

<style lang="scss" scoped>
.tab-close-btn {
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
