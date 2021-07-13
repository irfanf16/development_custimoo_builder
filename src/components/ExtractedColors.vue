<template>
    <div class="logo-placement-area extracted-color-area">
    <h4 class="mb-3 mb-md-3 mb-lg-4">Color Extracted from Logo</h4>
    <div class="logo-placement-holder mb-lg-3">
        <div class="logo-holder">
          <div class="color-extract-container">
              <div v-if="imageColors.length == 1" class="color-box" :style="{background: imageColors[0].hex}"></div>
              <div v-if="imageColors.length == 2" class="color-box" :style="{background: 'conic-gradient(' + imageColors[0].hex +' 0% 50%, ' + imageColors[1].hex +' 50% 100%)'}"></div>
              <div v-if="imageColors.length == 3" class="color-box" :style="{background: 'conic-gradient(' + imageColors[0].hex +' 0% 33.33%, ' + imageColors[1].hex +' 33.33% 66.66%, ' + imageColors[2].hex +' 66.66% 100%)'}"></div>
              <div v-if="imageColors.length == 4" class="color-box" :style="{background: 'conic-gradient(' + imageColors[1].hex +' 0% 25%, ' + imageColors[2].hex +' 25% 50%, ' + imageColors[3].hex +' 50% 75%, ' + imageColors[0].hex +' 75% 100%)'}"></div>
          </div>
        </div>
        <b-button @click="useLogoColors()" class="use-btn">Use These Colors</b-button>
<!--        <b-button class="extracted-color-shuffle-btn" @click="shuffleLogoColors()" v-if="logoColorUsed && imageColors.length > 1" variant="outline-secondary">Shuffle</b-button>-->
        <b-button class="extracted-color-shuffle-btn" @click="shuffleLogoColors()" variant="outline-secondary">Shuffle</b-button>
        <b-button @click="rollbackPreviousColors()" v-if="previousImageColors.length" class="reset d-none d-lg-block"><font-awesome-icon :icon="['fas', 'redo-alt']"/></b-button>
    </div>
    <SaveColorModal />
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator'
    import SaveColorModal from "@/components/SaveColorModal.vue"
    import {http} from "@/httpCommon"

    @Component<ExtractedColors>({
         components: {
             SaveColorModal
         }
    })

    export default class ExtractedColors extends Vue{

        public logoColorUsed = false
        public previousImageColors = []
        get imageColors(): any[] {
          return this.$store.getters.getLogosColors
        }

        get customLogos(): [Record<any, any>] {
            return this.$store.getters.getCustomLogos
        }

        public useLogoColors() {
          this.logoColorUsed = true
          this.$store.dispatch('setGroupColors', {})
          for (let i = 0; i < 4; i++) {
            if(this.imageColors[i]) {
                this.$store.dispatch('setDefaultColor', { index: i, color: this.imageColors[i].hex, pantone: this.imageColors[i].pantone, name: this.imageColors[i].name })
            } else {
                this.$store.dispatch('setDefaultColor', { index: i, color: '', pantone: '', name: '' })
            }
          }
        }

        shuffleLogoColors() {
            if(this.imageColors.length > 1) {
            this.previousImageColors = JSON.parse(JSON.stringify(this.imageColors))
            let imageColors = JSON.parse(JSON.stringify(this.imageColors)).filter((imageColor: Record<any, any>) => {
                return imageColor.hex
            })

            let shuffle = (previousValue: Record<any, any>, currentValue: Record<any, any>, currentIndex: number, array: Record<any, any>[]) => {
                if (currentIndex !== 1) return previousValue;

                array.sort(() => Math.random() - 0.5)
                return array;
            }

            while (JSON.stringify(this.previousImageColors) == JSON.stringify(imageColors)) {
                imageColors.reduce(shuffle)
            }

            this.$store.dispatch("SET_LOGO_COLORS", imageColors);
            imageColors.forEach((imageColor: Record<any, any>, index: number) => {
                this.$store.dispatch('setDefaultColor', {
                index: index,
                color: imageColor.hex,
                pantone: imageColor.pantone,
                name: imageColor.name
              })
            })
            }
        }

        public rollbackPreviousColors (): void {
            this.previousImageColors.forEach((defaultColor: Record<any, any>, index: number) => {
            this.$store.dispatch('setDefaultColor', { index: index, color: defaultColor.hex, pantone: defaultColor.pantone })
            })
            this.$store.dispatch("SET_LOGO_COLORS", this.previousImageColors);
            this.previousImageColors = []
        }

    }

</script>

<style lang="scss" scoped>
    .logo-placement-area{
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    .logo-placement-holder{
      flex: 0 0 67%;
      max-width: 67%;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      @media only screen and (min-width: 992px){
        flex: 0 0 100%;
        max-width: 100%;
      }
    }
    .btn{
      flex: 0 0 30%;
      max-width: 30%;
      font-size: 12px;
      padding: 0.50rem;
      @media only screen and (min-width: 992px){
        flex: 0 0 100%;
        max-width: 100%;
        font-size: 14px;
        padding: 0.50rem 0.75rem;
      }
    }
    &.extracted-color-area{
      max-width: 300px;
      margin: 0 auto;
      .logo-holder{
        width: 60px;
        height: 60px;
        position: relative;
        border: 1px solid #EFF2F4;
        border-radius: 50%;
        overflow: hidden;
        @media only screen and (min-width: 992px){
          width: 75px;
          height: 75px;
        }
        .color-extract-container{
          width: 100%;
          height: 100%;
        }
        .color-box{
          width: 100%;
          height: 100%;
        }
      }
      .logo-placement-holder{
        @media only screen and (max-width: 992px){
          flex: 0 0 100%;
          max-width: 100%;
        }
      }
      .btn{
        flex: none;
        color: #03142E;
        &.use-btn{
          margin: 0;
          border: none;
          color: #fff;
          font-size: 14px;
          max-width: 50%;
          width: 100%;
          @media only screen and (min-width: 1024px){
            font-size: 13px;
            max-width: 35%;
          }
          @media only screen and (min-width: 1367px){
            max-width: 40%;
            font-size: 12px;
          }
          &:focus{
            box-shadow: none;
          }
          &:hover{background: #219F84;}
        }
        &.reset{
          background: none;
          color: #03142E;
          border: none;
          padding: 0;
          width: auto;
        }
      }
      .btn-save-color{
        color: #fff;
        @media only screen and (max-width: 992px){
          flex: 0 0 100%;
          max-width: 100%;
          margin-top: 20px;
        }
        &:hover{color: #219F84;}
      }
    }
  }
</style>
