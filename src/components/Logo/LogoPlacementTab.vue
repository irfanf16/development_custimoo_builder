<template>
  <div>
    <div class="d-flex align-items-center justify-content-between px-1 pt-1" :class="{'rotateArrow': !expand_logos}">
      <b-button class="light ml-1" v-if="(selectedProduct.allowed_logos_count == 0 || customLogos.length < selectedProduct.allowed_logos_count)"
                :style="{visibility: expand_logos ? 'visible':'hidden'}" @click="addLogoTab">
        <BIconPlus />
      </b-button>

      <b-icon-chevron-down class="cursor-pointer" @click="expand_logos = !expand_logos" style="font-size: larger; transition: 0.3s ease all;" />
    </div>


    <b-tabs :class="{'collapseButtons': expand_logos}" >
      <b-tab v-for="(custom_logo, customLogoIndex) in customLogos" :active="custom_logo_tab_index == customLogoIndex"
             :key="`custom_logo_${customLogoIndex}`" @click="custom_logo_tab_index = customLogoIndex">
        <template #title>
          <span>{{ customLogoIndex == 0 ? 'Team Logo' : 'logo ' + customLogoIndex }}</span>
          <span class="vector-logos-error warning error" v-if="vectorImageConstraint? !custom_logo.is_vector && customLogos[customLogoIndex].url:false" v-b-tooltip.right="`Logo uploaded are not in vector format, please reupload to place order`"><b-icon-exclamation-circle-fill /></span>
          <span class="vector-logos-error warning" v-else-if="!customLogos[customLogoIndex].url" v-b-tooltip.right="`Logo is not found`"><b-icon-exclamation-triangle-fill /></span>
          <template v-if="customLogoIndex > 0">
            <span class="remove-logo" @click="removeLogoTab(customLogoIndex)">
              <font-awesome-icon :icon="['fas', 'trash-alt']"/>
            </span>
          </template>
        </template>
        <div class="tabs-logo-container">
          <div class="logo-placement-area mb-3 mb-lg-4 pt-2">
            <div class="logo-placement-holder mb-lg-3" :class="custom_logo.url ? 'hasLogo': 'noLogo'">
              <div class="logo-holder">
                <LogoUploader :customLogoIndex="customLogoIndex" :customLogo="custom_logo">
                  <span slot="upload_text">Click to upload logo or drag a file here</span>
                </LogoUploader>
              </div>
              <div class="logo-placemet-content" v-if="custom_logo.url">
                <h4>Logo Placement</h4>
                <b-form-select :value="custom_logo.side" :options="['front', 'back']" @change="handleLogoPlacementChange($event, custom_logo)"></b-form-select>
              </div>
            </div>
          </div>
          <logo-extracted-colors :custom-logo="custom_logo" v-if="logoColors.length > 0 && customLogoIndex == 0" />
        </div>
      </b-tab>
      <template v-if="customLogos && customLogos.length > 0">
        <recent-logos :custom-logo-index="custom_logo_tab_index" :custom-logo="customLogos[custom_logo_tab_index]"/>
      </template>
      <template #tabs-end v-if="!expand_logos">
        <b-button class="light ml-1" v-if="selectedProduct.allowed_logos_count == 0 || customLogos.length < selectedProduct.allowed_logos_count"
          @click="addLogoTab">
          <BIconPlus />
        </b-button>
      </template>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import LogoUploader from "@/components/Logo/LogoUploader.vue"
import RecentLogos from "@/components/Logo/RecentLogos.vue";
import LogoExtractedColors from "@/components/Logo/LogoExtractedColors.vue";
import { getLogoSettingsObject } from "@/helpers/Helpers"


@Component<LogoPlacementTab>({
  components: {
    RecentLogos,
    LogoUploader,
    LogoExtractedColors
  },
  async mounted() {
    this.$root.$on('changeLogoTabIndex', (index:number) => {
      // here you need to use the arrow function
      this.tabIndex = index;
    })
  }
})
export default class LogoPlacementTab extends Vue {
  // @Prop({required: true}) numberOfLogosAllowed!: number
  // @Prop({required: true}) isColorShuffled!: boolean
  /*
  * props starts
  * */
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

  /*
  * props ends
  * */

  /*
  * data props starts
  * */

  public ref = this.$refs as Record<any, any>
  public numberOfLogos = 1
  public showFileInput  = true

  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public selected = 'front'
  public tabIndex = 0
  public options = [
    {value: 'front', text: 'Front'},
    {value: 'back', text: 'Back'}
  ]
  public logoColorUsed = false
  public allowedLogosLimit = 1000
  public productColors: any[] = []
  public showSVGs = false
  public showLogoColors = false
  public selectedSwatchIndex = -1
  public defSwatchColor = '#ffffff'
  public defSwatchPantone = '11-0601'
  public custom_logo_tab_index = 0
  public expand_logos = true

  /*
  * data props ends
  * */


  /*
  * computed props starts
  * */

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get lockerColors(){
    return this.$store.getters.getLockerColors
  }

  get customLogos() {
    return this.$store.getters.getCustomLogos();
  }

  get logoColors() {
    return this.$store.getters.getLogoColorsInfo('colors')
  }

  /*
  * computed props ends
  * */

  /*
  * methods starts
  * */

  public changeTab (index: number) {
    this.$store.dispatch('setLogoTab', index)
  }

  get vectorImageConstraint():boolean{
    return this.$store.getters.getSetting('vector_image_constraint')
  }

  public addLogoTab() {
    const new_logo_index = this.customLogos.length
    //check if logo setting at given index exists then get that else get logo default object
    let logo_setting_at_index = this.selectedProduct.logos_setting[new_logo_index] ? this.selectedProduct.logos_setting[new_logo_index] : {}
    logo_setting_at_index = {...getLogoSettingsObject({product_id: this.selectedProduct.id}), ...logo_setting_at_index}
    logo_setting_at_index.logo_index = new_logo_index
    this.customLogos.push(logo_setting_at_index)
    this.custom_logo_tab_index = new_logo_index
  }

  public removeLogoTab(logo_index: number) {
    const self: Record<any, any> = this;
    self.$eventBus.$emit("customLogoRemoved", logo_index)
    this.customLogos.splice(logo_index, 1)
    this.customLogos.forEach((custom_logo: Record<any, any>, customLogoIndex) => {
      custom_logo.logo_index = customLogoIndex
    })
    this.custom_logo_tab_index = logo_index - 1
    self.$eventBus.$emit('handleNonVectorCustomLogosCount')
  }

  public handleLogoPlacementChange(updated_value: string, custom_logo: Record<any, any>) {
    custom_logo.side = updated_value
    let self: Record<any, any> = this;
    self.$eventBus.$emit('handleCustomLogoUpdatedEvent', custom_logo)
  }

  public getColors() {
    this.productColors = []
    this.selectedProduct.colors.forEach((colors: any, key: number) => {
      let finalColor = {color_text: [], selectedColor: "", name: colors.file_name.substr(0, colors.file_name.indexOf('.'))}
      finalColor.color_text = colors.json_data
      this.productColors = this.productColors.concat(finalColor)
    })
    this.productColors = this.productColors.concat(this.lockerColors)
  }

  public handleCustomLogoTabInputEvent(selected_tab_index: number) {
    this.custom_logo_tab_index = selected_tab_index
  }

  /*
  * methods ends
  * */

}
</script>

<style lang="scss" scoped>

.tabs-logo-container{
  @media only screen and (min-width: 992px){
    //padding: 0 0 150px;
    padding: 0 0 50px;
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
    .logo-option-area{
      @media only screen and (max-width: 992px){display: none;}
    }
  }
  .logo-placement-area{
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    position: relative;
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
      &.save-logo-btn{
        position: absolute;
        right: 0;
        top: 35px;
        @media only screen and (min-width: 992px){
          position: static;
        }
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
          margin: 10px 0 0 0;
          border: none;
          color: #fff;
          font-size: 14px;
          max-width: 100%;
          width: 100%;
          @media only screen and (min-width: 1024px){
            font-size: 12px;
            max-width: 100%;
          }
          @media only screen and (min-width: 1367px){
            max-width: 100%;
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
        top: -5px;
        right: -10px;
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
.logo-option-area{
  display: block;
  width: 100%;
}


</style>
