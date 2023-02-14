import { Component, Vue } from 'vue-property-decorator'
import {
  getLogoSettingsObject,
  getLogoUpdatedProps,
  hideLockerProductSaveBtn,
  setUndoRedoItems
} from '@/helpers/Helpers'

@Component
export default class CustomLogosMixin extends Vue{
  public addRemoveTeamLogoOnAllProducts(action = 'add', team_logo: Record<any, any> = {}) {
    const custom_logos = this.$store.getters.getCustomLogos('all')
    if(action == 'add') {
      const team_logo_obj = getLogoUpdatedProps(team_logo)
      for(const product_id in custom_logos) {
        const product_team_logo = custom_logos[product_id][0]
        if(product_team_logo) {
          delete product_team_logo.scaleX
          delete product_team_logo.scaleY
          this.$store.commit('SET_CUSTOM_LOGOS', {
            product_id: product_id, logo_index: 0, custom_logos: {...product_team_logo, ...team_logo_obj}
          })
        }
      }
    } else {
      this.$store.commit('REMOVE_TEAM_LOGO')
    }
  }

  public async removeLogo(logo_index) {
    const self: Record<any, any> = this;
    await setUndoRedoItems('customLogos','removed')
    if(logo_index == 0) {
      await this.addRemoveTeamLogoOnAllProducts('remove')
    } else {
      //check if logo setting at given index exists then get that else get logo default object
      let logo_setting_at_index = self.selectedProduct.logos_setting[logo_index] ? self.selectedProduct.logos_setting[logo_index] : {}
      const default_values = {logo_index: logo_index, product_id: self.selectedProduct.id}
      logo_setting_at_index = {...getLogoSettingsObject(), ...logo_setting_at_index, ...default_values}
      this.$store.commit('SET_CUSTOM_LOGOS', {logo_index: logo_index, custom_logos: logo_setting_at_index})
    }
    await self.$store.commit('SET_LOGO_COLORS_INFO', {reset: true});
    await self.$eventBus.$emit("customLogoRemoved", logo_index)
    await self.$eventBus.$emit('handleNonVectorCustomLogosCount')
    hideLockerProductSaveBtn()
  }
}
