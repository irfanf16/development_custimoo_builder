<template>
    <b-modal ref="locker-modal" id="modal-center-lockerroom" scrollable size="xl" title="Locker Room" content-class="lockerroom-modal">
      <LockerRoom @hideLockerRoomModal="hideLockerRoomModal" @showCollectionModal="showCollectionModal" v-bind.sync="this.addCollection"></LockerRoom>
    </b-modal>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import LockerRoom from '@/components/LockerRoom.vue'
import DesignCollection from '@/components/DesignCollection.vue'

@Component({
  components: {
    LockerRoom,
    DesignCollection
  }
})
export default class LockerRoomModal extends Vue {
  private addCollection = false;

  public ref = this.$refs as Record<any, any>

  private showCollectionModal = () => {
    // alert("asd")
    this.$emit('showCollectionModal')
  }

  public hideLockerRoomModal () {
    this.ref['locker-modal'].hide()
  }

  public showLockerRoomModal () {
    this.ref['locker-modal'].show()
  }
}
</script>
