import {Component, Vue, Watch} from "vue-property-decorator";

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
  public async hideLockerProductUpdateButton(hide_update_btn = undefined) {
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
