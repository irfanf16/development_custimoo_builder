import { Module } from "vuex";
import {http} from "@/httpCommon";
import {Vue} from "vue-property-decorator";

const d = new Date();
const selected_year: string = d.getFullYear();

const Event:Module<any, any> = {
  state: {
    locker_index_for_event :0,
    show_event_popup:false,
    locker_events:[],
    selected_year: selected_year,
    emailTemplates: [],
    yearlyPlannerTemplates:[]
  },
  getters: {
    showEventPopup(state:Record<any, any>){
      return state.show_event_popup
    },

    getSelectedYear(state:Record<any, any>){
      return state.selected_year;
    },
    getEvents(state:Record<any, any>) {
      return state.locker_events
    },
    emailTemplateOptions(state:Record<any, any>){
      const optionArray = [];
      optionArray[0] = {value: null, text: 'Select an email template'}
      state.emailTemplates.map(function (obj:Record<any, any>, index:number){
        optionArray.push({value: index, text: obj.title});
      })
      return optionArray;
    },
    yearlyPlannerTemplateOptions(state:Record<any, any>){
      const optionArray = [];
      optionArray[0] = {value: null, text: 'Create yearly planner from template'}
      const state_arr = JSON.parse(JSON.stringify(state.yearlyPlannerTemplates))
      state_arr.map(function (obj:Record<any, any>, index:number){
        optionArray.push({value: obj.id, text: obj.name});
      })
      return optionArray;
    },
    getEmailTemplates(state:Record<any, any>){
      return state.emailTemplates
    },
    getLockerIndexForEvent(state:Record<any, any>){
      return state.locker_index_for_event
    },
    monthlyEvents: state => (month:string) => {
      return state.locker_events.find((event:Record<any, any>) => month == event.month)
    },
  },
  mutations: {
    SHOW_EVENT_POPUP(state:Record<any, any>, paylod:boolean){
      state.show_event_popup = paylod;
    },
    SET_LOCKER_INDEX_FOR_EVENT(state:Record<any, any>, paylod:number){
      state.locker_index_for_event = paylod;
    },
    SET_LOCKER_EVENTS(state:Record<any, any>, payload:Record<any, any>){
      state.locker_events = payload
    },
    SET_YEAR(state:Record<any, any>, payload:number){
      state.selected_year = payload
    },
    SET_EMAIL_TEMPLATES(state:Record<any, any>, paylod:number){
      state.emailTemplates = paylod;
    },
    SET_EVENT_TEMPLATES(state:Record<any, any>, paylod:number){
      state.yearlyPlannerTemplates = paylod;
    }
  },
  actions: {
    getEmailTemplates({commit}){
      http.get("get-email-templates?type=event").then((res) =>{
        if (res.status == 200){
          commit('SET_EMAIL_TEMPLATES', res.data);
        }
      })
    },
    getYearlyPlannerTemplates({commit}){
      http.get("yearly-planner-templates").then((res) =>{
        if (res.status == 200){
          commit('SET_EVENT_TEMPLATES', res.data);
        }
      })
    },
    async deleteEvent({commit}, paylod: Record<any, any>) {
      return await http.post("events/delete", {id:paylod})
    },
    async getLockerEvents({commit,state},room_id:number){
      return  await http.get(`events/locker?year=${state.selected_year}&room_id=${room_id}`).then(async (res) => {
        if (res.status == 200){
          await commit('SET_LOCKER_EVENTS', res.data)
          return res.data
        }
      })
    },

    async setYear({commit}, payload: number) {
      commit('SET_YEAR', payload);
    },
    async copyEvents({commit}, payload){
      return await http.post("events/copy", payload)
    },

  }
}
export default Event;

