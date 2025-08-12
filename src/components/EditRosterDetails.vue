<template>
  <modal id="modal-scrollable" :width="screenWidth"
         :resizable="true"
         :scrollable="true"
         height="auto"
         :reset="true"
         :shiftY="0"
         @before-open="setEditRosterMounted()"
         name="editrostermodal" class="roster-modal" size="xl"
         footer-class="hide-modal-footer d-none"
  >
    <div class="modal-header d-flex justify-content-between">
      <span class="fs-5 font-weight-bolder">Edit {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}}</span>
      <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="close"><BIconX /></span>
    </div>
    <div class="modal-body">
      <div class="d-flex flex-wrap justify-content-between">
        <div class="roster-section">
          <div class="loader" v-if="showLoader"><img src="@assets/images/loading.gif" /></div>
          <div class="px-2 d-flex gap-1 flex-wrap align-items-center justify-content-between">
            <div>
              Add {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster'}} details from excel file:
            </div>

            <div class="d-flex gap-2 mt-1">
              <button @click="downloadSampleTemplate(product_id)" class="btn btn-secondary btn-sm"
                      v-b-tooltip="'Download the sample file of microsoft excel to fill the data to upload it later'">
                <b-icon-download /><br>
                Download roster excel template
              </button>
              <form name="upload_excel" ref="upload_excel">
                <div class="excel-file-uploader">
                  <b-icon-file-earmark-excel-fill />
                  <div style="white-space: nowrap" class="drop-file">Upload roster excel template</div>
                  <div style="white-space: nowrap">Upload roster excel template</div>
                  <input type="file" @input="uploadExcelFile($event, true)">
                </div>
              </form>
            </div>
          </div>
          <div class="d-flex mt-2 align-items-center justify-content-between bg-light p-2">
            <div class="align-self-start" :style="{margin: company.platform != 'cdnExceptLogin' ? '0 0 0 0' : '0 0 0 37px'}">
              <div class="d-flex gap-2" v-if="allow_name_number
               && lockers && lockers.length">
                <div>
                  <label>Select Locker</label>
                  <b-form-select class="mt-1" v-model="selected_locker" @change="handleLockerUpdate($event)" :options="lockers"
                                 text-field="room_name" value-field="products"
                  ></b-form-select>
                </div>
                <div v-if="locker_rosters.length > 0">
                  <label>Select product to copy from</label>
                  <div class="d-flex gap-1 align-items-end">
                    <select class="form-control mt-1 custom-select" @change="handleLockerProductChange" :key="selected_locker_roster">
                      <option :value="null">Please Select Locker Product</option>
                      <template v-for="(locker_roster) in locker_rosters">
                        <option :value="locker_roster.id" :key="`${locker_roster.id}${selected_locker_roster}`" :selected="locker_roster.id == selected_locker_roster">
                          {{locker_roster.product_name}}
                        </option>
                      </template>
                    </select>
                    <b-button class="flex-shrink-1 w-auto" title="Undo" v-if="show_undo_roster_btn" @click="loadLastRoster"> <BIconReplyFill /> </b-button>
                  </div>
                </div>
              </div>
            </div>
            <div class="ml-auto" :class="{'mr-2': (allow_name_number && product_locker_roster && product_locker_roster.length > 0)}">
              <template v-if="size_image_url">
                <a v-if="size_image_url" class="btn btn-secondary fs-3 btn-sm"
                   title="Size Guide"
                   :href="`${storage_url}${size_image_url}`"
                   target="_blank"
                >
                  <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet">
                    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                       fill="currentColor" stroke="none">
                      <path d="M3855 5101 c-26 -16 -1647 -1637 -3328 -3326 -459 -462 -527 -534 -527 -560 0 -26 75 -105 593 -622 519 -519 596 -593 622 -593 26 0 255 225
              1967 1938 1713 1712 1938 1941 1938 1967 0 26 -74 103 -593 622 -466 467 -597 593 -617 593 -14 0 -38 -9 -55 -19z m565 -686 l515 -515 -327 -327 -328 -328
              -368 368 c-326 325 -371 367 -399 367 -40 0 -71 -27 -79 -68 -7 -33 -1 -39 365 -405 l371 -372 -230 -230 -230 -230 -223 223 c-209 208 -225 222 -259 222
              -28 0 -42 -7 -57 -26 -43 -54 -38 -61 204 -304 l225 -225 -232 -232 -233 -233 -365 365 c-337 336 -369 365 -400 365 -44 0 -80 -33 -80 -74 0 -27 44 -75 367
              -398 l368 -368 -227 -227 -228 -228 -223 223 c-199 198 -227 222 -255 222 -41 0 -82 -38 -82 -77 0 -22 40 -68 220 -248 121 -121 220 -225 220 -230 0 -6
              -101 -111 -225 -235 l-225 -225 -362 362 c-200 198 -373 364 -386 368 -47 14 -102 -30 -102 -83 0 -9 164 -181 365 -382 201 -201 365 -370 365 -375 0 -6
              -149 -159 -330 -340 l-330 -330 -518 518 -517 517 1855 1855 c1020 1020 1857 1855 1860 1855 3 0 237 -232 520 -515z"/>
                    </g>
                  </svg>

                  <span class="ml-1" style="font-size: smaller">Size Guide</span>
                </a>
              </template>
            </div>
            <div class="d-flex gap-1" v-if="allow_name_number && product_locker_roster && product_locker_roster.length > 0">
              <b-button @click="updateRosterPlayerNameFormat('capitalized')" class="btn btn-secondary fs-3 btn-sm"
                        title="Capitalize">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16">
                  <path
                    d="m2.244 13.081.943-2.803H6.66l.944 2.803H8.86L5.54 3.75H4.322L1 13.081h1.244zm2.7-7.923L6.34 9.314H3.51l1.4-4.156h.034zm9.146 7.027h.035v.896h1.128V8.125c0-1.51-1.114-2.345-2.646-2.345-1.736 0-2.59.916-2.666 2.174h1.108c.068-.718.595-1.19 1.517-1.19.971 0 1.518.52 1.518 1.464v.731H12.19c-1.647.007-2.522.8-2.522 2.058 0 1.319.957 2.18 2.345 2.18 1.06 0 1.716-.43 2.078-1.011zm-1.763.035c-.752 0-1.456-.397-1.456-1.244 0-.65.424-1.115 1.408-1.115h1.805v.834c0 .896-.752 1.525-1.757 1.525z" />
                </svg>
              </b-button>
              <b-button @click="updateRosterPlayerNameFormat('toUpperCase')" class="btn btn-secondary fs-3 btn-sm"
                        title="Uppercase">
                <svg height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 16 16"
                     fill="currentColor">
                  <path
                    d="M1.3,13l0.9-2.8h3.4L6.6,13h1.2L4.5,3.8H3.3L0,13H1.3z M4,5.2l1.4,4.1H2.5L4,5.2C3.9,5.2,4,5.2,4,5.2z" />
                  <path
                    d="M9.4,13l0.9-2.8h3.4l0.9,2.8H16l-3.3-9.2h-1.2L8.2,13H9.4z M12.1,5.2l1.4,4.1h-2.8L12.1,5.2C12.1,5.2,12.1,5.2,12.1,5.2z" />
                </svg>
              </b-button>
              <b-button @click="updateRosterPlayerNameFormat('toLowerCase')" class="btn btn-secondary fs-3 btn-sm"
                        title="Lowercase">
                <svg height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 16 16"
                     fill="currentColor">
                  <path d="M13.9,11.4L13.9,11.4l0,1h1.3V6.8c0-1.7-1.3-2.7-3-2.7c-2,0-3,1-3,2.5h1.3c0.1-0.8,0.7-1.4,1.7-1.4c1.1,0,1.7,0.6,1.7,1.7
              v0.8h-2.2c-1.9,0-2.9,0.9-2.9,2.3c0,1.5,1.1,2.5,2.7,2.5C12.8,12.6,13.5,12.1,13.9,11.4L13.9,11.4z M11.9,11.5
              c-0.9,0-1.7-0.5-1.7-1.4c0-0.7,0.5-1.3,1.6-1.3h2.1v1C13.9,10.7,13.1,11.5,11.9,11.5z" />
                  <path d="M5.8,11.4L5.8,11.4l0,1h1.3V6.8c0-1.7-1.3-2.7-3-2.7c-2,0-3,1-3,2.5h1.3C2.4,5.8,3,5.2,4,5.2c1.1,0,1.7,0.6,1.7,1.7v0.8H3.6
              c-1.9,0-2.9,0.9-2.9,2.3c0,1.5,1.1,2.5,2.7,2.5C4.6,12.6,5.3,12.1,5.8,11.4L5.8,11.4z M3.7,11.5c-0.9,0-1.7-0.5-1.7-1.4
              c0-0.7,0.5-1.3,1.6-1.3h2.1v1C5.8,10.7,4.9,11.5,3.7,11.5z" />
                </svg>
              </b-button>
            </div>
          </div>
          <div class="mt-3">
            <div class="roster-row mb-2">
              <div class="align-left" :class="{ 'justify-content-start pl-4': !allow_name_number }">
                <template v-if="allow_name_number">
                  <div class="hide-show"></div>
                  <div v-if="custom_name_exists" class="roster-name">Name</div>
                  <div v-if="custom_number_exists" class="shirt-no" :style="{maxWidth: !custom_name_exists && '70%',
                 flexBasis: !custom_name_exists && '70%'}">
                    No
                  </div>
                </template>
                <div class="shirt-size" :class="{ 'no-name-number': !(custom_name_exists || custom_number_exists) }">Size</div>
              </div>
              <div class="align-right">
                <div class="qty">Qty</div>
                <div class="remove"></div>
              </div>
            </div>
            <template v-if="product_locker_roster">
              <template v-for="(product_roster_item, productRosterItemIndex) in product_locker_roster">
                <div class="roster-row mb-2" :key="`roster_item_${productRosterItemIndex}`">
                  <div class="align-left">
                    <template v-if="allow_name_number">
                      <div class="roster-name">
                        <b-form-input :value="product_roster_item.text" @input="handleRosterItemUpdate($event, 'text', productRosterItemIndex)"
                        ></b-form-input>
                      </div>
                      <div  class="shirt-no" :style="{maxWidth: !custom_name_exists && '70%',
                    flexBasis: !custom_name_exists && '70%'}"
                      >
                        <b-form-input class="text-center" :value="product_roster_item.number" @input="handleRosterItemUpdate($event, 'number', productRosterItemIndex)"
                        ></b-form-input>
                      </div>
                    </template>
                    <div class="shirt-size" :class="{ 'no-name-number': !(custom_name_exists || custom_number_exists)}">
                      <b-form-select :value="product_roster_item.size" @input="handleRosterItemUpdate($event, 'size', productRosterItemIndex)">
                        <b-form-select-option v-for="(productSize, psIdx) in productSizes" :key="psIdx" :value="productSize.text">
                          {{ productSize.text }}</b-form-select-option>
                      </b-form-select>
                      <div v-if="false" class="tooltip guide">Press enter to view the options</div>
                    </div>
                  </div>
                  <div class="align-right">
                    <div class="qty">
                      <b-form-input
                        class="text-center"
                        @keydown.tab.stop="addRosterItemOnTab"
                        @input="handleRosterItemUpdate($event, 'quantity', productRosterItemIndex)"
                        placeholder="0" :value="product_roster_item.quantity"
                        type="number" min="1" step="1"
                      />
                    </div>
                    <div class="remove" v-if="productRosterItemIndex > 0 && active_roster_index != productRosterItemIndex">
                      <a @click="removeRosterItem(productRosterItemIndex)">
                        <font-awesome-icon :icon="['fas', 'trash-alt']" />
                      </a>
                    </div>
                  </div>

                </div>
              </template>
            </template>
          </div>

          <div class="button-holder mt-3 gap-2 d-flex justify-content-end">
            <button class="btn btn-secondary w-auto fw-bold" @click="addRosterItem">Add Player</button>
            <button class="btn btn-secondary w-auto fw-bold light" @click="close">
              Close
            </button>
          </div>

          <div class="d-flex justify-content-center mt-3">
            <b-button v-if="!loading" aria-label="Update Roster"
                      class="mx-2 px-5 w-25" variant="secondary" @click="updateRoster">Update Roster
            </b-button>
            <b-button v-else aria-label="Update Roster" class="mx-2 px-5 w-25" variant="secondary" @click="updateRoster">
              <img width="20" height="20" src="@assets/images/loading.gif"/>
            </b-button>
          </div>
        </div>
        <div class="roster-preview-area">
          <div class="preview-section p-3 d-flex flex-wrap justify-content-center align-items-center">
            <div class="loading-holder">
              <div class="d-flex flex-row w-50">
                <img :src="`${storage_url}${product_front_url}`" class="img-fluid" alt="">
                <img :src="`${storage_url}${product_back_url}`" class="img-fluid" alt="">
              </div>
            </div>
          </div>
          <div class="d-flex py-2 fs-3 justify-content-end">
            <div>Total:</div>
            <div class="ml-4 font-weight-bolder">{{ totalQuantity }}</div>
          </div>
        </div>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator'
import {filter, find, findIndex, map} from 'lodash';
import ErrorMessages from '@/mixins/ErrorMessages';
import ModalAction from "@/mixins/ModalAction";
import {http} from "@/httpCommon";
import RosterTabMixin from "@/mixins/RosterTabMixin";


@Component<EditRosterDetails>({})
export default class EditRosterDetails extends Mixins(ErrorMessages, ModalAction, RosterTabMixin) {
  /*
  * component props starts
  * */

  @Prop({ required: true }) lockers!: Record<any, any>[]
  @Prop({ required: true }) locker_id: number

  /*
  * component props starts
  * */

  /*
  *  component data properties starts
  * */
  private screenWidth = (window.screen.availWidth - 100)
  private storage_url = process.env.VUE_APP_STORAGE_URL
  public default_obj = {
    text: '',
    number: '',
    size: '',
    quantity: 1,
    information: ''
  };
  public ref = this.$refs as Record<any, any>
  public selected_locker_roster = null
  public selected_locker = null
  public locker_rosters: Record<any, any>[] = []
  public roster_previous_state: Record<any, any>[] = []
  public show_undo_roster_btn = false
  public product_locker_roster: Record<any,any> = [];

  public roster_data = {}
  public product_back_url = null;
  public product_front_url = null
  public productSizes: Array<Record<any, any>> = [];
  public product_id = 0
  public size_image_url = null
  public allow_name_number = true;
  public show_roster_change_warning = false;
  public custom_name_exists = true;
  public custom_number_exists = true;
  public display_name = null;
  public loading = false;

  get company() {
    return this.$store.getters.getCompany
  }

  get totalQuantity() {
    if(this.product_locker_roster && this.product_locker_roster.length > 0){
      return this.product_locker_roster.reduce((sum, item) => parseInt(sum) + parseInt(item.quantity), 0);
    }
    else {
      return 0
    }
  }

  public addRosterItemOnTab($event:Record<any, any>) {
    (this.active_roster_index + 1 == this.productRoster.length) && !$event.shiftKey && this.addRosterItem();
  }

  public close() {
   this.selected_locker_roster = null
   this.selected_locker = null
   this.locker_rosters = []
   this.roster_previous_state = []
   this.show_undo_roster_btn = false
   this.product_locker_roster = [];
   this.roster_data = {}
   this.product_back_url = null;
   this.product_front_url = null
   this.productSizes = [];
   this.product_id = 0
   this.size_image_url = null
   this.allow_name_number = true;
   this.show_roster_change_warning = false;
   this.display_name = null;
   this.hide()
  }

  public updateRosterPlayerNameFormat(selected_format: string) {
    this.product_locker_roster.map((roster_detail) => {
      if (roster_detail.text) {
        let roster_player_name = roster_detail.text;
        if (selected_format == "capitalized") {
          roster_detail.text = roster_player_name.charAt(0).toUpperCase() + roster_player_name.slice(1).toLowerCase();
        } else {
          roster_detail.text = roster_player_name[selected_format]();
        }
      }
      return roster_detail;
    })
  }

  public handleLockerUpdate(updated_val: Record<any, any>[]) {
    this.selected_locker_roster = null
    if(updated_val) {
      this.locker_rosters = updated_val
    } else {
      this.locker_rosters = []
    }
  }

  public loadLastRoster() {
    this.product_locker_roster = this.roster_previous_state;
    this.show_undo_roster_btn = false
    this.locker_rosters = []
    this.selected_locker_roster = null
    this.selected_locker = null
  }

  public async addRosterItem() {
    this.show_roster_change_warning = true
    let roster_items = JSON.parse(JSON.stringify(this.resetRosterItem(this.product_locker_roster[0])));
    this.product_locker_roster = Array.isArray(this.product_locker_roster) ? [...this.product_locker_roster, roster_items] : [this.product_locker_roster, roster_items];
  }

  public async handleLockerProductChange(locker_product_id: any) {
    const self = this as Record<any, any>;
    locker_product_id = locker_product_id.target.value
    if(locker_product_id) {
      locker_product_id = parseInt(locker_product_id);
      if(this.show_roster_change_warning) {
        self.$santaModal.show({
          icon: 'warning', title: 'Are you sure?', text: 'Do you want to overwrite the current information',
          confirm_text: 'Yes, change it', cancel_text: 'No', close_on_confirm: true
        },self).then(async (result) => {
          if (result) {
            this.show_roster_change_warning = false
            this.show_undo_roster_btn = true
            this.roster_previous_state = JSON.parse(JSON.stringify(this.product_locker_roster))
            this.selected_locker_roster = locker_product_id
            this.selectLockerProductRoster()
          }
          else {
            let last_selected_roster = this.selected_locker_roster
            this.selected_locker_roster = null
            setTimeout(() => {
              this.selected_locker_roster = last_selected_roster
            }, 10)
          }
        });
      }
      else {
        this.selected_locker_roster = locker_product_id
        this.roster_previous_state = JSON.parse(JSON.stringify(this.product_locker_roster))
        this.show_undo_roster_btn = true
        this.selectLockerProductRoster()
      }
    }
    else {
      this.selected_locker_roster = null
    }
  }

  public selectLockerProductRoster(){
    let self: Record<any, any> = this;
    let selected_roster = this.locker_rosters && find(this.locker_rosters, ["id", this.selected_locker_roster])
    selected_roster = JSON.parse(JSON.stringify(selected_roster))
    let roster_items = selected_roster ? selected_roster.product_roster_detail : null;
    roster_items = roster_items.map((roster_item: Record<any, any>) => {
      let size_index = findIndex(self.productSizes, ["value", roster_item.size])
      let roster_size = roster_item.size;
      if(size_index === -1 ) {
        size_index = 0
        if(this.productSizes.length > 0){
          roster_size = this.productSizes[0].text
        }
      }
      return Object.assign(roster_item, { size: roster_size })
    })
    this.product_locker_roster = roster_items;
  }

  public fixRosterSizes() {
    let roster_items = this.product_locker_roster;
    roster_items = roster_items.map((roster_item: Record<any, any>) => {
      let size_index = findIndex(this.productSizes, ["value", roster_item.size])
      let roster_size = roster_item.size;
      if(size_index === -1 ) {
        size_index = 0
        if(this.productSizes.length > 0){
          roster_size = this.productSizes[0].text
        }
      }
      return Object.assign(roster_item, {size: roster_size})
    })
    this.product_locker_roster = roster_items;
  }

  public async removeRosterItem(roster_item_index) {
    this.product_locker_roster.splice(roster_item_index, 1);
  }

  public async show(){
    this.showVModal('editrostermodal')
  }

  public hide(){
    this.hideVModal('editrostermodal')
  }

  public handleRosterItemUpdate( newValue, property, roster_index){
    this.product_locker_roster.splice(roster_index, 1, { ...this.product_locker_roster[roster_index], [property]: newValue });
  }

  public updateRoster(){
    this.loading = true;
    const product_roster = JSON.stringify(this.product_locker_roster);
    const payload = {
      locker_product_id: this.locker_id,
      product_roster_detail: product_roster
    }
    http.post(`update-roster`, payload).then((res) => {
      this.hide()
      this.loading = false
      this.showToast('Roster updated Successfully', 'success');
      this.$emit('roster-updated',{id: this.locker_id, totalQuantity: this.totalQuantity});
    }).catch(err => {
      this.loading = false
      this.showToast('Something went wrong, pleas try again', 'error');
    });
  }

  public async downloadSampleTemplate(prod_id:any){
    await http.get(`template/download/${prod_id}`,{
      responseType: 'blob',
    }).then((res) => {
      const blob = new Blob([res.data],{type:res.headers['content-type']})
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = 'product_'+ this.display_name +'_template.xlsx';
      link.click();
    })
  }

  public setEditRosterMounted(){
    setTimeout(()=> {
      if(this.locker_id){
        http.get(`get-product-locker-roster/${this.locker_id}`).then((res) => {
          const{product_locker_detail, sizes, size_image_url, allow_name_number, display_name  } = res.data.result
          const {product_roster_detail, product_back_url, product_front_url, product_id } = product_locker_detail;
          const {json_data} = sizes;
          this.product_back_url = product_back_url
          this.product_front_url = product_front_url
          this.product_id =  product_id
          this.size_image_url = size_image_url;
          this.allow_name_number = allow_name_number === 1 ? true: false;
          this.display_name = display_name;
          json_data.forEach((size: any, key: number) => {
            let sizes: Record<any, any> = { value: size.name, text: size.name };
            this.productSizes = this.productSizes.concat([sizes]);
          });
          if(product_roster_detail){
            this.product_locker_roster = product_roster_detail
            const initialObject = this.product_locker_roster[0];
            this.custom_name_exists = initialObject.hasOwnProperty("text");
            this.custom_number_exists = initialObject.hasOwnProperty("number");


          }
          else{
            const InitialMidSizeIndex = Math.ceil((this.productSizes.length - 1)/2);
            this.default_obj.size = this.productSizes[InitialMidSizeIndex].value;
          }
          this.show()

        }).catch(err => {
          this.showToast('Something went wrong, please try again', 'error')
          this.hide()
        })
      }
    }, 200)

  }
}
</script>

<style lang="scss" scoped>
.roster-upload-area {
  overflow: hidden;
  margin: 0 0 15px;
  padding: 0;

  h3 {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 10px;
  }

  .btn {
    margin: 0 0 10px;

    svg {
      fill: #fff;
      color: #fff;
    }

    &:hover {
      svg {
        fill: #219f84;
        color: #219f84;
      }
    }
  }
}

.roster-template-area {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;

  .btn-secondary {
    font-size: 14px;
    color: #219F84;
    background: #E7F4F1;
    font-weight: 500;
    flex: 0 0 48%;
    max-width: 48%;
    border-color: #E7F4F1;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
      background: #219f84;
      color: #fff;

      a {
        color: #fff;
      }
    }

    .custom-file {
      position: absolute;
      right: 22%;
      left: 0;
      top: 0;
      bottom: 0;
      opacity: 0;
      margin: 0;
      width: auto;
    }

    a {
      color: #219f84;
      margin: 0 0 0 3px;

      &:hover {
        color: #fff;
      }
    }
  }
}

.excel-file-uploader{
  position: relative;
  background: var(--theme-color-light);
  border:1px solid var(--theme-color);
  border-radius: 4px;
  padding: 10px 20px;
  color: var(--theme-color);
  cursor: pointer;
  text-align: center;
  overflow: hidden;
  flex-shrink: 0;
  min-width: 190px;

  .drop-file{
    display: none;
  }

  &:hover{
    border-style: dashed;

    div:not(.drop-file){
      display: none;
    }
    .drop-file{
      display: block;
    }
  }

  input{
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
