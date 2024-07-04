import Dexie from 'dexie';

let persistant_plugin_key = 'custimoo';
// @ts-ignore
if(typeof custimoo_application_suppage_url !== 'undefined') {
  // @ts-ignore
  if(custimoo_application_suppage_url !== '' && custimoo_application_suppage_url !== null) {
    // @ts-ignore
    persistant_plugin_key += "-" + custimoo_application_suppage_url; // this variable declared in get-app-version js file
  }
}

const db = new Dexie(persistant_plugin_key);
db.version(1).stores({
  state: 'id',
});

export const DexieDb = db
/*
* The state must follow below structure
* state = {id: "", data: ""}.
* */
export const saveState = (state) => {
  // Use the 'state' store to put the data into IndexedDB
  return db.state.put(state);
};

export const loadState = (id) => {
  // Use the 'state' store to get the data from IndexedDB
  return db.state.get(id).then((result) => (result ? result.data : null))
}


export const deleteStateById = (id) => {
  db.state.delete(id)
}
