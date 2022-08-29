<template>
  <div>
    <div class="loader" v-if="showLoader"><img src="../../src/assets/images/loading.gif"/></div>
    <div v-if="collection">
      <a :href="`${storageUrl}${collection.link}`" download target="_blank" class="download-pdf rounded-circle btn btn-secondary light"><BIconDownload /></a>
      <div id="collectionPdfContainer">
        <div v-if="company.id == 1" class="pdf_cover">
          <h1 class="text-white p-4">{{ collection.name }} </h1>

          <div class="logo">
            <img src="../../src/assets/logo.png" alt="Logo">
          </div>
        </div>

        <div class="pdf_page" v-for="(products_chunks,idx)  in collection.collection_products" :key="idx" :style="{ background: company.id == 1? `url('img/page_background.png') no-repeat center` : `url('img/page_background_2.png') no-repeat center` }">
          <table class="print-table">
            <tbody>
            <tr>
              <td colspan="3" class="pdf_collection">
                <h1>{{ collection.name }} </h1>
              </td>
            </tr>
            <tr >
              <td v-for="(collection_product, idxs) in products_chunks" :key="idxs">
                <template v-if="collection_product.allow_title && collection_product.product_locker_room && collection_product.product_locker_room.model_description">
                  <div style="font-weight: 600; font-size: larger; word-wrap: break-word" v-html="collection_product.product_locker_room.model_description.model_name">
                  </div>
                </template>
                <template v-else="">
                  <div style="font-weight: 600; font-size: larger; word-wrap: break-word; opacity: 0" >
                    N/A
                  </div>
                </template>

                <div style="word-wrap: break-word">
                  {{collection_product.product_nickname ? collection_product.product_nickname : '' }}
                </div>
                <div>
                  <table class="images-holder">
                    <tbody>
                    <tr>
                      <td>
                        <div class="position-relative overflow-hidden download-design">
                          <a :href="`${collection_product.product_locker_room.locker_product_images_folder}/front.png?q=${collection_product.product_locker_room.random_string}`" download v-b-tooltip title="Download image" target="_blank" class="rounded-circle btn btn-secondary light"><BIconDownload /></a>
                          <img :src="`${collection_product.product_locker_room.locker_product_images_folder}/front.png?q=${collection_product.product_locker_room.random_string}`" alt="">
                        </div>
                      </td>
                      <td>
                        <div class="position-relative overflow-hidden download-design">
                          <a :href="`${collection_product.product_locker_room.locker_product_images_folder}/back.png?q=${collection_product.product_locker_room.random_string}`" download v-b-tooltip title="Download image" target="_blank" class="rounded-circle btn btn-secondary light"><BIconDownload /></a>
                          <img :src="`${collection_product.product_locker_room.locker_product_images_folder}/back.png?q=${collection_product.product_locker_room.random_string}`" alt="">
                        </div>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </div>
                <div class="pdf_description" v-if="collection_product.allow_description">
                  <strong>Product Info: </strong>
                  <template v-if="collection_product.product_locker_room && collection_product.product_locker_room.model_description && collection_product.product_locker_room.model_description.product_model_description">
                    <span v-html="collection_product.product_locker_room.model_description.product_model_description"></span>
                  </template>
                </div>
                <div class="pdf_description"><strong>Description: </strong>
                  {{ collection_product.product_note }}
                </div>
                <div class="pdf_price" v-if="collection_product.allow_price && collection_product.product_price"><strong>Price: </strong>
                  {{collection_product.product_price}}
                </div>
              </td>
            </tr>
            </tbody>
          </table>
          <div class="pdf_description" style="display: flex;flex-direction: row-reverse;">
            <template v-if="isAuthenticated">
              <button  class="btn btn-secondary" style="width:10%" v-if="!CartLoading" @click="addToCart">
                Purchase
              </button>
              <button v-else class="btn btn-secondary" style="width:10%" :disabled="true" >
                <img width="20" height="20" src="../../src/assets/images/loading.gif" />
              </button>
            </template>
            <template v-else>
              <button  class="btn btn-secondary" style="width:10%" v-if="!CartLoading"  @click="setActionBeforeLogin('addToCart')">
                Purchase
              </button>
              <button v-else class="btn btn-secondary" style="width:10%" :disabled="true" >
                <img width="20" height="20" src="../../src/assets/images/loading.gif" />
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
    <LoginForm ref="loginModal" @actionAfterLogin="actionAfterLogin()" />
    <template>
      <modal id="modal-scrollable" :width="screenWidth"
             :resizable="true"
             :scrollable="true"
             height="auto"
             :reset="true"
             :shiftY="0"
             @opened="$emit('setRosterOpen', true)"
             name="rostermodal" class="roster-modal" size="xl"
             footer-class="hide-modal-footer d-none"
             @closed="close"
      >
        <div class="modal-header d-flex justify-content-between">
          <span class="fs-5 font-weight-bolder">Edit {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}}</span>
          <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="close"><BIconX /></span>
        </div>
        <div class="modal-body">
          <div class="d-flex flex-wrap justify-content-between">
            <RosterDetails ref="rosterDetailsModal" :productSizes="sizeOptions"  :lockerRosters="products_roster" @addPlayer="rosterDetailsInit"/>
            <div class="roster-preview-area">
              <CustomizationPreview :designs="products[designsIndex]"/>
            </div>
          </div>
        </div>
      </modal>
    </template>
    <CartModal ref="cartModal" :mainTotalTabs="mainTotalTabs" @deleteCartItem="deleteCartItem" v-if="customer"/>
    <confirm-modal message="Do you really want to delete?" cancel_text="Cancel" confirm_text="Yes" name="delete-cart-item" ref="delete-cart-item"></confirm-modal>
  </div>

</template>

<script lang="ts">
import {Component, Mixins, Vue, Watch} from 'vue-property-decorator'
import {http} from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";
import LoginForm from '@/components/LoginForm.vue'
import {LockerProducts,handleMainProducts} from "@/mixins/LockerProduct"
import {getRosterDetailDefaultObject} from "@/helpers/Helpers";
import ModalAction from "@/mixins/ModalAction";
import CustomizationPreview from '@/components/CustomizationPreview.vue'
import RosterDetails from '@/components/RosterDetails.vue'
import {findIndex} from "lodash";
import CartModal from "@/components/CartModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";



@Component<CollectionViewPDF>({
  components: {LoginForm,CustomizationPreview,RosterDetails,CartModal,ConfirmModal},
  async mounted() {
    this.getCollection()
    this.$store.dispatch('setCartIconShow',true);
    this.$store.dispatch('setCollectionView',true);

    if (this.isAuthenticated){
      let res  = await http.get("products/roster")
      if (res.status == 200){
        this.products_roster = res.data
      }
      await this.$store.dispatch('getCartServer', {})
      this.$root.$on('showCartModal', () =>{
        let self = this;
        self.showVModal('cart-modal')
      })

    }
    this.$root.$on('getNextProduct', () => {
      this.addToCart();
      if(this.room_products.length > 0 && (this.room_product_index > (this.room_products.length -1))){
        this.hide();
      }
    });
  },

  async destroyed() {
    this.$store.dispatch('setCartIconShow',false);
    this.$store.dispatch('setCollectionView',false);
  }
})

export default class CollectionViewPDF extends Mixins(ErrorMessages,LockerProducts,handleMainProducts,ModalAction) {

  public showLoader = false
  public storageUrl = process.env.VUE_APP_STORAGE_URL
  public collection = null;
  public ref = this.$refs as Record<any, any>
  private mainTotalTabs = 0
  public products_roster: Record<any, any>[] = []
  public sizeOptions: Record<any, any>[] = []
  private screenWidth = (window.screen.availWidth - 100);
  public designsIndex = 0
  public selectedItemIndex: number|null  = null;
  public room_products = [];
  public room_product_index = 0;
  public CartLoading = false;

  public show_roster = false;

  get customTextObjects(){
    return this.$store.getters.customTextObjects;
  }

  get editing_roster_player_index(): number {
    return this.$store.getters.getEditingRosterPlayerIndex
  }

  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails()
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts()
  }

  get actionBeforeLogin(): string {
    return this.$store.getters.getActionBeforeLogin
  }

  public gotoLogin(){
    if (this.company.platform == 'self'){
      this.$modal.show('loginModal')
    }
    else{
      if(this.company.login_code.type == 'url') {
        window.location.href = this.company.login_code.action
      } else {
        eval(this.company.login_code.action)
      }
    }
  }
  public async setActionBeforeLogin(type: string) {
    this.$store.commit("ACTION_BEFORE_LOGIN", type);
    this.$store.commit('SET_SELECTION_MODE',{
      readonly:false,
      collectionAddmoreMode:false,
      eventProductMode:false,
      eventCollectionMode:false
    })
    this.gotoLogin()
  }


  public actionAfterLogin() {
    if(this.actionBeforeLogin == 'addToCart') {
      this.addToCart();
    }
    this.$store.commit("ACTION_BEFORE_LOGIN", '');
  }

  get rosterFirstNameAndNumber(): string | null {
    if (this.selectedProduct && this.rosterDetails && this.rosterDetails.length > 0) {
      // |;| is just name and number separator
      let roster_text = this.rosterDetails[this.editing_roster_player_index].text ? this.rosterDetails[this.editing_roster_player_index].text : ''
      let roster_num = this.rosterDetails[this.editing_roster_player_index].number ? this.rosterDetails[this.editing_roster_player_index].number : ''
      return `${roster_text}|;|${roster_num}`;
    } else {
      return null;
    }
  }

  @Watch('rosterFirstNameAndNumber', { deep: true })
  async onRosterFirstNameAndNumberChanged(newVal: string) {
    if(this.selectedProduct){
      let name = "";
      let number = "";
      if (newVal) {
        let name_and_number_array = newVal.split("|;|");
        name = name_and_number_array[0]? name_and_number_array[0] : ""
        number = name_and_number_array[1]? name_and_number_array[1] : ""
      }
      let custom_text = this.$store.getters.getCustomTexts()

      if (custom_text) {
        const custom_name_index = findIndex(this.customTexts, { type: 'name' })
        const custom_number_index = findIndex(this.customTexts, { type: 'number' })
        let roster_details = this.rosterDetails;
        let svg_object:Record<any,any> = {}
        if (custom_name_index != -1) {
          await this.$store.dispatch('updateCustomTextAttribute', { index: custom_name_index, attribute: 'text', value: name })
          if(name){
            const interval = setInterval(() => {
              if(this.customTextObjects[custom_name_index] && name == this.customTextObjects[custom_name_index].text && this.customTextObjects[custom_name_index].constructor.name === 'klass' )
                svg_object['name'] = {
                  svg : this.customTextObjects[custom_name_index].toSVG(),
                  placement : this.customTextObjects[custom_name_index].side,
                  width : this.customTextObjects[custom_name_index].width,
                  height : this.customTextObjects[custom_name_index].height,
                  scaleX : this.customTextObjects[custom_name_index].scaleX,
                  scaleY : this.customTextObjects[custom_name_index].scaleY,
                  rotation: this.customTexts[custom_name_index].rotation,
                  original_height: this.customTexts[custom_name_index].originalHeight,
                }
              roster_details[this.editing_roster_player_index].svgs = svg_object;
              clearInterval(interval)
            }, 500)
          }else{
            svg_object['name'] = {
              svg : null,
              placement : null,
              width : null,
              height : null,
              scaleX : null,
              scaleY : null,
              rotation:null,
              original_height: null
            };
            roster_details[this.editing_roster_player_index].svgs = svg_object
          }
          this.$store.commit('UPDATE_ROSTER',roster_details);
        }
        if (custom_number_index != -1) {
          await this.$store.dispatch('updateCustomTextAttribute', { index: custom_number_index, attribute: 'text', value: number })
          if(number){
            const interval = setInterval(() => {
              if (this.customTextObjects[custom_number_index] && number == this.customTextObjects[custom_number_index].text && this.customTextObjects[custom_number_index].constructor.name === 'klass') {
                svg_object['number'] = {
                  svg: this.customTextObjects[custom_number_index].toSVG(),
                  placement: this.customTextObjects[custom_number_index].side,
                  width: this.customTextObjects[custom_number_index].width,
                  height: this.customTextObjects[custom_number_index].height,
                  scaleX: this.customTextObjects[custom_number_index].scaleX,
                  scaleY: this.customTextObjects[custom_number_index].scaleY,
                  rotation: this.customTexts[custom_number_index].rotation,
                  original_height: this.customTexts[custom_name_index].originalHeight,
                };
                roster_details[this.editing_roster_player_index].svgs = svg_object;
                clearInterval(interval)
              }
            }, 500)
          }else{
            svg_object['number'] = {
              svg : null,
              placement : null,
              width : null,
              height : null,
              scaleX : null,
              scaleY : null,
              rotation:null,
              original_height: null
            };
            roster_details[this.editing_roster_player_index].svgs =  svg_object;
          }
          this.$store.commit('UPDATE_ROSTER',roster_details);
        }
      }
    }
  }


  get products(){
    return this.$store.getters.getProducts;
  }

  get company() {
    return this.$store.getters.getCompany
  }

  get isAuthenticated(){
    return this.$store.getters.isCustomerAuthenticated;
  }

  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }

  public async show(){
    this.showVModal('rostermodal')
  }

  public hide(){
    this.hideVModal('rostermodal')
  }

  public close(){
    const self = this;
    this.$store.commit('SET_REVERT_ROSTER_BOOL',true);
    self.$modal.hide('rostermodal')
  }

  public setProductSizes() {
    if(this.show_roster){
      this.productSizes.forEach((size: any, key: number) => {
        let sizes = {value: size.name, text: size.name}
        this.sizeOptions = this.sizeOptions.concat([sizes])
      })
    }else{
      this.sizeOptions = [];
    }
  }

  get cartItems() {
    return this.$store.getters.getCartItems
  }

  get customer():Record<any, any>{
    return  this.$store.getters.getCustomer
  }

  getCollection(): void {
    this.showLoader = true
    const collection_file_name = this.$route.params.collection_file_name;
    http.get(`/collection/${collection_file_name}/view`).then(async (response: any) => {
        this.collection = response.data.result.collection
        this.showLoader = false
        this.room_products = await this.getRoomProducts();
      })
      .catch((e: any) => {
        this.showLoader = false
        this.showError(e.response.data.message)
        this.$router.push('/')
      });
  }

  public rosterDetailsInit(index = 0, product = this.selectedProduct) {
    let payload = getRosterDetailDefaultObject(product)
    if(this.sizeOptions.length > 0) {
      payload.size = this.sizeOptions[0].text;
      payload.code = this.sizeOptions[0].value;
    }
    this.$store.dispatch('setRosterDetails', { pid : product.id, index: index, roster: payload })
  }


  async addToCart(){
    var self = this;
    if(self.room_products.length > 0 && (self.room_product_index <= (self.room_products.length -1))){
      self.CartLoading = true;
      let room_product = self.room_products[self.room_product_index];
        if(self.isAuthenticated){
          await self.fetchLockerProduct(room_product.room_id,room_product.product);
          setTimeout(async ()=> {
            self.show_roster = true;
            await self.setProductSizes();
            await this.show();
            setTimeout(()=>{
              self.ref['rosterDetailsModal'].fontsColorsManipulation();
              self.ref['rosterDetailsModal'].fontsList();
            },500)
          },1500);
          self.CartLoading = false;
          self.room_product_index = self.room_product_index + 1 ;
        }
        else{
          this.ref['loginModal'].show();
        }
      }

  }
  async deleteCartItem(item:Record<any,any>){
    const response = await this.ref['delete-cart-item'].showConfirm();
    if(response){
      const url = `carts/cart-items/${item.cart_item.id}/factory_product/${item.factory_product.id}`
      http.delete(url).then(async (response:Record<any,any>) => {
        await this.$store.dispatch('getCartServer', {});
        if(this.cartItems && !this.cartItems.length){
          this.ref['cartModal'].hide();
        }
        this.showToast(response.data.message, 'SUCCESS')
      }).catch((e:any)=>{
        this.showError(e);
        this.ref['cartModal'].hide();
      });
    }
  }
  get productSizes(){
    if(this.show_roster){
      let cumulative_size:Record<any,any> = [];
      Object.values(this.selectedProduct.sizes).forEach((value)=>{
        if(Object.prototype.hasOwnProperty.call(value as Record<any,any>,'json_data')){
          cumulative_size.push(JSON.parse(value.json_data));
        }
      })
      let sizes = [] as Record<any,any>;
      if(cumulative_size.length > 0){
        cumulative_size.forEach((size_array:Record<any,any>) => {
          if(size_array.length > 0){
            size_array.forEach((size:Record<any,any>) => {
              sizes.push(size);
            })
          }
        })
      }
      return sizes;
    }
    else{
      return [];
    }
  }
  getRoomProducts(){
    let room_products:Record<any,any>[] = [];
    return new Promise((resolve,reject) => {
      this.collection?.collection_products.map((collection_product:Record<any,any>) => {
        collection_product.map((collection: Record<any, any>) => {
          console.log('collection');
          console.log(collection);
          room_products.push({
            room_id: collection.product_locker_room.room_id,
            product: {
              product_id: collection.product_locker_room.product_id,
              id: collection.product_locker_room.id,
              product_type: collection.product_locker_room.product_type,
              style_id: collection.product_locker_room.style_id,
              design_id: collection.product_locker_room.design_id,
            }
          });
        });
      });
      resolve(room_products);
    });
  }
}
</script>

<style lang="css" scoped src="@assets/css/collectionPdf.css"></style>
