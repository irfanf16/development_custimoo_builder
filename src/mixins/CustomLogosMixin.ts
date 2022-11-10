import { Component, Vue } from 'vue-property-decorator'

@Component
export default class CustomLogosMixin extends Vue{
  public addRemoveTeamLogoOnAllProducts(action = 'add', team_logo: Record<any, any> = {}) {
    const custom_logos = this.$store.getters.getCustomLogos('all')
    if(action == 'add') {
      const team_logo_obj = { "id": team_logo.id, "url": team_logo.url, "original_logo": team_logo.original_logo_url,
        "transparent_logo": team_logo.transparent_logo, "smart_transparent_logo": team_logo.smart_transparent_logo,
        "is_smart_transparent": team_logo.is_smart_transparent
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
}
