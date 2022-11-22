<template>
  <modal :minWidth="1000" :scrollable="true" :height="'auto'" :minHeight="600" :resizable="true" :adaptive="true"
    name="cart-modal" ref="cart-modal" id="cart-center-lockerroom" size="xl" class="cart-modal" modal-class="modal-fullscreen2"
    content-class="lockerroom-modal" @closed="customer_reference_no = null" @before-open="getAddresses">
    <div class="modal-header d-flex justify-content-between">
      <span class="fs-5 font-weight-bold">Cart</span>
      <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hideVModal('cart-modal')">
        <BIconX />
      </span>
    </div>

    <div class="theme-scroll" style="height: calc(100vh - 300px); overflow-y: auto; padding-bottom: 20px">
      <div class="loader relative" v-if="viewLoader || cartLoading"><img src="../../src/assets/images/loading.gif" /></div>
      <table class="table table-bordered b-table-fixed mb-0 w-100" v-if="cartItems">
        <thead class="bg-light">
          <tr>
            <th class="font-weight-bold">
              Product Name
            </th>
            <th class="font-weight-bold">
              Design Image
            </th>
            <th class="font-weight-bold">
              Quantity
            </th>
            <th colspan="2" class="font-weight-bold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(cart_item, cart_item_index) in cartItems">
            <tr :key="factory_product.id" v-for="(factory_product, factory_product_index) in cart_item.factory_products">
              <td>
                <template v-if="editingCartProductInfo && editingCartProductInfo.cart_item_id == cart_item.id">
                  <span title="Editing This Product" style="cursor:pointer;">{{ factory_product.product_name }}</span>
                </template>
                <template v-else="">
                  <a style="cursor:pointer;color:blue;text-decoration: underline"
                     @click="editCartItem(cart_item_index, factory_product_index)">{{ factory_product.product_name }}</a>
                </template>
              </td>
              <td>
                <div class="d-inline-flex gap-1">
                  <b-img style="width: 80px" thumbnail fluid :src="storageUrl + factory_product.front_image"
                         alt="Front Design"></b-img>
                  <b-img style="width: 80px" thumbnail fluid :src="storageUrl + factory_product.back_image"
                         alt="Back Design"></b-img>
                </div>
              </td>
              <td>
                <template v-if="editingCartProductInfo && editingCartProductInfo.cart_item_id == cart_item.id">
                  <span title="Editing This Product" style="cursor:pointer;">
                    {{ factory_product.product_roster_detail | itemQtyCount(factory_product.product_roster_detail) }}
                  </span>
                </template>
                <template v-else="">
                  <a style="font-weight: bold; cursor:pointer; color:blue;text-decoration: underline" @click="editCartItem(cart_item_index, factory_product_index, false)">
                    {{ factory_product.product_roster_detail | itemQtyCount(factory_product.product_roster_detail) }}
                  </a>
                </template>

              </td>
              <td class="cursor-pointer">
                <template v-if="editingCartProductInfo && editingCartProductInfo.cart_item_id == cart_item.id">
                  Editing
                </template>
                <template v-else="">
                  <a data-title="Delete Event" @click="deleteConfirm(cart_item, factory_product)">
                    <font-awesome-icon :icon="['fas', 'trash-alt']" />
                  </a>
                </template>
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <div class="p-3 grid grid-mobile-2 gap-2 text-left">
        <div class="well border-0" style="background: #f5f5f5">
          <div class="fs-2 font-weight-bold px-2 pt-1 pb-2">
            Shipping Address
          </div>
          <template v-if="shipping_address">
            <div class="px-2 pt-1 pb-2">
              <div>{{ shipping_address.first_name }} {{ shipping_address.last_name }}</div>
              <div>{{ shipping_address.address1 }}</div>
              <div>{{ shipping_address.address2 }}</div>
              <div>{{ shipping_address.zip_code }}</div>
              <div>{{ shipping_address.country.name }} {{ shipping_address.city }}</div>

              <div class="d-flex flex-wrap w-100">
                <div>{{ shipping_address.phone_number }}</div>

                <router-link :to="'address?cart=1'" class="btn ml-auto align-self-end btn-dark medium btn-sm my-orders">
                  <span style="font-size: 0.85em">
                    <b-icon-pencil />
                  </span> Change
                </router-link>
              </div>

            </div>
          </template>
          <div v-else class="px-2 pt-1 pb-2">
            <router-link :to="'/address?cart=1'" class="btn btn-secondary btn-sm my-orders">
              <span style="font-size: 0.9em">
                <b-icon-plus />
              </span> Add
            </router-link>
          </div>
        </div>

        <div class="align-self-start">
          <table class="table table-bordered b-table-fixed mb-0 w-100" v-if="cartItems">
            <thead class="bg-light">
              <tr>
                <th class="font-weight-bold">
                  Product Name
                </th>
                <th class="font-weight-bold">
                  MOQ
                </th>
                <th class="font-weight-bold">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(cart_item) in cartItems">
                <tr :key="factory_product.id" v-for="(factory_product) in filterCartItemsForMOQSummary(cart_item.factory_products)">
                  <td>
                      <span title="Editing This Product" style="cursor:pointer;">{{ factory_product.model_name }}</span>
                  </td>
                  <td>
                      <span>{{ factory_product.minimum_order_quantity == null ? "N/A" : factory_product.minimum_order_quantity }}</span>
                  </td>
                  <td :class="{highlightMOQ: (factory_product.roster_product_count < factory_product.minimum_order_quantity)}">
                    <template>
                      <span>{{ factory_product.roster_product_count }}</span>
                    </template>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
          <div class="fs-2 font-weight-bold mt-3">Team Name / order reference</div>
          <div class="mt-1">
            <b-form-input class="form-input" placeholder="Team Name / order reference" type="text" name="customer_reference_no"
              v-model="customer_reference_no" />
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-center" v-if="company.platform !== 'self' || (company.platform == 'self' && customerPermissions.includes('place-order'))">
        <b-button class="mt-4" @click="createOrder">Finalize Order</b-button>
      </div>
    </div>
  </modal>

</template>

<script lang="ts">

import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator'
import { http } from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";
import {
  getActiveProductData,
  getReminderOptions,
  getSelectedProductData,
  lastActiveProductDefaultObject,
  processColorsCustom
} from "@/helpers/Helpers";
import {LockerProducts, handleMainProducts, exitEditMode} from "@/mixins/LockerProduct";
import { findIndex } from "lodash";
import ModalAction from "@/mixins/ModalAction";
@Component<CartModal>({
  components: {},
  filters: {
    itemQtyCount: (value: Record<any, any>) => {
      if (value && value.length > 0) {
        let quantity = 0;
        value.forEach((roster: Record<any, any>) => {
          quantity += parseInt(roster.quantity);
        });
        return quantity
      }
      return 0
    }
  },
  async mounted() {
    // this.getColors()
    if (this.isCustomerAuthenticated){
      let ecommerce_update_id = this.$route.query.update_item;
      let santa_cart_id = String(this.$route.query.update_cart);

      if(ecommerce_update_id){
        let cart_items = await this.$store.getters.getCartItems;

        let cart_item_index = cart_items.findIndex((item) => {
          return item.id == parseInt(santa_cart_id)
        });

        if(cart_items[cart_item_index]){
          let factory_item_index = cart_items[cart_item_index].factory_products.findIndex((factory_item)=>{
            return factory_item.ecommerce_cart_id == ecommerce_update_id
          } );

          if(cart_items[cart_item_index].factory_products[factory_item_index]){
            if(this.$route.query.roster){
              this.editCartItem(cart_item_index, factory_item_index, false);
            }else{
              this.editCartItem(cart_item_index, factory_item_index, true);
            }
          }
        }
      }
    }

  }
})
export default class CartModal extends Mixins(ErrorMessages, LockerProducts, handleMainProducts, ModalAction,exitEditMode) {
  @Prop({ default: 3, required: true }) mainTotalTabs!: number

  public viewLoader = false;
  private userData = this.$store.getters.getCustomer;
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public customer_reference_no = ""
  public shipping_address: Record<any, any> | null = null
  public can_finalize_order = true;

  get cartItems() {
    let cItems = this.$store.getters.getCartItems;
    cItems.forEach((item:Record<any, any>) => {
    let uniqueProductContainer:Record<any, any> = [];
    item.factory_products.forEach((product:Record<any, any>) => {
        let product_count = 0;
        item.factory_products.forEach((nestProduct:Record<any, any>) => {
          if(product.product_id == nestProduct.product_id){
            if(typeof nestProduct.product_roster_detail != 'undefined' && nestProduct.product_roster_detail != null){
              nestProduct.product_roster_detail.forEach((roster:Record<any, any>) => {
                product_count += parseInt(roster.quantity);
              });
            }
          }
        });
        if(uniqueProductContainer.includes(product.product_id)){
          product.show_in_summary = false;
        }else{
          uniqueProductContainer.push(product.product_id);
          product.show_in_summary = true;
        }
        product.roster_product_count = product_count;
      });
    });

    return cItems;
  }
  get getProductSkus(){
    return this.$store.getters.getProductsSkus;
  }
  get company(){
    return this.$store.getters.getCompany;
  }
  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }
  get cartLoading(): Record<any, any>{
    return this.$store.getters.getCartLoading;
  }
  get customerPermissions(){
    return this.$store.getters.getCustomerPermissions
  }
  get editingCartProductInfo() {
    return this.$store.getters.getProductEditInfoObject['cart_product_info']
  }

  public filterCartItemsForMOQSummary(cartItems:Record<any, any>){
    this.can_finalize_order = true;
    return cartItems.filter(item =>{
      if(typeof item.roster_product_count !== 'undefined' && item.minimum_order_quantity != null && item.roster_product_count < item.minimum_order_quantity)
        this.can_finalize_order = false;
      return typeof item.show_in_summary !== 'undefined' && item.show_in_summary === true;
    });
  }

  public createOrder() {
    if(!this.can_finalize_order){
      this.showToast(`${this.$t('minimum_order_cart_message')}`, "error");
      return false;
    }
    let payload = {}
    // const response = await this.editModeConfirmation();
    payload['customer_reference_no'] = this.customer_reference_no
    if (!this.customer_reference_no) {
      this.showToast('Please provide customer reference number.', 'error');
      return false;
    }

    if (this.shipping_address) {
      payload['address_id'] = this.shipping_address.id
    } else {
      this.showToast('Please select shipping address.', 'error');
      return false;
    }

    this.viewLoader = true;
    http.post('order', payload).then((res: Record<any, any>) => {
      if (res.data.success) {
        this.$store.dispatch('addToCart', [])
        this.showToast(res.data.message, 'success');
        this.showToast('Your pdf is generating', 'success');
        this.viewLoader = false;
        // this.hideVModal('cart-modal')
        this.$router.push('/thank-you')
      }
      else {
        this.viewLoader = false
        this.showError('Your order could not created')
      }
    }).catch((err: any) => {
      this.viewLoader = false
      this.showErrorArr(err.response.data.errors)
    });
  }

  public async getAddresses() {
    this.$store.commit('SHOW_CART_MODAL', false);
    let address = this.$store.getters.getShippingAddress
    if (!address) {
      address = await this.$store.dispatch('getCartAddresses');
      this.shipping_address = address
    } else {
      this.shipping_address = address
    }

  }
  public hide(){
    this.hideVModal('cart-modal');
  }

  public async editCartItem(cart_item_index: number, factory_product_index: number, edit=true) {
    let self = this;
    await this.setLastActiveProductData()
    let cart_item = self.cartItems[cart_item_index];
    let cart_item_product = cart_item.factory_products[factory_product_index]
    let cart_product_type = cart_item_product.product_type
    let is_customized = false;
    let is_personalized = false;
    let is_private = cart_item_product.is_private?true:false;
    cart_product_type = is_private? "private":cart_product_type;

    //As in cart edit mode there will be only one product is shown in listing. So that product will be of type customized or personalized.
    switch(cart_product_type) {
      case "private":
        is_private = true;
        is_customized = false;
        is_personalized = false;
        break;
      case "customized":
        is_private = false;
        is_customized = true;
        is_personalized = false;
        break;
      case "personalized":
        is_private = false;
        is_customized = false;
        is_personalized = true;
    }

    await this.$store.dispatch('setProductType', { prd_type: "customized", value: is_customized });
    await this.$store.dispatch('setProductType', { prd_type: "personalized", value: is_private });
    await this.$store.dispatch('setPrivateProduct', is_private);

    self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", {
      editing: true,  type: "cart_product", filters: {customized: is_customized, personalized: is_personalized, search_products: "", private_product: is_private}, locker_product_info: null, cart_product_info: {
        cart_item_index: cart_item_index, cart_item_id: cart_item.id, cart_item_product_index: factory_product_index, cart_item_product: cart_item_product
      },
      order_product_info: null
    })
    self.$store.dispatch('setProductsRosters', {product_id: cart_item_product.product_id, roster_data: cart_item_product.product_roster_detail })

    //this.$store.commit('UPDATE_ROSTER', JSON.parse(JSON.stringify(cart_item_product.roster_detail)));
    this.$root.$emit('rostershared', '')
    let url = `list/products?customized=${is_customized}&personalized=${is_personalized}&private=${is_private}&active_product_id=${cart_item_product.product_id}&active_product_type=cart_product`;
    self.$store.commit("SET_PRODUCTS_NEXT_PAGE_NO", null)
    await http.get(url).then(async (response: Record<any, any>) => {
      await (this as Record<any, any>).handleMainProducts(response);

    })
    if(!is_private){
      await this.$store.dispatch('setProductType', { prd_type: cart_item_product.product_type, value: true });
    }else{
      this.$store.dispatch('setPrivateProduct', is_private);
    }
    this.hideVModal('cart-modal')
    if (!edit) {
      await this.$store.dispatch('setTabMain', {value: (this.mainTotalTabs + 1)})
      this.showVModal('rostermodal');
    }
  }

  public async setLastActiveProductData() {
    let active_product_data = getSelectedProductData(false)
    let last_active_product_object = lastActiveProductDefaultObject(active_product_data)
    this.$store.commit('SET_LAST_ACTIVE_PRODUCT_DATA', last_active_product_object)
  }

  public deleteConfirm(cart_item: Record<any, any>, factory_product: Record<any, any>) {
    this.$emit("deleteCartItem", { cart_item: cart_item, factory_product: factory_product });
  }

}

</script>

<style lang="scss" scoped>
.highlightMOQ{
  background: #FF4500;
  color: #ffffff;
}
.loader {
  &.relative {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 1070;
    height: 100%;
    width: 100%;
    background: rgba(255, 255, 255, 0.9);
    padding: 20px;
  }
  &.global {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 99999;
    height: 100%;
    width: 100%;
    background: rgba(255, 255, 255, 1);
  }

  img {
    max-width: 7%;
    display: block;
    margin: 0 auto;
    height: auto;
  }
}
</style>
