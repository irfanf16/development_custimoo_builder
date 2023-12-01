<template>
    <div>
      <div class="loader" v-if="showLoader"><img src="@assets/images/loading.gif"/></div>
      <div v-if="collection" class="collection_pdf_page position-relative">
        <a ref="download_btn" :href="`${storageUrl}${collection.link}`" download target="_blank" class="download-pdf btn btn-secondary light">
          <BIconDownload />
          <span>
            Download PDF
          </span>
        </a>
        <div id="collectionPdfContainer">
          <div v-if="company.id == 1 || company.id == 45" class="pdf_cover" :class="{'design_hummel_us': company.id == 45}">
            <h1 class="text-white p-4" style="text-align: center">{{ collection.name }} </h1>

            <div class="logo">
              <img src="../../src/assets/logo.png" alt="Logo">
            </div>

              <div class="collection_logos">
                <template v-for="(collection_logo, clIdx) in collection.logos">
                  <div :key="`collection_logo_${clIdx}`">
                    <img :src="`${storageUrl}${collection_logo.path}`" alt="Logo">
                  </div>
                </template>
              </div>
          </div>

          <div class="pdf_page" v-for="(products_chunks,idx)  in collection.collection_products" :key="idx"
               :style="{ background: company.id == 1? `url('img/page_background.png') no-repeat center` : `url('img/page_background_2.png') no-repeat center` }">
            <table class="print-table">
              <tbody>
              <tr>
                <td v-for="(collection_product, idxs) in products_chunks" :key="idxs">
                  <template v-if="collection_product.allow_title && collection_product.product_locker_room && collection_product.product_locker_room.model_description">
                    <div style="font-weight: 600; font-size: larger; word-wrap: break-word" v-html="collection_product.product_locker_room.model_description.model_name">
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
                            <a :href="`${storageUrl+collection_product.product_locker_room.locker_product_images_folder}/front.png?q=${collection_product.product_locker_room.random_string}`" download v-b-tooltip title="Download image" target="_blank" class="rounded-circle btn btn-secondary light"><BIconDownload /></a>
                            <img :src="`${storageUrl+collection_product.product_locker_room.locker_product_images_folder}/front.png?q=${collection_product.product_locker_room.random_string}`" alt="">
                          </div>
                        </td>
                        <td>
                          <div class="position-relative overflow-hidden download-design">
                            <a :href="`${storageUrl+collection_product.product_locker_room.locker_product_images_folder}/back.png?q=${collection_product.product_locker_room.random_string}`" download v-b-tooltip title="Download image" target="_blank" class="rounded-circle btn btn-secondary light"><BIconDownload /></a>
                            <img :src="`${storageUrl+collection_product.product_locker_room.locker_product_images_folder}/back.png?q=${collection_product.product_locker_room.random_string}`" alt="">
                          </div>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                  <template v-if="collection_product.product_locker_room && collection_product.product_locker_room.model_description">
                    <div class="pdf_description" v-if="collection_product.allow_description && (collection_product.product_locker_room.model_description.product_model_description
                         || collection_product.product_locker_room.model_description.product_model_description != '')">
                      <strong>Product Info: </strong>
                      <template v-if="collection_product.product_locker_room.model_description.product_model_description">
                        <span v-html="collection_product.product_locker_room.model_description.product_model_description"></span>
                      </template>
                    </div>
                  </template>
                  <div v-if="collection_product.product_note != ''" class="pdf_description"><strong>Description: </strong>
                    {{ collection_product.product_note }}
                  </div>
                  <div class="pdf_price" v-if="collection_product.allow_price && collection_product.product_price"><strong>Price: </strong>
                    {{collection_product.product_price}}
                  </div>
                  <div class="pdf_price d-flex justify-content-center" style="border: none" >
                    <template v-if="isAuthenticated">
                      <template v-if="company.platform !== 'self'  || (company.platform == 'self' && company.id !== 1)
                                || (company.platform == 'self' && company.id === 1 && customerPermissions.includes('place-order'))">
                        <button  class="btn btn-secondary" style="width:30%" v-if="active_product_index !== idxs" @click="addToCart(collection_product,idxs)">
                        Purchase
                      </button>
                        <button v-else class="btn btn-secondary" style="width:30%" :disabled="true" >
                          <img width="20" height="20" src="@assets/images/loading.gif" />
                        </button>
                      </template>
                    </template>
                    <template v-else>
                      <template v-if="company.platform !== 'self'">
                        <button  class="btn btn-secondary" style="width:30%" v-if="active_product_index !== idxs"  @click="setActionBeforeLogin('addToCart',collection_product,idxs)">
                          Purchase
                        </button>
                        <button v-else class="btn btn-secondary" style="width:30%" :disabled="true" >
                          <img width="20" height="20" src="@assets/images/loading.gif" />
                        </button>
                      </template>

                    </template>
                  </div>
                </td>
                <template v-if="products_chunks.length == 1">
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </template>
                <template v-else-if="products_chunks.length === 2">
                  <td>&nbsp;</td>
                </template>
              </tr>
              </tbody>
            </table>
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
               @opened="setRosterOpen(true)"
               name="rostermodal" class="roster-modal" size="xl"
               footer-class="hide-modal-footer d-none"
        >
          <div class="modal-header d-flex justify-content-between">
            <span class="fs-5 font-weight-bolder">Edit {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}}</span>
            <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="close"><BIconX /></span>
          </div>
          <div class="modal-body">
            <div class="d-flex flex-wrap justify-content-between">
              <RosterDetails ref="rosterDetailsModal" :productSizes="product_sizes"  :lockerRosters="products_roster" @addPlayer="rosterDetailsInit" :products_fonts="products_fonts"/>
              <div class="roster-preview-area">
                <CustomizationPreview :designs="products[designsIndex]" :products_fonts="products_fonts"/>
              </div>
            </div>
          </div>
        </modal>
      </template>
      <CartModal ref="cartModal" @deleteCartItem="deleteCartItem" v-if="customer"/>
      <confirm-modal message="Do you really want to delete?" cancel_text="Cancel" confirm_text="Yes" name="delete-cart-item" ref="delete-cart-item"></confirm-modal>
    </div>

  </template>

  <script lang="ts">
  import {Component, Mixins, Vue, Watch} from 'vue-property-decorator'
  import {http} from "@/httpCommon";
  import ErrorMessages from "@/mixins/ErrorMessages";
  import LoginForm from '@/components/LoginForm.vue'
  import {LockerProducts,handleMainProducts, ProductsQueryParamsMixin} from "@/mixins/LockerProduct"
  import {getDomDocument, getPermissions, getRandom, getRosterDetailDefaultObject} from '@/helpers/Helpers'
  import ModalAction from "@/mixins/ModalAction";
  import CustomizationPreview from '@/components/CustomizationPreview.vue'
  import RosterDetails from '@/components/RosterDetails.vue'
  import {findIndex} from "lodash";
  import CartModal from "@/components/CartModal.vue";
  import ConfirmModal from "@/components/ConfirmModal.vue";
  import opentype from 'opentype.js'



  @Component<CollectionViewPDF>({
    components: {LoginForm,CustomizationPreview,RosterDetails,CartModal,ConfirmModal},
    async mounted() {
      if(this.isAuthenticated){
        await  getPermissions()
      }

      let self: Record<any, any> = this;
      await self.$eventBus.$on('initProductsFonts', this.initProductsFonts, async (products: Record<any, any>[], resolve: any) => {
        await this.initProductsFonts(products, resolve)
      })

      this.getCollection()
      this.$store.dispatch('setCartIconShow', true);
      this.$store.dispatch('setCollectionView', true);
      await http.get(`/get-settings`).then((res) => {
        this.$store.commit('SET_SETTING', res.data.result.settings)
        this.$store.commit('SET_FACTORY_SETTING', res.data.result.factory_settings)
      });
      this.$nextTick(() => {
        if (!this.rosterDetails.length) {
          this.rosterDetailsInit()
        }
      })

      if (this.isAuthenticated) {
        let res = await http.get("products/roster")
        if (res.status == 200) {
          this.products_roster = res.data
        }
        await this.$store.dispatch('getCartServer', {})
        this.$root.$on('showCartModal', () => {
          let self = this;
          self.showVModal('cart-modal')
        })

      }
      this.$root.$on('getNextProduct', () => {
        this.hide();
      });
      this.$root.$on('closeCollectionView', () => {
       this.close()
      });

      function getCoords(elem) {
        let box = elem.getBoundingClientRect();
        let doc = getDomDocument() as Record<any, any>
        let body = doc.body;
        let docEl = doc.documentElement;

        let scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        let scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

        let clientTop = docEl.clientTop || body.clientTop || 0;
        let clientLeft = docEl.clientLeft || body.clientLeft || 0;

        let top  = box.top +  scrollTop - clientTop;
        let left = box.left + scrollLeft - clientLeft;

        return { top: Math.round(top), left: Math.round(left) };
      }

      const top_offset_download_pdf = getCoords(self.$refs.download_btn)

      window.addEventListener('scroll', async ()=>{
        if(self.$refs.download_btn){
          let scroll_button = (window.scrollY + 40) > top_offset_download_pdf.top

          if(scroll_button){
            this.$refs.download_btn.style.top = ((window.scrollY + 40) - top_offset_download_pdf.top) + 'px'
          }else {
            this.$refs.download_btn.style.top = `20px`
          }
        }
      })
    },
    async destroyed() {
      window.removeEventListener('scroll', ()=>{
        console.log('Scroll event removed')
      })
      this.$store.dispatch('setCartIconShow',false);
      this.$store.dispatch('setCollectionView',false);
    }
  })

  export default class CollectionViewPDF extends Mixins(ErrorMessages,LockerProducts,handleMainProducts,ModalAction) {
    public products_fonts: Record<any, any> = []
    public showLoader = false
    public storageUrl = process.env.VUE_APP_STORAGE_URL
    public collection:Record<any, any> = [];
    public ref = this.$refs as Record<any, any>
    public products_roster: Record<any, any>[] = []
    public product_sizes: Record<any, any>[] = []
    private screenWidth = (window.screen.availWidth - 100);
    public designsIndex = 0
    public active_product_index: number|null  = null;
    public room_products:Record<any, any> = [];
    public room_product_index = 0;
    public current_product = {};
    public current_index = 0;

    public show_roster = false;

    get customTextObjects(){
      return this.$store.getters.customTextObjects;
    }

    get editing_roster_player_index(): number {
      return this.$store.getters.getEditingRosterPlayerIndex
    }

    get customTexts(): [Record<any, any>] {
      return this.$store.getters.getCustomTexts()
    }

    get actionBeforeLogin(): string {
      return this.$store.getters.getActionBeforeLogin
    }

    get customerPermissions(){
      return this.$store.getters.getCustomerPermissions
    }

    private setRosterOpen(val: boolean) {
      this.$store.commit('SET_IS_ROSTER_OPEN', val)
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
    public async setActionBeforeLogin(type: string , product:Record<any,any>,idxs) {
      this.$store.commit("ACTION_BEFORE_LOGIN", type);
      this.current_product = product;
      this.current_index = idxs
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
        this.addToCart(this.current_product, this.current_index);
      }
      this.$store.commit("ACTION_BEFORE_LOGIN", '');
    }

    public loadFont(url: string) {
      return new Promise((resolve) => {
        opentype.load(url, (err: Record<any, any>, font_object: Record<any, any>) => {
          if(!err) {
            resolve(font_object);
          } else {
            resolve('')
          }
        })
      })
    }

    public async initProductsFonts(products: Record<any, any>[], resolve: any) {
      for(let product_index = 0; product_index < products.length; product_index++) {
        const product = products[product_index]
        const productFonts = product.namefonts;
        if (productFonts.length){
          const item = productFonts[0].json_data
          if(item) {
            for(let i = 0; i < item.length; i++) {
              const font = item[i]
              let fontNameParam = font.path.split('/').reverse()
              fontNameParam = fontNameParam[0].split('.')
              const fontName = fontNameParam[0].replace('-', ' ').toUpperCase()
              const url =`${process.env.VUE_APP_STORAGE_URL}${font.path}?num=${getRandom()}`
              if(!this.products_fonts[fontNameParam[0]]) {
                const font_object = await this.loadFont(url)
                if(font_object) {
                  const final_font = {
                    value: fontNameParam[0] as string,
                    text: fontName as string,
                    url:`${process.env.VUE_APP_STORAGE_URL}${font.path}`,
                    opentype_font: font_object
                  }
                  Vue.set(this.products_fonts, fontNameParam[0], final_font)
                }
              }
            }
          }
        }
        resolve('done')
      }
    }


    get company() {
      return this.$store.getters.getCompany
    }
    get getCartLoading(): boolean {
      return this.$store.getters.getCartLoading;
    }

    get isAuthenticated(){
      return this.$store.getters.isCustomerAuthenticated;
    }

    get selectedProduct(): Record<any, any>{
      return this.$store.getters.getSelectedProduct
    }
    get rosterDetails(): [Record<any, any>] {
      return this.$store.getters.getRosterDetails()
    }

    public async show(){
      this.showVModal('rostermodal')
    }

    public hide(){
      this.hideVModal('rostermodal')
      this.active_product_index = null;
      this.current_index = 0;
    }

    public close(){
      const self = this;
      this.$store.commit('SET_REVERT_ROSTER_BOOL',true);
      self.$modal.hide('rostermodal')
      this.active_product_index = null;
      this.current_index = 0;
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
      http.get(`/collection/view?collection_file_name=${encodeURIComponent(collection_file_name)}`).then(async (response: any) => {
          this.collection = response.data.result.collection
          this.showLoader = false
          this.room_products = await this.getRoomProducts() as Record<any, any>;
        })
        .catch((e: any) => {
          this.showLoader = false
          this.showError(e.response.data.message)
          this.$router.push('/')
        });
    }

    public rosterDetailsInit() {
      if(this.show_roster){
        let payload = getRosterDetailDefaultObject()
        this.$store.dispatch('setRosterDetails', {index: this.rosterDetails.length, roster: payload})
      }
    }


    async addToCart(room_product:Record<any,any>,idxs:number){
      this.active_product_index = idxs;
      if(this.isAuthenticated){
        this.getCollectionProductData(room_product.product_locker_room);
        this.room_product_index = this.room_product_index + 1 ;
      }
      else{
        this.ref['loginModal'].show();
      }
    }

    getCollectionProductData(room_product: Record<any, any>) {
      let room_product_id = room_product.id;
      let product_id = room_product.product_id;
      let url = 'list/products'
      let is_private:boolean = this.$store.getters.getPrivateProduct;
      let url_query_string = `private=${is_private}&active_product_id=${product_id}&locker_product_id=${room_product_id}&active_product_type=locker_product&is_share_collection=true`
      url = `${url}?${url_query_string}`
      http.get(url).then(async (response: Record<any, any>) => {
        this.handleMainProducts(response).then(async (response_data) => {
          const selected_product = this.$store.getters.getSelectedProduct
          this.product_sizes = this.formatProductSizes(selected_product.sizes[0].json_data)
          this.show_roster = true;
          await this.show();
        })

      }, (error:Record<any, any>) => {
        console.error("Error while retrieving products",error)
      })
    }

    formatProductSizes(product_sizes: Record<any, any>[]): Record<any, any>[] {
      let product_sizes_formatted: Record<any, any>[] = []
      product_sizes.forEach((size) => {
        product_sizes_formatted.push({value: size.name, text: size.name})
      })
      return product_sizes_formatted
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
          this.showToast(response.data.message, 'success')
        }).catch((e:any)=>{
          this.showError(e);
          this.ref['cartModal'].hide();
        });
      }
    }
    get productSizes(){
      if(this.show_roster){
        return this.selectedProduct.sizes[0].json_data
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
