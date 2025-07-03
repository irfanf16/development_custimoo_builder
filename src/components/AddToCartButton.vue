<template>
  <span>
  <template v-if="getProductEditInfoObject.editing && getProductEditInfoObject.type == 'order_product'"></template>
  <b-button v-else-if="!isRosterOpened" :key="'editRoster'" class="mx-2 px-5" variant="secondary" @click="()=>{this.setRosterOpen(true); showVModal('rostermodal')}">
    Edit {{ company.login_code && company.login_code.hasOwnProperty('roster_name') ? company.login_code.roster_name : 'Roster' | TitleCase }}
  </b-button>

  <template v-else-if="isCustomerAuthenticated">
    <template>
      <template v-if="$store.getters.getUpdateOrderItemProducts == null">
          <b-button :key="'getQuote'" aria-label="Add to Cart" v-if="!cartLoading && show_quote_button"
                 class="mx-2 px-5" variant="secondary" @click="getQuote()">
            Get Quote
          </b-button>
         <b-button v-if="!show_cart_button && cartLoading" class="mx-2 px-5" variant="secondary" :disabled="true">
          <img width="20" height="20" src="@assets/images/loading.gif"/>
        </b-button>

        <template v-if="show_cart_button && canAccessCompanyFeatures()">
          <span v-b-tooltip="`You cannot add to cart because you are logged in as admin`"
                v-if="canvasImage.scene == null || (is_admin_token && isEcommerceCompany())">
           <b-button :key="'AddToCart'" aria-label="Add to Cart" v-if="!cartLoading"
                      class="mx-2 px-5" variant="secondary" @click="addToCart" disabled>
              Add to Cart
            </b-button>
          </span>

          <span v-else-if="vectorImageConstraint?notVectorLogosCount > 0:false">
            <b-button @click="addToCart(null)" aria-label="Add to Cart" class="mx-2 px-5"
                      variant="secondary">
              Finalize Design
            </b-button>
          </span>
          <b-button v-else-if="!cartLoading" :key="'AddToCart'" aria-label="Add to Cart" class="mx-2 px-5" variant="secondary" @click="addToCart(null)">
            {{ getProductEditInfoObject.editing && getProductEditInfoObject.type == 'cart_product' ? 'Update Cart' : 'Add to Cart' }}
          </b-button>
          <b-button v-else class="mx-2 px-5" variant="secondary" :disabled="true">
            <img width="20" height="20" src="@assets/images/loading.gif"/>
          </b-button>
        </template>
      </template>
    </template>
  </template>

  <span v-else-if="vectorImageConstraint?notVectorLogosCount > 0:false && isRosterOpened">
    <b-button @click="showVModal('replace-logo')" aria-label="Add to Cart" class="mx-2 px-5"
              variant="secondary">
      Finalize Design
    </b-button>
  </span>

  <template v-else>
    <span v-if="vectorImageConstraint?notVectorLogosCount > 0:false">
      <b-button @click="showVModal('replace-logo')" aria-label="Add to Cart" class="mx-2 px-5"
                variant="secondary">
        Finalize Design
      </b-button>
    </span>
    <template v-else>
      <span>
        <b-button v-if="show_cart_button"  @click="setActionBeforeLogin('addToCart')" :key="'loginmodal'" aria-label="Add to Cart"
                   class="mx-2 px-5" variant="secondary">Add to Cart
        </b-button>
        <b-button v-if="show_quote_button"  @click="setActionBeforeLogin('addQuote')" :key="'loginmodal'" aria-label="Get Quote"
                   class="mx-2 px-5" variant="secondary">Get Quote
        </b-button>
      </span>

    </template>
  </template>
  </span>

</template>

<script lang="ts">
import {Component, Mixins, Prop, Vue} from 'vue-property-decorator'
import {cartModalData} from "@/mixins/LockerProduct";
import {filter} from "lodash";
import { hasCompanyPermission, isEcommercePlatform, canAccessCompanyFeatures} from "@/helpers/Helpers";

@Component<AddToCartButton>({
  computed:{
    show_cart_button : function () {
      if(!this.get_quote) {
        return true;
      }
      else if(!this.get_quote.enable) {
        return true;
      }else {
        return (this.get_quote.cart_with_quote) ? true : false;
      }
    },
    show_quote_button : function () {
      if(this.isEcommerceCompany()) {
        return false
      }

      return (this.get_quote && this.get_quote.enable) ? this.get_quote.enable : false;
    }
  }

})
export default class AddToCartButton extends Mixins(cartModalData) {
  @Prop({ required: true }) readonly products_fonts!: Record<any, any>[]

  public is_admin_token = localStorage.getItem(Vue.prototype.$adminToken_localstorage_key);
  public get_quote = this.$store.getters.getSetting('get_quote');

  get isRosterOpened() {
    return this.$store.getters.getIsRosterOpened
  }
  get getProductEditInfoObject() {
    return this.$store.getters.getProductEditInfoObject;
  }
  get company(): Record<any, any> {
    return this.$store.getters.getCompany
  }
  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }
  get customerPermissions() {
    return this.$store.getters.getCustomerPermissions
  }
  get canvasImage() {
    return this.$store.getters.getCanvasImage
  }
  get cartLoading(): Record<any, any> {
    return this.$store.getters.getCartLoading;
  }
  get vectorImageConstraint():boolean{
    return this.$store.getters.getFactorySettings(this.selectedProduct.factory_id)?.vector_image_constraint
  }
  get notVectorLogosCount(){
    const custom_logos = this.$store.getters.selectedProductCustomLogos
    let non_vector_logos_count = 0
    if(custom_logos && custom_logos.length > 0) {
      const non_vector_logos = filter(custom_logos, (custom_logo: Record<any, any>) => {
        return (custom_logo.original_logo_url && custom_logo.is_vector == false) ? true : false
      })
      non_vector_logos_count = non_vector_logos.length
      if(non_vector_logos.length == 0){
        setTimeout(()=>{
          this.hideVModal('replace-logo');
          // this.hideVModal('rostermodal');
        }, 3000)
      }
    }
    return non_vector_logos_count
  }
  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }
  private setRosterOpen(val: boolean) {
    this.$store.commit('SET_IS_ROSTER_OPEN', val)
  }

  public getQuote() {
    let admin_salesrep_options =  this.$store.getters.getAdminSalesRep;
    if(hasCompanyPermission('show_admin_salerep') && admin_salesrep_options.length > 0) {
      this.$store.commit("SET_SALES_REP_MODAL_FROM", 'cart')
      this.showVModal('sale-representative-modal');
    } else {
      this.addToCart(null, {quote:true, 'admin_salesrep_id': null});
    }

  }

  public isEcommerceCompany(): boolean {
    return isEcommercePlatform()
  }

  public canAccessCompanyFeatures(): boolean {
    return canAccessCompanyFeatures()
  }


  public async setActionBeforeLogin(type: string) {
    this.$store.commit("ACTION_BEFORE_LOGIN", type);
    this.$store.commit('SET_SELECTION_MODE', {
      readonly: false,
      collectionAddmoreMode: false,
      eventProductMode: false,
      eventCollectionMode: false
    })
    this.gotoLogin()
  }


  private async addToCart(resolve:any=null, get_quote = {quote:false, 'admin_salesrep_id': null}) {

    await this.addToCartMixin(this.products_fonts, resolve, get_quote);
    if (this.getProductEditInfoObject.type == "cart_product" && this.company.platform != 'wordpress' && !resolve) {

      if(isEcommercePlatform()) {
        this.hideVModal('cart-modal')
      }else{
        this.showVModal('cart-modal')
      }

    }
  }
  public gotoLogin() {
    if (this.company.platform == 'self') {
      this.$modal.show('loginModal')
    } else {
      if (this.company.login_code.type == 'url') {
        window.location.href = this.company.login_code.action
      } else {
        eval(this.company.login_code.action)
      }
    }
  }
}
</script>
