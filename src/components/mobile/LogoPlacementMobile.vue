<template>
  <div v-if="selectedProduct">
    <b-tabs class="upload_logo mobile">
      <b-tab v-for="(logo_tab, ltIdx) in customLogos" :key="ltIdx" :active="tabIndex === ltIdx" @click="changeTab(ltIdx)">
        <template #title>
          <span>{{ ltIdx == 0 ? 'Team Logo' : 'logo ' + ltIdx }}</span>
          <div v-if="ltIdx > 0">
            <span class="close" @click="removeLogoTab(ltIdx)"><BIconX /></span>
          </div>
        </template>
        <div class="logo-uploader-main">
          <div class="tabs-logo-container">
            <div class="logo-placement-area mb-3 mb-lg-4 pt-0">
              <div class="logo-placement-holder mb-lg-3" :class="logo_tab.url ? 'hasLogo': 'noLogo'">
                <div class="logo-holder">
                  <LogoUploaderMobile :customLogoIndex="ltIdx" :showImage="true" :showActions="true"
                                    :ref="'logoUploadModalOpener'+ltIdx" :customLogo="logo_tab" :key="'top'+ltIdx">
                    <span slot="upload_text">Click to upload logo or drag a file here</span>
                  </LogoUploaderMobile>
                  <div class="logo-placemet-content">
                    <b-button :class="{'invisible': !getRecentLogos.length > 0}" class="logo-editor-button py-2" @click="showRecentLogosHandler" style="line-height: normal;" size="sm" variant="secondary">
                        Logos
                    </b-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="logo-placement-area extracted-color-area" style="margin-top: 15px;" v-if="ltIdx ==0  && selectedProduct.product_type == 'customized'">
            <h4 v-if="customLogos[0].url" class="mb-3 d-flex align-items-center justify-content-between mb-lg-4">
              <div>
                Color Extracted from Logo
              </div>
            </h4>
            <div class="mb-lg-3 w-100">
              <div class="color-holder" style="margin-top: -10px; padding-top: 10px;">
                <div class="color-container">
                  <div class="color-box" v-for="(imageColor, icIdx) in logoColorsInfo.colors"
                       @click="selectLogoColor(imageColor, +icIdx)" :title="imageColor.name"
                       :class="{'active-swatch' : icIdx==selectedSwatchIndex, 'noColor': !imageColor.hex}"
                       :style="{background: imageColor.hex ? imageColor.hex : '#fff'}" :key="icIdx">
                    <template v-if="imageColor.hex">
                          <span class="removeColor" @click.stop="deleteLogoColor(icIdx)">
                            <BIconX />
                          </span>
                    </template>
                    <template v-else>
                      <BIconPlus class="addColor" />
                    </template>
                    <span class="selected" @click="deleteLogoColor(icIdx)">
                            <BIconCheck />
                          </span>
                  </div>

                  <div v-if="active_logo_color_index >= 0" class="mobile-other">
                    <span class="close" @click="hideOther"><BIconX /></span>
                    <h2>Choose a color</h2>
                    <LogoColorTabsNew v-if="active_logo_color_index >= 0" @setSwatchColor="setSwatchColor" :productColors="product_colors"
                                      :logoColorIndex="active_logo_color_index"
                    />
                  </div>

                  <div v-if="showRecentLogos" class="mobile-other recent-logos-mobile">
                    <span class="close" @click="hideRecentLogosHandler"><BIconX /></span>
                    <div>
                      <template v-if="customLogos && customLogos.length > 0">
                        <recent-logos :custom-logo-index="ltIdx" :custom-logo="customLogos[ltIdx]"/>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
              <div class="d-flex align-items-center justify-content-center gap-1">
                <b-button @click="useLogoColors" class="use-btn flex-shrink-1" style="white-space: nowrap; max-width: 200px" v-if="!logoColorsInfo.using_logo_colors">
                  Logo Colors
                </b-button>
                <b-button @click="useOriginalColors" class="use-btn flex-shrink-1" style="white-space: nowrap; max-width: 200px" v-else>
                  Original Colors
                </b-button>
                <b-button class="use-btn flex-shrink-1" @click="shuffleLogoColors" :class="!logoColorsInfo.using_logo_colors ? 'invisible': 'pulse-animation'"
                          variant="secondary"><b-icon-shuffle />
                </b-button>
                <b-button class="use-btn flex-shrink-1" style="width: auto" @click="rollbackPreviousColors()" :class="{'invisible': !(previousImageColors.length && usingColorLogos)}" variant="secondary">
                  <font-awesome-icon :icon="['fas', 'redo-alt']"/>
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </b-tab>

      <template #tabs-end>
          <li @click="addTab" class="add_text_tab" style="font-size: 0.9em">Add <BIconPlus/></li>
      </template>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop} from 'vue-property-decorator'
import {getProductColors, setLogoSettings} from "@/helpers/Helpers";
import UploadLogo from "@/components/UploadLogo.vue"
import UploadLogoMobile from "@/components/mobile/LogoUploaderMobile.vue"
import SaveLogoModal from "@/components/SaveLogoModal.vue"
import SaveColorModal from "@/components/SaveColorModal.vue"
import LogoColorTabsNew from "@/components/LogoColorTabsNew.vue"
import RecentLogos from "@/components/Logo/RecentLogos.vue";
import {LogoUploaderColors} from "@/mixins/LogoUploaderColors";
import LogoUploaderMobile from "@/components/mobile/LogoUploaderMobile.vue";

@Component<LogoPlacementMobile>({
  components: {
    LogoUploaderMobile,
    RecentLogos,
    UploadLogo,
    UploadLogoMobile,
    SaveLogoModal,
    SaveColorModal,
    LogoColorTabsNew
  },
  mounted() {
    this.product_colors = getProductColors();

    const logo_disclaimer_info = localStorage.getItem("logoDisclaimerInfo")
    if(logo_disclaimer_info) {
      this.logoDisclaimerInfo = JSON.parse(logo_disclaimer_info)
    }
  }
})

export default class LogoPlacementMobile extends Mixins(LogoUploaderColors) {
  @Prop({required: true}) numberOfLogosAllowed!: number
  @Prop({required: false, default: () => { return [{
      url: '',
      width: 200,
      height: 200,
      x_axis: 250,
      y_axis: 200,
      rotation: 0,
      haveControls: true,
      side: 'front',
      customLogo: true
    }]}}) logosSetting!: [Record<any, any>]
  public tabIndex = 0
  public numberOfLogos = 1
  public allowedLogosLimit = 1000
  public previousImageColors = []
  public productColors: any[] = []
  public mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  public selectedSwatchIndex = -1
  public showLogoColors = false
  public defSwatchColor = '#ffffff'
  public defSwatchPantone = '11-0601'
  public showSVGs = false
  public product_colors: Record<any, any>[] = []
  public showRecentLogos = false
  public pulse_info: Record<any, any> = {
    use_original_colors: true, shuffle: true, use_logo_colors: true
  }

  public async rollbackPreviousColors () {
    this.initialExtractedColors.forEach((defaultColor: Record<any, any>, index: number) => {
      this.$store.dispatch('setDefaultColor', { index: index, color: defaultColor.hex, pantone: defaultColor.pantone })
    })
    let initial_colors = JSON.parse(JSON.stringify(this.initialExtractedColors));
    await this.$store.dispatch("SET_LOGO_COLORS", initial_colors);
    this.previousImageColors = []
  }

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }
  get customLogos() {
    return this.$store.getters.getCustomLogos();
  }
  get hideColorSection() {
    return this.$store.getters.getHideColorSection
  }
  get initialExtractedColors(){
    return this.$store.getters.getinitialExtractedColors
  }

  get defaultColors() : [Record<any, any>] {
    return this.$store.getters.getDefaultColors
  }

  get usingColorLogos() : [Record<any, any>] {
    return this.$store.getters.getUsingColorLogos;
  }
  public changeTab(index:number){
    this.$store.dispatch('setLogoTab', index)
  }
  get imageColors(): any[] {
    return this.$store.getters.getLogosColors
  }

  get lockerColors(){
    return this.$store.getters.getLockerColors
  }
  // get logoColors(): [] {
  //   return this.$store.getters.getLogosColors
  // }
  get getRecentLogos() {
    return this.$store.getters.getRecentLogos
  }

  get logoColorsInfo() {
    return this.$store.getters.getLogoColorsInfo()
  }

  // public getColors() {
  //
  //   this.productColors = []
  //   this.selectedProduct.colors.forEach((colors: any, key: number) => {
  //     let finalColor = {color_text: [], selectedColor: "", name: colors.file_name.substr(0, colors.file_name.indexOf('.'))}
  //     finalColor.color_text = colors.json_data
  //     this.productColors = this.productColors.concat(finalColor)
  //   })
  //   this.productColors = this.productColors.concat(this.lockerColors)
  //
  // }

  // public selectLogoColor(index: number, imageColor: Record<any, any>){
  //   if(index==this.selectedSwatchIndex) {
  //     this.showLogoColors = false;
  //     this.selectedSwatchIndex = -1;
  //     this.$emit('showOther', false);
  //   } else {
  //     this.selectedSwatchIndex = index
  //     this.defSwatchColor = imageColor.hex
  //     this.defSwatchPantone = imageColor.pantone
  //     this.getColors();
  //     this.showLogoColors = true
  //     this.$emit('showOther', true);
  //   }
  // }

  public hideOther() {
    this.showLogoColors = false
    this.$emit('showOther', this.showLogoColors);
    this.selectedSwatchIndex = -1;
    this.selectLogoColor({},-1)
  }

  private showRecentLogosHandler(){
    this.showRecentLogos = true
    this.$emit('showOther', true);
  }
  private hideRecentLogosHandler(){
    this.showRecentLogos = false
    this.$emit('showOther', false);
  }

  public removeLogoTab(index: number){
    let payload = {
      index: index
    }
    let logo = setLogoSettings(index);
    logo.logoIndex = index;
    this.$store.commit('customLogos', logo)
    setTimeout(() => {
      this.$store.dispatch('deleteCustomLogoTab', payload)
    }, 500)
    this.tabIndex = this.tabIndex - 1;
  }
  public async initFirstLogoTab(index: number){
    if(this.$store.getters.getCustomLogos().length < 1){
      if(this.numberOfLogos < this.allowedLogosLimit) {
        let logoSetting: Record<any, any>
        if(this.logosSetting[index]) {
          logoSetting = this.logosSetting[index] as Record<any, any>
        }else {
          logoSetting = {
            width: 200,
            x_axis: 150,
            y_axis: 190,
            rotation: 0,
            haveControls: true,
            side: 'front'
          }
        }
        let logo = {
          id:null,
          url: '',
          width: logoSetting.width,
          height: logoSetting.height,
          x_axis: logoSetting.x_axis,
          y_axis: logoSetting.y_axis,
          rotation: logoSetting.rotation as number,
          haveControls: Boolean(!logoSetting.is_locked),
          side: logoSetting.side,
          customLogo: true
        }
        // this.showFileInput = false;
        await this.$store.dispatch('setCustomLogos', logo)
        this.tabIndex = this.customLogos.length - 1
        this.$store.dispatch('setLogoTab', this.tabIndex)
      }
    }
  }

  public async changeSide(index: number, event:string) {
    await this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.customLogos)), action: 'customLogos' })
    if(event === 'front'){
      event = 'back'
    }else{
      event = 'front'
    }
    const payload = {
      index: index,
      attribute: 'side',
      value: event
    }
    await this.$store.dispatch('updateCustomLogoAttribute', payload)
  }
  public async addTab() {
    let new_tab_index = this.customLogos.length;
    let logo = setLogoSettings(new_tab_index);
    logo.adding_tab = true
    const payload = {
      custom_logo: logo
    }
    await this.$store.dispatch('setCustomLogos', payload)
    this.tabIndex = this.customLogos.length - 1
  }
}
</script>

<style lang="scss" scoped>
.logo-uploader-main{
  @media (max-width: 600px) {
    display: flex;
  }
}
</style>
