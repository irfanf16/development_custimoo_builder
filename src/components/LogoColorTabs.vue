<template>
  <div class="accordion" role="tablist">
    <b-card-body style="padding: 0 !important;">
          <b-nav class="d-flex flex-wrap align-items-center">
            <b-nav-item v-bind:class="{ 'active' : index == selectTypeIndex && !othersActive}" class="mr-2 " v-for="(colorType, index) in productColors" :key="index" @click="selectType(index)">{{ colorType.name | capitalize }}</b-nav-item>
            <b-nav-item v-if="selectedProduct.is_custom_color_allowed" :class="{ active: othersActive }" @click="selectType(0, true)">Others</b-nav-item>
          </b-nav>
          <div class="color-holder">
            <div class="color-container">
              <div v-if="showOther" class="custom-color-picker">
                <b-form class="pantone-color-field" v-on:submit.prevent>
                  <label for="inline-form-input-pantone-color">Pantone: (TCX Colors)</label>
                  <b-form-input
                    v-model="pantoneColorVal"
                    class="mb-2 mr-sm-2 mb-sm-0"
                    placeholder="XX-XXXX"
                    @input="changePantoneColor" readonly
                  ></b-form-input>
                  <div class="pantone-message">
                    {{ pantoneMessage }}
                  </div>
                </b-form>
                <color-picker @changeColor="changeColor" ref="colorPicker" theme="light" :color="swatchcolor" :colors-history="false" :colors-default="[]" :key="swatchPantone"/>
              </div>
              <template v-else v-for="(color, index) in productColor">
                <div v-if="color.value"  class="color-box"  @click="setColor(color)"
                     :title="color.name" :style="{background: color.value}" :key="index">
                </div>
              </template>
            </div>
          </div>
        </b-card-body>

  </div>
</template>

<script lang="ts">
import {Component, Prop, Watch, Vue} from 'vue-property-decorator'
import colorPicker from '@caohenghu/vue-colorpicker'

import {getClosestColor, getPantoneColor} from '@/pantoneColor'

@Component<LogoColorTabs>({
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

     if(this.$refs.colorPicker){
       console.log('found')
       let container = document.querySelector('.color-container') as Record<any, any>
       Vue.set(this.$refs.colorPicker, 'hueHeight', (container.clientWidth - 60))
     }else{
       console.log('notfound')
     }

    }, 300);

   // this.$refs['colorPicker'].data.hueHeight = 500;
    window.onresize = () =>{
      this.showOtherChanged()
    }
  }
})
export default class LogoColorTabs extends Vue {
  @Prop({required: true}) productColors!: any
  @Prop({required: true}) swatchcolor!: any
  @Prop({required: false}) swatchPantone!: any
  @Prop({default: false}) showOtherTab!: boolean

  public color= this.swatchcolor
  public pantoneColorVal= this.swatchPantone
  public showOther = false
  public selectAccordionIndex = 0
  public selectTypeIndex = 0
  public productColor: any[] = []
  public selectedColorTab = 0;
  public colorImage = '/img/images/color-placeholder.png'
  public pantoneMessage = ''
  public isActive = false
  public othersActive = false

  @Watch('showOther')
  showOtherChanged() {
    if(this.showOther) {
      setTimeout(() => {
        let color_holder = document.querySelector('.accordion .card-body .color-holder') as Record<any, any>;
        let color_container = document.querySelector('.accordion .card-body .color-holder .color-container') as Record<any, any>;
        color_holder.style.maxHeight = '10000px'
        setTimeout(()=>{
          color_holder.style.maxHeight = color_container.offsetHeight + 'px'
        })

        let colorPicker = this.$refs['colorPicker'] as Record<any, any>
        if(colorPicker) {
          let container = document.querySelector('.color-container') as Record<any, any>
          this.$set(colorPicker, "hueHeight", (container.clientWidth - 60))
          this.$set(colorPicker, "previewHeight", 30)
          colorPicker.selectHue(colorPicker.rgba)
         setTimeout(() =>  {
           colorPicker.$refs.hue.renderColor();
         }, 15)
        } else {
          console.log("color picker not found")
        }
      }, 10)
    }
  }

  @Watch('swatchPantone')
  swatchPantoneChanged(val: string) {
    this.pantoneColorVal = val
  }

  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
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

  public selectType(index: number, showOther = false) {

    if (showOther){
      this.othersActive = true;
    }
    else {
      this.othersActive = false;
    }

    this.selectTypeIndex = index
    this.showOther = showOther
    this.productColor = this.productColors[this.selectTypeIndex].color_text

    if(this.selectTypeIndex){
      this.isActive = !this.isActive
    }
    else {
      this.isActive = false
    }
  }

  public setSwatchColor(color: Record<any, any>) {
    this.$emit('setSwatchColor',color)
  }

  public changeColor(color: Record<any, any>) {
    let pantoneColor = getClosestColor(color.hex)
    this.setSwatchColor({hex: pantoneColor.hex.toUpperCase(), name: pantoneColor.name, pantone: pantoneColor.pantone})
    this.pantoneColorVal = pantoneColor.pantone
  }

  public changePantoneColor() {
    let pantoneColor = getPantoneColor(this.pantoneColorVal)
    if (pantoneColor) {
      this.setSwatchColor({hex: pantoneColor.hex.toUpperCase(), name: pantoneColor.name, pantone: pantoneColor.pantone })
      this.$emit('update:defSwatchColor',  pantoneColor.hex)
      this.pantoneMessage = ''
    }
    else {
      this.pantoneMessage = 'Color Not in List.'
    }
  }

  public setColor(color: Record<any, any>) {
    let pantoneColor = getClosestColor(color.value)
    this.$emit('update:defSwatchColor',  color.value)
    this.pantoneColorVal = pantoneColor.pantone
    this.setSwatchColor({hex: color.value, name: color.name, pantone: pantoneColor.pantone})
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
