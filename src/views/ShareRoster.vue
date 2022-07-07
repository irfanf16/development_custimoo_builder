<template>
  <!--  <div>-->
  <!--    <b-button class="d-none d-lg-block" v-b-modal.modal-scrollable>Edit Roster</b-button>-->

  <!--    <b-modal id="modal-scrollable" scrollable title="Roster" content-class="roster-modal" size="xl"-->
  <!--             footer-class="hide-modal-footer d-none">-->
  <!--      <div class="d-flex flex-wrap justify-content-between">-->
  <!--        <RosterDetails :productSizes="sizeOptions" @addPlayer="rosterDetailsInit"/>-->
  <!--        <div class="roster-preview-area">-->
  <!--          <CustomizationPreview :designs="products[designsIndex]"/>-->
  <!--          <OrderDetails/>-->
  <!--        </div>-->
  <!--      </div>-->
  <!--    </b-modal>-->
  <!--    <b-modal ref="myModal" content-class="upload-logo-disclaimer roster-msg" id="modal-center-uploadroster" centered scrollable size="lg" title="Upload Team Roster">-->
  <!--      <p class="mb-4">The Team Roster can be automatically imported from an excel sheet. Please download and use the excel sheet below. No other excel sheets or documents can be used to import data.</p>-->
  <!--      <div class="roster-template-area">-->
  <!--        <b-button @click="downloadTemplate" class="btn btn-secondary fw-bold">Download Roster Template <a  v-b-tooltip.hover-->
  <!--                                                                                                           title="Enter roster in excel file">-->
  <!--          <font-awesome-icon :icon="['fas', 'info-circle']"/>-->
  <!--        </a></b-button>-->

  <!--        <b-button type="upload" name="Upload Template" @change="onChange" class="btn btn-secondary fw-bold" accept="image/x-png,image/jpeg,pdf">Upload Roster Template-->
  <!--          <b-form-file  class="mb-2"></b-form-file>-->
  <!--          <a href="#" v-b-tooltip.hover title="Upload the template here to populate the roster">-->
  <!--            <font-awesome-icon :icon="['fas', 'info-circle']"/>-->
  <!--          </a></b-button>-->
  <!--      </div>-->
  <!--    </b-modal>-->

  <!--    <div class="d-lg-none">-->
  <!--      <RosterDetails @addPlayer="rosterDetailsInit" :productSizes="productSizes"/>-->
  <!--    </div>-->
  <!--    <div class="team-order-details">-->
  <!--      <OrderDetails/>-->
  <!--    </div>-->
  <!--  </div>-->

  <div class="p-3 d-flex gap-3">
    <div class="d-flex flex-column align-items-center">
      <div class="d-flex align-items-center justify-content-center gap-2">
        <img style="max-height: 300px" :src="frontImage" alt="">
        <img style="max-height: 300px" :src="backImage" alt="">
      </div>

      <div class="mt-3 text-left">
        <div class="fs-3 font-weight-bold">Import {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}} from Excel sheet</div>
        <span class="btn btn-secondary light position-relative mt-2" v-b-modal.modal-center-uploadroster style="padding-left: 30px"><span style="left: 10px" class="fs-3 icon position-absolute"><BIconFileEarmarkExcelFill /></span>
          <span class="d-inline-block ml-1">
            Upload / Download {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}} Template
          </span>
        </span>
      </div>
    </div>
    <div class="players-data pt-4">
      <div class="fs-3 font-weight-bold text-left">Insert details manually below</div>
      <b-button @click="homeScreen" variant="outline-secondary">Back to Design</b-button>
      <div class="d-flex flex-column h-100">
        <RosterTable  :productId="id" :productSizes="sizeOptions" :roasterUrl="roasterUrl" :rosterDetails="custom_arr" @addPlayer="rosterDetailsInit"/>
        <!--        <RosterTable @addPlayer="rosterDetailsInit" :productSizes="productSizes"/>-->
      </div>
    </div>

    <b-modal ref="myModal" content-class="upload-logo-disclaimer roster-msg" id="modal-center-uploadroster" centered scrollable size="lg" title="Upload Team Roster">
      <p class="mb-4">The Team Roster can be automatically imported from an excel sheet. Please download and use the excel sheet below. No other excel sheets or documents can be used to import data.</p>
      <div class="roster-template-area">
        <b-button @click="downloadTemplate" class="btn btn-secondary fw-bold">Download Roster Template <a  v-b-tooltip.hover
                                                                                                           title="Enter roster in excel file">
          <font-awesome-icon :icon="['fas', 'info-circle']"/>
        </a></b-button>

        <b-button type="upload" name="Upload Template" @change="onChange" class="btn btn-secondary fw-bold" accept="image/x-png,image/jpeg,pdf">
          Upload {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}} Template
          <b-form-file  class="mb-2"></b-form-file>
          <a href="#" v-b-tooltip.hover title="Upload the template here to populate the roster">
            <font-awesome-icon :icon="['fas', 'info-circle']"/>
          </a></b-button>
      </div>
    </b-modal>
    <div class="loader global" v-if="showLoader"><img src="../../src/assets/images/loading.gif" /></div>

  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop, Vue} from 'vue-property-decorator'
import CustomizationPreview from '@/components/CustomizationPreview.vue'
import OrderDetails from '@/components/OrderDetails.vue'
import {http} from "@/httpCommon";
import readXlsxFile from "read-excel-file";
import Scene from "@/components/Scene.vue"
import RosterTable from "@/components/RosterTable.vue";
import ErrorMessages from "@/mixins/ErrorMessages";


@Component<ShareRoster >({
  components: {
    RosterTable,
    CustomizationPreview,
    OrderDetails,
    Scene
  },
  async mounted() {
    if (this.$route.params.urlstring) {
      this.showLoader = true
      let url = 'shareRoster/' + this.$route.params.urlstring
      this.roasterUrl = url
      let res = await this.$store.dispatch('getShareProductDetails', url)
      if (res.status ==200){
        this.custom_arr = JSON.parse(res.data.roster_detail)? JSON.parse(res.data.roster_detail) : []
        if (res.data.sizes.length){
          this.productSizes = JSON.parse(res.data.sizes[0].json_data)
        }
        this.id = res.data.id
        this.frontImage = res.data.product_front_url
        this.backImage  = res.data.product_back_url
        this.productName = res.data.product_name
        this.showLoader = false
      }else if(res.status == 404){
        this.showLoader = false
        this.$router.push('/')
      }
    }
    this.setProductSizes()
  }
})

export default class ShareRoster extends Mixins(ErrorMessages) {
  public id = 0
  public custom_arr: Record<any, any>[] = [];
  public productSizes : any[] = []
  public sizeOptions: Record<any, any>[] = []
  public fileData: Record<any, any>[] = []
  public ref = this.$refs as Record<any, any>
  private activeEye = -1;
  public frontImage = ''
  public backImage = ''
  public productName = ''
  public roasterUrl = ''
  public showLoader = false

  private setActiveEye(index:number){
    if (this.activeEye == index){
      this.activeEye = -1
    }else{
      this.activeEye = index;
    }
  }
  public rosterDetailsInit() {
    let payload = {
      text: '',
      number: '',
      size: this.sizeOptions[0].value ? this.sizeOptions[0].value : '',
      quantity: 1,
      information: ''
    }
    this.custom_arr.push(payload)
  }
  get company(){
    return this.$store.getters.getCompany
  }

  public setProductSizes() {
    this.productSizes.forEach((size: any, key: number) => {
      let sizes = {value: size.name, text: size.name}
      this.sizeOptions = this.sizeOptions.concat([sizes])
    })
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
            console.log(rows[row])
            if (rows[row][2] && this.productName == rows[row][2]) {
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
          this.custom_arr = this.fileData
          this.ref['myModal'].hide();
        }else{
          alert('Size is missing');
          this.ref['myModal'].hide();
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
  public homeScreen(){
    this.$router.push('/')
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

.activeEye{
  background: #189076;
  color: #fff;
}

.players-data {
  width: 100%;
  .addPlayer{
    font-size: 16px;
  }
  .table tr td{
    vertical-align: middle;

    input, select{
      width: 100%;
      border: none;
      background: transparent;
      outline: none;
    }
  }
}
</style>
