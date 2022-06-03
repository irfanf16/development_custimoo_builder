/* eslint-disable */
import { Component, Vue } from 'vue-property-decorator'
import {findIndex} from 'lodash';
import {fontsColorsManipulation, fontsList, getRandom, processColorsCustom} from "@/helpers/Helpers";
import {http} from "@/httpCommon";
import {getClosestColor} from "@/pantoneColor";
@Component
export class LockerProducts extends Vue {

  public async editProduct(room_id: number, room_product_id: number, ind: number, share_url="") {
    this.$store.commit('setActiveLockerProduct', ind)
    let self = this;
    let is_customized = this.$store.getters.getCustomized
    let is_personalized = this.$store.getters.getPersonalized
    let lockerIndex: null | number = null;
    let productIndex: null | number = null;
    let locker_product: null | Record<any, any> = null;
    if(room_id) {
      lockerIndex = await findIndex(this.getLockerProducts, {id: room_id});
      productIndex = findIndex(this.getLockerProducts[lockerIndex].product, {id: room_product_id});
      locker_product =  this.getLockerProducts[lockerIndex].product[productIndex];
    }
    let url = "locker/product/detail";
    let data = null;
    if(locker_product) {
      data = {id: locker_product.id}
      // url += `?id=${locker_product.id}`;
    } else {
      data = {share_url: share_url}
      // url += `?share_url=${share_url}`;
    }

    http.get(url, {params: data}).then(async (selected_product_detail) => {
      let prod_res = selected_product_detail;
      let locker_product_type = prod_res.data.product_type;
      locker_product = prod_res.data;
      if(room_id) {
        // @ts-ignore
        Vue.set(this.getLockerProducts[lockerIndex].product, productIndex,  prod_res.data)
      }
      this.$store.commit('UPDATE_ROSTER', JSON.parse(prod_res.data.roster_detail))
      this.$root.$emit('rostershared', '')
      const designId = locker_product?.design_id
      const styleId = locker_product?.style_id
      const product_id = locker_product?.product_id;
      const locker_product_name = locker_product?.product_name;
      this.$store.commit('CHANGE_EDIT_STATUS', {id: locker_product?.id, status: true, designId: designId, styleId: styleId, product_id: product_id, productName: locker_product_name})
      const element = prod_res.data;
      is_customized = locker_product_type == "customized" ? true: is_customized;
      is_personalized = locker_product_type == "personalized" ? true : is_personalized;
      let url = `list/products?customized=${is_customized}&personalized=${is_personalized}&active_product_id=${locker_product?.product_id}`;
      await self.$store.dispatch("updateMainProductsInfo",  {has_more_products: false, next_page: null, active_product_id:locker_product?.product_id});
      http.get(url).then(async (response: Record<any, any>) => {
        await (this as Record<any,any>).handleMainProducts(response);
        let selected_product = this.$store.getters.getSelectedProduct;
        let selectedIndex = selected_product.productstyles.findIndex((x: Record<any, any>) => x.id === element.style_id);
        await this.$store.commit('CHANGE_STYLE_INDEX', selectedIndex);
        let customLogos = this.$store.getters.getCustomLogoObject
        if(!customLogos[element.product_id]) {
          await this.$store.dispatch('setCustomObj', element.product_id)
        }
        await this.$store.dispatch('OVERRIDE_CUSTOM_LOGOS', element);
        await this.$store.dispatch('OVERRIDE_CUSTOM_TEXT', element);
        await this.$store.dispatch('overRideDefaultColors', JSON.parse(element.defaultcolors));
        await this.$store.dispatch('overRideGroupColors', JSON.parse(element.groupcolors));
        selected_product.productstyles[selectedIndex].productdesigns.forEach((item: Record<any, any>) => {
          if (item.id == element.design_id) {
            Vue.set(item, 'design_show', 1)
            this.$store.dispatch('setSelectedProductDesignID', item.id)
          } else {
            Vue.set(item, 'design_show', 0)
          }
        });

        //set logo colors
        let logo_colors = []
        if(!element.colors && element.custom_logos) {
          //fetch from server
          let logos = JSON.parse(element.custom_logos)
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
          logo_colors = JSON.parse(element.colors)
        }
        this.$store.commit('RESET_UNDO');
        this.$store.commit('RESET_REDO');
        await this.$store.dispatch("SET_LOGO_COLORS", logo_colors);
        this.$emit('hideLockerRoomModal')
      }, (error:Record<any, any>) => {
        console.error("Error while retrieving products",error)
      })
      await this.$store.dispatch('setProductType', {prd_type: locker_product_type, value: true});
    }).catch(err => {
      console.error("Error while getting order detail", err)
    })
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
    let self =this;
    let main_products_info = await self.$store.getters.getMainProductsInfo;
    let first_page_url_obj = new URL(response.data.products.first_page_url);
    main_products_info.active_product_id  = first_page_url_obj.searchParams.get("active_product_id");
    let append_products = main_products_info.next_page && main_products_info.next_page > 1;
    if(response.data.products.next_page_url) {
      // let nex_page_url_obj = new URL(response.data.products.next_page_url);
      // main_products_info.active_product_id  = nex_page_url_obj.searchParams.get("active_product_id");
      main_products_info.has_more_products = true;
      main_products_info.next_page = response.data.products.current_page + 1;
    } else {
      main_products_info.has_more_products = false;
    }
    self.$store.dispatch("updateMainProductsInfo", main_products_info);
    let retrieved_products = response.data.products.data;
    let stock_count = response.data.stock_count;
    await this.$store.dispatch('setProductType', {prd_type: 'customized', value: response.data.customized});
    await this.$store.dispatch('setProductType', {prd_type: 'personalized', value: response.data.personalized});
    //let update_order_products_data = response.data.update_order_products_data;
    let update_order_product = response.data.update_order_product;
    if(update_order_product) {
      this.updateOrderItemProducts = response.data.update_order_products_data;
    }
    await this.$store.commit('SET_PRODUCTS', {products: retrieved_products, append_products: append_products});
    await this.$store.dispatch('setSelectedIndex', {selectedIndex:0});
    await this.$store.dispatch('setStockCount',stock_count);
    let selected_product = this.$store.getters.getSelectedProduct;
    let customLogos = this.$store.getters.getCustomLogoObject
    for (const product of retrieved_products) {
      if(!customLogos[product.id]) {
        await this.$store.dispatch('setCustomObj',product.id)
      }
    }
    //set custom text objects for new products
    let customTextObjects = this.$store.getters.getCustomTextObject
    let custom_texts = await this.$store.getters.getCustomTexts();

    retrieved_products.forEach((product:any) => {
      if(!customTextObjects[product.id]) {
        product.productnames.forEach(async (productName: Record<any, any>, index: number) => {
          const obj = fontsColorsManipulation(product)
          //calculate colors pantone on init
          let fill_color_pantone = obj.firstColor.name;
          const pantone = getClosestColor(obj.firstColor.value);
          if(pantone && pantone.pantone && pantone.pantone != 'undefined'){
            fill_color_pantone = pantone.pantone;
          }
          let outLine_color_pantone = obj.secondColor.name;
          const opantone = getClosestColor(obj.secondColor.value);
          if(opantone && opantone.pantone && opantone.pantone != 'undefined'){
            outLine_color_pantone = opantone.pantone;
          }

          const text = {
            text: '',
            type: productName.type,
            width: productName.width,
            height: productName.height,
            x_axis: productName.x_axis,
            y_axis: productName.y_axis,
            rotation: productName.rotation,
            haveControls: Boolean(!productName.is_locked),
            outlineEnabled: Boolean(productName.outline_enabled),
            side: productName.side,
            fontFamily: fontsList(product)[0].value,
            fillColor: obj.firstColor.value,
            fillColorPantone: fill_color_pantone,
            outLineColor: obj.secondColor.value,
            outLineColorPantone: outLine_color_pantone,
            outLineWidth: 0,
            textIndex: index,
            selectColor: false
          }
          await this.$store.dispatch('setCustomTexts', {index: index, text: text,prd_id:product.id})
        })
      }
    });
    this.$store.dispatch('setColorSectionVisibility')
    this.$store.dispatch("getModels", selected_product.product_id);

    this.$root.$emit('sliderEvent');
  }

  public async updateFactoryProduct(factory_product: Record<any, any>) {
    let selected_product = this.$store.getters.getSelectedProduct;
    let selected_product_style_index = selected_product.productstyles.findIndex((x: Record<any, any>) => x.id === factory_product.style_id);
    await this.$store.commit('CHANGE_STYLE_INDEX', selected_product_style_index);
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
}
