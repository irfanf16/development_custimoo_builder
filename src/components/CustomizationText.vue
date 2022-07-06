<template>
  <div class="customization-text-area">
    <div class="px-3 pt-3 p-lg-4">
      <h2 class="fw-bold mb-2 fz-18 d-flex align-items-center justify-content-between"
        v-if="customTexts[customTextIndex].add_type && customTexts[customTextIndex].add_type == 'manual'">
        <span>Additional Text # {{ customTexts[customTextIndex].added_count }}</span>
        <template v-if="customTextIndex + 1 > selectedProduct.productnames.length">
          <b-button class="ml-1 light" size="sm" style="min-width: unset; line-height: normal" variant="dark"
            @click="$emit('removeTab')">
            <b-icon-x />
          </b-button>
        </template>
      </h2>
      <h2 class="fw-bold mb-2 fz-18 d-flex align-items-center justify-content-between" v-else>
        <span :key="selectedProduct.id+''+customTextIndex">{{ productNames[customTextIndex]? productNames[customTextIndex].name_of_placement: '' }}</span>
      </h2>

      <div class="d-flex">
        <b-form-input @click="isHidden = !isHidden" class="mb-2 mr-sm-2 mb-sm-0" placeholder="Type Here"
          :value="customTexts[customTextIndex].text" @blur="toggleAccordian(customTextIndex, $event , 'blur')" @focus="toggleAccordian(customTextIndex, $event , 'focus')" @input="updateTextField(customTextIndex, $event)" ></b-form-input>
        <button v-b-toggle="'accordion-' + (customTextIndex + 1)"
          class="d-flex align-items-center btn btn-secondary light">
          <span class="minus d-flex align-items-center">
            <BIconDash class="minus" /> Collapse
          </span>
          <span class="plus d-flex align-items-center">
            <BIconPlus class="plus" /> Modify
          </span>
        </button>
      </div>

      <b-collapse :ref="'accordion-' + (customTextIndex + 1)" :id="'accordion-' + (customTextIndex + 1)" accordion="my-accordion" role="tabpanel">
        <div class="font-type-area">

          <div class="fade-right w-100 py-2">
            <div class="overflow-auto d-flex align-items-center theme-scroll-h pointer pb-2 gap-2 fontList ">
              <div v-for="(item, i) in fontOptions" :key="i" :style="{ fontSize: '20px', fontFamily: item.value, color: customTexts[customTextIndex].fontFamily == item.value ? '#000000' : '#808895'}"
                @click="fontOptionChanged(customTextIndex, item.value)" style="white-space: nowrap"
                :class="{ 'pr-3': i + 1 == fontOptions.length }" role="button">
                <span :key="'font'+selectedProduct.id+''+customTextIndex" v-b-tooltip.right="customTexts[customTextIndex].text ? item.value : ''">
                  {{ customTexts[customTextIndex].text ? customTexts[customTextIndex].text : item.value }}
                </span>
              </div>
            </div>
         </div>

        </div>
        <h4 class="mt-3 mb-2 fz-16">Select Color</h4>
        <div class="text-color-holder" :class="{ active: customTexts[customTextIndex].selectColor }">
          <!--      <div class="text-color-holder active" >-->
          <a @click="showColor('fill', customTextIndex)"
            :style="[{ borderColor: textColorType === 'fill' ? customTexts[customTextIndex].fillColor : null }]">
            <div class="text-color-box">
              <div class="color-circle"
                :style="{ background: customTexts[customTextIndex].fillColor ? customTexts[customTextIndex].fillColor : ' url(' + colorImage + ') no-repeat 50% 50% / 12px' }">
              </div>
              <strong>Fill Color</strong>
            </div>
          </a>
          <a @click="showColor('outline', customTextIndex)"
            v-if="customTexts[customTextIndex].outlineEnabled && customTexts[customTextIndex].outLineWidth >= 0"
            :style="[{ borderColor: textColorType === 'outline' ? customTexts[customTextIndex].outLineColor : null }]">
            <div class="text-color-box">
              <div class="color-circle"
                :style="{ background: customTexts[customTextIndex].outLineColor ? customTexts[customTextIndex].outLineColor : ' url(' + colorImage + ') no-repeat 50% 50% / 12px' }">
              </div>
              <strong>Outline Color</strong>
            </div>
          </a>
          <div class="color-holder">
            <b-card-body style="padding: 0 !important;">
              <b-nav class="d-flex flex-wrap align-items-center">
                <b-nav-item class="mr-2" v-for="(colorType, index) in fontsColors" :key="index"
                  @click="selectType(index)">{{ colorType.file_type }}</b-nav-item>
              </b-nav>
              <!--            <div class="color-holder">-->
              <!--              <div class="">-->
              <!--                <div class="color-box" v-for="(color, index) in fontColor" @click="setColor(color)"
                       :title="color.name" :style="{background: color.value}" :key="index">
                  </div>-->
              <TextColorTabs ref="text-color-tab" @setColors="setColor" :productColors="productColors"
                :showSVGS="Boolean(showSVGs)" />
              <!--              </div>-->
              <!--            </div>-->
            </b-card-body>
          </div>
        </div>
        <div class="outline-slider-area d-flex justify-content-between pt-4">
          <template v-if="customTexts[customTextIndex].outlineEnabled">
            <div class="mr-sm-2 mb-sm-0">
              <label for="range-2 fz-16">Outline Width</label>
              <b-form-input class="mt-2" id="range-2" :value="customTexts[customTextIndex].outLineWidth"
                @change="outLineWidthValueChanged($event)" type="range" min="0" max="10" step="1"></b-form-input>
              <div class="mt-2">Outline Size: {{ customTexts[customTextIndex].outLineWidth }}px</div>
            </div>
          </template>
          <div>
            <label for="range-2 fz-16">Placement</label>
            <b-form-select :style="{ fontSize: '18px', height: '44px' }" :value="customTexts[customTextIndex].side"
            @change="changeSide(customTextIndex, $event)" :options="['front', 'back']"></b-form-select>
          </div>
        </div>
      </b-collapse>
    </div>
  </div>
</template>

<script lang="ts">

import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import ColorTabs from '@/components/ColorTabs.vue'
import TextColorTabs from "@/components/TextColorTabs.vue";
import { getClosestColor } from '@/pantoneColor'
import { findIndex, values } from 'lodash'
import {getSelectedProductPantones} from "@/helpers/Helpers";


@Component<CustomizationText>({
  components: {
    TextColorTabs,
    ColorTabs
  },
  mounted() {
    this.$nextTick(() => {
      this.selectType(this.selectTypeIndex)
    })
    this.getColors()

    this.$root.$on('bv::show', () =>{
      console.log('ishown');
    })
  },
  filters: {
    capitalize: (value: string) => {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    }
  }
})
export default class CustomizationText extends Vue {
  @Prop({ required: true }) productFonts!: any
  @Prop({ required: true }) fontsColors!: any
  @Prop({ required: true }) customTextIndex!: any
  @Prop({ required: true }) fontOptions!: any

  public selectedFont = null
  public colorImage = '/img/images/color-placeholder.png'
  public textColorType = ''
  public fontColorIndex = -1
  public selectTypeIndex = 0
  public fontColor: any[] = []
  public outLineWidthValue = 0
  public productColors: any[] = []
  public showSVGs = false
  public openIndex = -1

  get productNames() {
    return this.$store.getters.getSelectedProduct.productnames;
  }

  public setOpenIndex(index: any) {
    this.openIndex = index;
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts()
  }

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }
  get logoColors(): [] {
    return this.$store.getters.getLogosColors
  }

  get lockerColors() {
    return this.$store.getters.getLockerColors
  }

  public getColors() {
    this.productColors = []
    this.selectedProduct.colors.forEach((colors: any, key: number) => {
      let finalColor = { color_text: [], selectedColor: "", name: colors.file_name.substr(0, colors.file_name.indexOf('.')) }
      finalColor.color_text = JSON.parse(colors.json_data)
      this.productColors = this.productColors.concat(finalColor)
    })
    this.productColors = this.productColors.concat(this.lockerColors)

    if (this.logoColors.length) {
      let logoColorsNew: any[] = []
      this.logoColors.forEach((color: any, index: number) => {
        logoColorsNew = logoColorsNew.concat([{ name: color.pantone, value: color.hex, position: index + 1 }])
      })
      let teamLogoColors = [{ name: 'Team Logo Colors', color_text: logoColorsNew, selectedColor: '' }]
      this.productColors = this.productColors.concat(teamLogoColors)

    }
  }

  public showColor(fontColorType: any, fontColorIndex: number) {
    this.fontColorIndex = fontColorIndex
    this.customTexts.forEach((customText: Record<any, any>, index: number) => {
      if (index == fontColorIndex) {
        this.$store.dispatch('updateCustomTextAttribute', { index: index, on_all: true, attribute: 'selectColor', value: !customText.selectColor })

        if (this.textColorType === fontColorType && customText.selectColor) {
          this.$store.dispatch('updateCustomTextAttribute', { index: index, on_all: true, attribute: 'selectColor', value: true })
        }
      } else {
        this.$store.dispatch('updateCustomTextAttribute', { index: index, on_all: true, attribute: 'selectColor', value: false })
      }

      this.textColorType = fontColorType
    })
  }

  public fontOptionChanged(index: number, event: any) {
    console.log(index, event , this.isFontChanged)
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)), action: 'customTexts' })
    this.$store.dispatch('updateCustomTextAttribute', { index: index, on_all: false, attribute: 'fontFamily', value: event })
    if(index == 0 && !this.isFontChanged){
      this.$store.dispatch('updateCustomTextAttribute', { index: 1, on_all: false, attribute: 'fontFamily', value: event })
    } //  setting same font as text for number | Done by: Uzair
  }

  public changeSide(index: number, event: string) {
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)), action: 'customTexts' })
    this.$store.dispatch('updateCustomTextAttribute', { index: index, on_all: true, attribute: 'side', value: event })
  }

  public setColor(color: Record<any, any>) {
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)), action: 'customTexts' })
    const selectProductPantonesList = getSelectedProductPantones()
    let pantone = getClosestColor(color.value, selectProductPantonesList);
    let color_pantone = color.name;
    if (pantone && pantone.pantone && pantone.pantone != 'undefined') {
      color_pantone = pantone.pantone;
    }

    if (this.textColorType == 'fill') {
      this.$store.dispatch('updateCustomTextAttribute', { index: this.fontColorIndex, on_all: true, attribute: 'fillColor', value: color.value })
      this.$store.dispatch('updateCustomTextAttribute', { index: this.fontColorIndex, on_all: true, attribute: 'fillColorPantone', value: color_pantone })
    } else {
      this.$store.dispatch('updateCustomTextAttribute', { index: this.fontColorIndex, on_all: true, attribute: 'outLineColor', value: color.value })
      this.$store.dispatch('updateCustomTextAttribute', { index: this.fontColorIndex, on_all: true, attribute: 'outLineColorPantone', value: color_pantone })
    }
  }

  public selectType(index: number) {
    this.selectTypeIndex = index
    this.fontColor = this.fontsColors[this.selectTypeIndex].color_text
  }

  outLineWidthValueChanged(event: string) {
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)), action: 'customTexts' })
    this.$store.dispatch('updateCustomTextAttribute', { index: this.customTextIndex, on_all: true, attribute: 'outLineWidth', value: event })
  }
  public isHidden = false

  updateTextField(index: number, value: string) {
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)), action: 'customTexts' })
    this.$store.dispatch('updateCustomTextAttribute', { index: index, on_all: true, attribute: 'text', value: value })
    this.initRosterFromTexts()
  }

  toggleAccordian(index:number , value: string , action: string) {
    if(action == "focus"){
      this.$refs[`accordion-${index+1}`].show = true
    }
    else if(action == "blur" && this.customTexts[index].text.length < 1){
      this.$refs[`accordion-${index+1}`].show = false
    }
  }

  public initRosterFromTexts() {
    const custom_name_index = findIndex(this.customTexts, { type: 'name' });
    const custom_number_index = findIndex(this.customTexts, { type: 'number' });
    if (custom_name_index != -1) {
      this.$store.commit('rosterDetailAttributeWithoutTrigger', { index: 0, attribute: 'text', value: this.customTexts[custom_name_index].text })
    }
    if (custom_number_index != -1) {
      this.$store.commit('rosterDetailAttributeWithoutTrigger', { index: 0, attribute: 'number', value: this.customTexts[custom_number_index].text })
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
</style>
