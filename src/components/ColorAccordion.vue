<template>
  <div class="accordion" role="tablist">
    <b-card no-body v-for="(svgElement, index) in svgElements" :key="index">
      <b-card-header header-tag="header" class="p-0" role="tab">
        <b-button block v-b-toggle="'accordion-'+(index+1)" class="p-3" @click="showColor(index)"><span class="text">{{ svgElement.name }}</span> <span class="color"><span
          class="color-box" :style="{ background : svgElement.color? svgElement.color : ' url(' + colorImage + ') no-repeat 50% 50% / 20px' }"></span> {{ svgElement.color }}</span> <span class="accordion-icon"></span></b-button>
      </b-card-header>
      <b-collapse :id="'accordion-'+(index+1)" visible accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <b-nav class="d-flex flex-wrap justify-content-between align-items-center">
            <b-nav-item v-for="(colorType, index) in productColors" :key="index" @click="selectType(index)">{{ colorType.file_type }}</b-nav-item>
          </b-nav>
          <div class="color-holder">
            <div class="color-container" >
              <div class="color-box" v-for="color in productColor" @click="setColor(color.value)"
                   :title="color.name" :style="{background: color.value}" :key="color.position"></div>
            </div>
          </div>
        </b-card-body>
      </b-collapse>
    </b-card>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

@Component<ColorAccordion>({
  mounted(){
    setTimeout(() => {
    this.selectType(this.selectTypeIndex)
    }, 300)
  }
})
export default class ColorAccordion extends Vue {
  @Prop({required: true}) productColors!: any

  public selectAccordionIndex = 0
  public selectTypeIndex = 0
  public productColor: any[] = []
  public colorImage = '/img/images/color-placeholder.png'
  public svgElements = [{name: 'Base', color: null}, {name: 'Sleeves', color: null}, {name: 'Pockets', color: null}, {name: 'Hood', color: null}]

  public showColor(index: number) {
    this.selectAccordionIndex = index
  }

  public selectType(index: number) {
    this.selectTypeIndex = index
    this.productColor = this.productColors[this.selectTypeIndex].color_text
  }

  public setColor(color: any) {
    this.svgElements[this.selectAccordionIndex].color = color
  }
}
</script>
