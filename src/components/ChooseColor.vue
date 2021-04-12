<template>
  <div class="choose-color-holder active">
    <h2 class="fw-bold mb-3 fz-18">Choose Color</h2>
    <div class="choose-color d-flex flex-wrap justify-content-between">
      <a href="#" v-for="(chooseColor, index) in chooseColors" :key="index" v-on:click="showColor(index)">
        <div>
          <div class="color-circle"
               :style="{ background : chooseColor.color? chooseColor.color : ' url(' + colorImage + ') no-repeat 50% 50% / 20px' }"></div>
          <strong>{{ chooseColor.name }}</strong>
        </div>
      </a>
    </div>
    <div v-if="colorPickerActive">
      <transition name="list">
        <div class="color-holder">
          <div class="color-header">
            <h3>{{ chooseColors[selectColorIndex].name }}</h3>
            <a href="#" @click="colorPickerActive = false" class="close">
              <font-awesome-icon :icon="['fas', 'times']"/>
            </a>
          </div>
          <div class="color-container">
            <div v-for="color in colors" @click="setColor(color.value)" class="color-box" :title="color.name" :style="{background: color.value}"
                  :key="color.position"></div>
          </div>
        </div>
      </transition>
    </div>
    <div class="shuffle-colors d-flex flex-wrap justify-content-between align-items-center">
      <button class="btn btn-secondary">Shuffle</button>
      <button class="redo-btn">
        <font-awesome-icon :icon="['fas', 'redo-alt']"/>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

@Component<ChooseColor>({})
export default class ChooseColor extends Vue {
  @Prop({required: true}) colors!: any

  private colorPickerActive = false
  public chooseColors = [{name: 'Color One', color: null}, {name: 'Color Two', color: null}, {name: 'Color Three', color: null}, {name: 'Color Four', color: null}]
  public selectColorIndex !: number

  public showColor(index: number) {
    this.selectColorIndex = index
    this.colorPickerActive = false
    setTimeout(() => {
      this.colorPickerActive = true
    }, 300)
  }

  public setColor(color: any) {
    this.colorPickerActive = false
    this.chooseColors[this.selectColorIndex].color = color
    console.log(color)
  }

  public colorImage = '/img/images/color-placeholder.png'

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
    display: block;
    width: 130px;
    height: 130px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    border: 1px solid #DCDEE2;
    margin: 0 0 20px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 12px;
    @media only screen and (min-width: 375px){
      width: 140px;
      height: 140px;
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
    width: 52px;
    height: 52px;
    border: 1px solid #EFF2F4;
    position: relative;
    margin: 0 auto 12px;
    @media only screen and (min-width: 1366px) {
      width: 72px;
      height: 72px;
    }

    &:before {
      position: absolute;
      content: '';
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
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
  z-index: 2;
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
    justify-content: space-between;
    // &:after{
    //     flex: auto;
    //     content: '';
    // }
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
