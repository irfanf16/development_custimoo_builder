<template>
  <div>
    <b-tabs class="player_text" v-if="this.selectedProductID">
      <b-tab v-for="(customText, tabIndex) in customTexts" :key="tabIndex" @click="setTextIndex(tabIndex)">
        <template #title>
          {{ customText.side | capitalize}} {{ customText.type | capitalize }}
        </template>
        <div class="grid mobile-cols-2 gap-1">
          <div class="mobile_controls">
<!--            <label class="d-flex align-items-center justify-content-between"><span>{{ customTexts[tabIndex].type | capitalize }} {{ customTexts[tabIndex].side }}</span></label>-->
            <b-form-input
              @click="isHidden = !isHidden"
              class="mt-2"
              :placeholder="customText.side + ' ' + customText.type | capitalize"
              :value="customText.text"
              @input="updateTextField(tabIndex, $event)"
            ></b-form-input>
          </div>

          <div class="mt-2 mobile_controls">
            <label class="d-flex align-items-center justify-content-between"><span>Outline Width</span> <span>0px</span></label>
            <input type="range" class="custom-range mt-1" value="0" min="0" max="100" />
          </div>
        </div>
        <div class="fade-right py-1">
          <div class="overflow-auto d-flex align-items-center gap-2 hide-scroll fontList">
            <div v-for="(item, i) in fontOptions" :key="i" @click="fontOptionChanged(tabIndex, i, item.value)" style="white-space: nowrap" :class="{'pr-3': i+1 == fontOptions.length, 'activeFont': activeFont == i}">
              {{item.text}}</div>
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
            <div v-if="productColors[activeCollection]" class="mt-2 overflow-auto hide-scroll d-flex gap-1" style="padding:6px">
              <div class="color_circle" :key="index" v-for="(color, index) in productColors[activeCollection].color_text" :style="{background: color.value, boxShadow: `0 0 0 3px white, 0 0 0 4px ${color.value}`}" @click="setColor(color)"></div>
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
            <div v-if="productColors[activeCollection]" class="mt-2 overflow-auto hide-scroll d-flex gap-1" style="padding:6px">
              <div class="color_circle" :key="index" v-for="(color, index) in productColors[activeCollection].color_text" :style="{background: color.value, boxShadow: `0 0 0 3px white, 0 0 0 4px ${color.value}`}" @click="setColor(color)"></div>
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
import {getClosestColor} from "@/pantoneColor";
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
    this.$nextTick(() => {
      this.selectType(this.selectTypeIndex)
    })
    this.getColors()
    // this.$store.dispatch('setCustomLogos')
    this.productColorsManipulation()
    // this.fontsColorsManipulation()
    // this.fontsList()
    // this.customTextInit()
    console.log('Text CUstomization', this.selectedProductID)
  },
  filters: {
    capitalize: (value: string) => {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    }
  }
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
  // @Prop({required: true}) customTextIndex!: any
  @Prop({required: true}) fontOptions!: any
  @Prop({required: true}) selectedProductID!: any
  private customTextIndex!: any
  public selectedFont = null
  public colorImage = '/img/images/color-placeholder.png'
  public fontColorType = 'fill'
  public fontColorIndex = 0
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
    let locker_colors = this.$store.getters.getLockerColors
    locker_colors.forEach((locker_color:Record<any, any>)=>{
      if (typeof locker_color.color_text === 'string'){
        locker_color.color_text = JSON.parse(locker_color.color_text)
      }
    })
    return locker_colors
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts(this.selectedProductID)
  }

  public productColorsManipulation() {
    this.productColors = []
    this.selectedProduct.colors.forEach((colors: any, key: number) => {
      let finalColor = {color_text: [], selectedColor: "", name: colors.file_name.substr(0, colors.file_name.indexOf('.'))}
      finalColor.color_text = JSON.parse(colors.color_text)
      this.productColors = this.productColors.concat(finalColor)
    })
    console.log('this.lockerColors', this.lockerColors)
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

  public fontOptionChanged(index:number, i:number, val:string){
    console.log(val)
    this.setActiveFont(i);
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)), action: 'customTexts' })
    this.$store.dispatch('updateCustomTextAttribute', { index:index, on_all: true, attribute: 'fontFamily', value: event})
  }

  public changeSide(index:number, event:string){
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)), action: 'customTexts' })
    this.$store.dispatch('updateCustomTextAttribute', { index:index, on_all: true, attribute: 'side', value: event})
  }

  public selectType(index: number) {
    this.selectTypeIndex = index
    this.fontColor = this.fontsColors[this.selectTypeIndex].color_text
  }

  public getColors() {
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
    // console.log('this.productColors',this.productColors)
  }

  public setColor(color: Record<any, any>) {
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)), action: 'customTexts' })
    let pantone = getClosestColor(color.value);
    let color_pantone = color.name;
    // console.log(pantone.pantone);
    if(pantone && pantone.pantone && pantone.pantone != 'undefined'){
      color_pantone = pantone.pantone;
    }

    if (this.fontColorType == 'fill') {
      this.$store.dispatch('updateCustomTextAttribute', {index: this.fontColorIndex, on_all: true, attribute: 'fillColor', value: color.value})
      this.$store.dispatch('updateCustomTextAttribute', {index: this.fontColorIndex, on_all: true, attribute: 'fillColorPantone', value: color_pantone})
    } else {
      // this.$store.dispatch('updateCustomTextAttribute', {index: this.fontColorIndex, on_all: true, attribute: 'outLineColor', value: color.value})
      // this.$store.dispatch('updateCustomTextAttribute', {index: this.fontColorIndex, on_all: true, attribute: 'outLineColorPantone', value: color_pantone})
    }
  }

  outLineWidthValueChanged(event:string) {
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)), action: 'customTexts' })
    this.$store.dispatch('updateCustomTextAttribute', {index: this.customTextIndex, on_all: true, attribute: 'outLineWidth', value: event})
  }

  updateTextField(index: number, value: string) {
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)), action: 'customTexts' })
    this.$store.dispatch('updateCustomTextAttribute', {index: index, on_all: true, attribute: 'text', value: value})
  }

  private setTextIndex(index:number){
    this.customTextIndex = index;
    this.fontColorIndex = index;
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
