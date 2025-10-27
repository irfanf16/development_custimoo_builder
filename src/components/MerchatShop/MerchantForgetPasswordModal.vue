<template>
  <div>
    <modal
      :resizable="true"
      :scrollable="true"
      id="forgot-password-modal"
      height="auto"
      :reset="true"
      :shiftY="0"
      name="forgotPasswordModal"
      class="login-modal absolute-modals"
      size="sm"
      hide-title
      hide-footer
    >
      <div class="modal-header bg-light d-flex justify-content-between">
        <span class="fs-5 font-weight-bold d-inline-flex p-2">Forgot Password?</span>
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="backToLoginModal">
          <BIconX />
        </span>
      </div>
      <div class="modal-body">
        <div class="form-holder d-block">
          <div class="form-area form-signin p-4">
            <b-form @submit.prevent="forgotPassword">
              <b-form-group
                label="A link will be sent to your email address to reset your password"
                label-for="input-1"
                class="text-left"
              >
                <b-form-input
                  type="email"
                  v-model="email"
                  placeholder="Enter email address"
                  required
                ></b-form-input>
              </b-form-group>
              <div class="d-flex align-content-center justify-content-center gap-2">
                <b-button @click="backToLoginModal" b-button class="variant-outline">Cancel</b-button>
                <b-button type="submit" class="variant-color" :disabled="loading">
                  <span v-if="!loading">Submit</span>
                  <div v-else class="d-flex align-items-center justify-content-center">
                    <img width="20" height="20" src="@/assets/images/loading.gif" alt="Loading..." />
                  </div>
                </b-button>
              </div>
            </b-form>
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Vue } from 'vue-property-decorator';
import ErrorMessages from "@/mixins/ErrorMessages";
import ModalAction from "@/mixins/ModalAction";

@Component
export default class ForgotPassword extends Mixins(Vue, ErrorMessages, ModalAction) {
  public email = '';
  public loading = false;

  public backToLoginModal(): void {
    this.email = '';
    this.loading = false;
    this.$modal.hide('forgotPasswordModal');
    this.$modal.show('MerchantLoginFormModal');
  }

  public async forgotPassword(): Promise<void> {
    try {
      this.loading = true;
      const payload = {
        email: this.email,
      };
      const res = await this.$store.dispatch('forgotPassword', payload);
      if (res.data.status_code === 200) {
        this.email = '';
        this.$modal.hide('forgotPasswordModal');
        this.$modal.show('MerchantLoginFormModal');
      }
      this.showToast(res.data.message, 'success');
    } catch (error) {
      this.showError(error);
    } finally {
      this.loading = false;
    }
  }
}
</script>

<style scoped>
 :global(.absolute-modals.vm--container.scrollable .vm--modal) {
  max-height: 90vh !important;
  overflow-y: auto !important;
  margin-top: 0 !important;
}

#forgot-password-modal.vm--container {
  z-index: 9999 !important;
}

.variant-color {
  background-color: #000000 !important;
  color: #ffffff !important;
  border-color: #000000 !important;
}

.variant-outline {
  background-color: transparent !important;
  color: #000000 !important;
  border-color: #000000 !important;
}
</style>
