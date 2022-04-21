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
          <div class="hide-show" :class="{ active: isActive }">
            <a  @click="changeText(roster.text, roster.number, index)">
              <font-awesome-icon  :icon="['fas',  index === eyeIndex ? 'eye' : 'eye-slash']"/>
            </a>
          </div>
          <div class="roster-name">
            <b-form-input ref="myInputs" v-model="roster.text"></b-form-input>
          </div>
        <div class="shirt-no">
          <b-form-input ref="myInputs"

            class="text-center"
            v-model="roster.number"
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
import {http} from "@/httpCommon";

@Component<RosterTables>({
  mounted() {
    this.fontsColorsManipulation()
    this.fontsList()
  },
})
export default class RosterTables extends Vue {
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
    size:'SM',
    quantity:5,
    information:''
  };
  public rosters:any[]=[]
  public fontsColors: any[] = []
  public fontOptions: Record<any, any>[] = []

  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }
  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails
  }
  get customText():Record<any, any>[]{
    return this.$store.getters.getCustomTexts;
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
        this.$store.dispatch('updateCustomTextAttribute', {index: 0, attribute: 'text', value: ''})
      }
       if (this.customText[1]){
        this.$store.dispatch('updateCustomTextAttribute', {index: 1, attribute: 'text', value: ''})
      }
    }
    this.$store.dispatch('removeRoster', ind);
  }
  public changeText(text:string, num:number, index:number) {
    this.$store.commit('CHANGE_EYE_INDEX', index)
    let textAdd = false
    let numberAdd = false

      if (this.customText[0]) {
        this.$store.dispatch('updateCustomTextAttribute', {index: 0, attribute: 'text', value: text})
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
      this.$store.dispatch('updateCustomTextAttribute', {index: 1, attribute: 'text', value: num.toString()})
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
