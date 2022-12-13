import SantaModalComponent from "@/plugins/santaModal/SantaModalComponent.vue";
import {getSantaModalConfig} from "@/plugins/santaModal/helpers";

const SantaModal = {};

SantaModal.install = (Vue) => {
  const santaModalConstructor = Vue.extend(SantaModalComponent);
  const instance = new santaModalConstructor();
  instance.$mount(document.createElement("div"));
  Vue.prototype.$santaModal = {
    /*
    * @param santa_modal_data = {string|Object}
    * */
    show: (santa_modal_data) => {
      const modal_data_type = santa_modal_data.constructor.name
      let modal_data =  getSantaModalConfig()
      if(modal_data_type == 'String') {
        modal_data = {...modal_data, ...{text: santa_modal_data}}
      } else {
        modal_data = {...modal_data, ...santa_modal_data}
      }
      document.body.appendChild(instance.$el);
      return instance.show(modal_data)
    },
    hide: () => {
      instance.hide()
    }
  }
};

export default SantaModal;
