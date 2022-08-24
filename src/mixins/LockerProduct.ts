/* eslint-disable */
import { Component, Vue } from 'vue-property-decorator'
import {findIndex} from 'lodash';
import {
  fontsColorsManipulation,
  fontsList,
  getRandom,
  initCustomLogos,
  initCustomTexts,
  processColorsCustom, rosterDetailsInit
} from '@/helpers/Helpers'
import {http} from "@/httpCommon";
import {getClosestColor} from "@/pantoneColor";
@Component
export class LockerProducts extends Vue {

  public async editProduct(room_id: number, room_product: Record<any, any>, ind: number, share_url="") {
    let self: Record<any, any> = this;
    self.search_products = ''
    this.$store.commit('setActiveLockerProduct', ind)
    await this.$store.dispatch('setProductType', {prd_type: room_product.product_type, value: true});
    let is_customized = this.$store.getters.getCustomized
    let is_personalized = this.$store.getters.getPersonalized
    let room_product_id = room_product.id;
    let product_id = room_product.product_id;
    self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", {
      editing: true, type: "locker_product", filters: { customized: is_customized, personalized: is_personalized, search_products: ''},
      locker_product_info: { product_id: product_id, locker_product_id: room_product_id, style_id: room_product.style_id, design_id: room_product.design_id},
      cart_product_info: null, order_product_info: null
    })

    let url = `list/products?customized=${is_customized}&personalized=${is_personalized}&active_product_id=${product_id}&active_product_child_id=${room_product_id}&active_product_type=locker_product`;
    if(share_url) {
      url += `?share_url=${share_url}`;
    }

      http.get(url).then(async (response: Record<any, any>) => {
        let active_product_detail = response.data.editing_product_detail;
        //todo need to confirm this logic. I think it's have no effect
        if(active_product_detail.roster_detail) {
          this.$store.commit('UPDATE_ROSTER', JSON.parse(active_product_detail.roster_detail))
        }
        this.$root.$emit('rostershared', '')
        //todo ends her

        await self.handleMainProducts(response, active_product_detail);
        this.$emit('hideLockerRoomModal')
      }, (error:Record<any, any>) => {
        console.error("Error while retrieving products",error)
      })
     // await this.$store.dispatch('setProductType', {prd_type: locker_product_type, value: true});
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

  public async fetchLogoColors(id:number) {
    let colors = null
    await http.get(`logos/colors?id=${id}`)
      .then((res) => {
        colors =  res.data.colors
      }).catch((e) => {
        console.log('Unable to fetch logo colors',e.response.data.message)
        //this.showError('Unable to fetch logo colors')
      })
    return colors
  }
}

@Component
export class handleMainProducts extends Vue {

  public async handleMainProducts(response: Record<any, any>){
    let self: Record<any, any> = this;
    let product_edit_info_object = self.$store.getters.getProductEditInfoObject
    let response_data = response.data;
    let active_product_index = response.data.active_product_index
    let active_product_id = response.data.active_product_id
    let response_products_obj = response_data.products;
    let retrieved_products = response_products_obj.data;
    let append_products =  response_products_obj.current_page > 1;
    if(response_products_obj.next_page_url) {
      this.$store.commit("SET_PRODUCTS_NEXT_PAGE_NO", response_products_obj.current_page + 1)
    } else {
      this.$store.commit("SET_PRODUCTS_NEXT_PAGE_NO", null)
    }
    await this.$store.dispatch('setStockCount',response.data.stock_count);
    if(append_products) {
      console.log("append products")
      await this.$store.commit('SET_PRODUCTS', {products: retrieved_products, append_products: true});
     // this.$root.$emit('sliderEvent');
      return false;
    }
    await this.$store.dispatch('setProductType', {prd_type: 'customized', value: response.data.customized});
    await this.$store.dispatch('setProductType', {prd_type: 'personalized', value: response.data.personalized});
    let update_order_product = response_data.update_order_products_data;
    if(product_edit_info_object.type == 'order_product' && update_order_product) {
      let order_products = Object.assign({}, product_edit_info_object.order_product_info, {order_products: update_order_product})
      self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", { editing: true, type: "order_product", filters: null, locker_product_info: null,
        cart_product_info: null, order_product_info: order_products
      })
      product_edit_info_object.order_product_info = order_products
    }
    let product_id = null;
    let product_index = 0;
    let selected_style = null;
    let style_index = 0;
    let design_id = 0;
    let editing_product_detail = response_data.editing_product_detail
    let active_index = 0;
    /*
    * The default value for edit_product_index is -1. -1 Means product is not being edited. product_edit_info_object.editing check is added as the edit_product_index
    * will have value only when it's being edited.
    * */
    let is_editing = product_edit_info_object.editing /*&& response_data.active_product_index >= 0*/
    if(is_editing) {
     // console.log('editing mode');
      ({product_index, style_index, design_id, active_index} = await self.handleEditMode(retrieved_products));
    }
    else {
     // console.log('not editing mode');
      let last_active_prod_data = self.$store.getters.getLastActiveProductData;
      if(editing_product_detail ) {
        product_index = response_data.active_product_index;
      }
      else {
        if(last_active_prod_data.product_id) {
          product_index = findIndex(retrieved_products, (retrieved_product: Record<any, any>) => {
            return retrieved_product.id == last_active_prod_data.product_id
          })
          if(product_index >= 0 ) {
            style_index = last_active_prod_data.style_index;
            design_id = last_active_prod_data.design_id
          } else {
            product_index = 0
            style_index = 0
            let design_index = findIndex(retrieved_products[product_index].productstyles[style_index].productdesigns, (product_design: Record<any, any>) => {
              return product_design.design_show
            })
            design_id = retrieved_products[product_index].productstyles[style_index].productdesigns[design_index].id
          }
          this.$store.commit('SET_CUSTOM_LOGOS', {product_id: last_active_prod_data.product_id, custom_logos: last_active_prod_data.custom_logos})
          this.$store.commit('SET_GROUP_COLORS', last_active_prod_data.group_colors)
        }
        else {
          let {sync_id, customizer_preview, update_cart} = self.$route.query
          if(sync_id) {
            product_index = retrieved_products.findIndex((retrieved_product: Record<any, any>) => {
              return retrieved_product.sync_id === sync_id;
            });
            product_index = product_index >=0 ? product_index : 0
            product_id = retrieved_products[product_index]
          }
          else {
            product_index = 0
            product_id = retrieved_products[product_index]
          }
          style_index = 0;
          let design_index = findIndex(retrieved_products[product_index].productstyles[style_index].productdesigns, (product_design: Record<any, any>) => {
            return product_design.design_show
          })
          design_id = retrieved_products[product_index].productstyles[style_index].productdesigns[design_index].id
          let set_last_active_product_data = { design_index: design_index, design_id: design_id, product_index: 0, product_id:  product_id,
            search_products: self.search_products, style_index: 0, style_id: retrieved_products[0].productstyles[0].id,
            page_no: 1, customized: this.$store.getters.getCustomized, personalized: this.$store.getters.getPersonalized, custom_texts: [], custom_logos: [],
            default_colors: [], group_colors: [],
          }
          self.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", set_last_active_product_data);
        }
      }
      // await this.$store.commit('SET_PRODUCTS', {products: retrieved_products, append_products: append_products});
    }
    await this.$store.commit('SET_PRODUCTS', {products: retrieved_products});
    await this.$store.dispatch('setSelectedIndex', {selectedIndex: product_index});
    this.$store.commit('CHANGE_STYLE_INDEX', style_index);
    await this.$store.dispatch("getModels", retrieved_products[product_index].id);
    this.$root.$emit('sliderEvent', product_index);
    //If we are editing locker product then set the locker product data and return
    if(self.is_shared_product  || product_edit_info_object.type == "locker_product") {
      //if editing product detail not found then probably that locker product has been deleted or not found for some reason
      if(editing_product_detail) {
        await self.setLockerProductData(editing_product_detail)
      } else {
        self.exitFromEditMode();
        let query_params = await self.setQueryParams()
        self.retrieveProducts(query_params)
      }
      return false;
    }

    if(product_edit_info_object.type == "cart_product") {
      await self.setCartProductData(retrieved_products)
      return false;
    }
    if(product_edit_info_object.type == "order_product") {
      await self.updateFactoryProduct(product_edit_info_object.order_product_info.order_products.factory_products[active_index]);
      return false;
    }

    let selected_product = this.$store.getters.getSelectedProduct;
    initCustomTexts(retrieved_products)
    initCustomLogos(retrieved_products)
    rosterDetailsInit(retrieved_products)

    let customLogos = this.$store.getters.getCustomLogoObject
    for (const product of retrieved_products) {
      if(!customLogos[product.id]) {
        await this.$store.dispatch('setCustomObj', product.id)
      }
    }
    this.$store.dispatch('setColorSectionVisibility')
    this.$store.dispatch("getModels", selected_product.product_id);
    selected_product.productstyles[style_index].productdesigns.forEach((item: Record<any, any>) => {
      if (item.id == design_id) {
        Vue.set(item, 'design_show', 1)
        this.$store.dispatch('setSelectedProductDesignID', item.id)
      } else {
        Vue.set(item, 'design_show', 0)
      }
    });
  }

  public async beforeSetDataValidateActiveProductData(retrieved_products: Record<any, any>[]) {
    let self = this;
    let product_edit_info_object = self.$store.getters.getProductEditInfoObject;
    //console.log('before validate', product_edit_info_object)
    let product_index = -1;
    let style_index = -1;
    let design_id = null;
    let edit_type = product_edit_info_object.type;
    let validated = false;
    let message = null
    if(product_edit_info_object.editing) {
      switch (edit_type) {
        case "locker_product":
          product_index = findIndex(retrieved_products, (retrieved_product: Record<any, any>) => {
            return retrieved_product.id == product_edit_info_object.locker_product_info.product_id
          });
          if(product_index < 0) {
            validated = false
            message = "Can not find locker product to edit. So exiting edit mode"
            //if product not found then exit from edit mode
            self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", {
              editing: false, type: null, filters: null, locker_product_info: null, cart_product_info: null, order_product_info: null
            })
          } else {
            validated = true
          }
          break;
        case "cart_product": //in case of editing cart product only one product shown
          if(retrieved_products[0].id == product_edit_info_object.cart_product_info.cart_item_product.product_id) {
            validated = true;
          } else {
            validated = false;
            message = "Can not find cart product to edit. So exiting edit mode"
            self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", {
              editing: false, type: null, filters: null, locker_product_info: null, cart_product_info: null, order_product_info: null
            })
          }
          break;
        case "order_product": //in case of editing order product only one product shown
          //on First time load we do not have product id that's why this check is added
          if(product_edit_info_object.cart_product_info && product_edit_info_object.cart_product_info.product_id) {
            if(retrieved_products[0].id == product_edit_info_object.cart_product_info.product_id) {
              validated  = true
            } else {
              validated = false
              message = "Can not find order product to edit. So exiting edit mode"
            }
          } else {
            validated = true
          }
          break;
        default: {
          validated = false
          message = "Invalid edit mode. So exiting edit mode"
          console.info("beforeSetDataValidateActiveProductData invalid edit mode")
        }
      }
    }
    else {
      let last_active_product_data = self.$store.getters.getLastActiveProductData;
      if(last_active_product_data.product_id) {
        product_index = findIndex(retrieved_products, (retrieved_product: Record<any, any>) => {
          return retrieved_product.id == last_active_product_data.product_id
        });
        if(product_index < 0 ) {
          console.log("invalid last product id", last_active_product_data.product_id)
          validated = false
          message = "Did not find last active product data"
          //if last active product not found then reset the last active product data object
          this.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", {
            design_index: 0, design_id: null, product_index: 0, product_id: null, search_products: null, style_index: 0, style_id: null,
            page_no: 1, customized: true, personalized: false, custom_texts: [], custom_logos: [], default_colors: [], group_colors: [], logo_colors: [],
            roster_detail: [],
          })
        } else {
          validated = true
        }
      } else {
        validated = true
      }

    }
    return {
      validated: validated, message: message
    }
  }

  public async handleEditMode(retrieved_products: Record<any, any>[]) {
    let self = this;
    let product_edit_info_object = self.$store.getters.getProductEditInfoObject;
    let product_index = 0;
    let style_index = 0;
    let design_id = null;
    let active_index = 0; //active index is only used for edit order product

    let edit_type = product_edit_info_object.type;
    switch (edit_type) {
      case "locker_product":
        product_index = findIndex(retrieved_products, (retrieved_product: Record<any, any>) => {
          return retrieved_product.id == product_edit_info_object.locker_product_info.product_id
        });
        if(product_index >= 0) {
          style_index = findIndex(retrieved_products[product_index].productstyles, (product_style: Record<any, any>) => {
            return product_style.id == product_edit_info_object.locker_product_info.style_id;
          });
        }
        // style_index = product_edit_info_object.locker_product_info.style_index;
        design_id = product_edit_info_object.locker_product_info.design_id;
        break;
      case "cart_product": //in case of editing cart product only one product shown. So product index will always be 0
        style_index = findIndex(retrieved_products[0].productstyles, (product_style: Record<any, any>) => {
          return product_style.id == product_edit_info_object.cart_product_info.cart_item_product.style_id;
        });
        design_id =  product_edit_info_object.cart_product_info.cart_item_product.design_id;
        break;
      case "order_product": //in case of editing order product only one product shown. So product index will always be 0
        active_index = product_edit_info_object.order_product_info.order_products.active_index;
        let order_edit_product = product_edit_info_object.order_product_info.order_products.factory_products[active_index]
        let roster_details = order_edit_product.roster_detail;
        style_index = findIndex(retrieved_products[product_index].productstyles, (product_style: Record<any, any>) => {
          return product_style.id == order_edit_product.style_id;
        });
        design_id =  order_edit_product.design_id;
        this.$store.commit('UPDATE_ROSTER',roster_details);
        if(order_edit_product.product_type == "customized") {
          await this.$store.dispatch('setProductType', { prd_type: "customized", value: true });
          await this.$store.dispatch('setProductType', { prd_type: "personalized", value: false });
        } else if(order_edit_product.product_type == "personalized") {
          await this.$store.dispatch('setProductType', { prd_type: "customized", value: false });
          await this.$store.dispatch('setProductType', { prd_type: "personalized", value: true });
        }
        break;
    }
    return {
      product_index: product_index, style_index: style_index, design_id: design_id, active_index: active_index
    }
  }

  public async setLastActiveProductData(response_products_obj: Record<any, any>) {
    let self: Record<any, any> = this;
    let current_page = response_products_obj.current_page;
    let last_active_prod_data = self.$store.getters.getLastActiveProductData;
    last_active_prod_data.customized = this.$store.getters.getCustomized;
    last_active_prod_data.personalized = this.$store.getters.getPersonalized;
    last_active_prod_data.personalized = this.$store.getters.getPersonalized;
    last_active_prod_data.page_no = current_page;
    /*
    * As handleMainProduct is being used as mixin. So the search_products data attribute may not exists in some components that's why this check is added
    * */
    if(self.search_products !== undefined) {
      last_active_prod_data.search_products = self.search_products;
    }
    self.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", last_active_prod_data);
    return last_active_prod_data;
  }

  public async updateFactoryProduct(factory_product: Record<any, any>) {
    let selected_product = this.$store.getters.getSelectedProduct;
    let selected_product_style_index = selected_product.productstyles.findIndex((x: Record<any, any>) => x.id === factory_product.style_id);
    await this.$store.commit('CHANGE_STYLE_INDEX', selected_product_style_index)

    await this.$store.commit('RESET_CUSTOM_TEXTS')
    await this.$store.commit('RESET_CUSTOM_LOGOS')
    await this.$store.commit('RESET_ALL_COLORS')

    let customLogos = this.$store.getters.getCustomLogoObject
    if(!customLogos[factory_product.product_id]) {
      await this.$store.dispatch('setCustomObj', factory_product.product_id)
    }
    let logos = {
      custom_logos: JSON.stringify(factory_product.custom_logos),
      product_id:factory_product.product_id
    }
    await this.$store.dispatch('OVERRIDE_CUSTOM_LOGOS', logos);
    let texts = {
      text: JSON.stringify(factory_product.custom_texts),
      product_id:factory_product.product_id
    }
    await this.$store.dispatch('OVERRIDE_CUSTOM_TEXT', texts);
    await this.$store.dispatch('overRideDefaultColors', factory_product.defaultcolors);
    await this.$store.dispatch('overRideGroupColors', factory_product.groupcolors);
    selected_product.productstyles[selected_product_style_index].productdesigns.forEach((item: Record<any, any>) => {
      if (item.id == factory_product.design_id) {
        Vue.set(item, 'design_show', 1)
        this.$store.dispatch('setSelectedProductDesignID', item.id)
      } else {
        Vue.set(item, 'design_show', 0)
      }
    });
    //set logo colors
    let logo_colors = []
    if(!factory_product.colors && factory_product.custom_logos) {
      //fetch from server
      let logos = factory_product.custom_logos
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
      logo_colors = factory_product.colors
    }
    await this.$store.dispatch("SET_LOGO_COLORS", logo_colors);
    await this.$store.dispatch('setProductType', {prd_type: factory_product.product_type, value: true});
  }

  public async fetchLogoColors(id:number) {
    let colors = null
    await http.get(`logos/colors?id=${id}`)
      .then((res) => {
        colors =  res.data.colors
      }).catch((e) => {
        console.log('Unable to fetch logo colors',e.response.data.message)
        //this.showError('Unable to fetch logo colors')
      })
    return colors
  }

  public async setLockerProductData(active_product_detail:Record<any, any>) {
    let self = this;
    let selected_product = self.$store.getters.getSelectedProduct;
    let style_index = selected_product.productstyles.findIndex((x: Record<any, any>) => x.id === active_product_detail.style_id);
    if(style_index < 0 ) {
      style_index = 0
      console.error("Error while getting style of selected product")
    }
    await this.$store.commit('CHANGE_STYLE_INDEX', style_index);
    let customLogos = self.$store.getters.getCustomLogoObject
    if(!customLogos[active_product_detail.product_id]) {
      await this.$store.dispatch('setCustomObj', active_product_detail.product_id)
    }

    await this.$store.commit('RESET_CUSTOM_TEXTS')
    await this.$store.commit('RESET_CUSTOM_LOGOS')
    await this.$store.commit('RESET_ALL_COLORS')

    await this.$store.dispatch('OVERRIDE_CUSTOM_LOGOS', active_product_detail);
    await this.$store.dispatch('OVERRIDE_CUSTOM_TEXT', active_product_detail);
    await this.$store.dispatch('overRideDefaultColors', JSON.parse(active_product_detail.defaultcolors));
    await this.$store.dispatch('overRideGroupColors', JSON.parse(active_product_detail.groupcolors));


    selected_product.productstyles[style_index].productdesigns.forEach((item: Record<any, any>) => {
      if (item.id == active_product_detail.design_id) {
        Vue.set(item, 'design_show', 1)
        this.$store.dispatch('setSelectedProductDesignID', item.id)
      } else {
        Vue.set(item, 'design_show', 0)
      }
    });

    //set logo colors
    let logo_colors = []
    if(!active_product_detail.colors && active_product_detail.custom_logos) {
      //fetch from server
      let logos = JSON.parse(active_product_detail.custom_logos)
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
      logo_colors = JSON.parse(active_product_detail.colors)
    }

    this.$store.commit('RESET_UNDO');
    this.$store.commit('RESET_REDO');
    this.$store.commit('SET_HIDE_SAVE_LOCKER_BUTTON', true);
    await this.$store.dispatch("SET_LOGO_COLORS", logo_colors);
    this.$emit('hideLockerRoomModal')
  }

  public async setCartProductData(retrieved_products: Record<any, any>[]) {
    //console.log("setting cart product data")
    let self: Record<any, any> = this;
    await this.$store.commit('RESET_CUSTOM_TEXTS')
    await this.$store.commit('RESET_CUSTOM_LOGOS')
    await this.$store.commit('RESET_ALL_COLORS')
    let cart_item_product = self.$store.getters.getProductEditInfoObject.cart_product_info.cart_item_product;
    //in case of cart edit product there is only one product
    let retrieved_cart_product = retrieved_products[0];
    this.$store.dispatch("getModels", retrieved_cart_product.product_id);
    let selectedIndex = retrieved_cart_product.productstyles.findIndex((productstyle: Record<any, any>) => productstyle.id === cart_item_product.style_id);
    //console.log('style indx', selectedIndex, cart_item_product.style_id, retrieved_cart_product.productstyles)
    if(selectedIndex < 0) {
      console.log("Style not found while editing cart product")
    }
    await this.$store.commit('CHANGE_STYLE_INDEX', selectedIndex);
    let customLogos = this.$store.getters.getCustomLogoObject
    if (!customLogos[cart_item_product.product_id]) {
      await this.$store.dispatch('setCustomObj', cart_item_product.product_id)
    }
    let logos = {
      custom_logos: JSON.stringify(cart_item_product.custom_logos),
      product_id: cart_item_product.product_id
    }
    let texts = {
      text: JSON.stringify(cart_item_product.custom_texts),
      product_id: cart_item_product.product_id
    }
    await this.$store.dispatch('OVERRIDE_CUSTOM_LOGOS', logos);
    await this.$store.dispatch('OVERRIDE_CUSTOM_TEXT', texts);
    await this.$store.dispatch('overRideDefaultColors', cart_item_product.defaultcolors);
    await this.$store.dispatch('overRideGroupColors', cart_item_product.groupcolors);
    retrieved_cart_product.productstyles[selectedIndex].productdesigns.forEach((item: Record<any, any>) => {
      if (item.id == cart_item_product.design_id) {
        Vue.set(item, 'design_show', 1)
        this.$store.dispatch('setSelectedProductDesignID', item.id)
      } else {
        Vue.set(item, 'design_show', 0)
      }
    });
    //set logo colors
    let logo_colors = []
    if (!cart_item_product.colors && cart_item_product.custom_logos) {
      //fetch from server
      let logos = cart_item_product.custom_logos
      if (logos.length > 0) {
        let color_str: any = await this.fetchLogoColors(logos[0].id);
        let image_colors = processColorsCustom(JSON.parse(color_str))
        let image_color_count = image_colors.length;
        while (image_color_count < 4) {
          image_colors.push({ hex: null, pantone: null, name: null });
          ++image_color_count;
        }
        logo_colors = image_colors
      }
    }
    else {
      logo_colors = cart_item_product.colors
    }
    await this.$store.dispatch("SET_LOGO_COLORS", logo_colors);
  }
}

@Component
export class ProductsQueryParamsMixin extends Vue {

  public async setQueryParams() {
    let self: Record<any, any> = this;
    let {sync_id, customizer_preview, update_cart} = self.$route.query
    let query_params: string[] = [];
    if(sync_id) {
     // console.log('inside sync id')
      query_params.push(`sync_id=${sync_id}`, 'paginate=false')
      if(update_cart) {
        query_params.push(`active_product_type=cart_product`, 'paginate=false')
      }
    }
    else {
      if (self.$route.params.name) {
        let shared_url = self.$route.path
        if (shared_url.charAt(0) === '/'){
          shared_url = shared_url.substring(1)
        }
        query_params = [
          `shared_url=${shared_url}`, "active_product_type=share_product", 'paginate=false'
        ];
      }
      else {
        //if route have update_order_product query parameter then it means the order edit product changed so we need to exit from existing edit mode and re set order edit mode
        if(self.$route.query.update_order_product) {
          self.exitFromEditMode()
        }
        //if self.getProductEditInfoObject.order_product_info is null then it means user came for order detail page and we need to set the edit order data
        if(self.$route.query.update_order_product && self.getProductEditInfoObject.order_product_info == null) {
          self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", {
            editing: true, type: "order_product", filters: null, locker_product_info: null, cart_product_info: null, order_product_info: {
              order_item_id:  self.$route.query.order_item_id, activity_id: self.$route.query.activity_id
            }
          })
        }
        if(self.getProductEditInfoObject.editing) {
          console.log("inside editing", self.getProductEditInfoObject.editing)
          if(self.getProductEditInfoObject.type == "locker_product") {
            console.log("inside editing locker_product")
            query_params = [
              `customized=${self.getProductEditInfoObject.filters.customized}`, `personalized=${self.getProductEditInfoObject.filters.personalized}`,
              `title=${self.getProductEditInfoObject.filters.search_products}`, `active_product_id=${self.getProductEditInfoObject.locker_product_info.product_id}`,
              `active_product_child_id=${self.getProductEditInfoObject.locker_product_info.locker_product_id}`,
              `active_product_type=${self.getProductEditInfoObject.type}`,  'paginate=false'
            ];
          }
          else if(self.getProductEditInfoObject.type == "cart_product") {
            console.log("inside editing cart_product")
            query_params = [
              `customized=${self.getProductEditInfoObject.filters.customized}`, `personalized=${self.getProductEditInfoObject.filters.personalized}`,
              `active_product_id=${self.getProductEditInfoObject.cart_product_info.cart_item_product.product_id}`,
              `active_product_type=${self.getProductEditInfoObject.type}`,  'paginate=false'
            ];
          }
          else if(self.getProductEditInfoObject.type == "order_product") {
            console.log("inside editing order_product")
            let order_product_info = self.getProductEditInfoObject.order_product_info
            query_params = [
              `customized=${true}`, `personalized=${true}`, `order_item_id=${self.$route.query.order_item_id}`,  'paginate=false'
            ];
            if(order_product_info.order_products) {
              let active_index = order_product_info.order_products.active_index
              let product_id = order_product_info.order_products.factory_products[active_index].product_id;
              query_params.push(`update_order_product_id=${product_id}`);
            } else {
              query_params.push(`activity_id=${self.$route.query.activity_id}`, 'active_product_type=order_product')
            }
            if(self.$route.query.activity_id) {
              let route_query_params = Object.assign({}, self.$route.query);
              delete route_query_params.update_order_product;
              delete route_query_params.activity_id;
              self.$router.replace({ route_query_params });
            }
          }
        }
        else {
          console.log("Getting query params from last active product", self.getLastActiveProductData)
          query_params = [
            `customized=${self.getLastActiveProductData.customized}`, `personalized=${self.getLastActiveProductData.personalized}`
          ];
          if(self.getLastActiveProductData.product_id) {
            query_params.push(`active_product_id=${self.getLastActiveProductData.product_id}`, 'paginate=false')
          }

          if(self.getLastActiveProductData.search_products) {
            query_params.push(`title=${self.getLastActiveProductData.search_products}`)
          }

          if(self.getLastActiveProductData.category_id) {
            query_params.push(`category_id=${self.getLastActiveProductData.category_id}`)
          } else {
            const categories = this.$store.getters.getCategories;
            if(categories.length > 0) {
              let category = categories[0]
              query_params.push(`category_id=${category.id}`)
              self.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", {category_index: 0, category_id: category.id})
            }
          }
        }
      }
    }
    await this.$store.dispatch('setProductType', { prd_type: "customized", value: self.getLastActiveProductData.customized });
    await this.$store.dispatch('setProductType', { prd_type: "personalized", value: self.getLastActiveProductData.personalized });
    return query_params
  }
}

@Component
export class exitEditMode extends Vue {
  get getProductEditInfoObject() {
    return this.$store.getters.getProductEditInfoObject;
  }
  public async exitFromEditMode() {
    this.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", { editing: false, type: null, filters: null, locker_product_info: null, cart_product_info: null, order_product_info: null
    })
  }
}
@Component
export class resetLastActiveProductData extends Vue {
  public async resetLastActiveProductData() {
    this.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", {
      category_index: 0, category_id: null, design_index: 0, design_id: null, product_index: 0, product_id: null, search_products: null, style_index: 0, style_id: null,
      page_no: 1, customized: true, personalized: false, custom_texts: [], custom_logos: [], default_colors: [], group_colors: [], logo_colors: [],
      roster_detail: [],
    })
  }
}


