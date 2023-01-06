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
                      @input="handleCustomTextInputChange($event, customTextIndex)" @focusin="expandTextCustomizer(customTextIndex)"></b-form-input>
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
                  <span :key="`product_custom_text_${customTextIndex}_font-${selected_font&&selected_font}`"
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
            <b-tabs content-class="mt-3" align="center" @input="resetCustomTextColorIndex(product_custom_text)">
              <template v-for="(product_custom_text_item, productCustomTextItemIndex) in product_custom_text.items">
                <b-tab v-model="product_custom_text.active_item_index" :key="`custom_${product_custom_text.type}_${customTextIndex}_children_${productCustomTextItemIndex}`">
                <!-- Tabs title slot -->
                  <template slot="title">
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
                          <template slot="title">
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
      <b-button class="add-logo-btn" @click="addCustomText">
        +
      </b-button>
    </div>

  </div>
</template>

<script lang="ts">

import {Component, Mixins, Prop, Vue, Watch} from 'vue-property-decorator'
import ColorTabs from '@/components/ColorTabs.vue'
import TextColorTabs from "@/components/TextColorTabs.vue";
import {HideUpdateLockerButton, ProductFonts} from "@/mixins/SelectedProductMixin";
import {find, filter} from "lodash";
import colorPicker from '@caohenghu/vue-colorpicker';
import {getSelectedProductPantones, santaClone, setUndoRedoItems} from "@/helpers/Helpers";
import {getClosestColor, getColorEncoding} from "@/pantoneColor";


@Component<CustomizationText>({
  components: {
    TextColorTabs,
    ColorTabs,
    colorPicker
  },
  async mounted() {
    let self: Record<any, any> = this;

    await this.productFonts()
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

export default class CustomizationText extends Mixins(ProductFonts, HideUpdateLockerButton) {
  @Prop({required: true}) customTextIndex!: number
  @Prop({required: true}) productColors!: Record<any, any>[]
  /* component data properties goes here */
  public product_fonts: Record<any, any>[] = []
  public default_font_obj = ''
  public pantoneMessage = ''
  public selected_font = '';

  /* component props ends here */

  public bindScroll($event:Record<any, any>){
    $event.stopPropagation()
  }

  /* component getters/computed properties goes here */

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }
  get selectedProductId(): Record<any, any> {
    return this.$store.getters.getSelectedProductId
  }
  get logoColorsInfo() {
    return filter(this.$store.getters.getLogoColorsInfo('extracted_colors'), 'hex')
  }

  get lockerColors() {
    return this.$store.getters.getLockerColors
  }

  get getColorType(): string {
    return this.$store.getters.getSetting('color_type');
  }

  get product_custom_texts(): Record<any, any>[] {
    return this.$store.getters.productCustomTexts(this.selectedProductId)
  }

  get all_products_custom_texts() {
    return this.$store.getters.productCustomTexts()
  }

  get place_holder() {
    if(this.getColorType === 'cmyk') {
      return 'x,x,x,x';
    } else if(this.getColorType === 'pantone-coated') {
      return 'xxx c';
    } else if(this.getColorType === 'pantone-tcx') {
      return 'xx-xxxx';
    }
    return '';
  }

  /*
  * methods starts
  * */

  @Watch('customTextIndex')
  customTextIndexChanged(){
    const activeTextField = this.customTextIndex > -1 && this.$refs[`text-customize-${this.customTextIndex}`] as Record<any, any>;
    activeTextField[0].focus();
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

  public changePantoneColor($event: string, customTextIndex: number, productCustomTextItemIndex: number, select_color_type: string) {
    let fill_type = select_color_type=='Fill Color' ? 0 : 1;
    let color_code = this.extractExactCode($event)? this.extractExactCode($event) : (fill_type==0 ? this.product_custom_texts[customTextIndex].items[productCustomTextItemIndex].color : this.product_custom_texts[customTextIndex].items[productCustomTextItemIndex].outline_color);
    let pantoneColor = getColorEncoding(color_code, this.getColorType);
    const color_picker = this.$refs[`text-color-picker${customTextIndex}${productCustomTextItemIndex}`] as Record<any, any>;
    if (pantoneColor) {
      let color = {value: pantoneColor.hex.toUpperCase(), pantone: color_code.toUpperCase(), name: pantoneColor.pantone}
      this.customTextColorUpdated(customTextIndex, productCustomTextItemIndex, color, select_color_type);
      console.log(color_picker[fill_type].$forceUpdate());
      this.pantoneMessage = ''
    }
    else {
      this.pantoneMessage = 'The color is not in the list.'
    }
  }

  public changeColor($event:Record<any, any>, customTextIndex:number, productCustomTextItemIndex:number, select_color_type:string) {
    const selectProductPantonesList = getSelectedProductPantones()
    let pantoneColor = getClosestColor($event.hex,selectProductPantonesList, this.getColorType);
    let color = {value: pantoneColor.hex, position: '1', name: pantoneColor.pantone}
    this.customTextColorUpdated(customTextIndex, productCustomTextItemIndex, color, select_color_type)
  }

  public handleTextOutline(custom_text_index:number, custom_text_item_index:number) {
    let self: Record<any, any> = this;
    let custom_text_item = this.product_custom_texts[custom_text_index].items[custom_text_item_index]
    if(custom_text_item.color_tab_index == 1 && custom_text_item.outline_width == 0){
      custom_text_item.outline_width = 3;
      self.$eventBus.$emit("customTextUpdated", {
        emitter: "outline_width", custom_text_index:custom_text_index, custom_text_item_index: custom_text_item_index,
        value: self.product_custom_texts[custom_text_index]
      });
    }
  }

  public resetCustomTextColorIndex(product_custom_text: Record<any, any>) {
    product_custom_text.items.forEach((custom_text_item: Record<any, any>) => {
      custom_text_item.color_tab_index = 0
    })
  }

  public setLeft($event:Record<any, any>){
    $event.target.children[0].style.top = ($event.pageY + 30)+"px"
    $event.target.children[0].style.left = $event.pageX+"px"
  }

  public handle_text_change_timer = 0 // this will hold the id returned by the setTimeout()

  private expandTextCustomizer(custom_text_index: number){
    (this.$refs[`text-accordion-${custom_text_index}`] as Record<any, any>)[0].show = true;
  }

  private collapseTextCustomizer(updatedVal: Record<any, any>, custom_text_index: number){
    let val = updatedVal.target.value
    if(val){
      return
    }else{
      (this.$refs[`text-accordion-${custom_text_index}`] as Record<any, any>)[0].show = false;
    }
  }



  handleCustomTextInputChange(updatedVal: string, custom_text_index: number) {
    this.hideLockerProductUpdateButton()
    clearTimeout (this.handle_text_change_timer);
    this.handle_text_change_timer = setTimeout(async () => {
      await setUndoRedoItems('customTexts', 'input_changed')
      let self:Record<any, any> = this;
      let updated_custom_text = this.product_custom_texts[custom_text_index]
      updated_custom_text.value = updatedVal;
      let product_ids = [updated_custom_text.product_id, ...updated_custom_text.following_product_ids]
      product_ids.forEach((product_id) => {
        self.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", { index: custom_text_index, product_id: product_id, value: {value: updatedVal}})
      })
      self.$eventBus.$emit("customTextUpdated", {
        emitter: "input", custom_text_index:custom_text_index, custom_text_item_index: null, value: santaClone(updated_custom_text)
      });
      if(updated_custom_text.is_first_name || updated_custom_text.is_first_number) {
        const roster_key = self.product_custom_texts[custom_text_index].type == 'name' ? 'text' : 'number';
        self.$store.dispatch('setProductsRosters', {product_id: self.selectedProduct.id, roster_index: 0, roster_data: { [roster_key] : updatedVal } })
      }
    }, 300)
  }

  async handleCustomTextCheckboxChange(updatedVal: string, custom_text_index: number, custom_text_item_index: number) {
    let self:Record<any, any> = this;
    await this.hideLockerProductUpdateButton()
    await setUndoRedoItems('customTexts', 'check_box_updated')
    let updated_custom_text = this.product_custom_texts[custom_text_index]
    let updated_custom_text_product_id = updated_custom_text.product_id
    let product_ids = [updated_custom_text_product_id, ...updated_custom_text.following_product_ids]
    product_ids.forEach((product_id) => {
      const product_custom_text_item = this.all_products_custom_texts[product_id][custom_text_index].items[custom_text_item_index]
      if(product_custom_text_item) {
        product_custom_text_item.selected = updatedVal
        this.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", {index: custom_text_index, product_id: product_id,
          value: {value: this.all_products_custom_texts[updated_custom_text_product_id][custom_text_index].value, items: this.all_products_custom_texts[product_id][custom_text_index].items}
        })
      }
    })
    self.$eventBus.$emit("customTextUpdated", {
      emitter: "checkbox", custom_text_index:custom_text_index, custom_text_item_index: null, value: self.product_custom_texts[custom_text_index]
    });
  }

  async customTextColorUpdated( custom_text_index: number, custom_text_item_index: number, color: Record<any, any>, type: string) {
    let self:Record<any, any> = this;
    await this.hideLockerProductUpdateButton()
    await setUndoRedoItems('customTexts', 'color_updated')
    if(type == "Fill Color") {
      self.product_custom_texts[custom_text_index].items[custom_text_item_index].color = color.value;
      self.product_custom_texts[custom_text_index].items[custom_text_item_index].color_pantone = color.name;
    }
    else if(type == "Outline Color") {
      self.product_custom_texts[custom_text_index].items[custom_text_item_index].outline_color = color.value;
      self.product_custom_texts[custom_text_index].items[custom_text_item_index].outline_color_pantone = color.name;
    }
    self.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", { index: custom_text_index, value: self.product_custom_texts[custom_text_index]})
    self.$eventBus.$emit("customTextUpdated", {
      emitter: type, custom_text_index:custom_text_index, custom_text_item_index: custom_text_item_index, value: self.product_custom_texts[custom_text_index]
    });
  }

  async handleCustomTextOutlineUpdate( outline_value: number, custom_text_index: number, custom_text_item_index: number) {
    let self:Record<any, any> = this;
    await this.hideLockerProductUpdateButton()
    await setUndoRedoItems('customTexts', 'outline_updated')
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].outline_width = outline_value;
    self.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", { index: custom_text_index, value: self.product_custom_texts[custom_text_index]})
    self.$eventBus.$emit("customTextUpdated", {
      emitter: "outline_width", custom_text_index:custom_text_index, custom_text_item_index: custom_text_item_index, value: self.product_custom_texts[custom_text_index]
    });
  }

  async handleCustomTextPlacementUpdate( placement: number, custom_text_index: number, custom_text_item_index: number) {
    let self:Record<any, any> = this;
    await this.hideLockerProductUpdateButton()
    await setUndoRedoItems('customTexts', 'placement_updated')
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].placement = placement;
    self.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", { index: custom_text_index, value: self.product_custom_texts[custom_text_index]})
    self.$eventBus.$emit("customTextUpdated", {
      emitter: "placement", custom_text_index:custom_text_index, custom_text_item_index: custom_text_item_index, value: self.product_custom_texts[custom_text_index]
    });
  }
  async handleCustomTextFontChange(custom_text_index: number, selected_font: string) {
    let self:Record<any, any> = this;
    await this.hideLockerProductUpdateButton()
    await setUndoRedoItems('customTexts', 'font_updated')
    self.selected_font = selected_font;
    self.product_custom_texts[custom_text_index].font_family = selected_font;
    self.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", { index: custom_text_index, value: self.product_custom_texts[custom_text_index]})
    self.$eventBus.$emit("customTextUpdated", {
      emitter: "input", custom_text_index:custom_text_index, custom_text_item_index: null, value: self.product_custom_texts[custom_text_index]
    });
  }

  async addCustomText() {
    let self: Record<any, any> = this;
    await this.hideLockerProductUpdateButton()
    let custom_text = find(self.product_custom_texts, ['is_first_name', true]);
    if(custom_text == undefined) {
      custom_text = find(self.product_custom_texts, ['is_first_number', true]);
    }
    custom_text = self.resetCustomTextObject(custom_text);
    await setUndoRedoItems('customTexts', 'text_added')
    self.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", { index: self.product_custom_texts.length, value: custom_text })
    self.$eventBus.$emit("customTextUpdated", { emitter: "add_button" });
  }

  resetCustomTextObject(custom_text: Record<any, any>) {
    let self: Record<any, any> = this;
   this.hideLockerProductUpdateButton()
    let product_first_font = self.selectedProduct.namefonts.length > 0 ? self.selectedProduct.namefonts[0] : null;
    if(product_first_font) {
      self.default_font_obj = product_first_font.json_data.length > 0 ? product_first_font.json_data[0] : null;
    }
    let custom_text_names_count = filter(self.product_custom_texts, ['type', 'name']).length;
    if(self.default_font_obj == null) {
      let product_first_font = self.selected_product.namefonts.length > 0 ? self.selected_product.namefonts[0] : null;
      if(product_first_font) {
        self.default_font_obj = product_first_font.json_data.length > 0 ? product_first_font.json_data[0] : null;
      }
    }
    custom_text = JSON.parse(JSON.stringify(custom_text));
    custom_text = Object.assign(custom_text, {
      following_product_ids: [], following_products: [], font_family: self.default_font_obj ? self.default_font_obj.name : '',
      id: null, items: [{...custom_text?.items[0], ...{selected: true}}], label: 'Fixed Text ' + (custom_text_names_count + 1), type: 'name', updated_at: null, value: '',
      manually_added: true
    })
    if('is_first_name' in custom_text) {
      custom_text.is_first_name = false
    }
    if('is_first_number' in custom_text) {
      custom_text.is_first_number = false
    }
    custom_text.items[0] = Object.assign(custom_text.items[0], {
      color: this.productColors[0]?.color_text[0]?.value, color_pantone: this.productColors[0]?.color_text[0]?.name, font_family: self.default_font_obj ? self.default_font_obj.name : '', height: 50,
      is_locked: false, label: 'Fixed Text ' + (custom_text_names_count + 1), outline_color: this.productColors[0]?.color_text[1]?.value, outline_color_pantone: this.productColors[0]?.color_text[1]?.name,
      outline_enabled: 1, outline_width: 0, placement: 'Front', rotation: 0, width: 50, x_axis: 300, y_axis: 300, scaleX: 0, scaleY: 0
    })
    return custom_text;
  }

  //todo when removed custom text then that should also be removed from customizer
  removeCustomText(custom_text_index: number) {
    let self: Record<any, any> = this;
   this.hideLockerProductUpdateButton()
    self.$store.commit('REMOVE_CUSTOM_TEXT', custom_text_index)
    self.$eventBus.$emit("customTextRemoved", custom_text_index);
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
