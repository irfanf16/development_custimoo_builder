<template>
  <div class="accordion color-accordion" role="tablist">
    <b-card no-body v-for="(svgElement, index) in svgGroups" :key="index">
      <b-card-header header-tag="header" class="p-0" role="tab">
        <b-button block v-b-toggle="'accordion-'+(index+1)" @click="showColor(index)">
          <span class="text">{{ svgElement.id | capitalize }}</span>
          <span class="color">
            <span class="color-box" :style="{ background : svgElement.color? svgElement.color : ' url(' + colorImage + ') no-repeat 50% 50% / 20px' }"></span>
            <span class="color-pantone-name">{{ svgElement.pantone }}<span style="text-transform: uppercase; display: block">{{ svgElement.name }}</span><span style="text-transform: uppercase;">{{ svgElement.pantoneName }}</span></span>
          </span>
          <span class="accordion-icon"></span>
        </b-button>
      </b-card-header>
      <b-collapse :id="'accordion-'+(index+1)" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <b-nav class="d-flex flex-wrap align-items-center" style="display: none">
            <b-nav-item v-bind:class="{ 'active' : index == selectTypeIndex && !othersActive}" class="mr-2 " v-for="(colorType, index) in productColors" :key="index" @click="selectType(index)">{{ colorType.name | capitalize }}</b-nav-item>
            <b-nav-item v-if="selectedProduct.is_custom_color_allowed" :class="{ active: othersActive }" @click="selectType(index, true)">Others</b-nav-item>
          </b-nav>
          <div class="color-holder" style="padding-top: 5px;" ref="ColorAccordion">
            <div class="color-container">
              <div v-if="showOther && selectedProduct.is_custom_color_allowed" class="custom-color-picker">
                <b-form class="pantone-color-field" v-on:submit.prevent>
                  <label for="inline-form-input-pantone-color" v-if="getColorType === 'cmyk'">CMYK (x,x,x,x)</label>
                  <label for="inline-form-input-pantone-color" v-else-if="getColorType === 'pantone-coated'">Pantone: (xxx c)</label>
                  <label class="mb-2" for="inline-form-input-pantone-color" v-else>Pantone: (TCX xx-xxxx)</label>
                  <b-form-input
                    @focusin="($event)=>$event.target.select()"
                    v-model="svgGroups[selectAccordionIndex].pantone"
                    class="mb-2 mr-sm-2 mb-sm-0"
                    placeholder="XX-XXXX"
                    @input="changePantoneColor"
                    :disabled="getColorType === 'cmyk'"
                  ></b-form-input>
                  <div class="pantone-message p-1 text-danger">
                    {{ pantoneMessage }}
                  </div>
                </b-form>
                <color-picker @changeColor="changeColor" theme="light" :key="svgElement.color" :color="svgElement.color" :sucker-hide="true" />
              </div>
              <template v-else v-for="(color, index) in productColor">
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
import {Component, Prop, Watch, Vue} from 'vue-property-decorator'
import colorPicker from '@caohenghu/vue-colorpicker'

import {getClosestColor, pantonesTcx, getColorEncoding} from '@/pantoneColor'
import {getSelectedProductPantones} from "@/helpers/Helpers";

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
    this.selectType(this.selectTypeIndex)
    }, 300)
  }
})
export default class ColorAccordion extends Vue {
  @Prop({required: true}) productColors!: Record<any, any>[]
  @Prop({required: true}) tabIndex!: any

  public color= '#59c7f9'
  public pantoneColorVal= '18-0107'
  public showOther = false
  public selectAccordionIndex = 0
  public selectTypeIndex = 0
  public productColor: any[] = []
  public selectedColorTab = 0;
  public colorImage = '/img/images/color-placeholder.png'
  public pantoneMessage = ''
  public isActive = false
  public othersActive = false

  // public showit(){
  //   // this.$emit('setScroll')
  //   // this.$root.$on('bv::collapse::state', (collapseId:string, isJustShown:string) => {
  //   //   console.log('collapseId:', collapseId)
  //   //   console.log('isJustShown:', isJustShown)
  //   //
  //   //   console.log(this.svgGroups.length)
  //   // })
  //   // this.$emit('setScroll')
  // }

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
      this.selectType(this.selectTypeIndex-1, false)
    }
  }

  get svgGroups() {
    return this.$store.getters.getSvgGroups
  }
  get groupColors(){
    return this.$store.getters.getGroupColors
  }
  public showColor(index: number) {
    this.selectAccordionIndex = index
  }
  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }
  get getColorType(): string {
    return this.$store.getters.getSetting('color_type');
  }

  public selectType(index: number, showOther = false) {
    if (showOther){
      this.othersActive = true;
    }
    else {
      this.othersActive = false;
    }

    this.selectTypeIndex = index
    this.showOther = showOther
    if (this.productColors[index]){
      this.productColor = this.productColors[index].color_text
    }
    if(this.selectTypeIndex){
      this.isActive = !this.isActive
    }
    else {
      this.isActive = false
    }
  }

  public setColor(color: Record<any, any>) {
    let self: Record<any, any> = this
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.groupColors)), action: 'groupColor' })
    if (color.value){
      this.$store.dispatch('updateGroupColors',
        {
          index: this.svgGroups[this.selectAccordionIndex].id,
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
    let pantoneColor = getColorEncoding(color_code,this.getColorType);
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
