<template>
  <div class="customization-text-area">
    <div class="px-3 pt-3 p-lg-4">
      <h2 class="fw-bold mb-2 fz-18">Player {{ customTexts[customTextIndex].type | capitalize }}</h2>
      <b-form>
        <!-- <h4 class="mt-1 mt-lg-3 mb-2 fz-16">Player {{ customText.type | capitalize }}</h4> -->
        <b-form-input
          class="mb-2 mr-sm-2 mb-sm- 0"
          placeholder="Type Here"
          v-model="customTexts[customTextIndex].text"
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
      </b-form>
      <h4 class="mt-3 mb-2 fz-16">Select Color</h4>
      <div class="text-color-holder" :class="{ active: customTexts[customTextIndex].selectColor }">
        <a @click="showColor('fill', customTextIndex)">
          <div class="text-color-box">
            <div class="color-circle"
                 :style="{ background : customTexts[customTextIndex].fillColor? customTexts[customTextIndex].fillColor : ' url(' + colorImage + ') no-repeat 50% 50% / 12px' }"></div>
            <strong>Fill Color</strong>
          </div>
        </a>
        <a @click="showColor('outline', customTextIndex)" v-if="customTexts[customTextIndex].outlineEnabled">
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
                <div class="color-box" v-for="(color, index) in fontColor" @click="setColor(color.value)"
                     :title="color.name" :style="{background: color.value}" :key="index"></div>
              </div>
            </div>
          </b-card-body>
        </div>
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
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  }
})
export default class CustomizationText extends Vue {
  @Prop({required: true}) productFonts!: any
  @Prop({required: true}) fontsColors!: any
  @Prop({required: true}) customTextIndex!: any
  @Prop({required: true}) fontOptions!: any
  public selectedFont = null
  private apiBaseUrl = process.env.VUE_APP_API_BASE_URL
  public colorImage = '/img/images/color-placeholder.png'
  public fontColorType!: string
  public fontColorIndex!: number
  public selectTypeIndex = 0
  public fontColor: any[] = []

  get productNames() {
    return this.$store.getters.getSelectedProduct.productnames;
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts
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

  public selectType(index: number) {
    this.selectTypeIndex = index
    this.fontColor = this.fontsColors[this.selectTypeIndex].color_text
  }

}
</script>
