<template>
  <div class="accordion mt-1" role="tablist">
    <b-tabs>
      <b-tab>
        <template #title>
          {{productColors[0].name | capitalize | removeExt}}
        </template>
        <div class="color-holder">
          <div class="color-container">
            <div class="color-box" v-for="(color, colorIndex) in productColors[0].color_text" :style="{background: color.value}"
                 :key="`product_color_${productColors[0].type}_type_color_${colorIndex}`" :title="color.name"
                 @click="updateLogoActiveColor(color)"></div>
          </div>
        </div>
      </b-tab>
      <b-tab v-if="lockerroomColors && lockerroomColors.length && isCustomerAuthenticated">
        <template #title>
          Locker colors
        </template>
        <div class="color-holder">
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
          <div class="color-container mt-1">
            <template v-for="(color, colorIndex) in JSON.parse(lockerroomColors[activeLockerIndex].folders[activeFolderIndex].color)">
              <div class="color-box" :style="{background: color.value}" v-if="color.value"
                   :key="`text_color_${colorIndex}${color.name}`" :title="color.name"
                   @click="updateLogoActiveColor(color)"></div>
            </template>
          </div>
        </div>
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
              @input="setLogoPantoneColor($event,activeLogoColor)"
              placeholder="XX-XXXX"
            ></b-form-input>
            <div class="text-danger fs-2" v-if="pantoneMessage != ''">{{pantoneMessage}}</div>
          </b-form>
          <div class="color-holder">
            <div class="color-container color-picker-container">
              <color-picker @changeColor="updateLogoActiveColor($event, 'color-picker')"
                            :colors-default="[]" :key="activeLogoColor.hex" :color="activeLogoColor.hex" theme="light"
                            :colors-history="false" :ref="`logo-color-picker`"/>
            </div>
          </div>
        </template>
      </b-tab>

      <!--                              <template #tabs-end>-->
      <!--                                <b-nav-item>Others</b-nav-item>-->
      <!--                                <b-nav-item v-if="selectedProduct.is_custom_color_allowed" :class="{ active: othersActive }" @click="selectType(index, true)"></b-nav-item>-->
      <!--                              </template>-->
    </b-tabs>

  </div>
</template>

<script lang="ts">
import {Component, Prop, Mixins} from 'vue-property-decorator'
import colorPicker from '@caohenghu/vue-colorpicker'

import {getClosestColor} from '@/pantoneColor'
import {getSelectedProductPantones, setDefaultColors} from "@/helpers/Helpers";
import ColorsTabMixin from "@/mixins/ColorsTabMixin";

@Component<LogoColorTabsNew>({
  components: {
    colorPicker
  },
  filters: {
    capitalize: (value: string) => {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    },
    removeExt: (value: string) => {
      if (!value) return ''
      value = value.toString()
      return value.replace(/\.[^/.]+$/, "")
    }
  },
})
export default class LogoColorTabsNew extends Mixins(ColorsTabMixin) {
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

  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
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

  get activeExtractedLogoColor() {
    return this.$store.getters.getLogoColorsInfo('extracted_colors')[this.logoColorIndex]
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
  public setLogoPantoneColor($event, color_object){
    const logo_color = this.changeLogoPantoneColor($event, color_object);
    if(logo_color){
      this.updateLogoActiveColor(this.activeLogoColor, 'color-picker')
    }
  }
  public updateLogoActiveColor(selected_color: Record<any, any>, emitter='') {
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
    Object.assign(this.activeExtractedLogoColor, this.activeLogoColor)
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

  .hu-color-picker .color-show ~ *{
    display: none !important;
  }
}
</style>
