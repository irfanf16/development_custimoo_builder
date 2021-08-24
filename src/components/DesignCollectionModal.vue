<template>

  <span>
  <b-modal ref="collection-modal" id="modal-center-collection" size="xl" modal-class="modal-fullscreen2" content-class="collection-modal">

    <template #modal-title>
      <div class="d-flex align-items-center justify-content-between gap-1 w-100">
        <div>
          <b-form-input @input="updateCollectionItemAttribute('name','',$event)" v-model="collectionItems.name" placeholder="Collection Name"></b-form-input>
        </div>

        <div>
          <b-button style="margin-right: 10px" @click="openLockerModel(false)">Locker Room</b-button>
           <b-button style="margin-right: 10px" @click="saveCollectionForm">Save</b-button>

        </div>

      </div>
    </template>

    <template>
      <div class="design-collection-form">
        <div class="loader" v-if="showLoader" ><img style="width: 100px" src="../../src/assets/images/loading.gif" /></div>
        <b-form inline>
          <b-container fluid>
            <draggable class="row draggable gap-y-5" :options="{animation: 250, delayOnTouchOnly: true, delay: 500}"
                       v-model='collectionItems.collection_products'>
      <b-col cols="12" md="6" lg="4" xl="3" v-for="(collectionItem, index) in collectionItems.collection_products"
             :key="index">
        <b-card>
          <a class="btn remove absolute" @click="deleteLockerProduct(collectionItem.product_locker_room.id)">
            <font-awesome-icon :icon="['fas', 'trash-alt']"/>
          </a>

          <div class="text-center fs-2 fw-bold">
            <a  @click="clickEyeIcon('title',index)" style="cursor: default"><font-awesome-icon v-model="collectionItem.allow_title"  :icon="['fas', collectionItem.allow_title === true ? 'eye' : 'eye-slash' ]"/></a>
            {{ collectionItem.product_locker_room.product_name }}
          </div>
          <div class="mt-2 d-block gap-1">
            <div>
              <b-form-input @input="updateCollectionItemAttribute('product_nickname',index, $event)"  class="w-100" v-model="collectionItem.product_nickname"
                            placeholder="Product Nick Name"></b-form-input>
            </div>
<!--            <div>-->
<!--              <b-button class="dragHandle border-0">-->
<!--                <b-icon icon="arrows-move"></b-icon>-->
<!--              </b-button>-->
<!--            </div>-->
          </div>

          <div class="mt-3 respCanvas">

            <Scene v-if="collectionItem.product_locker_room.design.back_design"
                   :measurement-ratio="collectionItem.product_locker_room.design.measurement_ratio" :productType="collectionItem.product_locker_room.product_type"
                   :key="collectionItem.id"
                   :front="{textureUrl: storageUrl+collectionItem.product_locker_room.design.front_design.file_url, modelUrl: collectionItem.product_locker_room.style.front? storageUrl+collectionItem.product_locker_room.style.front.file_url : ''}"
                   :back="{textureUrl: storageUrl+collectionItem.product_locker_room.design.back_design.file_url, modelUrl: collectionItem.product_locker_room.style.back? storageUrl+collectionItem.product_locker_room.style.back.file_url: ''}"
                   :backTextureUrl="collectionItem.product_locker_room.design.back_design? collectionItem.product_locker_room.design.back_design.file_url: ''"
                   :lockerDefaultColors="JSON.parse(collectionItem.product_locker_room.defaultcolors)"
                   :lockerGroupColors="JSON.parse(collectionItem.product_locker_room.groupcolors)" :canvasHeight="150" :canvasWidth="150"
                   :logos="collectionItem.product_locker_room.style.logo.concat(JSON.parse(collectionItem.product_locker_room.custom_logos))"
                   :texts="JSON.parse(collectionItem.product_locker_room.text)" :canvasSelection="false"/>

            <Scene v-else :measurement-ratio="collectionItem.product_locker_room.design.measurement_ratio" :productType="collectionItem.product_locker_room.product_type"
                   :key="collectionItem.id"
                   :front="{textureUrl: storageUrl+collectionItem.product_locker_room.design.front_design.file_url, modelUrl: collectionItem.product_locker_room.style? storageUrl+collectionItem.product_locker_room.style.front.file_url : ''}"
                   :backTextureUrl="collectionItem.product_locker_room.design.back_design? collectionItem.product_locker_room.design.back_design.file_url: ''"
                   :lockerDefaultColors="JSON.parse(collectionItem.product_locker_room.defaultcolors)"
                   :lockerGroupColors="JSON.parse(collectionItem.product_locker_room.groupcolors)" :canvasHeight="150" :canvasWidth="150"
                   :logos="collectionItem.product_locker_room.style.logo.concat(JSON.parse(collectionItem.product_locker_room.custom_logos))"
                   :texts="JSON.parse(collectionItem.product_locker_room.text)" :canvasSelection="false"/>
          </div>

          <div class="mt-3">
            <a  @click="clickEyeIcon('description',index)" style="cursor: default"><font-awesome-icon v-model="collectionItem.allow_description"  :icon="['fas', collectionItem.allow_description === true ? 'eye' : 'eye-slash' ]"/></a>
            <span v-html="collectionItem.product_locker_room.model_description ? collectionItem.product_locker_room.model_description.product_model_description : '' "></span>
          </div>

          <div class="mt-3">
            <b-form-textarea @input="updateCollectionItemAttribute('product_note',index, $event)" v-model="collectionItem.product_note" placeholder="Description"
                             class="w-100"></b-form-textarea>
          </div>

          <div class="mt-3">
            <a  @click="clickEyeIcon('price',index)" style="cursor: default"><font-awesome-icon v-model="collectionItem.allow_price"  :icon="['fas', collectionItem.allow_price === true ? 'eye' : 'eye-slash' ]"/></a>
          </div>
          <div class="mt-3">
            <b-form-input @input="updateCollectionItemAttribute('product_price',index, $event)"  class="w-100" v-model="collectionItem.product_price"
                            placeholder="Product Price"></b-form-input>
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
        <b-button variant="secondary" @click="saveCollectionForm">Save</b-button>
        <b-button @click="openLockerModel">Add more</b-button>
      </div>
    </template>
  </b-modal>
    <DesignCollectionPdfView :collectionData="collectionItems" :key="DesignCollectionPdfViewKey"/>
  </span>

</template>

<script lang="ts">


import {Component, Mixins} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";
import DesignCollectionPdfView from "@/components/DesignCollectionPdfView.vue";
import html2pdf from "html2pdf.js"
import Scene from "@/components/Scene.vue"
import draggable from "vuedraggable";

@Component({
  components: {
    DesignCollectionPdfView,
    Scene,
    draggable
  }
})

export default class DesignCollectionModal extends Mixins(ErrorMessages) {
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public collectionData: any[] = []
  public ref = this.$refs as Record<any, any>
  public DesignCollectionPdfViewKey: number|string = 12345
  // public isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  public showLoader = false

  public async retrievCollectionItems() {
    this.showLoader = true;
    let res: Record<any, any> = await this.$store.dispatch('getCollectionItems')
    let collectionItems: Record<any, any> = res;

    let prevCollection = this.$store.getters.getCollectionItems;
    let collecItemById: any[] = [];
    prevCollection.collection_products.forEach(function (item: Record<any, any>, index: number) {
      collecItemById[item.product_locker_room_id] = item
    })

    if(prevCollection.name && prevCollection.name != ""){
      collectionItems.name = prevCollection.name
    }

    if(prevCollection.link && prevCollection.link != ""){
      collectionItems.link = prevCollection.link
    }

    let prod_ids: number[] = [];
    collectionItems.collection_products.forEach(function (item: Record<any, any>) {
      let prevItem = [];
       prevItem = collecItemById[item.product_locker_room_id]

      if(prevItem){
        item.allow_description = prevItem.allow_description
        item.allow_title = prevItem.allow_title
        item.allow_price = prevItem.allow_price
        if(prevItem.product_nickname != ""){
          item.product_nickname = prevItem.product_nickname;
        }
        if(prevItem.product_note != ""){
          item.product_note = prevItem.product_note;
        }
        if(prevItem.product_price != ""){
          item.product_price = prevItem.product_price;
        }
      }

      prod_ids.push(item.product_locker_room_id)
    })

    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS',{"attribute": "locker_products", "value": prod_ids})
    this.$store.commit('SET_COLLECTION_ITEMS', collectionItems)
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS',{"attribute": "deleted_products", "value": []})
    this.showLoader = false;
  }

  get collectionItems(){
    return this.$store.getters.getCollectionItems
  }
  set collectionItems(val){
    console.log('setter called')
    this.$store.commit('SET_COLLECTION_ITEMS',val)
  }

  public hideCollectionModal() {
    this.ref['collection-modal'].hide()
  }

  public showCollectionModal() {

    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS', {"attribute": "collection_id", "value": 0})
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS',{"attribute": "deleted_products", "value": []})
    this.$store.commit('SET_COLLECTION_ITEMS', {id: "", name: "", link: "", collection_products: []})
    this.ref['collection-modal'].show();
    this.retrievCollectionItems();
  }

  public editCollectionModal() {
    this.ref['collection-modal'].show();
    this.retrievCollectionItems();
  }

  public deleteLockerProduct(locker_prod_id: number) {
    this.$store.commit('DELETE_COLLECTION_ITEM', locker_prod_id)
    this.$store.commit('DELETE_SELECTED_COLLECTION_PRODUCT', locker_prod_id)
    this.$store.commit('ADD_DELETED_COLLECTION_PRODUCT', locker_prod_id)
    if (this.collectionItems.collection_products.length < 1) {
      this.hideCollectionModal()
    }
  }

  public clickEyeIcon(type:string, index:number) {

    switch (type){
      case "title":
        this.$store.commit('SET_COLLECTION_ITEMS_ATTRIBUTE', {index: index, attribute: 'allow_title', value: !this.collectionItems.collection_products[index].allow_title})
        break;
      case "description":
        this.$store.commit('SET_COLLECTION_ITEMS_ATTRIBUTE', {index: index, attribute: 'allow_description', value: !this.collectionItems.collection_products[index].allow_description})
        break;
      case "price":
        this.$store.commit('SET_COLLECTION_ITEMS_ATTRIBUTE', {index: index, attribute: 'allow_price', value: !this.collectionItems.collection_products[index].allow_price})
        break;
    }
 }

  public updateCollectionItemAttribute(attribute: string, index: number, value: string){
    this.$store.commit('SET_COLLECTION_ITEMS_ATTRIBUTE', {index: index, attribute: attribute, value: value})
  }

  public async saveCollectionForm_back() {
    let collectionItems: Record<any, any> = this.collectionItems;
    let formData: Record<any, any> = {};

    formData.name = collectionItems.name;
    formData.link = collectionItems.link
    let products: Record<any, any>[] = [];

    collectionItems.collection_products.forEach(function (item: Record<any, any>, index: number) {
      products.push({
        "product_nickname": item.product_nickname,
        "product_note": item.product_note,
        "product_locker_room_id": item.product_locker_room.id,
        "order_number": (index + 1),
        "allow_title": item.allow_title,
        "allow_description": item.allow_description,

      })
    })
    formData.products = products
    let res;
    if (collectionItems.id == "") {
      res = await this.$store.dispatch('createNewCollection', formData);
    } else {
      formData.collection_id = collectionItems.id;
      res = await this.$store.dispatch('updateNewCollection', formData);
    }
    if (res.status) {
      this.showToast(res.message, 'SUCCESS')
      const payload = {"attribute": "locker_products", "value": []};
      this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS', payload)
      this.ref['collection-modal'].hide();
    } else {
      this.showErrorArr(res.message)
    }
  }

  public async saveCollectionForm() {
    this.showLoader = true;
    let collectionItems = this.collectionItems;
    let formData: Record<any, any> = {};

    formData.name = collectionItems.name;
    formData.link = collectionItems.link
    let products: Record<any, any>[] = [];

    collectionItems.collection_products.forEach(function (item: Record<any, any>, index: number) {
      products.push({
        "product_nickname": item.product_nickname,
        "product_note": item.product_note,
        "product_price": item.product_price,
        "product_locker_room_id": item.product_locker_room.id,
        "order_number": (index + 1),
        "allow_title": item.allow_title,
        "allow_description": item.allow_description,
        "allow_price": item.allow_price
       })
    })
    formData.products = products
    let res;
    let content = ''
    if (collectionItems.id == "") {
        content = await this.generateCollectionPdf();
        formData.data = content
      res = await this.$store.dispatch('createNewCollection', formData);
    } else {
        content = await this.generateCollectionPdf();
        formData.data = content
      formData.collection_id = collectionItems.id;
      res = await this.$store.dispatch('updateNewCollection', formData);
    }
    this.showLoader = false;
    if (res.status) {
      this.showToast(res.message, 'SUCCESS')
      const payload = {"attribute": "locker_products", "value": []};
      this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS', payload)
      this.$store.commit('SET_COLLECTION_ITEMS', {id: "", name: "", link: "", collection_products: []})
      this.ref['collection-modal'].hide();
    } else {
      this.showErrorArr(res.message)
    }
  }

  public openLockerModel(add_more_status:boolean) {

   this.$emit('showLockerRoomModal');
   if(add_more_status) {
     this.$store.commit('SET_ADD_MORE_COLLECTION',true)
     this.$store.commit('SET_DISABLED_PRODUCTS',true)
   }

    this.hideCollectionModal()
  }

  public  generateCollectionPdf() {
    let self = this;
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
    return  html2pdf().set(opt).from(element).toPdf().output('datauristring').then((pdf:any) =>{
      let arr = pdf.split(',');
      return  arr[1];
    })
  }


}
</script>
<style scoped>
.loader {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
z-index: 9999;

img {
  width: 100px !important;
  max-width: 100px;
  display: block;
  margin: 0 auto;
  height: auto;
}

}
</style>
