<template>
  <b-modal size="lg" :visible="showEventPopup" hide-footer @hide="hideEventModal" modal-class="event_form"
           id="modal-center-event" centered scrollable
           :title="event_data.id ? 'Edit Event' : 'Add Event' ">
    <ValidationObserver v-slot="{handleSubmit }">
      <b-form @submit.prevent="handleSubmit(submitEvent)">
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
                <b-form-input v-model="event_data.description"></b-form-input>
            </b-input-group>
            </div>
          </span>

              <div class="w-100 d-flex flex-wrap align-items-center justify-content-between mt-3"
                   style="min-height: 40px">
                <b-form-checkbox v-model="event_data.is_reminder" :checked="event_data.is_reminder"><span
                  class="d-inline-flex" style="padding-top: 2px">Send reminder</span></b-form-checkbox>

                <div v-if="event_data.is_reminder">
                  <validation-provider rules="required" v-slot="{ errors }">
                    <b-form-select v-model="event_data.before_time" :options="getReminders"></b-form-select>
                    <span class="error">{{ errors[0] }}</span>
                  </validation-provider>
                </div>
              </div>

              <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
                <b-input-group>
                  <b-form-checkbox v-model="event_data.email_to_others" :checked="event_data.email_to_others">
                    <span class="d-inline-flex" style="padding-top: 2px">Send reminder to others:</span>
                  </b-form-checkbox>

                </b-input-group>
                <div class="w-100 d-flex justify-content-start align-items-end gap-3" v-if="event_data.email_to_others">

                  <div class="w-100" v-if="event_data.to_emails && event_data.to_emails.length"
                       style="max-height: 200px; overflow-y: auto">
                    <div v-for="(email, i) in event_data.to_emails" :key="i">
                      <validation-provider rules="email" v-slot="{ errors }">
                        <b-input-group class="mt-3">
                          <b-form-input placeholder="Enter Email" @input="updateEmail($event, i)"
                                        :value="email"></b-form-input>
                          <b-input-group-append>
                            <b-button variant="danger" @click="deleteEmail(i)">
                              <BIconX/>
                            </b-button>
                          </b-input-group-append>
                        </b-input-group>
                        <div class="error">{{ errors[0] }}</div>
                      </validation-provider>
                    </div>
                  </div>

                  <div class="text-right mt-2">
                    <a data-title="Add contact"
                       class="btn btn-dark light rounded-circle light add fs-4 d-inline-flex align-items-center justify-content-center p-0"
                       style="height: 40px; width: 40px" @click="addEmptyEmail">
                      <BIconPlus/>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-4">
              <div class="event-img d-flex flex-column align-items-center justify-content-between"
                   style="height: calc(100% - 120px)">
                <div class="design" v-if="event_data.event_type === 'design' ">
                  <a class="remove" data-title="Delete file"
                     @click="deleteFile()">
                    <BIconX/>
                  </a>
                  <img :src="file_data" style="width: 100%; max-width: 150px"/>
                  <div class="file_name">
                    <span>{{ file_name }}</span>
                  </div>
                </div>

                <div class="collection" v-else-if="event_data.event_type === 'collection' ">
                  <a class="remove" data-title="Delete file"
                     @click="deleteFile()">
                    <BIconX/>
                  </a>
                  <div class="image-holder">
                    <div class="convas_container" :key="collection_product_index"
                         v-for="(collection_product,collection_product_index) in file_data">
                      <!--                            <b-form-checkbox v-model="selectedCollectionProducts" v-bind:value="collection.id"></b-form-checkbox>-->
                      <template v-if="collection_product_index < 3">
                        <img style="width: 100%; max-width: 150px"
                             :src="collection_product.product_locker_room.product_url"
                             :class="collection_product.product_locker_room.product_url ? '' : 'placeholder'"
                             alt="">
                      </template>
                    </div>
                  </div>
                  <div class="file_name mt-3">
                    <span>{{ file_name }}</span>
                  </div>
                </div>

                <div class="custom" v-else-if="event_data.event_type === 'custom'"
                     :style="{overflow: file_data ? 'visible': 'hidden', padding: file_data ? '15px 10px': '0'}">
                  <a class="remove" v-if="file_data" @click="deleteFile">
                    <BIconX/>
                  </a>

                  <div class="modal-handler">

                    <label class="upload-box position-relative">
                      <template v-if="file_data">
                        <div class="uploaded-logo-holder">
                          <img crossorigin="anonymous" :src="file_data" style="width: 100%; max-width: 150px"/>
                        </div>
                        <span class="file_name">{{ file_name }}</span>
                        <a style="display: block" v-if="is_file_download && event_data.id>0" target="_blank"
                           :href="file_data">Download File</a>
                      </template>

                      <div v-if="!file_data">
                        <div class="icon-holder fs-4">
                          <BIconImage/>
                        </div>
                        <slot name="upload_text">
                          <div class="fs-2 mt-1">Upload File</div>
                        </slot>

                        <!--                      <validation-provider rules="required_if:eventType,custom|ext:jpg,png,svg|size:2048" v-slot="{ errors }">-->
                        <validation-provider rules="required_if:eventType,custom|size:2048" v-slot="{ errors }">
                          <b-form-file
                            type="file"
                            name="file" ref="fileInput"
                            v-model="event_data.file"
                            @input="uploadEventImage"
                            class="fileLoader"
                            accept="image/*"></b-form-file>

                          <span class="error">{{ errors[0] }}</span>
                        </validation-provider>

                      </div>

                    </label>

                  </div>
                </div>
              </div>
              <div class="d-flex align-items-center gap-1">
                <b-input-group class="w-100">
                  <validation-provider rules="required" v-slot="{ errors }">
                    <b-form-select class="w-100" :disabled="!checkEmailTemplateDependency"
                                   v-model="email_template_index" @change="setEventEmailTemplate"
                                   :options="getEmailTemplateOptions"></b-form-select>
                    <span class="error">{{ errors[0] }}</span>
                  </validation-provider>
                </b-input-group>
                <b-button style="height: 40px; width: 40px; flex-shrink: 0;" variant="dark"
                          class="rounded-circle light fs-2 p-0 d-inline-flex align-items-center justify-content-center"
                          v-if="email_template_index !== null" v-b-modal.email-template-modal>
                  <BIconPencil/>
                </b-button>
              </div>

            </div>
          </div>

        </div>
        <div class="row">
          <div class="col-lg-12 d-flex gap-1 justify-content-end mt-4" style="text-align: right">
            <button type="button" class="btn light btn-secondary" @click="hideEventModal">Cancel</button>
            <button v-if="event_data.id" type="button" class="btn light btn-secondary" @click="deleteEvent">Delete
              event
            </button>
            <button type="submit" class="btn btn-secondary">Save</button>
          </div>
        </div>

      </b-form>
    </ValidationObserver>

    <b-modal id="email-template-modal" modal-class="edit_template" title="Edit Email Template">
      <VueEditor v-model="event_data.email_content"></VueEditor>
    </b-modal>
    <div class="loader relative" v-if="viewLoader"><img src="../../src/assets/images/loading.gif"/></div>
    <confirm-modal message="Do you really want to delete" cancel_text="Cancel" confirm_text="Yes"
                   ref="reset-modal"></confirm-modal>
  </b-modal>
</template>

<script lang="ts">

import {Component, Mixins, Prop, Vue, Watch} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";
import datePicker from 'vue-bootstrap-datetimepicker';
import {ValidationProvider, ValidationObserver, extend} from 'vee-validate';
import {required, email, required_if, ext, size} from 'vee-validate/dist/rules';
import {VueEditor} from "vue2-editor";
import {getReminderOptions} from '@/helpers/Helpers';
import ConfirmModal from "@/components/ConfirmModal.vue";
import {http} from "@/httpCommon";

extend('required', {
  ...required,
  message: 'This field is required'
});
extend('required_if', {
  ...required_if,
  message: 'This field is required'
});
extend('email', {
  ...email,
  message: 'Provide a valid email address'
});
extend('ext', {
  ...ext,
  message: 'Please provide a valid image file'
});
extend('size', {
  ...size,
  message: 'File size exceeded. '
});

@Component<EventModal>({
  components: {
    datePicker,
    ValidationObserver,
    ValidationProvider,
    VueEditor,
    ConfirmModal
  },
  mounted() {
    this.$store.dispatch('getEmailTemplates');
  }
})

export default class EventModal extends Mixins(ErrorMessages) {

  public ref = this.$refs as Record<any, any>
  public viewLoader = false
  public event_data: Record<any, any> = {
    locker_id: null,
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
  public email_template_index: number = null
  public file_data: any = null
  public file_name: string = null
  public is_file_download = false
  public selected_collection_pdf_link: string = null
  private storageUrl = process.env.VUE_APP_STORAGE_URL


  public datepickerOptions: Record<any, any> = {
    format: 'YYYY-MM-DD HH:mm:ss',
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

  //@Watch('checkEmailTemplateDependency')
  get checkEmailTemplateDependency() {
    let resp = true;
    if (!this.event_data.event_time) {
      resp = false
    } else if (this.event_data.event_type === null || this.file_data === null) {
      resp = false
    }
    if (!resp) {
      this.email_template_index = null
    }
    return resp
  }

  get showEventPopup() {
    return this.$store.getters.showEventPopup
  }

  public initEventContacts(selected_month: number) {
    this.resetEventModal()
    this.event_data.to_emails = []
    const room_index = this.$store.getters.getLockerIndexForEvent;
    const lockerProducts = this.$store.getters.getLockerProducts;
    let contacts = lockerProducts[room_index].contacts;

    contacts.map((contact) => {
      this.event_data.to_emails.push(contact.email)
    })

    if (selected_month > 0) {
      var today = new Date();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      let year = this.$store.getters.getSelectedYear
      let date
      if (selected_month === (today.getMonth() + 1) && year === today.getFullYear()) {
        date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      } else {
        date = year + '-' + selected_month + '-01';
      }
      this.event_data.event_time = date + ' ' + time;
    }

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

  public deleteEmail(index: number) {
    this.event_data.to_emails.splice(index, 1);
  }

  get getEmailTemplateOptions() {
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

  get getReminders() {
    return getReminderOptions()
  }

  public userTimeZone() {
    var timezone_offset_min = new Date().getTimezoneOffset(),
      offset_hrs = parseInt(Math.abs(timezone_offset_min / 60)),
      offset_min = Math.abs(timezone_offset_min % 60),
      timezone_standard;

    if (offset_hrs < 10)
      offset_hrs = '0' + offset_hrs;

    if (offset_min < 10)
      offset_min = '0' + offset_min;

    if (timezone_offset_min < 0)
      timezone_standard = '+' + offset_hrs + ':' + offset_min;
    else if (timezone_offset_min > 0)
      timezone_standard = '-' + offset_hrs + ':' + offset_min;
    else if (timezone_offset_min == 0)
      timezone_standard = 'Z';

    return timezone_standard

  }

  public setEventType(e: string) {

    this.event_data.file_id = ''
    this.file_data = null
    this.file_name = null
    this.event_data.file = null
    this.is_file_download = false

    if (e === 'design') {
      this.$store.commit('SET_SELECTION_MODE', {
        readonly: true,
        collectionAddmoreMode: false,
        eventProductMode: true,
        eventCollectionMode: false
      })
      this.hideEventModal()
    } else if (e === 'collection') {
      let collections = this.$store.getters.getCollections
      if (collections && collections.length > 0) {
        this.file_data = [];
        this.$store.commit('SET_SELECTION_MODE', {
          readonly: true,
          collectionAddmoreMode: false,
          eventProductMode: false,
          eventCollectionMode: true
        })
        this.hideEventModal()
      } else {
        this.showToast('No collection found in locker.', 'Error')
        this.event_data.event_type = null;
      }

    }
  }

  public setEventProduct(id: number, url: string, name: string) {
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
    this.replaceEmailContentTags();
  }

  public setEventCollection(collection_index: number) {

    let collection = this.$store.getters.getCollections[collection_index]
    this.event_data.file_id = collection.id
    this.file_data = collection.collection_products
    this.file_name = collection.name
    this.selected_collection_pdf_link = collection.link

    this.showEventModal();
    this.$store.commit('SET_SELECTION_MODE', {
      readonly: false,
      collectionAddmoreMode: false,
      eventProductMode: false,
      eventCollectionMode: false
    })
    let selected_locker_index = this.$store.getters.getLockerIndexForEvent;
    this.$emit('change-locker-tabindex', selected_locker_index)
    this.replaceEmailContentTags();

  }

  public setEventEmailTemplate(index: any) {
    if (index !== null) {
      let template = this.$store.getters.getEmailTemplates[index];
      this.event_data.email_template_id = template.id
      this.event_data.email_content = template.content
      this.replaceEmailContentTags();
    } else {
      this.event_data.email_template_id = null
      this.event_data.email_content = ''
    }
  }

  public replaceEmailContentTags() {

    if (this.email_template_index !== null) {

      let template = this.$store.getters.getEmailTemplates[this.email_template_index];
      let email_content = template.content

      let selected_locker_index = this.$store.getters.getLockerIndexForEvent;
      let selected_locker = this.$store.getters.getLockerProducts[selected_locker_index]

      email_content = email_content.replace(/\|\|locker_name\|\|/g, selected_locker.room_name)
      email_content = email_content.replace(/\|\|due_date\|\|/g, this.event_data.event_time)
      email_content = email_content.replace(/\|\|description\|\|/g, this.event_data.description)

      let all_links = email_content.match(/{\|\|.*?\|\|}/g);
      if (all_links) {
        for (let link of all_links) {
          let link_text = link.substring(3, link.length - 3)

          let final_link = '';
          if (this.event_data.event_type === 'design') {
            final_link = `<a href="${this.file_data}" target="_blank">${link_text}</a>`
          } else if (this.event_data.event_type === 'collection') {
            final_link = `<a href="${this.storageUrl}${this.selected_collection_pdf_link}" >${link_text}</a>`
          } else {
            final_link = `<a href="{uploaded_file_link}" target="_blank">${link_text}</a>`
          }
          email_content = email_content.replace(link, final_link);
        }
      }
      this.event_data.email_content = email_content
    }
  }

  public deleteFile() {
    this.event_data.file_id = ''
    this.file_data = null
    this.file_name = null
    this.event_data.file = null
    this.is_file_download = false
    if(this.event_data.event_type === 'design' || this.event_data.event_type === 'collection'){
      this.setEventType(this.event_data.event_type)
    }
  }

  public uploadEventImage() {
    //comment ext check code temporarily
    //let extensions = ["jpg","png","jpeg","gif","svg","ai","eps","pdf","csv","xlxx",'doc','docs'];
    let event_data_file = this.event_data.file as Blob;

    // let ext = event_data_file.name.split('.').pop();
    // ext = (ext == event_data_file.name)? "" : ext;
    //  console.log(ext)

    //if(extensions.indexOf(ext) !== -1 && (event_data_file.size/1024) <= 2048){
    if ((event_data_file.size / 1024) <= 2048) {
      this.file_name = event_data_file.name;
      this.file_data = URL.createObjectURL(this.event_data.file);
    }
    this.replaceEmailContentTags();
  }

  public async editEvent(event_id: number) {
    this.resetEventModal()
    this.viewLoader = true

    let res = await http.get(`events/${event_id}`).then(async (response) => {
      if (response.status == 200) {
        return response.data
      } else {
        return null
      }
    })

    if (res) {

      this.event_data.id = res.id
      this.event_data.title = res.title
      this.event_data.event_type = res.event_type
      this.event_data.description = res.description
      this.event_data.event_time = res.event_time

      if (res.is_reminder == 1) {
        this.event_data.is_reminder = true
        this.event_data.before_time = res.reminder.before_time
      }

      if (res.to_emails !== null) {
        this.event_data.email_to_others = true
        this.event_data.to_emails = JSON.parse(res.to_emails)
      }

      this.event_data.email_template_id = res.email_template_id
      this.event_data.email_content = res.email_content
      let emailTemplates = this.$store.getters.getEmailTemplates
      this.email_template_index = emailTemplates.map(function (eTemplate) {
        return eTemplate.id;
      }).indexOf(res.email_template_id);

      if (res.event_type == 'design') {

        this.event_data.file_id = res.file.file_id
        this.file_data = res.file.product_url
        this.file_name = res.file.product_name
      } else if (res.event_type == 'collection') {
        this.event_data.file_id = res.file.file_id
        this.file_data = res.file.collection_data.collection_products
        this.file_name = res.file.collection_data.name
      } else {
        this.file_data = res.file.product_url
        this.file_name = res.file.product_url.substring(res.file.product_url.lastIndexOf('/') + 1);
        this.is_file_download = true
      }

    } else {
      this.showToast('Event not found', 'Error')
    }
    this.viewLoader = false

  }

  public async submitEvent() {

    let selected_locker_index = this.$store.getters.getLockerIndexForEvent
    let selected_locker = this.$store.getters.getLockerProducts[selected_locker_index]
    this.event_data.locker_id = selected_locker.id
    this.event_data.event_timezone = this.userTimeZone();


    let form = new FormData()
    for (const key in this.event_data) {
      if (key == 'to_emails') {
        for (var i = 0; i < this.event_data.to_emails.length; i++) {
          form.append('to_emails[]', this.event_data.to_emails[i])
        }
      } else if (key == 'email_to_others' || key == 'is_reminder') {
        if (this.event_data[key]) {
          form.append(key, 1);
        } else {
          form.append(key, 0);
        }
      } else {
        form.append(key, this.event_data[key]);
      }

    }

    let url, res_msg;
    if (this.event_data.id === null) {
      url = 'events/create'
    } else {
      url = 'events/update'
    }

    this.viewLoader = true
    await http.post(url, form, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(async (res) => {

      this.viewLoader = false
      if (res.status == 200) {
        this.showToast(res.data.message, 'SUCCESS')
        await this.$store.dispatch('getLockerEvents', selected_locker.id)
        this.resetEventModal()
        this.hideEventModal()
        let active_tab = 4;
        let collections = this.$store.getters.getCollections
        if (collections && collections.length < 1) {
          active_tab = 3
        }
        this.$emit('yearlyPlannerTab', selected_locker.id)
      } else if (res.status == 401) {
        this.showErrorArr("Event not added")
      }
    }).catch(err => {
      this.viewLoader = false
      if (err.response.status) {
        this.showErrorArr(err.response.data.errors)
      }
    })


  }

  public resetEventModal() {
    this.event_data.title = ''
    this.event_data.id = null
    this.event_data.event_type = null
    this.event_data.file_id = ''
    this.event_data.description = ''
    this.event_data.event_time = ''
    this.event_data.is_reminder = false
    this.event_data.before_time = null
    this.event_data.email_to_others = false
    this.event_data.to_emails = []
    this.event_data.email_template_id = null
    this.event_data.email_content = ''
    this.event_data.file = null
    this.email_template_index = null
    this.file_data = null
    this.file_name = null
  }

  public async deleteEvent() {
    try {
      const ok = await this.ref['reset-modal'].showConfirm()
      if (ok) {
        let selected_locker_index = this.$store.getters.getLockerIndexForEvent;
        let selected_locker = this.$store.getters.getLockerProducts[selected_locker_index];
        this.viewLoader = true
        let res = await this.$store.dispatch('deleteEvent', this.event_data.id)
        await this.$store.dispatch('getLockerEvents', selected_locker.id)
        this.resetEventModal()
        this.hideEventModal()
        this.viewLoader = false
        this.showToast(res.data.message, 'SUCCESS')
      }
    } catch (e) {
      console.log('e', e)
      this.showError(e.response.data.message)

    }
  }

}

</script>

<style lang="scss">
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css");

.event_form {
  .modal-title {
    font-size: 1.5rem;
    font-weight: 500;
  }

  .error {
    color: lightcoral;
  }

  [class^=col-] {
    label {
      font-weight: 500;
    }

    & > span {
      display: block;

      &:not(:first-child) {
        margin-top: 1rem;
      }
    }
  }
}

.design-name-form {
  label {
    font-weight: 600 !important;
  }
}

.event-img {
  display: flex;
  align-items: center;
  flex-direction: column;

  & > div {
    text-align: center;
    border: 1px solid #eee;
    padding: 10px;
    position: relative;
    border-radius: 7px;

    &.collection {
      .convas_container {
        &:nth-child(1) {
          position: relative;
          left: -5px;
          top: -2.5px;
        }

        &:nth-child(2) {
          position: absolute;
          left: 10px;
          top: 15px;
        }

        &:nth-child(3) {
          position: absolute;
          left: 15px;
          top: 20px;
        }
      }
    }

    &.custom {
      width: 100%;
      min-height: 70px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;

      &:hover {
        background: #f5f5f5;
      }

      .upload-box {
        input[type=file] {
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

    .remove {
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

    .file_name {
      font-weight: 600;
      margin-top: 7px;
      font-size: 1rem;
      word-break: break-all;
    }
  }
}

.input-group {
  .input-group-append {
    .btn {
      border-top-right-radius: 0.25rem !important;
      border-bottom-right-radius: 0.25rem !important;
    }
  }
}

.edit_template {
  .modal-header {
    h5 {
      font-size: 1.5rem;
      font-weight: 500;
    }
  }
}

.loader {
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
  background: rgba(255, 255, 255, 0.9);
  z-index: 1030;

  img {
    max-width: 7%;
    display: block;
    margin: 0 auto;
    height: auto;
  }
}
</style>
