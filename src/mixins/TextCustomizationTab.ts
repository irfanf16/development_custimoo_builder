import {Component, Mixins,} from 'vue-property-decorator'
import {getSelectedProductPantones, santaClone, setUndoRedoItems} from '@/helpers/Helpers'
import {getClosestColor, getColorEncoding} from "@/pantoneColor";
import {filter, find} from "lodash";
import {HideUpdateLockerButton} from "@/mixins/SelectedProductMixin";
import {ProductFonts} from "@/mixins/SelectedProductMixin";

@Component
export default class TextCustomizationTab extends Mixins(HideUpdateLockerButton, ProductFonts){
  public pantoneMessage = ''
  public activeLockerIndex = 0
  public activeFolderIndex = 0
  public product_fonts: Record<any, any>[] = []
  public handle_text_change_timer:any = 0 // this will hold the id returned by the setTimeout()
  public active_jersey_part: number[] = [];
  public text_accordion:boolean[] = [];
  public selected_font = '';
  public is_font_auto_changed = false;

  get getColorType(): string {
    return this.$store.getters.getSetting('color_type');
  }

  get lockerroomColors(): Record<any, any> {
    return this.$store.getters.getLockerroomColors;
  }

  get logoColorsInfo() {
    return filter(this.$store.getters.getLogoColorsInfo('extracted_colors'), 'hex')
  }

  get selectedProductId(): Record<any, any> {
    return this.$store.getters.getSelectedProductId
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

  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  get getProductEditInfoObject() {
    return this.$store.getters.getProductEditInfoObject;
  }

  public extractExactCode(code:string) {
    let pantone_coated: string|null = null;
    if(this.getColorType === 'pantone-coated'){
      const regex_numbers = /^[0-9]+/g;
      const regex_alphabets = /[a-zA-Z]+/g;
      const numbers = regex_numbers.exec(code);
      const alphabets = regex_alphabets.exec(code);
      if(numbers && numbers[0] && alphabets && alphabets[0]){
        pantone_coated = numbers[0] + ' ' + alphabets[0].toUpperCase();
      }
    }
    return pantone_coated;
  }

  public setActiveJerseyPart(active_text_index:number, active_jersey_part:any) {
    const updatedActiveJerseyParts: number[] = []
    const updatedTextAccordion:boolean[] = []
    for(let i = 0; i < this.active_jersey_part.length; i++){
      i == active_text_index ? updatedActiveJerseyParts[i] = active_jersey_part : updatedActiveJerseyParts[i] = this.active_jersey_part[i];
      i == active_text_index ? updatedTextAccordion[i] = true : updatedTextAccordion[i] = false
    }
    this.active_jersey_part = updatedActiveJerseyParts
    this.text_accordion = updatedTextAccordion
  }

  public bindScroll($event:Record<any, any>){
    $event.stopPropagation()
  }

  public changePantoneColor($event: string, customTextIndex: number, productCustomTextItemIndex: number, select_color_type: string) {
    const fill_type = select_color_type=='Fill Color' ? 0 : 1;
    const color_code = this.extractExactCode($event)? this.extractExactCode($event) : (fill_type==0 ? this.product_custom_texts[customTextIndex].items[productCustomTextItemIndex].color : this.product_custom_texts[customTextIndex].items[productCustomTextItemIndex].outline_color);
    const pantoneColor = getColorEncoding(color_code, this.getColorType);
    const color_picker = this.$refs[`text-color-picker${customTextIndex}${productCustomTextItemIndex}`] as Record<any, any>;
    if (pantoneColor) {
      const color = {value: pantoneColor.hex.toUpperCase(), pantone: color_code.toUpperCase(), name: pantoneColor.pantone}
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
    const pantoneColor = getClosestColor($event.hex,selectProductPantonesList, this.getColorType);
    const color = {value: pantoneColor.hex, position: '1', name: pantoneColor.pantone}
    this.customTextColorUpdated(customTextIndex, productCustomTextItemIndex, color, select_color_type)
  }

  public setActiveFolderIndex(locker_i: number, folder_i: number) {
    this.activeLockerIndex = locker_i;
    this.activeFolderIndex = folder_i;
  }

  public setActiveLockerIndex(locker_i: number) {
    this.activeLockerIndex = locker_i;
    this.activeFolderIndex = 0;
  }

  public handleTextOutline(custom_text_index:number, custom_text_item_index:number) {
    const self: Record<any, any> = this;
    const custom_text_item = this.product_custom_texts[custom_text_index].items[custom_text_item_index]
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

  handleCustomTextInputChange(updatedVal: string, custom_text_index: number) {
    this.hideLockerProductUpdateButton()
    clearTimeout (this.handle_text_change_timer);
    this.handle_text_change_timer = setTimeout(async () => {
      await setUndoRedoItems('customTexts', 'input_changed')
      const self:Record<any, any> = this;
      const updated_custom_text = this.product_custom_texts[custom_text_index]
      this.handleCustomTextFontChange(custom_text_index, updated_custom_text.font_family)
      updated_custom_text.value = updatedVal;
      const product_ids = [updated_custom_text.product_id, ...updated_custom_text.following_product_ids]
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
    const self:Record<any, any> = this;
    await this.hideLockerProductUpdateButton()
    await setUndoRedoItems('customTexts', 'check_box_updated')
    const updated_custom_text = this.product_custom_texts[custom_text_index]
    const updated_custom_text_product_id = updated_custom_text.product_id
    const product_ids = [updated_custom_text_product_id, ...updated_custom_text.following_product_ids]
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
    const self:Record<any, any> = this;
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
    const self:Record<any, any> = this;
    await this.hideLockerProductUpdateButton()
    await setUndoRedoItems('customTexts', 'outline_updated')
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].outline_width = outline_value;
    self.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", { index: custom_text_index, value: self.product_custom_texts[custom_text_index]})
    self.$eventBus.$emit("customTextUpdated", {
      emitter: "outline_width", custom_text_index:custom_text_index, custom_text_item_index: custom_text_item_index, value: self.product_custom_texts[custom_text_index]
    });
  }

  async handleCustomTextPlacementUpdate( placement: string, custom_text_index: number, custom_text_item_index: number) {
    const self:Record<any, any> = this;
    await this.hideLockerProductUpdateButton()
    await setUndoRedoItems('customTexts', 'placement_updated')
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].placement = placement;
    self.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", { index: custom_text_index, value: self.product_custom_texts[custom_text_index]})
    self.$eventBus.$emit("customTextUpdated", {
      emitter: "placement", custom_text_index:custom_text_index, custom_text_item_index: custom_text_item_index, value: self.product_custom_texts[custom_text_index]
    });
  }
  async handleCustomTextFontChange(custom_text_index: number, selected_font: string) {
    const self:Record<any, any> = this;
    await this.hideLockerProductUpdateButton()
    await setUndoRedoItems('customTexts', 'font_updated')
    self.selected_font = selected_font;
    let custom_text_indexes = [custom_text_index]
    /*
    * first time editing the font will be applied to all custom texts.
    * The is_font_auto_changed is used to check that if the first time updating text font is auto applied to all custom texts or not
    * */
    if(!this.is_font_auto_changed && !this.getProductEditInfoObject.editing) {
      custom_text_indexes = [...Array(self.product_custom_texts.length).keys()];
      this.is_font_auto_changed = true
    }
    custom_text_indexes.forEach((custom_text_index) => {
      self.product_custom_texts[custom_text_index].font_family = selected_font;
      self.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", { index: custom_text_index, value: self.product_custom_texts[custom_text_index]})
      self.$eventBus.$emit("customTextUpdated", {
        emitter: "input", custom_text_index:custom_text_index, custom_text_item_index: null, value: self.product_custom_texts[custom_text_index]
      });
    })
  }

  async applySameTextStyle(current_custom_text_index:any) {
    const self:Record<any, any> = this;
    await this.hideLockerProductUpdateButton()
    await setUndoRedoItems('customTexts', 'font_updated')
    const style_to_apply = self.product_custom_texts[current_custom_text_index].items[this.active_jersey_part[current_custom_text_index]];

    console.log('style_to_apply', style_to_apply)
    self.product_custom_texts.forEach((custom_text:Record<any, any>, custom_text_index:any)=>{
      custom_text.font_family = self.product_custom_texts[current_custom_text_index].font_family;
      custom_text.items.forEach((current_item:Record<any, any>)=>{
        current_item.color = style_to_apply.color
        current_item.color_pantone = style_to_apply.color_pantone
        current_item.font_family = style_to_apply.font_family

        if(current_item.outline_enabled){
          current_item.outline_width = style_to_apply.outline_width
          current_item.outline_color = style_to_apply.outline_color
          current_item.outline_color_pantone = style_to_apply.outline_color_pantone
        }
      })
      self.$eventBus.$emit("customTextUpdated", {
        emitter: "apply_button", custom_text_index:custom_text_index, custom_text_item_index: null, value: self.product_custom_texts[custom_text_index]
      });
    })
  }



  async addCustomText(productColors:Record<any, any>) {
    const self: Record<any, any> = this;
    await this.hideLockerProductUpdateButton()
    let custom_text = find(self.product_custom_texts, ['is_first_name', true]);
    if(custom_text == undefined) {
      custom_text = find(self.product_custom_texts, ['is_first_number', true]);
    }
    custom_text = self.resetCustomTextObject(custom_text, productColors);
    await setUndoRedoItems('customTexts', 'text_added')
    self.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", { index: self.product_custom_texts.length, value: custom_text })
    self.$eventBus.$emit("customTextUpdated", { emitter: "add_button" });
  }

  resetCustomTextObject(custom_text: Record<any, any>, productColors: Record<any, any>) {
    const self: Record<any, any> = this;
    this.hideLockerProductUpdateButton()
    const product_first_font = self.selectedProduct.namefonts.length > 0 ? self.selectedProduct.namefonts[0] : null;
    if(product_first_font) {
      self.default_font_obj = product_first_font.json_data.length > 0 ? product_first_font.json_data[0] : null;
    }
    const custom_text_names_count = filter(self.product_custom_texts, ['type', 'name']).length;
    if(self.default_font_obj == null) {
      const product_first_font = self.selected_product.namefonts.length > 0 ? self.selected_product.namefonts[0] : null;
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
      color: productColors[0]?.color_text[0]?.value, color_pantone: productColors[0]?.color_text[0]?.name, font_family: self.default_font_obj ? self.default_font_obj.name : '', height: 50,
      is_locked: false, label: 'Fixed Text ' + (custom_text_names_count + 1), outline_color: productColors[0]?.color_text[1]?.value, outline_color_pantone: productColors[0]?.color_text[1]?.name,
      outline_enabled: 1, outline_width: 0, outline_width_converted: 0, placement: 'Front', rotation: 0, width: 50, x_axis: 300, y_axis: 300, scaleX: 0, scaleY: 0
    })
    return custom_text;
  }

  //todo when removed custom text then that should also be removed from customizer
  removeCustomText(custom_text_index: number) {
    const self: Record<any, any> = this;
    this.hideLockerProductUpdateButton()
    self.$store.commit('REMOVE_CUSTOM_TEXT', custom_text_index)
    self.$eventBus.$emit("customTextRemoved", custom_text_index);
  }
}
