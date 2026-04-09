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
  /** Per custom-text row index: font dropdown options for that row's container. */
  public product_fonts_by_text: Record<any, any>[][] = []

  // get selectedProductId(): Record<any, any> {
  //   return this.$store.getters.getSelectedProductId
  // }

// public async productFonts(selectedFont?: string) {
//   console.log('This is Selected Here', selectedFont)
//   const self: Record<any, any> = this;
//     console.log('productFont method called, selectedProduct:', self.$store.getters.getSelectedProduct);

//     const product_name_fonts = self.$store.getters.getSelectedProduct.namefonts;
    
//     // Use this product's previously selected font when switching back, else first font
//     if (!selectedFont && product_name_fonts.length > 0) {
      
//       const savedForProduct = self.$store.getters.getSelectedFontForCurrentProduct;
//       const exists = savedForProduct && product_name_fonts.some((f: Record<any, any>) => f.file_name === savedForProduct);
//       selectedFont = exists ? savedForProduct : product_name_fonts[0].file_name;
//     }
    
//     self.product_fonts = product_name_fonts
//     .filter((font: Record<any, any>) => font.file_name === selectedFont)
//     .flatMap((font: Record<any, any>) => font.json_data)
//     .map((font: Record<any, any>) => ({
//       label: font.name.replace('-', ' ').toUpperCase(),
//       value: font.name,
//       url: process.env.VUE_APP_STORAGE_URL + font.path
//     }));
//     this.$store.commit('SET_SELECTED_FONT', { selectedFont: selectedFont })

// }
public async productFonts(customTextIndex?: number, selectedFont?: string) {
  const self: Record<any, any> = this;

  const product_name_fonts = self.$store.getters.getSelectedProduct.namefonts;

  const list = product_name_fonts
    .filter((font: Record<any, any>) => font.file_name === selectedFont)
    .flatMap((font: Record<any, any>) => font.json_data)
    .map((font: Record<any, any>) => ({
      label: font.name.replace('-', ' ').toUpperCase(),
      value: font.name,
      url: process.env.VUE_APP_STORAGE_URL + font.path
    }));

  if (typeof customTextIndex === 'number') {
    self.$set(self.product_fonts_by_text, customTextIndex, list);
  }
  // Legacy: mobile / callers without a row index still use the single list
  if (customTextIndex === undefined) {
    self.product_fonts = list;
  }
}
  public async productFont() {
    const self: Record<any, any> = this;
    self.product_font_dropdown = [];
    const product_name_fonts_dropdown = self.$store.getters.getSelectedProduct.namefonts;
    product_name_fonts_dropdown.forEach((product_name_font: Record<any, any>) => {
      self.product_font_dropdown.push({
        text: product_name_font.file_name,
        value: product_name_font.file_name,
        json_data: product_name_font.json_data
      });
    });
    
    
    // const savedForProduct = self.$store.getters.getSelectedFontForCurrentProduct;
    // const exists = savedForProduct && self.product_font_dropdown.some((f: Record<any, any>) => f.value === savedForProduct);
    // self.selected_font_family = exists ? savedForProduct : (self.product_font_dropdown.length > 0 ? self.product_font_dropdown[0].value : '');


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
    }
  }
}

@Component
export class FetchCategories extends Vue {
  public async fetchCategories(product_filter: null | string = null, product_id = null) {
    const self: Record<any, any> = this
    return new Promise((resolve,reject) => {
      let categories_promise;
      const query_params_obj = self.$route.query
      if(!product_filter){
        const getProductEditInfoObject = this.$store.getters.getProductEditInfoObject;
        const last_active_product_obj = this.$store.getters.getLastActiveProductData;
        const {sync_id} = self.$route.query
        const url_query_string = getUrlParameter()
        const url_query_object = new URLSearchParams((url_query_string as string))
        if (url_query_string?.includes('share')) {
          categories_promise = this.$store.dispatch('setCategories',{
            query_params:`share_url=${encodeURIComponent((url_query_string as string))}`
          });
        }
        else if(url_query_string?.includes('is_reorder') && url_query_object.get('active_product_id')) {
          categories_promise = this.$store.dispatch('setCategories',{
            query_params:`product_id=`+url_query_object.get('active_product_id')
          });
        }
        else if(getProductEditInfoObject.editing && !product_id){
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
            {
              let active_product_id = '';
              if(query_params_obj.active_product_id) {
                active_product_id = query_params_obj.active_product_id
              } else {
                active_product_id = getProductEditInfoObject.order_product_info.active_product_id
              }
              categories_promise = this.$store.dispatch('setCategories',{
                query_params:`product_id=${active_product_id}`
              });
            }
            break;
            case "reorder_product":
              categories_promise = this.$store.dispatch('setCategories',{
                query_params:`product_id=${getProductEditInfoObject.reorder_product_info.active_product_id}`
              });
              break;
          }
        } else{
          if(sync_id) {
            categories_promise = this.$store.dispatch('setCategories',{
              query_params: `sync_id=${sync_id}`
            });
          }
          else if(product_id) {
            categories_promise = this.$store.dispatch('setCategories',{
              query_params:`product_id=${product_id}`
            });
          }
          else if(last_active_product_obj.product_id) {
            categories_promise = this.$store.dispatch('setCategories',{
              query_params:`product_id=${last_active_product_obj.product_id}`
            });
          }
          else {
              categories_promise = this.$store.dispatch('setCategories',{
                query_params: `customized=true`
              });
           }
        }
      }
      else{
        let params;
        if(product_filter === 'customized'){
          params = `customized=true`;
        }
        else if(product_filter === 'personalized'){
          params = `personalized=true`;
        }
        else if(product_filter === 'private_product'){
          params = `private=true`;
        } else {
          params = product_filter
        }
        categories_promise = this.$store.dispatch('setCategories',{
          query_params: params
        });
      }
      categories_promise.then((cat_response: Record<any, any>) => {
        if(cat_response.no_product_found) {
          self.showError('Product is no more available')
        }
        if('customized' in cat_response) {
          this.$store.commit('SET_PRODUCT_TYPE',{prd_type: 'customized', value: cat_response.customized})
        }
        if('personalized' in cat_response) {
          this.$store.commit('SET_PRODUCT_TYPE',{prd_type: 'personalized', value: cat_response.personalized})
        }
        if('private_product' in cat_response) {
          this.$store.commit('SET_PRODUCT_TYPE',{prd_type: 'private_product', value: cat_response.private_product})
        }
        resolve(cat_response);
      })
    })
  }
}
