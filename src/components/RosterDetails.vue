<template>
  <div class="roster-section">
    <div class="d-flex align-items-center justify-content-between bg-light p-2">
      <div class="align-self-start" :style="{margin: company.platform != 'cdnExceptLogin' ? '19px 0 0 0' : '0 0 0 37px'}">
        <template v-if="selectedProduct.allow_name_number && (custom_name_index != -1 || custom_number_index != -1) && lockerRosters && lockerRosters.length">
          <label for="">Select roster from product</label>
          <b-form-select class="mt-1" v-model="selected_locker_roster" @change="changeRoster($event)" text-field="product_name"  value-field="id" :options="lockerRosters"></b-form-select>
        </template>
      </div>
      <div class="ml-auto" :class="{'mr-2': !!(selectedProduct.allow_name_number && (custom_name_index != -1 || custom_number_index != -1) && rosterDetails.length > 0)}">
        <a v-if="productModels.length > 0 && Object.prototype.hasOwnProperty.call(productModels[modelIndex],'image_url') && productModels[modelIndex].image_url" class="btn btn-secondary fs-3 btn-sm"
                  title="Size Guide"
           :href="`${storage_url}${productModels[modelIndex].image_url}`"
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
      </div>
      <div class="d-flex gap-1" v-if="selectedProduct.allow_name_number && (custom_name_index != -1 || custom_number_index != -1) && rosterDetails.length > 0">
        <b-button @click="updateRosterPlayerNameFormat('capitalized')" class="btn btn-secondary fs-3 btn-sm"
          title="Capitalize">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" vie wBox="0 0 16 16">
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
        <div class="align-left" :class="{ 'justify-content-start pl-4': !selectedProduct.allow_name_number }">
          <template v-if="selectedProduct.allow_name_number">
            <div class="hide-show"></div>
            <div v-if="custom_name_index != -1" class="roster-name">Name</div>
            <div v-if="custom_number_index != -1" :style="{maxWidth: custom_name_index == -1 && '70%', flexBasis: custom_name_index == -1 && '70%'}" class="shirt-no">No</div>
          </template>
          <div class="shirt-size" :class="{ 'no-name-number': !(custom_name_index != -1 || custom_number_index != -1) }">Size</div>
        </div>
        <div class="align-right">
          <div class="qty">Qty</div>
          <div class="remove"></div>
        </div>
      </div>
      <template v-for="(product_roster_item, productRosterItemIndex) in productRoster">
        <div class="roster-row mb-2" :key="`roster_item_${productRosterItemIndex}`">
          <div class="align-left">
            <template v-if="allowNameAndNumbers">
              <div class="hide-show">
                <a v-if="custom_name_index != -1 || custom_number_index != -1" @click="handleRosterItemFocus(productRosterItemIndex)">
                  <font-awesome-icon :icon="['fas', productRosterItemIndex == active_roster_index ? 'eye' : 'eye-slash']" />
                </a>
              </div>
              <div v-if="custom_name_index != -1" class="roster-name">
                <b-form-input :value="product_roster_item.text" @input="handleRosterUpdate($event, 'name', productRosterItemIndex)"
                              @focus="handleRosterItemFocus(productRosterItemIndex)"
                ></b-form-input>
              </div>
              <div v-if="custom_number_index != -1" :style="{maxWidth: custom_name_index == -1 && '70%', flexBasis: custom_name_index == -1 && '70%'}" class="shirt-no">
                <b-form-input class="text-center" :value="product_roster_item.number"
                              @input="handleRosterUpdate($event, 'number', productRosterItemIndex)"
                              @focus="handleRosterItemFocus(productRosterItemIndex)"
                ></b-form-input>
              </div>
            </template>
            <div class="shirt-size" :class="{ 'no-name-number': !(custom_name_index != -1 || custom_number_index != -1)}">
              <b-form-select @change="handleRosterUpdate($event, 'size', productRosterItemIndex)" :value="product_roster_item.size_index">
                <b-form-select-option v-for="(productSize, psIdx) in productSizes" :key="psIdx" :value="psIdx">
                  {{ productSize.text }}</b-form-select-option>
              </b-form-select>
            </div>
          </div>
          <div class="align-right">
            <div class="qty">
              <b-form-input class="text-center" placeholder="0" @input="handleRosterUpdate($event, 'quantity', productRosterItemIndex)"
                            :value="product_roster_item.quantity"></b-form-input>
            </div>
            <div class="remove" v-if="productRosterItemIndex > 0 && active_roster_index != productRosterItemIndex">
              <a @click="$store.commit('REMOVE_ROSTER_ITEM', productRosterItemIndex)">
                <font-awesome-icon :icon="['fas', 'trash-alt']" />
              </a>
            </div>
          </div>

        </div>
      </template>
    </div>

    <div class="button-holder mt-3 gap-2 d-flex justify-content-end">
      <button class="btn btn-secondary w-auto fw-bold" @click="addRosterItem">Add Player</button>
      <button v-if="!isLoading" class="btn btn-secondary w-auto fw-bold" @click="close">
        <template v-if="getProductEditInfoObject.editing && getProductEditInfoObject.type == 'cart_product'">Update Item</template>
        <template v-else>OK</template>
      </button>
      <button v-if="getProductEditInfoObject.editing && getProductEditInfoObject.type == 'cart_product'" class="btn btn-secondary w-auto light fw-bold" @click="hideVModal('rostermodal'), $root.$children[0].$children[2].cancelCart()">
        Cancel
      </button>
    </div>

    <div class="d-flex justify-content-center mt-3" v-if="getProductEditInfoObject.editing == false || (getProductEditInfoObject.editing && getProductEditInfoObject.type == 'locker_product')">
<!--      <button v-if="!$root.$refs.Order_Details.isLoading" class="btn btn-secondary w-auto fw-bold" @click="addToCart"-->
      <template v-if="!isCustomerAuthenticated" >
        <template v-if="company.platform !== 'self'">
          <button class="btn btn-secondary w-auto fw-bold" @click="$root.$children[0].$children[2].setActionBeforeLogin('addToCart')"
                  :disabled="canvasImage.scene == null">
            Add to Cart
          </button>
        </template>
      </template>
      <template v-else-if="!isLoading && !(getProductEditInfoObject.editing && getProductEditInfoObject.type == 'locker_product') && !getCollectionView">
        <template v-if="company.platform !== 'self'  || (company.platform == 'self' && customerPermissions.includes('place-order'))">
          <button class="btn btn-secondary w-auto fw-bold" @click="addToCart"
            :disabled="canvasImage.scene == null">
            Add to Cart
          </button>
        </template>
      </template>
      <template v-else-if="!getCartLoading">
        <template v-if="company.platform !== 'self'  || (company.platform == 'self' && customerPermissions.includes('place-order'))">
          <button class="btn btn-secondary w-auto fw-bold" @click="addToCartMixin(products_fonts)"
                  :disabled="canvasImage.scene == null">
            Add to Cart
          </button>

        </template>
      </template>
      <button v-else class="btn btn-secondary w-auto fw-bold" :disabled="true">
        <img width="20" height="20" src="../../src/assets/images/loading.gif" />
      </button>

    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator'
import {find, findIndex, map} from 'lodash';
import ErrorMessages from '@/mixins/ErrorMessages';
import {cartModalData} from "@/mixins/LockerProduct";
import ModalAction from "@/mixins/ModalAction";
import { rosterDefaultItem } from "@/helpers/Helpers";


@Component<RosterDetails>({
  components: {
  },
  mounted() {
    this.fontsColorsManipulation()
    this.fontsList()
  },
})
export default class RosterDetails extends Mixins(ErrorMessages, ModalAction,cartModalData) {
  /* component props starts */
  @Prop({ required: true }) readonly products_fonts!: Record<any, any>
  @Prop({required: false}) lockerRosters: Record<any, any>[]
  @Prop({ required: true }) productSizes!: any

  /* component data properties starts */
  public currentIcon = 'eye-slash'
  private screenWidth = (window.screen.availWidth - 100)
  private storage_url = process.env.VUE_APP_STORAGE_URL
  public isActive = false
  public fileData: Record<any, any>[] = []
  public firstColor!: Record<any, any>
  public fontsColors: any[] = []
  public fontOptions: Record<any, any>[] = []
  public obj = {
    text: '',
    number: '',
    size_index: '',
    size: '',
    code: '',
    quantity: 5,
    information: ''
  };
  private roster: any[] = []
  public ref = this.$refs as Record<any, any>
  public rosters: any[] = []
  public selected = this.productSizes[0]
  public secondColor!: Record<any, any>
  public selected_locker_roster = null
  public active_roster_index = 0

  /* component computed props starts */

  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }
  get getCartLoading(): boolean {
    return this.$store.getters.getCartLoading;
  }
  get getCollectionView():boolean{
    return this.$store.getters.getCollectionView;
  }
  get getProductEditInfoObject() {
    return this.$store.getters.getProductEditInfoObject;
  }
  get productModels() {
    return this.$store.getters.getProductModels;
  }
  get modelIndex(): Record<any,any>{
    return this.$store.getters.getSelectedModelIndex;
  }


  private async addToCart() {
    if (!this.rosterDetails.some(el => el.quantity == 0)) {
      await this.addToCartMixin(this.products_fonts);
      this.hideVModal('rostermodal')

      if(this.company.platform != 'wordpress'){
        this.showVModal('cart-modal')
      }
    } // if quantity is not zero
    else {
      this.showToast("Quantity must be atleast 1", "error")
    } // toast message if quantity is zero
  }

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get allowNameAndNumbers() {
    return this.selectedProduct.allow_name_number
  }

  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getSelectedProductRoster()
  }

  get company() {
    return this.$store.getters.getCompany
  }

  get customText(): Record<any, any>[] {
    return this.$store.getters.getCustomTexts();
  }

  get custom_name_index() : number {
    return findIndex(this.customText, { type: 'name' })
  }

  get custom_number_index() : number {
    return findIndex(this.customText, { type: 'number' })
  }

  get eyeIndex(): number {
    return this.$store.getters.getEyeIndex;
  }

  get canvasImage() {
    return this.$store.getters.getCanvasImage
  }

  get productRoster(): Record<any, any>[] {
    return this.$store.getters.getSelectedProductRoster()
  }

  get isLoading(): Record<any, any>[] {
    return this.$store.getters.getCartLoading;
  }

  get customerPermissions(){
    return this.$store.getters.getCustomerPermissions
  }

  /* component methods starts */

  public addPlayer(obj: Record<any, any>) {
    this.$emit('addPlayer', this.rosterDetails.length);
  }

  public addRosterItem() {
    let self: Record<any, any> = this;
    let roster_items = JSON.parse(JSON.stringify(this.resetRosterItem(this.productRoster[0])));
    roster_items = [...this.productRoster, roster_items];
    self.$store.dispatch('setProductsRosters', {product_id: self.selectedProduct.id, roster_data: roster_items})
  }

  public resetRosterItem(roster_item: Record<any, any>) {
    roster_item = JSON.parse(JSON.stringify(roster_item))
    let first_size = this.productSizes[0].value
    return Object.assign(roster_item, {
      text: '',  number: '',  size_index: 0,  size: first_size,  code: first_size, quantity: 1, information: ''
    })
  }

  public changeRoster(locker_roster_id:any){
    let self: Record<any, any> = this;
    if(locker_roster_id) {
      this.active_roster_index = 0
      let selected_roster = find(this.lockerRosters, ["id", locker_roster_id])
      selected_roster = JSON.parse(JSON.stringify(selected_roster))
      let roster_items = selected_roster ? selected_roster.product_roster_detail : null;
      roster_items = roster_items.map((roster_item: Record<any, any>) => {
        let size_index = findIndex(self.productSizes, ["value", roster_item.size])
        let roster_size = roster_item.size;
        if(size_index === -1 ) {
          size_index = 0
          roster_size = this.productSizes[0].text
        }
        return Object.assign(roster_item, {code: roster_size, size_index: size_index})
      })
      self.$store.dispatch('setProductsRosters', {product_id: self.selectedProduct.id, roster_data: roster_items})
      let first_roster_item = roster_items[0]
      self.syncRosterWithCustomText("name", first_roster_item.text)
      self.syncRosterWithCustomText("number", first_roster_item.number)
    }
  }

  public removeIndex(ind: number) {
    if (this.customText.length > 0) {
      if (this.customText[0]) {
        this.$store.dispatch('updateCustomTextAttribute', { index: 0, on_all: true, attribute: 'text', value: '' })
      }
      if (this.customText[1]) {
        this.$store.dispatch('updateCustomTextAttribute', { index: 1, on_all: true, attribute: 'text', value: '' })
      }
    }
    this.$store.dispatch('removeRoster', ind);
  }

  public fontsColorsManipulation() {
    this.selectedProduct.namecolors.forEach((colors: any, key: number) => {
      let finalColor = { color_text: [] }
      finalColor.color_text = colors.json_data
      this.fontsColors = this.fontsColors.concat(finalColor)
    })
    if (this.fontsColors.length) {
      this.firstColor = this.fontsColors[0].color_text[0]
      this.secondColor = this.fontsColors[0].color_text ? this.fontsColors[0].color_text[1] : this.fontsColors[0].color_text[0]
    }
  }

  public close() {
    this.$store.commit('SET_HIDE_SAVE_LOCKER_BUTTON', false);
    this.$store.commit('SET_REVERT_ROSTER_BOOL',true);
    let self = this;
    let collection_view = self.$store.getters.getCollectionView;

    setTimeout(async () =>{
      if(self.getProductEditInfoObject.editing && self.getProductEditInfoObject.type == 'cart_product'){
     // if(this.editCart.cartId && this.editCart.cartItemId){

        await self.addToCartMixin(self.products_fonts);
        this.hideVModal('rostermodal')
        if(collection_view){
          this.$root.$emit('closeCollectionView');
        }
        if(this.company.platform != 'wordpress'){
          this.showVModal('cart-modal')
        }


      }else{
        if(collection_view){
          this.$root.$emit('closeCollectionView');
        }
        this.hideVModal('rostermodal')
      }
    },500);
  }

  public fontsList(): void {
    let productFonts = this.selectedProduct.namefonts
    productFonts.forEach((fonts: any, key: number) => {
      let fontNameParam = fonts.file_url.split('/').reverse()
      fontNameParam = fontNameParam[0].split('.')
      let fontName = fontNameParam[0].replace('-', ' ').toUpperCase()
      let font = {
        value: fontNameParam[0] as string,
        text: fontName as string
      }
      this.fontOptions = this.fontOptions.concat([font])
    })
  }

  public updateRosterSize(selected_size_index: number, roster: Record<any, any>) {
    let selected_size = this.productSizes[selected_size_index];
    if (selected_size) {
      roster.size = selected_size.name
      roster.code = selected_size.name
    }
  }

  public editRosterPlayer(index: number) {
    this.$store.commit('CHANGE_EYE_INDEX', index)
    this.$store.commit('SET_EDITING_ROSTER_PLAYER_INDEX', index)
  }

  public updateRosterPlayerNameFormat(selected_format: string) {
    let updated_roster: Record<any, any>[] = [];
    this.rosterDetails.forEach(roster_detail => {
      if (roster_detail.text) {
        let roster_player_name = roster_detail.text;
        if (selected_format == "capitalized") {
          roster_detail.text = roster_player_name.charAt(0).toUpperCase() + roster_player_name.slice(1).toLowerCase();
        } else {
          roster_detail.text = roster_player_name[selected_format]();
        }
        updated_roster.push(roster_detail);
      }
      this.$store.commit('UPDATE_ROSTER', updated_roster)
    })
  }

  public async handleRosterUpdate(updated_val:string, type: string, roster_index: number) {
    const self: Record<any, any> = this;
    let roster_updated_key = type == 'name' ? 'text' : type;
    let product_id = self.selectedProduct.id;
    let roster_data = {
      [roster_updated_key] : updated_val
    }
    if(type == 'size') {
      // in case of type size the updated value will have selected size index
      let selected_size = self.productSizes[updated_val]
      roster_data['size_index'] = updated_val
      roster_data['size'] = selected_size.value
      roster_data['code'] = selected_size.value
    }
    self.$store.dispatch('setProductsRosters', {product_id: product_id, roster_index: roster_index, roster_data: roster_data})
    //The custom text first item of type name and numbers are synced with the first row (name and number) of the roster.
    if(['name', 'number'].includes(type)) {
      await self.syncRosterWithCustomText(type, updated_val)
    }
  }

  public async syncRosterWithCustomText(type: string, text_number_value: string) {
    const self: Record<any, any> = this;
    let product_custom_texts = self.$store.getters.selectedProductCustomTexts();
    const custom_name_number_index = type == 'name' ? this.custom_name_index : this.custom_number_index;
    //The custom text first item of type name or number depending upon type is synced with the first row input with label name or number.
    if(custom_name_number_index >= 0) {
      let custom_text_synced_with_roster = JSON.parse(JSON.stringify(product_custom_texts[custom_name_number_index]));
      custom_text_synced_with_roster.value = text_number_value
      self.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", { index: custom_name_number_index, value: custom_text_synced_with_roster})
      self.$eventBus.$emit("customTextUpdated", {
        emitter: "input", custom_text_index: custom_name_number_index, value: custom_text_synced_with_roster
      });
    }

  }

  public handleRosterItemFocus(roster_index: number) {
    let self: Record<any, any> = this;
    this.active_roster_index = roster_index;
    let product_custom_texts = this.$store.getters.selectedProductCustomTexts();
    let active_roster = this.productRoster[roster_index]

    if(this.custom_number_index >= 0) {
      let custom_number_text = product_custom_texts[this.custom_number_index]
      custom_number_text.value = active_roster.number
      self.$eventBus.$emit("customTextUpdated", {
        emitter: "input", custom_text_index:self.custom_number_index, value: custom_number_text
      });
    }


    if(this.custom_name_index >= 0) {
      let custom_name_text = product_custom_texts[this.custom_name_index]
      custom_name_text.value = active_roster.text
      self.$eventBus.$emit("customTextUpdated", {
        emitter: "input", custom_text_index:self.custom_name_index, value: custom_name_text
      });
    }
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
</style>
