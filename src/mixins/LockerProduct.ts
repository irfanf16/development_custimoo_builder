/* eslint-disable */
import { Component, Vue } from 'vue-property-decorator'
import {findIndex} from 'lodash';
import {getRandom} from "@/helpers/Helpers";
@Component
export default class LockerProducts extends Vue {

  public async editProduct(room_id: number, room_product_id: number) {
    const lockerIndex = await findIndex(this.getLockerProducts, {id: room_id});
    const  productIndex = findIndex(this.getLockerProducts[lockerIndex].product, {id: room_product_id});
    const id = this.getLockerProducts[lockerIndex].product[productIndex].id
    let prod_res = await this.$store.dispatch('getLockerProductDetail', id);
    Vue.set(this.getLockerProducts[lockerIndex].product, productIndex,  prod_res.data)
    this.$store.commit('UPDATE_ROSTER', JSON.parse(prod_res.data.roster_detail))
    this.$root.$emit('rostershared', '')
    const designId = this.getLockerProducts[lockerIndex].product[productIndex].design_id
    const styleId = this.getLockerProducts[lockerIndex].product[productIndex].style_id
    this.$store.commit('CHANGE_EDIT_STATUS', {id: id, status: true, designId: designId, styleId: styleId})
    const product_id = this.getLockerProducts[lockerIndex].product[productIndex].product_id;
    const element = this.getLockerProducts[lockerIndex].product[productIndex];
    let ind = 0
    if (product_id != this.$store.getters.getEditMainProductId) {
      const exist = this.products.find((prd:Record<any, any>) => {
        return prd.id == product_id
      })
      if(!exist) {
        this.$store.commit('CHANGE_EDIT_LOCKER_PRODUCT', {prd_id: product_id})
        await this.$store.dispatch('ADD_CUSTOMIZED_PRODUCT', product_id);
        ind = this.products.length - 1;
      }
      else {
        const index = this.products.findIndex((prd:Record<any, any>) => prd.id == product_id)
        ind = index >= 0 ? index : 0
      }
      this.$store.commit('CHANGE_EDIT_STATUS', {product_id: product_id})
    }
    await this.$store.dispatch('setSelectedIndex', {selectedIndex: ind});
    let selectedIndex = this.selectedProduct.productstyles.findIndex((x: Record<any, any>) => x.id === element.style_id);
    await this.$store.commit('CHANGE_STYLE_INDEX', selectedIndex);
    await this.$store.dispatch('OVERRIDE_CUSTOM_LOGOS', element);
    await this.$store.dispatch('OVERRIDE_CUSTOM_TEXT', element);
    await this.$store.dispatch('overRideDefaultColors', JSON.parse(element.defaultcolors));
    await this.$store.dispatch('overRideGroupColors', JSON.parse(element.groupcolors));
    this.selectedProduct.productstyles[selectedIndex].productdesigns.forEach((item: Record<any, any>) => {
      if (item.id == element.design_id) {
        Vue.set(item, 'design_show', 1)
        this.$store.dispatch('setSelectedProductDesignID', item.id)
      } else {
        Vue.set(item, 'design_show', 0)
      }
    });
    this.$emit('hideLockerRoomModal')
  }

  get getLockerProducts() {
    let main_product_id = this.$store.getters.getEditProductId;
    let locker_products = this.$store.getters.getLockerProducts;
    let locker_products_count = locker_products.length
    locker_products = locker_products.map((item: Record<any, any>, lpIdx: number) => {
      //locker_pull_groups contains the locker group names where products can be moved. This array is make sure user can not drop product to same locker.
      let locker_pull_groups = [];
      for (let i = 0; i < locker_products_count; i++) {
        if (lpIdx != i) {
          locker_pull_groups.push(`locker-${i}`);
        }
      }
      locker_products[lpIdx].locker_pull_groups = locker_pull_groups
      item.product = item.product.map((locker_product: Record<any, any>) => {
        if (main_product_id == locker_product.id) {
          let random = getRandom();
          locker_product.product_url = `${locker_product.product_url}?${random}`;
        }
        return locker_product
      })
      return item
    })
    return locker_products;
  }

  get products(): [Record<any, any>] {
    return this.$store.getters.getProducts
  }
  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

 /* public async editProduct (room_id: number, room_product_id: number) {
    const self = this;
    const main_product_id = await self.$store.getters.getEditProductId;
    let locker_products = await self.$store.getters.getLockerProducts;
    const locker_products_count = locker_products.length
    locker_products = locker_products.map((item: Record<any, any>, lpIdx: number) => {
      console.log('locker_products',locker_products)
      //locker_pull_groups contains the locker group names where products can be moved. This array is make sure user can not drop product to same locker.
      const locker_pull_groups = [];
      for (let i = 0; i < locker_products_count; i++) {
        if (lpIdx != i) {
          locker_pull_groups.push(`locker-${i}`);
        }
      }
      locker_products[lpIdx].locker_pull_groups = locker_pull_groups
      item.product = item.product.map((locker_product: Record<any, any>) => {
        if (main_product_id == locker_product.id) {
          const random = getRandom();
          locker_product.product_url = `${locker_product.product_url}?${random}`;
        }
        return locker_product
      })
      return item
    })
   const lockerIndex = await findIndex(locker_products, {id: room_id});
   const locker = locker_products[lockerIndex];
   const  productIndex = findIndex(locker_products[lockerIndex].product, {id: room_product_id});
   const locker_product = locker_products[lockerIndex].product[productIndex];
    const product_id = locker_product.product_id;
     const id = locker_product.id;
     const prod_res = await self.$store.dispatch('getLockerProductDetail', id);
     Vue.set(self.$store.getters.getLockerProducts[lockerIndex].product, productIndex,  prod_res.data)
     self.$store.commit('UPDATE_ROSTER', JSON.parse(prod_res.data.roster_detail))
     self.$root.$emit('rostershared', '')
     self.$store.commit('CHANGE_EDIT_STATUS', {id: id, status: true, designId: locker_product.design_id, styleId: locker_product.style_id})
    const products = await self.$store.getters.getProducts;
    const element = prod_res;
    let ind = 0
    const main_prod_id = await self.$store.getters.getEditMainProductId;
    console.log("main_prod_id", main_prod_id);
    if (product_id != main_prod_id) {
      console.log("products", products, product_id)
      const exist = products.find((prd:Record<any, any>) => {
        return prd.id == product_id
      })
      if(!exist) {
        self.$store.commit('CHANGE_EDIT_LOCKER_PRODUCT', {prd_id: product_id})
        await self.$store.dispatch('ADD_CUSTOMIZED_PRODUCT', product_id);
        ind = products.length - 1;
      }
      else {
        const index = products.findIndex((prd:Record<any, any>) => prd.id == product_id)
        ind = index >= 0 ? index : 0
      }
      this.$store.commit('CHANGE_EDIT_STATUS', {product_id: product_id})
    }
    console.log("sdfsdfsdf", ind)
     await self.$store.dispatch('setSelectedIndex', {selectedIndex: ind});
     const selected_product = await self.$store.getters.getSelectedProduct;
     const selectedIndex = selected_product.productstyles.findIndex((x: Record<any, any>) => x.id === locker_product.style_id);
     await self.$store.commit('CHANGE_STYLE_INDEX', selectedIndex);
     // await self.$store.dispatch('OVERRIDE_CUSTOM_LOGOS', JSON.parse(locker_product.custom_logos));
    console.log('locker_product',locker_product)
     await self.$store.dispatch('OVERRIDE_CUSTOM_LOGOS', locker_product);
     await self.$store.dispatch('OVERRIDE_CUSTOM_TEXT', locker_product);
     await self.$store.dispatch('overRideDefaultColors', JSON.parse(locker_product.defaultcolors));
     await self.$store.dispatch('overRideGroupColors', JSON.parse(locker_product.groupcolors));
     selected_product.productstyles[selectedIndex].productdesigns.forEach((item: Record<any, any>) => {
       if (item.id == locker_product.design_id) {
         Vue.set(item, 'design_show', 1)
         self.$store.dispatch('setSelectedProductDesignID', item.id)
       } else {
         Vue.set(item, 'design_show', 0)
       }
     });
     self.$emit('hideLockerRoomModal')
  }*/
}
