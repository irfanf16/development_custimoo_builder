<template>
  <b-modal ref="locker-modal" id="modal-center-lockerroom" scrollable size="xl" title="Locker Room" content-class="lockerroom-modal">
    <LockerRoom @hideLockerRoomModal="hideLockerRoomModal"></LockerRoom>
  </b-modal>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import LockerRoom from '@/components/LockerRoom.vue'

@Component({
  components: {
    LockerRoom
  }
})
export default class LockerRoomModal extends Vue {
  public ref = this.$refs as Record<any, any>

  public hideLockerRoomModal () {
    this.ref['locker-modal'].hide()
  }

  public showLockerRoomModal () {
    this.ref['locker-modal'].show()
  }
}
</script>
