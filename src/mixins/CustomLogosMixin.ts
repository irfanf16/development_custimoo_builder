import { Component, Vue } from 'vue-property-decorator'
import { getLogoSettingsObject } from '@/helpers/Helpers'

@Component
export default class CustomLogosMixin extends Vue{
  public addRemoveTeamLogoOnAllProducts(action = 'add', team_logo: Record<any, any> = {}) {
    const custom_logos = this.$store.getters.getCustomLogos('all')
    if(action == 'add') {
      const team_logo_obj = { "id": team_logo.id, "url": team_logo.url, "original_logo": team_logo.original_logo_url,
        "original_logo_url": team_logo.original_logo_url, "transparent_logo": team_logo.transparent_logo, "smart_transparent_logo": team_logo.smart_transparent_logo,
        "is_smart_transparent": team_logo.is_smart_transparent, is_vector: team_logo.is_vector, logo_name: team_logo.logo_name
      }
      for(const product_id in custom_logos) {
        if(custom_logos[product_id][0]) {
          custom_logos[product_id][0] = {...custom_logos[product_id][0], ...team_logo_obj}
        }
      }
    } else {
      this.$store.commit('REMOVE_TEAM_LOGO')
    }
  }

  public async removeLogo(logo_index) {
    const self: Record<any, any> = this;
    await self.$eventBus.$emit("customLogoRemoved", logo_index)
    if(logo_index == 0) {
      await self.addRemoveTeamLogoOnAllProducts('remove')
    }
    //check if logo setting at given index exists then get that else get logo default object
    let logo_setting_at_index = self.selectedProduct.logos_setting[logo_index] ? self.selectedProduct.logos_setting[logo_index] : {}
    const default_values = {logo_index: logo_index, product_id: self.selectedProduct.id}
    logo_setting_at_index = {...logo_setting_at_index, ...getLogoSettingsObject(), ...default_values}

    self.custom_logos[logo_index] = logo_setting_at_index

    self.$eventBus.$emit('handleNonVectorCustomLogosCount')
  }
}
