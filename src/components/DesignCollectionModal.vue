<template>

  <span>
  <modal :width="screenWidth"
         :resizable="true"
         :scrollable="true"
         height="auto"
         :reset="true"
         :shiftY="0"
         name="collection-modal" ref="collection-modal">
    <div class="modal-header">
      <div class="d-flex justify-content-sm-between flex-wrap align-items-center justify-content-center gap-1 w-100">
        <div>
          <b-form-input @input="updateCollectionItemAttribute('name','',$event)" v-model="collectionItems.name" placeholder="Collection Name"></b-form-input>
        </div>

        <div>
          <b-button style="margin-right: 10px" @click="openLockerModel(false)">Locker Room</b-button>
          <b-button style="margin-right: 10px" @click="saveCollectionForm">Save</b-button>
        </div>

      </div>
    </div>

    <div class="modal-body">
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

          <div class="text-center fs-2 fw-bold toggle_pdf">
            {{ collectionItem.product_locker_room.model_description ? collectionItem.product_locker_room.model_description.model_name : '' }}
            <a class="toggle_icon btn btn-secondary light" v-b-tooltip.hover.bottom="(collectionItem.allow_title ? 'Hide title' : 'Show title') + ' on pdf'" @click="clickEyeIcon('title',index)" style="cursor: default"><font-awesome-icon v-model="collectionItem.allow_title"  :icon="['fas', collectionItem.allow_title === true ? 'eye' : 'eye-slash' ]"/></a>
          </div>
          <div class="mt-2 d-block gap-1">
            <div>
              <b-form-input @input="updateCollectionItemAttribute('product_nickname',index, $event)"  class="w-100" v-model="collectionItem.product_nickname"
                            placeholder="Product Nick Name"></b-form-input>
            </div>
          </div>

          <div class="mt-3 respCanvas">
            <div><img
              :src="collectionItem.product_locker_room.front_url"
              :class="collectionItem.product_locker_room.front_url ? '' : 'placeholder'"
              alt=""></div>
            <div><img
              :src="collectionItem.product_locker_room.back_url"
              :class="collectionItem.product_locker_room.back_url ? '' : 'placeholder'"
              alt=""></div>
          </div>

          <div class="mt-3 toggle_pdf" v-if="collectionItem.product_locker_room.model_description">
            <div class="product-description">
              <a class="toggle_icon btn btn-secondary light" @click="clickEyeIcon('description',index)" style="cursor: default" v-b-tooltip.hover.bottom="(collectionItem.allow_description ? 'Hide description' : 'Show description') + ' on pdf'"><font-awesome-icon v-model="collectionItem.allow_description"  :icon="['fas', collectionItem.allow_description === true ? 'eye' : 'eye-slash' ]"/></a>
              <div :class="collectionItem.allow_description ? '' : 'inactive'" v-html="collectionItem.product_locker_room.model_description ? collectionItem.product_locker_room.model_description.product_model_description: ''"></div>
            </div>
          </div>

          <div class="mt-3">
            <b-form-textarea @input="updateCollectionItemAttribute('product_note',index, $event)" v-model="collectionItem.product_note" placeholder="Description"
                             class="w-100"></b-form-textarea>
          </div>

          <div class="mt-3 product-price">
            <a class="btn btn-secondary light toggle_icon" v-b-tooltip.hover.bottom="(collectionItem.allow_price ? 'Hide price' : 'Show price') + ' on pdf'" @click="clickEyeIcon('price',index)" style="cursor: default"><font-awesome-icon v-model="collectionItem.allow_price"  :icon="['fas', collectionItem.allow_price === true ? 'eye' : 'eye-slash' ]"/></a>
            <b-form-input @input="updateCollectionItemAttribute('product_price',index, $event)"  class="w-100" v-model="collectionItem.product_price"
                          placeholder="Product Price"></b-form-input>
          </div>
        </b-card>
      </b-col>
    </draggable>
          </b-container>
        </b-form>
      </div>
    </div>



   <div class="modal-footer">
      <div class="d-flex align-items-center justify-content-end w-100 gap-1">
        <b-button @click="hideCollectionModal" variant="secondary" class="light">Cancel</b-button>
        <b-button @click="openLockerModel">Add more</b-button>
        <b-button variant="secondary" @click="saveCollectionForm">Save</b-button>
      </div>
    </div>
  </modal>
    <DesignCollectionPdfView :collectionData="collectionItemsPdf" :key="DesignCollectionPdfViewKey"/>
  </span>

</template>

<script lang="ts">


import {Component, Mixins, Vue} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";
import DesignCollectionPdfView from "@/components/DesignCollectionPdfView.vue";
import html2pdf from "html2pdf.js"
import Scene from "@/components/Scene.vue"
import draggable from "vuedraggable";
import {getRandom} from "@/helpers/Helpers";
import ModalAction from "@/mixins/ModalAction";

@Component({
  components: {
    DesignCollectionPdfView,
    Scene,
    draggable
  }
})

export default class DesignCollectionModal extends Mixins(ErrorMessages, ModalAction) {
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public collectionData: any[] = []
  public ref = this.$refs as Record<any, any>
  public DesignCollectionPdfViewKey: number|string = 12345
  // public isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  public showLoader = false
  private mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  private screenWidth = this.mobileScreen ? window.screen.availWidth : (window.screen.availWidth - 100)

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
      }else{
        if(!item.id) {
          item.product_nickname =  item.product_locker_room.product_name
        }

      }

      if(collectionItems.id < 1){
        if(prevItem){
          item.product_nickname = prevItem.product_nickname;
        }else{
          item.product_nickname =  item.product_locker_room.product_name
        }

      }

      prod_ids.push(item.product_locker_room_id)
    })

    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS',{"attribute": "locker_products", "value": prod_ids})
    this.$store.commit('SET_COLLECTION_ITEMS', collectionItems)
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS',{"attribute": "deleted_products", "value": []})
    this.showLoader = false;
  }

  get collectionItemsPdf() {
    let products: Record<any, any>[] = []
    let subProducts: Record<any, any>[] = []
    let groupIndex = 0
    this.$store.getters.getCollectionItems.collection_products.forEach((product: Record<any, any>, index: number) => {
      Vue.set(subProducts, groupIndex, product)
      groupIndex++

      if((index!= 0 && index % 2 == 0) || index == this.$store.getters.getCollectionItems.collection_products.length -1) {
        products.push(subProducts)
        subProducts = []
        groupIndex = 0
      }
    })
    return { name: this.$store.getters.getCollectionItems.name, collection_products: products }
  }

  get collectionItems(){
    let main_product_id = this.$store.getters.getEditProductId;
    let items = this.$store.getters.getCollectionItems
    let collections = this.$store.getters.getCollectionItems.collection_products.map((item: Record<any, any>) => {
        if (item.product_locker_room.id == main_product_id){
          let random = getRandom()
          item.product_locker_room.front_url = `${item.product_locker_room.front_url}?${random}`
          item.product_locker_room.back_url = `${item.product_locker_room.back_url}?${random}`
        }
        return item
      })
    items.collection_products = collections
    return items
  }
  set collectionItems(val){
    console.log('setter called')
    this.$store.commit('SET_COLLECTION_ITEMS',val)
  }

  public hideCollectionModal() {
    this.hideVModal('collection-modal')
  }

  public showCollectionModal() {

    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS', {"attribute": "collection_id", "value": 0})
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS',{"attribute": "deleted_products", "value": []})
    this.$store.commit('SET_COLLECTION_ITEMS', {id: "", name: "", link: "", collection_products: []})
    this.showVModal('collection-modal')
    this.retrievCollectionItems();
  }

  public editCollectionModal() {
    this.showVModal('collection-modal')
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
      this.hideVModal('collection-modal')
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
      //content = await this.generateCollectionPdf();
      //formData.data = content
      res = await this.$store.dispatch('createNewCollection', formData);
      if(res.status){
        await this.$store.dispatch('getCollections')
        console.log("responssse", res)
      }
    } else {
      //content = await this.generateCollectionPdf();
      //formData.data = content
      formData.collection_id = collectionItems.id;
      res = await this.$store.dispatch('updateNewCollection', formData);
      if(res.status){
        await this.$store.dispatch('getCollections')
        console.log("responssse", res)
      }
    }
    this.showLoader = false;
    if (res.status) {
      this.openLockerModel(false);
      this.showToast(res.message, 'SUCCESS')
      const payload = {"attribute": "locker_products", "value": []};
      this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS', payload)
      this.$store.commit('SET_COLLECTION_ITEMS', {id: "", name: "", link: "", collection_products: []})
      this.hideVModal('collection-modal')
    } else {
      this.showErrorArr(res.message)
    }
  }

  public openLockerModel(add_more_status:boolean) {

    this.$emit('showLockerRoomModal');
    if(add_more_status) {
      this.$store.commit('SET_SELECTION_MODE',{
        readonly:true,
        collectionAddmoreMode:true,
        eventProductMode:false,
        eventCollectionMode:false
      })
      this.$store.commit('SET_DISABLED_PRODUCTS',true)
    }

    this.hideCollectionModal()
  }

  public  generateCollectionPdf() {
    let self = this;
    const element = document.getElementById("collectionPdfContainer")
    const opt = {
      margin: [0, 0, 0, 0],
      filename: 'production.pdf',
      image: {type: "jpeg", quality: 1},
      html2canvas: {
        dpi: 192,
        scale: 4,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: {
        unit: "in",
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
.respCanvas{
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.respCanvas >div{
  width: 100%;
}

.respCanvas >div img{
  max-width: 100%;
}

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
  z-index: 1030;
}

.loader img {
  max-width: 7%;
  display: block;
  margin: 0 auto;
  height: auto;
}

</style>
