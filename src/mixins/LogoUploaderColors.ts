import {Component, Mixins} from "vue-property-decorator";
import Store from '@/store'
import {getSelectedProductPantones, santaClone, setDefaultColors, setUndoRedoItems} from '@/helpers/Helpers'

import { HideUpdateLockerButton } from '@/mixins/SelectedProductMixin'
import {getClosestColor} from "@/pantoneColor";

@Component
export class LogoUploaderColors extends Mixins(HideUpdateLockerButton) {
  public active_logo_color_index = -1

  get logoColorsInfo() {
    return this.$store.getters.getLogoColorsInfo()
  }

  get lastActiveProductData() {
    return this.$store.getters.getLastActiveProductData
  }

  get mobileScreen(): boolean {
    return this.$store.getters.getManageComponents.mobileScreen
  }

  get allow_shuffle_colors() : string {
    return this.$store.getters.getSetting('allow_shuffle_colors');
  }

  get products() {
    return this.$store.getters.getProducts
  }

  get product_custom_texts() {
    return this.$store.getters.productCustomTexts()
  }

  get defaultColors(): Record<any, any>[] {
    return this.$store.getters.getDefaultColors.filter((defaultColor: Record<any, any>) => { return defaultColor.color })
  }

  get getColorType(): string {
    return this.$store.getters.getSetting('color_type');
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
    this.logoColorsInfo.colors = JSON.parse(JSON.stringify(this.logoColorsInfo.extracted_colors))
    this.logoColorsInfo.using_logo_colors = false
    this.logoColorsInfo.is_shuffled = false
    Store.commit('SET_DEFAULT_COLORS', [])
    Store.commit('SET_SHUFFLE_COLOR_NUMBER', 1)
    self.$eventBus.$emit('useProductOriginalColors')
    this.hideLockerProductUpdateButton()
  }

  public async useLogoColors(fire_event = true) {
    const self: Record<any, any> = this
    await setUndoRedoItems('defaultColors', 'use_logo_colors')
    if(fire_event) { // fire event true means its the first time we use logo colors so update logo colors in extracted colors so on product change we got the same color as shown
      this.logoColorsInfo.extracted_colors = santaClone(this.logoColorsInfo.colors)
    }
    let again_from_logo = true
    if(this.mobileScreen || this.allow_shuffle_colors) {
      again_from_logo = false
    }
    setDefaultColors(again_from_logo)
    this.$store.commit('SET_LOGO_COLORS_INFO', {data: {using_logo_colors: true}})
    if(fire_event) {
      Store.commit('SET_SHUFFLE_COLOR_NUMBER', 1)
      self.$eventBus.$emit('changeDefaultColors')
    }
    this.hideLockerProductUpdateButton()
    this.setTextColorsToLogoColors()
  }

  public async shuffleLogoColors() {
    const self: Record<any, any> = this
    await setUndoRedoItems('defaultColors', 'logo_colors_shuffled')
    let shuffled = [...this.logoColorsInfo.colors].sort(() => Math.random() - 0.5)
    while (JSON.stringify(shuffled) === JSON.stringify(this.logoColorsInfo.colors)) { // make sure that after shuffled the colors orders are different
      shuffled = [...this.logoColorsInfo.colors].sort(() => Math.random() - 0.5)
    }
    this.$store.commit('SET_LOGO_COLORS_INFO', {data: {colors: shuffled, is_shuffled: true}})
    setDefaultColors()
    Store.commit('SET_SHUFFLE_COLOR_NUMBER', Math.floor(Math.random() * 24) + 1)
    self.$eventBus.$emit('changeDefaultColors', true)
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

  public setTextColorsToLogoColors() {
    const hex = this.defaultColors.length > 1? this.defaultColors[1]?.color : this.defaultColors[0]?.color;
    for (const [product_id, product_custom_text] of Object.entries(this.product_custom_texts) as [string: any]) {
      const selectProductPantonesList = getSelectedProductPantones(product_id)
      const pantoneColor = getClosestColor(hex, selectProductPantonesList, this.getColorType)
      for (const [key, custom_text] of Object.entries(product_custom_text) as [string: any]) {
        if(custom_text.value == '') {
          custom_text.items.forEach((text_item) => {
            text_item.color = pantoneColor.hex
            text_item.color_pantone = pantoneColor.pantone
          })
        }
      }
    }
  }
}
