<template>
  <modal  :width="1000"
          :resizable="true"
          :scrollable="true"
          height="auto"
          :reset="true"
         :shiftY="0" name="EditAddressModal" ref="EditAddressModal" id="edit-modal-login" hide-title hide-footer>
    <div class="modal-header d-flex justify-content-between">
      <span class="fs-5 font-weight-bold">Edit Address</span>
      <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hide"><BIconX /></span>
    </div>
    <div class="modal-body">
    <div class="form-holder" :class="{active: isActive}">
      <div class="form-area add-address p-4">
        <b-form class="grid grid-mobile-2 gap-x-3 gap-y-1">
          <b-form-group
            label="First Name *"
            label-for="input-1" class="text-left"
          >
            <b-form-input
              type="text"
              v-model="form.first_name"
              placeholder="First Name"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="Last Name *"
            label-for="input-1" class="text-left"
          >
            <b-form-input
              type="text"
              v-model="form.last_name"
              placeholder="Last Name"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="Email"
            label-for="input-1" class="text-left"
          >
            <b-form-input
              type="text"
              v-model="form.email"
              placeholder="Email"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="Address *"
            label-for="input-1" class="text-left"
          >
            <b-form-input
              type="text"
              v-model="form.address1"
              placeholder="Address"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="Second Address"
            label-for="input-1" class="text-left"
          >
            <b-form-input
              type="text"
              v-model="form.address2"
              placeholder="Second Address"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="Phone Number *"
            label-for="input-1" class="text-left"
          >
            <b-form-input
              type="text"
              v-model="form.phone_number"
              placeholder="Phone Number"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group
            label="City *"
            label-for="input-1" class="text-left"
          >
            <b-form-input
              type="text"
              v-model="form.city"
              placeholder="City"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group
            label="Zip Code *"
            label-for="input-1" class="text-left"
          >
            <b-form-input
              type="text"
              v-model="form.zip_code"
              placeholder="Zip Code"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group
            label="Country *"
            label-for="input-1" class="text-left"
          >

            <b-form-select
              v-model="form.country"
              :options="countries"
              class="mb-3"
              value-field="id"
              text-field="name"
              disabled-field="notEnabled"
            ></b-form-select>
          </b-form-group>

          <b-form-group
            label="Company Name"
            label-for="input-1" class="text-left"
          >
            <b-form-input
              type="text"
              v-model="form.company_name"
              placeholder="Company Name"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group
            label="State/Province"
            label-for="input-1" class="text-left"
          >
            <b-form-input
              type="text"
              v-model="form.state"
              placeholder="State/Province"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group label-for="default" class="text-left"  v-if="form.default != 1 || form.default != true">
            <b-form-checkbox
              id="default"
              v-model="form.default"
              name="default"
              :value="true"
              unchecked-value="false"
            >
              Default Address
            </b-form-checkbox>
          </b-form-group>

          <div class="grid-span-2">
            <b-button class="align-self-end" v-if="!isLoading" @click="submitForm" variant="secondary">Save</b-button>
            <b-button class="align-self-end" v-else variant="secondary" :disabled="isLoading"><i class="fa fa-spinner fa-spin" style="font-size:24px"></i></b-button>
          </div>

        </b-form>
      </div>
    </div>
    </div>
  </modal>
</template>

<script lang="ts">
  import {Vue, Component, Mixins } from 'vue-property-decorator'
  import ErrorMessages from "@/mixins/ErrorMessages";
  import {http} from "@/httpCommon";

  @Component<EditAddressModal>({
    created() {
      this.getCountries();
    }
  })
  export default class EditAddressModal extends Mixins(ErrorMessages) {

    public ref = this.$refs as Record<any, any>
    private screenWidth = (window.screen.availWidth - 100)
    public isLoading = false
    public addresses = null;
    public countries = [];
    public form = {
      id:'',
      first_name: '',
      last_name: '',
      email: '',
      address1: '',
      address2: '',
      phone_number: '',
      city:'',
      company_name: '',
      state:'',
      zip_code:'',
      country:'',
      default:false
    }
    public isActive = false
    public additionClass() {
      this.isActive = !this.isActive
    }
    public show(){
      this.$modal.show('EditAddressModal')
    }
    public hide(){
      this.clearForm()
      this.$modal.hide('EditAddressModal')
    }
    public async submitForm(){
      try {
          this.isLoading = true;
          http.put(`/addresses/${this.form.id}`,this.form).then((response: any) => {
            if(response.data.success){
              this.$store.commit('ADD_SHIPPING_ADDRESS', response.data.result)
              this.isLoading = false;
              this.$modal.hide('EditAddressModal');
              this.clearForm();
              this.$emit('actionAfterAddressSave');
            }else{
              if(response.data.status_code === 422){
                this.showErrorArr(response.data.errors);
                this.isLoading = false
              }
              else{
                this.showError(response.data.message);
                this.isLoading = false
              }
            }
          }).catch((e: any) => {
              this.isLoading = false
              this.showError(e.response.data.message)
          });

      }catch (error){
        this.isLoading = false;
        this.showError(error)
      }
    }

    public clearForm(){
      this.form.id =''
      this.form.first_name = ''
      this.form.last_name= ''
      this.form.email = ''
      this.form.address1= ''
      this.form.address2= ''
      this.form.phone_number = ''
      this.form.city = ''
      this.form.company_name = ''
      this.form.state = ''
      this.form.zip_code = ''
      this.form.country = ''
      this.form.default = false
    }
    public updateForm(address:Record<any,any>){
      this.form.id = address.id;
      this.form.first_name = address.first_name;
      this.form.last_name= address.last_name;
      this.form.email = address.email;
      this.form.address1= address.address1;
      this.form.address2= address.address2;
      this.form.phone_number = address.phone_number;
      this.form.city = address.city;
      this.form.company_name = address.company_name;
      this.form.state = address.state;
      this.form.zip_code = address.zip_code;
      this.form.country = address.country.id;
      this.form.default = address.default?true:false;
    }

    public getCountries() {
      http.get(`/addresses/countries`).then((response: any) => {
        this.countries = response.data.result
      })
        .catch((e: any) => {
          this.showError(e.response.data.message)
        });
    }

  }
</script>

