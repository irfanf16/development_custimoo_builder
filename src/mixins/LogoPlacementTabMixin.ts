import {Component, Mixins, Prop} from "vue-property-decorator";
import {setUndoRedoItems, getLogoSettingsObject, updateLastActiveProductData, handleProductPriceUpdate} from '@/helpers/Helpers';
import CustomLogosMixin from "@/mixins/CustomLogosMixin"
import { processColorsCustom } from "@/helpers/Helpers";

@Component
export class LogoPlacementTabMixin extends Mixins(CustomLogosMixin) {

  /*
  * Life cycle hooks starts
  * */
  async mounted() {
   let self:Record<any, any> = this;
    self.$eventBus.$on('set-logo-tab-index', (logo_tab_index: number) => {
      this.custom_logo_tab_index = logo_tab_index >=0 ? logo_tab_index : 0
    })
    this.$root.$on('changeLogoTabIndex', (index:number) => {
      // here you need to use the arrow function
      this.custom_logo_tab_index = index;
    })
    this.$root.$on('useLockerRoomAssetLogo', async (logo: Record<any, any>) => {
      // here you need to use the arrow function
      const active_tab_logo = this.$store.getters.getCustomLogos(undefined, this.custom_logo_tab_index)
      const updated_logo = {...active_tab_logo, ...logo}
      updated_logo.url = updated_logo.logo_url;
      if (this.custom_logo_tab_index == 0) {
        const logo_colors = processColorsCustom(updated_logo.logo_colors, 4, 'logo_color_type')
        const product_logo_colors = processColorsCustom(updated_logo.logo_colors, 4)
        updated_logo.logo_colors = logo_colors;
        delete updated_logo.scaleX;
        delete updated_logo.scaleY;
        if (updated_logo.logo_colors && updated_logo.logo_colors instanceof Array) {
          this.$store.commit("SET_LOGO_COLORS_INFO", {
            data: { colors: product_logo_colors, extracted_colors: product_logo_colors }
          })
        }
        await this.addRemoveTeamLogoOnAllProducts('add', updated_logo)
      } else {
        this.$store.commit("SET_CUSTOM_LOGOS", {logo_index: this.custom_logo_tab_index, custom_logos: updated_logo})
      }
      self.$eventBus.$emit('handleCustomLogoUpdatedEvent', updated_logo);
      // self.$eventBus.$emit("customLogoResetAndAdd");
    })
  }

  /*
  * Life cycle hooks ends
  * */

  /*
   * props starts
   * */
  @Prop({required: false, default: () => { return [{
      url: '',
      width: 200,
      height: 200,
      x_axis: 250,
      y_axis: 200,
      rotation: 0,
      haveControls: true,
      side: 'front',
      customLogo: true
    }]}}) logosSetting!: [Record<any, any>]

  /*
  * props ends
  * */

  /*
  * data props starts
  * */

  public ref = this.$refs as Record<any, any>

  public selected = 'front'
  public tabIndex = 0
  public options = [
    {value: 'front', text: 'Front'},
    {value: 'back', text: 'Back'}
  ]
  public productColors: any[] = []
  public custom_logo_tab_index = 0
  public expand_logos = true

  /*
  * data props ends
  * */


  /*
  * computed props starts
  * */

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get customLogos() {
    return this.$store.getters.getCustomLogos();
  }

  get logoColors() {
    return this.$store.getters.getLogoColorsInfo('colors')
  }

  get getRecentLogos() {
    return this.$store.getters.getRecentLogos
  }

  /*
  * computed props ends
  * */

  /*
  * methods starts
  * */

  get vectorImageConstraint():boolean{
    return this.$store.getters.getFactorySettings(this.selectedProduct.factory_id)?.vector_image_constraint
  }

  public addLogoTab() {
    const new_logo_index = this.customLogos.length
    //check if logo setting at given index exists then get that else get logo default object
    let logo_setting_at_index = this.selectedProduct.logos_setting[new_logo_index] ? this.selectedProduct.logos_setting[new_logo_index] : {}
    logo_setting_at_index = {...getLogoSettingsObject({product_id: this.selectedProduct.id}), ...logo_setting_at_index}
    logo_setting_at_index.logo_index = new_logo_index
    this.customLogos.push(logo_setting_at_index)
    this.custom_logo_tab_index = new_logo_index
  }

  public async removeLogoTab(logo_index: number) {
    const self: Record<any, any> = this;
    await setUndoRedoItems('customLogos', 'logo_tab_removed')
    const is_logo_last_tab = this.customLogos.length == (logo_index + 1)
    if(is_logo_last_tab) {
      await self.$eventBus.$emit("customLogoRemoved", logo_index)
    }
    this.customLogos.splice(logo_index, 1)
    if(!is_logo_last_tab) {
      //if tab removed is not last then we need to updated logo index
      this.customLogos.forEach((custom_logo: Record<any, any>, customLogoIndex) => {
        custom_logo.logo_index = customLogoIndex
      })
    }
    if(!is_logo_last_tab) {
      self.$eventBus.$emit("customLogoResetAndAdd") // as logo is removed in between so index of logos are changed, just reset and add all logos in canvas
    }
    this.custom_logo_tab_index = logo_index - 1
    self.$eventBus.$emit('handleNonVectorCustomLogosCount')
    await updateLastActiveProductData({ custom_logos: this.$store.getters.getCustomLogos("all")})
  }

  public async handleLogoPlacementChange(updated_value: string, custom_logo_index: number) {
    const self: Record<any, any> = this;
    await setUndoRedoItems('customLogos', 'placement_updated')
    this.customLogos[custom_logo_index].side = updated_value
    this.customLogos[custom_logo_index].x_axis_3d = 0
    this.customLogos[custom_logo_index].y_axis_3d = 0
    this.$store.commit('SET_CUSTOM_LOGOS', {logo_index: custom_logo_index, custom_logos:  this.customLogos[custom_logo_index]})
    self.$eventBus.$emit('handleCustomLogoUpdatedEvent', this.customLogos[custom_logo_index])
  }

  public async handleLogoTechnologyChange(updated_value: string, custom_logo_index: number) {
    const self: Record<any, any> = this;
    await setUndoRedoItems('customLogos', 'placement_updated')
    this.customLogos[custom_logo_index].logo_technology = updated_value;
    this.$store.commit('SET_CUSTOM_LOGOS', {logo_index: custom_logo_index, custom_logos:  this.customLogos[custom_logo_index]})
    self.$eventBus.$emit('handleCustomLogoUpdatedEvent', this.customLogos[custom_logo_index])

    await handleProductPriceUpdate();
  }

  /*
  * methods ends
  * */

}
