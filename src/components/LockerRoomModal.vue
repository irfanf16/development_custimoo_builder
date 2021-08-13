<template>
    <b-modal ref="locker-modal" id="modal-center-lockerroom" size="xl" title="Locker Room" content-class="lockerroom-modal">
      <LockerRoom ref="lockerRoom" @hideLockerRoomModal="hideLockerRoomModal" @showCollectionModal="showCollectionModal" ></LockerRoom>

      <template #modal-footer>
        <div class="text-right border-top">
          <b-button v-if="selectedCollectionProducts.length>0" @click="addDesignCollection" variant="secondary">Add selected designs to a new collection</b-button>
        </div>
      </template>
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

  public addDesignCollection () {
    this.ref['lockerRoom'].addDesignCollection()
  }
  get selectedCollectionProducts(){
    return this.$store.getters.getSelectedCollectionProducts;
  }
}
</script>
