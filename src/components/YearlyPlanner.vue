<template>

  <div class="row">
    <div class="col-lg-7">
      <i class="fas fa-arrow-left"></i>2021<i class="fas fa-arrow-right"></i>
    </div>
    <div class="col-lg-4">
      <button class="btn btn-secondary" @click="showEventPopup">Add Event</button>
      <button style="margin-left: 5px" class="btn btn-secondary" @click="showContactPopup">Add Contact</button>
    </div>

    <ContactModal ref="contactmodal"  :room_id="room_id" :room_index="room_index"   />
  </div>



</template>

<script lang="ts">

import {Component, Mixins, Prop} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";

import ContactModal from "@/components/ContactModal.vue";


@Component<YearlyPlanner>({
  components: {
    ContactModal
  }
})

export default class YearlyPlanner extends Mixins(ErrorMessages) {
  @Prop({required: true}) readonly room_id !: number
  @Prop({required: true}) readonly room_index !: number
  public ref = this.$refs as Record<any, any>

  public showEventPopup(){
    const room_index = this.$store.getters.getActiveLockerIndex;
    this.$store.commit('SHOW_EVENT_POPUP', true)
    this.$store.commit('SET_LOCKER_INDEX_FOR_EVENT', room_index)
  }
  public showContactPopup(){
    this.ref['contactmodal'].showContactPopup()
   }
}

</script>

<style lang="scss" scoped>

</style>
