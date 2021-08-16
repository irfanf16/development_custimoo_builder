<template>

  <b-container fluid>
    <draggable class="row gap-y-5" :options="{handle: '.dragHandle', animation: 250}" v-model='collectionItems.collection_products' @change="collectionItemMoved">
      <b-col cols="12" lg="6" xl="4" v-for="(collectionItem, index) in collectionItems.collection_products" :key="index">
        <b-card>
          <a class="btn remove absolute" @click="deleteLockerProduct(collectionItem.product_locker_room.id)">
            <font-awesome-icon :icon="['fas', 'trash-alt']"/>
          </a>
          <div class="text-center fs-2 fw-bold">{{collectionItem.product_locker_room.product_name}}</div>
          <div class="mt-2 d-flex gap-1">
            <div>
              <b-form-input class="w-100" v-model="collectionItem.product_nickname" placeholder="Product Nick Name"></b-form-input>
            </div>
            <div>
              <b-button class="dragHandle border-0">
                <b-icon icon="arrows-move"></b-icon>
              </b-button>
            </div>
          </div>

          <div class="mt-3">

            <Scene v-if="collectionItem.product_locker_room.design.back_design" :measurement-ratio="collectionItem.product_locker_room.design.measurement_ratio" :key="`scene+${index}`"
                   :front="{textureUrl: storageUrl+collectionItem.product_locker_room.design.front_design.file_url, modelUrl: collectionItem.product_locker_room.style.front? storageUrl+collectionItem.product_locker_room.style.front.file_url : ''}"
                   :back="{textureUrl: storageUrl+collectionItem.product_locker_room.design.back_design.file_url, modelUrl: collectionItem.product_locker_room.style.back? storageUrl+collectionItem.product_locker_room.style.back.file_url: ''}"
                   :backTextureUrl="collectionItem.product_locker_room.design.back_design? collectionItem.product_locker_room.design.back_design.file_url: ''" :lockerDefaultColors="JSON.parse(collectionItem.product_locker_room.defaultcolors)"
                   :lockerGroupColors="JSON.parse(collectionItem.product_locker_room.groupcolors)" :canvasHeight="150" :canvasWidth="150" :logos="collectionItem.product_locker_room.style.logo.concat(JSON.parse(collectionItem.product_locker_room.custom_logos))" :productNamesSetting="collectionItem.product_locker_room.productnames" :canvasSelection="false"  />

            <Scene v-else  :measurement-ratio="collectionItem.product_locker_room.design.measurement_ratio" :key="`scene+${index}`"
                   :front="{textureUrl: storageUrl+collectionItem.product_locker_room.design.front_design.file_url, modelUrl: collectionItem.product_locker_room.style? storageUrl+collectionItem.product_locker_room.style.front.file_url : ''}"
                   :backTextureUrl="collectionItem.product_locker_room.design.back_design? collectionItem.product_locker_room.design.back_design.file_url: ''" :lockerDefaultColors="JSON.parse(collectionItem.product_locker_room.defaultcolors)"
                   :lockerGroupColors="JSON.parse(collectionItem.product_locker_room.groupcolors)" :canvasHeight="150" :canvasWidth="150" :logos="collectionItem.product_locker_room.style.logo.concat(JSON.parse(collectionItem.product_locker_room.custom_logos))" :productNamesSetting="collectionItem.product_locker_room.productnames" :canvasSelection="false"  />
          </div>

          <div class="mt-3">
            {{collectionItem.product_locker_room.product_name}}
          </div>

          <div class="mt-3">
            <b-form-textarea v-model="collectionItem.product_note" placeholder="Description" class="w-100"></b-form-textarea>
          </div>
        </b-card>
      </b-col>
    </draggable>
  </b-container>

</template>

<script lang="ts">


import {Component, Prop, Vue} from 'vue-property-decorator'
import Scene from "@/components/Scene.vue"
import draggable from "vuedraggable";

@Component<DesignCollectionModalContent>({
  components: {
    Scene,
    draggable
  }
})

export default class DesignCollectionModalContent extends Vue {
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  @Prop({required: false, default: true}) readonly collectionItems!: boolean;

  public collectionItemMoved(moved_item: Record<string, any>) {
    this.$emit('update:dcmckey', Math.random())

  }

  public deleteLockerProduct(locker_prod_id:number){
    console.log(locker_prod_id);
    let lockerItems = this.collectionItems.collection_products;
    lockerItems = lockerItems.filter(item => item.product_locker_room.id !== locker_prod_id)
    this.collectionItems.collection_products = lockerItems;
    console.log(this.collectionItems.collection_products)
    this.$store.commit('DELETE_SELECTED_COLLECTION_PRODUCT',locker_prod_id)
    if(this.collectionItems.collection_products.length < 1){
      this.hideCollectionModal()
    }
  }
}
</script>
