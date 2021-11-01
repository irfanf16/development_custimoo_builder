<template>
  <div>
    <b-tabs class="player_text">
      <b-tab v-for="(customText, customTextIndex) in customTexts" :key="customTextIndex">
        <template #title>
          Player {{ customTexts[customTextIndex].type | capitalize }} {{ customTexts[customTextIndex].side }}
        </template>
        <div class="grid mobile-cols-2 gap-1">
          <div class="mobile_controls">
            <label class="d-flex align-items-center justify-content-between"><span>{{ customTexts[customTextIndex].type | capitalize }} {{ customTexts[customTextIndex].side }}</span></label>
            <b-form-input
              @click="isHidden = !isHidden"
              class="mb-2 mr-sm-2 mb-sm-0"
              placeholder="Type Here"
              :value="customTexts[customTextIndex].text"
              @input="updateTextField(customTextIndex, $event)"
            ></b-form-input>
          </div>

          <div class="mt-2 mobile_controls">
            <label class="d-flex align-items-center justify-content-between"><span>Outline Width</span> <span>0px</span></label>
            <input type="range" class="custom-range mt-1" value="0" min="0" max="100" />
          </div>
        </div>
        <div class="fade-right py-1">
          <div class="overflow-auto d-flex align-items-center gap-2 hide-scroll fontList">
            <div v-for="(item, i) in 20" :key="i" style="white-space: nowrap" :class="{'pr-3': item == 20, 'activeFont': activeFont == i}" @click="setActiveFont(i)">Style {{item}}</div>
          </div>
        </div>

        <b-tabs class="mt-1">
          <b-tab>
            <template #title>
              <div class="d-flex align-items-center gap-1">
                <span class="selected-color ml-2 flex-shrink-0" :style="{background: 'red'}"></span>
                <span>Fill Color</span>
              </div>
            </template>
            <div class="overflow-hidden fade-right">
              <!--          <color-picker @changeColor="changeColor" theme="light" :color="svgElement.color" :sucker-hide="true" />-->
              <ul class="mobile-nav horizontal active_underline hide-scroll pr-4">
                <li v-for="(colorName, index) in productColors" :key="index">
                  <a class="faded_text text-capitalize" :class="activeCollection == index ? 'active_dark' : ''" @click="setActiveCollection(index)">{{colorName.name}}</a>
                </li>
              </ul>
            </div>
            <div class="mt-2 overflow-auto hide-scroll d-flex gap-1" style="padding:6px">
              <div class="color_circle" :key="index" v-for="(color, index) in (typeof productColors[activeCollection].color_text === 'string' ? JSON.parse(productColors[activeCollection].color_text) : productColors[activeCollection].color_text)" :style="{background: color.value, boxShadow: `0 0 0 3px white, 0 0 0 4px ${color.value}`}" @click="setColor(color)"></div>
            </div>
          </b-tab>
          <b-tab>
            <template #title>
              <div class="d-flex align-items-center gap-1">
                <span class="selected-color ml-2 flex-shrink-0" :style="{background: 'blue'}"></span>
                <span>Outline Color</span>
              </div>
            </template>
            <div class="overflow-hidden fade-right">
              <!--          <color-picker @changeColor="changeColor" theme="light" :color="svgElement.color" :sucker-hide="true" />-->
              <ul class="mobile-nav horizontal active_underline hide-scroll pr-4">
                <li v-for="(colorName, index) in productColors" :key="index">
                  <a class="faded_text text-capitalize" :class="activeCollection == index ? 'active_dark' : ''" @click="setActiveCollection(index)">{{colorName.name}}</a>
                </li>
              </ul>
            </div>
            <div class="mt-2 overflow-auto hide-scroll d-flex gap-1" style="padding:6px">
              <div class="color_circle" :key="index" v-for="(color, index) in (typeof productColors[activeCollection].color_text === 'string' ? JSON.parse(productColors[activeCollection].color_text) : productColors[activeCollection].color_text)" :style="{background: color.value, boxShadow: `0 0 0 3px white, 0 0 0 4px ${color.value}`}" @click="setColor(color)"></div>
            </div>
          </b-tab>
        </b-tabs>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import CustomTabs from "../CustomTabs.vue";
@Component<TextCustomization>({
  components: {
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
    // this.fontsColorsManipulation()
    // this.fontsList()
    // this.customTextInit()
    console.log('customTexts', this.customTexts)
  },
})

export default class TextCustomization extends Vue {
  @Prop() activeTab!: number
  private activeCollection = 0;
  private activeFont = 0;
  public productColors: any[] = []
  public firstColor!: Record<any, any>
  public secondColor!: Record<any, any>
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
  public showSVGs = false
  public isHidden = false

  private setActiveCollection(index: number) {
    this.activeCollection = index;
  }

  private setActiveFont(index: number) {
    this.activeFont = index;
  }

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get logoColors(): [] {
    return this.$store.getters.getLogosColors
  }

  get lockerColors(){
    return this.$store.getters.getLockerColors
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts
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

  private updateTextField(index: number, value: string) {
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.customTexts)), action: 'customTexts' })
    this.$store.dispatch('updateCustomTextAttribute', {index: index, attribute: 'text', value: value})
  }
}
</script>

<style lang="scss" scoped>
.fontList{
  div{
    color: #999;

    &.activeFont{
      color: #121212;
      font-weight: bold;
    }
  }
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
