<template>
  <div>
    <b-tabs class="player_text mobile" v-if="this.selectedProductID">
      <template v-for="(customText, tabIndex) in customTexts">
        <b-tab v-if="customText.hasOwnProperty('text')" :key="tabIndex" @click="setTextIndex(tabIndex)">
          <template #title>
            <template v-if="customTexts[customTextIndex].add_type && customTexts[customTextIndex].add_type == 'manual'">
              <b-button class="p-0 mr-1 light remove-text" size="sm" style="min-width: unset; line-height: normal" variant="dark" @click.stop="removeTab(tabIndex, selectedProduct.id)">
                <b-icon-x />
              </b-button>
              Additional Text # {{ customTexts[customTextIndex].added_count }}
            </template>
            <template v-else>
              {{ selectedProduct.productnames[tabIndex].name_of_placement }}
            </template>
          </template>

          <div class="grid mobile-cols-2 gap-1">
            <div class="mobile_controls d-flex gap-1 align-items-center">
              <!--            <label class="d-flex align-items-center justify-content-between"><span>{{ customTexts[tabIndex].type | capitalize }} {{ customTexts[tabIndex].side }}</span></label>-->
              <div @click="changeSide(tabIndex, customText.side)" class="fs-3">
                <BIconArrowRepeat style="margin-top: 8px" />
              </div>
              <b-form-input
                @click="isHidden = !isHidden"
                class="mt-1"
                :placeholder="customText.side + ' ' + customText.type | capitalize"
                :value="customText.text"
                @input="updateTextField(tabIndex, $event)"
              ></b-form-input>
            </div>

            <div class="mt-2 mobile_controls" v-if="customTextIndex != '' || customTextIndex != undefined">
              <label class="d-flex align-items-center justify-content-between"><span>Outline Width</span> <span v-if="+customText.outLineWidth">{{ customText.outLineWidth }}px</span></label>
              <b-form-input id="range-2" style="margin-top: 7px" :value="customTexts[customTextIndex].outLineWidth" @change="outLineWidthValueChanged($event)" type="range" min="0" max="10" step="1"></b-form-input>
            </div>
            <div v-else>
              {{customTextIndex}}
            </div>
          </div>
          <div class="fade-right py-2">
            <div class="overflow-auto d-flex align-items-center gap-2 hide-scroll fontList">
              <div v-for="(item, i) in fontOptions" :key="i" :style="{ fontFamily: item.value}" @click="fontOptionChanged(tabIndex, i, item.value)" style="white-space: nowrap" :class="{'pr-3': i+1 == fontOptions.length, 'activeFont': activeFont == i}">
                <span>
                  {{customText.text ? customText.text : item.text}}
                </span>
              </div>
            </div>
          </div>

          <b-tabs class="mt-2">
            <b-tab @click="setColorType('fill')">
              <template #title>
                <div class="d-flex align-items-center gap-1">
                  <span class="selected-color ml-2 flex-shrink-0" :style="{background: customText.fillColor}"></span>
                  <span>Fill Color</span>
                </div>
              </template>
              <div class="overflow-hidden fade-right">
                <ul class="mobile-nav horizontal active_underline hide-scroll pr-4">
                  <li v-for="(colorName, index) in productColors" :key="index">
                    <a class="faded_text text-capitalize" :class="activeCollection == index ? 'active_dark' : ''" @click="setActiveCollection(index)">{{colorName.name}}</a>
                  </li>

                  <li v-if="selectedProduct.is_custom_color_allowed">
                    <a class="faded_text text-capitalize" @click="showOther">Other</a>
                  </li>
                </ul>
              </div>
              <div v-if="productColors[activeCollection]" class="mt-2 overflow-auto hide-scroll d-flex gap-1" style="padding:6px">
                <div class="color_circle" :key="index" v-for="(color, index) in productColors[activeCollection].color_text" :style="{background: color.value, boxShadow: `0 0 0 3px white, 0 0 0 4px ${color.value}`}" @click="setColor(color)"></div>
              </div>

              <div v-if="showOtherColors && selectedProduct.is_custom_color_allowed" class="mobile-other">
                <span class="close" @click="hideOther"><BIconX /></span>
                <color-picker :colors-default="[]" @changeColor="changeColor" theme="light" :color="color" :sucker-hide="true"/>
              </div>
            </b-tab>

            <b-tab @click="setColorType('outline')" v-if="+customText.outLineWidth">
              <template #title>
                <div class="d-flex align-items-center gap-1">
                  <span class="selected-color ml-2 flex-shrink-0" :style="{background: customText.outLineColor}"></span>
                  <span>Outline Color</span>
                </div>
              </template>
              <div class="overflow-hidden fade-right">
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
      </template>

      <template #tabs-end v-if="selectedProduct.allow_extra_text">
          <li @click="addTab" class="add_text_tab" style="font-size: 0.9em">Add <BIconPlus/></li>
      </template>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import colorPicker from '@caohenghu/vue-colorpicker'
import {getClosestColor} from "@/pantoneColor";
import {getSelectedProductPantones} from "@/helpers/Helpers";
import { findIndex } from 'lodash'
@Component<TextCustomization>({
  components: {
    colorPicker
  },
  mounted() {
    this.$nextTick(() => {
      this.selectType(this.selectTypeIndex)
    })
    this.getColors()
    // this.$store.dispatch('setCustomLogos')
    this.productColorsManipulation()
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
  // public firstColor!: Record<any, any>
  // public secondColor!: Record<any, any>
  @Prop({required: true}) productFonts!: any
  @Prop({required: true}) fontsColors!: any
  @Prop({required: true}) firstColor!: any
  @Prop({required: true}) secondColor!: any
  // @Prop({required: true}) customTextIndex!: any
  @Prop({required: true}) fontOptions!: any
  @Prop({required: true}) selectedProductID!: any
  public customTextIndex: any = 0
  public selectedFont = null
  public colorImage = '/img/images/color-placeholder.png'
  public fontColorType = 'fill'
  public fontColorIndex = 0
  public selectTypeIndex = 0
  public fontColor: any[] = []
  public outLineWidthValue = 0
  public showSVGs = false
  public isHidden = false
  private activeColors: any[] = []
  public showOtherColors = false
  public pantoneColorVal= '13-4411'
  public color= '#59c7f9'
  public set = false
  public text_add_count = 0


  private showOther(){
    this.showOtherColors = true
    this.$emit('showOther', true)
  }
  private hideOther(){
    this.showOtherColors = false
    this.$emit('showOther', false)
  }

  public changeColor(color: Record<any, any>) {
    const selectProductPantonesList = getSelectedProductPantones()
    let pantone = getClosestColor(color.hex,selectProductPantonesList, this.getColorType); // for other color in
    if(pantone && pantone.pantone && pantone.pantone != 'undefined'){
      this.pantoneColorVal = pantone.pantone;
    }

    let pantoneColor = getClosestColor(color.hex,selectProductPantonesList,this.getColorType);
    this.setColor({value: pantoneColor.hex.toUpperCase(), pantone: pantoneColor.pantone, name: pantoneColor.name})
  }

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

  get getColorType(){
    return this.$store.getters.getSetting('color_type');
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts()
  }

  public productColorsManipulation() {
    this.productColors = []
    this.selectedProduct.colors.forEach((colors: any, key: number) => {
      let finalColor = {color_text: [], selectedColor: "", name: colors.file_name.substr(0, colors.file_name.indexOf('.'))}
      finalColor.color_text = colors.json_data
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

  public addTab() {
    let text = {
      text: '',
      type: 'name',
      width: 50,
      height: 50,
      x_axis: 300,
      y_axis: 180,
      rotation: 0,
      name_of_placement: this.selectedProduct.productnames[0].name_of_placement,
      haveControls: true,
      outlineEnabled: true,
      side: 'back',
      fontFamily: this.fontOptions[0] ? this.fontOptions[0].value : '',
      fillColor: this.firstColor.value,
      fillColorPantone: this.firstColor.name,
      outLineColor: this.secondColor.value,
      outLineColorPantone: this.secondColor.name,
      outLineWidth: 0,
      add_type: 'manual',
    }
    this.$store.dispatch('setCustomTexts', {follow:true, index: this.customTexts.length, text: text, prd_id:this.selectedProduct.id})
  }
  public removeTab(index:number, prd_id:number){
    let payload  = {
      index: index,
      product_id :prd_id
    }
    this.$store.dispatch('updateCustomTextAttribute', {index: index, on_all: false, attribute: 'text', value: ''})
    this.$store.commit('REMOVE_CUSTOMIZATION_TEXT_ELEMENT', payload)
  }

  public fontOptionChanged(index:number, i:number, val:string){
    this.setActiveFont(i);

    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)), action: 'customTexts' })
    this.$store.dispatch('updateCustomTextAttribute', { index:index, on_all: true, attribute: 'fontFamily', value: val})
  }

  public changeSide(index:number, event:string){
    let current_side = event == 'back' ? 'front': 'back';
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)), action: 'customTexts' })
    this.$store.dispatch('updateCustomTextAttribute', { index:index, on_all: true, attribute: 'side', value: current_side})
  }

  public selectType(index: number) {
    this.selectTypeIndex = index
    this.fontColor = this.fontsColors[this.selectTypeIndex].color_text
  }

  public getColors() {
    this.productColors = []
    this.selectedProduct.colors.forEach((colors: any, key: number) => {
      let finalColor = {color_text: [], selectedColor: "", name: colors.file_name.substr(0, colors.file_name.indexOf('.'))}
      finalColor.color_text = colors.json_data
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

  public setColor(color: Record<any, any>) {
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)), action: 'customTexts' })
    const selectProductPantonesList = getSelectedProductPantones()
    let pantone = getClosestColor(color.value, selectProductPantonesList, this.getColorType);
    let color_pantone = color.name;
    if(pantone && pantone.pantone && pantone.pantone != 'undefined'){
      color_pantone = pantone.pantone;
    }

    if (this.fontColorType == 'fill') {
      this.activeColors[this.fontColorIndex] = {'fill': color.value};
      this.$store.dispatch('updateCustomTextAttribute', {index: this.fontColorIndex, on_all: true, attribute: 'fillColor', value: color.value})
      this.$store.dispatch('updateCustomTextAttribute', {index: this.fontColorIndex, on_all: true, attribute: 'fillColorPantone', value: color_pantone})
    } else {
      this.activeColors[this.fontColorIndex] = {'outline': color.value};
      this.$store.dispatch('updateCustomTextAttribute', {index: this.fontColorIndex, on_all: true, attribute: 'outLineColor', value: color.value})
      this.$store.dispatch('updateCustomTextAttribute', {index: this.fontColorIndex, on_all: true, attribute: 'outLineColorPantone', value: color_pantone})
    }
  }

  outLineWidthValueChanged(event:string) {
    this.outLineWidthValue = Number(event);
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)), action: 'customTexts' })
    this.$store.dispatch('updateCustomTextAttribute', {index: this.customTextIndex, on_all: true, attribute: 'outLineWidth', value: event})
  }

  get eyeIndex():number{
    return this.$store.getters.getEyeIndex;
  }

  updateTextField(index: number, value: string) {
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)), action: 'customTexts' });
    this.$store.dispatch('updateCustomTextAttribute', {index: index, attribute: 'text', value: value});
    this.initRosterFromTexts()
  }

  public initRosterFromTexts() {
    const custom_name_index = findIndex(this.customTexts, { type: 'name' });
    const custom_number_index = findIndex(this.customTexts, { type: 'number' });
    if (custom_name_index != -1) {
      this.$store.commit('rosterDetailAttributeWithoutTrigger', { index: 0, attribute: 'text', value: this.customTexts[custom_name_index].text })
    }
    if (custom_number_index != -1) {
      this.$store.commit('rosterDetailAttributeWithoutTrigger', { index: 0, attribute: 'number', value: this.customTexts[custom_number_index].text })
    }
  }

  private setTextIndex(index:number){
    this.customTextIndex = index;
    this.fontColorIndex = index;
  }

  private setColorType(colorType:string){
      this.fontColorType = colorType
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
//.remove-text{
//  height: 16px;
//  width: 16px;
//  display: flex;
//  align-items: center;
//  justify-content: center;
//  padding: 0;
//  position: absolute;
//  top: -8px;
//  right: -10px;
//}
</style>
