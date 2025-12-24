import { Component, Mixins } from 'vue-property-decorator'
import {RosterDetailsGlobal} from "@/mixins/LockerProduct";
import {handleProductPriceUpdate, isEcommercePlatform} from "@/helpers/Helpers";
import readXlsxFile from "read-excel-file";
import ModalAction from "@/mixins/ModalAction";
import {http} from "@/httpCommon";
import {findIndex} from "lodash";
import ErrorMessages from "@/mixins/ErrorMessages";

@Component
export default class RosterTabMixin extends Mixins(RosterDetailsGlobal, ModalAction, ErrorMessages){
  public show_roster_change_warning = false
  public handle_text_change_timer!: any
  public fileData: Record<any, any>[] = []
  public showLoader = false;

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getProductRosters()
  }

  get getProductEditInfoObject() {
    return this.$store.getters.getProductEditInfoObject;
  }

  public addPlayer(obj: Record<any, any>) {
    this.$emit('addPlayer', this.rosterDetails.length);
  }

  public async syncRosterWithCustomText(type: string, text_number_value: string) {
    const self: Record<any, any> = this;
    const product_custom_texts = self.$store.getters.selectedProductCustomTexts;
    const custom_name_index = findIndex(product_custom_texts, { type: 'name' });
    const custom_number_index = findIndex(product_custom_texts, { type: 'number' });
    const custom_name_number_index = type == 'name' ? custom_name_index : custom_number_index;
    //The custom text first item of type name or number depending upon type is synced with the first row input with label name or number.
    if(custom_name_number_index >= 0) {
      const custom_text_synced_with_roster = JSON.parse(JSON.stringify(product_custom_texts[custom_name_number_index]));
      custom_text_synced_with_roster.value = text_number_value
      self.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", { index: custom_name_number_index, value: custom_text_synced_with_roster})
      self.$eventBus.$emit("rosterTextUpdated", {
        emitter: "input", custom_text_index: custom_name_number_index, value: custom_text_synced_with_roster
      });
    }
  }

  public async addRosterItem(productSizes:Record<any, any>[]) {
    const self: Record<any, any> = this;
    this.show_roster_change_warning = true
    let roster_items = JSON.parse(JSON.stringify(this.resetRosterItem(this.productRoster[0])));
    roster_items = [...this.productRoster, roster_items];
    self.$store.dispatch('setProductsRosters', {product_id: this.selectedProduct.id, roster_data: roster_items})
    await this.handleRosterUpdate(roster_items[roster_items.length - 1].size, 'size', roster_items.length - 1)
    await handleProductPriceUpdate()
  }

  public async removeRosterItem(roster_item_index: number) {
    this.show_roster_change_warning = true
    this.$store.commit('REMOVE_ROSTER_ITEM', roster_item_index)
    await handleProductPriceUpdate()
  }

  public resetRosterItem(roster_item: Record<any, any>) {
    roster_item = JSON.parse(JSON.stringify(roster_item))
    const lastRosterIndex = this.productRoster.length - 1;
    const lastRosterSize = this.productRoster[lastRosterIndex].size;
    return Object.assign(roster_item, {
      text: '',  number: '', size: lastRosterSize, quantity: 1, information: ''
    })
  }

  public async handleRosterUpdate(updated_val: number, type: string, roster_index: number) {
    if(this.getProductEditInfoObject.editing && this.getProductEditInfoObject.type == 'locker_product'){
      this.$store.commit('SET_HIDE_SAVE_LOCKER_BUTTON', false)
    }else{
      this.$store.commit('SET_HIDE_SAVE_LOCKER_BUTTON', true)
    }

    const self: Record<any, any> = this;
    this.show_roster_change_warning = true
    const roster_updated_key = type == 'name' ? 'text' : type;
    const product_id = self.selectedProduct.id;
    const roster_data = {
      [roster_updated_key] : updated_val
    }
    self.$store.dispatch('setProductsRosters', {product_id: product_id, roster_index: roster_index, roster_data: roster_data})
    if(type == "quantity" || (type == 'size' && isEcommercePlatform() && this.selectedProduct.ecommerceproduct[0].size_variants)) {
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

  public getOccurence(val: string) {
    const count = (val.match(/\*/g) || []).length;
    return count
  }

  public async uploadExcelFile($event: Record<any, any>, from_locker = false,  product: Record<string, any> | null = null){
    this.showLoader = true
    const files = $event.target.files ? $event.target.files[0] : null;
    const ext = files.name.split('.').pop();
    const updated_roster:Record<any, any>[] = []
    if (ext != 'xlsx'){
      alert("The Excel file that was uploaded cannot be read, or it does not adhere to the template format. Please download the Excel template located next to the upload field, input your data there, and then attempt the upload again.");
      this.showLoader = false;
      return false
    }
    let check_cols = false;

    readXlsxFile(files).then((rows: any[][]) => {
      check_cols = rows[0][0] == 'NAME ON PRODUCT' && rows[0][1] == 'NUMBER' && rows[0][2] == 'SIZE*' && rows[0][3] == 'QUANTITY*'
      if (rows[0].length != 4){
        alert("The Excel file that was uploaded cannot be read, or it does not adhere to the template format. Please download the Excel template located next to the upload field, input your data there, and then attempt the upload again.");
        this.showLoader = false;
        return false
      }else if(rows.length < 2){
        alert("The excel file has no data in it");
        this.showLoader = false;
        return false
      }else if(check_cols){
        rows.forEach((row: any[], index:number)=>{
          if(index){
            const typeof_number = typeof row[1];
            if(typeof_number === "number") {
              row[1] = row[1].toString();
            }
            //object type means the value is null
            if(typeof_number === "object") {
              row[1] = '';
            }
            if(row[1].constructor.name == "Number") {
              row[1] = row[1].toString()
            }
            const roster:any = {
              "text": row[0],
              "number": row[1],
              "size": row[2],
              "quantity": row[3],
              "information": ""
            }
            updated_roster.push(roster)
          }
        })
        if(!product){
          setTimeout(() => {
            this.handleRosterItemFocus(0)
          }, 500)
        }
      }else{
        alert('Please upload the file with valid pattern');
        this.showLoader = false;
      }
      if(product) {
        this.$store.commit("SET_SHOP_PRODUCTS_ROSTERS_UPDATE", {
          productId: product.id,
          roster: [],
        });
        const rosters = updated_roster.map((roster)=>{
          const ind = product.sizes.findIndex(s => s.name === roster.size);
          return {
            text: roster.text,
            number: roster.number,
            size: roster.size,
            code: roster.size,
            quantity: roster.quantity > 0  ? roster.quantity : 1,
            size_index:  ind >= 0 ? ind : 0,
            information: null
          }
        })
        this.$store.commit("SET_SHOP_PRODUCTS_ROSTERS_UPDATE", {
          productId: product.id,
          roster: rosters,
        });
        return true
      } else {
        if(from_locker) {
          // @ts-ignore this variable is available in EditRosterDetails
          this.product_locker_roster = updated_roster
          // @ts-ignore this function is available in EditRosterDetails
          this.fixRosterSizes()
        } else {
          this.$store.dispatch('setProductsRosters', {roster_data: updated_roster, product_id: this.selectedProduct.id});
        }
      }


      handleProductPriceUpdate()
      this.showLoader = false;
      this.showToast('Excel file uploaded successfully', 'success');
      const input = this.$refs.excelInput as HTMLInputElement;
      if (input) {
        input.value = '';
      }
      (this.$refs['upload_excel'] as Record<any, any>).reset();
    })
  }
}
