<template>
  <modal :minWidth="1000" width="100%" :minHeight="600" height="auto"
    name="cart-modal" ref="cart-modal" id="cart-center-lockerroom" size="xl" class="cart-modal absolute-modals" modal-class="modal-fullscreen2"
    content-class="lockerroom-modal" @closed="customer_reference_no = null" @before-open="getAddresses">
    <div class="modal-header d-flex justify-content-between">
      <span class="fs-5 font-weight-bold">Cart</span>
      <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hideVModal('cart-modal')">
        <BIconX />
      </span>
    </div>

    <div style="height: calc(100vh - 300px); padding-bottom: 20px; overflow: hidden; overflow-y: auto;" class="theme-scroll-v">
      <div class="loader relative" v-if="viewLoader || cartLoading"><img src="@assets/images/loading.gif" /></div>

      <div class="theme-scroll-h" style="overflow-y: auto; width: 100%">
        <table class="table table-bordered mb-0" v-if="cartItems" style="min-width: 800px; table-layout: fixed">
          <thead class="bg-light">
          <tr>
            <th style="width: 30%" class="font-weight-bold">
              Product Name
            </th>
            <th style="width: 25%" class="font-weight-bold">
              Design Image
            </th>
            <th style="width: 10%" class="font-weight-bold">
              Quantity
            </th>
            <th style="width: 25%" class="font-weight-bold">
              Addons
            </th>
            <th style="width: 10%" class="font-weight-bold">
              Actions
            </th>
          </tr>
          </thead>
          <tbody>
          <template v-for="(cart_item, cart_item_index) in cartItems">
            <template v-for="(factory_product, factory_product_index) in cart_item.factory_products">
              <tr :key="factory_product.id" >
                <td>
                  <template v-if="editingCartProductInfo.cart_product_info.cart_item_product && editingCartProductInfo.type == 'cart_product' && editingCartProductInfo.cart_product_info.cart_item_product.id == factory_product.id">
                    <span title="Editing This Product" style="cursor:pointer;">{{ factory_product.product_name }}</span>
                  </template>
                  <template v-else="">
                    <a style="cursor:pointer;color:blue;text-decoration: underline"
                       @click="editCartItem(cart_item_index, factory_product_index, true, false)">{{ factory_product.product_name }}</a>
                  </template>
                </td>
                <td>
                  <div class="d-inline-flex gap-1">
                    <b-img style="width: 80px" thumbnail fluid :src="storageUrl + factory_product.front_image"
                           alt="Front Design"></b-img>
                    <b-img v-if="factory_product.back_image" style="width: 80px" thumbnail fluid :src="storageUrl + factory_product.back_image"
                           alt="Back Design"></b-img>
                  </div>
                </td>
                <td>
                  <template v-if="editingCartProductInfo.cart_product_info.cart_item_product && editingCartProductInfo.type == 'cart_product' && editingCartProductInfo.cart_product_info.cart_item_product.id == factory_product.id">
                  <span title="Editing This Product" style="cursor:pointer;">
                    {{ factory_product.product_roster_detail | itemQtyCount(factory_product.product_roster_detail) }}
                  </span>
                  </template>
                  <template v-else="">
                    <a style="font-weight: bold; cursor:pointer; color:blue;text-decoration: underline" @click="editCartItem(cart_item_index, factory_product_index, false, true)">
                      {{ factory_product.product_roster_detail | itemQtyCount(factory_product.product_roster_detail) }}
                    </a>
                  </template>

                </td>
                <td>
                  <template v-if="factory_product.addons">
                    <template v-for="(addon, addonIndex) in factory_product.addons">
                      <div :key="`cart-addon-${addon.addon_id}`" class="d-flex w-100" :class="{'border-top mt-1': addonIndex > 0}">
                        {{ addon.title }}
                        <template v-if="product_price_object.show_price">
                          :<strong class="font-weight-bold ml-auto">{{ addon.currencies[0].symbol }} {{addon.currencies[0].price }}</strong>
                        </template>
                      </div>
                    </template>
                  </template>
                </td>
                <td>
                  <template v-if="editingCartProductInfo.cart_product_info.cart_item_product && editingCartProductInfo.type == 'cart_product' && editingCartProductInfo.cart_product_info.cart_item_product.id == factory_product.id">
                    Editing
                  </template>
                  <template v-else="">
                    <a data-title="Delete Event" class="cursor-pointer" @click="deleteConfirm(cart_item, factory_product)">
                      <font-awesome-icon :icon="['fas', 'trash-alt']" />
                    </a>
                  </template>
                </td>
              </tr>
            </template>

          </template>
          </tbody>
        </table>
      </div>

      <div class="p-3 grid grid-2 gap-2 text-left">
        <div class="well border-0" style="background: #f5f5f5">
          <div class="fs-2 font-weight-bold px-2 pt-1 pb-2">
            Shipping Address
          </div>
          <template v-if="shipping_address">
            <div class="px-2 pt-1 pb-2">
              <div>{{ shipping_address.first_name + ' ' + shipping_address.last_name }}</div>
              <div v-if="shipping_address.email">{{ shipping_address.email }}</div>
              <div v-if="shipping_address.phone_number">{{ shipping_address.phone_number }}</div>
              <div v-if="shipping_address.company_name">{{ shipping_address.company_name }}</div>
              <div v-if="shipping_address.address1">{{ shipping_address.address1 }}</div>
              <div v-if="shipping_address.address2">{{ shipping_address.address2 }}</div>
              <div>
                <span v-if="shipping_address.city">{{ shipping_address.city }}</span>
                <span v-if="shipping_address.city">{{ ' ' }}</span>
                <span v-if="shipping_address.state">{{ shipping_address.state }}</span>
                <span v-if="shipping_address.state">{{ ' ' }}</span>
                <span v-if="shipping_address.zip_code">{{ shipping_address.zip_code }}</span>
                <span v-if="shipping_address.zip_code">{{ ' ' }}</span>
              </div>
              <div class="d-flex flex-wrap w-100">
                <div>{{ shipping_address.country.name }}</div>

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

        <div class="align-self-start" style="max-width: 100%">
          <div class="theme-scroll-h" style="overflow: hidden; max-width: calc(95vw - 32px); overflow-x: auto">
            <table class="table table-bordered mb-0 w-100" v-if="cartItems">
              <thead class="bg-light">
                <tr>
                  <th class="font-weight-bold">
                    Product/Addon Name
                  </th>
                  <th class="font-weight-bold">
                    Quantity
                  </th>
                  <template v-if="product_price_object.show_price">
                    <th class="font-weight-bold">
                      Price
                    </th>
                    <th class="font-weight-bold">
                      Total
                    </th>
                  </template>
                </tr>
              </thead>
              <tbody>
                <template v-for="(cart_item, index) in cartItems">
                  <template v-for="(factory_product) in cart_item.factory_products">
                    <tr :key="factory_product.id" >
                      <td>
                        <span title="Editing This Product" style="cursor:pointer;">{{ factory_product.product_name }}</span>
                      </td>
                      <td>
                        <span>{{ factory_product.product_price_object.quantity }}</span>
                      </td>
                      <template v-if="product_price_object.show_price">
                        <td :class="{highlightMOQ: (factory_product.roster_product_count < factory_product.minimum_order_quantity)}">
                          <template>
                            <span>{{ factory_product.product_price_object.currency_symbol }}{{
                                factory_product.product_price_object.product_price
                              }} </span>
                          </template>
                        </td>
                        <td>
                          {{ factory_product.product_price_object.currency_symbol }}{{ parseInt(factory_product.product_price_object.quantity) * parseFloat(factory_product.product_price_object.product_price) }}
                        </td>
                      </template>
                    </tr>
                    <template v-for="(addon, addon_index) in factory_product.addons">
                      <tr class="bg-light" :key="factory_product.id+index+addon_index">
                        <td :style="{'border-bottom-color': factory_product.addons.length-1 === addon_index && '#ccc'}">
                          {{addon.title}}
                        </td>
                        <td :style="{'border-bottom-color': factory_product.addons.length-1 === addon_index && '#ccc'}">
                          {{factory_product.product_price_object.quantity}}
                        </td>
                        <template v-if="product_price_object.show_price">
                          <td :style="{'border-bottom-color': factory_product.addons.length-1 === addon_index && '#ccc'}">
                            {{ addon.currencies[0].symbol }}{{ addon.currencies[0].price }}
                          </td>
                          <td :style="{'border-bottom-color': factory_product.addons.length-1 === addon_index && '#ccc'}">
                            {{ addon.currencies[0].symbol }}{{ parseInt(factory_product.product_price_object.quantity) * parseFloat(addon.currencies[0].price) }}
                          </td>
                        </template>
                      </tr>
                    </template>
                  </template>
                </template>

                <tr v-if="product_price_object.show_price">
                  <td></td>
                  <td colspan="2" class="font-weight-bold">Total Price</td>
                  <td colspan="2" class="font-weight-bold">
                    {{ product_price_object.active_currency.symbol }}{{ cartTotalPrice }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="fs-2 font-weight-bold mt-3">General comments</div>
          <div class="mt-1">
            <b-form-input class="form-input" placeholder="Any comments?" type="text" name="general_comments"
              v-model="general_comments" />
          </div>
          <div class="fs-2 font-weight-bold mt-3"><span class="text-danger">*</span> Team Name / order reference</div>
          <div class="mt-1">
            <b-form-input class="form-input" placeholder="Team Name / order reference" type="text" name="customer_reference_no"
              v-model="customer_reference_no" />
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-center" v-if="company.platform !== 'self' || (company.platform == 'self' && company.id !== 1) || (company.platform == 'self' && company.id === 1 && customerPermissions.includes('place-order'))">
        <b-button class="mt-4" @click="createOrder">Confirm Order</b-button>
      </div>
    </div>
  </modal>

</template>

<script lang="ts">

import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator'
import { http } from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";
import {
  getActiveProductData, getEditModeDefaultObj,
  getReminderOptions,
  getSelectedProductData,
  lastActiveProductDefaultObject, logData,
  processColorsCustom
} from "@/helpers/Helpers";
import {LockerProducts, handleMainProducts, exitEditMode, ProductsQueryParamsMixin} from "@/mixins/LockerProduct";
import { findIndex } from "lodash";
import ModalAction from "@/mixins/ModalAction";
import { FetchCategories } from '@/mixins/SelectedProductMixin'
@Component<CartModal>({
  methods: {logData},
  components: {},
  filters: {
    itemQtyCount: (value: Record<any, any>) => {
      if (value && value.length > 0) {
        let quantity = 0;
        value.forEach((roster: Record<any, any>) => {
          quantity += parseInt(roster.quantity);
        });
        return Number(quantity)
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
            if(this.company.platform === 'wordpress'){
              return factory_item.ecommerce_cart_id == ecommerce_update_id
            }else if(this.company.platform === 'shopify'){
              return factory_item.id == ecommerce_update_id
            }

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
export default class CartModal extends Mixins(ErrorMessages, LockerProducts, handleMainProducts, ModalAction, exitEditMode, FetchCategories, ProductsQueryParamsMixin) {
  public viewLoader = false;
  private userData = this.$store.getters.getCustomer;
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public customer_reference_no = ""
  public general_comments = ""
  public shipping_address: Record<any, any> | null = null
  public can_finalize_order = true;

  get cartTotalPrice() {
    const {show_price} = this.$store.getters.getProductPriceObject
    let total_price = 0
    if(show_price) {
      this.cartItems.forEach((cart_item: Record<any, any>) => {
        const cart_item_factory_products:Record<any, any>[] = cart_item.factory_products;
        cart_item_factory_products.forEach((cart_item_factory_product: Record<any, any>) => {
          const {product_price} = cart_item_factory_product.product_price_object
          total_price += parseInt(cart_item_factory_product.product_price_object.quantity) * parseFloat(product_price)
          cart_item_factory_product.addons.forEach((factory_product_addon: Record<any, any>) => {
            total_price += factory_product_addon.currencies.length > 0 && factory_product_addon.currencies[0].price ?
              parseInt(cart_item_factory_product.product_price_object.quantity) * parseFloat(factory_product_addon.currencies[0].price) : 0;
         })
        })
      })
    }
    return total_price
  }

  get cartItems() {
    let cItems = this.$store.getters.getCartItems;
    this.can_finalize_order = true;
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
        if(product.roster_product_count < product.minimum_order_quantity) {
          this.can_finalize_order = false;
        }
      });
    });

    return cItems;
  }
  get getProductSkus(){
    return this.$store.getters.getProductsSkus;
  }
  get sku_information(){
    return this.$store.getters.getSkuInformation
  }
  get company(){
    return this.$store.getters.getCompany;
  }
  get product_price_object(){
    return this.$store.getters.getProductPriceObject;
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
    return this.$store.getters.getProductEditInfoObject
  }
  get mainTotalTabs(){
    return this.$store.getters.getMainTotalTabs;
  }

  public createOrder() {
    if(!this.can_finalize_order){
      this.showToast(`${this.$t('minimum_order_cart_message',
        {
          product_name: this.$store.getters.getSelectedProduct.display_name,
          min_products_count: this.sku_information.minimum_order_quantity
        })}`,
        "error", 9000);
      return false;
    }
    let payload = {}
    // const response = await this.editModeConfirmation();
    payload['customer_reference_no'] = this.customer_reference_no
    payload['general_comments'] = this.general_comments
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

  public async editCartItem(cart_item_index: number, factory_product_index: number, edit=true, backToCart=false) {
    let self = this;
    let cart_item = self.cartItems[cart_item_index];
    let cart_item_product = cart_item.factory_products[factory_product_index];

      let is_private = this.$store.getters.getPrivateProduct;
      //As in cart edit mode there will be only one product is shown in listing. So that product will be of type customized or personalized.
      let ecommerce_cart_id = (self.$route.query.update_item)?self.$route.query.update_item:null;
      let shopify_line_item = (self.$route.query.line)?self.$route.query.line:null;
      if(ecommerce_cart_id){
        this.$router.push({ name: 'Home' });
      }

      self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", {
        editing: true,  type: "cart_product", filters: {search_products: "", private_product: is_private},
        locker_product_info: getEditModeDefaultObj('locker_product_info'), cart_product_info: {
          cart_item_index: cart_item_index, cart_item_id: cart_item.id, cart_item_product_index: factory_product_index,
          cart_item_product: cart_item_product, ecommerce_cart_id, shopify_line_item, back_to_cart: backToCart
        },
        order_product_info: getEditModeDefaultObj('order_product_info')
      })
      self.$store.dispatch('setProductsRosters', {product_id: cart_item_product.product_id, roster_data: cart_item_product.product_roster_detail })

      //this.$store.commit('UPDATE_ROSTER', JSON.parse(JSON.stringify(cart_item_product.roster_detail)));
      this.$root.$emit('rostershared', '')
      let query_string = `item_id=${cart_item.id}&active_product_id=${cart_item_product.product_id}&active_product_type=cart_product&paginate=false`
      query_string += `&factory_product_id=${cart_item_product.id}&style_id=${cart_item_product.style_id}&design_id=${cart_item_product.design_id}`
      let url = `list/products?${query_string}`;
      self.$store.commit("SET_PRODUCTS_NEXT_PAGE_NO", null)
      await http.get(url).then(async (response: Record<any, any>) => {
        await (this as Record<any, any>).handleMainProducts(response);
      })
      // if(!is_private){
      //   await this.$store.dispatch('setProductType', { prd_type: cart_item_product.product_type, value: true });
      // }else{
      //   this.$store.dispatch('setPrivateProduct', is_private);
      // }

      this.hideVModal('cart-modal')
      if (!edit) {
        let total_tabs = (this.mainTotalTabs > 0)?this.mainTotalTabs: 3;
        setTimeout(async () => {
          await this.$store.dispatch('setTabMain', {value: (total_tabs + 1)})
          this.showVModal('rostermodal');
        },500)
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
