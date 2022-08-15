import {Component, Vue} from "vue-property-decorator";

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
export class SetSelectedProductCustomTexts extends Vue {
  async setSelectedProductCustomTexts() {
    const self: Record<any, any> = this;
    const selected_product = self.$store.getters.getSelectedProduct
    if(selected_product) {
      const selected_product_custom_texts = self.$store.getters.productCustomTexts(selected_product.id)
      if(selected_product_custom_texts) {
        self.product_custom_texts = selected_product_custom_texts;
        // product_custom_text_objects property exists only in scene component. This property contains the custom texts
        // fabric components and also it's contains equal items to custom texts. So if we have 5 custom texts then we
        // initialize this property to 5 null items
        if(self.product_custom_text_objects) {
          self.product_custom_text_objects = Array(selected_product_custom_texts.length).fill(null);
        }
      } else {
        console.error(`product (${selected_product.id}) not found while setting selected product custom texts`)
      }
    } else {
      console.error(`selected product not found while setting selected product custom texts`)
    }
  }
}
