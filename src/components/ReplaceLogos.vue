<template>
    <modal :width="1000"
           :resizable="true"
           :scrollable="true"
           height="auto"
           :reset="true"
           :shiftY="0"
           name="replace-logo" ref="replace-logo" id="modal-center-lockerroom" size="xl" :hide-footer="true"
           @close="$store.commit('Change_Locker_Active_Tab', 0)">
      <div class="modal-header d-flex justify-content-between">
        <span class="fs-5 font-weight-bold">Locker Room</span>
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hideVModal('replace-logo')"><BIconX /></span>
      </div>
      <div class="modal-content lockerroom-modal">
        <div id="modal-center-lockerroom" class="modal-body">
          <div v-for="(custom_logo, customLogoIndex) in customLogos" :key="`logo_${customLogoIndex}`">
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
<!--                  <b-form-select :value="custom_logo.side" :options="['front', 'back']" @change="handleLogoPlacementChange($event, custom_logo)"></b-form-select>-->
                </div>
              </div>
            </div>
          </div>
          </div>

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

  // private screenWidth = this.mobileScreen ? window.screen.availWidth : (window.screen.availWidth - 100)

  get customLogos() {
    return this.$store.getters.getCustomLogos();
  }

}
</script>
