<template>
  <modal :width="500"
         :resizable="true"
         :scrollable="true"
         height="auto"
         :reset="true"
         :clickToClose="modal_data.click_to_close"
         :shiftY="0"  :name="modal_data.name" id="reset-confirm" size="md" :hide-footer="true" :hide-header="true" class="confirm-modal">
   <div class="modal-body">
    <div class="text-center">
        <span class="btn btn-secondary light rounded-circle confirm-icon">
          <BIconQuestion v-if="modal_data.icon === 'question'"/>
          <BIconCheck v-if="modal_data.icon === 'success'" />
          <BIconExclamation v-if="modal_data.icon === 'error'" />
          <BIconInfo v-if="modal_data.icon === 'warning'" />
        </span>
    </div>
    <div class="fs-4 text-muted text-center p-4">
      {{ modal_data.text }}
    </div>

    <div class="d-flex align-items-center justify-content-center gap-2">
      <b-button  @click="handleModalAction()">{{ modal_data.confirm_text }}</b-button>
      <b-button @click="handleModalAction(false)" v-if="modal_data.cancel_text" class="light">{{ modal_data.cancel_text }}</b-button>
    </div>
   </div>
  </modal>
</template>

<script lang="ts">
import {Component, Vue, Prop} from 'vue-property-decorator';
import VModal from 'vue-js-modal'
import 'vue-js-modal/dist/styles.css'
import {getSantaModalConfig} from "@/helpers/Helpers";
Vue.use(VModal, {})


@Component<SantaModal>({
  name: 'santa-modal',
})

export default class SantaModal extends Vue {

  /*
  * data props starts
  * */
  public modal_data = getSantaModalConfig()
  public resolveGlobal: any = null
  /*
  * data props ends
  * */

  /*
  * methods starts
  * */
  handleModalAction(confirmed = true) {
    if(this.modal_data.cancel_text == null || confirmed == false) {
      this.hide()
    }
    this.resolveGlobal(confirmed)
    if(this.modal_data.close_on_confirm){
      this.hide();
    }
  }

  public show(modal_data) {
    return new Promise((resolve, reject) => {
      this.modal_data = modal_data
      this.$modal.show(this.modal_data.name);
      this.resolveGlobal = resolve
    })
  }

  hide() {
    this.$modal.hide(this.modal_data.name);
  }
  /*
  * methods ends
  * */


}
</script>
