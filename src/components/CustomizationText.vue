<template>
  <div class="customization-text-area">
    <div class="px-3 pt-3 p-lg-4">
      <h2 class="fw-bold mb-2 fz-18">Player {{ customTexts[customTextIndex].type | capitalize }} {{ customTexts[customTextIndex].side }}</h2>
      <b-form-input
        @click="isHidden = !isHidden"
        class="mb-2 mr-sm-2 mb-sm-0"
        placeholder="Type Here"
        v-model="customTexts[customTextIndex].text"
        @input="updateTextField(customTextIndex,$event)"
      ></b-form-input>
      <h4 class="mt-3 mb-2 fz-16">Font Type</h4>
      <div class="font-type-area">
        <div class="type-block">
          <b-form-select v-model="customTexts[customTextIndex].fontFamily" :options="fontOptions" ></b-form-select>
        </div>
        <div class="arc-block">
          <b-form-select v-model="customTexts[customTextIndex].side" :options="['front', 'back']"></b-form-select>
        </div>
      </div>
      <h4 class="mt-3 mb-2 fz-16">Select Color</h4>
      <div class="text-color-holder" :class="{ active: customTexts[customTextIndex].selectColor }">
        <a @click="showColor('fill', customTextIndex)">
          <div class="text-color-box">
            <div class="color-circle"
                 :style="{ background : customTexts[customTextIndex].fillColor? customTexts[customTextIndex].fillColor : ' url(' + colorImage + ') no-repeat 50% 50% / 12px' }"></div>
            <strong>Fill Color</strong>
          </div>
        </a>
        <a @click="showColor('outline', customTextIndex)" v-if="customTexts[customTextIndex].outlineEnabled && outLineWidthValue > 0">
          <div class="text-color-box">
            <div class="color-circle"
                 :style="{ background : customTexts[customTextIndex].outLineColor? customTexts[customTextIndex].outLineColor : ' url(' + colorImage + ') no-repeat 50% 50% / 12px' }"></div>
            <strong>Outline Color</strong>
          </div>
        </a>
        <div class="color-holder">
          <b-card-body>
            <b-nav class="d-flex flex-wrap align-items-center">
              <b-nav-item class="mr-2" v-for="(colorType, index) in fontsColors" :key="index" @click="selectType(index)">{{ colorType.file_type }}</b-nav-item>
            </b-nav>
            <div class="color-holder">
              <div class="color-container">
                <div class="color-box" v-for="(color, index) in fontColor" @click="setColor(color)"
                     :title="color.name" :style="{background: color.value}" :key="index"></div>
              </div>
            </div>
          </b-card-body>
        </div>
      </div>
      <div class="outline-slider-area pt-4">
        <template v-if="customTexts[customTextIndex].outlineEnabled">
          <div>
            <label for="range-2 fz-16">Outline Width</label>
            <b-form-input class="mt-2" id="range-2" v-model="outLineWidthValue" @change="outLineWidthValueChanged" type="range" min="0" max="10" step="1"></b-form-input>
            <div class="mt-2">Outline Size: {{ outLineWidthValue }}px</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {Component, Prop, Watch, Vue} from 'vue-property-decorator'

@Component<CustomizationText>({
  mounted() {
    this.$nextTick(() => {
      this.selectType(this.selectTypeIndex)
    })
  },
  filters: {
    capitalize: (value: string) => {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    }
  }
})
export default class CustomizationText extends Vue {
  @Prop({required: true}) productFonts!: any
  @Prop({required: true}) fontsColors!: any
  @Prop({required: true}) customTextIndex!: any
  @Prop({required: true}) fontOptions!: any
  public selectedFont = null
  public colorImage = '/img/images/color-placeholder.png'
  public fontColorType!: string
  public fontColorIndex!: number
  public selectTypeIndex = 0
  public fontColor: any[] = []
  public outLineWidthValue = 0

  get productNames() {
    return this.$store.getters.getSelectedProduct.productnames;
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts
  }

  public showColor(fontColorType: any, fontColorIndex: number) {
    console.log('set Color call on show color')
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

  public setColor(color: Record<any, any>) {
    if (this.fontColorType == 'fill') {
      this.$store.dispatch('updateCustomTextAttribute', {index: this.fontColorIndex, attribute: 'fillColor', value: color.value})
      this.$store.dispatch('updateCustomTextAttribute', {index: this.fontColorIndex, attribute: 'fillColorPantone', value: color.name})
    } else {
      this.$store.dispatch('updateCustomTextAttribute', {index: this.fontColorIndex, attribute: 'outLineColor', value: color.value})
      this.$store.dispatch('updateCustomTextAttribute', {index: this.fontColorIndex, attribute: 'outLineColorPantone', value: color.name})
    }
    this.$store.dispatch('updateCustomTextAttribute', {index: this.fontColorIndex, attribute: 'selectColor', value: false})
  }

  public selectType(index: number) {
    this.selectTypeIndex = index
    this.fontColor = this.fontsColors[this.selectTypeIndex].color_text
  }

  outLineWidthValueChanged() {
    let payload = {index: this.customTextIndex, attribute: 'outLineWidth', value: this.outLineWidthValue}
    this.$store.commit('customTextAttribute', payload)
  }
  public isHidden= false

  updateTextField(index: number,value: any) {
    this.$store.dispatch('updateCustomTextAttribute', {index, attribute: 'text', value})
  }
}
</script>

<style lang="scss" scoped>
.outline-slider-area{
  #range-2{
    &::-webkit-slider-thumb{
      background: #189076;
    }
  }
}
</style>
