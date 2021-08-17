<template>

  <span>
  <b-modal ref="collection-modal" id="modal-center-collection" size="xl" content-class="collection-modal">

    <template #modal-title>
      <div class="d-flex align-items-center justify-content-between w-100">
        <div>
          <b-form-input  v-model="collectionItems.name" placeholder="Collection Name"></b-form-input>
        </div>

        <div>
           <b-button @click="saveCollectionForm">Save</b-button>
          <b-button @click="openLockerModel">Back to Locker</b-button>
        </div>

      </div>
    </template>

    <template>
      <div class="design-collection-form">
        <b-form inline>
          <b-container fluid>
            <draggable class="row gap-y-5" :options="{handle: '.dragHandle', animation: 250}" v-model='collectionItems.collection_products'>
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

                    <Scene v-if="collectionItem.product_locker_room.design.back_design" :measurement-ratio="collectionItem.product_locker_room.design.measurement_ratio"
                           :front="{textureUrl: storageUrl+collectionItem.product_locker_room.design.front_design.file_url, modelUrl: collectionItem.product_locker_room.style.front? storageUrl+collectionItem.product_locker_room.style.front.file_url : ''}"
                           :back="{textureUrl: storageUrl+collectionItem.product_locker_room.design.back_design.file_url, modelUrl: collectionItem.product_locker_room.style.back? storageUrl+collectionItem.product_locker_room.style.back.file_url: ''}"
                           :backTextureUrl="collectionItem.product_locker_room.design.back_design? collectionItem.product_locker_room.design.back_design.file_url: ''" :lockerDefaultColors="JSON.parse(collectionItem.product_locker_room.defaultcolors)"
                           :lockerGroupColors="JSON.parse(collectionItem.product_locker_room.groupcolors)" :canvasHeight="150" :canvasWidth="150" :logos="collectionItem.product_locker_room.style.logo.concat(JSON.parse(collectionItem.product_locker_room.custom_logos))" :productNamesSetting="collectionItem.product_locker_room.productnames" :canvasSelection="false"  />

                    <Scene v-else  :measurement-ratio="collectionItem.product_locker_room.design.measurement_ratio"
                           :front="{textureUrl: storageUrl+collectionItem.product_locker_room.design.front_design.file_url, modelUrl: collectionItem.product_locker_room.style? storageUrl+collectionItem.product_locker_room.style.front.file_url : ''}"
                           :backTextureUrl="collectionItem.product_locker_room.design.back_design? collectionItem.product_locker_room.design.back_design.file_url: ''" :lockerDefaultColors="JSON.parse(collectionItem.product_locker_room.defaultcolors)"
                           :lockerGroupColors="JSON.parse(collectionItem.product_locker_room.groupcolors)" :canvasHeight="150" :canvasWidth="150" :logos="collectionItem.product_locker_room.style.logo.concat(JSON.parse(collectionItem.product_locker_room.custom_logos))" :productNamesSetting="collectionItem.product_locker_room.productnames" :canvasSelection="false"  />
                  </div>

                  <div class="mt-3">
                    <span v-html="collectionItem.product_locker_room.model_description ? collectionItem.product_locker_room.model_description.product_model_description : ''"></span>
                  </div>

                  <div class="mt-3">
                    <b-form-textarea v-model="collectionItem.product_note" placeholder="Description" class="w-100"></b-form-textarea>
                  </div>
                </b-card>
              </b-col>
            </draggable>
          </b-container>
        </b-form>
      </div>
    </template>


   <template #modal-footer>
      <div class="d-flex align-items-center justify-content-end w-100 gap-1">
        <b-button @click="hideCollectionModal" variant="secondary" class="light">Cancel</b-button>
        <b-button variant="secondary"  @click="saveCollectionForm">Save</b-button>
        <b-button variant="secondary" @click="generateCollectionPdf">Download PDF</b-button>
      </div>
    </template>
  </b-modal>
    <DesignCollectionPdfView :collectionData="collectionData"/>
  </span>

</template>

<script lang="ts">


import {Component, Mixins} from 'vue-property-decorator'
import DesignCollection from "@/components/DesignCollection.vue";
import ErrorMessages from "@/mixins/ErrorMessages";
import Scene from "@/components/Scene.vue"
import LockerRoomProducts from '@/components/LockerRoomProducts.vue'
import CreateLockerRoomModal from '@/components/CreateLockerRoomModal.vue'
import DesignCollectionPdfView from "@/components/DesignCollectionPdfView.vue";
import draggable from "vuedraggable";
import html2pdf from "html2pdf.js"

@Component({
  components: {
    Scene,
    DesignCollection,
    LockerRoomProducts,
    CreateLockerRoomModal,
    DesignCollectionPdfView,
    draggable
  }
})

export default class DesignCollectionModal extends Mixins(ErrorMessages) {
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public collectionData : any[] = []
  private collectionItems = {id:"",name:"",link:"",collection_products:[]}
  public ref = this.$refs as Record<any, any>

  public async retrievCollectionItems(){
    let res = await this.$store.dispatch('getCollectionItems')
    this.collectionItems = res;
  }

  public hideCollectionModal () {
    this.ref['collection-modal'].hide()
  }

  public showCollectionModal () {
    const payload = {"attribute":"collection_id","value":0}
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS',payload)
    this.ref['collection-modal'].show();
    this.retrievCollectionItems();
  }

  public editCollectionModal (collection_id:number) {
    const payload = {"attribute":"collection_id","value":collection_id}
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS',payload)
    this.ref['collection-modal'].show();
    this.retrievCollectionItems();
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

  public async saveCollectionForm(){
    let collectionItems = this.collectionItems;
    let formData = {};

    formData.name = collectionItems.name;
    formData.link = collectionItems.link
    let products = [];

    collectionItems.collection_products.forEach(function (item,index) {
        products.push({
          "product_nickname":item.product_nickname,
          "product_note":item.product_note,
          "product_locker_room_id":item.product_locker_room.id,
          "order_number":(index+1)})
    })
    formData.products = products
    let res;
    if(collectionItems.id == ""){
       res = await this.$store.dispatch('createNewCollection',formData);
    }else{
       formData.collection_id = collectionItems.id;
       res = await this.$store.dispatch('updateNewCollection',formData);
    }
    if(res.status){
      this.showToast(res.message,'SUCCESS')
      const payload = {"attribute":"locker_products","value":[]};
      this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS',payload)
      this.ref['collection-modal'].hide();
    }else
    {
      this.showErrorArr(res.message)
    }
  }

  public openLockerModel() {
   this.$emit('showLockerRoomModal');
  }

  public async generateCollectionPdf() {
    let res = await this.$store.dispatch('getCollection')
    let self = this;
    self.collectionData = res
    setTimeout(()=>{
      const element = document.getElementById("collectionPdfContainer")
      const opt = {
        margin: [15, 10, 15, 10],
        filename: 'production.pdf',
        image: {type: "jpeg", quality: 1},
        html2canvas: {
          dpi: 192,
          scale: 4,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: "mm",
          format: "letter",
          orientation: 'landscape'
        }
      };
      html2pdf().set(opt).from(element).save();
    }, 3000)
  }

}
</script>
