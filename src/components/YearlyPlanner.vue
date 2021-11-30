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
  <div v-if="event_view === 'month'" class="row">

    <div  :key="event.month" v-for="(event) in getEvents" class="col-lg-2">
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
            {{`${locker_event.event_day}  : ${locker_event.title}` }}</span>

         </li>
       </ul>

        <button class="btn btn-secondary" @click="showEventPopup">Add Event</button>
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
          <td>{{ locker_event.reminder.before_time | reminderTime(locker_event.reminder.before_time) }}</td>
        </tr>
      </table>
    </div>
  </div>
  <ContactModal ref="contactmodal"  :room_id="room_id" :room_index="room_index"   />
  <div class="row">
    <div class="col-lg-4">
      <button class="btn btn-secondary" @click="showEventPopup">Add Event</button>
      <button style="margin-left: 5px" class="btn btn-secondary" @click="showContactPopup">Add Contact</button>
    </div>
  </div>
</div>


</template>

<script lang="ts">

import {Component, Mixins, Prop} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";

import ContactModal from "@/components/ContactModal.vue";
import {getReminderOptions} from '@/helpers/Helpers';

@Component<YearlyPlanner>({
  components: {
    ContactModal
  },
  filters: {
    eventEmails: (value: string) => {
      return value ? JSON.parse(value).toString() : ''
    },
    reminderTime: (value: string) => {
      let options = getReminderOptions()
      return options.find((x:Record<any, any>) => x.value === value).text
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

  public showEventPopup(){
    const room_index = this.$store.getters.getActiveLockerIndex;
    this.$store.commit('SHOW_EVENT_POPUP', true)
    this.$store.commit('SET_LOCKER_INDEX_FOR_EVENT', room_index)
    this.$emit('init-event-contacts');
  }
  public showContactPopup(){
    this.ref['contactmodal'].showContactPopup()
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

  public changeEventView(view_type:string) {
    this.event_view = view_type
  }
}

</script>

<style lang="scss" scoped>
  .event_box {
    border: 1px solid rgba(0, 0, 0, 0.125) !important;
    border-radius: 0.25rem !important;
  }
  .event_box .card-header {
    padding: 0.75rem 1.25rem !important;
    margin-bottom: 0 !important;
    background-color: rgba(0, 0, 0, 0.03) !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.125) !important;
  }
  .event_box .border-secondary {
    border-color: #6c757d !important;
  }
  .calender_btn_inactive {
    color: black;
    background: white;
  }
  table, th, td {
    border:1px solid black;
  }
</style>
