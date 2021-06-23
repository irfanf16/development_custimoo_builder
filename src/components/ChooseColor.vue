<template>
  <div class="choose-color-holder active">
    <h2 class="fw-bold mb-3 fz-18">Choose Color</h2>
    <div class="choose-color d-flex flex-wrap justify-content-between">
      <a class="chosen-colors-section" v-for="(chooseColor, index) in defaultColors" :key="index" v-on:click="showColor(index)">
        <div>
          <div class="color-circle chosen-colors-section"
               :style="{ background : chooseColor.color? chooseColor.color : ' url(' + colorImage + ') no-repeat 50% 50% / 14px' }"></div>
          <strong class="chosen-colors-section">{{ chooseColor.name }}</strong>
        </div>
      </a>
    </div>
    <div id="color-picker" v-if="colorPickerActive">
      <transition name="list">
        <div class="color-holder">
          <div class="color-header">
            <h3>{{ defaultColors[selectColorIndex].name }}</h3>
            <a @click="colorPickerActive = false" class="close">
              <font-awesome-icon :icon="['fas', 'times']"/>
            </a>
          </div>
          <div class="color-container">
            <div v-for="(color, index) in colors" @click="setColor(color)" class="color-box" :title="color.name" :style="{background: color.value}"
                  :key="index"></div>
          </div>
        </div>
      </transition>
    </div>
    <div class="shuffle-colors d-none d-lg-flex flex-wrap justify-content-between align-items-center">
      <button v-if="defaultColors.filter((color) => { return color.color }).length > 1" @click="shuffleColors()" class="btn btn-secondary">Shuffle</button>
      <button v-if="previousDefaultColors.length" @click="rollbackPreviousColors()" class="redo-btn">
        <font-awesome-icon :icon="['fas', 'redo-alt']"/>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

@Component<ChooseColor>({
  created() {
    window.addEventListener('click', (e: Record<any, any>) => {
      let element = document.getElementById('color-picker') as Record<any, any>
      if (this.colorPickerActive && e.target !== element && !element.contains(e.target) && !e.target.classList.contains('chosen-colors-section')){
        this.colorPickerActive = false
      }
    })
  }
})

export default class ChooseColor extends Vue {
  @Prop({required: true}) colors!: any

  public colorImage = '/img/images/color-placeholder.png'
  private colorPickerActive = false
  public selectColorIndex !: number
  public previousDefaultColors : [] = []

  get defaultColors() : [Record<any, any>] {
    return this.$store.getters.getDefaultColors
  }

  public showColor(index: number): void {
    this.selectColorIndex = index
    this.colorPickerActive = false
    this.$nextTick(() => {
      this.colorPickerActive = true
    })
  }

  public setColor(color: Record<any, any>): void {
    this.colorPickerActive = false
    this.$store.dispatch('setGroupColors', {})
    this.$store.dispatch('setDefaultColor', { index: this.selectColorIndex, color: color.value, pantone: color.name })
  }

  public shuffleColors(): void {
    this.previousDefaultColors = JSON.parse(JSON.stringify(this.defaultColors)).filter((defaultColor: Record<any, any>) => {return defaultColor.color})
    let defaultColors = JSON.parse(JSON.stringify(this.defaultColors)).filter((defaultColor: Record<any, any>) => {return defaultColor.color})
    let shuffle = (previousValue: Record<any, any>, currentValue: Record<any, any>, currentIndex: number, array: Record<any, any>[]) => {
      if (currentIndex !== 1) return previousValue;

      array.sort(() => Math.random() - 0.5)

      return array;
    }

    while (JSON.stringify(this.previousDefaultColors) == JSON.stringify(defaultColors)) {
      defaultColors.reduce(shuffle)
    }
    defaultColors.forEach((defaultColor: Record<any, any>, index: number) => {
      this.$store.dispatch('setDefaultColor', { index: index, color: defaultColor.color, pantone: defaultColor.pantone })
    })
    console.log(defaultColors);
  }

  public rollbackPreviousColors (): void {
    this.previousDefaultColors.forEach((defaultColor: Record<any, any>, index: number) => {
      this.$store.dispatch('setDefaultColor', { index: index, color: defaultColor.color, pantone: defaultColor.pantone })
    })
    this.previousDefaultColors = []
  }

}
</script>

<style scoped lang="scss">
.choose-color-holder {
  max-width: 300px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;

  &.active {
    .color-holder {
      bottom: 0;
    }
  }

  .shuffle-colors {
    .btn {
      flex: 0 0 82%;
      max-width: 82%;
      width: 100%;
      @media only screen and (min-width: 1170px) {
        flex: 0 0 86%;
        max-width: 86%;
      }
    }

    .redo-btn {
      background: none;
      border: none;
      font-size: 20px;
    }
  }
}

.choose-color {
  a {
    width: 130px;
    height: 90px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    border: 1px solid #DCDEE2;
    margin: 0 0 20px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 12px;
    background: #fff;
    @media only screen and (min-width: 375px){
      width: 140px;
    }
    @media only screen and (min-width: 992px){
      width: 100px;
      height: 100px;
    }
    @media only screen and (min-width: 1170px) {
      width: 120px;
      height: 120px;
      font-size: 14px;
    }
    @media only screen and (min-width: 1299px) {
      width: 140px;
      height: 140px;
    }

    &:hover {
      text-decoration: none;
    }

  }

  .color-circle {
    border-radius: 50%;
    width: 42px;
    height: 42px;
    border: 2px solid #EFF2F4;
    position: relative;
    margin: 0 auto 10px;
    @media only screen and (min-width: 768px){
      width: 52px;
      height: 52px;
      margin: 0 auto 12px;
    }
    @media only screen and (min-width: 1366px) {
      width: 72px;
      height: 72px;
    }

    &:before {
      position: absolute;
      content: '';
      left: 1px;
      right: 1px;
      bottom: 1px;
      top: 1px;
      z-index: 1;
      border: 4px solid #fff;
      border-radius: 50%;
      @media only screen and (min-width: 1024px){
        border: 6px solid #fff;
      }
    }
  }
}

.color-holder {
  position: fixed;
  left: 0;
  right: 0;
  bottom: -999px;
  background: #fff;
  transition: all 1s ease;
  z-index: 10;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  border-radius: 15px 15px 0 0;
  max-height: 300px;
  overflow-y: auto;
  @media only screen and (min-width: 768px){
    position: absolute;
  }

  a.close {
    width: auto;
    height: auto;
    border: none;
    border-radius: 0;
    margin: 0;
  }

  .color-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20px;
    border: 1px solid #EFF2F4;
    padding: 15px;
  }

  .color-container {
    padding: 15px;
    display: flex;
    flex-wrap: wrap;
    gap: 1.7%;
    @media only screen and (min-width: 768px){
      gap: 1.1%;
    }
    @media only screen and (min-width: 1024px){
      gap: 7%;
    }
    @media only screen and (min-width: 1200px){
      gap: 5%;
    }
    @media only screen and (min-width: 1366px){
      gap: 2.1%;
    }
    .color-box {
      width: 40px;
      height: 40px;
      margin: 0 2px;
      background: #000;
      border-radius: 50%;
      border: 1px solid #EFF2F4;
      position: relative;
      margin-bottom: 10px;
      @media only screen and (min-width: 768px) {
        width: 32px;
        height: 32px;
      }
      @media only screen and (min-width: 1274px) {
        width: 45px;
        height: 45px;
      }
      // &:last-child{margin: 0 7px;}
      &:before {
        position: absolute;
        content: '';
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        border-radius: 50%;
        border: 5px solid #fff;
        @media only screen and (min-width: 1024px) {
          border: 3px solid #fff;
        }
        @media only screen and (min-width: 1274px) {
          border: 5px solid #fff;
        }
      }
    }
  }
}

.list-enter,
.list-leave-to {
  visibility: hidden;
  height: 0;
  margin: 0;
  padding: 0;
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s;
}
</style>
