import { Module } from "vuex";
import {http} from "@/httpCommon";
import {Vue} from "vue-property-decorator";
const Event:Module<any, any> = {
  state: {
    locker_index_for_event :0,
    show_event_popup:false,
    locker_events:[],
    selected_year: 2021,
    emailTemplates: []
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
    getEmailTemplates(state:Record<any, any>){
      return state.emailTemplates
    },
    getLockerIndexForEvent(state:Record<any, any>){
      return state.locker_index_for_event
    }
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

