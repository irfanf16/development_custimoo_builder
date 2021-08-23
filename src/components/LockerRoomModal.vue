<template>
    <b-modal ref="locker-modal" id="modal-center-lockerroom" size="xl" :hide-footer="!selectedCollectionProducts.length>0" title="Locker Room" modal-class="modal-fullscreen2" content-class="lockerroom-modal">
      <LockerRoom ref="lockerRoom" @hideLockerRoomModal="hideLockerRoomModal"
                  @showCollectionModal="showCollectionModal"
                  @editCollectionModal="editCollectionModal"
      ></LockerRoom>

      <template #modal-footer>
        <div v-if="!getAddMoreCollectionStatus" class="text-right">
          <b-button v-if="selectedCollectionProducts.length>0"  v-b-modal.modal-center-existingCollection variant="secondary" style="margin-right: 5px">Add to existing collection</b-button>
          <b-button v-if="selectedCollectionProducts.length>0" @click="addDesignCollection" variant="secondary">Add to a new collection</b-button>
        </div>
        <div v-else class="text-right">
          <b-button v-if="selectedCollectionProducts.length>0" @click="addMoreCollectionModal" variant="secondary">Add Products</b-button>
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

  public editCollectionModal = () => {
    this.$store.commit('SET_COLLECTION_ITEMS', {id: "", name: "", link: "", collection_products: []})
    this.$emit('editCollectionModal')
 }

  public addMoreCollectionModal = () => {
    this.$emit('editCollectionModal')
    this.ref['locker-modal'].hide()
    this.$store.commit('SET_ADD_MORE_COLLECTION',false)
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
  get getAddMoreCollectionStatus(){
    return this.$store.getters.getAddMoreCollectionStatus;
  }
}
</script>
