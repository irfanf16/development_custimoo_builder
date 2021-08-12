<template>
  <b-modal ref="collection-modal" id="modal-center-collection" scrollable size="xl" content-class="collection-modal">
    <template #modal-title>
      <div class="d-flex align-items-center justify-content-between w-100">
        <div>
          <b-form-input placeholder="Collection Name"></b-form-input>
        </div>

        <div>
          <b-button>Save</b-button>
        </div>
      </div>
    </template>

    <AddDesignCollection></AddDesignCollection>
    <!--<DesignCollection @hideCollectionModal="hideCollectionModal"></DesignCollection>-->

    <template #modal-footer>
      <div class="d-flex align-items-center justify-content-end w-100 gap-1">
        <b-button variant="secondary" class="light">Cancel</b-button>
        <b-button variant="secondary">Save</b-button>
      </div>
    </template>
  </b-modal>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'
import DesignCollection from "@/components/DesignCollection.vue";
import AddDesignCollection from "@/components/AddDesignCollection.vue";


@Component({
  components: {
    // eslint-disable-next-line no-undef
    AddDesignCollection,
    DesignCollection
  }
})
export default class LockerRoomModal extends Vue {
  private addCollection = false;

  public ref = this.$refs as Record<any, any>

  public hideCollectionModal () {
    this.ref['collection-modal'].hide()
  }

  public showCollectionModal () {
    this.ref['collection-modal'].show()
  }
}
</script>
