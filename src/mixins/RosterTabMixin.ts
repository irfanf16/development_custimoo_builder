import { Component, Mixins } from 'vue-property-decorator'
import {RosterDetailsGlobal} from "@/mixins/LockerProduct";
import {handleProductPriceUpdate} from "@/helpers/Helpers";
import readXlsxFile from "read-excel-file";
import ModalAction from "@/mixins/ModalAction";
import {http} from "@/httpCommon";
import {findIndex} from "lodash";
import ErrorMessages from "@/mixins/ErrorMessages";

@Component
export default class RosterTabMixin extends Mixins(RosterDetailsGlobal, ModalAction, ErrorMessages){
  public show_roster_change_warning = false
  public handle_text_change_timer!: number
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
    let roster_items = JSON.parse(JSON.stringify(this.resetRosterItem(this.productRoster[0], productSizes)));
    let size_index = roster_items.size_index;
    roster_items = [...this.productRoster, roster_items];
    self.$store.dispatch('setProductsRosters', {product_id: self.selectedProduct.id, roster_data: roster_items})
    await this.handleRosterUpdate(size_index, 'size', roster_items.length - 1)
    await handleProductPriceUpdate()
  }

  public async removeRosterItem(roster_item_index: number) {
    this.show_roster_change_warning = true
    this.$store.commit('REMOVE_ROSTER_ITEM', roster_item_index)
    await handleProductPriceUpdate()
  }


  public resetRosterItem(roster_item: Record<any, any>, productSizes:Record<any, any>[]) {
    roster_item = JSON.parse(JSON.stringify(roster_item))
    const lastRosterIndex = this.productRoster.length - 1;
    const lastRosterSize = this.productRoster[lastRosterIndex].size;
    const lastItemSizeIndex = productSizes.findIndex((size) => {
      return size.value === lastRosterSize;
    })
    return Object.assign(roster_item, {
      text: '',  number: '',  size_index: lastItemSizeIndex,  size: lastRosterSize,  code: lastRosterSize, quantity: 1, information: ''
    })
  }

  public async handleRosterUpdate(updated_val:string, type: string, roster_index: number) {
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

  public async downloadTemplate(prod_id:any){
    await http.get(`template/download/${prod_id}`,{
      responseType: 'blob',
    }).then((res) => {
      const blob = new Blob([res.data],{type:res.headers['content-type']})
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = 'product_'+ this.selectedProduct.display_name +'_template.xlsx';
      link.click();
    })
  }

  public getOccurence(val: string) {
    const count = (val.match(/\*/g) || []).length;
    return count
  }

  public async uploadExcelFile($event: Record<any, any>){
    this.showLoader = true
    const files = $event.target.files ? $event.target.files[0] : null;
    const ext = files.name.split('.').pop();
    const updated_roster:Record<any, any>[] = []
    let derived_size_index = -1
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
            this.selectedProduct.sizes[0].json_data.forEach((size_item:Record<any, any>, size_index:number)=>{
              if(size_item.name ==row[2]){
                derived_size_index = size_index
              }
            })
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
              "size_index": derived_size_index,
              "size": row[2],
              "code": row[2],
              "quantity": row[3],
              "information": ""
            }
            updated_roster.push(roster)
          }
        })
       setTimeout(() => {
         this.handleRosterItemFocus(0)
        }, 500)
      }else{
        alert('Please upload the file with valid pattern');
        this.showLoader = false;
      }
      this.$store.dispatch('setProductsRosters', {roster_data: updated_roster, product_id: this.selectedProduct.id});
      handleProductPriceUpdate()
      this.showLoader = false;
      this.showToast('Excel file uploaded successfully', 'success');
      (this.$refs['upload_excel'] as Record<any, any>).reset();
    })
  }
}
