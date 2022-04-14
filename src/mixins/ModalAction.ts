/* eslint-disable */
import { Component, Vue } from 'vue-property-decorator'
@Component
export default class ModalAction extends Vue {
  public showVModal (modalClass:string){
    console.log('modalClass', modalClass);
    (this.$modal as Record<any, any>).show(modalClass)
  }
  public hideVModal (modalClass:string){
    (this.$modal as Record<any, any>).hide(modalClass)
  }
}
