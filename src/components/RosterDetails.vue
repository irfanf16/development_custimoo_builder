<template>
  <div class="roster-section">
    <div class="d-none d-md-block roster-upload-area">
      <h3>Import Roster from Excel sheets</h3>
      <b-button  @click="$modal.show('rosterfilemodal')" class="btn btn-secondary fw-bold">Download/Upload Roster Template <a href="#" v-b-tooltip.hover
                                                                                  title="Import roster details from excel sheet">
              <font-awesome-icon :icon="['fas', 'info-circle']"/>
            </a></b-button>


      <p>Or insert details manually below</p>
    </div>
   <div class="row" v-if="rosterDetails.length > 0">
     <b-button @click="updateRosterPlayerNameFormat('capitalized')" class="btn btn-info col-md-4">Capitalize</b-button>
     <b-button @click="updateRosterPlayerNameFormat('toUpperCase')" class="btn btn-info col-md-4">All Capitalized</b-button>
     <b-button @click="updateRosterPlayerNameFormat('toLowerCase')" class="btn btn-info col-md-4">All Lower</b-button>
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
          <div class="hide-show" >
            <a >
              <font-awesome-icon  :icon="['fas',  index === eyeIndex ? 'eye' : 'eye-slash']"/>
            </a>
          </div>
          <div class="roster-name">
            <b-form-input ref="myInputs" v-model="roster.text" @focus="editRosterPlayer(index)"></b-form-input>
          </div>
        <div class="shirt-no">
          <b-form-input ref="myInputs" class="text-center" v-model="roster.number" @focus="editRosterPlayer(index)"
          ></b-form-input>
        </div>
        <div class="shirt-size">
          <b-form-select ref="myInputs" @input="updateRosterSize($event, roster)" v-model="roster.size_index">
            <b-form-select-option v-for="(productSize, psIdx) in productSizes" :key="psIdx" :value="psIdx" >{{productSize.text}}</b-form-select-option>
          </b-form-select>
        </div>
      </div>
      <div class="align-right">
        <div class="qty">
          <b-form-input

            class="text-center" ref="myInputs"
            placeholder="0" v-model="roster.quantity"
          ></b-form-input>
        </div>
        <div class="remove" v-if="rosterDetails.length > 1">
          <a @click="removeIndex(index, roster.text, roster.number)">
            <font-awesome-icon :icon="['fas', 'trash-alt']"/>
          </a>
        </div>
      </div>

    </div>
    </template>

    <div class="roster-row mb-2 button-holder d-flex justify-content-space-between">
      <button class="btn btn-secondary fw-bold px-2 mr-2" @click="addPlayer(roster)">Add Player</button>
      <button class="btn btn-secondary fw-bold px-2 ml-2" @click="close">OK</button>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import readXlsxFile from "read-excel-file";
import {default as $} from "jquery";
import {http} from "@/httpCommon";
import {findIndex} from 'lodash';


@Component<RosterDetails>({
  components: {
  },
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
  public firstColor!: Record<any, any>
  public secondColor!: Record<any, any>
  public currentIcon = 'eye-slash'
  public ref = this.$refs as Record<any, any>
  public obj = {
    text:'',
    number:'',
    size_index:'',
    size:'',
    code:'',
    quantity:5,
    information:''
  };
  public rosters:any[]=[]
  public fontsColors: any[] = []
  public fontOptions: Record<any, any>[] = []
  public editing_roster_player_index = 0;

  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }
  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails
  }
  get rosterFirstNameAndNumber(): string|null {
    let editing_roster_player_index = this.editing_roster_player_index
    if(this.rosterDetails && this.rosterDetails.length > 0) {
      // |;| is just name and number separator
      return `${this.rosterDetails[editing_roster_player_index].text}|;|${this.rosterDetails[editing_roster_player_index].number}`;
    } else {
      return null;
    }
  }

  @Watch('rosterFirstNameAndNumber', {deep: true })
  async onRosterFirstNameAndNumberChanged(newVal: string) {
    let name = "";
    let number = "";
    if(newVal) {
      let name_and_number_array = newVal.split("|;|");
      name = name_and_number_array[0]
      number = name_and_number_array[1]
    }
    let all_products_custom_texts = this.$store.getters.getCustomTexts(null,true)
    if(all_products_custom_texts) {
      for (let product_id in all_products_custom_texts) {
        let custom_name_index = findIndex(all_products_custom_texts[product_id], {type: 'name'});
        let custom_number_index = findIndex(all_products_custom_texts[product_id], {type: 'number'});
        this.$store.dispatch('updateCustomTextAttribute', {index: custom_name_index, on_all: true, attribute: 'text', value: name})
        this.$store.dispatch('updateCustomTextAttribute', {index: custom_number_index, on_all: true, attribute: 'text', value: number})
      }
    }
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
      finalColor.color_text = JSON.parse(colors.json_data)
      this.fontsColors = this.fontsColors.concat(finalColor)
    })
    if (this.fontsColors.length) {
      this.firstColor = this.fontsColors[0].color_text[0]
      this.secondColor = this.fontsColors[0].color_text? this.fontsColors[0].color_text[1] : this.fontsColors[0].color_text[0]
    }
  }
  public close(){
    this.$modal.hide('rostermodal');
    this.ref['order-details'].addToCart();
    this.$modal.show('cart-modal');
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

  public updateRosterSize(selected_size_index: number, roster: Record<any, any>) {
    let selected_size = this.productSizes[selected_size_index];
    if(selected_size){
      roster.size = selected_size.name
      roster.code = selected_size.code
    }
  }

  public editRosterPlayer(index: number) {
    this.editing_roster_player_index = index;
    this.$store.commit('CHANGE_EYE_INDEX', index)
  }

  public updateRosterPlayerNameFormat(selected_format:string) {
    let updated_roster: Record<any, any>[] = [];
    this.rosterDetails.forEach(roster_detail => {
      if(roster_detail.text) {
        let roster_player_name = roster_detail.text;
        if(selected_format == "capitalized") {
          roster_detail.text = roster_player_name.charAt(0).toUpperCase() + roster_player_name.slice(1).toLowerCase();
        } else {
          roster_detail.text = roster_player_name[selected_format]();
        }
        updated_roster.push(roster_detail);
      }
      this.$store.commit('UPDATE_ROSTER', updated_roster)
    })

    // let all_products_custom_texts = this.$store.getters.getCustomTexts(null,true);
    // for (const product_id in all_products_custom_texts) {
    //   all_products_custom_texts[product_id].forEach(() => {
    //     console.log("sdfd")
    //   })
    //
    // }
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
