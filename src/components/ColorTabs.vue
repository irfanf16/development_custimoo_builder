<template>
  <b-tabs>
    <b-tab v-for="(svgElement, index) in svgGroups" :key="index" @click="showColor(index)">
      <template #title>
        {{ svgElement.id }}
      </template>
      <div>
        <b-card-body>
          <b-nav class="d-flex flex-wrap justify-content-between align-items-center">
            <b-nav-item v-for="(colorType, index) in productColors" :key="index" @click="selectType(index)">
              {{ colorType.file_type }}
            </b-nav-item>
            <b-nav-item @click="selectType(index, true)">Others</b-nav-item>
          </b-nav>
          <div class="color-holder">
            <div class="color-container">
              <div v-if="showOther" class="custom-color-picker">
                <color-picker @changeColor="changeColor" theme="light" :color="color" :sucker-hide="true"/>
              </div>
              <div v-else class="color-box" v-for="(color, index) in productColor" @click="setColor(color.value)"
                   :title="color.name" :style="{background: color.value}" :key="index">
              </div>
            </div>
          </div>
        </b-card-body>
      </div>
    </b-tab>
  </b-tabs>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import colorPicker from '@caohenghu/vue-colorpicker'

@Component<ColorTabs>({
  components: {
    colorPicker
  },
  filters: {
    capitalize: (value: string) => {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.selectType(this.selectTypeIndex)
    })
  }
})

export default class ColorTabs extends Vue {
  @Prop({required: true}) productColors!: any

  public color = '#59c7f9'
  public showOther = false
  public selectTabIndex = 0
  public selectTypeIndex = 0
  public productColor: any[] = []

  get svgGroups() {
    return this.$store.getters.getSvgGroups
  }

  public showColor(index: number) {
    this.selectTabIndex = index
  }

  public selectType(index: number, showOther = false) {
    this.selectTypeIndex = index
    this.showOther = showOther
    this.productColor = this.productColors[this.selectTypeIndex].color_text
  }

  public setColor(color: any) {
    this.$store.dispatch('updateSvgGroups', { index: this.selectTabIndex, color: color })
  }

  public changeColor(color: any) {
    this.setColor(color.hex)
  }
}

</script>
