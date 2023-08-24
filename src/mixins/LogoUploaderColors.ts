import {Component, Mixins} from "vue-property-decorator";
import Store from '@/store'
import {setDefaultColors, setUndoRedoItems} from '@/helpers/Helpers'

import { HideUpdateLockerButton } from '@/mixins/SelectedProductMixin'

@Component
export class LogoUploaderColors extends Mixins(HideUpdateLockerButton) {
  public active_logo_color_index = -1
  public pulse_info: Record<any, any> = {
    use_original_colors: true, shuffle: true, use_logo_colors: true
  }

  get logoColorsInfo() {
    return this.$store.getters.getLogoColorsInfo()
  }

  public setSwatchColor(color: Record<any, any>) {
    const self: Record<any, any> = this
    const payload = {color_info : color , index : this.active_logo_color_index}
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
    const self: Record<any, any> = this
    this.pulse_info.use_original_colors = false
    this.logoColorsInfo.colors = JSON.parse(JSON.stringify(this.logoColorsInfo.extracted_colors))
    this.logoColorsInfo.using_logo_colors = false
    this.logoColorsInfo.is_shuffled = false
    Store.commit('SET_DEFAULT_COLORS', [])
    self.$eventBus.$emit('useProductOriginalColors')
    this.hideLockerProductUpdateButton()
  }

  public async useLogoColors() {
    const self: Record<any, any> = this
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
    const self: Record<any, any> = this
    this.pulse_info.shuffle = false
    await setUndoRedoItems('defaultColors', 'logo_colors_shuffled')
    const shuffled  = this.logoColorsInfo.colors.sort(() =>  0.5 - Math.random())
    this.$store.commit('SET_LOGO_COLORS_INFO', {data: {colors: shuffled, is_shuffled: true}})
    setDefaultColors()
    self.$eventBus.$emit('changeDefaultColors')
    this.hideLockerProductUpdateButton()
  }

  public selectLogoColor(logo_color?: Record<any, any>, logo_color_index?: number) {
    if(this.active_logo_color_index == logo_color_index) {
      this.active_logo_color_index = -1
    }
    else {
      this.active_logo_color_index = logo_color_index || 0
    }
    this.hideLockerProductUpdateButton()
  }
}
