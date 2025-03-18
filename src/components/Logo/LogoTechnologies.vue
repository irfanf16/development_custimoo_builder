<template>
  <div
    class="logo-placement-area extracted-color-area"
    v-if="logoTechnologies?.length > 0"
  >
    <h4 class="mb-0 mb-lg-4">Logo Technology</h4>
    <div class="mb-lg-3 w-100">
      <div class="color-holder">
        <div class="color-container pt-2 pr-2">
          <div
            v-for="(logoTechnology, index) in logoTechnologies"
            :key="index"
            class="form-check w-100"
          >
            <template>
              <label :for="'color-' + index" class="form-check-label">
                <input
                  type="checkbox"
                  :value="logoTechnology"
                  class="form-check-input"
                  :id="'logo-tech-' + index"
                  :checked="
                    selectedLogoTechnology?.sku_id === logoTechnology.sku_id
                  "
                  @change="selectLogoTechnology(logoTechnology)"
                />
                {{ logoTechnology.label }}
                <template v-if="logoTechnology.price && product_price_object.show_price">
                  +{{ logoTechnology.price }}{{ logoTechnology.currency_symbol }}
                </template>
              </label>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Mixins } from "vue-property-decorator";
import ErrorMessages from "@/mixins/ErrorMessages";
import {
  getProductLogoTechnologies,
} from "@/helpers/Helpers";
import LogoEditor from "@/components/Logo/LogoEditor.vue";
import ModalAction from "@/mixins/ModalAction";
import LogoDisclaimerModal from "@/components/Logo/LogoDisclaimerModal.vue";
import LogoColorTabsNew from "@/components/LogoColorTabsNew.vue";
import { LogoUploaderColors } from "@/mixins/LogoUploaderColors";
import { LogoPlacementTabMixin } from "@/mixins/LogoPlacementTabMixin";

@Component<LogoTechnologies>({
  components: { LogoDisclaimerModal, LogoEditor, LogoColorTabsNew },
  mounted() {
    this.logoTechnologies = getProductLogoTechnologies(this.customLogoIndex,this.customLogo);
    if (this.customLogo?.logo_technology) {
      this.selectedLogoTechnology = this.customLogo.logo_technology;
    }
  },
})
export default class LogoTechnologies extends Mixins(
  ErrorMessages,
  ModalAction,
  LogoUploaderColors
) {
  /*
   * props starts here
   * */

  @Prop({ required: true }) customLogo: Record<any, any>;
  @Prop({ required: true }) customLogoIndex: Record<any, any>;

  /*
   * props ends here
   * */

  /*
   * data props starts here
   * */

  public logoTechnologies: Record<any, any>[] = [];
  public selectedLogoTechnology: Record<any, any> | null = null;
  /*
   * data props ends here
   * */

  /*
   * computed props starts
   * */
   get product_price_object(){
    return this.$store.getters.getProductPriceObject;
  }
  /*
   * computed props ends
   * */

  /*
   * Methods starts
   * */

  /**
   * Checks if a technology is already selected.
   */

  private async selectLogoTechnology(logoTechnology: Record<string, any>) {
    if (this.selectedLogoTechnology?.sku_id === logoTechnology.sku_id) {
      this.selectedLogoTechnology = null;
    } else {
      this.selectedLogoTechnology = logoTechnology;
    }
    this.$emit("update-logo-tech", this.selectedLogoTechnology);
  }

  /**
   * Toggles selection of a logo technology.
   */

  /*
   * Methods ends
   * */
}
</script>

<style lang="scss" scoped></style>
