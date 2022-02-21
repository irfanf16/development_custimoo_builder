<template>
  <modal :width="screenWidth"
         :resizable="true"
         :scrollable="true"
         height="auto"
         :reset="true"
         :shiftY="0" size="lg" name="orderspopup"  hide-footer  class="event_form"
         id="modal-center-event" centered
         >
    <div class="modal-header d-flex justify-content-between">
      <span class="fs-5 font-weight-bold">Order Listing</span>
      <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hideOrderspopup"><BIconX /></span>
    </div>
    <div class="modal-body">
      <h1>This is order listing modal</h1>
    </div>
  </modal>
</template>

<script lang="ts">
import {Component, Mixins} from "vue-property-decorator";
import ErrorMessages from "@/mixins/ErrorMessages";


@Component<OrderListing>({})
export default class OrderListing  extends Mixins(ErrorMessages)  {
  private screenWidth = (window.screen.availWidth - 100)

  public hideOrderspopup(){
    this.$modal.hide('orderspopup')
  }
  public showOdersPopup(){
    this.$modal.show('orderspopup')
  }

}
</script>

<style scoped>

</style>
