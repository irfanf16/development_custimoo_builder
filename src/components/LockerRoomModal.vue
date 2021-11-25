<template>
    <b-modal ref="locker-modal" id="modal-center-lockerroom" size="xl" :hide-footer="!selectedCollectionProducts.length>0" title="Locker Room" modal-class="modal-fullscreen2" content-class="lockerroom-modal"
    @close="$store.commit('Change_Locker_Active_Tab', 0)">
      <LockerRoom ref="lockerRoom" @hideLockerRoomModal="hideLockerRoomModal"
                  @showCollectionModal="showCollectionModal"
                  @editCollectionModal="editCollectionModal"
      ></LockerRoom>

      <template #modal-footer>
        <div v-if="!getSelectionMode.readonly && lockerActiveTabIndex == 0" class="text-right">
          <b-button v-if="selectedCollectionProducts.length>0 && totalCollections > 0"  v-b-modal.modal-center-existingCollection variant="secondary" style="margin-right: 5px">Add to existing collection</b-button>
          <b-button v-if="selectedCollectionProducts.length>0" @click="addDesignCollection" variant="secondary">Create new collection</b-button>
        </div>
        <div v-else class="text-right">
          <b-button v-if="selectedCollectionProducts.length > 0 && ($store.getters.getSelectionMode.readonly && $store.getters.getSelectionMode.collectionAddmoreMode)" @click="addMoreCollectionModal" variant="secondary">Add Products</b-button>
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
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS',{"attribute": "deleted_products", "value": []})
    this.$emit('editCollectionModal')
 }

  public addMoreCollectionModal = () => {
    this.$emit('editCollectionModal')
    this.ref['locker-modal'].hide()
    this.$store.commit('SET_SELECTION_MODE',{
      readonly:false,
      collectionAddmoreMode:false,
      eventProductMode:false,
      eventCollectionMode:false
    })
  }


  public hideLockerRoomModal () {
    this.ref['locker-modal'].hide()
  }

  public showLockerRoomModal () {
    this.ref['locker-modal'].show()
  }

  public addDesignCollection () {
    this.ref['lockerRoom'].addDesignCollection();
    this.$store.commit("Change_Locker_Active_Tab", 3)
  }
  get selectedCollectionProducts(){
    return this.$store.getters.getSelectedCollectionProducts;
  }

  get getSelectionMode() {
    return this.$store.getters.getSelectionMode;
  }

  get lockerActiveTabIndex(){
    return this.$store.getters.getLockerActiveTabIndex;
  }
  get totalCollections(){
    let collections: Record<any, any> =  this.$store.getters.getCollections;
    return collections.length;
  }
}
</script>
