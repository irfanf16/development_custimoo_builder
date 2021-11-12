<template>
  <div>
    <div class="customize_controls" v-if="this.$store.getters.getActiveTab === 0" >
      <span class="close" @click="hideAll"><BIconX /></span>
      <span class="dragControl" @dblclick="setMinMax(0)" v-touch:start="setPlayersDataHeight(0)" v-touch-options="{touchClass: 'active'}" v-touch:moving="resizeTab(0)"></span>

      <div>
        logo editors
      </div>
    </div>
    <div class="customize_controls pt-4" v-if="this.$store.getters.getActiveTab === 1" >
      <span class="close" @click="hideAll"><BIconX /></span>
      <span class="dragControl" @dblclick="setMinMax(0)" v-touch:start="setPlayersDataHeight(0)" v-touch-options="{touchClass: 'active'}" v-touch:moving="resizeTab(0)"></span>

      <div class="grid gap-1 text-left">
<!--        <div class="mobile_controls">-->
<!--          <label>Color C</label>-->
<!--        </div>-->
<!--        <div class="mobile_controls">-->
<!--          <label>Apply to</label>-->
<!--        </div>-->

        <div class="overflow-hidden fade-right">
          <ul class="mobile-nav horizontal active_underline hide-scroll pr-4">
            <li v-for="(svgColor, index) in svgGroups" :key="index">
              <a style="text-transform: capitalize" :class="activePart == index ? 'active_line' : ''" @click="setActivePart(index)">{{ svgColor.id }}</a>
            </li>
          </ul>
        </div>
        <div class="d-flex align-items-center">
          <div style="color: #666;">Selected color:</div>
          <div class="d-flex align-items-center">
            <span class="selected-color ml-2 flex-shrink-0" :style="{background: svgGroups[activePart].color}"></span>
            <div class="m-1 text-muted">
              <span>{{ svgGroups[activePart].pantone }}</span>
              <span style="text-transform: uppercase" class="ml-1">{{ svgGroups[activePart].name }}</span>
            </div>
          </div>
        </div>
        <div class="overflow-hidden fade-right">
<!--          <color-picker @changeColor="changeColor" theme="light" :color="svgElement.color" :sucker-hide="true" />-->
          <ul class="mobile-nav horizontal active_underline hide-scroll pr-4">
            <li v-for="(colorName, index) in productColors" :key="index">
              <a class="faded_text text-capitalize" :class="activeCollection == index ? 'active_dark' : ''" @click="setActiveCollection(index)">{{colorName.name}}</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-2 overflow-auto hide-scroll d-flex gap-1" style="padding:6px">
        <div class="color_circle" :key="index" v-for="(color, index) in (typeof productColors[activeCollection].color_text === 'string' ? JSON.parse(productColors[activeCollection].color_text) : productColors[activeCollection].color_text)" :style="{background: color.value, boxShadow: `0 0 0 3px white, 0 0 0 4px ${color.value}`}" @click="setColor(color)"></div>
      </div>
    </div>
    <div class="customize_controls pt-4" v-if="this.$store.getters.getActiveTab === 2" >
      <span class="close" @click="hideAll"><BIconX /></span>
      <span class="dragControl" @dblclick="setMinMax(1)" v-touch:start="setPlayersDataHeight(1)" v-touch-options="{touchClass: 'active'}" v-touch:moving="resizeTab(1)"></span>

      <TextCustomization
        :productFonts="selectedProduct.namefonts" :selectedProductID="selectedProduct.id"
        :fontsColors="fontsColors" :firstColor="firstColor" :secondColor="secondColor" :fontOptions="fontOptions" />
    </div>
    <div class="customize_controls pt-4" v-if="this.$store.getters.getActiveTab === 3" >
      <span class="close" @click="hideAll"><BIconX /></span>
      <span class="dragControl" @dblclick="setMinMax(2)" v-touch:start="setPlayersDataHeight(2)" v-touch-options="{touchClass: 'active'}" v-touch:moving="resizeTab(2)"></span>

      <Collars :productModels="productModels"/>
    </div>
    <div class="customize_controls players-data pt-4" :class="{'setMax': !playersDataHeight}" v-if="this.$store.getters.getActiveTab === 4">
      <span class="close" @click="hideAll"><BIconX /></span>
      <span class="dragControl" @dblclick="setMinMax(3)" v-touch:start="setPlayersDataHeight(3)" v-touch-options="{touchClass: 'active'}" v-touch:moving="resizeTab(3)"></span>

      <div class="d-flex flex-column h-100">
        <div class="d-flex align-items-center justify-content-between fs-2 font-weight-bold">
<!--          <span>Team Players</span>-->
          <span class="addPlayer"><span class="fs-2 icon position-absolute"><BIconCloudUpload /></span> <span class="d-inline-block ml-1">Upload / Download Roster</span></span>
          <span class="addPlayer"><span class="fs-2 icon position-absolute"><BIconShare /></span> <span class="d-inline-block ml-1">Share Link</span></span>
        </div>
        <div class="players-table mt-2 hide-scroll h-100">
          <table class="table table-bordered">
            <tbody>
            <tr v-for="item in 9" :key="item">
              <td style="width: 10%; text-align: center" :class="{'activeEye': activeEye == item}" @click="setActiveEye(item)"><BIconEye /></td>
              <td style="width: 50%">Gulzar</td>
              <td style="width: 10%; text-align: center">11</td>
              <td style="width: 10%; text-align: center">xl</td>
              <td style="width: 10%; text-align: center">{{ item }}</td>
              <td class="fs-2" style="width: 10%; word-spacing: 10px; text-align: center; color: #fff; background: rgba(250,0,0,0.7)"><BIconX /></td>
            </tr>
            </tbody>
          </table>
          <div class="text-right mt-2">
            <button class="btn btn-secondary light rounded-circle p-0 fs-4 d-inline-flex align-items-center justify-content-center" style="height: 35px; width: 35px">
              <BIconPlus />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
// import ColorAccordion from '@/components/ColorAccordion.vue'
// import LogoPlacementTabs from './LogoPlacementTabs.vue'
// import CustomizationText from '@/components/CustomizationText.vue'
// import CollarStyle from '@/components/CollarStyle.vue'
// import EditRosterArea from '@/components/EditRosterArea.vue'
// import UploadLogo from '@/components/UploadLogo.vue'
// import ColorTabs from '@/components/ColorTabs.vue'
import {default as $} from 'jquery';
import TextCustomization from "@/components/mobile/TextCustomization.vue";
import Collars from "@/components/mobile/Collars.vue";

@Component<CustomTabs>({
  components: {
    TextCustomization,
    Collars
    // ColorAccordion,
    // LogoPlacementTabs,
    // CustomizationText,
    // CollarStyle,
    // EditRosterArea,
    // ColorTabs,
    // UploadLogo
  },
  mounted() {
    // this.$store.dispatch('setCustomLogos')
    this.productColorsManipulation()
    this.fontsColorsManipulation()
    this.fontsList()
    this.customTextInit()
   console.log('customTexts', this.selectedProduct)
  },
})

export default class CustomTabs extends Vue {
  @Prop() activeTab!: number
  private activePart = 0;
  private activeCollection = 0;
  private activeFont = 0;
  private activeEye = -1;
  private playersDataHeight = 0;
  public productColors: any[] = []
  public fontsColors: any[] = []
  public firstColor!: Record<any, any>
  public secondColor!: Record<any, any>
  public fontOptions: Record<any, any>[] = []
  // private tabTop = window.screen.availHeight - 190;

  private setPlayersDataHeight = (idx: number) => {
    return (e:Record<any, any>) => {
      let element = document.querySelectorAll('.customize_controls') as Record<any, any>;
    }
  }

  private setMinMax = (idx: number) => {
    let element = document.querySelector('.customize_controls') as Record<any, any>;

    if(element.clientHeight <= (window.screen.availHeight/2)){
      element.style.top = 15 + 'px';
      element.classList.remove('setMax')
    }else{
      element.style.top = 'auto';
      element.classList.add('setMax')
    }
  }

  public setColor(color: Record<any, any>) {
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.groupColors)), action: 'groupColor' })
    this.$store.dispatch('updateGroupColors',
      {
        index: this.svgGroups[this.activePart].id,
        color: color.value,
        pantone: color.pantone,
        name: color.name
      })
  }

  private resizeTab(idx: number){
    return (e:Record<any, any>) => {
      let cursorPosition = e.changedTouches[0].clientY;
      if(cursorPosition <= 15){
        cursorPosition = 15
      }else if(cursorPosition >= window.screen.availHeight - 190){
        cursorPosition = window.screen.availHeight - 190
      }
      this.playersDataHeight = cursorPosition;
      // if (cursorPosition < this.oldCursor) {
      //   this.direction = "up"
      // } else if (cursorPosition > this.oldCursor) {
      //   this.direction = "down"
      // }
      // this.tabTop = cursorPosition;
      let element = document.querySelector('.customize_controls') as Record<any, any>;
      element.style.top = cursorPosition + 'px';
    }
  }

  private setActivePart(index:number){
    this.activePart = index;
  }
  private setActiveCollection(index:number){
    this.activeCollection = index;
  }
  private setActiveFont(index:number){
    this.activeFont = index;
  }

  private setActiveEye(index:number){
    if (this.activeEye == index){
      this.activeEye = -1
    }else{
      this.activeEye = index;
    }
  }

  private selected = null
  private options = [
    { value: null, text: 'Please select an option' },
    { value: 'a', text: 'This is First option' },
    { value: 'b', text: 'Selected Option' },
    { value: { C: '3PO' }, text: 'This is an option with object value' },
    { value: 'd', text: 'This one is disabled', disabled: true }
  ]

  private hideAll(){
    this.$store.dispatch('setActiveTab', -1);
    $(".sideNav li a").removeClass('active')
  }

  get svgGroups() {
    return this.$store.getters.getSvgGroups
  }
  get groupColors(){
    return this.$store.getters.getGroupColors
  }
  // public showColor(index: number) {
  //   this.selectAccordionIndex = index
  // }

  @Watch('lockerColors', {
    deep: false
  })

  lockerColorsChanged() {
    this.productColorsManipulation()
  }

  public productColorsManipulation() {
    this.productColors = []
    this.selectedProduct.colors.forEach((colors: any, key: number) => {
      let finalColor = {color_text: [], selectedColor: "", name: colors.file_name.substr(0, colors.file_name.indexOf('.'))}
      finalColor.color_text = JSON.parse(colors.color_text)
      this.productColors = this.productColors.concat(finalColor)
    })
    this.productColors = this.productColors.concat(this.lockerColors)

    if(this.logoColors.length){
      let logoColorsNew: any[] = []
      this.logoColors.forEach((color: any, index: number) => {
        logoColorsNew = logoColorsNew.concat([{name: color.pantone, value: color.hex, position: index+1}])
      })
      let teamLogoColors = [{name: 'Team Logo Colors', color_text: logoColorsNew, selectedColor: ''}]
      this.productColors = this.productColors.concat(teamLogoColors)
    }
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

  // public showLoader = false
  // @Prop({required: false, default:0}) tabIndexNew!: number
  // @Prop({required: false, default:0}) activeTab!: number
  // public fontOptions: Record<any, any>[] = []
  //
  // get manageComponents(): Record<any, any> {
  //   return this.$store.getters.getManageComponents
  // }
  //
  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }
  //
  get productModels(): Record<any, any> {
    return this.$store.getters.getProductModels;
  }
  //
  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts
  }
  //
  get productNames() {
    return this.$store.getters.getSelectedProduct.productnames;
  }
  //
  get logoColors(): [] {
    return this.$store.getters.getLogosColors
  }
  //
  // public tabIndex = 0
  //
  // public productColors: any[] = []
  // public fontsColors: any[] = []
  // public firstColor!: Record<any, any>
  // public secondColor!: Record<any, any>
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  //
  // get hideTab(): Record<any, any> {
  //   return this.$store.getters.getHideTab
  // }
  get lockerColors(){
    return this.$store.getters.getLockerColors
  }
  //
  // @Watch('tabIndexNew', {
  //   immediate: true, deep: true
  // })
  //
  // tabIndexNewChanged() {
  //   this.tabIndex = this.tabIndexNew
  // }
  //
  // @Watch('tabIndex', {
  //   immediate: true, deep: true
  // })
  //
  // tabIndexChanged() {
  //   this.$emit('tabIndexChange', this.tabIndex)
  // }
  //
  // @Watch('selectedProduct', {
  //   deep: false
  // })
  //
  // selectedProductChanged() {
  //   this.productColorsManipulation()
  // }
  //
  // @Watch('lockerColors', {
  //   deep: false
  // })
  //
  // lockerColorsChanged() {
  //   this.productColorsManipulation()
  // }
  //
  // public productColorsManipulation() {
  //   this.productColors = []
  //   this.selectedProduct.colors.forEach((colors: any, key: number) => {
  //     let finalColor = {color_text: [], selectedColor: "", name: colors.file_name.substr(0, colors.file_name.indexOf('.'))}
  //     finalColor.color_text = JSON.parse(colors.color_text)
  //     this.productColors = this.productColors.concat(finalColor)
  //   })
  //   this.productColors = this.productColors.concat(this.lockerColors)
  //
  //   if(this.logoColors.length){
  //     let logoColorsNew: any[] = []
  //     this.logoColors.forEach((color: any, index: number) => {
  //       logoColorsNew = logoColorsNew.concat([{name: color.pantone, value: color.hex, position: index+1}])
  //     })
  //     let teamLogoColors = [{name: 'Team Logo Colors', color_text: logoColorsNew, selectedColor: ''}]
  //     this.productColors = this.productColors.concat(teamLogoColors)
  //   }
  // }
  //
  // public fontsColorsManipulation() {
  //   this.selectedProduct.namecolors.forEach((colors: any, key: number) => {
  //     let finalColor = {color_text: []}
  //     finalColor.color_text = JSON.parse(colors.color_text)
  //     this.fontsColors = this.fontsColors.concat(finalColor)
  //   })
  //   if (this.fontsColors.length) {
  //     this.firstColor = this.fontsColors[0].color_text[0]
  //     this.secondColor = this.fontsColors[0].color_text? this.fontsColors[0].color_text[1] : this.fontsColors[0].color_text[0]
  //   }
  // }
  //
  // public async getModels() {
  //   await this.$store.dispatch("getModels", this.selectedProduct.product_id);
  // }
  //
  // public setHideTab(index: string, value: boolean) {
  //   this.$store.dispatch('setHideTab', {index: index, value: value})
  // }
  //
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
          outLineWidth: this.customTexts[index].outLineWidth ? this.customTexts[index].outLineWidth : 0,
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
      let fontUrl = this.storageUrl + fonts.file_url
      const headElement = document.querySelector('head') as Record<any, any>
      let style_tag = document.createElement('style')
      style_tag.innerHTML = "@font-face{font-family: " + font.value + "; src: url('" + fontUrl + "')}"
      headElement.appendChild(style_tag)
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
.loader{
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  background: rgba(255,255,255,1);
  z-index: 1030;
  img{
    max-width: 7%;
    display: block;
    margin: 0 auto;
    height: auto;
  }
}

.read_more{
  transform: rotate(0deg); transition: 0.2s all ease; display: inline-block;
}

.fontList{
  div{
    color: #999;

    &.activeFont{
      color: #121212;
      font-weight: bold;
    }
  }
}

.activeEye{
  background: #189076;
  color: #fff;
}

.dragControl{
  position: absolute;
  height: 10px;
  width: 100px;
  top: 7px;
  left: 0;
  right: 0;
  margin: 0 auto;
  background: #dbdbdb;
  border-radius: 10px;
  box-shadow: 1px 1px 0 0px #ccc, inset 0 0 3px 1px #eee;
}
.dragControl.active{
  background: lightblue;
  box-shadow: 1px 1px 0 0px #ccc, inset 0 0 3px 1px aliceblue;
}
.selected-color{
  height: 15px;
  width: 15px;
  border-radius: 10000px;
  background: transparent;
  display: inline-block;
  box-shadow: 0px 1px 5px rgba(0,0,0,0.4);
}
</style>
