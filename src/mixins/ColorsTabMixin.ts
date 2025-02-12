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
  public patternTypeIndex = 0
  public othersActive = false;
  public gradient_index: number|undefined = 0
  public patternColor = {};
  public selectedPattern = null;
  public selectedPatterns = {}
  public patternScales: Record<string, number> = {};
  public patternAngles: Record<string, number> = {};
  public patternColors: Record<string, Record<any, any>> = {};


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

  get copied_color(): Record<any, any> {
    return this.$store.getters.getCopiedColor;
  }

  get logoColorsInfo() {
    return this.$store.getters.getLogoColorsInfo('extracted_colors');
  }

  get locked_design() {
    return selectedDesign()?.id? this.$store.getters.getLockedDesigns(selectedDesign().id) : undefined
  }

  get groupPatterns() {
    return this.$store.getters.getGroupPatterns
  }

  public copyColor(color: string) {
    this.$store.commit('SET_COPIED_COLOR', color)
  }

  public pasteColor(index: number, gradient_index: number|undefined = undefined) {
    this.selectAccordionIndex = index
    this.gradient_index = gradient_index
    this.changeColor({hex: this.copied_color})
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

  public selectPatternType(index: number, showOtherColors = false) {
    if (showOtherColors){
      this.othersActive = true;
    }
    else {
      this.othersActive = false;
    }

    this.patternTypeIndex = index
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

  public getPatternScale(groupId: string): number {
    return this.patternScales[groupId] || 30;
  }

  public setPatternScale(groupId: string, scale: number) {
    this.$set(this.patternScales, groupId, scale);
    this.setPattern(false, this.selectedPattern);
  }

  public getPatternAngle(groupId: string): number {
    return this.patternAngles[groupId] || 0;
  }

  public setPatternAngle(groupId: string, angle: number) {
    this.$set(this.patternAngles, groupId, angle);
    this.setPattern(false, this.selectedPattern);
  }

  public getPatternColor(groupId: string): Record<any, any> {
    return this.patternColors[groupId] || {};
  }

  public setPatternColor(groupId: string, color: Record<any, any>) {
    this.$set(this.patternColors, groupId, color);
  }

  public setSelectedPattern(groupId: string, pattern: Record<any, any>) {
    if (pattern === this.selectedPatterns[groupId]) {
      this.unsetPattern();
      return;
    }
    this.$set(this.selectedPatterns, groupId, pattern);
    this.$set(this.patternScales, groupId, (this.patternScales[groupId] ? this.patternScales[groupId] : 30));
    this.$set(this.patternAngles, groupId, (this.patternAngles[groupId] ? this.patternAngles[groupId] : 0));
    this.setPattern(false, pattern);
  }

  public getSelectedPattern(groupId: string) {
    return this.selectedPatterns[groupId].name || {};
  }

  public async setPattern(unset = false, pattern, color = {}) {
    const group_id = this.svgGroups[this.selectAccordionIndex].id;
    if (pattern == this.selectedPatterns[group_id] && unset) {
      this.unsetPattern();
      return;
    }
    const self: Record<any, any> = this;
    this.selectedPattern = pattern;
    if (Object.keys(color).length > 0) {
      this.setPatternColor(group_id, color);
    }
    await setUndoRedoItems('groupPatterns','updated')
    await hideLockerProductUpdateButton(false)
    if (pattern.name) {
      this.$store.commit('UPDATE_GROUP_PATTERNS', {
        index: group_id,
        name: this.getSelectedPattern(group_id),
        scale: this.getPatternScale(group_id),
        angle: this.getPatternAngle(group_id),
        color: this.getPatternColor(group_id),
      })
      if(this.lastActiveProductData && !this.lastActiveProductData.editing ) {
        this.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", {group_patterns: this.$store.getters.getGroupPatterns})
      }
      self.$eventBus.$emit("applyPattern", group_id)
    }
  }

  public unsetPattern() {
    const self: Record<any, any> = this;
    this.selectedPattern = null;
    const group_id = this.svgGroups[this.selectAccordionIndex].id
    this.selectedPatterns[group_id] = null;
    this.$store.commit('UPDATE_GROUP_PATTERNS', {
      index: group_id,
      name: null,
      scale: this.getPatternScale(group_id),
      angle: this.getPatternAngle(group_id),
      color: this.getPatternColor(group_id)
    })
    if(this.lastActiveProductData && !this.lastActiveProductData.editing ) {
      this.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", {group_patterns: this.$store.getters.getGroupPatterns})
    }
    self.$eventBus.$emit("applyPattern", group_id)
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
