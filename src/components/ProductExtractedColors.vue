<template>
    <div class="logo-placement-area extracted-color-area"
         v-if="selectedProduct.product_type == 'customized'">
      <h4 class="mb-0 mb-lg-4">Color Extracted from Product</h4>
      <div class="mb-lg-3 w-100">
        <div class="d-flex align-items-center justify-content-between">
          <div class="color-holder">
            <div class="color-container pt-2">
              <div class="color-box" v-for="(svgElement, index) in updateExtractedColors"
                   @click="selectLogoColor({ hex: svgElement.color, pantone: svgElement.pantone, name: svgElement.name }, index)" :title="svgElement.pantone ? svgElement.pantone : svgElement.name"
                   :class="{'active-swatch' : index == active_logo_color_index, 'noColor': !svgElement.color}"
                   :style="{background: svgElement.color ? svgElement.color : '#fff', cursor: 'pointer'}" :key="'extracted-color-' + index">
                <template v-if="svgElement.color">
                  <span class="removeColor"
                        @click.stop="removeExtractedColor(index)">
                    <BIconX />
                  </span>
                </template>
                <template v-else>
                  <BIconPlus class="addColor" @click.stop="showColorPickerForReplacement(index)" />
                </template>
                <span class="selected">
                  <BIconCheck />
                </span>
              </div>
            </div>
          </div>
          <div class="d-flex align-items-center justify-content-end gap-1 mt-2 mr-2">
            <b-button class="use-btn flex-shrink-1" variant="secondary" 
                      :disabled="!canShuffle" 
                      @click="shuffleSelectedColors">
              Shuffle
            </b-button>
          </div>
        </div>
        <div v-if="showReplacementPicker" class="mt-3">
          <div class="accordion mt-1" role="tablist">
            <b-tabs>
              <b-tab>
                 <template #title>
                   {{capitalize(removeExt(String((product_colors[0]).name)))}}
                 </template>
                 <div class="color-holder">
                   <div class="color-container">
                     <div class="color-box" v-for="(color, colorIndex) in (product_colors[0]).color_text" :style="{background: (color).value}"
                          :key="`product_color_${(product_colors[0]).type}_type_color_${colorIndex}`" :title="(color).name"
                          @click="setReplacementColor(color)"></div>
                   </div>
                 </div>
              </b-tab>
              <b-tab v-if="lockerroomColors && lockerroomColors.length && isCustomerAuthenticated">
                <template #title>
                  Locker colors
                </template>
                <div class="color-holder">
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
                  <div class="color-container mt-1">
                    <template v-for="(color, colorIndex) in JSON.parse(lockerroomColors[activeLockerIndex].folders[activeFolderIndex].color)">
                      <div class="color-box" :style="{background: color.value}" v-if="color.value"
                           :key="`text_color_${colorIndex}${color.name}`" :title="color.name"
                           @click="setReplacementColor(color)"></div>
                    </template>
                  </div>
                </div>
              </b-tab>
              <b-tab v-if="selectedProduct.is_custom_color_allowed">
                <template #title>
                  Others
                </template>
                <template>
                  <b-form class="pantone-color-field" v-on:submit.prevent>
                    <label>Pantone: (TCX Colors)</label>
                    <b-form-input
                      :value="pantoneColorVal || 'XX-XXXX'"
                      class="mb-2 mr-sm-2 mb-sm-0"
                      @input="setPantoneColor($event)"
                      placeholder="XX-XXXX"
                    ></b-form-input>
                    <div class="text-danger fs-2" v-if="pantoneMessage != ''">{{pantoneMessage}}</div>
                  </b-form>
                  <div class="color-holder">
                    <div class="color-container color-picker-container">
                      <color-picker @changeColor="setReplacementColor($event, 'color-picker')"
                                    :colors-default="[]" :key="swatchColor" :color="swatchColor" theme="light"
                                    :colors-history="false" :ref="`product-color-picker`"/>
                    </div>
                  </div>
                </template>
              </b-tab>
            </b-tabs>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  
  import {Component, Mixins} from 'vue-property-decorator'
  import ErrorMessages from "@/mixins/ErrorMessages";
  import {getProductColors} from '@/helpers/Helpers'
  import LogoEditor from "@/components/Logo/LogoEditor.vue";
  import ModalAction from "@/mixins/ModalAction";
  import LogoDisclaimerModal from "@/components/Logo/LogoDisclaimerModal.vue";
  import {LogoUploaderColors} from '@/mixins/LogoUploaderColors'
  import ColorsTabMixin from '@/mixins/ColorsTabMixin';
  import colorPicker from '@caohenghu/vue-colorpicker';
  import {getClosestColor} from '@/pantoneColor';
  import {getSelectedProductPantones} from "@/helpers/Helpers";
  
  type SvgGroupEntry = {
    color?: string
    count: number | null
    pantone?: string
    name?: string
    id?: string
  }

  type ColorOption = {
    value: string
    name?: string
    pantone?: string
  }
  
  @Component<ProductExtractedColors>({
    components: { LogoDisclaimerModal, LogoEditor, colorPicker },
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
    },
    mounted() {
     this.product_colors = getProductColors();
     this.currentProductId = this.selectedProduct?.id as string;
     if (this.extractedColors.length === 0) {
       const groups = this.initialSvgGroups.length >= 4
         ? (this.initialSvgGroups || []).slice(0, 4) as SvgGroupEntry[]
         : this.initialSvgGroups || [] as SvgGroupEntry[];
       this.extractedColors = groups;
     }
   },
    watch: { 
     selectedProduct: {
       handler(newProduct, oldProduct) {
         this.extractedColors = [];
         this.currentProductId = null;
       },
       deep: true
     }
   }
  })
  export default class ProductExtractedColors extends Mixins(ErrorMessages, ModalAction, LogoUploaderColors, ColorsTabMixin) {
  
    /*
    * props ends here
    * */
  
    /*
    * data props starts here
    * */
  
    public product_colors: Array<Record<string, unknown>> = []
    public showReplacementPicker = false
    public extractedColors: SvgGroupEntry[] = []
    public showOther = false;
    public activeReplacementIndex = -1;
    public pantoneColorVal: string | null = null;
    public swatchColor = '#59c7f9';
    public currentProductId: string | null = null;
    /*
    * data props ends here
    * */
  
    /*
    * computed props starts
    * */
  
    get selectedProduct(): Record<string, unknown> {
      return this.$store.getters.getSelectedProduct
    }

    get initialSvgGroups(): SvgGroupEntry[] {
      return this.$store.getters.getInitialSvgGroups as SvgGroupEntry[]
    }

    get svgGroups(): SvgGroupEntry[] {
        return this.$store.getters.getSvgGroups as SvgGroupEntry[]
    }

    get updateExtractedColors(): SvgGroupEntry[] {
      const currentProductId = this.selectedProduct?.id as string;
      
      if (this.extractedColors.length === 0 || this.currentProductId !== currentProductId) {
        const groups = this.initialSvgGroups.length >= 4
          ? (this.initialSvgGroups || []).slice(0, 4) as SvgGroupEntry[]
          : this.initialSvgGroups || [] as SvgGroupEntry[];
        this.extractedColors = groups;
        this.currentProductId = currentProductId;
      }
      return this.extractedColors;
    }

    get replacementColors(): ColorOption[] {
        const group = (this.svgGroups || [])[this.selectAccordionIndex] as SvgGroupEntry
        const container = group && group.id ? this.getSvgGroupColors(group.id) : null
        const raw = (container && container.json_data) ? container.json_data : []
        return (raw as Array<Record<string, unknown>>).map((c) => ({
          value: String((c as Record<string, unknown>).value || ''),
          name: (c as Record<string, unknown>).name as string | undefined,
          pantone: (c as Record<string, unknown>).pantone as string | undefined
        }))
    }

    get replacementColorsFiltered(): ColorOption[] {
        return this.replacementColors.filter((c) => !!c.value)
    }

    get isCustomerAuthenticated(): boolean {
      return this.$store.getters.isCustomerAuthenticated
    }

    get selectedColors(): SvgGroupEntry[] {
      return this.extractedColors.filter(color => color.color && color.color.trim() !== '');
    }

    get canShuffle(): boolean {
      return this.initialSvgGroups.length <= 2 ? true : this.selectedColors.length >= 3;
    }
  
    /*
    * computed props ends
    * */
  
    /*
    * Methods starts
    * */

    public removeExtractedColor(index: number): void {
      this.extractedColors.splice(index, 1, {
          color: '',
          count: null,
          id: '',
          name: '',
          pantone: ''
        }
      )
    }

    public showColorPickerForReplacement(index: number): void {
      this.activeReplacementIndex = index;
      this.showReplacementPicker = true;
    }

    public setReplacementColor(color: Record<string, unknown>, emitter = ''): void {
      if (this.activeReplacementIndex >= 0) {
        let colorValue: string;
        let colorName: string;
        let colorPantone: string;

        if (emitter === 'color-picker') {
          const selectProductPantonesList = getSelectedProductPantones();
          const pantoneColor = getClosestColor(color.hex as string, selectProductPantonesList, this.getColorType);
          colorValue = pantoneColor.hex;
          colorName = pantoneColor.name;
          colorPantone = pantoneColor.pantone;
        } else {
          colorValue = (color.hex || color.value) as string;
          colorName = color.name as string;
          colorPantone = color.pantone as string;
        }

        // Update the local extracted colors array
        this.extractedColors.splice(this.activeReplacementIndex, 1, {
          color: colorValue,
          count: null,
          id: '',
          name: colorName,
          pantone: colorPantone
        });

        // Update the corresponding SVG group in the store
        const svgGroup = this.initialSvgGroups[this.activeReplacementIndex];
        if (svgGroup) {
          this.$store.commit('UPDATE_GROUP_COLORS', {
            index: svgGroup.id,
            gradient_index: undefined,
            color: colorValue,
            pantone: colorPantone,
            name: colorName
          });
          
          // Emit the change event to update the display
          this.$eventBus.$emit('changeGroupColors');
        }

        this.showReplacementPicker = false;
        this.activeReplacementIndex = -1;
      }
    }

    public setPantoneColor(event: string): void {
      this.pantoneColorVal = event;
      const pantoneColor = this.getPantoneColor(event);
      if (pantoneColor) {
        this.setReplacementColor({ hex: pantoneColor.hex, name: pantoneColor.name, pantone: pantoneColor.pantone });
      }
    }

    public getPantoneColor(colorCode: string): Record<string, string> | null {
      const colorObject: Record<string, unknown> = {};
      const success = this.changeLogoPantoneColor(colorCode, colorObject);
      if (success) {
        return {
          hex: colorObject.hex as string,
          name: colorObject.name as string,
          pantone: colorObject.pantone as string
        };
      }
      return null;
    }

    public applyReplacementColor(color: ColorOption): void {
      this.setColor(color)
      this.showReplacementPicker = false
    }

    public capitalize(value: string): string {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    }

    public removeExt(value: string): string {
      if (!value) return ''
      value = value.toString()
      return value.replace(/\.[^/.]+$/, "")
    }

    public shuffleSelectedColors(): void {
      if (this.selectedColors.length < 2) {
        return;
      }
      this.setShuffledColors(this.selectedColors);
    }

    private updateLocalExtractedColors(): void {
      const updatedGroups = this.initialSvgGroups.length >= 4
        ? (this.initialSvgGroups || []).slice(0, 4) as SvgGroupEntry[]
        : this.initialSvgGroups || [] as SvgGroupEntry[];
      
      this.extractedColors = updatedGroups;
    }

    /*
    * Methods ends
    * */
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

    .hu-color-picker .color-show ~ *{
      display: none !important;
    }
  }

  .addColor {
    cursor: pointer;
    transition: opacity 0.2s ease;
    
    &:hover {
      opacity: 0.7;
    }
  }
  </style>
  