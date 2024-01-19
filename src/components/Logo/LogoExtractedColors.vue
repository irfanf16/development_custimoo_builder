<template>
  <div class="logo-placement-area extracted-color-area"
       v-if="logoColorsInfo.colors.length > 0 && selectedProduct.product_type == 'customized'">
    <h4 class="mb-0 mb-lg-4">Color Extracted from Logo</h4>
    <div class="mb-lg-3 w-100">
      <div class="color-holder">
        <div class="color-container pt-2">
          <div class="color-box" v-for="(logo_color, logoColorIndex) in logoColorsInfo.colors"
               @click="selectLogoColor(logo_color, logoColorIndex)" :title="logo_color.name"
               :class="{'active-swatch' : logoColorIndex == active_logo_color_index, 'noColor': !logo_color.hex}"
               :style="{background: logo_color.hex ? logo_color.hex : '#fff', cursor: 'pointer'}" :key="logoColorIndex + logo_color.name">
            <template v-if="logo_color.hex">
              <span class="removeColor" @click.stop="deleteLogoColor(logoColorIndex)">
                <BIconX />
              </span>
            </template>
            <template v-else>
              <BIconPlus class="addColor" />
            </template>
            <span class="selected">
              <BIconCheck />
            </span>
          </div>
          <LogoColorTabsNew v-if="active_logo_color_index >= 0" @setSwatchColor="setSwatchColor" :productColors="product_colors"
                            :logoColorIndex="active_logo_color_index"
          />
        </div>
      </div>
      <div class="d-flex align-items-center justify-content-center gap-1">
        <b-button @click="useOriginalColors" class="use-btn flex-shrink-1" v-if="logoColorsInfo.using_logo_colors"
                  :class="{'pulse-animation': pulse_info.original_colors}"
                  style="white-space: nowrap; max-width: 200px">
          Use Original Colors
        </b-button>
        <b-button v-else="" @click="useLogoColors" class="use-btn flex-shrink-1" style="white-space: nowrap;
         max-width: 200px" :class="{'pulse-animation': pulse_info.use_logo_colors}">
          Use Logo Colors
        </b-button>
        <b-button class="use-btn flex-shrink-1" @click="shuffleLogoColors" v-if="logoColorsInfo.using_logo_colors"
                  :class="{'pulse-animation': !logoColorsInfo.is_shuffled}"
                  variant="secondary">Shuffle
        </b-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {Component, Prop, Watch, Vue, Mixins} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";
import {getProductColors} from '@/helpers/Helpers'
import LogoEditorModal from "@/components/LogoEditorModal.vue";
import LogoEditor from "@/components/Logo/LogoEditor.vue";
import ModalAction from "@/mixins/ModalAction";
import LogoDisclaimerModal from "@/components/Logo/LogoDisclaimerModal.vue";
import LogoColorTabsNew from "@/components/LogoColorTabsNew.vue";
import {LogoUploaderColors} from '@/mixins/LogoUploaderColors'

@Component<LogoExtractedColors>({
  components: { LogoEditorModal, LogoDisclaimerModal, LogoEditor, LogoColorTabsNew },
  mounted() {
   this.product_colors = getProductColors();
 }
})
export default class LogoExtractedColors extends Mixins(ErrorMessages, ModalAction, LogoUploaderColors) {

  /*
  * props starts here
  * */

  @Prop({ required: true }) customLogo!: Record<any, any>

  /*
  * props ends here
  * */

  /*
  * data props starts here
  * */

  public product_colors: Record<any, any>[] = []
  /*
  * data props ends here
  * */

  /*
  * computed props starts
  * */

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get usingLogoColors() {
    return this.logoColorsInfo.using_logo_colors
  }

  /*
  * computed props ends
  * */

  /*
  * Methods starts
  * */

  /*
  * Methods ends
  * */
}

</script>

<style lang="scss" scoped>

</style>
