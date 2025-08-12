<template>
  <div class="d-md-flex justify-content-md-center main-container" v-if="product && product.id">
    <div class="loader" v-if="showLoader"><img src="@assets/images/loading.gif"/></div>
    <b-card class="d-flex flex-lg-wrap my-5 mx-0 w-50 shadow-sm p-0 main-card">
      <b-card-body class="p-3">
        <template v-if="getProductEditInfoObject && getProductEditInfoObject.type === 'order_product'">
          <h1>
               {{ parseInt(getProductEditInfoObject.order_product_info.factory_product_active_index) + 1}} / {{ getProductEditInfoObject.order_product_info.factory_products.length }}
          </h1>
        </template>
        <b-progress style="height: 5px" :value="progress" variant="success"></b-progress>

        <b-card v-if="currentStep == 1" class="card-style border-0 p-3">
          <b-card-header class="bg-transparent border-0 p-0"><span class="h4 card-heading">Choose Styles</span></b-card-header>
          <b-card-body class="p-0">
            <div class="collar-area p-0">
              <b-container fluid>
                <b-row no-gutters class="row flex-column flex-lg-row">
                  <b-col xl="6" lg="12" md="12" sm="12" cols="12">
                    <div class="collar-description">
                      <span class="h5 product-title">{{ product.name }}</span>
                      <span class="product-description" v-html="product.sku.description"></span>
                    </div>
                    <div>
                      <hr/>
                    </div>
                    <div v-if="product.product_styles.length > 1" class="choose-collar mb-3">
                      <h2 class="fw-bold mb-2 fz-18">Choose Style</h2>
                      <div class="collar-designs">
                        <template v-for="(product_style, productStyleIndex) in product.product_styles">
                          <div :key="`product_style_container_${productStyleIndex}`" class="text-center">
                            <b-button variant="outline-light"
                                      :class="{'active': product.selected_style_id == product_style.id}"
                                      @click="product.selected_style_id = product_style.id">
                              <template v-if="product_style.style_icon_url">
                                <img
                                     :src="`${storageUrl}${product_style.style_icon_url}`"
                                     :alt="product_style.style_icon_url"
                                     :key="`style_${productStyleIndex}_icon`"/>
                              </template>
                              <template v-else>
                                <template v-if="product_style.front_models.length > 0">
                                  <img :src="storageUrl+product_style.front_models[0].file_url" alt="Collar"
                                       :key="`style_front_model_${productStyleIndex}_file_url`"/>
                                </template>
                              </template>
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
                          <div class="single-addon d-inline-flex gap-1" :class="{selected: active_addon.selected}"
                               :key="`active_addon_${activeAddonIndex}_container`">
                            <b-form-checkbox size="md" v-model="active_addon.selected"
                                             @change="handleAddonSelectionUpdate">
                              <label>
                                {{ active_addon.title }}
                                <span class="charges" v-if="product.price_info.show_price">{{
                                    active_addon.currencies[0].symbol
                                  }}{{ active_addon.currencies[0].price }}</span>
                              </label>
                            </b-form-checkbox>
                          </div>
                        </template>
                      </div>
                    </div>
                  </b-col>
                  <b-col xl="6" lg="12" md="12" sm="12" cols="12" class="d-flex flex-lg-column justify-content-center align-items-center product-preview">
                    <div>
                      <img class="product-preview-image" :src="`${storageUrl}${product.product_styles[0]?.front_models[0]?.file_url}`"
                           alt="">
                      <img class="product-preview-image" :src="`${storageUrl}${product.product_styles[0]?.back_models[0]?.file_url}`"
                           alt="">
                    </div>
                  </b-col>
                </b-row>
              </b-container>
            </div>
          </b-card-body>
          <b-card-footer class="d-flex justify-content-between align-items-center bg-transparent border-0">
           <div class="d-flex justify-content-between">
             <b-button class="card-link" variant="danger" :disabled="updating_item" @click="cancelCustomProduct">Cancel</b-button>
             <b-button class="card-link" variant="info" v-if="orderEditingModeInfo.previous_button" @click="loadOrderProduct('previous')">
               {{ orderEditingModeInfo.previous_button }}
             </b-button>
           </div>
            <div class="d-flex">
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
                    <div style="white-space: break-spaces; font-size: 16px; font-weight: bold">Upload custom design assets</div>
                    <input multiple type="file" @change="handleProductAssetsUpload">
                  </div>
                </form>
              </div>
              <template v-if="product.existing_assets.length > 0 || product_assets.length">
                <div class="file-preview-section">
                  <template
                    v-for="(product_existing_new_assets, productExistingNewAssetsIndex) in [product.existing_assets, product_assets]">
                    <div class="d-flex flex-column justify-content-center" style="width: 100%" v-for="(product_asset, productAssetIndex) in product_existing_new_assets"
                         :key="`product-asset-${productExistingNewAssetsIndex}-${productAssetIndex}`">
                      <div class="d-flex justify-content-between align-items-center w-100 py-4">
                        <div class="d-flex align-items-center">
                          <div class="file-placeholder" v-if="!isFilePreviewable(product_asset.name)">
                            <img style="width: 35px; padding-left: 10px" :src="getFilePlaceHolder(product_asset.name)" alt="">
                          </div>
                          <div style="padding-left: 10px; white-space: break-spaces">
                            {{ product_asset.name }}
                          </div>
                        </div>
                        <div style="cursor: pointer; color: red; padding-right: 10px" @click="removeAsset(product_asset, productAssetIndex)"><font-awesome-icon :icon="['fas', 'trash-alt']"/></div>
                      </div>
                      <hr class="border m-0" />
                    </div>
                  </template>
                </div>
              </template>
            </div>
          </b-card-body>
          <b-card-footer class="d-flex justify-content-between align-items-center bg-transparent border-0">
            <b-button class="card-link" variant="danger" :disabled="updating_item" @click="cancelCustomProduct">Cancel</b-button>
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
              <div class="px-2 d-flex gap-1 flex-column flex-lg-row align-items-center justify-content-between">
                <div> Add order details from excel file:</div>
                <div class="d-flex flex-column flex-md-row gap-2 mt-1">
                  <button @click="downloadTemplate(product.id, product.name)" style="max-height: 58px;" class="btn btn-secondary btn-sm"
                          v-b-tooltip="'Download the sample file of microsoft excel to fill the data to upload it later'">
                    <b-icon-download/>
                    <br>
                    <span style="white-space: nowrap">Download sample</span>
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
                      <input type="file" @input="uploadExcelFile" ref="upload_excel_template"></div>
                  </form>
                </div>
              </div>
              <div class="d-flex gap-2 gap-lg-0 flex-column flex-lg-row mt-2 align-items-center justify-content-center justify-content-lg-between bg-light p-2">
                <div class="align-self-lg-start">
                  <div class="d-flex flex-column flex-lg-row gap-2" v-if="product.allow_name_number && customer_lockers_rooms.length > 0">
                    <div>
                      <label>Select Locker</label>
                      <b-form-select class="mt-1" v-model="selected_locker_room_products"
                                     @change="locker_room_previous_selected_product = ''"
                                     :options="customer_lockers_rooms" text-field="room_name"
                                     value-field="products">
                      </b-form-select>
                    </div>
                    <div v-if="selected_locker_room_products && selected_locker_room_products.length > 0">
                      <label>Select product to copy from</label>
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
                <div class="d-flex flex-column flex-md-row gap-2">
                  <div class="ml-lg-auto mr-2">
                    <a style="max-height: 37px; white-space: nowrap" title="Size Guide" v-if="product.sku.image_url"
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
                    <button @click="updateRosterPlayerNameFormat('capitalized')" title="Capitalize" type="button"
                            class="btn btn btn-secondary fs-3 btn-sm btn-secondary">
                      Aa
                    </button>
                    <button @click="updateRosterPlayerNameFormat('toUpperCase')" title="Uppercase" type="button"
                            class="btn btn btn-secondary fs-3 btn-sm btn-secondary">
                      AA
                    </button>
                    <button @click="updateRosterPlayerNameFormat('toLowerCase')" title="Lowercase" type="button"
                            class="btn btn btn-secondary fs-3 btn-sm btn-secondary">
                      aa
                    </button>
                  </div>
                </div>
              </div>
              <div class="mt-3">
                <div class="roster-row mb-2">
                  <div class="align-left">
                    <div class="hide-show"></div>
                    <div class="roster-name" v-if="product.allow_name_number === 1">Name</div>
                    <div class="shirt-no" v-if="product.allow_name_number === 1"> No</div>
                    <div class="shirt-size">Size</div>
                  </div>
                  <div class="align-right">
                    <div class="qty">Qty</div>
                    <div class="remove"></div>
                  </div>
                </div>
                <template v-for="(product_roster_item, productRosterItemIndex) in product.product_roster">
                  <div class="roster-row mb-2" :key="`product-roster-item-${productRosterItemIndex}`">
                    <div class="align-left">
                      <template v-if="product.allow_name_number === 1">
                        <div class="roster-name">
                          <input type="text" class="form-control" v-model="product_roster_item.text"
                                 @change="handleRosterUpdate($event)">
                        </div>
                        <div class="shirt-no">
                          <input type="number" class="text-center form-control" v-model="product_roster_item.number"
                                 @change="handleRosterUpdate($event)">
                        </div>
                      </template>
                      <div class="shirt-size">
                        <b-form-select v-model="product_roster_item.size"
                                       @change="handleRosterUpdate($event)">
                          <template v-for="(product_size, productSizeIndex) in product.product_sizes">
                            <b-form-select-option :key="`product-roster-size-${productSizeIndex}`"
                                                  :value="product_size.label">
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
              <div class="button-holder mt-3 gap-2 d-flex justify-content-center justify-content-lg-end">
                <button class="btn btn-secondary w-auto fw-bold" @click="addPlayer">Add Player</button>
              </div>
            </div>
          </b-card-body>
          <b-card-footer class="d-flex justify-content-between align-items-center bg-transparent border-0">
            <b-button class="card-link" variant="danger" :disabled="updating_item" @click="cancelCustomProduct">Cancel</b-button>
            <div class="d-flex">
              <b-button variant="secondary" class="card-link" @click="onClickBack">Back</b-button>
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
                    <b-card-body class="border-top p-3">
                      <div class="text-md-left mb-2 font-weight-bold">{{ product.name }}</div>
                      <div class="order-collar-style d-flex flex-wrap align-items-center text-left">
                        <div class="image-holder">
                          <template v-if="selectedStyle.style_icon_url">
                            <img :src="storageUrl+selectedStyle.style_icon_url"
                                 alt="Collar"/>
                          </template>
                          <template v-else>
                            <template v-if="selectedStyle.front_models.length > 0">
                              <img :src="storageUrl+selectedStyle.front_models[0].file_url" alt="Collar">
                            </template>
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
                    <b-card-body class="p-3">
                      <div class="overflow-hidden roster-details-table">
                        <div class="roster-row head d-flex align-items-center justify-content-between">
                          <span class="name">Name</span>
                          <span>No</span>
                          <span>Size</span>
                          <span>Qty</span>
                        </div>
                        <template v-for="(roster, key) in product.product_roster">
                          <div :key="key" class="roster-row cursor-pointer d-flex align-items-center justify-content-between">
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
           <div class="d-flex justify-content-between">
             <b-button class="card-link" variant="danger" @click="cancelCustomProduct" :disabled="updating_item">Cancel</b-button>
             <b-button class="card-link" variant="info" v-if="orderEditingModeInfo.previous_button" @click="loadOrderProduct('previous')">
               {{ orderEditingModeInfo.previous_button }}
             </b-button>
           </div>
            <div class="d-flex" style="gap: 25px;">
              <b-button variant="secondary" @click="onClickBack">Back</b-button>
              <b-button variant="secondary" disabled v-if="updating_item">{{ actionButtonText }}</b-button>
              <template v-else>
                <template v-if="product.edit_mode_info_obj.mode == 'order_edit'">
                  <b-button variant="secondary" @click="updateOrder" v-if="orderEditingModeInfo.is_last_product">
                    {{ orderEditingModeInfo.next_button }}
                  </b-button>
                  <b-button variant="secondary" v-else @click="loadOrderProduct('next')">
                      {{ orderEditingModeInfo.next_button }}
                  </b-button>
                </template>
                <b-button variant="secondary" @click="handleActionButton" v-else>{{ actionButtonText }}</b-button>
              </template>
            </div>
          </b-card-footer>
        </b-card>
      </b-card-body>
    </b-card>
  </div>

</template>

<script lang="ts">
import VsToast from '@vuesimple/vs-toast';
import {Component, Mixins, Prop} from 'vue-property-decorator'
import {http} from "@/httpCommon";
import {
  createOrUpdateOrderUpdateDataState, getCustomLockers, getCustomProductData, getEditModeDefaultObj,
  getExtensionFromString, getOrderUpdateIdentifier, handleProductPriceUpdate, handleResponseException,
  isFilePreviewable, santaClone, downloadTemplate
} from "@/helpers/Helpers";
import {find, findIndex} from "lodash"
import {cartModalData} from "@/mixins/LockerProduct";
import { saveState, deleteStateById, loadState } from '@/indexedDBPersistence.js';
import readXlsxFile from "read-excel-file";
import ErrorMessages from "@/mixins/ErrorMessages";
import Store from "@/store";

@Component<CustomDesign>({
  components: {},
  mounted() {
    if(!this.customizeProduct) {
      this.$router.push('/')
    }
    this.product = this.customizeProduct
    if(this.product) {
      if('not_uploaded_assets' in this.product && this.product.not_uploaded_assets.length > 0) {
        this.product_assets = this.product.not_uploaded_assets
      }
      getCustomLockers().then((customer_lockers: Record<any, any>[]) => {
        this.customer_lockers_rooms = customer_lockers
      })
      this.handleAddonSelectionUpdate()
    }
  },
  async beforeDestroy() {
    if(this.remove_order_update_data) {
      await deleteStateById("order_updated_data")
    }
  }
})

export default class CustomDesign extends Mixins(cartModalData, ErrorMessages) {
  @Prop({ required: false }) readonly product_id!: number|string
  @Prop({ required: false }) readonly customizeProduct!: Record<any, any>

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
  public updating_item = false
  public deleted_assets: Record<any, any>[] = []
  public maxStep = 4;
  public currentStep = 1;
  public showLoader = false;
  public remove_order_update_data = true

  get progress() {
    return Math.round(100 / this.maxStep) * this.currentStep
  }

  get company() {
    return this.$store.getters.getCompany
  }

  get selectedStyle(): Record<any, any> {
    const style = find(this.product.product_styles, (product_style: Record<any, any>) => {
      return product_style.id == this.product.selected_style_id
    })
    return style ? style : {}
  }

  get orderEditingModeInfo() {
    let order_mode_object = {
      previous_button: '', next_button: '', is_last_product: false
    }
    if(this.product.id) {
      const { edit_mode_info_obj: { mode} } = this.product
      if(mode == "order_edit") {
        const product_edit_mode_object = this.$store.getters.getProductEditInfoObject
        const { factory_products, factory_product_active_index } = product_edit_mode_object.order_product_info
        const factory_products_count = factory_products.length
        const factory_products_last_index = factory_products.length - 1
        if(factory_product_active_index == 0) {
          order_mode_object.previous_button = ""
        }
        if(factory_product_active_index > 0) {
          order_mode_object.previous_button = "Previous Product"
        }
        if(factory_product_active_index < factory_products_last_index) {
          order_mode_object.next_button = "Next Product"
        }
        if(factory_product_active_index == factory_products_last_index) {
          order_mode_object.next_button = "Update Order"
          order_mode_object.is_last_product = true
        }
      }
    }
    return order_mode_object
  }

  get actionButtonText() {
    let action_button_text = "";
    if(this.product.id) {
      switch (this.product.edit_mode_info_obj.mode) {
        case "cart_edit":
          action_button_text = this.updating_item ? "Updating Cart..." : "Update Cart";
          break;
        case "order_edit":
          action_button_text = this.updating_item ? "Updating Order..." : "Update Order";
          break;
        case "reorder":
          action_button_text = this.updating_item ? "Reordering..." : "Re Order";
          break;
        default:
          action_button_text = this.updating_item ? "Adding To Cart..." : "Add To Cart";
      }
    }
    return action_button_text;
  }

  public isFilePreviewable = isFilePreviewable
  public downloadTemplate = downloadTemplate

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
  public handleRosterUpdate(event) {
    this.show_roster_warning = true
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
    const locker_selected_product_id = event.target.value;
    let selected_product_roster: any = null
    if(locker_selected_product_id) {
      selected_product_roster = find(this.selected_locker_room_products, ['id', parseInt(locker_selected_product_id)])?.product_roster_detail
      selected_product_roster
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

  public async handleAddonSelectionUpdate() {
    this.product.price_info = {...this.product.price_info, ...await handleProductPriceUpdate(false, this.product, this.product.sku)}
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
      this.deleted_assets.push({index: asset_index, path: asset.path})
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
        this.updating_item = true
        http.post(api_type_url.url, payload).then(async (successResponse) => {
          let response_data = successResponse.data;
          if(mode) {
            this.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", getEditModeDefaultObj())
          }
          if(response_data.success) {
            this.$store.commit("SHOW_CART_MODAL", true)
            this.$router.push({name: "Home"})
          } else {
            handleResponseException(response_data)
          }
          this.updating_item = false
        }).catch(async errorResponse => {
          this.updating_item = false
          handleResponseException(errorResponse)
        })

      } else {
        this.currentStep = assetValidationResponse.current_step
        VsToast.show({
          title: assetValidationResponse.message,
          variant: 'error',
          timeout: 5000
        });
      }
    })
  }

  public getPayload(return_object=false) {
    const { edit_mode_info_obj } = this.product
    let payload_obj = {
      addons: this.getSelectedAddons(),
      //assets property added in while storing item in cart
      colors: [],
      //status property added in while storing item in cart
      svg_url: "",
      sync_id: "",
      pdf_file: "",
      style_id: this.product.selected_style_id,
      design_id: -1,
      back_image: "",
      product_id: this.product.id,
      sku_number: this.product?.sku?.sku_number,
      //sort_order property added in while storing item in cart
      style_name: this.getSelectedStyle().name,
      svg_groups: [],
      front_image: "",
      groupcolors: [],
      logo_colors: [],
      custom_logos: [],
      product_name: this.product.name,
      product_type: this.product.product_type,
      //reorder_data property is added at method end
      defaultcolors: [],
      production_url: "",
      back_image_short: "",
      custom_logo_svgs: [],
      fixed_logo_index: this.product?.fixed_logo_index ? this.product?.fixed_logo_index : 0,
      ecommerce_cart_id: null,
      ecommerce_post_id: null,
      front_image_short: "",
      is_custom_product: true,
      measurement_ratio: this.product.measurement_ratio,
      product_name_custom: `${this.product.name}-Custom Design`,
      sizechart_reference: this.product?.sku?.sizechart_reference,
      ecommerce_variant_id: null,
      product_custom_texts: [],
      product_price_object: this.getProductPriceObject(),
      product_roster_detail: this.product.product_roster,
      minimum_order_quantity: this.product?.sku?.minimum_order_quantity,
      custom_product_placeholder: `placeholders/custom-design.svg`,
      minimum_order_quantity_type: this.product?.sku?.minimum_order_quantity_type,
      product_custom_text_objects: {common: [], roster: []},
      reorder_data: this.product?.reorder_data ? this.product?.reorder_data : null,
      assets: this.product_assets,
    }

    let existing_assets = santaClone(this.product.existing_assets);
    existing_assets = existing_assets.map(existing_asset => {
      delete existing_asset.existing_asset
      return existing_asset
    })
    payload_obj['existing_assets'] = existing_assets
    if(edit_mode_info_obj.mode) {
      const edit_mode = edit_mode_info_obj.mode;
      if(this.deleted_assets.length > 0) {
        payload_obj['deleted_assets'] = this.deleted_assets
      }
      payload_obj['id'] = edit_mode_info_obj.factory_product_id
      payload_obj['factory_product_index'] = edit_mode_info_obj.factory_product_index
      if(edit_mode === "reorder") {
        payload_obj['reorder_data'] = this.product.reorder_data
      }
    }



    let factory_product = new FormData();
    for (const [payload_obj_key, payload_obj_value] of Object.entries(payload_obj)) {
      if(payload_obj_key == "assets") {
        //new uploaded files stored in base64
        payload_obj_value.forEach((product_asset) => {
          factory_product.append("product_assets[]", product_asset.file);
        });
      } else {
        //these keys are taken from above object payload_obj.
        const stringify_value = [
          "addons", "colors", "svg_groups", "groupcolors", "logo_colors", "custom_logos", "defaultcolors", "custom_logo_svgs", "ecommerce_cart_id",
          "ecommerce_post_id", "is_custom_product", "ecommerce_variant_id", "product_custom_texts", "product_price_object", "product_roster_detail",
          "product_custom_text_objects", "reorder_data", "assets", "existing_assets", "deleted_assets", "reorder_data"
        ].includes(payload_obj_key)
        if(stringify_value) {
          factory_product.append(`factory_product[${payload_obj_key}]`, JSON.stringify(payload_obj_value));
        } else {
          factory_product.append(`factory_product[${payload_obj_key}]`, payload_obj_value);
        }
      }
    }
    if(edit_mode_info_obj.mode) {
      if(edit_mode_info_obj.mode == "cart_edit") {
        factory_product.append(`_method`, 'PUT');
      }
    }
    return return_object ? payload_obj : factory_product
    // factory_product.append("factory_product[addons]", JSON.stringify(this.getSelectedAddons()));
    // //assets property added in while storing item in cart
    // factory_product.append("factory_product[colors]", "[]");
    // //status property added in while storing item in cart
    // factory_product.append("factory_product[svg_url]", "");
    // factory_product.append("factory_product[sync_id]", "");
    // factory_product.append("factory_product[pdf_file]", "");
    // factory_product.append("factory_product[style_id]", this.product.selected_style_id as string);
    // factory_product.append("factory_product[design_id]", "-1");
    // factory_product.append("factory_product[back_image]", '');
    // factory_product.append("factory_product[product_id]", this.product.id as string);
    // factory_product.append("factory_product[sku_number]", this.product?.sku?.sku_number);
    // //sort_order property added in while storing item in cart
    // factory_product.append("factory_product[style_name]", this.getSelectedStyle().name as string);
    // factory_product.append("factory_product[svg_groups]", "[]");
    // factory_product.append("factory_product[front_image]", '');
    // factory_product.append("factory_product[groupcolors]", '[]');
    // factory_product.append("factory_product[logo_colors]", '[]');
    // factory_product.append("factory_product[custom_logos]", '[]');
    // factory_product.append("factory_product[product_name]", `${this.product.name}`);
    // factory_product.append("factory_product[product_type]", this.product.product_type);
    // //reorder_data property is added at method end
    // factory_product.append("factory_product[defaultcolors]", '[]');
    // factory_product.append("factory_product[production_url]", "");
    // factory_product.append("factory_product[back_image_short]", "");
    // factory_product.append("factory_product[custom_logo_svgs]", '[]');
    // factory_product.append("factory_product[fixed_logo_index]", this.product?.fixed_logo_index ? this.product?.fixed_logo_index : 0);
    // factory_product.append("factory_product[ecommerce_cart_id]", "null");
    // factory_product.append("factory_product[ecommerce_post_id]", "null");
    // factory_product.append("factory_product[front_image_short]", "");
    // factory_product.append("factory_product[is_custom_product]", "true");
    // factory_product.append("factory_product[measurement_ratio]", this.product.measurement_ratio);
    // factory_product.append("factory_product[product_name_custom]", `${this.product.name}-Custom Design`);
    // factory_product.append("factory_product[sizechart_reference]", this.product?.sku?.sizechart_reference);
    // factory_product.append("factory_product[ecommerce_variant_id]", "null");
    // factory_product.append("factory_product[product_custom_texts]", '[]');
    // factory_product.append("factory_product[product_price_object]", JSON.stringify(this.getProductPriceObject()));
    // factory_product.append("factory_product[product_roster_detail]", JSON.stringify(this.product.product_roster));
    // factory_product.append("factory_product[minimum_order_quantity]", this.product?.sku?.minimum_order_quantity);
    // factory_product.append("factory_product[custom_product_placeholder]", `placeholders/custom-design.svg`);
    // factory_product.append("factory_product[minimum_order_quantity_type]", this.product?.sku?.minimum_order_quantity_type);
    // factory_product.append("factory_product[product_custom_text_objects]", JSON.stringify({common: [], roster: []}));
    //
    // //new uploaded files stored in base64
    // this.product_assets.forEach((product_asset) => {
    //   factory_product.append("product_assets[]", product_asset.file);
    // });
    //
    // let existing_assets = santaClone(this.product.existing_assets);
    // existing_assets = existing_assets.map(existing_asset => {
    //   delete existing_asset.existing_asset
    //   return existing_asset
    // })
    // factory_product.append("factory_product[existing_assets]", JSON.stringify(existing_assets));
    // if(edit_mode_info_obj.mode) {
    //   const edit_mode = edit_mode_info_obj.mode;
    //   if(this.deleted_assets.length > 0) {
    //     factory_product.append("factory_product[deleted_assets]", JSON.stringify(this.deleted_assets));
    //   }
    //   if(edit_mode == "cart_edit") {
    //     factory_product.append("_method", 'PUT');
    //   }
    //   factory_product.append("factory_product[id]", edit_mode_info_obj.factory_product_id);
    //   factory_product.append("factory_product[factory_product_index]", edit_mode_info_obj.factory_product_index);
    //   if(edit_mode === "reorder") {
    //     factory_product.append("factory_product[reorder_data]", JSON.stringify(this.product.reorder_data));
    //   }
    // }
    // return factory_product
  }

  public async validateAssets() {
    let response_obj = {
      validated: true, current_step: 4, message: ""
    };
    const { edit_mode_info_obj } = this.product
    const product_assets_count  = this.product_assets.length
    const existing_assets_count = this.product.existing_assets.length
    const existing_new_assets_count = product_assets_count + existing_assets_count
    if(edit_mode_info_obj.mode) {
      if(existing_new_assets_count === 0) {
        response_obj.validated = false
        response_obj.current_step = 2
        response_obj.message = "Please upload assets"
      }
      if(!this.checkMinimumOrderQtyBYDesign(
        this.product.product_roster,
        this.product.sku,
        this.product.edit_mode_info_obj,
        this.product.name
      )){
        response_obj.validated = false
        response_obj.current_step = 3
        response_obj.message = `${this.$t('minimum_order_roster_message',
          {
            product_name: this.product.name,
            min_products_count: this.product.sku.minimum_order_quantity
          })}`
      }
    } else {
      if(product_assets_count === 0) {
        response_obj.validated = false
        response_obj.current_step = 2
        response_obj.message = "Please upload assets"
      }
      if(!this.checkMinimumOrderQtyBYDesign(
        this.product.product_roster,
        this.product.sku,
        this.product.edit_mode_info_obj,
        this.product.name
      )){
        response_obj.validated = false
        response_obj.current_step = 3
        response_obj.message = `${this.$t('minimum_order_roster_message',
          {
            product_name: this.product.name,
            min_products_count: this.product.sku.minimum_order_quantity
          })}`
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
      addons: this.getSelectedAddons(), assets: this.product_assets, deleted_assets: this.deleted_assets, id: edit_mode_info_obj.factory_product_id,
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

  public async loadOrderProduct(action) {
    let updated_product = this.getPayload(true)
    this.product_assets = [];
    this.deleted_assets = []
    let order_products_info_obj = santaClone(this.getProductEditInfoObject.order_product_info)

    let current_factory_product_index = order_products_info_obj.factory_product_active_index;
    let factory_product_active_index = (action == "next") ? parseInt(current_factory_product_index) + 1 : parseInt(current_factory_product_index) - 1;

    order_products_info_obj.factory_product_active_index = factory_product_active_index
    this.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", { order_product_info: order_products_info_obj })

    let { item_id, active_factory_product } = await createOrUpdateOrderUpdateDataState(current_factory_product_index, updated_product)

    if(active_factory_product.is_custom_product) {
      this.currentStep = 1
      active_factory_product.assets.forEach((product_asset) => {
        if("existing_asset" in product_asset   && product_asset.existing_asset === false) {
          this.product_assets.push(product_asset)
        }
      })
      if(active_factory_product.deleted_assets) {
        this.deleted_assets =  active_factory_product.deleted_assets
      }
      active_factory_product.edit_mode_info_obj = {
        mode: 'order_edit', item_id, factory_product_id: active_factory_product.id, factory_product_index: factory_product_active_index,
      }
      getCustomProductData(active_factory_product).then(custom_product_data => {
        this.product = custom_product_data
        this.handleAddonSelectionUpdate()
      })
    } else {
      this.remove_order_update_data = false;
      await this.$router.push({name: "Home"});
    }
  }

  public async updateOrder() {
    let updated_product = this.getPayload(true)
    let product_edit_info_object = this.$store.getters.getProductEditInfoObject
    const { order_product_info } = product_edit_info_object
    let current_factory_product_index = order_product_info.factory_product_active_index;
    await createOrUpdateOrderUpdateDataState(current_factory_product_index, updated_product)
    const get_order_updated_data = await loadState("order_updated_data")
    let updated_factory_products = get_order_updated_data.order_updated_data;
    updated_factory_products.forEach(updated_factory_product => {
      if(updated_factory_product.is_custom_product) {
        delete updated_factory_product.file
      }
    })
    let order_item_id = order_product_info.item_id;
    let url = `order_item/${order_item_id}/update/products`;
    this.updating_item = true;
    http.post(url, {factory_products: get_order_updated_data.order_updated_data}).then(async (res: any) => {
      this.updating_item = false;
      if (res.data.success) {
        if(this.product.edit_mode_info_obj.mode) {
          this.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", getEditModeDefaultObj())
        }
        if (this.company && this.company.platform == 'wordpress') {
          window.location.href = `${this.company.company_domain}/my-account/orders`;
        }
        else {
          this.$router.push({name: "OrderDetail", params: {order_id: order_item_id}});
        }
      } else {
        VsToast.show({
          title: res.data.message,
          variant: 'info',
          timeout: 5000
        });
      }
    }).catch(err => {
      this.updating_item = false;
      VsToast.show({
        title: err?.message,
        variant: 'info',
        timeout: 5000
      });
      console.error('catch', err)
    });
  }

  public cancelCustomProduct() {
    if(this.product.edit_mode_info_obj.mode) {
      this.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", getEditModeDefaultObj())
    }
    this.$router.push({ path: '/' })
  }

  public onClickBack() {
    this.currentStep--;
  }

  public onClickNext() {
    this.currentStep++;
  }

  public updateRosterPlayerNameFormat(selected_format: string) {
    this.product.product_roster.forEach(roster_detail => {
      if (roster_detail.text) {
        let roster_player_name = roster_detail.text;
        if (selected_format == "capitalized") {
          roster_detail.text = roster_player_name.charAt(0).toUpperCase() + roster_player_name.slice(1).toLowerCase();
        } else {
          roster_detail.text = roster_player_name[selected_format]();
        }
      }
    })
  }

  public async uploadExcelFile(){
    this.show_roster_warning = true;
    if (this.show_roster_warning) {
      this.showRosterWarning().then(async (update_roster) => {
        if (update_roster) {
          this.showLoader = true
          this.show_roster_warning = false;
          const inputElement = this.$refs.upload_excel_template as HTMLInputElement;
          const files = inputElement?.files ? inputElement?.files[0] : null;
          let ext;
          if (files) {
            ext = files.name.split('.').pop();
          }
          if (ext != 'xlsx'){
            alert("please upload a valid excel file");
            this.showLoader = false;
            return false
          }
          let check_cols = false;
          if (files) {
            readXlsxFile(files).then((rows: any[][]) => {
              check_cols = rows[0][0] == 'NAME ON PRODUCT' && rows[0][1] == 'NUMBER' && rows[0][2] == 'SIZE*' && rows[0][3] == 'QUANTITY*'
              if (rows[0].length != 4){
                alert("Please upload valid file");
                this.showLoader = false;
                return false
              }else if(rows.length < 2){
                alert("The excel file has no data in it");
                this.showLoader = false;
                return false
              }else if(check_cols){
                this.product.product_roster = []
                rows.forEach((row: any[], index:number)=>{
                  if(index){
                    const typeof_number = typeof row[1];
                    if(typeof_number === "number") {
                      row[1] = row[1].toString();
                    }
                    //object type means the value is null
                    if(typeof_number === "object") {
                      row[1] = '';
                    }
                    if(row[1].constructor.name == "Number") {
                      row[1] = row[1].toString()
                    }
                    const roster:any = {
                      "text": row[0],
                      "number": row[1],
                      "size": row[2],
                      "quantity": row[3],
                      "information": ""
                    }
                    this.product.product_roster.push(roster)
                  }
                })
              }else{
                alert('Please upload the file with valid pattern');
                this.showLoader = false;
              }
              handleProductPriceUpdate()
              this.showLoader = false;
              this.showToast('Excel file uploaded successfully', 'success');
            })
          }
        } else {
          this.show_roster_warning = false;
          return;
        }
      })
    }
  }

  public getFilePlaceHolder(file_name: any, placeholder_extension='svg') {
    const extension = getExtensionFromString(file_name)
    return `${this.storageUrl}placeholders/${extension}.${placeholder_extension}`
  }
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap');

.main-card {
  @media only screen and (max-width: 768px) {
    width: 100% !important;
  }
}

.card-body {
  padding: 0;
}

.main-container {
  .card-heading {
    @media only screen and (max-width: 576px) {
      font-size: 20px;
      font-weight: bold;
    }
  }

  .product-description {
    @media only screen and (max-width: 576px) {
      font-size: 15px;
    }
  }

  .product-title {
    @media only screen and (max-width: 344px) {
      font-size: 16px;
      font-weight: bold;
    }
  }
}

.product-preview-image {
  width: 50% !important;

  @media only screen and (max-width: 768px) {
    width: 50% !important;
  }
}

.collar-description {
  font-size: 12px;
  line-height: 18px;
  margin: 15px 0 15px 0;

  h3 {
    font-size: 14px;
    font-weight: 700;
    margin: 0 0 5px;
  }
}

.product-preview {
  @media only screen and (max-width: 1200px) {
    margin: 10% 0;
  }
}

.action-buttons {
  justify-content: center;
  gap: 10px;

  @media only screen and (min-width: 457px) {
    justify-content: space-between;
  }

  button {
    @media only screen and (max-width: 457px) {
      padding: 5px;
      font-size: 16px;
      max-height: 38px !important;
    }
  }
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

.stuff-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 10px;

  .custom-checkbox {
    flex: 0 0 70%;
    max-width: 70%;
    font-size: 14px;

    .custom-control-label {
      &:before {
        top: 0;
      }

      &:after {
        top: 0;
      }
    }

    .custom-control-input:checked~.custom-control-label::before {
      background: #219f84;
      border-color: #219f84;
    }
  }

  .single-addon {
    align-items: center;
    padding: 6px 8px;
    border-radius: 7px;
    background: #eee;
    border: 1px solid transparent;

    &.selected{
      background: var(--theme-color-light);
      border-color: var(--theme-color);
    }

    label{
      white-space: nowrap;
      display: flex;
      cursor: pointer;
      padding-top: 2px;

      &:before, &:after{
        margin-top: 2px;
      }
    }

    .charges{
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
  height: 500px;
  padding: 5px;
  flex-direction: column;
  overflow-y: scroll;
  overflow-x: hidden;
  align-items: center;
  border: 1px solid silver;
  border-radius: 4px;
  color: gray;
}

/*.file-preview-section::-webkit-scrollbar {
  display: none;
}*/

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
  min-width: 150px;

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

.roster-section {
  padding: 1rem 0 0;

  @media only screen and (min-width: 992px) {
    flex: 0 0 50%;
    padding: 1rem;
    border-right: 1px solid #EDF2F6;
  }

  .roster-qty {
    flex: 0 0 13%;
    max-width: 13%;
  }

  .roster-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    flex: 0 0 100%;
    max-width: 100%;

    .align-left {
      flex: 0 0 80%;
      max-width: 80%;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
    }

    .align-right {
      flex: 0 0 20%;
      max-width: 20%;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;

      @media only screen and (min-width: 992px) {
        flex: 0 0 12%;
        max-width: 12%;
      }

      @media only screen and (min-width: 1024px) {
        flex: 0 0 14%;
        max-width: 14%;
      }
    }

    .hide-show {
      flex: 0 0 20px;
      max-width: 20px;
    }

    .roster-name {
      flex: 0 0 46%;
      max-width: 46%;

      @media only screen and (min-width: 992px) {
        flex: 0 0 55%;
        max-width: 55%;
      }

      input {
        @media only screen and (max-width: 991px) {
          border-radius: 5px 0 0 5px;
        }
      }
    }

    .shirt-no {
      flex: 0 0 20%;
      max-width: 20%;

      @media only screen and (min-width: 410px) {
        flex: 0 0 21%;
        max-width: 21%;
      }

      @media only screen and (min-width: 992px) {
        flex: 0 0 12%;
        max-width: 12%;
      }
    }

    .shirt-size {
      flex: 0 0 25%;
      max-width: 25%;

      @media only screen and (min-width: 992px) {
        flex: 0 0 20%;
        max-width: 20%;
      }

      &.no-name-number {
        flex: 0 0 calc(100% - 40px);
        max-width: calc(100% - 40px);
        margin-left: 20px;

        @media only screen and (min-width: 992px) {
          flex: 0 0 calc(100% - 40px);
          max-width: calc(100% - 40px);
          margin-left: 20px;
        }
      }
    }

    .qty {
      flex: 0 0 58%;
      max-width: 58%;

      input {
        @media only screen and (max-width: 992px) {
          border-right: 1px solid #ced4da;
          border-radius: 0 5px 5px 0;
        }
      }
    }

    .remove {
      a {
        color: #D53943;
        font-size: 9px;
        width: 22px;
        height: 22px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        background: #F8E1E2;
        border-radius: 50%;
      }
    }

    input,
    select {
      font-size: 14px;
      border: 1px solid #ced4da;
      @media only screen and (max-width: 576px) {
        border-radius: 0;
      }
    }

    &.button-holder {
      margin: 10px 0 0;
      padding: 0 20px;

      @media only screen and (min-width: 992px) {
        margin: 20px 0 0;
        justify-content: center;
        padding: 0;
      }
    }
  }
}

.roster-details-table {
  margin: -1.25rem;

  .roster-row {
    padding: 0.5rem 1.25rem;
    border-bottom: 1px solid #E1E6EA;

    &:first-child {
      border-top: 1px solid #E1E6EA;
    }

    &:nth-child(even) {
      background:  #E7F4F1;
      color: #219F84;
    }

    &.head {
      font-weight: 600;
    }

    span.name {
      width: 60%;
      text-align: left;
    }

    span {
      width: 40%;
      text-align: center;
    }
  }
}
</style>
