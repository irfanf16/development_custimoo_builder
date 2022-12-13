const getSantaModalConfig = () => {
  /*
  * icon = {success, error, info}
  * */
  return {
    name: 'santa-confirm-modal', icon: 'success', title: '', text: 'This is default text', confirm_text: 'Ok', cancel_text: null,
    click_to_close: false
  }
}

export {
  getSantaModalConfig
}
