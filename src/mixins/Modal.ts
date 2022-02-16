/* eslint-disable */
import { Component, Vue } from 'vue-property-decorator'
@Component
export class Modal extends Vue {
  public showModal (modalClass:string){
    // console.log(this.$modal as Record<any, any>);
    (this.$modal as Record<any, any>).show(modalClass)
  }
  public hideModal (modalClass:string){
    (this.$modal as Record<any, any>).hide(modalClass)
  }
}
