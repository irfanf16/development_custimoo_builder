<template>
  <b-modal ref="contact-modal" @hide="hideContactModal" hide-footer id="modal-center-contact" centered scrollable>
    <template #modal-title>
      <h4 class="fs-3 font-weight-bold">Add Contact</h4>
    </template>
    <div class="design-name-form">

      <ValidationObserver v-slot="{ handleSubmit, invalid }">
        <b-form @submit.prevent="handleSubmit(saveContact)" >
        <div class="d-flex w-100 align-items-center">
          <validation-provider class="w-100" rules="required|email" v-slot="{ errors }">
            <label for="inline-form-input-productname" class="w-100 d-block mb-2">Contact Email</label>
            <div class="w-100 d-flex align-items-center gap-2">
              <b-form-input class="w-100" placeholder="Enter contact email" v-model="email"></b-form-input>

              <div class="d-flex gap-1">
                <button type="button"  class="btn light btn-secondary" @click="hideContactModal">Cancel</button>
                <button :disabled="invalid" type="submit" class="btn btn-secondary" >Save</button>
              </div>
            </div>
            <span class="error mt-1 d-block">{{ errors[0] }}</span>
          </validation-provider>
         </div>

      </b-form>
      </ValidationObserver>
    </div>
    <div v-if="getContacts.length > 0">
      <h3 class="fs-3 font-weight-bold">Contacts List</h3>
      <div class="mt-3" style="max-height: 300px; overflow-y:auto">
        <table class="table table-bordered b-table-fixed mb-0 w-100 ">
          <thead class="bg-light">
          <th class="font-weight-bold">
            Email
          </th>
          <th class="font-weight-bold">
            Action
          </th>
          </thead>
          <tbody>
          <tr  v-for="(contact) in getContacts" :key="contact.id">
            <td>{{contact.email}}</td>
            <td class="cursor-pointer">
              <a data-title="Delete Contact" @click="deleteContact(contact.id)">
                <font-awesome-icon
                  :icon="['fas', 'trash-alt']"/>
              </a>
            </td>
          </tr>
          </tbody>

        </table>
      </div>


    </div>
    <div class="loader relative" v-if="viewLoader"><img src="../../src/assets/images/loading.gif" /></div>
  </b-modal>
</template>

<script lang="ts">

import {Component, Mixins, Prop} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";
import { ValidationProvider, ValidationObserver, extend  } from 'vee-validate';
import { required, email } from 'vee-validate/dist/rules';
import {http} from "@/httpCommon";

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
  public room_id  = 0
  public room_index = 0
  public ref = this.$refs as Record<any, any>
  private email  = '';
  public viewLoader = false

  public showContactPopup(room_id:number, room_index:number) {
    this.room_id = room_id
    this.room_index = room_index
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

  public async saveContact() {

    this.viewLoader = true
    await http.post("save/contact", {'email': this.email, room_id: this.room_id}).then((res: any) => {
      this.viewLoader = false
      if (res.status == 201){
        this.showToast('Your contact saved successfully.', 'SUCCESS');
        let payload = {'index':this.room_index, 'attribute':'contacts', value: res.data.data}
        this.$store.commit('SET_LOCKER_ATTRIBUTE', payload)
        this.email = '';
      }else{
        this.showError(res)
      }
    }).catch(err => {
      this.viewLoader = false
      if(err.response.status){
        this.showErrorArr(err.response.data.errors)
      }
    });

  }

  public async deleteContact(contact_id:number){

    this.viewLoader = true
    await http.post("delete/contact",
      {contact_id, room_id: this.room_id, _method:'DELETE'}).then((res: any) => {
      this.viewLoader = false
      if (res.status == 201){
        this.showToast('Your contact deleted successfully.', 'SUCCESS');
        let payload = {'index':this.room_index, 'attribute':'contacts', value: res.data.data}
        this.$store.commit('SET_LOCKER_ATTRIBUTE',payload)

      }else{
        this.showError(res)
      }
    }).catch(err => {
      this.viewLoader = false
      if(err.response.status){
        this.showErrorArr(err.response.data.errors)
      }
    });

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
