<template>
  <span class="asdasd">
  <b-tabs lazy content-class="mt-3"   @changed="lockerChanged">
    <template v-for="(room, i) in getLockerProducts">
      <b-tab lazy :key="i" @click="changeTabIndex(i)" :active="tabIndex === i">
        <template #title>
          <draggable  ghostClass="locker-tab-ghost" :group="{name: `locker-${i}`, pull: false, put: true}" :data-room-id="room.id" :data-room-index="i"
                      @add="lockerProductsChanged($event, i)" v-bind="{animation: 250, delayOnTouchOnly: true, delay: 500}">
            <span @click="changeColor">{{ room.room_name }}</span>
          </draggable>
          <a v-if="!getSelectionMode.readonly" class="remove-tab" @click="deleteRoom(room.id, i)">
            <font-awesome-icon :icon="['fas', 'trash-alt']"/>
          </a>
        </template>


        <div class="lockerroom-tabs">
          <div>
            <b-card no-body>
              <div class="loader relative" v-if="viewLoader"><img src="../../src/assets/images/loading.gif" /></div>
              <b-tabs v-else card v-model="lockerActiveTabIndex" @changed="handleLockerRoomChanged" @input="handleTabChanged" :no-fade="true">
                <b-tab v-if="!getSelectionMode.eventCollectionMode"  title="Products" >
                  <draggable @start="dragStart" selectedClass="sortable-selected" :group="{name: 'people', pull: room.locker_pull_groups}"
                             :value="[]" class="products-holder draggable grid mobile-cols-2 gap-4 grid-6"
                             :multiDrag="true"
                             handle=".image-holder"
                             v-bind="{animation: 250, delayOnTouchOnly: true, delay: 500}"
                             @update="lockerProductsChanged($event)">
                    <template v-for="(product, ind) in room.product">
                      <div :key="`${ind}-${product.id}`" class="products-block" :class=" product.disable_style ? 'notactive' : ''" :data-room-id="room.id"
                           :data-room-index="i"
                           :data-product-locker-room-id="product.id" :data-customer-id="product.customer_id"
                           :data-product-index="ind">
                      <label :key="ind" class="w-100" :class="product.class ? 'selected': ''"
                             @click="product.class == undefined ? product.class = false : null; product.class = !product.class">
                        <div class="image-holder">
                          <div>

                            <b-form-checkbox  v-if="!getSelectionMode.eventProductMode" :disabled="getDisabled(product.id)"  v-model="selectedCollectionProducts" v-bind:value="product.id"></b-form-checkbox>
                            <template v-if="room.active_tab">
                              <img @dblclick="editProduct(room.id, product.id, ind)" v-if="!getSelectionMode.eventProductMode"  :src="`${storageUrl+product.product_url}?q=${product.random_string}`" :class="product.product_url ? '' : 'placeholder'" alt="">
                              <img v-else @click="setEventProduct(product.id, product.product_front_url, product.product_name ) "  :src="`${storageUrl+product.product_url}?q=${product.random_string}`" :class="product.product_url? '' : 'placeholder'" alt="">
                            </template>

                          </div>
                        </div>
                        <div class="d-none d-lg-block product-description text-center">
                          <p>{{ product.product_name }}</p>
                        </div>
                      </label>

                      <ul class="product-icons">
                        <li v-if="!getSelectionMode.readonly">
                          <a style="font-size: 12px;" data-title="Delete design" class="remove" @click="deleteProduct(i, ind, product.id)"
                             @mouseleave="hideTooltip" @mouseenter="showTooltip"><font-awesome-icon
                            :icon="['fas', 'trash-alt']" /></a>
                        </li>
                        <li v-if="!getSelectionMode.readonly">
                          <a style="font-size: 12px;" v-if="mobileScreen" data-title="Edit design" @click="editProduct(room.id, product, ind)"><font-awesome-icon :icon="['fas', 'edit']"/></a>
                          <a style="font-size: 12px;" v-else-if="isSafari" data-title="Edit design" @click="editProduct(room.id, product, ind)"><font-awesome-icon :icon="['fas', 'edit']"/></a>
                          <a style="font-size: 12px;" v-else data-title="Edit design" @click="editProduct(room.id, product, ind)" @mouseleave="hideTooltip"
                             @mouseenter="showTooltip"><font-awesome-icon :icon="['fas', 'edit']"/></a>
                        </li>
                        <li v-if="!getSelectionMode.readonly">
                          <b-button style="font-size: 12px;" data-title="Share design" :ref="'share'+i+''+ind" :id="'share'+i+''+ind"
                                  @click.stop="shareProduct(product, ind, i)"><font-awesome-icon
                          :icon="['fas', 'share-alt']"/>
                          </b-button>

                          <Popper
                            v-if="$refs['share'+i+''+ind]"
                            style="font-size: 12px;"
                            :is-open="popperID == ('share'+i+''+ind)"
                            :anchor-el="$refs['share'+i+''+ind][0]"
                            :on-close="hidePopper"
                          >
                            <aside id="popper-content" v-click-outside="hidePopper" class="tooltip b-tooltip bs-tooltip share-tooltip">
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
                          </Popper>
                        </li>
                        <li v-if="!getSelectionMode.readonly">
                          <a style="font-size: 12px;"  @click="showDesignModal(product)">
                            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="copy" class="svg-inline--fa fa-copy" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M384 96L384 0h-112c-26.51 0-48 21.49-48 48v288c0 26.51 21.49 48 48 48H464c26.51 0 48-21.49 48-48V128h-95.1C398.4 128 384 113.6 384 96zM416 0v96h96L416 0zM192 352V128h-144c-26.51 0-48 21.49-48 48v288c0 26.51 21.49 48 48 48h192c26.51 0 48-21.49 48-48L288 416h-32C220.7 416 192 387.3 192 352z"></path></svg>
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
                    </div>
                    </template>
                  </draggable>

                </b-tab>
                <b-tab lazy v-if="!getSelectionMode.readonly" title="Assets" class="assets-file">
                  <div class="grid grid-mobile-3 gap-1">
                    <template v-for="(logo, inda) in room.logos">
                      <div :key="inda" class="assets-logo-block">
                        <span class="d-block p-2">
                          <img :src="storageUrl+logo.logo_url+'?nocache=1'" />
                        </span>
                        <button @click="addToCustomLogos(logo)" class="use-logo-btn">Use</button>
                      </div>
                      <a :key="`delete_logo${inda}`" @click="deleteLogo(i, logo.id, inda, room.id)"><font-awesome-icon :icon="['fas', 'trash-alt']"/></a>
                    </template>
                  </div>
                </b-tab>
                <b-tab lazy v-if="!getSelectionMode.readonly" title="Colors">
                  <div class="d-flex flex-wrap justify-content-between lockerroom-color-folders">
                    <div class="pt-lg-2 folder-wrapper">
                      <h3 class="w-100 d-block mb-3 mb-lg-4 text-bold text-left">Select Folder</h3>
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
                          <div :key="`item_${ix}`" v-if="item.value">
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
                <b-tab @click="getCollectionData" lazy v-if="(!getSelectionMode.readonly) || (getSelectionMode.readonly && getSelectionMode.eventCollectionMode)" title="Collections"
                       class="designCollections">
                  <div class="products-holder collection grid gap-5 mobile-cols-2 grid-6">
                    <template v-if="getCollections.length > 0">
                      <template v-for="(collection, index) in getCollections">
                      <div :key="index" @click="getSelectionMode.eventCollectionMode ? setEventCollection(index) : null" class="products-block" :style="getSelectionMode.eventCollectionMode ? 'cursor:pointer' : 'cursor:move' ">
                        <div class="image-holder">
                          <div class="convas_container" :key="collection_product_index"
                               v-for="(collection_product,collection_product_index) in collection.collection_products">
                            <template v-if="collection_product_index < 3">
                              <img :src="storageUrl+collection_product.product_locker_room.product_url+'?q='+collection_product.product_locker_room.random_string"
                                   :class="collection_product.product_locker_room.product_url ? '' : 'placeholder'"
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
                            <Popper
                              style="font-size: 12px;"
                              v-if="$refs['share-collection'+index]"
                              :is-open="popperID == ('share-collection'+index)"
                              :anchor-el="$refs['share-collection'+index][0]"
                              :on-close="hidePopper"
                              class="share-tooltip">
                              <aside :id="'popper-content'+index" v-click-outside="hidePopper" class="tooltip b-tooltip bs-tooltip share-tooltip">
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
                            </Popper>
                          </div>
                        </div>
                        <div class="d-none d-lg-block product-description text-center">
                          <p>{{ collection.name }}</p>
                        </div>
                      </div>
                    </template>
                    </template>
                    <template v-else><p>No Collection Exists</p></template>
                  </div>
                 </b-tab>
                <b-tab lazy :ref="`yearlyTab${room.id}`" @click="clickYearlyTab($event,room.id)" v-if="!getSelectionMode.readonly && customerPermissions.includes('Yearly-Planner')"  title="Yearly Planner" class="designCollections">
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
              </b-tabs>
            </b-card>
          </div>
        </div>
      </b-tab>
    </template>

    <template #tabs-end>
      <b-nav-item v-b-tooltip.rightbottom.hover="'Add New Locker Room'" v-if="!getSelectionMode.readonly"
                  role="presentation" class="add_new_locker" v-b-modal.modal-center-createlockerroom href="#">
        <span class="btn btn-secondary light" @click="showVModal('create-modal')">Add <BIconPlus/></span>
      </b-nav-item>
     </template>


    <CreateLockerRoomModal ref="create-modal" @lockerAdded="lockerAdded"/>
    <ExistingCollectionModal @existingCollection="existingCollection"/>
    <EventModal ref="eventmodal" @change-locker-tabindex="changeLockerTabIndex" @yearlyPlannerTab="yearlyPlannerTab"   />
    <ContactModal ref="contactmodal"   />
  </b-tabs>

     <confirm-modal message="Do you really want to delete" cancel_text="Cancel" confirm_text="Yes"
                    ref="reset-confirm-modal" name=""></confirm-modal>

    <span class="hover_tooltip" ref="hoover_tooltip"></span>
    <modal ref="copy-product-modal" name="copy-product-modal" hide-footer @closed="resetModal" class="lockerroom-modal create-lockerroom-modal" id="modal-center-copydesign" :scrollable="true" size="xl">
      <div class="modal-header d-flex justify-content-between">
        <span class="fs-3 font-weight-bold">Copy Design</span>
        <span class="fs-4 font-weight-bold cursor-pointer modal-close" @click="$modal.hide('copy-product-modal')"><BIconX /></span>
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

          <div class="loader relative" v-if="viewLoader"><img src="../../src/assets/images/loading.gif" /></div>
        </div>
      </div>
    </modal>
  </span>

</template>

<script lang="ts">
import ClickOutside from 'vue-click-outside'
import {Component, Mixins, Prop, Vue, Watch} from 'vue-property-decorator'
import CreateLockerRoomModal from '@/components/CreateLockerRoomModal.vue'
import ExistingCollectionModal from '@/components/ExistingCollectionModal.vue'
import YearlyPlanner from '@/components/YearlyPlanner.vue'
import EventModal from "@/components/EventModal.vue";
import ErrorMessages from "@/mixins/ErrorMessages";
import Scene from "@/components/Scene.vue";
import draggable from "vuedraggable";
import html2pdf from "html2pdf.js"
import {http} from "@/httpCommon";
import ConfirmModal from "@/components/ConfirmModal.vue";
import {getRandom, setCustomLogo} from "@/helpers/Helpers";
import {differenceBy, intersectionBy, union, includes, findIndex} from 'lodash';
import {LockerProducts, handleMainProducts, exitEditMode} from "@/mixins/LockerProduct";
import ContactModal from "@/components/ContactModal.vue";
import { Popper } from 'popper-vue'
import 'popper-vue/dist/popper-vue.css'
import ModalAction from "@/mixins/ModalAction";

@Component<LockerRoom>({
  components: {
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
    ClickOutside
  },
  mounted() {
    let href: any = location.href;
    href = href.split('#')
    this.collection_base_url = `${href[0]}`
    if (this.lockers.length >0 ){
      this.copiedProductLockerId = this.lockers[0].id
    }
  }
})
export default class LockerRoom extends Mixins(ErrorMessages, LockerProducts, handleMainProducts, ModalAction, exitEditMode) {
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  private baseUrl = location.host + "/#/"
  public ref = this.$refs as Record<any, any>
  public colors: [] = []
  public viewLoader = false
  public copiedProductId = 0
  public copiedProductName = ''
  public copiedProductLockerId = 0
  public url = ''
  public group = ''
  public collection_available = false;
  public lockerActiveTabIndex = 0;
  public collection_base_url = ''
  public yearly_planner_template_id = null;
  public isSafari = (navigator.userAgent.toLowerCase().indexOf('safari') != -1) && !(navigator.userAgent.toLowerCase().indexOf('chrome') > -1)

  private observerCallback = (mutationsList:any, observer:any) => {
    // Use traditional 'for loops' for IE 11
    for(const mutation of mutationsList) {
      if (mutation.addedNodes.length) {
        console.log('A child node has been added or removed.', mutation);
        console.log('Nodes added', mutation.addedNodes.length);

        mutation.target.classList.add('dropping')
      }else if(mutation.removedNodes.length){
        console.log('Nodes removed', mutation.removedNodes.length);
        mutation.target.classList.remove('dropping')
      }
      else if (mutation.type === 'attributes') {
        // console.log('The ' + mutation.attributeName + ' attribute was modified.');
      }
    }
  }

  public markText($event:Record<any, any>) {
    $event.target.select()
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
  private dragEnd = () =>{
    console.log('started')
  }
  private setSelected(e: Record<any, any>) {
    console.log('ev', e.target)
  }
  public getCollectionData() {

    if(this.getCollections.length === 0){
        this.viewLoader = true
        this.setCollections();
        this.viewLoader = false
    }

  }

  private showTooltip(e: Record<any, any>) {
    let element = this.$el.querySelector(".hover_tooltip") as Record<any, any>
    element.style.opacity = '1'
    element.style.zIndex = '100'
    element.style.left = (e.clientX + 10) + 'px'
    element.style.top = (e.clientY + 17) + 'px'
    element.innerHTML = e.target.getAttribute('data-title')
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

  get mainproductId():number{
    return this.$store.getters.getEditMainProductId
  }

  get getCollections(): Record<any, any> {
    let main_product_id = this.$store.getters.getEditProductId;
    let collections = this.$store.getters.getCollections.map((item: Record<any, any>) => {
      item.collection_products = item.collection_products.map((collection: Record<any, any>) => {
        if (collection.product_locker_room.id == main_product_id) {
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
      if (!collection.link) {
        this.generateCollectionPdf(collection, index)
      }
    })
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

  get products(): [Record<any, any>] {
    return this.$store.getters.getProducts
  }
  get customLogos():[Record<any, any>] {
    return this.$store.getters.getCustomLogos()
  }

  get lockers(): Record<any, any> {
    return this.$store.getters.getLockers;
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
  public async generateCollectionPdf(collection:Record<any, any>, index:number) {
    let res = await this.$store.dispatch('getCollection', collection.id)
    this.collection_available = true;
    this.collectionData = res
    setTimeout(() => {
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
      html2pdf().set(opt).from(element).output('datauristring').then((pdf: any) => {
        let arr = pdf.split(',');
        pdf = arr[1];
        let data = new FormData();
        data.append("data", pdf);
        data.append('id', collection.id);
        http.post('savepdf', data).then(res => {
          Vue.set(this.getCollections[index], 'link', res.data.link)
        })
      });
    }, 3000)
  }

  public lockerStatus = 'not_accepted'

  public get popperID() {
    return this.$store.getters.getPopperID
  }

  public get getProductEditInfoObject() {
    return this.$store.getters.getProductEditInfoObject;
  }

  public showPopper(id:string){
    this.$store.commit('setPopper', id)
  }
  public hidePopper(){
    this.$store.commit('setPopper', '')
  }
  public alertt(){
    alert('setPopper')
  }

  public async shareProduct(product: Record<any, any>, ind: number, lockerIndex: number) {
    try {
      if(product){
          let payload = {
            type: 'locker',
            id: product.id,
            customer_id: this.customer ? this.customer.id : '',
            product_id: this.selectedProduct.product_id
          }
          let shared_url = "";
          if (product.shared_url) {
            shared_url += product.shared_url;
          } else {
            let res = await this.$store.dispatch('shareProduct', payload);
            shared_url += res.data.url;
            Vue.set(this.getLockerProducts[lockerIndex].product[ind], 'shared_url', shared_url)
          }

          this.showPopper('share'+lockerIndex+''+ind);
      }
    } catch (error) {
      console.log(error)
    }
  }
  async shareCollectionLink(collection:Record<any, any>, index:number){
    try {
      if(collection){
        let collections = {
          id: collection.id,
          file_name: collection.file_name
        }
        let shared_url = "";
        if (collection.shared_url) {
          shared_url += collection.shared_url;
        }
        else {
          let res = await http.post('collection/link', collections)
          shared_url += res.data.url;
          Vue.set(this.getCollections[index], 'shared_url', shared_url)
          console.log("url", this.getCollections[index].shared_url)
        }
        this.showPopper('share-collection'+index)
      }
    } catch (error) {
      console.log(error)
    }
  }

  public copyCollectionLink(ind: number) {
    let toCopy = this.$refs['copylink_' + ind] as Record<any, any>
    toCopy = toCopy[0].$el as Record<any, any>
    toCopy.select()
    try {
      document.execCommand('copy');
      this.showToast('Shareable link was copied to your clipboard.', 'SUCCESS');
    } catch (err) {
      this.showToast('Oops, unable to copy.', 'ERROR');
    }
  }

  public copyLink(room_index: number, ind: number) {
    let toCopy = this.$refs['copylink_product_' + room_index + '' + ind] as Record<any, any>
    toCopy = toCopy[0].$el as Record<any, any>
    toCopy.select()
    try {
      document.execCommand('copy');
      this.showToast('Shareable link was copied to your clipboard.', 'SUCCESS');
    } catch (err) {
      alert('Oops, unable to copy');
    }
  }

  public async deleteProduct(i: number, ind: number, id: number) {
    const ok = await this.ref['reset-confirm-modal'].showConfirm()
    if (ok) {
      let res = await this.$store.dispatch('deleteRoomProduct', {room_index: i, product_index: ind, id: id});
      if (res == true) {
        this.$store.commit('SET_RECENT_LOGOS')
        this.showToast('Product Deleted', 'SUCCESS')
      } else {
        this.showError(res)
      }
    }
  }

  public async deleteCollection(id: number, index: number) {
    try {
      const ok = await this.ref['reset-confirm-modal'].showConfirm()
      if (ok) {
        let res = await this.$store.dispatch('deleteCollection', {id: id, index: index});
        this.showToast(res.data.message, 'SUCCESS');
      }
    } catch (e) {
      this.showError(e);
    }
  }

  public async deleteRoom(id: number, index: number) {
    if (confirm('You are going to delete associated product')) {
      let res = await this.$store.dispatch('deleteRoom', {id: id, index: index});
      if (res == true) {
        this.showToast('room deleted', 'SUCCESS')
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

  public fetchColors(i: number, ind: number) {
    this.colors = JSON.parse(this.getLockerProducts[ind].folders[i].color);
  }

  public changeColor() {
    this.colors = []
  }

  public async addToCustomLogos(logo: Record<any, any>) {
    let index = this.logoTabIndex
    if(!logo.logo_colors) {
      logo.logo_colors = await this.fetchLogoColors(logo.id)
    }
    this.$store.commit('SET_COLORS_FROM_RECENT',false)
    await setCustomLogo(logo,index)
    this.$emit('hideLockerRoomModal')
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
  public handleLockerRoomChanged(){
    this.lockerActiveTabIndex = 0
    this.$store.commit("Change_Locker_Active_Tab", 0)
  }
  public handleTabChanged(tabIndex: number){
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


  public swapDesign(lockerIndex: number, productIndex: number) {
    let product: Record<any, any> = this.getLockerProducts[lockerIndex].product[productIndex];

    if (product.is_back_img == 0) {
      product.is_back_img = 1
      product.product_url = product.product_back_url
    } else {
      product.is_back_img = 0
      product.product_url = product.product_front_url
    }
    this.getLockerProducts[lockerIndex].product[productIndex] = product;
  }


  public async createYearlyPlanner(locker_room_id:number, index:number){
    let payload = {locker_id: locker_room_id, index};
    this.viewLoader = true
    let res = await this.$store.dispatch('createYearlyPlanner', payload)
    this.viewLoader = false
    if (res.status == 201){
     this.showToast('Yearly planner has been created successfully for this locker.', 'SUCCESS');
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
        this.showToast('Yearly planner has been created successfully with events for this locker.', 'SUCCESS');
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
        this.showToast('Yearly planner has been deleted successfully for this locker.', 'SUCCESS');
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
      this.showToast('Ics File created successfully', 'SUCCESS');
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

    .product-icons {
      list-style: none;
      padding: 0;
      margin: 0;
      position: absolute;
      right: -5px;
      top: -5px;
      z-index: 2;
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
  color: #666;
  text-transform: uppercase;
  font-size: 1rem;
  width: 100%;
  border: none;
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





</style>
