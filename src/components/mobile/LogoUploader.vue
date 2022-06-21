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
<!--        <template #title>-->
<!--          {{ customText.side ? customText.side : 'text' | capitalize}} {{ customText.type | capitalize }}-->
<!--        </template>-->

<!--        <div v-if="productColors[activeCollection]" class="mt-2 overflow-auto hide-scroll d-flex gap-1" style="padding:6px">-->
<!--          <div class="color_circle" :key="index" v-for="(color, index) in productColors[activeCollection].color_text" :style="{background: color.value, boxShadow: `0 0 0 3px white, 0 0 0 4px ${color.value}`}" @click="setColor(color)"></div>-->
<!--        </div>-->

        <div class="logo-uploader-main">
          <div class="tabs-logo-container">
            <div class="logo-placement-area mb-3 mb-lg-4 pt-0">
              <div class="logo-placement-holder mb-lg-3" :class="logo_tab.url ? 'hasLogo': 'noLogo'">
                <div class="logo-holder">
                  <UploadLogo v-if="!mobileScreen" :customLogoIndex="ltIdx" :showImage="true" :showActions="true"
                              :ref="'logoUploadModalOpener'+ltIdx" :key="'top'+ltIdx">
                    <span slot="upload_text">Click to upload logo or drag a file here</span>
                  </UploadLogo>
                  <UploadLogoMobile v-else :customLogoIndex="ltIdx" :showImage="true" :showActions="true"
                                    :ref="'logoUploadModalOpener'+ltIdx" :key="'top'+ltIdx">
                    <span slot="upload_text">Click to upload logo or drag a file here</span>
                  </UploadLogoMobile>
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
              <div class="color-holder">
                <div class="color-container">
                  <div class="color-box" v-for="(imageColor, icIdx) in imageColors"
                       @click="selectLogoColor(icIdx, imageColor)" :title="imageColor.name"
                       :class="{'active-swatch' : icIdx==selectedSwatchIndex, 'noColor': !imageColor.hex}"
                       :style="{background: imageColor.hex ? imageColor.hex : '#fff'}" :key="icIdx">
                    <template v-if="imageColor.hex">
                          <span class="removeColor" @click="deleteLogoColor(icIdx)">
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

                  <div v-if="showLogoColors" class="mobile-other">
                    <span class="close" @click="hideOther"><BIconX /></span>
                    <h2>Choose a color</h2>
                    <LogoColorTabs @setSwatchColor="setSwatchColor"
                                   :swatchPantone="defSwatchPantone"
                                   :swatchcolor="defSwatchColor"
                                   :productColors="productColors"
                                   :showSVGS="Boolean(showSVGs)" :defSwatchColor.sync="defSwatchColor"
                    />
                  </div>

                  <div v-if="showRecentLogos" class="mobile-other recent-logos-mobile">
                    <span class="close" @click="hideRecentLogosHandler"><BIconX /></span>
                    <div>
                      <RecentLogos :logosSetting="logosSetting" :customLogoIndex="ltIdx"/>
                    </div>
                  </div>
                </div>
              </div>
              <div class="d-flex align-items-center justify-content-center gap-1">
                <b-button @click="useLogoColors()" class="use-btn flex-shrink-1" style="white-space: nowrap; max-width: 200px" v-if="imageColors.length > 1">
                  <template v-if="usingColorLogos"> Original Colors</template>
                  <template v-else> Logo Colors</template>
                </b-button>
                <b-button class="use-btn flex-shrink-1" @click="shuffleLogoColors($event)" :class="!(usingColorLogos && imageColors.length > 1) ? 'invisible': 'pulse-animation'"
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
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {getCustomLogos, setLogoSettings} from "@/helpers/Helpers";
import UploadLogo from "@/components/UploadLogo.vue"
import UploadLogoMobile from "@/components/UploadLogoMobile.vue"
import SaveLogoModal from "@/components/SaveLogoModal.vue"
import SaveColorModal from "@/components/SaveColorModal.vue"
import LogoColorTabs from "@/components/LogoColorTabs.vue"
import RecentLogos from "@/components/RecentLogos.vue";

@Component<LogoUploader>({
  components: {
    RecentLogos,
    UploadLogo,
    UploadLogoMobile,
    SaveLogoModal,
    SaveColorModal,
    LogoColorTabs
  },
  mounted() {
    console.log('ready', this.logoColorUsed)
  }
})

export default class LogoUploader extends Vue {
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
  public showRecentLogos = false

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
  get customLogos(): [Record<any, any>] {
    //return this.$store.getters.getCustomLogos()
    return  getCustomLogos(true, true);
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
  get logoColors(): [] {
    return this.$store.getters.getLogosColors
  }
  get getRecentLogos() {
    return this.$store.getters.getRecentLogos
  }

  public getColors() {

    this.productColors = []
    this.selectedProduct.colors.forEach((colors: any, key: number) => {
      let finalColor = {color_text: [], selectedColor: "", name: colors.file_name.substr(0, colors.file_name.indexOf('.'))}
      finalColor.color_text = JSON.parse(colors.json_data)
      this.productColors = this.productColors.concat(finalColor)
    })
    this.productColors = this.productColors.concat(this.lockerColors)

  }

  public setSwatchColor(color: Record<any, any>) {
    let payload = {color_info : color , index : this.selectedSwatchIndex}
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.defaultColors)), action: 'defaultColor' })
    this.$store.dispatch('setDefaultColor', { index: this.selectedSwatchIndex, color: color.hex, pantone: color.pantone, name: color.name })
    this.$store.commit('SET_LOGO_COLOR', payload)
  }

  public deleteLogoColor(index: number) {
    this.imageColors[index].hex = null
    this.imageColors[index].name = null
    this.imageColors[index].pantone = null
  }

  useLogoColors() {
    if(this.usingColorLogos) {
      /*this.$store.commit('SET_LOGO_COLORS', [])*/
      for (let i = 0; i < 4; i++) {
        this.$store.dispatch('setDefaultColor', { index: i, color: '', pantone: '', name: '' })
      }
    } else {
      if (this.imageColors.length ==0 && this.initialExtractedColors.length){
        this.$store.commit('SET_LOGO_COLORS', this.initialExtractedColors)
      }
      this.$store.dispatch('setGroupColors', {})
      this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.defaultColors)), action: 'defaultColor' })
      for (let i = 0; i < 4; i++) {
        if(this.imageColors[i]) {
          this.$store.dispatch('setDefaultColor', { index: i, color: this.imageColors[i].hex, pantone: this.imageColors[i].pantone, name: this.imageColors[i].name})
        } else {
          this.$store.dispatch('setDefaultColor', { index: i, color: '', pantone: '', name: '' })
        }
      }
    }
    this.$store.commit("UPDATE_USING_COLOR_LOGOS", !this.usingColorLogos);

  }


  shuffleLogoColors(e:Record<any, any>) {
    e.currentTarget.classList.remove('pulse-animation')
    if(this.imageColors && this.imageColors.length > 1) {
      this.previousImageColors = JSON.parse(JSON.stringify(this.imageColors))
      /*.filter((imageColor: Record<any, any>, icIdx) => {
      return imageColor.hex
    })*/;
      /*  let empty_logo_indexes: any = [];*/
      let imageColors = JSON.parse(JSON.stringify(this.imageColors))
      /*.filter((imageColor: Record<any, any>, icIdx) => {
      if(imageColor.hex == null) {
        empty_logo_indexes.push(icIdx);
      }
      return imageColor.hex
    })*/

      let shuffle = (previousValue: Record<any, any>, currentValue: Record<any, any>, currentIndex: number, array: Record<any, any>[]) => {
        if (currentIndex !== 1) return previousValue;

        array.sort(() => Math.random() - 0.5)
        return array;
      }

      if (!this.checkColorOccurence(imageColors)){
        while (JSON.stringify(this.previousImageColors) == JSON.stringify(imageColors)) {
          imageColors.reduce(shuffle)
        }
      }
      /* empty_logo_indexes.forEach((emptyLogoIndex: number) => {
         imageColors[emptyLogoIndex] = {hex: null, pantone: null, name: null};
       });*/


      this.$store.dispatch("SET_LOGO_COLORS", imageColors);
      this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.defaultColors)), action: 'defaultColor' })
      imageColors.forEach((imageColor: Record<any, any>, index: number) => {
        this.$store.dispatch('setDefaultColor', {
          index: index,
          color: imageColor.hex,
          pantone: imageColor.pantone,
          name: imageColor.name
        })
      })
    }
  }
  public  checkColorOccurence(data:Record<any, any>){
    let x = 0
    let current = data[0].hex
    let matched = true
    for (x; x < data.length; x++){
      if (JSON.stringify(current) == JSON.stringify(data[x].hex)){
        current = data[x].hex
        matched = true
      }else{
        matched = false
        break
      }
    }
    return matched
  }

  public selectLogoColor(index: number, imageColor: Record<any, any>){
    if(index==this.selectedSwatchIndex) {
      this.showLogoColors = false;
      this.selectedSwatchIndex = -1;
      this.$emit('showOther', false);
    } else {
      this.selectedSwatchIndex = index
      this.defSwatchColor = imageColor.hex
      this.defSwatchPantone = imageColor.pantone
      this.getColors();
      this.showLogoColors = true
      this.$emit('showOther', true);
    }
  }

  public hideOther() {
    this.showLogoColors = false
    this.$emit('showOther', this.showLogoColors);
    this.selectedSwatchIndex = -1;
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
