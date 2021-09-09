<template>
  <div>
    <h4 v-if="getRecentLogos.length > 0" class="mb-3 mb-lg-4" style="font-weight: 700">Recent Logos</h4>
    <div  class="grid grid-4 gap-2">
      <div style="position:relative;"  class="d-flex align-items-center justify-content-center" v-for="(logo, index) in getRecentLogos" :key="index">
        <a class="btn remove p-0 fs-1 position-absolute" style="height: 15px;width:15px;top: 0;right: 0" v-if="addDeleteIconOnLogo(logo)" @click="deleteRecentLogo(logo.id)">
          <font-awesome-icon :icon="['fas', 'trash-alt']"/>
        </a>
        <img @click="setLogo(index,logo)" style="max-width: 100%; height: auto;cursor: pointer"  :src="storageUrl+logo.logo_url" alt="Image 1" />
        <div class="loader" v-if="showLoader"><img src="../../src/assets/images/loading.gif" /></div>
      </div>

    </div>
  </div>

</template>

<script lang="ts">

import {Component, Prop, Watch, Vue, Mixins} from 'vue-property-decorator'
import {http} from "@/httpCommon"
import {getClosestColor} from '@/pantoneColor'
import rgbHex from 'rgb-hex'
import ErrorMessages from "@/mixins/ErrorMessages";
import {log} from "fabric/fabric-impl";

@Component<RecentLogos>({

})


export default class RecentLogos extends Mixins(ErrorMessages) {

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
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public ref = this.$refs as Record<any, any>
  public imageColors: any[] = []
  public showLoader = false

  get customLogos(): [Record<any, any>] {
    return this.$store.getters.getCustomLogos
  }


  get getRecentLogos() {
    return this.$store.getters.getRecentLogos
  }

  // @Watch('recentLogos',{deep:true,immediate: true})
  //
  // recentLogosChanged(newLogos: []) {
  //   alert()
  // }

  public async deleteRecentLogo(id:number) {
    try {
      const resp = await http.delete(`recent/logos/delete/${id}`);
      this.showToast(resp.data.message,'SUCCESS')
      let updated_logos = this.$store.getters.getRecentLogos.filter((recent_logo:any) => {
        return recent_logo.id != id
      })
      console.log('updated_logos',updated_logos)
      this.$store.commit('SET_RECENT_LOGOS',updated_logos)
    }
    catch (e){
      this.showError(e.response.data.message)
    }
  }

  public addDeleteIconOnLogo(recentLogo:any) {
    let custom_logos = this.$store.getters.getCustomLogos
    let logo_exists = custom_logos.find((logo:any) => {
      if(logo)
        return logo.id == recentLogo.id
    })
    if(logo_exists || !recentLogo.canLogoDelete)
      return false

    return true
  }

  public async setLogo(index:number,logo:any) {

    const customTabIndex = this.customLogoIndex
    let custom_logos = this.$store.getters.getCustomLogos
    let logo_url = '';
    let transparent_logo = logo.transparent_logo_url;
    let original_logo = logo.logo_url;
    let is_transparent = false;
    await this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.customLogos)), action: 'customLogos' })
    if(custom_logos[this.customLogoIndex] && custom_logos[this.customLogoIndex].is_transparent===true){
      logo_url = transparent_logo;
      is_transparent = true;
    }else{
      logo_url = original_logo;
    }

    let payload = [{
      index: customTabIndex,
      attribute: 'url',
      value: logo_url
    },{
      index: customTabIndex,
      attribute: 'id',
      value: logo.id
    },{
      index: customTabIndex,
      attribute: 'is_transparent',
      value: is_transparent
    },
      {
        index: customTabIndex,
        attribute: 'original_logo',
        value: original_logo
      },
      {
        index: customTabIndex,
        attribute: 'transparent_logo',
        value: transparent_logo
      }

    ];
    //check if logo is removed but the tab is still active
    if(!custom_logos[index]) {
      //add logo object in custom logos array
      this.addLogoObject(customTabIndex)
    }



    let getLogos = []
    if (custom_logos.length > 1){
      getLogos = custom_logos.slice(0, -1)
    }else{
      getLogos = custom_logos
    }

    payload.forEach((data) => {
      this.$store.dispatch('updateCustomLogoAttribute', data)
    })

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
      logoIndex: 0
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
  max-width: 40%;
  display: block;
  margin: 0 auto;
  height: auto;
}
}
</style>
