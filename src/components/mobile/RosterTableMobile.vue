<template>
  <div class="roster-section">
    <div class="d-none d-md-block roster-upload-area">
      <h3>Import Roster from Excel sheet</h3>
      <b-button  v-b-modal.modal-center-uploadroster class="btn btn-secondary fw-bold">Download/Upload Roster Template <a href="#" v-b-tooltip.hover
                                                                                  title="Import roster details from excel sheet">
              <font-awesome-icon :icon="['fas', 'info-circle']"/>
            </a></b-button>


      <p>Or insert details manually below</p>
    </div>
    <table class="table table-bordered table-striped roster-data" style="table-layout: fixed">
      <thead>
        <tr>
          <th style="width: 9%;"></th>
          <th style="width: 40%">Name</th>
          <th style="width: 14%;">No</th>
          <th style="width: 18%;">Size</th>
          <th style="width: 10%;">Qty</th>
          <th style="width: 9%;"></th>
        </tr>
      </thead>
      <tbody>
      <template v-for="(roster, index) in rosterDetails" >
        <tr :key="index">
          <td style="width: 10%; text-align: center" :class="{'activeEye': eyeIndex == index}" @click="changeText(roster.text, roster.number, index)"><BIconEye /></td>
          <td style="width: 50%">
            <b-form-input
              class="text-center" ref="myInputs"
              v-model="roster.text" />
          </td>
          <td style="width: 10%; text-align: center">
            <b-form-input
              class="text-center" ref="myInputs"
              v-model="roster.number" />
          </td>
          <td style="width: 10%; text-align: center">
            <b-form-select ref="myInputs" v-model="roster.size" :options="productSizes"></b-form-select>
          </td>
          <td style="width: 10%; text-align: center">
            <b-form-input
              class="text-center" ref="myInputs"
              placeholder="0" v-model="roster.quantity"
            ></b-form-input>
          </td>
          <td  class="fs-3" style="width: 40px; word-spacing: 10px; text-align: center; color: #fff; background: rgba(250,0,0,0.7)"><BIconX v-if="rosterDetails.length > 1" @click="removeIndex(index)" /></td>
        </tr>
      </template>
      </tbody>
    </table>

    <div class="roster-row mb-2 flex justify-content-end gap-1 button-holder p-0">
      <button @click="addPlayer(roster)" class="btn btn-secondary light rounded-circle p-0 fs-4 d-inline-flex align-items-center justify-content-center" style="height: 35px; width: 35px">
        <BIconPlus />
      </button>

      <button @click="saveRoster(productId)" class="btn btn-secondary rounded-circle p-0 fs-2 d-inline-flex align-items-center justify-content-center" style="height: 35px; width: 35px">
        <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height="1em" width="1em"> <g> <g> <rect x="139.636" y="372.364" width="232.727" height="46.545"/> </g> </g> <g> <g> <polygon points="139.636,465.455 139.636,488.727 139.636,512 372.364,512 372.364,488.727 372.364,465.455 		"/> </g> </g> <g> <g> <path d="M507.338,133.843L413.823,9.3c-4.395-5.854-11.29-9.3-18.61-9.3h-38.364v23.273v23.273v147.394 c0,12.851-10.42,23.273-23.273,23.273H116.364c-12.853,0-23.273-10.422-23.273-23.273V46.545V23.273V0H23.273 C10.42,0,0,10.422,0,23.273v465.455C0,501.578,10.42,512,23.273,512h69.818v-23.273v-23.273v-23.273v-93.091 c0-12.854,10.42-23.273,23.273-23.273h279.273c12.853,0,23.273,10.418,23.273,23.273v93.091v23.273v23.273V512h69.818 C501.58,512,512,501.578,512,488.727v-340.91C512,142.778,510.363,137.872,507.338,133.843z"/> </g> </g> <g> <g> <polygon points="139.636,0 139.636,23.273 139.636,46.545 139.636,170.667 310.303,170.667 310.303,46.545 310.303,23.273 310.303,0 		"/> </g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> </svg>
      </button>
    </div>

    <b-modal ref="myModal" content-class="upload-logo-disclaimer roster-msg" id="modal-center-uploadroster" centered scrollable size="lg" title="Upload Team Roster">
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
    </b-modal>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import readXlsxFile from "read-excel-file";
import {default as $} from "jquery";
import {http} from "@/httpCommon";

@Component<RosterTableMobile>({
  mounted() {
    this.fontsColorsManipulation()
    this.fontsList()
  },
})
export default class RosterTableMobile extends Vue {
  @Prop() productSizes!: Record<any, any>[]
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

  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }
  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails
  }
  get customText():Record<any, any>[]{
    return this.$store.getters.getCustomTexts();
  }
  get eyeIndex():number{
    return this.$store.getters.getEyeIndex;
  }

  public addPlayer(obj:Record<any, any>) {
    this.$emit('addPlayer');
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
  public changeText(text:string, num:number, index:number) {
    this.$store.commit('CHANGE_EYE_INDEX', index)
    let textAdd = false
    let numberAdd = false

      if (this.customText[0]) {
        this.$store.dispatch('updateCustomTextAttribute', {index: 0, on_all: true, attribute: 'text', value: text})
        textAdd = true
      }
      if (!textAdd) {
        let texts: Record<any, any>
        if(this.selectedProduct.productnames[0]) {
          texts = {
            text: text.toString(),
            type: this.selectedProduct.productnames[0].type,
            width: this.selectedProduct.productnames[0].width,
            height: this.selectedProduct.productnames[0].height,
            x_axis: this.selectedProduct.productnames[0].x_axis,
            y_axis: this.selectedProduct.productnames[0].y_axis,
            rotation: this.selectedProduct.productnames[0].rotation,
            haveControls: Boolean(!this.selectedProduct.productnames[0].is_locked),
            outlineEnabled: Boolean(this.selectedProduct.productnames[0].outline_enabled),
            side: this.selectedProduct.productnames[0].side,
            fontFamily: this.fontOptions[0] ? this.fontOptions[0].value : '',
            fillColor: this.firstColor.value,
            fillColorPantone: this.firstColor.name,
            outLineColor: this.secondColor.value,
            outLineColorPantone: this.secondColor.name,
            selectColor: false
          }
        } else {
          texts = {
            text: text.toString(),
            type: 'name',
            width: 50,
            height: 50,
            x_axis: 300,
            y_axis: 180,
            rotation: 0,
            haveControls: true,
            outlineEnabled: true,
            side: 'back',
            fontFamily: this.fontOptions[0] ? this.fontOptions[0].value : '',
            fillColor: this.firstColor.value,
            fillColorPantone: this.firstColor.name,
            outLineColor: this.secondColor.value,
            outLineColorPantone: this.secondColor.name,
            selectColor: false
          }
          this.$store.dispatch('setCustomTexts', {index: 0, text: texts})
        }
      }
    if (this.customText[1]) {
      this.$store.dispatch('updateCustomTextAttribute', {index: 1, on_all: true, attribute: 'text', value: num.toString()})
      numberAdd = true
    }
    if(!numberAdd) {
      let texts: Record<any, any>
      if(this.selectedProduct.productnames[1]) {
        texts = {
          text: num.toString(),
          type: this.selectedProduct.productnames[1].type,
          width: this.selectedProduct.productnames[1].width,
          height: this.selectedProduct.productnames[1].height,
          x_axis: this.selectedProduct.productnames[1].x_axis,
          y_axis: this.selectedProduct.productnames[1].y_axis,
          rotation: this.selectedProduct.productnames[1].rotation,
          haveControls: Boolean(!this.selectedProduct.productnames[1].is_locked),
          outlineEnabled: Boolean(this.selectedProduct.productnames[1].outline_enabled),
          side: this.selectedProduct.productnames[1].side,
          fontFamily: this.fontOptions[0] ? this.fontOptions[0].value : '',
          fillColor: this.firstColor.value,
          fillColorPantone: this.firstColor.name,
          outLineColor: this.secondColor.value,
          outLineColorPantone: this.secondColor.name,
          selectColor: false
        }
      } else {
        texts = {
          text: num.toString(),
          type: 'number',
          width: 50,
          height: 50,
          x_axis: 300,
          y_axis: 180,
          rotation: 0,
          haveControls: true,
          outlineEnabled: true,
          side: 'back',
          fontFamily: this.fontOptions[0] ? this.fontOptions[0].value : '',
          fillColor: this.firstColor.value,
          fillColorPantone: this.firstColor.name,
          outLineColor: this.secondColor.value,
          outLineColorPantone: this.secondColor.name,
          selectColor: false
        }
        this.$store.dispatch('setCustomTexts', {index: 1, text: texts})
      }
    }
  }

  public fontsColorsManipulation() {
    this.selectedProduct.namecolors.forEach((colors: any, key: number) => {
      let finalColor = {color_text: []}
      finalColor.color_text = JSON.parse(colors.color_text)
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
