<template>
  <div >
  <div class="customization-text-area" v-for="(customText, index) in customTexts" :key="index">
    <div class="px-3 pt-3 p-lg-4">
      <h2 class="fw-bold mb-2 fz-18">Player {{ customText.type | capitalize }}</h2>
      <b-form>
        <!-- <h4 class="mt-1 mt-lg-3 mb-2 fz-16">Player {{ customText.type | capitalize }}</h4> -->
        <b-form-input
          class="mb-2 mr-sm-2 mb-sm- 0"
          placeholder="Type Here"
          v-model="customText.text"
        ></b-form-input>
        <h4 class="mt-3 mb-2 fz-16">Font Type</h4>
        <div class="font-type-area">
          <div class="type-block">
            <b-form-select v-model="customText.fontFamily" :options="fontOptions"></b-form-select>
          </div>
          <div class="arc-block">
            <b-form-select v-model="customText.side" :options="['front', 'back']"></b-form-select>
          </div>
        </div>
      </b-form>
      <h4 class="mt-3 mb-2 fz-16">Select Color</h4>
      <div class="text-color-holder" :class="{ active: customText.selectColor }">
        <a @click="showColor('fill', index)">
          <div class="text-color-box">
            <div class="color-circle"
                 :style="{ background : customText.fillColor? customText.fillColor : ' url(' + colorImage + ') no-repeat 50% 50% / 12px' }"></div>
            <strong>Fill Color</strong>
          </div>
        </a>
        <a @click="showColor('outline', index)">
          <div class="text-color-box">
            <div class="color-circle"
                 :style="{ background : customText.outLineColor? customText.outLineColor : ' url(' + colorImage + ') no-repeat 50% 50% / 12px' }"></div>
            <strong>Outline Color</strong>
          </div>
        </a>
        <div class="color-holder">
          <b-nav class="d-flex flex-wrap justify-content-between align-items-center">
              <b-nav-item>NHL</b-nav-item>
              <b-nav-item>Baseball</b-nav-item>
              <b-nav-item>Soccer</b-nav-item>
              <b-nav-item>Locker Room</b-nav-item>
              <b-nav-item>Other</b-nav-item>
          </b-nav>
          <div class="color-container">
            <div v-for="color in fontsColors" @click="setColor(color.value)" class="color-box" :title="color.name"
                 :style="{background: color.value}"
                 :key="color.position">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="px-3 pt-3 p-lg-4 text-right">
    <b-button class="add-logo-btn"  @click="addTab(customTexts.length)">
      +
    </b-button>
  </div>
  </div>

</template>

<script lang="ts">

import {Component, Prop, Watch, Vue} from 'vue-property-decorator'


@Component<CustomizationText>({
  
  mounted() {
    this.fontsList()
    this.customTextInit()
  },
  filters: {
    capitalize: (value: string) => {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  }
})
export default class CustomizationText extends Vue {
  @Prop({required: true}) productFonts!: any
  @Prop({required: true}) fontsColors!: any
  public selected = null
  public fontOptions: Record<any, any>[] = []
  private apiBaseUrl = process.env.VUE_APP_API_BASE_URL
  public colorImage = '/img/images/color-placeholder.png'
  public fontColorType!: string
  public fontColorIndex!: number

  get productNames() {
    return this.$store.getters.getSelectedProduct.productnames;
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts
  }

  @Watch('productNames', {
    immediate: true
  })
  productNamesChanged() {
    this.customTextInit()
  }

  public customTextInit(){
    this.productNames.forEach((productName: Record<any, any>, index: number) => {
      if(this.customTexts[index] && !this.customTexts[index].action){
        let text = {
          text: this.customTexts[index].text,
          type: productName.type,
          width: productName.width,
          height: productName.height,
          x_axis: productName.x_axis,
          y_axis: productName.y_axis,
          rotation: productName.rotation,
          haveControls: Boolean(productName.is_locked),
          side: productName.side,
          fontFamily: this.customTexts[index].fontFamily,
          fillColor: this.customTexts[index].fillColor,
          outlineColor: this.customTexts[index].outlineColor,
          selectColor: false
        }
        this.$store.dispatch('setCustomTexts', {index: index, text: text})
      }else if(!this.customTexts[index]){
        let text = {
          text: '',
          type: productName.type,
          width: productName.width,
          height: productName.height,
          x_axis: productName.x_axis,
          y_axis: productName.y_axis,
          rotation: productName.rotation,
          haveControls: Boolean(productName.is_locked),
          side: productName.side,
          fontFamily: '',
          fillColor: '',
          outlineColor: '',
          selectColor: false
        }
        this.$store.dispatch('setCustomTexts', {index: index, text: text})
      }
    })
  }

  public fontsList() {
    this.productFonts.forEach((fonts: any, key: number) => {
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
      headElement.innerHTML += "<style type='text/css'> @font-face{font-family: "+ font.value + "; src: url('" + fontUrl + "')}</style>";
    })
  }

  public showColor(fontColorType: any, fontColorIndex: number) {
    this.fontColorType = fontColorType
    this.fontColorIndex = fontColorIndex
    this.customTexts.forEach((customText: Record<any, any>, index: number) => {
      if(index == fontColorIndex) {
        this.$store.dispatch('updateCustomTextAttribute', {index: index, attribute: 'selectColor', value: true})
      } else {
        this.$store.dispatch('updateCustomTextAttribute', {index: index, attribute: 'selectColor', value: false})
      }
    })
  }

  public setColor(color: string) {
    if (this.fontColorType == 'fill') {
      this.$store.dispatch('updateCustomTextAttribute', {index: this.fontColorIndex, attribute: 'fillColor', value: color})
    } else {
      this.$store.dispatch('updateCustomTextAttribute', {index: this.fontColorIndex, attribute: 'outLineColor', value: color})
    }
    this.$store.dispatch('updateCustomTextAttribute', {index: this.fontColorIndex, attribute: 'selectColor', value: false})
  }

  public addTab(index: number){
    let text = {
      text: '',
      type: 'name',
      width: 100,
      height: 50,
      x_axis: 150,
      y_axis: 150,
      rotation: 0,
      haveControls: true,
      side: 'back',
      fontFamily: this.fontOptions[0]? this.fontOptions[0].value: '',
      fillColor: '',
      outlineColor: '',
    }

    this.$store.dispatch('setCustomTexts', { index: this.customTexts.length, text: text })
  }

}
</script>
