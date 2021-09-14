<template>
  <div>
    <div class="customize_controls" v-if="this.$store.getters.getActiveTab === 1">
      <span class="close" @click="hideAll"><BIconX /></span>
      <div class="grid grid-mobile-2 gap-1 text-left">
        <div class="mobile_controls">
          <label>Apply to</label>
          <b-form-select class="mt-1" v-model="selected">
            <b-form-select-option :value="null">Collar</b-form-select-option>
            <b-form-select-option value="Logo">Logo</b-form-select-option>
            <b-form-select-option value="Logo">Front</b-form-select-option>
            <b-form-select-option value="Logo">Back</b-form-select-option>
          </b-form-select>
        </div>
        <div class="mobile_controls">
          <label>Color Category</label>
          <b-form-select class="mt-1" v-model="selected">
            <b-form-select-option :value="null">Category 1</b-form-select-option>
            <b-form-select-option value="Category 2">Category 2</b-form-select-option>
            <b-form-select-option value="Category 3">Category 3</b-form-select-option>
            <b-form-select-option value="Category 4">Category 4</b-form-select-option>
          </b-form-select>
        </div>
      </div>

      <div class="mt-2 overflow-auto d-flex gap-1" style="padding:6px">
        <div class="color_circle"></div>
        <div class="color_circle"></div>
        <div class="color_circle"></div>
        <div class="color_circle"></div>
        <div class="color_circle"></div>
        <div class="color_circle"></div>
        <div class="color_circle"></div>
        <div class="color_circle"></div>
        <div class="color_circle"></div>
        <div class="color_circle"></div>
        <div class="color_circle"></div>
      </div>
    </div>
    <div class="customize_controls" v-if="this.$store.getters.getActiveTab === 2">
      <span class="close" @click="hideAll"><BIconX /></span>
      <div>
        <b-tabs class="player_text">
          <b-tab>
            <template #title>
              Back Name
            </template>
            <div class="grid mobile-cols-2 gap-1">
              <div class="mobile_controls">
                <label for="">Back Name</label>
                <b-form-input class="mt-1"></b-form-input>
              </div>
              <div class="mobile_controls">
                <label for="">Back Style</label>
                <b-form-select class="mt-1" v-model="selected">
                  <b-form-select-option :value="null">Style 1</b-form-select-option>
                  <b-form-select-option value="Style 2">Style 2</b-form-select-option>
                  <b-form-select-option value="Style 3">Style 3</b-form-select-option>
                  <b-form-select-option value="Style 4">Style 4</b-form-select-option>
                </b-form-select>
              </div>
            </div>
            <div class="grid mobile-cols-2 gap-1">
              <div class="mt-2 mobile_controls">
                <label for="" class="d-flex align-items-center justify-content-between"><span>Outline Width</span> <span>0px</span></label>
                <input type="range" class="custom-range mt-1" value="0" min="0" max="100" />
              </div>

              <div class="mt-2 overflow-auto d-flex gap-1" style="padding:6px">
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
              </div>
            </div>
          </b-tab>
          <b-tab>
            <template #title>
              Front Name
            </template>
            <div class="grid mobile-cols-2 gap-1">
              <div class="mobile_controls">
                <label for="">Front Name</label>
                <b-form-input class="mt-1"></b-form-input>
              </div>
              <div class="mobile_controls">
                <label for="">Font Style</label>
                <b-form-select class="mt-1" v-model="selected">
                  <b-form-select-option :value="null">Style 1</b-form-select-option>
                  <b-form-select-option value="Style 2">Style 2</b-form-select-option>
                  <b-form-select-option value="Style 3">Style 3</b-form-select-option>
                  <b-form-select-option value="Style 4">Style 4</b-form-select-option>
                </b-form-select>
              </div>
            </div>
            <div class="grid mobile-cols-2 gap-1">
              <div class="mt-2 mobile_controls">
                <label for="" class="d-flex align-items-center justify-content-between"><span>Outline Width</span> <span>0px</span></label>
                <input type="range" class="custom-range mt-1" value="0" min="0" max="100" />
              </div>

              <div class="mt-2 overflow-auto d-flex gap-1" style="padding:6px">
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
              </div>
            </div>
          </b-tab>
          <b-tab>
            <template #title>
              Back Number
            </template>
            <div class="grid mobile-cols-2 gap-1">
              <div class="mobile_controls">
                <label for="">Back Number</label>
                <b-form-input class="mt-1"></b-form-input>
              </div>
              <div class="mobile_controls">
                <label for="">Font Style</label>
                <b-form-select class="mt-1" v-model="selected">
                  <b-form-select-option :value="null">Style 1</b-form-select-option>
                  <b-form-select-option value="Style 2">Style 2</b-form-select-option>
                  <b-form-select-option value="Style 3">Style 3</b-form-select-option>
                  <b-form-select-option value="Style 4">Style 4</b-form-select-option>
                </b-form-select>
              </div>
            </div>
            <div class="grid mobile-cols-2 gap-1">
              <div class="mt-2 mobile_controls">
                <label for="" class="d-flex align-items-center justify-content-between"><span>Outline Width</span> <span>0px</span></label>
                <input type="range" class="custom-range mt-1" value="0" min="0" max="100" />
              </div>

              <div class="mt-2 overflow-auto d-flex gap-1" style="padding:6px">
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
              </div>
            </div>
          </b-tab>
          <b-tab>
            <template #title>
              Front Number
            </template>
            <div class="grid mobile-cols-2 gap-1">
              <div class="mobile_controls">
                <label for="">Front Number</label>
                <b-form-input class="mt-1"></b-form-input>
              </div>
              <div class="mobile_controls">
                <label for="">Font Style</label>
                <b-form-select class="mt-1" v-model="selected">
                  <b-form-select-option :value="null">Style 1</b-form-select-option>
                  <b-form-select-option value="Style 2">Style 2</b-form-select-option>
                  <b-form-select-option value="Style 3">Style 3</b-form-select-option>
                  <b-form-select-option value="Style 4">Style 4</b-form-select-option>
                </b-form-select>
              </div>
            </div>
            <div class="grid mobile-cols-2 gap-1">
              <div class="mt-2 mobile_controls">
                <label for="" class="d-flex align-items-center justify-content-between"><span>Outline Width</span> <span>0px</span></label>
                <input type="range" class="custom-range mt-1" value="0" min="0" max="100" />
              </div>

              <div class="mt-2 overflow-auto d-flex gap-1" style="padding:6px">
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
                <div class="color_circle"></div>
              </div>
            </div>
          </b-tab>
        </b-tabs>
      </div>
    </div>
    <div class="customize_controls" v-if="this.$store.getters.getActiveTab === 3">
      <span class="close" @click="hideAll"><BIconX /></span>
      <div>
        <div class="font-weight-bold fs-2">Choose Product</div>
        <div class="d-flex align-items-center gap-2 pt-1 pb-2" style="overflow-x: auto;">
          <label class="button_radio">
            <input checked type="radio" name="style" />
            <span>
              <BIconCheckCircleFill />
              <span>Jensen Cut</span>
            </span>
          </label>
          <label class="button_radio">
            <input type="radio" name="style" />
            <span>
              <BIconCheckCircleFill />
              <span>Jensen Cut</span>
            </span>
          </label>
          <label class="button_radio">
            <input type="radio" name="style" />
            <span>
              <BIconCheckCircleFill />
              <span>Jensen Cut</span>
            </span>
          </label>
        </div>

        <div>
          <template v-for="(item, index) in items">
            <div :key="index" v-if="index===0">
              <div><span class="font-weight-bold fs-2">* Jensen cut</span> <span class="read_more" @click="toggle_read(index)" :data-index="item"><BIconChevronDown /></span></div>
              <div style="display: none">
                Fashioned from performance enhancing fabrics, the Hummel Beespoke Jensen Jersey feels as light as a
                feather and provides maximum ventilation.
              </div>
            </div>
          </template>
        </div>

        <div class="pt-1 mt-1" style="border-top: 1px solid #eee">
          <div class="font-weight-bold fs-2">Choose Stuff</div>
          <div class="pt-1 d-flex align-items-center gap-1" style="overflow-x: auto">
            <label class="button_checkbox">
              <input type="checkbox" name="style" />
              <span>
              <BIconCheckCircleFill />
              <span>Jensen Cut</span>
              <span class="mx-1">-</span>
              <span>$12</span>
            </span>
            </label>
            <label class="button_checkbox">
              <input type="checkbox" name="style" />
              <span>
              <BIconCheckCircleFill />
              <span>Jensen Cut</span>
              <span class="mx-1">-</span>
              <span>$12</span>
            </span>
            </label>
            <label class="button_checkbox">
              <input type="checkbox" name="style" />
              <span>
              <BIconCheckCircleFill />
              <span>Jensen Cut</span>
              <span class="mx-1">-</span>
              <span>$12</span>
            </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
// import ColorAccordion from '@/components/ColorAccordion.vue'
// import LogoPlacementTabs from './LogoPlacementTabs.vue'
// import CustomizationText from '@/components/CustomizationText.vue'
// import CollarStyle from '@/components/CollarStyle.vue'
// import EditRosterArea from '@/components/EditRosterArea.vue'
// import UploadLogo from '@/components/UploadLogo.vue'
// import ColorTabs from '@/components/ColorTabs.vue'
import {default as $} from 'jquery';

@Component<CustomizationProcess>({
  components: {
    // ColorAccordion,
    // LogoPlacementTabs,
    // CustomizationText,
    // CollarStyle,
    // EditRosterArea,
    // ColorTabs,
    // UploadLogo
  },
  mounted() {
    // this.$store.dispatch('setCustomLogos')
    // this.productColorsManipulation()
    // this.fontsColorsManipulation()
    // this.fontsList()
    // this.customTextInit()
   // console.log('customTexts',this.customTexts)
  },
})
export default class CustomizationProcess extends Vue {
  @Prop() activeTab!: number
  private items = [1,2,3,4]

  private selected = null
  private options = [
    { value: null, text: 'Please select an option' },
    { value: 'a', text: 'This is First option' },
    { value: 'b', text: 'Selected Option' },
    { value: { C: '3PO' }, text: 'This is an option with object value' },
    { value: 'd', text: 'This one is disabled', disabled: true }
  ]

  private hideAll(){
    this.$store.dispatch('setActiveTab', -1);
    $(".sideNav li a").removeClass('active')
  }

  private toggle_read(index:number){
    $(`.read_more:eq(${index})`).toggleClass('flip_vertical')
    $(`.read_more:eq(${index})`).parent("div").next("div").slideToggle('fast')
  }

  // public showLoader = false
  // @Prop({required: false, default:0}) tabIndexNew!: number
  // @Prop({required: false, default:0}) activeTab!: number
  // public fontOptions: Record<any, any>[] = []
  //
  // get manageComponents(): Record<any, any> {
  //   return this.$store.getters.getManageComponents
  // }
  //
  // get selectedProduct(): Record<any, any> {
  //   return this.$store.getters.getSelectedProduct
  // }
  //
  // get productModels(): Record<any, any> {
  //   return this.$store.getters.getProductModels;
  // }
  //
  // get customTexts(): [Record<any, any>] {
  //   return this.$store.getters.getCustomTexts
  // }
  //
  // get productNames() {
  //   return this.$store.getters.getSelectedProduct.productnames;
  // }
  //
  // get logoColors(): [] {
  //   return this.$store.getters.getLogosColors
  // }
  //
  // public tabIndex = 0
  //
  // public productColors: any[] = []
  // public fontsColors: any[] = []
  // public firstColor!: Record<any, any>
  // public secondColor!: Record<any, any>
  // private storageUrl = process.env.VUE_APP_STORAGE_URL
  //
  // get hideTab(): Record<any, any> {
  //   return this.$store.getters.getHideTab
  // }
  // get lockerColors(){
  //   return this.$store.getters.getLockerColors
  // }
  //
  // @Watch('tabIndexNew', {
  //   immediate: true, deep: true
  // })
  //
  // tabIndexNewChanged() {
  //   this.tabIndex = this.tabIndexNew
  // }
  //
  // @Watch('tabIndex', {
  //   immediate: true, deep: true
  // })
  //
  // tabIndexChanged() {
  //   this.$emit('tabIndexChange', this.tabIndex)
  // }
  //
  // @Watch('selectedProduct', {
  //   deep: false
  // })
  //
  // selectedProductChanged() {
  //   this.productColorsManipulation()
  // }
  //
  // @Watch('lockerColors', {
  //   deep: false
  // })
  //
  // lockerColorsChanged() {
  //   this.productColorsManipulation()
  // }
  //
  // public productColorsManipulation() {
  //   this.productColors = []
  //   this.selectedProduct.colors.forEach((colors: any, key: number) => {
  //     let finalColor = {color_text: [], selectedColor: "", name: colors.file_name.substr(0, colors.file_name.indexOf('.'))}
  //     finalColor.color_text = JSON.parse(colors.color_text)
  //     this.productColors = this.productColors.concat(finalColor)
  //   })
  //   this.productColors = this.productColors.concat(this.lockerColors)
  //
  //   if(this.logoColors.length){
  //     let logoColorsNew: any[] = []
  //     this.logoColors.forEach((color: any, index: number) => {
  //       logoColorsNew = logoColorsNew.concat([{name: color.pantone, value: color.hex, position: index+1}])
  //     })
  //     let teamLogoColors = [{name: 'Team Logo Colors', color_text: logoColorsNew, selectedColor: ''}]
  //     this.productColors = this.productColors.concat(teamLogoColors)
  //   }
  // }
  //
  // public fontsColorsManipulation() {
  //   this.selectedProduct.namecolors.forEach((colors: any, key: number) => {
  //     let finalColor = {color_text: []}
  //     finalColor.color_text = JSON.parse(colors.color_text)
  //     this.fontsColors = this.fontsColors.concat(finalColor)
  //   })
  //   if (this.fontsColors.length) {
  //     this.firstColor = this.fontsColors[0].color_text[0]
  //     this.secondColor = this.fontsColors[0].color_text? this.fontsColors[0].color_text[1] : this.fontsColors[0].color_text[0]
  //   }
  // }
  //
  // public async getModels() {
  //   await this.$store.dispatch("getModels", this.selectedProduct.product_id);
  // }
  //
  // public setHideTab(index: string, value: boolean) {
  //   this.$store.dispatch('setHideTab', {index: index, value: value})
  // }
  //
  // public customTextInit() {
  //   this.productNames.forEach((productName: Record<any, any>, index: number) => {
  //     if (this.customTexts[index] && !this.customTexts[index].action) {
  //       let text = {
  //         text: this.customTexts[index].text,
  //         type: productName.type,
  //         width: productName.width,
  //         height: productName.height,
  //         x_axis: productName.x_axis,
  //         y_axis: productName.y_axis,
  //         rotation: productName.rotation,
  //         haveControls: Boolean(!productName.is_locked),
  //         outlineEnabled: Boolean(productName.outline_enabled),
  //         side: productName.side,
  //         fontFamily: this.customTexts[index].fontFamily ? this.customTexts[index].fontFamily : this.fontOptions[0].value,
  //         fillColor: this.customTexts[index].fillColor ? this.customTexts[index].fillColor : this.firstColor.value,
  //         fillColorPantone: this.customTexts[index].fillColor ? this.customTexts[index].fillColor : this.firstColor.name,
  //         outLineColor: this.customTexts[index].outLineColor ? this.customTexts[index].outLineColor : this.secondColor.value,
  //         outLineColorPantone: this.customTexts[index].outLineColor ? this.customTexts[index].outLineColor : this.secondColor.name,
  //         outLineWidth: this.customTexts[index].outLineWidth ? this.customTexts[index].outLineWidth : 0,
  //         selectColor: false
  //       }
  //       this.$store.dispatch('setCustomTexts', {index: index, text: text})
  //     } else if (!this.customTexts[index]) {
  //       let text = {
  //         text: '',
  //         type: productName.type,
  //         width: productName.width,
  //         height: productName.height,
  //         x_axis: productName.x_axis,
  //         y_axis: productName.y_axis,
  //         rotation: productName.rotation,
  //         haveControls: Boolean(!productName.is_locked),
  //         outlineEnabled: Boolean(productName.outline_enabled),
  //         side: productName.side,
  //         fontFamily: this.fontOptions[0] ? this.fontOptions[0].value : '',
  //         fillColor: this.firstColor.value,
  //         fillColorPantone: this.firstColor.name,
  //         outLineColor: this.secondColor.value,
  //         outLineColorPantone: this.secondColor.name,
  //         outLineWidth: 0,
  //         selectColor: false
  //       }
  //       this.$store.dispatch('setCustomTexts', {index: index, text: text})
  //     }
  //   })
  // }
  //
  // public fontsList(): void {
  //   let productFonts = this.selectedProduct.namefonts
  //   productFonts.forEach((fonts: any, key: number) => {
  //     this.showLoader = true
  //     let fontNameParam = fonts.file_url.split('/').reverse()
  //     fontNameParam = fontNameParam[0].split('.')
  //     let fontName = fontNameParam[0].replace('-', ' ').toUpperCase()
  //     let font = {
  //       value: fontNameParam[0] as string,
  //       text: fontName as string
  //     }
  //     this.fontOptions = this.fontOptions.concat([font])
  //     let fontUrl = this.storageUrl + fonts.file_url
  //     const headElement = document.querySelector('head') as HTMLHeadElement
  //     headElement.innerHTML += "<style type='text/css'> @font-face{font-family: " + font.value + "; src: url('" + fontUrl + "')}</style>";
  //     $("#app").append('<p id="delete_after_load" style="visibility: hidden; font-family: '+font.value+'">aa</p>')
  //     setTimeout(() => {
  //       $("#delete_after_load").remove()
  //     }, 1000)
  //     setTimeout(() => {
  //       this.showLoader = false
  //     }, 2000)
  //   })
  // }
  //
  // public addTab(index: number) {
  //   let text = {
  //     text: '',
  //     type: 'name',
  //     width: 50,
  //     height: 50,
  //     x_axis: 300,
  //     y_axis: 180,
  //     rotation: 0,
  //     haveControls: true,
  //     outlineEnabled: true,
  //     side: 'back',
  //     fontFamily: this.fontOptions[0] ? this.fontOptions[0].value : '',
  //     fillColor: this.firstColor.value,
  //     fillColorPantone: this.firstColor.name,
  //     outLineColor: this.secondColor.value,
  //     outLineColorPantone: this.secondColor.name,
  //     outLineWidth: 0
  //   }
  //   this.$store.dispatch('setCustomTexts', {index: this.customTexts.length, text: text})
  // }
}
</script>

<style lang="scss" scoped>
.tab-close-btn {
  display: block;
  width: 100%;
  max-width: 100px;
  margin: 10px auto 0;
  height: 4px;
  background: #DFE5E8;
  border-radius: 10px;
  border: none;
}
.loader{
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  background: rgba(255,255,255,1);
  z-index: 1030;
  img{
    max-width: 7%;
    display: block;
    margin: 0 auto;
    height: auto;
  }
}

.read_more{
  transform: rotate(0deg); transition: 0.2s all ease; display: inline-block;
}
</style>
