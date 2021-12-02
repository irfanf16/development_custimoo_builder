<template>
  <b-modal size="lg" :visible="showEventPopup" hide-footer @hide="hideEventModal" modal-class="event_form" id="modal-center-event" centered scrollable
           title="Add Event" >
    <ValidationObserver v-slot="{handleSubmit }">
      <b-form @submit.prevent="handleSubmit(submitEvent)" >
    <div class="design-name-form">

        <div class="row">
        <div class="col-lg-8">

          <validation-provider rules="required" v-slot="{ errors }">
            <label for="inline-form-input-productname" class="w-100 d-block mb-1">Event title</label>
            <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">

              <b-input-group>
                <b-form-input v-model="event_data.title"></b-form-input>
              </b-input-group>

            </div>
            <span class="error">{{ errors[0] }}</span>
          </validation-provider>

          <validation-provider rules="required" vid="eventType" v-slot="{ errors }">
            <label for="inline-form-input-productname" class="w-100 d-block mb-1">Event type</label>
            <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
              <b-input-group>
                <b-form-select v-model="event_data.event_type" @change="setEventType"
                               :options="getEventTypes"></b-form-select>
              </b-input-group>
            </div>
            <span class="error">{{ errors[0] }}</span>
          </validation-provider>

          <validation-provider rules="required" v-slot="{ errors }">
            <label for="inline-form-input-productname" class="w-100 d-block mb-1">Event Due</label>
            <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
              <b-input-group>
                <date-picker :config="datepickerOptions" value="event_data.event_time"
                             v-model="event_data.event_time"></date-picker>
              </b-input-group>
            </div>
            <span class="error">{{ errors[0] }}</span>
          </validation-provider>

          <span>
            <label for="inline-form-input-productname" class="w-100 d-block mb-1">Event description</label>
            <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
              <b-input-group>
                <b-form-input v-model="event_data.description" ></b-form-input>
            </b-input-group>
            </div>
          </span>

        <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
          <b-input-group>
            <b-form-checkbox v-model="event_data.is_reminder"  :checked="event_data.is_reminder" ><span class="checked"></span> Send reminder</b-form-checkbox>
            <div v-if="event_data.is_reminder">
              <validation-provider rules="required" v-slot="{ errors }">
                <b-form-select  v-model="event_data.before_time" :options="getReminderOptions" ></b-form-select>
                <span class="error">{{ errors[0] }}</span>
              </validation-provider>
            </div >
          </b-input-group>
        </div>

          <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
            <b-input-group>
              <b-form-checkbox v-model="event_data.email_to_others" :checked="event_data.email_to_others"><span
                class="checked"></span> Send to reminders to others:
              </b-form-checkbox>

            </b-input-group>
            <div style="display: block" v-if="event_data.email_to_others">

              <div  v-for="(email, i) in event_data.to_emails" :key="i">
                <validation-provider rules="email" v-slot="{ errors }">
                <b-input-group>
                  <b-form-input @input="updateEmail($event, i)" :value="email"></b-form-input>
                    <a data-title="Delete contact" class="remove"
                       @click="deleteEmail(i)">
                      <font-awesome-icon
                        :icon="['fas', 'trash-alt']"/>
                    </a>
                 </b-input-group>
                  <span class="error">{{ errors[0] }}</span>
                </validation-provider>
              </div>



              <a data-title="Add contact" class="add" @click="addEmptyEmail">
                <BIconPlus/>
              </a>
            </div>
          </div>
        </div>

        <div class="col-lg-4" >
          <div class="event-img">
            <div class="design" v-if="event_data.event_type === 'design' ">
              <a class="remove" data-title="Delete file"
                 @click="deleteFile()" >
                <BIconX />
              </a>
              <img :src="file_data" style="width: 100%; max-width: 150px"  />
              <div class="file_name">
                <span>{{file_name}}</span>
              </div>
            </div>

            <div class="collection" v-else-if="event_data.event_type === 'collection' ">
              <a class="remove" data-title="Delete file"
                 @click="deleteFile()" >
                <BIconX />
              </a>
              <div class="image-holder">
                <div class="convas_container" :key="collection_product_index"
                     v-for="(collection_product,collection_product_index) in file_data">
                  <!--                            <b-form-checkbox v-model="selectedCollectionProducts" v-bind:value="collection.id"></b-form-checkbox>-->
                  <template v-if="collection_product_index < 3">
                    <img style="width: 100%; max-width: 150px" :src="collection_product.product_locker_room.product_url"
                         :class="collection_product.product_locker_room.product_url ? '' : 'placeholder'"
                         alt="">
                  </template>
                </div>
              </div>
              <div class="file_name mt-3">
                <span>{{file_name}}</span>
              </div>
            </div>

            <div class="custom" v-else-if="event_data.event_type === 'custom'" :style="{overflow: file_data ? 'visible': 'hidden', padding: file_data ? '15px 10px': '0'}">
              <a class="remove" v-if="file_data" @click="deleteFile">
                <BIconX />
              </a>

              <div class="modal-handler">

                  <label class="upload-box position-relative" >
                    <template v-if="file_data">
                      <div class="uploaded-logo-holder"   >
                        <img crossorigin="anonymous" :src="file_data" style="width: 100%; max-width: 150px"/>
                      </div>
                      <span class="file_name">{{file_name}}</span>
                    </template>

                    <div v-if="!file_data">
                      <div class="icon-holder fs-4">
                        <BIconImage />
                      </div>
                      <slot name="upload_text"><div class="fs-2 mt-1">Upload File</div></slot>

                      <validation-provider rules="required_if:eventType,custom|mimes:image/*" v-slot="{ errors }">
                        <input
                                type="file"
                                name="file" ref="fileInput"
                                @change="uploadEventImage"
                                class="fileLoader"
                                accept="image/*" />
                        <span class="error">{{ errors[0] }}</span>
                      </validation-provider>

                    </div>

                  </label>



                </div>
              </div>
          </div>
          <div class="row" style="margin-top:50px">
            <div class="col-lg-12">
              <b-input-group>
                <validation-provider rules="required" v-slot="{ errors }">
                  <b-form-select v-model="email_template_index" @change="setEventEmailTemplate"
                                 :options="getEmailTemplateOptions"></b-form-select>
                  <span class="error">{{ errors[0] }}</span>
                </validation-provider>
              </b-input-group>
              <b-button v-if="email_template_index !== null" v-b-modal.email-template-modal>Edit Template</b-button>
            </div>

<!--            <div class="col-lg-12">-->
<!--              <b-input-group>-->
<!--                <b-form-textarea v-model="event_data.email_content" placeholder="Description" class="w-100"></b-form-textarea>-->
<!--              </b-input-group>-->
<!--            </div>-->

          </div>
        </div>
        </div>

    </div>
      <div class="row">
        <div class="col-lg-12" style="text-align: right">
          <button type="button"  class="btn btn-secondary" @click="hideEventModal">Cancel</button>
          <button  type="submit" class="btn btn-secondary" style="margin-left: 5px;" >Save</button>
        </div>
      </div>

      </b-form>
    </ValidationObserver>

    <b-modal id="email-template-modal" title="Edit Email Template">
      <VueEditor v-model="event_data.email_content"  ></VueEditor>
    </b-modal>

  </b-modal>
</template>

<script lang="ts">

import {Component, Mixins, Prop, Vue} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";
import datePicker from 'vue-bootstrap-datetimepicker';
import { ValidationProvider, ValidationObserver, extend  } from 'vee-validate';
import { required, email, required_if, mimes } from 'vee-validate/dist/rules';
import { VueEditor } from "vue2-editor";

extend('required', {
  ...required,
  message: 'This field is required'
});
extend('required_if', {
  ...required_if,
  message: 'This field is required'
});
extend('email',{
  ...email,
  message: 'Provide a valid email address'
});
extend('mimes',{
  ...mimes,
  message: 'Please provide a valid image file'
});

@Component<EventModal>({
  components: {
    datePicker,
    ValidationObserver,
    ValidationProvider,
    VueEditor
 },
  mounted(){
    this.$store.dispatch('getEmailTemplates');
  }
})

export default class EventModal extends Mixins(ErrorMessages) {

  public ref = this.$refs as Record<any, any>
  public event_data: Record<any, any> = {
    locker_id:null,
    id: null,
    title: '',
    event_type: null,
    file_id: '',
    description: '',
    event_time: '',
    is_reminder: false,
    before_time: null,
    email_to_others: false,
    to_emails: [],
    email_template_id: null,
    email_content: '',
    file: null
  }
  public email_template_index:number = null
  public file_data: any = null
  public file_name: string = null

  public datepickerOptions:Record<any, any> = {
    format: 'YYYY-MM-DD hh:mm:ss',
    minDate: new Date(),
    icons: {
      time: 'far fa-clock',
      date: 'far fa-calendar',
      up: 'fas fa-arrow-up',
      down: 'fas fa-arrow-down',
      previous: 'fas fa-chevron-left',
      next: 'fas fa-chevron-right',
      today: 'fas fa-calendar-check',
      clear: 'far fa-trash-alt',
      close: 'far fa-times-circle'
    }
  }


  get showEventPopup() {
    return this.$store.getters.showEventPopup
  }

  public initEventContacts() {
    this.resetEventModal()
    this.event_data.to_emails = []
    const room_index = this.$store.getters.getLockerIndexForEvent;
    const lockerProducts = this.$store.getters.getLockerProducts;
    let contacts = lockerProducts[room_index].contacts;

    contacts.map((contact) => {
      this.event_data.to_emails.push(contact.email)
    })

  }

  public hideEventModal() {
    this.$store.commit('SHOW_EVENT_POPUP', false)
  }

  public showEventModal() {
    this.$store.commit('SHOW_EVENT_POPUP', true)
  }

  public updateEmail(email: string, index: number) {
    Vue.set(this.event_data.to_emails, index, email)
  }

  public addEmptyEmail() {
    this.event_data.to_emails.push('')
  }

  public deleteEmail(index:number) {
    this.event_data.to_emails.splice(index, 1);
  }

  get getEmailTemplateOptions(){
    return this.$store.getters.emailTemplateOptions;
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
    optionArray[0] = {value: null, text: 'Choose an option'}
    optionArray[1] = {value: 1440, text: '1 day before'}
    optionArray[2] = {value: 4320, text: '3 days before'}
    optionArray[3] = {value: 10080, text: '7 days before'}
    optionArray[3] = {value: 43200, text: '1 month before'}
    return optionArray;
  }

  public setEventType(e : string) {

    this.event_data.file_id = ''
    this.file_data = null
    this.file_name = null
    this.event_data.file = null

    if (e === 'design') {
      this.$store.commit('SET_SELECTION_MODE', {
        readonly: true,
        collectionAddmoreMode: false,
        eventProductMode: true,
        eventCollectionMode: false
      })
      this.hideEventModal()
    } else if (e === 'collection') {
      this.file_data = [];
      this.$store.commit('SET_SELECTION_MODE', {
        readonly: true,
        collectionAddmoreMode: false,
        eventProductMode: false,
        eventCollectionMode: true
      })
      this.hideEventModal()
    }


  }

  public setEventProduct(id: number, url:string, name: string) {
    this.event_data.file_id = id
    this.file_data = url
    this.file_name = name
    this.showEventModal();
    this.$store.commit('SET_SELECTION_MODE', {
      readonly: false,
      collectionAddmoreMode: false,
      eventProductMode: false,
      eventCollectionMode: false
    })
    let selected_locker_index = this.$store.getters.getLockerIndexForEvent;
    this.$emit('change-locker-tabindex', selected_locker_index)
  }

  public setEventCollection(collection_index: number) {

    let collection = this.$store.getters.getCollections[collection_index]
    this.event_data.file_id = collection.id
    this.file_data = collection.collection_products
    this.file_name = collection.name

    this.showEventModal();
    this.$store.commit('SET_SELECTION_MODE', {
      readonly: false,
      collectionAddmoreMode: false,
      eventProductMode: false,
      eventCollectionMode: false
    })
    let selected_locker_index = this.$store.getters.getLockerIndexForEvent;
    this.$emit('change-locker-tabindex', selected_locker_index)

  }

  public setEventEmailTemplate(index:any){
    if(index !== null){
      let template = this.$store.getters.getEmailTemplates[index];
      this.event_data.email_template_id = template.id
      this.event_data.email_content = template.content
    }else{
      this.event_data.email_template_id = null
      this.event_data.email_content = ''
    }
  }

  public deleteFile() {
    this.event_data.event_type = null
    this.event_data.file_id = ''
    this.file_data = null
    this.file_name = null
    this.event_data.file = null
  }

  public uploadEventImage(){
    this.event_data.file  = this.ref.fileInput.files[0] as Blob;
    this.file_data = URL.createObjectURL(this.event_data.file);
    this.file_name = this.event_data.file.name;
  }

  public async editEvent(event_id:number){
    let res = await this.$store.dispatch('getEventById', event_id)

    this.event_data.id = res.id
    this.event_data.title = res.title
    this.event_data.event_type = res.event_type
    this.event_data.description = res.description
    this.event_data.event_time = res.event_time

    if(res.is_reminder == 1){
      this.event_data.is_reminder = true
      this.event_data.before_time = res.reminder.before_time
    }

    if(res.to_emails !== null){
      this.event_data.email_to_others = true
      this.event_data.to_emails = JSON.parse(res.to_emails)
    }

    this.event_data.email_template_id = res.email_template_id
    this.event_data.email_content = res.email_content
    let emailTemplates = this.$store.getters.getEmailTemplates
    this.email_template_index = emailTemplates.map(function(eTemplate) {return eTemplate.id; }).indexOf(res.email_template_id);

    if(res.event_type == 'design'){

      this.event_data.file_id = res.file.file_id
      this.file_data = res.file.product_url
      this.file_name = res.file.product_name
    }else if(res.event_type == 'collection'){
      this.event_data.file_id = res.file.file_id
      this.file_data = res.file.collection_data.collection_products
      this.file_name = res.file.collection_data.name
    }else{
      this.file_data = res.file.product_url
    }


  }

  public async submitEvent(){

      let selected_locker_index = this.$store.getters.getLockerIndexForEvent;
      let selected_locker = this.$store.getters.getLockerProducts[selected_locker_index];
      this.event_data.locker_id = selected_locker.id

      let form = new FormData();
      for (const key in this.event_data) {
        if(key == 'to_emails'){
          for (var i = 0; i < this.event_data.to_emails.length; i++) {
            form.append('to_emails[]', this.event_data.to_emails[i]);
          }
        }else if(key == 'email_to_others' || key == 'is_reminder')
        {
          if(this.event_data[key]){
            form.append(key, 1);
          }else{
            form.append(key, 0);
          }
        }
      else{
          form.append(key, this.event_data[key]);
        }

      }

      let res;

      if (this.event_data.id === null) {
        res = await this.$store.dispatch('addEvent', form)
      }else{
        res = await this.$store.dispatch('updateEvent', form)
      }


      if (res.status) {
        this.showToast(res.message, 'SUCCESS')
        this.resetEventModal()
        this.hideEventModal()
        this.$store.dispatch('getLockerEvents',selected_locker.id)
      } else {
        this.showErrorArr(res.message)
      }

  }

  public resetEventModal(){
      this.event_data.title = ''
      this.event_data.id = null
      this.event_data.event_type =  null
      this.event_data.file_id =  ''
      this.event_data. description =  ''
      this.event_data.event_time =  ''
      this.event_data.is_reminder =  false
      this.event_data.before_time =  null
      this.event_data.email_to_others =  false
      this.event_data.to_emails =  []
      this.event_data.email_template_id =  null
      this.event_data.email_content =  ''
      this.event_data.file =  null
      this.email_template_index = null
      this.file_data = null
      this.file_name = null
  }

}

</script>

<style lang="scss">
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css");

.event_form{
  .modal-title{
    font-size: 1.5rem;
    font-weight: 500;
  }

  .error{
    color: lightcoral;
  }

  [class^=col-]{
    label{
      font-weight: 500;
    }

    &>span{
      display: block;

      &:not(:first-child){
        margin-top: 1rem;
      }
    }
  }
}

.event-img{
  display: flex;
  align-items: center;
  flex-direction: column;

  &>div{
    text-align: center;
    border: 1px solid #eee;
    padding: 10px;
    position: relative;
    border-radius: 7px;

    &.collection{
      .convas_container{
        &:nth-child(1){
          position: relative;
          left: -5px;
          top: -2.5px;
        }
        &:nth-child(2){
          position: absolute;
          left: 10px;
          top: 15px;
        }
        &:nth-child(3){
          position: absolute;
          left: 15px;
          top: 20px;
        }
      }
    }

    &.custom{
      width: 100%;
      min-height: 70px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;

      &:hover{
        background: #f5f5f5;
      }

      .upload-box{
        input[type=file]{
          top: -250px;
          left: -250px;
          opacity: 0;
          height: 500px;
          width: 500px;
          position: absolute;
          z-index: 1000;
          appearance: none;
        }
      }
    }

    .remove{
      display: flex;
      height: 20px;
      width: 20px;
      right: -10px;
      top: -10px;
      cursor: pointer;
      border-radius: 1000px;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      position: absolute;
      background: lightcoral;
      color: white;
    }

    .file_name{
      font-weight: 600;
      margin-top: 7px;
      font-size: 1rem;
      word-break: break-all;
    }
  }
}
</style>
