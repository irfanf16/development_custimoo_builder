<template>
  <div class="page-wrapper m-lg-4">
    <b-container fluid>
      <b-row>
        <template v-if="manageComponents.BasicCustomization">
          <b-col cols="12" lg="3" class="text-left home-color-area" :class="extractedcolorclass">
            <div class="py-2 py-md-3 pb-0 py-lg-5 overflow-hidden mt-4 mt-lg-0">
              <ChooseColor :colors="colors"/>
            </div>
            <template v-if="manageComponents.ExtractedColors">
              <div class="mb-3 mb-lg-0" v-if="customLogos[0] && customLogos[0].url" :class="extractedcolorclass">
                <ExtractedColors />
              </div>
            </template>

            <template v-if="products.length && selectedProduct.is_logo_allowed == 1">
              <template v-if="manageComponents.LogoArea">
                <UploadLogo :customLogoIndex="0"/>
              </template>
            </template>
            <template v-if="manageComponents.ChooseInterest">
              <ChooseInterest :categories="categories" @search="getSearchQuery" @additionalClassTrigger="additionalClass"/>
            </template>
          </b-col>

        </template>
        <template v-if="manageComponents.AdvanceCustomization">
          <b-col cols="12" lg="3" class="text-left border-right py-lg-3">
            <CustomizationTabs :tabIndexNew="tabIndex" @tabIndexChange="changeTabs"/>
          </b-col>
        </template>
        <b-col v-if="manageComponents.CustomizationPreview" cols="12" lg="6" class="preview-column">
          <!-- <template v-if="manageComponents.AdvanceCustomization"> -->
            <template>
            <div class="customization-preview-process w-100">
              <header class="preview-area-header py-2 py-lg-4">
                <div class="buttons-preview text-left">
                  <template v-if="isCustomerAuthenticated">
                    <b-button :key="'lockerRoom'" @click="getLockerRoomProducts" variant="outline-secondary" v-b-modal.modal-center-lockerroom>Locker room</b-button>
                  </template>
                  <template v-else>
                    <b-button :key="'loginmodal'" variant="outline-secondary" v-b-modal.modal-login>Locker room</b-button>
                  </template>
                  <LockerRoomModal />
                  <template v-if="isCustomerAuthenticated">
                    <b-button :key="'savetolocker'" variant="outline-secondary" v-b-modal.modal-center-addlockerroom @click="getLockers">Save to locker room</b-button>
                  </template>
                  <template v-else>
                    <b-button :key="'loginmodalsavelockerroom'" variant="outline-secondary" v-b-modal.modal-login>Save to locker room</b-button>
                  </template>
                  <AddLockerRoomModal />
                  <template v-if="isCustomerAuthenticated">
                    <b-button :key="'summarybutton'" variant="outline-secondary" @click="buyNow">Summary</b-button>
                  </template>
                  <template v-else>
                    <b-button :key="'loginmodalsummary'" variant="outline-secondary" v-b-modal.modal-login>Summary</b-button>
                  </template>
                </div>
                <ul class="preview-header-icons">
                  <li class="d-flex flex-wrap align-items-center">
                    <b-button v-if="!isCustomerAuthenticated" v-b-modal.modal-login><font-awesome-icon :icon="['fas', 'user']"/></b-button>
                    <strong class="user-name">{{  isCustomerAuthenticated ? 'Hello ' + customer.first_name : '' }}</strong>
                    <b-button @click="logoutCustomer" v-if="isCustomerAuthenticated"><font-awesome-icon :icon="['fas', 'sign-out-alt']"/></b-button>
                    <LoginForm />
                  </li>
                  <li><a @click="shareProduct">
                    <font-awesome-icon :icon="['fas', 'share-alt']"/>
                  </a></li>
                  <li><a href="#" @click="this.resetPreview()">
                    <font-awesome-icon :icon="['fas', 'redo-alt']"/>
                  </a></li>
                </ul>
                <div class="change-product-area d-lg-none">
                  <h2>Change Product</h2>
                  <b-button @click="showDesign()" class="change-product-opener" variant="secondary"></b-button>
                </div>
              </header>
<!--              <div class="undo-btn-area text-left pt-3">-->
<!--                <b-button variant="outline-secondary mr-2">Undo</b-button>-->
<!--                <b-button variant="outline-secondary">Redo</b-button>-->
<!--              </div>-->
            </div>
          </template>
          <div class="customization-area d-flex flex-wrap justify-content-center align-items-center" :class="{'mobile-custom-scroll': (hideTab.logoHide || hideTab.colorHide || hideTab.textHide || hideTab.styleHide || hideTab.teamHide) }">
            <div v-bind:class="{active: isActive}">
<!--              <b-button class="preview-btn" variant="secondary" v-on:click="myFilter">-->
<!--                <span class="three-d-btn"><font-awesome-icon :icon="['fas', 'cube']"/> 3D View</span>-->
<!--                <span class="two-d-btn"><font-awesome-icon :icon="['fas', 'dice-two']"/> 2D View</span>-->
<!--              </b-button>-->
              <div class="twoD-view">
                <CustomizationPreview />
              </div>
<!--              <div class="threeD-view">-->
<!--                <CustomizationPreviewThreeD />-->
<!--              </div>-->
              <template v-if="manageComponents.BasicCustomization">
                <b-button @click="showAdvanceCustomization()" class="d-none d-lg-inline-block mt-5" variant="secondary">Continue</b-button>
              </template>
              <template v-if="manageComponents.AdvanceCustomization">
                <div class="d-none d-lg-block continue-btn-holder pt-5">
                  <b-button v-if="tabIndex == 0" @click="showBasicCustomization()" class="mx-2 px-5 back-btn" variant="secondary">Back</b-button>
                  <b-button v-else @click="changeTabs(tabIndex-1)" class="mx-2 px-5 back-btn" variant="secondary">Back</b-button>
                  <b-button @click="changeTabs(tabIndex+1)" class="mx-2 px-5" variant="secondary" v-if="tabIndex <= 3">Next</b-button>
                  <template v-if="isCustomerAuthenticated">
                    <b-button @click="buyNow" class="mx-2 px-5" variant="secondary" v-if="tabIndex > 3">Summary</b-button>
                  </template>
                  <template v-else>
                    <b-button v-b-modal.modal-login class="mx-2 px-5" variant="secondary" v-if="tabIndex > 3">Summary</b-button>
                  </template>
                </div>
              </template>
            </div>
          </div>
        </b-col>
        <b-col v-if="manageComponents.ItemToCustomize" cols="12" lg="3">
          <ItemToCustomize :categories="categories" @retrieveProducts="retrieveProducts" @search="getSearchQuery"/>
          <button class="backtohome-btn d-lg-none" @click="showHomeLanding()"><font-awesome-icon :icon="['fas', 'arrow-left']"/></button>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">

import {Component, Vue} from 'vue-property-decorator'
import ChooseColor from '@/components/ChooseColor.vue'
import CustomizationPreview from '@/components/CustomizationPreview.vue'
import ItemToCustomize from '@/components/ItemToCustomize.vue'
import ChooseInterest from '@/components/ChooseInterest.vue'
import CustomizationTabs from '@/components/CustomizationTabs.vue'
import SaveColorModal from "@/components/SaveColorModal.vue"
import UploadLogo from '@/components/UploadLogo.vue'
import LockerRoomModal from '@/components/LockerRoomModal.vue'
import AddLockerRoomModal from '@/components/AddLockerRoomModal.vue'
import CustomizationPreviewThreeD from '@/components/CustomizationPreviewThreeD.vue'
import ExtractedColors from '@/components/ExtractedColors.vue'
import LoginForm from '@/components/LoginForm.vue'
import {http} from "@/httpCommon"

@Component<Home>({
  components: {
    ChooseColor,
    CustomizationPreview,
    ItemToCustomize,
    ChooseInterest,
    CustomizationTabs,
    UploadLogo,
    LockerRoomModal,
    AddLockerRoomModal,
    SaveColorModal,
    CustomizationPreviewThreeD,
    ExtractedColors,
    LoginForm
  },
  async mounted() {
    if (this.isAuthenticated) {
      await this.retrieveProducts()
      await this.getFillColors()
    }
    if (this.$route.params.name) {
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
        this.products[ind].productstyles[selectedIndex].productdesigns.forEach((item: Record<any, any>) => {
          if (item.id == res.design_id){
            Vue.set(item, 'design_show', 1)
          }else{
            Vue.set(item, 'design_show', 0)
          }
        });
        }, 5000)
    }
    let isAssociation = JSON.parse(localStorage.getItem('isAssociation') as string) as boolean
    this.jwtToken = localStorage.getItem('jwtToken') as string
    if (isAssociation && this.jwtToken) {
      this.getLogoAssociation()
    }
    await this.$store.dispatch('setCategories')
    // await this.$store.dispatch('setJwtToken')
    await this.$store.dispatch('setBrowserToken')
    await this.$store.dispatch('setIsAssociation', {associate: false})
    if (this.isCustomerAuthenticated){
      await this.$store.dispatch('getLockerRoomColors')
    }
  }
})

export default class Home extends Vue {
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
  public previousImageColors = []
  public logoColorUsed = false
  public showModal = false

  public extractedcolorclass = ""

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
    return this.$store.getters.getCustomLogos
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

  get imageColors(): any[] {
    return this.$store.getters.getLogosColors
  }
  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts
  }
  get logoColors():[]{
    return  this.$store.getters.getLogosColors;
  }
  get defaultColors() : [Record<any, any>] {
    return this.$store.getters.getDefaultColors
  }
  get groupColors() : [Record<any, any>] {
    return this.$store.getters.getGroupColors
  }

  getFillColors() {
    const url = '/product/colors?default_color=1'
    http.get(url).then((response: any) => {
      this.colors = JSON.parse(response.data.color_text)
    }).catch((e: any) => {
      console.log(e)
    });
  }
  public async getLockers(){
    await this.$store.dispatch("getLockers");
}
  public showAdvanceCustomization() {
    if (this.isCustomerAuthenticated){
      this.$store.dispatch("getLockers");
    }
    this.$store.dispatch('setManageComponents', {index: 'BasicCustomization', value: false})
    this.$store.dispatch('setManageComponents', {index: 'AdvanceCustomization', value: true})
  }

  public showBasicCustomization() {
    this.$store.dispatch('setManageComponents', {index: 'BasicCustomization', value: true})
    this.$store.dispatch('setManageComponents', {index: 'AdvanceCustomization', value: false})
  }
  public showDesign() {
    if(this.manageComponents.mobileScreen){
        this.$store.dispatch('setManageComponents', {index: 'CustomizationPreview', value: false})
        this.$store.dispatch('setManageComponents', {index: 'ItemToCustomize', value: true})
        this.$store.dispatch('setManageComponents', {index: 'AdvanceCustomization', value: false})
        this.$store.dispatch('setManageComponents', {index: 'LogoArea', value: false})
        this.$store.dispatch('setManageComponents', {index: 'ChooseColor', value: false})
      this.$store.dispatch('setManageComponents', {index: 'DefaultColorShuffleBtn', value: true})
    }
  }

  public showHomeLanding() {
    this.$store.dispatch('setManageComponents', {index: 'ItemToCustomize', value: false})
    this.$store.dispatch('setManageComponents', {index: 'ChooseColor', value: true})
    this.$store.dispatch('setManageComponents', {index: 'LogoArea', value: true})
    this.$store.dispatch('setManageComponents', {index: 'ChooseInterest', value: true})
    this.$store.dispatch('setManageComponents', {index: 'DefaultColorShuffleBtn', value: false})
    this.$store.dispatch('setManageComponents', {index: 'ExtractedColors', value: true})
    this.extractedcolorclass = ""
  }
  public additionalClass(additionalClassTrigger: string) {
    if(additionalClassTrigger){
      this.extractedcolorclass = "additional-class"
    }
  }
  public async logoutCustomer(){
    await this.$store.dispatch('logoutCustomer');
    console.log(this.isCustomerAuthenticated)
  }

  public retrieveProducts(url = '/list/products', searchCall = false): void {
    if (this.nextPageUrl && !searchCall) {
      url = this.nextPageUrl
    }
    if (searchCall) {
      this.$store.commit('SET_PRODUCTS', []);
    }

    if (this.hasProducts) {
      http.get(url).then((response: any) => {
        let product_data = this.products.concat(response.data.products.data)
        this.$store.commit('SET_PRODUCTS', product_data);
        this.nextPageUrl = response.data.products.next_page_url
        if (!response.data.products.next_page_url) {
          this.hasProducts = false
        }
        if(!this.mounted){
          this.mounted = true
        }
      }).catch((e: any) => {
        console.log(e)
      });
    }
  }
  public shareProduct(){
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
    let res = this.$store.dispatch('shareProduct', locker)
    console.log(res)
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

  public getLogoAssociation() {
    const url = '/customer/associateresource'
    http.get(url).then((response: any) => {
      console.log(response)
      this.$store.dispatch('setIsAssociation', {associate: false})
    }).catch((e: any) => {
      console.log(e)
    });
  }

  public async getLockerRoomProducts(){
    if(this.isCustomerAuthenticated){
      await this.$store.dispatch('GET_LOCKER_PRODUCTS');
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
          pantone: imageColor.pantone
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
  }

  public buyNow() {
    this.$router.push('/confirm-order')
  }

  public isActive = false;

  public myFilter() {
    this.isActive = !this.isActive
  }

  public resetPreview() {
    this.$store.dispatch('setDefaultColor', [{name: 'Color One', color: null, pantone: null}, {name: 'Color Two', color: null, pantone: null}, {name: 'Color Three', color: null, pantone: null}, {name: 'Color Four', color: null, pantone: null}])
  }

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
    padding-bottom: 10rem !important;
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



</style>
