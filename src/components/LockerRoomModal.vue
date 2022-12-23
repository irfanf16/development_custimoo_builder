<template>
    <modal :width="screenWidth"
           :resizable="true"
           :scrollable="true"
           height="auto"
           :reset="true"
           :shiftY="0"
           name="locker-modal" ref="locker-modal" id="modal-center-lockerroom" size="xl" :hide-footer="!selectedCollectionProducts.length>0"
           @close="$store.commit('Change_Locker_Active_Tab', 0)">
      <div class="modal-header d-flex justify-content-between">
        <span class="fs-5 font-weight-bold">Locker Room</span>
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hideVModal('locker-modal')"><BIconX /></span>
      </div>
      <div class="modal-content lockerroom-modal">
        <div id="modal-center-lockerroom" class="modal-body">
          <LockerRoom ref="lockerRoom" @hideLockerRoomModal="hideVModal('locker-modal')"
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
import {Component, Vue, Mixins, Prop} from 'vue-property-decorator'
import LockerRoom from '@/components/LockerRoom.vue'
import DesignCollection from '@/components/DesignCollection.vue'
import ModalAction from '@/mixins/ModalAction'

@Component({
  components: {
    LockerRoom,
    DesignCollection,
  }
})
export default class LockerRoomModal extends Mixins(ModalAction){
  public ref = this.$refs as Record<any, any>
  private mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  private screenWidth = this.mobileScreen ? window.screen.availWidth : (window.screen.availWidth - 100)

  private showCollectionModal = () => {
    this.$emit('showCollectionModal')
  }

  public editCollectionModal = () => {
    this.$store.commit('SET_COLLECTION_ITEMS', {id: "", name: "", link: "", collection_products: []})
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS',{"attribute": "deleted_products", "value": []})
    this.$emit('editCollectionModal')
 }

  public addMoreCollectionModal = () => {
    this.$emit('editCollectionModal')
    this.hideVModal('locker-modal')
    this.$store.commit('SET_SELECTION_MODE',{
      readonly:false,
      collectionAddmoreMode:false,
      eventProductMode:false,
      eventCollectionMode:false
    })
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
