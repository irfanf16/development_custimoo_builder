/* eslint-disable */
import { Component, Vue } from 'vue-property-decorator'
@Component
export default class ModalAction extends Vue {
  public showVModal (modalClass:string){
    console.log('modalClass', modalClass);
    if(modalClass === 'locker-modal' || modalClass === 'add-to-lockerroom' || modalClass === 'product-rejection-info-modal'){
      this.$store.commit('SET_REVERT_ROSTER_BOOL',true);
    }
    (this.$modal as Record<any, any>).show(modalClass)
  }
  public hideVModal (modalClass:string){
    (this.$modal as Record<any, any>).hide(modalClass)
  }
}
