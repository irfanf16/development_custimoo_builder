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
} from '@/helpers/Helpers'
import {http} from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";
import ModalAction from "@/mixins/ModalAction";
import {FetchCategories, HideUpdateLockerButton} from '@/mixins/SelectedProductMixin'
import {eventBus} from "@/event/eventBus";

@Component
export class LockerProducts extends Mixins(FetchCategories, ModalAction) {
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
    let product_custom_texts: Record<any, any>[] = active_product.product_custom_texts;
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
        }

        this.$store.commit('CHANGE_STYLE_INDEX', active_style_index);
        await this.$store.dispatch("getSkuInformation", active_product_id);
        await this.$store.dispatch('setSelectedIndex', {selectedIndex: active_product_index, selected_id: active_product_id});
        this.$store.commit('SET_PRODUCTS', {products: retrieved_products});
        let fixed_logo_index = active_product.productstyles[this.styleIndex].logo.findIndex(logo => logo.is_default === 1);
        let last_active_prod_data = self.$store.getters.getLastActiveProductData;
        if(active_product_detail) {
          const { factory_product_active_index, factory_products } = active_product_detail
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

          let {custom_logos, defaultcolors:default_colors, groupcolors:group_colors, product_roster_detail } = active_factory_product
          fixed_logo_index = active_factory_product.fixed_logo_index
         if(product_edit_info_object.type == "cart_product" && active_product_detail.factory_products[0].reorder_data) {
           this.$store.commit('SET_PRODUCT_EDIT_INFO_OBJECT', { cart_product_info : {...product_edit_info_object.cart_product_info, reorder_data : active_product_detail.factory_products[0].reorder_data} })
          }

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
            order_product_info_data.factory_product_active_index = factory_product_active_index
            self.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", { order_product_info: order_product_info_data })

            if(self.order_update_data && self.order_update_data.length > 0 && self.order_update_data[factory_product_active_index]) {
              let order_update_active_product = self.order_update_data[factory_product_active_index]
              custom_logos = order_update_active_product.custom_logos
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

          let customizer_data: Record<any, any> = {
            active_product_id: active_product_id, custom_logos:custom_logos, product_custom_texts:product_custom_texts,
            default_colors:default_colors, group_colors:group_colors, product_roster_detail: product_roster_detail
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
          if(last_active_prod_data.product_id) {
            fixed_logo_index = last_active_prod_data.fixed_logo_index
            let custom_logos = last_active_prod_data.custom_logos;
            let custom_logos_type = custom_logos.constructor.name;
            if(!checkIsEmpty(custom_logos)) {
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
              default_colors: last_active_prod_data.default_colors, product_roster_detail: product_roster_detail})
          }

          let last_active_obj_updated_values = {
            product_index: active_product_index, product_id: active_product_id, fixed_logo_index: fixed_logo_index,
            style_id: active_style_id, style_index: active_style_index, design_index: active_design_index, design_id: active_design_id,
            search_products: self.search_products, customized: this.$store.getters.getCustomized,
            personalized: this.$store.getters.getPersonalized, private_product:this.$store.getters.getPrivateProduct,
            products_rosters: this.$store.getters.getProductRosters('all'), default_colors: last_active_prod_data.default_colors
          }
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
    let {active_product_id, custom_logos, product_custom_texts, default_colors, group_colors, product_roster_detail} = customizer_data
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
    /*
    * is_customized, is_personalized, is_private is always updated as setQueryPArams method is called after fetch categories which sets the values of three variables
    * */
    let is_customized = this.$store.getters.getCustomized;
    let is_personalized = this.$store.getters.getPersonalized;
    let is_private = this.$store.getters.getPrivateProduct;
    let query_params: string[] = await this.handleUrlQueryParams();
    const selected_category = this.$store.getters.getSelectedCategory;
    let edit_product_info_obj = this.$store.getters.getProductEditInfoObject
    if(edit_product_info_obj.editing) {
      const active_product_type = edit_product_info_obj.type;
      if(active_product_type == "order_product") {
        let { order_product_info } = edit_product_info_obj
        // on page refresh load first order product
        if(order_product_info.factory_products.length > 0) {
          let first_factory_product = order_product_info.factory_products[0]
          order_product_info.factory_product_active_index = 0
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
      query_params.push(`customized=${this.$store.getters.getCustomized}`, `personalized=${this.$store.getters.getPersonalized}`, `private=${this.$store.getters.getPrivateProduct}`)
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
        edit_mode_default_obj.cart_product_info.meta_info = {back_to_cart: true}
        this.$store.commit('SET_PRODUCT_EDIT_INFO_OBJECT', edit_mode_default_obj)

      } else {
        query_params.push(`category_id=${selected_category.category_id}`)
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
    let roster = this.$store.getters.getProductRosters();
    if (roster.some(el => (el.quantity > 0 &&  (el.size=="" || el.size == null || parseInt(el.size_index) < 0)  ))) {
      this.showToast(`Please provide size for all roster items`, "error");
      const is_mobile_screen = this.$store.getters.getMobileScreen
      if(!is_mobile_screen){
        this.showVModal('rostermodal');
      }
      return false;
    }
    // check is the sum of roster items(collectively) is greater than sku's 'minimum order quantity'
    if(this.sku_information.minimum_order_quantity_type === "by_design" && this.sku_information.minimum_order_quantity != null &&
      this.sku_information.minimum_order_quantity > 0) {
      let roster_item_sum = 0;
      roster.forEach((item:Record<any, any>) => {
        roster_item_sum += parseInt(item.quantity);
      })
      if(roster_item_sum < this.sku_information.minimum_order_quantity){
        this.showToast(`${this.$t('minimum_order_roster_message',
          {
            product_name: this.$store.getters.getSelectedProduct.display_name,
            min_products_count: this.sku_information.minimum_order_quantity
          })}`, "error", 9000);
        return false;
      }
    }
    return true;
  }

  public async removeShopifyAddonIntoCart(remove_addons_obj) {
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

             await this.removeShopifyAddonIntoCart(remove_addons);
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
  public async updateShopifyAddons(cart_item_index, updated_addon_ids, total_quantity) {
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
      let product_cart_item_quantity = parseInt(product_cart_item.quantity);
      let child_addon_ids = product_cart_item.properties.child_addons;
        let previous_addons_cart_items =  shopify_cart_items.filter((obj) => {
          return child_addon_ids.includes(obj.id)
        }) ;

        remove_addons[product_cart_item.key] = 0;
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
        await this.removeShopifyAddonIntoCart(remove_addons);

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
    http.post(ecom_url, {items : shopify_cart_data}).then((res: any) => {
      let company = this.$store.getters.getCompany;
      self.$store.dispatch('setCartLoading',false);
      if(!collection_view) {
        window.location.replace(company.company_domain + '/cart');
      }
    }).catch(err => {
      http.delete(delete_cart_item_url);
      self.showToast(err, 'ERROR');
      self.$store.dispatch('setCartLoading',false);
    })
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

            else if(platform === 'shopify') {

              let ecom_addon_ids : number[] = [];
              for (const addon of (cart_product as Record<any, any>).addons) {
                ecom_addon_ids.push(parseInt(addon.addon_ecommerce_variant_id));
              }
              let shopify_main_item_data:Record<any, any> = {};
              let x_rand = Math.floor((Math.random() * 100) + 1);

              shopify_main_item_data['quantity'] = total_quantity;
              let delete_cart_item_url = `${process.env.VUE_APP_API_BASE_URL}/api/carts/cart-items/${api_res.new_created_id}/factory_product/${api_res.cart_item_key}`;
              shopify_main_item_data['properties'] = {  // items with underscore are private properties of shopify cart object
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
                'BACK IMAGE': api_res.back_image_short,
                'child_addons' : ecom_addon_ids
              };
              if((cart_product as Record<any, any>).minimum_order_quantity_type == 'by_cart' && (cart_product as Record<any, any>).minimum_order_quantity > 0 ) {
                shopify_main_item_data['properties']['_custimoo_minimum_order_quantity'] = (cart_product as Record<any, any>).minimum_order_quantity;
              }
              ecom_url = company_domain + '/cart/add.js?token='+x_rand
              shopify_main_item_data['id'] = (cart_product as Record<any, any>).ecommerce_variant_id;

              let ecommerce_update_id = (product_edit_info_object.cart_product_info)?product_edit_info_object.cart_product_info.ecommerce_cart_id:null;
              if(ecommerce_update_id) {
                let cart_item_index = product_edit_info_object.cart_product_info.shopify_line_item;
                this.updateShopifyAddons(parseInt(cart_item_index)-1, ecom_addon_ids, total_quantity).then( (res : Record<any, any>) => {
                  let {add_cart_addons} = res;
                  add_cart_addons.push(shopify_main_item_data);
                  this.makeShopifyCartCall(ecom_url,add_cart_addons, collection_view, delete_cart_item_url);
                })

              }else{

                this.addShopifyAddons(ecom_addon_ids, total_quantity).then( (res : Record<any, any>) => {
                 let {add_cart_addons} = res;
                  add_cart_addons.push(shopify_main_item_data);
                  this.makeShopifyCartCall(ecom_url, add_cart_addons, collection_view, delete_cart_item_url);
                })

              }

            }
            else {
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
      }

  }
}




