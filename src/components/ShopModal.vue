<template>
  <span>
    <modal :clickToClose="false" :width="screenWidth" :resizable="true" :scrollable="true" height="auto" :reset="true"
      :shiftY="0" class="absolute-modals" name="create-update-shop-modal" ref="create-update-shop-modal"
      @before-open="handleModelBeforeOpenEvent" @closed="emitShopModalCloseEvent">
      <div class="modal-header">
        <div class="d-flex justify-content-sm-between flex-wrap align-items-center justify-content-center gap-1 w-100">
          <div class="d-flex align-items-center gap-1">
            <span class="fw-bold" style="white-space: nowrap">Shop Name: </span>
            <b-form-input placeholder="Shop Name" v-model="shop.name"  @blur="generateSlug"></b-form-input>
            <b-button class="published-btn" :class="{'live-status': shop.status === 'live'}" @click="openShopStatusModal(shop.status)" variant="secondary" v-if="shop.id" :title="shop.status === 'live' ? 'Click to unpublish (set to draft)' : 'Click to publish (set to live)'">
              <span v-if="shop.status === 'live'" class="live-indicator">
                <span class="live-icon"></span>
                Live
              </span>
              <span v-else  class="capitalize">{{ shop.status }}</span>
            </b-button>
          </div>

          <div class="d-flex">
            <!-- password trigger + popover -->
            <div class="share-wrap" ref="passwordWrap">
              <b-button class="light" @click="togglePasswordModal" aria-haspopup="dialog"
                :aria-expanded="isPasswordModalOpen ? 'true' : 'false'" style="margin-right: 10px"
                :title="isShopPasswordProtected ? 'Shop is password protected' : 'Protect shop by password'">
                <b-icon-lock v-if="isShopPasswordProtected"></b-icon-lock>
                <b-icon-unlock v-else></b-icon-unlock>
              </b-button>
              <!--Password Popover starts-->
              <transition v-if="isPasswordModalOpen" name="fade-zoom">
                <div class="share-popover" role="dialog" aria-label="Share" ref="sharePopover">
                  <!-- Password toggle -->
                  <div class="row toggler">
                    <span class="muted" v-if="shop.id && shop.password">
                      Update Shop Password
                    </span>
                    <span class="muted" v-else>Set Shop Password</span>
                  </div>

                  <template>
                    <div class="row m-0 url-row">
                      <input class="url-input" type="password" placeholder="Password" v-model="shopPassword"
                      autocomplete="off" novalidate />
                    </div>
                    <div class="row m-0 mt-2 url-row">
                      <input class="url-input" type="password" placeholder="Confirm password"
                        v-model="shopConfirmPassword" autocomplete="off" novalidate />
                    </div>
                  </template>

                  <div class="d-flex" style="gap: 10px">
                    <button class="copy-cta light mt-3 mb-0" @click="clearPassword">
                      <b-icon-eraser-fill></b-icon-eraser-fill>
                      Clear
                    </button>
                    <button class="copy-cta mt-3 mb-0" @click="setPassword"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-floppy" viewBox="0 0 16 16">
                        <path d="M11 2H9v3h2V2Z" />
                        <path
                          d="M14 2v12H2V2h1v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2h1Zm-3 0v3H5V2h6Zm3-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z" />
                      </svg>
                      <template v-if="isEditingShop">
                        Update
                      </template>
                      <template v-else>Set</template>
                    </button>
                  </div>
                </div>
              </transition>
            </div>

            <!-- Share trigger + popover -->
            <div class="share-wrap" ref="shareWrap">
              <b-button class="light" @click="toggleShareModal" aria-haspopup="dialog"
                :aria-expanded="isShareModalOpen ? 'true' : 'false'" style="margin-right: 10px">
                <img :src="require('@/assets/images/share-shop.svg')" alt="Share shop link">
                Share
              </b-button>
              <!--Share Popover starts-->
              <transition v-if="isShareModalOpen" name="fade-zoom" >
                <div class="share-popover" role="dialog" aria-label="Share" ref="sharePopover">
                  <!-- URL row -->
                  <div class="row url-row m-0">
                    <span class="url-prefix">{{companyDomain}}merchant-shop/{{shop.slug}}</span>
                    <input class="url-input" v-model="shop.slug" @keyup.enter="checkSlugAvailability"
                      @input="onSlugInput" />
                    <button class="square-btn" title="Check slug availbility" @click="checkSlugAvailability">
                      <b-icon-check v-if="isSlugValidated" class="animate-scale check-icon"></b-icon-check>
                      <b-icon-search v-else></b-icon-search>
                    </button>
                  </div>

                  <button class="copy-cta mt-3 mb-0" @click="copyShareLink">
                    <b-icon-layers-fill></b-icon-layers-fill>
                    <span>{{ shareCopied ? 'Copied!' : 'Copy Link' }}</span>
                  </button>
                </div>
              </transition>
            </div>

            <div class="d-inline-flex group-actions">
              <b-button @click="addProductToShopFromLockerRoom">
                <b-icon icon="plus"></b-icon> Add new
              </b-button>


              <b-button class="position-relative has-dropdown cursor-pointer hide-outside" @mouseenter="showDropdown = true"
                    @mouseleave="showDropdown = false">
                 <b-icon icon="chevron-down" @click.stop="toggleDropdown"></b-icon>

                <ul class="dropdown-actions" v-if="showDropdown">
                  <li @click="addProductToShopFromLockerRoom">
                    <div>Add from locker</div>
                    <div class="subtext">Add new product from custimoo</div>
                  </li>
                  <li @click="createOwnProduct">
                    <div>Create your own</div>
                    <div class="subtext">Add your own new product</div>
                  </li>
                  <li @click="toggleProductsUrlModal">
                    <div>Add product by URL</div>
                    <div class="subtext">Add locker room product by url</div>
                  </li>
                </ul>
              </b-button>
            </div>
      <transition v-if="isProductsUrlModalOpen" name="fade-zoom">
  <div class="product-popover-backdrop" @click="toggleProductsUrlModal">
    <div class="product-popover" @click.stop>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="fw-bold text-lg text-gray-800 fs-3">
          Add your own product by URL
        </span>
        <span
          @click="toggleProductsUrlModal"
          class="cursor-pointer text-gray-400 hover:text-gray-600 transition"
        >
          <b-icon-x class="fs-4"></b-icon-x>
        </span>
      </div>

      <div class="d-flex align-items-center gap-2" role="dialog">
        <b-input
          type="text"
          placeholder="Enter your URL"
          class="flex-grow-1"
          v-model="productsUrl"
          @keyup.enter="fetchUrlProducts"
        />
        <b-button @click="fetchUrlProducts">Submit</b-button>
      </div>
    </div>
  </div>
</transition>




          </div>

        </div>
      </div>

      <div class="modal-body">
        <div class="d-flex flex-row-reverse">
          <div class="position-relative pl-4 ml-4"
            style="border-left: 1px solid #eee; flex-basis: 20%; min-width: 160px; flex-grow: 0">
            <div class="form-row switch-row">
              <label class="text-muted" for="preview-name">Preview Name</label>
              <label class="switch" for="preview-name">
                <input type="checkbox" id="preview-name" v-model="shop.preview_name" />
                <span class="slider"></span>
              </label>
            </div>
            <div class="form-row switch-row">
              <label class="text-muted" for="preview-logo">Preview Logo</label>
              <label class="switch" for="preview-logo">
                <input type="checkbox" id="preview-logo" v-model="shop.preview_logo" />
                <span class="slider" ></span>
              </label>
            </div>
            <div>
              <h2 class="fs-2 mb-2 font-weight-bolder">Upload Shop Logo</h2>
              <FileUploader :selectedFileUrl="shop.logo" :filesListing="recentLogos" @selected-file="handleLogoUpdate">
                <template v-slot:files_listing_text>
                  Recent Logos
                </template>
              </FileUploader>
            </div>
            <hr class="my-3">
            <div>
              <h2 class="fs-2 mb-2 font-weight-bolder">Upload Shop Cover</h2>
              <FileUploader :selectedFileUrl="shop.cover_photo" :filesListing="customerShopsDefaultCoverPhotosUrls"
                @selected-file="handleCoverPhotoUpdate">
                <template v-slot:files_listing_text>
                  Default Cover Photos
                </template>
              </FileUploader>
            </div>
            <hr class="my-3">
            <div>
              <h2 class="fs-2 mb-2 font-weight-bolder">Shop Expiry</h2>
                <date-picker :config="datepickerOptions"  v-model="shop.unpublish_at" class="mb-2" placeholder="Select Shop Expiry Date"></date-picker>
            </div>
          </div>

          <div class="design-collection-form" style="flex-basis: 80%">
            <div class="loader" v-if="showLoader"><img style="width: 100px" src="@assets/images/loading.gif" /></div>
            <b-form inline>
              <b-container fluid>
                <div class="row gap-y-5" :options="{ animation: 250, delayOnTouchOnly: true, delay: 500 }">
                  <b-col cols="12" md="6" lg="4" xl="3" v-for="(product, productIndex) in shop.products"
                    :key="`product-${productIndex}-b-col`">
                    <b-card>
                      <!-- Delete button -->
                      <a class="btn remove edit absolute" @click="editShopProduct(productIndex, product)" v-if="!product.product_locker_room_id">
                        <b-icon-check v-if="product.override_product_info"
                          title="Use product default info"></b-icon-check>
                        <b-icon-pencil v-else title="Override product info"></b-icon-pencil>
                      </a>
                      <a class="btn remove absolute" @click="removeShopProduct(productIndex)"
                        title="Remove product from shop">
                        <font-awesome-icon :icon="['fas', 'trash-alt']" />
                      </a>

                      <div class="text-center fs-2 toggle_pdf">
                        <div class="mt-3 respCanvas">
                          <div>
                            <img :src="imagePreview(product.front_image)" alt="">
                          </div>
                          <div>
                            <img :src="imagePreview(product.back_image)" alt="">
                          </div>
                        </div>
                        <template>
                          <div class="mt-2 d-block gap-1">
                            <div>
                              <b-form-input class="w-100" placeholder="Product Nick Name"
                                v-model="product.custom_name"></b-form-input>
                            </div>
                          </div>

                          <div class="mt-3 toggle_pdf text-left">
                            <div class="product-description">
                              <textarea class="form-control w-100" rows="7"
                                v-model="product.custom_description"></textarea>
                            </div>
                          </div>

                          <div class="mt-3">
                            <b-input-group>
                              <b-form-input v-model.number="product.custom_price"  @blur="formatProdCustomPrice(product)" aria-describedby="currency-badge"
                            />
                            <b-input-group-append>
                              <b-input-group-text id="currency-badge">{{ activeCurrencyCode }}</b-input-group-text>
                            </b-input-group-append>
                          </b-input-group>
                        </div>
                        </template>
                      </div>
                    </b-card>
                  </b-col>

                </div>
              </b-container>
            </b-form>
          </div>
        </div>
        <ShopOwnProductModal :ownProductData="ownProductEditInfo.product"
          @own-product-upserted="handleOwnProductUpserted"
          @own-product-upsert-cancelled="handleShopOwnProductUpsertCancelEvent" />
      </div>

      <div class="modal-footer">
        <div class="d-flex align-items-center justify-content-end w-100 gap-1">
          <b-button variant="secondary" class="light" @click="resetShopState">Close</b-button>
          <div class="d-inline-flex group-actions">
            <b-button variant="secondary" class="position-relative" @click="saveShop('live')">
              Save and Publish
            </b-button>

            <b-button variant="secondary" class="position-relative has-dropdown top-actions">
              <b-icon icon="chevron-up"></b-icon>

              <ul class="dropdown-actions">
                <li @click="saveShop('draft')">
                  <div>Save to Draft</div>
                  <div class="subtext">Only save your shop</div>
                </li>
              </ul>
            </b-button>
          </div>
        </div>
      </div>
    </modal>
  </span>

</template>

<script lang="ts">


import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator'
import CollectionPDF from "@/components/CollectionPDF.vue";
import { http } from "@/httpCommon";
import FileUploader from "@/components/Logo/FileUploader.vue";
import ShopCoverUploader from "@/components/Logo/ShopCoverUploader.vue";
import ShopOwnProductModal from "@/components/ShopOwnProductModal.vue";
import datePicker from 'vue-bootstrap-datetimepicker';
import ModalAction from "@/mixins/ModalAction";
import { CustomerShopMixin } from "@/mixins/LockerProduct"
import Swal from 'sweetalert2';
import { handleResponseException, santaClone, getImagePreview, showToastedMessage, checkIsEmpty, getShopDefaultObject, getShopLastProductSortOrder, getShopProductDefaultObject,getDomDocument, formatCustomPrice, getCompanyBaseUrl } from '@/helpers/Helpers';
import VsToast from '@vuesimple/vs-toast';
import moment from "moment";
import { find, maxBy } from 'lodash';
@Component({
  components: {
    ShopOwnProductModal,
    ShopCoverUploader,
    FileUploader,
    CollectionPDF,
    datePicker,
  }
})

export default class ShopModal extends Mixins(ModalAction, CustomerShopMixin) {
  //hooks starts

  //hooks ends

  //data props starts
  public companyDomain = getCompanyBaseUrl()
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public showLoader = false
  private mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  private screenWidth = this.mobileScreen ? window.screen.availWidth : (window.screen.availWidth - 100)
  public isShareModalOpen = false;
  public isPasswordModalOpen = false;
  public updatePassword = false
  public shopPassword = ''
  public shopConfirmPassword = ''
  public shareCopied = false;
  public showDropdown = false

  public productsUrl = ''

  public shop: Record<any, any> = {}
  public imagePreview = getImagePreview
  public ownProductEditInfo = {
    index: -1, product: {}
  }
  public isProductsUrlModalOpen = false
  public isSlugValidated = false
  public slugEdited = false;
  public domDocument = getDomDocument()
  public selectedShop: null;
  public statusMessage: string = '';

  public datepickerOptions: Record<any, any> = {
    format: 'YYYY-MM-DD HH:mm',
    useCurrent: false,
    // minDate: new Date(),
    icons: {
      time: 'fa fa-clock',
      date: 'fa fa-calendar',
      up: 'fa fa-arrow-up',
      down: 'fa fa-arrow-down',
      previous: 'fas fa-chevron-left',
      next: 'fa fa-chevron-right',
      today: 'fa fa-calendar-check',
      clear: 'fa fa-trash-alt',
      close: 'fa fa-times-circle'
    },
   widgetPositioning: {
    horizontal: 'right',
    vertical: 'top'
  }
  }

  //data props ends
   mounted() {
    this.domDocument?.addEventListener('click', this.handleClickOutside)
  }
  //computed props starts

  get shopData() {
    let shopData =  this.$store.getters.getShop
    if(checkIsEmpty(shopData)) {
      shopData = getShopDefaultObject()
    }
    return shopData
  }

  get isShopPasswordProtected(): boolean {
    if(checkIsEmpty(this.shop)) {
      return false
    }
    if(this.shop.id) {
      return this.shop.password ? true : false
    } else {
      return (this.shop.password ? true : false) && ( this.shop.password === this.shop.password_confirmation)
    }
  }

  get company() {
    return this.$store.getters.getCompany
  }

  get isEditingShop() {
    return this.shop.id ? true : false;
  }

  get activeCurrencyCode() {
    return this.$store.getters.getProductPriceObject?.active_currency?.code ?? ''
  }

  //computed props ends

  //methods starts

  public fetchUrlProducts() {
    this.showLoader = true;
    let productsUrl = this.productsUrl.replace(`${this.companyDomain}`, '')
    http.post('products-from-url', {product_url: productsUrl}).then(successResponse => {
      this.showLoader = false
      const urlProducts = successResponse.data.result
      const urlProductsCount = urlProducts.length
      let urlProductsAddedToShopCount = 0;
      let urlProductsAlreadyExistsCount = 0
      let lastSortOrder = getShopLastProductSortOrder()
      urlProducts.forEach(urlProduct => {
        const isProductExists = find(this.shop.products, {product_locker_room_id: urlProduct.product_locker_room_id})
        if(isProductExists) {
          urlProductsAlreadyExistsCount++;
        } else {
          urlProductsAddedToShopCount++;
          this.shop.products.push(getShopProductDefaultObject({
            ...urlProduct,
            custom_name: urlProduct.name,
            custom_description: urlProduct.description,
            custom_price: urlProduct.price,
            sort_order: ++lastSortOrder
          }));
        }
      });
      let message = `${urlProductsAddedToShopCount} products added to shop.`
      if(urlProductsAlreadyExistsCount > 0) {
        message = `${urlProductsAlreadyExistsCount} products were skipped because they already exist in the shop.`
      }
      this.productsUrl = ''
      this.isProductsUrlModalOpen = false
      showToastedMessage(message)
    }).catch(errorResponse => {
      this.showLoader = false
      handleResponseException(errorResponse)
    })
  }

  public createOwnProduct() {
    this.showVModal('shop-own-product-modal')
    this.isPasswordModalOpen = false
    this.isShareModalOpen = false
    this.isProductsUrlModalOpen = false
  }

   public openShopStatusModal(shop) {
    let title= ''
    let message = ''


  if (shop === 'live') {
    title= 'Move Shop to Draft?'
    message = 'Confirm unpublishing this shop. It will no longer be visible to the customers.'
  } else if (shop === 'draft') {
    title = 'Make Shop Live?'
    message = 'This will publish the shop and make it visible to customers.'
  } else if (shop === 'expired') {
    title = 'Make Expired Shop Live'
    message = `Making it live, but make sure you’ve updated the expiry date so customers can access it.`
  }

  Swal.fire({
    title: title,
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#219f84',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel',
    allowOutsideClick: false,
    allowEscapeKey: false,
  }).then(result => {
    if (result.isConfirmed) {
      this.toggleShopStatus()
    }
  })
}

  public getMerchantProducts() {
    http.get('get-company-products').then((response) => {
      const companyProducts = response.data.result;
      this.$store.commit('SET_COMPANY_PRODUCTS', companyProducts);
    }).catch((error) => {
      handleResponseException(error)
    });
  }

    public toggleDropdown() {
      this.showDropdown = !this.showDropdown
    }

  public onSlugInput() {
  this.slugEdited = true;
  this.isSlugValidated = false;
}


  public generateSlug() {
    if(!this.slugEdited  && this.shop.name) {
        this.shop.slug = this.shop.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
        this.isSlugValidated = false;
    }
  }

  public  handleClickOutside(e) {
      const dropdown = this.$el.querySelector('.hide-outside')
      if (dropdown && !dropdown.contains(e.target)) {
        this.showDropdown = false
      }
    }

  public handleModelBeforeOpenEvent() {
    const logo = this.shopData.logo
    const coverPhoto = this.shopData.cover_photo
    this.shop = santaClone(this.shopData)
    this.shop.logo = logo;
    this.shop.cover_photo = coverPhoto;

    this.isPasswordModalOpen = false
    this.isShareModalOpen = false
    this.isProductsUrlModalOpen = false
    this.getMerchantProducts()
  }

  public addProductToShopFromLockerRoom() {
    const shopSelectedProductsIds = this.shop.products.map(shopProduct => {
      return shopProduct.product_locker_room_id
    })
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS', {attribute: 'locker_products', value: shopSelectedProductsIds})
    this.$store.commit("SET_SHOP", this.shop)
    this.showVModal('locker-modal')
    this.hideVModal('create-update-shop-modal')
  }
  get recentLogos() {
    const getRecentLogos = this.$store.getters.getRecentLogos
    let recentLogos = []
    if (getRecentLogos && getRecentLogos.length > 0) {
      recentLogos = getRecentLogos.map((getRecentLogo: Record<any, any>) => {
        return getRecentLogo.logo_url
      })
    }
    return recentLogos
  }
  public toggleProductsUrlModal() {
      this.isProductsUrlModalOpen = !this.isProductsUrlModalOpen
      this.isPasswordModalOpen = false
      this.isShareModalOpen = false
  }

  public handleLogoUpdate(selectedFile) {
    // console.log('hey', selectedFile)
    this.shop.logo = selectedFile.file ?? selectedFile.url
    // console.log("selectedFile", selectedFile)
  }

  public handleCoverPhotoUpdate(selectedFile) {
    this.shop.cover_photo = selectedFile.file ?? selectedFile.url
  }

  public saveShop(shopStatus) {
    this.isPasswordModalOpen = false
    this.isShareModalOpen = false
    this.showLoader = true
    this.shop.status = shopStatus
    const shopPayload = this.getShopPayload()
    const url = this.shop.id ? `customer-shops/${this.shop.id}` : 'customer-shops'
    http.post(url, shopPayload).then(successResponse => {
      this.showLoader = false
      this.$emit('shop-saved', shopPayload)
      this.resetShopState()
    }).catch(errorResponse => {
      this.showLoader = false
      handleResponseException(errorResponse)
    })
  }

  public toggleShopStatus() {
    const newStatus = this.shop.status === 'live' ? 'draft' : 'live'
    this.saveShop(newStatus)
    this.$modal.hide('shopStatusModal');
  }

  public resetShopState() {
    this.$store.commit('RESET_SHOP_STATE')
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS', {attribute: 'locker_products', value: []})
    this.showVModal('locker-modal')
    this.hideVModal('create-update-shop-modal')
    this.$emit('shop-model-closed')
  }

  public getShopPayload() {
    const formData = new FormData();
    const shop = this.shop
    if(shop.id) {
      formData.append("id", shop.id)
      formData.append('_method', 'PUT');
    }
    formData.append("is_shop_password_protected", JSON.stringify(this.isShopPasswordProtected));
    if(shop.password) {
        formData.append("password", this.shopPassword)
        formData.append("password_confirmation", this.shopConfirmPassword )
      }

    formData.append("company_id", shop.company_id)
    formData.append("customer_id", shop.customer_id)
    formData.append("name", shop.name)
    formData.append("preview_name", shop.preview_name)
    formData.append("logo", shop.logo)
    formData.append("preview_logo", shop.preview_logo)
    formData.append("cover_photo", shop.cover_photo)
    formData.append("slug", this.shop.slug)
    formData.append("status", shop.status)
    formData.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone)
    if(shop.publish_at) {
      formData.append("publish_at", shop.publish_at)
    }
    if(shop.unpublish_at) {
      shop.unpublish_at = moment.utc(shop.unpublish_at).format("YYYY-MM-DD HH:mm:ss");
      formData.append("unpublish_at", shop.unpublish_at)
    }
    shop.products.forEach((product, productIndex) => {
      formData.append(`shop_products[${productIndex}][id]`, product.id)
      formData.append(`shop_products[${productIndex}][sort_order]`, product.sort_order)
      formData.append(`shop_products[${productIndex}][is_added_from_locker]`, product.is_added_from_locker)
      formData.append(`shop_products[${productIndex}][product_locker_room_id]`, product.product_locker_room_id)
      formData.append(`shop_products[${productIndex}][override_product_info]`, product.override_product_info)
      formData.append(`shop_products[${productIndex}][custom_name]`, product.custom_name)
      formData.append(`shop_products[${productIndex}][custom_description]`, product.custom_description)
      formData.append(`shop_products[${productIndex}][custom_price]`, product.custom_price ?? 0)
      formData.append(`shop_products[${productIndex}][is_produced_by_custimoo]`, product.is_produced_by_custimoo)
      formData.append(`shop_products[${productIndex}][is_custom_product]`, product.is_custom_product)
      formData.append(`shop_products[${productIndex}][product_id]`, product.product_id)
      let publish_at = product.publish_at
      let unpublish_at = product.unpublish_at
      if(publish_at){
        publish_at = moment.utc(publish_at).format("YYYY-MM-DD HH:mm:ss");
        formData.append(`shop_products[${productIndex}][publish_at]`, publish_at)
      }
      if(unpublish_at){
        unpublish_at = moment.utc(unpublish_at).format("YYYY-MM-DD HH:mm:ss");
        formData.append(`shop_products[${productIndex}][unpublish_at]`, unpublish_at)
      }

      if(product.product_locker_room_id) {
        const frontBackImageBaseUrl = `company_${this.shop.company_id}/files/locker_products/${product.product_locker_room_id}`
        formData.append(`shop_products[${productIndex}][front_image]`, `${frontBackImageBaseUrl}/front.png`)
        formData.append(`shop_products[${productIndex}][back_image]`, `${frontBackImageBaseUrl}/back.png`)
      } else {
        formData.append(`shop_products[${productIndex}][front_image]`, product.front_image)
        formData.append(`shop_products[${productIndex}][back_image]`, product.back_image)
      }


      formData.append(`shop_products[${productIndex}][manage_inventory]`, product.manage_inventory)
      let sendSizes = product.sizes && product.sizes.constructor.name === "Array"
      if(product.is_produced_by_custimoo && !product.is_custom_product){
        sendSizes = false
      }
      if(sendSizes) {
        product.sizes.forEach((size, sizeIndex) => {
        formData.append(`shop_products[${productIndex}][sizes][${sizeIndex}][name]`, size.name)
        formData.append(`shop_products[${productIndex}][sizes][${sizeIndex}][stock]`, size.stock)
      })
    }

    });
    return formData;
  }
  public checkSlugAvailability() {
    http.post(`companies/${this.company.id}/slugs/availability`, {name: this.shop.slug, shop_id: this.shop.id}).then(({data: {message}}) => {
      this.isSlugValidated = true;
      //this as any is due to type script give keepOnHover error
      (this as any).$toasted.show(message, {
      type: 'success',
      position: 'bottom-left',
      keepOnHover: true,
      duration: 5000,
      action: {
        text: '×',
        onClick: (e, toastObject) => {
          toastObject.goAway(0) // dismiss on click
        }
      }
    })
    }).catch(errorResponse => {
      this.isSlugValidated = false;
      handleResponseException(errorResponse)
    })
  }
public formatProdCustomPrice(product:any){
  product.custom_price = formatCustomPrice(product.custom_price)
}
  public handleOwnProductUpserted(upsertedProduct) {
    const lastSortOrder = getShopLastProductSortOrder()
    if(this.ownProductEditInfo.index == -1 ) {
      this.shop.products.push({...upsertedProduct, ...{sort_order: lastSortOrder + 1}})
    } else {
      this.shop.products[this.ownProductEditInfo.index] = upsertedProduct
    }
    this.ownProductEditInfo =  {
      index: -1, product: {}
    }
    this.$store.commit('SET_SHOP', this.shop)
  }

  public handleShopOwnProductUpsertCancelEvent() {
    this.ownProductEditInfo =  {
      index: -1, product: {}
    }
  }

  public editShopProduct(shopProductIndex, shopProduct) {
    this.isShareModalOpen = false
    this.isPasswordModalOpen = false
    this.isProductsUrlModalOpen = false
    if(shopProduct.product_locker_room_id) {
      shopProduct.override_product_info = !shopProduct.override_product_info
    } else {
      this.ownProductEditInfo.index =  shopProductIndex
      this.ownProductEditInfo.product =  shopProduct
      setTimeout(() => {
        this.showVModal('shop-own-product-modal')
      }, 1);
    }
  }
  removeShopProduct(shopProductIndex) {
    this.shop.products.splice(shopProductIndex, 1)
    this.$store.commit('SET_SHOP', this.shop)
  }

  public togglePasswordModal() {
    this.isPasswordModalOpen = !this.isPasswordModalOpen;
    this.isShareModalOpen = false;
    this.isProductsUrlModalOpen = false;

    if (this.isPasswordModalOpen) {
      this.$nextTick(() => {
        this.domDocument?.addEventListener('click', this.handleClickOutsidePassword);
      });
    } else {
      this.domDocument?.removeEventListener('click', this.handleClickOutsidePassword);
    }
  }

  public handleClickOutsidePassword(event: Event) {
    const passwordWrap = this.$refs.passwordWrap as HTMLElement;
    if (passwordWrap && !passwordWrap.contains(event.target as Node)) {
      this.isPasswordModalOpen = false;
      this.domDocument?.removeEventListener('click', this.handleClickOutsidePassword);
    }
  }

  beforeDestroy() {
    this.domDocument?.removeEventListener('click', this.handleClickOutsideShare);
    this.domDocument?.removeEventListener('click', this.handleClickOutsidePassword);
    this.domDocument?.removeEventListener('click', this.handleClickOutside);
  }

  public setPassword() {
    if (this.shopPassword || this.shopConfirmPassword) {
      if (this.shopPassword === this.shopConfirmPassword) {
        this.shop.password = this.shopPassword
        this.shop.password_confirmation = this.shopConfirmPassword
        this.isPasswordModalOpen = false;
        showToastedMessage("Shop password protection enabled")
      } else {
        showToastedMessage("Password and confirm password must be same", "error")
      }
    } else {
      showToastedMessage("Password and Confirm Password fields are required and must match", "error")
    }
  }

  public clearPassword() {
    this.shopPassword = ''
    this.shopConfirmPassword = ''
    this.shop.password = ''
    this.shop.password_confirmation = ''
    this.togglePasswordModal()
    showToastedMessage("Shop password protection disabled")
  }

  public toggleShareModal() {
    this.isPasswordModalOpen = false;
    this.isProductsUrlModalOpen = false
    this.isShareModalOpen = !this.isShareModalOpen;

    if (this.isShareModalOpen) {
      this.$nextTick(() => {
        this.domDocument?.addEventListener('click', this.handleClickOutsideShare);
      });
    } else {
      this.domDocument?.removeEventListener('click', this.handleClickOutsideShare);
    }
  }

  public handleClickOutsideShare(event: Event) {
    const shareWrap = this.$refs.shareWrap as HTMLElement;
    if (shareWrap && !shareWrap.contains(event.target as Node)) {
      this.isShareModalOpen = false;
      this.domDocument?.removeEventListener('click', this.handleClickOutsideShare);
    }
  }

  public disableDates(ymd, date) {
    console.log("Sss", ymd, date)
  // Disable dates before today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (date < today) {
    return true
  }

  // If a start date is selected, disable same-day or earlier end dates
  if (this.shop.start_at) {
    const startDate = new Date(this.shop.start_at)
    startDate.setHours(0, 0, 0, 0)
    if (date <= startDate) {
      return true
    }
  }
  return false
}

copyShareLink() {
    const done = () => { this.shareCopied = true; setTimeout(() => (this.shareCopied = false), 1200); };
    const text = `${getCompanyBaseUrl()}merchant-shop/${this.shop.slug}`

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(done);
      return;
    }
    const i = document.createElement('input');
    i.value = text; document.body.appendChild(i); i.select();
    try { document.execCommand('copy'); } catch { }
    document.body.removeChild(i);
    done();
  }

  emitShopModalCloseEvent() {
    this.showVModal('locker-modal')
    this.hideVModal('create-update-shop-modal')
    this.$emit('shop-model-closed')
  }

  //methods ends
}
</script>
<style scoped lang="scss">
:deep(.absolute-modals.vm--container.scrollable .vm--modal) {
  max-height: 90vh !important;
  overflow-y: auto !important;
}

.animate-scale {
  animation: scaleIn 0.3s ease-out;
}

.check-icon{
  font-size: 2.3rem;
}

.capitalize {
  text-transform: capitalize;
}

.respCanvas {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.respCanvas>div {
  width: 100%;
}

.respCanvas>div img {
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

$accent: #00b894;
$accent-100: #f7fffc;
$border: #e8ecef;
$text-muted: #8b979f;
$shadow: 0 12px 28px rgba(0, 0, 0, .08);

.share-wrap {
  position: relative;
  display: inline-block;
}

.share-trigger {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  border: 1px solid $accent;
  color: $accent;
  background: #fff;
  padding: .35rem .6rem;
  border-radius: 8px;
  font-weight: 600;

  &:hover {
    background: $accent-100;
  }

  .icon {
    line-height: 0;
    display: inline-flex;
  }

  .label {
    transform: translateY(-1px);
  }
}

/* Backdrop */
.product-popover-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(3px);
  z-index: 9998;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8%;
}

.product-popover {
  background: #fff;
  border-radius: 14px;
  z-index: 9999;
  padding: 24px;
  width: 420px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  animation: fadeZoom 0.3s ease;
  transform-origin: center;
}

.fade-zoom-enter-active,
.fade-zoom-leave-active {
  transition: all 0.25s ease;
}
.fade-zoom-enter-from,
.fade-zoom-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@keyframes fadeZoom {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.icon-close{
    position: absolute;
    top: 0;
    right:5px;
}

.share-popover {
  position: absolute;
  top: 110%;
  right: 0;
  width: 320px;
  background: #fff;
  border: 1px solid $border;
  border-radius: 12px;
  padding: 14px;
  box-shadow: $shadow;
  z-index: 9999;

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .url-row {
    gap: 8px;
    margin-bottom: 12px;

    .url-input {
      flex: 1;
      height: 40px;
      // border: 1px solid $border;
      padding: 0 12px;
      font-size: 14px;
      background: #fafafa;
    }

    .square-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      cursor: pointer;
      background: $accent;
      color: #fff;

      &:hover {
        filter: brightness(.95);
      }
    }
  }

  .toggler {
    margin: 6px 2px 14px;

    .muted {
      color: $text-muted;
      font-size: 13px;
    }

  }
  .copy-cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 44px;
    border: none;
    border-radius: 10px;
    background: $accent;
    color: #fff;
    font-weight: 600;
    margin-bottom: 12px;
    cursor: pointer;

    &:hover {
      filter: brightness(.95);
    }

    &.light{
      background: var(--theme-color-light);
      color: var(--theme-color);
    }
  }

  .download-cta {
    width: 100%;
    height: 48px;
    background: #fff;
    color: $accent;
    border: 2px solid $accent;
    font-weight: 700;
    border-radius: 10px;
    cursor: pointer;

    &:hover {
      background: $accent-100;
    }
  }
}

.remove.edit{
  background: var(--theme-color);
  border-color: var(--theme-color);
  right: 25px !important;
}
.url-row {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 10px;
  overflow: hidden;
}

.url-prefix {
  background: #f0f0f0;
  color: #555;
  padding: 8px;
  white-space: nowrap;
}

.url-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 8px;
}

.published-btn {
  cursor: pointer;
  transition: all 0.2s ease;
  &:not(.live-status) {
    background-color: #555;
    border-color: #555;
    color: #fff;
  }
  &.live-status {
    background-color: #9ef1be !important;
    border-color: #9ef1be !important;
    color: #38793b !important;
    border-radius: 8px;
    padding: 8px 12px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
      background-color: #8de0ad !important;
      border-color: #8de0ad !important;
    }

    .live-indicator {
      display: flex;
      align-items: center;
      gap: 6px;

        .live-icon {
          width: 8px;
          height: 8px;
          background-color: #38793b;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 2s infinite;
        }
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}


.switch-row {
  display: grid;
  width: 100%;
  grid-template-columns: 220px auto;
  align-items: center;
  &:last-of-type{
    margin-top: 10px !important;
  }
  label{
  cursor: pointer;
  }
/* Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 30px;
  cursor: pointer;
  height: 18px;

  input {
    display: none;
  }

  .slider {
    position: absolute;
    inset: 0;
    background: grey;
    border-radius: 999px;
    transition: .2s;

    &:before {
      content: "";
      position: absolute;
      width: 18px;
      height: 18px;
      left: 0px;
      top: 0px;
      background: #fff;
      border-radius: 50%;
      transition: .2s;
      box-shadow: 0 1px 3px rgba(0, 0, 0, .1);
    }
  }

  input:checked+.slider {
    background: $accent;
  }

  input:checked+.slider:before {
    transform: translateX(12px);
  }
}
}

</style>
