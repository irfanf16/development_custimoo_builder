<template>
  <div class="w-100">
    <div class="grid gap-1 text-left">
      <!--        <div class="mobile_controls">-->
      <!--          <label>Color C</label>-->
      <!--        </div>-->
      <!--        <div class="mobile_controls">-->
      <!--          <label>Apply to</label>-->
      <!--        </div>-->

      <div class="overflow-hidden mt-2 fade-right">
        <ul class="mobile-nav horizontal active_underline hide-scroll pr-4">
          <li v-for="(svgElement, index) in svgGroups" :key="index">
            <a style="text-transform: capitalize" :class="selectAccordionIndex == index ? 'active_line' : ''" @click="setActivePart(index), showColor(index, svgElement.gradient_colors? gradient_index === undefined? 0 : gradient_index : undefined)">{{ svgElement.id }}</a>
          </li>
        </ul>
      </div>

      <div v-if="svgGroups && svgGroups[selectAccordionIndex].gradient_colors" class="d-flex gradient-buttons w-100 flex-wrap gap-1 mt-1">
        <button v-for="(gradient_color, g_index) in svgGroups && svgGroups[selectAccordionIndex].gradient_colors" @click="showColor(selectAccordionIndex, g_index)" :key="`gradient-${g_index}`" :class="{'light': gradient_index == g_index}" class="btn btn-secondary isBtn btn-sm">Gradient {{ g_index + 1 }}</button>
      </div>

      <div class="d-flex align-items-center">
        <div style="color: #666;">Selected color:</div>
        <div class="d-flex align-items-start gap-1">
          <template v-if="svgGroups[selectAccordionIndex].gradient_colors">
            <span class="selected-color ml-2 flex-shrink-0 mt-1" :style="{ background : gradient_color_string(svgGroups[selectAccordionIndex].gradient_colors) }"></span>
            <span class="color-pantone-name gap-1 text-uppercase">
               <template v-for="(gradient_color, g_index) in svgGroups[selectAccordionIndex].gradient_colors">
                 {{ gradient_color.pantone }} {{ gradient_color.name }} <template v-if="g_index < svgGroups[selectAccordionIndex].gradient_colors.length - 1">/</template>
               </template>
              </span>
          </template>
          <template v-else>
            <span class="selected-color ml-2 flex-shrink-0 mt-1" :style="{ background : svgGroups[selectAccordionIndex].color }"></span>
            <span class="color-pantone-name text-uppercase">{{ svgGroups[selectAccordionIndex].pantone }} {{ svgGroups[selectAccordionIndex].name }}</span>
          </template>
<!--          <span class="selected-color ml-2 flex-shrink-0" :style="{background: svgGroups[selectAccordionIndex].color}"></span>-->
<!--          <div class="m-1 text-muted">-->
<!--            <span>{{ svgGroups[selectAccordionIndex].pantone }}</span>-->
<!--            <span style="text-transform: uppercase" class="ml-1">{{ svgGroups[selectAccordionIndex].name }}</span>-->
<!--          </div>-->
        </div>
      </div>
      <div class="overflow-hidden fade-right">
        <ul class="mobile-nav horizontal active_underline hide-scroll pr-4">
          <li v-for="(colorName, index) in productColors" :key="index">
            <a class="faded_text text-capitalize" :class="selectTypeIndex == index ? 'active_dark' : ''" @click="selectType(index)">{{colorName.name}}</a>
          </li>
          <li v-if="logoColorsInfo && logoColorsInfo.length">
            <a class="faded_text text-capitalize" :class="selectTypeIndex == productColors.length ? 'active_dark' : ''"
               @click="selectType(productColors.length)">Team logo colors</a>
          </li>
          <li v-if="isCustomerAuthenticated && lockerroomColors && lockerroomColors.length">
            <a class="faded_text text-capitalize" :class="selectTypeIndex == productColors.length + 1 ? 'active_dark' : ''"
               @click="selectType(productColors.length + 1)">Locker colors</a>
          </li>
          <li v-if="selectedProduct.is_custom_color_allowed">
            <a class="faded_text text-capitalize" @click="showOther">Other</a>
          </li>
        </ul>
      </div>
      <div v-if="selectTypeIndex == (productColors.length + 1)" class="overflow-hidden fade-right">
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
    </div>

    <div v-if="selectTypeIndex == productColors.length" class="mt-2 overflow-auto hide-scroll d-flex gap-1" style="padding:6px">
      <template v-for="(ext_color, ext_index) in logoColorsInfo">
        <div v-if="ext_color.hex"  class="color_circle" @click="ext_color.hex == svgGroups[selectAccordionIndex].color ? null : setColor({value: ext_color.hex, ...ext_color})"
             :title="ext_color.name" :style="{background: ext_color.hex, boxShadow: `0 0 0 3px white, 0 0 0 4px ${ext_color.hex}`}" :key="'base-color' +ext_index + ext_color.name">
<!--                    <span v-if="ext_color.hex == svgGroups[selectAccordionIndex].color || (gradient_index !== undefined && svgGroups[selectAccordionIndex].gradient_colors && svgGroups[selectAccordionIndex].gradient_colors[gradient_index].color == ext_color.hex)" class="selected" style="z-index: 100; opacity: 1">-->
<!--                      <BIconCheck />-->
<!--                    </span>-->
        </div>
      </template>
    </div>
    <template v-if="selectTypeIndex == (productColors.length + 1)">
      <div class="mt-2 overflow-auto hide-scroll d-flex gap-1" style="padding:6px">
        <div class="color_circle" @click="setColor(color)" :key="`locker_color${index}${activeLockerIndex}${activeFolderIndex}`"
             v-for="(color, index) in JSON.parse(lockerroomColors[activeLockerIndex].folders[activeFolderIndex].color)"
             :style="{background: color.value, boxShadow: `0 0 0 3px white, 0 0 0 4px ${color.value}`}">
<!--            <span v-if="color.value == svgGroups[selectAccordionIndex].color" class="selected" style="z-index: 100; opacity: 1">-->
<!--                          <BIconCheck />-->
<!--                        </span>-->
        </div>
      </div>
    </template>

    <div class="mt-2 overflow-auto hide-scroll d-flex gap-1" style="padding:6px" v-if="productColors[selectTypeIndex]">
      <div class="color_circle" :key="`color-main-${index}`" @click="color.value == svgGroups[selectAccordionIndex].color ? null : setColor(color)"
           v-for="(color, index) in productColors[selectTypeIndex].color_text"
           :style="{background: color.value, boxShadow: `0 0 0 3px white, 0 0 0 4px ${color.value}`}"></div>
    </div>

    <div v-if="showOtherColors && selectedProduct.is_custom_color_allowed" class="mobile-other">
      <span class="close" @click="hideOther"><BIconX /></span>
      <color-picker :colors-default="[]" @changeColor="changeColor" theme="light" :color="svgGroups[selectAccordionIndex] ? svgGroups[selectAccordionIndex].color : '#000000'" :sucker-hide="true"/>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop} from 'vue-property-decorator'
import ColorsTabMixin from "@/mixins/ColorsTabMixin";
import {getLockerColors} from "@/helpers/Helpers";
import colorPicker from '@caohenghu/vue-colorpicker'

@Component<ColorAccordionMobile>({
  components: {
    colorPicker,
  },
  mounted() {
    getLockerColors();
    this.showColor(this.selectAccordionIndex, undefined)
  }
})

export default class ColorAccordionMobile extends Mixins(ColorsTabMixin) {
  @Prop({required: true}) productColors!: Record<any, any>[]

  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  private showOther(){
    this.showOtherColors = true
    this.$emit('updateOtherTab', true)
  }
  private hideOther(){
    this.showOtherColors = false
    this.$emit('updateOtherTab', true)
  }

  public hideOtherTab(){
    this.$emit('updateOtherTab', false)
  }
}
</script>

<style lang="scss" scoped>
.selected-color{
  height: 15px;
  width: 15px;
  border-radius: 10000px;
  background: transparent;
  display: inline-block;
  box-shadow: 0px 1px 5px rgba(0,0,0,0.4);
}
.gradient-buttons{
  .btn-secondary{
    background: none;
    color: #333;
    border: none;

    &.light{
      background: var(--theme-color-light);
      color: var(--theme-color);
    }
  }
}
</style>
