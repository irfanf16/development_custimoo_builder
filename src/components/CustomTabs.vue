<template>
  <div>
    <div class="customize_controls" :class="{'other_tab': this.showOtherTab}" v-if="this.$store.getters.getActiveTab === 0 && selectedProduct.is_logo_allowed">
<!--      <span class="close" @click="this.hideAll"><BIconX /></span>-->
      <span class="close minimizer" @click="this.hideAll"><b-icon-dash /></span>
      <span class="dragControl" @dblclick="setMinMax(0)" v-touch:start="setPlayersDataHeight(0)" v-touch-options="{touchClass: 'active'}" v-touch:moving="resizeTab(0)"></span>

      <div>
        <LogoUploader @showOther="updateOtherTab" :numberOfLogosAllowed="selectedProduct.allowed_logos_count" :logosSetting="selectedProduct.logos_setting"/>
      </div>
    </div>
    <div class="customize_controls pt-4" :class="{'other_tab': this.showOtherTab}" v-if="this.$store.getters.getActiveTab === 1" >
<!--      <span class="close" @click="this.hideAll"><BIconX /></span>-->
      <span class="close minimizer" @click="this.hideAll"><b-icon-dash /></span>
      <span class="dragControl" @dblclick="setMinMax(0)" v-touch:start="setPlayersDataHeight(0)" v-touch-options="{touchClass: 'active'}" v-touch:moving="resizeTab(0)"></span>

      <div class="grid gap-1 text-left">
<!--        <div class="mobile_controls">-->
<!--          <label>Color C</label>-->
<!--        </div>-->
<!--        <div class="mobile_controls">-->
<!--          <label>Apply to</label>-->
<!--        </div>-->

        <div class="overflow-hidden mt-2 fade-right">
          <ul class="mobile-nav horizontal active_underline hide-scroll pr-4">
            <li v-for="(svgColor, index) in svgGroups" :key="index">
              <a style="text-transform: capitalize" :class="activePart == index ? 'active_line' : ''" @click="setActivePart(index)">{{ svgColor.id }}</a>
            </li>
          </ul>
        </div>
        <div class="d-flex align-items-center">
          <div style="color: #666;">Selected color:</div>
          <div class="d-flex align-items-center">
            <span class="selected-color ml-2 flex-shrink-0" :style="{background: svgGroups[activePart].color}"></span>
            <div class="m-1 text-muted">
              <span>{{ svgGroups[activePart].pantone }}</span>
              <span style="text-transform: uppercase" class="ml-1">{{ svgGroups[activePart].name }}</span>
            </div>
          </div>
        </div>
        <div class="overflow-hidden fade-right">
          <ul class="mobile-nav horizontal active_underline hide-scroll pr-4">
            <li v-for="(colorName, index) in productColors" :key="index">
              <a class="faded_text text-capitalize" :class="activeCollection == index ? 'active_dark' : ''" @click="setActiveCollection(index)">{{colorName.name}}</a>
            </li>

            <li  v-if="selectedProduct.is_custom_color_allowed">
              <a class="faded_text text-capitalize" @click="showOther">Other</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-2 overflow-auto hide-scroll d-flex gap-1" style="padding:6px">
        <div class="color_circle" :key="index" v-for="(color, index) in (typeof productColors[activeCollection].color_text === 'string' ? JSON.parse(productColors[activeCollection].color_text) : productColors[activeCollection].color_text)" :style="{background: color.value, boxShadow: `0 0 0 3px white, 0 0 0 4px ${color.value}`}" @click="setColor(color)"></div>
      </div>

      <div v-if="showOtherColors && selectedProduct.is_custom_color_allowed" class="mobile-other">
        <span class="close" @click="hideOther"><BIconX /></span>
        <color-picker :colors-default="[]" @changeColor="changeColor" theme="light" :color="color" :sucker-hide="true"/>
      </div>
    </div>
    <div class="customize_controls pt-4" :class="{'other_tab': this.showOtherTab}" v-if="this.$store.getters.getActiveTab === 2 && selectedProduct.allow_name_number">
<!--      <span class="close" @click="this.hideAll"><BIconX /></span>-->
      <span class="close minimizer" @click="this.hideAll"><b-icon-dash /></span>
      <span class="dragControl" @dblclick="setMinMax(1)" v-touch:start="setPlayersDataHeight(1)" v-touch-options="{touchClass: 'active'}" v-touch:moving="resizeTab(1)"></span>

      <div class="mt-2"></div>
      <TextCustomization
        @showOther="updateOtherTab"
        ref="custom-text-mobile"
        :productFonts="selectedProduct.namefonts" :selectedProductID="selectedProduct.id"
        :fontsColors="fontsColors" :firstColor="firstColor" :secondColor="secondColor" :fontOptions="fontOptions" />
    </div>
    <div class="customize_controls pt-4" :class="{'other_tab': this.showOtherTab}" v-if="this.$store.getters.getActiveTab === 3" >
<!--      <span class="close" @click="this.hideAll"><BIconX /></span>-->
      <span class="close minimizer" @click="this.hideAll"><b-icon-dash /></span>
      <span class="dragControl" @dblclick="setMinMax(2)" v-touch:start="setPlayersDataHeight(2)" v-touch-options="{touchClass: 'active'}" v-touch:moving="resizeTab(2)"></span>
      <div class="mt-2"></div>

      <Collars :productModels="productModels"/>
    </div>
    <div class="customize_controls players-data pt-4" :class="{'setMax': !playersDataHeight}" v-show="this.$store.getters.getActiveTab === 4">
<!--      <span class="close" @click="this.hideAll"><BIconX /></span>-->
      <span class="close minimizer" @click="this.hideAll"><b-icon-dash /></span>
      <span class="dragControl" @dblclick="setMinMax(3)" v-touch:start="setPlayersDataHeight(3)" v-touch-options="{touchClass: 'active'}" v-touch:moving="resizeTab(3)"></span>

      <div class="d-flex mt-2 flex-column h-100">
        <div class="d-flex align-items-center justify-content-between fs-2 font-weight-bold">
            <template v-if="isCustomerAuthenticated">
              <template v-if="$store.getters.getUpdateOrderItemProducts == null">
                <span v-if="this.ref['edit-roster'] && !this.ref['edit-roster'].$refs['order-details'].isLoading" :disabled="canvasImage.scene == null" @click="addToCart" class="addPlayer"><span class="fs-2 icon position-absolute"><b-icon-cart /></span> <span class="d-inline-block ml-1">
                  Add to cart
                </span></span>
                <span v-else class="addPlayer" style="background: #a9a9a9; color: #fff"><span class="fs-2 icon position-absolute"><i class="fa fa-spinner fa-spin"></i></span> <span class="d-inline-block ml-1">
                  Please wait
                </span></span>
              </template>
            </template>
            <template v-else>
              <span v-b-modal.modal-login @click="setActionBeforeLogin('addToCart')" :key="'loginmodal'" class="addPlayer"><span class="fs-2 icon position-absolute"><b-icon-cart /></span> <span class="d-inline-block ml-1">
                Add to cart
              </span></span>
            </template>
          <span class="addPlayer" @click="shareRoster"><span class="fs-2 icon position-absolute"><BIconShare /></span> <span class="d-inline-block ml-1">Share Roster Link</span></span>
        </div>
        <div class="players-table mt-2 hide-scroll h-100">
          <RosterTableMobile :productSizes="productSizes" ref="mobile-roster" @addPlayer="rosterDetailsInit" />
        </div>
      </div>
    </div>
    <div class="open-logo-uploader customize_controls d-flex align-items-center gap-1" v-if="!maximized" style="top: auto">
      <span v-html="tabIcons[sideTabIndex]" class="fs-4 d-inline-flex" style="line-height: normal; color: #219F84; padding-bottom: 2px;"></span>
      <span class="fs-3 font-weight-bold d-inline-flex pb-0">
        {{ tabTitles[sideTabIndex] }}
      </span>
      <span @click="maximizeTab(sideTabIndex)" class="maximizer close">
        <svg height="1em" width="1em" fill="currentColor" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
             viewBox="0 0 16 16">
          <polygon points="0,11.8 0,0 11.8,0 "/>
          <polygon points="16,4.3 16,16 4.3,16 "/>
        </svg>
      </span>
    </div>
    <EditRosterAreaTab v-show="false" @open-add-to-locker="openAddToLocker" ref="edit-roster" :productSizes="productSizes"/>
  </div>
</template>

<script lang="ts">
import {Component, Prop, PropSync, Vue, Watch} from 'vue-property-decorator'
// import ColorAccordion from '@/components/ColorAccordion.vue'
// import LogoPlacementTabs from './LogoPlacementTabs.vue'
// import CustomizationText from '@/components/CustomizationText.vue'
// import CollarStyle from '@/components/CollarStyle.vue'
// import EditRosterArea from '@/components/EditRosterArea.vue'
// import UploadLogo from '@/components/UploadLogo.vue'
// import ColorTabs from '@/components/ColorTabs.vue'
import {default as $} from 'jquery';
import TextCustomization from "@/components/mobile/TextCustomization.vue";
import Collars from "@/components/mobile/Collars.vue";
import {getClosestColor} from "@/pantoneColor";
import readXlsxFile from "read-excel-file";
import LogoUploader from "@/components/mobile/LogoUploader.vue";
import RosterTableMobile from "@/components/mobile/RosterTableMobile.vue";
import {http} from "@/httpCommon";
import EditRosterAreaTab from '@/components/EditRosterAreaTab.vue'
import ErrorMessages from "@/mixins/ErrorMessages";
import {getRosterDetailDefaultObject} from "@/helpers/Helpers";

@Component<CustomTabs>({
  components: {
    LogoUploader,
    TextCustomization,
    EditRosterAreaTab,
    Collars,
    RosterTableMobile
    // ColorAccordion,
    // LogoPlacementTabs,
    // CustomizationText,
    // CollarStyle,
    // EditRosterArea,
    // ColorTabs,
    // UploadLogo
  },
  async mounted() {
    this.productColorsManipulation()
    this.fontsColorsManipulation()
    this.fontsList()
    let tabIndex = this.selectedProduct.is_logo_allowed ? 0 : 1
    this.switchTabs(tabIndex)
    console.log('this', this)
  }
})

export default class CustomTabs extends Vue {
  @Prop() activeTab!: number
  @Prop() sideTabIndex!: number
  @Prop() maximized!: boolean
  @Prop() tabIcons!: Record<any, any>
  private showOtherTab = false
  private activePart = 0;
  private activeCollection = 0;
  private activeFont = 0;
  private activeEye = -1;
  private playersDataHeight = 0;
  public productColors: any[] = []
  public fontsColors: any[] = []
  public firstColor!: Record<any, any>
  public secondColor!: Record<any, any>
  public fontOptions: Record<any, any>[] = []
  public color = '#59c7f9'
  public showOtherColors = false
  public pantoneColorVal= '13-4411'
  // privat tabTop = window.screen.availHeight - 190;
  public id = 0
  public custom_arr: Record<any, any>[] = [];
  public sizeOptions: Record<any, any>[] = []
  public fileData: Record<any, any>[] = []
  public ref = this.$refs as Record<any, any>
  public frontImage = ''
  public backImage = ''
  public productName = ''
  public showLoader = false
  public designsIndex = 0;
  private tabTitles = [
    'Logo Uploader',
    'Change Colors',
    'Add Text',
    'Variants',
    'Roster Details',
  ]

  private shareRoster() {
    if(this.isCustomerAuthenticated){
      this.ref['edit-roster'].$refs['order-details'].getLockers()
    }else{
      this.gotoLogin()
    }
  }

  private log(text:any){
    console.log(text)
  }

  get company(): Record<any, any>{
    return this.$store.getters.getCompany
  }

  public openAddToLocker () {
    this.$emit('open-add-to-locker')
  }

  private addToCart() {
    (this.$root.$refs as Record<any,any>).Order_Details.addToCart()
  }

  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  get canvasImage() {
    return this.$store.getters.getCanvasImage
  }

  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails()
  }

  public async setActionBeforeLogin(type: string) {
    this.$store.commit("ACTION_BEFORE_LOGIN", type);
    this.$store.commit('SET_SELECTION_MODE',{
      readonly:false,
      collectionAddmoreMode:false,
      eventProductMode:false,
      eventCollectionMode:false
    })
    this.gotoLogin()
  }
  public gotoLogin(){
    if (this.company.platform == 'self'){
      this.$modal.show('loginModal')
    }
    else{
      if(this.company.login_code.type == 'url') {
        window.location.href = this.company.login_code.action
      } else {
        eval(this.company.login_code.action)
      }
    }
  }

  public rosterDetailsInit(index = 0, p_id = 0) {
    let payload = getRosterDetailDefaultObject()
    if(this.sizeOptions.length > 0) {
      payload.size = this.sizeOptions[0].text;
      payload.code = this.sizeOptions[0].value;
    }
    let product_id = this.selectedProduct.id
    if (p_id){
      product_id = p_id
    }
    this.$store.dispatch('setRosterDetails', { pid : product_id, index: index, roster: payload })
  }

  get productSizes(){
    let cumulative_size:Record<any,any> = [];
    Object.values(this.selectedProduct.sizes).forEach((value: any)=>{
      if(Object.prototype.hasOwnProperty.call(value as Record<any,any>,'json_data')){
        cumulative_size.push(JSON.parse(value.json_data));
      }
    })
    let sizes = [] as Record<any,any>;
    if(cumulative_size.length > 0){
      cumulative_size.forEach((size_array:Record<any,any>) => {
        if(size_array.length > 0){
          size_array.forEach((size:Record<any,any>) => {
            sizes.push(size);
          })
        }
      })
    }
    return sizes;
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

  private setPlayersDataHeight = (idx: number) => {
    return (e:Record<any, any>) => {
      let element = document.querySelectorAll('.customize_controls') as Record<any, any>;
    }
  }

  private setMinMax = (idx: number) => {
    let element = document.querySelector('.customize_controls') as Record<any, any>;

    if(!element){
      let shadow_dom = (this.$root as Record<any,any>).$options.shadowRoot;
      element = shadow_dom.querySelector('.customize_controls') as Record<any, any>;
    }

    if(element.clientHeight <= (window.screen.availHeight/2)){
      element.style.top = 15 + 'px';
      element.classList.remove('setMax')
    }else{
      element.style.top = 'auto';
      element.classList.add('setMax')
    }
  }

  private updateOtherTab(value:boolean){
    this.showOtherTab = value
  }

  public setColor(color: Record<any, any>) {
    this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.groupColors)), action: 'groupColor' })
    this.$store.dispatch('updateGroupColors',
      {
        index: this.svgGroups[this.activePart].id,
        color: color.value,
        pantone: color.pantone,
        name: color.name
      })
  }

  private resizeTab(idx: number){
    return (e:Record<any, any>) => {
      let cursorPosition = e.changedTouches[0].clientY;
      if(cursorPosition <= 15){
        cursorPosition = 15
      }else if(cursorPosition >= window.screen.availHeight - 190){
        cursorPosition = window.screen.availHeight - 190
      }
      this.playersDataHeight = cursorPosition;
      // if (cursorPosition < this.oldCursor) {
      //   this.direction = "up"
      // } else if (cursorPosition > this.oldCursor) {
      //   this.direction = "down"
      // }
      // this.tabTop = cursorPosition;
      let element = document.querySelector('.customize_controls') as Record<any, any>;
      if(!element){
        let shadow_dom = (this.$root as Record<any,any>).$options.shadowRoot;
        element = shadow_dom.querySelector('.customize_controls') as Record<any, any>;
      }
      element.style.top = cursorPosition + 'px';
    }
  }

  private setActivePart(index:number){
    this.activePart = index;
  }
  private setActiveCollection(index:number){
    this.activeCollection = index;
  }
  private setActiveFont(index:number){
    this.activeFont = index;
  }

  private setActiveEye(index:number){
    if (this.activeEye == index){
      this.activeEye = -1
    }else{
      this.activeEye = index;
    }
  }

  private selected = null
  private options = [
    { value: null, text: 'Please select an option' },
    { value: 'a', text: 'This is First option' },
    { value: 'b', text: 'Selected Option' },
    { value: { C: '3PO' }, text: 'This is an option with object value' },
    { value: 'd', text: 'This one is disabled', disabled: true }
  ]

  private hideAll(){
    if(this.sideTabIndex === 4){
      this.ref['edit-roster'].updateText();
    }
    this.$emit('maximizeTab', -1, false)
  }

  private maximizeTab(){
    this.$emit('maximizeTab', this.sideTabIndex, true)
  }

  private switchTabs(ind:number){
    this.$emit('switchTabs', ind, false)
  }

  private showOther(){
    this.showOtherColors = true
    this.showOtherTab = true
  }
  private hideOther(){
    this.showOtherColors = false
    this.showOtherTab = false
  }

  public hideOtherTab(){
    this.showOtherTab = false
  }

  get svgGroups() {
    return this.$store.getters.getSvgGroups
  }
  get groupColors(){
    return this.$store.getters.getGroupColors
  }
  // public showColor(index: number) {
  //   this.selectAccordionIndex = index
  // }

  @Watch('lockerColors', {
    deep: false
  })

  lockerColorsChanged() {
    this.productColorsManipulation()
  }

  public productColorsManipulation() {
    this.productColors = []
    this.selectedProduct.colors.forEach((colors: any, key: number) => {
      let finalColor = {color_text: [], selectedColor: "", name: colors.file_name.substr(0, colors.file_name.indexOf('.'))}
      finalColor.color_text = JSON.parse(colors.json_data)
      this.productColors = this.productColors.concat(finalColor)
    })
    this.productColors = this.productColors.concat(this.lockerColors)

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
      finalColor.color_text = JSON.parse(colors.json_data)
      this.fontsColors = this.fontsColors.concat(finalColor)
    })
    if (this.fontsColors.length) {
      this.firstColor = this.fontsColors[0].color_text[0]
      this.secondColor = this.fontsColors[0].color_text? this.fontsColors[0].color_text[1] : this.fontsColors[0].color_text[0]
    }
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
  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }
  //
  get productModels(): Record<any, any> {
    return this.$store.getters.getProductModels;
  }
  //
  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts
  }
  //
  get productNames() {
    return this.$store.getters.getSelectedProduct.productnames;
  }
  //
  get logoColors(): [] {
    return this.$store.getters.getLogosColors
  }
  //
  // public tabIndex = 0
  //
  // public productColors: any[] = []
  // public fontsColors: any[] = []
  // public firstColor!: Record<any, any>
  // public secondColor!: Record<any, any>
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  //
  // get hideTab(): Record<any, any> {
  //   return this.$store.getters.getHideTab
  // }
  get lockerColors(){
    return this.$store.getters.getLockerColors
  }

  public fontsList(): void {
    let productFonts = this.selectedProduct.namefonts
    let shadow_dom = (this.$root as Record<any,any>).$options.shadowRoot;
    if (productFonts.length){
      let item = JSON.parse(productFonts[0].json_data)
      if(item) {
        this.fontOptions = []
        item.forEach((fonts: any, key: number) => {
          let fontNameParam = fonts.path.split('/').reverse()
          fontNameParam = fontNameParam[0].split('.')
          let fontName = fontNameParam[0].replace('-', ' ').toUpperCase()
          let font = {
            value: fontNameParam[0] as string,
            text: fontName as string
          }
          let hasMatch = false;
          for (let index = 0; index < this.fontOptions.length; ++index) {
            let obj = this.fontOptions[index];
            if(obj.text == font.text){
              hasMatch = true;
              break;
            }
          }
          if (!hasMatch){
            this.fontOptions.push(font)
          }
          let fontUrl = this.storageUrl + fonts.path
          const headElement = document.querySelector('head') as Record<any, any>
          let style_tag = document.createElement('style')
          style_tag.innerHTML = "@font-face{font-family: " + font.value + "; src: url('" + fontUrl + "')}"
          headElement.appendChild(style_tag)
          if (shadow_dom) {
            $(shadow_dom).append('<p id="delete_after_load" style="visibility: hidden; font-family: ' + font.value + '">aa</p>')
            setTimeout(() => {
              $(shadow_dom).find("#delete_after_load").remove()
            }, 100)
          }else {
            $('#santa').append('<p id="delete_after_load" style="visibility: hidden; font-family: ' + font.value + '">aa</p>')
            setTimeout(() => {
              $("#delete_after_load").remove()
            }, 100)
          }
        })
      }
    }
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
      name_of_placement: this.selectedProduct.productnames[0].name_of_placement,
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
    this.$store.dispatch('setCustomTexts', {index: this.customTexts.length, text: text})
  }

  public changeColor(color: Record<any, any>) {
    let pantoneColor = getClosestColor(color.hex)
    this.setColor({value: pantoneColor.hex, name: pantoneColor.pantone})
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

.read_more{
  transform: rotate(0deg); transition: 0.2s all ease; display: inline-block;
}

.fontList{
  div{
    color: #999;

    &.activeFont{
      color: #121212;
      font-weight: bold;
    }
  }
}


.dragControl{
  position: absolute;
  height: 13px;
  width: 100px;
  top: 7px;
  left: 0;
  right: 0;
  margin: 0 auto;
  background: #dbdbdb;
  border-radius: 10px;
  z-index: 10;
  box-shadow: 1px 1px 0 0px #ccc, inset 0 0 3px 1px #eee;
}
.dragControl.active{
  background: lightblue;
  box-shadow: 1px 1px 0 0px #ccc, inset 0 0 3px 1px aliceblue;
}
.selected-color{
  height: 15px;
  width: 15px;
  border-radius: 10000px;
  background: transparent;
  display: inline-block;
  box-shadow: 0px 1px 5px rgba(0,0,0,0.4);
}
</style>
