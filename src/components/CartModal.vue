<template>
  <modal :minWidth="1000" :scrollable="true" :height="'auto'" :minHeight="600" :resizable="true" :adaptive="true"
    name="cart-modal" ref="cart-modal" id="cart-center-lockerroom" size="xl" modal-class="modal-fullscreen2"
    content-class="lockerroom-modal" @closed="customer_reference_no = null" @before-open="getAddresses">
    <div class="modal-header d-flex justify-content-between">
      <span class="fs-5 font-weight-bold">Cart</span>
      <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hideVModal('cart-modal')">
        <BIconX />
      </span>
    </div>

    <div class="theme-scroll" style="height: calc(100% - 65px); overflow-y: auto; padding-bottom: 20px">
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
                <a style="cursor:pointer;color:blue;text-decoration: underline"
                  @click="editCartItem(cart_item_index, factory_product_index)">{{ factory_product.product_name }}</a>
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
                <a style="font-weight: bold; cursor:pointer; color:blue;text-decoration: underline" @click="editCartItem(cart_item_index, factory_product_index, false)">
                  {{ factory_product.product_roster_detail | itemQtyCount(factory_product.product_roster_detail) }}
                </a>
              </td>
              <td class="cursor-pointer"> <a data-title="Delete Event"
                  @click="deleteConfirm(cart_item, factory_product)">
                  <font-awesome-icon :icon="['fas', 'trash-alt']" />
                </a></td>
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
          <div class="fs-2 font-weight-bold ">Team Name / order reference</div>
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
import { getReminderOptions, processColorsCustom } from "@/helpers/Helpers";
import { LockerProducts, handleMainProducts } from "@/mixins/LockerProduct";
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
      let santa_cart_id = this.$route.query.update_cart;

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
export default class CartModal extends Mixins(ErrorMessages, LockerProducts, handleMainProducts, ModalAction) {
  @Prop({ default: 3, required: true }) mainTotalTabs!: number

  public viewLoader = false;
  private userData = this.$store.getters.getCustomer;
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public customer_reference_no = ""
  public shipping_address: Record<any, any> | null = null

  get cartItems() {
    return this.$store.getters.getCartItems
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
  public createOrder() {
    let payload = {}
    payload['customer_reference_no'] = this.customer_reference_no
    if (!this.customer_reference_no) {
      this.showToast('Please provide customer reference number.', 'ERROR');
      return false;
    }

    if (this.shipping_address) {
      payload['address_id'] = this.shipping_address.id
    } else {
      this.showToast('Please select shipping address.', 'ERROR');
      return false;
    }

    this.viewLoader = true;
    http.post('order', payload).then((res: Record<any, any>) => {
      if (res.data.success) {
        this.$store.dispatch('addToCart', [])
        this.showToast(res.data.message, 'SUCCESS');
        this.showToast('Your pdf is generating', 'SUCCESS');
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
    let cart_item = self.cartItems[cart_item_index];
    let cart_item_product = cart_item.factory_products[factory_product_index]
    console.log('cart_item_product', cart_item_product)
    let cart_product_type = cart_item_product.product_type
    let is_customized = false;
    let is_personalized = false;
    //As in cart edit mode there will be only one product is shown in listing. So that product will be of type customized or personalized.
    if(cart_product_type == "customized") {
      await this.$store.dispatch('setProductType', { prd_type: "customized", value: true });
      await this.$store.dispatch('setProductType', { prd_type: "personalized", value: false });
      is_customized = true
      is_personalized = false
    } else if(cart_product_type == "personalized") {
      await this.$store.dispatch('setProductType', { prd_type: "customized", value: false });
      await this.$store.dispatch('setProductType', { prd_type: "personalized", value: true });
      is_customized = false
      is_personalized = true
    }
    self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", {
      editing: true,  type: "cart_product", filters: {customized: is_customized, personalized: is_personalized, search_products: ""}, locker_product_info: null, cart_product_info: {
        cart_item_index: cart_item_index, cart_item_id: cart_item.id, cart_item_product_index: factory_product_index, cart_item_product: cart_item_product
      },
      order_product_info: null
    })
    self.$store.dispatch('setProductsRosters', {product_id: self.selectedProduct.id, roster_data: cart_item_product.product_roster_detail })

    //this.$store.commit('UPDATE_ROSTER', JSON.parse(JSON.stringify(cart_item_product.roster_detail)));
    this.$root.$emit('rostershared', '')
    let url = `list/products?customized=${is_customized}&personalized=${is_personalized}&active_product_id=${cart_item_product.product_id}&active_product_type=cart_product`;
    self.$store.commit("SET_PRODUCTS_NEXT_PAGE_NO", null)
    await http.get(url).then(async (response: Record<any, any>) => {
      await (this as Record<any, any>).handleMainProducts(response);

    })
    await this.$store.dispatch('setProductType', { prd_type: cart_item_product.product_type, value: true });
    this.hideVModal('cart-modal')
    if (!edit) {
      await this.$store.dispatch('setTabMain', {value: (this.mainTotalTabs + 1)})
      this.showVModal('rostermodal');
    }
  }

  public deleteConfirm(cart_item: Record<any, any>, factory_product: Record<any, any>) {
    this.$emit("deleteCartItem", { cart_item: cart_item, factory_product: factory_product });
  }

}

</script>

<style lang="scss" scoped>
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
