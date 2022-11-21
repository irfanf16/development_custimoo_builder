<template>
    <modal :width="1000"
           :resizable="true"
           :scrollable="true"
           height="auto"
           :reset="true"
           :shiftY="0"
           @before-open="showUploader = -1"
           name="replace-logo" ref="replace-logo" id="modal-center-lockerroom" size="xl" :hide-footer="true"
           @close="$store.commit('Change_Locker_Active_Tab', 0)">
      <div class="modal-header d-flex justify-content-between">
        <span class="fs-5 font-weight-bold">Replace Logos</span>
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hideVModal('replace-logo')"><BIconX /></span>
      </div>
      <div class="modal-content replace-logo">
        <div id="modal-center-lockerroom" class="modal-body">
          <template v-for="(custom_logo, customLogoIndex) in customLogos">
            <div :key="`logo_${customLogoIndex}`" v-if="custom_logo.url">
              <div class="d-flex justify-content-between align-items-center border py-1 px-2 rounded-lg" :class="{'mt-2': customLogoIndex>0}">
                <div class="d-flex align-items-center gap-1">
                  <div :key="custom_logo.url">
                    <img class="flex-shrink-0" style="height: 40px" :key="custom_logo.url+customLogoIndex" :src="storageUrl + custom_logo.url" :title="custom_logo.logo_name" />
                  </div>
                  <span :key="custom_logo.url" style="text-overflow: ellipsis; overflow: hidden" class="d-block pr-2">{{ custom_logo.logo_name ? custom_logo.logo_name : 'N/A'  }}</span>
                </div>

                <b-button size="sm" @click="()=>showUploader = customLogoIndex">Replace</b-button>
              </div>

              <div v-if="showUploader == customLogoIndex" class="tabs-logo-container">
                <div class="logo-placement-area mb-3 mb-lg-4 pt-2">
                  <div class="logo-placement-holder mb-lg-3" :class="custom_logo.url ? 'hasLogo': 'noLogo'">
                    <div class="logo-holder">
                      <LogoUploader :customLogoIndex="customLogoIndex" :customLogo="custom_logo" :key="custom_logo.url" :replaceLogo="true">
                        <span slot="upload_text">Click to upload logo or drag a file here</span>
                      </LogoUploader>
                    </div>
<!--                    <div class="logo-placemet-content" v-if="custom_logo.url">-->
<!--                      <h4>Logo Placement</h4>-->
<!--                      <b-form-select :value="custom_logo.side" :options="['front', 'back']" @change="handleLogoPlacementChange($event, custom_logo)"></b-form-select>-->
<!--                    </div>-->
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
import {Component, Vue, Mixins} from 'vue-property-decorator'
import LogoUploader from '@/components/Logo/LogoUploader.vue'
import ModalAction from '@/mixins/ModalAction'

@Component({
  components: {
    LogoUploader
  }
})
export default class ReplaceLogos extends Mixins(ModalAction){
  public ref = this.$refs as Record<any, any>
  private mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  private showUploader = -1

  // private screenWidth = this.mobileScreen ? window.screen.availWidth : (window.screen.availWidth - 100)

  get customLogos() {
    return this.$store.getters.getCustomLogos();
  }

}
</script>
