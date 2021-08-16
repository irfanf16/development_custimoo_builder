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
        </div>
      </div>
    </template>

    <template>
      <div class="design-collection-form">
        <b-form inline>
          <DesignCollectionModalContent :collectionItems="collectionItems" :key="dcmcKey" v-bind:dcmckey.sync="dcmcKey"/>
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
import ErrorMessages from "@/mixins/ErrorMessages";
import DesignCollectionPdfView from "@/components/DesignCollectionPdfView.vue";
import DesignCollectionModalContent from "@/components/DesignCollectionModalContent.vue";
import html2pdf from "html2pdf.js"


@Component({
  components: {
    DesignCollectionPdfView,
    DesignCollectionModalContent
  }
})

export default class DesignCollectionModal extends Mixins(ErrorMessages) {
  public dcmcKey = 1
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

  public updateKey(dcmcKey:any) {
    this.dcmcKey = Math.random();
    console.log('new', dcmcKey)
  }



}
</script>
