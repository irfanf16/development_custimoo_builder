<template>
  <div class="logo-placement-area extracted-color-area"
       v-if="logoColorsInfo.colors.length > 0 && selectedProduct.product_type == 'customized'">
    <h4 class="mb-0 mb-lg-4">Color Extracted from Logo</h4>
    <div class="mb-lg-3 w-100">
      <div class="color-holder">
        <div class="color-container pt-2">
          <div class="color-box" v-for="(logo_color, logoColorIndex) in logoColorsInfo.colors"
               @click="selectLogoColor(logo_color, logoColorIndex)" :title="logo_color.name"
               :class="{'active-swatch' : logoColorIndex == active_logo_color_index, 'noColor': !logo_color.hex}"
               :style="{background: logo_color.hex ? logo_color.hex : '#fff', cursor: 'pointer'}" :key="logoColorIndex + logo_color.name">
            <template v-if="logo_color.hex">
              <span class="removeColor" @click="deleteLogoColor(logoColorIndex)">
                <BIconX />
              </span>
            </template>
            <template v-else>
              <BIconPlus class="addColor" />
            </template>
            <span class="selected">
              <BIconCheck />
            </span>
          </div>
          <LogoColorTabsNew v-if="active_logo_color_index >= 0" @setSwatchColor="setSwatchColor" :productColors="product_colors"
                            :logoColorIndex="active_logo_color_index"
          />
        </div>
      </div>
      <div class="d-flex align-items-center justify-content-center gap-1">
        <b-button @click="useOriginalColors()" class="use-btn flex-shrink-1" v-if="logoColorsInfo.using_logo_colors"
                  :class="{'pulse-animation': pulse_info.original_colors}"
                  style="white-space: nowrap; max-width: 200px">
          Use Original Colors
        </b-button>
        <b-button v-else="" @click="useLogoColors()" class="use-btn flex-shrink-1" style="white-space: nowrap;
         max-width: 200px" :class="{'pulse-animation': pulse_info.use_logo_colors}">
          Use Logo Colors
        </b-button>
        <b-button class="use-btn flex-shrink-1" @click="shuffleLogoColors()" v-if="logoColorsInfo.using_logo_colors"
                  :class="{'pulse-animation': !logoColorsInfo.is_shuffled}"
                  variant="secondary">Shuffle
        </b-button>
        <b-button class="use-btn flex-shrink-1" :class="{'invisible': !(logoColorsInfo.colors.length && logoColorsInfo.using_logo_colors)}"
                  style="width: auto" @click="rollbackPreviousColors()"
                   variant="secondary">
          <font-awesome-icon :icon="['fas', 'redo-alt']"/>
        </b-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {Component, Prop, Watch, Vue, Mixins} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";
import {getProductColors, setDefaultColors, setUndoRedoItems} from '@/helpers/Helpers'
import LogoEditorModal from "@/components/LogoEditorModal.vue";
import LogoEditor from "@/components/Logo/LogoEditor.vue";
import ModalAction from "@/mixins/ModalAction";
import LogoDisclaimerModal from "@/components/Logo/LogoDisclaimerModal.vue";
import LogoColorTabsNew from "@/components/LogoColorTabsNew.vue";
import Store from "@/store";
import { HideUpdateLockerButton } from '@/mixins/SelectedProductMixin'

@Component<LogoExtractedColors>({
  components: { LogoEditorModal, LogoDisclaimerModal, LogoEditor, LogoColorTabsNew },
  mounted() {
   this.product_colors = getProductColors();
 }
})
export default class LogoExtractedColors extends Mixins(ErrorMessages, ModalAction, HideUpdateLockerButton) {

  /*
  * props starts here
  * */

  @Prop({ required: true }) customLogo!: Record<any, any>

  /*
  * props ends here
  * */

  /*
  * data props starts here
  * */

  public active_logo_color_index = -1
  public product_colors: Record<any, any>[] = []
  public pulse_info: Record<any, any> = {
    use_original_colors: true, shuffle: true, use_logo_colors: true
  }
  /*
  * data props ends here
  * */

  /*
  * computed props starts
  * */

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get logoColorsInfo() {
    return this.$store.getters.getLogoColorsInfo()
  }

  get usingLogoColors() {
    return this.logoColorsInfo.using_logo_colors
  }

  /*
  * computed props ends
  * */

  /*
  * Methods starts
  * */

  public setSwatchColor(color: Record<any, any>) {
    let self: Record<any, any> = this
    let payload = {color_info : color , index : this.active_logo_color_index}
    this.$store.dispatch('setDefaultColor', { index: this.active_logo_color_index, color: color.hex, pantone: color.pantone, name: color.name })
    this.$store.commit('SET_LOGO_COLOR', payload)
    self.$eventBus.$emit('changeDefaultColors')
    this.hideLockerProductUpdateButton()
  }


  public deleteLogoColor(logo_color_index: number) {
    this.logoColorsInfo.colors[logo_color_index] = { hex: null, name: null, pantone: null }
    this.$set(this.logoColorsInfo.colors, logo_color_index, { hex: null, name: null, pantone: null })
    this.hideLockerProductUpdateButton()
  }

  public useOriginalColors() {
    let self: Record<any, any> = this
    this.pulse_info.use_original_colors = false
    this.logoColorsInfo.colors = JSON.parse(JSON.stringify(this.logoColorsInfo.extracted_colors))
    this.logoColorsInfo.using_logo_colors = false
    this.logoColorsInfo.is_shuffled = false
    Store.commit('SET_DEFAULT_COLORS', [])
    self.$eventBus.$emit('useProductOriginalColors')
    this.hideLockerProductUpdateButton()
  }

  public async useLogoColors() {
    let self: Record<any, any> = this
    this.pulse_info.use_logo_colors = false
    await setUndoRedoItems('defaultColors', 'use_logo_colors')
    setDefaultColors()
    this.$store.commit('SET_LOGO_COLORS_INFO', {data: {using_logo_colors: true}})
    self.$eventBus.$emit('changeDefaultColors')
    this.hideLockerProductUpdateButton()
  }

  public rollbackPreviousColors() {
    console.log('useLogoColors')
  }

  public async shuffleLogoColors() {
    let self: Record<any, any> = this
    this.pulse_info.shuffle = false
    await setUndoRedoItems('defaultColors', 'logo_colors_shuffled')
    const shuffled  = this.logoColorsInfo.colors.sort(() =>  0.5 - Math.random())
    this.$store.commit('SET_LOGO_COLORS_INFO', {data: {colors: shuffled, is_shuffled: true}})
    setDefaultColors()
    self.$eventBus.$emit('changeDefaultColors')
    this.hideLockerProductUpdateButton()
  }

  public selectLogoColor(logo_color: Record<any, any>, logo_color_index: number) {
    if(this.active_logo_color_index == logo_color_index) {
      this.active_logo_color_index = -1
    }
    else {
      this.active_logo_color_index = logo_color_index
    }
    this.hideLockerProductUpdateButton()
  }
  /*
  * Methods ends
  * */
}

</script>

<style lang="scss" scoped>

</style>
