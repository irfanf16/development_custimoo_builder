<template>
  <div class="customization-text-area">
    <div class="px-3 pt-3 p-lg-4" v-for="(product_custom_text, customTextIndex) in product_custom_texts" :key="`parent-${selectedProductId+customTextIndex}`">

      <h2 :key="`header-${selectedProductId+customTextIndex}`" class="fw-bold mb-2 fz-18 d-flex align-items-center justify-content-between">
        <span>{{ product_custom_text.label }}</span>
       <template v-if="product_custom_text.manually_added">
         <b-button class="ml-1 light" size="sm" style="min-width: unset; line-height: normal" variant="dark" :key="`custom_text_${customTextIndex}_removed_btn`"
                   @click="removeCustomText(customTextIndex)">
           <b-icon-x />
         </b-button>
       </template>
      </h2>

      <div :key="`main-${selectedProductId+customTextIndex}`" class="d-flex">
        <b-form-input :ref="`text-customize-${customTextIndex}`" :key="`text-${selectedProductId+customTextIndex}`" class="mb-2 mr-sm-2 mb-sm-0" placeholder="Type Here" :value="product_custom_text.value"
                      @input="handleCustomTextInputChange($event, customTextIndex)" @focusin="expandTextCustomizer(customTextIndex)" @keypress="preventSpace($event, product_custom_text.type)"></b-form-input>
        <button v-b-toggle="`text-accordion-${customTextIndex}`"
                class="d-flex align-items-center btn btn-secondary light">
          <span class="minus d-flex align-items-center">
            <BIconDash class="minus" /> Collapse
          </span>
          <span class="plus d-flex align-items-center">
            <BIconPlus class="plus" /> Expand
          </span>
        </button>
      </div>
      <b-collapse accordion="my-accordion" :visible="false" :key="`accordion-${selectedProductId+customTextIndex}`" :id="`text-accordion-${customTextIndex}`" :ref="`text-accordion-${customTextIndex}`" role="tabpanel">
          <div class="font-type-area">
            <div class="fade-right w-100 py-2">
              <div class="overflow-auto d-flex align-items-center theme-scroll-h pointer pb-2 fontList ">
                <div v-for="(product_font, product_font_index) in product_fonts" :key="`product_font_${product_font_index}`"
                     @click="handleCustomTextFontChange(customTextIndex,  product_font.value)"
                     :style="{ fontSize: '20px',  fontFamily: product_font.value}"
                     style="white-space: nowrap" @mouseenter="setLeft"
                     :class="{ 'pr-3': product_font_index + 1 == product_fonts.length }" role="button">
                  <div class="font_tooltip">{{product_custom_text.value ? product_font.label : ''}}</div>
                  <span :key="`product_custom_text_${customTextIndex}_font-${product_custom_text.font_family&&product_custom_text.font_family}`"
                        :style="{background: product_font.value == product_custom_text.font_family && 'rgba(24, 144, 118, 0.1)'}"
                        class="d-flex px-2 py-1 rounded-lg">
                    {{product_custom_text.value ? product_custom_text.value : product_font.value}}
                  </span>
              </div>
            </div>
          </div>

        </div>
        <div >
          <div class="customization-tabs show_hide_text">
            <b-tabs content-class="mt-3" class="sportswear-parts" align="center" @input="resetCustomTextColorIndex(product_custom_text)">
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

                <!-- Tabs content starts -->

                  <div v-if="product_custom_text" class="text-color-holder customization-tabs"
                       :class="{'no-outline': product_custom_text_item.outline_width == 0}">
                    <b-tabs content-class="mt-0" class="color-types" v-model="product_custom_text_item.color_tab_index"
                            @input="handleTextOutline(customTextIndex, productCustomTextItemIndex)">
                      <template v-for="(select_color_type, selectColorTypeIndex) in ['Fill Color', 'Outline Color']">
                        <b-tab :key="`select_color_type_${selectColorTypeIndex}`">
                          <template #title>
                            <div class="color-circle" :style="{ background: selectColorTypeIndex == 0 ?
                             product_custom_text_item.color :
                             product_custom_text_item.outline_color }"
                            ></div>
                            {{ select_color_type }}
                          </template>
                          <div class="customization-tabs">
                            <div class="outline-slider-area d-flex justify-content-between pt-2">
                              <template v-if="product_custom_text_item.outline_enabled">
                                <div class="mr-sm-2 mb-sm-0" v-show="product_custom_text_item.color_tab_index == 1">
                                  <label class="mt-1" :for="`custom_text_${customTextIndex}_child_${productCustomTextItemIndex}_outline`">
                                    Outline Width:
                                    <span class="font-weight-bolder">{{ product_custom_text_item.outline_width }}px</span>
                                  </label>
                                  <b-form-input class="mt-2" type="range" min="0" max="10" step="1"
                                                :value="product_custom_text_item.outline_width"
                                                :name="`custom_text_${customTextIndex}_child_${productCustomTextItemIndex}_outline`"
                                                :key="`custom_text_${customTextIndex}_child_${productCustomTextItemIndex}_outline`"
                                                :id="`custom_text_${customTextIndex}_child_${productCustomTextItemIndex}_outline`"
                                                :ref="`custom_text_${customTextIndex}_child_${productCustomTextItemIndex}_outline`"
                                                @change="handleCustomTextOutlineUpdate($event, customTextIndex, productCustomTextItemIndex)"></b-form-input>
                                </div>
                              </template>
                              <div>
                                <label :for="`custom_text_${customTextIndex}_child_${productCustomTextItemIndex}_placement`">Placement</label>
                                <b-form-select :style="{ fontSize: '14px', height: '35px', outline: 'none', boxShadow: 'none' }" :value="product_custom_text_item.placement"
                                               :options="['Front', 'Back']" :name="`custom_text_${customTextIndex}_child_${productCustomTextItemIndex}_placement`"
                                               :key="`custom_text_${customTextIndex}_child_${productCustomTextItemIndex}_placement`"
                                               @change="handleCustomTextPlacementUpdate($event, customTextIndex, productCustomTextItemIndex)"
                                ></b-form-select>
                              </div>
                            </div>

                            <b-tabs>
                              <b-tab v-for="(product_color, productColorIndex) in productColors" :key="`product_color_${productColorIndex}_${product_color.type}_type`">
                                <template #title>
                                  {{product_color.name | capitalize | removeExt}}
                                </template>
                                <div class="color-holder" @wheel="bindScroll" @scroll="bindScroll" @touchmove="bindScroll">
                                  <div class="color-container">
                                    <div class="color-box" v-for="(color, colorIndex) in product_color.color_text" :style="{background: color.value}"
                                        :key="`product_color_${productColorIndex}_${product_color.type}_type_color_${colorIndex}`" :title="color.name"
                                          @click="customTextColorUpdated(customTextIndex, productCustomTextItemIndex, color, select_color_type)"></div>
                                  </div>
                                </div>
                              </b-tab>
                              <b-tab v-if="logoColorsInfo && logoColorsInfo.length">
                                <template #title>
                                  Team logo colors
                                </template>
                                <div class="color-holder" @wheel="bindScroll" @scroll="bindScroll" @touchmove="bindScroll">
                                  <div class="color-container">
                                    <template v-for="(color, colorIndex) in logoColorsInfo">
                                      <div class="color-box" :style="{background: color.hex}" v-if="color.hex"
                                           :key="`text_color_${colorIndex}${color.name}`" :title="color.name"
                                           @click="customTextColorUpdated(customTextIndex, productCustomTextItemIndex, {name: color.name, value: color.hex, position: '1'}, select_color_type)"></div>
                                    </template>
                                  </div>
                                </div>
                              </b-tab>
                              <b-tab v-if="lockerroomColors && lockerroomColors.length && isCustomerAuthenticated">
                                <template #title>
                                  Locker colors
                                </template>
                                <div class="color-holder" @wheel="bindScroll" @scroll="bindScroll" @touchmove="bindScroll">
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
                                           @click="customTextColorUpdated(customTextIndex, productCustomTextItemIndex, {...color, position: '1'}, select_color_type)"></div>
                                    </template>
                                  </div>
                                </div>
                              </b-tab>
                              <b-tab v-if="selectedProduct.is_custom_color_allowed">
                                <template #title>
                                  Other
                                </template>
                                <div class="color-holder" @wheel="bindScroll" @scroll="bindScroll" @touchmove="bindScroll">
                                  <div class="color-container">
                                    <div>
                                      <div class="d-flex align-items-start">
                                        <div class="mt-3">
                                          Pantone (xxx c):
                                        </div>
                                        <div class="p-2" v-if="getColorType !== 'product_color'">
                                          <div v-if="selectColorTypeIndex==0">
                                            <b-form-input
                                              @focusin="($event)=>$event.target.select()"
                                              :value="product_custom_text_item.color_pantone"
                                              class="mb-2 mr-sm-2 mb-sm-0"
                                              :placeholder="place_holder"
                                              @input="changePantoneColor($event, customTextIndex, productCustomTextItemIndex, 'Fill Color')"
                                            ></b-form-input>
                                          </div>

                                          <div v-else>
                                            <b-form-input
                                              @focusin="($event)=>$event.target.select()"
                                              :value="product_custom_text_item.outline_color_pantone"
                                              class="mb-2 mr-sm-2 mb-sm-0"
                                              :placeholder="place_holder"
                                              @input="changePantoneColor($event, customTextIndex, productCustomTextItemIndex, 'Outline Color')"
                                            ></b-form-input>
                                          </div>
                                          <div v-if="pantoneMessage" class="pantone-message p-2 text-danger">
                                            {{ pantoneMessage }}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <color-picker @changeColor="changeColor($event, customTextIndex, productCustomTextItemIndex, select_color_type)"
                                      theme="light" :colors-default="[]" :key="selectColorTypeIndex == 0 ? product_custom_text_item.color : product_custom_text_item.outline_color"
                                      :color="selectColorTypeIndex == 0 ? product_custom_text_item.color : product_custom_text_item.outline_color"
                                      :sucker-hide="true" :ref="`text-color-picker${customTextIndex}${productCustomTextItemIndex}`"/>
                                  </div>
                                </div>
                              </b-tab>

<!--                              <template #tabs-end>-->
<!--                                <b-nav-item>Others</b-nav-item>-->
<!--                                <b-nav-item v-if="selectedProduct.is_custom_color_allowed" :class="{ active: othersActive }" @click="selectType(index, true)"></b-nav-item>-->
<!--                              </template>-->
                            </b-tabs>
                          </div>
                        </b-tab>
                      </template>
                    </b-tabs>
                  </div>



                <!-- Tabs content ends -->

                </b-tab>
              </template>
            </b-tabs>
          </div>
        </div>
      </b-collapse>
    </div>
    <div class="px-3 pt-3 p-lg-4 text-right" v-if="selectedProduct.allow_extra_text">
      <b-button class="add-logo-btn" @click="addCustomText(productColors)">
        +
      </b-button>
    </div>

  </div>
</template>

<script lang="ts">

import {Component, Mixins, Prop, Watch} from 'vue-property-decorator'
import ColorTabs from '@/components/ColorTabs.vue'
import TextColorTabs from "@/components/TextColorTabs.vue";
import TextCustomizationTab from "@/mixins/TextCustomizationTab";
import {find, filter} from "lodash";
import colorPicker from '@caohenghu/vue-colorpicker';
import {getSelectedProductPantones, santaClone, setUndoRedoItems, getLockerColors} from "@/helpers/Helpers";
import {getClosestColor, getColorEncoding} from "@/pantoneColor";


@Component<CustomizationText>({
  components: {
    TextColorTabs,
    ColorTabs,
    colorPicker
  },
  async mounted() {
    let self: Record<any, any> = this;

    await this.productFonts();

    await getLockerColors();
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

export default class CustomizationText extends Mixins(TextCustomizationTab) {
  @Prop({required: true}) customTextIndex!: number
  @Prop({required: true}) productColors!: Record<any, any>[]
  /* component data properties goes here */
  public default_font_obj = ''
  public selected_font = '';
  public colors: [] = []

  /* component props ends here */

  /* component getters/computed properties goes here */

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get lockerColors() {
    return this.$store.getters.getLockerColors
  }

  /*
  * methods starts
  * */

  @Watch('customTextIndex')
  customTextIndexChanged(){
    const activeTextField = this.customTextIndex > -1 && this.$refs[`text-customize-${this.customTextIndex}`] as Record<any, any>;
    activeTextField[0].focus();
  }

  public setLeft($event:Record<any, any>){
    $event.target.children[0].style.top = ($event.pageY + 30)+"px"
    $event.target.children[0].style.left = $event.pageX+"px"
  }

  private expandTextCustomizer(custom_text_index: number){
    (this.$refs[`text-accordion-${custom_text_index}`] as Record<any, any>)[0].show = true;
  }

  private preventSpace($event, type){
    if(type == 'number' && $event.key == ' '){
      $event.preventDefault();
    }
  }

  private collapseTextCustomizer(updatedVal: Record<any, any>, custom_text_index: number){
    let val = updatedVal.target.value
    if(val){
      return
    }else{
      (this.$refs[`text-accordion-${custom_text_index}`] as Record<any, any>)[0].show = false;
    }
  }
}
</script>

<style lang="scss" scoped>
.outline-slider-area {
  #range-2 {
    &::-webkit-slider-thumb {
      background: #189076;
    }
  }
}

.btn {
  min-width: 108px;

  .minus {
    display: none !important;
  }

  &.not-collapsed {
    .minus {
      display: flex !important;
    }

    .plus {
      display: none !important;
    }
  }
}
.customization-tabs .customization-text-area .text-color-holder .color-holder {
  min-height: 125px;
}
</style>
