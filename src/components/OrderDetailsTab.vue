<template>
  <div>
<!--    <LoginForm ref="loginModal"   />-->
<!--    <div class="well custom d-flex gap-1 mt-3 position-relative" v-if="shared_url">-->
    <div class="well custom d-flex gap-1 mt-3 position-relative" v-if="false">
      <b-input-group class="w-100">
        <b-form-input ref="shared_url_link" class="w-100" v-model="shared_url" ></b-form-input>
      </b-input-group>
      <b-button class="btn btn-secondary fw-bold w-auto" style="white-space: nowrap" @click="copyLink">Copy URL</b-button>
      <button class="closeBtn" @click="closeCopyUrl">
        <BIconX />
      </button>
    </div>

    <div>
      <ConfirmOrderTab />
    </div>
    <div class="order-details-area">
      <div class="qty-area">
        <div class="qty-details" v-for="(roster,index) in productRosterDetail" :key="index">
        </div>
        <template v-if="productPriceObject">
          <div class="order-row total">
            <div class="total">Quantity</div>
            <div class="total-qty">{{ productPriceObject.total_quantity }}</div>
          </div>
          <template v-if="productPriceObject.show_price">
            <div class="order-row total" v-if="productPriceObject.product_price > 0">
              <div class="total">Product Price</div>
              <div class="total-qty">
                <template v-if="productPriceObject.is_multi_prices">
                  <div>
                    <div v-for="(item, index) in productPriceObject.product_multi_prices" :key="index">
                      {{ item.price }} X {{ item.quantity }} =
                      {{ Number(item.sub_price).toFixed(2) }}{{ productPriceObject.active_currency.symbol }}
                    </div>
                    <span> Sub Total = {{ Number(productPriceObject.product_price_with_quantity).toFixed(2) }}{{ productPriceObject.active_currency.symbol }}</span>
                  </div>
                </template>
                <template v-else>
                  {{ productPriceObject.product_price }} X {{ productPriceObject.total_quantity }} =
                  {{ Number(productPriceObject.product_price_with_quantity).toFixed(2) }}{{ productPriceObject.active_currency.symbol }}
                </template>

              </div>
            </div>
            <template v-if="productPriceObject.addons_price">
              <div class="order-row total">
              <div class="total">Addons Price</div>
              <div class="total-qty">
                {{productPriceObject.addons_price}} X {{productPriceObject.total_quantity}} =
                {{ Number(productPriceObject.addons_price_with_quantity).toFixed(2)}}{{productPriceObject.active_currency.symbol}}
              </div>
              </div>
            </template>
            <template v-if="productPriceObject.logo_tech_price">
              <div class="order-row total">
              <div class="total">Logo Technology Price</div>
              <div class="total-qty">
                {{productPriceObject.logo_tech_price}} X {{productPriceObject.total_quantity}} =
                {{ Number(productPriceObject.logo_tech_price_with_quantity).toFixed(2)}}{{productPriceObject.active_currency.symbol}}
              </div>
              </div>
            </template>
            <template>
              <div class="order-row total" v-if="productPriceObject.total_price > 0">
              <div class="total">Total Price</div>
              <div class="total-qty">{{ Number(productPriceObject.total_price).toFixed(2) }}{{productPriceObject.active_currency.symbol}}</div>
            </div>
            </template>
          </template>
        </template>
      </div>
      <div class="choose-stuff" v-if="selectedProduct.addons && selectedProduct.addons.length">
        <h2 class="fw-bold mb-3 fz-18 d-none d-lg-block">Choose Stuff</h2>
        <div class="stuff-row" v-for="(item, i) in selectedProduct.addons" :key="i">
          <b-form-checkbox size="sm">{{ item.addon.name }}</b-form-checkbox>
          <span class="charges">+${{ item.addon.price }}</span>
        </div>
      </div>
      <div class="pricing-are">
        <div class="order-details">
          <AddToCartButton :products_fonts="products_fonts"></AddToCartButton>
        </div>
      </div>
     
    </div>
    <template>
      <div class="text-center mt-2 text-muted">
        By using this software, you agree to our
        <router-link
          to="/privacy-policy"
          class="text-primary font-weight-bold"
          style="text-decoration: underline"
        >
          Privacy Policy
        </router-link>.
      </div>
    </template>
    <div class="d-none">
      <ProductionScene ref="production-scene" v-bind:production_file_obj.sync="production_file_obj"/>
    </div>
    <div class="loader" v-if="showLoader"><img src="@assets/images/loading.gif" /></div>
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop, Vue} from 'vue-property-decorator'
import {http} from "@/httpCommon";
import ConfirmOrderTab from "@/views/ConfirmOrderTab.vue";
import AddLockerRoomModal from "@/components/AddLockerRoomModal.vue";
import ErrorMessages from "@/mixins/ErrorMessages";
import ModalAction from "@/mixins/ModalAction";
import ProductionScene from '@/components/ProductionScene.vue'
import {
  getActiveProductData,
  handleResponseException,
} from '@/helpers/Helpers'
import LoginForm from '@/components/LoginForm.vue'
import {handleMainProducts, ProductsQueryParamsMixin, exitEditMode, cartModalData} from "@/mixins/LockerProduct";

import {compact} from 'lodash';
import { FetchCategories } from '@/mixins/SelectedProductMixin'
import AddToCartButton from "@/components/AddToCartButton.vue";

@Component<OrderDetailsTab>({
  components: {
    AddToCartButton,
    ProductionScene,
    AddLockerRoomModal, ConfirmOrderTab,
    LoginForm
  },
  mounted(){
    this.$root.$on('rostershared', (val:string) =>{
      this.shared_url = val
    })
  },
  created() {
    this.$root.$refs.Order_Details = this;
  }
})

export default class OrderDetailsTab extends Mixins(ErrorMessages, ModalAction, handleMainProducts, ProductsQueryParamsMixin, exitEditMode, cartModalData, FetchCategories) {
  @Prop({ required: true }) readonly products_fonts!: Record<any, any>[]
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public base64Logos: any[] = []
  public ref = this.$refs as Record<any, any>
  public pdf_front_image: string|null = null;
  public pdf_back_image: string|null = null;
  public showModal = false
  public shared_url = ""
  public production_file_obj = {
    url: null, content: null
  }
  public isLoading = false;

  get getProductEditInfoObject() {
    return this.$store.getters.getProductEditInfoObject
  }

  get productPriceObject(): Record<any, any> {
    return this.$store.getters.getProductPriceObject
  }

  public roster_detail: Record<any,any> = [];

  public production_file_info: Record<any,any> = {};

  public font_file : Record<any,any>[] = [];

  public storage_url:string = process.env.VUE_APP_STORAGE_URL || '';

  public svg_pattern_last_value_y = 0;

  public logo_pattern_last_value_y = 0;

  public INCH_TO_CENTIMETER = 2.54;

  public is_admin_token = localStorage.getItem(Vue.prototype.$adminToken_localstorage_key);

  get updateOrderItemProducts() {
    return this.$store.getters.getUpdateOrderItemProducts
  }

  get company(): Record<any, any>{
    return this.$store.getters.getCompany
  }

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails()
  }


  get productRosterDetail(): [Record<any, any>] {
    return this.$store.getters.getProductRosters()
  }

  get logoColors(): [Record<any, any>] {
    return this.$store.getters.getLogosColors
  }

  get getLastActiveProductData() {
    return this.$store.getters.getLastActiveProductData
  }

  get total(): number {
    let sum = 0;
    if (this.productRosterDetail){
      this.productRosterDetail.forEach((item) => {
        sum += parseInt(item.quantity);
      })
    }
    return sum;
  }

  public openAddToLocker () {
    this.$emit('open-add-to-locker')
  }

  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  public buyNow() {
    this.$router.push('/confirm-order')
  }
  get canvasImage() {
    return this.$store.getters.getCanvasImage
  }

  public showLoader = false

  get svgGroups(): [Record<any, any>] {
    return this.$store.getters.getSvgGroups
  }


  get productionSVGs(): Record<any, any> {
    return this.$store.getters.getProductionSVGs
  }

  get editStatus():boolean{
    return  this.$store.getters.getEditStatus
  }

  get customLogos(): [Record<any, any>] {
    return this.$store.getters.getCustomLogos()
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts()
  }

  get actionBeforeLogin(): string {
    return this.$store.getters.getActionBeforeLogin
  }

  get customerPermissions(){
    return this.$store.getters.getCustomerPermissions
  }

  public async addToCart() {
    let self: Record<any, any> = this;
    try {
      // this.isLoading = true;
      let cart_product = await getActiveProductData(this.products_fonts) as Record<any, any>
      this.$store.dispatch('setRevertRosterBOOL', true)

      let post_data: Record<any, any> = {
        factory_product: cart_product
      }
      let url = 'carts'
      let cart_edit_mode = false
      if (this.getProductEditInfoObject.editing && this.getProductEditInfoObject.type == 'cart_product') {
        cart_edit_mode = true
        post_data.factory_product.id = this.getProductEditInfoObject.cart_product_info.cart_item_product.id
        url = `carts/cart-items/${this.getProductEditInfoObject.cart_product_info.cart_item_id}/update`
      }

      let santacart = true
      let company_domain = this.company.company_domain

      let platform = this.company.platform
      let ecommerce_cart_id = null
      let ecom_url = '';
      if (platform === 'wordpress'){
        ecom_url = company_domain + '/wp-admin/admin-ajax.php'
      }


      if (platform === 'wordpress') {
        if (cart_product.sync_id === '' || cart_product.ecommerce_post_id === '') {
          return false
        }

        let ecom_form_data = new FormData()

        let ecommerce_update_id = this.$route.query.update_item as string
        if (ecommerce_update_id) {
          ecom_form_data.append('action', 'custimoo_update_cart')
          ecom_form_data.append('update_item', ecommerce_update_id)
        } else {
          ecom_form_data.append('action', 'custimoo_add_to_cart')
          ecom_form_data.append('product_name', cart_product.product_name)
        }

        ecom_form_data.append('product_id', cart_product.ecommerce_post_id)
        ecom_form_data.append('quantity', String(this.total))
        ecom_form_data.append('product_front_image', cart_product.front_image)

        await http.post(ecom_url, ecom_form_data).then((res: any) => {
          if (!res.data.status) {
            santacart = false
            this.showToast(res.data.message, 'error')
          } else {
            ecommerce_cart_id = res.data.ecommerce_cart_id
          }
        }).catch(err => {
          santacart = false
          this.isLoading = false
          this.showErrorArr(err.response.data.errors)
        })

        post_data.factory_product.ecommerce_cart_id = ecommerce_cart_id
      }

      if (santacart) {
        this.isLoading = true
        http.post(url, post_data).then(async (res: any) => {
          if (res.data.success == true) {
            let api_res: Record<any, any> = res.data.result
            self.$store.dispatch('addToCart', api_res.items)
            await self.exitFromEditMode()
            self.showToast(res.data.message, 'SUCCESS')
            self.$store.dispatch('addedToCart', true)
            if (platform === 'wordpress') {
              let update_cart_id_data = new FormData() as Record<any, any>
              update_cart_id_data.append('santa_cart_id', api_res.new_created_id)
              update_cart_id_data.append('woocom_cart_id', ecommerce_cart_id)
              update_cart_id_data.append('action', 'add_custimoo_cart_id')
              if (cart_edit_mode) {
                await self.exitFromEditMode()
              }
              http.post(ecom_url, update_cart_id_data).then((res: any) => {
                window.location.href = company_domain + '/cart'
              }).catch(err => {
                self.showErrorArr(err.response.data.errors)
              })

            } else {
              if (cart_edit_mode) {
                await self.exitFromEditMode()
                const categories_promise = this.fetchCategories();
                categories_promise.then(async (cat_response) => {
                  let query_params = await this.setQueryParams()
                  await this.retrieveProductsNew(query_params)
                });
              }
            }
            self.isLoading = false
          } else {
            if (res.data.status_code === 422) {
              self.showErrorValidation(res.data.errors)
            }
            if (cart_edit_mode) {
              await self.exitFromEditMode()
              const categories_promise = this.fetchCategories();
              categories_promise.then(async (cat_response) => {
                let query_params = await this.setQueryParams()
                await this.retrieveProductsNew(query_params)
              })

            }
          }
          self.showToast(res.data.message, res.data.success ? 'SUCCESS' : 'ERROR')
          self.isLoading = false

        }).catch(async errorResponse => {
          self.isLoading = false
          handleResponseException(errorResponse)
          if (cart_edit_mode) {
            await self.exitFromEditMode()
            const categories_promise = this.fetchCategories();
            categories_promise.then(async (cat_response) => {
              let query_params = await this.setQueryParams()
              await this.retrieveProductsNew(query_params)
            })
          }
        })
      }

    } catch (e) {
      console.error('error in add to cart', e)
      self.isLoading = false
    }
  }

  public async getLockers(){
    if (!this.editStatus){
      await this.$store.dispatch("getLockers");
      this.$emit('open-add-to-locker')
    }else{
      let res  = await this.$store.dispatch('regenerateRosterLink', { id: this.$store.getters.getEditProductId })
      this.shared_url = res.data
    }
  }

  public closeCopyUrl(){
    this.shared_url = ""
  }

  public copyLink() {
    let toCopy = this.$refs['shared_url_link'] as Record<any, any>
    toCopy = toCopy[0].$el as Record<any, any>
    toCopy.select()
    try {
      document.execCommand('copy');
      this.closeCopyUrl();
      this.showToast('Shareable link was copied to your clipboard.', 'success');
    } catch (err) {
      alert('Oops, unable to copy');
    }
  }

  public async getOrderDetail() {
    let self = this;
    let order_detail: { [key: string]: Record<any, any> } = {}
    order_detail.roster_detail = self.productRosterDetail;
    order_detail.svg_groups = self.svgGroups;
    order_detail.custom_texts = this.customTexts.filter((custom_text) => custom_text.text.length > 0);
    order_detail.custom_logos = self.customLogos;
    if(self.$store.getters.getUsingColorLogos) {
      order_detail.logo_colors = self.logoColors
    }

    return order_detail;
  }
}
</script>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap');
div {
  box-sizing: border-box;
}

ol, ul {
  list-style: none;
  box-sizing: border-box;
}

blockquote, q {
  quotes: none;
}

blockquote:before, blockquote:after,
q:before, q:after {
  content: '';
  content: none;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
  border-collapse: collapse;
  width: 100%;
}


td, th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #dddddd;
}

a {
  color: #75b4e4;
  text-decoration: none;
  box-sizing: border-box;
}

#production-pdf-html,
#wrapper {
  width: 100%;
  overflow: hidden;
  margin: 0;
  padding: 10px;
  position: relative;
  max-width: 1020px;
  margin: 0 auto;
}

#header {
  overflow: hidden;
  padding: 0;
  margin: 0;
  position: relative;
}

#header .year {
  font-weight: 700;
  background: #000;
  color: #fff;
  padding: 0;
  display: inline-block;
  vertical-align: middle;
  max-width: 7%;
  width: 100%;
  text-align: center;
  font-size: 24px;
  padding: 2px;
}

#header .header-content {
  background: #009eda;
  color: #000;
  text-align: center;
  display: inline-block;
  vertical-align: middle;
  max-width: 77%;
  width: 100%;
  font-size: 20px;
  position: relative;
  padding: 5px;
}

#header .header-content:before {
  position: absolute;
  content: '';
  right: -20px;
  top: 0;
  border: 20px solid transparent;
  border-top: 30px solid #fff;
}

#header .logo {
  display: inline-block;
  vertical-align: middle;
  max-width: 15%;
  width: 100%;
  position: relative;
  z-index: 1;
  padding: 5px;
}

#header .logo svg {
  width: 100%;
  height: auto;
  display: block;
}

#main {
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.image-holder {
  overflow: hidden;
  align-items: center;
  padding: 20px 0;
  /*max-width: 600px;*/
  margin: 0 auto;
}

.image-holder .image-area {
  display: inline-block;
  vertical-align: middle;
  width: 100%;
  max-width: 47%;
  margin: 0 1%;
}

.image-holder .image-area image,
.image-holder .image-area svg {
  display: block;
  width: 100% !important;
  height: auto !important;
  margin: 0 auto !important;
}

.two-columns {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.two-columns .left-col {
  flex: 0 0 65%;
  max-width: 65%;
}

.two-columns .product-details-area {
  margin: 0;
  overflow: hidden;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.two-columns .details-col {
  flex: 0 0 48%;
  max-width: 48%;
}

.two-columns h2 {
  font-size: 24px;
  font-weight: 700;
  padding: 0;
  border: 2px solid #03142E;
  padding: 5px 10px;
  margin-bottom: 15px;
  position: relative;
}

.two-columns h2:before {
  position: absolute;
  content: '';
  right: -3px;
  top: -3px;
  border-top: 47px solid #fff;
  border-left: 33px solid transparent;
  z-index: 1;
}

.two-columns h2:after {
  position: absolute;
  content: '';
  right: 14px;
  top: -6px;
  bottom: -6px;
  background: #03142E;
  width: 2px;
  z-index: 2;
  transform: rotate(-35deg);
}

.two-columns .colors-area {
  overflow: hidden;
  padding: 0;
  margin: 0;
}

.two-columns .color-block {
  max-width: 45%;
  width: 100%;
  vertical-align: top;
  display: inline-block;
  margin: 0 0 10px;
}

.two-columns .color-box {
  width: 35px;
  height: 35px;
  vertical-align: top;
  display: inline-block;
  background: #03142E;
  margin: 0 10px 0 0;
}

.two-columns .color-details {
  max-width: 80px;
  width: 100%;
  font-size: 12px;
  vertical-align: top;
  display: inline-block;
}

.logo-area .logo-holder {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 0 2px;
}

.logo-area .logo-block {
  flex: 0 0 48%;
  max-width: 48%;
  padding: 20px 20px 40px;
  border: 1px solid #03142E;
  margin: 0 0 2px 0;
  min-height: 120px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  position: relative;
}

.logo-area .logo-block p {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  border-top: 1px solid #03142e;
  z-index: 1;
  padding: 5px;
  text-align: center;
}

.logo-area .logo-block:last-child {
  margin-left: 0;
}

.logo-area .logo-block img,
.logo-area .logo-block svg {
  display: block;
  height: auto;
  width: 100%;
  margin: 0 auto;
  max-width: 50px;
}

.two-columns .right-col {
  flex: 0 0 30%;
  max-width: 30%;
}

.name-no-details {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 0 0 10px;
}

.name-no-details .text-details {
  flex: 0 0 50%;
  max-width: 50%;
}

.name-no-details .color-details {
  flex: 0 0 45%;
  max-width: 45%;
}

.name-no-details .text-details span {
  display: block;
  margin: 0 0 7px;
}

.name-no-details .color-details-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin: 0 0 10px;
}

.name-no-details .color-details-wrapper .color-box {
  height: 15px;
}

.name-no-details .color-name-details {
  flex: 0 0 50px;
  max-width: 50px;
}
.loader{
  position: fixed;
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
  background: rgba(255, 255, 255, 0.9);
  z-index: 1030;
}

img {
  max-width: 7%;
  display: block;
  margin: 0 auto;
  height: auto;
}

.closeBtn{
  background: firebrick;
  color: #fff;
  height: 20px;
  width: 20px;
  cursor: pointer;
  padding: 0;
  margin: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -10px;
  right: -10px;
  border-radius: 1000px;
  font-size: 1rem;
}
</style>
