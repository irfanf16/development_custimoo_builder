<template>
  <b-modal ref="locker-modal" id="modal-center-lockerroom" scrollable size="xl" title="Locker Room" content-class="lockerroom-modal">
    <LockerRoom></LockerRoom>
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
}
</script>
