<template>
  <div class="roster-section">
    <div class="d-none d-md-block roster-upload-area">
      <template v-if="company.platform != 'cdnExceptLogin' && company.platform != 'wordpress'">
      <h3>Import Roster from Excel sheet</h3>
      <b-button  v-b-modal.modal-center-uploadroster class="btn btn-secondary fw-bold">Download/Upload {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}} Template <a href="#" v-b-tooltip.hover
                                                                                  title="Import roster details from excel sheet">
              <font-awesome-icon :icon="['fas', 'info-circle']"/>
            </a></b-button>
      <p>Or insert details manually below</p>
      </template>
    </div>
    <table class="table table-bordered table-striped roster-data" style="table-layout: fixed">
      <thead>
        <tr>
          <template  v-if="selectedProduct.allow_name_number">
            <th v-if="custom_name_index != -1 || custom_number_index != -1" style="width: 9%;"></th>
            <th v-if="custom_name_index != -1" style="width: 40%">Name</th>
            <th v-if="custom_number_index != -1" style="width: 14%;">No</th>
          </template>
          <th style="width: 18%;">Size</th>
          <th style="width: 10%;">Qty</th>
          <th style="width: 9%;"></th>
        </tr>
      </thead>
      <tbody>
      <template v-for="(roster, index) in rosterDetails" >
        <tr :key="index">
          <template v-if="selectedProduct.allow_name_number">
            <td @click="handleRosterItemFocus(index)" v-if="custom_name_index != -1 || custom_number_index != -1" style="width: 10%; text-align: center" :class="{'activeEye': active_roster_index == index}"><BIconEye /></td>
            <td v-if="custom_name_index != -1" style="width: 50%">
<!--              <b-form-input @focus="editRosterPlayer(index)"-->
<!--                class="text-center" ref="myInputs"-->
<!--                v-model="roster.text" />-->
              <b-form-input :value="roster.text" @input="handleRosterUpdate($event, 'name', index)"
                            @focus="handleRosterItemFocus(index)" ref="myInputs"
              ></b-form-input>
            </td>
            <td v-if="custom_number_index != -1" style="width: 10%; text-align: center">
              <b-form-input :value="roster.number" @input="handleRosterUpdate($event, 'number', index)"
                            @focus="handleRosterItemFocus(index)" ref="myInputs" type="number"
              ></b-form-input>
<!--              <b-form-input @focus="editRosterPlayer(index)"-->
<!--                class="text-center" ref="myInputs" type="number"-->
<!--                v-model="roster.number" />-->
            </td>
          </template>
          <td style="width: 10%; text-align: center">
            <b-form-select @focus="handleRosterItemFocus(index)"
                           @change="handleRosterUpdate($event, 'size', index)"
                           :value="roster.size_index" ref="myInputs"
            >
              <b-form-select-option v-for="(productSize, psIdx) in productSizes" :key="psIdx" :value="psIdx">
                {{ productSize.text }}</b-form-select-option>
            </b-form-select>
<!--            <b-form-select ref="myInputs" @input="updateRosterSize($event, roster)" v-model="roster.size_index">-->
<!--              <b-form-select-option v-for="(productSize, psIdx) in productSizes" :key="psIdx" :value="psIdx" >{{productSize.name}}</b-form-select-option>-->
<!--            </b-form-select>-->
          </td>
          <td style="width: 10%; text-align: center">
            <div class="qty">
              <b-form-input @focus="handleRosterItemFocus(index)" type="number" ref="myInputs"
                            class="text-center" placeholder="0" :value="roster.quantity"
                            @input="handleRosterUpdate($event, 'quantity', index)"
              />
            </div>
          </td>
          <td  class="fs-3" style="width: 40px; word-spacing: 10px; text-align: center; color: #fff; background: rgba(250,0,0,0.7)"><BIconX v-if="rosterDetails.length > 1" @click="removeRosterItem(index)" /></td>
        </tr>
      </template>
      </tbody>
    </table>

    <div class="roster-row mb-2 flex justify-content-end gap-1 button-holder p-0">
      <button @click="addRosterItem(productSizes)" class="btn btn-secondary light rounded-circle p-0 fs-4 d-inline-flex align-items-center justify-content-center" style="height: 35px; width: 35px">
        <BIconPlus />
      </button>

<!--      <button @click="saveRoster(productId)" class="btn btn-secondary rounded-circle p-0 fs-2 d-inline-flex align-items-center justify-content-center" style="height: 35px; width: 35px">-->
<!--&lt;!&ndash;        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-file-earmark-pdf" viewBox="0 0 16 16">&ndash;&gt;-->
<!--&lt;!&ndash;          <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>&ndash;&gt;-->
<!--&lt;!&ndash;          <path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361.01.022.02.036.026.044a.266.266 0 0 0 .035-.012c.137-.056.355-.235.635-.572a8.18 8.18 0 0 0 .45-.606zm1.64-1.33a12.71 12.71 0 0 1 1.01-.193 11.744 11.744 0 0 1-.51-.858 20.801 20.801 0 0 1-.5 1.05zm2.446.45c.15.163.296.3.435.41.24.19.407.253.498.256a.107.107 0 0 0 .07-.015.307.307 0 0 0 .094-.125.436.436 0 0 0 .059-.2.095.095 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a3.876 3.876 0 0 0-.612-.053zM8.078 7.8a6.7 6.7 0 0 0 .2-.828c.031-.188.043-.343.038-.465a.613.613 0 0 0-.032-.198.517.517 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822.024.111.054.227.09.346z"/>&ndash;&gt;-->
<!--&lt;!&ndash;        </svg>&ndash;&gt;-->
<!--        <BIconInfoCircle />-->
<!--      </button>-->
    </div>

    <b-modal ref="myModal" content-class="upload-logo-disclaimer roster-msg" id="modal-center-uploadroster" centered scrollable size="lg" title="Upload Team Roster">
      <p class="mb-4">The {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Team Roster' | TitleCase}} can be automatically imported from an excel sheet. Please download and use the excel sheet below. No other excel sheets or documents can be used to import data.</p>
      <div class="roster-template-area">
        <b-button @click="downloadTemplate" class="btn btn-secondary fw-bold">Download {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}} Template <a  v-b-tooltip.hover
                                                                                                           title="Enter roster in excel file">
          <font-awesome-icon :icon="['fas', 'info-circle']"/>
        </a></b-button>

        <b-button type="upload" name="Upload Template" @change="onChange" class="btn btn-secondary fw-bold" accept="image/x-png,image/jpeg,pdf">Upload {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}} Template
          <b-form-file  class="mb-2"></b-form-file>
          <a href="#" v-b-tooltip.hover title="Upload the template here to populate the roster">
            <font-awesome-icon :icon="['fas', 'info-circle']"/>
          </a>
        </b-button>
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop} from 'vue-property-decorator'
import readXlsxFile from "read-excel-file";
import {default as $} from "jquery";
import {http} from "@/httpCommon";
import { findIndex } from 'lodash'
import RosterTabMixin from "@/mixins/RosterTabMixin";

@Component<RosterTableMobile>({
  mounted() {
    this.fontsColorsManipulation()
    this.fontsList()
  }
})
export default class RosterTableMobile extends Mixins(RosterTabMixin) {
  @Prop({required: true}) productSizes!: any
  @Prop() productId!: number
  private roster: any[] = []
  public fileData: Record<any, any>[] = []
  public selected = this.productSizes[0]
  public firstColor!: Record<any, any>
  public secondColor!: Record<any, any>
  public currentIcon = 'eye-slash'
  public ref = this.$refs as Record<any, any>
  public obj = {
    text:'',
    number:'',
    size:'SM',
    quantity:5,
    information:''
  };
  public fontsColors: any[] = []
  public fontOptions: Record<any, any>[] = []

  get custom_name_index() : number {
    return findIndex(this.customText, { type: 'name' })
  }

  get custom_number_index() : number {
    return findIndex(this.customText, { type: 'number' })
  }

  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }
  get company(){
    return this.$store.getters.getCompany
  }
  get customText():Record<any, any>[]{
    return this.$store.getters.getCustomTexts();
  }
  get eyeIndex():number{
    return this.$store.getters.getEyeIndex;
  }

  public editRosterPlayer(index: number) {
    this.$store.commit('CHANGE_EYE_INDEX', index)
    this.$store.commit('SET_EDITING_ROSTER_PLAYER_INDEX', index)
  }

  public saveRoster(id:number){
    http.post('update/roster', {id:id, roster: this.rosterDetails}).then((res) => {
      if (res.status == 201){
        this.$router.push('/')
      }
    }).catch((err)=>{
      console.log(err)
    })
  }
  public isActive = false;
  public myFilter() {
    this.isActive = !this.isActive
  }
  public removeIndex(ind:number, text:string, num:number){
    if (this.customText.length > 0){
      if (this.customText[0]){
        this.$store.dispatch('updateCustomTextAttribute', {index: 0, on_all: true, attribute: 'text', value: ''})
      }
       if (this.customText[1]){
        this.$store.dispatch('updateCustomTextAttribute', {index: 1, on_all: true, attribute: 'text', value: ''})
      }
    }
    this.$store.dispatch('removeRoster', ind);
  }
  public getOccurence(val: string) {
    let count = (val.match(/\*/g) || []).length;
    return count
  }
  public updateRosterSize(selected_size_index: number, roster: Record<any, any>) {
    let selected_size = this.productSizes[selected_size_index];
    if(selected_size){
      roster.size = selected_size.name
      roster.code = selected_size.code
    }
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
          this.$store.dispatch('updateRoster', this.fileData);
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
  public shareRoster(){
    this.ref['order-details'].getLockers();
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

  public fontsColorsManipulation() {
    this.selectedProduct.namecolors.forEach((colors: any, key: number) => {
      let finalColor = {color_text: []}
      finalColor.color_text = colors.json_data
      this.fontsColors = this.fontsColors.concat(finalColor)
    })
    if (this.fontsColors.length) {
      this.firstColor = this.fontsColors[0].color_text[0]
      this.secondColor = this.fontsColors[0].color_text? this.fontsColors[0].color_text[1] : this.fontsColors[0].color_text[0]
    }
  }

  public fontsList(): void {
    let productFonts = this.selectedProduct.namefonts
    productFonts.forEach((fonts: any, key: number) => {
      let fontNameParam = fonts.file_url.split('/').reverse()
      fontNameParam = fontNameParam[0].split('.')
      let fontName = fontNameParam[0].replace('-', ' ').toUpperCase()
      let font = {
        value: fontNameParam[0] as string,
        text: fontName as string
      }
      this.fontOptions = this.fontOptions.concat([font])
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

  .activeEye{
    background: #189076;
    color: #fff;
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
      a{
        color: #219f84;
        margin: 0 0 0 3px;
        &:hover{
          color: #fff;
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
      a{
        color: #219f84;
        margin: 0 0 0 3px;
        &:hover{
          color: #fff;
        }
      }
    }
  }

  .roster-data{
    thead{
      tr{
        th{
          font-size: 14px;
          text-align: left;
        }
      }
    }
    tbody{
      tr{
        td{
          padding: 0 !important;
          vertical-align: middle;

          input, select{
            font-size: 14px;
            border: 1px solid transparent;
            background: transparent;
            padding: 2px 5px;
            text-align: left !important;
            outline: none;
            box-shadow: none;

            &:focus{
              border-color: var(--teal);
            }
          }

          input::placeholder{
            color: #ccc !important;
          }
          input::-moz-placeholder{
            color: #ccc !important;
          }
        }
      }
    }
  }
</style>
