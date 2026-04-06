<template>
  <span>
    <modal :width="screenWidth" :resizable="true" :scrollable="true" height="auto" :reset="true" :shiftY="0"
      class="absolute-modals" name="shop-own-product-modal" ref="shop-own-product-modal" :hide-footer="true"
      :hide-header="true" @before-open="handleModelBeforeOpenEvent">
      <div class="modal-header">
        <div class="d-flex justify-content-sm-between flex-wrap align-items-center justify-content-center gap-1 w-100">
          <div class="d-flex align-items-center gap-1">
            <span class="fw-bold" style="white-space: nowrap">Add Your Own Product: </span>
          </div>

          <div class="d-flex">
            <span class="close-popup d-flex cursor-pointer" @click="handleCancelEvent"
              style="background: #eee; color: #000; font-size: 1.5rem; border-radius: 100px"><b-icon-x></b-icon-x>
            </span>
          </div>
        </div>
      </div>

      <div class="modal-body">
        <div class="product-form">
          <section class="media-col">
            <!-- Main Preview -->
            <div class="upload-drop preview-box">
              <div class="upload-inner">
                <img v-if="activeImage" :src="imagePreview(activeImage, false, ownProduct?.random_string ?? '')" alt="preview" width="318" height="318"
                  style="object-fit: contain;" />
                <div v-else class="upload-placeholder">No Image Selected</div>
              </div>
            </div>

            <!-- Thumbnails -->
            <div class="thumbs">
              <!-- Front -->
              <div class="thumb" :style="{ border: validationErrors.front_image ? '1px solid red' : '' }">
                <template v-if="ownProduct.front_image">
                  <img :src="imagePreview(ownProduct.front_image, false, ownProduct?.random_string ?? '')" alt="Front Preview" width="80" height="80"
                    style="object-fit: contain;" @click="activeImage = ownProduct.front_image" />
                  <button type="button" class="remove-btn" @click.stop="removeImage('front_image')">✕</button>
                </template>
                <label v-else class="thumb-empty">
                  <span class="plus-icon">+</span>
                  <input type="file" accept="image/*" @change="handleFileChange($event, 'front_image')" />
                </label>
              </div>

              <!-- Back -->
              <div class="thumb">
                <template v-if="imagePreview(ownProduct.back_image)">
                  <img :src="imagePreview(ownProduct.back_image, false, ownProduct?.random_string ?? '')" alt="Back Preview" width="80" height="80"
                    style="object-fit: contain;" @click="activeImage = ownProduct.back_image" />
                  <button type="button" class="remove-btn" @click.stop="removeImage('back_image')">✕</button>
                </template>
                <label v-else class="thumb-empty">
                  <span class="plus-icon">+</span>
                  <input type="file" accept="image/*" @change="handleFileChange($event, 'back_image')" />
                </label>
              </div>
            </div>
          </section>


          <!-- RIGHT: form -->
          <section class="form-col">
             <div class="form-row switch-row">
              <label class="text-muted">Produced by Custimoo</label>
              <label class="switch">
                <input type="checkbox" v-model="ownProduct.is_produced_by_custimoo" @change="handleProducedByCustimooChangeEvent" />
                <span class="slider"></span>
              </label>
            </div>
            <div v-if="ownProduct.is_produced_by_custimoo"  class="form-row switch-row ml-6">
                <label class="text-muted">Custom Product</label>
                <label class="switch">
                 <input type="checkbox" v-model="ownProduct.is_custom_product" @change="handleIsCustomChangeEvent" />
                  <span class="slider"></span>
                </label>
            </div>
            <div class="row">
               <div class="form-row col-md-7">
                <label>Name</label>
                <input v-if="!ownProduct.is_produced_by_custimoo || ownProduct.is_custom_product" v-model="ownProduct.custom_name" type="text" placeholder="Enter here" />
               <b-form-select
                v-else
                v-model="ownProduct.product_id"
                 text-field="name"
                 value-field="product_id"
                :options="companyShopProducts"
                @change="handleProductChangeEvent"
                >
              </b-form-select>
                 <div class="helper" v-if="validationErrors.name">{{ validationErrors.name }}</div>
               </div>

              <div class="form-row col-md-5">
                <label>Price</label>
                <div class="price-input">
                  <span class="prefix" >{{ activeCurrencyCode }}</span>
                  <input v-model.number="ownProduct.custom_price"  @blur="formatProductCustomPrice(ownProduct)" style="border: none" type="number" step="0.01" min="0"
                    placeholder="0.00" />
                </div>
                <div class="helper" v-if="validationErrors.price">{{ validationErrors.price }}</div>
              </div>
            </div>

            <div class="form-row">
              <label>Product Description</label>
              <textarea v-model.trim="ownProduct.custom_description" rows="6" placeholder="Enter here"></textarea>
              <div class="helper" v-if="validationErrors.description">{{ validationErrors.description }}</div>
            </div>

            <div class="form-row">
              <label>Sizes</label>
              <div class="chips">
                <button v-for="(size, sizeIndex) in ownProduct.sizes" :key="`all-sizes-${size.name}`"
                        :style="{cursor: isCustimooProduct ? 'no-drop' : ''}"
                        type="button" class="chip"
                  :class="{ active: size.is_selected }" @click="isCustimooProduct ? '' : changeSizeOnSelection(sizeIndex)">
                  {{ size.name }}
                </button>
              </div>
            </div>

            <div class="form-row custom-size" v-if="canAddCustomSizes">
              <label class="text-muted">Add Your Custom Sizes</label>
              <div class="add-custom">
                <input type="text" v-model.trim="customSize" placeholder="Enter Custom Size"
                  @keyup.enter="addCustomSize" />
                <b-button type="button" variant="secondary" class="" @click="addCustomSize">
                  <b-icon-plus></b-icon-plus> Add
                </b-button>

              </div>
              <div class="chips custom-chips">
                <template v-for="(customSize, customSizeIndex) in ownProduct.sizes">
                  <button v-if="!customSize.is_default" :key="`custom-size-${customSizeIndex}-${customSize.name}`"
                    type="button" @click="customSize.is_selected = !customSize.is_selected"
                    @dblclick="ownProduct.sizes.splice(customSizeIndex, 1)" class="chip removable"
                    :class="{ active: customSize.is_selected }"
                    title="Click to toggle, double-click to remove custom size">
                    {{ customSize.name }}
                    <span class="remove-icon"
                      @click.stop="ownProduct.sizes.splice(customSizeIndex, 1)"
                    >
                    <b-icon-x></b-icon-x>
                    </span>
                  </button>
                </template>
              </div>
            </div>
            <div class="helper" style="margin:-20px 0px 20px 0px" v-if="validationErrors.size"> {{ validationErrors.size }}</div>


            <div class="form-row switch-row" v-if="!ownProduct.is_produced_by_custimoo && canAddCustomSizes">
              <label class="text-muted">Inventory Management</label>
              <label class="switch">
                <input type="checkbox" v-model="ownProduct.manage_inventory" />
                <span class="slider"></span>
              </label>
            </div>

            <table class="table b-table-fixed b-table table-bordered" v-if="ownProduct.manage_inventory">
              <thead>
                <tr>
                  <th class="bg-gray" width="50%">Size</th>
                  <th class="bg-gray" width="50%">Stock</th>
                </tr>
              </thead>
              <tbody>
                  <template v-for="(selectedSize, selectedSizeIndex) in ownProduct.sizes.filter(size => size.is_selected)">
                    <tr v-if="selectedSize.is_selected"
                      :key="`manage-inventory-of-selected-sizes-${selectedSizeIndex}`">
                      <td>
                        <label class="inv-size">{{ selectedSize.name }}</label>
                      </td>
                      <td class="p-0">
                        <input type="number" class="form-control border-0 rounded-0 no-outline" min="0" step="1"
                          :placeholder="`Qty for ${selectedSize.name}`" v-model.number="selectedSize.stock" />
                          <div class="helper" v-if="validationErrors[`size-${selectedSizeIndex}`]" :key="`size-${selectedSizeIndex}-error`">
                            {{ validationErrors[`size-${selectedSizeIndex}`] }}
                          </div>
                      </td>
                    </tr>
                  </template>
              </tbody>
            </table>

            <div class="form-row switch-row">
              <label class="text-muted">Set Availability Period</label>
              <label class="switch">
                <input type="checkbox" v-model="ownProductAvailabilityEnabled"  @change="handleswitch($event)"/>
                <span class="slider"></span>
              </label>
            </div>

            <transition name="fade">
              <div class="avail-grid" v-if="ownProductAvailabilityEnabled">
                <div class="form-row">
                  <label>Start</label>
                  <date-picker :config="datepickerOptions" v-model="ownProduct.publish_at"></date-picker>
                  <div class="helper" v-if="validationErrors.publish_at">{{ validationErrors.publish_at }}</div>
                </div>
                <div class="form-row">
                  <label>End</label>
                  <date-picker :config="datepickerOptions" v-model="ownProduct.unpublish_at"></date-picker>
                </div>
                <div class="helper" v-if="validationErrors.unpublish_at">{{ validationErrors.unpublish_at }}</div>
              </div>
            </transition>

            <div class="d-flex flex-row-reverse" style="gap: 15px">
              <b-button type="button" variant="secondary" class="btn-block" @click="addOwnProduct" v-if="this.ownProductData">
                {{ isEditingProduct ? 'Update' : 'Add' }} Product
              </b-button>
              <b-button type="button" variant="secondary" class="btn-block mt-0 light" @click="handleCancelEvent">
                Cancel
              </b-button>
            </div>
          </section>
        </div>
      </div>
    </modal>
  </span>
</template>

<script lang="ts">
import { Component, Mixins, Ref, Prop, Watch } from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";
import Scene from "@/components/Scene.vue"
import draggable from "vuedraggable";
import ModalAction from "@/mixins/ModalAction";
import CollectionLogoUploader from "@/components/Logo/CollectionLogoUploader.vue";
import datePicker from 'vue-bootstrap-datetimepicker';
import VsToast from '@vuesimple/vs-toast';
import moment from "moment";
import { checkIsEmpty, getImagePreview, getShopProductDefaultObject, santaClone, showToastedMessage, formatCustomPrice } from '@/helpers/Helpers';
import { forEach } from 'lodash';
import { error } from 'jquery';

type Size = string;

interface ProductFormModel {
  name: string;
  price: number;
  description: string;
  selectedSizes: Size[];
  mainImage: File | null;
  front_image: File | null,
  back_image: File | null
}

interface ProductSizeInterface {
  name: string,
  is_default: boolean,
  is_selected: boolean,
  stock: number
}

@Component({
  components: {
    CollectionLogoUploader,
    Scene,
    draggable,
    datePicker
  },
})
export default class ShopOwnProductModal extends Mixins(ErrorMessages, ModalAction) {
  //props starts

  @Prop({
    required: false, default: () => {
      return getShopProductDefaultObject()
    }
  }) readonly ownProductData!: Record<any, any>;

  @Prop({ required: false, default: '' }) readonly shopCurrencyCode!: string;

  //props ends

  //data props starts
  public showLoader = false
  private mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  private screenWidth = this.mobileScreen ? window.screen.availWidth : (window.screen.availWidth - 100)

  public ownProduct = {} as Record<any, any>
  public imagePreview = getImagePreview
  public activeImage = ''
  public customSize = ''

  public inventoryEnabled = false;
  public defaultSizes = ['XS', 'S', 'M', 'L', 'XL'];

  public ownProductAvailabilityEnabled = false;

  public datepickerOptions: Record<any, any> = {
    format: 'YYYY-MM-DD HH:mm',
    // minDate: new Date(),
    icons: {
      time: 'far fa-clock',
      date: 'far fa-calendar',
      up: 'fas fa-arrow-up',
      down: 'fas fa-arrow-down',
      previous: 'fas fa-chevron-left',
      next: 'fas fa-chevron-right',
      today: 'fas fa-calendar-check',
      clear: 'far fa-trash-alt',
      close: 'far fa-times-circle'
    }
  }
  //data props ends

  //watcher starts

  //watcher ends

  //computed starts
  get isCustimooProduct(){
    return this.ownProduct.is_produced_by_custimoo === true && this.ownProduct.is_custom_product === false
  }
  get isEditingProduct() {
    return !checkIsEmpty(this.ownProductData)
  }

  get companyShopProducts() {
    return this.$store.getters.getCompanyShopProducts
  }

  get activeCurrencyCode() {
    return this.shopCurrencyCode || (this.$store.getters.getProductPriceObject?.active_currency?.code ?? '')
  }


  get validationErrors(): Record<string, string> {
    const validationErrorMessages = {} as Record<string, string>

    const publishDate = this.ownProduct.publish_at ? new Date(this.ownProduct.publish_at).getTime() : null
    const unpublishDate = this.ownProduct.unpublish_at ? new Date(this.ownProduct.unpublish_at).getTime() : null

     // 🔹 Availability validation
  if (this.ownProductAvailabilityEnabled) {
    if (!publishDate) {
      validationErrorMessages['publish_at'] = 'Start date is required.'
    }

    if (!unpublishDate) {
      validationErrorMessages['unpublish_at'] = 'End date is required.'
    }

    if (publishDate && unpublishDate) {
      if (publishDate >= unpublishDate) {
        validationErrorMessages['publish_at'] = 'Start date must be before the End date.'
        validationErrorMessages['unpublish_at'] = 'End date must be after the Start date.'
      }
    }
  }

    if(this.ownProduct.front_image) {
      delete validationErrorMessages.front_image
    } else {
      validationErrorMessages['front_image'] =  'Front image is required'
    }
    // if(this.ownProduct.back_image) {
    //   delete validationErrorMessages.back_image
    // } else {
    //   validationErrorMessages['back_image'] =  'Back image is required'
    // }
    if(this.ownProduct.custom_name) {
      delete validationErrorMessages.name
    } else {
      validationErrorMessages['name'] =  'Product name is required'
    }
    if(this.ownProduct.custom_description) {
      delete validationErrorMessages.description
    } else {
      validationErrorMessages['description'] =  'Product description is required'
    }
    if(this.ownProduct.custom_price) {
      if(isNaN(this.ownProduct.custom_price)) {
        validationErrorMessages['price'] =  'Product price must be number'
      } else {
        delete validationErrorMessages.price
      }
    } else {
      validationErrorMessages['price'] =  'Product price is required'
    }
    if(this.ownProduct.sizes) {
      const selectedSizes = this.ownProduct.sizes.filter(size => size.is_selected)
      if(selectedSizes.length === 0) {
        validationErrorMessages['size'] =  'One or more sizes must be selected'
      } else {
        delete validationErrorMessages.size
       }
       selectedSizes.forEach((selectedSize, selectedSizeIndex) => {
        if(this.ownProduct.manage_inventory) {
            if(Number.isInteger(Number(selectedSize.stock)) && selectedSize.stock > 0) {
              delete validationErrorMessages[`size-${selectedSizeIndex}`]
            } else {
              validationErrorMessages[`size-${selectedSizeIndex}`] = `The size (${selectedSize.name}) stock must be integer and greater than 0`
            }
          } else {
            delete validationErrorMessages[`size-${selectedSizeIndex}`]
          }
        })
      }

    return validationErrorMessages
  }

  get canAddCustomSizes() {
    return (this.ownProduct.is_custom_product && this.ownProduct.is_produced_by_custimoo) ||
    (this.ownProduct.is_custom_product === false && this.ownProduct.is_produced_by_custimoo === false)
  }
  //computed ends


  // methods starts

  public handleFileChange(event: Event, imageName: 'front_image' | 'back_image') {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0]
      const validImage: boolean = this.validateFile(file)
      if (!validImage) {
        this.removeImage(imageName)
      } else {
        this.ownProduct[imageName] = file
        this.activeImage = this.ownProduct[imageName]
        showToastedMessage('File uploaded');
      }
    } else {
      this.removeImage(imageName)
    }
  }
 public formatProductCustomPrice(product:any){
    product.custom_price = formatCustomPrice(product.custom_price)
 }
  public handleswitch(e) {
    if(this.ownProductAvailabilityEnabled === false) {
      this.ownProduct.publish_at = null
      this.ownProduct.unpublish_at = null
    }
    if(this.ownProductAvailabilityEnabled === true) {
      this.ownProduct.publish_at = this.ownProductData.publish_at ?? null
      this.ownProduct.unpublish_at = this.ownProductData.unpublish_at ?? null
    }
  }
  public validateFile(file): boolean {
    const file_extension = this.getExtension(file);
    const valid_extension = ['jpg', 'gif', 'png', 'jpeg', 'svg'].includes(file_extension)
    if (!valid_extension) {
      this.showError(`Can not upload load with extension ${file_extension}. Allowed extensions are (jpg, gif, png, jpeg, svg)`)
    }
    return valid_extension
  }

  public getExtension(input: string | File, full: boolean = false): string {
    let name = "";

    if (typeof input === "string") {
      // Strip query and hash
      const clean = input.split("?")[0].split("#")[0];
      name = clean.split("/").pop() ?? "";
    } else {
      // File object
      name = input.name;
    }

    // Extract extension(s)
    const parts = name.split(".");
    if (parts.length <= 1) return "";

    return full ? parts.slice(1).join(".").toLowerCase() : parts.pop()!.toLowerCase();
  }

  public removeImage(imageName: string) {
    this.ownProduct[imageName] = null
    this.activeImage = ''
  }

  public addCustomSize() {
    if (!this.customSize ) {
      showToastedMessage("Size can't be empty", "info")
      return
    }
    const isSizeAlreadyExist = this.ownProduct.sizes.find(size => size.name.toLowerCase() === this.customSize.toLowerCase())
    if (isSizeAlreadyExist) {
      this.customSize = ''
      showToastedMessage('Size already exists', 'info')
    } else {
      this.ownProduct.sizes.push(this.getSizeObject({ name: this.customSize, is_selected: true }))
      this.customSize = ''
      showToastedMessage('Size added')
    }
  }

  public getProductFromId(productId) {
    return this.companyShopProducts.find(product => product.product_id === productId)
  }

  public handleProductChangeEvent(selectedProductId, customPrice=null) {
    const selectedProduct = this.getProductFromId(selectedProductId)
    if(selectedProduct) {
      this.ownProduct.custom_price =  customPrice ? customPrice : selectedProduct.price
      this.setProductSizes(selectedProduct.sizes)
      this.ownProduct.custom_name = selectedProduct.name
      this.ownProduct.product_id = selectedProduct.product_id
    }
  }

  public handleModelBeforeOpenEvent() {
    if(this.isEditingProduct) {
      const {front_image, back_image} = this.ownProductData
      this.activeImage = front_image
      this.ownProduct = santaClone(this.ownProductData)
      this.ownProduct.front_image = front_image
      this.ownProduct.back_image = back_image
      this.ownProductAvailabilityEnabled = this.ownProduct.publish_at || this.ownProduct.unpublish_at;
      if(this.ownProduct.product_id) {
        this.handleProductChangeEvent(this.ownProduct.product_id, this.ownProduct.custom_price)
      } else {
        this.setProductSizes()
      }
      this.setProductSelectedSizes()
    } else {
      this.ownProduct = getShopProductDefaultObject({
        is_custom_product: true,
      })
      this.setProductSizes()
    }
  }

  public setProductSizes(productSizes = []) {
    this.ownProduct.sizes = []
    if(productSizes.length > 0) {
        this.ownProduct.sizes = productSizes.map(size => this.getSizeObject({ name: size, is_default: true, is_selected: this.isCustimooProduct }))
    } else {
      this.defaultSizes.forEach((defaultSize: string) => {
        this.ownProduct.sizes.push(this.getSizeObject({ name: defaultSize, is_default: true }))
      })
    }
  }
  public changeSizeOnSelection(index:number):void{
    const size = this.ownProduct.sizes[index];
    size.is_selected = !size.is_selected;
    this.$set(this.ownProduct.sizes, index, { ...size });
  }
  public setProductSelectedSizes() {
    if (this.isEditingProduct) {
      this.ownProductData.sizes.forEach(selectedSize => {
        const existedSizeIndex = this.ownProduct.sizes.findIndex(size => size.name == selectedSize.name)
        if (existedSizeIndex >= 0) {
          this.$set(this.ownProduct.sizes, existedSizeIndex, {
            ...this.ownProduct.sizes[existedSizeIndex],
            ...{ name: selectedSize.name, stock: selectedSize.stock, is_selected: true }
          })
        } else {
          if (this.canAddCustomSizes) {
            this.ownProduct.sizes.push(this.getSizeObject({ name: selectedSize.name, stock: selectedSize.stock, is_selected: true }))
          }
        }
      })
    }
  }

  public getSizeObject(updatedValues): ProductSizeInterface {
    return {
      ...{
        name: '',
        is_default: false,
        is_selected: false,
        stock: 0
      }, ...updatedValues
    }
  }

  public addOwnProduct() {
    if (!checkIsEmpty(this.validationErrors)) {
      VsToast.show({
          title: 'Please fix the highlighted errors before continuing.',
          variant: 'error',
          timeout: 5000
        })
        return
    }
    const selectedSizes = this.ownProduct.sizes.filter(selectedSize => selectedSize.is_selected)
    this.activeImage = ''
    const ownProductPayload = {
      ...this.ownProduct,
      sizes: selectedSizes,
      // Products created from this modal are custom products by definition.
      is_custom_product: true,
    }
    this.$emit('own-product-upserted', ownProductPayload)
    this.hideVModal('shop-own-product-modal')
  }

  public handleCancelEvent() {
    this.activeImage = ''
    this.hideVModal('shop-own-product-modal')
    this.$emit('own-product-upsert-cancelled')
  }

  public handleProducedByCustimooChangeEvent() {
    const isProduceByCustimoo = this.ownProduct.is_produced_by_custimoo
    const isCustomProduct = this.ownProduct.is_produced_by_custimoo
    this.ownProduct.is_custom_product = false
    this.ownProduct.custom_name = ''
    this.ownProduct.product_id = null
    this.ownProduct.sizes = []
    this.ownProduct.manage_inventory = false

    if(isProduceByCustimoo) {
      const firstProduct = this.companyShopProducts[0]
      this.ownProduct.custom_price = firstProduct.price
      this.setProductSizes(firstProduct.sizes)
      this.ownProduct.custom_name = firstProduct.name
      this.ownProduct.product_id = firstProduct.product_id
    } else {
      this.setProductSizes()
    }
  }

  public handleIsCustomChangeEvent() {
    this.ownProduct.custom_name = ''
    this.ownProduct.product_id = null
    this.ownProduct.sizes = []
    this.ownProduct.manage_inventory = false
    if(this.ownProduct.is_custom_product) {
      this.setProductSizes()
    } else {
      const firstProduct = this.companyShopProducts[0]
      this.setProductSizes(firstProduct.sizes)
      this.ownProduct.custom_name = firstProduct.name
      this.ownProduct.product_id = firstProduct.product_id
      this.ownProduct.custom_price = firstProduct.price
    }
  }
  // methods ends
}
</script>

<style scoped lang="scss">
:deep(.absolute-modals.vm--container.scrollable .vm--modal) {
  max-height: 90vh !important;
  overflow-y: auto !important;
}

.form-col .col-md-7,
.form-col .col-md-5 {
  align-self: flex-start;
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

$product-green: #0fb189;
$muted: #8f95a3;
$border: #e9ebef;
$soft: #f6f7f9;
$text: #1d2230;

.product-form {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 32px;
  padding: 16px;
  color: $text;
  width: 100%;
  max-width: 70rem;
  margin: 0 auto;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
}

/* LEFT */
.media-col {
  .upload-drop {
    position: relative;
    border: 2px dashed $border;
    border-radius: 8px;
    height: 320px;
    background: #fff;
    transition: 0.2s ease;
    display: grid;
    place-items: center;

    &.is-dragover {
      border-color: $product-green;
      background: rgba($product-green, 0.06);
    }

    .file-input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }

    .upload-inner {
      text-align: center;
      pointer-events: none;

      .upload-icon {
        width: 56px;
        height: 56px;
        margin: 0 auto 8px;
        background: $soft;
        border-radius: 12px;
        display: grid;
        place-items: center;

        svg {
          width: 28px;
          height: 28px;
          fill: $muted;
        }
      }

      .muted {
        color: $muted;
        font-size: 14px;

        .linklike {
          pointer-events: all;
          color: $product-green;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }
      }
    }
  }

  .thumbs {
    display: flex;
    flex-direction: row;
    justify-content: center;
    /* center horizontally */
    gap: 8px;
    margin-top: 10px;
  }

  .thumb {
    position: relative;
    width: 84px;
    height: 92px;
    border: 1px solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    cursor: pointer;
  }

  .thumb-empty {
    width: 80px;
    height: 80px;
    //border: 1px dashed #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
  }

  .thumb-empty input[type="file"] {
    opacity: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .plus-icon {
    font-size: 24px;
    color: #aaa;
    pointer-events: none;
    /* lets clicks go through to file input */
  }

  .remove-btn {
    position: absolute;
    top: 2px;
    right: 2px;
    background: rgba(0, 0, 0, 0.6);
    border: none;
    color: white;
    font-size: 14px;
    line-height: 1;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
  }

  .remove-btn:hover {
    background: rgba(0, 0, 0, 0.8);
  }
}

/* RIGHT */
.form-col {
  .form-row {
    /* labels above inputs */
    display: grid;
    grid-template-columns: 1fr;
    align-items: start;
    gap: 8px;
    margin: 0 0 18px;

    label {
      font-weight: 600;
      color: $text;
    }

    input[type="text"],
    input[type="number"],
    input[type="date"],
    textarea {
      width: 100%;
      border: 1px solid $border;
      border-radius: 8px;
      padding: 12px 14px;
      outline: none;
      background: #fff;
      transition: border-color .15s ease;

      &:focus {
        border-color: $product-green;
      }

      &::placeholder {
        color: $muted;
      }
    }

    textarea {
      resize: vertical;
    }
  }

  .price-input {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    border: 1px solid $border;
    border-radius: 8px;
    background: #fff;

    .prefix {
      padding-left: 12px;
      color: $muted;
    }

    input {
      border: none;
      padding: 12px 8px;
      min-width: 0;
    }

    .steppers {
      display: grid;

      button {
        appearance: none;
        border: none;
        background: transparent;
        padding: 0px 10px;
        cursor: pointer;
        color: $muted;
        line-height: 1;

        &:hover {
          color: $text;
        }

        //&:first-child { border-bottom: 1px solid $border; }
      }
    }
  }

  .chips {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    .chip {
      min-width: 48px;
      height: 40px;
      padding: 0 14px;
      border-radius: 10px;
      border: 1px solid $border;
      background: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: .15s ease;

      &.active {
        background: $soft;
        border-color: $product-green;
        box-shadow: inset 0 0 0 1px rgba($product-green, .35);
      }

      &.removable {
        position: relative;
      }
    }
  }

  .custom-size {
    .add-custom {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;

      .btn.add {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: $product-green;
        color: #fff;
        border: none;
        padding: 10px 16px;
        border-radius: 10px;
        cursor: pointer;

        .plus {
          font-size: 18px;
          line-height: 1;
        }
      }
    }

    .custom-chips {
      margin-top: 8px;
    }
  }

  /* Switch rows stay horizontal (labels not stacked) */
  .switch-row {
    grid-template-columns: 220px auto;
    align-items: center;
  }

  /* New selected inventory block below Sizes */
  .selected-inventory {
    border: 1px solid $border;
    border-radius: 12px;
    background: #fff;
    padding: 12px;
    margin-top: -6px;
    margin-bottom: 12px;

    .inv-row {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 12px;
      align-items: center;

      &+.inv-row {
        margin-top: 8px;
      }

      .inv-size {
        font-weight: 600;
        color: $text;
      }

      input[type="number"] {
        width: 100%;
        border: 1px solid $border;
        border-radius: 8px;
        padding: 10px 12px;
        outline: none;
        background: #fff;
        transition: border-color .15s ease;

        &:focus {
          border-color: $product-green;
        }
      }
    }
  }

  .actions {
    margin-top: 20px;
    display: flex;
    gap: 14px;

    .btn {
      border-radius: 12px;
      padding: 14px 22px;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid transparent;
      transition: .15s ease;

      &.primary {
        background: $product-green;
        color: #fff;

        &:hover {
          filter: brightness(0.95);
        }
      }

      &.ghost {
        background: #fff;
        color: $text;
        border-color: $border;

        &:hover {
          background: $soft;
        }
      }
    }
  }

  .helper {
    margin-top: 10px;
    color: #b54747;

    &.success {
      color: #12805a;
    }
  }
}

/* Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;

  input {
    display: none;
  }

  .slider {
    position: absolute;
    inset: 0;
    background: $border;
    border-radius: 999px;
    transition: .2s;

    &:before {
      content: "";
      position: absolute;
      width: 22px;
      height: 22px;
      left: 3px;
      top: 3px;
      background: #fff;
      border-radius: 50%;
      transition: .2s;
      box-shadow: 0 1px 3px rgba(0, 0, 0, .1);
    }
  }

  input:checked+.slider {
    background: $product-green;
  }

  input:checked+.slider:before {
    transform: translateX(20px);
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity .18s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.remove-icon{
  position: absolute;
  top: 0;
  right: 0;
}

.remove-icon:hover {
  color: #39c48c;
}
</style>
