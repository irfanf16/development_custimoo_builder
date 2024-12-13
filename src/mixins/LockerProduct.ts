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
  getEditModeDefaultObj,
  logoColorInfoDefaultObject,
  hideLockerProductUpdateButton,
  checkIsEmpty,
  getProductById,
  handleProductPriceUpdate,
  getSelectedProductPantones,
  getColorType,
  santaClone,
  navigateToCustomProduct,
  createOrUpdateOrderUpdateDataState,
  getBase64FileInfo,
  getDateTimeFormatted,
  handleExistingAddonsSelection,
  getProductAddonInfoDefaultObject
} from '@/helpers/Helpers'
import {http} from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";
import ModalAction from "@/mixins/ModalAction";
import {FetchCategories, HideUpdateLockerButton} from '@/mixins/SelectedProductMixin'
import {eventBus} from "@/event/eventBus";
import {getClosestColor} from "@/pantoneColor";
import {LogoUploaderColors} from "@/mixins/LogoUploaderColors";
import {loadState, saveState} from "@/indexedDBPersistence";

@Component
export class LockerProducts extends Mixins(FetchCategories, ModalAction) {
  public searchText = '';
  get mainTotalTabs(){
    return this.$store.getters.getMainTotalTabs;
  }

  public async editProduct(room_id: number, locker_product: Record<any, any>, ind: number|string, share_url="", editRoster=false, backTo={}) {
    let self: Record<any, any> = this;
    const product_id  = locker_product.product_id;
    const locker_product_id  = locker_product.id;
    this.$emit('update:search')
    this.fetchCategories(null, product_id).then(async (cat_response: Record<any, any>) => {
      if(cat_response.no_product_found) {
        return;
      }
      let edit_product_info_obj = getEditModeDefaultObj()
      edit_product_info_obj.editing = true;
      edit_product_info_obj.type = 'locker_product';
      edit_product_info_obj.locker_product_info = {
        product_id: product_id, locker_product_id: locker_product.id, style_id: locker_product.style_id, design_id: locker_product.design_id,
        locker_product_name: locker_product.product_name
      };
      if(editRoster){
        edit_product_info_obj.locker_product_info!.meta_info = backTo
      }
      this.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", edit_product_info_obj)
      const query_params = await self.setQueryParams()
      await self.retrieveProductsNew(query_params)
      this.$emit('hideLockerRoomModal');

    });

    await hideLockerProductUpdateButton(true)
  }

  get getLockerProducts() {
    let main_product_id = this.$store.getters.getEditProductId;
    let locker_products:Record<any, any> = this.$store.getters.getLockerProducts;
    //locker_products = santaClone(locker_products)
    let locker_products_count = locker_products.length
    let locker_room_index = locker_products.findIndex((locker) => locker.room_name.toLowerCase().includes(this.searchText.toLowerCase()));
    if (this.searchText) {
      let filtered_locker_rooms = locker_products.filter((locker) => locker.room_name.toLowerCase().includes(this.searchText.toLowerCase()));
      if (locker_room_index !== -1) {
        let payload = {index: locker_room_index, attribute: 'active_tab', value: true};
        this.$store.commit('SET_LOCKER_ATTRIBUTE', payload);
        this.$store.commit('Change_Locker_Tabs_Index', locker_room_index);
      }
      if (filtered_locker_rooms.length === 0) {
        locker_products = locker_products.filter((locker) => {
            let filteredProducts = locker.product.filter((product) => product.product_name.toLowerCase().includes(this.searchText.toLowerCase()));
          let active_tab_index = locker_products.findIndex((locker) => locker.id === filteredProducts[0]?.room_id);
          if (filteredProducts.length) {
            let payload = {index: active_tab_index, attribute: 'active_tab', value: true};
            this.$store.commit('SET_LOCKER_ATTRIBUTE', payload);
            this.$store.commit('Change_Locker_Tabs_Index', active_tab_index);
            locker.product = filteredProducts
            return true
          } else {
            return false
          }
        })
      }
      else {
        locker_products = filtered_locker_rooms
      }
    }
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
        colors =  res.data.logo_colors
      }).catch((e) => {
        console.log('Unable to fetch logo colors',e.response.data.message)
      })
    return colors
  }
}

@Component
export class handleMainProducts extends Mixins(FetchCategories, HideUpdateLockerButton, ErrorMessages) {
  public async retrieveProductsNew(query_params: string[] = []) {
    let self: Record<any, any> = this;
    let url = '/list/products';
    let url_obj = new URL(`${process.env.VUE_APP_API_BASE_URL}${url}`);
    query_params.forEach((query_param: string) => {
      let query_param_array = query_param.split("=");
      if (url_obj.searchParams.has(query_param_array[0])) {
        url_obj.searchParams.set(query_param_array[0], query_param_array[1])
      } else {
        url_obj.searchParams.append(query_param_array[0], query_param_array[1])
      }
    })
    url = url_obj.pathname + url_obj.search;
    http.get(url).then(async (response: Record<any, any>) => {
      const response_data = response.data;
      const {active_product_id, products: {data: retrieved_products}} = response_data
      if(retrieved_products.length > 0) {
        const is_active_product_valid = await getProductById(active_product_id, retrieved_products)
        if (is_active_product_valid) {
          await this.handleMainProducts(response);
          if (self["showLoader"]) {
            self.showLoader = false;
          }
        } else {
          this.showError("Product no more exists.");
          await this.handleProductNotFound()
        }
      } else {
        this.showError("No Product Found");
        await this.handleProductNotFound()
      }
    }, async (error) => {
      this.showError("Product no more exists.");
      await this.handleProductNotFound()
      console.error('Error while getting products listing')
    })
  }

  public async handleProductNotFound() {
    let self: Record<any, any> = this;
    await this.handleCancelEditMode();
    await resetLastActiveProductData();
    this.fetchCategories('customized').then((cat_response) => {
      self.setQueryParams().then(async (query_params: string[]) => {
        await this.retrieveProductsNew(query_params)
      });
    });
  }

  public async handleCancelEditMode(persist_last_active_product_data = true) {
    let self: Record<any, any> = this;
    const last_active_product_data = JSON.parse(JSON.stringify(this.$store.getters.getLastActiveProductData))
    await exitFromEditMode()
    await this.$emit('update:search');
    await eventBus.$emit('useProductOriginalColors')
    await hideLockerProductUpdateButton()
    await this.$store.commit('RESET_CUSTOM_TEXTS');
    await this.$store.commit('RESET_CUSTOM_LOGOS');
    await this.$store.commit('SET_LOGO_COLORS_INFO', {reset: true});
    await eventBus.$emit('resetTextsCanvas');
    await eventBus.$emit('resetLogosCanvas');
    await self.$root.$emit('sliderEvent', 0);
    await this.$store.dispatch('setTabMain', {value: 0});
    if(persist_last_active_product_data) {
      await this.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", last_active_product_data)
    }
    await this.$store.dispatch("setProductsRosters");
  }

  get styleIndex():number {
    return this.$store.getters.getCurrentStyleIndex;
  }

  get getLastActiveProductData() {
    return this.$store.getters.getLastActiveProductData
  }

  get selectedProductId(): number {
    return this.$store.getters.getSelectedProductId
  }

  get mobileScreen(): boolean {
    return this.$store.getters.getManageComponents.mobileScreen
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
    if(product_edit_info_object.type == "order_product") {
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
      const { item_id, factory_product_active_index, active_factory_product } = await createOrUpdateOrderUpdateDataState()
      if(active_factory_product && active_factory_product.is_custom_product) {
        active_factory_product.edit_mode_info_obj = {
          mode: 'order_edit', item_id, factory_product_id: active_factory_product.id, factory_product_index: factory_product_active_index
        }
        await navigateToCustomProduct(active_factory_product)
        return false;
      }
    }

    let append_products: boolean =  response_products_obj.current_page > 1;
    this.$store.commit("SET_PRODUCTS_NEXT_PAGE_NO", next_page_url ? current_page + 1 : null)

    const prms = new Promise((resolve) => {
      self.$eventBus.$emit('initProductsFonts', retrieved_products, resolve)
    })
    return prms.then(async () => {
      return new Promise<any>(async (resolve) => {
        if(append_products) {
          this.$store.commit('SET_PRODUCTS', {products: retrieved_products, append_products: true});
          this.$store.commit('SET_APPLICATION_MOUNTED')
          return false;
        } else {
          if(!this.mobileScreen && response_products_obj.current_page == 1 && active_product_id != this.selectedProductId) {
            this.$store.commit('SET_START_LOAD_DESIGNS', false)
            this.$store.commit('SET_START_LOAD_PRODUCTS', false)
          }
          this.$store.commit('SET_INITIALIZING_PRODUCTS_DATA', true)
        }
        let active_product: Record<any, any> = retrieved_products[active_product_index]
        let product_custom_texts: Record<any, any>[] = active_product.product_custom_texts;

        this.$store.commit('SET_PRODUCTS', {products: retrieved_products, active_product_index: active_product_index});
        this.$store.commit('CHANGE_STYLE_INDEX', active_style_index);
        await this.$store.dispatch("getSkuInformation", active_product_id);
        //await this.$store.dispatch('setSelectedIndex', {selectedIndex: active_product_index, selected_id: active_product_id});
        let fixed_logo_index = active_product.productstyles[this.styleIndex].logo.findIndex(logo => logo.is_default === 1);
        let last_active_prod_data = this.$store.getters.getLastActiveProductData;
        if(active_product_detail) {
          const { factory_product_active_index, factory_products } = active_product_detail
          let editing_product_addons_info = getProductAddonInfoDefaultObject(active_product_id)
          factory_products.forEach(factory_product => {
            const {grouped_addons, ungrouped_addons} = factory_product
            if(ungrouped_addons && ungrouped_addons.length > 0) {
              editing_product_addons_info[active_product_id].ungrouped_addons = ungrouped_addons.map(ungrouped_addon => {
                return ungrouped_addon.addon_id
              })
            }
            if(grouped_addons && !checkIsEmpty(grouped_addons)) {
              for(const group_name in grouped_addons) {
                editing_product_addons_info[active_product_id].grouped_addons[group_name] = grouped_addons[group_name].id
              }
            }
          })
          handleExistingAddonsSelection(editing_product_addons_info)


          let active_factory_product = factory_products[factory_product_active_index]
          this.handleFactoryProductAddons(active_factory_product)

          let customLogos = self.$store.getters.getCustomLogoObject
          if(!customLogos[active_product_id]) {
            await this.$store.dispatch('setCustomObj', active_product_id)
          }

          this.$store.commit('RESET_CUSTOM_TEXTS')
          this.$store.commit('RESET_CUSTOM_LOGOS')
          this.$store.commit('RESET_ALL_COLORS')
          if(active_factory_product.product_custom_texts && active_factory_product.product_custom_texts.length > 0 ) {
            product_custom_texts = active_factory_product.product_custom_texts
          }

          let {custom_logos, defaultcolors:default_colors, groupcolors:group_colors, product_roster_detail, shuffle_color_number } = active_factory_product
          fixed_logo_index = active_factory_product.fixed_logo_index
         if(product_edit_info_object.type == "cart_product" && active_product_detail.factory_products[0].reorder_data) {
           this.$store.commit('SET_PRODUCT_EDIT_INFO_OBJECT', { cart_product_info : {...product_edit_info_object.cart_product_info, reorder_data : active_product_detail.factory_products[0].reorder_data} })
          }

          if(product_edit_info_object.type == "order_product") {
            let order_existing_updated_data = await loadState("order_updated_data");
            if(order_existing_updated_data) {
              const order_updated_data = order_existing_updated_data.order_updated_data
              if(order_updated_data && order_updated_data.length > 0 && order_updated_data[factory_product_active_index]) {
                let order_update_active_product = order_updated_data[factory_product_active_index]
                custom_logos = order_update_active_product.custom_logos
                shuffle_color_number = order_update_active_product.shuffle_color_number
                default_colors = order_update_active_product.defaultcolors
                group_colors = order_update_active_product.groupcolors
                product_roster_detail = order_update_active_product.product_roster_detail
                product_custom_texts = order_update_active_product.product_custom_texts
                active_style_id = order_update_active_product.style_id
                active_design_id = order_update_active_product.design_id
                const active_product_styles = active_product.productstyles
                active_style_index  = findIndex(active_product_styles, (style: Record<any, any>) => {
                  return style.id == active_style_id
                })
                this.$store.commit('CHANGE_STYLE_INDEX', active_style_index);
                const active_style_designs = active_product_styles[active_style_index].productdesigns
                active_design_index  = findIndex(active_style_designs, (design: Record<any, any>) => {
                  return design.id == active_design_id
                })
              }
            }
          }

          let customizer_data: Record<any, any> = {
            active_product_id: active_product_id, custom_logos:custom_logos, product_custom_texts:product_custom_texts,
            default_colors:default_colors, group_colors:group_colors, product_roster_detail: product_roster_detail,
            shuffle_color_number: shuffle_color_number
          }
          await this.setCustomizerData(customizer_data)
          this.$store.commit('RESET_UNDO');
          this.$store.commit('RESET_REDO');
          if(product_edit_info_object.type == "locker_product" && product_edit_info_object.locker_product_info!.meta_info) {
            const main_total_tabs = self.$store.getters.getMainTotalTabs
            let total_tabs = (main_total_tabs > 0) ? main_total_tabs: 3;
            await this.$store.dispatch('setTabMain', {value: (total_tabs + 1)})
            setTimeout(()=>{
              self.showVModal('rostermodal');
            },500)

          }
        }
        else {
          let addons_info = {}
          if(last_active_prod_data.product_id) {
            fixed_logo_index = last_active_prod_data.fixed_logo_index
            let custom_logos = last_active_prod_data.custom_logos;
            if(!checkIsEmpty(custom_logos)) {
              let custom_logos_type = custom_logos.constructor.name;
              // array check is for handling old data. From now it always will be object
              if(custom_logos_type == "Array") {
                this.$store.commit('SET_CUSTOM_LOGOS', { custom_logos: custom_logos })
              }
              if(custom_logos_type == "Object") {
                this.$store.commit('SET_CUSTOM_LOGOS', { set_all: true,  custom_logos: custom_logos })
              }
            }
            let product_roster_detail =  last_active_prod_data.products_rosters
            /*
            * no need to set custom texts from last active product it will be set automatically by methods  setRetrievedProductsCustomTexts(retrieved_products)
            * no need to set product rosters from last active product it will be set automatically vuex action setProductsRosters
            * */
            await this.setCustomizerData({product_id: active_product_id, group_colors: last_active_prod_data.group_colors,
              default_colors: last_active_prod_data.default_colors, product_roster_detail: product_roster_detail,
              shuffle_color_number: last_active_prod_data.shuffle_color_number })
            if(last_active_prod_data.addons_info && !checkIsEmpty(last_active_prod_data.addons_info)) {
              addons_info = last_active_prod_data.addons_info
              handleExistingAddonsSelection(addons_info)
            }
          }

          const selected_category = this.$store.getters.getSelectedCategory;
          const selected_sub_category = this.$store.getters.getSelectedSubCategory;

          let last_active_obj_updated_values = lastActiveProductDefaultObject({
            category_id: selected_category.category_id, category_index: selected_category.category_index,
            sub_category_id: selected_sub_category.sub_category_id, sub_category_index: selected_sub_category.sub_category_index,
            product_index: active_product_index, product_id: active_product_id, fixed_logo_index: fixed_logo_index,
            style_id: active_style_id, style_index: active_style_index, design_index: active_design_index, design_id: active_design_id,
            search_products: self.search_products, customized: this.$store.getters.getCustomized,
            personalized: this.$store.getters.getPersonalized, private_product:this.$store.getters.getPrivateProduct,
            products_rosters: this.$store.getters.getProductRosters('all'), default_colors: last_active_prod_data.default_colors,
            group_colors: last_active_prod_data.group_colors, addons_info: addons_info
          })


          let set_last_active_product_data = lastActiveProductDefaultObject(last_active_obj_updated_values)
          self.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", set_last_active_product_data);
          this.$store.dispatch("setProductsRosters");
          setRetrievedProductsCustomTexts(retrieved_products)
          await initCustomLogosNew(retrieved_products)

          this.$store.dispatch('setColorSectionVisibility')
        }
        // make sure handleProductPriceUpdate method must be called after selectedProduct has been set in vuex
        await handleProductPriceUpdate()

        if(fixed_logo_index != null) {
          active_product.productstyles[this.styleIndex].logo.forEach((logo, index) => {
            if (index == fixed_logo_index) {
              logo.is_default = 1;
            } else {
              logo.is_default = 0;
            }
          });
          self.$eventBus.$emit("fixedLogoResetAndAdd")
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
        this.$store.commit('SET_INITIALIZING_PRODUCTS_DATA', false)
        resolve(response_data)
      })
    })
  }

  public async handleFactoryProductAddons(factory_product) {
    const factory_product_addons = factory_product.addons ? factory_product.addons : [];
    let factory_product_addon_ids: number[] = [];
    if(factory_product_addons.length > 0) {
      factory_product_addon_ids = factory_product_addons.map(factory_product_addon => {
        return factory_product_addon.addon_id;
      })
    }
    const selected_product = this.$store.getters.getSelectedProduct;
    if(selected_product) {
      const active_product_addons = selected_product.active_addons;
      if(factory_product_addon_ids.length > 0) {
        active_product_addons.forEach((active_product_addon: Record<any, any>) => {
          active_product_addon.selected = factory_product_addon_ids.includes(active_product_addon.addon_id);
        })
      }
    }
  }

  public async setCustomizerData(customizer_data) {
    let self: Record<any, any> = this;
    let {active_product_id, custom_logos, product_custom_texts, default_colors, group_colors, product_roster_detail, shuffle_color_number} = customizer_data
    if(custom_logos) {
      const custom_logos_type = custom_logos.constructor.name
      if(custom_logos_type == "Array" && custom_logos.length > 0) {
        await this.$store.dispatch('OVERRIDE_CUSTOM_LOGOS', {product_id: active_product_id, custom_logos: custom_logos});
        await this.setProductTeamLogoColors(custom_logos)
      }
      if(custom_logos_type == "Object" && custom_logos.length > 0) {
        await this.$store.commit("SET_CUSTOM_LOGOS", {set_all: true, custom_logos: custom_logos})
        if(custom_logos[active_product_id]) {
          await this.setProductTeamLogoColors(custom_logos[active_product_id])
        }
      }
      self.$eventBus.$emit("customLogoResetAndAdd")
    }
    if(product_custom_texts) {
      await self.$eventBus.$emit('resetTextsCanvas');
      let active_product_custom_texts = [];
      if(product_custom_texts.constructor.name == "Array" && product_custom_texts.length > 0) {
        this.$store.commit('SET_PRODUCT_CUSTOM_TEXTS', {product_id: active_product_id, value: product_custom_texts});
        active_product_custom_texts = product_custom_texts
      }

      if(product_custom_texts.constructor.name == "Object" && Object.keys(product_custom_texts).length > 0) {
        this.$store.commit('SET_PRODUCT_CUSTOM_TEXTS', { set_all: true, value: product_custom_texts });
        if(product_custom_texts[active_product_id]) {
          active_product_custom_texts = product_custom_texts[active_product_id]
        }
      }

      active_product_custom_texts.forEach((custom_text: Record<any, any>, customTextIndex: number) => {
        self.$eventBus.$emit("customTextUpdated", {
          emitter: "input", custom_text_index:customTextIndex, custom_text_item_index: null, value: custom_text
        });
      })

    }
    let emit_color_change_event = false;
    if(shuffle_color_number) {
      this.$store.commit('SET_SHUFFLE_COLOR_NUMBER', shuffle_color_number)
    }
    if(default_colors && default_colors.length > 0) {
      emit_color_change_event = true
      await this.$store.dispatch('overRideDefaultColors', default_colors);
    }
    if(group_colors) {
      if(group_colors.constructor.name == "Array" && group_colors.length == 0) {
        group_colors = {}
      }
      emit_color_change_event = true
      await this.$store.dispatch('overRideGroupColors', group_colors);
    }
     if(emit_color_change_event) {
       self.$eventBus.$emit("changeColors")
     }

     if(product_roster_detail) {
       if(product_roster_detail.constructor.name == "Array" && product_roster_detail.length > 0) {
         this.$store.dispatch("setProductsRosters", {product_id: active_product_id, roster_data: product_roster_detail});
       }
       if(product_roster_detail.constructor.name == "Object" && Object.keys(product_roster_detail).length > 0) {
         this.$store.dispatch("setProductsRosters", {set_all: true, roster_data: product_roster_detail});
       }
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

  public setProductTeamLogoColors(custom_logos: any) {
    const custom_logos_type = custom_logos.constructor.name
    custom_logos = custom_logos_type == 'String' ? JSON.parse(custom_logos) : custom_logos
    if(custom_logos.length > 0) {
      if(custom_logos[0].logo_colors && custom_logos[0].logo_colors.length > 0) {
        let product_logo_colors = this.getLogoColors(custom_logos[0].logo_colors)
        this.$store.commit('SET_LOGO_COLORS_INFO', {
          data: { using_logo_colors: false,  is_shuffled: false,  colors: product_logo_colors,  extracted_colors: product_logo_colors }
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
}

@Component
export class ProductsQueryParamsMixin extends Vue {
  public async setQueryParams() {
    let self: Record<any, any> = this;
    /*
    * is_customized, is_personalized, is_private is always updated as setQueryParams method is called after fetch categories which sets the values of three variables
    * */
    let is_customized = this.$store.getters.getCustomized;
    let is_personalized = this.$store.getters.getPersonalized;
    let is_private = this.$store.getters.getPrivateProduct;
    let query_params: string[] = await this.handleUrlQueryParams();
    const selected_category = this.$store.getters.getSelectedCategory;
    const selected_sub_category = this.$store.getters.getSelectedSubCategory;
    let edit_product_info_obj = this.$store.getters.getProductEditInfoObject
    if(edit_product_info_obj.editing) {
      const active_product_type = edit_product_info_obj.type;
      if(active_product_type == "order_product") {
        let { order_product_info } = edit_product_info_obj
        // on page refresh load first order product
        if(order_product_info.factory_products.length > 0) {
          let order_item_active_factory_product_index = 0
          //if order_update_identifier value is set then it means the page is not refreshed and need to get the factory_product_active_index from store getProductEditInfoObject
          const order_update_identifier = this.$store.getters.getOrderUpdateIndentifier
          if(order_update_identifier) {
            order_item_active_factory_product_index = order_product_info.factory_product_active_index
          }
          let first_factory_product = order_product_info.factory_products[order_item_active_factory_product_index]
          order_product_info.factory_product_active_index = order_item_active_factory_product_index
          order_product_info.active_product_id = first_factory_product.product_id
          order_product_info.style_id = first_factory_product.style_id
          order_product_info.design_id = first_factory_product.design_id
          this.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", {order_product_info: order_product_info})
        }
        const { active_product_id, item_id, activity_id, style_id, design_id, factory_product_active_index } = order_product_info
        query_params.push(`active_product_type=order_product`, `active_product_id=${active_product_id}`, `item_id=${item_id}`,
          `activity_id=${activity_id}`, `style_id=${style_id}`, `design_id=${design_id}`, `factory_product_active_index=${factory_product_active_index}`,
          `paginate=false`)
      } else if(active_product_type == "locker_product") {
        query_params = [
          `customized=${is_customized}`, `personalized=${is_personalized}`, `private=${is_private}`, `active_product_id=${edit_product_info_obj.locker_product_info.product_id}`,
          `style_id=${edit_product_info_obj.locker_product_info.style_id}`,`design_id=${edit_product_info_obj.locker_product_info.design_id}`,
          `locker_product_id=${edit_product_info_obj.locker_product_info.locker_product_id}`, `active_product_type=${edit_product_info_obj.type}`,
          `category_id=${selected_category.category_id}`, 'paginate=false'
        ];
        if (selected_sub_category.sub_category_id) {
          query_params.push(`sub_category_id=${selected_sub_category.sub_category_id}`);
        }
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
          `customized=${is_customized}`, `personalized=${is_personalized}`, `private=${is_private}`, 'is_reorder=true', 'active_product_type=reorder_product', `item_id=${reorder_product_info_obj.order_item_id}`,
          `factory_product_id=${reorder_product_info_obj.factory_product_id}`, `active_product_id=${reorder_product_info_obj.active_product_id}`,
          `style_id=${reorder_product_info_obj.style_id}`, `design_id=${reorder_product_info_obj.design_id}`, 'paginate=false',
        ];
        if(selected_category.category_id) {
          query_params.push(`category_id=${selected_category.category_id}`)
        }
        if (selected_sub_category.sub_category_id) {
          query_params.push(`sub_category_id=${selected_sub_category.sub_category_id}`);
        }
      }
    } else {
      let last_active_product_data = self.getLastActiveProductData;
      if(last_active_product_data.product_id) {
        query_params.push(
          `active_product_id=${last_active_product_data.product_id}`,
          `style_id=${last_active_product_data.style_id}`, `design_id=${last_active_product_data.design_id}`, 'paginate=false'
        )
        if(last_active_product_data.search_products) {
          query_params.push(`title=${last_active_product_data.search_products}`)
        }
      }
      if(selected_category.category_id) {
        query_params.push(`category_id=${selected_category.category_id}`)
      }
      if (selected_sub_category.sub_category_id) {
        query_params.push(`sub_category_id=${selected_sub_category.sub_category_id}`);
      }
      query_params.push(`customized=${this.$store.getters.getCustomized}`, `personalized=${this.$store.getters.getPersonalized}`, `private=${this.$store.getters.getPrivateProduct}`)
    }
    return query_params
  }

  public async handleUrlQueryParams() {
    let self: Record<any, any> = this
    let url_query_string: null | string = getUrlParameter()
    let query_params: string[] = [];
    const selected_category = this.$store.getters.getSelectedCategory;
    const selected_sub_category = this.$store.getters.getSelectedSubCategory;
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
        edit_mode_default_obj.cart_product_info.meta_info = {back_to_cart: true}
        this.$store.commit('SET_PRODUCT_EDIT_INFO_OBJECT', edit_mode_default_obj)

      } else {
        query_params.push(`category_id=${selected_category.category_id}`)
          if(selected_sub_category.sub_category_id){
              query_params.push(`sub_category_id=${selected_sub_category.sub_category_id}`);
          }
      }
    }

    if (url_query_string?.includes('share')) {
      query_params.push(`shared_url=${url_query_string}`, "active_product_type=share_product")
      const is_mobile_screen = this.$store.getters.getMobileScreen
      if(is_mobile_screen) {
        this.$store.dispatch('setManageComponents', {index: 'CustomizationPreview', value: true})
      }
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
        const editing_product_info = self.$store.getters.getProductEditInfoObject;
        switch (self.$store.getters.getProductEditInfoObject.type) {
          case 'locker_product':
            if (self.$store.getters.getHideSaveLockerButton === false) {
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
                      exitFromEditMode()
                      resolve(true);
                    });
                  }
                  else{
                    self.showToast('Changes Discarded, Exiting from Editing State', 'error');
                    exitFromEditMode()
                    resolve(false)
                  }
              });
            }
            else{
              exitFromEditMode()
              resolve(false);
            }
            break;
          case 'cart_product':
            const { cart_product_info: { cart_item_product: { is_custom_product = false } }  } = editing_product_info
            if(is_custom_product) {
              self.showToast('Changes Discarded, Exiting from Editing State', 'error');
              exitFromEditMode()
              resolve(false)
            } else {
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
                    exitFromEditMode()
                    resolve(true)
                  });
                }
                else{
                  self.showToast('Changes Discarded, Exiting from Editing State', 'error');
                  exitFromEditMode()
                  resolve(false)
                }
              });
            }

            break;
          case 'order_product':
            self.$santaModal.show({
              icon: 'confirm', title: 'Are You Sure!', text: 'This will discard your order update changes', confirm_text: 'Continue Order Update', cancel_text: 'Discard Changes',
            },self).then((confirmation) => {
              if(confirmation) {
                self.$santaModal.hide();
                resolve(true)
              }
              else {
                self.showToast('Changes Discarded, Exiting from Editing State', 'info');
                exitFromEditMode()
                resolve(false)
              }
            });
            break;
          case 'reorder_product':
            self.$santaModal.show({
              icon: 'confirm', title: 'Are You Sure!', text: 'This will discard reordering product', confirm_text: 'Continue Re Order Product', cancel_text: 'Cancel Re Order Product',
            },self).then((confirmation) => {
              if(confirmation) {
                self.$santaModal.hide();
                resolve(true)
              }
              else {
                self.showToast('Product re order cancelled', 'info');
                exitFromEditMode()
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
export class changeSelectedProduct extends Mixins(exitEditMode, HideUpdateLockerButton, LogoUploaderColors) {
  get products(): Record<any, any>[] {
    return this.$store.getters.getProducts
  }
  get selectedProduct() {
    return this.$store.getters.getSelectedProduct;
  }
  get mobileScreen(): boolean {
    return this.$store.getters.getManageComponents.mobileScreen
  }
  get selectedProductIndex(): number{
    return this.$store.getters.getSelectedIndex
  }
  get styleIndex():number{
    return this.$store.getters.getCurrentStyleIndex;
  }
  get logoColorsInfo() {
    return this.$store.getters.getLogoColorsInfo();
  }
  public changeStyleIndex(i: number) {
    if(this.styleIndex != i) {
      if(this.logoColorsInfo.using_logo_colors) {
        this.useLogoColors(false)
      }
      if (this.mobileScreen) {
        (this.$parent!.$parent as Record<any, any>).isFront = true
      } else {
        this.$store.commit('SET_START_LOAD_DESIGNS', false)
        this.$store.commit('SET_START_LOAD_PRODUCTS', false)
      }

      const currentDesign = this.selectedProduct.productstyles[this.styleIndex].productdesigns.filter((item: Record<any, any>) => {
        return item.design_show
      })
      if (currentDesign.length) {
        const design_name = currentDesign[0].design_name
        let designFound = false;
        this.selectedProduct.productstyles[i].productdesigns.forEach((item: Record<any, any>) => {
          if (item.design_name.toLowerCase() == design_name.toLowerCase()) {
            designFound = true
            Vue.set(item, 'design_show', 1)
            this.$store.dispatch('setSelectedProductDesignID', item.id)
          } else {
            Vue.set(item, 'design_show', 0)
          }
        })
        this.hideLockerProductUpdateButton(true)
        if (!designFound) {
          if (!this.selectedProduct.productstyles[i].productdesigns.filter((design: Record<any, any>) => design.design_show).length) {
            this.selectedProduct.productstyles[i].productdesigns.forEach((item: Record<any, any>, index: number) => {
              if (index == 0) {
                Vue.set(this.selectedProduct.productstyles[i].productdesigns[0], 'design_show', 1)
                this.$store.dispatch('setSelectedProductDesignID', this.selectedProduct.productstyles[i].productdesigns[0].id)
              } else {
                Vue.set(this.selectedProduct.productstyles[i].productdesigns[index], 'design_show', 0);
              }
            })
          }
        }
      }
      this.$store.commit('CHANGE_STYLE_INDEX', i);
      let design_index = findIndex(this.selectedProduct.productstyles[i].productdesigns, "design_show")
      this.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", {
        style_index: i, style_id: this.selectedProduct.productstyles[i].id,
        design_index: design_index, design_id: this.selectedProduct.productstyles[i].productdesigns[design_index].id
      })
      hideLockerProductUpdateButton(false)
    }
  }
  async productDesigns(index: number) {
    if (index != this.selectedProductIndex) {
      this.$store.commit("RESET_PRODUCT_DESIGNS_SELECTION_INFO")
      if(this.logoColorsInfo.using_logo_colors) {
        this.useLogoColors(false)
      }
      if(!this.mobileScreen) {
        this.$store.commit('SET_START_LOAD_DESIGNS', false)
      }
      this.$store.commit('RESET_UNDO_REDO_ITEMS')
      let style_index = 0;
      const confirmed_value = await this.editModeConfirmation();
      const edit_info_obj = this.$store.getters.getProductEditInfoObject;
      if(edit_info_obj.type == "reorder_product" && confirmed_value) {
        return false;
      }
      this.$store.commit('Change_Locker_Tabs_Index', undefined)
      await this.$store.dispatch('setSelectedIndex', {selectedIndex: index, selected_id: this.products[index].id})
      await this.$store.dispatch("getSkuInformation", this.products[index].product_id);
      await handleProductPriceUpdate()
      this.$store.dispatch('setColorSectionVisibility')
      this.hideLockerProductUpdateButton()
      this.$store.commit('CHANGE_EDIT_STATUS', {status: false, id: 0, designId: 0, styleId: 0, product_id: 0});
      let design_index = 0;
      let selected_product_design = this.selectedProduct.productstyles[style_index].productdesigns.filter((product_design: Record<any, any>, product_design_index: number) => {
        if (product_design.design_show === 1) {
          design_index = product_design_index;
        }
        return product_design.design_show === 1
      })[0];
      if (selected_product_design) {
        this.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", {
          design_index: design_index,
          design_id: selected_product_design.id,
          product_index: index,
          product_id: this.selectedProduct.id,
          style_index: style_index,
          style_id: this.selectedProduct.productstyles[style_index].id
        });

        await this.$store.dispatch('setSelectedProductDesignID', selected_product_design.id);
      }
      this.$store.commit('CHANGE_STYLE_INDEX', style_index);
      const factory_setting = this.$store.getters.getFactorySettings(this.selectedProduct.factory_id);
      this.$store.commit('SET_SETTING', factory_setting)

      if (this.mobileScreen) {
        await this.$store.dispatch('setColorSectionVisibility')
      }
    }
  }
}

@Component
export class RosterDetailsGlobal extends Vue {

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
    let product_custom_texts = this.$store.getters.selectedProductCustomTexts;
    let active_roster = this.productRoster[roster_index]

    if(this.custom_number_index >= 0) {
      let custom_number_text = product_custom_texts[this.custom_number_index]
      custom_number_text.value = active_roster.number
      setTimeout(() => {
        self.$eventBus.$emit("rosterTextUpdated", {
          emitter: "input", custom_text_index:self.custom_number_index, value: custom_number_text
        })
      }, 200)
    }

    if(this.custom_name_index >= 0) {
      let custom_name_text = product_custom_texts[this.custom_name_index]
      custom_name_text.value = active_roster.text
      setTimeout(() => {
        self.$eventBus.$emit("rosterTextUpdated", {
          emitter: "input", custom_text_index:self.custom_name_index, value: custom_name_text
        })
      }, 200)
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

  public checkMinimumOrderQtyBYDesign(roster, sku_information, edit_product_info_obj, product_name){
    let moq = this.$store.getters.getSetting("moq");
    if(Object.prototype.hasOwnProperty.call(edit_product_info_obj, "mode")){
      //This reorder is from custom design
      if(edit_product_info_obj.mode === "reorder" && (sku_information.reorder_follows_moq === 1 || sku_information.reorder_follows_moq === true)){
        return true;
      }
    }
    else{
      if(edit_product_info_obj.type === "reorder_product" && (sku_information.reorder_follows_moq === 1 || sku_information.reorder_follows_moq === true)){
        return true;
      }
    }
    if (roster.some(el => (el.quantity === '' || parseInt(el.quantity) === 0))) {
      this.showToast('Quantity cannot be 0 or empty', 'error');
      return false;
    }
    if (roster.some(el => (parseInt(el.quantity) > 0 &&  (el.size=="" || el.size == null || parseInt(el.size_index) < 0)  ))) {
      this.showToast(`Please provide size for all roster items`, "error");
      const is_mobile_screen = this.$store.getters.getMobileScreen
      if(!is_mobile_screen){
        this.showVModal('rostermodal');
      }
      return false;
    }
    // check is the sum of roster items(collectively) is greater than sku's 'minimum order quantity'
    if(sku_information.minimum_order_quantity_type === "by_design" && sku_information.minimum_order_quantity != null &&
      sku_information.minimum_order_quantity > 0 && parseInt(moq) === 0) {
      let roster_item_sum = 0;
      roster.forEach((item:Record<any, any>) => {
        roster_item_sum += parseInt(item.quantity);
      })
      if(roster_item_sum < sku_information.minimum_order_quantity){
        this.showToast(`${this.$t('minimum_order_roster_message',
          {
            product_name: product_name,
            min_products_count: sku_information.minimum_order_quantity
          })}`, "error", 9000);
        return false;
      }
    }
    return true;
  }

  public async removeShopifyCartItems(remove_addons_obj) {
    if(Object.keys(remove_addons_obj).length > 0) {
      let company = this.$store.getters.getCompany;
      let x_rand = Math.floor((Math.random() * 100) + 1);
      await http.post(company.company_domain + '/cart/update.js?token='+x_rand, {updates : remove_addons_obj})
    }

  }

  public async addShopifyAddons(addon_ids, total_quantity) {

    return new Promise(async (resolve) => {
      let company = this.$store.getters.getCompany;
      let remove_addons:Record<any, any> = {};
      let addon_quantities:Record<any, any> = {};
      let add_cart_addons:Record<any, any>[] = [];
      let shopify_cart_url = company.company_domain + '/cart.js';
      let res = await http.get(shopify_cart_url);
      if(res) {
        let shopify_cart_items = res.data.items;
        let remove_addons_cart =  shopify_cart_items.filter((obj) => {
          return addon_ids.includes(obj.id)
        }) ;
        if(remove_addons_cart.length > 0) {
            remove_addons_cart.forEach((remove_addon) => {
              addon_quantities[remove_addon.variant_id] = remove_addon.quantity;
              remove_addons[remove_addon.key] = 0;
            })

             await this.removeShopifyCartItems(remove_addons);
        }

        addon_ids.forEach((addon_ecommerce_variant_id) => {
          if(addon_quantities[addon_ecommerce_variant_id]) {
            add_cart_addons.push({
              id: addon_ecommerce_variant_id ,
              quantity: parseInt(addon_quantities[addon_ecommerce_variant_id].toString()) + parseInt(total_quantity.toString()),
              properties: {'_is_custimoo_addon' : true}
            });
          } else {
            add_cart_addons.push({id: addon_ecommerce_variant_id, quantity: total_quantity, properties: {'_is_custimoo_addon' : true}});
          }
        });
      }

      resolve( {add_cart_addons });
    });

  }
  public async updateShopifyAddons(cart_item_index, updated_addon_ids, total_quantity, ecommerce_update_id) {
    return new Promise( async (resolve) => {
    let remaining_addons =  [...updated_addon_ids];
    let company = this.$store.getters.getCompany;
    let remove_addons:Record<any, any> = {};
    let add_cart_addons:Record<any, any>[] = [];
    let shopify_cart_url = company.company_domain + '/cart.js';
    let res = await http.get(shopify_cart_url);
    if(res) {
      let shopify_cart_items = res.data.items;

      let product_cart_item = shopify_cart_items[cart_item_index];
      let product_cart_item_quantity = 0;
      let child_addon_ids = product_cart_item.properties.child_addons;

      let previous_addons_cart_items: Record<any, any>[]=[];
      let cart_items_with_same_key: Record<any, any> = {};

      shopify_cart_items.forEach((obj) => {
        if (child_addon_ids.includes(obj.id)) {
          previous_addons_cart_items.push(obj);
        }

        if (obj.properties && obj.properties._custimoo_cart_item_key && obj.properties._custimoo_cart_item_key == ecommerce_update_id) {
          cart_items_with_same_key[obj.key] = 0;
          product_cart_item_quantity += parseInt(obj.quantity);
        }
      });

      previous_addons_cart_items.forEach((prevCartItem) => {
        remove_addons[prevCartItem.key] = 0;
        if(!updated_addon_ids.includes(prevCartItem.id)) {
          if(( parseInt(prevCartItem.quantity) - product_cart_item_quantity) > 0 ) {
            add_cart_addons.push({id:prevCartItem.id, quantity: parseInt(prevCartItem.quantity) - product_cart_item_quantity, properties: {'_is_custimoo_addon' : true}});
          }
        } else {
          add_cart_addons.push({
            id: prevCartItem.id,
            quantity: (parseInt(prevCartItem.quantity) - product_cart_item_quantity) + parseInt(total_quantity),
            properties: {'_is_custimoo_addon' : true}
          });
          remaining_addons = remaining_addons.filter(addon_id => addon_id !== prevCartItem.id);
         }

      })


      let remove_cart_items = { ...remove_addons, ...cart_items_with_same_key}
        await this.removeShopifyCartItems(remove_cart_items);

        if(remaining_addons.length > 0) {
          remaining_addons.forEach((remaining_id) => {
            add_cart_addons.push({id: remaining_id, quantity: total_quantity});
          });
        }

    }

      resolve( {add_cart_addons });
    });

  }
  public async makeShopifyCartCall(ecom_url, shopify_cart_data, collection_view ,delete_cart_item_url  ) {
   let self  = this;
    http.post(ecom_url, {items : shopify_cart_data}).then(async (res: any) => {
      let company = this.$store.getters.getCompany;
      self.$store.dispatch('setCartLoading',false);
      self.$store.commit('SET_INDEX_DB_STORE_TIME',0);
      await self.exitFromEditMode()
      if(!collection_view) {
        self.$store.commit("SET_NAVIGATE_TO_CART", true);
        window.location.replace(company.company_domain + '/cart');
      }
    }).catch(err => {
      http.delete(delete_cart_item_url);
      self.showToast(err, 'ERROR');
      self.$store.dispatch('setCartLoading',false);
    })
  }


  public async addToCartMixin(product_fonts: Record<any, any>[], resolve:any = null,
                              get_quote = {quote:false, 'admin_salesrep_id': null}) {
    const customerPermissions = this.$store.getters.getCustomerPermissions;
    if(!customerPermissions.includes('skip-moq')) {
      if (!this.checkMinimumOrderQtyBYDesign(
        this.$store.getters.getProductRosters(this.$store.getters.getSelectedProductId),
        this.$store.getters.getSkuInformation,
        this.$store.getters.getProductEditInfoObject,
        this.$store.getters.getSelectedProduct.display_name
      )) {
        if (resolve) {
          resolve(false);
        }
        return;
      }
    }
    this.hideVModal('rostermodal');
    let self: Record<any, any> = this;

      let company = self.$store.getters.getCompany;
      let platform = company.platform;
      if(platform === 'wordpress') {
        const adminToken = localStorage.getItem(Vue.prototype.$adminToken_localstorage_key);
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
      let post_data: Record<any, any> = {
        factory_product: cart_product
      }
      const factory_product_id = getRandom(4, 'alpha_numeric')+getDateTimeFormatted()+getRandom(4, 'alpha_numeric');
      post_data.factory_product.id = factory_product_id;
      (post_data as Record<any,any>).get_quote = get_quote.quote;
      if(get_quote.admin_salesrep_id) {
        (post_data as Record<any,any>).admin_salesrep_id = get_quote.admin_salesrep_id;
      }
      let url = "carts"
      let cart_edit_mode = false;
      let product_edit_info_object = self.$store.getters.getProductEditInfoObject
      if(product_edit_info_object.editing && product_edit_info_object.type == "cart_product") {
        cart_edit_mode = true;
        (post_data as Record<any,any>).factory_product.id = product_edit_info_object.cart_product_info.cart_item_product.id
        url = `carts/cart-items/${product_edit_info_object.cart_product_info.cart_item_id}/update`
        let no_cart_modal_platforms = ['wordpress','shopify'];
        if(!no_cart_modal_platforms.includes(platform)){
          this.showVModal('cart-modal')
        }
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
      let moq = this.$store.getters.getSetting("moq");

      if(platform === 'wordpress') {
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
        ecom_form_data.append('custimoo_merchant_moq', moq);

        if((cart_product as Record<any, any>).minimum_order_quantity_type == 'by_cart' && (cart_product as Record<any, any>).minimum_order_quantity > 0 ) {
          ecom_form_data.append('custimoo_cart_item_meta[custimoo_product_id]', (cart_product as Record<any, any>).product_id);
          ecom_form_data.append('custimoo_cart_item_meta[custimoo_minimum_order_quantity]', (cart_product as Record<any, any>).minimum_order_quantity);
        }


        if((cart_product as Record<any, any>).addons.length > 0) {
          for (const addon of (cart_product as Record<any, any>).addons) {
            ecom_form_data.append('addon_ids[]', addon.addon_ecommerce_product_id.toString());
          }
        }

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
        const customer = this.$store.getters.getCustomer
        const selected_product = this.$store.getters.getSelectedProduct
        const factory_id = selected_product && selected_product?.sku?.factory?.id
        let base_path = `company_${company.id}/${company.id}/cart/${customer.id}`;
        if(factory_id) {
          base_path = `${base_path}/${factory_id}`;
        } else {
          base_path = `${base_path}/shareable`;
        }
        self.$store.dispatch('setCartLoading',true);
        const cart_data = santaClone(post_data)
        const front_image_info = getBase64FileInfo(cart_data.factory_product.front_image, base_path)
        const is_back_image = cart_data.factory_product.back_image
        let back_image_info: Record<any, any> = {}
        if(is_back_image) {
          back_image_info = getBase64FileInfo(cart_data.factory_product.back_image, base_path)
        }
        const cart_assets_promises = [
          http.post('upload_file_to_s3', front_image_info)
        ]
        if(is_back_image) {
          cart_assets_promises.push(http.post('upload_file_to_s3', back_image_info))
        }
        let svg_content_info: Record<any, any> = {}
        if(cart_data.factory_product.svg_content) {
          svg_content_info = {
            file_name: `${factory_product_id}.svg`, file_path: `${base_path}/${factory_product_id}.svg`, file_extension: 'svg',
            file_content: cart_data.factory_product.svg_content
          }
          cart_assets_promises.push(http.post('upload_file_to_s3', svg_content_info))
        }
        Promise.all(cart_assets_promises).then(async (all_promises_response) => {
          delete post_data.factory_product.svg_content
          post_data.factory_product.front_image = front_image_info.file_path
          post_data.factory_product.back_image = back_image_info.file_path ? back_image_info.file_path : ''
          post_data.factory_product.svg_url = svg_content_info.file_path ? svg_content_info.file_path : ''
          await http.post(url, post_data).then(async (res: any) => {
            if (res.data.success == true){
              let product_edit_info_obj = self.$store.getters.getProductEditInfoObject;
              let api_res:Record<any, any> = {};
              if(get_quote.quote) {
                self.$store.commit('SET_INDEX_DB_STORE_TIME',0);
                await self.exitFromEditMode()
                self.showToast(res.data.message, 'success');
                self.$store.dispatch('addedToCart', true)
                this.$router.push({name: 'CustomerQuotes'});
              } else {
                api_res = res.data.result ;
                self.$store.dispatch('addToCart',api_res.items)
                self.showToast(res.data.message, 'success');
                self.$store.dispatch('addedToCart', true)
              }

              if(platform === 'wordpress'){
                let update_cart_id_data = new FormData();
                update_cart_id_data.append('santa_cart_id', api_res.new_created_id);
                update_cart_id_data.append('woocom_cart_id', ecommerce_cart_id as string);
                update_cart_id_data.append('action', 'add_custimoo_cart_id');
                if(cart_edit_mode) {
                  self.$store.commit('SET_INDEX_DB_STORE_TIME',0);
                  await self.exitFromEditMode()
                }
                http.post(ecom_url, update_cart_id_data).then((res: any) => {
                  self.$store.dispatch('setCartLoading',false);
                  if(!collection_view) {
                    self.$store.commit("SET_NAVIGATE_TO_CART", true);
                    window.location.replace(company_domain + '/cart');
                  }
                }).catch(err => {
                  self.$store.dispatch('setCartLoading',false);
                  self.showErrorArr(err.response.data.errors)
                });

              }

              else if(platform === 'shopify') {
                await this.processShopifyCart(cart_product, api_res);
              }
              else {
                if(cart_edit_mode) {
                  self.$store.commit('SET_INDEX_DB_STORE_TIME',0);
                  await self.exitFromEditMode()
                  const categories_promise = this.fetchCategories();
                  categories_promise.then(async (cat_response) => {
                    let query_params = await self.setQueryParams()
                    self.retrieveProductsNew(query_params);
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
                categories_promise.then(async (cat_response) => {
                  let query_params = await self.setQueryParams()
                  self.retrieveProductsNew(query_params);
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
              categories_promise.then(async (cat_response) => {
                let query_params = await self.setQueryParams()
                self.retrieveProductsNew(query_params);
                self.hideVModal('rostermodal');
              });
              if(resolve){
                resolve(false);
              }
            }
          })
        }).catch(() => {
          this.showErrorValidation(['Error uploading file to the cart. Please try again.']);
          self.$store.dispatch('setCartLoading', false);
        })
      }

  }

  public async processShopifyCart(cart_product, custimoo_cart_item) {
    let company = this.$store.getters.getCompany;
    let product_edit_info_object = this.$store.getters.getProductEditInfoObject;
    let collection_view = this.$store.getters.getCollectionView;
    let merchant_moq = this.$store.getters.getSetting("moq");
    let total_quantity = 0;
    let company_domain = company.company_domain;
    let is_custimoo_moq = ((cart_product as Record<any, any>).minimum_order_quantity_type == 'by_cart' && (cart_product as Record<any, any>).minimum_order_quantity > 0 ) ? true : false ;
    let delete_cart_item_url = `${process.env.VUE_APP_API_BASE_URL}/api/carts/cart-items/${custimoo_cart_item.new_created_id}/factory_product/${custimoo_cart_item.cart_item_key}`;
    let x_rand = Math.floor((Math.random() * 100) + 1);
    let ecommerce_update_id = (product_edit_info_object.cart_product_info)?product_edit_info_object.cart_product_info.ecommerce_cart_id:null;

    let ecom_addon_ids : number[] = [];
    for (const addon of (cart_product as Record<any, any>).addons) {
      ecom_addon_ids.push(parseInt(addon.addon_ecommerce_variant_id));
    }

    let shopify_item_properties = {  // items with underscore are private properties of shopify cart object
      '_custimoo_cart_id': custimoo_cart_item.new_created_id,
      '_custimoo_cart_item_key': custimoo_cart_item.cart_item_key,
      '_custimoo_front_image': custimoo_cart_item.front_image_url,
      '_custimoo_back_image': custimoo_cart_item.back_image_url,
      '_custimoo_cart_url': `${company_domain}/${company.customizer_page_url}/#/?sync_id=${(cart_product as Record<any, any>).sync_id}&update_item=${custimoo_cart_item.cart_item_key}&update_cart=${custimoo_cart_item.new_created_id}`,
      '_custimoo_delete_cart_url': delete_cart_item_url,
      '_custimoo_product_name': (cart_product as Record<any, any>).product_name,
      '_custimoo_product_id': (cart_product as Record<any, any>).product_id,
      '_custimoo_minimum_order_quantity': 0,
      '_custimoo_merchant_moq': merchant_moq,
      'DESIGN NAME': (cart_product as Record<any, any>).product_name,
      'YOUR DESIGN': 'Below are the links of your customized designs.',
      'FRONT IMAGE': custimoo_cart_item.front_image_short,
      'BACK IMAGE': custimoo_cart_item.back_image_short,
      'child_addons' : ecom_addon_ids,
    };

    if(is_custimoo_moq ) {
      shopify_item_properties['_custimoo_minimum_order_quantity'] = (cart_product as Record<any, any>).minimum_order_quantity;
    }


    const shopify_sizes = {};
    let shopify_cart_items_data :  Record<any, any>[] = [];
    let size_variant_mapping = (cart_product as Record<any, any>).size_variants_mapping
    if(size_variant_mapping) {
      (cart_product as Record<any, any>).product_roster_detail.forEach(item => {
        let size_variant = size_variant_mapping[item.size];
        if(size_variant) {
          let shopify_cart_item: Record<any, any> = {
            id: size_variant.id,
            quantity: parseInt(item.quantity),
            properties: { ...shopify_item_properties }
          };
          shopify_cart_item['properties']['_custimoo_product_name'] = `${(cart_product as Record<any, any>).product_name} (${item.size})`
          shopify_cart_item['properties']['_custimoo_product_size'] = `${item.size}`
          shopify_cart_item['properties']['_custimoo_delete_cart_url'] += `?size=${item.size}`
          shopify_cart_items_data.push(shopify_cart_item);
          total_quantity += parseInt(item.quantity);
        }


      });

    }else {
      (cart_product as Record<any, any>).product_roster_detail.forEach(item => {
        shopify_sizes[item.size] = (shopify_sizes[item.size] || 0) + parseInt(item.quantity);
        total_quantity += parseInt(item.quantity);
      });

      let shopify_cart_item:Record<any, any> = {};
      shopify_cart_item['id'] = (cart_product as Record<any, any>).ecommerce_variant_id;
      shopify_cart_item['quantity'] = total_quantity;
      shopify_cart_item['properties'] = shopify_item_properties;

      if (Object.keys(shopify_sizes).length > 0) {
        for (const shopify_size in shopify_sizes) {
          shopify_cart_item['properties']['_Size ' + shopify_size ] = shopify_sizes[shopify_size];
        }
      }
      shopify_cart_items_data.push(shopify_cart_item);

    }

    let ecom_url = company_domain + '/cart/add.js?token='+x_rand
    if(ecommerce_update_id) {
      let cart_item_index = product_edit_info_object.cart_product_info.shopify_line_item;
      this.updateShopifyAddons(parseInt(cart_item_index)-1, ecom_addon_ids, total_quantity, ecommerce_update_id).then( (res : Record<any, any>) => {
        let {add_cart_addons} = res;
        let add_shopify_items = [...add_cart_addons, ...shopify_cart_items_data];

        this.makeShopifyCartCall(ecom_url,add_shopify_items, collection_view, delete_cart_item_url);
      })

    }

    else{
      this.addShopifyAddons(ecom_addon_ids, total_quantity).then( (res : Record<any, any>) => {
        let {add_cart_addons} = res;
        let add_shopify_items = [...add_cart_addons, ...shopify_cart_items_data];
        this.makeShopifyCartCall(ecom_url, add_shopify_items, collection_view, delete_cart_item_url);
      })

    }
  }

}



@Component
export class CollectionMixin extends Mixins(ErrorMessages) {

  public ref = this.$refs as Record<any, any>


  public markText($event:Record<any, any>) {
    $event.target.select()
  }


  get lockerStoryBoard(){
    return this.$store.getters.getCollectModeLockerStoryboard;
  }


  public get popperID() {
    return this.$store.getters.getPopperID
  }


  public showPopper(id:string, callback){
    this.$store.commit('setPopper', id);
    setTimeout(function (){
      callback();
    },500)
  }

  public hidePopper(){
    this.$emit('setOpacity', false)
    this.$store.commit('setPopper', '');
  }

  public isElementOverflowingContainer(elementRef:string) {
    this.$emit('isElementOverflowingContainer', this.ref[elementRef][0])
  }

  public copyCollectionLink(ind: number) {
    let toCopy = this.$refs['copylink_' + ind] as Record<any, any>
    if(this.lockerStoryBoard){
      toCopy = toCopy.$el as Record<any, any>
    }
    else {
      toCopy = toCopy[0].$el as Record<any, any>
    }
    toCopy.select()
    try {
      document.execCommand('copy');
      this.hidePopper()
      this.showToast('Shareable link was copied to your clipboard.', 'success');
    } catch (err) {
      this.showToast('Oops, unable to copy.', 'error');
    }
  }

  get getCollections(): Record<any, any> {
    let main_product_id = this.$store.getters.getEditProductId;
    let collections = this.$store.getters.getCollections.map((item: Record<any, any>) => {
      item.collection_products = item.collection_products.map((collection: Record<any, any>) => {
        if (collection.product_locker_room.id == main_product_id) {
          let random = getRandom()
          collection.product_locker_room.product_url = `${collection.product_locker_room.product_url}?${random}`
        }
        return collection
      })
      return item
    })
    return collections
  }

  public async shareCollectionLink(collection:Record<any, any>, index:number, is_index = true){
    try {
      if(collection){
        let collections = {
          id: collection.id,
          file_name: collection.file_name
        }
        let shared_url = "";
        if (collection.shared_url) {
          shared_url += collection.shared_url;
        }
        else {
          let res = await http.post('collection/link', collections)
          shared_url += res.data.url;
          if(this.lockerStoryBoard){
            collection.shared_url = shared_url;
          }
          else{
            if(is_index) {
              Vue.set(this.getCollections[index], 'shared_url', shared_url)
            } else {
              collection.shared_url = shared_url
            }
          }
        }
        this.hidePopper()
        this.showPopper('share-collection'+index, ()=>{this.isElementOverflowingContainer('popper-content'+index)})
      }
    } catch (error) {
      console.log(error)
    }
  }


}



