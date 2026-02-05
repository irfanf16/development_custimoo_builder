<template>
  <div>
    <div class="customize_controls" :class="{'other_tab': this.showOtherTab}" v-if="this.$store.getters.getActiveTab === 0 && selectedProduct.is_logo_allowed">
      <span class="close minimizer" @click="this.hideAll"><b-icon-dash /></span>
      <span class="dragControl" @dblclick="setMinMax(0)" v-touch:start="setPlayersDataHeight(0)" v-touch-options="{touchClass: 'active'}" v-touch:moving="resizeTab(0)"></span>

      <div>
        <LogoPlacementMobile @showOther="updateOtherTab" :numberOfLogosAllowed="selectedProduct.allowed_logos_count" :logosSetting="selectedProduct.logos_setting"/>
      </div>
    </div>
    <div class="customize_controls pt-4" :class="{'other_tab': this.showOtherTab}" v-if="this.$store.getters.getActiveTab === 1" >
      <span class="close minimizer" @click="this.hideAll"><b-icon-dash /></span>
      <span class="dragControl" @dblclick="setMinMax(0)" v-touch:start="setPlayersDataHeight(0)" v-touch-options="{touchClass: 'active'}" v-touch:moving="resizeTab(0)"></span>

      <ColorAccordionMobile @showOther="updateOtherTab" :productColors="productColors" :key="selectedProduct.id" />
      <div class="my-1 px-2" v-if="customSvgGroups.length">
        <custom-svg-groups />
      </div>
    </div>
    <div class="customize_controls pt-4" :class="{'other_tab': this.showOtherTab}" v-if="this.$store.getters.getActiveTab === 2 && selectedProduct.allow_name_number">
      <span class="close minimizer" @click="this.hideAll"><b-icon-dash /></span>
      <span class="dragControl" @dblclick="setMinMax(1)" v-touch:start="setPlayersDataHeight(1)" v-touch-options="{touchClass: 'active'}" v-touch:moving="resizeTab(1)"></span>

      <div class="mt-2"></div>
      <TextCustomization
        @showOther="updateOtherTab"
        ref="custom-text-mobile"
        :productFonts="selectedProduct.namefonts" :selectedProductID="selectedProduct.id"
        :fontsColors="fontsColors" :fontOptions="fontOptions" />
    </div>
    <div class="customize_controls pt-4" :class="{'other_tab': this.showOtherTab}" v-if="this.$store.getters.getActiveTab === 3" >
      <span class="close minimizer" @click="this.hideAll"><b-icon-dash /></span>
      <span class="dragControl" @dblclick="setMinMax(2)" v-touch:start="setPlayersDataHeight(2)" v-touch-options="{touchClass: 'active'}" v-touch:moving="resizeTab(2)"></span>
      <div class="mt-2"></div>

      <Collars/>
    </div>
    <div class="customize_controls players-data pt-4" :class="{'setMax': !playersDataHeight}" v-show="this.$store.getters.getActiveTab === 4" :style="{'top': `${screenHeight/1.3}px`}">
      <span class="close minimizer" @click="this.hideAll"><b-icon-dash /></span>
      <span class="dragControl" @dblclick="setMinMax(3)" v-touch:start="setPlayersDataHeight(3)" v-touch-options="{touchClass: 'active'}" v-touch:moving="resizeTab(3)"></span>

      <div class="d-flex mt-2 flex-column h-100">
        <div class="d-flex align-items-center justify-content-between fs-2 gap-2 font-weight-bold">
            <template v-if="isCustomerAuthenticated">
              <template v-if="canAccessCompanyFeatures()">
                <template v-if="$store.getters.getUpdateOrderItemProducts == null">
                  <span v-if="!cartLoading" :disabled="canvasImage.scene == null" @click="addToCart" class="addPlayer no-icon">
                    <span class="fs-2 icon position-absolute" v-if="false"><b-icon-cart-plus /></span> <span class="d-inline-block ml-1">
                    Add to cart
                    </span>
                  </span>
                  <span v-else class="addPlayer no-icon" style="background: #a9a9a9; color: #fff">
                    <span class="fs-2 icon position-absolute" v-if="false"><i class="fa fa-spinner fa-spin"></i></span> <span class="d-inline-block ml-1">
                      Please wait
                    </span>
                  </span>
                </template>
              </template>
            </template>
            <template v-else>
              <template v-if="company.platform !== 'self'">
                <span v-b-modal.modal-login @click="$eventBus.$emit('setActionBeforeLogin', 'addToCart')" :key="'loginmodal'" class="addPlayer no-icon">
                  <span class="fs-2 icon position-absolute" v-if="false"><b-icon-cart-plus /></span> <span class="d-inline-block ml-1">
                    Add to cart
                  </span>
                </span>
              </template>
              <template v-else>
                <span v-b-modal.modal-login @click="$eventBus.$emit('setActionBeforeLogin', 'addToCart')" :key="'loginmodal'" class="addPlayer no-icon">
                  <span class="fs-2 icon position-absolute" v-if="false"><b-icon-cart-plus /></span> <span class="d-inline-block ml-1">
                    Add to cart
                  </span>
                </span>
              </template>
            </template>
          <span class="addPlayer no-icon" @click="shareRoster"><span class="fs-2 icon position-absolute" v-if="false"><BIconShare /></span> <span class="d-inline-block ml-1">Share {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}}</span></span>
          <span class="addPlayer no-icon" @click="downloadTemplate(selectedProduct.id)">
            <span v-if="false" class="fs-2 icon position-absolute"><BIconDownload /></span>
            Download roster excel template
          </span>

          <span v-if="!showLoader" class="addPlayer no-icon excelFileUploader">
            <span class="fs-2 icon position-absolute" v-if="false"><BIconFileEarmarkExcel /></span>
            Upload roster excel template
            <form name="upload_excel" ref="upload_excel">
              <input type="file" @input="uploadExcelFile($event)">
            </form>
          </span>
          <span v-else class="addPlayer no-icon" style="background: #a9a9a9; color: #fff">
            <span v-if="false" class="fs-2 icon position-absolute"><BIconDownload /></span>
            Please wait
          </span>
        </div>
        <div class="players-table mt-2 theme-scroll-v h-100">
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
    <EditRosterAreaTab v-show="false" @open-add-to-locker="openAddToLocker" ref="edit-roster" :productSizes="productSizes" :products_fonts="products_fonts" />
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop, PropSync, Vue, Watch} from 'vue-property-decorator'
import {default as $} from 'jquery';
import TextCustomization from "@/components/mobile/TextCustomization.vue";
import Collars from "@/components/mobile/Collars.vue";
import {getClosestColor} from "@/pantoneColor";
import readXlsxFile from "read-excel-file";
import LogoPlacementMobile from "@/components/Logo/LogoPlacementMobile.vue";
import RosterTableMobile from "@/components/mobile/RosterTableMobile.vue";
import {http} from "@/httpCommon";
import EditRosterAreaTab from '@/components/EditRosterAreaTab.vue'
import ErrorMessages from "@/mixins/ErrorMessages";
import {getRosterDetailDefaultObject, getSelectedProductPantones, getDomDocument, downloadTemplate, canAccessCompanyFeatures} from "@/helpers/Helpers";
import {cartModalData, RosterDetailsGlobal} from "@/mixins/LockerProduct";
import ModalAction from "@/mixins/ModalAction";
import CustomizationTabsMixin from '../mixins/CustomizationTabsMixin'
import ColorAccordionMobile from "@/components/mobile/ColorAccordionMobile.vue";
import RosterTabMixin from "@/mixins/RosterTabMixin";
import CustomSvgGroups from "./CustomSvgGroups.vue";


@Component<CustomTabs>({
  components: {
    ColorAccordionMobile,
    LogoPlacementMobile,
    TextCustomization,
    EditRosterAreaTab,
    Collars,
    RosterTableMobile,
    CustomSvgGroups
  },
  async mounted() {
    this.productColorsManipulation()
    this.fontsColorsManipulation()
    this.fontsList()
    let tabIndex = this.selectedProduct.is_logo_allowed ? 0 : 1
    this.switchTabs(tabIndex);
    this.screenHeight = window ? window.screen.availHeight : 0;
  }
})

export default class CustomTabs extends Mixins(cartModalData, CustomizationTabsMixin, RosterDetailsGlobal, RosterTabMixin) {
  @Prop({ required: true }) readonly products_fonts!: Record<any, any>[]
  @Prop() activeTab!: number
  @Prop() sideTabIndex!: number
  @Prop() maximized!: boolean
  @Prop() tabIcons!: Record<any, any>
  
  get customSvgGroups(): Record<any, any>[] {
    return this.$store.getters.getCustomSvgGroups || []
  }
  private activeFont = 0;
  private activeEye = -1;
  private playersDataHeight = 0;
  public fontsColors: any[] = []
  public fontOptions: Record<any, any>[] = []
  public id = 0
  public custom_arr: Record<any, any>[] = [];
  public sizeOptions: Record<any, any>[] = []
  public fileData: Record<any, any>[] = []
  public ref = this.$refs as Record<any, any>
  private showOtherTab = false
  public productName = ''
  public showLoader = false
  public designsIndex = 0;
  public screenHeight = 0;
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
    this.handleRosterItemFocus(0);

    setTimeout(()=>{
      this.addToCartMixin(this.products_fonts);
    },500)
  }

  get cartLoading(): Record<any, any> {
    return this.$store.getters.getCartLoading;
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

  get customerPermissions(){
    return this.$store.getters.getCustomerPermissions
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
    }
    let product_id = this.selectedProduct.id
    if (p_id){
      product_id = p_id
    }
    this.$store.dispatch('setRosterDetails', { pid : product_id, index: index, roster: payload })
  }

  get productSizes(){
    const sizes:Record<any, any>[] = [];
    this.selectedProduct.sizes[0].json_data.forEach((item)=>{
      sizes.push({
        text: item.name,
        value: item.name,
      })
    })
    return sizes;
  }

  public downloadTemplate = downloadTemplate;
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
      alert("The Excel file that was uploaded cannot be read, or it does not adhere to the template format. Please download the Excel template located next to the upload field, input your data there, and then attempt the upload again.");
      return false
    }
    readXlsxFile(files).then((rows: any[][]) => {
      if (rows[0].length != 8){
        alert("The Excel file that was uploaded cannot be read, or it does not adhere to the template format. Please download the Excel template located next to the upload field, input your data there, and then attempt the upload again.")
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
        alert("The Excel file that was uploaded cannot be read, or it does not adhere to the template format. Please download the Excel template located next to the upload field, input your data there, and then attempt the upload again.");
      }
    })
  }

  public homeScreen(){
    this.$router.push('/')
  }
  public canAccessCompanyFeatures(): boolean {
    return canAccessCompanyFeatures()
  }

  private setPlayersDataHeight = (idx: number) => {
    return (e:Record<any, any>) => {
      const main_doc = getDomDocument() as Record<any, any>
      let element = main_doc.querySelectorAll('.customize_controls') as Record<any, any>;
    }
  }

  private setMinMax = (idx: number) => {
    const main_doc = getDomDocument() as Record<any, any>
    let element = main_doc.querySelector('.customize_controls') as Record<any, any>;

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

  private resizeTab(idx: number){
    return (e:Record<any, any>) => {
      let cursorPosition = e.changedTouches && e.changedTouches[0].clientY;
      if(cursorPosition <= 15){
        cursorPosition = 15
      }else if(cursorPosition >= window.screen.availHeight - 190){
        cursorPosition = window.screen.availHeight - 190
      }
      this.playersDataHeight = cursorPosition;
      const main_doc = getDomDocument() as Record<any, any>
      let element = main_doc.querySelector('.customize_controls') as Record<any, any>;
      if(!element){
        let shadow_dom = (this.$root as Record<any,any>).$options.shadowRoot;
        element = shadow_dom.querySelector('.customize_controls') as Record<any, any>;
      }
      element.style.top = cursorPosition + 'px';
    }
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
    this.$emit('maximizeTab', -1, false)
  }

  private maximizeTab(){
    this.$emit('maximizeTab', this.sideTabIndex, true)
  }

  private switchTabs(ind:number){
    this.$emit('switchTabs', ind, false)
  }

  get groupColors(){
    return this.$store.getters.getGroupColors
  }

  @Watch('lockerColors', {
    deep: false
  })

  lockerColorsChanged() {
    this.productColorsManipulation()
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts
  }

  get productNames() {
    return this.$store.getters.getSelectedProduct.productnames;
  }

  get logoColors(): [] {
    return this.$store.getters.getLogosColors
  }

  get lockerColors(){
    return this.$store.getters.getLockerColors
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
