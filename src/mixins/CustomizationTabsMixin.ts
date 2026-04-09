import { Component, Vue } from 'vue-property-decorator'
import {default as $} from 'jquery';

@Component
export default class CustomizationTabsMixin extends Vue{
  public fontOptions: Record<any, any>[] = []
  public storageUrl = process.env.VUE_APP_STORAGE_URL
  public fontsColors: any[] = []
  public firstColor!: Record<any, any>
  public secondColor!: Record<any, any>
  public productColors: any[] = []

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }
  get logoColors(): any[] {
    return this.$store.getters.getLogosColors
  }

  public productColorsManipulation() {
    this.productColors = []
    this.selectedProduct.colors.forEach((colors: any, key: number) => {
      const finalColor = {color_text: [], selectedColor: "", name: colors.file_name.substr(0, colors.file_name.indexOf('.'))}
      finalColor.color_text = colors.json_data
      this.productColors = this.productColors.concat(finalColor)
    })
    // if (this.lockerColors.length > 0){
    //   this.productColors = this.productColors.concat(this.lockerColors)
    // }
    if(this.logoColors.length){
      let logoColorsNew: any[] = []
      this.logoColors.forEach((color: any, index: number) => {
        logoColorsNew = logoColorsNew.concat([{name: color.pantone, value: color.hex, position: index+1}])
      })
      const teamLogoColors = [{name: 'Team Logo Colors', color_text: logoColorsNew, selectedColor: ''}]
      this.productColors = this.productColors.concat(teamLogoColors)
    }
  }

  public fontsColorsManipulation() {
    this.selectedProduct.namecolors.forEach((colors: any, key: number) => {
      const finalColor = {color_text: []}
      finalColor.color_text = colors.json_data
      this.fontsColors = this.fontsColors.concat(finalColor)
    })
    if (this.fontsColors.length) {
      this.firstColor = this.fontsColors[0].color_text[0]
      this.secondColor = this.fontsColors[0].color_text? this.fontsColors[0].color_text[1] : this.fontsColors[0].color_text[0]
    }
  }

  public fontsList(): void {
    const productFonts = this.selectedProduct.namefonts
    const shadow_dom = (this.$root as Record<any,any>).$options.shadowRoot;
    if (productFonts.length){
      this.fontOptions = []
      for (let c = 0; c < productFonts.length; c++) {
        const item = productFonts[c].json_data
        if (!item) continue
        item.forEach((fonts: any) => {
          let fontNameParam = fonts.path.split('/').reverse()
          fontNameParam = fontNameParam[0].split('.')
          const fontName = fontNameParam[0].replace('-', ' ').toUpperCase()
          const font = {
            value: fontNameParam[0] as string,
            text: fontName as string
          }
          let hasMatch = false;
          for (let index = 0; index < this.fontOptions.length; ++index) {
            const obj = this.fontOptions[index];
            if(obj.text == font.text){
              hasMatch = true;
              break;
            }
          }
          if (!hasMatch){
            this.fontOptions.push(font)
          }
          const fontUrl = this.storageUrl + fonts.path
          const headElement = document.querySelector('head') as Record<any, any>
          const style_tag = document.createElement('style')
          style_tag.innerHTML = "@font-face{font-family: " + font.value + "; src: url('" + fontUrl + "')}"
          headElement.appendChild(style_tag)
          if (shadow_dom) {
            $(shadow_dom).append('<p id="delete_after_load" style="visibility: hidden; font-family: ' + font.value + '">aa</p>')
            setTimeout(() => {
              $(shadow_dom).find("#delete_after_load").remove()
            }, 100)
          }else {
            $('#santa').append('<p id="delete_after_load" style="visibility: hidden; font-family: ' + font.value + '">aa</p>')
            setTimeout(() => {
              $("#delete_after_load").remove()
            }, 100)
          }
        })
      }
    }
  }
}
