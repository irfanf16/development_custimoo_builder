<template>
  <div class="page-wrapper m-lg-4" v-cloak>
    <meta name="viewport" content="width=device-width">
    <div class="loader global" v-if="showLoader && getUrlParams"><img src="../../src/assets/images/loading.gif" /></div>
    <b-container fluid>
      <b-row>
        <template v-if="selectedProduct">
          <b-col v-if="manageComponents.CustomizationTabs" cols="12" lg="3" class="text-left border-right py-lg-3">
            <CustomizationTabs :tabIndexNew="this.$store.getters.getMainTab" @tabIndexChange="changeTabs"/>
          </b-col>

        <b-col v-if="manageComponents.CustomizationPreview" cols="12" lg="6" class="preview-column">
          <template>
            <div class="customization-preview-process w-100">
              <header class="preview-area-header py-2 py-lg-4">
                <div class="buttons-preview text-left">
                  <template v-if="isCustomerAuthenticated">
                    <b-button :key="'lockerRoom'" @click="getLockerRoomProducts" variant="outline-secondary">Locker room</b-button>
                  </template>
                  <template v-else>
                    <b-button @click="setActionBeforeLogin('lockerRoom')" :key="'loginmodal'" variant="outline-secondary" v-b-modal.modal-login>Locker room</b-button>
                  </template>
                  <LockerRoomModal @showCollectionModal="this.showCollectionModal" @editCollectionModal="this.editCollectionModal" ref="lockerModal"  />
                  <DesignCollectionModal @showLockerRoomModal="this.showLockerRoomModal" ref="collectionModal"  />
                  <template v-if="isCustomerAuthenticated">
                    <b-button :key="'savetolocker'" variant="outline-secondary"  @click="getLockers">Save to locker room</b-button>
                  </template>
                  <template v-else>
                    <b-button @click="setActionBeforeLogin('saveToLockerRoom')" :key="'loginmodalsavelockerroom'" variant="outline-secondary" v-b-modal.modal-login>Save to locker room</b-button>
                  </template>
                  <AddLockerRoomModal @open-locker-room="getLockerRoomProducts" v-if="!editProductStatus" ref="saveToLockerModal" :close_on_add="false"/>
                  <template v-if="isCustomerAuthenticated">
                    <b-button :key="'summarybutton'" variant="outline-secondary" @click="buyNow">Summary</b-button>
                  </template>
                  <template v-else>
                    <b-button @click="setActionBeforeLogin('summary')" :key="'loginmodalsummary'" variant="outline-secondary" v-b-modal.modal-login>Summary</b-button>
                  </template>
                </div>
                <ul class="preview-header-icons">
                  <li class="d-flex flex-wrap align-items-center">
                    <b-button v-if="!isCustomerAuthenticated" v-b-modal.modal-login><font-awesome-icon :icon="['fas', 'user']"/></b-button>
                    <strong class="user-name">{{  isCustomerAuthenticated ? 'Hello ' + customer.first_name : '' }}</strong>
                    <b-button @click="logoutCustomer" v-if="isCustomerAuthenticated"><font-awesome-icon :icon="['fas', 'sign-out-alt']"/></b-button>
                    <LoginForm @actionAfterLogin="actionAfterLogin()" />
                  </li>
                  <li>
                    <b-button :id="'share'" @click="shareProduct(selectedProduct)">
                      <font-awesome-icon :icon="['fas', 'share-alt']"/>
                    </b-button>
                    <b-tooltip :target="'share'" custom-class="share-tooltip home-sharing" placement="bottom" triggers="focus">
                      <div class="share-holder">
                        <h3>Copy link and Share</h3>
                        <div class="share-form">
                          <b-form inline>
                            <!--                            <b-form-input :id="'copy-'+ind" :value="product.shared_url !== 'undefined'  ?  baseUrl + product.shared_url : ''"></b-form-input>-->
                            <b-form-input v-model="shared_link" id="copy-link"></b-form-input>
                            <b-button variant="primary" @click="copyLink">Copy Link</b-button>
                            <!--                            <b-button variant="primary" @click="copyLink(product, ind) ">Copy Link</b-button>-->
                          </b-form>
                        </div>
                      </div>
                    </b-tooltip>
                  </li>
                  <li><a>
                    <font-awesome-icon @click="resetStore" :icon="['fas', 'redo-alt']"/>
                  </a></li>
                </ul>
                <div class="change-product-area d-lg-none">
                  <h2>Change Product</h2>
                  <b-button @click="showDesign()" class="change-product-opener" variant="secondary"></b-button>
                </div>
              </header>
              <div class="undo-btn-area text-left pt-3">
                <b-button variant="outline-secondary  mr-2" :disabled="undoItems.length < 1" @click="undoAction">Undo</b-button>
                <b-button variant="outline-secondary" @click="redoAction" :disabled="redoitems.length < 1">Redo</b-button>
              </div>
            </div>
          </template>
          <div class="customization-area" :class="{'mobile-custom-scroll': (hideTab.logoHide || hideTab.colorHide || hideTab.textHide || hideTab.styleHide || hideTab.teamHide) }">
            <div v-bind:class="{active: isActive}">
              <div class="twoD-view">
<!--                <CustomizationPreview />-->
                <div class="main-preview p-3 d-flex flex-wrap justify-content-center align-items-center" v-if="selectedProduct">
                  <template v-for="design in selectedProduct.productstyles[styleIndex].productdesigns">
                    <div v-if="design.design_show == 1" class="image-holder" :key="'front'+design.id">
                      <Scene v-if="design.back_design" :measurement-ratio="design.measurement_ratio" ref="mainScene"
                             :front="{textureUrl: storageUrl+design.front_design.file_url, modelUrl: selectedProduct.productstyles[styleIndex].front? storageUrl+selectedProduct.productstyles[styleIndex].front.file_url : ''}"
                             :back="{textureUrl: storageUrl+design.back_design.file_url, modelUrl: selectedProduct.productstyles[styleIndex].back? storageUrl+selectedProduct.productstyles[styleIndex].back.file_url : ''}"
                             :logos="selectedProduct.productstyles[styleIndex].logo" :logosSettings="selectedProduct.logos_setting" :logoAllowed="Boolean(selectedProduct.is_logo_allowed)"
                             :logosLimit="selectedProduct.allowed_logos_count" :productNamesSetting="selectedProduct.productnames" :productColors="selectedProduct.colors"
                             :colorGrouping="JSON.parse(design.front_design.color_group)" mainPreview="true" :productType="selectedProduct.product_type" />

                      <Scene v-else class="view-back" :measurement-ratio="design.measurement_ratio" ref="mainScene"
                             :front="{textureUrl: storageUrl+design.front_design.file_url, modelUrl: selectedProduct.productstyles[styleIndex].front? storageUrl+selectedProduct.productstyles[styleIndex].front.file_url : ''}"
                             :logos="selectedProduct.productstyles[styleIndex].logo" :logosSettings="selectedProduct.logos_setting" :logoAllowed="Boolean(selectedProduct.is_logo_allowed)"
                             :logosLimit="selectedProduct.allowed_logos_count" :productNamesSetting="selectedProduct.productnames" :productColors="selectedProduct.colors"
                             :colorGrouping="JSON.parse(design.front_design.color_group)" mainPreview="true" :productType="selectedProduct.product_type" />
                    </div>
                  </template>
                </div>
              </div>
              <div class="d-none d-lg-block continue-btn-holder pt-5">
                <b-button v-if="tabIndex > 0" @click="changeTabs(tabIndex-1)" class="mx-2 px-5 back-btn" variant="secondary">Back</b-button>
                <b-button @click="changeTabs(tabIndex+1)" class="mx-2 px-5" variant="secondary" v-if="(hideColorSection && tabIndex <= 2) || (!hideColorSection && tabIndex <= 3)">Next</b-button>
                <template v-if="isCustomerAuthenticated">
                  <b-button @click="buyNow" class="mx-2 px-5" variant="secondary" v-if="(hideColorSection && tabIndex>2) || (!hideColorSection && tabIndex > 3)">Summary</b-button>
                </template>
                <template v-else>
                  <b-button @click="setActionBeforeLogin('summary')" v-b-modal.modal-login class="mx-2 px-5" variant="secondary" v-if="(hideColorSection && tabIndex>2) || (!hideColorSection && tabIndex > 3)">Summary</b-button>
                </template>
              </div>
            </div>
          </div>
        </b-col>
        <b-col v-if="manageComponents.ItemToCustomize" cols="12" lg="3">
          <ItemToCustomize :categories="categories" @retrieveProducts="retrieveProducts" @search="getSearchQuery"/>
          <button class="backtohome-btn d-lg-none" @click="showHomeLanding()"><font-awesome-icon :icon="['fas', 'arrow-left']"/></button>
        </b-col>
        </template>
      </b-row>
    </b-container>
    <confirm-modal message="Do you really want to logout?" cancel_text="Cancel" confirm_text="Yes" ref="reset-modal"></confirm-modal>
    <confirm-modal message="This will reset everything. All design changes will be lost.
 Continue?" cancel_text="Cancel" confirm_text="Reset all" ref="reset-changes"></confirm-modal>
  </div>
</template>

<script lang="ts">

import {Component, Mixins, Vue, Watch} from 'vue-property-decorator'
import ChooseColor from '@/components/ChooseColor.vue'
import CustomizationPreview from '@/components/CustomizationPreview.vue'
import ItemToCustomize from '@/components/ItemToCustomize.vue'
import ChooseInterest from '@/components/ChooseInterest.vue'
import CustomizationTabs from '@/components/CustomizationTabs.vue'
import SaveColorModal from "@/components/SaveColorModal.vue"
import UploadLogo from '@/components/UploadLogo.vue'
import LockerRoomModal from '@/components/LockerRoomModal.vue'
import AddLockerRoomModal from '@/components/AddLockerRoomModal.vue'
import ExtractedColors from '@/components/ExtractedColors.vue'
import LoginForm from '@/components/LoginForm.vue'
import {http} from "@/httpCommon"
import DesignCollectionModal from "@/components/DesignCollectionModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Scene from "@/components/Scene.vue";
import ErrorMessages from "@/mixins/ErrorMessages";

@Component<Home>({
  components: {
    ConfirmModal,
    DesignCollectionModal,
    ChooseColor,
    CustomizationPreview,
    ItemToCustomize,
    ChooseInterest,
    CustomizationTabs,
    UploadLogo,
    LockerRoomModal,
    AddLockerRoomModal,
    SaveColorModal,
    ExtractedColors,
    LoginForm,
    Scene
  },
  async mounted() {

    //get recent logos
    this.setRecentLogos()

    if (this.hideColorSection){
      this.$store.commit('hideColorSection', false)
    }

    //set jwtToken
    await this.$store.dispatch('setCustomToken');
    if (this.isAuthenticated) {
      await this.retrieveProducts()
      await this.getFillColors()
    }
    if (this.$route.params.name) {
      this.showLoader = true
      setTimeout(async () => {
        let url = 'share/' + this.$route.params.product + '/' + this.$route.params.name
        let res = await this.$store.dispatch('getShareProductDetails', url)
        await this.$store.dispatch('ADD_CUSTOMIZED_PRODUCT', res.product_id);
        // let ind = this.products.findIndex(x => x.product_id == res.product_id)
        let ind = this.products.length -1
        await this.$store.dispatch('setSelectedIndex', { selectedIndex: ind});
        let selectedIndex = this.products[ind].productstyles.findIndex((x:Record<any, any>) => x.id === res.style_id);
        await this.$store.commit('CHANGE_STYLE_INDEX', selectedIndex);
        await  this.$store.dispatch('OVERRIDE_CUSTOM_LOGOS', JSON.parse(res.custom_logos));
        await  this.$store.dispatch('OVERRIDE_CUSTOM_TEXT', JSON.parse(res.text));
        await  this.$store.dispatch('overRideDefaultColors', JSON.parse(res.defaultcolors));
        await  this.$store.dispatch('overRideGroupColors', JSON.parse(res.groupcolors));
        await  this.$store.dispatch('setColorSectionVisibility')
        this.products[ind].productstyles[selectedIndex].productdesigns.forEach((item: Record<any, any>) => {
          if (item.id == res.design_id){
            Vue.set(item, 'design_show', 1)
            this.$store.dispatch('setSelectedProductDesignID',item.id)
          }else{
            Vue.set(item, 'design_show', 0)
          }
        });
      }, 2000)
      setTimeout(() => {
        this.showLoader = false
        this.productUpdated = true
      }, 10000)
    }
    this.$store.commit('CHANGE_EDIT_STATUS', {status: false})
    this.jwtToken = localStorage.getItem('jwtToken') as string
    await this.$store.dispatch('setCategories')
    // await this.$store.dispatch('setJwtToken')
    if(!localStorage.getItem('browserToken')){
      await this.$store.dispatch('setBrowserToken')
    }
    if (this.isCustomerAuthenticated){
      await this.$store.dispatch('getLockerRoomColors')
    }
  }
})

export default class Home extends Mixins(ErrorMessages) {
  public tabIndex = 0
  // private products: any[] = []
  private nextPageUrl !: string
  public hasProducts = true
  public category_id !: string
  public search = ''
  public colors = []
  public product_id !: number
  public provider_id = 'oVXYIzKY'
  public logoUrl = ''
  public ref = this.$refs as Record<any, any>
  public mobileScreen = this.$store.state.mobileScreen
  private jwtToken !: string
  private apiBaseUrl = process.env.VUE_APP_API_BASE_URL
  public mounted = false
  public productUpdated = false
  public previousImageColors = []
  public logoColorUsed = false
  public showModal = false
  public shared_link = ''
  public extractedcolorclass = ""

  public showLoader = true;
  private storageUrl = process.env.VUE_APP_STORAGE_URL

  public setRecentLogos() {
    this.$store.commit('SET_RECENT_LOGOS')
  }

  public showConfirm(){
    this.ref['reset-modal'].showConfirm()
  }

  get hideTab(): Record<any, any> {
    return this.$store.getters.getHideTab
  }

  get isAuthenticated(): boolean {
    return this.$store.getters.isAuthenticated
  }
  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  get customer():Record<any, any>{
    return  this.$store.getters.getCustomer
  }

  get categories(): [] {
    return this.$store.getters.getCategories
  }

  get manageComponents(): Record<any, any> {
    return this.$store.getters.getManageComponents
  }

  get customLogos(): [Record<any, any>] {
    return this.$store.getters.getCustomLogos()
  }

  get editProductStatus():boolean{
    return  this.$store.getters.getEditStatus
  }

  get mainProductType():string{
    let selected_product = this.selectedProduct.productstyles[this.styleIndex].productdesigns.filter((design:Record<any, any>) => design.design_show == 1)[0];
    return selected_product.back_design ?  "front_back" : "front";
  }

  public showCollectionModal = () =>{
    this.ref['collectionModal'].showCollectionModal()
  }
  public editCollectionModal = () =>{
    this.ref['collectionModal'].editCollectionModal()
  }
  @Watch('customLogos', {
    deep: true
  })
  async customLogosChanged(newValL: [Record<any, any>]){
    try{
      if (this.getUrlParams()){
        let query = "share/"+this.$route.params.product+ "/" +this.$route.params.name
        let param = {
          case: 'custom_logos',
          custom_logos: this.customLogos,
          url: query
        }
        let res = await this.$store.dispatch('updateSharedProduct', param)
        console.log(res)
      }
    }catch (error){
      console.log(error)
    }
  }
 get undoItems():Record<any, any>{
    return this.$store.getters.getUndoItems
 }
 get redoitems():Record<any, any>{
    return this.$store.getters.getRedoItems
 }
  get products():[Record<any, any>]{
    return this.$store.getters.getProducts
  }
  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }
  get styleIndex():number{
    return  this.$store.getters.getCurrentStyleIndex;
  }
  get selectedDesignId():number{
    return  this.$store.getters.getSelectedDesignId;
  }
  get imageColors(): any[] {
    return this.$store.getters.getLogosColors
  }
  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts
  }
  @Watch('customTexts', {
    deep: true
  })
  async  customTextsChanged(newVal: [Record<any, any>]){
    try{
      if (this.getUrlParams()){
        let query = "share/"+this.$route.params.product+ "/" +this.$route.params.name
        let param = {
          case: 'customtext',
          customtext: this.customTexts,
          url: query
        }
        let res = await this.$store.dispatch('updateSharedProduct', param)
        console.log(res)
      }
    }catch (error){
      console.log(error)
    }
  }
  get logoColors(): [] {
    return  this.$store.getters.getLogosColors;
  }
  @Watch('logoColors', {
    deep: true
  })
  async logoColorsChanged(newVal: [Record<any, any>]) {
    try{
      if (this.getUrlParams()){
        let query = "share/"+this.$route.params.product+ "/" +this.$route.params.name
        let param = {
          case: 'logo_colors',
          logo_colors: this.logoColors,
          url: query
        }
        let res = await this.$store.dispatch('updateSharedProduct', param)
        console.log(res)
      }
    }catch (error){
      console.log(error)
    }
  }
  get defaultColors(): [Record<any, any>] {
    return this.$store.getters.getDefaultColors
  }
  @Watch('defaultColors', {
    deep: true
  })
  async defaultColorsChanged(newVal: [Record<any, any>]) {
    try{
      if (this.getUrlParams()){
        let query = "share/"+this.$route.params.product+ "/" +this.$route.params.name
        let param = {
          case: 'defaultcolors',
          defaultcolors: this.defaultColors,
          url: query
        }
        let res = await this.$store.dispatch('updateSharedProduct', param)
        console.log(res)
      }
    }catch (error){
      console.log(error)
    }
  }
  get groupColors(): [Record<any, any>] {
    return this.$store.getters.getGroupColors
  }

  @Watch('groupColors', {
    deep: true
  })
  async groupColorsChanged(newVal: [Record<any, any>]){
    try{
      if (this.getUrlParams()){
        let query = "share/"+this.$route.params.product+ "/" +this.$route.params.name
        let param = {
          case: 'groupcolors',
          groupcolors: this.groupColors,
          url: query
        }
        let res = await this.$store.dispatch('updateSharedProduct', param)
        console.log(res)
      }
    }catch (error){
      console.log(error)
    }
  }
  get actionBeforeLogin(): string {
    return this.$store.getters.getActionBeforeLogin
  }
  get editStatus():boolean{
    return  this.$store.getters.getEditStatus
  }
  public getUrlParams(){
    if (this.$route.params.product && this.$route.params.name && this.productUpdated){
      return true
    }else{
      return  false
    }
  }
  public actionAfterLogin() {
    if(this.actionBeforeLogin == 'lockerRoom') {
      this.getLockerRoomProducts()
      this.ref['lockerModal'].showLockerRoomModal()
    } else if(this.actionBeforeLogin == 'saveToLockerRoom') {
      this.getLockers()
      this.ref['saveToLockerModal'].showSaveToLockerRoomModal()
    } else if(this.actionBeforeLogin == 'summary') {
      this.buyNow()
    }
    this.$store.commit("ACTION_BEFORE_LOGIN", '');
  }
  showLockerRoomModal() {
    this.ref['lockerModal'].showLockerRoomModal()

  }
  getFillColors() {
    const url = '/product/colors?default_color=1'
    http.get(url).then((response: any) => {
      this.colors = JSON.parse(response.data.color_text)
    }).catch((e: any) => {
      console.log(e)
    });
  }


  public setActionBeforeLogin(type: string) {
    this.$store.commit("ACTION_BEFORE_LOGIN", type);
    this.$store.commit('SET_ADD_MORE_COLLECTION',false)
  }

  public async getLockers(){
    await this.$store.dispatch("getLockers");
    if (!this.editStatus){
      this.ref['saveToLockerModal'].showSaveToLockerRoomModal()
    }
    const currentDesign = this.selectedProduct.productstyles[this.styleIndex].productdesigns.filter((item: Record<any, any>) => {
      return item.design_show
    })
    if (this.$store.getters.getEditDesignId != currentDesign[0].id || this.$store.getters.getEditStyleId != this.selectedProduct.productstyles[this.styleIndex].id){
      this.$store.commit('CHANGE_EDIT_STATUS', {status : false, id: 0, designId: 0, styleId: 0})
    }
    let main_scene = this.ref.mainScene[0];
    main_scene.frontCanvas.discardActiveObject().renderAll();
    main_scene.backCanvas.discardActiveObject().renderAll();
    let locker_front_png = main_scene.frontCanvas.toDataURL("image/png").split(',')[1];
    let locker_back_png = null;
    if(this.mainProductType == "front_back") {
      locker_back_png =  main_scene.backCanvas.toDataURL("image/png").split(',')[1];
    }
    let locker = {

      product_id: this.selectedProduct.product_id,
      style_id: this.selectedProduct.productstyles[this.styleIndex].id,
      design_id: currentDesign[0].id,
      custom_logos: this.customLogos,
      text: this.customTexts,
      colors: this.logoColors,
      defaultcolors: this.defaultColors,
      groupcolors: this.groupColors,
      id: this.$store.getters.getEditProductId,
      locker_front_png: locker_front_png,
      locker_back_png: locker_back_png
    }
    if (this.editStatus){
      this.showLoader = true
      let res = await this.$store.dispatch('overRideLockerProduct', locker)
      if (res.status == 201){
        this.showLoader = false
        this.showToast(res.data.message, 'SUCCESS')
      }else{
        this.showError(res)
        this.showLoader = false
      }
    }
  }
  public undoAction(){
    this.$store.dispatch('undoAction')
  }
  public redoAction(){
    this.$store.dispatch('redoAction');
  }
  public showDesign() {
    if(this.manageComponents.mobileScreen){
      this.$store.dispatch('setManageComponents', {index: 'CustomizationPreview', value: false})
      this.$store.dispatch('setManageComponents', {index: 'ItemToCustomize', value: true})
      this.$store.dispatch('setManageComponents', {index: 'CustomizationTabs', value: false})
    }
  }

  public showHomeLanding() {
    this.$store.dispatch('setManageComponents', {index: 'CustomizationPreview', value: true})
    this.$store.dispatch('setManageComponents', {index: 'ItemToCustomize', value: false})
    this.$store.dispatch('setManageComponents', {index: 'CustomizationTabs', value: true})
  }
  public additionalClass(additionalClassTrigger: string) {
    if(additionalClassTrigger){
      this.extractedcolorclass = "additional-class"
    }
  }
  public async logoutCustomer(){
    const ok = await this.ref['reset-modal'].showConfirm()
    if (ok) {
      await this.$store.dispatch('logoutCustomer');
      await this.$store.commit('SET_RECENT_LOGOS')
    }
  }

  public async retrieveProducts(url = '/list/products', searchCall = false, productType = false): Promise<void> {
    if (this.nextPageUrl && !searchCall) {
      url = this.nextPageUrl
    }
    if (searchCall || productType) {
      this.hasProducts = true
    }

    let customized = this.$store.getters.getCustomized
    let personalized = this.$store.getters.getPersonalized

    url += `?customized=${customized}&personalized=${personalized}`


    if (this.hasProducts) {
      http.get(url).then(async (response: any) => {
        if (searchCall || productType) {
          this.$store.commit('SET_PRODUCTS', []);
         // await this.$store.dispatch('setSelectedIndex', {selectedIndex:0});
        }

        let product_data = this.products.concat(response.data.products.data)
        await this.$store.commit('SET_PRODUCTS', product_data);


        await this.$store.dispatch('setSelectedIndex', {selectedIndex:0});

         let customLogos = this.$store.getters.getCustomLogoObject
        product_data.forEach(async (product:any) => {
          if(!customLogos[product.id]) {
            await this.$store.dispatch('setCustomObj',product.id)
          }
        })
        //
        // const length = Object.keys(customLogos).length
        // if(length <= 0) {
        //  await this.$store.dispatch('setCustomLogoObj',0)
        // }

        this.nextPageUrl = response.data.products.next_page_url
        if (!response.data.products.next_page_url) {
          this.hasProducts = false
        }
        if(!this.mounted){
          this.mounted = true;
        }
        this.$store.dispatch('setSelectedProductAndStyle')
        this.$store.dispatch('setSelectedProductDesign')
        this.$store.dispatch('setColorSectionVisibility')
        this.$store.dispatch("getModels", this.selectedProduct.product_id);

        this.$root.$emit('sliderEvent');
        this.showLoader = false;
      }).catch((e: any) => {
        console.log(e)
      });
    }
  }

  public async shareProduct(){
    try {
      const currentDesign = this.selectedProduct.productstyles[this.styleIndex].productdesigns.filter((item: Record<any, any>) => {
        return item.design_show
      })
      let locker = {
        customer_id: this.customer ? this.customer.id : '',
        type: 'product',
        product_id: this.selectedProduct.product_id,
        style_id: this.selectedProduct.productstyles[this.styleIndex].id,
        design_id: currentDesign[0].id,
        custom_logos: this.customLogos,
        text: this.customTexts,
        colors: this.logoColors,
        defaultcolors: this.defaultColors,
        groupcolors: this.groupColors
      }
      let res = await this.$store.dispatch('shareProduct', locker)
      this.shared_link = location.host+"/#/"+res.data.url
    }catch (error){
      console.log(error)
    }
  }
  public copyLink(){
    let testingCodeToCopy = document.querySelector("#copy-link")  as Record<any, any>
    testingCodeToCopy.select()
    try {
      document.execCommand('copy');
      alert('Product link was copied to clipboard');
    } catch (err) {
      alert('Oops, unable to copy');
    }
  }
  public searchProducts() {
    this.hasProducts = true
    let url = '/list/products?';
    if (this.search) {
      url += '&search=' + this.search
    }
    if (this.category_id) {
      url += '&category_id=' + this.category_id
    }
    this.retrieveProducts(url, true)
  }

  public getSearchQuery(param: string, type: string) {
    if (type == 'search') {
      this.search = param
    } else {
      this.category_id = param
    }
    this.searchProducts()
  }
  public async getLockerRoomProducts(){
    this.$store.commit('SET_ADD_MORE_COLLECTION',false)
    if(this.isCustomerAuthenticated){
      let res = await this.$store.dispatch('GET_LOCKER_PRODUCTS')
      if (res == true){
        this.showLockerRoomModal()
        this.ref.saveToLockerModal.ref['my-modal'].hide();
        this.ref.saveToLockerModal.showLoader = false;
      }
    }
  }

  public changeSide(index: number) {
    const payload = {
      index: index,
      attribute: 'side',
      value: this.customLogos[index].side
    }
    this.$store.dispatch('updateCustomLogoAttribute', payload)
  }

  useLogoColors() {
    this.logoColorUsed = true
    this.$store.dispatch('setGroupColors', {})
    for (let i = 0; i < 4; i++) {
      if(this.imageColors[i]) {
        this.$store.dispatch('setDefaultColor', { index: i, color: this.imageColors[i].hex, pantone: this.imageColors[i].pantone })
      } else {
        this.$store.dispatch('setDefaultColor', { index: i, color: '', pantone: '' })
      }
    }
  }

  shuffleLogoColors() {
    if(this.imageColors.length > 1) {
      this.previousImageColors = JSON.parse(JSON.stringify(this.imageColors))
      let imageColors = JSON.parse(JSON.stringify(this.imageColors)).filter((imageColor: Record<any, any>) => {
        return imageColor.hex
      })

      let shuffle = (previousValue: Record<any, any>, currentValue: Record<any, any>, currentIndex: number, array: Record<any, any>[]) => {
        if (currentIndex !== 1) return previousValue;

        array.sort(() => Math.random() - 0.5)
        return array;
      }

      while (JSON.stringify(this.previousImageColors) == JSON.stringify(imageColors)) {
        imageColors.reduce(shuffle)
      }

      this.$store.dispatch("SET_LOGO_COLORS", imageColors);
      imageColors.forEach((imageColor: Record<any, any>, index: number) => {
        this.$store.dispatch('setDefaultColor', {
          index: index,
          color: imageColor.hex,
          pantone: imageColor.pantone,
          name: imageColor.name
        })
      })
    }
  }

  public rollbackPreviousColors (): void {
    this.previousImageColors.forEach((defaultColor: Record<any, any>, index: number) => {
      this.$store.dispatch('setDefaultColor', { index: index, color: defaultColor.hex, pantone: defaultColor.pantone })
    })
    this.$store.dispatch("SET_LOGO_COLORS", this.previousImageColors);
    this.previousImageColors = []
  }

  public changeTabs(index: number) {
    if(index > 4){
      index = 4
    }
    this.tabIndex = index
    this.$store.dispatch('setTabMain',{value:index})
  }

  public buyNow() {
    this.$router.push('/confirm-order')
  }

  public isActive = false;

  public myFilter() {
    this.isActive = !this.isActive
  }

  public async resetStore(){
    const ok = await this.ref['reset-changes'].showConfirm()
    if (ok) {
      this.$store.dispatch('resetStore')
      this.$store.dispatch('SET_LOGO_COLORS', [])
      this.$store.commit('SET_INITIAL_LOGO_COLORS', [])
    }
  }

  get hideColorSection() {
    return this.$store.getters.getHideColorSection
  }


  // public resetPreview() {
  //   this.$store.dispatch('defaultColors', [{name: 'Color One', color: null, pantone: null}, {name: 'Color Two', color: null, pantone: null}, {name: 'Color Three', color: null, pantone: null}, {name: 'Color Four', color: null, pantone: null}])
  // }

}
</script>

<style lang="scss" scoped>
.page-wrapper {
  @media only screen and (min-width: 992px) {
    border: 1px solid #dee2e6;
    background: #fff;
  }
}

.home-color-area {
  @media only screen and (min-width: 992px) {
    padding-bottom: 12rem !important;
    border-right: 1px solid #dee2e6;
  }
}
.logo-placement-area{
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  .logo-placement-holder{
    flex: 0 0 67%;
    max-width: 67%;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    @media only screen and (min-width: 992px){
      flex: 0 0 100%;
      max-width: 100%;
    }
  }
  .btn{
    flex: 0 0 30%;
    max-width: 30%;
    font-size: 12px;
    padding: 0.50rem;
    @media only screen and (min-width: 992px){
      flex: 0 0 100%;
      max-width: 100%;
      font-size: 14px;
      padding: 0.50rem 0.75rem;
    }
  }
  &.extracted-color-area{
    max-width: 300px;
    margin: 0 auto;
    .logo-holder{
      width: 60px;
      height: 60px;
      position: relative;
      border: 1px solid #EFF2F4;
      border-radius: 50%;
      overflow: hidden;
      @media only screen and (min-width: 992px){
        width: 75px;
        height: 75px;
      }
      .color-extract-container{
        width: 100%;
        height: 100%;
      }
      .color-box{
        width: 100%;
        height: 100%;
      }
    }
    .logo-placement-holder{
      @media only screen and (max-width: 992px){
        flex: 0 0 100%;
        max-width: 100%;
      }
    }
    .btn{
      flex: none;
      color: #03142E;
      &.use-btn{
        background: none;
        padding: 0 0 2px;
        margin: 0;
        border: none;
        border-bottom: 2px solid #F7FAFC;
        color: #808895;
        font-size: 14px;
        max-width: 35%;
        @media only screen and (min-width: 1024px){
          font-size: 13px;
        }
        @media only screen and (min-width: 1367px){
          max-width: 30%;
          font-size: 14px;
        }
        &:focus{
          outline: none;
          box-shadow: none;
          border: none;
        }
      }
      &.reset{
        background: none;
        color: #03142E;
        border: none;
        padding: 0;
        width: auto;
      }
      &:hover{
        @media only screen and (min-width: 1024px){
          color: #808895 !important;
        }
      }
    }
    .btn-save-color{
      color: #fff;
      @media only screen and (max-width: 992px){
        flex: 0 0 100%;
        max-width: 100%;
        margin-top: 20px;
      }
      &:hover{color: #219F84;}
    }
  }
}
//.customization-preview-process{
.undo-btn-area {
  .btn {
    color: #000;
    border-color: #DDDFE3;
    font-size: 12px;
    font-weight: 600;

    &:hover {
      color: #fff;
    }
  }
}
.preview-column{
  @media only screen and (min-width: 992px){border-right: 1px solid #dee2e6;}
}
.preview-area-header {
  margin: 0 -15px;
  padding: 26px 10px;
  border-bottom: 1px solid #EDF2F6;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  @media only screen and (min-width: 768px){padding: 26px 15px;}
  @media only screen and (min-width: 992px){
    min-height: 91px;
    background: none;
  }
  .btn {
    margin: 0 0.3rem 0 0;
    font-size: 12px;
    color: #000;
    border-color: #DDDFE3;
    border-radius: 5px;
    padding: 5px 7px;
    @media only screen and (min-width: 768px){
      padding: 5px 8px;
    }
    @media only screen and (min-width: 992px){
      font-size: 14px;
      font-weight: 600;
      margin: 0 15px 0 0;
      padding: 0.375rem 0.75rem;
    }
    &:last-child{margin: 0;}
    &:hover {
      color: #fff;
    }
    &#share{
      margin: 0;
    }
  }

  .preview-header-icons {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    font-size: 18px;
    list-style: none;
    //@media only screen and (min-width: 992px){font-size: 18px;}
    li {
      margin: 0 0 0 15px;
      position: relative;
      @media only screen and (min-width: 768px){margin: 0 0 0 12px;}
      .btn{
        margin: 0 0 0 10px;
        background: none;
        padding: 0;
        border: none;
        color: #03142e;
        font-size: 18px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        //@media only screen and (min-width: 768px){font-size: 18px;}
        .user-text{
          font-size: 12px;
          line-height: 16px;
          max-width: 62px;
          display: inline-block;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          margin: 0 5px 0 0;
        }
      }
      a{
        cursor: pointer;
      }
      &:first-child{margin: 0;}
    }
    .user-name{
      font-size: 0.8rem;
      font-weight: 600;
    }
  }
  .buttons-preview{
    @media only screen and (max-width: 767px){
      flex: 0 0 100%;
      max-width: 100%;
      margin: 0 0 15px;
    }
  }
}

//}
.preview-section {
  overflow: hidden;
  max-width: 900px;
  margin: 0 auto;

  .image-holder {
    margin: 0 1%;
    flex: 0 0 48%;
    max-width: 48%;

    img {
      display: block;
      max-width: 100%;
      margin: 0 auto;
      height: auto;
    }
  }
}

.preview-area-customize {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  height: 60vh;
}
.change-product-area{
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 15px 0 0;
  h2{
    font-size: 1.25rem;
    font-weight: 600;
  }
  .change-product-opener{
    width: 18px;
    height: 18px;
    position: relative;
    &:before{
      position: absolute;
      content: '';
      left: 2px;
      top: 6px;
      border: 6px solid transparent;
      border-top: 6px solid #fff;
    }
  }

}
.customization-area{
  .preview-btn{
    position: absolute;
    left: 0;
    top: 20px;
    font-size: 0.7rem;
    @media only screen and (min-width: 768px){
      left: auto;
      right: 0;
      top: -30px;
      font-size: 1rem;
    }
    svg{margin-right: 5px;}
  }
  .two-d-btn{
    display: none;
  }
  .threeD-view{display: none;}
  .active{
    .threeD-view,
    .two-d-btn{
      display: block;
    }
    .twoD-view,
    .three-d-btn{
      display: none;
    }
  }

}
.backtohome-btn{
  position: fixed;
  left: 30px;
  bottom: 26px;
  background: rgba(33,159,132,0.8);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  color: #fff;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  z-index: 99;
}

.loader{
  position: absolute;
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
  background: rgba(255,255,255,0.9);
  z-index: 1030;
  img{
    max-width: 7%;
    display: block;
    margin: 0 auto;
    height: auto;
  }
  [v-cloak] {
    display: none !important;
  }
}



</style>
