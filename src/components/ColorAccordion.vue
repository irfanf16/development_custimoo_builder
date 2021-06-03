<template>
  <div class="accordion" role="tablist">
    <b-card no-body v-for="(svgElement, index) in svgGroups" :key="index">
      <b-card-header header-tag="header" class="p-0" role="tab">
        <b-button block v-b-toggle="'accordion-'+(index+1)" class="p-3" @click="showColor(index)"><span class="text">{{ svgElement.id | capitalize }}</span> <span class="color"><span
          class="color-box" :style="{ background : svgElement.color? svgElement.color : ' url(' + colorImage + ') no-repeat 50% 50% / 20px' }"></span> <span class="color-pantone-name">{{ svgElement.pantone }}</span></span> <span class="accordion-icon"></span></b-button>
      </b-card-header>
      <b-collapse :id="'accordion-'+(index+1)" visible accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <b-nav class="d-flex flex-wrap align-items-center">
            <b-nav-item class="mr-2" v-for="(colorType, index) in productColors" :key="index" @click="selectType(index)">{{ colorType.name | capitalize }}</b-nav-item>
            <b-nav-item @click="selectType(index, true)">Others</b-nav-item>
          </b-nav>
          <div class="color-holder">
            <div class="color-container">
              <div v-if="showOther" class="custom-color-picker">
                <color-picker @changeColor="changeColor" theme="light" :color="svgElement.color" :sucker-hide="true"/>
              </div>
              <div v-else class="color-box" v-for="(color, index) in productColor" @click="setColor(color)"
                   :title="color.name" :style="{background: color.value}" :key="index">
              </div>
            </div>
          </div>
        </b-card-body>
      </b-collapse>
    </b-card>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import colorPicker from '@caohenghu/vue-colorpicker'

import getClosestColor from '@/pantoneColor'

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
    this.selectType(this.selectTypeIndex)
    }, 300)
  }
})
export default class ColorAccordion extends Vue {
  @Prop({required: true}) productColors!: any

  public color= '#59c7f9'
  public showOther = false
  public selectAccordionIndex = 0
  public selectTypeIndex = 0
  public productColor: any[] = []
  public colorImage = '/img/images/color-placeholder.png'

  get svgGroups() {
    return this.$store.getters.getSvgGroups
  }

  public showColor(index: number) {
    this.selectAccordionIndex = index
  }

  public selectType(index: number, showOther = false) {
    this.selectTypeIndex = index
    this.showOther = showOther
    this.productColor = this.productColors[this.selectTypeIndex].color_text
  }

  public setColor(color: Record<any, any>) {
    this.$store.dispatch('updateGroupColors', { index: this.svgGroups[this.selectAccordionIndex].id, color: color.value, pantone: color.name })
  }

  public changeColor(color: Record<any, any>) {
    let pantoneColor = getClosestColor(color.hex)
    this.setColor({value: pantoneColor.hex, name: pantoneColor.pantone})
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
</style>