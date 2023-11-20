<template>
  <div class="animation-holder" v-if="!animPlayed" @click="hideAnim">
    <div>
      <span class="icon arrow-left">
        <b-icon-arrow-left />
      </span>
        <span class="icon pointer">
        <b-icon-hand-index />
      </span>
        <span class="icon arrow-right">
        <b-icon-arrow-right />
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'

@Component<HorizontalScroll>({
  mounted() {
    this.animPlayed = Boolean(localStorage.getItem(Vue.prototype.$animPlayed_localstorage_key))
    if (!this.animPlayed){
      setTimeout(()=>{
        localStorage.setItem(Vue.prototype.$animPlayed_localstorage_key, 'true')
        this.animPlayed = Boolean(localStorage.getItem(Vue.prototype.$animPlayed_localstorage_key))
      }, 3000)
    }
  }
})

export default class HorizontalScroll extends Vue {
  private animPlayed = false

  private hideAnim = () => {
    this.animPlayed = true
  }
}
</script>

<style lang="scss" scoped>
.animation-holder{
  background: rgba(0,0,0,0.0);
  animation: fadeBg 1s ease-out 3;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  z-index: 9999;
  width: 100% !important;
  display: flex;
  justify-content: center;
  align-items: center;

  .pointer{
    position: relative;

    &:after,&:before{
      content: "";
      display: block;
      position: absolute;
      //background: #fff;
      background: #fff;
      height: 20px;
      width: 20px;
      top: -12px;
      bottom: 0;
      left: -2px;
      right: 0;
      margin: auto;
      border-radius: 1000px;
      opacity: 0;
    }
    &:after{
      animation: pulse 1s ease-out 3;
    }
    &:before{
      animation: pulse 1s ease-out 3;
      animation-delay: 0.2s;
    }
  }

  .icon{
    color: #fff;
    font-size: 24px;
    display: inline-flex;

    &.arrow-left{
      animation: move-left 1s ease-out 3;
      opacity: 0;
    }
    &.arrow-right{
      animation: move-right 1s ease-out 3;
      opacity: 0;
    }
  }
}

@keyframes move-left {
  from{
    transform: translateX(-1px);
    opacity: 1;
  }
  to{
    transform: translateX(-70px);
    opacity: 0;
  }
}

@keyframes move-right {
  from{
    transform: translateX(0px);
    opacity: 1;
  }
  to{
    transform: translateX(70px);
    opacity: 0;
  }
}
@keyframes pulse {
  from{
    transform: scale(0);
    opacity: .5;
  }
  to{
    transform: scale(4);
    opacity: 0;
  }
}

@keyframes fadeBg {
  from{
    background: rgba(0,0,0,0.5);
  }
  to{
    background: rgba(0,0,0,0.0);
  }
}
</style>
