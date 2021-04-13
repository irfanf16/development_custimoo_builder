<template>
  <div class="page-wrapper m-4">
    <b-container fluid>
      <b-row>
        <template v-if="manageComponents.BasicCustomization">
          <b-col v-if="manageComponents.ChooseColor" cols="12" lg="3" class="text-left py-3 pb-5 py-lg-5 overflow-hidden home-color-area">
            <ChooseColor :colors="colors" />
              <div v-if="!manageComponents.mobileScreen" class="upload-logo-opener d-none d-lg-block">
                  <b-button v-b-modal.modal-center>
                    <div class="upload-box">
                      <div v-if="logoUrl">
                        <img :src="logoUrl" width="100%"/>
                      </div>
                      <div v-else>
                        <div class="icon-holder">
                          <font-awesome-icon :icon="['fas', 'image']"/>
                        </div>
                        Upload Logo
                      </div>
                    </div>
                    <div class="upload-logo-content">
                      <h3>Upload Logo Image</h3>
                      <h4>Image Requirements</h4>
                      <p>Need High Res Image</p>
                    </div>
                  </b-button>
                  <b-modal ref="myModal" content-class="upload-logo-disclaimer" id="modal-center" centered title="Upload Logo">
                      <p>By uploading an image, you guarantee that your use of the image does not infringe any rights or laws. You may review Customizer’s design rejection reasons <a href="#">HERE</a>.</p>
                      <div class="upload-logo-buttons">
                        <b-button class="btn-cancel" @click="hideModal">Cancel</b-button>
                        <input type="file" name="logos" ref="fileInput" @change="uploadLogoImage" class="fileLoader" accept="image/x-png,image/jpeg">
                        <b-button class="btn-upload" @click="uploadLogo">Confirm and Upload logo</b-button>
                      </div>
                  </b-modal>
              </div>
          </b-col>
          <b-col v-if="manageComponents.ChooseInterest" cols="12" class="pb-5">
            <ChooseInterest />
          </b-col>
        </template>
        <template v-if="manageComponents.AdvanceCustomization">
          <b-col cols="3" class="text-left border-right py-3">
            <CustomizationTabs />
          </b-col>
        </template>
        <b-col v-if="manageComponents.CustomizationPreview" cols="6" class="d-none border-right d-lg-flex flex-wrap align-items-center h-100vh justify-content-center">
          <div class="customization-area p-5">
            <template v-if="manageComponents.AdvanceCustomization">
              <div class="customization-preview-process">
                <header class="preview-area-header py-4">
                  <div class="buttons-preview text-left">
                    <b-button variant="outline-secondary" v-b-modal.modal-center>Locker room</b-button>
                    <LockerRoomModal />
                    <b-button variant="outline-secondary">Save to locker room</b-button>
                    <b-button variant="outline-secondary">Buy Now</b-button>
                  </div>
                  <ul class="preview-header-icons">
                    <li><a href="#."><font-awesome-icon :icon="['fas', 'share-alt']" /></a></li>
                    <li><a href="#."><font-awesome-icon :icon="['fas', 'redo-alt']" /></a></li>
                  </ul>
                </header>
                <div class="undo-btn-area text-left pt-3">
                  <b-button variant="outline-secondary mr-2">Undo</b-button>
                  <b-button variant="outline-secondary">Redo</b-button>
                </div>
              </div>
            </template>
            <CustomizationPreview :designs="products[designsIndex]"/>
            <template v-if="manageComponents.BasicCustomization">
              <b-button @click="showAdvanceCustomization()" class="mt-5" variant="secondary">Continue</b-button>
            </template>
            <template v-if="manageComponents.AdvanceCustomization">
              <div class="continue-btn-holder pt-5">
                <b-button @click="showBasicCustomization()" class="mx-2 px-5 back-btn" variant="secondary">Back</b-button>
                <b-button class="mx-2 px-5" variant="secondary">Next</b-button>
              </div>
            </template>
          </div>
        </b-col>
        <b-col v-if="manageComponents.ItemToCustomize" cols="3" class="d-none d-lg-block">
          <ItemToCustomize :productListing="products" :categories="categories" ref="updateCarousel" @designsData="changeProduct" @retrieveProducts="retrieveProducts" @search="getSearchQuery"/>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ChooseColor from '@/components/ChooseColor.vue'
import CustomizationPreview from '@/components/CustomizationPreview.vue'
import ItemToCustomize from '@/components/ItemToCustomize.vue'
import ChooseInterest from '@/components/ChooseInterest.vue'
import CustomizationTabs from '@/components/CustomizationTabs.vue'
import LockerRoomModal from '@/components/LockerRoomModal.vue'
import { http } from "@/httpCommon"

@Component<Home>({
  components: {
    ChooseColor,
    CustomizationPreview,
    ItemToCustomize,
    ChooseInterest,
    LockerRoomModal,
    CustomizationTabs
  },
  mounted() {
    if (this.isAuthenticated) {
      this.retrieveProducts()
      this.getFillColors()
    }
    this.jwtToken = localStorage.getItem('jwtToken')
    if(this.isAssociation && this.jwtToken){
      this.getLogoAssociation()
    }
    this.mobileScreen = this.$store.state.is_mobile
    this.$store.dispatch('setCategories')
    this.$store.dispatch('setJwtToken')
    this.$store.dispatch('setBrowserToken')
  }
})

export default class Home extends Vue {
  private products : any[] = []
  private nextPageUrl !: string
  public designsIndex = 0
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

  private apiBaseUrl: string =  process.env.VUE_APP_API_BASE_URL

  get isAuthenticated (): boolean {
    return this.$store.getters.isAuthenticated
  }
  get categories(): [] {
    return this.$store.getters.getCategories
  }
  get isAssociation(): [] {
    return this.$store.getters.getIsAssociation
  }
  get manageComponents(): [] {
    return this.$store.getters.getManageComponents
  }

  getFillColors(){
    const url = '/product/colors?default_color=1'
    http.get(url).then((response: any) => {
      this.colors = JSON.parse(response.data.color_text)
    }).catch((e: any) => {
      console.log(e)
    });
  }

  public showAdvanceCustomization(){
    this.$store.dispatch('setManageComponents', {index: 'BasicCustomization', value: false})
    this.$store.dispatch('setManageComponents', {index: 'AdvanceCustomization', value: true})
  }
  public showBasicCustomization(){
    this.$store.dispatch('setManageComponents', {index: 'BasicCustomization', value: true})
    this.$store.dispatch('setManageComponents', {index: 'AdvanceCustomization', value: false})
  }

  public retrieveProducts(url = '/list/products', searchCall = false): void {
    if (this.nextPageUrl && !searchCall) {
      url = this.nextPageUrl
    }
    if(searchCall){
      this.products = []
    }

    if(this.hasProducts) {
      const self = this
      http.get(url).then((response: any) => {
        this.products = this.products.concat(response.data.products.data)
        this.nextPageUrl = response.data.products.next_page_url
        if (!response.data.products.next_page_url) {
          this.hasProducts = false
        }
      }).catch((e: any) => {
        console.log(e)
      });
    }
  }

  public searchProducts(){
    this.hasProducts = true
    let url = '/list/products?';
    if(this.search){
      url += '&search=' + this.search
    }
    if(this.category_id){
      url += '&category_id=' + this.category_id
    }
    this.retrieveProducts(url, true)
  }
  public getSearchQuery(param: string, type: string){
    if(type == 'search'){
      this.search = param
    }
    else{
      this.category_id = param
    }
    this.searchProducts()
  }
  public changeProduct(designsIndex :number){
    this.designsIndex = designsIndex
  }
  public uploadLogo() {
    this.ref.fileInput.click()
  }

  public hideModal() {
    this.ref.myModal.hide()
  }

  public uploadLogoImage(e: any) {
    let img = e.target.files[0]
    console.log(img)
    let fd = new FormData()
    let header = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
    fd.append('file', img)
    http.post('/customer/upload/logo', fd, header)
      .then(resp => {
        this.logoUrl = this.apiBaseUrl+'/'+resp.data.file.logo_url
        let logo = {url: resp.data.file.logo_url, width: 100, height: 100, x_axis: 150, y_axis: 190, haveControls: true, side: 'front'}
        this.$store.dispatch('setCustomLogos', logo)
        if(!this.jwtToken) {
          this.$store.dispatch('setIsAssociation', {associate: true})
        }
        this.hideModal()
      })
      .catch((e: any) => {
        console.log(e)
      })
  }

  public getLogoAssociation(){
    const url = '/customer/associateresource'
    http.get(url).then((response: any) => {
      console.log(response)
      this.$store.dispatch('setIsAssociation', {associate: false})
    }).catch((e: any) => {
      console.log(e)
    });
  }
}
</script>

<style lang="scss" scoped>
  .page-wrapper{
    @media only screen and (min-width: 992px){
      border: 1px solid #dee2e6;
      background: #fff;
    }
  }
  .home-color-area{
    @media only screen and (min-width: 992px){
      padding-bottom: 10rem !important;
      border-right: 1px solid #dee2e6;
    }
  }
  .upload-logo-opener{
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 20px;
    text-align: center;
    border-top: 1px solid #dee2e6;
    color: #808895;
    @media only screen and (min-width: 1200px){
      padding: 30px;
    }
    .btn{
      background: none;
      color: #808895;
      border: none;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      padding: 0;
      font-size: 10px;
      max-width: 100%;
      margin: 0 auto;
      @media only screen and (min-width: 1200px){
        max-width: 300px;
      }
      &.btn-secondary{
        &:active{
          background-color: transparent;
          border-color: transparent;
          color: #808895;
        }
        &:focus{box-shadow: none;}
      }
    }
    .upload-box{
      text-align: center;
      width: 68px;
      height: 68px;
      border: 1px dashed #dee2e6;
      border-radius: 5px;
      padding: 10px 5px;
      font-size: 9px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      @media only screen and (min-width: 1200px){
        width: 74px;
        height: 74px;
        font-size: 10px;
      }
      @media only screen and (min-width: 1366px){
        width: 84px;
        height: 84px;
        font-size: 12px;
      }
      .icon-holder{
        font-size: 24px;
        @media only screen and (min-width: 1366px){
          font-size: 32px;
        }
      }
    }
    .upload-logo-content{
      padding: 5px 0 5px 8px;
      text-align: left;
      @media only screen and (min-width: 1200px){
        padding: 10px;
      }
      h3{
        font-size: 13px;
        color: #03142E;
        font-weight: 600;
        @media only screen and (min-width: 1200px){
          font-size: 14px;
        }
        @media only screen and (min-width: 1366px){
          font-size: 16px;
        }
      }
      h4{
        font-size: 12px;
        color: #03142E;
        font-weight: 400;
        @media only screen and (min-width: 1200px){
          font-size: 14px;
        }
      }
    }
  }
  .fileLoader
  {
    display:none;
  }
  //.customization-preview-process{
    .undo-btn-area{
      .btn{
        color: #000;
        border-color: #DDDFE3;
        font-size: 12px;
        font-weight: 600;
        &:hover{
          color: #fff;
        }
      }
    }
    .preview-area-header{
      margin: 0 -15px;
      padding: 26px 15px;
      border-bottom: 1px solid #EDF2F6;
      min-height: 91px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      .btn{
        margin: 0 15px 0 0;
        font-size: 14px;
        font-weight: 600;
        color: #000;
        border-color: #DDDFE3;
        border-radius: 5px;
        &:hover{color: #fff;}
      }
      .preview-header-icons{
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        align-items: center;
        font-size: 18px;
        list-style: none;
        li{margin: 0 0 0 12px;}
      }
    }
  //}
  .preview-section{
    overflow: hidden;
    max-width: 610px;
    margin: 0 auto;
    .image-holder{
      margin: 0 1%;
      flex: 0 0 48%;
      max-width: 48%;
      img{
        display: block;
        max-width: 100%;
        margin: 0 auto;
        height: auto;
      }
    }
  }
  .preview-area-customize{
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    height: 60vh;
  }


</style>
