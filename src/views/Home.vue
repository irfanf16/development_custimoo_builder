<template>
  <div class="page-wrapper m-lg-4">
    <b-container fluid>
      <b-row>
        <template v-if="manageComponents.BasicCustomization">
          <b-col cols="12" lg="3" class="text-left home-color-area">
            <div v-if="manageComponents.ChooseColor" class="py-3 pb-0 py-lg-5 overflow-hidden mt-4 mt-lg-0">
              <ChooseColor :colors="colors"/>
            </div>
            <template v-if="products.length && selectedProduct.is_logo_allowed == 1">
              <template v-if="manageComponents.LogoArea">
                <UploadLogo :customLogoIndex="0"/>
              </template>
            </template>
          </b-col>
          <b-col v-if="manageComponents.ChooseInterest" cols="12" class="pb-5">
            <ChooseInterest/>
          </b-col>
        </template>
        <template v-if="manageComponents.AdvanceCustomization">
          <b-col cols="12" lg="3" class="text-left border-right py-lg-3">
            <CustomizationTabs />
          </b-col>
        </template>
        <b-col v-if="manageComponents.CustomizationPreview" cols="12" lg="6" class="preview-column">
          <template v-if="manageComponents.AdvanceCustomization">
            <div class="customization-preview-process w-100">
              <header class="preview-area-header py-2 py-lg-4">
                <div class="buttons-preview text-left">
                  <b-button variant="outline-secondary" v-b-modal.modal-center-lockerroom>Locker room</b-button>
                   <LockerRoomModal v-if="isCustomerAuthenticated"/>
                  <b-button variant="outline-secondary" @click="saveToLocker" v-b-modal.modal-center-addlockerroom>Save to locker room</b-button>
                  <AddLockerRoomModal />
                  <b-button variant="outline-secondary">Buy Now</b-button>
                </div>
                <ul class="preview-header-icons">
                  <li><a href="#.">
                    <font-awesome-icon :icon="['fas', 'share-alt']"/>
                  </a></li>
                  <li><a href="#.">
                    <font-awesome-icon :icon="['fas', 'redo-alt']"/>
                  </a></li>
                </ul>
              </header>
              <div class="undo-btn-area text-left pt-3">
                <b-button variant="outline-secondary mr-2">Undo</b-button>
                <b-button variant="outline-secondary">Redo</b-button>
              </div>
            </div>
          </template>
          <div class="customization-area d-flex flex-wrap justify-content-center align-items-center">
            <div>
              <CustomizationPreview />
              <template v-if="manageComponents.BasicCustomization">
                <b-button @click="showAdvanceCustomization()" class="mt-5" variant="secondary">Continue</b-button>
              </template>
              <template v-if="manageComponents.AdvanceCustomization">
                <div class="continue-btn-holder pt-5">
                  <b-button @click="showBasicCustomization()" class="mx-2 px-5 back-btn" variant="secondary">Back
                  </b-button>
                  <b-button class="mx-2 px-5" variant="secondary">Next</b-button>
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
import UploadLogo from '@/components/UploadLogo.vue'
import LockerRoomModal from '@/components/LockerRoomModal.vue'
import AddLockerRoomModal from '@/components/AddLockerRoomModal.vue'
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
    AddLockerRoomModal
  },
  mounted() {
    if (this.isAuthenticated) {
      this.retrieveProducts()
      this.getFillColors()
    }

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
  private apiBaseUrl: string = process.env.VUE_APP_API_BASE_URL
  public mounted = false

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

  get customLogos(): [] {
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
    this.$store.dispatch('setManageComponents', {index: 'BasicCustomization', value: false})
    this.$store.dispatch('setManageComponents', {index: 'AdvanceCustomization', value: true})
  }

  public showBasicCustomization() {
    this.$store.dispatch('setManageComponents', {index: 'BasicCustomization', value: true})
    this.$store.dispatch('setManageComponents', {index: 'AdvanceCustomization', value: false})
  }

  public retrieveProducts(url = '/list/products', searchCall = false): void {
    if (this.nextPageUrl && !searchCall) {
      url = this.nextPageUrl
    }
    if (searchCall) {
      this.$store.commit('SET_PRODUCTS', []);
    }

    if (this.hasProducts) {
      const self = this
      http.get(url).then((response: any) => {
        let product_data = this.products.concat(response.data.products.data)
        this.$store.commit('SET_PRODUCTS', product_data);
        this.nextPageUrl = response.data.products.next_page_url
        if (!response.data.products.next_page_url) {
          this.hasProducts = false
        }
        if(!this.mounted){
          this.mounted = true
          setTimeout(() => {
            self.customLogoInit()
          }, 3000);
        }
      }).catch((e: any) => {
        console.log(e)
      });
    }
  }

  public customLogoInit(){
    if(this.selectedProduct && this.selectedProduct.is_logo_allowed == 1){
      let logoSetting = this.selectedProduct.logos_setting[0]
      let logo = {
        url: '',
        width: logoSetting.width,
        height: logoSetting.height,
        scaleX: 1,
        scaleY: 1,
        x_axis: logoSetting.x_axis,
        y_axis: logoSetting.y_axis,
        rotation: logoSetting.rotation,
        haveControls: Boolean(logoSetting.is_locked),
        side: logoSetting.side,
        customLogo: true
      }
      this.$store.dispatch('setCustomLogos', logo)
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
  public saveToLocker(){
    if (this.isCustomerAuthenticated) {
      const currentDesign = this.selectedProduct.productstyles[this.styleIndex].productdesigns.filter((item: Record<any, any>) => {
        return item.design_show
      })
      let locker = {
        product_id: this.selectedProduct.product_id,
        style_id:     this.selectedProduct.productstyles[this.styleIndex].id,
        design_id: currentDesign[0].id,
        custom_logos: this.customLogos,
        text:'',
        colors:''
      }
      console.log(this.customLogos);
      // this.$store.dispatch("SAVE_TO_LOCKER", locker);
    }else{
      alert("please login first");
    }
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
  @media only screen and (min-width: 992px){
    min-height: 91px;
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
  max-width: 610px;
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


</style>
