<template>
  <div v-if="recentLogos.length > 0 && customLogo"  style="position:relative;">
    <h4 class="mb-2" style="font-weight: 700">Recent Logos</h4>
    <div class="grid grid-5 gap-2 py-2 px-3 rounded" style="background: rgb(205, 205, 205)">
      <div v-for="(recent_logo, recentLogoIndex) in recentLogos" :key="recentLogoIndex" style="position:relative;"
           :style="[customLogo.id == recent_logo.id ? {cursor: 'default', border: '1px solid green'} : {cursor: 'pointer'}]"
           class="d-flex align-items-center justify-content-center"
      >
        <a @click="deleteRecentLogo(recent_logo)" class="btn remove position-absolute"
           style="padding:0; height: 18px;width:18px;top: 0;right: 0; font-size: 1rem"
        >
          <BIconX class="position-relative" style="top: -1.7px" />
        </a>
        <img @click="customLogo.id != recent_logo.id ? setRecentLogo(recent_logo) : null"
             style="max-width: 100%; height: auto" :src="storageUrl+recent_logo.logo_url+'?nocache=1'" alt="not working"
        />
      </div>

    </div>
    <confirm-modal popup_icon="info" message="This logo cannot be deleted as it is using in one of your locker product"
                   cancel_text="" confirm_text="" name="delete-logo-ref" ref="delete-logo-ref"></confirm-modal>
    <div class="loader" v-if="showLoader"><img src="@/assets/images/loading.gif" /></div>
  </div>

</template>

<script lang="ts">

import {Component, Prop, Watch, Vue, Mixins} from 'vue-property-decorator'
import {http} from "@/httpCommon"
import ErrorMessages from "@/mixins/ErrorMessages";
import {LockerProducts} from "@/mixins/LockerProduct";
import ConfirmModal from "@/components/ConfirmModal.vue";
import {processColorsCustom, setCustomLogo} from "@/helpers/Helpers"
import CustomLogosMixin from "@/mixins/CustomLogosMixin";

@Component<RecentLogos>({
  components: {
    ConfirmModal
  },
  mounted() {
    this.$eventBus.$on('handleLogoUploadedEvent', this.handleLogoUploadedEvent)
  }
})


export default class RecentLogos extends Mixins(ErrorMessages,LockerProducts, CustomLogosMixin) {

  /*
  * props starts
  * */

  @Prop({required:true}) customLogoIndex!: number
  @Prop({required:true}) customLogo!: Record<any, any>

  /*
  * props ends
  * */

  /*
  * data props starts
  * */

  public storageUrl = process.env.VUE_APP_STORAGE_URL
  public showLoader = false

  /*
  * data props ends
  * */

  /*
  * computed props starts
  * */

  get customLogos(): [Record<any, any>] {
    return this.$store.getters.getCustomLogos()
  }
  get products(): [Record<any, any>] {
    return this.$store.getters.getProducts
  }

  get recentLogos() {
    return this.$store.getters.getRecentLogos
  }
  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  /*
  * computed props ends
  * */

  /*
  * methods starts
  * */

  public async deleteRecentLogo(recentLogo:any) {
    try {
      const resp = await http.delete(`recent/logos/delete/${recentLogo.id}`);
      this.showToast(resp.data.message,'SUCCESS')
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

  public async setRecentLogo(recent_logo: Record<any, any>) {
    let self: Record<any, any> = this;
    if(this.customLogoIndex == 0) {
      let logo_colors = processColorsCustom(recent_logo.logo_colors)
      this.customLogo.logo_colors = logo_colors
      this.$store.commit('SET_LOGO_COLORS_INFO', {
        data: { colors: logo_colors, extracted_colors: JSON.parse(JSON.stringify(logo_colors)) }
      })
    }
    const custom_logos_updated_props = {
      transparent_logo: recent_logo.transparent_logo_url, smart_transparent_logo: recent_logo.smart_transparent_logo_url,
      original_logo_url: recent_logo.original_logo_url, original_logo: recent_logo.original_logo, is_smart_transparent: false,
      url: recent_logo.logo_url, id: recent_logo.id, is_vector: recent_logo.is_vector, is_recent_logo: true,
      logo_name: recent_logo.logo_name
    }
    delete this.customLogo.scaleX
    delete this.customLogo.scaleY
    await this.$store.commit('SET_CUSTOM_LOGOS', {
      logo_index: this.customLogoIndex, custom_logos: {...this.customLogo, ...custom_logos_updated_props}
    })
    if(this.customLogoIndex == 0) {
      await this.addRemoveTeamLogoOnAllProducts('add', this.customLogo)
    }
    self.$eventBus.$emit('handleCustomLogoUpdatedEvent', this.customLogo)
    self.$eventBus.$emit('handleNonVectorCustomLogosCount')
  }

  /*
  * methods ends
  * */

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
