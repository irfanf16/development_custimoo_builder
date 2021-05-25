<template>
  <div class="roster-section">
    <div class="roster-upload-area">
      <h3>Import Roster from Excel sheet</h3>
      <button  v-b-modal.modal-center-roster-upload class="btn btn-secondary fw-bold">Download/Upload Roster Template <a href="#" v-b-tooltip.hover
                                                                                  title="Import roster details from excel sheet">
              <font-awesome-icon :icon="['fas', 'info-circle']"/>
            </a></button>

      <b-modal ref="myModal" content-class="upload-logo-disclaimer" id="modal-center-roster-upload" centered size="lg" title="Upload Team Roster">
        <p class="mb-4">The Team Roster can be automatically imported from an excel sheet. Please download and use the excel sheet below. No other excel sheets or documents can be used to import data.</p>
        <div class="roster-template-area">
            <button class="btn btn-secondary fw-bold">Download Roster Template <a href="#" v-b-tooltip.hover
                                                                                  title="Enter roster in excel file">
              <font-awesome-icon :icon="['fas', 'info-circle']"/>
            </a></button>

            <button type="upload" name="Upload Template" @change="onChange" class="btn btn-secondary fw-bold" accept="image/x-png,image/jpeg,pdf">Upload Roster Template
              <b-form-file  class="mb-2"></b-form-file>
              <a href="#" v-b-tooltip.hover title="Upload the template here to populate the roster">
              <font-awesome-icon :icon="['fas', 'info-circle']"/>
            </a></button>
        </div>
      </b-modal>
      <p>Or insert details manually below</p>
    </div>
    <div class="roster-row mb-2">
      <div class="align-left">
        <div class="hide-show"></div>
        <div class="roster-name">Name</div>
        <div class="shirt-no">No</div>
        <div class="shirt-size">Size</div>
      </div>
      <div class="align-right">
        <div class="qty">Qty</div>
        <div class="remove"></div>
      </div>
    </div>
    <template v-for="(roster, index) in rosterDetails">
    <div class="roster-row mb-2"  :key="index">
      <div class="align-left">
        <div class="hide-show">
          <a  @click="changeText(roster.text, roster.number)">
            <font-awesome-icon :icon="['fas', currentIcon]"/>
          </a>
        </div>
        <div class="roster-name">
          <b-form-input
            ref="myInputs"

            placeholder="Name" v-model="roster.text"
          ></b-form-input>
        </div>
        <div class="shirt-no">
          <b-form-input ref="myInputs"

            class="text-center"
            placeholder="00" v-model="roster.number"
          ></b-form-input>
        </div>
        <div class="shirt-size">
          <b-form-select ref="myInputs" v-model="roster.size" :options="productSizes"></b-form-select>
        </div>
      </div>
      <div class="align-right">
        <div class="qty">
          <b-form-input

            class="text-center" ref="myInputs"
            placeholder="0" v-model="roster.quantity"
          ></b-form-input>
        </div>
        <div class="remove">
          <a @click="removeIndex(index, roster.text, roster.number)">
            <font-awesome-icon :icon="['fas', 'trash-alt']"/>
          </a>
        </div>
      </div>

    </div>
    </template>

    <div class="roster-row mb-2 button-holder">
      <button class="btn btn-secondary fw-bold pl-4 pr-4 pl-lg-5 pr-lg-5" @click="addPlayer(roster)">Add Player</button>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import readXlsxFile from "read-excel-file";
import {default as $} from "jquery";

@Component<RosterDetails>({
  mounted() {
    this.fontsColorsManipulation()
    this.fontsList()
  },
})
export default class RosterDetails extends Vue {
  @Prop({required: true}) productSizes!: any
  private roster: any[] = []
  public fileData: Record<any, any>[] = []
  public selected = this.productSizes[0]
  public firstColor!: string
  public secondColor!: string
  public currentIcon = 'eye'
  public ref = this.$refs as Record<any, any>
  public obj = {
    text:'',
    number:'',
    size:'SM',
    quantity:5,
    information:''
  };
  public rosters:any[]=[]
  public fontsColors: any[] = []
  public fontOptions: Record<any, any>[] = []
  public ref = this.$refs as Record<any, any>

  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }
  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails
  }
  get customText():[Record<any, any>]{
    return this.$store.getters.getCustomTexts;
  }

  public addPlayer(obj:Record<any, any>) {
    this.$emit('addPlayer');
  }
  public removeIndex(ind:number, text:string, num:number){
    if (this.customText.length > 0){
      if (text){
        this.$store.dispatch('updateCustomTextAttribute', {index: 0, attribute: 'text', value: ''})
      }
       if (num){
        this.$store.dispatch('updateCustomTextAttribute', {index: 1, attribute: 'text', value: ''})
      }
    }
    this.$store.dispatch('removeRoster', ind);
  }
  public changeText(text:string, num:number) {
    if (text && num){
      let texts = {
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
        fillColor: this.firstColor,
        outLineColor: this.secondColor,
      }
      console.log(texts);
      this.$store.dispatch('updateCustomTextAttribute', {index: 0, attribute: 'text', value: text})
      this.$store.dispatch('setCustomTexts', {index: 1, text: texts})
  }
    }
  public fontsColorsManipulation() {
    this.selectedProduct.namecolors.forEach((colors: any, key: number) => {
      let finalColor = {color_text: []}
      finalColor.color_text = JSON.parse(colors.color_text)
      this.fontsColors = this.fontsColors.concat(finalColor)
    })
    if (this.fontsColors.length) {
      this.firstColor = this.fontsColors[0].color_text[0].value
      this.secondColor = this.fontsColors[0].color_text? this.fontsColors[0].color_text[1].value : this.fontsColors[0].color_text[0].value
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

  public getOccurence(val:string){
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
          if (count != 1 || rows[0][i] != "SIZE*"){
            status = false
            break;
          }
        }
        if (i == '4'){
          let count = this.getOccurence(rows[0][i]);
          if (count != 3 || rows[0][i] != "NAME ON PRODUCT***"){
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
          let objStatus = true;
          for (let i in rows[row]){
            if (i == '3') {
              if (rows[row][i] == null){
                loopStatus = false;
                break;
              }else{
                obj.size   = rows[row][i];
              }
            }
            if (i == '4'){
              if (rows[row][i] == null){
                objStatus = false
                break;
              }
             if (this.selectedProduct.product_name == rows[row][i]){
               obj.text = rows[row][i];
             }else{
               objStatus = false
               break;
             }
           }
            if (i  == '5'){
              obj.number = rows[row][i];
            }
            if (i == '6'){
              obj.information = rows[row][i];
            }
          }
          if (loopStatus == false){
            break
          }
          if (objStatus == true){
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
            a{
                color: #219f84;
                margin: 0 0 0 3px;
                &:hover{
                    color: #fff;
                }
            }
        }
    }
</style>
