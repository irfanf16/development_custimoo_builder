<template>
  <div class="accordion" role="tablist">
    <b-card-body style="padding: 0 !important;">
          <b-nav class="d-flex flex-wrap align-items-center">
            <b-nav-item v-bind:class="{ 'active' : index == selectTypeIndex && !othersActive}" class="mr-2 " v-for="(colorType, index) in productColors" :key="index" @click="selectType(index)">{{ colorType.name | capitalize }}</b-nav-item>
            <b-nav-item :class="{ active: othersActive }" @click="selectType(0, true)">Others</b-nav-item>
          </b-nav>
          <div class="color-holder">
            <div class="color-container">
              <div v-if="showOther" class="custom-color-picker">
                <b-form class="pantone-color-field" v-on:submit.prevent>
                  <label class="mb-2" for="inline-form-input-pantone-color">Pantone: (TCX Colors)</label>
                  <b-form-input
                    v-model="pantoneColorVal"
                    class="mb-2 mr-sm-2 mb-sm-0"
                    placeholder="XX-XXXX"
                    readonly
                    @input="changePantoneColor"
                  ></b-form-input>
                  <div class="pantone-message">
                    {{ pantoneMessage }}
                  </div>
                </b-form>
                <color-picker @changeColor="changeColor" theme="light" :color="color" :sucker-hide="true" />
              </div>
              <template v-else  v-for="(color, index) in productColor">
                <div v-if="color.value"  class="color-box" @click="setColor(color)"
                      :title="color.name" :style="{background: color.value}" :key="index">
                </div>
              </template>

            </div>
          </div>
        </b-card-body>

  </div>
</template>

<script lang="ts">
import {Component, Prop, Watch, Vue} from 'vue-property-decorator'
import colorPicker from '@caohenghu/vue-colorpicker'

import {getClosestColor, pantones, getPantoneColor} from '@/pantoneColor'

@Component<TextColorTabs>({
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
export default class TextColorTabs extends Vue {
  @Prop({required: true}) productColors!: any

  public color= '#59c7f9'
  public pantoneColorVal= '13-4411'
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
  get groupColors(){
    return this.$store.getters.getGroupColors
  }
  public showColor(index: number) {
    this.selectAccordionIndex = index
  }

  public selectType(index: number, showOther = false) {

    if (showOther){
      this.othersActive = true;
    }
    else {
      this.othersActive = false;
    }

    this.selectTypeIndex = index
    this.showOther = showOther
    this.productColor = this.productColors[this.selectTypeIndex]?.color_text

    if(this.selectTypeIndex){
      this.isActive = !this.isActive
    }
    else {
      this.isActive = false
    }
    //this.$store.commit('SET_TEXT_COLOR_TAB', 0);
  }

  public setColor(color: Record<any, any>) {
   // console.log('color',color)
    this.$emit('setColors',color)
    // this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.groupColors)), action: 'groupColor' })
    // this.$store.dispatch('updateGroupColors',
    //   {
    //     index: this.svgGroups[this.selectAccordionIndex].id,
    //     color: color.value,
    //     pantone: color.pantone,
    //     name: color.name
    //   })
  }

  public changeColor(color: Record<any, any>) {
    let pantone = getClosestColor(color.hex);
    if(pantone && pantone.pantone && pantone.pantone != 'undefined'){
      this.pantoneColorVal = pantone.pantone;
    }

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
