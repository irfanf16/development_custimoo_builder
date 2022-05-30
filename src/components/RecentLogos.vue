<template>
  <div style="position:relative;">
    <h4 v-if="getRecentLogos.length > 0" class="mb-3 mb-lg-4" style="font-weight: 700">Recent Logos</h4>
    <div  class="grid grid-5 gap-2">
      <div style="position:relative;"  class="d-flex align-items-center justify-content-center" v-for="(logo, index) in getRecentLogos" :key="index">
        <a class="btn remove position-absolute" style="padding:0; height: 18px;width:18px;top: 0;right: 0; font-size: 1rem" v-if="addDeleteIconOnLogo(logo)" @click="deleteRecentLogo(logo)">
<!--          <font-awesome-icon :icon="['fas', 'trash-alt']"/>-->
          <BIconX class="position-relative" style="top: -1.7px" />
        </a>
        <img @click="setLogo(index,logo)" style="max-width: 100%; height: auto;cursor: pointer" :src="storageUrl+logo.logo_url+'?nocache=1'" alt="not working" />
      </div>

    </div>
    <confirm-modal popup_icon="info" message="This logo cannot be deleted as it is using in one of your locker product" cancel_text="" confirm_text="" ref="delete-logo-ref"></confirm-modal>
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
import {processColorsCustom, setCustomLogo} from "../helpers/Helpers"
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


  get getRecentLogos() {
    return this.$store.getters.getRecentLogos
  }
  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  // @Watch('recentLogos',{deep:true,immediate: true})
  //
  // recentLogosChanged(newLogos: []) {
  //   alert()
  // }

  public async deleteRecentLogo(recentLogo:any) {
    try {
      // if(!recentLogo.canLogoDelete) {
      //   const ok = await this.ref['delete-logo-ref'].showConfirm()
      //   if (ok) {
      //     await this.$store.dispatch('logoutCustomer');
      //     await this.$store.commit('SET_RECENT_LOGOS')
      //   }
      // }
      // return false
      const resp = await http.delete(`recent/logos/delete/${recentLogo.id}`);
      this.showToast(resp.data.message,'SUCCESS')
      // let updated_logos = this.$store.getters.getRecentLogos.filter((recent_logo:any) => {
      //   return recent_logo.id != recentLogo.id
      // })
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
  //  if(logo_exists || !recentLogo.canLogoDelete)
    if(logo_exists)
      return false

    return true
  }

  public async setLogo(index:number,logo:any) {
    this.showLoader = true;
    try {
      if(!logo.logo_colors) {
        logo.logo_colors = await this.fetchLogoColors(logo.id)
      }
      let custom_logos = this.$store.getters.getCustomLogos()
      //check if logo is removed but the tab is still active
      // if(!custom_logos[index]) {
      //   //add logo object in custom logos array
      //   console.log("adding new custom object")
      //   await this.addLogoObject(this.customLogoIndex)
      // }
      this.$store.commit('SET_COLORS_FROM_RECENT',true)
      await setCustomLogo(logo, this.customLogoIndex, this.selectedProduct.id)
    }
    catch (err) {
      console.log(err)
      this.showLoader = false;
    }
    setTimeout(() => {
      this.showLoader = false;
    },1000)
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
