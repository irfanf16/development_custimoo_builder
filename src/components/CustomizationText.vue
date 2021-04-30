<template>
  <div >
  <div class="customization-text-area" v-for="(productName, index) in productNames" :key="index">
    <div class="px-3 pt-3 p-lg-4">
      <h2 class="fw-bold mb-2 fz-18">Player Name</h2>
      <b-form>
        <h4 class="mt-1 mt-lg-3 mb-2 fz-16">Player Name</h4>
        <b-form-input
          :id="'form-input-'+index"
          class="mb-2 mr-sm-2 mb-sm- 0"
          placeholder="Type Here"
          v-model="customTextVal"
          @focus="getIndex(index)"
        ></b-form-input>
        <h4 class="mt-3 mb-2 fz-16">Font Type</h4>
        <div class="font-type-area">
          <div class="type-block">
            <b-form-select v-model="selected" :options="options" @change="applyFont(selected)"></b-form-select>
          </div>
          <div class="arc-block">
            <b-form-checkbox>Arc Text</b-form-checkbox>
          </div>
        </div>
      </b-form>
      <h4 class="mt-3 mb-2 fz-16">Select Color</h4>
      <div class="text-color-holder" :class="{ active: colorTextActive }">
        <a href="#." v-on:click="showColor('fill')">
          <div class="text-color-box">
            <div class="color-circle"
                 :style="{ background : fillColor? fillColor : ' url(' + colorImage + ') no-repeat 50% 50% / 20px' }"></div>
            <strong>Fill Color</strong>
          </div>
        </a>
        <a href="#." v-on:click="showColor('outline')">
          <div class="text-color-box">
            <div class="color-circle"
                 :style="{ background : outLineColor? outLineColor : ' url(' + colorImage + ') no-repeat 50% 50% / 20px' }"></div>
            <strong>Outline Color</strong>
          </div>
        </a>
        <div class="color-holder">
          <div class="color-container">
            <div v-for="color in fontsColors" @click="setColor(color.value)" class="color-box" :title="color.name"
                 :style="{background: color.value}"
                 :key="color.position"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
    <b-button class="add-logo-btn"  @click="addTab(customTexts.length)">
      +
    </b-button>
  </div>

</template>

<script lang="ts">

import {Component, Prop, Watch, Vue} from 'vue-property-decorator'

@Component<CustomizationText>({
  mounted() {
    this.fontsList()
    this.$store.dispatch('setCustomTexts')
    this.customTextInit()
  }
})
export default class CustomizationText extends Vue {
  @Prop({required: false, default: () => { return [{
      text: this.customTextVal,
      width: 100,
      height: 100,
      x_axis: 150,
      y_axis: 190,
      rotation: 0,
      haveControls: true,
      side: 'front'
    }]}}) productNames!: [Record<any, any>]
  @Prop({required: true}) productFonts!: any
  @Prop({required: true}) fontsColors!: any

  // value changed
  @Watch('customTextVal')
  onCustomTextValChanged (customTextVal:string|null): void {
    this.customTextVal = customTextVal
    let payload = {
      index: this.selectedIndex,
      attribute: 'text',
      value: this.customTextVal
    }
    this.$store.dispatch('updateCustomTextAttribute', payload)
  }

  public selected = null
  public options = [
    {value: null, text: 'Please Select'},
    {value: 'Arial', text: 'Arial'},
    {value: 'Times New Roman', text: 'Times New Roman'},
    {value: 'Helvetica', text: 'Helvetica'},
    {value: 'Times', text: 'Times'},
    {value: 'Courier New', text: 'Courier New'},
    {value: 'Verdana', text: 'Verdana'},
  ]
  public fontFaces: any[] = []
  private colorTextActive = false
  private apiBaseUrl: string = process.env.VUE_APP_API_BASE_URL
  public fillColor = ''
  public outLineColor = ''
  public fontColorType = ''
  public colorImage = '/img/images/color-placeholder.png'
  public customTextVal = 'Name'
  public selectedFont = 'Times New Roman'
  public selectedIndex: number

  get customTexts(): [] {
    return this.$store.getters.getCustomTexts
  }

  public getIndex(index: number){
    this.selectedIndex = index
  }

  public fontsList() {
    this.productFonts.forEach((fonts: any, key: number) => {
      let fontNameParam = fonts.file_url.split('/').reverse()
      fontNameParam = fontNameParam[0].split('.')
      let fontName = fontNameParam[0].replace('-', ' ').toUpperCase()
      let font = {
        value: fontNameParam[0],
        text: fontName
      }
      this.options = this.options.concat([font])
      let fontUrl = this.apiBaseUrl + '/' + fonts.file_url
      this.fontFaces = this.fontFaces.concat()
      let fontStyle = document.createElement('link')
      fontStyle.setAttribute('href', fontUrl)
      fontStyle.setAttribute('rel', 'stylesheet')
      document.head.appendChild(fontStyle)
    })
  }

  public showColor(type: any) {
    this.fontColorType = type
    this.colorTextActive = !this.colorTextActive
  }

  public setColor(color: any) {
    if (this.fontColorType == 'fill') {
      this.fillColor = color
    } else {
      this.outLineColor = color
    }
    this.colorTextActive = false
  }

  public applyFont(font){
    this.selectedFont = font
    let payload = {
      index: this.selectedIndex,
      attribute: 'fontFamily',
      value: this.selectedFont
    }
    this.$store.dispatch('updateCustomTextAttribute', payload)

  }

  public customTextInit(){
    if(this.productNames.length){
      let textSetting = this.productNames[0]
      let text = {
        text: this.customTextVal,
        width: textSetting.width,
        height: textSetting.height,
        x_axis: textSetting.x_axis,
        y_axis: textSetting.y_axis,
        rotation: textSetting.rotation,
        haveControls: Boolean(textSetting.is_locked),
        side: textSetting.side,
        fontFamily: this.selectedFont
      }
      this.$store.dispatch('setCustomTexts', text)
    }
  }

  public addTab(index: number){
    let textSetting: Record<any, any>
    textSetting = this.productname[index] as Record<any, any>

    let text = {
      text: this.customTextVal,
      width: textSetting.width,
      height: textSetting.height,
      x_axis: textSetting.x_axis,
      y_axis: textSetting.y_axis,
      rotation: textSetting.rotation as number,
      haveControls: Boolean(textSetting.is_locked),
      side: textSetting.side,
      fontFamily: this.selectedFont
    }
    this.tabIndex = this.tabIndex + 1;
    this.$store.dispatch('setCustomTexts', text)
  }

}
</script>
