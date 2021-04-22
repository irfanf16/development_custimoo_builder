<template>
  <b-tabs>
    <b-tab v-for="(n, index) in customLogos" :key="index" :class="{ active: index==0 }">
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
                <img :src="apiBaseUrl+'/'+customLogos[index].url" alt="logo Shirt"/>
                <a href="#" class="remove-img" @click="deleteLogo(index)">
                  <font-awesome-icon :icon="['fas', 'trash-alt']"/>
                </a>
              </template>
              <template v-else>
                <img src="@/assets/images/logo-shirt.svg" alt="logo Shirt"/>
              </template>
            </div>
            <div class="logo-placemet-content">
              <h4>Logo Placement</h4>
              <b-form-select v-model="customLogos[index].side" :options="options"></b-form-select>
            </div>
          </div>
          <button class="btn btn-secondary w-100 fw-bold">Save Logo</button>
        </div>
        <div class="logo-placement-area">
          <h4 class="mb-3 mb-lg-4">Color Extracted from Logo</h4>
          <div class="logo-placement-holder">
            <div class="logo-holder">
              <img src="@/assets/images/logo-shirt.svg" alt="logo Shirt"/>
              <a href="#" class="remove-img">
                <font-awesome-icon :icon="['fas', 'trash-alt']"/>
              </a>
            </div>
            <div class="logo-placemet-content">
              <h4>Logo Placement</h4>
              <b-form-select v-model="selected" :options="options"></b-form-select>
            </div>
          </div>
          <button class="btn btn-secondary w-100 fw-bold">Save Color</button>
        </div>
        <template v-if="manageComponents.LogoArea">
          <UploadLogo :customLogoIndex="index"/>
        </template>
      </div>
    </b-tab>
    <b-tab v-if="customLogos.length < numberOfLogosAllowed" @click="addTab">
      <template #title>
        Logo +
      </template>
    </b-tab>
  </b-tabs>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import UploadLogo from "@/components/UploadLogo.vue"

@Component<LogoPlacementTabs>({
  components: {
    UploadLogo
  },
  mounted() {
    this.$store.dispatch('setCustomLogos')
    if(!this.logosSetting){
      this.logosSetting = this.logosSetting.apend({
        width: 100,
        height: 100,
        x_axis: 150,
        y_axis: 190,
        haveControls: true,
        side: 'front'
      })
    }
  }
})
export default class LogoPlacementTabs extends Vue {
  @Prop({required: true}) numberOfLogosAllowed!: number
  @Prop({required: true}) logosSetting!: any

  public numberOfLogos = 1

  private apiBaseUrl: string = process.env.VUE_APP_API_BASE_URL
  public selected = 'front'
  public options = [
    {value: 'front', text: 'Front'},
    {value: 'back', text: 'Back'}
  ]

  get customLogos(): [] {
    return this.$store.getters.getCustomLogos
  }

  get manageComponents(): [] {
    return this.$store.getters.getManageComponents
  }

  public addTab(){
    if(this.numberOfLogos < this.numberOfLogosAllowed) {
      let logoSetting = this.logosSetting[0]
      let logo = {
        url: '',
        width: logoSetting.width,
        height: logoSetting.height,
        x_axis: logoSetting.x_axis,
        y_axis: logoSetting.y_axis,
        haveControls: Boolean(logoSetting.is_locked),
        side: logoSetting.side
      }
      this.$store.dispatch('setCustomLogos', logo)
    }
  }
  public removeLogoTab(index: number){
    let payload = {
      index: index
    }
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
