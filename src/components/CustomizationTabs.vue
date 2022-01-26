<template>
  <div class="h-100">
    <div class="customization-tabs" :class="{'is-mobile': mobileScreen}">
      <b-tabs v-model="tabIndex">
        <!--        <vue-custom-scrollbar class="scroll-area"  :settings="settings">-->
        <!--        <vue-scrollbar :speed="20" classes="my-scrollbar" ref="Scrollbar" :style="styling.scrollbar">-->
        <div class="myscroll">
          <!--        <vuescroll :ops="ops">-->
          <b-tab v-if="selectedProduct.is_logo_allowed == 1">
            <button @click="setHideTab('logoHide', !hideTab.logoHide)" class="tab-close-btn d-lg-none"></button>
            <template #title>
              <a @click="setHideTab('logoHide', true)" >
                <span class="icon-holder">
                  <font-awesome-icon :icon="['fas', 'image']"/>
                </span>
                Logo
              </a>
            </template>
            <div class="logo-placement-tabs" v-if="hideTab.logoHide">
              <LogoPlacementTabs v-if="Object.keys(customLogos).length > 0" :numberOfLogosAllowed="selectedProduct.allowed_logos_count"
                                 :logosSetting="selectedProduct.logos_setting"/>
            </div>
          </b-tab>
          <b-tab v-if="selectedProduct.product_type !== 'personalized'">
            <button @click="setHideTab('colorHide', !hideTab.colorHide)" class="tab-close-btn d-lg-none"></button>
            <template #title>
              <a @click="setHideTab('colorHide', true)" >
                <span class="icon-holder">
                  <font-awesome-icon :icon="['fas', 'fill-drip']"/>
                </span>
                Color
              </a>
            </template>
            <div v-if="hideTab.colorHide">
              <h2 class="fw-bold fz-16 p-3 d-none d-lg-block">Choose Color</h2>
              <div class="d-none d-lg-block">
                <ColorAccordion :productColors="productColors"/>
              </div>
              <!--            for mobile-->
              <div class="color-tabs d-lg-none">
                <ColorTabs :productColors="productColors"/>
              </div>
            </div>
          </b-tab>
          <b-tab>
            <button @click="setHideTab('textHide', !hideTab.textHide)" class="tab-close-btn d-lg-none"></button>
            <template #title>
              <a @click="setHideTab('textHide', true)" >
                <span class="icon-holder">
                  <font-awesome-icon :icon="['fas', 'text-height']"/>
                </span>
                Text
              </a>
            </template>
            <div class="d-none d-lg-block">
              <div v-for="(customText, index) in customTexts" :key="index">
                <CustomizationText :productFonts="selectedProduct.namefonts" :customTextIndex="index"
                                   :fontsColors="fontsColors" :fontOptions="fontOptions"/>
              </div>
              <div class="px-3 pt-3 p-lg-4 text-right">
                <b-button class="add-logo-btn" @click="addTab(customTexts.length)">
                  +
                </b-button>
              </div>
            </div>
            <div class="mobile-text-tabs d-lg-none" v-if="hideTab.textHide">
              <b-tabs>
                <!-- <div class="p-lg-4 text-right">
                  <b-button class="add-logo-btn" @click="addTab(customTexts.length)">
                    +
                  </b-button>
                </div> -->
                <b-tab v-for="(customText, index) in customTexts" :key="index">
                  <template #title>
                    Player Name
                  </template>
                  <div>
                    <CustomizationText :productFonts="selectedProduct.namefonts" :customTextIndex="index"
                                       :fontsColors="fontsColors" :fontOptions="fontOptions"/>
                  </div>
                </b-tab>
              </b-tabs>
            </div>
          </b-tab>
          <b-tab @click="getModels">
            <button @click="setHideTab('styleHide', !hideTab.styleHide)" class="tab-close-btn d-lg-none"></button>
            <template #title>
              <a @click="setHideTab('styleHide', true)" >
              <span class="icon-holder">
                <font-awesome-icon :icon="['fas', 'swatchbook']"/>
              </span>
                Style
              </a>
            </template>
            <div class="collar-section p-4" v-if="hideTab.styleHide">
              <h2 class="fw-bold mb-2 fz-18">Choose Product</h2>
              <CollarStyle :productModels="productModels"/>
            </div>
          </b-tab>
          <b-tab>
            <button @click="setHideTab('teamHide', !hideTab.teamHide)" class="tab-close-btn d-lg-none"></button>
            <template #title>
              <a @click="setHideTab('teamHide', true)" >
              <span class="icon-holder">
                <BIconFileTextFill />
              </span>
                Summary
              </a>
            </template>
            <div class="team-roaster-area p-4" v-if="hideTab.teamHide">
              <h2 class="fw-bold mb-2 fz-18">Roster</h2>
              <EditRosterAreaTab :productSizes="selectedProduct.sizes"/>
            </div>
          </b-tab>
          <!--        </vuescroll>-->
        </div>
      </b-tabs>
    </div>

  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import ColorAccordion from '@/components/ColorAccordion.vue'
import LogoPlacementTabs from './LogoPlacementTabs.vue'
import CustomizationText from '@/components/CustomizationText.vue'
import CollarStyle from '@/components/CollarStyle.vue'
import EditRosterAreaTab from '@/components/EditRosterAreaTab.vue'
import UploadLogo from '@/components/UploadLogo.vue'
import ColorTabs from '@/components/ColorTabs.vue'
import {default as $} from 'jquery';
import {getClosestColor} from '@/pantoneColor'
import RecentLogos from "@/components/RecentLogos.vue";
import {sortTextsArray} from "@/helpers/Helpers";

@Component<CustomizationProcess>({
  components: {
    RecentLogos,
    ColorAccordion,
    LogoPlacementTabs,
    CustomizationText,
    CollarStyle,
    EditRosterAreaTab,
    ColorTabs,
    UploadLogo,
  },
  mounted() {
    this.$store.dispatch('setCustomLogos')
    this.productColorsManipulation()
    this.fontsColorsManipulation()
    this.fontsList()
    this.customTextInit()
   // console.log('customTexts',this.customTexts)
  },
})
export default class CustomizationProcess extends Vue {
  private mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  public showLoader = false
  private ops = {
    // vuescroll: {
    //   mode: 'native'
    // },
    // scrollpanel: { scrollingX: false, scrollingY: true },
    // rail: {
    //   background: '#219F84',
    //   opacity: '0.2',
    //   gutterOfSide: '0',
    // },
    // bar: {
    //   background: '#219F84',
    //   opacity: '0.9',
    // }
  }

  // private settings = {
  //   suppressScrollY: false,
  //   suppressScrollX: true,
  //   wheelPropagation: false,
  //   wheelSpeed: 3
  // }

  // public setScroll(){
  //   // alert('scrollBar[0].scrollTop')
  //   let scrollBar:Record<any, any> = this.$refs['Scrollbar'];
  //
  //   // scrollBar.scrollToY(0);
  //   console.log('scroll', )
  // }

  public styling = {
    /* Scrollbar */
    scrollbar: {
      width: "100%",
      height: "calc(100vh - 220px)"
    },
  }
  @Prop({required: false, default:0}) tabIndexNew!: number
  public fontOptions: Record<any, any>[] = []

  get manageComponents(): Record<any, any> {
    return this.$store.getters.getManageComponents
  }

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get customLogos(): Record<any, any> {
    return this.$store.getters.getCustomLogos()
  }

  get productModels(): Record<any, any> {
    return this.$store.getters.getProductModels;
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts()
  }

  get products(): [Record<any, any>] {
    return this.$store.getters.getProducts
  }



  get productNames() {
    return this.$store.getters.getSelectedProduct.productnames;
  }

  get logoColors(): [] {
    return this.$store.getters.getLogosColors
  }

  public tabIndex = 0

  public productColors: any[] = []
  public fontsColors: any[] = []
  public firstColor!: Record<any, any>
  public secondColor!: Record<any, any>
  private storageUrl = process.env.VUE_APP_STORAGE_URL

  get hideTab(): Record<any, any> {
    return this.$store.getters.getHideTab
  }
  get lockerColors(){
    return this.$store.getters.getLockerColors
  }

  @Watch('tabIndexNew', {
    immediate: true, deep: true
  })

  tabIndexNewChanged() {
    this.tabIndex = this.tabIndexNew
  }

  @Watch('tabIndex', {
    immediate: true, deep: true
  })

  tabIndexChanged() {
    this.$emit('tabIndexChange', this.tabIndex)
  }

  @Watch('selectedProduct', {
    deep: false
  })

  selectedProductChanged() {
    this.productColorsManipulation()
  }

  @Watch('lockerColors', {
    deep: true
  })


  lockerColorsChanged(newval:any, old:any) {
    this.productColorsManipulation()
  }

  public productColorsManipulation() {
    this.productColors = []
    this.selectedProduct.colors.forEach((colors: any, key: number) => {
      let finalColor = {color_text: [], selectedColor: "", name: colors.file_name.substr(0, colors.file_name.indexOf('.'))}
      finalColor.color_text = JSON.parse(colors.color_text)
      this.productColors = this.productColors.concat(finalColor)
    })
    if (this.lockerColors.length > 0){
      this.productColors = this.productColors.concat(this.lockerColors)
    }
    if(this.logoColors.length){
      let logoColorsNew: any[] = []
      this.logoColors.forEach((color: any, index: number) => {
        logoColorsNew = logoColorsNew.concat([{name: color.pantone, value: color.hex, position: index+1}])
      })
      let teamLogoColors = [{name: 'Team Logo Colors', color_text: logoColorsNew, selectedColor: ''}]
      this.productColors = this.productColors.concat(teamLogoColors)
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

  public async getModels() {
    await this.$store.dispatch("getModels", this.selectedProduct.product_id);
  }

  public setHideTab(index: string, value: boolean) {
    this.$store.dispatch('setHideTab', {index: index, value: value})
  }

  public customTextInit() {

    this.products.forEach((product:any) => {
      if(!this.customTexts[product.id]) {
        //product.productnames =  sortTextsArray(product.productnames);
        product.productnames.forEach(async (productName: Record<any, any>, index: number) => {
          if (this.customTexts[index] && !this.customTexts[index].action) {
            //calculate colors pantone on init
            let fill_color_pantone = this.firstColor.name;
            let fill_hex_color = '';
            if(this.customTexts[index].fillColor){
              fill_hex_color = this.customTexts[index].fillColor;
            }else if(this.firstColor.value){
              fill_hex_color = this.firstColor.value;
            }
            if(fill_hex_color != ''){
              let pantone = getClosestColor(fill_hex_color);
              if(pantone && pantone.pantone && pantone.pantone != 'undefined'){
                fill_color_pantone = pantone.pantone;
              }
            }

            let outLine_color_pantone = this.secondColor.name;
            let outLine_hex_color = '';
            if(this.customTexts[index].outLineColor){
              outLine_hex_color = this.customTexts[index].outLineColor;
            }else if(this.secondColor.value){
              outLine_hex_color = this.secondColor.value;
            }
            if(outLine_hex_color != ''){
              let opantone = getClosestColor(outLine_hex_color);
              if(opantone && opantone.pantone && opantone.pantone != 'undefined'){
                outLine_color_pantone = opantone.pantone;
              }
            }
            let text = {
              text: this.customTexts[index].text,
              type: productName.type,
              width: productName.width,
              height: productName.height,
              x_axis: productName.x_axis,
              y_axis: productName.y_axis,
              rotation: productName.rotation,
              haveControls: Boolean(!productName.is_locked),
              outlineEnabled: Boolean(productName.outline_enabled),
              side: productName.side,
              fontFamily: this.customTexts[index].fontFamily ? this.customTexts[index].fontFamily : this.fontOptions[0].value,
              fillColor: this.customTexts[index].fillColor ? this.customTexts[index].fillColor : this.firstColor.value,
              fillColorPantone: fill_color_pantone,
              outLineColor: this.customTexts[index].outLineColor ? this.customTexts[index].outLineColor : this.secondColor.value,
              //outLineColorPantone: this.customTexts[index].outLineColor ? this.customTexts[index].outLineColor : this.secondColor.name,
              outLineColorPantone: outLine_color_pantone,
              outLineWidth: this.customTexts[index].outLineWidth ? this.customTexts[index].outLineWidth : 0,
              selectColor: false
            }
            await this.$store.dispatch('setCustomTexts', {index: index, text: text,prd_id:product.id})
          }
          else if (!this.customTexts[index]) {

            //calculate colors pantone on init
            let fill_color_pantone = this.firstColor.name;
            let pantone = getClosestColor(this.firstColor.value);
            if(pantone && pantone.pantone && pantone.pantone != 'undefined'){
              fill_color_pantone = pantone.pantone;
            }

            let outLine_color_pantone = this.secondColor.name;
            let opantone = getClosestColor(this.secondColor.value);
            if(opantone && opantone.pantone && opantone.pantone != 'undefined'){
              outLine_color_pantone = opantone.pantone;
            }


            let text = {
              text: '',
              type: productName.type,
              width: productName.width,
              height: productName.height,
              x_axis: productName.x_axis,
              y_axis: productName.y_axis,
              rotation: productName.rotation,
              haveControls: Boolean(!productName.is_locked),
              outlineEnabled: Boolean(productName.outline_enabled),
              side: productName.side,
              fontFamily: this.fontOptions[0] ? this.fontOptions[0].value : '',
              fillColor: this.firstColor.value,
              fillColorPantone: fill_color_pantone,
              outLineColor: this.secondColor.value,
              outLineColorPantone: outLine_color_pantone,
              outLineWidth: 0,
              selectColor: false
            }
            await this.$store.dispatch('setCustomTexts', {index: index, text: text,prd_id:product.id})
          }
        })
      }


    });

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
      let fontUrl = this.storageUrl + fonts.file_url
      const headElement = document.querySelector('head') as Record<any, any>
      let style_tag = document.createElement('style')
      style_tag.innerHTML = "@font-face{font-family: " + font.value + "; src: url('" + fontUrl + "')}"
      headElement.appendChild(style_tag)
      $("#app").append('<p id="delete_after_load" style="visibility: hidden; font-family: '+font.value+'">aa</p>')
      setTimeout(() => {
        $("#delete_after_load").remove()
      }, 100)
    })
  }

  public addTab(index: number) {
    let text = {
      text: '',
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
      outLineWidth: 0
    }
    this.$store.dispatch('setCustomTexts', {index: this.customTexts.length, text: text,prd_id:this.selectedProduct.id})
  }
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

.scroll-area {
  position: relative;
  max-height: 73vh;
  overflow-y: auto;
}

.myscroll{
  height: calc(100vh - 220px);
  overflow-y: auto;

  &::-webkit-scrollbar{
    width: 3px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  &::-webkit-scrollbar-thumb {
    background: #219F84;
  }

  scrollbar-color: #219F84 #f1f1f1;
  scrollbar-width: thin;
}
</style>
