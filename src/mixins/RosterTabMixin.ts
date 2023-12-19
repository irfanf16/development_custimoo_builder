import { Component, Mixins } from 'vue-property-decorator'
import {RosterDetailsGlobal} from "@/mixins/LockerProduct";
import {handleProductPriceUpdate} from "@/helpers/Helpers";
import readXlsxFile from "read-excel-file";
import ModalAction from "@/mixins/ModalAction";
import {http} from "@/httpCommon";

@Component
export default class RosterTabMixin extends Mixins(RosterDetailsGlobal, ModalAction){
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
      link.download = 'roster_template.xlsx';
      link.click();
    })
  }

  public getOccurence(val: string) {
    const count = (val.match(/\*/g) || []).length;
    return count
  }

  public async uploadExcelFile(event: Record<any, any>){
    this.showLoader = true
    const files = event.target.files ? event.target.files[0] : null;
    const ext = files.name.split('.').pop();
    const updated_roster:Record<any, any>[] = []
    let derived_size_index = -1
    if (ext != 'xlsx'){
      alert("please upload a valid excel file");
      return false
    }
    let check_cols = false;

    readXlsxFile(files).then((rows: any[][]) => {
      check_cols = rows[0][0] == 'NAME ON PRODUCT' && rows[0][1] == 'NUMBER' && rows[0][2] == 'SIZE*' && rows[0][3] == 'QUANTITY*'
      if (rows[0].length != 4){
        alert("Please upload valid file");
        return false
      }else if(rows.length < 2){
        alert("The excel file has no data in it");
        return false
      }else if(check_cols){
        rows.forEach((row:Record<any, any>[], index:number)=>{
          if(index){
            this.selectedProduct.sizes[0].json_data.forEach((size_item:Record<any, any>, size_index:number)=>{
              if(size_item.name ==row[2]){
                derived_size_index = size_index
              }
            })
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
      }else{
        alert('Please upload the file with valid pattern')
      }
      this.$store.dispatch('setProductsRosters', {roster_data: updated_roster, product_id: this.selectedProduct.id});
      handleProductPriceUpdate()
      this.showLoader = false;
      event.target.value = ''
    })
  }
}
