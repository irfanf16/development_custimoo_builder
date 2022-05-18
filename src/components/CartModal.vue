<template>
  <modal :minWidth ="1000" :scrollable="true" :height="'auto'"
         :minHeight="600" :resizable="true"
         :adaptive="true" name="cart-modal" ref="cart-modal" id="cart-center-lockerroom"
         size="xl" modal-class="modal-fullscreen2"  content-class="lockerroom-modal"
         @closed="customer_reference_no=null" @before-open="getAddresses"
        >
    <div class="modal-header d-flex justify-content-between">
      <span class="fs-5 font-weight-bold">Cart</span>
      <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hideVModal('cart-modal')"><BIconX /></span>
    </div>

    <div class="theme-scroll" style="height: calc(100% - 65px); overflow-y: auto; padding-bottom: 20px">
      <div class="loader relative" v-if="viewLoader"><img src="../../src/assets/images/loading.gif" /></div>
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
        <template v-for="(cart_item) in cartItems">
          <tr :key="factory_product.id" v-for="(factory_product) in cart_item.factory_products">
            <td>
              {{factory_product.product_name}}
            </td>
            <td><b-img style="width: 80px" thumbnail fluid :src="storageUrl+factory_product.front_image" alt="Front Design"></b-img>
              <b-img style="width: 80px" thumbnail fluid :src="storageUrl+factory_product.back_image" alt="Back Design"></b-img>

            </td>
            <td>
              <template v-for="(roster_detail,index) in factory_product.roster_detail">
                <div :key="index"><span>{{roster_detail.size}} : {{roster_detail.quantity}}</span></div>
              </template>
              <div>Total : {{factory_product.roster_detail | itemQtyCount(factory_product.roster_detail)}}</div>
            </td>
            <!--          <td>{{factory_product.roster_detail | itemQtyCount(factory_product.roster_detail)}}</td>-->
            <td class="cursor-pointer">   <a data-title="Edit Product" @click="editCartItem(factory_product,cart_item.id)">
              <font-awesome-icon
                :icon="['fas', 'edit']"/>
            </a></td>
            <td class="cursor-pointer">  <a data-title="Delete Event" @click="deleteConfirm(cart_item,factory_product)"
            >
              <font-awesome-icon
                :icon="['fas', 'trash-alt']"/>
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
              <div>{{shipping_address.first_name}} {{shipping_address.last_name}}</div>
              <div>{{shipping_address.address1}}</div>
              <div>{{shipping_address.address2}}</div>
              <div>{{shipping_address.zip_code}}</div>
              <div>{{shipping_address.country.name}} {{shipping_address.city}}</div>

              <div class="d-flex flex-wrap w-100">
                <div>{{shipping_address.phone_number}}</div>

                <router-link :to="'address?cart=1'" class="btn ml-auto align-self-end btn-dark medium btn-sm my-orders">
                  <span style="font-size: 0.85em"><b-icon-pencil /></span> Change
                </router-link>
              </div>

            </div>
          </template>
          <div v-else class="px-2 pt-1 pb-2">
            <router-link :to="'address?cart=1'" class="btn btn-secondary btn-sm my-orders">
              <span style="font-size: 0.9em"><b-icon-plus /></span> Add
            </router-link>
          </div>
        </div>

        <div class="align-self-start">
          <div class="fs-2 font-weight-bold ">Reference No:</div>
          <div class="mt-1">
            <b-form-input   class="form-input" placeholder="Order reference" type="text" name="customer_reference_no"
                            v-model="customer_reference_no" />
          </div>
        </div>
      </div>

      <!--    <template #modal-footer>-->
      <!--      <div class="text-right">-->
      <!--        <b-button   v-b-modal.modal-center-existingCollection variant="secondary" style="margin-right: 5px">Add to existing collection</b-button>-->
      <!--      </div>-->
      <!--    </template>-->
      <b-button class="mt-4" @click="createOrder">Finalize Order</b-button>
    </div>
  </modal>

</template>

<script lang="ts">

import {Component, Mixins, Prop, Vue, Watch} from 'vue-property-decorator'
import {http} from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";
import {getReminderOptions, processColorsCustom} from "@/helpers/Helpers";
import {LockerProducts, handleMainProducts} from "@/mixins/LockerProduct";
import {findIndex} from "lodash";
import ModalAction from "@/mixins/ModalAction";
    @Component<CartModal>({
        components: {},
      filters: {
        itemQtyCount: (value: Record<any, any>) => {
          if(value.length > 0) {
            let quantity = 0 ;
             value.forEach((roster:Record<any,any>) => {
                 quantity += parseInt(roster.quantity);
            });
            return quantity
          }
          return 0
        }
      },
      mounted() {
        // this.getColors()
      }
    })
    export default class CartModal extends Mixins(ErrorMessages,LockerProducts, handleMainProducts, ModalAction) {

      public viewLoader = false;
      private userData = this.$store.getters.getCustomer;
      private storageUrl = process.env.VUE_APP_STORAGE_URL
      public customer_reference_no  = ""
      public shipping_address: Record<any, any> = null

      get cartItems() {
        return this.$store.getters.getCartItems
      }
      public createOrder(){
        let payload = {}
         payload['customer_reference_no'] = this.customer_reference_no
        if(!this.customer_reference_no){
          this.showToast('Please provide customer reference number.', 'ERROR');
          return false;
        }

        if(this.shipping_address){
          payload['address_id'] = this.shipping_address.id
        }else{
          this.showToast('Please select shipping address.', 'ERROR');
          return false;
        }

        this.viewLoader = true;
        http.post('order', payload).then((res:Record<any, any>) => {
          if (res.data.success){
            this.$store.dispatch('addToCart',[])
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
        }).catch((err:any) => {
          this.viewLoader = false
          this.showErrorArr(err.response.data.errors)
        });
      }

      public async getAddresses() {
        this.$store.commit('SHOW_CART_MODAL',false);
        let address = this.$store.getters.getShippingAddress
        if(!address){
          address  = await this.$store.dispatch('getCartAddresses');
          this.shipping_address = address
        }else{
          this.shipping_address = address
        }

      }
      // public async editCartItem(cart_item:Record<any, any>,cart_id:number) {
      //   let self = this;
      //   let is_customized = this.$store.getters.getCustomized
      //   let is_personalized = this.$store.getters.getPersonalized
      //   let locker_product: null | Record<any, any> = null;
      //   await this.$store.dispatch('setProductType', {prd_type: cart_item.product_type, value: true});
      //   let url = `/list/products?customized=${this.$store.getters.getCustomized}&personalized=${this.$store.getters.getPersonalized}&active_product_id=${cart_item.product_id}`;
      //   await http.get(url).then(async (response: Record<any, any>) => {
      //     await this.handleMainProducts(response);
      //     await self.updateFactoryProduct(cart_item);
      //     await this.$store.dispatch('setEditCart', {key:'cartId',value:cart_id});
      //     await this.$store.dispatch('setEditCart', {key:'cartItemId',value:cart_item.id});
      //     this.hide()
      //   }).catch(err => {
      //     console.error("Error while updating cart item", err)
      //   })
      // }

      public editCartItem(cart_item:Record<any, any>,cart_id:number,edit:boolean) {
        let self = this;
        let is_customized = this.$store.getters.getCustomized
        let is_personalized = this.$store.getters.getPersonalized
        let lockerIndex: null | number = null;
        let productIndex: null | number = null;
        let locker_product: null | Record<any, any> = null;
        let url = "product_detail";
        http.get(url, {params: {id: cart_item.product_id}}).then(async (selected_product_detail) => {
          let prod_res = selected_product_detail;
          let locker_product_type = prod_res.data.product_type;
          locker_product = prod_res.data;
          this.$store.commit('UPDATE_ROSTER', JSON.parse(JSON.stringify(cart_item.roster_detail)));
          this.$root.$emit('rostershared', '')
          const designId = cart_item.design_id
          const styleId = cart_item.style_id
          const product_id = cart_item.product_id

          // const element = prod_res.data;
          is_customized = locker_product_type == "customized" ? true: is_customized;
          is_personalized = locker_product_type == "personalized" ? true : is_personalized;
          let url = `list/products?customized=${is_customized}&personalized=${is_personalized}&active_product_id=${locker_product?.id}`;
          await self.$store.dispatch("updateMainProductsInfo",  {has_more_products: false, next_page: null, active_product_id:locker_product?.id});
          await http.get(url).then(async (response: Record<any, any>) => {
            await (this as Record<any,any>).handleMainProducts(response);

            let selected_product = this.$store.getters.getSelectedProduct;
            let selectedIndex = selected_product.productstyles.findIndex((x: Record<any, any>) => x.id === cart_item.style_id);
            await this.$store.commit('CHANGE_STYLE_INDEX', selectedIndex);
            let customLogos = this.$store.getters.getCustomLogoObject
            if(!customLogos[cart_item.product_id]) {
              await this.$store.dispatch('setCustomObj', cart_item.product_id)
            }

            let logos = {
              custom_logos: JSON.stringify(cart_item.custom_logos),
              product_id:cart_item.product_id
            }
            let texts = {
              text: JSON.stringify(cart_item.custom_texts),
              product_id:cart_item.product_id
            }
            await this.$store.dispatch('OVERRIDE_CUSTOM_LOGOS', logos);
            await this.$store.dispatch('OVERRIDE_CUSTOM_TEXT', texts);
            await this.$store.dispatch('overRideDefaultColors', cart_item.defaultcolors);
            await this.$store.dispatch('overRideGroupColors', cart_item.groupcolors);
            selected_product.productstyles[selectedIndex].productdesigns.forEach((item: Record<any, any>) => {
              if (item.id == cart_item.design_id) {
                Vue.set(item, 'design_show', 1)
                this.$store.dispatch('setSelectedProductDesignID', item.id)
              } else {
                Vue.set(item, 'design_show', 0)
              }
            });

            //set logo colors
            let logo_colors = []
            if(!cart_item.colors && cart_item.custom_logos) {
              //fetch from server
              let logos = cart_item.custom_logos
              if(logos.length > 0) {
                let color_str:any = await this.fetchLogoColors(logos[0].id);
                let image_colors = processColorsCustom(JSON.parse(color_str))
                let image_color_count = image_colors.length;
                while(image_color_count < 4 ) {
                  image_colors.push({hex: null, pantone: null, name: null});
                  ++image_color_count;
                }
                logo_colors = image_colors
              }
            }
            else {
              logo_colors = cart_item.colors
            }
            await this.$store.dispatch("SET_LOGO_COLORS", logo_colors);

          })
          await this.$store.dispatch('setProductType', {prd_type: locker_product_type, value: true});
          await this.$store.dispatch('setEditCart', {key:'cartId',value:cart_id});
          await this.$store.dispatch('setEditCart', {key:'cartItemId',value:cart_item.id});
          this.$modal.hide('cart-modal');
          if(!edit){
            this.$modal.show('rostermodal');
          }
        }).catch(err => {
          console.error("Error while getting order detail", err)
        })
      }

      public deleteConfirm(cart_item: Record<any,any>,factory_product:Record<any,any>){
        this.$emit("deleteCartItem",{cart_item:cart_item,factory_product:factory_product});
      }

    }

</script>

<style lang="scss" scoped>

</style>
