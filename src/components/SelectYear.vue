<template>
  <b-modal ref="year-modal" @hide="hideModal" hide-footer id="modal-center-contact" centered scrollable
           title="Copy events to another year">
    <div class="design-name-form">

      <ValidationObserver v-slot="{ handleSubmit}">
        <b-form @submit.prevent="handleSubmit(copyEvents)" >
        <div class="row" style="padding: 10px">
          <validation-provider rules="required"  v-slot="{ errors }">
            <label  class="w-100 d-block mb-1">Select Year</label>
            <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
              <b-input-group>
                <b-form-select v-model="selectedYear"
                               :options="getYears"></b-form-select>
              </b-input-group>
            </div>
            <span style="color: red" class="error">{{ errors[0] }}</span>
          </validation-provider>
         </div>
        <div class="row">
          <div class="col-lg-12" style="text-align: right">
            <button type="button"  class="btn btn-secondary" @click="hideModal">Cancel</button>
            <button  type="submit" class="btn btn-secondary" style="margin-left: 5px;" >Copy Events</button>
          </div>
        </div>
      </b-form>
      </ValidationObserver>
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

@Component<SelectYear>({
  components: {
    ValidationObserver,
    ValidationProvider
  }
})

export default class SelectYear extends Mixins(ErrorMessages) {
  @Prop({required: true}) readonly room_id !: number
  @Prop({required: true}) readonly room_index !: number
  public ref = this.$refs as Record<any, any>
  public selectedYear = null
  public viewLoader = false

  public showPopup() {
    this.ref['year-modal'].show()
  }

  public hideModal() {
    this.ref['year-modal'].hide()
  }

  get getContacts(){

    const lockerProducts = this.$store.getters.getLockerProducts;
    let contacts = lockerProducts[this.room_index].contacts;
    return contacts;
 }

  get getYears() {
    let optionArray = [];
    let cur_year = new Date().getFullYear()
    optionArray.push({
      value: null,
      text: 'Select Year'
    })
    for(let i = 0; i < 5; i++) {
      cur_year++
      optionArray.push({
        value: cur_year,
        text: cur_year
      })
    }
    return optionArray;
  }

  public async copyEvents(){

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
