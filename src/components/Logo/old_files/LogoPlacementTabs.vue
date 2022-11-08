<template>
  <div v-if="selectedProduct">
    <div class="d-flex align-items-center justify-content-between px-1 pt-1" :class="{'rotateArrow': !expandLogoButtons}">
      <b-button class="light ml-1" v-if="(selectedProduct.allowed_logos_count == 0 || customLogos.length < selectedProduct.allowed_logos_count)"
                :style="{visibility: expandLogoButtons ? 'visible':'hidden'}" @click="addTab">
        <BIconPlus />
      </b-button>

      <b-icon-chevron-down class="cursor-pointer" @click="()=>expandLogoButtons = !expandLogoButtons" style="font-size: larger; transition: 0.3s ease all;" />
    </div>

    <b-tabs :class="{'collapseButtons': expandLogoButtons}" ref="collapseButtons">
      <b-tab v-for="(logo_tab, ltIdx) in customLogos" :key="ltIdx" :active="tabIndex === ltIdx" @click="changeTab(ltIdx)">
        <template #title>
          <span>
            <span v-if="!logo_tab.url" class="warning">
              <b-icon-exclamation-triangle-fill />
            </span>
            <span>{{ ltIdx == 0 ? 'Team Logo' : 'logo ' + ltIdx }}</span>
            <template v-if="ltIdx > 0">
              <span class="remove-logo" @click="removeLogoTab(ltIdx)">
                <font-awesome-icon :icon="['fas', 'trash-alt']"/>
              </span>
            </template>
          </span>
        </template>

        <div class="tabs-logo-container">
            <div class="logo-placement-area mb-3 mb-lg-4 pt-2">
              <div class="logo-placement-holder mb-lg-3" :class="logo_tab.url ? 'hasLogo': 'noLogo'">
                <div class="logo-holder">
                  <UploadLogo :customLogoIndex="ltIdx" :showImage="true" :showActions="true"
                              :ref="'logoUploadModalOpener'+ltIdx" :key="'top'+ltIdx">
                    <span slot="upload_text">Click to upload logo or drag a file here</span>
                  </UploadLogo>
                </div>

                <div class="logo-placemet-content" v-if="logo_tab.url">
                  <h4>Logo Placement</h4>
                  <b-form-select @change="changeSide(ltIdx, $event)" :value="logo_tab.side"
                                 :options="options"></b-form-select>
                </div>
              </div>
            </div>
            <div class="logo-placement-area extracted-color-area" v-if="ltIdx ==0 && customLogos[0].url && selectedProduct.product_type == 'customized'">
              <h4 class="mb-2">Color Extracted from Logo</h4>
              <div class="mb-0">
                <div class="color-holder" style="margin-top: -10px; padding-top: 10px;">
                  <div class="color-container">
                    <div class="color-box" v-for="(imageColor, icIdx) in imageColors"
                         @click="selectLogoColor(icIdx, imageColor)" :title="imageColor.name == 'pantone' ? imageColor.pantone + ' ' + (imageColor.name[0].toUpperCase() + imageColor.name.slice(1)) : imageColor.name"
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

                    <div class="d-flex w-100 align-items-center justify-content-center gap-1">
                      <b-button @click="useLogoColors()" class="use-btn flex-shrink-1" :class="{'pulse-animation': !usingColorLogos && !isClicked}" style="white-space: nowrap; max-width: 200px" v-if="imageColors.length > 1">
                        <template v-if="usingColorLogos"> Use Original Colors</template>
                        <template v-else> Use Logo Colors</template>
                      </b-button>
                      <b-button class="use-btn flex-shrink-1" @click="shuffleLogoColors($event)" :class="{'invisible': !(imageColors.length > 1 && usingColorLogos), 'pulse-animation': isColorShuffled}"
                                variant="secondary">Shuffle
                      </b-button>
                      <b-button class="use-btn flex-shrink-1" style="width: auto" @click="rollbackPreviousColors()" :class="{'invisible': !(previousImageColors.length && usingColorLogos)}" variant="secondary">
                        <font-awesome-icon :icon="['fas', 'redo-alt']"/>
                      </b-button>
                    </div>

                    <LogoColorTabs v-if="showLogoColors" @setSwatchColor="setSwatchColor"
                                   :swatchPantone="defSwatchPantone"
                                   :swatchcolor="defSwatchColor"
                                   :productColors="productColors"
                                   :imageColor="imageColors[selectedSwatchIndex]"
                                   :showSVGS="Boolean(showSVGs)" :defSwatchColor.sync="defSwatchColor"
                    />
                  </div>
                </div>
              </div>
            </div>
        </div>
        <RecentLogos :logosSetting="logosSetting" :customLogoIndex="ltIdx"/>
      </b-tab>
      <template #tabs-end v-if="!expandLogoButtons">
        <b-button class="light ml-1" v-if="selectedProduct.allowed_logos_count == 0 || customLogos.length < selectedProduct.allowed_logos_count" @click="addTab">
          <BIconPlus />
        </b-button>
      </template>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import UploadLogo from "@/components/UploadLogo.vue"
import SaveLogoModal from "@/components/SaveLogoModal.vue"
import SaveColorModal from "@/components/SaveColorModal.vue"
import LogoColorTabs from "@/components/LogoColorTabs.vue"
import RecentLogos from "@/components/RecentLogos.vue";
import { setLogoSettings, getCustomLogos,} from "@/helpers/Helpers"


@Component<LogoPlacementTabs>({
  components: {
    RecentLogos,
    UploadLogo,
    SaveLogoModal,
    SaveColorModal,
    LogoColorTabs

  },
  async mounted() {

    this.$root.$on('changeLogoTabIndex', (index:number) => {
      // here you need to use the arrow function
      this.tabIndex = index;
    })
  },
  filters: {
    capitalize: (value: string) => {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    }
  },
})
export default class LogoPlacementTabs extends Vue {
  @Prop({required: true}) numberOfLogosAllowed!: number
  @Prop({required: true}) isColorShuffled!: boolean
  private isClicked = false
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

  public ref = this.$refs as Record<any, any>
  public numberOfLogos = 1
  public expandLogoButtons  = true

  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public selected = 'front'
  public tabIndex = 0
  public options = [
    {value: 'front', text: 'Front'},
    {value: 'back', text: 'Back'}
  ]
  public previousImageColors = []
  public logoColorUsed = false
  public allowed_logos = 1000
  public allowedLogosLimit = 1000
  public productColors: any[] = []
  public productPantones: any[] = []
  public showSVGs = false
  public showLogoColors = false
  public selectedSwatchIndex = -1
  public defSwatchColor = '#ffffff'
  public defSwatchPantone = '11-0601'




  get imageColors(): any[] {
    return this.$store.getters.getLogosColors
  }

  get customLogos(): [Record<any, any>] {
     return  getCustomLogos(true, true);
  }

  get manageComponents(): [] {
    return this.$store.getters.getManageComponents
  }
  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  get hideColorSection() {
    return this.$store.getters.getHideColorSection
  }
  get initialExtractedColors(){
    return this.$store.getters.getinitialExtractedColors
  }

  get defaultColors (): [Record<any, any>] {
    return this.$store.getters.getDefaultColors
  }

  get usingColorLogos (): [Record<any, any>] {
    return this.$store.getters.getUsingColorLogos
  }

  get activeLogoTabIndex (): number {
    return this.$store.getters.getActiveLogoIndex
  }

  public changeTab (index: number) {
    this.$store.dispatch('setLogoTab', index)
  }

  public async initFirstLogoTab (index: number) {
    if (this.$store.getters.getCustomLogos().length < 1) {
      if (this.numberOfLogos < this.allowedLogosLimit) {
        let logoSetting: Record<any, any>
        if (this.logosSetting[index]) {
          logoSetting = this.logosSetting[index] as Record<any, any>
        } else {
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
          id: null,
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

  public async addTab(index: number) {
    let nav = (this.$refs['collapseButtons'] as Record<any, any>).$refs['nav'];
    let new_tab_index = this.customLogos.length;
    let logo = setLogoSettings(new_tab_index);
    logo.adding_tab = true
    const payload = {
      custom_logo: logo
    }
    await this.$store.dispatch('setCustomLogos', payload)
    this.tabIndex = this.customLogos.length - 1
    setTimeout(()=>{
      nav.scrollTo(nav.scrollWidth, 0);
    }, 100)
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

  public deleteLogo(index: number) {
    let payload = {
      index: index
    }
    this.$store.dispatch('deleteCustomLogo', payload)
  }

  public async changeSide(index: number, event:string) {
    await this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.customLogos)), action: 'customLogos' })
    const payload = {
      index: index,
      attribute: 'side',
      value: event
    }
    await this.$store.dispatch('updateCustomLogoAttribute', payload)
  }

  async  useLogoColors() {
    this.isClicked = true
    this.logoColorUsed = true
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
    this.$emit('setColorShuffled', false)
    if(this.imageColors && this.imageColors.length > 1) {
      this.previousImageColors = JSON.parse(JSON.stringify(this.imageColors))
    /*  let empty_logo_indexes: any = [];*/
      let imageColors = JSON.parse(JSON.stringify(this.imageColors))

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

  public async rollbackPreviousColors () {
    this.initialExtractedColors.forEach((defaultColor: Record<any, any>, index: number) => {
      this.$store.dispatch('setDefaultColor', { index: index, color: defaultColor.hex, pantone: defaultColor.pantone })
    })
    let initial_colors = JSON.parse(JSON.stringify(this.initialExtractedColors));
    await this.$store.dispatch("SET_LOGO_COLORS", initial_colors);
    this.previousImageColors = []
  }

  public async callRooms(){
    if(this.isCustomerAuthenticated){
      await this.$store.dispatch('GET_LOCKER_PRODUCTS');
    }
  }

  public toggleLogoBackground(index: number){
    this.$store.dispatch('toggleLogoBackgroud', index)
  }

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }
  get lockerColors(){
    return this.$store.getters.getLockerColors
  }
  get logoColors(): [] {
    return this.$store.getters.getLogosColors
  }
  public getColors() {
    this.productColors = []
    this.selectedProduct.colors.forEach((colors: any, key: number) => {
      let finalColor = {color_text: [], selectedColor: "", name: colors.file_name.substr(0, colors.file_name.indexOf('.'))}
      finalColor.color_text = colors.json_data
      this.productColors = this.productColors.concat(finalColor)
    })
    //this.productColors = this.productColors.concat(this.lockerColors)
  }



  public selectLogoColor(index: number, imageColor: Record<any, any>){
    if(index==this.selectedSwatchIndex) {
      this.showLogoColors = false;
      this.selectedSwatchIndex = -1;
    } else {
      this.selectedSwatchIndex = index
      this.defSwatchColor = imageColor.hex
      this.defSwatchPantone = imageColor.pantone
      this.getColors();
      this.showLogoColors = true
    }
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

}
</script>

<style lang="scss" scoped>
.tabs-logo-container{
  @media only screen and (min-width: 992px){
    //padding: 0 0 150px;
    padding: 0 0 50px;
  }
  .upload-logo-opener{
    box-shadow: none;
    border-radius: 0;
    position: static;
    padding: 0;
    border-top: 1px solid #EFF2F4;
    margin: 20px -20px 0;
    padding: 15px 20px 0;
    @media only screen and (min-width: 992px){
      position: absolute;
      margin: 0;
      padding: 20px;
      background: #fff;
    }
    .logo-option-area{
      @media only screen and (max-width: 992px){display: none;}
    }
  }
  .logo-placement-area{
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    position: relative;
    .logo-placement-holder{
      flex: 0 0 67%;
      max-width: 67%;
      @media only screen and (min-width: 992px){
        flex: 0 0 100%;
        max-width: 100%;
      }
    }
    .btn{
      flex: 0 0 30%;
      max-width: 30%;
      font-size: 12px;
      padding: 0.50rem;
      @media only screen and (min-width: 992px){
        flex: 0 0 100%;
        max-width: 100%;
        font-size: 14px;
        padding: 0.50rem 0.75rem;
      }
      &.save-logo-btn{
        position: absolute;
        right: 0;
        top: 35px;
        @media only screen and (min-width: 992px){
          position: static;
        }
      }
    }
    &.extracted-color-area{
      .logo-placement-holder{
        @media only screen and (max-width: 992px){
          flex: 0 0 100%;
          max-width: 100%;
        }
      }
      .btn{
        flex: none;
        color: #03142E;
        &.use-btn{
          margin: 10px 0 0 0;
          border: none;
          color: #fff;
          font-size: 14px;
          max-width: 100%;
          width: 100%;
          @media only screen and (min-width: 1024px){
            font-size: 12px;
            max-width: 100%;
          }
          @media only screen and (min-width: 1367px){
            max-width: 100%;
          }
          &:focus{
            box-shadow: none;
          }
          &:hover{background: #219F84;}
        }
        &.reset{
          background: none;
          color: #03142E;
          border: none;
          padding: 0;
          width: auto;
        }
        &:focus{box-shadow: none;}
        &:hover{color: #fff;}
      }
      .btn-save-color{
        color: #fff;
        @media only screen and (max-width: 992px){
          flex: 0 0 100%;
          max-width: 100%;
          margin-top: 20px;
        }
        &:hover{color: #219F84;}
      }
    }
  }
}

.customization-tabs{
  .tabs-logo-container{
    padding-bottom: 0;
  }
}

.nav-tabs {
  .nav-item {
    .nav-link {
      .remove-logo {
        position: absolute;
        top: -5px;
        right: -10px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #F8E1E2;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        font-size: 10px;
        color: #D53943;
      }
    }
  }
}
.logo-option-area{
  display: block;
  width: 100%;
}

.rotateArrow {
  svg{
    transform: rotate(-180deg);
  }
}
</style>
