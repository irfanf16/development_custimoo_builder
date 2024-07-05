<template>
  <modal :minWidth="1000" width="100%" :minHeight="600" height="auto"
    name="quote-modal" ref="quote-modal" id="cart-center-lockerroom" size="xl" class="quote-modal absolute-modals" modal-class="modal-fullscreen2"
    content-class="lockerroom-modal" @closed="customer_reference_no = null" @before-open="getAddresses">
    <div class="modal-header d-flex justify-content-between">
      <span class="fs-5 font-weight-bold">Accept Quote</span>
      <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hideVModal('quote-modal')">
        <BIconX />
      </span>
    </div>

    <div style="height: calc(100vh - 300px); padding-bottom: 20px; overflow: hidden; overflow-y: auto;" class="theme-scroll-v">
      <div class="loader relative" v-if="viewLoader"><img src="@assets/images/loading.gif" /></div>

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

                <router-link :to="{ path: '/address', query: { quote: 1, order_id:this.order.id } }" class="btn ml-auto align-self-end btn-dark medium btn-sm my-orders">
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
      <div class="d-flex justify-content-center">
          <b-button style="margin-right: 15px" class="mt-4" @click="acceptQuote(true)">Accept</b-button>
      </div>
    </div>
  </modal>

</template>

<script lang="ts">

import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator'
import { http } from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";
import {
  logData,
} from "@/helpers/Helpers";
import ModalAction from "@/mixins/ModalAction";
@Component<QuoteModal>({
  methods: {logData},
  components: {},
  async created() {
    this.initializeData();
  }

})
export default class QuoteModal extends Mixins(ErrorMessages, ModalAction) {
  @Prop({required: true}) order!: Record<any,any>
  public viewLoader = false;

  public customer_reference_no = "";
  public general_comments = "";
  public shipping_address: Record<any, any> | null = null

  get company(){
    return this.$store.getters.getCompany;
  }
  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

// Watch for changes in the order prop to re-initialize data
  @Watch('order', { immediate: true, deep: true })
  onOrderChange() {
    this.initializeData();
  }

  initializeData() {
    if (this.order) {
      this.customer_reference_no = this.order.customer_reference_no || '';
      this.general_comments = this.order.general_comments || '';
    }
  }

  public acceptQuote(is_quote=false) {
    let payload = {}
    payload['order_id'] = this.order.id
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

    http.post('accept-quote-order', payload).then((res: Record<any, any>) => {
      if (res.data.success) {
        this.$store.dispatch('addToCart', [])
        this.showToast(res.data.message, 'success');
        this.viewLoader = false;
        // this.hideVModal('cart-modal')
        this.$router.push({name: 'Thankyou', params: { order: res.data.result.order } })
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
    this.hideVModal('quote-modal');
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
