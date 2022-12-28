<template>
    <modal :width="1000"
           :resizable="true"
           :scrollable="true"
           height="auto"
           :reset="true"
           :shiftY="0"
           @before-open="showUploader = -1"
           name="replace-logo" ref="replace-logo" id="modal-center-lockerroom" size="xl" :hide-footer="true">
      <div class="modal-header d-flex justify-content-between">
        <span class="fs-5 font-weight-bold">Replace Logos</span>
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hideVModal('replace-logo')"><BIconX /></span>
      </div>
      <div class="modal-content replace-logo">
        <div id="modal-center-lockerroom" class="modal-body">
          <div class="text-left pb-3">
            <div class="fs-3 font-weight-bolder">Unresolved Image Files </div>
            <div class="text-muted fs-2">In order to proceed you must replace one or more Files that does not meet the minimum requirements for printing. You will not be able to place your order until you've done so.</div>
          </div>
          <template v-for="(custom_logo, customLogoIndex) in replaceable_logos">
            <div :key="`logo_${customLogoIndex}`">
              <div class="d-flex justify-content-between align-items-center border py-1 px-2 rounded-lg" :class="{'mt-2': customLogoIndex>0}">
                <div class="d-flex align-items-center gap-1">
                  <div class="d-flex align-items-center gap-1 fs-4 text-success">
                    <span v-if="custom_logo.is_vector">
                      <b-icon-check-circle-fill />
                    </span>
                    <img class="flex-shrink-0" style="height: 40px" :key="custom_logo.url" :src="storageUrl + custom_logo.url" :title="custom_logo.logo_name" />
                  </div>
                  <span :key="custom_logo.url" style="text-overflow: ellipsis; overflow: hidden" class="d-block pr-2">{{ custom_logo.logo_name ? custom_logo.logo_name : 'N/A'  }}</span>
                </div>

                <b-button size="sm" @click="()=>showUploader = customLogoIndex">Replace</b-button>
              </div>

              <div v-if="showUploader == customLogoIndex" class="tabs-logo-container position-relative">
                <a class="close" @click="showUploader = -1"><b-icon-x /></a>
                <div class="logo-placement-area mb-3 mb-lg-4 pt-2">
                  <div class="logo-placement-holder mb-lg-3" :class="custom_logo.url ? 'hasLogo': 'noLogo'">
                    <div class="logo-holder">
                      <LogoUploader :customLogoIndex="customLogoIndex" :customLogo="custom_logo" :key="custom_logo.url"
                                    :replaceLogo="true" @logo-uploaded="showUploader = -1">
                        <span slot="upload_text">Click to upload logo or drag a file here</span>
                      </LogoUploader>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </modal>
</template>

<script lang="ts">
import {Component, Vue, Mixins, Prop} from 'vue-property-decorator'
import LogoUploader from '@/components/Logo/LogoUploader.vue'
import ModalAction from '@/mixins/ModalAction'
import { Popper } from 'popper-vue'
import 'popper-vue/dist/popper-vue.css'

@Component({
  components: {
    LogoUploader,
    Popper
  }
})
export default class ReplaceLogos extends Mixins(ModalAction){
  @Prop({ required: true }) popperID!: boolean
  @Prop({ required: true }) shareDesignLoader!: boolean
  @Prop({ required: true }) product!: any

  public ref = this.$refs as Record<any, any>
  private mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  private showUploader = -1

  // private screenWidth = this.mobileScreen ? window.screen.availWidth : (window.screen.availWidth - 100)

  get customLogos() {
    return this.$store.getters.getCustomLogos();
  }
  get company(): Record<any, any> {
    return this.$store.getters.getCompany
  }

  get replaceable_logos() {
    console.log('this.customLogos', this.customLogos)
    if(this.customLogos) {
      return this.customLogos.filter((custom_logo: Record<any, any>) => {
        return custom_logo.is_replace_success == true ? true : custom_logo.url && custom_logo.is_vector == false
      })
    } else {
      return []
    }

  }

}
</script>

<style lang="scss">
.close {
  position: absolute;
  right: 0;
  top: 0;
  background: #D53943;
  border-radius: 100px;
  color: #fff;
  width: 26px;
  height: 26px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  margin: 0;
  z-index: 1;
  padding: 0;
  opacity: 1;
  z-index: 1000;
}
</style>
