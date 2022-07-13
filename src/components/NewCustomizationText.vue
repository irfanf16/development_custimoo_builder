<template>
  <div class="customization-text-area">
    <div class="px-3 pt-3 p-lg-4" v-for="(product_custom_text, customTextIndex) in product_custom_texts" :key="`parent-${customTextIndex}`">
      <h2 class="fw-bold mb-2 fz-18 d-flex align-items-center justify-content-between">
        <span>{{ product_custom_text.label }}</span>
      </h2>

      <div class="d-flex">
        <b-form-input class="mb-2 mr-sm-2 mb-sm-0" placeholder="Type Here" :value="product_custom_text.value"
                      @input="handleCustomTextInputChange($event, customTextIndex)"></b-form-input>
        <button v-b-toggle="`accordion-${customTextIndex}`"
                class="d-flex align-items-center btn btn-secondary light">
          <span class="minus d-flex align-items-center">
            <BIconDash class="minus" /> Collapse
          </span>
          <span class="plus d-flex align-items-center">
            <BIconPlus class="plus" /> Expand
          </span>
        </button>
      </div>
      <b-collapse accordion="my-accordion" :id="`accordion-${customTextIndex}`"  :ref="`accordion-${customTextIndex}`" role="tabpanel">
        <div class="font-type-area">

          <div class="fade-right w-100 py-2">
            <div class="overflow-auto d-flex align-items-center theme-scroll-h pointer pb-2 gap-2 fontList ">
              <div v-for="(product_font, product_font_index) in product_fonts" :key="`product_font_${product_font_index}`"
                   :style="{ fontSize: '20px',  fontFamily: product_font.value}"
                   style="white-space: nowrap"
                   :class="{ 'pr-3': product_font_index + 1 == product_fonts.length }" role="button">
                <span :key="`product_custom_text_${customTextIndex}_font-${product_font_index}`"
                      v-b-tooltip.right="product_custom_text.value ? product_font.label : ''">
                  {{product_custom_text.value ? product_custom_text.value : product_font.value}}
                </span>
              </div>
            </div>
          </div>

        </div>
        <div >
          <div>
            Show
            <template v-for="(child_text, child_text_index) in product_custom_text.items.length">
              <b-form-checkbox v-model="product_custom_text.items[child_text_index].selected" :name="`custom_text_child_${child_text_index}_checkbox`"
              :key="`custom_text_child_${child_text_index}_checkbox`" @change="handleCustomTextCheckboxChange($event, customTextIndex)">
                {{ product_custom_text.items[child_text_index].label }}
              </b-form-checkbox>
            </template>
          </div>
          <div class="customization-tabs">
            <b-tabs content-class="mt-3" align="center">
              <template v-for="(product_custom_text_item, productCustomTextItemIndex) in product_custom_text.items">
                <b-tab v-model="product_custom_text.active_item_index" :key="`custom_${product_custom_text.type}_${customTextIndex}_children_${productCustomTextItemIndex}`">
                <!-- Tabs title slot -->
                  <template slot="title">
                    {{product_custom_text_item.label}}
                  </template>

                <!-- Tabs content starts -->

                  <h4 class="mt-3 mb-2 fz-16">Select Color</h4>
                  <div class="text-color-holder customization-tabs">
                    <b-tabs content-class="mt-3">
                      <b-tab v-for="(select_color_type, selectColorTypeIndex) in ['Fill Color', 'Outline Color']"
                             :key="`select_color_type_${selectColorTypeIndex}`">
                        <template slot="title">
                          <div class="color-circle" :style="{ background: true ? 'gray' : 'aliceblue' }"></div>
                          {{ select_color_type }}
                        </template>
                        <div class="customization-tabs">
                          <b-tabs>
                            <b-tab v-for="(product_color, productColorIndex) in product_colors" :key="`product_color_${productColorIndex}_${product_color.type}_type`">
                              <template slot="title">
                                {{product_color.name}}
                              </template>
                              <div class="color-holder">
                                <div class="color-container">
                                  <div class="color-box" v-for="(color, colorIndex) in product_color.colors" :style="{background: color.value}"
                                       :key="`product_color_${productColorIndex}_${product_color.type}_type_color_${colorIndex}`" :title="color.name"
                                        @click="customTextColorUpdated(customTextIndex, productCustomTextItemIndex, color)"></div>
                                </div>
                              </div>
                            </b-tab>
                          </b-tabs>
                        </div>
                      </b-tab>
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
  </div>
</template>

<script lang="ts">

import { Component, Mixins, Prop, Watch, Vue } from 'vue-property-decorator'
import ColorTabs from '@/components/ColorTabs.vue'
import TextColorTabs from "@/components/TextColorTabs.vue";
import { ProductColors, ProductFonts, SetSelectedProductCustomTexts } from "@/mixins/SelectedProductMixin";


@Component<NewCustomizationText>({
  components: {
    TextColorTabs,
    ColorTabs
  },
  async mounted() {
    let self: Record<any, any> = this;
    self.$eventBus.$on("setSelectedProductCustomTexts", await self.setSelectedProductCustomTexts)
    await self.productFonts()
    self.product_colors = await self.productColors()
  },
  filters: {
    capitalize: (value: string) => {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    }
  }
})

export default class NewCustomizationText extends Mixins(ProductColors, ProductFonts, SetSelectedProductCustomTexts) {
  /* component data properties goes here */
  public product_fonts: Record<any, any>[] = []
  public product_colors: Record<any, any>[] = []
  public product_custom_texts: Record<any, any>[] = []

  /* component props goes here */


  /* component getters/computed properties goes here */

  get getSelectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  /*
  * methods starts
  * */

  handleCustomTextInputChange(updatedVal: string, custom_text_index: number) {
    let self:Record<any, any> = this;
    self.product_custom_texts[custom_text_index].value = updatedVal;
    self.$store.commit("SET_NEW_CUSTOM_TEXTS", {index: custom_text_index, value: self.product_custom_texts[custom_text_index]})
    self.$eventBus.$emit("customTextUpdated", {index:custom_text_index, value: self.product_custom_texts[custom_text_index]});
  }

  handleCustomTextCheckboxChange(updatedVal: string, custom_text_index: number) {
    let self:Record<any, any> = this;
    console.log("custom_text_index", custom_text_index)
    self.$store.commit("SET_NEW_CUSTOM_TEXTS", {index: custom_text_index, value: self.product_custom_texts[custom_text_index]})
    self.$eventBus.$emit("customTextUpdated", {index:custom_text_index, value: self.product_custom_texts[custom_text_index]});
  }

  customTextColorUpdated( custom_text_index: number, custom_text_item_index: number, color: Record<any, any>,) {
    let self:Record<any, any> = this;
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].color = color.value;
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].color_pantone = color.name;
    self.$store.commit("SET_NEW_CUSTOM_TEXTS", {index: custom_text_index, value: self.product_custom_texts[custom_text_index]})
    self.$eventBus.$emit("customTextUpdated", {index:custom_text_index, value: self.product_custom_texts[custom_text_index]});
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
