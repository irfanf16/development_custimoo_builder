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
          <a  @click="changeText(roster.text)">
            <font-awesome-icon :icon="['fas', 'eye-slash']"/>
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
          <a @click="removeIndex(index, roster.text)">
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

@Component<RosterDetails>({})
export default class RosterDetails extends Vue {
  @Prop({required: true}) productSizes!: any
  private roster: any[] = []
  public selected = this.productSizes[0]
  public obj = {
    text:'',
    number:'',
    size:'SM',
    quantity:5,
    information:''
  };
  public rosters:any[]=[]
  public ref = this.$refs as Record<any, any>

  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails
  }
  get customText():[Record<any, any>]{
    return this.$store.getters.getCustomTexts;
  }

  public addPlayer(obj:Record<any, any>) {
    // let d =0;
    // for (let i in this.rosterDetails[ind]){
    //   if (this.rosterDetails[ind][i] == ""){
    //     this.ref.myInputs[d].focus();
    //   }
    //   d++;
    // }
    this.$emit('addPlayer');
  }
  public removeIndex(ind:number, text:string){
    if (this.customText.length>0){
      if (this.customText[0].text  == text){
        this.$store.dispatch('updateCustomTextAttribute', {index: 0, attribute: 'text', value: ''})
      }
    }
    this.$store.dispatch('removeRoster', ind);
  }
  public changeText(text:string){
      this.$store.dispatch('updateCustomTextAttribute', {index: 0, attribute: 'text', value: text})
  }
  public getOccurence(val:string){
    let count = (val.match(/\*/g) || []).length;
    return count
  }
  public onChange(event: Record<any, any>){
    let status = true;
    let loopStatus = true;
    let files = event.target.files ? event.target.files[0] : null;
    readXlsxFile(files).then((rows: any[][]) => {
      if (rows[0].length != 6){
        alert("please upload valid file")
        return false
      }
      for (let i in rows[0]){
        if (i == '1'){
          let count = this.getOccurence(rows[0][i]);
          if (count != 1 || rows[0][i] != "SIZE*"){
            status = false
            break;
          }
        }
        if (i == '2'){
          let count = this.getOccurence(rows[0][i]);
          if (count != 2 || rows[0][i] != "NAME ON PRODUCT**"){
            status = false
            break;
          }
        }
        if (i == '4'){
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
          for (let i in rows[row]){
            if (row == '0'){
              continue
            }
            if (i == '1') {
              if (rows[row][i] == null || !this.checkSize(rows[row][i])){
                loopStatus = false;
                break;
              }
              obj.size   = rows[row][i];
            }
            if (i == '2') {
              obj.text = rows[row][i];
            }
            if (i == '3') {
              obj.number = rows[row][i];
            }
            if (i == '4') {
              obj.information = rows[row][i];
            }
          }
          if (loopStatus == false){
            break
          }
          this.fileData.push(obj);
        }
        if (loopStatus == true){
          this.$store.dispatch('updateRoster', this.fileData);
        }else{
          alert('Size is missing');
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
