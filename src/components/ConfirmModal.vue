<template>
  <b-modal ref="confirm-modal" id="reset-confirm" size="md" :hide-footer="true" :hide-header="true" modal-class="confirm-modal">
    <div class="text-center">
        <span class="btn btn-secondary light rounded-circle confirm-icon">
          <b-icon-question></b-icon-question>
        </span>
    </div>
    <div class="fs-4 text-muted text-center p-4">
      {{ message }}
    </div>

    <div class="d-flex align-items-center justify-content-center gap-2">
      <b-button @click="_cancel" class="light">{{ cancel_text }}</b-button>
      <b-button  @click="_confirm" >{{ confirm_text }}</b-button>
    </div>
  </b-modal>
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
  private ref = this.$refs as Record<any, any>

  // Private variables
  private resolvePromise: any
  private rejectPromise: any

  private showConfirm(){
    this.ref['confirm-modal'].show()

    return new Promise((resolve, reject) => {
      this.resolvePromise = resolve
      this.rejectPromise = reject
    })

  }
  private hideConfirm(){
    this.ref['confirm-modal'].hide()
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
