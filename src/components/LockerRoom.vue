<template>
  <span>
    <div v-if="showLoader" class="loader">
      <img src="@assets/images/loading.gif" />
    </div>
    <div>
      <div v-if="main_locker_tabs === 0" style="max-width: 300px; width: 80%; flex-shrink: 1; padding-left: 4px; position: absolute; right: 5%">
         <b-input-group>
           <template #append>
             <b-input-group-text @click="searchText = ''" style="height: 33px; cursor: pointer"><strong class="text-secondary">X</strong></b-input-group-text>
           </template>
           <b-form-input type="text" style="height: 33px;" placeholder="Search" v-model="searchText" />
         </b-input-group>
       </div>
      <b-tabs class="main-locker-tabs" @input="updateTab" ref="main-locker-tabs" v-model="main_locker_tabs">
        <b-tab>
          <template #title>
            <span class="btn btn-secondary btn-sm">Locker Rooms</span>
          </template>
          <b-tabs nav-class="lockerroom_titles" class="locker-tabs" lazy content-class="mt-3" @changed="lockerChanged">
            <div v-if="getLockerProducts && getLockerProducts.length > 0">
            <template v-for="(room, i) in getLockerProducts">
            <span :key="`locker-room-${room.id}-${i}`">
              <b-tab lazy  @click="changeTabIndex(i)" :active="tabIndex === i">
              <template #title>
                <draggable ghostClass="locker-tab-ghost" :data-title="`${room.room_name}`" :group="{name: `locker-${i}`, pull: false, put: true}"
                           :data-room-id="room.id" :data-room-index="i"
                           @add="lockerProductsChanged($event, i)" v-bind="{animation: 250, delayOnTouchOnly: true, delay: 500}">
                  <span @click="changeColor" style="white-space: nowrap">{{ room.room_name }}</span>
                </draggable>
                <a v-if="!getSelectionMode.readonly" style="right: 13px" title="Rename locker" @click="renameLockerModal($event, room)" class="remove-tab theme-bg-color theme-color">
                  <b-icon-pencil-fill />
                </a>
                <a v-if="!getSelectionMode.readonly" class="remove-tab" @click="deleteRoom($event, room.id, i)">
                  <font-awesome-icon :icon="['fas', 'trash-alt']"/>
                </a>
              </template>
              <div class="lockerroom-tabs">
                <div>
                  <b-card no-body>
                    <div class="loader relative" v-if="viewLoader"><img src="@assets/images/loading.gif" /></div>
                    <b-tabs v-else card v-model="lockerActiveTabIndex" @changed="handleLockerRoomChanged" @input="handleTabChanged" :no-fade="true">
                      <b-tab v-if="!getSelectionMode.eventCollectionMode"  title="Products" draggable="false">
                        <draggable @start="dragStart" selectedClass="sortable-selected" :group="{name: 'people', pull: room.locker_pull_groups}"
                                   :value="[]" class="products-holder draggable grid mobile-cols-2 gap-4 grid-6"
                                   :multiDrag="true" @remove="designMoved"
                                   :forceFallback="true"
                                   handle=".image-holder"
                                   v-bind="{filter: '.custom-checkbox', animation: 250, delayOnTouchOnly: true, delay: 500}"
                                   @update="lockerProductsChanged($event)">
                          <template v-for="(product, ind) in room.product">
                            <div :key="`${ind}-${product.id}`" class="products-block" :class=" product.disable_style ? 'notactive' : ''" :data-room-id="room.id"
                                 :data-room-index="i" :data-design-title="product.product_name"
                                 :data-product-locker-room-id="product.id" :data-customer-id="product.customer_id"
                                 :data-product-index="ind">
                              <div class="fs-2">
                                Total products: <strong class="font-weight-bolder">{{product.roster_total_quantity ? product.roster_total_quantity : '0'}}</strong>
                              </div>
                              <label :key="ind" class="w-100 mt-1" :class="product.class ? 'selected': ''"
                                     @click="product.class == undefined ? product.class = false : null; product.class = !product.class">
                                <div class="image-holder">
                                  <div>
                                    <label class="custom-checkbox" @click="($event)=>$event.stopPropagation()" @dragstart="($event)=>$event.stopPropagation()">
                                      <input type="checkbox" v-model="selectedCollectionProducts" v-bind:value="product.id">
                                      <span></span>
                                    </label>

                                    <template v-if="room.active_tab || tabIndex === i">
                                      <div class="locker-image-holder">
                                        <img @dblclick="editProduct(room.id, product.id, ind)" v-if="!getSelectionMode.eventProductMode" :key="`${product.id}-${ind}-${product.is_back_img}`" v-lazy-image="`${storageUrl+product.product_url}?q=${product.random_string}`" :class="product.product_url ? '' : 'placeholder'" :alt="`${product.is_back_img ? 'back': 'front'}`">
                                        <img v-else @click="setEventProduct(product.id, product.product_front_url, product.product_name ) " :key="`${product.id}-${ind}-${product.is_back_img}`"  v-lazy-image="`${storageUrl+product.product_url}?q=${product.random_string}`" :class="product.product_url? '' : 'placeholder'" :alt="`${product.is_back_img ? 'back': 'front'}`">
                                    </div>
                                    </template>
                                  </div>
                                </div>
                              </label>

                              <div @click="($event)=>$event.stopPropagation()" class="d-flex align-items-center justify-content-center product-description gap-1 text-center">
                                <span class="cursor-pointer" @mouseenter="showTooltip" @mouseleave="hideTooltip"
                                      data-title="Rename" @click="setRenameLockerProductID(`${i + ind}${ind}`, product)"><b-icon-pencil-square /></span>
                                <p class="break-word">{{ product.product_name }}</p>
                              </div>

                            <ul class="product-icons">
                              <li v-if="!getSelectionMode.readonly">
                                <a style="font-size: 12px;" data-title="Delete design" class="remove" @click="deleteProduct(i, ind, product.id, product.collections)"
                                   @mouseleave="hideTooltip" @mouseenter="showTooltip"><font-awesome-icon
                                  :icon="['fas', 'trash-alt']" /></a>
                              </li>
                              <li v-if="!getSelectionMode.readonly">
                                <a style="font-size: 12px;" v-if="mobileScreen" data-title="Edit design" @click="editProduct(room.id, product, ind)"><font-awesome-icon :icon="['fas', 'edit']"/></a>
                                <a style="font-size: 12px;" v-else-if="isSafari" data-title="Edit design" @click="editProduct(room.id, product, ind)"><font-awesome-icon :icon="['fas', 'edit']"/></a>
                                <a style="font-size: 12px;" v-else data-title="Edit design" @click="editProduct(room.id, product, ind)" @mouseleave="hideTooltip"
                                   @mouseenter="showTooltip"><font-awesome-icon :icon="['fas', 'edit']"/></a>
                              </li>
                              <li v-if="!getSelectionMode.readonly" class="position-relative" style="z-index: 20;">
                                <b-button style="font-size: 12px;"  @mouseleave="hideTooltip" @mouseenter="showTooltip" data-title="Share design" :ref="'share'+i+''+ind" :id="'share'+i+''+ind"
                                          @click.stop="shareProduct(product, ind, i)"><font-awesome-icon
                                  :icon="['fas', 'share-alt']"/>
                                </b-button>

                                <aside :id="'share-popper-content'+i+''+ind" v-show="popperID == ('share'+i+''+ind)" :ref="'share-popper-content'+i+''+ind"
                                       :class="!opacityset ? 'opacity-0' : 'opacity-100'"
                                       v-click-outside-custom="hidePopper" class="tooltip b-tooltip bs-tooltip share-tooltip share-product-tooltip" :key="popperID">
                                  <div class="share-holder">
                                    <h3>Copy link and Share</h3>
                                    <div class="share-form">
                                      <b-form inline>
                                        <b-form-input @mouseenter="markText" :ref="'copylink_product_'+i +''+ind"
                                                      :value="product.shared_url !== 'undefined'  ?   product.shared_url : ''"

                                        ></b-form-input>
                                        <button @click="copyLink(i, ind)" class="btn" type="button">Copy Link</button>
                                      </b-form>
                                    </div>
                                  </div>
                                </aside>
                              </li>
                              <li v-if="!getSelectionMode.readonly">
                                <a style="font-size: 12px;"  @click="showDesignModal(product)" @mouseleave="hideTooltip" @mouseenter="showTooltip" data-title="Copy design">
                                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="copy" class="svg-inline--fa fa-copy" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M384 96L384 0h-112c-26.51 0-48 21.49-48 48v288c0 26.51 21.49 48 48 48H464c26.51 0 48-21.49 48-48V128h-95.1C398.4 128 384 113.6 384 96zM416 0v96h96L416 0zM192 352V128h-144c-26.51 0-48 21.49-48 48v288c0 26.51 21.49 48 48 48h192c26.51 0 48-21.49 48-48L288 416h-32C220.7 416 192 387.3 192 352z"></path></svg>
                                </a>
                              </li>
                              <li>
                                <a style="font-size: 12px;" data-title="Edit roster" @click="editRoster(product)"
                                   @mouseleave="hideTooltip" @mouseenter="showTooltip">
                                  <b-icon-list class="fs-3" />
                                </a>
                              </li>
                              <li>
                                <a style="font-size: 12px;" data-title="Download preview images" @click="downloadProductPreviewImages(i, ind)"
                                   @mouseleave="hideTooltip" @mouseenter="showTooltip">
                                  <b-icon-download class="fs-3" />
                                </a>
                              </li>
                              <li v-if="mobileScreen" class="swap">
                                <a  v-if="product.design && product.design.back_design_count > 0" :data-title="product.is_back_img ? 'Show front' : 'Show back' " @click="swapDesign(i, ind)" style="font-size: 1em">
                                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrows-rotate" class="svg-inline--fa fa-arrows-rotate fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 16c-17.67 0-32 14.31-32 32v74.09C392.1 66.52 327.4 32 256 32C161.5 32 78.59 92.34 49.58 182.2c-5.438 16.81 3.797 34.88 20.61 40.28c16.89 5.5 34.88-3.812 40.3-20.59C130.9 138.5 189.4 96 256 96c50.5 0 96.26 24.55 124.4 64H336c-17.67 0-32 14.31-32 32s14.33 32 32 32h128c17.67 0 32-14.31 32-32V48C496 30.31 481.7 16 464 16zM441.8 289.6c-16.92-5.438-34.88 3.812-40.3 20.59C381.1 373.5 322.6 416 256 416c-50.5 0-96.25-24.55-124.4-64H176c17.67 0 32-14.31 32-32s-14.33-32-32-32h-128c-17.67 0-32 14.31-32 32v144c0 17.69 14.33 32 32 32s32-14.31 32-32v-74.09C119.9 445.5 184.6 480 255.1 480c94.45 0 177.4-60.34 206.4-150.2C467.9 313 458.6 294.1 441.8 289.6z"></path></svg>
                                </a>
                              </li>
                              <li v-else-if="isSafari" class="swap">
                                <a v-if="product.design && product.design.back_design_count > 0" :data-title="product.is_back_img ? 'Show front' : 'Show back' " @click="swapDesign(i, ind)" style="font-size: 1em">
                                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrows-rotate" class="svg-inline--fa fa-arrows-rotate fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 16c-17.67 0-32 14.31-32 32v74.09C392.1 66.52 327.4 32 256 32C161.5 32 78.59 92.34 49.58 182.2c-5.438 16.81 3.797 34.88 20.61 40.28c16.89 5.5 34.88-3.812 40.3-20.59C130.9 138.5 189.4 96 256 96c50.5 0 96.26 24.55 124.4 64H336c-17.67 0-32 14.31-32 32s14.33 32 32 32h128c17.67 0 32-14.31 32-32V48C496 30.31 481.7 16 464 16zM441.8 289.6c-16.92-5.438-34.88 3.812-40.3 20.59C381.1 373.5 322.6 416 256 416c-50.5 0-96.25-24.55-124.4-64H176c17.67 0 32-14.31 32-32s-14.33-32-32-32h-128c-17.67 0-32 14.31-32 32v144c0 17.69 14.33 32 32 32s32-14.31 32-32v-74.09C119.9 445.5 184.6 480 255.1 480c94.45 0 177.4-60.34 206.4-150.2C467.9 313 458.6 294.1 441.8 289.6z"></path></svg>
                                </a>
                              </li>
                              <li v-else class="swap">
                                <a v-if="product.design && product.design.back_design_count > 0"  @mouseleave="hideTooltip" @mouseenter="showTooltip" :data-title="product.is_back_img ? 'Show front' : 'Show back' " @click="swapDesign(i, ind)" style="font-size: 1em">
                                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrows-rotate" class="svg-inline--fa fa-arrows-rotate fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 16c-17.67 0-32 14.31-32 32v74.09C392.1 66.52 327.4 32 256 32C161.5 32 78.59 92.34 49.58 182.2c-5.438 16.81 3.797 34.88 20.61 40.28c16.89 5.5 34.88-3.812 40.3-20.59C130.9 138.5 189.4 96 256 96c50.5 0 96.26 24.55 124.4 64H336c-17.67 0-32 14.31-32 32s14.33 32 32 32h128c17.67 0 32-14.31 32-32V48C496 30.31 481.7 16 464 16zM441.8 289.6c-16.92-5.438-34.88 3.812-40.3 20.59C381.1 373.5 322.6 416 256 416c-50.5 0-96.25-24.55-124.4-64H176c17.67 0 32-14.31 32-32s-14.33-32-32-32h-128c-17.67 0-32 14.31-32 32v144c0 17.69 14.33 32 32 32s32-14.31 32-32v-74.09C119.9 445.5 184.6 480 255.1 480c94.45 0 177.4-60.34 206.4-150.2C467.9 313 458.6 294.1 441.8 289.6z"></path></svg>
                                </a>
                              </li>
                            </ul>

                            <div :key="`rename-locker-${renameID}${i + ind}${ind}`" :class="renameID == `${i + ind}${ind}` ? 'd-flex' : 'd-none'"
                                 class="rounded-lg overflow-hidden position-absolute rename-locker-product" style="z-index: 100" :ref="`rename-locker-${i + ind}${ind}`">

                              <b-form-input class="fs-1 pr-1" v-model="current_product_name" :readonly="renameLoader" style="box-shadow: none; border: none; height: auto"></b-form-input>
                              <div class="d-flex">
                                <b-button class="px-2 py-1 fs-2 border-0 rounded-0" :disabled="renameLoader" @click="renameLockerProduct(product)">
                                  <b-icon-arrow-counterclockwise v-if="renameLoader" class="b-icon-animation-spin-reverse" />
                                  <b-icon-check v-else />
                                </b-button>
                                <b-button class="px-2 py-1 fs-2 border-0 rounded-0 close-rename" @click="()=>{renameID = '-1'}">
                                  <b-icon-x />
                                </b-button>
                              </div>
                            </div>
                          </div>
                          </template>
                        </draggable>

                      </b-tab>
                      <b-tab lazy v-if="!getSelectionMode.readonly" title="Assets" class="assets-file" draggable="false">
                        <div class="grid w-100 gap-2" style="grid-template-columns: repeat(auto-fill, 140px)">
                          <div :key="'asset'+inda" v-for="(logo, inda) in room.logos" class="position-relative align-self-stretch d-flex flex-column">
                            <div class="assets-logo-block h-100 w-100" style="background: rgba(0,0,0,0.12)">
                              <span class="d-flex h-100 w-100 align-items-center justify-content-center p-2" >
                                <img :src="storageUrl+logo.logo_url+'?nocache=1'" class="w-auto" />
                              </span>
                              <button @click="addToCustomLogos(logo)" class="use-logo-btn">Use</button>
                            </div>
                            <a :key="`delete_logo${inda}`" class="absolute btn small p-0 remove" @click="deleteLogo(i, logo.id, inda, room.id)">
                              <b-icon-x class="fs-2" />
                            </a>
                          </div>
                        </div>
                      </b-tab>
                      <b-tab lazy v-if="!getSelectionMode.readonly" title="Colors" draggable="false">
                        <div class="d-flex flex-wrap justify-content-between lockerroom-color-folders">
                          <div class="pt-lg-2 folder-wrapper">
                            <h3 class="w-100 d-block mb-3 mb-lg-4 text-bold text-left">Select Folder</h3>
                            <div class="d-flex flex-wrap color-folder-holder">
                              <template v-for="(folder, inde) in room.folders">
                                <a href="#" class="text-center d-block" @click="fetchColors($event, inde, i)" :key="inde">
                                  <font-awesome-icon :icon="['fas', 'folder']"/>
                                  <span class="folder-name d-block">{{ folder.folder_name }}</span>
                                </a>
                              </template>
                            </div>
                          </div>
                          <div class="color-holder" v-if="colors">
                            <div class="color-container">
                              <template v-for="(item, ix) in colors">
                                <div :key="`item_${ix}`" v-if="item.value">
                                  <div class="color-box" :title="item.pantone? item.pantone: item.name"
                                       :style="{backgroundColor: item.value}" :key="`${ix}`">
                                  </div>
                                  <span> {{ item.pantone? item.pantone: item.name }} </span>
                                </div>
                              </template>
                            </div>
                          </div>
                        </div>
                      </b-tab>
                      <b-tab lazy v-if="!getSelectionMode.readonly && locker_with_rosters(room.id).length" title="Rosters" draggable="false">
                        <div class="d-flex text-left justify-content-start locker-rosters">
                          <div style="width: max(20%, 250px)" class="bg-light border-right flex-shrink-0">
                            <div class="fs-3" style="background: #495057; color: #fff; padding: 11px 16px">Select Design</div>
                            <ul>
                              <li class="px-3 py-2 d-flex align-items-center gap-1" :class="{'border-top': design_i>0, 'active': design_i == lockerActiveDesignIndex}"
                                  @click="()=>lockerActiveDesignIndex = design_i"
                                  v-for="(design, design_i) in locker_with_rosters(room.id)[0].products" :key="`locker_design_${design_i}`">
                                <span class="btn btn-secondary btn-sm rounded-circle flex-shrink-0" title="Edit Roster"
                                      @click.stop="editProduct(room.id, product_with_rosters(room.product, design.id), design_i, '', true, {target: 'locker-room', activeLocker: tabIndex, lockerActiveTabIndex: lockerActiveTabIndex, lockerActiveDesignIndex: design_i})">
                                  <b-icon-pencil class="fs-2" />
                                </span>
                                <span>{{ design.product_name }}</span>
                              </li>
                            </ul>
                          </div>
                          <div style="width: 100%">
                            <template v-for="(roster, roster_i) in locker_with_rosters(room.id)[0].products">
                              <b-table v-if="roster_i == lockerActiveDesignIndex" hover :key="`roster_${roster_i}`" :items="roster.product_roster_detail | getProps"></b-table>
                            </template>
                          </div>
                        </div>
                      </b-tab>
                      <b-tab lazy :ref="`yearlyTab${room.id}`" draggable="false" @click="clickYearlyTab($event,room.id)" v-if="!getSelectionMode.readonly && customerPermissions.includes('Yearly-Planner')"  title="Yearly Planner" class="designCollections">
                        <div class="products-holder grid gap-5 mobile-cols-6 grid-12">
                          <template>
                            <div v-if="!room.have_yearly_planner">
                                <b-button variant="secondary" style="float: left" @click="createYearlyPlanner(room.id,i)">Create Yearly Planner</b-button>
                                <b-form-select style="display:inline-block; float:left; width: 30%; margin-left: 10px" @change="copyYearlyPlannerEvents($event,room.id,i)" v-model="yearly_planner_template_id"  :options="getYearlyPlannerTemplateOptions"
                                ></b-form-select>
                            </div>
                            <div v-else>
                              <YearlyPlanner @edit-event="editEvent"
                                             @init-event-contacts="initEventContacts"
                                             @open-event-modal="openEventModal"
                                             @getLockerEvents="getLockerEvents(room.id)"
                                             @show-contact-modal="showContactPopup"
                                             :room_id="room.id" :room_index="i" :key="room.id"
                              >
                                <template slot="actions">
                                  <b-button class="mr-3 light" variant="danger" @click="deletePlanner(room.id,i)">Delete Planner</b-button>
                                  <button class="btn mr-3 light btn-secondary" @click="getIcsFile(room.id,i)">Export to Outlook</button>
                                </template>
                              </YearlyPlanner>
                            </div>
                          </template>
                        </div>
                       </b-tab>
                      <b-tab lazy v-if="!getSelectionMode.readonly" title="Storyboard" @click="showStoryBoard($event,room)"></b-tab>
                    </b-tabs>
                  </b-card>
                </div>
              </div>
            </b-tab>
            </span>
          </template>
            </div>
            <span v-else>No lockers or designs match with your search</span>


            <CreateLockerRoomModal ref="create-modal" @lockerAdded="lockerAdded"/>
            <ExistingCollectionModal ref="existing-collection-modal" @existingCollection="existingCollection"/>
            <EventModal ref="eventmodal" @change-locker-tabindex="changeLockerTabIndex" @yearlyPlannerTab="yearlyPlannerTab"   />
            <ContactModal ref="contactmodal"   />
          </b-tabs>
        </b-tab>
        <b-tab @click="getCollectionData" lazy v-if="(!getSelectionMode.readonly) || (getSelectionMode.readonly && getSelectionMode.eventCollectionMode)"
               class="designCollections">
          <template #title>
            <span class="btn btn-secondary btn-sm">Collections</span>
          </template>
          <div class="loader relative" v-if="viewLoader"><img src="@assets/images/loading.gif" /></div>
          <div class="products-holder collection grid gap-5 mobile-cols-2 grid-6">
            <template v-if="getCollections.length > 0">
              <template v-for="(collection, index) in getCollections">
              <div :key="index" @click="getSelectionMode.eventCollectionMode ? setEventCollection(index) : null" class="products-block" :style="getSelectionMode.eventCollectionMode ? 'cursor:pointer' : 'cursor:move' ">
                <div class="image-holder">
                  <div class="convas_container" :key="collection_product_index"
                       v-for="(collection_product,collection_product_index) in collection.collection_products">
                    <template v-if="collection_product_index < 3">
                      <img :src="storageUrl+collection_product.product_locker_room.product_url+'?q='+collection_product.product_locker_room.random_string"
                           :class="collection_product.product_locker_room.product_url ? '' : 'placeholder'" loading=""
                           alt="">
                    </template>
                  </div>

                  <div class="controls" v-if="!getSelectionMode.readonly">
                    <a v-b-tooltip.hover.right title="Delete collection"
                       @click="deleteCollection(collection.id,index)" class="remove btn">
                      <font-awesome-icon :icon="['fas', 'trash-alt']"/>
                    </a>
                    <a v-b-tooltip.hover.right title="Edit collection" @click="editCollection(collection.id)"
                       class="btn light btn-secondary rounded-circle"><font-awesome-icon
                      :icon="['fas', 'edit']"/></a>
                    <b-button title="Share collection" :id="'share-collection'+index" @click.stop="shareCollectionLink(collection, index)"
                              :ref="'share-collection'+index" class="light rounded-circle"
                              custom-class="share-tooltip"><font-awesome-icon
                      :icon="['fas', 'share-alt']"/></b-button>
                      <aside :id="'popper-content'+index" v-show="popperID == 'share-collection'+index" :ref="'popper-content'+index"
                             :class="!opacityset ? 'opacity-0' : 'opacity-100'"
                             v-click-outside-custom="hidePopper" class="tooltip b-tooltip bs-tooltip share-tooltip share-collection-tooltip" :key="popperID">
                        <div class="share-holder">
                          <h3>Copy link and Share</h3>
                          <div class="share-form">
                            <b-form inline>
                              <b-form-input :ref="'copylink_'+index" @mouseenter="markText"
                                            :value="collection.shared_url !== 'undefined'   || collection.shared_url != null ?  collection.shared_url : ''"
                              ></b-form-input>
                              <b-button variant="primary" @click="copyCollectionLink(index)">Copy Link</b-button>
                            </b-form>
                          </div>
                        </div>
                      </aside>
                      <b-button title="download collection pdf" @click="downloadCollectionPdf(collection.id)" class="light rounded-circle">
                        <b-icon-download></b-icon-download>
                      </b-button>
                    <template v-if="customerPermissions.includes('create-shopify-collection')">
                        <b-button v-if="!collection.ecommerce_collection_id"
                                  :title="isExportingCollection(collection.id) ? 'Exporting..' : 'Export to Shopify'"
                                  @click="addShopifyCollection(collection.id, index)"
                                  :class="['light', 'rounded-circle']"
                                  :disabled="isExportingCollection(collection.id)">
                            <font-awesome-icon
                              :icon="isExportingCollection(collection.id) ? ['fas', 'spinner'] :
                                     (collection.ecommerce_collection_id ? ['fas', 'sync'] : ['fas', 'file-export'])" />
                        </b-button>
                    </template>

                  </div>
                </div>
                <div class="d-none d-lg-block product-description text-center">
                  <p>{{ collection.name }}</p>
                </div>
                <CollectionPDF :ref="'collection_'+index" :collection="collection"/>
              </div>
            </template>
            </template>
            <template v-else><p>No Collection Exists</p></template>
          </div>
        </b-tab>
      </b-tabs>
    </div>

    <confirm-modal
      :message="confirmMessage"
      :cancel_text="cancelButtonText"
      :confirm_text="confirmButtonText"
      ref="reset-confirm-modal"
      name="reset-confirm-modal"
    ></confirm-modal>

    <span class="hover_tooltip" ref="hoover_tooltip"></span>
    <modal ref="copy-product-modal" name="copy-product-modal" hide-footer @closed="resetModal" class="lockerroom-modal " id="modal-center-copydesign" :scrollable="true" size="xl">
      <div class="modal-header d-flex justify-content-between">
        <span class="fs-3 font-weight-bold">Copy Design</span>
        <span class="fs-4 font-weight-bold cursor-pointer modal-close" @click="hideVModal('copy-product-modal')"><BIconX /></span>
      </div>
      <div class="modal-body">
        <div class="pt-4 design-name-form">
            <div>
              <div class="d-flex align-items-end gap-2 justify-content-between">
                <div class="w-100 d-block">
                  <label class="w-100 d-block">Name of Design</label>
                  <b-input-group>
                        <b-form-input v-model="copiedProductName" class="mt-1 w-100" placeholder="Design Name"></b-form-input>
                    </b-input-group>
                </div>

                <div class="w-100 d-block">
                    <label class="w-100 d-block">Copy to locker</label>
                    <b-form-select  v-model="copiedProductLockerId" class="mt-1 w-100" :options="lockers" value-field="id"
                                    text-field="room_name"></b-form-select>
                  </div>

                <div class="w-auto">
                  <b-button variant="primary" class="w-100" @click="copyProductDesign">Copy</b-button>
                </div>
              </div>
            </div>

          <div class="loader relative" v-if="viewLoader"><img src="@assets/images/loading.gif" /></div>
        </div>
      </div>
    </modal>

    <modal ref="rename-locker-modal" name="rename-locker-modal" hide-footer class="lockerroom-modal " :scrollable="true" size="xl">
      <div class="modal-header d-flex justify-content-between">
        <span class="fs-3 font-weight-bold">Rename locker</span>
        <span class="fs-4 font-weight-bold cursor-pointer modal-close" @click="hideVModal('rename-locker-modal')"><BIconX /></span>
      </div>
      <div class="modal-body">
        <div class="pt-4 design-name-form">
            <div>
              <div class="d-flex align-items-end gap-2 justify-content-between">
                <div class="w-100 d-block text-left">
                  <label class="w-100 d-block">Locker name</label>
                  <b-input-group>
                        <b-form-input v-model="newLockerName" class="mt-1 w-100" placeholder="Enter new name"></b-form-input>
                    </b-input-group>
                </div>

                <div class="w-auto d-flex gap-1">
                  <b-button variant="secondary" class="w-100" @click="renameRoomName">Rename</b-button>
                  <b-button variant="secondary" class="w-100 light" @click="hideVModal('rename-locker-modal')">Cancel</b-button>
                </div>
              </div>
            </div>

          <div class="loader relative" v-if="renameLoader"><img src="@assets/images/loading.gif" /></div>
        </div>
      </div>
    </modal>
    <EditRosterDetails ref="editrostermodal" @roster-updated="updateProductCount" :lockers="lockers_and_rosters" :locker_id="locker_roster_id" />
  </span>
</template>

<script lang="ts">
import {Component, Mixins, Prop, Vue, Watch} from 'vue-property-decorator'
import CreateLockerRoomModal from '@/components/CreateLockerRoomModal.vue'
import ExistingCollectionModal from '@/components/ExistingCollectionModal.vue'
import YearlyPlanner from '@/components/YearlyPlanner.vue'
import EventModal from "@/components/EventModal.vue";
import ErrorMessages from "@/mixins/ErrorMessages";
import Scene from "@/components/Scene.vue";
import draggable from "vuedraggable";
import {http} from "@/httpCommon";
import ConfirmModal from "@/components/ConfirmModal.vue";
import {
  getRandom,
  classObserver,
  handleResponseException,
  getDomDocument,
  getEditModeDefaultObj, exitFromEditMode, urlToBase64, downloadNodeCollectionPDF, startExportStatusChecker
  ,getSelectedProductPantones,getColorType,base64ToFile, fetchUrlContent, parseSvgStringFileFromSource,
  getAllSvgGroups, containsObject, getAllSvgGroupsFor3D
} from "@/helpers/Helpers";
import {differenceBy, intersectionBy, union, includes, findIndex} from 'lodash';
import {
  LockerProducts,
  handleMainProducts,
  exitEditMode,
  ProductsQueryParamsMixin,
  CollectionMixin,
  cartModalData
} from "@/mixins/LockerProduct";
import ContactModal from "@/components/ContactModal.vue";
import { Popper } from 'popper-vue'
import 'popper-vue/dist/popper-vue.css'
import ModalAction from "@/mixins/ModalAction";
import {AxiosError} from "axios";
import EditRosterDetails from "@/components/EditRosterDetails.vue";
import CollectionPDF from "@/components/CollectionPDF.vue";
import lazyImage from '@/directives/lazyImage.js';
import {fabric} from 'fabric';
import {getClosestColor} from '@/pantoneColor'
import rgbHex from 'rgb-hex'


interface FactoryProduct {
  id: string;
  product_id: number;
  style_id: number;
  design_id: number;
  product_custom_texts: any[];
  custom_logos: any[];
  defaultcolors: any[];
  groupcolors: Record<string, any>;
  product_roster_detail: any[];
  shuffle_color_number: number;
  group_patterns: Record<string, any>;
  factory_id?: number;
  factory_products?: FactoryProduct[];
  factory_product_active_index?: number;
  addons?: {
    addon_id: number;
    addon_ecommerce_product_id?: number;
    addon_ecommerce_variant_id?: number;
  }[];
  grouped_addons?: Record<string, {id: number}>;
  ungrouped_addons?: {addon_id: number}[];
  is_custom_product?: boolean;
}


@Component<LockerRoom>({
  components: {
    CollectionPDF,
    EditRosterDetails,
    ConfirmModal,
    Scene,
    CreateLockerRoomModal,
    ExistingCollectionModal,
    YearlyPlanner,
    EventModal,
    ContactModal,
    Popper,
    draggable
  },
  directives: {
    lazyImage
  },
  mounted() {
    const doc = getDomDocument() as Record<any, any>;
    doc.addEventListener('click', this.onClickOutside);
    let href: any = location.href;
    href = href.split('#')
    this.collection_base_url = `${href[0]}`

    if (this.lockers.length >0 ){
      this.copiedProductLockerId = this.lockers[0].id
    }

    const lockerTabs = this.$el.querySelector('.locker-tabs .lockerroom_titles') as Record<any, any>;

    if(lockerTabs){
      setTimeout(()=>{
        const allElems:Record<any, any> = [];
        lockerTabs.querySelectorAll('.nav-item').forEach((el:Record<any, any>, ind:number) => {
          if(lockerTabs.querySelectorAll('.nav-item').length !== ind+1){
            allElems.push(el.querySelector('div'))
          }
        });
        classObserver(allElems, this.triggerDropping)
      }, 500)
    }

    this.$emit('lockerModalOpened', ()=>{this.getLockerProductsRosters()})
  },
  beforeDestroy() {
    const doc = getDomDocument() as Record<any, any>;
    doc.removeEventListener('click', this.onClickOutside);
  },
  destroyed() {
    const lockerTabs = this.$el.querySelector('.locker-tabs .lockerroom_titles') as Record<any, any>;

    if(lockerTabs){
      setTimeout(()=>{
        const allElems:Record<any, any> = [];
        lockerTabs.querySelectorAll('.nav-item').forEach((el:Record<any, any>, ind:number) => {
          if(lockerTabs.querySelectorAll('.nav-item').length !== ind+1){
            allElems.push(el.querySelector('div'))
          }
        });
        classObserver(allElems, this.triggerDropping, true)
      }, 500)
    }
  },
  filters: {
    getProps(value:Record<any, any>){
      const data:Record<any, any> = []
      value.forEach((val:Record<any, any>)=>{
        data.push({name: val.text, number: val.number, size: val.size, quantity: val.quantity})
      })
      return data;
    }
  },
  computed:{
    isExportingCollection() {
      return (id: number) => {
        return this.getExportingCollections.some((collection: { id: number }) => collection.id === id);
      };
    }
  }
})
export default class LockerRoom extends Mixins(ErrorMessages, LockerProducts, handleMainProducts, ModalAction, exitEditMode, ProductsQueryParamsMixin, CollectionMixin, cartModalData) {
  @Prop({required: true}) opacityset:boolean
  @Prop() products_fonts!: Record<string, any>[];
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  private baseUrl = location.host + "/#/"
  public ref = this.$refs as Record<any, any>
  public colors: [] = []
  public confirmMessage = 'Do you really want to delete?'; // Default message
  public confirmButtonText = 'Yes'; // Default confirm button text
  public cancelButtonText = 'Cancel'; // Default cancel button text
  public viewLoader = false
  public renameLoader = false
  public copiedProductId = 0
  public copiedProductName = ''
  public newLockerName = ''
  public copiedProductLockerId = 0
  public url = ''
  public group = ''
  public current_product_name = ''
  public main_locker_tabs = 0
  public renameID = '-1';
  public collection_available = false;
  public lockerActiveTabIndex = 0;
  public lockerActiveDesignIndex = 0;
  public collection_base_url = ''
  public lockers_and_rosters = []
  public design_moved_to_locker = ''
  public yearly_planner_template_id = null;
  public isSafari = (navigator.userAgent.toLowerCase().indexOf('safari') != -1) && !(navigator.userAgent.toLowerCase().indexOf('chrome') > -1)
  public renameRef = "";
  public lockerToRename: Record<any, any> = {};
  public locker_roster_id: number = 0
  public showLoader = false
  public filtered_locker_products = [];
  public localLockers: Record<any, any> = [];



private async formatProductForCart(product: any): Promise<any> {

  const groupColors = JSON.parse(product.groupcolors) || {};
  const customLogos = JSON.parse(product.custom_logos) || [];
  const defaultColors = JSON.parse(product.defaultcolors) || [];
  const productCustomTexts = product?.text || [];
  const productAttribute = JSON.parse(product?.product_attribute) || {};
  const productCustomTextsObjects = await this.formatRosterTextObjects(product);
  const productRosterDetail = product.product_roster_detail || [];
  const svgGroups = product.is_3d_product ?  await getAllSvgGroupsFor3D(product): await getAllSvgGroups(product);
  const svgParts = product.svg_parts || [];
  // Generate factory product ID
  const factory_product_id = `F18J${Date.now()}${getRandom(4, 'alpha_numeric')}`;

  // Upload assets first
  const post_data = {
    quote: false,
    admin_salesrep_id: null,
    factory_product: {
      // Basic product info
      //id: `F18J${Date.now()}${getRandom(4, 'alpha_numeric')}`,
      product_id: product.product_id,
      style_id: product.style_id,
      design_id: product.design_id,
      product_type: product.product_type,
      product_name: product.product_name,
      measurement_ratio: product.measurement_ratio || 0.132,

      // SVG Production Data - Missing in our current implementation
      // SVG data
      svg_groups: svgGroups,
      svg_parts: svgParts,
      svg_content: product.svg_content || '',

      // Images with proper URLs
     // Use uploaded asset URLs
       front_image: null,
        back_image: null,
      svg_url: null,

      production_url: product.design.production_design?.file_url
        ? `${process.env.VUE_APP_STORAGE_URL}${product.design.production_design.file_url}.svg`
        : null,
      pdf_file: null,

      // Complete Color Info
      defaultcolors: defaultColors,
      groupcolors: groupColors,
      colors: product.colors || [],
      color_groups: product.color_groups || {},
      color_info: product.color_info || {},
      color_patterns: product.color_patterns || {},

      // Logo data - use actual saved data
      custom_logos: customLogos,
      fixed_logo_index: product.fixed_logo_index || 0,
      custom_logo_svgs: product.custom_logo_svgs || [],
      logo_colors: product.logo_colors || [],

      // Text Data
      product_custom_texts: productCustomTexts,
      product_custom_text_objects: {
        roster: Object.values(productCustomTextsObjects).filter(obj => typeof obj === 'object' && !Array.isArray(obj)),
        common: productCustomTextsObjects.common || []
      },

      // Model and SKU Info - Missing in our implementation
      model_description: product?.product?.sku?.description,
      sku_number: product?.product?.sku?.sku_number,
      sizechart_reference: product?.product?.sku?.sizechart_reference,
      minimum_order_quantity: product?.product?.sku?.minimum_order_quantity,
      minimum_order_quantity_type: product?.product?.sku?.minimum_order_quantity_type,

      // Complete Product Info
      product_roster_detail: productRosterDetail ,
      style_name: product.style.name,
      product_display_name: product.product_display_name,

      // Price Info
      product_price_object: {
        product_price: product?.sku?.skucurrency[0]?.pivot?.price || 0,
        currency_code: product?.sku?.skucurrency[0]?.code,
        currency_symbol: product?.sku?.skucurrency[0]?.symbol,
        quantity: productRosterDetail.reduce((acc: number, detail: any) => acc + (detail.quantity || 0), 0),
      },

      // Ecommerce Data
      ecommerce_post_id: product?.ecommerceproduct?.ecommerce_post_id || '',
      ecommerce_variant_id: product?.ecommerceproduct?.ecommerce_variant_id || '',
      ecommerce_modifier_id: product?.ecommerceproduct?.ecommerce_modifier_id || '',
      ecommerce_cart_id: product?.ecommerceproduct?.ecommerce_cart_id || null,
      sync_id: product?.ecommerceproduct?.sync_id || '',
      size_variants_mapping: product?.ecommerceproduct?.size_variants_mapping || null,

      // Addons and Patterns
      addons: productAttribute?.addons || [],
      grouped_addons: productAttribute?.grouped_addons || {},
      ungrouped_addons: productAttribute?.ungrouped_addons || [],
      group_patterns: productAttribute?.group_patterns || {},
      shuffle_color_number: productAttribute?.shuffle_color_number || 1,

      factory_product_active_index: 0,

      // Flags and metadata
      is_custom_product: false,
      reorder_data: null
    }
  };
  let pUrl: string = product.design.production_design?.file_url
        ? `${process.env.VUE_APP_STORAGE_URL}${product.design.production_design.file_url}.svg`
        : '';
  const svg_content = await fetchUrlContent(pUrl);
  const production_file = await parseSvgStringFileFromSource(svg_content, post_data.factory_product);
  product.svg_content = production_file;

  const uploadedAssets = await this.uploadCartAssets(product, factory_product_id);
  post_data.factory_product.front_image = uploadedAssets.front_image;
  post_data.factory_product.back_image = uploadedAssets.back_image;
  post_data.factory_product.svg_url = uploadedAssets.svg_url;
  return post_data;
}

private async formatRosterTextObjects(
  product: any
): Promise<any> {
  const rosterObjects: any = {};
  const productCustomTexts = product?.text || [];
  if (!product.product_roster_detail || !productCustomTexts) return {};

  product.product_roster_detail.forEach((detail: any, rosterIndex: number) => {
    const text_object: any = {
      name: {
        label: '',
        placement: '',
        font_family: '',
        items: []
      },
      number: {
        label: '',
        placement: '',
        font_family: '',
        items: []
      }
    };

    const common: any[] = [];

    productCustomTexts.forEach((custom_text: any) => {
      let font = this.products_fonts[custom_text.font_family] || this.products_fonts[Object.keys(this.products_fonts)[0]];
      if (!font || !font.opentype_font) return;

      let path: any = {};
      let text_for_test_char = '';

      if (custom_text.is_first_name) {
        text_for_test_char = detail.text;
        path = detail.text ? font.opentype_font.getPath(detail.text) : {};
      } else if (custom_text.is_first_number) {
        text_for_test_char = detail.number;
        path = detail.number ? font.opentype_font.getPath(detail.number) : {};
      } else if (rosterIndex === 0) {
        text_for_test_char = custom_text.value;
        path = custom_text.value ? font.opentype_font.getPath(custom_text.value) : {};
      }

      if (!path || !Object.keys(path).length || !Array.isArray(custom_text.items)) return;

      custom_text.items.forEach((item: any) => {
        if (!item.selected) return;

        path.fill = item.color;
        if (parseInt(item.outline_width) > 0) {
          path.stroke = item.outline_color;
        }
        path.strokeWidth = parseInt(item.outline_width);

        const bbox = path.getBoundingBox();
        const ascender = Math.abs(bbox.y1);
        const descender = Math.abs(bbox.y2);

        const width = bbox.x2 - bbox.x1 + parseInt(item.outline_width);
        const height = ascender + descender + parseInt(item.outline_width);

        const svgString = path.toSVG();
        const parser = new DOMParser();
        const svgElement = parser.parseFromString(svgString, "text/html").body.firstChild as SVGElement;

        // Padding
        const paddingTop = 5, paddingLeft = 5, paddingRight = 5, paddingBottom = 5;
        const totalHeight = height + paddingTop + paddingBottom;
        const totalWidth = bbox.x2 - bbox.x1 + paddingLeft + paddingRight;

        const translateX = -bbox.x1 + paddingLeft;
        const translateY = ascender + parseInt(item.outline_width) / 2 + paddingTop;

        svgElement.setAttribute('transform', `translate(${translateX} ${translateY})`);
        svgElement.setAttribute('width', totalWidth.toString());
        svgElement.setAttribute('height', totalHeight.toString());
        svgElement.setAttribute('paint-order', 'stroke');
        svgElement.setAttribute('stroke-location', 'outside');

        const svg_with_tag = `<?xml version="1.0" encoding="utf-8"?>\n` +
          `<svg stroke-location="outside" paint-order="outside" style="width:100%; height: auto;" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xml:space="preserve" viewBox="0 0 ${totalWidth} ${totalHeight}">\n${svgElement.outerHTML}\n</svg>`;

        const converted_width = this.unitConversion((width * item.scaleX) * product.measurement_ratio);
        const converted_height = this.unitConversion((height * item.scaleY) * product.measurement_ratio);
        const outline_width = this.unitConversion((item.outline_width * item.scaleX) * product.measurement_ratio);

        const text_color_info = {
          hex: item.color,
          name: item.color_pantone,
          pantone: item.color_pantone
        };

        const text_item_object = {
          label: item.label,
          placement: item.placement,
          width: converted_width.value,
          height: converted_height.value,
          unit: converted_height.unit,
          svg: svg_with_tag,
          color: [text_color_info],
          svg_height: height.toString(),
          outline_color: item.outline_color,
          outline_color_pantone: item.outline_color_pantone,
          outline_width: outline_width.value,
          original_height: (height * item.scaleY) / product.measurement_ratio,
          original_width: (width * item.scaleX) / product.measurement_ratio,
          rotation: item.rotation,
          scaleX: item.scaleX / product.measurement_ratio,
          scaleY: item.scaleY / product.measurement_ratio,
          width_px: width,
          height_px: height
        };

        if (custom_text.is_first_name) {
          text_object.name.label = custom_text.label;
          text_object.name.placement = custom_text.placement;
          text_object.name.font_family = custom_text.font_family;
          text_object.name.items.push(text_item_object);
        } else if (custom_text.is_first_number) {
          text_object.number.label = custom_text.label;
          text_object.number.placement = custom_text.placement;
          text_object.number.font_family = custom_text.font_family;
          text_object.number.items.push(text_item_object);
        } else if (rosterIndex === 0 && custom_text.value) {
          common.push({
            label: custom_text.label,
            placement: custom_text.placement,
            value: custom_text.value,
            font_family: custom_text.font_family,
            items: [text_item_object]
          });
        }
      });
    });

    rosterObjects[rosterIndex] = {
      size: detail.size,
      quantity: detail.quantity,
      name: text_object.name,
      number: text_object.number
    };

    if (rosterIndex === 0) {
      rosterObjects.common = common;
    }
  });
  return rosterObjects;
}


public async addBulkToCart(selectedProducts: any[]) {
  const successProducts: any[] = [];
  const failedProducts: any[] = [];

  try {
    this.$store.commit('SET_CART_LOADING', true);

    // Get selected products
    const productsToAdd = this.getSelectedProducts();

    let totalProducts = productsToAdd.length;
    let i = 0;
    for (const product of productsToAdd) {
      try {
        this.showToast(`Adding ${product.product_name} to cart (${++i}/${totalProducts})`, 'info', 5000);

        // Format product for cart with all required data
        const cartData = await this.formatProductForCart(product);
        if(!cartData) {
          setTimeout(() => {
            this.showToast(`Could not add ${product.product_name} to the cart. ${response.data.message}.`, 'error');
          }, 3000);
        }
        // Make direct API call to add to cart
        const response = await http.post('carts', cartData);

        if (response?.data?.success) {
          this.$store.dispatch('addToCart', response.data.result.items);
          this.showToast(`Successfully added ${product.product_name} to the cart.`, 'success');
          //Show animation for adding to cart //Disabled for now
          //this.addToCartAnimation(cartData.factory_product.front_image, cartData.factory_product.back_image);
          successProducts.push(product);
        } else {
          setTimeout(() => {
            this.showToast(`Could not add ${product.product_name} to the cart. ${response.data.message}.`, 'error');
          }, 3000);
          failedProducts.push({
          product,
            error: response.data.message
          });
        }
      } catch (error) {
        setTimeout(() => {
            this.showToast(`Error cocurred.Could not add ${product.product_name} to the cart.`, 'error');
          }, 3000);
        failedProducts.push({
          product,
          error: error.message
        });
      }
    }

    if (successProducts.length > 0) {
      this.viewLoader = false;
      this.showToast(`Added ${successProducts.length} products to cart.`, 'success');
      // Clear selections after successful add
      this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS', {
        attribute: "locker_products",
        value: []
      });
    }

  } finally {
    this.$store.commit('SET_CART_LOADING', false);
  }

  return { success: successProducts, failed: failedProducts };
}

// Get selected products helper
private getSelectedProducts(): any[] {
  const selectedProducts = this.getLockerProducts
    .flatMap(locker => locker.product)
    .filter(product => this.selectedCollectionProducts.includes(product.id));
  return selectedProducts;
}


private async uploadCartAssets(product: any, factory_product_id: string): Promise<any> {
  try {
    let companyId = product.company_id;
    let factoryId = product.product.factory_id;
    let customerId = product.customer_id;
    let frontBase64 = '';
    let backBase64 = '';
    let base_path = `company_${companyId}/${companyId}/cart/${customerId}`;
    if(factoryId) {
      base_path = `${base_path}/${factoryId}`;
    } else {
      base_path = `${base_path}/shareable`;
    }
    const cart_assets_promises: Promise<any>[] = [];
    // Handle front image
    if (product.product_front_url) {
      const frontImageBase64 = await urlToBase64(product.product_front_url);
      frontBase64 = frontImageBase64[0];
      const front_image_info: any = base64ToFile(frontImageBase64[0], true);

      const formDataFrontImage: FormData = new FormData();
      formDataFrontImage.append('file', front_image_info);
      formDataFrontImage.append('base_path', `${base_path}`);
      cart_assets_promises.push(
        http.post('upload_cart_assets', formDataFrontImage)
      );
    }

    // Handle back image
    if (product.product_back_url) {
      const backImageBase64 = await urlToBase64(product.product_back_url);
      backBase64 = backImageBase64[0];
      const back_image_info:any = base64ToFile(backImageBase64[0], true);

      const formDataBackImage: FormData = new FormData();
      formDataBackImage.append('file', back_image_info);
      formDataBackImage.append('base_path', `${base_path}`);
      cart_assets_promises.push(
        http.post('upload_cart_assets', formDataBackImage)
      );
    }

    // Handle SVG content
    if (product.svg_content) {
      const svg_content_info: any = base64ToFile(
        product.svg_content,
        false,
        `${factory_product_id}.svg`
      );
      const formDataSVG:FormData = new FormData();
      formDataSVG.append('file', svg_content_info);
      formDataSVG.append('base_path', base_path);
      cart_assets_promises.push(
        http.post('upload_cart_assets', formDataSVG)
      );
    }

    // Upload all assets in parallel
    const uploads: any = await Promise.all(cart_assets_promises);

    // Return uploaded file paths
    return {
      front_image: uploads[0]?.data.result.file_path,
      back_image: uploads[1]?.data.result.file_path,
      svg_url: uploads[2]?.data.result.file_path,
      front_base64: frontBase64,
      back_base64: backBase64
    };

  } catch (error) {
    console.error('Error uploading cart assets:', error);
    throw new Error('Failed to upload cart assets');
  }
}

private addToCartAnimation(frontImage: string, backImage: string | null) {
  // Create animation container
  const cartAnimContainer = document.createElement('div');
  cartAnimContainer.className = 'cart-animation';
  const storageUrl = process.env.VUE_APP_STORAGE_URL;

  // Add front image
  if (frontImage) {
    const frontImg = document.createElement('img');
    frontImg.src = `${storageUrl}${frontImage}`;
    frontImg.onload = () => { // Wait for image to load
      cartAnimContainer.appendChild(frontImg);
      startAnimation();
    };
  }

  // Add back image if exists
  if (backImage) {
    const backImg = document.createElement('img');
    backImg.src = `${storageUrl}${backImage}`;
    backImg.onload = () => { // Wait for image to load
      cartAnimContainer.appendChild(backImg);
    };
  }

  const startAnimation = () => {
    // Get cart icon position
    const cartPosition = this.getCartIconPosition();

    // Set animation endpoint
    cartAnimContainer.style.setProperty('--cart-top', `${cartPosition.top}px`);
    cartAnimContainer.style.setProperty('--cart-right', `${cartPosition.right}px`);

    // Initial positioning
    cartAnimContainer.style.position = 'fixed';
    cartAnimContainer.style.top = '50%';
    cartAnimContainer.style.left = '50%';
    cartAnimContainer.style.transform = 'translate(-50%, -50%)';
    cartAnimContainer.style.opacity = '1';

    // Add to DOM
    document.body.appendChild(cartAnimContainer);

    // Start animation after a brief delay
    setTimeout(() => {
      cartAnimContainer.classList.add('animate');
    }, 100);

    // Remove element after animation completes
    cartAnimContainer.addEventListener('animationend', () => {
      setTimeout(() => {
        cartAnimContainer.style.opacity = '0';
        setTimeout(() => {
          cartAnimContainer.remove();
        }, 300);
      }, 200);
    });
  };
}

  private getCartIconPosition(): { top: number; right: number } {
  const cartIcon = document.querySelector('.cart-icon') as HTMLElement;
  if (cartIcon) {
    const rect = cartIcon.getBoundingClientRect();
    return {
      top: rect.top + (rect.height / 2),
      right: window.innerWidth - (rect.left + rect.width/2)
    };
  }
  return { top: 20, right: 20 };
}

  private observerCallback = (mutationsList:any, observer:any) => {
    // Use traditional 'for loops' for IE 11
    for(const mutation of mutationsList) {
      if (mutation.addedNodes.length) {
        mutation.target.classList.add('dropping')
      }else if(mutation.removedNodes.length){
        mutation.target.classList.remove('dropping')
      }
      else if (mutation.type === 'attributes') {
        // console.log('The ' + mutation.attributeName + ' attribute was modified.');
      }
    }
  }

  private unitConversion (value:number) {
    const setting = this.$store.getters.getSetting('measurement_unit')
    if(setting){
      switch( setting.conversion_operator ) {
        case 'multiply':
          return { value: (value * (parseFloat(setting.conversion_value))).toFixed(1), unit: setting.unit }
          break;
        case 'divide':
          return { value: (value / (parseFloat(setting.conversion_value))).toFixed(1), unit: setting.unit }
          break;
        default: {
          const value_string = value ? value.toString() : '';
          return {value: parseFloat(value_string).toFixed(1), unit: setting.unit}
        }
      }
    }
    return {value: '0', unit: ''};
}

  private designMoved = (evt) =>{
    let design_name = evt.item.getAttribute('data-design-title');
    let locker_name = evt.originalEvent.target.textContent;
    this.showToast(`"${design_name} " is moved to "${locker_name}"`, 'success')
  }

  private triggerDropping = (target: Record<any, any>, $event) =>{
    if(target.target.classList.contains('dropping')){
      this.design_moved_to_locker = target.target.getAttribute('data-title')
      const pos = target.target.getBoundingClientRect()
      let targetEl = {getAttribute: (title)=>`Move to ${target.target.getAttribute(title)}`}
      this.showTooltip({clientX: (pos.left + 130), clientY: (pos.top - 135), target: targetEl})
    }else{
      this.hideTooltip()
    }
  }

  public async getLockerProductsRosters() {
    let edit_product_info_obj = getEditModeDefaultObj()
    let response: any = await http.get("lockers_with_rosters").catch((errorResponse: AxiosError) => {
      handleResponseException(errorResponse)
    })

    if(response) {
      let response_data: Record<any, any> = response.data;
      if (response_data.success) {
        this.lockers_and_rosters = response_data.result.lockers
      }

      setTimeout(()=>{
        if(edit_product_info_obj.locker_product_info!.meta_info && 'target' in edit_product_info_obj.locker_product_info!.meta_info){
          const {activeLocker, lockerActiveTabIndex, lockerActiveDesignIndex} = edit_product_info_obj.locker_product_info!.meta_info;
          this.tabIndex = activeLocker;
          this.lockerActiveTabIndex = lockerActiveTabIndex;
          this.lockerActiveDesignIndex = lockerActiveDesignIndex;
        }
      }, 500);
    }
  }

  public locker_with_rosters(id:any) {
    return this.lockers_and_rosters.filter((item:Record<any, any>)=>item.id == id)
  }

  public product_with_rosters(products: Record<any, any>[], id:any) {
    return products.filter((item:Record<any, any>)=>item.id == id)[0]
    // return this.lockers_and_rosters.filter((item:Record<any, any>)=>item.id == id)
  }

  private get lockerProductInfo() {
    return this.$store.getters.getProductEditInfoObject
  }
  private get tabIndex() {
    return this.$store.getters.getLockerTabsIndex
  }
  private set tabIndex(value){
    this.$store.commit('Change_Locker_Tabs_Index',value);
  }

  private observer:any = new MutationObserver(this.observerCallback);

  private setObserver = (targetNode:Record<any, any>) => {
    targetNode.forEach((elem:Record<any, any>)=>{
      const config = { attributes: true, childList: true, subtree: true };
      this.observer.observe(elem, config);
    })
  }

  private dragStart = () =>{
    let elements = document.querySelectorAll('ul.nav-tabs [data-room-index]') as Record<any, any>
    this.setObserver(elements);
  }

  public getCollectionData() {

    if(this.getCollections.length === 0){
      this.viewLoader = true
      this.setCollections();
      this.viewLoader = false
      startExportStatusChecker()
    }
  }

  public get getExportingCollections(){
    return this.$store.getters.getExportingCollections
  }

  private showTooltip($event: Record<any, any>, leftOffset = 0, topOffset = 0) {
    let element = this.$el.querySelector(".hover_tooltip") as Record<any, any>;
    element.style.opacity = '1'
    element.style.zIndex = '100'
    element.style.left = ($event.clientX + (10 + leftOffset)) + 'px'
    element.style.top = ($event.clientY + (17 + topOffset)) + 'px'
    element.innerHTML = $event.target.getAttribute('data-title')
  }

  private hideTooltip() {
    let element = this.$el.querySelector(".hover_tooltip") as Record<any, any>
    element.style.opacity = '0'
    element.style.left = '0'
    element.style.top = '0'
    element.style.zIndex = '-10'
  }

  public showConfirm() {
    this.ref['reset-confirm-modal'].showConfirm()
  }

  public collectionData = {}

  public async setCollections() {
    await this.$store.dispatch('getCollections')
  }

  get getSelectionMode() {
    return this.$store.getters.getSelectionMode;
  }

  get customerPermissions(){
    return this.$store.getters.getCustomerPermissions
  }

  public addDesignCollection = () => {
    this.$emit('hideLockerRoomModal');
    this.$emit('showCollectionModal');
  }

  get selected() {
    return this.group;
  }

  set selected(val) {
    this.group = val;
  }

  get all_products(): [Record<any, any>] {
    return this.$store.getters.getProducts
  }
  get customLogos():[Record<any, any>] {
    return this.$store.getters.getCustomLogos()
  }

  get lockers(): Record<any, any> {
    return this.$store.getters.getLockers;
  }

  get mainTotalTabs(){
    return this.$store.getters.getMainTotalTabs;
  }

  get getYearlyPlannerTemplateOptions() {
   return this.$store.getters.yearlyPlannerTemplateOptions;
  }

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get customer(): Record<any, any> {
    return this.$store.getters.getCustomer
  }

  get logoTabIndex(): number {
    return this.$store.getters.getActiveLogoIndex
  }

  public lockerAdded() {
    let index = this.getLockerProducts.length - 1
    this.tabIndex = index
    let payload = {index: index, attribute: 'active_tab', value:true}
    this.$store.commit('SET_LOCKER_ATTRIBUTE', payload)
    this.$store.commit('SET_LOCKER_ACTIVE_INDEX', index)
    this.$store.commit('Change_Locker_Tabs_Index', index)
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
    this.$modal.show('copy-product-modal')
  }
  private closeModal(){
    (this.$modal as Record<any, any>).hide('copy-product-modal')
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
      this.$modal.hide('copy-product-modal')
      this.copiedProductId = 0
      this.copiedProductLockerId = this.lockers[0].id
      this.copiedProductName = ""
      this.viewLoader = false
    }else{
      this.showError(res)
      this.viewLoader = false
    }
  }

  public updateTab(){
    this.hidePopper();
    if(this.main_locker_tabs){
      this.$store.dispatch("setCollectionMode","COLLECTION");
    }
    else {
      this.$store.dispatch("setCollectionMode","LOCKER_STORYBOARD");
    }
  }

  public get getProductEditInfoObject() {
    return this.$store.getters.getProductEditInfoObject;
  }

  public async shareProduct(product: Record<any, any>, ind: number|string, lockerIndex: number|string) {
    try {
      if(product){
        let payload = {
            type: 'locker',
            id: product.id,
            customer_id: this.customer ? this.customer.id : '',
            product_id: product.product_id
          }
          let shared_url = "";
          if (product.shared_url) {
            shared_url += product.shared_url;
          } else {
            let res = await this.$store.dispatch('shareProduct', payload);
            shared_url += res.data.url;
            Vue.set(this.getLockerProducts[lockerIndex].product[ind], 'shared_url', shared_url)
          }
        this.hidePopper()
        this.showPopper('share'+lockerIndex+''+ind, ()=>{this.isElementOverflowingContainer(`share-popper-content${lockerIndex}${ind}`)});
      }
    } catch (error) {
      console.log(error)
    }
  }

  public copyLink(room_index: number|string, ind: number|string) {
    let toCopy = this.$refs['copylink_product_' + room_index + '' + ind] as Record<any, any>
    toCopy = toCopy[0].$el as Record<any, any>
    toCopy.select()
    try {
      document.execCommand('copy');
      this.showToast('Shareable link was copied to your clipboard.', 'success');
    } catch (err) {
      alert('Oops, unable to copy');
    }
  }

  public async deleteProduct(
    i: number | string,
    ind: number | string,
    id: number,
    collections: { id: number; name: string }[] = []
  ) {

    // Generate the collection confirmation message
    if (collections.length > 0) {
      const collectionNames = collections.map(col => col.name).join('" and "');
      const collectionWord = collections.length === 1 ? 'collection' : 'collections'; // Singular or plural
      this.confirmMessage = `This product is used in the ${collectionWord} "${collectionNames}". If you delete the design, it will also be removed from the ${collectionWord}. Do you want to delete the product from both the locker and ${collectionWord}?`;
    } else {
      this.confirmMessage = `This product is not associated with any collections. Do you really want to delete it from the locker?`;
    }

    this.confirmButtonText = 'Delete';
    this.cancelButtonText = 'Cancel';

    // Show the confirmation modal
    const ok = await this.ref['reset-confirm-modal'].showConfirm()

    // Reset the modal text to default values
    this.confirmMessage = 'Do you really want to delete?';
    this.confirmButtonText = 'Yes';
    this.cancelButtonText = 'Cancel';

    if (!ok) {
      console.log('clicked cancel');
      return false; // User canceled the operation
    }

    // Proceed with deletion if no collections or user confirmed
    const res = await this.$store.dispatch('deleteRoomProduct', {
      room_index: i,
      product_index: ind,
      id: id,
    });

    if (res === true) {
      this.$store.commit('SET_RECENT_LOGOS');
      this.showToast('Product Deleted', 'success');
    } else {
      this.showError(res);
    }
  }

  public async deleteCollection(id: number, index: number) {
    try {
      const ok = await this.ref['reset-confirm-modal'].showConfirm()
      if (ok) {
        let res = await this.$store.dispatch('deleteCollection', {id: id, index: index});
        this.showToast(res.data.message, 'success');
      }
    } catch (e) {
      this.showError(e);
    }
  }

  public async deleteRoom($event, id: number, index: number | string) {
    $event.stopPropagation();
    if (confirm('You are going to delete associated product')) {
      if(this.getProductEditInfoObject.type === "locker_product"){
        let locker_product_id  = this.getProductEditInfoObject.locker_product_info.product_id;
        if(locker_product_id === this.selectedProduct.id){
            exitFromEditMode()
        }
      }
      let res = await this.$store.dispatch('deleteRoom', {id: id, index: index});
      if (res == true) {
        this.showToast('room deleted', 'success')
        if(this.getLockerProducts.length > 0){
          this.tabIndex = 0;
          let payload = {index:this.tabIndex, attribute: 'active_tab', value:true}
          this.$store.commit('SET_LOCKER_ATTRIBUTE', payload)
          this.$store.commit('Change_Locker_Tabs_Index', 0)
          this.$store.commit('SET_LOCKER_ACTIVE_INDEX', 0)
        }
      } else {
        this.showError(res);
      }
    }
  }

  public async renameLockerModal($event, locker:Record<any, any>) {
    $event.stopPropagation();
    this.lockerToRename = locker;
    this.newLockerName = locker?.room_name;
    this.showVModal('rename-locker-modal');
  }

  public fetchColors($event: Record<any, any>, i: number, ind: number) {
    $event.preventDefault();
    this.colors = JSON.parse(this.getLockerProducts[ind].folders[i].color);
    return false;
  }

  public changeColor() {
    this.colors = []
  }

  public async addToCustomLogos(logo: Record<any, any>) {
    if(!logo.logo_colors) {
      logo.logo_colors = await this.fetchLogoColors(logo.id)
    }
    this.$emit('hideLockerRoomModal')
    delete logo.product_id;
    this.$root.$emit('useLockerRoomAssetLogo', logo);
  }

  public async deleteLogo(room_index:number, logo_id:number, logo_index: number, room_id:number){
   let res  = await http.post('delete/logo', {id: logo_id, room_id: room_id})
    if(res.status == 204){
      this.getLockerProducts[room_index]['logos'].splice(logo_index, 1)
    }
  }

  public get selectedCollectionProducts() {
    return this.$store.getters.getSelectedCollectionProducts
  }


  public set selectedCollectionProducts(val: Record<any, any>) {
    const payload = {"attribute": "locker_products", "value": val};
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS', payload)
  }

  public editCollection(collection_id: number) {
    this.$store.dispatch("setCollectionMode","COLLECTION");
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS', {"attribute": "collection_id", "value": collection_id})
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS', {"attribute": "locker_products", "value": []})
    this.$emit('editCollectionModal')
    this.$emit('hideLockerRoomModal')
  }

  public existingCollection() {
    this.$emit('editCollectionModal')
    this.$emit('hideLockerRoomModal')
  }

  public getDisabled(locker_prd_id: number): boolean {
    if (this.getSelectionMode.readonly) {
      //let selected = this.$store.getters.getSelectedCollectionProducts
      let disabled = this.$store.getters.getDisabledProducts
      let res = disabled.find((id: number) => {
        return id == locker_prd_id
      })
      return !!res;
    }
    return false

  }

  public async lockerTabUpdated(newTabIndex:number , prevTabIndex: number, bvEvent:Record<any, any> ) {
    this.lockerActiveTabIndex = 0;
    // this.$store.commit("Change_Locker_Active_Tab", newTabIndex);
  }
  public async yearlyPlannerTab(room_id:number) {
    (this.$refs as Record<any, any>)[`yearlyTab${room_id}`][0].activate()
  }

  public lockerChanged() {
    /*
    * If locker collection tab is active and user switch to the locker then activate first tab (product tab)
    * */
    // if (this.lockerActiveTabIndex == 3 || this.lockerActiveTabIndex == 4) {
      this.lockerActiveTabIndex = 0
    // }
  }

  public clickYearlyTab(evt:any,room_id:number) {
    this.getLockerEvents(room_id)
  }

  public lockerProductsChanged(payload: any, index = null) {
    let action = payload.type;
    let data: Record<any, any> = {};
    data.action = action;
    let clones = payload.clone ? [payload.clone] : payload.clones;
    if (action == "add") {
      data.action_data = this.productsAddedToLocker(payload);
    } else if (action == "update") {
      data.action_data = this.reArrangeLockerProducts(payload);
    }
    http.put(`locker/products/changed`, data).then((res) => {
      console.log("");
    }).catch(err => {
      console.log("error", err)
      if (err.response.status) {
        //resp = {status:false,message:err.response.data.errors};
      }
    })
  }
  public changeTabIndex(i:number){
    this.viewLoader = true;
    this.tabIndex = i
    let payload = {index: i, attribute: 'active_tab', value:true}
    this.$store.commit('SET_LOCKER_ATTRIBUTE', payload)
    this.$store.commit('Change_Locker_Tabs_Index', i)
    this.lockerActiveTabIndex = 0
    this.viewLoader = false;
  }
  public setRenameLockerProductID(id: string, product: Record<any, any>){
    if(product){
      this.renameID = id;
      this.renameRef = `rename-locker-${id}`
      this.current_product_name = product.product_name;
      this.lockerProductInfo.locker_product_info = {id: product.id}
    }
  }
  public renameLockerProduct(product: Record<any, any>){
    const self = this as Record<any, any>
    let data = {id: product.id, product_name: this.current_product_name}
    self.renameLoader = true;

    if(data.id && data.product_name && data.product_name !=''){
      http.put(`locker/product-name/changed`, data).then((res) => {
        self.$eventBus.$emit('saveRosterToLocker')
        product.product_name = self.current_product_name
        self.renameID = '';
        self.showToast(res.data.message, 'success')
        self.renameLoader = false;
      }).catch(err => {
        console.log("error", err)
        if (err.response.status) {
          self.renameLoader = false;
          //resp = {status:false,message:err.response.data.errors};
          self.showToast('Product is not renamed, try again', 'error')
        }
      })
    }else{
      self.showToast('Please write some name', 'error')
      self.renameLoader = false;
    }
  }
  public handleLockerRoomChanged(){
    this.lockerActiveTabIndex = 0
    this.$store.commit("Change_Locker_Active_Tab", 0)
  }
  public handleTabChanged(tabIndex: number){
    let edit_product_info_obj = getEditModeDefaultObj()
    const getBack = edit_product_info_obj.locker_product_info!.meta_info;
    if(tabIndex == 3 && getBack){
      if('target' in getBack && getBack.lockerActiveDesignIndex != 0){
        setTimeout(()=>{
          this.lockerActiveDesignIndex = getBack.lockerActiveDesignIndex;
          const updated_product_info = {...edit_product_info_obj.locker_product_info, meta_info: null}
          this.$store.commit('SET_PRODUCT_EDIT_INFO_OBJECT', {locker_product_info:updated_product_info});
        }, 550)
      }else{
        this.lockerActiveDesignIndex = 0;
      }
    }

    this.lockerActiveTabIndex = tabIndex
    this.$store.commit("Change_Locker_Active_Tab", tabIndex)

  }
  public productsAddedToLocker(payload: Record<any, any>) {
    let clones = payload.clone ? [payload.clone] : payload.clones;
    let added_locker_room_products_ids: number[] = [];
    let customer_id = 0, old_room_index = 0, old_room_id = 0;
    let new_room_index = payload.to.getAttribute("data-room-index")
    let new_room_id = payload.to.getAttribute("data-room-id")
    clones.forEach((clone: Record<any, any>, clIdx: number) => {
      //as each object have same value that's why we initialize variables in first loop
      if (clIdx == 0) {
        customer_id = clone.getAttribute("data-customer-id");
        old_room_index = clone.getAttribute("data-room-index");
        old_room_id = clone.getAttribute("data-room-id");
      }
      added_locker_room_products_ids.push(clone.getAttribute("data-product-locker-room-id"));
    })
    let new_locker_products = this.getLockerProducts[new_room_index].product;
    let old_locker_products = this.getLockerProducts[old_room_index].product;
    // added_products are those that have been moved from active locker and added to new locker
    let added_products = old_locker_products.filter((old_locker_product: Record<any, any>) => {
      return includes(added_locker_room_products_ids, old_locker_product.id.toString())
    });
    new_locker_products = union(added_products, new_locker_products);
    new_locker_products = new_locker_products.map((new_locker_product: Record<any, any>, nlpIdx: number) => {
      new_locker_product.sort_order = nlpIdx + 1;
      return new_locker_product;
    });
    //updating new locker products
    this.$store.commit('SET_LOCKER_PRODUCTS', {locker_index: new_room_index, products: new_locker_products})
    let old_locker_new_products = differenceBy(old_locker_products, added_products, "id") as Record<any, any>
    old_locker_new_products = old_locker_new_products.map((old_locker_product: Record<any, any>, olpIdx: number) => {
      old_locker_product.sort_order = olpIdx + 1;
      return old_locker_product;
    })
    //updating active locker products
    this.$store.commit('SET_LOCKER_PRODUCTS', {locker_index: this.tabIndex, products: old_locker_new_products})
    return {
      customer_id: customer_id,
      old_room_index: old_room_index,
      old_room_id: old_room_id,
      added_locker_room_products_ids: added_locker_room_products_ids,
      new_room_index: new_room_index,
      new_room_id: new_room_id
    };
  }

  async downloadProductPreviewImages(lockerIndex: number, productIndex: number) {
    let product: Record<any, any> = this.getLockerProducts[lockerIndex].product[productIndex];
    let preview_file_paths = [product.product_front_url];
    if (product.product_back_url) {
      preview_file_paths = [...preview_file_paths, product.product_back_url];
    }
    this.showLoader = true;
    const base64_files = await urlToBase64(preview_file_paths);
    this.showLoader = false;
    const dom_document = getDomDocument(true);
    base64_files.forEach((base64_file, base64_file_index) => {
      let preview_file = dom_document.createElement("a");
      preview_file.href = base64_file;
      const suffix = base64_file_index === 0 ? 'front' : 'back';
      preview_file.download = `${product.product_name + `_` + suffix}`
      preview_file.click();
    })
  }

  public reArrangeLockerProducts(payload: Record<any, any>) {
    let old_indicies = payload.oldIndicies.length > 0 ? payload.oldIndicies : [{
      multiDragElement: null, index: payload.oldIndex
    }];
    let new_indicies = payload.newIndicies.length > 0 ? payload.newIndicies : [{
      multiDragElement: null, index: payload.newIndex
    }];
    let moved_products: { old_index: number, new_index: number }[] = [];
    old_indicies.forEach((old_index: Record<any, any>, oiIdx: number) => {
      moved_products.push({
        old_index: old_index.index, new_index: new_indicies[oiIdx].index
      });
    })
    let active_locker_products = JSON.parse(JSON.stringify(this.getLockerProducts[this.tabIndex].product));
    moved_products.forEach((moved_product) => {
      let old_index = moved_product.old_index;
      let new_index = moved_product.new_index;
      let old_index_product = active_locker_products[old_index];
      let new_index_product = active_locker_products[new_index];
      active_locker_products[old_index] = new_index_product;
      active_locker_products[new_index] = old_index_product;
    })
    let product_ids_with_sort_order: { id: number, sort_order: number }[] = [];
    active_locker_products = active_locker_products.map((active_locker_product: Record<any, any>, alpIdx: number) => {
      let sort_order = alpIdx + 1;
      active_locker_product.sort_order = sort_order;
      product_ids_with_sort_order.push({
        id: active_locker_product.id,
        sort_order: sort_order
      });
      return active_locker_product;
    })
    this.$store.commit('SET_LOCKER_PRODUCTS', {locker_index: this.tabIndex, products: active_locker_products})
    return product_ids_with_sort_order;
  }


  public async swapDesign(lockerIndex: number, productIndex: number) {
    let locker_products = this.$store.getters.getLockerProducts;
    let product = locker_products[lockerIndex].product[productIndex];

    if (product.is_back_img == 0) {
      product.is_back_img = 1
      product.product_url = product.product_back_url
    } else {
      product.is_back_img = 0
      product.product_url = product.product_front_url
    }
    locker_products[lockerIndex].product[productIndex] = product;
    this.$store.commit("SET_LOCKER_PRODUCTS",locker_products);
  }

  public preventDrag($event:Record<any, any>) {
    $event.preventDefault();
  }


  public async createYearlyPlanner(locker_room_id:number, index:number){
    let payload = {locker_id: locker_room_id, index};
    this.viewLoader = true
    let res = await this.$store.dispatch('createYearlyPlanner', payload)
    this.viewLoader = false
    if (res.status == 201){
     this.showToast('Yearly planner has been created successfully for this locker.', 'success');
    }else{
      this.showError(res)
    }
  }

  public async copyYearlyPlannerEvents(yearlyplanner_template_id: string | null, locker_room_id:number, index:number){
    if(yearlyplanner_template_id) {
      let user_timezone = this.ref['eventmodal'].userTimeZone()
      let payload = {yearlyplanner_template_id, locker_id: locker_room_id, user_timezone, index};
      this.viewLoader = true
      let res = await this.$store.dispatch('copyYearlyPlannerEvents', payload)
       this.viewLoader = false
      if (res.status == 201) {
        this.yearly_planner_template_id = null
        await this.getLockerEvents(locker_room_id)
        this.showToast('Yearly planner has been created successfully with events for this locker.', 'success');
      } else {
        this.showError(res)
      }
    }
  }

  public async deletePlanner(locker_room_id:number, index:number){
    try {
      const ok = await this.ref['reset-confirm-modal'].showConfirm()
      if (ok) {
        let payload = {locker_id: locker_room_id, index};
        this.viewLoader = true
        let res = await this.$store.dispatch('deletePlanner', payload)
        this.viewLoader = false
        this.$store.commit('SET_LOCKER_ATTRIBUTE', {index: payload.index, attribute:'have_yearly_planner', value:0 })
        this.$store.dispatch('getLockerEvents',locker_room_id)
        this.showToast('Yearly planner has been deleted successfully for this locker.', 'success');
      }
    }
    catch (e) {
      if(e.response)
        this.showError(e.response.data.message)
      else
        this.showError(e)
    }
  }
  public async getIcsFile(locker_room_id:number, index:number){
    try {
      let payload = {room_id: locker_room_id, event_year:this.$store.getters.getSelectedYear};
      this.viewLoader = true
      let res = await this.$store.dispatch('getIcsFile', payload)
      let blob = new Blob([res.data], { type: 'text/calendar' })
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = 'calender_file.ics'
      link.click()
      this.viewLoader = false
      this.showToast('Ics File created successfully', 'success');
    }
    catch (e) {
      if(e.response)
        this.showError(e.response.data.message)
      else
        this.showError(e)
    }
  }
   public getLockerEvents(room_id:number) {
     this.viewLoader = true
     this.$store.dispatch('getLockerEvents',room_id)
     this.viewLoader = false
  }
  public openEventModal(status:boolean){
    this.ref['eventmodal'].showEventModal()
  }
  public setEventProduct(id:number, url:string, name:string){
    this.ref['eventmodal'].setEventProduct(id, url, name)
  }

  public setEventCollection(collection_index:number){
    this.ref['eventmodal'].setEventCollection(collection_index)
  }
  public initEventContacts(selected_month:number){
    this.ref['eventmodal'].initEventContacts(selected_month);
  }
  public changeLockerTabIndex(lockerIndex: number){
    this.tabIndex = lockerIndex
  }
  public editEvent(event_id:number){
    const room_index = this.$store.getters.getLockerTabsIndex;
    this.$store.commit('SHOW_EVENT_POPUP', true)
    this.$store.commit('SET_LOCKER_INDEX_FOR_EVENT', room_index)
    this.ref['eventmodal'].editEvent(event_id);
  }

  public showContactPopup(room_id:number, room_index:number){
    this.ref['contactmodal'].showContactPopup(room_id, room_index)
  }
  public onClickOutside(event) {
    // Check if the clicked element is outside your target element
    if (this.ref[this.renameRef] && !this.ref[this.renameRef][0].contains(event.target)) {
      // Clicked outside the element
      this.renameID = '';
    }
  }
  public renameRoomName(){
    const self = this as Record<any, any>
    let data = {id: self.lockerToRename.id, room_name:  self.newLockerName}
    self.renameLoader = true;
    if(data.id && data.room_name && data.room_name !=''){
      http.put(`locker/room-name/changed`, data).then((res) => {
        self.$store.dispatch("GET_LOCKER_PRODUCTS").then((res) => {
          if (res) {
            this.$store.dispatch('GET_LOCKER_PRODUCTS', 'fetch_all=true')
          }
        });
        self.lockerToRename = {};
        self.newLockerName = "";
        self.showToast(res.data.message, 'success')
        self.hideVModal('rename-locker-modal');
        self.renameLoader = false;
      }).catch(err => {
        if (err.response.status) {
          self.renameLoader = false;
          self.showToast('Locker Name is not renamed, try again', 'error')
          self.hideVModal('rename-locker-modal');
        }
      })
    }else{
      self.showToast('Please write some name', 'error')
      self.hideVModal('rename-locker-modal');
      self.renameLoader = false;

    }
  }
  public editRoster(product:Record<any, any>){
    this.locker_roster_id = product.id;
    this.ref["editrostermodal"].show()
  }

  public updateProductCount(product:Record<number,number>): void{
    let locker_index = -1
    let product_index = -1
    this.getLockerProducts.forEach((locker,index) => {
      locker.product.forEach((locker_product,prod_index) => {
        if (product['id'] == locker_product.id) {
          locker_index = index;
          product_index = prod_index;
        }
      });
    });

   if(locker_index != -1 && product_index != -1){
      let updatedLockerProducts = this.getLockerProducts[locker_index];
      updatedLockerProducts.product[product_index].roster_total_quantity = product['totalQuantity'];
      this.$store.commit('SET_LOCKER_PRODUCTS', {locker_index: locker_index, products: updatedLockerProducts.product})
   }
  }

  public showStoryBoard($event,room){
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS', {"attribute": "collection_id", "value": room.collection.id})
    this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS', {"attribute": "locker_products", "value": []})
    this.$store.dispatch("setCollectionMode","LOCKER_STORYBOARD");
    this.$emit('editCollectionModal')
    this.$emit('hideLockerRoomModal')
  }

  public downloadCollectionPdf(collection_id) {
    this.viewLoader = true;
    downloadNodeCollectionPDF(collection_id).then( () => {
      this.viewLoader = false;
    })
      .catch(error => {
        this.viewLoader = false;
      });
  }
  public addShopifyCollection(collection_id, index:number) {
    this.viewLoader = true;
    const self = this as Record<any, any>
    let payload = {collection_id}
      http.post(`export-collection-to-shopify`, payload).then((res) => {
        this.viewLoader = false;
        const collection = this.getCollections[index];
        self.$store.commit('TOGGLE_EXPORTING_COLLECTION', {
          id: collection.id,
          name: collection.name,
        });
        startExportStatusChecker();
        this.showToast('Exporting collection to Shopify is in progress...','success')
      }).catch(err => {
        this.viewLoader = false;
        if (err.response.status) {
          self.showToast('There is some problem in exporting. Try later.', 'error')
        }
      })
  }

}
</script>

<style lang="scss" scoped>
.notactive{
  pointer-events: none;
}
.lockerroom-modal .nav-tabs .add_new_locker .nav-link {
  border: none !important;
  padding: 0;

  .btn {
    font-size: 1em !important;
    line-height: normal;
  }
}

.lockerroom-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;

  .locker-opener {
    max-width: 90%;
    padding: 15px;
    font-size: 18px;
    position: relative;
    overflow-x: auto;
    white-space: nowrap;
    @media only screen and (min-width: 992px) {
      max-width: 100%;
      padding: 14px 30px;
      max-width: 80%;
    }

    .btn {
      padding: 5px 10px;
      margin: 0 5px 10px;
      position: relative;
      background: none;
      border-color: rgba(3, 20, 46, 0.13);
      color: #03142E;
      font-size: 0.8rem;
      @media only screen and (min-width: 992px) {
        padding: 10px 30px;
        margin: 0 10px 10px;
        font-size: 1rem;
      }

      &.active,
      &:hover {
        background: #219f84;
        color: #fff;
        border-color: #219f84;
      }

      .remove {
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
        @media only screen and (min-width: 992px) {
          width: 30px;
          height: 30px;
          font-size: 12px;
        }
      }
    }

    .arrow {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
      color: #219f84;
      font-size: 15px;
      display: none;
      @media only screen and (min-width: 992px) {
        display: inline-block;
      }

      &.arrow-right {
        left: auto;
        right: 0;
      }
    }
  }

}

.products-holder {
  width: 100%;
  @media only screen and (min-width: 992px) {
    width: 100%;
  }

  .products-block {
    position: relative;

    @media only screen and (min-width: 992px) {

    }
    @media only screen and (min-width: 1199px) {

    }

    //block child drag
    label{
      & > div {
        position: relative;

        &:after {
          content: "";
          display: block;
          height: 100%;
          width: 100%;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          position: absolute;
          z-index: 2;
          background: rgba(0, 0, 0, 0);
          pointer-events: none;
        }

        img{
          -webkit-user-drag: none;
        }
      }
    }

    .image-holder {
      position: relative;
      margin: 0 0 15px;
      @media only screen and (min-width: 992px) {
        overflow: hidden;
      }

      & > div {
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

    .locker-image-holder{
      width:160px;
      height:160px;
      margin: 0 15px;
    }

    .product-icons {
      list-style: none;
      padding: 0;
      margin: 0;
      position: absolute;
      right: -5px;
      top: -5px;
      z-index: 3;
      height: 100%;
      font-size: 16px;
      display: flex;
      flex-direction: column;

      .swap {
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

        &:hover {
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

          &:hover {
            border-color: #D53943;
          }
        }
      }
    }
  }
}

.lockerroom-color-folders {
  position: relative;

  .color-folder-holder{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid: 15px;
  }

  .folder-wrapper {
    @media only screen and (min-width: 1200px) {
      flex: 0 0 70%;
      max-width: 70%;
    }

    h3 {
      font-weight: 600;
      @media only screen and (min-width: 992px) {
        font-size: 20px;
      }
    }

    a {
      font-size: 11px;

      @media only screen and (min-width: 768px) {
        font-size: 12px;
        flex: 0 0 19%;
        max-width: 19%;
      }
      @media only screen and (min-width: 1200px) {
        font-size: 14px;
        flex: 0 0 13%;
        max-width: 13%;
      }

      svg {
        font-size: 32px;
        display: block;
        margin: 0 auto 10px;
        fill: #219f84;
        color: #219f84;
        @media only screen and (min-width: 768px) {
          font-size: 46px;
        }
      }
    }
  }

  .color-folder-holder{
   width: 100%;
  }

  .color-holder{
    box-shadow: none;
    border-top: 1px solid #eee;
    border-radius: 0;

    .color-container{
      @media (max-width: 500px) {
        gap: 10px;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
      }
    }
  }

  .color-folder-holder {
    overflow-y: auto;
    max-height: 20vh;
    @media only screen and (min-width: 768px) {
      max-height: 50vh;
    }
  }
}

.assets-logo-block {
  position: relative;
}

.use-logo-btn {
  background: rgba(0, 0, 0, 0.15);
  z-index: 1;
  color: #333;
  text-transform: uppercase;
  font-size: 1rem;
  width: 100%;
  border: none;

  &:hover{
    background: #121212;
    color: #fff;
  }
}
.sortable-selected {
  background: #eee;
}

.locker-tab-ghost {
  display: none !important;
  background: #C8EBFB;
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

.rename-locker-product{
  bottom: -40px;
  background: white;
  border: 1px solid #ddd;
  box-sizing: border-box;
  box-shadow: 0 0 5px rgba(0,0,0,0.15);

  input{
    border-radius: 0;
    border: none;
    background: none;
  }

  .close-rename{
    background: var(--theme-color-light);
    color: var(--theme-color);
  }
}

.custom-checkbox{
  input{
    display: none;
  }

  span{
    display: block;
    height: 20px;
    width: 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
    position: relative;
    cursor: pointer;

    &::after, &::before{
      content: '';
      display: none;
      position: absolute;
      width: 2px;
      background-color: #fff;
    }

    &::before {
      height: 10px;
      left: 10px;
      top: 4px;
      transform: rotate(45deg);
    }

    &::after {
      height: 6px;
      left: 5px;
      top: 8px;
      transform: rotate(-45deg);
    }
  }

  input:checked + span {
    background: var(--theme-color);
    border-color: var(--theme-color);

    &::after, &::before{
      display: block;
    }
  }
}


</style>
<style lang="scss">
.cart-animation {
  position: fixed;
  z-index: 99999;
  display: flex;
  gap: 10px;
  pointer-events: none;
  transition: opacity 0.3s ease;

  img {
    height: 100px;
    width: auto;
    object-fit: contain;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  &.animate {
    animation: moveToCart 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }
}

@keyframes moveToCart {
  0% {
    opacity: 1;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(1);
  }
  70% {
    opacity: 1;
    top: var(--cart-top);
    right: var(--cart-right);
    transform: scale(0.5);
  }
  100% {
    opacity: 0;
    top: var(--cart-top);
    right: var(--cart-right);
    transform: scale(0.1);
  }
}
</style>
