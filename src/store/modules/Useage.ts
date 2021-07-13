import { Module } from "vuex";
const Useage:Module<any, any> = {
  state:{
    undoItems : [],
    redoItems:[]
  },
  getters:{
    getUndoItems:(state)=> state.undoItems,
    getRedoItems:(state)=> state.redoItems
  },
  actions:{
    updateUndo({commit}, payload){
      commit('UPDATE_UNDO', payload);
    },
    updateRedo({commit}, payload){
      commit('UPDATE_REDO', payload)
    }
  },
  mutations:{
    UPDATE_UNDO:(state, payload)=> state.undoItems.push(payload),
    UPDATE_REDO:(state, payload) => state.redoItems.push(payload)
  }
}
export default Useage
