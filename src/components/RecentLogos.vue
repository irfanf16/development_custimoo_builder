<template>
  <div v-if="getRecentLogos.length > 0"  style="position:relative;">
    <h4 class="mb-2" style="font-weight: 700">Recent Logos</h4>
    <div class="grid grid-5 gap-2 py-2 px-3 rounded" style="background: rgb(205, 205, 205)">
      <div style="position:relative;"  class="d-flex align-items-center justify-content-center" v-for="(logo, index) in getRecentLogos" :key="index">
        <a class="btn remove position-absolute" style="padding:0; height: 18px;width:18px;top: 0;right: 0; font-size: 1rem" v-if="addDeleteIconOnLogo(logo)" @click="deleteRecentLogo(logo)">
<!--          <font-awesome-icon :icon="['fas', 'trash-alt']"/>-->
          <BIconX class="position-relative" style="top: -1.7px" />
        </a>
        <img style="max-width: 100%; height: auto;cursor: pointer" :src="storageUrl+logo.logo_url+'?nocache=1'" alt="not working" />
      </div>

    </div>
    <confirm-modal popup_icon="info" message="This logo cannot be deleted as it is using in one of your locker product" cancel_text="" confirm_text="" name="delete-logo-ref" ref="delete-logo-ref"></confirm-modal>
    <div class="loader" v-if="showLoader"><img src="../../src/assets/images/loading.gif" /></div>
  </div>

</template>

<script lang="ts">

import {Component, Prop, Watch, Vue, Mixins} from 'vue-property-decorator'
import {http} from "@/httpCommon"
import {getClosestColor} from '@/pantoneColor'
import rgbHex from 'rgb-hex'
import ErrorMessages from "@/mixins/ErrorMessages";
import {LockerProducts} from "@/mixins/LockerProduct";
import ConfirmModal from "@/components/ConfirmModal.vue";
import {log} from "fabric/fabric-impl";
import {processColorsCustom} from "../helpers/Helpers"
import Store from "@/store";

@Component<RecentLogos>({
  components: {
    ConfirmModal
  }
})


export default class RecentLogos extends Mixins(ErrorMessages,LockerProducts) {

  @Prop({required:false}) customLogoIndex!: number
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
  public status = 'accepted'
  public open_modal!: boolean
  public mounted!: boolean
  public colors: any = [];
  public storageUrl = process.env.VUE_APP_STORAGE_URL
  public ref = this.$refs as Record<any, any>
  public imageColors: any[] = []
  public showLoader = false

  get customLogos(): [Record<any, any>] {
    return this.$store.getters.getCustomLogos()
  }
  get products(): [Record<any, any>] {
    return this.$store.getters.getProducts
  }

  get getRecentLogos() {
    return this.$store.getters.getRecentLogos
  }
  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  public async deleteRecentLogo(recentLogo:any) {
    try {
      const resp = await http.delete(`recent/logos/delete/${recentLogo.id}`);
      this.showToast(resp.data.message,'success')
      this.$store.commit('SET_RECENT_LOGOS')
    }
    catch (e){
      this.showError(e.response.data.message)
    }
  }

  public addDeleteIconOnLogo(recentLogo:any) {
    let custom_logos = this.$store.getters.getCustomLogos()
    let logo_exists = custom_logos.find((logo:any) => {
      if(logo)
        return logo.id == recentLogo.id
    })
    if(logo_exists)
      return false

    return true
  }

   public async addLogoObject(index:number):Promise<void> {
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
      customLogo: true,
      logoIndex: 0,
    }
     logo.logoIndex = index
    await this.$store.dispatch('setCustomLogos', logo)
  }
}

</script>

<style lang="scss" scoped>
.loader {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  background: rgba(255,255,255,0.9);
  z-index: 1030;
img{
  max-width: 30%;
  display: block;
  margin: 0 auto;
  height: auto;
}
}

h4{
  @media (min-width: 600px) {
    font-size: 1.2rem;
  }
}
</style>
