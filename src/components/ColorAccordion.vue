<template>
  <div class="accordion color-accordion" role="tablist">
    <span class="hover_tooltip" ref="hoover_pattern_tooltip"></span>
    <b-card no-body v-for="(svgElement, index) in svgGroups" :key="'color-accordion'+index">
      <b-card-header header-tag="header" class="p-0" role="tab">
        <b-button class="color-accordion-header" block v-b-toggle="'accordion-'+(index+1)" @click="showColor(index, svgElement.gradient_colors? gradient_index === undefined? 0 : gradient_index : undefined)">
          <span class="text-uppercase text">{{ svgElement.id | capitalize }} </span>
          <span class="color">
            <template v-if="svgElement.gradient_colors">
              <span class="color-box" :style="{ background : gradient_color_string(svgElement.gradient_colors) }"></span>
              <span class="color-pantone-name gap-1 text-uppercase">
               <template v-for="(gradient_color, g_index) in svgElement.gradient_colors">
                 {{ gradient_color.pantone }} {{ gradient_color.name }} <template v-if="g_index < svgElement.gradient_colors.length - 1">/</template>
               </template>
              </span>
            </template>
            <template v-else>
              <span class="color-box" :style="{ background : svgElement.color }"></span>
              <span class="color-pantone-name text-uppercase">{{ svgElement.pantone }} {{ svgElement.name }}</span>
              <div class="d-flex justify-content-end gap-1 ml-5 copy-paste-btn">
                <b-button class="border border-dark h-25 opacity-50 pt-0 pb-0 pl-1 pr-1 f-14 fz-14" @click.stop="copyColor(svgElement.color)">Copy</b-button>
                <b-button class="border border-dark h-25 opacity-50 pt-0 pb-0 pl-1 pr-1 pr-1 f-14 fz-14" v-if="copied_color" @click.stop="pasteColor(index)">Paste</b-button>
              </div>
            </template>
          </span>
          <span class="accordion-icon"></span>
        </b-button>
      </b-card-header>
      <b-collapse :id="'accordion-'+(index+1)" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <div v-if="svgElement.gradient_colors" class="d-flex w-100 flex-wrap gap-1 mt-1">
            <button v-for="(gradient_color, g_index) in svgElement.gradient_colors" @click="showColor(index, g_index)"
                    :key="g_index" :class="{'light': gradient_index == g_index}" class="btn btn-secondary isBtn btn-sm">Gradient {{ g_index + 1 }}</button>

            <template v-for="(gradient_color, g_index) in svgElement.gradient_colors">
              <div v-if="gradient_index == g_index" :key="'copy_buttons_'+g_index" class="d-flex justify-content-start w-100 gap-1">
                <b-button class="border border-dark p-1 opacity-50 ml-1" @click.stop="copyColor(gradient_color.color)">Copy</b-button>
                <b-button class="border border-dark p-1 opacity-50" v-if="copied_color" @click.stop="pasteColor(index, g_index)">Paste</b-button>
              </div>
            </template>
          </div>
          <b-nav class="d-flex flex-wrap align-items-center">
            <template v-if="getSvgGroupColors(svgElement.id)">
              <b-nav-item @click="selectType(index, false)" :class="{ 'active' : selectTypeIndex !== (productColors.length + 3) && !showOtherColors}" class="mr-2">{{ getSvgGroupColors(svgElement.id).name | capitalize }}</b-nav-item>
              <b-nav-item v-if="selectedProduct.patterns?.length" :class="{ 'active': selectTypeIndex == (productColors.length + 3) }"
                          @click="selectType(productColors.length + 3, false)">
                Patterns
              </b-nav-item>
            </template>
            <template v-else>
              <b-nav-item :class="{ 'active' : index == selectTypeIndex && !showOtherColors}" class="mr-2 "
                          v-for="(colorType, index) in productColors" :key="'color-nav'+index"
                          @click="selectType(index, false)">
                {{ colorType.name | capitalize }}
              </b-nav-item>
              <b-nav-item v-if="selectedProduct.is_custom_color_allowed && logoColorsInfo && logoColorsInfo.length"
                          :class="{ 'active' : selectTypeIndex == (productColors.length) && !showOtherColors}" class="mr-2 "
                          @click="selectType(productColors.length, false)">
                Team logo colors
              </b-nav-item>
              <b-nav-item :class="{ 'active' : selectTypeIndex == (productColors.length + 1) && !showOtherColors}" class="mr-2 "
                          v-if="selectedProduct.is_custom_color_allowed && isCustomerAuthenticated && lockerroomColors && lockerroomColors.length"
                          @click="selectType(productColors.length + 1, false)">
                Locker colors
              </b-nav-item>
              <b-nav-item v-if="selectedProduct.is_custom_color_allowed" :class="{ 'active': selectTypeIndex == (productColors.length + 2) && showOtherColors }"
                          @click="selectType(productColors.length + 2, true)">
                Others
              </b-nav-item>
              <b-nav-item v-if="selectedProduct.patterns?.length" :class="{ 'active': selectTypeIndex == (productColors.length + 3) }"
                          @click="selectType(productColors.length + 3, false)">
                Patterns
              </b-nav-item>
            </template>
          </b-nav>
          <div v-if="selectTypeIndex == (productColors.length + 1) && !showOtherColors" class="overflow-hidden fade-right pr-4">
            <div class="d-flex align-items-center overflow-auto theme-scroll-h gap-1 py-2">
              <template v-for="(room, i) in lockerroomColors">
                <b-button size="sm" class="btn-locker-color" variant="secondary" @click="setActiveLockerIndex(i)" :class="{'active': i == activeLockerIndex}"
                          :key="`locker_${i}`">
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
          </div>
          <div class="color-holder" style="padding-top: 5px;" ref="ColorAccordion">
            <div class="color-container">
              <!-- SVG group wise colors -->
              <template v-if="getSvgGroupColors(svgElement.id) && selectTypeIndex !== (productColors.length + 3)">
                <div v-for="(color, c_index) in getSvgGroupColors(svgElement.id).json_data" v-if="color.value" class="color-box"  @click="color.value == svgElement.color ? null : setColor(color)"
                     :title="color.name" :style="{background: color.value }" :key="index+'product_color_box'+c_index">
                  <span v-if="isColorSelected(color, svgElement, gradient_index)" class="selected" style="z-index: 100; opacity: 1">
                    <BIconCheck />
                  </span>
                </div>
              </template>
              <!-- other colors -->
              <div v-else-if="showOtherColors && selectedProduct.is_custom_color_allowed && getColorTypeBySvgGroup(svgElement.id, 'logo_color_type') !== 'product_color' && selectTypeIndex !== (productColors.length + 3)" class="custom-color-picker">
                <b-form class="pantone-color-field" v-on:submit.prevent>
                  <label for="inline-form-input-pantone-color" v-if="getColorType === 'cmyk'">CMYK (x,x,x,x)</label>
                  <label for="inline-form-input-pantone-color" v-else-if="getColorType === 'pantone-coated'">Pantone: (xxx c)</label>
                  <label class="mb-2" for="inline-form-input-pantone-color" v-else>Pantone: (TCX xx-xxxx)</label>
                  <b-form-input
                    @focusin="($event)=>$event.target.select()"
                    v-model="svgGroups[selectAccordionIndex].pantone"
                    class="mb-2 mr-sm-2 mb-sm-0"
                    :placeholder="place_holder"
                    @input="changePantoneColor"
                    :disabled="getColorType === 'cmyk'"
                  ></b-form-input>
                  <div class="pantone-message p-1 text-danger">
                    {{ pantoneMessage }}
                  </div>
                </b-form>
                <color-picker @changeColor="changeColor" theme="light" :key="svgElement.color" :color="svgElement.color" :sucker-hide="true" />
            </div>
              <!-- logo colors -->
              <template v-else-if="selectTypeIndex == productColors.length && !showOtherColors" v-for="(ext_color, ext_index) in logoColorsInfo">
                <div v-if="ext_color.hex"  class="color-box" @click="ext_color.hex == svgElement.color ? null : setColor({value: ext_color.hex, ...ext_color})"
                     :title="ext_color.pantone ? ext_color.pantone : ext_color.name" :style="{background: ext_color.hex }" :key="'base-color' +ext_index + ext_color.name">
                  <span v-if="ext_color.hex == svgElement.color || (gradient_index !== undefined && svgElement.gradient_colors && svgElement.gradient_colors[gradient_index].color == ext_color.hex)" class="selected" style="z-index: 100; opacity: 1">
                    <BIconCheck />
                  </span>
                </div>
              </template>
              <!-- locker colors -->
              <template v-else-if="selectTypeIndex == (productColors.length + 1) && !showOtherColors" v-for="(color, index) in JSON.parse(lockerroomColors[activeLockerIndex].folders[activeFolderIndex].color)">
                <div v-if="color.value"  class="color-box"  @click="color.value == svgElement.color ? null : setColor(color)"
                     :title="color.name" :style="{background: color.value }" :key="`locker_color${index}${activeLockerIndex}${activeFolderIndex}`">
                  <span v-if="isColorSelected(color, svgElement, gradient_index)" class="selected" style="z-index: 100; opacity: 1">
                    <BIconCheck />
                  </span>
                </div>
              </template>
              <!-- product colors -->
              <template v-else-if="!showOtherColors" v-for="(color, c_index) in productColors[selectTypeIndex]?.color_text">
                <div v-if="color.value"  class="color-box"  @click="color.value == svgElement.color ? null : setColor(color)"
                     :title="color.name" :style="{background: color.value }" :key="index+'product_color_box'+c_index">
                  <span v-if="isColorSelected(color, svgElement, gradient_index)" class="selected" style="z-index: 100; opacity: 1">
                    <BIconCheck />
                  </span>
                </div>
              </template>
              <template v-if="selectTypeIndex == (productColors.length + 3)">
                <template v-for="(pattern, pattern_index) in selectedProduct.patterns[0].json_data">
                  <div class="pattern-designs" :key="'pattern_' + pattern_index">
                    <b-button :class="{'active': isPatternActive(svgElement.id, pattern)}" variant="outline-light" class="p-0 btn" @click="setPattern(svgElement.id, pattern)">
                      <img @mouseenter="showTooltip" @mouseleave="hideTooltip" :data-title="pattern.name" :src="storageUrl+pattern.path" alt="Pattern" :key="'pattern_image' + pattern_index"/>
                    </b-button>
                  </div>
                </template>
                <div class="clear-pattern">
                  <b-button @mouseenter="showTooltip" @mouseleave="hideTooltip" data-title="Clear selection" variant="outline-light" class="p-0 btn" @click="unsetPattern()">
                    <BIconXCircle width="50px" height="50px" style="color: gray; opacity: 0.6;" />
                  </b-button>
                </div>
                <div class="d-flex justify-content-between align-items-center w-100 gap-x-5" v-if="groupPatterns[svgElement.id]">
                  <div class="w-100 w-md-50">
                    <label>Scale: {{ groupPatterns[svgElement.id].scale }}%</label>
                    <b-form-input
                      v-model="groupPatterns[svgElement.id].scale"
                      @change="applyPattern(svgElement.id)"
                      type="range"
                      min="10"
                      max="100"
                      step="1"
                    />
                  </div>
                  <div class="w-100 w-md-50">
                    <label>Angle: {{ groupPatterns[svgElement.id].angle }}°</label>
                    <b-form-input
                      v-model="groupPatterns[svgElement.id].angle"
                      @change="applyPattern(svgElement.id)"
                      type="range"
                      min="0"
                      max="360"
                    />
                  </div>
                </div>
                <b-nav class="d-flex flex-wrap align-items-center" v-if="groupPatterns[svgElement.id]">
                  <template v-if="getSvgGroupColors(svgElement.id)">
                    <b-nav-item @click="selectPatternType(index, false)" :class="{ 'active' : patternTypeIndex !== (productColors.length + 3) && !showOtherColors}" class="mr-2">{{ getSvgGroupColors(svgElement.id).name | capitalize }}</b-nav-item>
                  </template>
                  <template v-else>
                    <b-nav-item :class="{ 'active' : index == patternTypeIndex && !showOtherColors}" class="mr-2 "
                                v-for="(colorType, index) in productColors" :key="'color-nav'+index"
                                @click="selectPatternType(index, false)">
                      {{ colorType.name | capitalize }}
                    </b-nav-item>
                    <b-nav-item v-if="selectedProduct.is_custom_color_allowed && logoColorsInfo && logoColorsInfo.length"
                                :class="{ 'active' : patternTypeIndex == (productColors.length) && !showOtherColors}" class="mr-2 "
                                @click="selectPatternType(productColors.length, false)">
                      Team logo colors
                    </b-nav-item>
                    <b-nav-item :class="{ 'active' : patternTypeIndex == (productColors.length + 1) && !showOtherColors}" class="mr-2 "
                                v-if="selectedProduct.is_custom_color_allowed && isCustomerAuthenticated && lockerroomColors && lockerroomColors.length"
                                @click="selectPatternType(productColors.length + 1, false)">
                      Locker colors
                    </b-nav-item>
                    <b-nav-item v-if="selectedProduct.is_custom_color_allowed" :class="{ 'active': patternTypeIndex == (productColors.length + 2) && showOtherColors }"
                                @click="selectPatternType(productColors.length + 2, true)">
                      Others
                    </b-nav-item>
                  </template>
                </b-nav>
                <div v-if="patternTypeIndex == (productColors.length + 1) && !showOtherColors && groupPatterns[svgElement.id]" class="overflow-hidden fade-right pr-4">
                  <div class="d-flex align-items-center overflow-auto theme-scroll-h gap-1 py-2">
                    <template v-for="(room, i) in lockerroomColors">
                      <b-button size="sm" class="btn-locker-color" variant="secondary" @click="setActiveLockerIndex(i)" :class="{'active': i == activeLockerIndex}"
                                :key="`locker_${i}`">
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
                </div>
                <div v-if="groupPatterns[svgElement.id]" class="color-holder" style="padding-top: 5px" ref="ColorAccordion">
                  <div class="color-container">
                    <template v-if="getSvgGroupColors(svgElement.id) && patternTypeIndex !== (productColors.length + 3)">
                      <div v-for="(color, c_index) in getSvgGroupColors(svgElement.id).json_data" v-if="color.value" class="color-box"  @click="setPatternColor(svgElement.id, color)"
                          :title="color.name" :style="{background: color.value }" :key="index+'product_color_box'+c_index">
                        <span v-if="isPatternColorSelected(color, groupPatterns[svgElement.id].color)" class="selected" style="z-index: 100; opacity: 1">
                          <BIconCheck />
                        </span>
                      </div>
                    </template>
                    <!-- other colors -->
                    <div v-else-if="showOtherColors && selectedProduct.is_custom_color_allowed && getColorTypeBySvgGroup(svgElement.id, 'logo_color_type') !== 'product_color' && selectTypeIndex !== (productColors.length + 3)" class="custom-color-picker">
                      <b-form class="pantone-color-field" v-on:submit.prevent>
                        <label for="inline-form-input-pantone-color" v-if="getColorType === 'cmyk'">CMYK (x,x,x,x)</label>
                        <label for="inline-form-input-pantone-color" v-else-if="getColorType === 'pantone-coated'">Pantone: (xxx c)</label>
                        <label class="mb-2" for="inline-form-input-pantone-color" v-else>Pantone: (TCX xx-xxxx)</label>
                        <b-form-input
                          @focusin="($event)=>$event.target.select()"
                          v-model="svgGroups[selectAccordionIndex].pantone"
                          class="mb-2 mr-sm-2 mb-sm-0"
                          :placeholder="place_holder"
                          @input="changePantoneColor"
                          :disabled="getColorType === 'cmyk'"
                        ></b-form-input>
                        <div class="pantone-message p-1 text-danger">
                          {{ pantoneMessage }}
                        </div>
                      </b-form>
                      <color-picker @changeColor="changeColor" theme="light" :key="svgElement.color" :color="svgElement.color" :sucker-hide="true" />
                  </div>
                    <!-- logo colors -->
                    <template v-else-if="patternTypeIndex == productColors.length && !showOtherColors" v-for="(ext_color, ext_index) in logoColorsInfo">
                      <div v-if="ext_color.hex"  class="color-box" @click="setPatternColor(svgElement.id, ext_color)"
                          :title="ext_color.pantone ? ext_color.pantone : ext_color.name" :style="{background: ext_color.hex }" :key="'base-color' +ext_index + ext_color.name">
                        <span v-if="isPatternColorSelected(ext_color, groupPatterns[svgElement.id].color)" class="selected" style="z-index: 100; opacity: 1">
                          <BIconCheck />
                        </span>
                      </div>
                    </template>
                    <!-- locker colors -->
                    <template v-else-if="patternTypeIndex == (productColors.length + 1) && !showOtherColors" v-for="(color, index) in JSON.parse(lockerroomColors[activeLockerIndex].folders[activeFolderIndex].color)">
                      <div v-if="color.value"  class="color-box"  @click="setPatternColor(svgElement.id, color)"
                          :title="color.name" :style="{background: color.value }" :key="`locker_color${index}${activeLockerIndex}${activeFolderIndex}`">
                        <span v-if="isPatternColorSelected(color, groupPatterns[svgElement.id].color)" class="selected" style="z-index: 100; opacity: 1">
                          <BIconCheck />
                        </span>
                      </div>
                    </template>
                    <!-- product colors -->
                    <template v-else-if="!showOtherColors" v-for="(color, c_index) in productColors[patternTypeIndex]?.color_text">
                      <div v-if="color.value"  class="color-box"  @click="setPatternColor(svgElement.id, color)"
                          :title="color.name" :style="{background: color.value }" :key="index+'product_color_box'+c_index">
                        <span v-if="isPatternColorSelected(color, groupPatterns[svgElement.id].color)" class="selected" style="z-index: 100; opacity: 1">
                          <BIconCheck />
                        </span>
                      </div>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </b-card-body>
      </b-collapse>
    </b-card>
  </div>
</template>

<script lang="ts">
import { getColorType, getLockerColors } from '@/helpers/Helpers'
import colorPicker from '@caohenghu/vue-colorpicker'
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import ColorsTabMixin from '../mixins/ColorsTabMixin'
import { LockerProducts, ProductsQueryParamsMixin } from '../mixins/LockerProduct'

@Component<ColorAccordion>({
  components: {
      colorPicker
  },
  filters: {
    capitalize: (value: string) => {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    }
  },
  mounted(){
    setTimeout(() => {
      this.selectType(this.selectTypeIndex);
    }, 300);
    getLockerColors();
    this.showColor(this.selectAccordionIndex, undefined)
  }
})
export default class ColorAccordion extends Mixins(LockerProducts, ColorsTabMixin, ProductsQueryParamsMixin) {
  @Prop({required: true}) productColors!: Record<any, any>[]
  @Prop({required: true}) tabIndex!: any

  // public color= '#59c7f9'
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public pantoneColorVal= '18-0107'
  public selectedColorTab = 0;
  public colorImage = '/img/images/color-placeholder.png'

  @Watch('productColors', {
    deep: true
  })

  productColorsChanged(){
    this.selectType(this.selectTypeIndex, false)
  }

  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  get groupColors(){
    return this.$store.getters.getGroupColors
  }

  get groupPatterns() {
    return this.$store.getters.getGroupPatterns
  }

  public isColorSelected(color, svgElement, gradient_index) {
    // Check if color or name matches
    if (color.value === svgElement.color ||
      (color.name && svgElement.name && color.name === svgElement.name)) {
      return true;
    }

    // Check for gradient color match
    if (gradient_index !== undefined && svgElement.gradient_colors) {
      const gradientColor = svgElement.gradient_colors[gradient_index];
      if (gradientColor.color === color.value || (gradientColor.name && color.name && gradientColor.name === color.name)) {
        return true;
      }
    }

    return false
  }

  public isPatternColorSelected(color, patternColor) {
    return color.value === patternColor?.value
  }

  public getColorTypeBySvgGroup(svg_group: string, color_type) {
    return getColorType(svg_group, null,'logo_color_type')
  }

  public isPatternActive(svgGroupId: string, pattern: Record<any, any>): boolean {
    const groupPattern = this.$store.getters.getGroupPatternsById(svgGroupId);
    return groupPattern && groupPattern.name === pattern.name;
  }

  private showTooltip($event: MouseEvent, leftOffset = 0, topOffset = 0) {
    const tooltip = this.$el.querySelector(".hover_tooltip") as HTMLElement;
    if (!tooltip) return;

    const tooltipText = ($event.target as HTMLElement).getAttribute("data-title");
    if (!tooltipText) return;

    tooltip.innerHTML = tooltipText;
    tooltip.style.opacity = "1";
    tooltip.style.zIndex = "100";
    tooltip.style.position = "fixed"; // important for viewport positioning

    // Small base offsets
    const padding = 10;
    const mouseX = $event.clientX;
    const mouseY = $event.clientY;

    // Temporarily show to measure size
    tooltip.style.left = "0px";
    tooltip.style.top = "0px";
    const rect = tooltip.getBoundingClientRect();

    // Calculate preferred position (right & below cursor)
    let left = mouseX + padding + leftOffset;
    let top = mouseY + padding + topOffset;

    // --- Boundary checks ---
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // If tooltip would go beyond right edge, show on the left instead
    if (left + rect.width > viewportWidth) {
      left = mouseX - rect.width - padding;
    }

    // If tooltip would go beyond bottom edge, move it up
    if (top + rect.height > viewportHeight) {
      top = mouseY - rect.height - padding;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  private hideTooltip() {
    let element = this.$el.querySelector(".hover_tooltip") as Record<any, any>
    element.style.opacity = '0'
    element.style.left = '0'
    element.style.top = '0'
    element.style.zIndex = '-10'
  }
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
  }

  .copy-paste-btn {
    display: none !important;
    flex: auto;
    margin-right: .5rem;
    margin-left: 0 !important;
  }

  .color-accordion-header {
    &:hover {
      .copy-paste-btn {
        display: flex !important;
      }
    }
  }

  .pattern-designs {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 15px;

      .btn {
          width: 40px;
          height:30px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          border: 1px solid #ccc;
          background: none;

          @media only screen and (min-width: 992px) {
              width: 75px;
              height: 75px;
          }

          &.active,
          &:hover {
              border-color: #219f84;
              border-width: 2px;
          }

          img {
              display: block;
              max-width: 100%;
              margin: 0 auto;
              height: auto;
          }
      }

    }
    .clear-pattern {
      display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 15px;

    .btn {
      width: 40px;
      height:30px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      border: 1px solid #ccc;
      background: none;

      @media only screen and (min-width: 992px) {
          width: 75px;
          height: 75px;
      }
    }
  }
</style>
