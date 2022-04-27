<template>
  <div>
    <div class="d-flex gap-2">
      <b-button class="d-none d-lg-block" @click="show">Edit Roster</b-button>
      <button class="btn btn-secondary light" v-if="isCustomerAuthenticated" @click="shareRoster">Share roster url</button>
    </div>

    <modal id="modal-scrollable" :width="screenWidth"
           :resizable="true"
           :scrollable="true"
           height="auto"
           :reset="true"
           :shiftY="0"
           name="rostermodal"  title="Roster" class="roster-modal" size="xl"
             footer-class="hide-modal-footer d-none">
      <div class="modal-header d-flex justify-content-between">
        <span class="fs-5 font-weight-bolder">Edit Roster</span>
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hide"><BIconX /></span>
      </div>
      <div class="modal-body">
        <div class="d-flex flex-wrap justify-content-between">
          <RosterDetails :productSizes="sizeOptions" ref="rostermodal" @addPlayer="rosterDetailsInit"/>
          <div class="roster-preview-area">
            <CustomizationPreview :designs="products[designsIndex]"/>
  <!--          <OrderDetails/>-->
          </div>
        </div>
      </div>
    </modal>
    <modal :width="screenWidth"
           :resizable="true"
           :scrollable="true"
           height="auto"
           :reset="true"
           :shiftY="0" name="rosterfilemodal"  content-class="upload-logo-disclaimer roster-msg" id="modal-center-uploadroster" centered  size="lg" title="Upload Team Roster">
      <div class="modal-body">
      <p class="mb-4">The Team Roster can be automatically imported from an excel sheet. Please download and use the excel sheet below. No other excel sheets or documents can be used to import data.</p>
      <div class="roster-template-area">
        <b-button @click="downloadTemplate" class="btn btn-secondary fw-bold">Download Roster Template <a  v-b-tooltip.hover
                                                                                                           title="Enter roster in excel file">
          <font-awesome-icon :icon="['fas', 'info-circle']"/>
        </a></b-button>

        <b-button type="upload" name="Upload Template" @change="onChange" class="btn btn-secondary fw-bold" accept="image/x-png,image/jpeg,pdf">Upload Roster Template
          <b-form-file  class="mb-2"></b-form-file>
          <a href="#" v-b-tooltip.hover title="Upload the template here to populate the roster">
            <font-awesome-icon :icon="['fas', 'info-circle']"/>
          </a></b-button>
      </div>
      </div>
    </modal>

    <div class="d-lg-none">
      <RosterDetails @addPlayer="rosterDetailsInit" :productSizes="productSizes"/>
    </div>
    <div class="team-order-details">
      <OrderDetailsTab @open-add-to-locker="openAddToLocker" ref="order-details"/>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import CustomizationPreview from '@/components/CustomizationPreview.vue'
import OrderDetailsTab from '@/components/OrderDetailsTab.vue'
import RosterDetails from '@/components/RosterDetails.vue'
import {http} from "@/httpCommon";
import readXlsxFile from "read-excel-file";
import Scene from "@/components/Scene.vue"


@Component<EditRosterAreaTab>({
  components: {
    CustomizationPreview,
    OrderDetailsTab,
    RosterDetails,
    Scene
  },
  mounted() {
    this.setProductSizes()
    this.$nextTick(() => {
      if (!this.rosterDetails.length) {
        this.rosterDetailsInit()
      }
    })
  }
})

export default class EditRosterAreaTab extends Vue {
  @Prop({required: true}) productSizes!: any
  private products: any[] = []
  private company_id !: string
  private product_id !: string
  public designsIndex = 0
  public sizeOptions: Record<any, any>[] = []
  public fileData: Record<any, any>[] = []
  public ref = this.$refs as Record<any, any>
  private screenWidth = (window.screen.availWidth - 100)
  public shareRoster(){
    this.ref['order-details'].getLockers();
  }
  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }
  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails
  }
  get customer():Record<any, any>{
    return  this.$store.getters.getCustomer
  }
  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get styleIndex(): number {
    return this.$store.getters.getCurrentStyleIndex;
  }
  get notifications(){
    return this.$store.getters.getNotifications
  }

  public openAddToLocker () {
    this.$emit('open-add-to-locker')
  }

  retrieveProducts(): void {
    this.product_id = '1'
    this.company_id = '1'
    let param = '?product_id=' + this.product_id + '&company_id=' + this.company_id
    http.get(param)
      .then((response: any) => {
        this.products = response.data.products.data;
      })
      .catch((e: any) => {
        console.log(e)
      });
  }
  public show(){
    this.$modal.show('rostermodal')
  }
  public hide(){
    this.$modal.hide('rostermodal')
  }

  public rosterDetailsInit() {
    let payload = {
      text: '',
      number: '',
      size: this.sizeOptions[0].value ? this.sizeOptions[0].value : '',
      size_index: 0,
      code: this.sizeOptions[0].code ? this.sizeOptions[0].code : '',
      quantity: 1,
      information: ''
    }
    this.$store.dispatch('setRosterDetails', {index: this.rosterDetails.length, roster: payload})
  }

  public setProductSizes() {
    this.productSizes.forEach((size: any, key: number) => {
      let sizes = {value: size.name, text: size.name}
      this.sizeOptions = this.sizeOptions.concat([sizes])
    })
  }

  public changeProduct(designsIndex: number) {
    this.designsIndex = designsIndex
  }

  public getOccurence(val: string) {
    let count = (val.match(/\*/g) || []).length;
    return count
  }
  public onChange(event: Record<any, any>){
    let status = true;
    let loopStatus = true;
    let files = event.target.files ? event.target.files[0] : null;
    let ext = files.name.split('.').pop();
    if (ext != 'xlsx'){
      alert("please upload a valid excel file");
      return false
    }
    readXlsxFile(files).then((rows: any[][]) => {
      if (rows[0].length != 8){
        alert("please upload valid file")
        return false
      }
      for (let i in rows[0]){
        if (i == '3'){
          let count = this.getOccurence(rows[0][i]);
          if (count != 1 || rows[0][i] != "2. SIZE*"){
            status = false
            break;
          }
        }
        if (i == '4'){
          let count = this.getOccurence(rows[0][i]);
          if (count != 2 || rows[0][i] != "3. NAME ON PRODUCT**"){
            status = false
            break;
          }
        }
        if (i == '6'){
          let count = this.getOccurence(rows[0][i]);
          if (count != 3 || rows[0][i] != "OTHER INFORMATION***"){
            status = false
            break;
          }
        }
      }
      if (status) {
        for (let row in rows){
          let obj = {
            text: '',
            number: '',
            size: '',
            quantity: 1,
            information: ''
          };
          if (row == '0'){
            continue
          }
          let objStatus = false;
          for (let i in rows[row]) {
            if (rows[row][2] && this.selectedProduct.product_name == rows[row][2]) {
              objStatus = true
              if (i == '3') {
                obj.size = rows[row][i];
              }
              if (i == '4') {
                obj.text = rows[row][i];
              }
              if (i == '5') {
                obj.number = rows[row][i];
              }
              if (i == '6') {
                obj.information = rows[row][i];
              }
            }
            if (loopStatus == false) {
              break
            }
          }
          if (objStatus) {
            this.fileData.push(obj);
          }
        }
        if (loopStatus == true){
          console.log(loopStatus)
          this.$store.dispatch('updateRoster', this.fileData);
          this.$modal.hide('rosterfilemodal');
        }else{
          alert('Size is missing');
          this.$modal.hide('rosterfilemodal');
        }
      }else{
        alert("please upload a valid file");
      }
    })
  }
  public async downloadTemplate(){
    await http.get('template/download',{
      responseType: 'blob',
    }).then((res) => {
      let blob = new Blob([res.data],{type:res.headers['content-type']})
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = 'roster_template.xlsx';
      link.click();
    })
  }


}

</script>

<style lang="scss" scoped>
.roster-upload-area{
  overflow: hidden;
  margin: 0 0 15px;
  padding: 0;
  h3{
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 10px;
  }
  .btn{
    margin: 0 0 10px;
    svg{
      fill: #fff;
      color: #fff;
    }
    &:hover{
      svg{
        fill: #219f84;
        color: #219f84;
      }
    }
  }
}
.roster-template-area{
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  .btn-secondary{
    font-size: 14px;
    color: #219F84;
    background: #E7F4F1;
    font-weight: 500;
    flex: 0 0 48%;
    max-width: 48%;
    border-color: #E7F4F1;
    transition: all 0.3s ease;
    position: relative;
    &:hover{
      background: #219f84;
      color: #fff;
      a{color: #fff;}
    }
    .custom-file{
      position: absolute;
      right: 22%;
      left: 0;
      top: 0;
      bottom: 0;
      opacity: 0;
      margin: 0;
      width: auto;
    }
    a {
      color: #219f84;
      margin: 0 0 0 3px;
      position: relative;
      z-index: 9;

      &:hover {
        color: #fff;
      }
    }
  }
}
</style>
