import SantaModalComponent from "@/plugins/santaModal/SantaModalComponent.vue";
import {getDomDocument, getSantaModalConfig} from "@/helpers/Helpers";

const SantaModal = {};

SantaModal.install = (Vue) => {
  const santaModalConstructor = Vue.extend(SantaModalComponent);
  const instance = new santaModalConstructor();
  const dom_document = getDomDocument(instance)
  instance.$mount(dom_document.createElement("div"));
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
      dom_document.body.appendChild(instance.$el);
      return instance.show(modal_data)
    },
    hide: () => {
      instance.hide()
    }
  }
};

export default SantaModal;
