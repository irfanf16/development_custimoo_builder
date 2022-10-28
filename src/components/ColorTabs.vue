<template>
  <div>


  <b-tabs v-if="!this.onlyColorsTabs">

    <b-tab v-for="(svgElement, index) in svgGroups" :key="index" @click="showColor(index)">
      <template #title>
        {{ svgElement.id }}
      </template>
      <div>
        <b-card-body>
          <b-nav class="d-flex justify-content-start align-items-center">
            <b-nav-item v-bind:class="{ 'color-tab-active' : index == selectTypeIndex && !othersActive}" v-for="(colorType, index) in productColors" :key="'color-item-'+index" @click="selectType(index)">
              {{ colorType.name | capitalize}}
            </b-nav-item>
            <b-nav-item v-bind:class="{ 'color-tab-active' : index == selectTypeIndex && !othersActive}" v-if="selectedProduct.is_custom_color_allowed" @click="selectType(null, true)">Others</b-nav-item>
          </b-nav>
          <div class="color-holder mt-2">
            <div class="color-container">
              <div v-if="showOther && selectedProduct.is_custom_color_allowed" class="custom-color-picker">
                <color-picker @changeColor="changeColor" theme="light" :color="color" :sucker-hide="true"/>
              </div>
              <div v-else class="color-box" v-for="(color, index) in productColor" @click="setColor(color)"
                   :title="color.name" :style="{background: color.value}" :key="index">
              </div>
            </div>
          </div>
        </b-card-body>
      </div>
    </b-tab>
  </b-tabs>

  <div v-else>
    <b-card-body>
      <div class="fade-right">
        <b-nav class="d-flex justify-content-start align-items-center">
          <b-nav-item v-bind:class="{ 'color-tab-active' : index == selectTypeIndex && !othersActive}" v-for="(colorType, index) in productColors" :key="'color-item-'+index" @click="selectType(index)">
            {{ colorType.name | capitalize}}
          </b-nav-item>
          <b-nav-item v-bind:class="{ 'color-tab-active' : othersActive}" v-if="selectedProduct.is_custom_color_allowed" @click="selectType(null, true)">Others</b-nav-item>
        </b-nav>
      </div>

      <div class="color-holder mt-2" ref="color-holder2">
        <div class="color-container">
          <div v-if="showOther && selectedProduct.is_custom_color_allowed" class="custom-color-picker">
            <color-picker @changeColor="changeColor" theme="light" :color="color" :sucker-hide="true"/>
          </div>
          <div v-else class="color-box" v-for="(color, index) in productColor" @click="setColor(color)"
               :title="color.name" :style="{background: color.value}" :key="index">
          </div>
        </div>
      </div>
    </b-card-body>
  </div>
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop, Vue} from 'vue-property-decorator'
import colorPicker from '@caohenghu/vue-colorpicker'
import {getClosestColor} from '@/pantoneColor'
import ModalAction from "@/mixins/ModalAction";
import {getSelectedProductPantones} from "@/helpers/Helpers";


@Component<ColorTabs>({
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
  mounted() {
    this.$nextTick(() => {
      this.selectType(this.selectTypeIndex)
    })
  }
})

export default class ColorTabs extends Mixins(ModalAction) {
  @Prop({required: true}) productColors!: any
  @Prop({required: false}) onlyColorsTabs!: any
  @Prop({required:false}) modalRef!: any

  public color = '#59c7f9'
  public showOther = false
  public selectTabIndex = 0
  public selectTypeIndex = 0
  public productColor: any[] = []
  public othersActive = false

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get svgGroups() {
    return this.$store.getters.getSvgGroups
  }

  get getGroupColors(){
    return this.$store.getters.getGroupColors
  }

  get getColorType(){
    return this.$store.getters.getColorType;
  }

  public showColor(index: number) {
    this.selectTabIndex = index
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
    if(!showOther)
      this.productColor = this.productColors[this.selectTypeIndex].color_text
  }

  public setColor(color: Record<any, any>) {
    if(this.onlyColorsTabs) {
     this.$emit('setColorOfLogo',color.value)
    }
    else {
      this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.getGroupColors)), action: 'groupColor' })
      this.$store.dispatch('updateGroupColors', { index: this.svgGroups[this.selectTabIndex].id, color: color.value, pantone: color.name })
    }
    if(this.modalRef){
      this.hideVModal(this.modalRef)
    } // closing logo color selection modal here
  }

  public changeColor(color: Record<any, any>) {
    const selectProductPantonesList = getSelectedProductPantones()
    let pantoneColor = getClosestColor(color.hex,selectProductPantonesList, this.getColorType);
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
  .card-body {
    padding: 0.4rem ! important;
  }
</style>
