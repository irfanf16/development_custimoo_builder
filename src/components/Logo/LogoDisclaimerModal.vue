<template>
  <modal :width="500" :resizable="true" :scrollable="true" height="auto" :reset="true"
         :shiftY="0" name="logo-disclaimer-modal" id="logo-disclaimer-modal" size="md" :hide-footer="true"
         :hide-header="true" class="logo-disclaimer-modal" ref="logo-disclaimer-modal">
    <div class="modal-header d-flex justify-content-between">
      <span class="fs-5 font-weight-bold">Attention!</span>
      <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hideVModal('logo-disclaimer-modal')"><BIconX /></span>
    </div>
    <div class="modal-body">
      <p class="mb-3">By uploading an image, you guarantee that your use of the image does not infringe any rights or
        laws. You may
        review Customizer’s design rejection reasons <a href="#">HERE</a>.</p>
      <div class="mb-2">
        <b-form-checkbox
          id="checkbox-1"
          v-model="dont_show_again"
          name="checkbox-1"
        >
          Don't show again.
        </b-form-checkbox>
      </div>
      <div class="upload-logo-buttons justify-content-center d-flex gap-1">
        <button class="btn btn-secondary light text-center justify-content-center p-2" @click="$emit('hide-disclaimer-modal')">Cancel</button>
        <button class="btn btn-secondary text-center justify-content-center p-2"
                style="background: #219F84; color: #fff"
                @click="$emit('disclaimer-accepted', !dont_show_again)"
        >
          Confirm and Upload
        </button>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">

import {Component, Mixins} from 'vue-property-decorator'
import ModalAction from "@/mixins/ModalAction";

@Component<LogoDisclaimerModal>({

})
export default class LogoDisclaimerModal extends Mixins(ModalAction) {
  /*
  * data props starts
  * */

  public dont_show_again = true

  /*
  * data props ends
  * */

}

</script>

<style lang="scss" scoped>

</style>
