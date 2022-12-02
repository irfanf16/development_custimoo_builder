import {Component, Vue, Watch} from "vue-property-decorator";
import VueRouter from 'vue-router'
import Store from '@/store'
import { exitFromEditMode, getUrlParameter, resetLastActiveProductData } from '@/helpers/Helpers'

@Component
export class ProductColors extends Vue {
  // type expect comma separated values. So in case we want to merge locker colors and logo colors. the the type=locker_colors,logo_colors

  public async productColors(color_types="file_colors,locker_colors") {
    const self: Record<any, any> = this;
    const product_color_files: Record<any, any> = [];
    const selected_product = self.$store.getters.getSelectedProduct;
    const get_color_types: string[] = color_types.split(",");
    get_color_types.forEach((get_color_type: string) => {
      switch (get_color_type) {
        case "file_colors":
          selected_product.colors.forEach((product_color_file: Record<any, any>) => {
            const product_file_colors_data = {
              id: product_color_file.id,
              name: product_color_file.file_name,
              type: "file_colors",
              selected_color_index: null,
              colors: product_color_file.json_data
            }
            product_color_files.push(product_file_colors_data);
          })
          break;
        case "locker_colors":
          self.$store.getters.getLockerColors.map((locker_color: Record<any, any>) => {
            const locker_product_colors_data = {
              id: locker_color.id,
              name: locker_color.name,
              type: "locker_color",
              selected_color_index: null,
              colors: locker_color.color_text
            }
            product_color_files.push(locker_product_colors_data);
          });
          break;
        default:
          console.info(`Un known color type (${get_color_type})`)
      }
    })

    return product_color_files;
  }
}

@Component
export class ProductFonts extends Vue {
  public async productFonts() {
    const self: Record<any, any> = this;
    const product_name_fonts = self.$store.getters.getSelectedProduct.namefonts
    product_name_fonts.forEach((product_name_font: Record<any, any>) => {
      const name_font_data = product_name_font.json_data
      name_font_data.forEach((name_font_datum: Record<any, any>) => {
        self.product_fonts.push({
          label: name_font_datum.name.replace('-', ' ').toUpperCase(),
          value: name_font_datum.name,
          url: process.env.VUE_APP_STORAGE_URL + name_font_datum.path
        })
      })
    })
  }
}

@Component
export class HideUpdateLockerButton extends Vue {
  public async hideLockerProductUpdateButton(hide_update_btn: boolean|undefined = undefined) {
    if(hide_update_btn != undefined) {
      this.$store.commit('SET_HIDE_SAVE_LOCKER_BUTTON', hide_update_btn);
    }
    else {
      const product_edit_info_obj = this.$store.getters.getProductEditInfoObject
      const hide_locker_update_btn = this.$store.getters.getHideSaveLockerButton
      if(product_edit_info_obj.type == 'locker_product' && hide_locker_update_btn == true) {
        this.$store.commit('SET_HIDE_SAVE_LOCKER_BUTTON', false);
      }
      // else {
      //   if(hide_locker_update_btn == false)
      //     this.$store.commit('SET_HIDE_SAVE_LOCKER_BUTTON', true);
      // }
    }
  }
}

@Component
export class FetchCategories extends Vue {
  public async fetchCategories(product_filter: null | string = null, product_id = null) {
    const self: Record<any, any> = this
    return new Promise((resolve,reject) => {
      let categories_promise;
      if(!product_filter){
        const getProductEditInfoObject = this.$store.getters.getProductEditInfoObject;
        const last_active_product_obj = this.$store.getters.getLastActiveProductData;

        const shared_url = getUrlParameter()
        if (shared_url?.includes('share')) {
          categories_promise = this.$store.dispatch('setCategories',{
            query_params:`share_url=${shared_url}`
          });
        } else if(getProductEditInfoObject.editing && !product_id){
          switch(getProductEditInfoObject.type)
          {
            case "locker_product":
              categories_promise = this.$store.dispatch('setCategories',{
                query_params:`product_id=${getProductEditInfoObject.locker_product_info.product_id}`
              });

              break;
            case "cart_product":
              categories_promise = this.$store.dispatch('setCategories',{
                query_params:`product_id=${getProductEditInfoObject.cart_product_info.cart_item_product.product_id}`
              });
              break;
            case "order_product":
              categories_promise = this.$store.dispatch('setCategories',{
                query_params:`product_id=${getProductEditInfoObject.order_product_info.order_products.factory_products[0].product_id}`
              });
          }
        } else{
          if(product_id){
            categories_promise = this.$store.dispatch('setCategories',{
              query_params:`product_id=${product_id}`
            });
          } else if(last_active_product_obj.product_id){
            categories_promise = this.$store.dispatch('setCategories',{
              query_params:`product_id=${last_active_product_obj.product_id}`
            });
          }
          else{
            categories_promise = this.$store.dispatch('setCategories',{
              query_params: `customized=true`
            });
          }
        }
      }
      else{
        let params = `customized=true`;
        if(product_filter === 'customized'){
          params = `customized=true`;
        }
        else if(product_filter === 'personalized'){
          params = `personalized=true`;
        }
        else if(product_filter === 'private_product'){
          params = `private=true`;
        }
        categories_promise = this.$store.dispatch('setCategories',{
          query_params: params
        });
      }
      categories_promise.then((no_product_found) => {
        if(no_product_found) {
          exitFromEditMode();
          resetLastActiveProductData();
          self.showError('Product is no more available, loading all products')
        }
        resolve(true);
      })
    })
  }
}
