<template>

  <span>
  <modal :width="screenWidth"
         :resizable="true"
         :scrollable="true"
         height="auto"
         :reset="true"
         :shiftY="0"
         class="absolute-modals"
         name="collection-modal" ref="collection-modal">
    <div class="modal-header">
      <div class="d-flex justify-content-sm-between flex-wrap align-items-center justify-content-center gap-1 w-100">
        <div class="d-flex align-items-center gap-1">
          <span class="fw-bold">Name: </span>
          <b-form-input v-if="lockerStoryBoard" v-model="collectionItems.name" placeholder="Collection Name" :disabled="true"></b-form-input>
          <b-form-input v-else @input="updateCollectionItemAttribute('name','',$event)" v-model="collectionItems.name" placeholder="Collection Name"></b-form-input>
        </div>

        <div class="d-flex">

            <template v-if="customerPermissions.includes('create-shopify-collection')">
              <b-button v-if="collectionItems.ecommerce_collection_id"
                @click="removeShopifyCollection(collectionItems.id)"
                style="margin-right: 10px"
              >Remove From Shopify</b-button>

              <b-button v-else title="Export to Shopify"
                @click="addShopifyCollection(collectionItems.id)"
                style="margin-right: 10px"
                :disabled="isExportingCollection(collectionItems.id)"
              > {{isExportingCollection(collectionItems.id) ? " Exporting ...": "Export to Shopify"}}</b-button>
            </template>

          <b-button style="margin-right: 10px" @click="downloadCollectionPdf(collectionItems.id)">Download PDF</b-button>
          <div style="display: block;position: relative">
            <b-button style="margin-right: 10px" @click="shareCollectionLink(collectionItems, collectionItems.id, false)">Share Url</b-button>
            <aside :id="'popper-content'+collectionItems.id" v-show="popperID == 'share-collection'+collectionItems.id" :ref="'popper-content'+collectionItems.id"
                   :class="!opacityset ? 'opacity-0' : 'opacity-100'"
                   v-click-outside-custom="hidePopper" class="tooltip b-tooltip bs-tooltip share-tooltip share-collection-tooltip" :key="popperID" style="position: absolute;top:40px;left:20px">
              <div class="share-holder">
                <h3>Copy link and Share</h3>
                <div class="share-form">
                  <b-form inline>
                    <b-form-input :ref="'copylink_'+collectionItems.id" @mouseenter="markText"
                                  :value="collectionItems.shared_url !== 'undefined'   || collectionItems.shared_url != null ?  collectionItems.shared_url : ''"
                    ></b-form-input>
                    <b-button variant="primary" @click="copyCollectionLink(collectionItems.id)">Copy Link</b-button>
                  </b-form>
                </div>
              </div>
            </aside>
          </div>
          <b-button style="margin-right: 10px" @click="openLockerModel(false, 'locker_room')">Locker Room</b-button>
          <b-button style="margin-right: 10px" @click="saveCollectionForm">Save</b-button>
        </div>

      </div>
    </div>

    <div class="modal-body">
      <div class="d-flex flex-row-reverse">
        <div class="position-relative pl-4 ml-4" style="border-left: 1px solid #eee; flex-basis: 20%; min-width: 160px; flex-grow: 0">
          <h2 class="fs-2 mb-2 font-weight-bolder">Upload Collection Logos</h2>
          <template v-for="(collection_logo, clIdx) in collection_logos">
            <div class="text-left" :key="`collection-logo-uploader-${clIdx}`" :class="{'mt-3': clIdx > 0}">
              <div class="fs-2 mb-0">Logo {{ clIdx + 1 }}</div>
              <CollectionLogoUploader :key="clIdx" :logoIndex="clIdx" :collection_logo="collection_logo" :collection_id="collectionItems.id"
                                      @logo-deleted="handleLogoDeleteEvent" :currentUploader="currentUploader" @setCurrentUploader="setCurrentUploader"/>
            </div>
          </template>
        </div>

        <div class="design-collection-form" style="flex-basis: 80%">
        <div class="loader" v-if="showLoader" ><img style="width: 100px" src="@assets/images/loading.gif" /></div>
        <b-form inline>
          <b-container fluid>
            <draggable class="row draggable gap-y-5" :options="{animation: 250, delayOnTouchOnly: true, delay: 500}"
                       v-model='collectionItems.collection_products' handle=".dragger">
      <b-col cols="12" md="6" lg="4" xl="3" v-for="(collectionItem, index) in collectionItems.collection_products"
             :key="index" class="dragger">
        <b-card>
          <a v-if="!lockerStoryBoard" class="btn remove absolute" @click="deleteLockerProduct(collectionItem.product_locker_room.id)">
            <font-awesome-icon :icon="['fas', 'trash-alt']"/>
          </a>

          <div class="text-center fs-2 fw-bold toggle_pdf">
            {{ collectionItem.product_locker_room.display_name }}
            <a class="toggle_icon btn btn-secondary light" v-b-tooltip.hover.bottom="(collectionItem.allow_title ? 'Hide title' : 'Show title') + ' on pdf'"
               @click="clickEyeIcon('title',index)" style="cursor: default">
              <font-awesome-icon v-model="collectionItem.allow_title"  :icon="['fas', collectionItem.allow_title === true ? 'eye' : 'eye-slash' ]"/>
            </a>
          </div>
          <div class="mt-2 d-block gap-1">
            <div>
              <b-form-input draggable="true" @dragstart="($event)=>{$event.preventDefault(); $event.stopPropagation();}"
                            @input="updateCollectionItemAttribute('product_nickname',index, $event)"  class="w-100" v-model="collectionItem.product_nickname"
                            placeholder="Product Nick Name"></b-form-input>
            </div>
          </div>

          <div class="mt-3 respCanvas">
            <div><img
              :src="storageUrl+collectionItem.product_locker_room.front_url+'?q='+collectionItem.product_locker_room.random_string"
              :class="collectionItem.product_locker_room.front_url ? '' : 'placeholder'"
              alt=""></div>
            <div><img
              :src="storageUrl+collectionItem.product_locker_room.back_url+'?q='+collectionItem.product_locker_room.random_string"
              :class="collectionItem.product_locker_room.back_url ? '' : 'placeholder'"
              alt=""></div>
          </div>

          <div class="mt-3 toggle_pdf" v-if="collectionItem.product_locker_room.description">
            <div class="product-description">
              <a class="toggle_icon btn btn-secondary light" @click="clickEyeIcon('description',index)" style="cursor: default" v-b-tooltip.hover.bottom="(collectionItem.allow_description ? 'Hide description' : 'Show description') + ' on pdf'"><font-awesome-icon v-model="collectionItem.allow_description"  :icon="['fas', collectionItem.allow_description === true ? 'eye' : 'eye-slash' ]"/></a>
              <div :class="collectionItem.allow_description ? '' : 'inactive'" v-html="collectionItem.product_locker_room.description"></div>
            </div>
          </div>

          <div class="mt-3">
            <b-form-textarea  draggable="true" @dragstart="($event)=>{$event.preventDefault(); $event.stopPropagation();}"
                              @input="updateCollectionItemAttribute('product_note',index, $event)" v-model="collectionItem.product_note" placeholder="Description"
                              class="w-100"></b-form-textarea>
          </div>

          <div class="mt-3 product-price">
            <a class="btn btn-secondary light toggle_icon" v-b-tooltip.hover.bottom="(collectionItem.allow_price ? 'Hide price' : 'Show price') + ' on pdf'" @click="clickEyeIcon('price',index)" style="cursor: default"><font-awesome-icon v-model="collectionItem.allow_price"  :icon="['fas', collectionItem.allow_price === true ? 'eye' : 'eye-slash' ]"/></a>
            <b-form-input draggable="true" @dragstart="($event)=>{$event.preventDefault(); $event.stopPropagation();}"
                          @input="updateCollectionItemAttribute('product_price',index, $event)"  class="w-100" v-model="collectionItem.product_price"
                          placeholder="Product Price"></b-form-input>
          </div>
        </b-card>
      </b-col>
    </draggable>
          </b-container>
        </b-form>
      </div>
      </div>
      <CollectionPDF ref="collection" :collection="collectionItems"/>
    </div>

   <div class="modal-footer">
      <div class="d-flex align-items-center justify-content-end w-100 gap-1">
        <b-button @click="hideCollectionModal" variant="secondary" class="light">Cancel</b-button>
        <b-button v-if="!lockerStoryBoard" @click="openLockerModel">Add more</b-button>
        <b-button variant="secondary" @click="saveCollectionForm">Save</b-button>
      </div>
    </div>
  </modal>
    <DesignCollectionPdfView :collectionData="collectionItemsPdf" :key="DesignCollectionPdfViewKey"/>
  </span>

</template>

<script lang="ts">


import {Component, Mixins, Prop, Vue, Watch} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";
import DesignCollectionPdfView from "@/components/DesignCollectionPdfView.vue";
import Scene from "@/components/Scene.vue"
import draggable from "vuedraggable";
import {
  getCollectionLogoDefaultObj,
  getRandom,
  downloadNodeCollectionPDF,
  startExportStatusChecker
} from "@/helpers/Helpers";
import ModalAction from "@/mixins/ModalAction";
import CollectionLogoUploader from "@/components/Logo/CollectionLogoUploader.vue";
import {forEach, findIndex} from "lodash";
import {log} from "fabric/fabric-impl";
import {CollectionMixin} from "@/mixins/LockerProduct";
import CollectionPDF from "@/components/CollectionPDF.vue";
import {http} from "@/httpCommon";
import Store from "@/store";

@Component({
  components: {
    CollectionPDF,
    DesignCollectionPdfView,
    CollectionLogoUploader,
    Scene,
    draggable
  },
  computed:{
    isExportingCollection() {
      return (id: number) => {
        return this.getExportingCollections.some((collection: { id: number }) => collection.id === id);
      };
    }
  }
})

export default class DesignCollectionModal extends Mixins(ErrorMessages, ModalAction, CollectionMixin) {
  @Prop({required: true}) opacityset:boolean
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public collectionData: any[] = []
  public ref = this.$refs as Record<any, any>
  public DesignCollectionPdfViewKey: number|string = 12345
  // public isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  public showLoader = false
  private mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  private screenWidth = this.mobileScreen ? window.screen.availWidth : (window.screen.availWidth - 100)
  public collection_logos: Record<any, any>[] = []
  public deleted_logos_ids: string[] = []
  // this variable is used to maintain the collection logos state while adding more products
  public adding_more_product = false
  public currentUploader = -1;

  public setCurrentUploader(current){
    this.currentUploader = -1
    this.currentUploader = current
  }

  public async retrievCollectionItems() {
    this.showLoader = true;
    let res: Record<any, any> = await this.$store.dispatch('getCollectionItems')
    let collectionItems: Record<any, any> = res;
    //check if in collection no new products being added then initialize collection logos from database
    if(!this.adding_more_product) {
      this.collection_logos = []
      this.collection_logos.push(getCollectionLogoDefaultObj({ sort_order: 0}))
      this.collection_logos.push(getCollectionLogoDefaultObj({ sort_order: 1}))
    }
    if(collectionItems.logos && collectionItems.logos.length > 0) {
      collectionItems.logos.forEach((logo: Record<any, any>) => {
        if(!this.deleted_logos_ids.includes(logo.id)) {
          this.collection_logos[logo.sort_order] = getCollectionLogoDefaultObj(logo)
        }
      })
    }

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
      let prevItem: Record<any, any> = [];
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

  get customerPermissions(){
    return this.$store.getters.getCustomerPermissions
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
    return this.$store.getters.getCollectionItems
  }

  public get getExportingCollections(){
    return this.$store.getters.getExportingCollections
  }

  public hideCollectionModal() {
    this.hideVModal('collection-modal')
    this.$emit('showLockerRoomModal', this.lockerStoryBoard? 0 : 1)
    const payload = {"attribute": "locker_products", "value": []};
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS', payload)
    this.$store.commit('SET_COLLECTION_ITEMS', {id: "", name: "", link: "", collection_products: []})
  }

  public showCollectionModal() {
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS', {"attribute": "collection_id", "value": 0})
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS',{"attribute": "deleted_products", "value": []})
    this.$store.commit('SET_COLLECTION_ITEMS', {id: "", name: "", link: "", collection_products: []})
    this.showVModal('collection-modal')
    this.retrievCollectionItems();
  }

   public async editCollectionModal() {
    await this.retrievCollectionItems();
    if(this.collectionItems && this.collectionItems.collection_products.length > 0){
      this.showVModal('collection-modal')
      this.adding_more_product = false
    }
    else{
      this.openLockerModel(false);
      this.showToast("No Products in the storyboard","error");
    }
    //when more products added to the collection then set it to false

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

  public async saveCollectionForm() {
    let collectionItems = this.collectionItems;
    if (!collectionItems.name) {
      this.showError("Collection name is required");
      return;
    }
    this.showLoader = true;
    let form_data = new FormData();
    form_data.append("name", collectionItems.name)
    form_data.append("link", collectionItems.link)
    let collection_logos_data: Record<any, any>[] = [];
    this.collection_logos.forEach( collection_logo => {
      if(collection_logo.file) {
        form_data.append('collection_logos[]', collection_logo.file);
      }
      collection_logos_data.push({
        'id': collection_logo.id, 'collection_id': collection_logo.collection_id, 'name': collection_logo.name,
        'size': collection_logo.size, 'extension': collection_logo.extension, file: collection_logo.file, path: collection_logo.path,
        'sort_order': collection_logo.sort_order, 'is_recent_logo': collection_logo.is_recent_logo})
    })
    let collection_logos_payload:Record<any, any> = []
    if(this.deleted_logos_ids.length){
      collection_logos_payload = collection_logos_data.filter((item, index)=>{
        return item.id !== this.deleted_logos_ids[index]
      })
    }else{
      collection_logos_payload = collection_logos_data;
    }

    if(collection_logos_data.length > 0) {
      form_data.append('collection_logos_data', JSON.stringify(collection_logos_payload))
    }
    // form_data.append('collection_logos', JSON.stringify(this.collection_logos))
    form_data.append('deleted_logos_ids', JSON.stringify(this.deleted_logos_ids))

    collectionItems.collection_products.forEach(function (item: Record<any, any>, index: number) {
      form_data.append('products[]',JSON.stringify({
        "product_nickname": item.product_nickname,
        "product_note": item.product_note,
        "product_price": item.product_price,
        "product_locker_room_id": item.product_locker_room.id,
        "order_number": (index + 1),
        "allow_title": item.allow_title,
        "allow_description": item.allow_description,
        "allow_price": item.allow_price
      }))
    })
    let res;
    let content = ''
    if (collectionItems.id == "") {
      res = await this.$store.dispatch('createNewCollection', form_data);
      if(res.status){
        await this.$store.dispatch('getCollections')
      }
    } else {
      form_data.append("_method", 'PUT')
      form_data.append('collection_id', collectionItems.id)
      res = await this.$store.dispatch('updateNewCollection', form_data);
      if(res.status){
        await this.$store.dispatch('getCollections')
        this.deleted_logos_ids = []
      }
    }
    this.showLoader = false;
    if (res.status) {
      this.openLockerModel(false);
      this.showToast(res.message, 'success')
      const payload = {"attribute": "locker_products", "value": []};
      this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS', payload)
      this.$store.commit('SET_COLLECTION_ITEMS', {id: "", name: "", link: "", collection_products: []})
      this.hideVModal('collection-modal')
    } else {
      this.showErrorArr(res.message)
    }
  }

  public openLockerModel(add_more_status:boolean, type = null) {
    this.$emit('showLockerRoomModal');
    if(type === "locker_room"){
      this.$store.dispatch("setCollectionMode","LOCKER_STORYBOARD");
    }
    if(add_more_status) {
      this.adding_more_product = true
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

  public handleLogoDeleteEvent(sort_order: number): void {
    let deleted_logo_index = findIndex(this.collection_logos, ['sort_order', sort_order])
    if(deleted_logo_index != -1) {
      const deleted_logo: Record<any, any> = this.collection_logos[deleted_logo_index]
      if(deleted_logo.id) {
        this.deleted_logos_ids.push(deleted_logo.id)
      }
      this.$set(this.collection_logos, deleted_logo_index, getCollectionLogoDefaultObj({sort_order: deleted_logo.sort_order}))
    }
  }

  public downloadCollectionPdf(collection_id) {
    this.showLoader = true;
    downloadNodeCollectionPDF(collection_id).then( () => {
      this.showLoader = false;
    })
    .catch(error => {
      this.showLoader = false;
    });
  }

  public addShopifyCollection(collection_id) {
    this.showLoader = true;
    const self = this as Record<any, any>
    let payload = {collection_id}
    http.post(`export-collection-to-shopify`, payload).then((res) => {
      this.showLoader = false;
      self.$store.commit('TOGGLE_EXPORTING_COLLECTION', {
        id: collection_id,
        name: this.collectionItems.name,
      });
      startExportStatusChecker();
      this.showToast('Exporting collection to Shopify is in progress. You will be notified when complete.','success')
    }).catch(err => {
      this.showLoader = false;
      if (err.response.status) {
        self.showToast('There is some problem in exporting. Try later.', 'error')
      }
    })
  }

  public removeShopifyCollection(collection_id) {
    this.showLoader = true;
    const self = this as Record<any, any>
    let payload = {collection_id}
    http.post(`remove-collection-on-shopify`, payload).then((res) => {
      this.showLoader = false;
      this.showToast('Collection removed from shopify successfully.','success')
      this.collectionItems.ecommerce_collection_id = null;
      Store.commit('UPDATE_COLLECTION_ECOMMERCE_ID', { collection_id, ecommerce_id: null });
    }).catch(err => {
      this.showLoader = false;
      if (err.response.status) {
        self.showToast('There is some problem in exporting. Try later.', 'error')
      }
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
