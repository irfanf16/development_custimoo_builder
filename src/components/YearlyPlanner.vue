<template>
<div>

<div class="row">
  <div class="col">
    <b-icon-arrow-left @click="changeYear('minus')"></b-icon-arrow-left>
    <h3 style="font-weight: bold;display: inline-block;padding:10px">{{this.getSelectedYear}}</h3>
    <b-icon-arrow-right @click="changeYear('add')"></b-icon-arrow-right>
  </div>
  <div class="">
    <button class="mr-3 btn btn-secondary" v-bind:class="{ 'calender_btn_inactive': event_view === 'list' }" @click="changeEventView('month')">Monthly View</button>
    <button class="mr-3 btn btn-secondary" v-bind:class="{ 'calender_btn_inactive': event_view === 'month' }" @click="changeEventView('list')">List View</button>

  </div>
</div>
  <div v-if="event_view === 'month'" class="row mt-3">
    <div  :key="event.month" v-for="(event) in getEvents" class="col-md-4 col-lg-3 col-xl-2">
      <b-card
        :header="event.month"
        header-border-variant="secondary"
        tag="article"
        style="max-width: 20rem;"
        class="mb-2 event_box"
      >
       <ul>
         <li :key="locker_event.id" v-for="(locker_event) in event.events">
           <span>
             <a data-title="Edit Event"
                @click="$emit('edit-event',locker_event.id)">
             <font-awesome-icon
               :icon="['fas', 'edit']"/>
           </a>
          </span>
           <div v-if="view_emails">
             <span style="display: block" :key="index" v-for="(email, index) in getEventEmails(locker_event.to_emails) ">
               <strong>{{email}}</strong>
             </span>
           </div>
           <span v-else> {{`${locker_event.event_day}  : ${locker_event.title}` }}</span>
         </li>
       </ul>
        <button v-if="event.add_event" class="btn btn-secondary" @click="showEventPopup">Add Event</button>
      </b-card>
    </div>

  </div>

  <div v-else class="row">
    <div :key="event.month" v-for="(event) in getEvents" class="col-lg-12">
      <h2 style="font-weight: bold;display: inline-block;padding:10px">{{event.month}}</h2>
      <table :key="locker_event.id" v-for="(locker_event) in event.events" style="width:30%">
        <tr>
          <td>{{locker_event.event_time}}</td>
          <td>{{locker_event.title}}</td>
          <td>{{ locker_event.to_emails | eventEmails(locker_event.to_emails) }}</td>
          <td>{{ locker_event.reminder | reminderTime(locker_event.reminder) }}</td>
          <td>  <a data-title="Edit Event"
                   @click="$emit('edit-event',locker_event.id)">
            <font-awesome-icon
              :icon="['fas', 'edit']"/>
          </a></td>
          <td>  <a data-title="Delete Event"
                   @click="deleteEvent(locker_event.id)">
            <font-awesome-icon
              :icon="['fas', 'trash-alt']"/>
          </a></td>
        </tr>
      </table>
    </div>
  </div>
  <ContactModal ref="contactmodal"  :room_id="room_id" :room_index="room_index"   />
  <SelectYear ref="selectYearModal"  :room_id="room_id" :room_index="room_index"   />
  <div class="row">
    <div v-if="!view_emails" class="col-lg-4">
      <button class="btn btn-secondary" @click="showEventPopup">Add Event</button>
      <button style="margin-left: 5px" class="btn btn-secondary" @click="showContactPopup">Add Contact</button>
      <button style="margin-left: 5px" class="btn btn-secondary" @click="showEmail">Show Emails</button>
      <button style="margin-left: 5px" class="btn btn-secondary" @click="openYearModal">Copy all events to another year</button>
    </div>
    <div v-else class="col-lg-4">
      <button style="margin-left: 5px" class="btn btn-secondary" @click="showEmail">Show event details</button>
    </div>
  </div>
  <div class="loader relative" v-if="viewLoader"><img src="../../src/assets/images/loading.gif" /></div>
  <confirm-modal message="Do you really want to delete" cancel_text="Cancel" confirm_text="Yes"
                 ref="reset-modal"></confirm-modal>
</div>


</template>

<script lang="ts">

import {Component, Mixins, Prop} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";

import ContactModal from "@/components/ContactModal.vue";
import {getReminderOptions} from '@/helpers/Helpers';
import ConfirmModal from "@/components/ConfirmModal.vue";
import SelectYear from "@/components/SelectYear.vue";

@Component<YearlyPlanner>({
  components: {
    SelectYear,
    ContactModal,
    ConfirmModal
  },
  filters: {
    eventEmails: (value: string) => {
      return value ? JSON.parse(value).toString() : 'none'
    },
    reminderTime: (reminder: Record<any, any>) => {
      if(reminder) {
        let options = getReminderOptions()
        let text =  options.find((x:Record<any, any>) => x.value === reminder.before_time)
        return text ? text.text : 'none'
      }
      return 'none'
    }
  },
  async mounted() {
     //  let res =  this.$store.dispatch('getLockerEvents')
     // console.log('res',res)
  }
})

export default class YearlyPlanner extends Mixins(ErrorMessages) {
  @Prop({required: true}) readonly room_id !: number
  @Prop({required: true}) readonly room_index !: number
  public ref = this.$refs as Record<any, any>
  public event_view = 'month'
  public viewLoader = false
  public view_emails = false

  public showEventPopup(){
    const room_index = this.$store.getters.getActiveLockerIndex;
    this.$store.commit('SHOW_EVENT_POPUP', true)
    this.$store.commit('SET_LOCKER_INDEX_FOR_EVENT', room_index)
    this.$emit('init-event-contacts');
  }
  public showContactPopup(){
    this.ref['contactmodal'].showContactPopup()
   }
  public openYearModal(){
    this.ref['selectYearModal'].showPopup()
  }

   public async changeYear(type:string) {
     let year = this.$store.getters.getSelectedYear
     year = (type == 'add') ? year + 1 : year - 1
      await this.$store.dispatch('setYear',year)
     this.$emit('getLockerEvents',this.room_id)
   }

  get getEvents() {
    return this.$store.getters.getEvents;
  }
  get getSelectedYear() {
    return this.$store.getters.getSelectedYear;
  }
  public getEventEmails(value: string) {
    return value ? JSON.parse(value) : []
  }
  public changeEventView(view_type:string) {
    this.event_view = view_type
  }
  public async deleteEvent(event_id:number) {
    try {
      const ok = await this.ref['reset-modal'].showConfirm()
      if (ok) {
        this.viewLoader = true
        let res = await this.$store.dispatch('deleteEvent',event_id)
        await this.$emit('getLockerEvents',this.room_id)
        this.viewLoader = false
        this.showToast(res.data.message,'SUCCESS')
      }
    }
    catch (e) {
      console.log('e',e)
      this.showError(e.response.data.message)
    }
  }
  public showEmail() {
    this.view_emails  = !this.view_emails
  }
}

</script>

<style lang="scss" scoped>
  .event_box {
    border: 1px solid rgba(0, 0, 0, 0.125) !important;
    border-radius: 0.25rem !important;

    .card-header {
      padding: 0.75rem 1.25rem !important;
      margin-bottom: 0 !important;
      font-weight: 500;
      font-size: 1rem;
      background-color: rgba(0, 0, 0, 0.03) !important;
      border-bottom: 1px solid rgba(0, 0, 0, 0.125) !important;
    }

    .card-body{
      padding-top: 0.5rem;
    }
  }
  //.event_box .border-secondary {
  //  border-color: #6c757d !important;
  //}
  .calender_btn_inactive {
    color: black;
    background: white;
  }
  table, th, td {
    border:1px solid black;
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
