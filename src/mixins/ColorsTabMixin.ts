import { Component, Vue } from 'vue-property-decorator'
import {
  getSelectedProductPantones,
  hideLockerProductUpdateButton,
  setUndoRedoItems,
  getColorType,
  selectedDesign,
  santaClone
} from '@/helpers/Helpers'
import {getClosestColor, getColorEncoding} from "@/pantoneColor";

@Component
export default class ColorsTabMixin extends Vue{
  public selectAccordionIndex = 0
  public pantoneMessage = '';
  public showOtherColors = false;
  public activeLockerIndex = 0
  public activeFolderIndex = 0
  public selectTypeIndex = 0
  public othersActive = false
  public gradient_index: number|undefined = 0


  get lastActiveProductData() {
    return this. $store.getters.getLastActiveProductData
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

  get svgGroups() {
    return this.$store.getters.getSvgGroups
  }

  get getColorType(){
    return getColorType('', null, 'logo_color_type')
  }

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get lockerroomColors(): Record<any, any> {
    return this.$store.getters.getLockerroomColors;
  }

  get logoColorsInfo() {
    return this.$store.getters.getLogoColorsInfo('extracted_colors');
  }

  get locked_design() {
    return selectedDesign()?.id? this.$store.getters.getLockedDesigns(selectedDesign().id) : undefined
  }

  public getSvgGroupColors(svg_group) {
    if(svg_group && this.selectedProduct.svg_group_color_container && this.selectedProduct.svg_group_color_container[svg_group]) {
      return this.selectedProduct.svg_group_color_container[svg_group]
    }
    return false
  }

  public setActivePart(index:number){
    this.selectAccordionIndex = index;
  }

  public setActiveFolderIndex(locker_i: number, folder_i: number) {
    this.activeLockerIndex = locker_i;
    this.activeFolderIndex = folder_i;
  }

  public setActiveLockerIndex(locker_i: number) {
    this.activeLockerIndex = locker_i;
    this.activeFolderIndex = 0;
  }

  public selectType(index: number, showOtherColors = false) {
    if (showOtherColors){
      this.othersActive = true;
    }
    else {
      this.othersActive = false;
    }

    this.selectTypeIndex = index
    this.showOtherColors = showOtherColors
  }

  public showColor(index: number, gradient_index: number|undefined) {
    this.selectAccordionIndex = index
    this.gradient_index = gradient_index
  }

  public gradient_color_string(gradient_colors: Record<any, any>[]) {
    let css_color = 'linear-gradient(90deg';
    gradient_colors.forEach((gradient_color: Record<any, any>) => {
      css_color += ',' + gradient_color.color
    })
    css_color += ')'
    return css_color
  }

  public async setColor(color: Record<any, any>) {
    const self: Record<any, any> = this
    await setUndoRedoItems('groupColors','updated')
    await hideLockerProductUpdateButton(false)
    if (color.value){
      const group_id = this.svgGroups[this.selectAccordionIndex].id
      this.$store.commit('UPDATE_GROUP_COLORS', {
        index: group_id,
        gradient_index: this.gradient_index,
        color: color.value,
        pantone: color.pantone,
        name: color.name
      })
      if(this.locked_design) {
        this.$store.commit('SET_LOCKED_DESIGN_GROUP_COLOR', {
          design_id: selectedDesign().id, id: group_id, color: santaClone(this.$store.getters.getGroupColorsById(group_id))
        })
      }
      self.$eventBus.$emit("changeGroupColors")
      if(this.lastActiveProductData && !this.lastActiveProductData.editing ) {
        this.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", {group_colors: this.$store.getters.getGroupColors})
      }
    }
  }

  public changeColor(color: Record<any, any>) {
    const selectProductPantonesList = getSelectedProductPantones()
    const pantoneColor = getClosestColor(color.hex,selectProductPantonesList, getColorType(this.svgGroups[this.selectAccordionIndex].id, null, 'logo_color_type')) // this is sub-menu other tab of color tab in menu
    this.setColor({value: pantoneColor.hex.toUpperCase(), pantone: pantoneColor.pantone, name: pantoneColor.name})
  }

  public changePantoneColor() {
    const color_code = this.extractExactCode(this.svgGroups[this.selectAccordionIndex].pantone) ?
      this.extractExactCode(this.svgGroups[this.selectAccordionIndex].pantone) : this.svgGroups[this.selectAccordionIndex].pantone;
    const pantoneColor = getColorEncoding(
      color_code, getColorType(this.svgGroups[this.selectAccordionIndex].id, null, 'logo_color_type')
    );
    if (pantoneColor) {
      this.setColor({value: pantoneColor.hex.toUpperCase(), pantone: color_code.toUpperCase(), name: pantoneColor.name})
      this.pantoneMessage = ''
    }
    else {
      this.pantoneMessage = 'Color is not in the list.'
    }
  }

  public changeLogoPantoneColor(color_code, color_object) {
    const pantoneColor = getColorEncoding(color_code, getColorType(this.svgGroups[this.selectAccordionIndex].id));

    if (pantoneColor) {
      color_object.hex = pantoneColor?.hex.toUpperCase();
      color_object.name = pantoneColor?.name;
      color_object.pantone = pantoneColor?.pantone;
      this.pantoneMessage = ''
      return true
    }
    else {
      this.pantoneMessage = 'Color is not in the list.'
      return false
    }
  }

  public extractExactCode(code:string) {
    let pantone_coated: string|null = null;
    if(getColorType(this.svgGroups[this.selectAccordionIndex].id) === 'pantone-coated'){
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
}
