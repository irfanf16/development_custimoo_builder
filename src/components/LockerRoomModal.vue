<template>
    <modal :minWidth ="screenWidth"
           :minHeight="680" :resizable="true"
           :adaptive="true" name="locker-modal" ref="locker-modal" id="modal-center-lockerroom" size="xl" :hide-footer="!selectedCollectionProducts.length>0" title="Locker Room"
    @close="$store.commit('Change_Locker_Active_Tab', 0)">
      <div class="modal-content lockerroom-modal">
        <div id="modal-center-lockerroom" class="modal-body">
          <LockerRoom ref="lockerRoom" @hideLockerRoomModal="hideLockerRoomModal"
                      @showCollectionModal="showCollectionModal"
                      @editCollectionModal="editCollectionModal"
                      />
        </div>
      </div>

      <div v-if="!getSelectionMode.readonly && lockerActiveTabIndex == 0" class="text-right modal-footer">
        <b-button v-if="selectedCollectionProducts.length>0 && totalCollections > 0"  v-b-modal.modal-center-existingCollection variant="secondary" style="margin-right: 5px">Add to existing collection</b-button>
        <b-button v-if="selectedCollectionProducts.length>0" @click="addDesignCollection" variant="secondary">Create new collection</b-button>
      </div>
      <div v-else class="text-right modal-footer">
        <b-button v-if="selectedCollectionProducts.length > 0 && ($store.getters.getSelectionMode.readonly && $store.getters.getSelectionMode.collectionAddmoreMode)" @click="addMoreCollectionModal" variant="secondary">Add Products</b-button>
      </div>
    </modal>
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
  private screenWidth = (window.screen.availWidth - 100)

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
    this.$modal.hide('locker-modal')
  }

  public showLockerRoomModal () {
    this.$modal.show('locker-modal')
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
