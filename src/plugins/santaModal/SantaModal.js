import SantaModalComponent from "@/plugins/santaModal/SantaModalComponent.vue";
import {getSantaModalConfig} from "@/helpers/Helpers";

const SantaModal = {};

SantaModal.install = (Vue) => {
  const santaModalConstructor = Vue.extend(SantaModalComponent);
  const instance = new santaModalConstructor();
  const dom_document = instance.$root.$options.shadowRoot ? instance.$root.$options.shadowRoot : document
  instance.$mount(dom_document.createElement("div"));
  Vue.prototype.$santaModal = {
    /*
    * @param santa_modal_data = {string|Object}
    * */
    show: (santa_modal_data,self) => {
      const modal_data_type = santa_modal_data.constructor.name
      let modal_data =  getSantaModalConfig()
      if(modal_data_type == 'String') {
        modal_data = {...modal_data, ...{text: santa_modal_data}}
      } else {
        modal_data = {...modal_data, ...santa_modal_data}
      }
      if(self.$root.$options.shadowRoot){
        self.$root.$options.shadowRoot.appendChild(instance.$el);
      }
      else{
        document.body.appendChild(instance.$el);
      }

      return instance.show(modal_data)
    },
    hide: () => {
      instance.hide()
    }
  }
};

export default SantaModal;
