<template>
  <div class="accordion" role="tablist">
    <b-card no-body v-for="(svgElement, index) in svgGroups" :key="index">
      <b-card-header header-tag="header" class="p-0" role="tab">
        <b-button block v-b-toggle="'accordion-'+(index+1)" class="p-3" @click="showColor(index)">
          <span class="text">{{ svgElement.id | capitalize }}</span>
          <span class="color">
            <span class="color-box" :style="{ background : svgElement.color? svgElement.color : ' url(' + colorImage + ') no-repeat 50% 50% / 20px' }"></span>
            <span class="color-pantone-name">{{ svgElement.pantone }}<span style="text-transform: uppercase; display: block">{{ svgElement.name }}</span><span style="text-transform: uppercase;">{{ svgElement.pantoneName }}</span></span>
          </span>
          <span class="accordion-icon"></span>
        </b-button>
      </b-card-header>
      <b-collapse :id="'accordion-'+(index+1)" visible accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <b-nav class="d-flex flex-wrap align-items-center">
            <b-nav-item v-bind:class="{ 'active' : index == selectTypeIndex && !othersActive}" class="mr-2 " v-for="(colorType, index) in productColors" :key="index" @click="selectType(index)">{{ colorType.name | capitalize }}</b-nav-item>
            <b-nav-item :class="{ active: othersActive }" @click="selectType(index, true)">Others</b-nav-item>
          </b-nav>
          <div class="color-holder">
            <div class="color-container">
              <div v-if="showOther" class="custom-color-picker">
                <b-form class="pantone-color-field" v-on:submit.prevent>
                  <label class="mb-2" for="inline-form-input-pantone-color">Pantone: (TCX Colors)</label>
                  <b-form-input
                    v-model="svgGroups[selectAccordionIndex].pantone"
                    class="mb-2 mr-sm-2 mb-sm-0"
                    placeholder="XX-XXXX"
                    @input="changePantoneColor"
                  ></b-form-input>
                  <div class="pantone-message">
                    {{ pantoneMessage }}
                  </div>
                </b-form>
                <color-picker @changeColor="changeColor" theme="light" :color="svgElement.color" :sucker-hide="true" />
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
import {Component, Prop, Watch, Vue} from 'vue-property-decorator'
import colorPicker from '@caohenghu/vue-colorpicker'

import {getClosestColor, pantones, getPantoneColor} from '@/pantoneColor'

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
  public pantoneColorVal= '18-0107'
  public showOther = false
  public selectAccordionIndex = 0
  public selectTypeIndex = 0
  public productColor: any[] = []
  public selectedColorTab = 0;
  public colorImage = '/img/images/color-placeholder.png'
  public pantoneMessage = ''
  public isActive = false
  public othersActive = false

  get svgGroups() {
    return this.$store.getters.getSvgGroups
  }

  public showColor(index: number) {
    this.selectAccordionIndex = index
  }

  public selectType(index: number, showOther = false) {

    //console.log('showOther',showOther);
    //console.log('index',index);

    if (showOther){
      this.othersActive = true;
    }
    else {
      this.othersActive = false;
    }


    //console.log('this.productColors',this.productColors);

    this.selectTypeIndex = index
    this.showOther = showOther
    this.productColor = this.productColors[this.selectTypeIndex].color_text

    if(this.selectTypeIndex){
      this.isActive = !this.isActive
    }
    else {
      this.isActive = false
    }
  }

  public setColor(color: Record<any, any>) {
    this.$store.dispatch('updateGroupColors',
      {
        index: this.svgGroups[this.selectAccordionIndex].id,
        color: color.value,
        pantone: color.pantone,
        name: color.name
      })
  }

  public changeColor(color: Record<any, any>) {
    let pantoneColor = getClosestColor(color.hex)
    this.setColor({value: pantoneColor.hex.toUpperCase(), pantone: pantoneColor.pantone, name: pantoneColor.name})
  }

  public changePantoneColor() {
    let pantoneColor = getPantoneColor(this.svgGroups[this.selectAccordionIndex].pantone)
    if (pantoneColor) {
      this.setColor({value: pantoneColor.hex.toUpperCase(), pantone: pantoneColor.pantone, name: pantoneColor.name})
      this.pantoneMessage = ''
    }
    else {
      this.pantoneMessage = 'Color Not in List.'
    }
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
