<template>
    <modal  :resizable="true"
            :scrollable="true"
            height="auto"
            :reset="true"
            :shiftY="0" name="shareDesign" ref="shareDesign" id="modal-login" class="login-modal absolute-modals" size="sm" hide-title hide-footer>
      <div class="modal-header bg-light d-flex justify-content-between">
        <span class="fs-5 font-weight-bold d-inline-flex p-2">Share Design</span>
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hideVModal('shareDesign')"><BIconX /></span>
      </div>
      <div class="modal-body">
        <div class="loader" v-if="loader"><img src="@assets/images/loading.gif" /></div>
        <div class="form-holder d-block">
          <div class="form-area form-signin p-4">
            <b-form>
              <b-form-group
                label="Copy the URL below to share the design"
                label-for="input-1" class="text-left"
              >
                <b-form-input
                  type="text"
                  ref="share-design-link"
                  v-if="product"
                  :value="product.shared_url !== 'undefined'  ?   product.shared_url : ''"
                  placeholder="Design URL"
                  readonly
                ></b-form-input>
              </b-form-group>

              <div class="d-flex align-content-center justify-content-center gap-2">
                <b-button @click="hideVModal('shareDesign')" variant="secondary" class="light">Close</b-button>
                <b-button @click="copyLink" variant="secondary">Copy URL</b-button>
              </div>
            </b-form>
          </div>
        </div>
      </div>
    </modal>
</template>

<script lang="ts">
  import {Component, Mixins, Prop} from 'vue-property-decorator';
  import ModalAction from "@/mixins/ModalAction";
  import ErrorMessages from "@/mixins/ErrorMessages";
  @Component<ShareDesignModal>({

  })

  export default class ShareDesignModal extends Mixins(ModalAction, ErrorMessages) {
    @Prop({required: true}) product:Record<any, any> ;
    @Prop({required: true}) loader:boolean ;
    public url = ''

    public copyLink() {
      let testingCodeToCopy = this.$refs['share-design-link'] as Record<any, any>
      testingCodeToCopy.select()
      try {
        document.execCommand('copy');
        this.showToast('Shareable link was copied to your clipboard.', 'success');
      } catch (err) {
        this.showToast('Oops, unable to copy', 'error');
      }
    }
  }
</script>

