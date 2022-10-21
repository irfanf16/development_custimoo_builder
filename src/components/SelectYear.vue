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
    <div class="loader relative" v-if="viewLoader"><img src="../../src/assets/images/loading.gif" /></div>
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

  public async copyEvents() {
    try {
      const payload = {
        'to_year': this.selectedYear,
        'from_year': this.$store.getters.getSelectedYear,
        'room_id': this.room_id
      }
      this.viewLoader = true

      let res = await this.$store.dispatch('copyEvents', payload)
      await this.$store.dispatch('setYear',this.selectedYear)
      await this.$store.dispatch('getLockerEvents',this.room_id)
      this.viewLoader = false
      this.showToast('Events copied successfully.', 'success');
      this.hideModal()
      this.selectedYear = null;
    } catch (e) {
      this.viewLoader = false
      if (e.response)
        this.showError(e.response.data.message)
      else
        this.showError(e)
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
.loader{
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  background: rgba(255,255,255,0.9);
  z-index: 1030;
  img{
    max-width: 7%;
    display: block;
    margin: 0 auto;
    height: auto;
  }
}
</style>
