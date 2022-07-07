<template>
  <div class="roster-section">
    <div class="d-flex align-items-center justify-content-between bg-light p-2">
      <div class="align-self-start" :style="{margin: company.platform != 'cdnExceptLogin' ? '19px 0 0 0' : '0 0 0 37px'}">
        <template v-if="selectedProduct.allow_name_number && (custom_name_index != -1 || custom_number_index != -1) && lockerRosters && lockerRosters.length">
          <label for="">Select roster from product</label>
          <b-form-select class="mt-1" @change="changeRoster($event)"  :options="lockerRosters"></b-form-select>
        </template>
      </div>
      <div class="d-flex gap-1" v-if="selectedProduct.allow_name_number && (custom_name_index != -1 || custom_number_index != -1) && rosterDetails.length > 0">
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
      <template v-for="(roster, index) in rosterDetails">
        <div class="roster-row mb-2" :key="index">
          <div class="align-left">
            <template v-if="selectedProduct.allow_name_number">
              <div class="hide-show">
                <a v-if="custom_name_index != -1 || custom_number_index != -1" @click="editRosterPlayer(index)">
                  <font-awesome-icon :icon="['fas', index === eyeIndex ? 'eye' : 'eye-slash']" />
                </a>
              </div>
              <div v-if="custom_name_index != -1" class="roster-name">
                <b-form-input ref="myInputs" v-model="roster.text" @focus="editRosterPlayer(index)"></b-form-input>
              </div>
              <div v-if="custom_number_index != -1" :style="{maxWidth: custom_name_index == -1 && '70%', flexBasis: custom_name_index == -1 && '70%'}" class="shirt-no">
                <b-form-input  ref="myInputs" class="text-center" v-model="roster.number"
                  @focus="editRosterPlayer(index)"></b-form-input>
              </div>
            </template>
            <div class="shirt-size" :class="{ 'no-name-number': !(custom_name_index != -1 || custom_number_index != -1)}">
              <b-form-select ref="myInputs" @input="updateRosterSize($event, roster)" v-model="roster.size_index">
                <b-form-select-option v-for="(productSize, psIdx) in productSizes" :key="psIdx" :value="psIdx">
                  {{ productSize.text }}</b-form-select-option>
              </b-form-select>
            </div>
          </div>
          <div class="align-right">
            <div class="qty">
              <b-form-input class="text-center" ref="myInputs" placeholder="0" v-model="roster.quantity"></b-form-input>
            </div>
            <div class="remove" v-if="rosterDetails.length > 1">
              <a @click="removeIndex(index)">
                <font-awesome-icon :icon="['fas', 'trash-alt']" />
              </a>
            </div>
          </div>

        </div>
      </template>
    </div>

    <div class="button-holder mt-3 gap-2 d-flex justify-content-end">
      <button class="btn btn-secondary w-auto fw-bold" @click="addPlayer">Add Player</button>
      <button v-if="!isLoading" class="btn btn-secondary w-auto fw-bold" @click="close">
        <template v-if="getProductEditInfoObject.editing && getProductEditInfoObject.type == 'cart_product'">Update Item</template>
        <template v-else>OK</template>
      </button>
      <button v-if="getProductEditInfoObject.editing && getProductEditInfoObject.type == 'cart_product'" class="btn btn-secondary w-auto light fw-bold" @click="hideVModal('rostermodal'), $root.$children[0].$children[2].cancelCart()">
        Cancel
      </button>
    </div>

    <div class="d-flex justify-content-center mt-3" v-if="getProductEditInfoObject.editing == false">
<!--      <button v-if="!$root.$refs.Order_Details.isLoading" class="btn btn-secondary w-auto fw-bold" @click="addToCart"-->
      <template v-if="!isCustomerAuthenticated" >
        <button class="btn btn-secondary w-auto fw-bold" @click="$root.$children[0].$children[2].setActionBeforeLogin('addToCart')"
          :disabled="canvasImage.scene == null">
          Add to Cart
        </button>
      </template>
      <template v-else-if="!isLoading">
        <button class="btn btn-secondary w-auto fw-bold" @click="addToCart"
          :disabled="canvasImage.scene == null">
          Add to Cart
        </button>
      </template>
      <button v-else class="btn btn-secondary w-auto fw-bold" :disabled="true">
        <img width="20" height="20" src="../../src/assets/images/loading.gif" />
      </button>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator'
import { findIndex } from 'lodash';
import ErrorMessages from '@/mixins/ErrorMessages';
import ModalAction from "@/mixins/ModalAction";


@Component<RosterDetails>({
  components: {
  },
  mounted() {
    this.fontsColorsManipulation()
    this.fontsList()
  },
})
export default class RosterDetails extends Mixins(ErrorMessages, ModalAction) {
  @Prop({ required: true }) productSizes!: any
  @Prop({required: false}) lockerRosters: Record<any, any>[]
  private roster: any[] = []
  public fileData: Record<any, any>[] = []
  public selected = this.productSizes[0]
  public firstColor!: Record<any, any>
  public secondColor!: Record<any, any>
  public currentIcon = 'eye-slash'
  public ref = this.$refs as Record<any, any>
  public obj = {
    text: '',
    number: '',
    size_index: '',
    size: '',
    code: '',
    quantity: 5,
    information: ''
  };
  public rosters: any[] = []
  public fontsColors: any[] = []
  public fontOptions: Record<any, any>[] = []
  public isLoading = false;

  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  get getProductEditInfoObject() {
    return this.$store.getters.getProductEditInfoObject;
  }

  private addToCart() {
    if (!this.rosterDetails.some(el => el.quantity == 0)) {
      this.isLoading = true;
      (this.$root.$refs as Record<any,any>).Order_Details.addToCart();
      this.hideVModal('rostermodal')
      this.isLoading = false;
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
  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails()
  }
  get company() {
    return this.$store.getters.getCompany
  }

  // get editCart(): Record<any, any> {
  //   return this.$store.getters.getEditCart
  // }
  get rosterFirstNameAndNumber(): string | null {
    let editing_roster_player_index = this.editing_roster_player_index
    if (this.rosterDetails && this.rosterDetails.length > 0) {
      // |;| is just name and number separator
      let roster_text = this.rosterDetails[editing_roster_player_index].text ? this.rosterDetails[editing_roster_player_index].text : ''
      let roster_num = this.rosterDetails[editing_roster_player_index].number ? this.rosterDetails[editing_roster_player_index].number : ''
      return `${roster_text}|;|${roster_num}`;
    } else {
      return null;
    }
  }

  get customText(): Record<any, any>[] {
    return this.$store.getters.getCustomTexts();
  }
  get eyeIndex(): number {
    return this.$store.getters.getEyeIndex;
  }

  get canvasImage() {
    return this.$store.getters.getCanvasImage
  }

  public addPlayer(obj: Record<any, any>) {
    this.$emit('addPlayer', this.rosterDetails.length);
  }

  get custom_name_index() : number {
    return findIndex(this.customText, { type: 'name' })
  }

  get custom_number_index() : number {
    return findIndex(this.customText, { type: 'number' })
  }

  public changeRoster(res:any){
    this.$store.commit('UPDATE_ROSTER', JSON.parse(res))
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
      finalColor.color_text = JSON.parse(colors.json_data)
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

    setTimeout(() =>{
      if(self.getProductEditInfoObject.editing && self.getProductEditInfoObject.type == 'cart_product'){
     // if(this.editCart.cartId && this.editCart.cartItemId){
        self.isLoading = true;
        (this.$root.$refs as Record<any,any>).Order_Details.addToCart();
        this.hideVModal('rostermodal')
        if(this.company.platform != 'wordpress'){
          this.showVModal('cart-modal')
        }
        self.isLoading = false;

      }else{
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

    // let all_products_custom_texts = this.$store.getters.getCustomTexts(null,true);
    // for (const product_id in all_products_custom_texts) {
    //   all_products_custom_texts[product_id].forEach(() => {
    //     console.log("sdfd")
    //   })
    //
    // }
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
