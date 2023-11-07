<template>
  <div class="d-flex justify-content-center">
    <div class="page-wrapper m-lg-4 bg-light rounded-lg pt-3" style="width: 100%; max-width: 600px">
      <h1 class="fs-6">Reset password</h1>

      <div class="form-holder d-block">
        <div class="form-area form-signin p-4">
          <b-form>
            <b-form-group
              label-for="input-1" class="text-left"
            >
              <b-form-input
                type="email"
                v-model="email"
                placeholder="Enter Email"
                required
              ></b-form-input>
            </b-form-group>
            <b-form-group
              label-for="input-1" class="text-left"
            >
              <b-form-input
                type="password"
                v-model="password"
                placeholder="Enter new password..."
                required
                @input="passwordCheck"
              ></b-form-input>
            </b-form-group>
            <b-form-group
              label-for="input-1" class="text-left"
            >
              <b-form-input
                type="password"
                v-model="confirmPassword"
                placeholder="Confirm new password..."
                required
                @input="passwordCheck"
              ></b-form-input>
            </b-form-group>

            <div class="text-left text-danger fs-2" v-if="!isSamePassword">
              Confirm password does not match, please correct.
            </div>

            <div class="text-left text-danger fs-2" v-if="!isPasswordLength">
              Minimum Password Length is 6
            </div>

            <div class="d-flex align-content-center mt-4 justify-content-center gap-2">
              <RouterLink to="/" class="btn d-inline-block btn-secondary light">Back to customizer</RouterLink>
              <b-button @click.prevent="resetPassword">Reset password</b-button>
            </div>
          </b-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import { Component, Mixins, Vue } from 'vue-property-decorator'
import { http } from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";


@Component<Resetpassword>({
  components: {},
})

export default class Resetpassword extends Mixins(ErrorMessages) {

  public email = ''
  public password = ''
  public confirmPassword = '';
  public isSamePassword = true;
  public loading = false;
  public isPasswordLength = true;
  // public passwordReset = false;

  public passwordCheck(){
    if(this.password !== '' && this.confirmPassword !== ''){
      this.isSamePassword = this.password === this.confirmPassword
    }else{
      this.isSamePassword = true
    }
    if(this.password.length >= 6){
      this.isPasswordLength = true
    }
    else {
      this.isPasswordLength = false
    }

  }

  public async resetPassword(){
      if(this.password === this.confirmPassword){
        this.loading = true;
        let form_data = {
          email: this.email,
          password: this.password,
          password_confirmation: this.confirmPassword,
          token: this.$route.query.password_token,
        }
        await http.post("customer/reset-password", form_data).then(async successResponse => {
          let response_data = successResponse.data;
          if(response_data.success) {
            this.showToast('Password Changed Successfully', 'SUCCESS');
            this.$router.push('/')
          } else {
            this.showToast('Something went wrong', 'ERROR');
          }
          this.loading = false;
        }).catch(error => {
          this.loading = false;
          this.showToast('Something went wrong', 'ERROR');
        });
      }
      else{
        this.showToast('Password does not match', 'ERROR');
      }
  }
}
</script>

<style lang="scss" scoped>
a.my-orders {
  text-decoration: none;
  color: white;
}

a.my-orders:hover {
  color: #2c3e50;
  opacity: 0.7;
}
</style>
