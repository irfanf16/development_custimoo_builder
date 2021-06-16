<template>
  <b-modal id="modal-login" size="lg" hide-title="true" content-class="login-modal" hide-footer="true">
    <div class="form-holder" :class="{active: isActive}">
      <div class="form-area p-4">
        <h2>Sports Excellence Login</h2>
        <b-form>
          <b-form-group
            id="input-group-1"
            label="Email address:"
            label-for="input-1"
          >
            <b-form-input
              id="input-1"
              type="email"
              placeholder="Enter email"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group id="input-group-2" label="Password:" label-for="input-2">
            <b-form-input
              id="input-2"
              type="password"
              placeholder="Password"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group>
            <b-form-checkbox
              id="checkbox-1"
              v-model="status"
              name="checkbox-1"
              value="accepted"
              unchecked-value="not_accepted"
            >
              Keep Me Logged In
            </b-form-checkbox>
          </b-form-group>

          <b-button type="submit" variant="primary">Submit</b-button>

          <div class="pt-3"><a href="/" class="login-remember">Remember me?</a></div>

        </b-form>
      </div>
      <div class="signup-section p-4">
        <div>
          <div class="signup-text-header">
            <span>Need an account?</span>
            <h2 @click="additionClass()">Join Customize Ninja!</h2>
          </div>
          <div class="social-signup">
            <ul>
              <li>
                <a href="/"><font-awesome-icon :icon="['fab', 'linkedin-in']"/></a>
              </li>
              <li>
                <a class="icon-google" href="/"><font-awesome-icon :icon="['fab', 'google-plus-g']"/></a>
              </li>
              <li>
                <a class="icon-facebook" href="/"><font-awesome-icon :icon="['fab', 'facebook-f']"/></a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator'

  @Component<LoginForm>({})
  export default class LoginForm extends Vue {

    public isActive = false
    public additionClass() {
      this.isActive = !this.isActive
    }

  }
</script>

