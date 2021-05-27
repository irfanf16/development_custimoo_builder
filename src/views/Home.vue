<template>
  <div class="page-wrapper m-lg-4">
    <b-container fluid>
      <b-row>
        <template v-if="manageComponents.BasicCustomization">
          <b-col cols="12" lg="3" class="text-left home-color-area">
            <div v-if="manageComponents.ChooseColor" class="py-3 pb-0 py-lg-5 overflow-hidden mt-4 mt-lg-0">
              <ChooseColor :colors="colors"/>
            </div>
            <template v-if="customLogos.length">
              <div class="logo-placement-area extracted-color-area">
                <h4 class="mb-3 mb-lg-4">Color Extracted from Logo</h4>
                <div class="logo-placement-holder mb-lg-3">
                  <div class="logo-holder">
                    <div class="color-extract-container">
                      <div v-if="imageColors.length == 1" class="color-box" :style="{background: imageColors[0].hex}"></div>
                      <div v-if="imageColors.length == 2" class="color-box" :style="{background: 'conic-gradient(' + imageColors[0].hex +' 0% 50%, ' + imageColors[1].hex +' 50% 100%)'}"></div>
                      <div v-if="imageColors.length == 3" class="color-box" :style="{background: 'conic-gradient(' + imageColors[0].hex +' 0% 33.33%, ' + imageColors[1].hex +' 33.33% 66.66%, ' + imageColors[2].hex +' 66.66% 100%)'}"></div>
                      <div v-if="imageColors.length == 4" class="color-box" :style="{background: 'conic-gradient(' + imageColors[1].hex +' 0% 25%, ' + imageColors[2].hex +' 25% 50%, ' + imageColors[3].hex +' 50% 75%, ' + imageColors[0].hex +' 75% 100%)'}"></div>
                    </div>
                  </div>
                  <b-button @click="useLogoColors()" class="use-btn">Use These Colors</b-button>
                  <b-button @click="shuffleLogoColors()" v-if="logoColorUsed && imageColors.length > 1" variant="outline-secondary">Shuffle</b-button>
                  <b-button @click="rollbackPreviousColors()" v-if="previousImageColors.length" class="reset"><font-awesome-icon :icon="['fas', 'redo-alt']"/></b-button>
                </div>
                <SaveColorModal />
              </div>
            </template>
            <template v-if="products.length && selectedProduct.is_logo_allowed == 1">
              <template v-if="manageComponents.LogoArea">
                <UploadLogo :customLogoIndex="0" @logoChange="getLogoColors"/>
              </template>
            </template>
          </b-col>
          <b-col v-if="manageComponents.ChooseInterest" cols="12" class="pb-5">
            <ChooseInterest :categories="categories" @search="getSearchQuery"/>
          </b-col>
        </template>
        <template v-if="manageComponents.AdvanceCustomization">
          <b-col cols="12" lg="3" class="text-left border-right py-lg-3">
            <CustomizationTabs :tabIndex="tabIndex"/>
          </b-col>
        </template>
        <b-col v-if="manageComponents.CustomizationPreview" cols="12" lg="6" class="preview-column">
          <!-- <template v-if="manageComponents.AdvanceCustomization"> -->
            <template>
            <div class="customization-preview-process w-100">
              <header class="preview-area-header py-2 py-lg-4">
                <div class="buttons-preview text-left">
                  <b-button variant="outline-secondary" v-b-modal.modal-center-lockerroom @click="getLockerRoomProducts">Locker room</b-button>
                  <LockerRoomModal v-if="isCustomerAuthenticated"/>
                  <b-button variant="outline-secondary" v-b-modal.modal-center-addlockerroom>Save to locker room</b-button>
                  <AddLockerRoomModal />
                  <b-button variant="outline-secondary">Buy Now</b-button>
                </div>
                <ul class="preview-header-icons">
                  <li><a>
                    <font-awesome-icon :icon="['fas', 'share-alt']"/>
                  </a></li>
                  <li><a href="#">
                    <font-awesome-icon :icon="['fas', 'redo-alt']"/>
                  </a></li>
                </ul>
                <div class="change-product-area d-lg-none">
                  <h2>Change Product</h2>
                  <b-button @click="showDesign()" class="change-product-opener" variant="secondary"></b-button>
                </div>
              </header>
              <div class="undo-btn-area text-left pt-3">
                <b-button variant="outline-secondary mr-2">Undo</b-button>
                <b-button variant="outline-secondary">Redo</b-button>
              </div>
            </div>
          </template>
          <div class="customization-area d-flex flex-wrap justify-content-center align-items-center" :class="{'mobile-custom-scroll': (hideTab.logoHide || hideTab.colorHide || hideTab.textHide || hideTab.styleHide || hideTab.teamHide) }">
            <div>
              <CustomizationPreview />
              <template v-if="manageComponents.BasicCustomization">
                <b-button @click="showAdvanceCustomization()" class="d-none d-lg-inline-block mt-5" variant="secondary">Continue</b-button>
              </template>
              <template v-if="manageComponents.AdvanceCustomization">
                <div class="d-none d-lg-block continue-btn-holder pt-5">
                  <b-button v-if="tabIndex == 0" @click="showBasicCustomization()" class="mx-2 px-5 back-btn" variant="secondary">Back</b-button>
                  <b-button v-else @click="changeTabs(tabIndex-1)" class="mx-2 px-5 back-btn" variant="secondary">Back</b-button>
                  <b-button @click="changeTabs(tabIndex+1)" class="mx-2 px-5" variant="secondary">Next</b-button>
                </div>
              </template>
            </div>
          </div>
        </b-col>
        <b-col v-if="manageComponents.ItemToCustomize" cols="12" lg="3">
          <ItemToCustomize :categories="categories" @retrieveProducts="retrieveProducts" @search="getSearchQuery"/>
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
import {http} from "@/httpCommon"
import {default as Vibrant} from 'node-vibrant'
import getClosestColor from '@/pantoneColor'


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
    SaveColorModal
  },
  mounted() {
    if (this.isAuthenticated) {
      this.retrieveProducts()
      this.getFillColors()
    }
    this.getLogoColors()
    let isAssociation = JSON.parse(localStorage.getItem('isAssociation') as string) as boolean
    this.jwtToken = localStorage.getItem('jwtToken') as string
    if (isAssociation && this.jwtToken) {
      this.getLogoAssociation()
    }

    this.$store.dispatch('setCategories')
    this.$store.dispatch('setJwtToken')
    this.$store.dispatch('setBrowserToken')
    this.$store.dispatch('setIsAssociation', {associate: false})
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
  public imageColors: any[] = []
  public logoColorUsed = false

  get hideTab(): Record<any, any> {
    return this.$store.getters.getHideTab
  }

  get isAuthenticated(): boolean {
    return this.$store.getters.isAuthenticated
  }
  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
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

  getFillColors() {
    const url = '/product/colors?default_color=1'
    http.get(url).then((response: any) => {
      this.colors = JSON.parse(response.data.color_text)
    }).catch((e: any) => {
      console.log(e)
    });
  }

  public showAdvanceCustomization() {
    this.$store.dispatch("getLockers");
    this.$store.dispatch('setManageComponents', {index: 'BasicCustomization', value: false})
    this.$store.dispatch('setManageComponents', {index: 'AdvanceCustomization', value: true})
  }

  public showBasicCustomization() {
    this.$store.dispatch('setManageComponents', {index: 'BasicCustomization', value: true})
    this.$store.dispatch('setManageComponents', {index: 'AdvanceCustomization', value: false})
    this.getLogoColors()
  }
  public showDesign() {
          if(this.manageComponents.mobileScreen){
              this.$store.dispatch('setManageComponents', {index: 'CustomizationPreview', value: false})
              this.$store.dispatch('setManageComponents', {index: 'ItemToCustomize', value: true})
              this.$store.dispatch('setManageComponents', {index: 'AdvanceCustomization', value: false})
              this.$store.dispatch('setManageComponents', {index: 'LogoArea', value: false})
          }
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

  public getLogoColors(){
    this.imageColors = []
    if(this.customLogos.length){
      if(this.customLogos[0] && this.customLogos[0].url) {
        this.$nextTick(() => {
          let logoColors: Record<any, any>[] = []
          Vibrant.from(this.apiBaseUrl + '/' + this.customLogos[0].url).quality(1).maxColorCount(5)
          .getPalette((err: any, palettes: any) => {
            for (let [key, value] of Object.entries(palettes) as any[]) {
              if(value.getPopulation() >= 10) {
                this.imageColors.push({
                  'hex': value.getHex(),
                  'colorPopulation': value.getPopulation()
                })
              }
            }
            this.imageColors.sort(function (a, b) {
              return parseFloat(b.colorPopulation) - parseFloat(a.colorPopulation)
            })
            if (this.imageColors.length > 4) {
              let deletedCount = this.imageColors.length - 4
              this.imageColors.splice(4, deletedCount)
            }
            this.imageColors.forEach((imageColor: Record<any, any>, index: number) => {
              let pantoneColor = getClosestColor(imageColor.hex)
              this.imageColors[index].pantone = pantoneColor.pantone
              this.imageColors[index].hex = pantoneColor.hex
              logoColors.push({value: pantoneColor.hex, name: pantoneColor.pantone})
            })
            this.$store.dispatch("SET_LOGO_COLORS", logoColors);
          })
        })
      }
    }
  }

  useLogoColors() {
    this.logoColorUsed = true
    this.imageColors.forEach((imageColor: Record<any, any>, index: number) => {
      this.$store.dispatch('setGroupColors', {})
      this.$store.dispatch('setDefaultColor', { index: index, color: imageColor.hex, pantone: imageColor.pantone })
    })
  }

  shuffleLogoColors() {
    if(this.imageColors.length > 1) {
      this.previousImageColors = JSON.parse(JSON.stringify(this.imageColors)).filter((imageColor: Record<any, any>) => {
        return imageColor.hex
      })
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

      this.imageColors = imageColors
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
      this.$store.dispatch('setDefaultColor', { index: index, color: defaultColor.color, pantone: defaultColor.name })
    })
    this.previousImageColors = []
  }

  public changeTabs(index: number) {
    if(index > 4){
      index = 4
    }
    this.tabIndex = index
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
        }
        &.reset{
          background: none;
          color: #03142E;
          border: none;
          padding: 0;
          width: auto;
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
  padding: 26px 15px;
  border-bottom: 1px solid #EDF2F6;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  background: #fff;
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
    padding: 5px 8px;
    @media only screen and (min-width: 992px){
      font-size: 14px;
      font-weight: 600;
      margin: 0 15px 0 0;
      padding: 0.375rem 0.75rem;
    }
    &:hover {
      color: #fff;
    }
  }

  .preview-header-icons {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    font-size: 14px;
    list-style: none;
    @media only screen and (min-width: 992px){
      font-size: 18px;
    }
    li {
      margin: 0 0 0 6px;
      @media only screen and (min-width: 992px){margin: 0 0 0 12px;}
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


</style>
