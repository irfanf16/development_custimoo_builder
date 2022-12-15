<template>
  <div class="accordion mt-1" role="tablist">
    <b-card-body style="padding: 0 !important;">
      <b-tabs content-class="mt-1" class="logo-placement-tabs">
        <b-tab v-for="(productColor, productColorIndex) in productColors" :key="`color-tab-${productColorIndex}`">
          <template #title>
            {{ productColor.name | capitalize }}
          </template>
          <template>
           <div class="color-holder pt-2">
             <div class="color-container">
               <template v-for="(colorObject, colorObjectIndex) in productColor.color_text">
                 <div v-if="colorObject.value" class="color-box" @click="updateLogoActiveColor(colorObject)"
                      :title="colorObject.name" :style="{background: colorObject.value}"
                      :key="`product-${productColorIndex}-color-${colorObjectIndex}`"
                 >
                   <span v-if="activeLogoColor && activeLogoColor.hex == colorObject.value" class="selected" style="z-index: 100; opacity: 1">
                          <BIconCheck />
                   </span>
                 </div>
               </template>
             </div>
           </div>
          </template>
        </b-tab>
        <b-tab v-if="selectedProduct.is_custom_color_allowed">
          <template #title>
            Others
          </template>
          <template>
            <b-form class="pantone-color-field" v-on:submit.prevent>
              <label>Pantone: (TCX Colors)</label>
              <b-form-input
                :value="activeLogoColor ? activeLogoColor.pantone : 'XX-XXXX'"
                class="mb-2 mr-sm-2 mb-sm-0"
                placeholder="XX-XXXX" readonly
              ></b-form-input>
            </b-form>
            <div class="color-holder">
              <div class="color-container color-picker-container">
                <color-picker @changeColor="updateLogoActiveColor($event, 'color-picker')" theme="light"
                              :colors-history="false"/>
              </div>
            </div>
          </template>
        </b-tab>
      </b-tabs>
    </b-card-body>

  </div>
</template>

<script lang="ts">
import {Component, Prop, Watch, Vue} from 'vue-property-decorator'
import colorPicker from '@caohenghu/vue-colorpicker'

import {getClosestColor, getColorEncoding} from '@/pantoneColor'
import {getSelectedProductPantones, setDefaultColors} from "@/helpers/Helpers";

@Component<LogoColorTabsNew>({
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
})
export default class LogoColorTabsNew extends Vue {
  /*
  * props starts
  * */

  @Prop({required: true}) productColors!: any
  @Prop({required: true}) logoColorIndex!: number

  /*
  * props ends
  * */

  /*
  * data props starts
  * */

  public pantoneColorVal= null
  public showOther = false
  public colorImage = '/img/images/color-placeholder.png'

  /*
  * data props ends
  * */

  /*
  * computed props starts
  * */

  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }

  get colorTabs() {
    let color_tabs: string[] = [];
    this.productColors.forEach((product_color: Record<any, any>) => {
      color_tabs.push(product_color.name);
    })
    if(this.selectedProduct && this.selectedProduct.is_custom_color_allowed) {
      color_tabs.push("Others");
    }
    return color_tabs
  }

  get activeLogoColor() {
    return this.$store.getters.getLogoColorsInfo('colors')[this.logoColorIndex]
  }

  get getColorType(): string {
    return this.$store.getters.getSetting('color_type');
  }

  get logoColorsInfo() {
    return this.$store.getters.getLogoColorsInfo();
  }
  /*
  * computed props ends
  * */

  /*
  * methods starts
  * */
  public updateLogoActiveColor(selected_color: Record<any, any>, emitter=null) {
    let self: Record<any, any> = this;
    const selectProductPantonesList = getSelectedProductPantones()
    const color_value = emitter == 'color-picker' ? selected_color.hex : selected_color.value
    let pantone_color = getClosestColor(color_value, selectProductPantonesList,this.getColorType);
    ({ hex: this.activeLogoColor.hex, name: this.activeLogoColor.name, pantone: this.activeLogoColor.pantone } = pantone_color)
    this.activeLogoColor.pantone = pantone_color.pantone
    if(emitter == 'color-picker') {
      this.activeLogoColor.hex = pantone_color.hex
      this.activeLogoColor.name = pantone_color.name
    } else {
      this.activeLogoColor.hex = selected_color.value
      this.activeLogoColor.name = selected_color.name
    }
    setDefaultColors()
    if(this.logoColorsInfo.using_logo_colors){
      self.$eventBus.$emit('changeDefaultColors')
    }
  }

  /*
  * methods ends
  * */

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
