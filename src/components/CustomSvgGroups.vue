<template>
  <div class="logo-placement-area extracted-color-area"
       v-if="selectedProduct.product_type == 'customized' && displayCustomSvgGroups.length">
    <h4 class="mb-0 mb-lg-4">Custom color groups (not shown in mockup)</h4>
    <div class="mb-lg-3 w-100">
      <div class="d-flex align-items-center justify-content-between">
        <div class="color-holder">
          <div class="color-container pt-2 d-flex flex-column">
            <div
              class="d-flex align-items-center gap-2 py-1"
              v-for="(svgElement, index) in displayCustomSvgGroups"
              :key="'custom-svg-group-' + index"
            >
              <div class="flex-grow-1">
                {{ svgElement.name || svgElement.color || 'N/A' }}
              </div>
              <div class="d-flex align-items-center gap-2">
                <span
                  class="color-box"
                  :style="{background: svgElement.color ? svgElement.color : '#fff'}"
                  :title="svgElement.color || 'N/A'"
                ></span>
                <span>{{ svgElement.pantone || svgElement.color || 'N/A' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import {LogoUploaderColors} from '@/mixins/LogoUploaderColors'

type SvgGroupEntry = {
  color?: string
  count: number | null
  pantone?: string
  name?: string
  id?: string
}

@Component<CustomSvgGroups>({})
export default class CustomSvgGroups extends Mixins(LogoUploaderColors) {
  get selectedProduct(): Record<string, unknown> {
    return this.$store.getters.getSelectedProduct
  }

  get customSvgGroups(): SvgGroupEntry[] {
    return (this.$store.getters.getCustomSvgGroups || []) as SvgGroupEntry[]
  }

  get displayCustomSvgGroups(): SvgGroupEntry[] {
    return this.customSvgGroups.length >= 4
      ? (this.customSvgGroups || []).slice(0, 4) as SvgGroupEntry[]
      : this.customSvgGroups || [] as SvgGroupEntry[]
  }
}
</script>

