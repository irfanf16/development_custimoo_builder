<template>
  <modal :width="500"
         :resizable="true"
         :scrollable="true"
         height="auto"
         :reset="true"
         :shiftY="0"  :name="name" id="reset-confirm" size="md" :hide-footer="true" :hide-header="true" class="confirm-modal">
   <div class="modal-body">
    <div class="text-center">
        <span class="btn btn-secondary light rounded-circle confirm-icon">
          <BIconQuestion v-if="popup_icon === 'question'"/>
          <BIconInfo v-if="popup_icon === 'info'" />

        </span>
    </div>
    <div class="fs-4 text-muted text-center p-4">
      {{ message }}
    </div>

    <div class="d-flex align-items-center justify-content-center gap-2">
      <b-button v-if="confirm_text.length > 0"  @click="_confirm" >{{ confirm_text }}</b-button>
      <b-button v-if="cancel_text.length > 0" @click="_cancel" class="light">{{ cancel_text }}</b-button>
    </div>
   </div>
  </modal>
</template>

<script lang="ts">
import {Component, Vue, Prop} from 'vue-property-decorator';

@Component<ConfirmModal>({
  name: 'confirm-modal'
})

export default class  ConfirmModal extends Vue{
  @Prop({ type: String, default: "Are you sure?" }) private message!: string;
  @Prop({ type: String, default: "No" }) private cancel_text!: string;
  @Prop({ type: String, default: "Yes" }) private confirm_text!: string;
  @Prop({ type: String, default: "reset-changes" }) private name!: string;
  @Prop({required: false, default: 'question'})  popup_icon !: string;
  private ref = this.$refs as Record<any, any>

  // Private variables
  private resolvePromise: any
  private rejectPromise: any

  private showConfirm(){
    this.$modal.show(`${this.name}`)

    return new Promise((resolve, reject) => {
      this.resolvePromise = resolve
      this.rejectPromise = reject
    })

  }
  private hideConfirm(){
    this.$modal.hide(`${this.name}`)
  }
  _confirm():any {
    this.hideConfirm()
    this.resolvePromise(true)
  }
  _cancel():any {
    this.hideConfirm()
    this.resolvePromise(false)
  }


}
</script>
