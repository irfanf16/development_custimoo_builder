<template>
  <b-modal :visible="showEventPopup" @hide="hideEventModal"  @show="initEventModal"  hide-footer id="modal-center-event" centered scrollable
           title="Add Event" >
    <div class="design-name-form">
      <b-form>
        <div class="row">
        <div class="col-lg-8">

        <label for="inline-form-input-productname" class="w-100 d-block mb-2">Event type</label>
        <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
          <b-input-group>
            <b-form-select v-model="event_data.event_type" @change="setEventType" :options="getEventTypes"></b-form-select>
          </b-input-group>
        </div>

        <label for="inline-form-input-productname" class="w-100 d-block mb-2">Event Due</label>
        <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
          <b-input-group>
            <date-picker value="event_data.event_time" v-model="event_data.event_time" ></date-picker>
          </b-input-group>
        </div>

        <label for="inline-form-input-productname" class="w-100 d-block mb-2">Event description</label>
        <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
          <b-input-group>
            <b-form-input v-model="event_data.description" ></b-form-input>
        </b-input-group>
        </div>

        <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
          <b-input-group>
            <b-form-checkbox v-model="event_data.is_reminder"  :checked="event_data.is_reminder" ><span class="checked"></span> Send reminder</b-form-checkbox>
            <b-form-select v-if="event_data.is_reminder" v-model="event_data.before_time" :options="getReminderOptions" ></b-form-select>
          </b-input-group>
        </div>

        <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
          <b-input-group>
            <b-form-checkbox v-model="event_data.email_to_others"  :checked="event_data.email_to_others" ><span class="checked"></span> Send to reminders to others: </b-form-checkbox>

          </b-input-group>
          <div style="display: block" v-if="event_data.email_to_others">
            <b-input-group v-for="(email, i) in event_data.to_emails" :key="i">
              <b-form-input @input="updateEmail($event, i)" :value="email"></b-form-input>
              <a data-title="Delete contact" class="remove"
               @click="deleteEmail(i)" ><font-awesome-icon
                :icon="['fas', 'trash-alt']"/></a>
            </b-input-group>

            <a data-title="Add contact" class="add" @click="addEmptyEmail"
            ><BIconPlus/></a>
          </div>
        </div>
        </div>

        <div class="col-lg-4">
          <div class="img-thumbnail" style="height: 100px">
            <img src=""  />
          </div>

        </div>
        </div>

      </b-form>
    </div>
  </b-modal>
</template>

<script lang="ts">

import {Component, Mixins, Prop, Vue} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";
import datePicker from 'vue-bootstrap-datetimepicker';

@Component<EventModal>({
  components: {
    datePicker

  }
})

export default class EventModal extends Mixins(ErrorMessages) {

  public ref = this.$refs as Record<any, any>
  public event_data : Record<any, any> = {
    id: '',
    event_type: null,
    file_id: '',
    title: '',
    description: '',
    event_time: '',
    is_reminder: false,
    before_time: 0,
    email_to_others: false,
    to_emails: [],
    email_template_id: '',
    email_content: '',
  }

  get showEventPopup(){
    return this.$store.getters.showEventPopup
  }

  public initEventModal() {

    this.event_data.to_emails = []
    const room_index = this.$store.getters.getActiveLockerIndex;
    const lockerProducts = this.$store.getters.getLockerProducts;
    let contacts = lockerProducts[room_index].contacts;

    contacts.map( (contact) => {
      this.event_data.to_emails.push(contact.email)
   })

  }

  public hideEventModal() {
    this.$store.commit('SHOW_EVENT_POPUP', false)
  }

  public updateEmail(email, index){
    Vue.set(this.event_data.to_emails, index, email)
  }

  public addEmptyEmail(){
    this.event_data.to_emails.push('')
  }
  public deleteEmail(index){
    this.event_data.to_emails.splice(index, 1);
  }


  get getEventTypes() {

    let optionArray: Array = [];
    optionArray[0] = {value: null, text: 'Choose an event type'}
    optionArray[1] = {value: 'design', text: 'Design'}
    optionArray[2] = {value: 'collection', text: 'Collection'}
    optionArray[3] = {value: 'custom', text: 'Custom event'}
    return optionArray;
  }
  get getReminderOptions() {

    let optionArray: Array = [];
    optionArray[0] = {value: 0, text: 'Choose an option'}
    optionArray[1] = {value: 1440, text: '1 day before'}
    optionArray[2] = {value: 4320, text: '3 days before'}
    optionArray[3] = {value: 10080, text: '7 days before'}
    optionArray[3] = {value: 43200, text: '1 month before'}
    return optionArray;
  }

  public setEventType(e){

    if(e === 'design'){
      this.$store.commit('SET_SELECTION_MODE',{
        readonly:true,
        collectionAddmoreMode:false,
        eventProductMode:true,
        eventCollectionMode:false
      })
      this.hideEventModal()
    }else if(e === 'collection'){
      this.$store.commit('SET_SELECTION_MODE',{
        readonly:true,
        collectionAddmoreMode:false,
        eventProductMode:false,
        eventCollectionMode:true
      })
      this.hideEventModal()
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

</style>
