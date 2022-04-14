<template>
  <div class="design-collection-form">
    <b-form inline>
      <b-container fluid>
        <draggable class="row gap-y-5" :options="{handle: '.dragHandle', animation: 250}" v-model='collectionItems'>
          <b-col cols="12" lg="6" xl="4" v-for="collectionItem in collectionItems" :key="collectionItem">
            <b-card>
              <a class="btn remove absolute" @click="deleteRoom(room.id, i)">
                <font-awesome-icon :icon="['fas', 'trash-alt']"/>
              </a>
              <div class="text-center fs-2 fw-bold">T-Shirt Jensen Cut {{collectionItem}}</div>
              <div class="mt-2 d-flex gap-1">
                <div class="w-100">
                  <b-form-input class="w-100" placeholder="Product Nick Name"></b-form-input>
                </div>

                <div>
                  <b-button class="dragHandle border-0">
                    <b-icon icon="arrows-move"></b-icon>
                  </b-button>
                </div>
              </div>

              <div class="mt-3">
              </div>

              <div class="mt-3">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur dolore enim harum laborum magnam minima odit, quis sed. Deleniti dolor, eos error excepturi id quis vero voluptates. Corporis, excepturi similique!
              </div>

              <div class="mt-3">
                <b-form-textarea placeholder="Description" class="w-100"></b-form-textarea>
              </div>
            </b-card>
          </b-col>
        </draggable>
      </b-container>
    </b-form>
  </div>
</template>

<script lang="ts">
import draggable from 'vuedraggable'
import {Component, Vue, Watch} from 'vue-property-decorator'
import LockerRoomProducts from '@/components/LockerRoomProducts.vue'
import CreateLockerRoomModal from '@/components/CreateLockerRoomModal.vue'
@Component<AddDesignCollectionModal>({
  components: {
    LockerRoomProducts,
    CreateLockerRoomModal,
    draggable
  }
})
export default class AddDesignCollectionModal extends Vue {
  private collectionItems = this.$store.getters.getSelectedCollectionProducts;
  private title = '';
  private product_nickname = '';
  private description = 'pre';
  private product_note = '';
  private order_number = '';
  private design = () => this.designCollections();
  private style = {};


  public get designCollections(){
    return this.$store.getters.getDesignCollections
  }

  public addDesignCollections(){
    this.$store.dispatch('addDesignCollection', {
      title: this.title,
      product_nickname: this.product_nickname,
      description: this.description,
      product_note: this.product_note,
      order_number: this.order_number,
      design: this.design(),
      style: this.style,
    })
  }
}
</script>

<style lang="scss" scoped>

</style>
