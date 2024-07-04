<template>
  <div class="d-flex justify-content-center" v-if="product.id">
    <b-card class="d-flex flex-column justify-content-center align-items-centerw m-5 w-50 shadow-sm">
      <b-progress style="height: 5px" :value="progress" variant="success"></b-progress>
      <b-card v-if="currentStep == 1" class="card-style border-0">
        <b-card-header class="bg-transparent border-0"><span class="h3">Choose Product and Styles</span></b-card-header>
        <b-card-body>
          <div class="collar-area">
            <b-container fluid>
              <b-row>
                <b-col cols="6">
                  <div class="collar-description">
                    <h3 class="h4">{{ product.name }}</h3>
                    <div v-html="product.sku.description"></div>
                  </div>
                  <div>
                    <hr/>
                  </div>
                  <div v-if="product.product_styles.length > 0" class="choose-collar mb-3">
                    <h2 class="fw-bold mb-2 fz-18">Choose Style</h2>
                    <div class="collar-designs">
                      <template v-for="(product_style, productStyleIndex) in product.product_styles">
                        <div :key="`product_style_container_${productStyleIndex}`" class="text-center">
                          <b-button variant="outline-light"
                                    :class="{'active': product.selected_style_id == product_style.id}"
                                    @click="product.selected_style_id = product_style.id">
                            <img v-if="product_style.style_icon_url"
                                 :src="`${storageUrl}${product_style.style_icon_url}`"
                                 :alt="product_style.style_icon_url"
                                 :key="`style_${productStyleIndex}_icon`"/>
                            <img v-else :src="storageUrl+product_style.front_models[0].file_url" alt="Collar"
                                 :key="`style_front_model_${productStyleIndex}_file_url`"/>
                          </b-button>
                          <span class="mt-1 d-inline-flex">{{ product_style.name }}</span>
                        </div>
                      </template>
                    </div>
                  </div>

                  <div class="choose-stuff" v-if="product.active_addons.length > 0">
                    <h2 class="fw-bold mb-3 fz-18">Addons</h2>
                    <div class="stuff-row addons d-flex gap-2">
                      <template v-for="(active_addon, activeAddonIndex) in product.active_addons">
                        <div class="addon d-inline-flex gap-1" :class="{selected: active_addon.selected}"
                             :key="`active_addon_${activeAddonIndex}_container`">
                          <b-form-checkbox size="lg" v-model="active_addon.selected"
                                           @change="handleAddonSelectionUpdate">
                            {{ active_addon.title }}
                            <span class="charges" v-if="product.price_info.show_price">+ {{
                                active_addon.currencies[0].symbol
                              }}{{ active_addon.currencies[0].price }}</span>
                          </b-form-checkbox>
                        </div>
                      </template>
                    </div>
                  </div>
                </b-col>
                <b-col cols="6" class="d-flex justify-content-center align-items-center">
                  <div>
                    <img class="w-50 h-75" :src="`${storageUrl}${product.product_styles[0]?.front_models[0]?.file_url}`"
                         alt="">
                    <img class="w-50 h-75" :src="`${storageUrl}${product.product_styles[0]?.back_models[0]?.file_url}`"
                         alt="">
                  </div>
                </b-col>
              </b-row>
            </b-container>
          </div>
        </b-card-body>
        <b-card-footer class="d-flex justify-content-between align-items-center bg-transparent border-0">
          <b-button class="card-link" variant="danger" @click="$router.push({ path: '/' })">Cancel</b-button>
          <div>
            <b-button class="card-link" variant="secondary" @click="onClickNext">Next</b-button>
          </div>
        </b-card-footer>
      </b-card>

      <b-card v-if="currentStep == 2" class="card-style border-0">
        <b-card-header class="bg-transparent border-0"><span class="font-weight-bold" style="font-size: 20px">Upload Assets</span>
        </b-card-header>
        <b-card-body>
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div >
              <form name="upload_assets" ref="upload_assets">
                <div class="assets-uploader">
                  <font-awesome-icon size="2x" :icon="['fas', 'image']"/>
                  <div style="white-space: nowrap; font-size: 16px; font-weight: bold">Upload custom design assets</div>
                  <input multiple type="file" @change="handleProductAssetsUpload">
                </div>
              </form>
            </div>
            <div v-if="product.existing_assets.length > 0 || product_assets.length">
              <div class="file-preview-section">
                <template
                  v-for="(product_existing_new_assets, productExistingNewAssetsIndex) in [product.existing_assets, product_assets]">
                  <div style="width: 100%" v-for="(product_asset, productAssetIndex) in product_existing_new_assets"
                       :key="`product-asset-${productExistingNewAssetsIndex}-${productAssetIndex}`">
                    <div style="display: flex; justify-content: space-between; width: 100%; padding: 20px 0px 20px 0px">
                      <div class="d-flex justify-content-between align-items-center">
                        <div class="file-placeholder" v-if="!isFilePreviewable(product_asset.name)">
                          <img style="width: 35px; padding-left: 10px" :src="getFilePlaceHolder(product_asset.name)" alt="">
                        </div>
                        <div style="padding-left: 10px">
                          {{ product_asset.name }}
                        </div>
                      </div>
                      <div style="cursor: pointer; color: red; padding-right: 10px" @click="removeAsset(product_asset, productAssetIndex)"><font-awesome-icon :icon="['fas', 'trash-alt']"/></div>
                    </div>
                    <hr class="border m-0" />
                  </div>
                </template>
              </div>
            </div>
          </div>
        </b-card-body>
        <b-card-footer class="d-flex justify-content-between align-items-center bg-transparent border-0">
          <b-button class="card-link" variant="danger" @click="$router.push({ path: '/' })">Cancel</b-button>
          <div class="d-flex">
            <b-button variant="secondary" class="card-link" @click="onClickBack">Back</b-button>
            <b-button class="card-link" variant="secondary" @click="onClickNext">Next</b-button>
          </div>
        </b-card-footer>
      </b-card>

      <b-card v-if="currentStep == 3" class="card-style border-0">
        <b-card-header class="bg-transparent border-0"><span class="font-weight-bold" style="font-size: 20px">Customize Roster</span>
        </b-card-header>
        <b-card-body>
          <div class="roster-section">
            <div class="px-2 d-flex gap-1 flex-wrap align-items-center justify-content-between">
              <div> Add order details from excel file:</div>
              <div class="d-flex gap-2 mt-1">
                <button @click="downloadTemplate(product.id)" class="btn btn-secondary btn-sm"
                        v-b-tooltip="'Download the sample file of microsoft excel to fill the data to upload it later'">
                  <b-icon-download/>
                  <br>
                  Download sample
                </button>
                <form name="upload_excel">
                  <div class="excel-file-uploader">
                    <svg viewBox="0 0 16 16" width="1em" height="1em" focusable="false"
                         role="img" aria-label="file earmark excel fill" xmlns="http://www.w3.org/2000/svg"
                         fill="currentColor" class="bi-file-earmark-excel-fill b-icon bi">
                      <g>
                        <path
                          d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM5.884 6.68 8 9.219l2.116-2.54a.5.5 0 1 1 .768.641L8.651 10l2.233 2.68a.5.5 0 0 1-.768.64L8 10.781l-2.116 2.54a.5.5 0 0 1-.768-.641L7.349 10 5.116 7.32a.5.5 0 1 1 .768-.64z"></path>
                      </g>
                    </svg>
                    <div class="drop-file" style="white-space: nowrap;">Drop/Select the file
                    </div>
                    <div style="white-space: nowrap;">Upload excel file</div>
                    <input type="file"></div>
                </form>
              </div>
            </div>
            <div class="d-flex mt-2 align-items-center justify-content-between bg-light p-2">
              <div class="align-self-start">
                <div class="d-flex gap-2" v-if="product.allow_name_number && customer_lockers_rooms.length > 0">
                  <div>
                    <label>Select Locker</label>
                    <b-form-select class="mt-1" v-model="selected_locker_room_products"
                                   @change="locker_room_previous_selected_product = ''"
                                   :options="customer_lockers_rooms" text-field="room_name"
                                   value-field="products">
                    </b-form-select>
                  </div>
                  <div v-if="selected_locker_room_products && selected_locker_room_products.length > 0">
                    <label>Select locker product</label>
                    <div class="d-flex gap-1 align-items-end">
                      <select class="form-control mt-1 custom-select" @change="handleLockerProductChange($event)">
                        <option :value="''">Please Select Locker Product</option>
                        <template
                          v-for="(locker_room_selected_product, lockerRoomProductIndex) in selected_locker_room_products">
                          <option :value="locker_room_selected_product.id"
                                  :key="`locker-room-selected-product-${locker_room_selected_product.id}`">
                            {{ locker_room_selected_product.product_name }}
                          </option>
                        </template>
                      </select>
                      <b-button class="flex-shrink-1 w-auto" title="Undo" v-if="undo_roster">
                        <BIconReplyFill/>
                      </b-button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="ml-auto mr-2">
                <a title="Size Guide" v-if="product.sku.image_url"
                   :href="`${storageUrl}${product.sku.image_url}`"
                   target="_blank" class="btn btn-secondary fs-3 btn-sm">
                  <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em"
                       viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet">
                    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                       fill="currentColor" stroke="none">
                      <path d="M3855 5101 c-26 -16 -1647 -1637 -3328 -3326 -459 -462 -527 -534 -527 -560 0 -26 75 -105 593 -622 519 -519 596 -593 622 -593 26 0 255 225
            1967 1938 1713 1712 1938 1941 1938 1967 0 26 -74 103 -593 622 -466 467 -597 593 -617 593 -14 0 -38 -9 -55 -19z m565 -686 l515 -515 -327 -327 -328 -328
            -368 368 c-326 325 -371 367 -399 367 -40 0 -71 -27 -79 -68 -7 -33 -1 -39 365 -405 l371 -372 -230 -230 -230 -230 -223 223 c-209 208 -225 222 -259 222
            -28 0 -42 -7 -57 -26 -43 -54 -38 -61 204 -304 l225 -225 -232 -232 -233 -233 -365 365 c-337 336 -369 365 -400 365 -44 0 -80 -33 -80 -74 0 -27 44 -75 367
            -398 l368 -368 -227 -227 -228 -228 -223 223 c-199 198 -227 222 -255 222 -41 0 -82 -38 -82 -77 0 -22 40 -68 220 -248 121 -121 220 -225 220 -230 0 -6
            -101 -111 -225 -235 l-225 -225 -362 362 c-200 198 -373 364 -386 368 -47 14 -102 -30 -102 -83 0 -9 164 -181 365 -382 201 -201 365 -370 365 -375 0 -6
            -149 -159 -330 -340 l-330 -330 -518 518 -517 517 1855 1855 c1020 1020 1857 1855 1860 1855 3 0 237 -232 520 -515z"></path>
                    </g>
                  </svg>
                  <span class="ml-1" style="font-size: smaller;">Size Guide</span></a></div>
              <div class="d-flex gap-1">
                <button title="Capitalize" type="button"
                        class="btn btn btn-secondary fs-3 btn-sm btn-secondary">
                  Aa
                </button>
                <button title="Uppercase" type="button"
                        class="btn btn btn-secondary fs-3 btn-sm btn-secondary">
                  AA
                </button>
                <button title="Lowercase" type="button"
                        class="btn btn btn-secondary fs-3 btn-sm btn-secondary">
                  aa
                </button>
              </div>
            </div>
            <div class="mt-3">
              <div class="roster-row mb-2">
                <div class="align-left">
                  <div class="hide-show"></div>
                  <div class="roster-name">Name</div>
                  <div class="shirt-no"> No</div>
                  <div class="shirt-size">Size</div>
                </div>
                <div class="align-right">
                  <div class="qty">Qty</div>
                  <div class="remove"></div>
                </div>
              </div>
              <template v-for="(product_roster_item, productRosterItemIndex) in product.product_roster">
                <div class="roster-row mb-2">
                  <div class="align-left">
                    <div class="roster-name">
                      <input type="text" class="form-control" v-model="product_roster_item.text"
                             @change="handleRosterUpdate($event)"></div>
                    <div class="shirt-no">
                      <input type="number" class="text-center form-control" v-model="product_roster_item.number"
                             @change="handleRosterUpdate($event)">
                    </div>
                    <div class="shirt-size">
                      <b-form-select :value="product_roster_item.size_index"
                                     @change="handleRosterUpdate($event, product_roster_item, 'size')">
                        <template v-for="(product_size, productSizeIndex) in product.product_sizes">
                          <b-form-select-option :key="`product-roster-size-${productSizeIndex}`"
                                                :value="productSizeIndex">
                            {{ product_size.label }}
                          </b-form-select-option>
                        </template>
                      </b-form-select>
                    </div>
                  </div>
                  <div class="align-right">
                    <div class="qty">
                      <input type="number" min="1" placeholder="1" class="text-center form-control"
                             v-model="product_roster_item.quantity"
                             @change="handleRosterUpdate($event)">
                    </div>
                    <div class="remove" v-if="productRosterItemIndex > 0">
                      <a @click="removeRosterItem(productRosterItemIndex)">
                        <font-awesome-icon :icon="['fas', 'trash-alt']"/>
                      </a>
                    </div>
                  </div>
                </div>
              </template>
            </div>
            <div class="button-holder mt-3 gap-2 d-flex justify-content-end">
              <button class="btn btn-secondary w-auto fw-bold" @click="addPlayer">Add Player</button>
            </div>
          </div>
        </b-card-body>
        <b-card-footer class="d-flex justify-content-between align-items-center bg-transparent border-0">
          <b-button class="card-link" variant="danger" @click="$router.push({ path: '/' })">Cancel</b-button>
          <div class="d-flex" style="gap: 25px;">
            <b-button variant="secondary" @click="onClickBack">Back</b-button>
            <b-button class="card-link" variant="secondary" @click="onClickNext">Next</b-button>
          </div>
        </b-card-footer>
      </b-card>

      <b-card v-if="currentStep == 4" class="card-style border-0">
        <b-card-header class="bg-transparent border-0"><span class="font-weight-bold" style="font-size: 20px">Summary</span></b-card-header>
        <b-card-body>
          <div class="confirm-order-area">
            <div class="accordion">
              <b-card no-body>
                <b-card-header header-tag="header" class="p-1" role="tab">
                  <b-button block v-b-toggle.accordion-1 class="p-3 d-flex align-items-center justify-content-between accordion-open-button"><span class="d-block">Product</span> <span
                    class="accordion-icon"></span></b-button>
                </b-card-header>
                <b-collapse id="accordion-1" accordion="my-accordion" role="tabpanel">
                  <b-card-body class="border-top">
                    <div class="text-md-left mb-2 font-weight-bold">{{ product.name }}</div>
                    <div class="order-collar-style d-flex flex-wrap align-items-center text-left">
                      <div class="image-holder">
                        <template>
                          <img :src="storageUrl+selectedStyle.file_url"
                               alt="Collar"/>
                        </template>
                      </div>
                      <div class="collar-details">
                        <strong> {{ selectedStyle.name }} </strong>
                        <div class="d-flex flex-wrap align-items-center" v-for="(addon, i) in product.addons" :key="i">
                          <div class="category mr-3">{{ addon.addon.name }}</div>
                          <div class="price">+${{ addon.addon.price }}</div>
                        </div>
                      </div>
                    </div>
                    <div class="order-collar-style d-flex flex-column text-left mt-2">
                      <strong style="font-weight: bold;">{{ product.display_name }}</strong>
                      <div v-html="product.sku.description" style="font-size: small;" class="my-1"></div>
                    </div>
                  </b-card-body>
                </b-collapse>
              </b-card>
              <b-card no-body>
                <b-card-header header-tag="header" class="p-1 bg-transparent border-0" role="tab">
                  <b-button block v-b-toggle.accordion-3
                            class="p-3 d-flex align-items-center justify-content-between accordion-open-button"><span
                    class="d-block">Assets</span> <span
                    class="accordion-icon"></span></b-button>
                </b-card-header>
                <b-collapse id="accordion-3" accordion="my-accordion" role="tabpanel">
                  <b-card-body class="border-top p-0">
                    <div class="file-preview-section border-0">
                      <template
                        v-for="(product_existing_new_assets, productExistingNewAssetsIndex) in [product.existing_assets, product_assets]">
                        <div style="width: 100%" v-for="(product_asset, productAssetIndex) in product_existing_new_assets"
                             :key="`product-asset-${productExistingNewAssetsIndex}-${productAssetIndex}`">
                          <div style="display: flex; justify-content: space-between; width: 100%; padding: 20px 0px 20px 0px">
                            <div class="d-flex justify-content-between align-items-center">
                              <div class="file-placeholder" v-if="!isFilePreviewable(product_asset.name)">
                                <img style="width: 35px; padding-left: 10px" :src="getFilePlaceHolder(product_asset.name)" alt="">
                              </div>
                              <div style="padding-left: 10px">
                                {{ product_asset.name }}
                              </div>
                            </div>
                            <div style="cursor: pointer; color: red; padding-right: 10px" @click="removeAsset(product_asset, productAssetIndex)"><font-awesome-icon :icon="['fas', 'trash-alt']"/></div>
                          </div>
                          <hr class="border m-0" />
                        </div>
                      </template>
                    </div>
                  </b-card-body>
                </b-collapse>
              </b-card>
              <b-card no-body>
                <b-card-header role="tab" class="card-header p-1">
                  <b-button block v-b-toggle.accordion-2
                            class="p-3 d-flex align-items-center justify-content-between accordion-open-button"><span
                    class="d-block">Order</span> <span
                    class="accordion-icon"></span></b-button>
                </b-card-header>
                <b-collapse id="accordion-2" role="tabpanel">
                  <b-card-body>
                    <div class="overflow-hidden roster-details-table">
                      <div class="roster-row head d-flex flex-wrap align-items-center justify-content-between">
                        <span class="name">Name</span>
                        <span>No</span>
                        <span>Size</span>
                        <span>Qty</span>
                      </div>
                      <template v-for="(roster, key) in product.product_roster">
                        <div :key="key" class="roster-row d-flex flex-wrap align-items-center justify-content-between">
                          <span class="name">{{ roster.text }}</span>
                          <span>{{ roster.number }}</span>
                          <span>{{ roster.size }}</span>
                          <span>{{ roster.quantity }}</span>
                        </div>
                      </template>
                    </div>
                  </b-card-body>
                </b-collapse>
              </b-card>
            </div>
          </div>
          <div class="order-details" style="width: 100%" v-if="product.price_info.show_price">
            <div class="qty-area">
              <template>
                <div class="order-row total">
                  <div class="total">Total Quantity</div>
                  <div class="total-qty">{{ product.price_info.total_quantity }}</div>
                </div>
                <template>
                  <div class="order-row total" v-if="product.price_info.product_price">
                    <div class="total">Product Price</div>
                    <div class="total-qty">
                      {{ product.price_info.product_price }} X {{ product.price_info.total_quantity }} =
                      {{ product.price_info.product_price_with_quantity }}{{
                        product.price_info.active_currency?.symbol
                      }}
                    </div>
                  </div>
                  <template v-if="product.price_info.addons_price > 0 ">
                    <div class="order-row total">
                      <div class="total">Addons Price</div>
                      <div class="total-qty">
                        {{ product.price_info.addons_price }} X {{ product.price_info.total_quantity }} =
                        {{ product.price_info.addons_price_with_quantity }}{{
                          product.price_info.active_currency?.symbol
                        }}
                      </div>
                    </div>
                  </template>
                  <template>
                    <div class="order-row total">
                      <div class="total">Total Price</div>
                      <div class="total-qty">{{
                          product.price_info.total_price
                        }}{{ product.price_info.active_currency?.symbol }}
                      </div>
                    </div>
                  </template>
                </template>
              </template>
            </div>
          </div>
        </b-card-body>
        <b-card-footer class="d-flex justify-content-between align-items-center bg-transparent border-0">
          <b-button class="card-link" variant="danger" @click="$router.push({ path: '/' })">Cancel</b-button>
          <div class="d-flex" style="gap: 25px;">
            <b-button variant="secondary" @click="onClickBack">Back</b-button>
            <b-button variant="secondary" disabled v-if="adding_to_cart">{{ actionButtonText }}</b-button>
            <b-button variant="secondary" @click="handleActionButton" v-else>{{ actionButtonText }}</b-button>
          </div>
        </b-card-footer>
      </b-card>
    </b-card>
  </div>
</template>

<script lang="ts">
import VsToast from '@vuesimple/vs-toast';
import {Component, Mixins, Prop} from 'vue-property-decorator'
import {http} from "@/httpCommon";
import {
  getCustomLockers,
  getExtensionFromString, getFilePlaceHolder, getOrderUpdateIdentifier,
  getProductPriceDefaultObject, getRandom,
  handleProductPriceUpdate,
  handleResponseException,
  isFilePreviewable, santaClone
} from "@/helpers/Helpers";
import {find, findIndex} from "lodash"
import {DexieDb, saveState, deleteStateById } from '@/indexedDBPersistence.js';

@Component<CustomDesign>({
  methods: {getFilePlaceHolder},
  components: {},
  mounted() {
    if(!this.customizeProduct) {
      this.$router.push('/')
    }
    this.product = this.customizeProduct
    getCustomLockers().then((customer_lockers: Record<any, any>[]) => {
      this.customer_lockers_rooms = customer_lockers
    })
    this.handleAddonSelectionUpdate()
  },
})

export default class CustomDesign extends Mixins() {
  @Prop({ required: false }) readonly product_id!: number|string
  @Prop({ required: false }) readonly customizeProduct!: Record<any, any>

  // public product_id = this.$route.params.product_id;
  public product: Record<any, any> = {};
  public storageUrl = process.env.VUE_APP_STORAGE_URL
  public customer_lockers_rooms: Record<any, any> = []
  public customer: null | Record<any, any> = null;
  public locker_products: Record<any, any>[] = []
  public selected_locker_room_products: Record<any, any>[]|null = null
  public locker_room_previous_selected_product: string = ''
  public undo_roster = false
  public show_roster_warning = false
  public files: File[] = [];
  public product_assets: Record<any, any>[] = []
  public adding_to_cart = false
  public deleted_assets: Record<any, any>[] = []
  public maxStep = 4;
  public currentStep = 1;
  public DB = DexieDb

  get progress() {
    return Math.round(100 / this.maxStep) * this.currentStep
  }

  get selectedStyle(): Record<any, any> {
    const style = find(this.product.product_styles, (product_style: Record<any, any>) => {
      return product_style.id == this.product.selected_style_id
    })
    return style ? style : {}
  }

  get actionButtonText() {
    let action_button_text = "";
    if(this.product.id) {
      switch (this.product.edit_mode_info_obj.mode) {
        case "cart_edit":
          action_button_text = this.adding_to_cart ? "Updating Cart..." : "Update Cart";
          break;
        case "order_edit":
          action_button_text = this.adding_to_cart ? "Updating Order..." : "Update Order";
          break;
        case "reorder":
          action_button_text = this.adding_to_cart ? "Reordering..." : "Re Order";
          break;
        default:
          action_button_text = this.adding_to_cart ? "Adding To Cart..." : "Add To Cart";
      }
    }
    return action_button_text;
  }

  public isFilePreviewable = isFilePreviewable
  public getFilePlaceHolder = getFilePlaceHolder

  public addPlayer() {
    let product_last_roster = {
      ...this.product.product_roster[this.product.product_roster.length - 1], ...{
        text: "",
        number: "",
        quantity: 1
      }
    };
    this.product.product_roster.push(product_last_roster)
    this.handleAddonSelectionUpdate()
  }

  public removeRosterItem(roster_item_index) {
    this.product.product_roster.splice(roster_item_index, 1)
    this.handleAddonSelectionUpdate()
  }

  /*
  * this method is used to handle size update and to set the boolean whether to show roster update warning or not.
  * Rest the two-way binding is being handled by v-model
  * */
  public handleRosterUpdate(event, product_roster_item={}, type=null) {
    this.show_roster_warning = true
    if(type === "size") {
      //in case of size the event will be the size index
      const selected_size = this.product.product_sizes[event];
      product_roster_item['size_index'] = event
      product_roster_item['size'] = selected_size.label
      product_roster_item['code'] = selected_size.label
    }
    this.handleAddonSelectionUpdate()
  }

  public showRosterWarning() {
    const self = this as Record<any, any>;
    return self.$santaModal.show({
      icon: 'warning', title: 'Are you sure?', text: 'Do you want to overwrite the current information',
      confirm_text: 'Yes, change it', cancel_text: 'No', close_on_confirm: true
    },self)
  }

  public async handleLockerProductChange(event) {
    const self = this as Record<any, any>;
    const locker_selected_product_id = event.target.value;
    let selected_product_roster: any = null
    if(locker_selected_product_id) {
      selected_product_roster = find(this.selected_locker_room_products, ['id', parseInt(locker_selected_product_id)])?.product_roster_detail
      this.formatLockerProductRoster(selected_product_roster)
    }
    // if(selected_product_roster) {
    if(this.show_roster_warning) {
      this.showRosterWarning().then(async (update_roster) => {
        if (update_roster) {
          this.show_roster_warning = false
          if(selected_product_roster) {
            this.product.product_roster = selected_product_roster
          }
          this.locker_room_previous_selected_product = locker_selected_product_id
          await this.handleAddonSelectionUpdate()
        }
        else {
          event.target.value = this.locker_room_previous_selected_product
        }
      });
    }
    else {
      this.show_roster_warning = false
      if(selected_product_roster) {
        this.product.product_roster = selected_product_roster
      }
      this.locker_room_previous_selected_product = locker_selected_product_id
      await this.handleAddonSelectionUpdate()
    }

  }

  public formatLockerProductRoster(locker_product_roster) {
    locker_product_roster.forEach(selected_product_roster_item => {
      selected_product_roster_item.code = selected_product_roster_item.size
      let size_index = findIndex(this.product.product_sizes, ["label", selected_product_roster_item.size])
      selected_product_roster_item.size_index = size_index < 0 ? 0 : size_index
    })
  }

  public async handleAddonSelectionUpdate() {
    this.product.price_info = {...this.product.price_info, ...await handleProductPriceUpdate(false, this.product, this.product.sku)}
  }

  public async downloadTemplate(product_id:any){
    await http.get(`template/download/${product_id}`,{
      responseType: 'blob',
    }).then((res) => {
      const blob = new Blob([res.data],{type:res.headers['content-type']})
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = 'product_'+ this.product.sku.sku_id +'_template.xlsx';
      link.click();
    })
  }

  public handleProductAssetsUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if(target.files) {
      Array.from(target?.files)?.forEach(target_file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (result && typeof result === 'string') {
            this.product_assets.push({
              name: target_file.name,
              original_name: target_file.name,
              extension: getExtensionFromString(target_file.name),
              file_size: (target_file.size / (1024 * 1024)).toFixed(2),
              path: result,
              file: target_file,
              existing_asset: false
            });
          }
        };
        reader.readAsDataURL(target_file);
      })
    }
  }

  public removeAsset(asset, asset_index) {
    const { edit_mode_info_obj: { mode} } = this.product
    if(asset.existing_asset) {
      /*
      * if user is editing cart then make sure to delete assets while updating cart. In case of reorder new product is added
      * to cart instead of updating existing one in the cart so in that case we do not need to keep track of removed/deleted assets
      * */
      if(['cart_edit'].includes(mode)) {
        this.deleted_assets.push({index: asset_index, path: asset.path})
      }
      this.product.existing_assets.splice(asset_index, 1)
    } else {
      this.product_assets.splice(asset_index, 1)
    }
  }

  public async handleActionButton() {
    await this.validateAssets().then((assetValidationResponse: Record<any, any>) => {
      if(assetValidationResponse.validated) {
        const { edit_mode_info_obj } = this.product
        let payload = this.getPayload()
        let { mode, item_id, factory_product_id, factory_product_index, order_active_factory_product, factory_products_count, factory_product_last_index  } = edit_mode_info_obj
        let api_type_url = {type: 'post', url: 'carts'}
        if(mode === "cart_edit") {
          api_type_url = {type: 'put', url: `carts/${edit_mode_info_obj.item_id}`}
        }
        this.adding_to_cart = true
        http.post(api_type_url.url, payload).then(async (successResponse) => {
          let response_data = successResponse.data;
          if(response_data.success) {
            this.$store.commit("SHOW_CART_MODAL", true)
            this.$router.push({name: "Home"})
          } else {
            handleResponseException(response_data)
          }
          this.adding_to_cart = false
        }).catch(async errorResponse => {
          this.adding_to_cart = false
          handleResponseException(errorResponse)
        })
      } else {
        VsToast.show({
          title: assetValidationResponse.message,
          variant: 'info',
          timeout: 5000
        });
      }
    })
  }

  public getPayload() {
    const { edit_mode_info_obj } = this.product
    let factory_product = new FormData();
    factory_product.append("factory_product[is_custom_product]", "true");
    factory_product.append("factory_product[design_id]", "-1");
    factory_product.append("factory_product[svg_groups]", "[]");
    factory_product.append("factory_product[custom_logos]", "[]");
    factory_product.append("factory_product[product_custom_texts]", "[]");
    factory_product.append("factory_product[custom_logo_svgs]", "[]");
    factory_product.append("factory_product[product_custom_text_objects]", "{common: [], roster: []}");
    factory_product.append("factory_product[product_price_object]", JSON.stringify(this.getProductPriceObject()));
    factory_product.append("factory_product[product_name]", `${this.product.name}`);
    factory_product.append("factory_product[product_name_custom]", `${this.product.name}-Custom Design`);
    factory_product.append("factory_product[product_id]", this.product.id as string);
    factory_product.append("factory_product[product_type]", this.product.product_type);
    factory_product.append("factory_product[product_roster_detail]", JSON.stringify(this.product.product_roster));
    factory_product.append("factory_product[front_image]", '');
    factory_product.append("factory_product[back_image]", '');
    factory_product.append("factory_product[custom_product_placeholder]", `placeholders/custom-design.svg`);
    factory_product.append("factory_product[style_id]", this.product.selected_style_id as string);
    factory_product.append("factory_product[style_name]", this.getSelectedStyle().name as string);
    factory_product.append("factory_product[addons]", JSON.stringify(this.getSelectedAddons()));
    this.product_assets.forEach((product_asset) => {
      factory_product.append("product_assets[]", product_asset.file);
    });
    let existing_assets = santaClone(this.product.existing_assets);
    existing_assets = existing_assets.map(existing_asset => {
      delete existing_asset.existing_asset
      return existing_asset
    })
    factory_product.append("factory_product[existing_assets]", JSON.stringify(existing_assets));
    if(edit_mode_info_obj.mode) {
      const edit_mode = edit_mode_info_obj.mode;
      if(this.deleted_assets.length > 0) {
        factory_product.append("factory_product[deleted_assets]", JSON.stringify(this.deleted_assets));
      }
      if(edit_mode == "cart_edit") {
        factory_product.append("_method", 'PUT');
      }
      factory_product.append("factory_product[id]", edit_mode_info_obj.factory_product_id);
      factory_product.append("factory_product[factory_product_index]", edit_mode_info_obj.factory_product_index);
      if(edit_mode === "reorder") {
        factory_product.append("factory_product[reorder_data]", JSON.stringify(this.product.reorder_data));
      }
    }
    return factory_product
  }

  public async validateAssets() {
    let response_obj = {
      validated: true, message: ""
    };
    const { edit_mode_info_obj } = this.product
    const product_assets_count  = this.product_assets.length
    const existing_assets_count = this.product.existing_assets.length
    const existing_new_assets_count = product_assets_count + existing_assets_count
    if(edit_mode_info_obj.mode) {
      if(existing_new_assets_count === 0) {
        response_obj.validated = false
        response_obj.message = "Please upload assets"
      }
    } else {
      if(product_assets_count === 0) {
        response_obj.validated = false
        response_obj.message = "Please upload assets"
      }
    }
    return response_obj;
  }

  public getCustomProductUpdatedData(): Record<any, any> {
    const { edit_mode_info_obj } = this.product
    let updated_data = {
      is_custom_product: true, design_id: -1, svg_groups: [], custom_logos: [], product_custom_texts: [], custom_logo_svgs: [],
      product_custom_text_objects: { common: [], roster: [] }, product_price_object: this.getProductPriceObject(),
      product_name: this.product.name, product_name_custom: `${this.product.name}-Custom Design`, product_id: this.product.id,
      product_type: this.product.product_type, product_roster_detail: this.product.product_roster, front_image: '', back_image: '',
      custom_product_placeholder: 'placeholders/custom-design.svg', style_id: this.product.selected_style_id, style_name: this.getSelectedStyle().name,
      addons: this.getSelectedAddons(), product_assets: this.getUploadedFilesInfo(), deleted_assets: this.deleted_assets, "id": edit_mode_info_obj.factory_product_id,
      factory_product_index: edit_mode_info_obj.factory_product_index, reorder_data: this.product.reorder_data
    }
    let existing_assets = santaClone(this.product.existing_assets);
    existing_assets = existing_assets.map(existing_asset => {
      delete existing_asset.existing_asset
      return existing_asset
    })
    updated_data["existing_assets"] = existing_assets
    return updated_data
  }

  public getProductPriceObject(): Record<any, any> {
    const product_price_info = this.product.price_info
    return {
      product_price: product_price_info.product_price, currency_code: product_price_info.active_currency.code,
      currency_symbol: product_price_info.active_currency.symbol, quantity: product_price_info.total_quantity
    }
  }

  public getSelectedStyle(): Record<any, any> {
    const style = find(this.product.product_styles, (product_style: Record<any, any>) => {
      return product_style.id == this.product.selected_style_id
    })
    return style ? style : {}
  }

  public getSelectedAddons(): [] {
    return this.product.active_addons.filter(active_addon => {
      return active_addon.selected;
    })
  }

  public getUploadedFilesInfo(): any[] {
    const uploaded_files: any[] = []
    this.product_assets.forEach((product_asset) => {
      uploaded_files.push({
        name: product_asset.name,
        original_name: product_asset.name,
        extension: product_asset.extension,
        file_size: product_asset.file_size,
        base64_encoded_file: product_asset.path,
      })
    });
    return uploaded_files
  }
  /*
  * action must be passed if the factory_product_index is not last index. If factory_product is not last product
  * */
  public getOrderUpdateItemInfoObject(action: any=null): Record<any, any> {
    const { edit_mode_info_obj } = this.product
    let order_update_item_info_object = {}
    if(edit_mode_info_obj.mode == "order_edit") {
      let factory_product_previous_index, factory_product_next_index = -1
      const update_order_item_identifier = getOrderUpdateIdentifier(true)
      const { factory_product_index, factory_product_last_index, factory_product_id, factory_products_count } = edit_mode_info_obj
      if(factory_product_index == factory_product_last_index) {
        action = "submit"
      }
      if(factory_product_index < factory_product_last_index) {
        factory_product_next_index = factory_product_index + 1
      }
      if(factory_product_index > 0) {
        factory_product_previous_index = factory_product_index - 1
      }
      order_update_item_info_object = {
        item_id: edit_mode_info_obj.item_id, factory_product_index, factory_product_last_index, factory_product_id,
        factory_products_count, update_order_item_identifier, factory_product_previous_index, factory_product_next_index, action
      }
    }
    return order_update_item_info_object;
  }

  public onClickBack() {
    this.currentStep--;
  }

  public onClickNext() {
    this.currentStep++;
  }

}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap');

.main-container {
  display: flex;
  flex-direction: column;
  gap: 50px;
}

.collar-designs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
  justify-content: center;

  .btn {
    width: 70px;
    height: 60px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    border: 1px solid #ccc;
    background: none;

    @media only screen and (min-width: 992px) {
      width: 110px;
      height: 100px;
    }

    &.active,
    &:hover {
      border-color: #219f84 !important;
    }

    img {
      display: block;
      max-width: 100%;
      max-height: 100%;
      margin: 0 auto;
      height: auto;
    }
  }
}

.addon {
  align-items: center;
  padding: 6px 8px;
  border-radius: 7px;
  background: #eee;
  border: 1px solid transparent;

  &.selected {
    background: var(--theme-color-light);
    border-color: var(--theme-color);
  }

  label {
    white-space: nowrap;
    display: flex;
    cursor: pointer;
    padding-top: 2px;

    &:before, &:after {
      margin-top: 2px;
    }
  }

  .charges {
    margin-left: 5px;
    padding-left: 5px;
    border-left: 1px solid #ddd;
    color: #666;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.addons {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.order-details {
  overflow: hidden;
  padding: 1rem 0 0;

  @media only screen and (min-width: 992px) {
    padding: 1rem;
  }

  h2 {
    border-bottom: 1px solid #EFF2F4;
    padding-bottom: 10px;
    margin-bottom: 10px;
  }

  .qty-area {
    flex: 0 0 30%;
  }

  .pricing-are {
    flex: 0 0 50%;
    max-width: 50%;

    .btn {
      @media only screen and (max-width: 767px) {
        font-size: 0.75rem;
      }
    }
  }

  .order-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    margin: 0 0 10px;

    &.total {
      border: solid #EFF2F4;
      border-width: 1px 0;
      padding: 10px 0;
      font-weight: 700;

      .cost-area {
        color: #219F84;
      }
    }
  }

  .choose-stuff {
    display: none;
  }
}

.file-preview-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  height: auto;
  overflow: scroll;
  border: 1px solid silver;
  border-radius: 4px;
  color: gray;
}

.file-preview-section::-webkit-scrollbar {
  display: none;
}

.excel-file-uploader {
  position: relative;
  background: var(--theme-color-light);
  border: 1px solid var(--theme-color);
  border-radius: 4px;
  padding: 10px 20px;
  color: var(--theme-color);
  cursor: pointer;
  text-align: center;
  overflow: hidden;
  flex-shrink: 0;
  min-width: 190px;

  .drop-file {
    display: none;
  }

  &:hover {
    border-style: dashed;

    div:not(.drop-file) {
      display: none;
    }

    .drop-file {
      display: block;
    }
  }

  input {
    position: absolute;
    z-index: 100;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    appearance: none;
    display: block;
    height: 1000px;
    width: 1000px;
    opacity: 0;
    cursor: pointer;
  }
}

.assets-uploader {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  border: 1px solid silver;
  border-radius: 4px;
  padding: 10px 20px;
  color: gray;
  cursor: pointer;
  text-align: center;
  overflow: hidden;
  flex-shrink: 0;
  min-width: 190px;
  height: 250px;

  &:hover {
    border-style: dashed;
  }

  input {
    position: absolute;
    z-index: 100;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    appearance: none;
    display: block;
    height: 1000px;
    width: 1000px;
    opacity: 0;
    cursor: pointer;
  }
}

.file-placeholder {
  display: flex;
  justify-content: center;
}

.order-collar-style {
  overflow: hidden;

  .image-holder {
    border: 1px solid #EDF2F6;
    padding: 10px;
    width: 72px;
    height: 66px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    margin: 0 15px 0 0;

    img {
      display: block;
      max-width: 100%;
      margin: 0 auto;
      height: auto;
    }
  }

  .collar-details {
    strong {
      display: block;
      font-weight: 600;
      margin: 0 0 10px;
    }
  }
}

.order-logo-holder {
  .logo-area {
    flex: 0 0 48%;
    max-width: 48%;
    border-radius: 5px;
  }
}

.confirm-order-area {
  .accordion {
    .card-header {
      background: none;
      border: none;
    }

    .card {
      border-radius: 0;
    }

    .btn:not(.isBtn) {
      background: none;
      border: none;
      color: #03142E;
      text-align: left;
      font-size: 16px;
      font-weight: 600;
      position: relative;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;

      &:focus {
        box-shadow: none;
      }

      &:active {
        background: none;
        border: none;
        color: #03142E;
      }

      .accordion-icon {
        background: #808895;
        width: 18px;
        height: 18px;
        border-radius: 2px;
        display: block;
        position: relative;

        &:before {
          position: absolute;
          content: '';
          left: 50%;
          top: 50%;
          border: 6px solid transparent;
          border-top: 6px solid #fff;
          margin: -2px 0 0 -6px;
        }
      }

      &.not-collapsed {
        .accordion-icon {
          transform: rotate(180deg);
          background: #219F84;

          &:before {
            margin-top: -3px;
          }
        }
      }

      .color {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        font-weight: 400;
        max-width: 90px;

        .color-box {
          width: 23px;
          height: 23px;
          background: #000;
          border-radius: 50%;
          display: block;
          position: relative;
          border: 1px solid #000;
          margin: 0 8px 0 0;

          &:before {
            position: absolute;
            content: '';
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            border-radius: 50%;
            border: 3px solid #fff;
          }
        }
      }

      .text {
        width: 100%;
      }
    }

    .nav-link {
      font-size: 12px;
      padding: 0.5rem;
      color: #03142E;
      font-weight: 600;
      border-bottom: 1px solid #EFF2F4;
      transition: all 0.3s ease;

      &:hover {
        border-bottom: 1px solid #219F84;
      }
    }
  }
}

.roster-details-table {
  margin: -1.25rem;

  .roster-row {
    padding: 1.25rem;
    border-bottom: 1px solid #E1E6EA;

    &:first-child {
      border-top: 1px solid #E1E6EA;
      background: #219F84;
      color: white;
    }

    &.head {
      font-weight: 600;
    }

    span.name {
      width: 20%;
      text-align: left;
    }

    span {
      width: 20%;
      text-align: left;
      text-align: center;
    }
  }
}
</style>
