import { Module } from "vuex";
import {http} from "@/httpCommon";
import {Vue} from "vue-property-decorator";
const Event:Module<any, any> = {
  state: {
    locker_index_for_event :0,
    show_event_popup:false
  },
  getters: {
    showEventPopup(state:Record<any, any>){
      return state.show_event_popup
    }
  },
  mutations: {
    SHOW_EVENT_POPUP(state:Record<any, any>, paylod:boolean){
      state.show_event_popup = paylod;
    },
    SET_LOCKER_INDEX_FOR_EVENT(state:Record<any, any>, paylod:number){
      state.locker_index_for_event = paylod;
    }

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
    }

  }
}
export default Event;

