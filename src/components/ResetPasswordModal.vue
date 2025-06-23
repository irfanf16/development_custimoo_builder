<template>
  <modal :resizable="true" :scrollable="true" height="auto" :reset="true" :clickToClose="false" :shiftY="0"
    name="resetPasswordModal" ref="resetPasswordModal" id="modal-login" class="login-modal absolute-modals" size="sm"
    hide-title hide-footer>
    <div class="modal-header bg-light d-flex justify-content-between">
      <span class="fs-5 font-weight-bold d-inline-flex p-2">Reset Password</span>
    </div>
    <div class="modal-body">
      <div class="form-holder d-block">
        <div class="form-area form-signin p-4">
          <b-form>
            <b-form-group
              label="Welcome! To complete your setup, please create a new password before accessing your profile."
              label-for="input-1" class="text-left">
              <label class="mt-3" for="">Enter Password</label>
              <b-form-input type="password" v-model="password" required></b-form-input>

            </b-form-group>
            <b-form-group class="text-left">
              <label for="">Confirm Password</label>
              <b-form-input type="password" v-model="password_confirmation" required></b-form-input>
            </b-form-group>

            <div class="d-flex align-content-center justify-content-center gap-2">
              <b-button v-if="!loading" @click.prevent="resetPassword">Submit</b-button>
              <button v-else class="btn btn-secondary fw-bold light bg-dark" :disabled="true" style="width: 15%">
                <img width="20" height="20" src="@assets/images/loading.gif" />
              </button>
            </div>
          </b-form>
        </div>
      </div>
    </div>
  </modal>
</template>
<script>
import Store from "@/store";
export default {
  data() {
    return {
      password: null,
      password_confirmation: null,
      loading: false
    }
  },
  methods: {
    async resetPassword() {
      if (!this.password || !this.password_confirmation) {
        this.$emit('notify', { type: 'error', message: 'Both password fields are required.' });
        return;
      }
      if (this.password !== this.password_confirmation) {
        this.$emit('notify', { type: 'error', message: 'The passwords do not match.' });
        return;
      }
      this.loading = true;
      try {
        const res = await this.$store.dispatch('resetCustomerPassword', { password: this.password, password_confirmation: this.password_confirmation });
        if (res.data?.success) {
          this.$emit('notify', { type: 'success', message: 'Password updated successfully' });
          this.$bvModal.hide('resetPasswordModal');
        } else {
          this.$emit('notify', { type: 'error', message: res.data?.message });
        }
        this.loading = false;
      } catch (error) {
        const response = error.response.data
        const firstField = Object.keys(response.errors)[0]
        const firstError = response.errors[firstField][0]
        this.$emit('notify', { type: 'error', message: firstError });
        this.loading = false;
      }
    }
  }
}
</script>
