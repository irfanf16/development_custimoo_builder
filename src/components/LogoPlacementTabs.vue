<template>
  <div>
    <b-button class="add-logo-btn"  v-if="customLogos.length < allowedLogosLimit" @click="addTab(customLogos.length)">
      +
    </b-button>
    <b-tabs>
      <b-tab v-for="(n, index) in customLogos" :key="index" :active="tabIndex === index">
        <template #title>
          Logo {{ index+1 }}
          <div v-if="index != 0">
            <a href="#" class="remove-logo" @click="removeLogoTab(index)">
              <font-awesome-icon :icon="['fas', 'trash-alt']"/>
            </a>
          </div>
        </template>

        <div class="tabs-logo-container">
          <template v-if="customLogos[index].url != ''">
            <div class="logo-placement-area mb-3 mb-lg-4 pt-2">
              <div class="logo-placement-holder mb-lg-3">
                <div class="logo-holder">
                  <template v-if="customLogos[index].url != ''">
                    <div class="additional-holder">
                      <img ref="logoImg" :src="apiBaseUrl+'/'+customLogos[index].url" alt="logo Shirt"/>
                    </div>
                    <a href="#" class="remove-img" @click="deleteLogo(index)">
                      <font-awesome-icon :icon="['fas', 'trash-alt']"/>
                    </a>
                  </template>
                  <template v-else>
                    <div class="additional-holder">
                    </div>
                  </template>
                </div>
                <div class="logo-placemet-content">
                  <h4>Logo Placement</h4>
                  <b-form-select @change="changeSide(index)" v-model="customLogos[index].side" :options="options"></b-form-select>
                </div>
              </div>
              <b-button v-if="customLogos[0] && customLogos[index].url" class="btn btn-secondary w-100 fw-bold" v-b-modal.modal-center-savelogomodal>Save Logo</b-button>
              <SaveLogoModal :logoIndex="index" />
            </div>
            <div class="logo-placement-area extracted-color-area" v-if="index == 0">
              <h4 class="mb-3 mb-lg-4">Color Extracted from Logo</h4>
              <div class="logo-placement-holder mb-lg-3">
                <div class="logo-holder color-extracted-area">
                  <div class="color-extract-container">
                    <div v-if="imageColors.length == 1" class="color-box" :style="{background: imageColors[0].hex}"></div>
                    <div v-if="imageColors.length == 2" class="color-box" :style="{background: 'conic-gradient(' + imageColors[0].hex +' 0% 50%, ' + imageColors[1].hex +' 50% 100%)'}"></div>
                    <div v-if="imageColors.length == 3" class="color-box" :style="{background: 'conic-gradient(' + imageColors[0].hex +' 0% 33.33%, ' + imageColors[1].hex +' 33.33% 66.66%, ' + imageColors[2].hex +' 66.66% 100%)'}"></div>
                    <div v-if="imageColors.length == 4" class="color-box" :style="{background: 'conic-gradient(' + imageColors[0].hex +' 0% 25%, ' + imageColors[1].hex +' 25% 50%, ' + imageColors[2].hex +' 50% 75%, ' + imageColors[3].hex +' 75% 100%)'}"></div>
                  </div>
                </div>
                <b-button @click="useLogoColors()" class="use-btn">Use These Colors</b-button>
                <b-button @click="shuffleLogoColors()" v-if="imageColors.length > 1" variant="outline-secondary">Shuffle</b-button>
                <b-button @click="rollbackPreviousColors()" v-if="previousImageColors.length" class="reset"><font-awesome-icon :icon="['fas', 'redo-alt']"/></b-button>
              </div>
              <button v-if="customLogos[0] && customLogos[0].url" class="btn btn-secondary w-100 fw-bold btn-save-color" v-b-modal.modal-center-savecolormodal @click="callRooms">Save Color</button>
              <SaveColorModal />
            </div>
          </template>
          <template v-if="manageComponents.LogoArea">
            <UploadLogo :customLogoIndex="index" @logoChange="getLogoColors"/>
          </template>
        </div>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import UploadLogo from "@/components/UploadLogo.vue"
import SaveLogoModal from "@/components/SaveLogoModal.vue"
import SaveColorModal from "@/components/SaveColorModal.vue"
import {default as Vibrant} from 'node-vibrant'
import getClosestColor from '@/pantoneColor'


@Component<LogoPlacementTabs>({
  components: {
    UploadLogo,
    SaveLogoModal,
    SaveColorModal
  },
  mounted() {
    this.getLogoColors()
    if(this.numberOfLogosAllowed > 0) {
      this.allowedLogosLimit = this.numberOfLogosAllowed
    }
  }
})
export default class LogoPlacementTabs extends Vue {
  @Prop({required: true}) numberOfLogosAllowed!: number
  @Prop({required: false, default: () => { return [{
      url: '',
      width: 200,
      height: 200,
      scaleX: 1,
      scaleY: 1,
      x_axis: 250,
      y_axis: 200,
      rotation: 0,
      haveControls: true,
      side: 'front',
      customLogo: true
    }]}}) logosSetting!: [Record<any, any>]

  public numberOfLogos = 1

  private apiBaseUrl = process.env.VUE_APP_API_BASE_URL
  public selected = 'front'
  public tabIndex = 0
  public options = [
    {value: 'front', text: 'Front'},
    {value: 'back', text: 'Back'}
  ]
  public previousImageColors = []
  public imageColors: any[] = []
  public allowedLogosLimit = 1000

  get customLogos(): [Record<any, any>] {
    return this.$store.getters.getCustomLogos
  }

  get manageComponents(): [] {
    return this.$store.getters.getManageComponents
  }
  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  public addTab(index: number){
    if(this.numberOfLogos < this.allowedLogosLimit) {
      let logoSetting: Record<any, any>
      if(this.logosSetting[index]) {
        logoSetting = this.logosSetting[index] as Record<any, any>
      }else {
        logoSetting = {
          width: 200,
          x_axis: 150,
          y_axis: 190,
          rotation: 0,
          haveControls: true,
          side: 'front'
        }
      }
      let logo = {
        id:null,
        url: '',
        width: logoSetting.width,
        height: logoSetting.height,
        scaleX: 1,
        scaleY: 1,
        x_axis: logoSetting.x_axis,
        y_axis: logoSetting.y_axis,
        rotation: logoSetting.rotation as number,
        haveControls: Boolean(!logoSetting.is_locked),
        side: logoSetting.side,
        customLogo: true
      }
      this.tabIndex = this.tabIndex + 1;
      this.$store.dispatch('setCustomLogos', logo)
    }
  }
  public removeLogoTab(index: number){
    let payload = {
      index: index
    }
    this.tabIndex = this.tabIndex - 1;
    this.$store.dispatch('deleteCustomLogo', payload)
  }

  public deleteLogo(index: number) {
    let payload = {
      index: index,
      attribute: 'url',
      value: ''
    }
    this.$store.dispatch('updateCustomLogoAttribute', payload)
  }

  public changeSide(index: number) {
    const payload = {
      index: index,
      attribute: 'side',
      value: this.customLogos[index].side
    }
    this.$store.dispatch('updateCustomLogoAttribute', payload)
  }

  public getLogoColors(){
    this.imageColors = []
    if(this.customLogos[0] && this.customLogos[0].url) {
      this.$nextTick(() => {
        let logoColors: Record<any, any>[] = []
        Vibrant.from(this.apiBaseUrl + '/' + this.customLogos[0].url).quality(1).maxColorCount(4)
        .getPalette((err: any, palettes: any) => {
          for (let [key, value] of Object.entries(palettes) as any[]) {
            if(value.getPopulation() >= 10) {
              this.imageColors.push({
                'hex': value.getHex(),
                'colorPopulation': value.getPopulation()
              })
            }
          }
          this.imageColors.sort(function (a, b) {
            return parseFloat(b.colorPopulation) - parseFloat(a.colorPopulation)
          })
          if (this.imageColors.length > 4) {
            let deletedCount = this.imageColors.length - 4
            this.imageColors.splice(4, deletedCount)
          }
          this.imageColors.forEach((imageColor: Record<any, any>, index: number) => {
            let pantoneColor = getClosestColor(imageColor.hex)
            this.imageColors[index].pantone = pantoneColor.pantone
            this.imageColors[index].hex = pantoneColor.hex
            logoColors.push({value: pantoneColor.hex, name: pantoneColor.pantone})
          })
          this.$store.dispatch("SET_LOGO_COLORS", logoColors);
        })
      })
    }
  }

  useLogoColors() {
    this.imageColors.forEach((imageColor: Record<any, any>, index: number) => {
      this.$store.dispatch('setGroupColors', {})
      this.$store.dispatch('setDefaultColor', { index: index, color: imageColor.hex, pantone: imageColor.pantone })
    })
  }

  shuffleLogoColors() {
    if(this.imageColors.length > 1) {
      this.previousImageColors = JSON.parse(JSON.stringify(this.imageColors)).filter((imageColor: Record<any, any>) => {
        return imageColor.hex
      })
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

      this.imageColors = imageColors
      imageColors.forEach((imageColor: Record<any, any>, index: number) => {
        this.$store.dispatch('setDefaultColor', {
          index: index,
          color: imageColor.hex,
          pantone: imageColor.pantone
        })
      })
    }
  }

  public rollbackPreviousColors (): void {
    this.previousImageColors.forEach((defaultColor: Record<any, any>, index: number) => {
      this.$store.dispatch('setDefaultColor', { index: index, color: defaultColor.color, pantone: defaultColor.name })
    })
    this.previousImageColors = []
  }

  public async callRooms(){
    if(this.isCustomerAuthenticated){
      await this.$store.dispatch('GET_LOCKER_PRODUCTS');
    }
  }
}
</script>

<style lang="scss" scoped>
.tabs-logo-container{
  @media only screen and (min-width: 992px){
    padding: 0 0 150px;
  }
  .upload-logo-opener{
    box-shadow: none;
    border-radius: 0;
    position: static;
    padding: 0;
    border-top: 1px solid #EFF2F4;
    margin: 20px -20px 0;
    padding: 15px 20px 0;
    @media only screen and (min-width: 992px){
      position: absolute;
      margin: 0;
      padding: 20px;
    }
  }
  .logo-placement-area{
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    .logo-placement-holder{
      flex: 0 0 67%;
      max-width: 67%;
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
          background: none;
          padding: 0 0 2px;
          margin: 0;
          border: none;
          border-bottom: 2px solid #F7FAFC;
          color: #808895;
          font-size: 14px;
          max-width: 35%;
          @media only screen and (min-width: 1024px){
            font-size: 13px;
          }
          @media only screen and (min-width: 1367px){
            max-width: 30%;
            font-size: 14px;
          }
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
}
.nav-tabs {
  .nav-item {
    .nav-link {
      .remove-logo {
        position: absolute;
        //right: 135px;
        top: 158px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #F8E1E2;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        font-size: 10px;
        color: #D53943;
      }
    }
  }
}
</style>
