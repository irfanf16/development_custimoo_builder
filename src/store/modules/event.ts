import { Module } from "vuex";
import {http} from "@/httpCommon";
import {Vue} from "vue-property-decorator";
const Event:Module<any, any> = {
  state: {
    locker_index_for_event :0,
    show_event_popup:false,
    locker_events:[],
    selected_year: 2021,
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

  },
  actions: {
    async addEvent({commit}, paylod: number) {
      await http.get("style/information/" + paylod).then((res: any) => {
        commit('SET_MODELS', res.data);
      });
    },
    async saveContact({commit}, paylod: Record<any, any>) {
      const res = await http.post("save/contact", paylod).then((res: any) => {
       return res;
      });
      return res;
    },
    async deleteContact({commit}, paylod: Record<any, any>) {
      const res = await http.post("delete/contact", paylod).then((res: any) => {
       return res;
      });
      return res;
    },
    async getLockerEvents({commit,state},room_id:number){
      console.log('state.selected_year',state.selected_year)
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

  }
}
export default Event;

