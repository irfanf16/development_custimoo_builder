import { Component, Mixins } from 'vue-property-decorator'
import {RosterDetailsGlobal} from "@/mixins/LockerProduct";
import {handleProductPriceUpdate} from "@/helpers/Helpers";

@Component
export default class RosterTabMixin extends Mixins(RosterDetailsGlobal){
  public show_roster_change_warning = false
  public handle_text_change_timer!: number

  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getProductRosters()
  }

  public addPlayer(obj: Record<any, any>) {
    this.$emit('addPlayer', this.rosterDetails.length);
  }

  public async addRosterItem() {
    const self: Record<any, any> = this;
    this.show_roster_change_warning = true
    let roster_items = JSON.parse(JSON.stringify(this.resetRosterItem(this.productRoster[0])));
    roster_items = [...this.productRoster, roster_items];
    self.$store.dispatch('setProductsRosters', {product_id: self.selectedProduct.id, roster_data: roster_items})
    await this.handleRosterUpdate('0', 'size', roster_items.length - 1)
    await handleProductPriceUpdate()
  }

  public async removeRosterItem(roster_item_index: number) {
    this.show_roster_change_warning = true
    this.$store.commit('REMOVE_ROSTER_ITEM', roster_item_index)
    await handleProductPriceUpdate()
  }

  public resetRosterItem(roster_item: Record<any, any>, productSizes?:Record<any, any>[]) {
    roster_item = JSON.parse(JSON.stringify(roster_item))
    const first_size = productSizes && productSizes[0].value;
    return Object.assign(roster_item, {
      text: '',  number: '',  size_index: 0,  size: first_size,  code: first_size, quantity: 1, information: ''
    })
  }

  public async handleRosterUpdate(updated_val:string, type: string, roster_index: number) {
    const self: Record<any, any> = this;
    this.show_roster_change_warning = true
    const roster_updated_key = type == 'name' ? 'text' : type;
    const product_id = self.selectedProduct.id;
    const roster_data = {
      [roster_updated_key] : updated_val
    }
    if(type == 'size') {
      // in case of type size the updated value will have selected size index
      const selected_size = self.productSizes[updated_val]
      roster_data['size_index'] = updated_val
      roster_data['size'] = selected_size.value
      roster_data['code'] = selected_size.value
    }
    self.$store.dispatch('setProductsRosters', {product_id: product_id, roster_index: roster_index, roster_data: roster_data})
    if(type == "quantity") {
      await handleProductPriceUpdate()
    }
    //The custom text first item of type name and numbers are synced with the first row (name and number) of the roster.
    if(['name', 'number'].includes(type)) {
      clearTimeout (this.handle_text_change_timer);
      this.handle_text_change_timer = setTimeout(() => {
        self.syncRosterWithCustomText(type, updated_val)
      }, 300)
    }
  }
}
