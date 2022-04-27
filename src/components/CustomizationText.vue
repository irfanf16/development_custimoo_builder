<template>
  <div class="customization-text-area">
    <div class="px-3 pt-3 p-lg-4">
      <h2 class="fw-bold mb-2 fz-18" v-if="customTexts[customTextIndex].add_type && customTexts[customTextIndex].add_type == 'manual'">Additional Text # {{ customTexts[customTextIndex].added_count }}</h2>
      <h2 class="fw-bold mb-2 fz-18" v-else>Player  {{ customTexts[customTextIndex].type | capitalize }} {{ customTexts[customTextIndex].side }}</h2>

      <div class="d-flex">
        <b-form-input
          @click="isHidden = !isHidden"
          class="mb-2 mr-sm-2 mb-sm-0"
          placeholder="Type Here"
          :value="customTexts[customTextIndex].text"
          @input="updateTextField(customTextIndex, $event)"
        ></b-form-input>
        <button v-b-toggle="'accordion-'+(customTextIndex+1)" class="d-flex align-items-center btn btn-secondary light">
          <span class="minus d-flex align-items-center"><BIconDash class="minus" /> Collapse</span>
          <span class="plus d-flex align-items-center"><BIconPlus class="plus" /> Expand</span>
        </button>
      </div>

      <b-collapse :id="'accordion-'+(customTextIndex+1)" accordion="my-accordion" role="tabpanel">
        <h4 class="mt-3 mb-2 fz-16">Font Type</h4>
        <div class="font-type-area">
          <div class="type-block">
            <b-form-select :value="customTexts[customTextIndex].fontFamily" @change="fontOptionChanged(customTextIndex, $event)" :options="fontOptions" ></b-form-select>
          </div>
          <div class="arc-block">
            <b-form-select :value="customTexts[customTextIndex].side" @change="changeSide(customTextIndex, $event)" :options="['front', 'back']"></b-form-select>
          </div>
        </div>
        <h4 class="mt-3 mb-2 fz-16">Select Color</h4>
        <div class="text-color-holder" :class="{ active: customTexts[customTextIndex].selectColor }">
  <!--      <div class="text-color-holder active" >-->
          <a @click="showColor('fill', customTextIndex)">
            <div class="text-color-box">
              <div class="color-circle"
                   :style="{ background : customTexts[customTextIndex].fillColor? customTexts[customTextIndex].fillColor : ' url(' + colorImage + ') no-repeat 50% 50% / 12px' }"></div>
              <strong>Fill Color</strong>
            </div>
          </a>
          <a @click="showColor('outline', customTextIndex)" v-if="customTexts[customTextIndex].outlineEnabled &&  customTexts[customTextIndex].outLineWidth > 0">
            <div class="text-color-box">
               <div class="color-circle"
                   :style="{ background : customTexts[customTextIndex].outLineColor? customTexts[customTextIndex].outLineColor : ' url(' + colorImage + ') no-repeat 50% 50% / 12px' }"></div>
              <strong>Outline Color</strong>
            </div>
          </a>
          <div class="color-holder">
            <b-card-body style="padding: 0 !important;">
              <b-nav class="d-flex flex-wrap align-items-center">
                <b-nav-item class="mr-2" v-for="(colorType, index) in fontsColors" :key="index" @click="selectType(index)">{{ colorType.file_type }}</b-nav-item>
              </b-nav>



  <!--            <div class="color-holder">-->
  <!--              <div class="">-->
  <!--                <div class="color-box" v-for="(color, index) in fontColor" @click="setColor(color)"
                       :title="color.name" :style="{background: color.value}" :key="index">

                  </div>-->

                  <TextColorTabs ref="text-color-tab" @setColors="setColor" :productColors="productColors" :showSVGS="Boolean(showSVGs)"/>




  <!--              </div>-->





  <!--            </div>-->



            </b-card-body>


          </div>
        </div>
        <div class="outline-slider-area pt-4">
          <template v-if="customTexts[customTextIndex].outlineEnabled">
            <div>
              <label for="range-2 fz-16">Outline Width</label>
              <b-form-input class="mt-2" id="range-2"  :value="customTexts[customTextIndex].outLineWidth" @change="outLineWidthValueChanged($event)" type="range" min="0" max="10" step="1"></b-form-input>
              <div class="mt-2">Outline Size: {{ customTexts[customTextIndex].outLineWidth }}px</div>
            </div>
          </template>
        </div>
      </b-collapse>
    </div>
  </div>
</template>

<script lang="ts">

import {Component, Prop, Watch, Vue} from 'vue-property-decorator'
import ColorTabs from '@/components/ColorTabs.vue'
import TextColorTabs from "@/components/TextColorTabs.vue";
import {getClosestColor} from '@/pantoneColor'
import { findIndex } from 'lodash'


@Component<CustomizationText>({
  components: {
    TextColorTabs,
    ColorTabs
  },
  mounted() {
    this.$nextTick(() => {
      this.selectType(this.selectTypeIndex)
    })
    this.getColors()
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
  public productColors: any[] = []
  public showSVGs = false
  public openIndex = -1


  get productNames() {
    return this.$store.getters.getSelectedProduct.productnames;
  }

  public setOpenIndex(index:any){
    this.openIndex = index;
    console.log('log custom text index ', index)
    console.log('log text index ', this.openIndex)
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts()
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
  get customText():Record<any, any>[]{
    return this.$store.getters.getCustomTexts();
  }

  public getColors() {
    this.productColors = []
    this.selectedProduct.colors.forEach((colors: any, key: number) => {
      let finalColor = {color_text: [], selectedColor: "", name: colors.file_name.substr(0, colors.file_name.indexOf('.'))}
      finalColor.color_text = JSON.parse(colors.json_data)
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

  public showColor(fontColorType: any, fontColorIndex: number) {
    this.fontColorType = fontColorType
    this.fontColorIndex = fontColorIndex
    this.customTexts.forEach((customText: Record<any, any>, index: number) => {
      if(index == fontColorIndex) {
        this.$store.dispatch('updateCustomTextAttribute', {index: index, on_all: true, attribute: 'selectColor', value: !customText.selectColor})
      } else {
        this.$store.dispatch('updateCustomTextAttribute', {index: index, on_all: true, attribute: 'selectColor', value: false})
      }
    })
  }

  public fontOptionChanged(index:number, event:any){
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)), action: 'customTexts' })
    this.$store.dispatch('updateCustomTextAttribute', { index:index, on_all: false, attribute: 'fontFamily', value: event})
  }

  public changeSide(index:number, event:string){
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)), action: 'customTexts' })
    this.$store.dispatch('updateCustomTextAttribute', { index:index, on_all: true, attribute: 'side', value: event})
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
      this.$store.dispatch('updateCustomTextAttribute', {index: this.fontColorIndex, on_all: true, attribute: 'outLineColor', value: color.value})
      this.$store.dispatch('updateCustomTextAttribute', {index: this.fontColorIndex, on_all: true, attribute: 'outLineColorPantone', value: color_pantone})
    }
  }

  public selectType(index: number) {
    this.selectTypeIndex = index
    this.fontColor = this.fontsColors[this.selectTypeIndex].color_text
  }

  outLineWidthValueChanged(event:string) {
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)), action: 'customTexts' })
    this.$store.dispatch('updateCustomTextAttribute', {index: this.customTextIndex, on_all: true, attribute: 'outLineWidth', value: event})
  }
  public isHidden= false

  updateTextField(index: number, value: string) {
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)), action: 'customTexts' })
    this.$store.dispatch('updateCustomTextAttribute', {index: index, on_all: true, attribute: 'text', value: value})
    this.initRosterFromTexts()
  }
  public initRosterFromTexts() {
    const custom_name_index = findIndex(this.customText, {type: 'name'});
    const custom_number_index = findIndex(this.customText, {type: 'number'});
    if(custom_name_index != -1) {
      this.$store.commit('rosterDetailAttributeWithoutTrigger',{index: 0, attribute: 'text', value: this.customText[custom_name_index].text})
    }
    if(custom_number_index != -1) {
      this.$store.commit('rosterDetailAttributeWithoutTrigger',{index: 0, attribute: 'name', value: this.customText[custom_number_index].text})
    }
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
.btn{
  min-width: 108px;

  .minus{
    display: none !important;
  }

  &.not-collapsed{
    .minus{
      display: flex !important;
    }
    .plus{
      display: none !important;
    }
  }
}
</style>
