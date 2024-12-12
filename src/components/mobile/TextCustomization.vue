<template>
  <div>
    <b-tabs class="player_text mobile" v-if="selectedProductId" v-model="text_active_tab_index">
      <template v-for="(product_custom_text, customTextIndex) in product_custom_texts">
        <b-tab :key="customTextIndex" @click="setTextIndex(customTextIndex)">
          <template #title>
            {{ product_custom_text.label }}
          </template>

          <div class="">
            <div class="mobile_controls d-flex gap-1 align-items-center">
              <!--            <label class="d-flex align-items-center justify-content-between"><span>{{ customTexts[customTextIndex].type | capitalize }} {{ customTexts[customTextIndex].side }}</span></label>-->
              <div @click="changeSide(customTextIndex)" class="fs-6">
                <BIconArrowRepeat style="margin-top: 0px" />
              </div>
              <b-form-input :ref="`text-customize-${customTextIndex}`" :key="`text-${selectedProductId+customTextIndex}`" class="mb-2 mr-sm-2 mb-sm-0" placeholder="Type Here" :value="product_custom_text.value"
                            @input="handleCustomTextInputChange($event, customTextIndex)"></b-form-input>
              <b-button class="p-0 light remove-text align-self-start" size="sm" v-if="product_custom_text.manually_added"
                        style="min-width: unset; line-height: normal" variant="dark" @click.stop="removeCustomText(customTextIndex)">
                <b-icon-x />
              </b-button>
              <button style="line-height: normal; font-size: 20px; margin-top: -8px" @click="applySameTextStyle(customTextIndex)" class="btn text-white mr-1 border-0 p-1 btn-secondary btn-sm">
                <b-icon-files style="margin-top: 0;" />
              </button>
            </div>
          </div>
          <div class="fade-right py-2">
            <div class="overflow-auto d-flex align-items-center gap-2 hide-scroll fontList" v-if="product_fonts">
              <div v-for="(product_font, product_font_index) in product_fonts" style="white-space: nowrap"
                   :style="{ fontFamily: product_font.value}" :key="`product_font_${product_font_index}`"
                   @click="handleCustomTextFontChange(customTextIndex,  product_font.value)"
                   :class="{'pr-3': product_font_index+1 == fontOptions.length, 'activeFont': product_font.value == product_custom_text.font_family}">
                <span>
                  {{product_custom_text.value ? product_custom_text.value : product_font.value}}
                </span>
              </div>
            </div>
          </div>

          <div class="show_hide_text">
            <b-tabs class="sportswear-parts" content-class="mt-3" align="center" v-model="activeProductCustomTextItemIndex" @input="resetCustomTextColorIndex(product_custom_text)">
              <template v-for="(product_custom_text_item, productCustomTextItemIndex) in product_custom_text.items">
                <b-tab v-model="product_custom_text.active_item_index" :key="`custom_${product_custom_text.type}_${customTextIndex}_children_${productCustomTextItemIndex}`">
                  <!-- Tabs title slot -->
                  <template #title>
                    <span @click="($event)=>$event.stopPropagation()">
                      <b-form-checkbox v-model="product_custom_text.items[productCustomTextItemIndex].selected" :name="`custom_text_child_${productCustomTextItemIndex}_checkbox`"
                                       :key="`custom_text_child_${productCustomTextItemIndex}_checkbox`" @change="handleCustomTextCheckboxChange($event, customTextIndex, productCustomTextItemIndex)">
                      </b-form-checkbox>
                    </span>
                    {{product_custom_text_item.label}}
                  </template>

                  <b-tabs class="mt-2" v-model="product_custom_text_item.color_tab_index" @input="handleTextOutline(customTextIndex, productCustomTextItemIndex)">
                    <b-tab @click="setColorType('fill')">
                      <template #title>
                        <div class="d-flex align-items-center gap-1">
                          <span class="selected-color ml-2 flex-shrink-0" :style="{background: product_custom_text_item.color}"></span>
                          <span>Fill</span>
                        </div>
                      </template>
                      <div class="overflow-hidden fade-right">
                        <ul class="mobile-nav horizontal active_underline hide-scroll pr-4">
                          <li v-for="(colorName, index) in productColors" :key="index">
                            <a class="faded_text text-capitalize" :class="activeCollection == index ? 'active_dark' : ''" @click="setActiveCollection(index)">{{colorName.name}}</a>
                          </li>
                          <li v-if="logoColorsInfo && logoColorsInfo.length">
                            <a class="faded_text text-capitalize" :class="activeCollection == productColors.length ? 'active_dark' : ''"
                               @click="setActiveCollection(productColors.length)">Team logo colors</a>
                          </li>
                          <li v-if="isCustomerAuthenticated && lockerroomColors && lockerroomColors.length">
                            <a class="faded_text text-capitalize" :class="activeCollection == productColors.length + 1 ? 'active_dark' : ''"
                               @click="setActiveCollection(productColors.length + 1)">Locker colors</a>
                          </li>
                          <li v-if="selectedProduct.is_custom_color_allowed">
                            <a class="faded_text text-capitalize" @click="showOther">Custom color</a>
                          </li>
                        </ul>
                      </div>

                      <div v-if="selectTypeIndex == (productColors.length + 1) && lockerroomColors && lockerroomColors.length" class="overflow-hidden fade-right">
                        <div class="d-flex align-items-center overflow-auto theme-scroll-h gap-1 py-2">
                          <template v-for="(room, i) in lockerroomColors">
                            <b-button size="sm" class="btn-locker-color" variant="secondary" @click="setActiveLockerIndex(i)" :class="{'active': i == activeLockerIndex, 'mr-4': i==lockerroomColors.length - 1}"
                                      :key="`locker_${i}`">
                              <!--                  {{ room && room.folders[0].folder_name}}-->
                              {{room && room.room_name}}
                            </b-button>
                          </template>
                        </div>

                        <div class="d-flex align-items-center overflow-auto theme-scroll-h gap-1 pb-2">
                          <b-button size="sm" class="btn-locker-folder" variant="secondary" :class="{'active': folder_i == activeFolderIndex, 'mr-4': folder_i==lockerroomColors[activeLockerIndex].folders.length - 1}" @click="setActiveFolderIndex(activeLockerIndex, folder_i)"
                                    v-for="(folder, folder_i) in lockerroomColors[activeLockerIndex].folders" :key="`folder_${activeLockerIndex}${folder_i}`">
                            {{folder.folder_name}}
                          </b-button>
                        </div>
                      </div>

                      <div v-if="productColors[activeCollection]" class="mt-2 overflow-auto hide-scroll d-flex gap-1" style="padding:6px">
                        <div class="color_circle" :key="index" v-for="(color, index) in productColors[activeCollection].color_text"
                             :style="{background: color.value, boxShadow: `0 0 0 3px white, 0 0 0 4px ${color.value}`}"
                             @click="customTextColorUpdated(customTextIndex, productCustomTextItemIndex, color, 'Fill Color')"></div>
                      </div>

                      <div v-if="activeCollection == productColors.length" class="mt-2 overflow-auto hide-scroll d-flex gap-1" style="padding:6px">
                        <template v-for="(ext_color, ext_index) in logoColorsInfo">
                          <div v-if="ext_color.hex"  class="color_circle" @click="customTextColorUpdated(customTextIndex, productCustomTextItemIndex, ext_color, 'Fill Color')"
                               :title="ext_color.name" :style="{background: ext_color.hex, boxShadow: `0 0 0 3px white, 0 0 0 4px ${ext_color.hex}`}" :key="'base-color' +ext_index + ext_color.name">
                          </div>
                        </template>
                      </div>
                      <template v-if="activeCollection == (productColors.length + 1)">
                        <div class="mt-2 overflow-auto hide-scroll d-flex gap-1" style="padding:6px">
                          <div class="color_circle" @click="customTextColorUpdated(customTextIndex, productCustomTextItemIndex, color, 'Fill Color')" :key="`locker_color${index}${activeLockerIndex}${activeFolderIndex}`"
                               v-for="(color, index) in JSON.parse(lockerroomColors[activeLockerIndex].folders[activeFolderIndex].color)"
                               :style="{background: color.value, boxShadow: `0 0 0 3px white, 0 0 0 4px ${color.value}`}">
                          </div>
                        </div>
                      </template>

                      <div v-if="showOtherColors && selectedProduct.is_custom_color_allowed" class="mobile-other">
                        <span class="close" @click="hideOther"><BIconX /></span>
                        <color-picker :colors-default="[]" @changeColor="changeColor" theme="light" :color="color" :sucker-hide="true"/>
                      </div>
                    </b-tab>

                    <b-tab @click="setColorType('outline')">
                      <template #title>
                        <div class="d-flex align-items-center gap-1">
                          <span class="selected-color ml-2 flex-shrink-0" :style="{background: product_custom_text_item.outline_color}"></span>
                          <span>Outline</span>
                        </div>
                      </template>
                      <template v-if="product_custom_text_item.outline_enabled">
                        <div class="mr-sm-2 gap-1 mb-sm-0 d-flex align-items-center" v-show="product_custom_text_item.color_tab_index == 1">
                          <label class="mt-1" :for="`custom_text_${customTextIndex}_child_${productCustomTextItemIndex}_outline`">
                            Outline:
                          </label>
                          <b-form-input class="mt-2" type="range" min="0" max="10" step="1"
                                        :value="product_custom_text_item.outline_width"
                                        :name="`custom_text_${customTextIndex}_child_${productCustomTextItemIndex}_outline`"
                                        :key="`custom_text_${customTextIndex}_child_${productCustomTextItemIndex}_outline`"
                                        :id="`custom_text_${customTextIndex}_child_${productCustomTextItemIndex}_outline`"
                                        :ref="`custom_text_${customTextIndex}_child_${productCustomTextItemIndex}_outline`"
                                        @change="handleCustomTextOutlineUpdate($event, customTextIndex, productCustomTextItemIndex)"></b-form-input>
                          <span class="outline-width">{{ product_custom_text_item.outline_width }}px</span>
                        </div>
                      </template>
                      <div class="overflow-hidden fade-right mt-1">
                        <ul class="mobile-nav horizontal active_underline hide-scroll pr-4">
                          <li v-for="(colorName, index) in productColors" :key="index">
                            <a class="faded_text text-capitalize" :class="activeCollection == index ? 'active_dark' : ''" @click="setActiveCollection(index)">{{colorName.name}}</a>
                          </li>
                        </ul>
                      </div>
                      <div v-if="productColors[activeCollection]" class="mt-2 overflow-auto hide-scroll d-flex gap-1" style="padding:6px">
                        <div class="color_circle" :key="index" v-for="(color, index) in productColors[activeCollection].color_text"
                             :style="{background: color.value, boxShadow: `0 0 0 3px white, 0 0 0 4px ${color.value}`}"
                             @click="customTextColorUpdated(customTextIndex, productCustomTextItemIndex, color, 'Outline Color')"></div>
                      </div>
                    </b-tab>
                  </b-tabs>
                </b-tab>
              </template>
            </b-tabs>
          </div>
        </b-tab>
      </template>

      <template #tabs-end v-if="selectedProduct.allow_extra_text">
          <li @click="addCustomText(productColors)" class="add_text_tab" style="font-size: 0.9em">Add <BIconPlus/></li>
      </template>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop} from 'vue-property-decorator'
import colorPicker from '@caohenghu/vue-colorpicker'
import {getClosestColor} from "@/pantoneColor";
import {getLockerColors, getSelectedProductPantones} from "@/helpers/Helpers";
import { findIndex } from 'lodash'
import TextCustomizationTab from "@/mixins/TextCustomizationTab";
import {watch} from "vue";

@Component<TextCustomization>({
  components: {
    colorPicker
  },
  mounted() {
    this.$eventBus.$on("customTextTabChanged", this.handleCustomTextTabChanged)
    getLockerColors();
    this.$nextTick(() => {
      this.selectType(this.selectTypeIndex)
    });
    this.productFonts();
    this.getColors()
    this.productColorsManipulation()
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
  }
})

export default class TextCustomization extends Mixins(TextCustomizationTab) {
  private activeCollection = 0;
  public productColors: any[] = []
  @Prop({required: true}) fontsColors!: any
  @Prop({required: true}) fontOptions!: any
  public customTextIndex: any = 0
  public fontColorType = 'fill'
  public fontColorIndex = 0
  public selectTypeIndex = 0
  public fontColor: any[] = []
  private activeColors: any[] = []
  public showOtherColors = false
  public pantoneColorVal= '13-4411'
  public color= '#59c7f9'
  public activeProductCustomTextItemIndex = 0
  public text_active_tab_index = 0

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

    if(this.logoColors.length){
      let logoColorsNew: any[] = []
      this.logoColors.forEach((color: any, index: number) => {
        logoColorsNew = logoColorsNew.concat([{name: color.pantone, value: color.hex, position: index+1}])
      })
      let teamLogoColors = [{name: 'Team Logo Colors', color_text: logoColorsNew, selectedColor: ''}]
      this.productColors = this.productColors.concat(teamLogoColors)
    }
  }

  public changeSide(customTextIndex:number){
    let current_side = this.product_custom_texts[customTextIndex].items[this.activeProductCustomTextItemIndex].placement == 'Back' ? 'Front': 'Back';
    this.handleCustomTextPlacementUpdate(current_side, customTextIndex, this.activeProductCustomTextItemIndex)
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

  private setTextIndex(index:number){
    this.customTextIndex = index;
    this.fontColorIndex = index;
  }

  private setColorType(colorType:string){
      this.fontColorType = colorType
  }

  public handleCustomTextTabChanged(tab_index: number) {
    this.text_active_tab_index = tab_index
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
.outline-width{
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--theme-color-light);
  color: var(--theme-color);
  font-weight: bold;
  height: 36px;
  width: 36px;
  margin-top: 3px;
  font-size: smaller;
  flex-shrink: 0;
  border-radius: 100px;
}
.selected-color{
  height: 15px;
  width: 15px;
  border-radius: 10000px;
  background: transparent;
  display: inline-block;
  box-shadow: 0px 1px 5px rgba(0,0,0,0.4);
}
</style>
