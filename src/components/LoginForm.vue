<template>
  <div>
    <modal  :width="screenWidth"
           :resizable="true"
           :scrollable="true"
           height="auto"
           :reset="true"
           :shiftY="0" name="loginModal" ref="loginModal" id="modal-login" class="login-modal" :class="{'absolute-modals': is_absolute}" size="lg" hide-title hide-footer>
      <div class="modal-header d-flex justify-content-between">
        <span class="fs-5 font-weight-bold d-inline-flex p-2">Login</span>
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hide"><BIconX /></span>
      </div>
      <div class="modal-body">
      <div class="form-holder"  :class="{active: isActive}">
        <div class="form-area form-signin p-4">
          <b-form>
            <b-form-group
              label="Email address:"
              label-for="input-1" class="text-left"
            >
              <b-form-input
                type="email"
                v-model="email"
                placeholder="Enter Email Address"
                required
              ></b-form-input>
            </b-form-group>

            <b-form-group id="input-group-2" label="Password:" class="text-left" label-for="input-2">
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

            <div class="pt-3"><span class="login-remember cursor-pointer btn-link" @click="showPasswordModal">Forgot password?</span></div>

          </b-form>
        </div>
        <div class="form-area form-signup p-4">
          <h2>Join Customizer!</h2>
          <b-form>
            <b-form-group class="text-left"
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
            <b-form-group class="text-left"
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

            <b-form-group class="text-left"
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

            <b-form-group class="text-left"
                          label="Team / Company Name"
                          label-for="input-3"
            >
              <b-form-input
                v-model="form.company_name"
                type="email"
                placeholder="Enter Team / Company Name"
                required
              ></b-form-input>
            </b-form-group>
            <b-form-group label-for="country" class="text-left">
              <label class="required"><strong>Country</strong></label>
              <v-select
                autocomplete="off"
                id="country"
                :options="countries"
                name="country"
                v-model="form.country"
                placeholder="Select Country"
                v-validate="{required: true}">
              </v-select>
            </b-form-group>

            <b-form-group label-for="country" class="text-left" v-if="isAdminSaleRep()">
              <label class="required"><strong>Sales Representative</strong></label>
              <v-select
                autocomplete="off"
                id="admin_salesrep_id"
                :options="getRepresentative"
                name="country"
                v-model="admin_salesrep_option"
                placeholder="Select Sale Representative"
                v-validate="{required: true}">
              </v-select>
            </b-form-group>


            <b-form-group id="input-group-4" class="text-left" label="Password" label-for="input-4">
              <b-form-input
                v-model="form.password"
                id="input-4"
                type="password"
                placeholder="Enter Password"
                required
              ></b-form-input>
            </b-form-group>

            <b-form-group id="input-group-5" class="text-left" label="Confirm Password" label-for="input-5">
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

            <div class="pb-3" v-if="false">By creating an account, I acknowledge that I have read and agreed with the <a href="/" class="login-remember" style="color: #219F84;">Terms of Use.</a></div>

            <b-button @click="signUp" variant="primary" class="mb-5">Create Account and Login</b-button>

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
      </div>
    </modal>

    <modal  :resizable="true"
            :scrollable="true"
            height="auto"
            :reset="true"
            :shiftY="0" name="forgotPasswordModal" ref="forgotPasswordModal" id="modal-login" class="login-modal absolute-modals" size="sm" hide-title hide-footer>
      <div class="modal-header bg-light d-flex justify-content-between">
        <span class="fs-5 font-weight-bold d-inline-flex p-2">Forgot Password?</span>
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="backToLoginModal"><BIconX /></span>
      </div>
      <div class="modal-body">
        <div class="form-holder d-block">
          <div class="form-area form-signin p-4">
            <b-form>
              <b-form-group
                label="A link will be sent to your email address to reset your password"
                label-for="input-1" class="text-left"
              >
                <b-form-input
                  type="email"
                  v-model="email"
                  placeholder="Enter email address"
                  required
                ></b-form-input>
              </b-form-group>

              <div class="d-flex align-content-center justify-content-center gap-2">
                <b-button @click="backToLoginModal" variant="secondary" class="light">Cancel</b-button>
                <b-button v-if="!loading" @click.prevent="forgotPassword">Submit</b-button>
                <button v-else  class="btn btn-secondary fw-bold light bg-dark" :disabled="true"  style="width: 15%">
                  <img width="20" height="20" src="@assets/images/loading.gif" />
                </button>
              </div>
            </b-form>
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script lang="ts">
  import {Vue, Component, Mixins, Prop } from 'vue-property-decorator'
  import ErrorMessages from "@/mixins/ErrorMessages";
  import {getPermissions, hasCompanyPermission} from "@/helpers/Helpers";
  import {http} from "@/httpCommon";
  import ModalAction from "@/mixins/ModalAction";

  @Component<LoginForm>({
    mounted(){
      http.get(`/addresses/countries`).then((response: any) => {
        const countries = response.data.result;
        countries.forEach((country) => {
            this.countries.push({ id: country.id , label: country.name});
        });
      })
        .catch((e: any) => {
          this.showError(e.response.data.message)
        });

      this.$store.dispatch('getSalesRep');
    }
  })
  export default class LoginForm extends Mixins(ErrorMessages, ModalAction) {
    @Prop({required: false, default: true}) readonly is_absolute !: boolean;
    public ref = this.$refs as Record<any, any>
    private screenWidth = (window.screen.availWidth - 100)
    public countries:Record<any,any> = [];
    public email  = ''
    public password  = ''
    public loading = false;
    public form = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirmation: '',
      company_name: '',
    }
    public admin_salesrep_option = { id: null, label: 'Please select a sale representative' }

    get getRepresentative(){
       let admin_salesrep_options =  this.$store.getters.getAdminSalesRep;
      let optionArray: Record<any, any>[] = [];

      if(admin_salesrep_options.length > 0){
        optionArray.push({ id: null, label: 'Please select a sale representative' })
        admin_salesrep_options.forEach((item:any) => {
          optionArray.push({ id: item.id, label: `${item.name} (${item.email})` })
        })
      }
      return optionArray;
    }

    public isActive = false
    public additionClass() {
      this.isActive = !this.isActive
    }
    public show(){
      this.$modal.show('loginModal')
    }
    public hide(){
      this.clearForm()
      this.$modal.hide('loginModal')
    }
    public showPasswordModal(){
      this.hide();
      this.$modal.show('forgotPasswordModal');
    }
    public hidePasswordModal(){
      this.$modal.hide('forgotPasswordModal');
    }
    public backToLoginModal(){
      this.$modal.hide('forgotPasswordModal');
      this.show()
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
          await this.$store.dispatch('getLockers')
          await this.$store.dispatch('getNotifications')
          await getPermissions()
          await this.$store.dispatch('getCartServer', {})
          this.email = ''
          this.password = ''
          this.$modal.hide('loginModal');
          this.$emit('actionAfterLogin')
        }
      }catch (error){
        console.log(error)
        this.showError(error)
      }
    }
    public async signUp(){
      try {
        let payload : Record<any, any> = this.form;
        if(this.isAdminSaleRep()) {
          if(this.admin_salesrep_option.id) {
            payload.admin_salesrep_id = this.admin_salesrep_option.id;
          } else {
            this.showToast('Please select a sales representative.', 'Error')
            return;
          }
        }

       let res = await this.$store.dispatch('signUpCustomer', payload)
        if (res.status == 201){
          this.$store.commit('SET_RECENT_LOGOS')
          await this.$store.dispatch('getLockerRoomColors')
          await this.$store.dispatch('getLockers')
          await this.$store.dispatch('getNotifications')
          await  getPermissions()
          await this.$store.dispatch('getCartServer', {})
          this.showToast(res.data.message, 'success')
          for (let key in this.form) {
            Vue.set(this.form, key, '')
          }
          this.hideVModal('loginModal');
          this.$emit('actionAfterLogin')
        }
      }catch (error){
        this.showError(error)
      }
    }
    public clearForm(){
      this.form.first_name = ''
      this.form.last_name= ''
      this.form.email= ''
      this.form.password= ''
      this.form.password_confirmation = ''
      this.email = ''
      this.password = ''
    }

    public async forgotPassword(){
      try {
        this.loading = true;
        let payload = {
          email: this.email
        }
        let res = await this.$store.dispatch('forgotPassword', payload)
        if (res.status == 200){
          this.email = ''
          this.showToast(res.data.message, 'success');
          this.loading = false;
          this.$modal.hide('forgotPasswordModal');
        }
      }catch (error){
        this.showError(error)
        this.loading = false;
      }
    }

    public isAdminSaleRep() {
      let admin_salesrep_options =  this.$store.getters.getAdminSalesRep;
      return hasCompanyPermission('show_admin_salerep') && admin_salesrep_options.length > 0;
    }

  }
</script>
<style>
  .vs__search::placeholder {
    color: #495057;
    opacity: 1;
  }
  #vs2__combobox{
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    display: flex;
    padding: 0 0 4px;
    background: none;
    border:none;
    /* border: 1px solid rgba(60,60,60,.26); */
    border-radius: 4px;
    white-space: normal;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 100%;
  }
  .v-select.vs--single.vs--searchable{
    display: block;
    width: 100%;
    height: calc(1.5em + 0.75rem + 2px);
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
</style>

