/* eslint-disable */
import {Component, Mixins, Vue} from 'vue-property-decorator'
import {findIndex} from 'lodash';

import {
  getActiveProductData,
  getRandom,
  handleResponseException,
  processColorsCustom,
  setRetrievedProductsCustomTexts,
  resetLastActiveProductData,
  lastActiveProductDefaultObject,
  initCustomLogosNew,
  exitFromEditMode,
  getUrlParameter,
  getReOrderInfoObject,
  checkIsEmpty,
  getEditModeDefaultObj,
  getDefaultColorsObject, logoColorInfoDefaultObject
} from '@/helpers/Helpers'
import {http} from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";
import ModalAction from "@/mixins/ModalAction";
import {FetchCategories, HideUpdateLockerButton} from '@/mixins/SelectedProductMixin'

@Component
export class LockerProducts extends Mixins(FetchCategories, ModalAction) {
  get mainTotalTabs(){
    return this.$store.getters.getMainTotalTabs;
  }

  public async editProduct(room_id: number, room_product: Record<any, any>, ind: number, share_url="", editRoster=false, backTo={}) {
    let self: Record<any, any> = this;
    self.search_products = ''
    const response:Boolean = await self.editModeConfirmation();
    this.$store.commit('setActiveLockerProduct', ind);
    // await this.$store.dispatch('setProductType', {prd_type: room_product.product_type, value: true});
    let room_product_id = room_product.id;
    let product_id = room_product.product_id;
    const categories_promise = this.fetchCategories(null, product_id);
    categories_promise.then((response) => {
      if(response){
        let selected_category = this.$store.getters.getSelectedCategory;
        let is_private:Boolean =  this.$store.getters.getPrivateProduct
        let is_customized = this.$store.getters.getCustomized
        let is_personalized = this.$store.getters.getPersonalized
        let locker_product_name = room_product.product_name

        self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", {
          editing: true, type: "locker_product", filters: { customized: is_customized, personalized: is_personalized, search_products: '', private_product: is_private },
          locker_product_info: { product_id: product_id, locker_product_id: room_product_id, style_id: room_product.style_id, design_id: room_product.design_id, locker_product_name },
          cart_product_info: null, order_product_info: null
        })

        let url = `list/products?customized=${is_customized}&personalized=${is_personalized}&private=${is_private}`;
          url += `&active_product_id=${product_id}&category_id=${selected_category.category_id}&locker_product_id=${room_product_id}&active_product_type=locker_product`
          url += `&style_id=${room_product.style_id}&design_id=${room_product.design_id}`;
        if(share_url) {
          url += `?share_url=${share_url}`;
        }

        http.get(url).then(async (response: Record<any, any>) => {
          let active_product_detail = response.data.editing_product_detail;
          //todo need to confirm this logic. I think it's have no effect
          if(active_product_detail.product_roster_detail) {
            self.$store.dispatch('setProductsRosters', {product_id: active_product_detail.product_id, roster_data: active_product_detail.product_roster_detail })
          } else {
            this.$store.dispatch("setProductsRosters");
          }
          this.$root.$emit('rostershared', '')
          //todo ends her

          await self.handleMainProducts(response, active_product_detail);
          this.$emit('hideLockerRoomModal')
          if(editRoster){
            let total_tabs = (this.mainTotalTabs > 0)?this.mainTotalTabs: 3;
            setTimeout(async () => {
              await this.$store.dispatch('setTabMain', {value: (total_tabs + 1)})
              this.showVModal('rostermodal');
              await this.$store.dispatch('setEditRosterFromLocker', true)
              if('target' in backTo){
                await this.$store.dispatch('setBackFromRoster', backTo)
              }else{
                await this.$store.dispatch('setBackFromRoster', {})
              }
            },500)
          }else {
            await this.$store.dispatch('setEditRosterFromLocker', false);
          }
        }, (error:Record<any, any>) => {
          console.error("Error while retrieving products",error)
        })
      }
    });
  }

  get getLockerProducts() {
    let main_product_id = this.$store.getters.getEditProductId;
    let locker_products:Record<any, any> = this.$store.getters.getLockerProducts;
    let locker_products_count = locker_products.length
    locker_products = locker_products.map((item: Record<any, any>, lpIdx: number) => {
      //locker_pull_groups contains the locker group names where products can be moved. This array is make sure user can not drop product to same locker.
      let locker_pull_groups:Record<any, any> = [];
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
      })
    return colors
  }
}

@Component
export class handleMainProducts extends Mixins(FetchCategories,HideUpdateLockerButton) {
  get styleIndex():number {
    return this.$store.getters.getCurrentStyleIndex;
  }

  get getLastActiveProductData() {
    return this.$store.getters.getLastActiveProductData
  }

  public async handleMainProducts(response: Record<any, any>){
    let self: Record<any, any> = this;
    let product_edit_info_object = self.$store.getters.getProductEditInfoObject
    let response_data: Record<any, any> = response.data;
    let {
      active_product_id, active_product_index, active_style_id, active_style_index, active_design_id, active_design_index,
      active_product_detail, products: response_products_obj, products: { data: retrieved_products },
      products: {next_page_url: next_page_url}, products: {current_page: current_page},
    } = response_data;
    let active_product: Record<any, any> = retrieved_products[active_product_index]
    let append_products: boolean =  response_products_obj.current_page > 1;
    this.$store.commit("SET_PRODUCTS_NEXT_PAGE_NO", next_page_url ? current_page + 1 : null)

    const prms = new Promise((resolve) => {
      self.$eventBus.$emit('initProductsFonts', retrieved_products, resolve)
    })
    return prms.then(async () => {
      return new Promise<any>(async (resolve) => {
        if(append_products) {
          await this.$store.commit('SET_PRODUCTS', {products: retrieved_products, append_products: true});
          this.$store.commit('SET_APPLICATION_MOUNTED')
          return false;
        }

        this.$store.commit('CHANGE_STYLE_INDEX', active_style_index);
        await this.$store.dispatch("getSkuInformation", active_product_id);
        await this.$store.dispatch('setSelectedIndex', {selectedIndex: active_product_index, selected_id: active_product_id});
        this.$store.commit('SET_PRODUCTS', {products: retrieved_products});
        let last_active_prod_data = self.$store.getters.getLastActiveProductData;
        if(active_product_detail) {
          const { factory_product_active_index, factory_products } = active_product_detail
          let active_factory_product = factory_products[factory_product_active_index]

          let customLogos = self.$store.getters.getCustomLogoObject
          if(!customLogos[active_product_id]) {
            await this.$store.dispatch('setCustomObj', active_product_id)
          }

          this.$store.commit('RESET_CUSTOM_TEXTS')
          this.$store.commit('RESET_CUSTOM_LOGOS')
          this.$store.commit('RESET_ALL_COLORS')

          if(product_edit_info_object.type == "order_product") {
            let order_products = Object.assign({}, product_edit_info_object.order_product_info, { order_products: active_product_detail })
            let order_product_info_data = getEditModeDefaultObj('order_product_info')
            order_product_info_data.activity_items = active_product_detail.activity_items
            order_product_info_data.factory_id = active_product_detail.factory_id
            order_product_info_data.factory_products = active_product_detail.factory_products
            order_product_info_data.active_product_id = active_product_id
            order_product_info_data.item_id = active_product_detail.id
            order_product_info_data.activity_id = active_product_detail.activity_id
            order_product_info_data.style_id = active_style_id
            order_product_info_data.design_id = active_design_id
            order_product_info_data.factory_product_active_index = active_product_detail.factory_product_active_index
            self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", { order_product_info: order_product_info_data })
          }
          let product_custom_texts: Record<any, any>[] = active_factory_product.product_custom_texts.length > 0 ? active_factory_product.product_custom_texts : active_product.product_custom_texts
          let {custom_logos, defaultcolors:default_colors, groupcolors:group_colors, product_roster_detail } = active_factory_product
          let customizer_data: Record<any, any> = {
            active_product_id: active_product_id, custom_logos:custom_logos, product_custom_texts:product_custom_texts,
            default_colors:default_colors, group_colors:group_colors, product_roster_detail: product_roster_detail
          }
          await this.setCustomizerData(customizer_data)
          this.$store.commit('RESET_UNDO');
          this.$store.commit('RESET_REDO');
        }
        else {
          if(last_active_prod_data.product_id) {
            ({
              product_id: active_product_id, product_index: active_product_index, style_id: active_style_id, style_index: active_style_index,
              design_id: active_design_id, design_index: active_design_index
            } = last_active_prod_data)

            if(last_active_prod_data.custom_logos.length > 0) {
              this.$store.commit('SET_CUSTOM_LOGOS', {
                product_id: last_active_prod_data.product_id, custom_logos: last_active_prod_data.custom_logos
              })
              let logo_colors = last_active_prod_data.custom_logos[0].logo_colors
              if(logo_colors && logo_colors.length > 0) {
                logo_colors = processColorsCustom(logo_colors)
              }
              if(logo_colors && logo_colors.length > 0) {
                this.$store.commit('SET_LOGO_COLORS_INFO', {data: {...logoColorInfoDefaultObject(), ...{extracted_colors: logo_colors, colors: logo_colors}}})
              }
            }
            let product_roster_detail =  last_active_prod_data.product_roster_detail
            this.setCustomizerData({product_id: active_product_id, group_colors: last_active_prod_data.group_colors, product_roster_detail: product_roster_detail})
          }
          else {
            //todo need to update category
            let category_index = 0
            let category_id = null
            if(last_active_prod_data.category_id) {
              category_index = last_active_prod_data.category_index
              category_id = last_active_prod_data.category_id
            }
            let last_active_obj_updated_values = {
              category_index: category_index, category_id: category_id, product_index: active_product_index, product_id: active_product_id,
              style_id: active_style_id, style_index: active_style_index, design_index: active_design_index, design_id: active_design_id,
              search_products: self.search_products, customized: this.$store.getters.getCustomized,
              personalized: this.$store.getters.getPersonalized, private_product:this.$store.getters.getPrivateProduct,
              products_rosters: this.$store.getters.getProductRosters('all')
            }
            let set_last_active_product_data = lastActiveProductDefaultObject(last_active_obj_updated_values)
            self.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", set_last_active_product_data);
            this.$store.dispatch("setProductsRosters");
          }
          setRetrievedProductsCustomTexts(retrieved_products)
          await initCustomLogosNew(retrieved_products)

          this.$store.dispatch('setColorSectionVisibility')
        }
        self.$root.$emit('sliderEvent', active_product_index);
        active_product.productstyles[active_style_index].productdesigns.forEach((item: Record<any, any>) => {
          if (item.id == active_design_id) {
            Vue.set(item, 'design_show', 1)
            this.$store.dispatch('setSelectedProductDesignID', item.id)
          } else {
            Vue.set(item, 'design_show', 0)
          }
        })
        if(active_product.factory_id) {
          const factory_setting = this.$store.getters.getFactorySettings(active_product.factory_id);
          this.$store.commit('SET_SETTING', factory_setting)
        }
        this.$store.commit('SET_APPLICATION_MOUNTED')
        resolve(response_data)
      })
    })
  }

  public async setCustomizerData(customizer_data) {
    let self: Record<any, any> = this;
    let {active_product_id, custom_logos, product_custom_texts, default_colors, group_colors, product_roster_detail} = customizer_data
    if(custom_logos && custom_logos.length > 0) {
      await this.$store.dispatch('OVERRIDE_CUSTOM_LOGOS', {product_id: active_product_id, custom_logos: custom_logos});
      this.setProductTeamLogoColors(custom_logos)
    }
    if(product_custom_texts && product_custom_texts.length > 0) {
      this.$store.commit('SET_PRODUCT_CUSTOM_TEXTS', {index_type: 'product', value: product_custom_texts});
      product_custom_texts.forEach((custom_text: Record<any, any>, customTextIndex: number) => {
        self.$eventBus.$emit("customTextUpdated", {
          emitter: "input", custom_text_index:customTextIndex, custom_text_item_index: null, value: custom_text
        });
      })
    }
    let emit_color_change_event = false;
    if(default_colors && default_colors.length > 0) {
      emit_color_change_event = true
      await this.$store.dispatch('overRideDefaultColors', default_colors);
      this.$store.commit('SET_LOGO_COLORS_INFO', {
        data: {using_logo_colors: false,  is_shuffled: false,  colors: default_colors }
      })
    }
   if(group_colors && !checkIsEmpty(group_colors)) {
     emit_color_change_event = true
     await this.$store.dispatch('overRideGroupColors', group_colors);
   }
   if(emit_color_change_event) {
     self.$eventBus.$emit("changeColors")
   }
   if(active_product_id) {
     if( product_roster_detail && product_roster_detail.length > 0) {
       this.$store.dispatch("setProductsRosters", {product_id: active_product_id, roster_data: product_roster_detail});
     }
   }
  }

  public handleCollectionProducts(response: Record<any, any>, product_id: number, room_product_id: number, style_id:number, design_id: number){
    let self: Record<any, any> = this;
    let response_data = response.data;
    let response_products_obj = response_data.products;
    let retrieved_products = response_products_obj.data;
    let active_product_detail = response.data.editing_product_detail;

    return new Promise((resolve, reject) => {
      const prms = new Promise((resolve) => {
        self.$eventBus.$emit('initProductsFonts', retrieved_products, resolve)
      })

      prms.then(async () => {
        await this.$store.dispatch('setStockCount',response.data.stock_count);
        await this.$store.dispatch('setProductType', {prd_type: 'customized', value: response.data.customized});
        await this.$store.dispatch('setProductType', {prd_type: 'personalized', value: response.data.personalized});
        await this.$store.dispatch('setPrivateProduct', response.data.private_product);

        let product_index = 0;
        let style_index = 0;

        let editing_product_detail = response_data.editing_product_detail
        /*
        * The default value for edit_product_index is -1. -1 Means product is not being edited. product_edit_info_object.editing check is added as the edit_product_index
        * will have value only when it's being edited.
        * */
        product_index = 0
        if(product_index >= 0) {
          style_index = findIndex(retrieved_products[product_index].productstyles, (product_style: Record<any, any>) => {
            return product_style.id == style_id;
          });
        }
        await this.$store.dispatch('setSelectedIndex', { selectedIndex: product_index,  selected_id: retrieved_products[product_index].id });
        await this.$store.commit('SET_PRODUCTS', { products: retrieved_products });
        await setRetrievedProductsCustomTexts(retrieved_products)
        this.$store.commit('CHANGE_STYLE_INDEX', style_index);
        this.$store.commit('CHANGE_STYLE_INDEX', style_index);
        await this.$store.dispatch("getSkuInformation", retrieved_products[product_index].id);
        this.$root.$emit('sliderEvent', product_index);
        //If we are editing locker product then set the locker product data and return

        await self.setLockerProductData(editing_product_detail)
        let selected_product = this.$store.getters.getSelectedProduct;
        await initCustomLogosNew(retrieved_products)
        this.$store.dispatch('setProductsRosters', {product_id: active_product_detail.product_id, roster_data: active_product_detail.product_roster_detail })
        let customLogos = this.$store.getters.getCustomLogoObject
        for (const product of retrieved_products) {
          if (!customLogos[product.id]) {
            await this.$store.dispatch('setCustomObj', product.id)
          }
        }
        this.$store.dispatch('setColorSectionVisibility')
        this.$store.dispatch("getSkuInformation", selected_product.product_id);
        this.$store.commit('CHANGE_STYLE_INDEX', style_index);
        selected_product.productstyles[style_index].productdesigns.forEach((item: Record<any, any>) => {
          if (item.id == design_id) {
            Vue.set(item, 'design_show', 1)
            this.$store.dispatch('setSelectedProductDesignID', item.id)
          } else {
            Vue.set(item, 'design_show', 0)
          }
        });

        self.show_roster = true;
        await self.setProductSizes();
        await self.show();
        resolve(true);
      })
    })
  }
  public async beforeSetDataValidateActiveProductData(response_data: Record<any, any>) {
    let self: Record<any, any> = this;
    let retrieved_products: Record<any, any>[] = response_data.products.data
    let product_edit_info_object = self.$store.getters.getProductEditInfoObject;
    let active_product_id = response_data.active_product_id;
    let edit_type = product_edit_info_object.type;
    let validated = false;
    let message: string = ''
    if(product_edit_info_object.editing) {
      let { active_product_detail } = response_data
      let active_factory_product = active_product_detail.factory_products[active_product_detail.factory_product_active_index]

      switch (edit_type) {
        case "locker_product":
         /* product_index = findIndex(retrieved_products, (retrieved_product: Record<any, any>) => {
            return retrieved_product.id == product_edit_info_object.locker_product_info.product_id
          });*/
          if(product_edit_info_object.locker_product_info.product_id == active_product_id) {
            validated = true
          } else {
            validated = false
            message = "Can not find locker product to edit. So exiting edit mode"
            //if product not found then exit from edit mode
            self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", {
              editing: false, type: null, filters: null, locker_product_info: null, cart_product_info: null, order_product_info: null
            })
          }
          break;
        case "cart_product": //in case of editing cart product only one product shown
          let cart_data = JSON.parse(JSON.stringify(product_edit_info_object))
          cart_data.cart_product_info.cart_item_product = active_factory_product
          this.$store.commit('SET_PRODUCT_EDIT_INFO_OBJECT', cart_data)
          if(active_product_id == cart_data.cart_product_info.cart_item_product.product_id) {
            validated = true;
          } else {
            validated = false;
            message = "Can not find cart product to edit. So exiting edit mode"
            self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", {
              editing: false, type: null, filters: null, locker_product_info: null, cart_product_info: null, order_product_info: null
            })
          }
          break;
          //todo need to look in to it
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
          case "reorder_product": //in case of editing order product only one product shown
          //on First time load we do not have product id that's why this check is added
          if(product_edit_info_object.reorder_product_info && product_edit_info_object.cart_product_info.active_product_id) {
            if(retrieved_products[0].id == product_edit_info_object.cart_product_info.active_product_id) {
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
        /*product_index = findIndex(retrieved_products, (retrieved_product: Record<any, any>) => {
          return retrieved_product.id == last_active_product_data.product_id
        });*/
        if(last_active_product_data.product_id == active_product_id ) {
          validated = true
        } else {
          validated = false
          message = "Did not find last active product data"
          //if last active product not found then reset the last active product data object
          await resetLastActiveProductData()
        }
      } else {
        validated = true
      }

    }
    return {
      validated: validated, message: message
    }
  }
  public async handleEditMode(response_data: Record<any, any>) {
    let self = this;
    let retrieved_products: Record<any, any>[] = response_data.products.data
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
          product_index = findIndex(retrieved_products, (retrieved_product: Record<any, any>) => {
            return retrieved_product.id === product_edit_info_object.locker_product_info.product_id
          });
          style_index = findIndex(retrieved_products[product_index].productstyles, (product_style: Record<any, any>) => {
            return product_style.id === product_edit_info_object.locker_product_info.style_id;
          });
          if(style_index < 0){
            style_index = 0
          }
        }
        design_id = product_edit_info_object.locker_product_info.design_id;
        break;
      case "cart_product": //in case of editing cart product only one product shown. So product index will always be 0
        style_index = findIndex(retrieved_products[0].productstyles, (product_style: Record<any, any>) => {
          return product_style.id === product_edit_info_object.cart_product_info.cart_item_product.style_id;
        });
        if(style_index < 0){
          style_index = 0
        }
        design_id =  product_edit_info_object.cart_product_info.cart_item_product.design_id;
        break;
      case "order_product": //in case of editing order product only one product shown. So product index will always be 0
        active_index = product_edit_info_object.order_product_info.order_products.factory_product_active_index;
        let order_edit_product = product_edit_info_object.order_product_info.order_products.factory_products[active_index]
        let product_roster_detail = order_edit_product.product_roster_detail;
        style_index = findIndex(retrieved_products[0].productstyles, (product_style: Record<any, any>) => {
          return product_style.id === order_edit_product.style_id;
        });
        if(style_index  < 0){
          style_index = 0;
        }

        design_id =  order_edit_product.design_id;
        this.$store.commit('UPDATE_ROSTER',product_roster_detail);
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
    last_active_prod_data.private_product = this.$store.getters.getPrivateProduct;
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

  get products(): [Record<any, any>] {
    return this.$store.getters.getProducts
  }

  public async updateFactoryProduct(factory_product: Record<any, any>) {
    let self: Record<any, any> = this;
    let selected_product = this.$store.getters.getSelectedProduct;
    let selected_product_style_index = selected_product.productstyles.findIndex((x: Record<any, any>) => x.id === factory_product.style_id);

    if(selected_product_style_index < 0){
      selected_product_style_index = 0;
    }
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
    this.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", { value: factory_product.product_custom_texts })
    factory_product.product_custom_texts.forEach((custom_text: Record<any, any>, customTextIndex: number) => {
      self.$eventBus.$emit("customTextUpdated", {
        emitter: "input", custom_text_index:customTextIndex, custom_text_item_index: null, value: custom_text
      });
    })

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
    let logo_colors:Record<any, any> = []
    if(!factory_product.colors && factory_product.custom_logos) {
      //fetch from server
      let logos = factory_product.custom_logos
      if(logos.length > 0) {
        let color_str:any = await this.fetchLogoColors(logos[0].id);
        let image_colors:Record<any, any> = processColorsCustom(JSON.parse(color_str))
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
    let self: Record<any, any> = this;
    let styleIndex = 0;
    let selected_product = self.$store.getters.getSelectedProduct;
    let collection_view = self.$store.getters.getCollectionView;
    styleIndex = selected_product.productstyles.findIndex((product_style)=> {
      return product_style.id === active_product_detail.style_id;
    });
    if(styleIndex <  0){
      styleIndex = 0;
      console.error("Error while getting style of selected product")
    }
    await this.$store.commit('CHANGE_STYLE_INDEX', styleIndex);
    let customLogos = self.$store.getters.getCustomLogoObject
    if(!customLogos[active_product_detail.product_id]) {
      await this.$store.dispatch('setCustomObj', active_product_detail.product_id)
    }

    await this.$store.commit('RESET_CUSTOM_TEXTS')
    await this.$store.commit('RESET_CUSTOM_LOGOS')
    await this.$store.commit('RESET_ALL_COLORS')

    await this.$store.dispatch('OVERRIDE_CUSTOM_LOGOS', active_product_detail);
    if(active_product_detail.text.length == 0) {
      await this.$store.commit('SET_PRODUCT_CUSTOM_TEXTS', {index_type: 'product', value: selected_product.product_texts});
      selected_product.product_texts.forEach((custom_text: Record<any, any>, customTextIndex: number) => {
        self.$eventBus.$emit("customTextUpdated", {
          emitter: "input", custom_text_index:customTextIndex, custom_text_item_index: null, value: custom_text
        });
      })
    }
    else {
      this.$store.commit('SET_PRODUCT_CUSTOM_TEXTS', {index_type: 'product', value: active_product_detail.text});
      active_product_detail.text.forEach((custom_text: Record<any, any>, customTextIndex: number) => {
        self.$eventBus.$emit("customTextUpdated", {
          emitter: "input", custom_text_index:customTextIndex, custom_text_item_index: null, value: custom_text
        });
      })
    }
    let default_colors = JSON.parse(active_product_detail.defaultcolors)
    await this.$store.dispatch('overRideDefaultColors', default_colors);
    this.$store.commit('SET_LOGO_COLORS_INFO', {
      data: {using_logo_colors: false,  is_shuffled: false,  colors: default_colors }
    })
    await this.$store.dispatch('overRideGroupColors', JSON.parse(active_product_detail.groupcolors));
    this.setProductTeamLogoColors(active_product_detail.custom_logos)
    selected_product.productstyles[styleIndex].productdesigns.forEach((item: Record<any, any>) => {
      if (item.id == active_product_detail.design_id) {
        Vue.set(item, 'design_show', 1)
        this.$store.dispatch('setSelectedProductDesignID', item.id)
      } else {
        Vue.set(item, 'design_show', 0)
      }
    });

    this.$store.commit('RESET_UNDO');
    this.$store.commit('RESET_REDO');
    if(!collection_view){
      this.$store.commit('SET_HIDE_SAVE_LOCKER_BUTTON', true);
      this.$emit('hideLockerRoomModal')
    }
  }

  public setProductTeamLogoColors(custom_logos: any) {
    const custom_logos_type = custom_logos.constructor.name
    custom_logos = custom_logos_type == 'String' ? JSON.parse(custom_logos) : custom_logos
    if(custom_logos.length > 0) {
      if(custom_logos[0].logo_colors && custom_logos[0].logo_colors.length > 0) {
        let logo_colors = this.getLogoColors(custom_logos[0].logo_colors)
        this.$store.commit('SET_LOGO_COLORS_INFO', {
          data: { using_logo_colors: false,  is_shuffled: false,  colors: logo_colors,  extracted_colors: logo_colors }
        })
      }
    }
  }

  public getLogoColors(logo_colors) {
    let is_processed_colors = true
    if(logo_colors.length > 0 && logo_colors[0]) {
      /*
      * As processed colors have object with keys hex, name, pantone. If it's not processed then it have [[255, 255, 255], ....]
      * if it's already processed mean have hex, name and pantone then no need to process it. So if it have object
      *  then it's processed otherwise not processed
      * */
      is_processed_colors = logo_colors[0].constructor.name == 'Object'
    }
    if(!is_processed_colors) {
      logo_colors = processColorsCustom(logo_colors)
    }
    return logo_colors
  }

  public async setCartProductData(retrieved_products: Record<any, any>[]) {
    let self: Record<any, any> = this;
    await this.$store.commit('RESET_CUSTOM_TEXTS')
    await this.$store.commit('RESET_CUSTOM_LOGOS')
    await this.$store.commit('RESET_ALL_COLORS')
    let cart_item_product = self.$store.getters.getProductEditInfoObject.cart_product_info.cart_item_product;
    //in case of cart edit product there is only one product
    let retrieved_cart_product = retrieved_products[0];
    this.$store.dispatch("getSkuInformation", retrieved_cart_product.product_id);
    let styleIndex = retrieved_cart_product.productstyles.findIndex((productstyle: Record<any, any>) => productstyle.id === cart_item_product.style_id);
    if(styleIndex < 0) {
      styleIndex = 0;
      console.log("Style not found while editing cart product")
    }
    await this.$store.commit('CHANGE_STYLE_INDEX', styleIndex);
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
    this.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", { value: cart_item_product.product_custom_texts })
    cart_item_product.product_custom_texts.forEach((custom_text: Record<any, any>, customTextIndex: number) => {
      self.$eventBus.$emit("customTextUpdated", {
        emitter: "input", custom_text_index:customTextIndex, custom_text_item_index: null, value: custom_text
      });
    })

    await this.$store.dispatch('overRideDefaultColors', cart_item_product.defaultcolors);
    await this.$store.dispatch('overRideGroupColors', cart_item_product.groupcolors);
    retrieved_cart_product.productstyles[styleIndex].productdesigns.forEach((item: Record<any, any>) => {
      if (item.id == cart_item_product.design_id) {
        Vue.set(item, 'design_show', 1)
        this.$store.dispatch('setSelectedProductDesignID', item.id)
      } else {
        Vue.set(item, 'design_show', 0)
      }
    });
    this.$store.commit('SET_LOGO_COLORS_INFO', {
      data: { using_logo_colors: false,  is_shuffled: false,  colors: cart_item_product.logo_colors,  extracted_colors: cart_item_product.logo_colors }
    })
    this.$store.dispatch('setProductsRosters', {product_id: cart_item_product.product_id, roster_data: cart_item_product.product_roster_detail })
  }

  get choosenProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct;
  }

  public changeStyleIndex(i: number) {
    const currentDesign = this.choosenProduct.productstyles[this.styleIndex].productdesigns.filter((item: Record<any, any>) => {
      return item.design_show
    })
    if(currentDesign.length){
      const design_name = currentDesign[0].design_name
      let designFound = false;
      const newDesign = this.choosenProduct.productstyles[i].productdesigns.forEach((item: Record<any, any>) => {
        if(item.design_name.toLowerCase() == design_name.toLowerCase()) {
          designFound  = true
          Vue.set(item, 'design_show', 1)
          this.$store.dispatch('setSelectedProductDesignID',item.id)
        } else {
          Vue.set(item, 'design_show', 0)
        }
      })
      this.hideLockerProductUpdateButton(true)
      if (!designFound){
        if(!this.choosenProduct.productstyles[i].productdesigns.filter((design: Record<any, any>) => design.design_show).length) {
          this.choosenProduct.productstyles[i].productdesigns.forEach((item:Record<any, any>, index:number) =>{
            if (index ==0 ){
              Vue.set(this.choosenProduct.productstyles[i].productdesigns[0], 'design_show', 1)
              this.$store.dispatch('setSelectedProductDesignID',this.choosenProduct.productstyles[i].productdesigns[0].id)
            }else{
              Vue.set(this.choosenProduct.productstyles[i].productdesigns[index], 'design_show', 0);
            }
          })
        }
      }
    }
    this.$store.commit('CHANGE_STYLE_INDEX', i);
    let design_index = findIndex(this.choosenProduct.productstyles[i].productdesigns, "design_show")
    this.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", {style_index: i, style_id: this.choosenProduct.productstyles[i].id,
      design_index:   design_index, design_id: this.choosenProduct.productstyles[i].productdesigns[design_index].id
    })
  }

}

@Component
export class ProductsQueryParamsMixin extends Vue {
  public async setQueryParams() {
    let self: Record<any, any> = this;
    let query_params: string[] = await this.handleUrlQueryParams();
    const selected_category = this.$store.getters.getSelectedCategory;
    let edit_product_info_obj = this.$store.getters.getProductEditInfoObject
    if(edit_product_info_obj.editing) {
      const active_product_type = edit_product_info_obj.type;
      if(active_product_type == "order_product") {
        let { order_product_info, order_product_info: { factory_product_active_index }, order_product_info: { active_product_id } } = edit_product_info_obj
        query_params.push(`active_product_type=order_product`, `active_product_id=${active_product_id}`,
          `item_id=${order_product_info.item_id}`, `activity_id=${order_product_info.activity_id}`, `style_id=${order_product_info.style_id}`,
          `design_id=${order_product_info.design_id}`, `factory_product_active_index=${factory_product_active_index}`, `paginate=false`)
      } else if(active_product_type == "locker_product") {
        query_params = [
          `customized=${edit_product_info_obj.filters.customized}`, `personalized=${edit_product_info_obj.filters.personalized}`,
          `private=${edit_product_info_obj.filters.private_product ? true : false}`,
          `title=${edit_product_info_obj.filters.search_products}`, `active_product_id=${edit_product_info_obj.locker_product_info.product_id}`,
          `style_id=${edit_product_info_obj.locker_product_info.style_id}`,`design_id=${edit_product_info_obj.locker_product_info.design_id}`,
          `locker_product_id=${edit_product_info_obj.locker_product_info.locker_product_id}`, `active_product_type=${edit_product_info_obj.type}`,
          `category_id=${selected_category.category_id}`, 'paginate=false'
        ];
      } else if(active_product_type == "cart_product") {
        const cart_product_info = edit_product_info_obj.cart_product_info
        const cart_item_factory_product = cart_product_info.cart_item_product

        if(cart_product_info.update_cart) {
          query_params = [
            `item_id=${cart_product_info.update_cart}`, `ecommerce_cart_id=${cart_product_info.update_item}`,
            `sync_id=${cart_product_info.sync_id}`, `active_product_type=${self.getProductEditInfoObject.type}`,
            'paginate=false'
          ];
        } else {
          query_params = [
            `item_id=${cart_product_info.cart_item_id}`,`factory_product_id=${cart_item_factory_product.id}`,
            `active_product_id=${cart_item_factory_product.product_id}`, `style_id=${cart_item_factory_product.style_id}`,
            `design_id=${cart_item_factory_product.design_id}`, `active_product_type=${self.getProductEditInfoObject.type}`,
            'paginate=false'
          ];
        }


      } else if(active_product_type == "reorder_product") {
        let reorder_product_info_obj: Record<any, any> = edit_product_info_obj.reorder_product_info
        query_params = [
          'is_reorder=true', 'active_product_type=reorder_product', `item_id=${reorder_product_info_obj.order_item_id}`,
          `factory_product_id=${reorder_product_info_obj.factory_product_id}`, `active_product_id=${reorder_product_info_obj.active_product_id}`,
          `style_id=${reorder_product_info_obj.style_id}`, `design_id=${reorder_product_info_obj.design_id}`, 'paginate=false',
        ];
      }
    } else {
      let last_active_product_data = self.getLastActiveProductData;
      if(last_active_product_data.product_id) {
        query_params.push(
          `customized=${last_active_product_data.customized}`, `personalized=${last_active_product_data.personalized}`,
          `private=${last_active_product_data.private_product}`, `active_product_id=${last_active_product_data.product_id}`,
          `style_id=${last_active_product_data.style_id}`, `design_id=${last_active_product_data.design_id}`, 'paginate=false'
        )
        if(last_active_product_data.search_products) {
          query_params.push(`title=${last_active_product_data.search_products}`)
        }
      }
      query_params.push(`category_id=${selected_category.category_id}`)
    }
    return query_params
  }

  public async handleUrlQueryParams() {
    let self: Record<any, any> = this
    let url_query_string: null | string = getUrlParameter()
    let query_params: string[] = [];
    const selected_category = this.$store.getters.getSelectedCategory;
    const route_query_object: Record<any, any> = JSON.parse(JSON.stringify(this.$route.query))

    if(route_query_object.is_reorder) {
      let edit_mode_default_obj = getEditModeDefaultObj()
      edit_mode_default_obj.editing = true
      edit_mode_default_obj.type = "reorder_product"
      edit_mode_default_obj.reorder_product_info = {...edit_mode_default_obj.reorder_product_info, ...route_query_object}
      this.$store.commit('SET_PRODUCT_EDIT_INFO_OBJECT', edit_mode_default_obj)

      const currentRoute = { ...this.$route };
      // Remove all query parameters
      currentRoute.query = {};
      // Update the route without any query parameters
      self.$router.push({ path: currentRoute.path, query: currentRoute.query });
    }

    if(route_query_object.sync_id) {
      query_params.push(`sync_id=${route_query_object.sync_id}`)
      if(route_query_object.update_cart) {
        let edit_mode_default_obj = getEditModeDefaultObj()
          query_params.push(`active_product_type=cart_product`, 'paginate=false',
            `item_id=${route_query_object.update_cart}`, `ecommerce_cart_id=${route_query_object.update_item}`)
        edit_mode_default_obj.editing = true
        edit_mode_default_obj.type = "cart_product"
        edit_mode_default_obj.cart_product_info = {...edit_mode_default_obj.cart_product_info, ...route_query_object}
        this.$store.commit('SET_PRODUCT_EDIT_INFO_OBJECT', edit_mode_default_obj)

      } else {
        query_params.push(`category_id=${selected_category.category_id}`)
      }
    }

    if (url_query_string?.includes('share')) {
      query_params.push(`shared_url=${url_query_string}`, "active_product_type=share_product")
      resetLastActiveProductData()
      exitFromEditMode()
    }

    if(route_query_object.active_product_type == "order_product") {
      exitFromEditMode()
      let edit_mode_default_obj = getEditModeDefaultObj()
      edit_mode_default_obj.editing = true
      edit_mode_default_obj.type = "order_product"
      edit_mode_default_obj.order_product_info = {...edit_mode_default_obj.order_product_info, ...route_query_object}
      self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", edit_mode_default_obj)
      // Get the current route
      const currentRoute = { ...this.$route };
      // Remove all query parameters
      currentRoute.query = {};
      // Update the route without any query parameters
      self.$router.push({ path: currentRoute.path, query: currentRoute.query });

    }
    return query_params
  }
}

@Component
export class exitEditMode extends Mixins(ErrorMessages) {
  get getProductEditInfoObject() {
    return this.$store.getters.getProductEditInfoObject;
  }
  public async exitFromEditMode() {
    exitFromEditMode()
  }
  public editModeConfirmation() {
    let self: Record<any, any> = this;
    return new Promise((resolve,reject) => {
      if (self.$store.getters.getProductEditInfoObject.editing) {
        switch (self.$store.getters.getProductEditInfoObject.type) {
          case 'locker_product':
            console.log('inside locker product case', self.$store.getters.getHideSaveLockerButton)
            if (self.$store.getters.getHideSaveLockerButton === false) {
              console.log('show modal')
              self.$santaModal.show({
                icon: 'confirm', title: 'Changes Detected', text: 'Do you want to save the product before exiting', confirm_text: 'Save', cancel_text: 'Cancel',
              },self).then((confirmation) => {
                  if(confirmation){
                    self.$santaModal.hide();
                    self.showToast('Your settings are being saved please wait...', 'info');
                    const prms = new Promise((resolve) => {
                      self.$eventBus.$emit('saveToLockerProduct', resolve)
                    })
                    prms.then(() => {
                      self.showToast('Your settings saved successfully', 'success');
                      self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", { editing: false, type: null, filters: null, locker_product_info: null, cart_product_info: null, order_product_info: null});
                      resolve(true);
                    });
                  }
                  else{
                    self.showToast('Changes Discarded, Exiting from Editing State', 'error');
                    self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", { editing: false, type: null, filters: null, locker_product_info: null, cart_product_info: null, order_product_info: null});
                    resolve(false)
                  }
              });
            }
            else{
              self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", { editing: false, type: null, filters: null, locker_product_info: null, cart_product_info: null, order_product_info: null});
              resolve(false);
            }
            break;
          case 'cart_product':
            self.$santaModal.show({
              icon: 'confirm', title: 'Changes Detected', text: 'Do you want to save the product before exiting', confirm_text: 'Save', cancel_text: 'Cancel',
            },self).then((confirmation) => {
              if(confirmation){
                self.$santaModal.hide();
                self.showToast('Your settings are being saved please wait...', 'info');
                const prms = new Promise((resolve) => {
                  self.$eventBus.$emit('updateCart', resolve)
                })
                prms.then(() => {
                  self.showToast('Your settings saved successfully', 'success');
                  self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", { editing: false, type: null, filters: null, locker_product_info: null, cart_product_info: null, order_product_info: null});
                  resolve(true)
                });
              }
              else{
                self.showToast('Changes Discarded, Exiting from Editing State', 'error');
                self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", { editing: false, type: null, filters: null, locker_product_info: null, cart_product_info: null, order_product_info: null});
                resolve(false)
              }
            });
            break;
          case 'order_product':
            self.$santaModal.show({
              icon: 'confirm', title: 'Changes Detected', text: 'Do you want to save the product before exiting', confirm_text: 'Save', cancel_text: 'Cancel',
            },self).then((confirmation) => {
              if(confirmation){
                self.$santaModal.hide();
                self.showToast('Your settings are being saved please wait...', 'info');
                const prms = new Promise((resolve) => {
                  self.$eventBus.$emit('updateOrder', resolve)
                })
                prms.then(() => {
                  self.showToast('Your settings saved successfully', 'success');
                  self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", { editing: false, type: null, filters: null, locker_product_info: null, cart_product_info: null, order_product_info: null});
                  resolve(true)
                });
              }
              else{
                self.showToast('Changes Discarded, Exiting from Editing State', 'error');
                self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", { editing: false, type: null, filters: null, locker_product_info: null, cart_product_info: null, order_product_info: null});
                resolve(false)
              }
            });
            break;
          default:
            resolve(null);
            break;
        }
      }
      else{
        resolve(null);
      }
      this.$store.commit('RESET_UNDO_REDO_ITEMS')
    });
  }
}

@Component
export class RosterDetailsGlobal extends Mixins(){

  get active_roster_index():number{
    return this.$store.getters.getActiveRosterIndex;
  }

  get customText(): Record<any, any>[] {
    return this.$store.getters.getCustomTexts();
  }
  get productRoster(): Record<any, any>[] {
    return this.$store.getters.getProductRosters()
  }

  get custom_name_index() : number {
    return findIndex(this.customText, { type: 'name' })
  }

  get custom_number_index() : number {
    return findIndex(this.customText, { type: 'number' })
  }

  public handleRosterItemFocus(roster_index: number) {

    let self: Record<any, any> = this;
    this.$store.dispatch('setActiveRosterIndex',roster_index);
    let product_custom_texts = this.$store.getters.selectedProductCustomTexts();
    let active_roster = this.productRoster[roster_index]

    if(this.custom_number_index >= 0) {
      let custom_number_text = product_custom_texts[this.custom_number_index]
      custom_number_text.value = active_roster.number
      self.$eventBus.$emit("customTextUpdated", {
        emitter: "input", custom_text_index:self.custom_number_index, value: custom_number_text
      });
    }

    if(this.custom_name_index >= 0) {
      let custom_name_text = product_custom_texts[this.custom_name_index]
      custom_name_text.value = active_roster.text
      self.$eventBus.$emit("customTextUpdated", {
        emitter: "input", custom_text_index:self.custom_name_index, value: custom_name_text
      });
    }
  }
}

@Component
export class cartModalData extends Mixins(ErrorMessages,handleMainProducts,exitEditMode,ModalAction,ProductsQueryParamsMixin) {
  get total(): number {
    let sum = 0;
    let roster_details = this.$store.getters.getRosterDetails()
    if (roster_details){
      roster_details.forEach((item:Record<any, any>) => {
        sum += parseInt(item.quantity);
      })
    }
    return sum;
  }

  get sku_information(){
    return this.$store.getters.getSkuInformation
  }

  public checkMinimumOrderQtyBYDesign(){
    // check is the sum of roster items(collectively) is greater than sku's 'minimum order quantity'
    if(this.sku_information.minimum_order_quantity_type === "by_design" && this.sku_information.minimum_order_quantity != null &&
      this.sku_information.minimum_order_quantity > 0) {
      let roster_item_sum = 0;
      this.$store.getters.getProductRosters().forEach((item:Record<any, any>) => {
        roster_item_sum += parseInt(item.quantity);
      })
      if(roster_item_sum < this.sku_information.minimum_order_quantity){
        this.showToast(`${this.$t('minimum_order_roster_message', {min_products_count: this.sku_information.minimum_order_quantity})}`, "error");
        return false;
      }
    }
    return true;
  }

  public async addToCartMixin(product_fonts: Record<any, any>[], resolve:any = null) {
    if(!this.checkMinimumOrderQtyBYDesign()) {
      if(resolve){
        resolve(false);
      }
      return;
    }
    this.hideVModal('rostermodal');
    let self: Record<any, any> = this;

      let company = self.$store.getters.getCompany;
      let platform = company.platform;
      if(platform === 'wordpress') {
        const adminToken = localStorage.getItem('adminToken');
          if(adminToken) {
            if(resolve){
              resolve(false);
            }
            return false;
          }
      }

      self.$store.dispatch('addedToCart', false)
      self.$store.dispatch('setCartLoading',true);
      let collection_view = self.$store.getters.getCollectionView;
      let cart_product = await getActiveProductData(product_fonts);
      self.$store.dispatch('setRevertRosterBOOL',true);
      let post_data = {
        factory_product: cart_product
      };
      let url = "carts"
      let cart_edit_mode = false;
      let product_edit_info_object = self.$store.getters.getProductEditInfoObject

      if(product_edit_info_object.editing && product_edit_info_object.type == "cart_product") {
        cart_edit_mode = true;
        (post_data as Record<any,any>).factory_product.id = product_edit_info_object.cart_product_info.cart_item_product.id
        url = `carts/cart-items/${product_edit_info_object.cart_product_info.cart_item_id}/update`
      }

      let santacart = true;
      let company_domain = company.company_domain;

      let ecommerce_cart_id: string|null = null;


      let ecom_url  = '';
      let total_quantity = 0;


      if (platform === 'wordpress' || platform === 'shopify') {
        if ((cart_product as Record<any, any>).sync_id === '' || (cart_product as Record<any, any>).ecommerce_post_id === '') {
          self.showToast('This product cannot be added into the cart','Error');
          if(resolve){
            resolve(false);
          }
          return false;
        }
        let roster_detail = await this.$store.getters.getProductRosters()
        for(let i=0; i < roster_detail.length;  i++) {
          let roster = roster_detail[i];
          total_quantity += parseInt(roster.quantity);
        }
      }

      if(platform === 'wordpress'){
        ecom_url = company_domain + '/wp-admin/admin-ajax.php';
        let ecom_form_data = new FormData();

        let ecommerce_update_id = (product_edit_info_object.cart_product_info)?product_edit_info_object.cart_product_info.ecommerce_cart_id:null;
        if(ecommerce_update_id){
          ecom_form_data.append('action', 'custimoo_update_cart');
          ecom_form_data.append('update_item', ecommerce_update_id);
        }else{
          ecom_form_data.append('action', 'custimoo_add_to_cart');
          ecom_form_data.append('product_name', (cart_product as Record<any, any>).product_name);
        }

        ecom_form_data.append('product_id', (cart_product as Record<any, any>).ecommerce_post_id);
        ecom_form_data.append('quantity', total_quantity.toString());
        ecom_form_data.append('product_front_image', (cart_product as Record<any, any>).front_image);

        await http.post(ecom_url, ecom_form_data).then((res: any) => {
          if(!res.data.status){
            santacart = false
            self.showToast(res.data.message, 'ERROR');
          }else{
            ecommerce_cart_id = res.data.ecommerce_cart_id;
          }
        }).catch(err => {
          santacart = false
          self.$store.dispatch('setCartLoading',false);
          self.showErrorArr(err.response.data.errors)
        });

        (post_data as Record<any,any>).factory_product.ecommerce_cart_id = ecommerce_cart_id;
      }


      if(santacart){
        self.$store.dispatch('setCartLoading',true);
        await http.post(url, post_data).then(async (res: any) => {
          if (res.data.success == true){
            let product_edit_info_obj = self.$store.getters.getProductEditInfoObject;
            let api_res:Record<any, any> = res.data.result
            self.$store.dispatch('addToCart',api_res.items)
            // self.$store.dispatch('setEditCart', {key:'cartId',value:0});
            // self.$store.dispatch('setEditCart', {key:'cartItemId',value:''});
            await self.exitFromEditMode()
            self.showToast(res.data.message, 'success');
            self.$store.dispatch('addedToCart', true)
            if(platform === 'wordpress'){
              let update_cart_id_data = new FormData();
              update_cart_id_data.append('santa_cart_id', api_res.new_created_id);
              update_cart_id_data.append('woocom_cart_id', ecommerce_cart_id as string);
              update_cart_id_data.append('action', 'add_custimoo_cart_id');
              if(cart_edit_mode) {
                await self.exitFromEditMode()
              }
              http.post(ecom_url, update_cart_id_data).then((res: any) => {
                self.$store.dispatch('setCartLoading',false);
                if(!collection_view) {
                  window.location.replace(company_domain + '/cart');
                }
              }).catch(err => {
                self.$store.dispatch('setCartLoading',false);
                self.showErrorArr(err.response.data.errors)
              });

            }
            else if(platform === 'shopify'){
              let shopify_cart_data:Record<any, any> = {};
              let x_rand = Math.floor((Math.random() * 100) + 1);
              let ecommerce_update_id = (product_edit_info_object.cart_product_info)?product_edit_info_object.cart_product_info.ecommerce_cart_id:null;
              if(ecommerce_update_id){
               // ecom_url = company_domain + '/cart/change.js'
                ecom_url = company_domain + '/cart/change?token='+x_rand
                shopify_cart_data['line'] = product_edit_info_object.cart_product_info.shopify_line_item;
              }else{
                //ecom_url = company_domain + '/cart/add.js'
                ecom_url = company_domain + '/cart/add?token='+x_rand
                shopify_cart_data['id'] = (cart_product as Record<any, any>).ecommerce_variant_id;
               }

              shopify_cart_data['quantity'] = total_quantity;
              let delete_cart_item_url = `${process.env.VUE_APP_API_BASE_URL}/api/carts/cart-items/${api_res.new_created_id}/factory_product/${api_res.cart_item_key}`;
              shopify_cart_data['properties'] = {  // items with underscore are private properties of shopify cart object
                '_custimoo_cart_id': api_res.new_created_id,
                '_custimoo_cart_item_key': api_res.cart_item_key,
                '_custimoo_front_image': api_res.front_image_url,
                '_custimoo_back_image': api_res.back_image_url,
                '_custimoo_cart_url': `${company_domain}/${company.customizer_page_url}/#/?sync_id=${(cart_product as Record<any, any>).sync_id}&update_item=${api_res.cart_item_key}&update_cart=${api_res.new_created_id}`,
                '_custimoo_delete_cart_url': delete_cart_item_url,
                '_custimoo_product_name': (cart_product as Record<any, any>).product_name,
                '_custimoo_product_id': (cart_product as Record<any, any>).product_id,
                '_custimoo_minimum_order_quantity': 0,
                'DESIGN NAME': (cart_product as Record<any, any>).product_name,
                'YOUR DESIGN': 'Below are the links of your customized designs.',
                'FRONT IMAGE': api_res.front_image_short,
                'BACK IMAGE': api_res.back_image_short
               };

               if((cart_product as Record<any, any>).minimum_order_quantity_type == 'by_cart' && (cart_product as Record<any, any>).minimum_order_quantity > 0 ) {
                 shopify_cart_data['properties']['_custimoo_minimum_order_quantity'] = (cart_product as Record<any, any>).minimum_order_quantity;
               }

              // console.log(shopify_cart_data);
              self.$store.dispatch('setCartLoading',true);
              http.post(ecom_url, shopify_cart_data).then((res: any) => {
               self.$store.dispatch('setCartLoading',false);
                if(!collection_view) {
                  window.location.replace(company_domain + '/cart');
                }
              }).catch(err => {
                http.delete(delete_cart_item_url);
                santacart = false
                self.showToast(err, 'ERROR');
                self.$store.dispatch('setCartLoading',false);
              })

            }
            else {
              if(cart_edit_mode) {
                await self.exitFromEditMode()
                const categories_promise = this.fetchCategories();
                categories_promise.then(async (response) => {
                  if(response){
                    let query_params = await self.setQueryParams()
                    self.retrieveProducts(query_params);
                  }
                })

              }
              self.$store.dispatch('setCartLoading',false);
            }

          }
          else
          {
            if(res.data.status_code === 422){
              self.showErrorValidation(res.data.errors);
            }
            if(cart_edit_mode) {
              await self.exitFromEditMode()
              const categories_promise = this.fetchCategories();
              categories_promise.then(async (response) => {
                if(response){
                  let query_params = await self.setQueryParams()
                  self.retrieveProducts(query_params);
                };
              })
            }

            self.$store.dispatch('setCartLoading',false);
          }

          self.showToast(res.data.message, res.data.success ? "SUCCESS" : "ERROR")
          self.$store.dispatch('setCartLoading',false);
          if(resolve){
            resolve(true);
          }

          if(collection_view){
            self.$root.$emit('getNextProduct');
          }
        }).catch(async errorResponse => {
          self.$store.dispatch('setCartLoading',false);
          handleResponseException(errorResponse)
          if(cart_edit_mode) {
            await self.exitFromEditMode()
            const categories_promise = this.fetchCategories();
            categories_promise.then(async (response) => {
              let query_params = await self.setQueryParams()
              self.retrieveProducts(query_params);
              self.hideVModal('rostermodal');
            });
            if(resolve){
              resolve(false);
            }
          }
        })
      }

  }

  public async retrieveProducts() {
    let self = this;
    let get_last_active_product_data = self.$store.getters.getLastActiveProductData;
    let update_order_item_products = self.$store.getters.getUpdateOrderItemProducts;

    let url = `/list/products?customized=${get_last_active_product_data.customized}&personalized=${get_last_active_product_data.personalized}&private=${get_last_active_product_data.private_product}`;
    if(get_last_active_product_data.search_products) {
      url +=` &title=${get_last_active_product_data.search_products}`
    }
    http.get(url).then(async (response: Record<any, any>) => {
      if(response.data.products.data.length > 0 ){
        await this.handleMainProducts(response);
        if(update_order_item_products) {
          await self.updateFactoryProduct(update_order_item_products.factory_products[update_order_item_products.active_index]);
        }
      }else{
        this.showError("No Product Found")
        this.$store.dispatch('setShowLoader', false)
        this.$store.dispatch('setSearchLoader', false)
      }
    }, (error) => {
      console.error("Error while getting order detail", error?.response?.data?.message)
    })
  }
}




