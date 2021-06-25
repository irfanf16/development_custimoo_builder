<template>
  <div>
    <b-button class="add-logo-btn"  v-if="customLogos.length < allowedLogosLimit" @click="addTab(customLogos.length)">
      +
    </b-button>
    <b-tabs>
      <b-tab v-for="(n, index) in customLogos" :key="index" :active="tabIndex === index">
        <template #title>
          <span> {{  index == 0 ? 'Team Logo' : 'logo ' + index  }}</span>
          <div v-if="index != 0">
            <span class="remove-logo" @click="removeLogoTab(index)">
              <font-awesome-icon :icon="['fas', 'trash-alt']"/>
            </span>
          </div>
        </template>

        <div class="tabs-logo-container">
          <template v-if="customLogos[index]">
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
              <template v-if="isCustomerAuthenticated">
                <b-button :key="'saveLogoModal'" v-if="customLogos[0] && customLogos[index].url" class="btn btn-secondary w-100 fw-bold" v-b-modal.modal-center-savelogomodal>Save Logo</b-button>
              </template>
              <template v-else>
                <b-button :key="'saveLogoLogin'" class="btn btn-secondary w-100 fw-bold" v-b-modal.modal-login>Save Logo</b-button>
              </template>
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
                <b-button @click="rollbackPreviousColors()" v-if="previousImageColors.length" class="reset"><font-awesome-icon :icon="['fas', 'redo-alt']"/></b-button>
                <b-button @click="shuffleLogoColors()" v-if="logoColorUsed && imageColors.length > 1" variant="outline-secondary">Shuffle</b-button>
              </div>
              <template v-if="isCustomerAuthenticated">
                <button :key="'saveLogoColorModal'" v-if="customLogos[0] && customLogos[0].url" class="btn btn-secondary w-100 fw-bold btn-save-color" v-b-modal.modal-center-savecolormodal @click="callRooms">Save Color</button>
              </template>
              <template v-else>
                <b-button :key="'saveLogoColorLogin'" class="btn btn-secondary w-100 fw-bold btn-save-color" v-b-modal.modal-login>Save Color</b-button>
              </template>
              <SaveColorModal />
            </div>
          </template>
          <template v-if="manageComponents.LogoArea">
            <UploadLogo :customLogoIndex="index"/>
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


@Component<LogoPlacementTabs>({
  components: {
    UploadLogo,
    SaveLogoModal,
    SaveColorModal
  },
  mounted() {
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
  public logoColorUsed = false
  public allowedLogosLimit = 1000

  get imageColors(): any[] {
    return this.$store.getters.getLogosColors
  }

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
      index: index
    }
    this.$store.dispatch('deleteCustomLogo', payload)
  }

  public changeSide(index: number) {
    const payload = {
      index: index,
      attribute: 'side',
      value: this.customLogos[index].side
    }
    this.$store.dispatch('updateCustomLogoAttribute', payload)
  }

  useLogoColors() {
    this.logoColorUsed = true
    this.$store.dispatch('setGroupColors', {})
    for (let i = 0; i < 4; i++) {
      if(this.imageColors[i]) {
        this.$store.dispatch('setDefaultColor', { index: i, color: this.imageColors[i].hex, pantone: this.imageColors[i].pantone })
      } else {
        this.$store.dispatch('setDefaultColor', { index: i, color: '', pantone: '' })
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
          pantone: imageColor.pantone
        })
      })
    }
    console.log(this.imageColors);
  }

  public rollbackPreviousColors (): void {
    this.previousImageColors.forEach((defaultColor: Record<any, any>, index: number) => {
      this.$store.dispatch('setDefaultColor', { index: index, color: defaultColor.hex, pantone: defaultColor.pantone })
    })
    this.$store.dispatch("SET_LOGO_COLORS", this.previousImageColors);
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
      background: #fff;
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
          margin: 0;
          border: none;
          color: #fff;
          font-size: 14px;
          max-width: 50%;
          width: 100%;
          @media only screen and (min-width: 1024px){
            font-size: 12px;
            max-width: 35%;
          }
          @media only screen and (min-width: 1367px){
            max-width: 40%;
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
        &:focus{box-shadow: none;}
        &:hover{color: #fff;}
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
