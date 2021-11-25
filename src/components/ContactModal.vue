<template>
  <b-modal ref="contact-modal" @hide="hideContactModal" hide-footer id="modal-center-contact" centered scrollable
           title="Add Contact">
    <div class="design-name-form">

      <ValidationObserver v-slot="{ handleSubmit, invalid }">
        <b-form @submit.prevent="handleSubmit(saveContact)" >
        <div class="row" style="padding: 10px">
          <label for="inline-form-input-productname" class="w-100 d-block mb-2">Contact Email</label>
          <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
            <validation-provider rules="required|email" v-slot="{ errors }">
            <b-input-group>
              <b-form-input placeholder="Enter contact email" v-model="email"  ></b-form-input>
                <div class="error">{{ errors[0] }}</div>
             </b-input-group>
            </validation-provider>
          </div>
         </div>
        <div class="row">
          <div class="col-lg-12" style="text-align: right">
            <button type="button"  class="btn btn-secondary" @click="hideContactModal">Cancel</button>
            <button :disabled="invalid" type="submit" class="btn btn-secondary" style="margin-left: 5px;" >Save</button>
          </div>
        </div>
      </b-form>
      </ValidationObserver>
    </div>
    <div v-if="getContacts.length > 0">
      <h1>Contacts List</h1>
      <ul>
        <li style="padding: 5px; margin-bottom: 5px;" v-for="(contact) in getContacts" :key="contact.id">
          {{contact.email}}
          <span>
            <a data-title="Delete contact"  style="display: inline-block"
                   @click="deleteContact(contact.id)" ><font-awesome-icon
            :icon="['fas', 'trash-alt']"/></a>
          </span>
        </li>
      </ul>

    </div>
  </b-modal>
</template>

<script lang="ts">

import {Component, Mixins, Prop} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";
import { ValidationProvider, ValidationObserver, extend  } from 'vee-validate';
import { required, email } from 'vee-validate/dist/rules';

extend('required', {
  ...required,
  message: 'This field is required'
});
extend('email',{
  ...email,
  message: 'Provide a valid email address'
});

@Component<ContactModal>({
  components: {
    ValidationObserver,
    ValidationProvider
  }
})

export default class ContactModal extends Mixins(ErrorMessages) {
  @Prop({required: true}) readonly room_id !: number
  @Prop({required: true}) readonly room_index !: number
  public ref = this.$refs as Record<any, any>
  private email  = '';

  public showContactPopup() {
    this.ref['contact-modal'].show()
  }

  public hideContactModal() {
    this.ref['contact-modal'].hide()
  }

  get getContacts(){

    const lockerProducts = this.$store.getters.getLockerProducts;
    let contacts = lockerProducts[this.room_index].contacts;
    return contacts;
 }

  public async saveContact(){

    const payload = {'email': this.email, room_id: this.room_id}

    this.viewLoader = true
    let res = await this.$store.dispatch('saveContact', payload)
    this.viewLoader = false
    if (res.status == 201){
      this.showToast('Your contact saved successfully.', 'SUCCESS');
      let payload = {'index':this.room_index, 'attribute':'contacts', value: res.data.data}
      this.$store.commit('SET_LOCKER_ATTRIBUTE',payload)
      this.email = '';
    }else{
      this.showError(res)
    }

  }

  public async deleteContact(contact_id){

    const payload = {contact_id, room_id: this.room_id, _method:'DELETE'}
    this.viewLoader = true
    let res = await this.$store.dispatch('deleteContact', payload)
    this.viewLoader = false
    if (res.status == 201){
      this.showToast('Your contact deleted successfully.', 'SUCCESS');
      let payload = {'index':this.room_index, 'attribute':'contacts', value: res.data.data}
      this.$store.commit('SET_LOCKER_ATTRIBUTE',payload)

    }else{
      this.showError(res)
    }

  }

}

</script>

<style lang="scss" scoped>
.remove {
  margin-left: 10px;
  width: 40px;
  height: 40px;
  color: #D53943;
  background: #F8E1E2;
  border-radius: 50%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.add {
  width: 40px;
  height: 40px;
  color: #00FF00;
  background: #F0F0F0;
  border-radius: 50%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}
.error{
  padding: 5px;
  color: red;
}
</style>
