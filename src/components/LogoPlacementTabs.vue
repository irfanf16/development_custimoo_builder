<template>
  <div>
  <b-button class="add-logo-btn"  v-if="customLogos.length < numberOfLogosAllowed" @click="addTab(customLogos.length)">
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
        <div class="logo-placement-area mb-3 mb-lg-4">
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
                  <img src="@/assets/images/logo-shirt.svg" alt="logo Shirt"/>
                </div>
              </template>
            </div>
            <div class="logo-placemet-content">
              <h4>Logo Placement</h4>
              <b-form-select @change="changeSide(index)" v-model="customLogos[index].side" :options="options"></b-form-select>
            </div>
          </div>
          <button class="btn btn-secondary w-100 fw-bold">Save Logo</button>
        </div>
        <div class="logo-placement-area">
          <h4 class="mb-3 mb-lg-4">Color Extracted from Logo</h4>
          <div class="logo-placement-holder mb-lg-3">
            <div class="logo-holder">
              <img src="@/assets/images/logo-shirt.svg" alt="logo Shirt"/>
              <a href="#" class="remove-img">
                <font-awesome-icon :icon="['fas', 'trash-alt']"/>
              </a>
            </div>
            <div class="logo-placemet-content">
              <h4>Logo Placement</h4>
              <b-form-select v-model="selected" :options="options"></b-form-select>
              <div class="color-holder">
                <div class="color-container">
                  <div class="color-box" v-for="color in ImageColors" :style="{ background : color}" :key="color"></div>
                </div>
              </div>
            </div>
          </div>
          <button class="btn btn-secondary w-100 fw-bold">Save Color</button>
        </div>
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
import * as Vibrant from 'node-vibrant'

@Component<LogoPlacementTabs>({
  components: {
    UploadLogo
  },
  mounted() {
    this.getLogoColors()
    this.$store.dispatch('setCustomLogos')
  }
})
export default class LogoPlacementTabs extends Vue {
  @Prop({required: true}) numberOfLogosAllowed!: number
  @Prop({required: false, default: () => { return [{
      url: '',
      width: 100,
      height: 100,
      scaleX: 1,
      scaleY: 1,
      x_axis: 150,
      y_axis: 190,
      rotation: 0,
      haveControls: true,
      side: 'front',
      customLogo: true
    }]}}) logosSetting!: [Record<any, any>]

  public numberOfLogos = 1

  private apiBaseUrl: string = process.env.VUE_APP_API_BASE_URL
  public selected = 'front'
  public tabIndex = 0
  public options = [
    {value: 'front', text: 'Front'},
    {value: 'back', text: 'Back'}
  ]
  public ImageColors: any[] = []

  get customLogos(): [Record<any, any>] {
    return this.$store.getters.getCustomLogos
  }

  get manageComponents(): [] {
    return this.$store.getters.getManageComponents
  }

  public addTab(index: number){
    if(this.numberOfLogos < this.numberOfLogosAllowed) {
      let logoSetting: Record<any, any>
      if(this.logosSetting[index]) {
        logoSetting = this.logosSetting[index] as Record<any, any>
      }else {
        logoSetting = {
          width: 100,
          height: 100,
          x_axis: 150,
          y_axis: 190,
          rotation: 0,
          haveControls: true,
          side: 'front'
        }
      }
      let logo = {
        url: '',
        width: logoSetting.width,
        height: logoSetting.height,
        scaleX: 1,
        scaleY: 1,
        x_axis: logoSetting.x_axis,
        y_axis: logoSetting.y_axis,
        rotation: logoSetting.rotation as number,
        haveControls: Boolean(logoSetting.is_locked),
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
    this.ImageColors.splice(0);
    setTimeout(() => {
      Vibrant.from(this.$refs.logoImg[0].src).getPalette((err, palettes) => {
        for (const [key, value] of Object.entries(palettes)) {
          this.ImageColors.push(value.getHex())
        }
      })
    }, 200)
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
