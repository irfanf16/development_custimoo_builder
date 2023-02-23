<template>
  <div class="accordion color-accordion" role="tablist">
    <b-card no-body v-for="(svgElement, index) in svgGroups" :key="'color-accordion'+index">
      <b-card-header header-tag="header" class="p-0" role="tab">
        <b-button block v-b-toggle="'accordion-'+(index+1)" @click="showColor(index, svgElement.gradient_colors? gradient_index === undefined? 0 : gradient_index : undefined)">
          <span class="text-uppercase text">{{ svgElement.id | capitalize }} </span>
          <span class="color">
            <template v-if="svgElement.gradient_colors">
              <span class="color-box" :style="{ background : gradient_color_string(svgElement.gradient_colors) }"></span>
              <span class="color-pantone-name gap-1 text-uppercase">
               <template v-for="(gradient_color, g_index) in svgElement.gradient_colors">
                 {{ gradient_color.pantone }} {{ gradient_color.name }} <template v-if="g_index < svgElement.gradient_colors.length - 1">/</template>
               </template>
              </span>
            </template>
            <template v-else>
              <span class="color-box" :style="{ background : svgElement.color }"></span>
              <span class="color-pantone-name text-uppercase">{{ svgElement.pantone }} {{ svgElement.name }}</span>
            </template>
          </span>
          <span class="accordion-icon"></span>
        </b-button>
      </b-card-header>
      <b-collapse :id="'accordion-'+(index+1)" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <div v-if="svgElement.gradient_colors" class="d-flex w-100 flex-wrap gap-1 mt-1">
            <button v-for="(gradient_color, g_index) in svgElement.gradient_colors" @click="showColor(index, g_index)" :key="g_index" :class="{'light': gradient_index == g_index}" class="btn btn-secondary isBtn btn-sm">Gradient {{ g_index + 1 }}</button>
          </div>
          <b-nav class="d-flex flex-wrap align-items-center">
            <b-nav-item :class="{ 'active' : index == selectTypeIndex && !showOther}" class="mr-2 " v-for="(colorType, index) in productColors" :key="'color-nav'+index" @click="selectType(index, false)">{{ colorType.name | capitalize }}</b-nav-item>
            <b-nav-item v-if="logoColorsInfo && logoColorsInfo.length" :class="{ 'active' : selectTypeIndex == (productColors.length) && !showOther}" class="mr-2 " @click="selectType(productColors.length, false)">Team logo colors</b-nav-item>
            <b-nav-item :class="{ 'active' : selectTypeIndex == (productColors.length + 1) && !showOther}" class="mr-2 " v-if="isCustomerAuthenticated && lockerroomColors && lockerroomColors.length" @click="selectType(productColors.length + 1, false)">Locker colors</b-nav-item>
            <b-nav-item v-if="selectedProduct.is_custom_color_allowed" :class="{ active: showOther }" @click="selectType(null, true)">Others</b-nav-item>
          </b-nav>
          <div v-if="selectTypeIndex == (productColors.length + 1) && !showOther" class="overflow-hidden fade-right pr-4">
            <div class="d-flex align-items-center overflow-auto theme-scroll-h gap-1 py-2">
              <template v-for="(room, i) in lockerroomColors">
                <b-button size="sm" class="btn-locker-color" variant="secondary" @click="setActiveLockerIndex(i)" :class="{'active': i == activeLockerIndex}"
                          :key="`locker_${i}`">
<!--                  {{ room && room.folders[0].folder_name}}-->
                  {{room && room.room_name}}
                </b-button>
              </template>
            </div>

            <div class="d-flex align-items-center overflow-auto theme-scroll-h gap-1 pb-2">
              <b-button size="sm" class="btn-locker-folder" variant="secondary" :class="{'active': folder_i == activeFolderIndex}" @click="setActiveFolderIndex(activeLockerIndex, folder_i)"
                        v-for="(folder, folder_i) in lockerroomColors[activeLockerIndex].folders" :key="`folder_${activeLockerIndex}${folder_i}`">
                {{folder.folder_name}}
              </b-button>
            </div>
          </div>
          <div class="color-holder" style="padding-top: 5px;" ref="ColorAccordion">
            <div class="color-container">
              <div v-if="showOther && selectedProduct.is_custom_color_allowed" class="custom-color-picker">
                <b-form v-if="getColorType !== 'product_color'" class="pantone-color-field" v-on:submit.prevent>
                  <label for="inline-form-input-pantone-color" v-if="getColorType === 'cmyk'">CMYK (x,x,x,x)</label>
                  <label for="inline-form-input-pantone-color" v-else-if="getColorType === 'pantone-coated'">Pantone: (xxx c)</label>
                  <label class="mb-2" for="inline-form-input-pantone-color" v-else>Pantone: (TCX xx-xxxx)</label>
                  <b-form-input
                    @focusin="($event)=>$event.target.select()"
                    v-model="svgGroups[selectAccordionIndex].pantone"
                    class="mb-2 mr-sm-2 mb-sm-0"
                    :placeholder="place_holder"
                    @input="changePantoneColor"
                    :disabled="getColorType === 'cmyk'"
                  ></b-form-input>
                  <div class="pantone-message p-1 text-danger">
                    {{ pantoneMessage }}
                  </div>
                </b-form>
                <color-picker @changeColor="changeColor" theme="light" :key="svgElement.color" :color="svgElement.color" :sucker-hide="true" />
              </div>
              <template v-else-if="selectTypeIndex == productColors.length && !showOther" v-for="(ext_color, ext_index) in logoColorsInfo">
                <div v-if="ext_color.hex"  class="color-box"  @click="setColor({value: ext_color.hex, ...ext_color})"
                     :title="ext_color.name" :style="{background: ext_color.hex }" :key="'base-color' +ext_index + ext_color.name">
                  <span v-if="ext_color.hex == svgElement.color" class="selected" style="z-index: 100; opacity: 1">
                    <BIconCheck />
                  </span>
                </div>
              </template>
              <template v-else-if="selectTypeIndex == (productColors.length + 1) && !showOther" v-for="(color, index) in JSON.parse(lockerroomColors[activeLockerIndex].folders[activeFolderIndex].color)">
                <div v-if="color.value"  class="color-box"  @click="setColor(color)"
                     :title="color.name" :style="{background: color.value }" :key="`locker_color${index}${activeLockerIndex}${activeFolderIndex}`">
                  <span v-if="color.value == svgElement.color" class="selected" style="z-index: 100; opacity: 1">
                          <BIconCheck />
                        </span>
                </div>
              </template>
              <template v-else-if="!showOther" v-for="(color, index) in productColor">
                <div v-if="color.value"  class="color-box"  @click="setColor(color)"
                     :title="color.name" :style="{background: color.value }" :key="index">
                  <span v-if="color.value == svgElement.color" class="selected" style="z-index: 100; opacity: 1">
                    <BIconCheck />
                  </span>
                </div>
              </template>
            </div>
          </div>
        </b-card-body>
      </b-collapse>
    </b-card>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Watch, Mixins} from 'vue-property-decorator'
import colorPicker from '@caohenghu/vue-colorpicker'
import {LockerProducts} from '../mixins/LockerProduct'

import {getClosestColor, pantonesTcx, getColorEncoding} from '@/pantoneColor'
import {getSelectedProductPantones, getLockerColors, setUndoRedoItems} from "@/helpers/Helpers";

@Component<ColorAccordion>({
  components: {
      colorPicker
  },
  filters: {
    capitalize: (value: string) => {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    }
  },
  mounted(){
    setTimeout(() => {
      this.selectType(this.selectTypeIndex);
    }, 300);
    getLockerColors();
  }
})
export default class ColorAccordion extends Mixins(LockerProducts) {
  @Prop({required: true}) productColors!: Record<any, any>[]
  @Prop({required: true}) tabIndex!: any

  public color= '#59c7f9'
  public pantoneColorVal= '18-0107'
  public showOther = false
  public selectAccordionIndex = 0
  public gradient_index: number|undefined = 0
  public activeLockerIndex = 0
  public activeFolderIndex = 0
  public selectTypeIndex = 0
  public productColor: any[] = []
  public selectedColorTab = 0;
  public colorImage = '/img/images/color-placeholder.png'
  public pantoneMessage = ''

  @Watch('productColors', {
    deep: true
  })

  productColorsChanged(){
    this.selectType(this.selectTypeIndex, false)
  }

  @Watch('tabIndex', {
    deep: true
  })

  tabIndexChanged(){
    if(this.productColors[this.selectTypeIndex]){
      return false;
    }else{
      this.selectType(this.selectTypeIndex - 1, false)
    }
  }

  get place_holder() {
    if(this.getColorType === 'cmyk') {
      return 'x,x,x,x';
    } else if(this.getColorType === 'pantone-coated') {
      return 'xxx c';
    } else if(this.getColorType === 'pantone-tcx') {
      return 'xx-xxxx';
    }
    return '';
  }

  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  get logoColorsInfo() {
    return this.$store.getters.getLogoColorsInfo('extracted_colors');
  }

  get svgGroups() {
    return this.$store.getters.getSvgGroups
  }
  get groupColors(){
    return this.$store.getters.getGroupColors
  }
  public showColor(index: number, gradient_index: number|undefined) {
    this.selectAccordionIndex = index
    this.gradient_index = gradient_index
  }
  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }
  get lockerroomColors(): Record<any, any> {
    return this.$store.getters.getLockerroomColors;
  }
  get getColorType(): string {
    return this.$store.getters.getSetting('color_type');
  }

  public gradient_color_string(gradient_colors: Record<any, any>[]) {
    let css_color = 'linear-gradient(90deg';
    gradient_colors.forEach((gradient_color: Record<any, any>) => {
      css_color += ',' + gradient_color.color
    })
    css_color += ')'
    return css_color
  }
  public setActiveFolderIndex(locker_i: number, folder_i: number) {
    this.activeLockerIndex = locker_i;
    this.activeFolderIndex = folder_i;
  }

  public setActiveLockerIndex(locker_i: number) {
    this.activeLockerIndex = locker_i;
    this.activeFolderIndex = 0;
  }

  public selectType(index: number, showOther = false) {
    this.selectTypeIndex = index
    this.showOther = showOther
    if (this.productColors[index]){
      this.productColor = this.productColors[index].color_text
    }
  }

  public async setColor(color: Record<any, any>) {
    let self: Record<any, any> = this
    await setUndoRedoItems('groupColors','updated')
    if (color.value){
      this.$store.dispatch('updateGroupColors',
        {
          index: this.svgGroups[this.selectAccordionIndex].id,
          gradient_index: this.gradient_index,
          color: color.value,
          pantone: color.pantone,
          name: color.name
        })
      self.$eventBus.$emit("changeGroupColors")
    }
  }

  public changeColor(color: Record<any, any>) {
    const selectProductPantonesList = getSelectedProductPantones()
    let pantoneColor = getClosestColor(color.hex,selectProductPantonesList,this.getColorType) // this is sub-menu other tab of color tab in menu
    this.setColor({value: pantoneColor.hex.toUpperCase(), pantone: pantoneColor.pantone, name: pantoneColor.name})
  }

  public changePantoneColor() {
    let color_code = this.extractExactCode(this.svgGroups[this.selectAccordionIndex].pantone)?this.extractExactCode(this.svgGroups[this.selectAccordionIndex].pantone):this.svgGroups[this.selectAccordionIndex].pantone;
    let pantoneColor = getColorEncoding(color_code, this.getColorType);
    if (pantoneColor) {
      this.setColor({value: pantoneColor.hex.toUpperCase(), pantone: color_code.toUpperCase(), name: pantoneColor.name})
      this.pantoneMessage = ''
    }
    else {
      this.pantoneMessage = 'Color is not in the list.'
    }
  }

  public extractExactCode(code:string) {
    let pantone_coated: string|null = null;
    if(this.getColorType === 'pantone-coated'){
      let regex_numbers = /^[0-9]+/g;
      let regex_alphabets = /[a-zA-Z]+/g;
      let numbers = regex_numbers.exec(code);
      let alphabets = regex_alphabets.exec(code);
      if(numbers && numbers[0] && alphabets && alphabets[0]){
        pantone_coated = numbers[0] + ' ' + alphabets[0].toUpperCase();
      }
    }
    return pantone_coated;
  }
}
</script>

<style lang="scss" scoped>
  .pantone-color-field{
      background: #f7f8f9;
      padding: 10px 10px 0;
      .form-control{
        background: #fff;
        border: none;
        border-radius: 0;
        box-shadow: none;
        font-size: 0.8rem;
      }
      .hu-color-picker{box-shadow: none !important;}
  }
</style>
