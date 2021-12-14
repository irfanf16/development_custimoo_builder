<template>
  <b-modal ref="loginModal" id="modal-login" content-class="login-modal" size="lg" hide-title hide-footer>
    <div class="form-holder" :class="{active: isActive}">
      <div class="form-area form-signin p-4">
        <h2>Hummel Login</h2>
        <b-form>
          <b-form-group
            label="Email address:"
            label-for="input-1"
          >
            <b-form-input
              type="email"
              v-model="email"
              placeholder="Enter Email Address"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group id="input-group-2" label="Password:" label-for="input-2">
            <b-form-input
              type="password"
              v-model="password"
              placeholder="Enter Password"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group>
            <b-form-checkbox
              name="checkbox-1"
              value="accepted"
              unchecked-value="not_accepted"
            >
              Keep Me Logged In
            </b-form-checkbox>
          </b-form-group>

          <b-button @click="submitForm" variant="primary">Submit</b-button>

          <div class="pt-3"><a href="/" class="login-remember">Remember me?</a></div>

        </b-form>
      </div>
      <div class="form-area form-signup p-4">
        <h2>Join Customizer!</h2>
        <b-form>
          <b-form-group
            label="First Name"
            label-for="input-1"
          >
            <b-form-input
              type="text"
              v-model="form.first_name"
              placeholder="Enter First Name"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="Last Name"
            label-for="input-2"
          >
            <b-form-input

              v-model="form.last_name"
              type="text"
              placeholder="Enter Last Name"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group
            label="Email Address"
            label-for="input-3"
          >
            <b-form-input
              v-model="form.email"
              type="email"
              placeholder="Enter Email Address"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group id="input-group-4" label="Password" label-for="input-4">
            <b-form-input
              v-model="form.password"
              id="input-4"
              type="password"
              placeholder="Enter Password"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group id="input-group-5" label="Confirm Password" label-for="input-5">
            <b-form-input
              v-model="form.password_confirmation"
               type="password"
              placeholder="Enter Confirm Password"
              required
            ></b-form-input>
          </b-form-group>

<!--          <b-form-group>-->
<!--            <b-form-checkbox-->
<!--              name="checkbox-2"-->
<!--              value="accepted"-->
<!--              unchecked-value="not_accepted"-->
<!--            >-->
<!--              Subscribe to newsletter-->
<!--            </b-form-checkbox>-->
<!--          </b-form-group>-->

          <div class="pb-3">By creating an account, I acknowledge that I have read and agreed with the <a href="/" class="login-remember" style="color: #219F84;">Terms of Use.</a></div>

          <b-button @click="signUp" variant="primary">Create Account and Login</b-button>

        </b-form>
      </div>
      <div class="signup-section p-4 pt-lg-5">
        <div>
          <div class="signup-text-header">
            <span class="text-join">Need an account?</span>
            <span class="text-signin">Already have an account?</span>
            <h2 @click="additionClass()">
              <span class="text-join">Join Customizer!</span>
              <span class="text-signin">Login Now!</span>
            </h2>
          </div>
<!--          <div class="social-signup">-->
<!--            <ul>-->
<!--              <li>-->
<!--                <a href="/"><font-awesome-icon :icon="['fab', 'linkedin-in']"/></a>-->
<!--              </li>-->
<!--              <li>-->
<!--                <a class="icon-google" href="/"><font-awesome-icon :icon="['fab', 'google-plus-g']"/></a>-->
<!--              </li>-->
<!--              <li>-->
<!--                <a class="icon-facebook" href="/"><font-awesome-icon :icon="['fab', 'facebook-f']"/></a>-->
<!--              </li>-->
<!--            </ul>-->
<!--          </div>-->
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script lang="ts">
  import {Vue, Component, Mixins } from 'vue-property-decorator'
  import ErrorMessages from "@/mixins/ErrorMessages";

  @Component<LoginForm>({})
  export default class LoginForm extends Mixins(ErrorMessages) {

    public ref = this.$refs as Record<any, any>

    public email  = ''
    public password  = ''
    public form = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirmation: ''
    }
    public isActive = false
    public additionClass() {
      this.isActive = !this.isActive
    }
    public async submitForm(){
      try {
        let payload = {
          email: this.email, password: this.password
        }
        let res = await this.$store.dispatch('loginCustomer', payload)
        if (res.status == 200){
          this.$store.commit('SET_RECENT_LOGOS')
          await this.$store.dispatch('getLockerRoomColors')
          await this.$store.dispatch('getNotifications')
          this.email = ''
          this.password = ''
          this.ref['loginModal'].hide();
          this.$emit('actionAfterLogin')
        }
      }catch (error){
        this.showError(error)
      }
    }
    public async signUp(){
      try {
       let res = await this.$store.dispatch('signUpCustomer', this.form)
        if (res.status == 201){
          this.showToast(res.data.message, 'SUCCESS')
          for (let key in this.form) {
            Vue.set(this.form, key, '')
          }
          this.ref['loginModal'].hide();
        }
      }catch (error){
        this.showError(error)
      }
    }

  }
</script>

