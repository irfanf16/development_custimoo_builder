<template>
  <span class="asdasd">
  <b-tabs content-class="mt-3" @activate-tab="lockerChanged">
    <template v-for="(room, i) in getLockerProducts">
      <b-tab  :key="i" :active="tabIndex === i">
        <template #title>
<!--          <span @drop="dropped" @dragover="allowDrop" @click="changeColor">{{room.room_name}}</span>-->
          <draggable :list="getLockerProducts" :options="{disabled:true}"><span @click="changeColor">{{room.room_name}}</span></draggable>
          <a class="remove-tab" @click="deleteRoom(room.id, i)">
            <font-awesome-icon :icon="['fas', 'trash-alt']"/>
          </a>
        </template>


        <div class="lockerroom-tabs">
          <div>
            <b-card no-body>
              <b-tabs card changed="currentTabs" @activate-tab="lockerTabUpdated" v-model="lockerActiveTabIndex">
                <b-tab title="Products">
                  <draggable  v-model="room.product" class="products-holder draggable grid mobile-cols-2 gap-4 grid-6" :multiDrag="true"
                             :options="{animation: 250, delayOnTouchOnly: true, delay: 500}" @change="lockerProductsMoved">
                    <div v-for="(product, ind) in room.product" :key="ind" class="products-block">
                      <label :key="ind" class="w-100" :class="product.class ? 'selected': ''" @click="product.class == undefined ? product.class = false : null; product.class = !product.class">
                        <div class="image-holder">
                          <div>

                            <b-form-checkbox :disabled="getDisabled(product.id)"  v-model="selectedCollectionProducts" v-bind:value="product.id"></b-form-checkbox>
                            <img :src="`${product.product_url}?q=${product.random_string}`" :class="product.product_url ? '' : 'placeholder'" alt="">
                          </div>
                        </div>
                        <div class="d-none d-lg-block product-description text-center">
                          <p>{{ product.product_name }}</p>
                        </div>
                      </label>

                      <ul class="product-icons">
                        <li>
                          <a data-title="Delete design" class="remove" @click="deleteProduct(i, ind, product.id)" @mouseleave="hideTooltip" @mouseenter="showTooltip"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                        </li>
                        <li>
                          <a data-title="Edit design" @click="editProduct(i, ind)" @mouseleave="hideTooltip" @mouseenter="showTooltip"><font-awesome-icon :icon="['fas', 'edit']" /></a>
                        </li>
                        <li>
                          <b-button data-title="Share design" :id="'share'+i+''+ind" @click="product.shared_url === undefined || product.shared_url === null  ? shareProduct(product, ind, i): ''" @mouseleave="hideTooltip" @mouseenter="showTooltip"><font-awesome-icon :icon="['fas', 'share-alt']" /></b-button>
                          <b-tooltip :target="'share'+i+''+ind" custom-class="share-tooltip" placement="bottom" triggers="focus">
                            <div class="share-holder">
                              <h3>Copy link
                                ..and Share</h3>
                              <div class="share-form">
                                <b-form inline>
                                  <b-form-input :id="'copy-'+ind" :value="product.shared_url !== 'undefined'  ?  baseUrl + product.shared_url : ''"

                                  ></b-form-input>
                                  <b-button variant="primary" @click="copyLink(product, ind) ">Copy Link</b-button>
                                </b-form>
                              </div>
                            </div>
                          </b-tooltip>
                        </li>
                        <li>
                          <a  @click="showDesignModal(product)">
                            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="copy" class="svg-inline--fa fa-copy" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M384 96L384 0h-112c-26.51 0-48 21.49-48 48v288c0 26.51 21.49 48 48 48H464c26.51 0 48-21.49 48-48V128h-95.1C398.4 128 384 113.6 384 96zM416 0v96h96L416 0zM192 352V128h-144c-26.51 0-48 21.49-48 48v288c0 26.51 21.49 48 48 48h192c26.51 0 48-21.49 48-48L288 416h-32C220.7 416 192 387.3 192 352z"></path></svg>
                          </a>
                        </li>
                        <li class="swap">
                          <a v-if="product.design.back_design_count > 0"  @mouseleave="hideTooltip" @mouseenter="showTooltip" :data-title="product.is_back_img ? 'Show front' : 'Show back' " @click="swapDesign(i, ind)" style="font-size: 1em">
                            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrows-rotate" class="svg-inline--fa fa-arrows-rotate fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 16c-17.67 0-32 14.31-32 32v74.09C392.1 66.52 327.4 32 256 32C161.5 32 78.59 92.34 49.58 182.2c-5.438 16.81 3.797 34.88 20.61 40.28c16.89 5.5 34.88-3.812 40.3-20.59C130.9 138.5 189.4 96 256 96c50.5 0 96.26 24.55 124.4 64H336c-17.67 0-32 14.31-32 32s14.33 32 32 32h128c17.67 0 32-14.31 32-32V48C496 30.31 481.7 16 464 16zM441.8 289.6c-16.92-5.438-34.88 3.812-40.3 20.59C381.1 373.5 322.6 416 256 416c-50.5 0-96.25-24.55-124.4-64H176c17.67 0 32-14.31 32-32s-14.33-32-32-32h-128c-17.67 0-32 14.31-32 32v144c0 17.69 14.33 32 32 32s32-14.31 32-32v-74.09C119.9 445.5 184.6 480 255.1 480c94.45 0 177.4-60.34 206.4-150.2C467.9 313 458.6 294.1 441.8 289.6z"></path></svg>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </draggable>

                </b-tab>
                <b-tab v-if="!getAddMoreCollectionStatus" title="Assets" class="assets-file">
                  <template v-for="(logo, inda) in room.logos">
                    <div :key="inda" class="assets-logo-block">
                      <img :src="storageUrl+logo.logo_url "/>
                      <button @click="addToCustomLogos(logo)" class="use-logo-btn">Use</button>
                    </div>
                  </template>
                </b-tab>
                <b-tab v-if="!getAddMoreCollectionStatus" title="Colors">
                  <div class="d-flex flex-wrap justify-content-between lockerroom-color-folders">
                    <div class="pt-lg-2 folder-wrapper">
                      <h3 class="w-100 d-block mb-3 mb-lg-4 text-bold">Select Folder</h3>
                      <div class="d-flex flex-wrap color-folder-holder">
                        <template v-for="(folder, inde) in room.folders">
                          <a href="#" class="text-center d-block" @click="fetchColors(inde, i)" :key="inde">
                            <font-awesome-icon :icon="['fas', 'folder']"/>
                            <span class="folder-name d-block">{{ folder.folder_name }}</span>
                          </a>
                        </template>
                      </div>
                    </div>
                    <div class="color-holder" v-if="colors">
                      <div class="color-container">
                        <template v-for="(item, ix) in colors">
                          <div :key="`item_${ix}`">
                            <div class="color-box"
                                 :style="{backgroundColor: item.value}" :key="`${ix}`">
                            </div>
                            <span> {{ item.name }} </span>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </b-tab>
                <b-tab v-if="!getAddMoreCollectionStatus && getCollections.length > 0"  title="Collections" class="designCollections">
                  <div class="products-holder grid gap-5 mobile-cols-2 grid-6">
                    <template v-for="(collection, index) in getCollections">
                      <div  :key="index" class="products-block">
                        <div class="image-holder">

                          <div class="convas_container" :key="collection_product_index" v-for="(collection_product,collection_product_index) in collection.collection_products">
<!--                            <b-form-checkbox v-model="selectedCollectionProducts" v-bind:value="collection.id"></b-form-checkbox>-->
                            <template v-if="collection_product_index < 3">
                              <img :src="collection_product.product_locker_room.product_url" :class="collection_product.product_locker_room.product_url ? '' : 'placeholder'" alt="">
                            </template>
                          </div>

                          <div class="controls">
                            <a v-b-tooltip.hover.right title="Delete collection" @click="deleteCollection(collection.id,index)" class="remove btn">
                              <font-awesome-icon :icon="['fas', 'trash-alt']"/>
                            </a>
                            <a v-b-tooltip.hover.right title="Edit collection" @click="editCollection(collection.id)" class="btn light btn-secondary rounded-circle"><font-awesome-icon :icon="['fas', 'edit']" /></a>
                            <b-button v-b-tooltip.hover.right title="Share collection" :id="`collection_${index}`" :target="`collection_${index}`" class="light rounded-circle"  custom-class="share-tooltip"><font-awesome-icon :icon="['fas', 'share-alt']" /></b-button>
<!--                            <a  :target="`collection_${index}`" class="btn light btn-secondary rounded-circle"><font-awesome-icon :icon="['fas', 'share-alt']" /></a>-->
                            <b-tooltip :target="`collection_${index}`" custom-class="share-tooltip" placement="bottom" triggers="focus">
                              <div class="share-holder">
                                <h3>Copy link and Share</h3>
                                <div class="share-form">
                                  <b-form inline>
                                    <b-form-input :ref="'copylink_'+index" :value="collection.file_name ?  `${collection_base_url}#/collection/${collection.file_name}/view`  : ''"
                                    ></b-form-input>
                                    <b-button variant="primary" @click="copyCollectionLink(index)">Copy Link</b-button>
                                  </b-form>
                                </div>
                              </div>
                            </b-tooltip>
                          </div>
                        </div>
                        <div class="d-none d-lg-block product-description text-center">
                          <p>{{ collection.name }}</p>
                        </div>
                      </div>
                    </template>
                  </div>
                 </b-tab>
              </b-tabs>
            </b-card>
          </div>
        </div>
      </b-tab>
    </template>

    <template #tabs-end>
      <b-nav-item v-b-tooltip.rightbottom.hover="'Add New Locker Room'" v-if="!getAddMoreCollectionStatus" role="presentation" class="add_new_locker" v-b-modal.modal-center-createlockerroom href="#">
        <span class="btn btn-secondary light">Add <BIconPlus /></span>
      </b-nav-item>
    </template>

    <CreateLockerRoomModal @lockerAdded="lockerAdded" />
    <ExistingCollectionModal @existingCollection="existingCollection" />
  </b-tabs>

     <confirm-modal message="Do you really want to delete" cancel_text="Cancel" confirm_text="Yes" ref="reset-modal"></confirm-modal>

    <span class="hover_tooltip"></span>
    <b-modal ref="copy-product-modal" hide-footer @hide="resetModal" id="modal-center-copydesign" centered scrollable size="xl" title="Copy Design" content-class="lockerroom-modal create-lockerroom-modal">
        <div class="pt-4 design-name-form">
            <b-form inline>
<!--                <label for="inline-form-input-productname" class="w-100 d-block mb-2">Design Name</label>-->
                <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
                    <b-input-group>
                        <b-form-input v-model="copiedProductName"   placeholder="Design Name"></b-form-input>
                    </b-input-group>
                  <b-form-select  v-model="copiedProductLockerId"   :options="lockers" value-field="id"
                                  text-field="room_name"></b-form-select>
                    <b-button variant="primary" @click="copyProductDesign">Copy</b-button>
                </div>
            </b-form>

          <div class="loader relative" v-if="viewLoader"><img src="../../src/assets/images/loading.gif" /></div>
        </div>
    </b-modal>
  </span>

</template>

<script lang="ts">
import {Component, Mixins, Prop, Vue, Watch} from 'vue-property-decorator'
import LockerRoomProducts from '@/components/LockerRoomProducts.vue'
import CreateLockerRoomModal from '@/components/CreateLockerRoomModal.vue'
import ExistingCollectionModal from '@/components/ExistingCollectionModal.vue'
import ErrorMessages from "@/mixins/ErrorMessages";
import Scene from "@/components/Scene.vue";
import draggable from "vuedraggable";
import html2pdf from "html2pdf.js"
import {http} from "@/httpCommon";
import ConfirmModal from "@/components/ConfirmModal.vue";
import {getRandom} from "@/helpers/Helpers";

@Component<LockerRoom>({
  components: {
    ConfirmModal,
    LockerRoomProducts,
    Scene,
    CreateLockerRoomModal,
    ExistingCollectionModal,
    draggable
  },
  mounted() {
    let href:any = location.href;
    href = href.split('#')
    this.collection_base_url = `${href[0]}`
    this.setCollections()
    if (this.lockers.length >0 ){
      this.copiedProductLockerId = this.lockers[0].id
    }
  }
})
export default class LockerRoom extends Mixins(ErrorMessages) {
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  private baseUrl = location.host+"/#/"
  public ref = this.$refs as Record<any, any>
  public colors : [] = []
  public tabIndex = 0
  public viewLoader = false
  public copiedProductId = 0
  public copiedProductName = ''
  public copiedProductLockerId = 0
  public url = ''
  public group = ''
  public collection_available = false;
  public lockerActiveTabIndex = this.$store.getters.getLockerActiveTabIndex;
  public collection_base_url = ''

  private setSelected(e:Record<any, any>){
    console.log('ev', e.target)
  }

  private showTooltip(e:Record<any, any>){
    document.querySelector('.hover_tooltip').style.opacity = '1'
    document.querySelector('.hover_tooltip').style.zIndex = '100'
    document.querySelector('.hover_tooltip').style.left = (e.clientX + 10)+'px'
    document.querySelector('.hover_tooltip').style.top = (e.clientY + 17)+'px'
    document.querySelector('.hover_tooltip').innerHTML = e.target.getAttribute('data-title')
    // alert(e.target.getAttribute('title'))
  }
  private hideTooltip(e:Record<any, any>){
    document.querySelector('.hover_tooltip').style.opacity = '0'
    document.querySelector('.hover_tooltip').style.left = '0'
    document.querySelector('.hover_tooltip').style.top = '0'
    document.querySelector('.hover_tooltip').style.zIndex = '-10'
  }

  public showConfirm(){
    this.ref['reset-modal'].showConfirm()
  }
  public chose(evt:Record<any, any>) {
    console.log('element index within parent: ',evt.oldIndex)
  }

  public collectionData = {}

  public async setCollections() {
    await this.$store.dispatch('getCollections')
  }
  get getAddMoreCollectionStatus(){
    return this.$store.getters.getAddMoreCollectionStatus;
  }
  get getLockerProducts():Record<any, any>{
    let main_product_id = this.$store.getters.getEditProductId;
    let locker_products = this.$store.getters.getLockerProducts.map((item: Record<any, any>) => {
      item.product = item.product.map((locker_product:Record<any, any>) =>{
        if(main_product_id == locker_product.id) {
          let random = getRandom();
          locker_product.product_url = `${locker_product.product_url}?${random}`;
        }
        return locker_product
      })
      return item
    })
   return locker_products;
  }

  get mainproductId():number{
    return this.$store.getters.getEditMainProductId
  }
  get getCollections():Record<any, any>{
    let main_product_id = this.$store.getters.getEditProductId;
    let collections = this.$store.getters.getCollections.map((item: Record<any, any>) => {
      item.collection_products = item.collection_products.map((collection:Record<any, any>) =>{
        if (collection.product_locker_room.id == main_product_id){
          let random = getRandom()
          collection.product_locker_room.product_url = `${collection.product_locker_room.product_url}?${random}`
        }
        return collection
      })
      return item
    })
    return collections
  }
  @Watch('getCollections', {
    deep: true
  })
  getCollectionsChanged(collections: [Record<any, any>]) {
    collections.forEach((collection: Record<any, any>, index: number) => {
      if(!collection.link) {
        this.generateCollectionPdf(collection, index)
      }
    })
  }

  public addDesignCollection = () => {
    this.$emit('hideLockerRoomModal');
    this.$emit('showCollectionModal');
  }


  get selected(){
    return this.group;
  }

  set selected(val){
    this.group = val;
  }

  get products():[Record<any, any>]{
    return this.$store.getters.getProducts
  }
  get customLogos():[Record<any, any>] {
    return this.$store.getters.getCustomLogos
  }
  get lockers():Record<any, any>{
    return  this.$store.getters.getLockers;
  }
  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }
  get customer():Record<any, any>{
    return  this.$store.getters.getCustomer
  }
  get logoTabIndex():number{
    return this.$store.getters.getActiveLogoIndex
  }

  public lockerAdded(){
    setTimeout(() => {
      let index = this.getLockerProducts.length -1
      this.tabIndex = index
    }, 1000)
  }
  public showDesignModal(product:Record<any, any>){
    this.copiedProductId = 0
    this.copiedProductId = product.id
    this.copiedProductLockerId = this.lockers[this.tabIndex].id
    let count = 0
    if (product.copy_count){
      count = product.copy_count + 1
    }
    this.copiedProductName = product.product_name + '(copy)'+(count == 1 || count == 0 ?  '' : count)
    this.ref['copy-product-modal'].show()
  }
  public resetModal(){
    this.copiedProductId = 0
    this.copiedProductName = ""
    this.copiedProductLockerId = this.lockers[this.tabIndex].id
  }
  public async copyProductDesign(){
    if(this.copiedProductName ==  ""){
      this.showError("please enter the design name")
      return false
    }
    this.viewLoader = true
    let res = await this.$store.dispatch('copyProductDesign', {id: this.copiedProductId, name: this.copiedProductName, room_id: this.copiedProductLockerId})
    if (res.status == 201){
      let room_ind = await this.lockers.findIndex((element:Record<any, any>) => element.id === this.copiedProductLockerId)
      this.$store.commit('UPDATE_COPY_COUNT', {room_ind: room_ind, id: this.copiedProductId})
      this.ref['copy-product-modal'].hide()
      this.copiedProductId = 0
      this.copiedProductLockerId = this.lockers[0].id
      this.copiedProductName = ""
      this.viewLoader = false
    }else{
      this.showError(res)
      this.viewLoader = false
    }
  }
  public async generateCollectionPdf(collection:Record<any, any>, index:number) {
    let res = await this.$store.dispatch('getCollection', collection.id)
    this.collection_available = true;
    this.collectionData = res
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
      html2pdf().set(opt).from(element).output('datauristring').then((pdf:any)=>{
        let arr = pdf.split(',');
        pdf = arr[1];
        let data = new FormData();
        data.append("data" , pdf);
        data.append('id' , collection.id);
        http.post('savepdf', data).then(res => {
          Vue.set(this.getCollections[index], 'link', res.data.link)
        })
      });
    }, 3000)
  }

  public lockerStatus = 'not_accepted'

  public async editProduct(lockerIndex: number, productIndex: number){
    const id = this.getLockerProducts[lockerIndex].product[productIndex].id
    const designId = this.getLockerProducts[lockerIndex].product[productIndex].design_id
    const styleId = this.getLockerProducts[lockerIndex].product[productIndex].style_id
    this.$store.commit('CHANGE_EDIT_STATUS', {id: id, status: true, designId: designId, styleId: styleId})
    const product_id = this.getLockerProducts[lockerIndex].product[productIndex].product_id;
    const element = this.getLockerProducts[lockerIndex].product[productIndex];
    if (product_id != this.$store.getters.getEditMainProductId){
      await this.$store.dispatch('ADD_CUSTOMIZED_PRODUCT', product_id);
      this.$store.commit('CHANGE_EDIT_STATUS', {product_id: product_id})
    }
    let ind = this.products.length - 1;
    await this.$store.dispatch('setSelectedIndex', {selectedIndex:ind});
    let selectedIndex = this.selectedProduct.productstyles.findIndex((x:Record<any, any>) => x.id === element.style_id);
    await this.$store.commit('CHANGE_STYLE_INDEX', selectedIndex);
    await this.$store.dispatch('OVERRIDE_CUSTOM_LOGOS', JSON.parse(element.custom_logos));
    await this.$store.dispatch('OVERRIDE_CUSTOM_TEXT', JSON.parse(element.text));
    await this.$store.dispatch('overRideDefaultColors', JSON.parse(element.defaultcolors));
    await this.$store.dispatch('overRideGroupColors', JSON.parse(element.groupcolors));
    this.selectedProduct.productstyles[selectedIndex].productdesigns.forEach((item: Record<any, any>) => {
      if (item.id == element.design_id){
        Vue.set(item, 'design_show', 1)
        this.$store.dispatch('setSelectedProductDesignID',item.id)
      }else{
        Vue.set(item, 'design_show', 0)
      }
    });
    this.$emit('hideLockerRoomModal')
  }
  public async shareProduct(product:Record<any, any>, ind:number, lockerIndex:number){
    try {
      let payload = { type: 'locker', id: product.id , customer_id :  this.customer ? this.customer.id : '', product_id: this.selectedProduct.product_id}
      let shared_url = "";
      if (product.shared_url){
        shared_url += product.shared_url;
      }else{
        let res = await this.$store.dispatch('shareProduct', payload);
        shared_url += res.data.url;
        Vue.set(this.getLockerProducts[lockerIndex].product[ind], 'shared_url',  shared_url)
      }
    }catch (error){
      console.log(error)
    }
  }
  public copyCollectionLink(ind:number){
    let toCopy = this.$refs['copylink_'+ind] as Record<any, any>
    toCopy = toCopy[0].$el as Record<any, any>
    toCopy.select()
    try {
      document.execCommand('copy');
      this.showToast('Shareable link was copied to your clipboard.', 'SUCCESS');
    } catch (err) {
      alert('Oops, unable to copy');
    }
  }
  public copyLink(product:Record<any, any>, ind:number){
    let testingCodeToCopy = document.querySelector('#copy-'+ind)  as Record<any, any>
    testingCodeToCopy.select()
    try {
      document.execCommand('copy');
      this.showToast('Shareable link was copied to your clipboard.', 'SUCCESS');
    } catch (err) {
      alert('Oops, unable to copy');
    }
  }
  public async deleteProduct(i:number, ind:number, id:number){
    const ok = await this.ref['reset-modal'].showConfirm()
    if (ok) {
      let res = await this.$store.dispatch('deleteRoomProduct', {room_index: i, product_index: ind, id:id});
      if (res == true){
        this.$store.commit('SET_RECENT_LOGOS')
        this.showToast('Product Deleted', 'SUCCESS')
      }else{
        this.showError(res)
      }
    }
  }
  public async deleteCollection(id:number,index:number){
    try{
      const ok = await this.ref['reset-modal'].showConfirm()
      if (ok) {
        let res = await this.$store.dispatch('deleteCollection', {id: id, index: index});
        this.showToast(res.data.message, 'SUCCESS');
      }
    }
    catch (e) {
      this.showError(e);
    }
  }
  public async deleteRoom(id:number, index:number){
    if (confirm('You are going to delete associated product')) {
      let res = await this.$store.dispatch('deleteRoom', {id: id, index: index});
      if (res == true){
        this.showToast('room deleted', 'SUCCESS')
      }else{
        this.showError(res);
      }
    }
  }

  public fetchColors(i:number, ind:number){
    this.colors = JSON.parse(this.getLockerProducts[ind].folders[i].color);
  }
  public changeColor(){
    this.colors = []
  }
  public addToCustomLogos(currentLogo:Record<any, any>){
    let index = this.logoTabIndex
    if (this.selectedProduct.is_logo_allowed && this.selectedProduct.logos_setting[index]){
      let logo = {
        logoIndex: index,
        id: currentLogo.id,
        url: currentLogo.logo_url,
        width: this.selectedProduct.logos_setting[index].width,
        height: this.selectedProduct.logos_setting[index].height,
        x_axis: this.selectedProduct.logos_setting[index].x_axis,
        y_axis: this.selectedProduct.logos_setting[index].y_axis,
        rotation: this.selectedProduct.logos_setting[index].rotation as number,
        haveControls: Boolean(!this.selectedProduct.logos_setting[index].is_locked),
        side: this.selectedProduct.logos_setting[index].side,
        customLogo: true,
        is_transparent: false
      }
      this.$store.dispatch('setCustomLogos', logo)
    }
    this.$emit('hideLockerRoomModal')
  }

  public get selectedCollectionProducts() {
    return this.$store.getters.getSelectedCollectionProducts
  }


  public set selectedCollectionProducts(val : Record<any, any>) {
    const payload = {"attribute":"locker_products","value":val};
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS',payload)
  }
  public editCollection(collection_id: number){
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS',{"attribute":"collection_id","value": collection_id})
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS',{"attribute":"locker_products","value": []})
    this.$emit('editCollectionModal')
    this.$emit('hideLockerRoomModal')
  }
  public existingCollection(){
    this.$emit('editCollectionModal')
    this.$emit('hideLockerRoomModal')
  }
  public getDisabled(locker_prd_id:number):boolean {
    if(this.getAddMoreCollectionStatus) {
      //let selected = this.$store.getters.getSelectedCollectionProducts
      let disabled = this.$store.getters.getDisabledProducts
      let res = disabled.find((id:number) => {
        return id == locker_prd_id
      })
      return !!res;
    }
    return false

  }

  public lockerTabUpdated(tab_info:[]) {
    this.$store.commit("Change_Locker_Active_Tab", tab_info);
  }

  public lockerProductsMoved(payload:any) {
   let moved_info = payload.moved;
   let old_index = moved_info.oldIndex;
   let new_index = moved_info.newIndex;
   let re_arranged_products = [];
   console.log('lockerActiveTabIndex',this.lockerActiveTabIndex)
   let products = this.getLockerProducts[this.tabIndex].product;
   let start_form = old_index > new_index ? new_index : old_index;
   let end_at = old_index > new_index ? old_index : new_index;
   for(let i=start_form; i<=end_at ;i++ ) {
      let product  = products[i];
      product.sort_order = i;
     re_arranged_products.push({
       id: product.id,
       sort_order: i + 1
     });
   }
   http.put(`locker/products/re_arrange`, {re_arranged_products: re_arranged_products}).then((res) => {
     console.log("response", res.data);
    }).catch(err => {
      if(err.response.status){
        //resp = {status:false,message:err.response.data.errors};
      }
    })
  }

  public swapDesign(lockerIndex: number, productIndex: number){
    let product: Record<any, any> = this.getLockerProducts[lockerIndex].product[productIndex];

    if(product.is_back_img==0){
      product.is_back_img = 1
      product.product_url = product.product_back_url
    }else{
      product.is_back_img = 0
      product.product_url = product.product_front_url
    }
    this.getLockerProducts[lockerIndex].product[productIndex] = product;
  }

  public lockerChanged(newTabIndex: number,  prevTabIndex: number, bvEvent: Record<any, any>) {
    this.tabIndex = newTabIndex
    /*
    * If locker collection tab is active and user switch to the locker then activate first tab (product tab)
    * */
    if(this.lockerActiveTabIndex == 3) {
      this.lockerActiveTabIndex = 0
    }
  }
}
</script>

<style lang="scss" scoped>
.lockerroom-modal .nav-tabs .add_new_locker .nav-link{
  border: none !important;
  padding: 0;
  .btn {
    font-size: 1em !important;
    line-height: normal;
  }
}

.lockerroom-header{
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  .locker-opener{
    max-width: 90%;
    padding: 15px;
    font-size: 18px;
    position: relative;
    overflow-x: auto;
    white-space: nowrap;
    @media only screen and (min-width: 992px){
      max-width: 100%;
      padding: 14px 30px;
      max-width: 80%;
    }
    .btn{
      padding: 5px 10px;
      margin: 0 5px 10px;
      position: relative;
      background: none;
      border-color: rgba(3,20,46,0.13);
      color: #03142E;
      font-size: 0.8rem;
      @media only screen and (min-width: 992px){
        padding: 10px 30px;
        margin: 0 10px 10px;
        font-size: 1rem;
      }
      &.active,
      &:hover{
        background: #219f84;
        color: #fff;
        border-color: #219f84;
      }
      .remove{
        position: absolute;
        right: -10px;
        top: -14px;
        width: 20px;
        height: 20px;
        font-size: 9px;
        color: #D53943;
        background: #F8E1E2;
        border-radius: 50%;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        @media only screen and (min-width: 992px){
          width: 30px;
          height: 30px;
          font-size: 12px;
        }
      }
    }
    .arrow{
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
      color: #219f84;
      font-size: 15px;
      display: none;
      @media only screen and (min-width: 992px){
        display: inline-block;
      }
      &.arrow-right{
        left: auto;
        right: 0;
      }
    }
  }

}
//.create-lockerroom{
//  .btn{
//    padding: 0;
//    font-size: 24px;
//    line-height: 1;
//    font-weight: 700;
//    color: #fff;
//    background: #219f84;
//    width: 24px;
//    height: 24px;
//    border-radius: 50%;
//    display: flex;
//    flex-wrap: wrap;
//    justify-content: center;
//    align-items: center;
//    border: none;
//    @media only screen and (min-width: 992px){
//      padding: 10px 30px;
//      border: 1px solid #E7F4F1;
//      border-radius: 0.25rem;
//      width: auto;
//      height: auto;
//      font-size: 14px;
//      font-weight: 400;
//    }
//    span{
//      @media only screen and (max-width: 991px){display: none;}
//    }
//  }
//}

.products-holder {
  width: 100%;
  //overflow-x: auto;
  //white-space: nowrap;
  //flex-wrap: nowrap;
  //padding-top: 7px;
  @media only screen and (min-width: 992px) {
    width: 100%;
    //overflow-x: hidden;
    //white-space: normal;
    //padding-top: 0;
  }

  .products-block {
    //flex: 0 0 22%;
    //margin: 0 0.3rem 10px;
    //display: inline-block;
    position: relative;
    @media only screen and (min-width: 992px) {
      //margin: 0 0.6rem 25px;
      //max-width: 22%;
    }
    @media only screen and (min-width: 1199px) {
      //flex: 0 0 18%;
      //max-width: 18%;
    }

    .image-holder {
      position: relative;
      margin: 0 0 15px;
      @media only screen and (min-width: 992px) {
        overflow: hidden;
      }
      &>div{
        width: 100%;
      }
      img {
        display: block;
        width: 100%;
        margin: 0 auto;
        height: auto;
        min-height: 100px;
      }
    }

    .product-icons {
      list-style: none;
      padding: 0;
      margin: 0;
      position: absolute;
      right: -5px;
      top: -5px;
      z-index: 1;
      height: 100%;
      display: flex;
      flex-direction: column;

      .swap{
        margin-top: auto;
      }
      @media only screen and (min-width: 992px) {
        right: 5px;
        top: 5px;
      }

      li {
        display: block;
        margin: 0 0 5px;
      }

      .btn,
      a {
        display: flex !important;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        width: 20px !important;
        height: 20px;
        font-size: 9px;
        color: #219f84;
        background: #E7F4F1;
        border-radius: 50%;
        cursor: pointer;
        border: none;
        border: 1px solid transparent;
        padding: 0;

        &:hover{
          border-color: #219f84;
        }

        @media only screen and (min-width: 992px) {
          width: 30px !important;
          height: 30px;
          font-size: 14px;
        }

        &.remove {
          background: #F8E1E2;
          color: #D53943;

          &:hover{
            border-color: #D53943;
          }
        }
      }
    }
  }

  //.products-holder{
  //    width: 100%;
  //    overflow-x: auto;
  //    white-space: nowrap;
  //    padding-top: 7px;
  //    @media only screen and (min-width: 992px){
  //        width: 100%;
  //        overflow-x: hidden;
  //        white-space: normal;
  //        padding-top: 0;
  //    }
  //    .products-block{
  //        flex: 0 0 22%;
  //        max-width: 22%;
  //        margin: 0 0.3rem 10px;
  //        display: inline-block;
  //        @media only screen and (min-width: 992px){
  //            margin: 0 0.6rem 25px;
  //        }
  //        @media only screen and (min-width: 1199px){
  //            flex: 0 0 18%;
  //            max-width: 18%;
  //        }
  //        .image-holder{
  //            position: relative;
  //            margin: 0;
  //            @media only screen and (min-width: 992px){overflow: hidden;}
  //            img{
  //                display: block;
  //                max-width: 100%;
  //                margin: 0 auto;
  //                height: auto;
  //            }
  //            .product-icons{
  //                list-style: none;
  //                padding: 0;
  //                margin: 0;
  //                position: absolute;
  //                right: -5px;
  //                top: -5px;
  //                z-index: 1;
  //                @media only screen and (min-width: 992px){
  //                    right: 5px;
  //                    top: 5px;
  //                }
  //                li{
  //                    display: block;
  //                    margin: 0 0 5px;
  //                }
  //                a{
  //                    display: flex;
  //                    flex-wrap: wrap;
  //                    justify-content: center;
  //                    align-items: center;
  //                    width: 20px;
  //                    height: 20px;
  //                    font-size: 9px;
  //                    color: #219f84;
  //                    background: #fff;
  //                    border-radius: 50%;
  //                    @media only screen and (min-width: 992px){
  //                        width: 30px;
  //                        height: 30px;
  //                        font-size: 14px;
  //                    }
  //                    &.remove{
  //                        background: #F8E1E2;
  //                        color: #D53943;
  //                    }
  //                }
  //            }
  //        }
  //    }
  //}
}
.lockerroom-color-folders{
  position: relative;
  .folder-wrapper{
    flex: 0 0 50%;
    max-width: 50%;
    @media only screen and (min-width: 1200px){
      flex: 0 0 70%;
      max-width: 70%;
    }
    h3{
      font-weight: 600;
      @media only screen and (min-width: 992px){
        font-size: 20px;
      }
    }
    a{
      margin: 0 10px 12px;
      font-size: 10px;
      flex: 0 0 38%;
      max-width: 38%;
      @media only screen and (min-width: 768px){
        font-size: 10px;
        flex: 0 0 19%;
        max-width: 19%;
      }
      @media only screen and (min-width: 1200px){
        font-size: 14px;
        flex: 0 0 13%;
        max-width: 13%;
      }
      svg{
        font-size: 32px;
        display: block;
        margin: 0 auto 10px;
        fill: #219f84;
        color: #219f84;
        @media only screen and (min-width: 768px){
          font-size: 46px;
        }
      }
    }
  }
  .color-holder{
    flex: 0 0 45%;
    max-width: 45%;
    position: absolute;
    right: 0;
    top: 0;
    width: 100%;
    height: 100%;
    max-height: 180px;
    @media only screen and (min-width: 768px){
      max-height: 300px;
      top: 50%;
      transform: translateY(-50%);
    }
    @media only screen and (min-width: 1200px){
      flex: 0 0 25%;
      max-width: 25%;
    }
    &::-webkit-scrollbar{
      display: none;
    }
    .color-container{
      gap: 7px;
      @media only screen and (min-width: 410px){
        gap: 35px;
      }
      @media only screen and (min-width: 768px){
        gap: 25px;
      }
      @media only screen and (min-width: 1200px){
        gap: 7px;
      }
      @media only screen and (min-width: 1274px){
        gap: 7px;
      }
      .color-box{
        margin: 0 auto 5px;
      }
    }
  }
  .color-folder-holder{
    overflow-y: auto;
    max-height: 20vh;
    @media only screen and (min-width: 768px){max-height: 50vh;}
  }
}

.assets-logo-block{
  position: relative;
  &:hover{
    .use-logo-btn{transform: scale(1);}
  }
}

.use-logo-btn{
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1;
  color: #fff;
  text-transform: uppercase;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  transform: scale(0);
  width: 100%;
  border: none;
}

.loader{
  position: absolute;
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
  background: rgba(255,255,255,0.9);
  z-index: 1030;
  img{
    max-width: 7%;
    display: block;
    margin: 0 auto;
    height: auto;
  }
}





</style>
