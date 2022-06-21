<template>
  <div class="page-wrapper m-lg-4" v-cloak style="margin-top: 0 !important;" :data="undoRedoArrays" >
    <meta name="viewport" content="width=device-width">
    <div class="loader global" v-if="showLoader && getUrlParams"><img src="../../src/assets/images/loading.gif" /></div>
    <b-container fluid>
      <b-row>
        <template v-if="selectedProduct">
          <b-col v-if="manageComponents.CustomizationTabs" cols="12" lg="3" class="text-left border-right py-lg-3">
            <CustomizationTabs :isColorShuffled="isColorShuffled" @setColorShuffled="(val) => isColorShuffled = val" @setActionBeforeLogin="setActionBeforeLogin" @setRosterOpen="setRosterOpen" v-if="!mobileScreen" @open-add-to-locker="getLockers(true)" :tabIndexNew="this.$store.getters.getMainTab" @tabIndexChange="changeTabs" ref="customization-tab" />
            <CustomTabs @maximizeTab="maximizeTab" :tabIcons="tabIcons" :maximized="maximized" :sideTabIndex="sideTabIndex" @switchTabs="switchTabs" @open-add-to-locker="getLockers(true)" ref="custom-mobile-tabs" v-else />
          </b-col>

          <b-col v-if="manageComponents.CustomizationPreview" cols="12" lg="6" ref="preview-column" class="preview-column position-relative" >
            <template>
              <div class="customization-preview-process w-100">
                <header v-if="!mobileScreen" class="preview-area-header py-2 py-lg-4">
                  <div class="buttons-preview text-left">
                    <template v-if="editCart.cartId < 1 && updateOrderItemProducts == null">
                      <template v-if="isCustomerAuthenticated">
                        <b-button :key="'lockerRoom'" v-if="roomWithProducts.length" @click="getLockerRoomProducts(null)" variant="outline-secondary">Locker room</b-button>
                      </template>
                      <template v-else>
                        <b-button @click="setActionBeforeLogin('lockerRoom')" v-if="roomWithProducts.length" :key="'loginmodal'" variant="outline-secondary">Locker room</b-button>
                      </template>
                      <template v-if="isCustomerAuthenticated && !hideSaveLockerButton">
                        <b-button :key="'savetolocker'" variant="outline-secondary"  @click="getLockers">
                          <template v-if="editProductStatus">Update to locker room</template>
                          <template v-else>Save to locker room</template>
                        </b-button>
                      </template>
                      <template v-else-if="undoItems.length > 0 || redoitems.length > 0">
                        <b-button @click="setActionBeforeLogin('saveToLockerRoom')" :key="'loginmodalsavelockerroom'" variant="outline-secondary">Save to locker room</b-button>
                      </template>

                      <template>
                        <b-button :key="'shareDesign'" variant="outline-secondary" ref="shareDesign" :disabled="shareDesignLoader" style="min-width: 100px" @click.stop="shareDesign">
                          <template v-if="!shareDesignLoader">Share design</template>
                          <img v-else width="20" height="20" src="../../src/assets/images/loading.gif" />
                        </b-button>
                        <Popper
                          style="font-size: 12px;"
                          v-if="product"
                          :is-open="popperID == 'shareDesign'"
                          :anchor-el="$refs['shareDesign']"
                          :on-close="hidePopper"
                        >
                          <aside id="popper-content" class="tooltip b-tooltip bs-tooltip share-tooltip">
                            <div class="share-holder">
                              <h3>Copy link and Share</h3>
                              <div class="share-form">
                                <b-form inline>
                                  <b-form-input ref="share-design-link" id="share-design-link"
                                                :value="product.shared_url !== 'undefined'  ?   product.shared_url : ''"

                                  ></b-form-input>
                                  <button @click="copyLink(lockerProductIndex)" class="btn" type="button">Copy Link</button>
                                </b-form>
                              </div>
                            </div>
                          </aside>
                        </Popper>
                      </template>
                    </template>
                    <template v-if="updateOrderItemProducts">
                      <b-button @click="loadOrderItemProduct('previous')" variant="outline-secondary"
                                v-if="updateOrderItemProducts.active_index != 0">Previous</b-button>
                      <b-button  @click="loadOrderItemProduct('next')"  variant="outline-secondary"
                                 v-if="updateOrderItemProducts.active_index != (updateOrderItemProducts.factory_products.length - 1)">Next</b-button>
                      <b-button  @click="UpdateOrderProducts" variant="outline-secondary"
                                 v-if="updateOrderItemProducts.active_index == (updateOrderItemProducts.factory_products.length - 1)">Update Products</b-button>
                      <b-button  variant="outline-info" @click="$modal.show('product-rejection-info-modal')">Show Reason</b-button>
                      <modal name="product-rejection-info-modal">
                        <h1>{{updateOrderItemProducts.activity_items[updateOrderItemProducts.active_index].message}}</h1>
                        <template v-for="(activity_file, activity_file_index) in updateOrderItemProducts.activity_items[updateOrderItemProducts.active_index].activity_files">
                          <img width="250" :src="`${storageUrl}${activity_file.url}`" alt="" :key="`activity-file-${activity_file_index}`">
                        </template>
                      </modal>
                    </template>
                  </div>

                  <ul class="preview-header-icons">
                    <li class="d-flex flex-wrap align-items-center">
                      <b-button v-if="!isCustomerAuthenticated" @click="gotoLogin"><font-awesome-icon :icon="['fas', 'user']"/></b-button>
                      <strong class="user-name">{{  isCustomerAuthenticated ? 'Hello ' + customer.first_name : '' }}</strong>
                      <b-button @click="logoutCustomer" v-if="isCustomerAuthenticated && company.platform == 'self'"><font-awesome-icon :icon="['fas', 'sign-out-alt']"/></b-button>
                    </li>
                    <li><a>
                      <font-awesome-icon @click="resetStore" :icon="['fas', 'redo-alt']"/>
                    </a></li>
                    <li v-if="isCustomerAuthenticated">
                      <a class="icon mr-0" id="bell" @click="notificationsDropDown"><font-awesome-icon :icon="['fas', 'bell']"/><span class="notification-counter"> {{ notificationsCounter}}</span></a>
                      <div v-if="notifications.length" class="notifications"  :style="dropdownStyle" id="box">
                        <template v-for="(notification, ind) in notifications" >
                          <div :key="ind" class="notifications-item" :class="[notification.read_at === null || notification.read_at === '' ? 'font-weight-bold' : '' ]">
                            <div @click="readNotification(notification)" class="text d-flex align-items-start justify-content-between">
                              <p v-if="notification.type == 'roster_updated'" @click="editProduct(notification.product.room_id, notification.product.id)">{{notification.description}}</p>
                              <p v-if="notification.type == 'order_activity'"><router-link  :to="{ name: 'OrderDetail', params: { order_id: notification.order_id }}">{{notification.description}}</router-link>
                              <div class="date">
                                <div class="day" >{{ notification.created_at | formatDate }}</div>
                              </div>
                            </div>
                          </div>
                        </template>
                      </div>
                    </li>
                    <li v-if="isCustomerAuthenticated && (company.platform == 'self' || company.platform == 'cdnExceptLogin')">
                      <a  class="icon mr-0" @click="openCartModal">
                        <font-awesome-icon :icon="['fas', 'cart-arrow-down']" /><span class="notification-counter"> {{ cartItemsCount}}</span>
                      </a>
                    </li>
                  </ul>
                  <div class="change-product-area d-lg-none d-flex align-items-center justify-content-end">
                  </div>
                </header>
                <div v-if="!mobileScreen" class="undo-btn-area text-left pt-3">
                  <b-button variant="outline-secondary  mr-2" :disabled="undoItems.length < 1" @click="undoAction">Undo</b-button>
                  <b-button variant="outline-secondary mr-2" @click="redoAction" :disabled="redoitems.length < 1">Redo</b-button>
                  <b-button variant="outline-secondary" :class="{'pulse-animation': isColorShuffled}" v-if="usingColorLogos && imageColors.length > 1" @click="shuffleLogoColors">Shuffle colors</b-button>
                </div>
                <CartModal ref="cartModal" :mainTotalTabs="mainTotalTabs" @deleteCartItem="deleteCartItem" v-if="customer"/>
                <LockerRoomModal @showCollectionModal="this.showCollectionModal" @editCollectionModal="this.editCollectionModal" ref="lockerModal"  />
                <DesignCollectionModal @showLockerRoomModal="showVModal('locker-modal')" ref="collectionModal"  />
                <AddLockerRoomModal :frontPreview="frontPreview" :backPreview="backPreview" @genImages="genImages" @open-locker-room="getLockerRoomProducts" v-if="!editProductStatus" ref="saveToLockerModal" :roster-url="generate_share_url" :close_on_add="generate_share_url" @showPopper="showPopper"/>
                <LoginForm ref="loginModal" @actionAfterLogin="actionAfterLogin()" />

                <div v-if="mobileScreen" class="undo-btn-area text-left pt-3 d-flex align-items-center justify-content-between">
                  <div>
                    <b-button variant="outline-secondary mr-2" :disabled="undoItems.length < 1" @click="undoAction"><span class="d-sm-block d-none">Undo</span><span class="d-sm-none d-block"><BIconReplyFill class="flip_horizontal" /></span></b-button>
                    <b-button variant="outline-secondary mr-2" @click="redoAction" :disabled="redoitems.length < 1"><span class="d-sm-block d-none">Redo</span><span class="d-sm-none d-block"><BIconReplyFill /></span></b-button>

                    <template v-if="isCustomerAuthenticated">
                      <button class="btn btn-secondary light" :key="'savetolocker'" @click="getLockers">
                        <span class="d-sm-block d-none">Save</span>
                        <span class="d-sm-none d-block"><svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height="1em" width="1em"> <g> <g> <rect x="139.636" y="372.364" width="232.727" height="46.545"/> </g> </g> <g> <g> <polygon points="139.636,465.455 139.636,488.727 139.636,512 372.364,512 372.364,488.727 372.364,465.455 		"/> </g> </g> <g> <g> <path d="M507.338,133.843L413.823,9.3c-4.395-5.854-11.29-9.3-18.61-9.3h-38.364v23.273v23.273v147.394 c0,12.851-10.42,23.273-23.273,23.273H116.364c-12.853,0-23.273-10.422-23.273-23.273V46.545V23.273V0H23.273 C10.42,0,0,10.422,0,23.273v465.455C0,501.578,10.42,512,23.273,512h69.818v-23.273v-23.273v-23.273v-93.091 c0-12.854,10.42-23.273,23.273-23.273h279.273c12.853,0,23.273,10.418,23.273,23.273v93.091v23.273v23.273V512h69.818 C501.58,512,512,501.578,512,488.727v-340.91C512,142.778,510.363,137.872,507.338,133.843z"/> </g> </g> <g> <g> <polygon points="139.636,0 139.636,23.273 139.636,46.545 139.636,170.667 310.303,170.667 310.303,46.545 310.303,23.273 310.303,0 		"/> </g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> </svg></span>
                      </button>
                    </template>
                    <template v-else>
                      <button class="btn btn-secondary light" @click="setActionBeforeLogin('saveToLockerRoom')" :key="'loginmodalsavelockerroom'" v-b-modal.modal-login>
                        <span class="d-sm-block d-none">Save</span>
                        <span class="d-sm-none d-block"><svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height="1em" width="1em"> <g> <g> <rect x="139.636" y="372.364" width="232.727" height="46.545"/> </g> </g> <g> <g> <polygon points="139.636,465.455 139.636,488.727 139.636,512 372.364,512 372.364,488.727 372.364,465.455 		"/> </g> </g> <g> <g> <path d="M507.338,133.843L413.823,9.3c-4.395-5.854-11.29-9.3-18.61-9.3h-38.364v23.273v23.273v147.394 c0,12.851-10.42,23.273-23.273,23.273H116.364c-12.853,0-23.273-10.422-23.273-23.273V46.545V23.273V0H23.273 C10.42,0,0,10.422,0,23.273v465.455C0,501.578,10.42,512,23.273,512h69.818v-23.273v-23.273v-23.273v-93.091 c0-12.854,10.42-23.273,23.273-23.273h279.273c12.853,0,23.273,10.418,23.273,23.273v93.091v23.273v23.273V512h69.818 C501.58,512,512,501.578,512,488.727v-340.91C512,142.778,510.363,137.872,507.338,133.843z"/> </g> </g> <g> <g> <polygon points="139.636,0 139.636,23.273 139.636,46.545 139.636,170.667 310.303,170.667 310.303,46.545 310.303,23.273 310.303,0 		"/> </g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> </svg></span>
                      </button>
                    </template>
                  </div>

                  <div class="mobile-nav">
                    <button class="btn text-white mr-1 border-0 fs-4 p-0 btn-secondary btn-sm" @click="navigateTabs('prev')" v-if="activeTab > 0" style="line-height: normal">
                      <b-icon-arrow-left-short />
                    </button>
                    <button class="btn text-white mr-1 border-0 fs-4 p-0 btn-secondary btn-sm" @click="showDesign" v-else-if="selectedProduct && (!activeTab || activeTab<0)" style="line-height: normal">
                      <b-icon-arrow-left-short />
                    </button>
                    <button class="btn text-white fs-4 border-0 mr-3 p-0 btn-secondary btn-sm" @click="navigateTabs('next')" v-if="activeTab < 4" style="line-height: normal">
                      <b-icon-arrow-right-short />
                    </button>
                    <template v-else>
                      <template v-if="isCustomerAuthenticated">
                        <template v-if="$store.getters.getUpdateOrderItemProducts == null">
                          <button v-if="!$root.$refs.Order_Details.isLoading" :disabled="canvasImage.scene == null" class="btn text-white fs-2 border-0 mr-3 btn-secondary btn-sm" @click="addToCart" style="line-height: normal; padding: 4.5px 5px">
                            <b-icon-cart />
                          </button>
                          <button v-else :disabled="true" class="btn text-white fs-3 border-0 mr-3 btn-secondary btn-sm" style="line-height: normal; padding: 4px 5px">
                            <i class="fa fa-spinner fa-spin"></i>
                          </button>
                        </template>
                      </template>
                      <template v-else>
                        <button v-b-modal.modal-login @click="setActionBeforeLogin('addToCart')" :key="'loginmodal'" class="btn text-white fs-2 border-0 mr-3 btn-secondary btn-sm" style="line-height: normal; padding: 4.5px 5px">
                          <b-icon-cart />
                        </button>
                      </template>
                    </template>

                    <strong class="user-name mr-1">{{  isCustomerAuthenticated ? 'Hello ' + customer.first_name : '' }}</strong>

                    <button @click="toggleDD" class="custom-link reset-btn" ref="toggler"><BIconThreeDotsVertical /></button>
                    <b-dropdown ref="dd-menu" :right="true" :offset="30" :boundary="ref['toggler']" size="lg" variant="link" toggle-class="text-decoration-none" no-caret>
                      <b-dropdown-item><button @click="showDesign">Change Design / Item</button></b-dropdown-item>
                      <b-dropdown-item v-if="isCustomerAuthenticated"><button :key="'lockerRoom'" @click="getLockerRoomProducts(null)">Open locker room</button></b-dropdown-item>
                      <b-dropdown-item v-else><button @click="setActionBeforeLogin('lockerRoom')" :key="'loginmodal'">Open locker room</button></b-dropdown-item>
                      <b-dropdown-item v-if="isCustomerAuthenticated"><button :key="'summarybutton'" @click="buyNow">Summary</button></b-dropdown-item>
                      <b-dropdown-item v-else><b-button @click="setActionBeforeLogin('summary')" :key="'loginmodalsummary'">Summary</b-button></b-dropdown-item>
                      <b-dropdown-item @click="resetStore">Reset</b-dropdown-item>
                      <b-dropdown-item v-if="!isCustomerAuthenticated"><button @click="gotoLogin">Login</button></b-dropdown-item>
                      <b-dropdown-item v-if="isCustomerAuthenticated && (company.platform == 'self' || company.platform == 'cdnExceptLogin')"><button @click="logoutCustomer">Logout</button></b-dropdown-item>
                    </b-dropdown>
                  </div>
                </div>
              </div>
            </template>

            <div class="customization-area" :class="{'mobile-custom-scroll': (hideTab.logoHide || hideTab.colorHide || hideTab.textHide || hideTab.styleHide || hideTab.teamHide) }">
              <div v-bind:class="{active: isActive}">
                <div class="twoD-view">
                  <div class="main-preview p-3 d-flex flex-wrap justify-content-center align-items-center" :class="mobileScreen && (isFront ? 'front': 'back')" v-if="selectedProduct">
                    <template v-for="design in selectedProduct.productstyles[styleIndex].productdesigns">
                      <div v-if="design.design_show == 1" class="image-holder" :key="'front'+design.id">
                        <Scene v-if="design.back_design" :measurement-ratio="design.measurement_ratio" ref="mainScene"
                               :front="{textureUrl: storageUrl+design.front_design.file_base_url, file_extension:design.front_design.file_extension, modelUrl: selectedProduct.productstyles[styleIndex].front? storageUrl+selectedProduct.productstyles[styleIndex].front.file_url : ''}"
                               :back="{textureUrl: storageUrl+design.back_design.file_base_url, file_extension:design.back_design.file_extension, modelUrl: selectedProduct.productstyles[styleIndex].back? storageUrl+selectedProduct.productstyles[styleIndex].back.file_url : ''}"
                               :logos="selectedProduct.productstyles[styleIndex].logo" :logosSettings="selectedProduct.logos_setting" :logoAllowed="Boolean(selectedProduct.is_logo_allowed)"
                               :logosLimit="selectedProduct.allowed_logos_count" :productNamesSetting="selectedProduct.productnames" :productColors="selectedProduct.colors"
                               :colorGrouping="JSON.parse(design.front_design.color_group)" mainPreview="true" :productType="selectedProduct.product_type" />

                        <Scene v-else class="view-back" :measurement-ratio="design.measurement_ratio" ref="mainScene"
                               :front="{textureUrl: storageUrl+design.front_design.file_base_url, file_extension:design.front_design.file_extension, modelUrl: selectedProduct.productstyles[styleIndex].front? storageUrl+selectedProduct.productstyles[styleIndex].front.file_url : ''}"
                               :logos="selectedProduct.productstyles[styleIndex].logo" :logosSettings="selectedProduct.logos_setting" :logoAllowed="Boolean(selectedProduct.is_logo_allowed)"
                               :logosLimit="selectedProduct.allowed_logos_count" :productNamesSetting="selectedProduct.productnames" :productColors="selectedProduct.colors"
                               :colorGrouping="JSON.parse(design.front_design.color_group)" mainPreview="true" :productType="selectedProduct.product_type" />
                      </div>
                    </template>

                    <div class="swap-mobile fs-4" v-if="mobileScreen" @click="isFront = !isFront"><BIconArrowRepeat /></div>
                  </div>
                </div>
                <div class="d-none d-lg-block continue-btn-holder pt-5 text-center">
                  <b-button :class="{'invisible': !tabIndex > 0}" @click="changeTabs(tabIndex-1)" class="mx-2 px-5 back-btn" variant="secondary">Back</b-button>
                  <template v-if="editCart.cartId > 0">
                    <template v-if="isCustomerAuthenticated">
                      <template v-if="$store.getters.getUpdateOrderItemProducts == null">
                        <b-button v-if="!$root.$refs.Order_Details.isLoading"  class="mx-2 px-5" variant="secondary" @click="addToCart" :disabled="canvasImage.scene == null">
                          Update Item
                        </b-button>
                        <b-button v-else  class="mx-2 px-5" variant="secondary" :disabled="true" >
                          <img width="20" height="20" src="../../src/assets/images/loading.gif" />
                        </b-button>
                      </template>
                    </template>
                    <b-button @click="cancelCart" class="mx-2 light px-5" variant="secondary" aria-label="Cancel">Cancel</b-button>
                  </template>

                  <b-button :key="'Next'" @click="changeTabs(tabIndex+1)" class="mx-2 px-5" variant="secondary" v-else-if="(hideColorSection && (tabIndex <= (mainTotalTabs-1))) || (!hideColorSection && (tabIndex <= mainTotalTabs))">Next</b-button>

                  <template v-else>
                    <b-button :key="'editRoster'" v-if="!isRosterOpened"  class="mx-2 px-5" variant="secondary" @click="()=>{this.setRosterOpen(true); showVModal('rostermodal')}">
                      Edit {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}}
                    </b-button>

                    <template v-else-if="isCustomerAuthenticated">
                      <template v-if="$store.getters.getUpdateOrderItemProducts == null">
                        <b-button :key="'AddToCart'" aria-label="Add to Cart" v-if="!$root.$refs.Order_Details.isLoading"  class="mx-2 px-5" variant="secondary" @click="addToCart" :disabled="canvasImage.scene == null">
                          Add to Cart
                        </b-button>
                        <b-button v-else  class="mx-2 px-5" variant="secondary" :disabled="true" >
                          <img width="20" height="20" src="../../src/assets/images/loading.gif" />
                        </b-button>
                      </template>
                    </template>
                    <template v-else>
                      <b-button @click="setActionBeforeLogin('addToCart')" :key="'loginmodal'"  class="mx-2 px-5" variant="secondary">Add to Cart</b-button>
                    </template>
                  </template>

                  <b-button @click="cancelEdit" class="mx-2 px-5 light" variant="secondary" aria-label="Cnacel" v-if="editProductStatus">Cancel</b-button>
                </div>
              </div>
            </div>
            <div class="sideNav" v-if="mobileScreen">
              <ul>
                <li v-if="selectedProduct.is_logo_allowed">
                  <a @click="switchTabs(0, false)">
                  <span v-html="tabIcons[0]">
                  </span>
                  </a>
                </li>
                <li>
                  <a @click="switchTabs(1, false)">
                  <span v-html="tabIcons[1]">
                  </span>
                  </a>
                </li>
                <li v-if="selectedProduct.allow_name_number">
                  <a @click="switchTabs(2, false)">
                  <span v-html="tabIcons[2]">
                  </span>
                  </a>
                </li>
                <li>
                  <a @click="switchTabs(3, false)">
                  <span v-html="tabIcons[3]">
                  </span>
                  </a>
                </li>
                <li>
                  <a @click="switchTabs(4, false)">
                  <span v-html="tabIcons[4]">
                  </span>
                  </a>
                </li>
              </ul>
            </div>
          </b-col>
          <div class="mobile-reset" v-if="mobileScreen && customLogos[0].url">
            <b-button @click="resetStore" variant="secondary" class="p-1"><b-icon-arrow-clockwise /></b-button>
          </div>
          <b-col v-if="manageComponents.ItemToCustomize" cols="12" lg="3">
            <ItemToCustomize @switchTabs="switchTabs(0, true)" :uploaderOpened="this.$store.getters.getActiveTab === 0 && mobileScreen" @hideAll="hideAll" :categories="categories" @retrieveProducts="retrieveProducts" v-bind:search_products.sync="search_products" ref="ItemToCustomize"/>
            <div class="customize_controls" :class="{'other_tab': showOtherTab}" v-if="this.$store.getters.getActiveTab === 0 && mobileScreen">
              <span class="close minimizer" @click="this.hideAll" title="Minimize"><b-icon-dash /></span>
              <span class="dragControl" @dblclick="setMinMax(0)" v-touch:start="setPlayersDataHeight(0)" v-touch-options="{touchClass: 'active'}" v-touch:moving="resizeTab(0)"></span>

              <div>
                <LogoUploader @switchTabs="switchTabs" @ @showOther="updateOtherTab" :numberOfLogosAllowed="selectedProduct.allowed_logos_count" :logosSetting="selectedProduct.logos_setting"/>
              </div>
            </div>
            <div v-else-if="mobileScreen" class="open-logo-uploader customize_controls">
              <span class="fs-3 font-weight-bold d-inline-flex pb-1">Logo Uploader</span>
              <span @click="switchTabs(0, true)" class="maximizer close">
              <svg height="1em" width="1em" fill="currentColor" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                   viewBox="0 0 16 16">
                <polygon points="0,11.8 0,0 11.8,0 "/>
                <polygon points="16,4.3 16,16 4.3,16 "/>
              </svg>
            </span>
            </div>
          </b-col>
        </template>
      </b-row>
    </b-container>
    <confirm-modal message="Do you really want to delete?" cancel_text="Cancel" confirm_text="Yes" name="delete-cart-item" ref="delete-cart-item"></confirm-modal>
    <confirm-modal message="Do you really want to logout?" cancel_text="Cancel" confirm_text="Yes" name="reset-modal" ref="reset-modal"></confirm-modal>
    <confirm-modal message="This will reset everything. All design changes will be lost.
 Continue?" cancel_text="Cancel" confirm_text="Reset all" ref="reset-changes" name="reset-changes"></confirm-modal>
  </div>
</template>

<script lang="ts">

import {Component, Mixins, Vue, Watch} from 'vue-property-decorator'
import ChooseColor from '@/components/ChooseColor.vue'
import CustomizationPreview from '@/components/CustomizationPreview.vue'
import ItemToCustomize from '@/components/ItemToCustomize.vue'
import ChooseInterest from '@/components/ChooseInterest.vue'
import CustomizationTabs from '@/components/CustomizationTabs.vue'
import SaveColorModal from "@/components/SaveColorModal.vue"
import UploadLogo from '@/components/UploadLogo.vue'
import LockerRoomModal from '@/components/LockerRoomModal.vue'
import AddLockerRoomModal from '@/components/AddLockerRoomModal.vue'
import ExtractedColors from '@/components/ExtractedColors.vue'
import LoginForm from '@/components/LoginForm.vue'
import {http} from "@/httpCommon"
import DesignCollectionModal from "@/components/DesignCollectionModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Scene from "@/components/Scene.vue";
import $ from 'jquery';
import CustomTabs from "@/components/CustomTabs.vue";
import ErrorMessages from "@/mixins/ErrorMessages";
import {LockerProducts, handleMainProducts} from "@/mixins/LockerProduct";
import moment from 'moment'
import CartModal from "@/components/CartModal.vue";
import {logData, getActiveProductData, getPermissions} from "@/helpers/Helpers";
import ModalAction from "@/mixins/ModalAction";
import LogoUploader from "@/components/mobile/LogoUploader.vue";
import { Popper } from 'popper-vue'
import 'popper-vue/dist/popper-vue.css'
import { findIndex } from 'lodash'


Vue.filter('formatDate', function(value:string) {
  if (value) {
    return moment(value).format('MMMM DD')
  }
})

@Component<Home>({
  components: {
    Popper,
    LogoUploader,
    CartModal,
    CustomTabs,
    ConfirmModal,
    DesignCollectionModal,
    ChooseColor,
    CustomizationPreview,
    ItemToCustomize,
    ChooseInterest,
    CustomizationTabs,
    UploadLogo,
    LockerRoomModal,
    AddLockerRoomModal,
    SaveColorModal,
    ExtractedColors,
    LoginForm,
    Scene
  },

  async mounted() {
    await this.$store.dispatch('GET_LOCKER_PRODUCTS')

    this.setRecentLogos()

    if (this.hideColorSection){
      this.$store.commit('hideColorSection', false)
    }

    //set jwtToken
    await this.$store.dispatch('setCustomToken');
    // await this.retrieveProducts()
    await this.getFillColors()


    if (this.isCustomerAuthenticated){
      await this.$store.dispatch("getLockers");
      await this.$store.dispatch('getLockerRoomColors')
      await this.$store.dispatch('getCartServer', {})
    }
    if (this.$route.params.name) {
      this.showLoader = true
      await this.editProduct(0, 0, this.lockerProductIndex, this.getPath());
      this.showLoader = false
    } else {
      await this.retrieveProducts()
    }
    this.$store.commit('CHANGE_EDIT_STATUS', {status: false})
    this.jwtToken = localStorage.getItem('jwtToken') as string
    await this.$store.dispatch('setCategories')
    // await this.$store.dispatch('setJwtToken')
    if(!localStorage.getItem('browserToken')){
      await this.$store.dispatch('setBrowserToken')
    }

    if (this.isCustomerAuthenticated){
      await this.$store.dispatch('getNotifications')
      await  getPermissions()
      let show_cart = await this.$store.getters.getShowCart
      if(show_cart){
        this.showVModal('cart-modal');
      }

      let ecommerce_update_id = this.$route.query.update_item;
      let santa_cart_id = this.$route.query.update_cart;

      if(ecommerce_update_id){
        let cart_items = await this.$store.getters.getCartItems;


        let filter_items = cart_items.filter((item) => {
          return item.id == parseInt(santa_cart_id)
        });

        if(filter_items && filter_items.length > 0){

          let factory_items = filter_items[0].factory_products.filter((factory_item)=>{
            return factory_item.ecommerce_cart_id == ecommerce_update_id
          } );

          if(factory_items && factory_items.length > 0){
            let update_cart_item = factory_items[0]
            if(this.$route.query.roster){
              this.ref.cartModal.editCartItem(update_cart_item, santa_cart_id, false);
            }else{
              this.ref.cartModal.editCartItem(update_cart_item, santa_cart_id, true);
            }

          }

        }

      }

    }
    if(this.$route.query.tabIdx){
      this.$store.dispatch('setTabMain',{value: parseInt(this.$route.query.tabIdx)})
    }
  }
  //  destroyed() {
  //   this.$store.dispatch("updateOrderItemProducts", null);
  // }
})

export default class Home extends Mixins(ErrorMessages, LockerProducts, handleMainProducts, ModalAction) {
  public logData = logData;
  public getActiveProductData = getActiveProductData;
  public tabIndex = 0
  // private products: any[] = []
  private nextPageUrl !: string
  public hasProducts = true
  public category_id !: string
  public search_products = ''
  public colors = []
  public product_id !: number
  public logoUrl = ''
  public ref = this.$refs as Record<any, any>
  public mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  private jwtToken !: string
  private apiBaseUrl = process.env.VUE_APP_API_BASE_URL
  public mounted = false
  public productUpdated = false
  public previousImageColors = []
  public logoColorUsed = false
  public showModal = false
  public shared_link = ''
  public generate_share_url = false
  public extractedcolorclass = ""
  private isFront = true;
  private showOtherTab = false
  public showOtherColors = false
  private playersDataHeight = 0
  public updated_order_products: Record<any, any>[] = []
  public updateOrderItemProducts: Record<any, any> | null = null;
  private sideTabIndex = 0
  private mainTotalTabs = 0
  private maximized = true
  private isRosterOpened = false
  private isColorShuffled = true
  public shareDesignLoader = false
  private product: Record<any, any> = {}
  private frontPreview = ''
  private backPreview = ''
  private tabIcons = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-image" viewBox="0 0 16 16">
      <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
      <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
    </svg>`,

    `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-palette" viewBox="0 0 16 16">
      <path d="M8 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm4 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM5.5 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
      <path d="M16 8c0 3.15-1.866 2.585-3.567 2.07C11.42 9.763 10.465 9.473 10 10c-.603.683-.475 1.819-.351 2.92C9.826 14.495 9.996 16 8 16a8 8 0 1 1 8-8zm-8 7c.611 0 .654-.171.655-.176.078-.146.124-.464.07-1.119-.014-.168-.037-.37-.061-.591-.052-.464-.112-1.005-.118-1.462-.01-.707.083-1.61.704-2.314.369-.417.845-.578 1.272-.618.404-.038.812.026 1.16.104.343.077.702.186 1.025.284l.028.008c.346.105.658.199.953.266.653.148.904.083.991.024C14.717 9.38 15 9.161 15 8a7 7 0 1 0-7 7z"/>
    </svg>`,

    `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-textarea-t" viewBox="0 0 16 16">
      <path d="M1.5 2.5A1.5 1.5 0 0 1 3 1h10a1.5 1.5 0 0 1 1.5 1.5v3.563a2 2 0 0 1 0 3.874V13.5A1.5 1.5 0 0 1 13 15H3a1.5 1.5 0 0 1-1.5-1.5V9.937a2 2 0 0 1 0-3.874V2.5zm1 3.563a2 2 0 0 1 0 3.874V13.5a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V9.937a2 2 0 0 1 0-3.874V2.5A.5.5 0 0 0 13 2H3a.5.5 0 0 0-.5.5v3.563zM2 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm12 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
      <path d="M11.434 4H4.566L4.5 5.994h.386c.21-1.252.612-1.446 2.173-1.495l.343-.011v6.343c0 .537-.116.665-1.049.748V12h3.294v-.421c-.938-.083-1.054-.21-1.054-.748V4.488l.348.01c1.56.05 1.963.244 2.173 1.496h.386L11.434 4z"/>
    </svg>`,

    `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-brush" viewBox="0 0 16 16">
        <path d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.067 6.067 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.118 8.118 0 0 1-3.078.132 3.659 3.659 0 0 1-.562-.135 1.382 1.382 0 0 1-.466-.247.714.714 0 0 1-.204-.288.622.622 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896.126.007.243.025.348.048.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04zM4.705 11.912a1.23 1.23 0 0 0-.419-.1c-.246-.013-.573.05-.879.479-.197.275-.355.532-.5.777l-.105.177c-.106.181-.213.362-.32.528a3.39 3.39 0 0 1-.76.861c.69.112 1.736.111 2.657-.12.559-.139.843-.569.993-1.06a3.122 3.122 0 0 0 .126-.75l-.793-.792zm1.44.026c.12-.04.277-.1.458-.183a5.068 5.068 0 0 0 1.535-1.1c1.9-1.996 4.412-5.57 6.052-8.631-2.59 1.927-5.566 4.66-7.302 6.792-.442.543-.795 1.243-1.042 1.826-.121.288-.214.54-.275.72v.001l.575.575zm-4.973 3.04.007-.005a.031.031 0 0 1-.007.004zm3.582-3.043.002.001h-.002z"/>

    </svg>`,

    `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-person-plus" viewBox="0 0 16 16">
      <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
      <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
    </svg>`,
  ]

  private setRosterOpen(val:boolean) {
    this.isRosterOpened = val
  }

  private genImages(isClose = false) {
    const canvasFront = this.ref['mainScene'][0].$refs['front']
    const canvasBack = this.ref['mainScene'][0].$refs['back']
    const imgFront    = canvasFront.toDataURL('image/png')
    const imgBack    = canvasBack.toDataURL('image/png')
    if(isClose){
      this.frontPreview = ''
      this.backPreview = ''
    }else{
      this.frontPreview = imgFront
      this.backPreview = imgBack
    }
  }

  private get lockerIndex (){
    return this.$store.getters.getLockerTabsIndex
  }

  get usingColorLogos() : [Record<any, any>] {
    return this.$store.getters.getUsingColorLogos;
  }
  get productLockerId():number{
    return this.$store.getters.getProductLockerId;
  }

  private get lockerProductIndex (){
    return this.$store.getters.getActiveLockerProduct
  }

  private updateOtherTab(value:boolean){
    this.showOtherTab = value
  }

  private adjustTotalTabs() {
    this.mainTotalTabs = 3

    if(!this.selectedProduct.is_logo_allowed){
      this.mainTotalTabs = (this.mainTotalTabs - 1)
    }

    if(!this.selectedProduct.allow_name_number){
      this.mainTotalTabs = (this.mainTotalTabs - 1)
    }
  }

  private swapSide(textIndex: number){
    let side = this.customTexts[textIndex].side
    if(side ==='front'){
      this.isFront = true
    }else{
      this.isFront = false
    }
  }

  private maximizeTab(ind:number, maximize:boolean){
    this.switchTabs(ind, false)
    this.maximized = maximize
  }

  private navigateTabs(side: string){
    let index = 0;
    if(side === 'prev'){
      index = this.activeTab - 1
      if(!this.selectedProduct.is_logo_allowed && index === 0){
        index = -1
        this.showDesign()
      }
      if(!this.selectedProduct.allow_name_number && index === 2) {
        index = 1
      }
    }

    if(side === 'next') {
      index = this.activeTab + 1
      if (!this.selectedProduct.is_logo_allowed && index === 0) {
        index = 1
      }
      if (!this.selectedProduct.allow_name_number && index === 2) {
        index = 3
      }
    }

    this.switchTabs(index, false)
  }

  private switchTabs (ind:number, isHome:boolean){
    this.maximized = true

    let self = this;
    let customizer_tabs;
    if(ind >= 0){
      this.sideTabIndex = ind
    }

    if(isHome){
      this.hideOtherTab()
      self.$store.dispatch('setActiveTab', ind);
    }
    else {
      console.log(ind, isHome)

      this.hideOtherTab()
      if($(".sideNav li a").length){
        customizer_tabs = $(".sideNav li a")
        customizer_tabs.removeClass('active')
        if(ind >= 0){
          customizer_tabs.eq(ind).addClass('active')
        }
        self.$store.dispatch('setActiveTab', ind);
      }else{
        let shadow_dom = (this.$root as Record<any,any>).$options.shadowRoot;
        customizer_tabs = shadow_dom.querySelectorAll('.sideNav li a')

        for(let i=0; i<customizer_tabs.length; i++){
          console.log(customizer_tabs[i].classList)
          if(i === ind && ind >= 0){
            customizer_tabs[i].classList.add('active')
          }else{
            customizer_tabs[i].classList.remove('active')
          }
        }
      }
      self.$store.dispatch('setActiveTab', ind);
    }
  }

  public get activeTab () {
    return this.$store.getters.getActiveTab
  }

  public showLoader = true;
  private storageUrl = process.env.VUE_APP_STORAGE_URL

  public setRecentLogos() {
    this.$store.commit('SET_RECENT_LOGOS')
  }

  get notifications(){
    return this.$store.getters.getNotifications
  }
  get editCart(): Record<any, any> {
    return this.$store.getters.getEditCart
  }
  get canvasImage() {
    return this.$store.getters.getCanvasImage
  }
  get lastRouteName() {
    let returnVal = '';

    const routerStack = (this.$router as Record<any, any>).history.stack;
    const idx = (this.$router as Record<any, any>).history.index;


    if (idx > 0) {
      returnVal = routerStack[idx - 1].name;
    }

    return returnVal;
  }

  get notificationsCounter(){
    let unread_notification_counter = 0
    if (this.$store.getters.getNotifications.length){
      this.$store.getters.getNotifications.forEach((notification:Record<any, any>) => {
        if (notification.read_at === '' || notification.read_at === null){
          unread_notification_counter += 1
        }
      })
    }
    return unread_notification_counter
  }

  get canvasReady() {
    return this.$store.getters.getCanvasReady
  }

  @Watch('canvasReady')
  canvasReadyChanged(newValL: [Record<any, any>]){
    if(this.isCustomerAuthenticated && newValL && this.actionBeforeLogin) {
      this.actionAfterLogin()
    }
  }

  @Watch('revertRosterBool')
  revertRosterBoolChanged(){
    this.$store.commit('SET_REVERT_ROSTER_BOOL',false)
    this.$store.commit('CHANGE_EYE_INDEX', 0)
    this.$store.commit('SET_EDITING_ROSTER_PLAYER_INDEX', 0)
  }

  get editing_roster_player_index(): number {
    return this.$store.getters.getEditingRosterPlayerIndex
  }

  get rosterFirstNameAndNumber(): string | null {
    if (this.rosterDetails && this.rosterDetails.length > 0) {
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
      if (custom_name_index != -1) {
        await this.$store.dispatch('updateCustomTextAttribute', { index: custom_name_index, attribute: 'text', value: name })
      }
      if (custom_number_index != -1) {
        await this.$store.dispatch('updateCustomTextAttribute', { index: custom_number_index, attribute: 'text', value: number })
      }
    }
  }


  get cartItemsCount(){
    return this.$store.getters.getCartItemsCount
  }

  get revertRosterBool(){
    return this.$store.getters.getRevertRosterBool;
  }

  public showConfirm(){
    this.ref['reset-modal'].showConfirm()
  }

  get hideTab(): Record<any, any> {
    return this.$store.getters.getHideTab
  }

  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  get customer():Record<any, any>{
    return  this.$store.getters.getCustomer
  }

  get categories(): [] {
    return this.$store.getters.getCategories
  }

  get manageComponents(): Record<any, any> {
    return this.$store.getters.getManageComponents
  }

  get customLogos(): [Record<any, any>] {
    return this.$store.getters.getCustomLogos()
  }

  get editProductStatus():boolean{
    return  this.$store.getters.getEditStatus
  }

  get mainProductType():string{
    let selected_product = this.selectedProduct.productstyles[this.styleIndex].productdesigns.filter((design:Record<any, any>) => design.design_show == 1)[0];
    return selected_product.back_design ?  "front_back" : "front";
  }

  public showCollectionModal = () =>{
    this.ref['collectionModal'].showCollectionModal()
  }
  public editCollectionModal = () =>{
    this.ref['collectionModal'].editCollectionModal()
  }
  public openCartModal = () =>{
    if(this.cartItemsCount > 0) {
      this.showVModal('cart-modal')
    }
  }

  public getPath(){
    let url = ''
    url = this.$route.path
    if (url.charAt(0) === '/'){
      url = url.substring(1)
    }
    return url
  }
  @Watch('customLogos', {
    deep: true
  })
  async customLogosChanged(newValL: [Record<any, any>]){
    try{
      if (this.getUrlParams()){
        let query = this.getPath()
        let param = {
          case: 'custom_logos',
          custom_logos: this.customLogos,
          url: query
        }
        let res = await this.$store.dispatch('updateSharedProduct', param)
      }
    }catch (error){
      console.log(error)
    }
  }
  get undoItems():Record<any, any>{
    return this.$store.getters.getUndoItems
  }
  get redoitems():Record<any, any>{
    return this.$store.getters.getRedoItems
  }
  get products():[Record<any, any>]{
    return this.$store.getters.getProducts
  }
  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }
  get hideSaveLockerButton():boolean{
    return this.$store.getters.getHideSaveLockerButton;
  }

  get undoRedoArrays(): boolean {
    let undo = this.$store.getters.getUndoItems;
    let redo = this.$store.getters.getRedoItems;
    let hidebtn = this.$store.getters.getHideSaveLockerButton;
    if(hidebtn && this.editProductStatus){
      if(undo.length > 0 || redo.length > 0){
        this.$store.commit('SET_HIDE_SAVE_LOCKER_BUTTON', false)
      }
    }
    return hidebtn
  }

  get styleIndex():number{
    return  this.$store.getters.getCurrentStyleIndex;
  }
  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails()
  }
  get imageColors(): any[] {
    return this.$store.getters.getLogosColors
  }
  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts()
  }
  get company(): Record<any, any>{
    return this.$store.getters.getCompany
  }

  get cartItems() {
    return this.$store.getters.getCartItems
  }
  get actionBeforeLogin(): string {
    return this.$store.getters.getActionBeforeLogin
  }
  get editStatus():boolean{
    return  this.$store.getters.getEditStatus
  }
  public getUrlParams(){
    if (this.$route.params.product && this.$route.params.name && this.productUpdated){
      return true
    }else{
      return  false
    }
  }
  public dropdownStyle = { } as any
  public down = false
  public notificationsDropDown(){
    if(this.down){
      this.dropdownStyle = {'height': '0px', 'opacity': '0'}
      this.down = false;
    }else{
      this.dropdownStyle = {'height' : 'auto', 'opacity': '1'}
      this.down = true;
    }
  }
  public actionAfterLogin() {
    if(this.actionBeforeLogin == 'lockerRoom') {
      console.log('in open locker room')
      this.getLockerRoomProducts(null)
      this.showVModal('locker-modal')
    } else if(this.actionBeforeLogin == 'saveToLockerRoom') {
      this.getLockers()
      this.ref['saveToLockerModal'].showSaveToLockerRoomModal()
    } else if(this.actionBeforeLogin == 'summary') {
      this.buyNow()
    } else if(this.actionBeforeLogin == 'addToCart') {
      this.addToCart()
    } else if(this.actionBeforeLogin == 'shareDesign') {
      this.shareDesign()
    }
    this.$store.commit("ACTION_BEFORE_LOGIN", '');
  }
  private async addToCart() {
    await (this.$root.$refs as Record<any,any>).Order_Details.addToCart()
    if(this.editCart.cartId > 0 && this.company.platform != 'wordpress'){
      this.showVModal('cart-modal')
    }

    let whereToAppend = this.ref["preview-column"];

    let canvasFront = this.cloneCanvas(this.ref["mainScene"][0])
    let canvasBack = this.cloneCanvas(this.ref["mainScene"][1])

    console.log('whereToAppend', whereToAppend)
    console.log('canvasFront', canvasFront)
    console.log('canvasBack', canvasBack)

    // setting width & height of canvas
    canvasFront.style.width = "100%";
    canvasFront.style.height = "100%";
    canvasBack.style.width = "100%";
    canvasBack.style.height = "100%";

    let elementToAppend = document.createElement("div");
    elementToAppend.appendChild(canvasFront);
    elementToAppend.appendChild(canvasBack);
    elementToAppend.classList.add("cart-animation");

    whereToAppend.append(elementToAppend)

    setTimeout(() => {
      elementToAppend?.parentElement?.removeChild(elementToAppend)
    } , 999)
  }

  public cloneCanvas(oldCanvas: any) {
    //create a new canvas
    const newCanvas = document.createElement('canvas');
    const context = newCanvas.getContext('2d');

    //set dimensions
    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;

    //apply the old canvas to the new one
    context?.drawImage(oldCanvas, 0, 0);

    //return the new canvas
    return newCanvas;
  }

  getFillColors() {
    const url = '/product/colors?default_color=1'
    http.get(url).then((response: any) => {
      this.colors = JSON.parse(response.data.json_data)
    }).catch((e: any) => {
      console.log(e)
    });
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
        console.log(e);
        this.showError(e);
        this.ref['cartModal'].hide();
      });
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

  private cancelEdit() {
    this.$store.commit('CHANGE_EDIT_STATUS', {status : false, id: 0, designId: 0, styleId: 0, product_id:0})
    this.retrieveProducts();
  }

  public async getLockers(share_url = false){
    this.$store.commit('setIsShareDesign', false)
    this.generate_share_url = share_url
    if (!this.editStatus){
      this.ref['saveToLockerModal'].showSaveToLockerRoomModal()
    }

    const currentDesign = this.selectedProduct.productstyles[this.styleIndex].productdesigns.filter((item: Record<any, any>) => {
      return item.design_show
    })
    // if (this.$store.getters.getEditDesignId != currentDesign[0].id || this.$store.getters.getEditStyleId != this.selectedProduct.productstyles[this.styleIndex].id){
    //   this.$store.commit('CHANGE_EDIT_STATUS', {status : false, id: 0, designId: 0, styleId: 0})
    // }
    let main_scene = this.ref.mainScene[0];
    main_scene.frontCanvas.discardActiveObject().renderAll();
    main_scene.backCanvas.discardActiveObject().renderAll();
    let locker_front_png = main_scene.frontCanvas.toDataURL("image/png").split(',')[1];
    let locker_back_png = null;
    if(this.mainProductType == "front_back") {
      locker_back_png =  main_scene.backCanvas.toDataURL("image/png").split(',')[1];
    }
    let distinct:Record<any, any> = []
    let svgGroups = this.$store.getters.getSvgGroups
    let unique:any = [];
    for( let i = 0; i < svgGroups.length; i++ ){
      if( !unique[svgGroups[i].color]){
        distinct.push({value: svgGroups[i].color, name: svgGroups[i].name});
        unique[svgGroups[i].color] = 1;
      }
    }
    let locker = {
      product_id: this.selectedProduct.product_id,
      style_id: this.selectedProduct.productstyles[this.styleIndex].id,
      design_id: currentDesign[0].id,
      custom_logos: this.customLogos,
      text: this.customTexts,
      colors: this.imageColors,
      defaultcolors: this.$store.getters.getDefaultColors,
      groupcolors: this.$store.getters.getGroupColors,
      id: this.$store.getters.getEditProductId,
      locker_front_png: locker_front_png,
      locker_back_png: locker_back_png,
      roster: this.rosterDetails,
      svgcolors: distinct
    }
    if (this.editStatus){
      this.showLoader = true
      let res = await this.$store.dispatch('overRideLockerProduct', locker)
      if (res.status == 201){
        this.showLoader = false
        this.showToast(res.data.message, 'SUCCESS')
        this.$store.commit('CHANGE_EDIT_STATUS', {status : false, id: 0, designId: 0, styleId: 0, product_id:0})
        this.retrieveProducts();
      }else{
        this.showError(res)
        this.showLoader = false
      }
    }
  }
  public undoAction(){
    this.$store.dispatch('undoAction')
  }
  public redoAction(){
    this.$store.dispatch('redoAction');
  }

  public showBasicCustomization() {
    this.$store.dispatch('setManageComponents', {index: 'BasicCustomization', value: true})
    this.$store.dispatch('setManageComponents', {index: 'AdvanceCustomization', value: false})
    this.$store.dispatch('setWindowView', 1)
    this.$store.dispatch('setActiveTab', 0)
  }

  public showDesign() {
    if(this.manageComponents.mobileScreen){
      this.$store.dispatch('setManageComponents', {index: 'CustomizationPreview', value: false})
      this.$store.dispatch('setManageComponents',  {index: 'ItemToCustomize', value: true})
      this.$store.dispatch('setManageComponents', {index: 'AdvanceCustomization', value: false})
      this.$store.dispatch('setManageComponents', {index: 'LogoArea', value: false})
      this.$store.dispatch('setManageComponents', {index: 'ChooseColor', value: false})
      this.$store.dispatch('setManageComponents', {index: 'DefaultColorShuffleBtn', value: true})
      this.$store.dispatch('setActiveTab', -1)
      this.$store.dispatch('setManageComponents', {index: 'CustomizationTabs', value: false})
    }
  }

  public showHomeLanding() {
    this.$store.dispatch('setManageComponents', {index: 'CustomizationPreview', value: true})
    this.$store.dispatch('setManageComponents', {index: 'ItemToCustomize', value: false})
    this.$store.dispatch('setManageComponents', {index: 'CustomizationTabs', value: true})
  }
  public additionalClass(additionalClassTrigger: string) {
    if(additionalClassTrigger){
      this.extractedcolorclass = "additional-class"
    }
  }
  public async logoutCustomer(){
    const ok = await this.ref['reset-modal'].showConfirm()
    if (ok) {
      await this.$store.dispatch('logoutCustomer');
      this.$store.commit('ADD_LOCKER_ROOM_COLORS', [])
      await this.$store.commit('SET_RECENT_LOGOS')
    }
  }

  public copyLink(){
    let testingCodeToCopy = this.ref['share-design-link']  as Record<any, any>
    testingCodeToCopy.select()
    try {
      document.execCommand('copy');
      this.showToast('Shareable link was copied to your clipboard.', 'SUCCESS');
    } catch (err) {
      this.showToast('Oops, unable to copy', 'ERROR');
    }
  }

  public async getLockerRoomProducts(locker_index:any){
    this.$store.commit('SET_SELECTION_MODE',{
      readonly:false,
      collectionAddmoreMode:false,
      eventProductMode:false,
      eventCollectionMode:false
    })
    if(this.isCustomerAuthenticated){
      let res = await this.$store.dispatch('GET_LOCKER_PRODUCTS')
      if (res == true){

        if(locker_index){
          let payload = {index:locker_index, attribute: 'active_tab', value:true}
          this.$store.commit('SET_LOCKER_ATTRIBUTE', payload)
        }else{
          locker_index = this.$store.getters.getLockerTabsIndex;
          if(locker_index){
            let payload = {index:locker_index, attribute: 'active_tab', value:true}
            this.$store.commit('SET_LOCKER_ATTRIBUTE', payload)
          }
        }
        console.log("modal opens from here")
        this.showVModal('locker-modal')

        if(this.ref.saveToLockerModal) {
          this.hideVModal('add-to-lockerroom')
          this.ref.saveToLockerModal.showLoader = false;
        }

      }
    }
  }

  public toggleDD() {
    this.ref['dd-menu'].show()
  }

  public changeSide(index: number) {
    const payload = {
      index: index,
      attribute: 'side',
      value: this.customLogos[index].side
    }
    this.$store.dispatch('updateCustomLogoAttribute', payload)
  }

  useLogoColors() {
    this.logoColorUsed = true
    this.$store.dispatch('setGroupColors', {})
    for (let i = 0; i < 4; i++) {
      if(this.imageColors[i]) {
        this.$store.dispatch('setDefaultColor', { index: i, color: this.imageColors[i].hex, pantone: this.imageColors[i].pantone })
      } else {
        this.$store.dispatch('setDefaultColor', { index: i, color: '', pantone: '' })
      }
    }
  }

  shuffleLogoColors() {
    this.isColorShuffled = false
    if(this.imageColors.length > 1) {
      this.previousImageColors = JSON.parse(JSON.stringify(this.imageColors))
      let imageColors = JSON.parse(JSON.stringify(this.imageColors)).filter((imageColor: Record<any, any>) => {
        return imageColor.hex
      })

      let shuffle = (previousValue: Record<any, any>, currentValue: Record<any, any>, currentIndex: number, array: Record<any, any>[]) => {
        if (currentIndex !== 1) return previousValue;

        array.sort(() => Math.random() - 0.5)
        return array;
      }

      while (JSON.stringify(this.previousImageColors) == JSON.stringify(imageColors)) {
        imageColors.reduce(shuffle)
      }

      this.$store.dispatch("SET_LOGO_COLORS", imageColors);
      imageColors.forEach((imageColor: Record<any, any>, index: number) => {
        this.$store.dispatch('setDefaultColor', {
          index: index,
          color: imageColor.hex,
          pantone: imageColor.pantone,
          name: imageColor.name
        })
      })
    }
  }

  public rollbackPreviousColors (): void {
    this.previousImageColors.forEach((defaultColor: Record<any, any>, index: number) => {
      this.$store.dispatch('setDefaultColor', { index: index, color: defaultColor.hex, pantone: defaultColor.pantone })
    })
    this.$store.dispatch("SET_LOGO_COLORS", this.previousImageColors);
    this.previousImageColors = []
  }

  public changeTabs(index: number) {
    if(index > 4){
      index = 4
    }
    this.tabIndex = index
    this.$store.dispatch('setTabMain',{value:index})
  }

  public async buyNow() {
    this.$router.push('/confirm-order')
  }

  public isActive = false;

  public myFilter() {
    this.isActive = !this.isActive
  }

  public async resetStore(){

    const ok = await this.ref['reset-changes'].showConfirm()

    if (ok) {
      if(this.editCart.cartId || this.editStatus || this.updateOrderItemProducts){
        await this.retrieveProducts()
        this.$store.dispatch('setTabMain',{value: 0})
        this.$store.dispatch('SET_LOGO_COLORS', [])
        this.$store.commit('SET_INITIAL_LOGO_COLORS', [])
        this.$store.dispatch('resetStore')
        await this.$store.dispatch('setEditCart', {key:'cartId',value:0});
        await this.$store.dispatch('setEditCart', {key:'cartItemId',value:0});
        this.$store.commit('CHANGE_EDIT_STATUS',{status:false})
        this.updateOrderItemProducts = null;
      } else{
        this.$store.dispatch('resetStore')
        this.$store.dispatch('setTabMain',{value: 0});
        (this.$refs['ItemToCustomize'] as Record<any,any>).setSliderIndex();
        this.$store.dispatch('SET_LOGO_COLORS', [])
        this.$store.commit('SET_INITIAL_LOGO_COLORS', [])
      }

    }

    if(this.mobileScreen){
      this.showDesign()
      this.switchTabs(0, true)
    }

    this.isRosterOpened = false
  }

  get hideColorSection() {
    return this.$store.getters.getHideColorSection
  }
  public async readNotification(notification:Record<any, any>){
    if (notification.read_at === null || notification.read_at === ''){
      await this.$store.dispatch('readNotification', notification.id)
    }
  }

  get searchLoader() {
    return this.$store.getters.getSearchLoader
  }

  private async cancelCart() {
    await this.$store.dispatch('setEditCart', {key:'cartId',value:0});
    await this.$store.dispatch('setEditCart', {key:'cartItemId',value:0});
    await this.retrieveProducts();
    await this.showVModal('cart-modal')
  }

  public async retrieveProducts(url:string|null=null) {
    let self = this;
    let sync_id = this.$route.query.sync_id;
    if(url == null) {
      url = `/list/products`;
    }
    let url_obj = new URL(`${process.env.VUE_APP_API_BASE_URL}${url}`);
    if(!url_obj.searchParams.has("customized")) {
      url_obj.searchParams.append('customized', this.$store.getters.getCustomized)
    }
    if(!url_obj.searchParams.has("personalized")) {
      url_obj.searchParams.append('personalized', this.$store.getters.getPersonalized)
    }
    if(self.search_products && !url_obj.searchParams.has("title")) {
      url_obj.searchParams.append('title', self.search_products)
    }
    if(this.$route.query.update_order_product) {
      url_obj.searchParams.append('update_order_product', this.$route.query.update_order_product);
      url_obj.searchParams.append('order_item_id', this.$route.query.order_item_id);
      url_obj.searchParams.append('activity_id', this.$route.query.activity_id);
      //this.$router.replace('/')
    }
    url = url_obj.pathname + url_obj.search;
    if(sync_id) {
      if(url.indexOf("?") > 0) {
        url += `&sync_id=${sync_id}`;
      } else {
        url = `?sync_id=${sync_id}`;
      }
    }
    http.get(url).then(async (response: Record<any, any>) => {
      if(response.data.products.data.length > 0 ){
        await self.handleMainProducts(response);
        if(self.updateOrderItemProducts) {
          await self.updateFactoryProduct(self.updateOrderItemProducts.factory_products[self.updateOrderItemProducts.active_index]);
        }

        if(self["showLoader"] || self["searchLoader"]) {
          self.showLoader = false;
          await self.$store.dispatch('setSearchLoader', false)
        }
      }else{
        this.showError("No Product Found")
        self.showLoader = false
        await self.$store.dispatch('setSearchLoader', false)
      }
    }, (error) => {
      console.error("Error while getting order detail", error?.response?.data?.message)
    })
  }

  async loadOrderItemProduct(action: string) {
    let self = this;
    let updated_product = await getActiveProductData();
    if(updated_product == null) {
      return false;
    }
    let order_product_active_index =  self.updateOrderItemProducts.active_index;
    let order_product_updated_index =  (action == "next") ? order_product_active_index + 1 : order_product_active_index - 1;

    updated_product["id"] = self.updateOrderItemProducts.factory_products[order_product_active_index].id;
    updated_product["status"] = "submitted_for_factory_review";
    self.updateOrderItemProducts.factory_products[order_product_active_index] = updated_product
    let url = `/list/products?customized=${this.$store.getters.getCustomized}&personalized=${this.$store.getters.getPersonalized}`;
    this.updateOrderItemProducts["active_index"] = order_product_updated_index;
    url    += `&update_order_product_id=${self.updateOrderItemProducts.factory_products[order_product_updated_index].product_id}`;
    //await self.$store.dispatch("updateOrderItemProducts", {update_key: 'active_index', key_value: order_item_factory_product_index});
    await self.retrieveProducts(url);
  }

  async UpdateOrderProducts() {
    let self = this;
    let updated_product = await getActiveProductData();
    if(updated_product == null) {
      return false;
    }
    let order_product_active_index =  self.updateOrderItemProducts.active_index;
    let order_item_id = self.updateOrderItemProducts.order_item_id;
    updated_product["id"] = self.updateOrderItemProducts.factory_products[order_product_active_index].id;
    updated_product["status"] = "submitted_for_factory_review";
    self.updateOrderItemProducts.factory_products[order_product_active_index] = updated_product;
    let url = `order_item/${order_item_id}/update/products`;
    http.post(url, {factory_products: self.updateOrderItemProducts.factory_products}).then((res: any) => {
      if (res.data.success == true) {
        if(this.company.platform == 'wordpress') {
          window.location.href = `${this.company.company_domain}/my-account/orders`;
        } else {
          self.$router.push({name: "OrderDetail", params: { order_id: order_item_id }});
        }
      }
    }).catch(err => {
      this.showErrorArr(err.response.data.errors)
    });
  }

  private hideAll(){
    this.switchTabs(-1, true)
  }

  public hideOtherTab(){
    this.showOtherTab = false
  }

  private setMinMax = (idx: number) => {
    let element = document.querySelector('.customize_controls') as Record<any, any>;

    if(!element){
      let shadow_dom = (this.$root as Record<any,any>).$options.shadowRoot;
      element = shadow_dom.querySelector('.customize_controls') as Record<any, any>;
    }

    if(element.clientHeight <= (window.screen.availHeight/2)){
      element.style.top = 15 + 'px';
      element.classList.remove('setMax')
    }else{
      element.style.top = 'auto';
      element.classList.add('setMax')
    }
  }

  private resizeTab(idx: number){
    return (e:Record<any, any>) => {
      let cursorPosition = e.changedTouches[0].clientY;
      if(cursorPosition <= 15){
        cursorPosition = 15
      }else if(cursorPosition >= window.screen.availHeight - 190){
        cursorPosition = window.screen.availHeight - 190
      }
      this.playersDataHeight = cursorPosition;
      let element = document.querySelector('.customize_controls') as Record<any, any>;
      if(!element){
        let shadow_dom = (this.$root as Record<any,any>).$options.shadowRoot;
        element = shadow_dom.querySelector('.customize_controls') as Record<any, any>;
      }
      element.style.top = cursorPosition + 'px';
    }
  }

  private setPlayersDataHeight = (idx: number) => {
    return (e:Record<any, any>) => {
      let element = document.querySelectorAll('.customize_controls') as Record<any, any>;
    }
  }

  public get popperID() {
    return this.$store.getters.getPopperID
  }

  public showPopper(id:string){
    this.$store.commit('setPopper', id)
  }

  public hidePopper(){
    this.$store.commit('setPopper', '')
  }

  get roomWithProducts():Record<any, any>{
    const room = this.$store.getters.getLockerProducts
    return room
  }


  public async shareProduct(product: Record<any, any>, ind: number, i: number) {
    try {
      if(product){
        let payload = {
          type: 'locker',
          id: product.id,
          customer_id: this.customer.id ,
          product_id: this.selectedProduct.product_id
        }
        let shared_url = "";
        if (product.shared_url) {
          shared_url += product.shared_url;
        } else {
          let res = await this.$store.dispatch('shareProduct', payload);
          shared_url += res.data.url;
          Vue.set(this.getLockerProducts[i].product[ind], 'shared_url', shared_url)
          console.log(res)
        }

        this.showPopper('shareDesign');
      }
    } catch (error) {
      console.log(error)
    }
  }

  private async shareDesign(){
    if (this.editStatus || (this.lockerIndex >= 0 && this.lockerProductIndex !== undefined) && (this.undoItems.length > 0 || this.redoitems.length > 0)){
      await this.$store.dispatch('GET_LOCKER_PRODUCTS')
      this.product = this.roomWithProducts[this.lockerIndex].product[this.lockerProductIndex];
      this.shareProduct(this.product, this.lockerProductIndex, this.lockerIndex)
      this.hideVModal('locker-modal')
      // (this.ref['lockerModal'].$refs['lockerRoom'] as Record<any, any>).shareProduct(product, this.lockerProductIndex, this.lockerIndex)

    }else{
      this.shareDesignLoader = true;
      await (this.$refs['saveToLockerModal'] as Record<any, any>).shareDesignUrl(this.product);
      this.shareDesignLoader = false;

    }
  }
}
</script>

<style lang="scss" scoped>
.home-color-area {
  @media only screen and (min-width: 992px) {
    padding-bottom: 12rem !important;
    border-right: 1px solid #dee2e6;
  }
}
.logo-placement-area{
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  .logo-placement-holder{
    flex: 0 0 67%;
    max-width: 67%;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    @media only screen and (min-width: 992px){
      flex: 0 0 100%;
      max-width: 100%;
    }
  }
  .btn{
    flex: 0 0 30%;
    max-width: 30%;
    font-size: 12px;
    padding: 0.50rem;
    @media only screen and (min-width: 992px){
      flex: 0 0 100%;
      max-width: 100%;
      font-size: 14px;
      padding: 0.50rem 0.75rem;
    }
  }
  &.extracted-color-area{
    max-width: 300px;
    margin: 0 auto;
    .logo-holder{
      width: 60px;
      height: 60px;
      position: relative;
      border: 1px solid #EFF2F4;
      border-radius: 50%;
      overflow: hidden;
      @media only screen and (min-width: 992px){
        width: 75px;
        height: 75px;
      }
      .color-extract-container{
        width: 100%;
        height: 100%;
      }
      .color-box{
        width: 100%;
        height: 100%;
      }
    }
    .logo-placement-holder{
      @media only screen and (max-width: 992px){
        flex: 0 0 100%;
        max-width: 100%;
      }
    }
    .btn{
      flex: none;
      color: #03142E;
      &.use-btn{
        background: none;
        padding: 0 0 2px;
        margin: 0;
        border: none;
        border-bottom: 2px solid #F7FAFC;
        color: #808895;
        font-size: 14px;
        max-width: 35%;
        @media only screen and (min-width: 1024px){
          font-size: 13px;
        }
        @media only screen and (min-width: 1367px){
          max-width: 30%;
          font-size: 14px;
        }
        &:focus{
          outline: none;
          box-shadow: none;
          border: none;
        }
      }
      &.reset{
        background: none;
        color: #03142E;
        border: none;
        padding: 0;
        width: auto;
      }
      &:hover{
        @media only screen and (min-width: 1024px){
          color: #808895 !important;
        }
      }
    }
    .btn-save-color{
      color: #fff;
      @media only screen and (max-width: 992px){
        flex: 0 0 100%;
        max-width: 100%;
        margin-top: 20px;
      }
      &:hover{color: #219F84;}
    }
  }
}
//.customization-preview-process{
.undo-btn-area {
  .btn {
    color: #000;
    border-color: #DDDFE3;
    font-size: 12px;
    font-weight: 600;

    &:hover {
      color: #fff;
    }
  }
}
.preview-column{
  @media only screen and (min-width: 992px){border-right: 1px solid #dee2e6;}
}
.preview-area-header {
  margin: 0 -15px;
  padding: 26px 10px;
  border-bottom: 1px solid #EDF2F6;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  @media only screen and (min-width: 768px){padding: 26px 15px;}
  @media only screen and (min-width: 992px){
    min-height: 91px;
    background: none;
  }
  .btn {
    margin: 0 0.3rem 0 0;
    font-size: 12px;
    color: #000;
    border-color: #DDDFE3;
    border-radius: 5px;
    padding: 5px 7px;
    @media only screen and (min-width: 768px){
      padding: 5px 8px;
    }
    @media only screen and (min-width: 992px){
      font-size: 14px;
      font-weight: 600;
      margin: 0 15px 0 0;
      padding: 0.375rem 0.75rem;
    }
    &:last-child{margin: 0;}
    &:hover {
      color: #fff;
    }
    &#share{
      margin: 0;
    }
  }

  .preview-header-icons {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    font-size: 18px;
    list-style: none;
    //@media only screen and (min-width: 992px){font-size: 18px;}
    li {
      margin: 0 0 0 15px;
      position: relative;
      @media only screen and (min-width: 768px){margin: 0 0 0 12px;}
      .btn{
        margin: 0 0 0 10px;
        background: none;
        padding: 0;
        border: none;
        color: #03142e;
        font-size: 18px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        //@media only screen and (min-width: 768px){font-size: 18px;}
        .user-text{
          font-size: 12px;
          line-height: 16px;
          max-width: 62px;
          display: inline-block;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          margin: 0 5px 0 0;
        }
      }
      a{
        cursor: pointer;
        position: relative;
      }
      &:first-child{margin: 0;}
    }
    .user-name{
      font-size: 0.8rem;
      font-weight: 600;
    }
  }
  .buttons-preview{
    @media only screen and (max-width: 767px){
      flex: 0 0 100%;
      max-width: 100%;
      margin: 0 0 15px;
    }
  }
}

//}
.preview-section {
  overflow: hidden;
  max-width: 900px;
  margin: 0 auto;

  .image-holder {
    margin: 0 1%;
    flex: 0 0 48%;
    max-width: 48%;

    img {
      display: block;
      max-width: 100%;
      margin: 0 auto;
      height: auto;
    }
  }
}

.preview-area-customize {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  height: 60vh;
}
.change-product-area{
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 15px 0 0;
  h2{
    font-size: 1.25rem;
    font-weight: 600;
  }
  //.change-product-opener{
  //  width: 18px;
  //  height: 18px;
  //  position: relative;
  //  &:before{
  //    position: absolute;
  //    content: '';
  //    left: 2px;
  //    top: 6px;
  //    border: 6px solid transparent;
  //    border-top: 6px solid #fff;
  //  }
  //}

}
.customization-area{
  .preview-btn{
    position: absolute;
    left: 0;
    top: 20px;
    font-size: 0.7rem;
    @media only screen and (min-width: 768px){
      left: auto;
      right: 0;
      top: -30px;
      font-size: 1rem;
    }
    svg{margin-right: 5px;}
  }
  .two-d-btn{
    display: none;
  }
  .threeD-view{display: none;}
  .active{
    .threeD-view,
    .two-d-btn{
      display: block;
    }
    .twoD-view,
    .three-d-btn{
      display: none;
    }
  }

}
.backtohome-btn{
  position: fixed;
  left: 30px;
  bottom: 26px;
  background: rgba(33,159,132,0.8);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  color: #fff;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  z-index: 99;
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
  [v-cloak] {
    display: none !important;
  }
}

@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200&display=swap');





.icon {
  cursor: pointer;
  margin-right: 50px;
  line-height: 60px;
  &#bell{line-height: 1;}
}

.icon span {
  background: #f00;
  padding: 7px;
  border-radius: 50%;
  color: #fff;
  vertical-align: top;
  margin-left: -25px
}
.icon span.notification-counter{
  position: absolute;
  left: 100%;
  bottom: 100%;
  background: #DF4B37;
  color: #fff;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 10.5px;
  width: 16px;
  height: 16px;
  margin: 0 0 -8px -8px;
  padding: 0;
  box-shadow: 0 0 0 1px #fff;
  line-height: 1;
}

.icon img {
  display: inline-block;
  width: 26px;
  margin-top: 4px;
  background-color: purple;
}

.icon:hover {
  opacity: .7
}

.logo {
  flex: 1;
  margin-left: 50px;
  color: #eee;
  font-size: 20px;
  font-family: monospace
}

.notifications {
  width: 300px;
  height: 0px;
  max-height: 300px;
  opacity: 0;
  position: absolute;
  top: 63px;
  right: 0;
  border-radius: 0.5rem;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0,0,0,0.3);
  z-index: 99;
  overflow-x: hidden;
  overflow-y: auto;
}

.notifications h2 {
  font-size: 14px;
  padding: 10px 20px;
  border-bottom: 1px solid #eee;
  color: #2c3e50;
  text-align: left;
  font-weight: 600;
}

.notifications h2 span {
  color: #f00
}

.notifications-item {
  width: 100%;
  display: flex;
  border-bottom: 1px solid #eee;
  padding: 10px 18px;
  margin-bottom: 0px;
  cursor: pointer;
  color: #2c3e50;

  &:hover {
    background-color: #eee
  }

  img {
    display: block;
    width: 50px;
    height: 50px;
    margin-right: 9px;
    border-radius: 50%;
    margin-top: 2px
  }

  .text {
    width: 100%;
    gap: 12px;

    h4 {
      color: #777;
      font-size: 16px;
      margin-top: 3px
    }

    p {
      color: #2c3e50;
      font-size: 12px;
      text-align: left;

      &::first-letter{
        text-transform: uppercase;
      }
    }

    .date{
      font-size: 12px;

      .month{
        font-size: 0.8em;
      }
    }
  }
}

.dragControl{
  position: absolute;
  height: 13px;
  width: 100px;
  top: 7px;
  left: 0;
  right: 0;
  margin: 0 auto;
  background: #dbdbdb;
  border-radius: 10px;
  z-index: 10;
  box-shadow: 1px 1px 0 0px #ccc, inset 0 0 3px 1px #eee;
}
.dragControl.active{
  background: lightblue;
  box-shadow: 1px 1px 0 0px #ccc, inset 0 0 3px 1px aliceblue;
}
.selected-color{
  height: 15px;
  width: 15px;
  border-radius: 10000px;
  background: transparent;
  display: inline-block;
  box-shadow: 0px 1px 5px rgba(0,0,0,0.4);
}
.open-logo-uploader{
  top: auto !important;
}
.customize_controls{
  padding-bottom: 0 !important;
}

.mobile-reset{
  position: fixed;
  top: 50%;
  right: 0;
  z-index: 2;

  .btn{
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: normal;
    border-radius: 5px 0 0 5px;
  }
}
</style>
