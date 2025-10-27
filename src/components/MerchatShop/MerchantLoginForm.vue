<template>
  <div>
    <modal
      :width="600"
      :resizable="true"
      :scrollable="true"
      height="auto"
      :reset="true"
      :shiftY="0"
      name="MerchantLoginFormModal"
      ref="MerchantLoginFormModal"
      id="modal-login-merchant"
      class="login-modal"
      size="lg"
      hide-title
      hide-footer
    >
      <div class="modal-header d-flex justify-content-end border-bottom">
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hide"><BIconX /></span>
      </div>
      <div class="modal-body">
         <div class="loader" v-if="showLoader"><img style="width: 100px" src="@assets/images/loading.gif" /></div>
        <div class="form-holder d-flex justify-content-center w-100" :class="{active: isActive}">
          <div class="form-area form-signin p-4 flex-fill">
            <div class="d-flex flex-lg-row flex-column justify-content-center mb-5 w-100">
            <div class="text-center mb-4 mb-lg-0 logo-container">
            <img
              :src="`${storageUrl}${getShopInfo?.logo}`"
              alt="Hornet Mascot with Hockey Stick"
              class="img-fluid border mt-2 p-1"
              style="width: 6rem;"
              >
            <h3 class="login-title font-weight-bold p-2 fs-5">Login</h3>
            <p class="login-subtitle fs-3">Please enter your details.</p>
            </div>
            </div>
            <b-form @submit.prevent="submitForm">
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

              <b-form-group id="input-group-2" label="Password:"  label-for="input-2">
                <b-form-input
                  type="password"
                  v-model="password"
                  placeholder="Enter Password"
                  required
                ></b-form-input>
              </b-form-group>
             <div class="d-flex justify-content-between align-items-center mb-3">
                    <b-form-checkbox
                        name="checkbox-1"
                        value="accepted"
                        unchecked-value="not_accepted"
                      >
                        Keep Me Logged In
                     </b-form-checkbox>
                    <span
                        class="cursor-pointer btn-link"
                        @click="showPasswordModal"
                      >
                    Forgot password?
                    </span>
                </div>

              <b-button type="submit" block class="variant-color">Submit</b-button>

              <div class="d-flex justify-content-between mt-3">
              <span>
                Don't have an account?
              <b-button type="button"  class="ml-3 variant-color" @click="additionClass()">SignUp</b-button>
              </span>
              </div>
            </b-form>
          </div>
          <div class="form-area form-signup p-4 flex-fill">
            <h2 class="text-dark">Register</h2>
            <b-form @submit.prevent="signUp">
              <b-form-group class="text-left" label="First Name" label-for="signup-first-name">
                <b-form-input
                  type="text"
                  v-model="form.first_name"
                  placeholder="Enter First Name"
                  required
                ></b-form-input>
              </b-form-group>
              <b-form-group class="text-left" label="Last Name" label-for="signup-last-name">
                <b-form-input
                  v-model="form.last_name"
                  type="text"
                  placeholder="Enter Last Name"
                  required
                ></b-form-input>
              </b-form-group>

              <b-form-group  label="Email Address" label-for="signup-email">
                <b-form-input
                  v-model="form.email"
                  type="email"
                  placeholder="Enter Email Address"
                  required
                ></b-form-input>
              </b-form-group>

              <b-form-group  label="Team / Company Name" label-for="signup-company">
                <b-form-input
                  v-model="form.company_name"
                  type="text"
                  placeholder="Enter Team / Company Name"
                  required
                ></b-form-input>
              </b-form-group>

             <b-form-group label-for="country">
              <label class="required"><strong>Country</strong></label>
                    <b-form-select
                      id="country-select"
                      v-model="form.country"
                      :options="countries"
                      value-field="id"
                      text-field="label"
                      required
                    >
              <template #first>
                  <b-form-select-option :value="null" disabled>Select Country</b-form-select-option>
                </template>
              </b-form-select>
              </b-form-group>

                <b-form-group label-for="admin_salesrep_id" v-if="isAdminSaleRep()">
                  <label class="required"><strong>Sales Representative</strong></label>
                      <b-form-select
                        id="admin_salesrep_id"
                        v-model="admin_salesrep_option.id"
                        :options="getRepresentative"
                        value-field="id"
                        text-field="label"
                        required
                    />
                </b-form-group>

              <b-form-group id="input-group-4"  label="Password" label-for="signup-password">
                <b-form-input
                  v-model="form.password"
                  id="signup-password"
                  type="password"
                  placeholder="Enter Password"
                  required
                ></b-form-input>
              </b-form-group>

              <b-form-group id="input-group-5"  label="Confirm Password" label-for="signup-confirm-password">
                <b-form-input
                  v-model="form.password_confirmation"
                  id="signup-confirm-password"
                  type="password"
                  placeholder="Enter Confirm Password"
                  required
                ></b-form-input>
              </b-form-group>
               <div class="d-flex justify-content-between align-items-center flex-wrap mb-1 mt-4 gap-1">
                  <b-button type="submit" class="variant-color w-100 ">Create Account</b-button>
                  <div>
                    <span>Already have an account?</span>
                    <b-button type="button" class="ml-2 variant-color" @click="additionClass()">Login</b-button>
                  </div>
               </div>

            </b-form>
          </div>
        </div>
      </div>
    </modal>
    <ForgotPassword ref="forgotPasswordModal" />
  </div>
</template>

<script lang="ts">
import { getPermissions, hasCompanyPermission } from "@/helpers/Helpers";
import { http } from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";
import ModalAction from "@/mixins/ModalAction";
import { Component, Mixins } from 'vue-property-decorator';
import ForgotPassword from "./MerchantForgetPasswordModal.vue";

@Component<LoginForm>({
    components: { ForgotPassword },
  mounted() {
    this.fetchCountries();
    this.$store.dispatch('getSalesRep');
  },
})
export default class LoginForm extends Mixins(ErrorMessages, ModalAction) {
  private screenWidth = (window.screen.availWidth - 100)
  public countries: Record<any, any>[] = [];
  public storageUrl = process.env.VUE_APP_STORAGE_URL;
  public showLoader = false;
  public email = '';
  public password = '';
  public form = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    company_name: '',
    country: null,
  };
  public admin_salesrep_option: Record<any, any> = { id: null};
  public isActive = false;

  get getRepresentative(): Record<any, any>[] {
    const admin_salesrep_options = this.$store.getters.getAdminSalesRep;
    const optionArray: Record<any, any>[] = [{ id: null, label: 'Please select a sales representative' }];
    if (admin_salesrep_options && admin_salesrep_options.length > 0) {
      admin_salesrep_options.forEach((item: any) => {
        optionArray.push({ id: item.id, label: `${item.name} (${item.email})` });
      });
    }
    return optionArray;
  }

  get getShopInfo(): Record<any, any> {
    return this.$store.getters.getShopInfo;
  }

  public additionClass(): void {
    this.isActive = !this.isActive;
  }

  public show(): void {
    this.$modal.show('MerchantLoginFormModal');
  }

  public hide(): void {
    this.clearForm();
    this.$modal.hide('MerchantLoginFormModal');
  }

  public showPasswordModal(): void {
    this.hide();
    this.$modal.show('forgotPasswordModal');
  }

  public clearForm(): void {
    this.email = '';
    this.password = '';
    this.form = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirmation: '',
      company_name: '',
      country: null,
    };
    this.admin_salesrep_option = { id: null, label: 'Please select a sales representative' };
  }

  public async fetchCountries(): Promise<void> {
    try {
      const response = await http.get(`/addresses/countries`);
      this.countries = response.data.result.map((country: any) => ({
        id: country.id,
        label: country.name,
      }));
    } catch (e: any) {
      this.showError(e.response?.data?.message || 'Failed to fetch countries');
    }
  }

  public async submitForm(): Promise<void> {
    try {
      this.showLoader = true;
      const payload = { email: this.email, password: this.password };
      const res = await this.$store.dispatch('loginCustomer', payload);
      if (res.status === 200) {
        
        await Promise.all([
          getPermissions(),
        ]);
        this.clearForm();
        this.$modal.show('shopCartModal');
        this.$modal.hide('MerchantLoginFormModal');
        this.showLoader = false;
      }
    } catch (error) {
      this.showLoader = false;
      this.showError(error);
    }
  }

  public async signUp(): Promise<void> {
    try {
      this.showLoader = true;
      if (this.form.password !== this.form.password_confirmation) {
        this.showLoader = false;
        this.showToast('Passwords must match.', 'error');
        return;
      }

      const payload: Record<any, any> = { ...this.form, ...{country: {id: this.form.country}} };
      if (this.isAdminSaleRep()) {
        if (!this.admin_salesrep_option.id) {
          this.showLoader = false;
          this.showToast('Please select a sales representative.', 'Error');
          return;
        }
        payload.admin_salesrep_id = this.admin_salesrep_option.id;
      }

      const res = await this.$store.dispatch('signUpCustomer', payload);
      if (res.status === 201) {
        await Promise.all([
          getPermissions(),
        ]);
        this.showToast(res.data.message, 'success');
        this.clearForm();
        this.$modal.show("shopCartModal");
        this.$modal.hide('MerchantLoginFormModal');
        this.showLoader = false;
      }
    } catch (error) {
      this.showLoader = false;
      this.showError(error);
    }
  }

  public isAdminSaleRep(): boolean {
    const admin_salesrep_options = this.$store.getters.getAdminSalesRep;
    return hasCompanyPermission('show_admin_salerep') && (admin_salesrep_options?.length || 0) > 0;
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

.logo-container img {
  max-width: 100%;
  max-height: 80px;
  height: auto;
  width: auto;
  object-fit: contain;
}

.variant-color {
  background-color: #000000 !important;
  color: #ffffff !important;
  border-color: #000000 !important;
}

.vm--overlay {
  backdrop-filter: blur(15px);
  background: rgba(0, 0, 0, 0.2);
}

#modal-login-merchant.vm--container {
  z-index: 9999 !important;
}
</style>
