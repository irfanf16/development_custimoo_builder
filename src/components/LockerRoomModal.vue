<template>
  <span>
    <modal :width="screenWidth"
           :resizable="true"
           :scrollable="true"
           height="auto"
           :reset="true"
           :shiftY="0"
           class="absolute-modals"
           name="locker-modal" ref="locker-modal" id="modal-center-lockerroom" size="xl" :hide-footer="!selectedCollectionProducts.length>0"
           @close="$store.commit('Change_Locker_Active_Tab', 0)">
      <div class="modal-header d-flex justify-content-between">
        <span class="fs-5 font-weight-bold">Locker Room</span>
        <div class="d-flex gap-2">
          <span v-b-tooltip.leftbottom.hover="'Close locker room'" class="add_new_locker" >
            <span class="btn btn-secondary light" style="white-space: nowrap" @click="closeLockerModal(getSelectionMode.shopAddmoreMode ? 'shop-modal' : '')"> Close</span>
          </span>
          <span v-b-tooltip.leftbottom.hover="'Add New Locker Room'" v-if="!getSelectionMode.readonly"
                role="presentation" class="add_new_locker" v-b-modal.modal-center-createlockerroom >
            <span class="btn btn-secondary" style="white-space: nowrap" @click="showVModal('create-modal')">Add <BIconPlus/></span>
          </span>
        </div>
<!--        <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hideVModal('locker-modal')"><BIconX /></span>-->
      </div>
      <div class="modal-content lockerroom-modal">
        <div id="modal-center-lockerroom" class="modal-body" ref="locker-modal-body">
          <LockerRoom ref="lockerRoom" :products_fonts="products_fonts" :is_shops_tab_active="isShopsTabActive"
                      @hideLockerRoomModal="hideVModal('locker-modal')"
                      @showCollectionModal="showCollectionModal" @lockerModalOpened="lockerModalOpened"
                      @editCollectionModal="editCollectionModal" :opacityset="opacityset"
                      @setOpacity="setOpacity" @showShopModal="showShopModal" @editShopModal="editShopModal"
                      @isElementOverflowingContainer="isElementOverflowingContainer"
                      />
        </div>
      </div>

      <div v-if="shopMode" class="text-right modal-footer">
        <b-button @click="addProductsToShop" variant="secondary" class="light">Add Products To Shop</b-button>
        <b-button @click="cancelAddingProductsToShop" variant="secondary" class="light">Cancel</b-button>
      </div>
      <template v-else>
        <div v-if="!getSelectionMode.readonly && lockerActiveTabIndex == 0" class="text-right modal-footer">
        <b-button v-if="$can('create-shop') && selectedCollectionProducts.length>0" :disabled="$store.getters.getCartLoading" @click="createShop">Create a shop</b-button>
        <b-button
        v-if="canAccessCompanyFeatures() && (selectedCollectionProducts.length > 0)"
          variant="secondary"
          @click="handleAddToCart"
          :disabled="$store.getters.getCartLoading">
          {{ $store.getters.getCartLoading ? 'Adding to Cart...' : 'Add to Cart' }}
          <span v-if="selectedCollectionProducts.length > 0 && !$store.getters.getCartLoading" class="badge badge-light ml-2">
            {{ selectedCollectionProducts.length }}
          </span>

            <img v-if="$store.getters.getCartLoading" width="20" height="20" src="@assets/images/loading.gif"/>

        </b-button>
        <b-button v-if="selectedCollectionProducts.length>0" :disabled="$store.getters.getCartLoading"  @click="addExistingDesignCollection"  v-b-modal.modal-center-existingCollection variant="secondary" style="margin-right: 5px">Add to existing collection</b-button>
        <b-button v-if="selectedCollectionProducts.length>0" :disabled="$store.getters.getCartLoading" @click="addDesignCollection" variant="secondary">Create new collection</b-button>

        </div>
        <div v-else class="text-right modal-footer">
         <b-button
          v-if="selectedCollectionProducts.length > 0 && !$store.getters.getSelectionMode.shopAddmoreMode"
          variant="primary"
          @click="handleAddToCart"
          :disabled="$store.getters.getCartLoading">
          {{ $store.getters.getCartLoading ? 'Adding to Cart...' : 'Add to Cart' }}
          <span v-if="selectedCollectionProducts.length > 0" class="badge badge-light ml-2">
            {{ selectedCollectionProducts.length }}
          </span>
        </b-button>
        <b-button v-if="selectedCollectionProducts.length > 0 && ($store.getters.getSelectionMode.readonly && $store.getters.getSelectionMode.collectionAddmoreMode)" @click="addMoreCollectionModal" variant="secondary">Add Products</b-button>
        </div>
      </template>
    </modal>
    <ShopModal @shop-model-closed="handleShopModalCloseEvent" />
  </span>

</template>

<script lang="ts">
import {Component, Vue, Mixins, Prop} from 'vue-property-decorator'
import LockerRoom from '@/components/LockerRoom.vue'
import ModalAction from '@/mixins/ModalAction'
import { canAccessCompanyFeatures, getLockerRoomSelectedProducts, getShopDefaultObject, getShopProductsFromLockerProducts} from "@/helpers/Helpers";
import ShopModal from '@/components/ShopModal.vue';
import { find, findIndex, flatMap } from 'lodash';

@Component({
  components: {
    LockerRoom,
    ShopModal
  }
})
export default class LockerRoomModal extends Mixins(ModalAction){
  @Prop() products_fonts!: Record<string, any>;
  public ref = this.$refs as Record<any, any>
  private mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  private screenWidth = this.mobileScreen ? window.screen.availWidth : (window.screen.availWidth - 100)

  public isShopsTabActive = false

  public company = this.$store.getters.getCompany;
  private opacityset = false;
  public setOpacity (toSet){
    this.opacityset = toSet
  }

  private showCollectionModal = () => {
    this.$emit('showCollectionModal')
  }
  private showShopModal = () => {
    this.$emit('showShopModal')
  }

  private closeLockerModal(back_to_modal=''){
    this.hideVModal('locker-modal')
    this.isShopsTabActive = false
    this.$store.commit('RESET_SHOP_STATE')
  }

  private lockerModalOpened(callback:() => any){
    const locker_modal = this.$refs['locker-modal'] as Record<any, any>
    locker_modal.open(callback())
  }

  public addExistingDesignCollection(){
    this.$store.dispatch("setCollectionMode","COLLECTION");
    this.showVModal('existing-collection-modal');
  }

  public editCollectionModal = () => {
    this.$store.commit('SET_COLLECTION_ITEMS', {id: "", name: "", link: "", collection_products: []})
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS',{"attribute": "deleted_products", "value": []})
    this.$emit('editCollectionModal')
 }

  public editShopModal = () => {
    this.$store.commit('SET_COLLECTION_ITEMS', {id: "", name: "", link: "", collection_products: []})
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS',{"attribute": "deleted_products", "value": []})
    this.$emit('editShopModal')



 }

  public addMoreCollectionModal = () => {
    if(this.$store.getters.getSelectionMode.shopAddmoreMode){
      this.$emit('editShopModal')
    }else{
      this.$emit('editCollectionModal')
    }
    this.hideVModal('locker-modal')
    this.$store.commit('SET_SELECTION_MODE', {
      readonly: false,
      collectionAddmoreMode: false,
      shopAddmoreMode: false,
      eventProductMode: false,
      eventCollectionMode: false
    })
  }

  public isElementOverflowingContainer(element:Record<any, any>) {
    setTimeout(()=>{
      if(element && this.ref['locker-modal-body']){
        const elementRect = element.getBoundingClientRect();
        const containerRect = this.ref['locker-modal-body'].getBoundingClientRect();

        const isOverflowingHorizontally = elementRect.right > containerRect.right || elementRect.left < containerRect.left;
        const isOverflowingVertically = elementRect.bottom > containerRect.bottom || elementRect.top < containerRect.top;

        const overflowInfo = {
          horizontal: isOverflowingHorizontally,
          vertical: isOverflowingVertically,
        };

        let horizontalDifference = elementRect.right - containerRect.right + 15
        if(overflowInfo.horizontal){
          element.style.marginLeft = `${horizontalDifference * -1}px`
        }
        this.opacityset = true
      }
    }, 10)
  }

  public addDesignCollection () {
    this.$store.dispatch("setCollectionMode","COLLECTION");
    this.ref['lockerRoom'].addDesignCollection();
    this.$store.commit("Change_Locker_Active_Tab", 3)
  }
  public createShop () {
    this.$store.commit('SET_SHOP_MODE', "creating");
    const shopProducts = getShopProductsFromLockerProducts(getLockerRoomSelectedProducts())
    let shopData = getShopDefaultObject()
    shopData.products = shopProducts
    this.$store.commit('SET_SHOP', shopData)
    this.showVModal('create-update-shop-modal')
    this.hideVModal('locker-modal')
  }
  public handleShopModalCloseEvent() {
    // this.$store.commit('SET_SHOP_MODE', null);
    if(!this.$store.getters.getShopMode) {
      this.isShopsTabActive = true
    }
  }
  public addProductsToShop() {
    const shopProducts = getShopProductsFromLockerProducts(getLockerRoomSelectedProducts())
    this.$store.commit('UPDATE_SHOP', {shopUpdatedData: {products: shopProducts}})
    this.showVModal('create-update-shop-modal')
    this.hideVModal('locker-modal')
  }
  public cancelAddingProductsToShop() {
    this.showVModal('create-update-shop-modal')
    this.hideVModal('locker-modal')
  }

  get shopMode() {
    return this.$store.getters.getShopMode
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
  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }
  get customerPermissions() {
    return this.$store.getters.getCustomerPermissions
  }
  public canAccessCompanyFeatures(): boolean {
    return canAccessCompanyFeatures()
  }

  // Add after other methods in the LockerRoomModal class
  public async handleAddToCart() {
    try {
      const lockerRoom = this.$refs.lockerRoom as any;

      if (!lockerRoom || this.selectedCollectionProducts.length === 0) {

        return;
      }

      // Get selected products from LockerRoom component
      const selectedProducts = lockerRoom.getLockerProducts
        .flatMap(locker => locker.product)
        .filter(product => this.selectedCollectionProducts.includes(product.id));

      // Call addBulkToCart on LockerRoom component
      const result = await lockerRoom.addBulkToCart(selectedProducts);

      // Clear selections after successful add
      if (result.success.length > 0) {
        this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS', {
          attribute: "locker_products",
          value: []
        });

        // Optionally close the modal after adding to cart
        this.hideVModal('locker-modal');
      }

    } catch (error) {

      console.error('Add to cart error:', error);
    }
  }

  // Add computed property for cart loading state
  get isCartLoading(): boolean {
    return this.$store.getters.getCartLoading;
  }
}
</script>
