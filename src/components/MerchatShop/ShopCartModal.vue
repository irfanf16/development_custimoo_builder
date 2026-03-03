<template>
  <modal
    :width="screenWidth"
    id="shop-modal-scrollable"
    :scrollable="showLoader ? false: true"
    height="auto"
    :reset="true"
    :shiftY="0"
    name="shopCartModal"
    class="shop-cart"
    footer-class="hide-modal-footer d-none"
  >
    <div class="loader" v-if="showLoader"><img style="width: 100px" src="@assets/images/loading.gif" /></div>

    <div
      class="modal-header d-flex justify-content-between border-bottom pb-3 mb-4"
    >
      <span class="fs-5 font-weight-bolder">Cart</span>
      <span
        class="fs-5 font-weight-bold cursor-pointer modal-close"
        @click="close"
      >
        <BIconX />
      </span>
    </div>

    <div class="modal-body pt-1 pb-5 px-5">
      <div class="row justify-content-between align-items-start px-md-5 px-2">
        <div
          class="col-md-7 col-12 d-flex flex-column align-items-center gap-4 p-0"
        >
          <template v-if="cart_products.length > 0">
            <CartProductCard
              v-for="(product, index) in cart_products"
              :key="product.cart_uid || index"
              :product="product"
              :productIndex="index"
            />
            <ul v-if="errors && errors.length" class="text-danger mt-1">
              <li v-for="(msg, i) in errors" :key="i">{{ msg }}</li>
            </ul>
          </template>
          <template v-else>
            <div class="d-flex flex-column align-items-center gap-2">
              <span class="heading">Your cart is empty</span>
            </div>
          </template>
        </div>

        <div class="col-md-4 col-12 d-flex p-0 flex-column w-100 gap-2 mt-md-0 mt-4">
          <div class="d-flex flex-column gap-1 w-100">
            <h1 class="heading">Order Summary</h1>
            <template v-if="groupedCartProducts && groupedCartProducts.length > 0">
              <div
                v-for="(product, index) in groupedCartProducts"
                :key="index"
                class="d-flex justify-content-between w-100 cart_summary"
              >
                <span>{{ product.name }}</span>
                <span v-if="getShopInfo?.isPriceVisible">{{ product.total ? product.total.toFixed(2) : '' }} {{currency}}</span>
              </div>
            </template>
            <div class="d-flex justify-content-between w-100 sub_header" v-if="getShopInfo?.isPriceVisible">
              <span>Total</span>
              <span v-if="groupedCartProducts.length > 0">
                {{ groupedCartProducts.reduce((acc, cur) => acc + cur.total, 0).toFixed(2) }} {{ currency }}
              </span>
            </div>
          </div>
          <div class="d-flex flex-column gap-1 w-100">
            <div class="heading d-flex justify-content-between">
              <span>Shipping Address</span>
              <button class="editBtn" @click="addressToggle" v-if="!isEditting">
                <b-icon icon="pencil" />
              </button>
              <template v-else>
                <div class="d-flex gap-1">
                  <button
                    class="btn btn-sm btn-secondary"
                    type="button"
                    @click="saveAddress"
                    form="addressForm"
                  >
                    Update
                  </button>
                  <button
                    class="btn btn-sm btn-outline-primary"
                    @click="cancelEdit"
                  >
                    Cancel
                  </button>
                </div>
              </template>
            </div>
            <div
              class="d-flex flex-column w-100 justify-content-between w-100 cart_summary address_info"
            >
              <template v-if="!isEditting">
                <span>
                  {{ address_info?.first_name }}
                  {{ address_info?.last_name }}</span
                >
                <span>{{ address_info.email }} </span>
                <span>{{ address_info.address1 }}</span>
                <span>{{ address_info.address2 }}</span>
                <span>{{ address_info.phone_number }}</span>
                <span
                  >{{ address_info.city }}
                  {{ address_info.state }}
                  {{ address_info.zip_code }}
                </span>
                <span>{{ address_info.country?.name }} </span>
              </template>
              <template v-else>
                <ValidationObserver  ref="addressObserver">
                <b-form id="addressForm">
                  <b-form-group class="name_field_group">
                    <!-- First Name (required) -->
                    <ValidationProvider name="First Name" rules="required" v-slot="{ errors }">
                      <b-input
                        class="mb-1"
                        placeholder="First Name"
                        v-model="edit_address_info.first_name"
                      />
                      <small class="text-danger">{{ errors[0] }}</small>
                    </ValidationProvider>

                    <!-- Last Name (optional) -->
                    <b-input
                      placeholder="Last Name"
                      v-model="edit_address_info.last_name"
                    />
                  </b-form-group>

                  <!-- Email (required) -->
                  <ValidationProvider name="Email" rules="required|email" v-slot="{ errors }">
                    <b-form-group>
                      <b-input
                        type="email"
                        placeholder="Email"
                        v-model="edit_address_info.email"
                      />
                      <small class="text-danger">{{ errors[0] }}</small>
                    </b-form-group>
                  </ValidationProvider>

                  <!-- Address Line 1 (required) -->
                  <ValidationProvider name="Address Line 1" rules="required" v-slot="{ errors }">
                    <b-form-group>
                      <b-input
                        placeholder="Address Line 1"
                        v-model="edit_address_info.address1"
                      />
                      <small class="text-danger">{{ errors[0] }}</small>
                    </b-form-group>
                  </ValidationProvider>

                  <!-- Address Line 2 (optional) -->
                  <b-form-group>
                    <b-input
                      placeholder="Address Line 2"
                      v-model="edit_address_info.address2"
                    />
                  </b-form-group>

                  <!-- Phone Number (required) -->
                  <ValidationProvider name="Phone Number" rules="required|phone" v-slot="{ errors }">
                    <b-form-group>
                      <b-input
                        placeholder="Phone Number"
                        v-model="edit_address_info.phone_number"
                      />
                      <small class="text-danger">{{ errors[0] }}</small>
                    </b-form-group>
                  </ValidationProvider>
                  <ValidationProvider name="Company name" rules="required" v-slot="{ errors }">
                    <b-form-group>
                      <b-input
                        placeholder="Company name"
                        v-model="edit_address_info.company_name"
                      />
                      <small class="text-danger">{{ errors[0] }}</small>
                    </b-form-group>
                  </ValidationProvider>

                  <!-- City (required) -->
                  <ValidationProvider name="City" rules="required" v-slot="{ errors }">
                    <b-form-group>
                      <b-input
                        placeholder="City"
                        v-model="edit_address_info.city"
                      />
                      <small class="text-danger">{{ errors[0] }}</small>
                    </b-form-group>
                  </ValidationProvider>

                  <!-- State (required) -->
                  <ValidationProvider :key="edit_address_info.country_id" name="State" :rules="stateRules" v-slot="{ errors }">
                    <b-form-group>
                      <b-input
                        placeholder="State"
                        v-model="edit_address_info.state"
                      />
                      <small class="text-danger">{{ errors[0] }}</small>
                    </b-form-group>
                  </ValidationProvider>

                  <!-- Zip Code (required) -->
                  <ValidationProvider name="Zip Code" rules="required" v-slot="{ errors }">
                    <b-form-group>
                      <b-input
                        placeholder="Zip Code"
                        v-model="edit_address_info.zip_code"
                      />
                      <small class="text-danger">{{ errors[0] }}</small>
                    </b-form-group>
                  </ValidationProvider>

                  <!-- Country (optional select) -->
                  <b-form-group>
                      <b-form-select
                        autocomplete="off"
                        id="country"
                        :options="countries"
                        name="country"
                        v-model="edit_address_info.country_id"
                        value-field="id"
                        @change="onCountrySelect"
                        text-field="name"
                      >
                      <template #first>
                        <b-form-select-option :value="null" disabled>Select Country</b-form-select-option>
                      </template>
                    </b-form-select>
                      </b-form-group>
                </b-form>
                </ValidationObserver>
              </template>
            </div>
          </div>
          <div class="d-flex flex-column gap-1 w-100">
            <h1 class="heading">General Comments</h1>
            <textarea
              class="input"
              v-model="general_comments"
              rows="4"
              placeholder="Write your comments here..."
            />
          </div>

          <div class="d-flex flex-column gap-1 w-100">
            <h1 class="heading">
              Team Name / Order Reference<span class="text-danger">*</span>
            </h1>
            <input
              type="text"
              class="input"
              v-model="order_reference"
              placeholder="Enter team or reference number 2123"
            />
            <small v-if="orderReferenceError" class="text-danger">
              {{ orderReferenceError }}
            </small>
          </div>
          <button class="btn btn-secondary w-100" @click="submitOrder">
            Place Order
          </button>
        </div>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import {http} from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";
import RosterTabMixin from "@/mixins/RosterTabMixin";
import {Component, Mixins, Watch} from "vue-property-decorator";
import CartProductCard from "./CartProductCard.vue";
import {extend, ValidationObserver, ValidationProvider} from "vee-validate";
import {email, required} from "vee-validate/dist/rules";

extend("required", required);
extend("email", email);
extend("phone", {
  validate: (value) => {
    return /^(\+?\d{1,4}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}$/.test(
      value
    );
  },
  message: "Please enter a valid phone number",
});


interface Player {
  text: string;
  number: string;
  quantity: number;
  size: string;
  information: null;
}
interface Address {
  id: number | null;
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  address1: string;
  address2: any;
  phone_number: string;
  city: string;
  company_name: string;
  state: string;
  zip_code: string;
  default: number;
  country_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  country: Country;
}

interface Country {
  id: number;
  code: string;
  name: string;
}

@Component({
  components: {
    CartProductCard,
    ValidationObserver,
    ValidationProvider
  }
})
export default class ShopCartModal extends Mixins(
  ErrorMessages,
  RosterTabMixin
) {
  created() {
    this.getCountries();
    if (this.isCustomerAuthenticated) {
      this.getAddressDetails();
    }
  }
  private userData = this.$store.getters.getCustomer;
  private isEditting = false;
  private addressLoading = false;
  private general_comments = "";
  private order_reference
  private orderReferenceError = '';
  public errors = [];
  private addresses = [];
  private screenWidth = Math.min(window.screen.availWidth - 100, 1400);

  //   private cart_products: Product[] = [];
  // private address_info = { ...this.address_info };
  private countries: Country[] = [];
  private address_info: Address = {
    id: null,
    customer_id: 0,
    first_name: "",
    last_name: "",
    email: "",
    address1: "",
    address2: null,
    phone_number: "",
    city: "",
    company_name: "",
    state: "",
    zip_code: "",
    default: 0,
    country_id: 0,
    created_at: "",
    updated_at: "",
    deleted_at: null,
    country: {
      id: 0,
      name: "",
      code: "",
    },
  };

  private edit_address_info: Address = { ...this.address_info };
  public show(): void {
    this.$modal.show("shopCartModal");
  }

  get currency():string{
    return this.$store.getters.getShopCurrency;
  }
  get cart_products(): Record<string, any>[]{
    return this.$store.getters.getCurrentShopCart.products ?? [];
  }
  get stateRules():string {
    const selected = this.countries.find(
      (c) => c.id === this.edit_address_info.country_id
    );
    const name = selected?.name?.toLowerCase() || "";
    if (["usa", "united states", "united states of america", "canada"].includes(name)) {
      return "required";
    }
    return "";
  }

  get groupedCartProducts() {
    if (!this.cart_products || !this.cart_products.length) return [];
    const grouped: Record<number, { id: number; name: string; price: number; total: number }> = {};
    this.cart_products.forEach((product) => {
      const id = product.id;
      const productTotal = product.roster_detail.reduce((sum, item) => {
        let subtotal = item.quantity * product.price;
        if (product.addons && product.addons.length > 0) {
          const addonsTotal = product.addons.reduce(
            (addonSum, addon) => addonSum + addon.price * item.quantity,
            0
          );
          subtotal += addonsTotal;
        }
        return sum + subtotal;
      }, 0);
      if (!grouped[id]) {
        grouped[id] = {
          id,
          name: product.name,
          price: product.price,
          total: productTotal,
        };
      } else {
        grouped[id].total += productTotal;
      }
    });
    return Object.values(grouped);
  }
  get totalPrice(){
    return Number(
        this.cart_products.reduce((acc, product) => {
      const productQty = product.roster_detail.reduce(
        (ros, r) => ros + r.quantity,
        0
      );
      return acc + product.price * productQty;
    }, 0).toFixed(2)
    );
  }
  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }
  get getShopInfo(): Record<any, any> {
    return this.$store.getters.getShopInfo;
  }
  @Watch('isCustomerAuthenticated')
  handleAuthStatusChange(newVal: boolean) :void{
    if (newVal) {
      this.getAddressDetails()
    } else {
      console.log('User logged out');
    }
  }
  public onCountrySelect(selectedId: number | null): void {
  const selected = this.countries.find(c => c.id === selectedId);
  if (selected) {
    this.edit_address_info.country_id = selected.id;
    this.edit_address_info.country = {
      id: selected.id,
      name: selected.name,
      code: selected.code ?? "",
    };
  } else {
    this.edit_address_info.country_id = 0;
    this.edit_address_info.country = {
      id: 0,
      name: "",
      code: "",
    };
  }
}

  public hide(): void {
    this.$emit('hide');
    this.errors = []
    this.order_reference = ""
    this.orderReferenceError = ''
    this.general_comments = ""
    this.$modal.hide("shopCartModal");
  }

  public close(): void {
    this.hide();
  }
  public async validateAddressForm(): Promise<boolean> {
    const observer = this.$refs.addressObserver as any;
    return await observer.validate();
  }

  private addressToggle() {
    this.edit_address_info = { ...this.address_info }; // copy current address
    this.isEditting = true;
  }
  private cancelEdit() {
    this.edit_address_info = { ...this.address_info };
    this.isEditting = false;
  }
  public async saveAddress(): Promise<void> {
    const isValid = await this.validateAddressForm();
    if (!isValid) return;
    this.address_info = { ...this.edit_address_info };
    this.isEditting = false;
  }
  private getAddressDetails(): void {
    this.addressLoading = true;
    http
      .get(`/addresses`)
      .then((response: any) => {
        this.addresses = response.data.result;
        if (this.addresses.length > 0) {
          const selectedAddress = this.addresses.find((a: any) => a.default === 1) ?? response.data[0];
          this.address_info = { ...selectedAddress };
          if (this.address_info.email){
            this.edit_address_info = { ...this.address_info }
          }
          this.addressLoading = false;
        }
      })
      .catch((e: any) => {
        this.addressLoading = false;
        this.showError(e.response.data.message);
      });
  }
  private getCountries(): void {
    this.addressLoading = true;
    http
      .get(`/addresses/countries`)
      .then((response: any) => {
        this.countries = response.data.result;
        this.addressLoading = false;
      })
      .catch((e: any) => {
        this.addressLoading = false;
        this.showError(e.response.data.message);
      });
  }

  public async submitOrder():Promise<void>{
    let modalEl = document.querySelector('.shop-cart.vm--container.scrollable > .vm--modal');
    if(modalEl){
      modalEl.scrollTo({top:0})
    }
    if (!this.order_reference || !this.order_reference.trim()) {
      this.orderReferenceError = 'Order reference is required';
      return;
    } else {
      this.orderReferenceError = '';
    }
    if (this.isCustomerAuthenticated){
      if (this.isEditting) {
        const isValid = await this.validateAddressForm();
        if (!isValid) {
          return;
        }
        this.address_info = { ...this.edit_address_info };
        this.isEditting = false;
      }
      if(!this.edit_address_info?.first_name || !this.edit_address_info?.email){
        this.isEditting = true
        await this.$nextTick();
        await this.validateAddressForm();
        return
      }
        if(this.cart_products.length){
          let payload = this.getOrderPayload()
          const headers: Record<string, string> = {};
          const savedPassword = localStorage.getItem('shopAccessToken');
          if (savedPassword) {
            headers['X-Shop-Password'] = savedPassword;
          }
          this.showLoader = true
          const res = await http.post(`shop/${this.$route.params.slug}/create-order`, payload, {headers}).catch((error:any) => {
            const data = error.response?.data;
            this.showLoader = false
            if (data?.errors) {
              this.errors = data.errors;
            }else {
              this.showToast(data?.message || "Something went wrong", "error");
            }
            return null
          })
          if (!res) {
            return
          }
          if(res.status === 200){
            this.showToast("Your order has been created", "success");
            this.$store.commit('EMPTY_CART')
            localStorage.setItem('orderJustPlaced', 'true');
            this.hide()
            this.$router.push({name: 'CustomerOrders'});
          }
          this.showLoader = false
        }
      }else{
        this.$emit('openLoginModal')
      }
  }
  public getOrderPayload(){
    let order_products: any[] = [];
    this.cart_products.forEach((product: any) => {
      const order_obj = {
        shop_product_id: product.id,
        price: product.price,
        name: product.name,
        roster_items: product.roster_detail
      };
      order_products.push(order_obj);
    })
    let address = this.cleanedAddress()
    return  {
      order_products,
      order: {
        customer_reference_no: this.order_reference,
        address: address,
        general_comments: this.general_comments
      }
    }
  }
  private cleanedAddress() {
    const {
      default: _,
      country_id,
      customer_id,
      created_at,
      updated_at,
      deleted_at,
      country,
      ...cleanedAddress
    } = this.address_info;
    const finalAddress = {
      ...cleanedAddress,
      country_id: country?.id ?? null,
      country: country?.name ?? null,
    };
    return finalAddress
  }
}
</script>

<style scoped lang="scss">
:global(.shop-cart.vm--container.scrollable .vm--modal) {
  max-height: 90vh !important;
  overflow-y: auto !important;
  margin-top: 0 !important;
}

// Mobile responsive styles
@media (max-width: 768px) {
  // Additional styles for when opened from another modal
  :global(.shop-cart.vm--container .vm--modal) {
    height: 95vh !important;
    max-height: 95vh !important;
    width: calc(100vw - 20px) !important;
    max-width: calc(100vw - 20px) !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    position: fixed !important;
  }
}
#shop-modal-scrollable.vm--container {
  z-index: 9999 !important;
}

.cart_summary {
  span {
    color: #6d6d6d;
    font-size: 16px;
    font-weight: normal;
    margin: 0px;
  }
}
.heading {
  font-size: 20px;
  font-weight: 400;
}
.sub_header {
  span {
    font-weight: 400;
    font-size: 18px;
  }
}
.editBtn {
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
}
.input {
  border: none;
  outline: 2px solid #ecebeb;
  padding: 5px 12px;
  border-radius: 4px;
  height: 40px;
}
textarea.input {
  min-height: 200px;
}
.input:focus {
  outline: 2px solid black; /* active cell border */
  outline-offset: -2px; /* keeps border inside cell */
  transition: all 0.2s linear;
}
.form-group {
  margin-bottom: 10px !important;
}

</style>
