import { Module } from "vuex";
const Useage:Module<any, any> = {
  state:{
    undoItems : [],
    redo:[
      {"value":[{"name":"Color One","color":null,"pantone":null},
          {"name":"Color Two","color":null,"pantone":null},
          {"name":"Color Three","color":null,"pantone":null},
          {"name":"Color Four","color":null,"pantone":null}], "action":"setDefaultColor"}
      // {value:[], action: 'overRideGroupColors'}
      ]
  },
  getters:{
    getUndoItems:(state)=> state.undoItems,
    getRedoItems:(state)=> state.redo
  },
  actions:{

    updateUndo({commit}, payload){
      console.log(payload)
      commit('UPDATE_UNDO', payload);
    },
    updateRedo({commit}, payload){
      commit('UPDATE_REDO', payload)
    }
  },
  mutations:{
    UPDATE_UNDO:(state, payload)=> state.undoItems.push(payload),
    UPDATE_REDO:(state, payload) => state.redo.push(payload)
  }
}


export default Useage
