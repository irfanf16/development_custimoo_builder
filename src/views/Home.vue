<template>
  <div class="page-wrapper m-4">
    <b-container fluid>
      <b-row>
        <b-col v-if="manageComponents.ChooseColor" cols="12" lg="3" class="text-left py-3 pb-5 py-lg-5 overflow-hidden home-color-area">
          <ChooseColor :colors="colors" />
            <div v-if="!mobileScreen" class="upload-logo-opener d-none d-lg-block">
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
                      <input type="file" name="logos" ref="fileInput" @change="uploadImage" class="fileLoader" accept="image/x-png,image/jpeg">
                      <b-button class="btn-upload" @click="uploadLogo">Confirm and Upload logo</b-button>
                    </div>
                </b-modal>
            </div>
        </b-col>
        <b-col v-if="manageComponents.ChooseInterest" cols="12" class="pb-5">
          <ChooseInterest />
        </b-col>
        <b-col v-if="manageComponents.CustomizationPreview" cols="6" class="d-none border-right d-lg-flex flex-wrap align-items-center h-100vh justify-content-center">
          <div class="customization-area p-5">
            <CustomizationPreview :designs="products[designsIndex]" :logos="logos"/>
            <b-button class="mt-5" variant="secondary">Continue</b-button>
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
import { http } from "@/httpCommon"

@Component<Home>({
  components: {
    ChooseColor,
    CustomizationPreview,
    ItemToCustomize,
    ChooseInterest
  },
  mounted() {
    if (this.isAuthenticated) {
      this.retrieveProducts()
      this.getFillColors()
    }
    this.mobileScreen = this.$store.state.is_mobile
    this.$store.dispatch('setCategories')
    this.$store.dispatch('setJwtToken')
    this.$store.dispatch('setBrowserToken')
    console.log(this.manageComponents)
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
  private logos : any[] = []
  public manageComponents = {
    ChooseColor: true,
    UploadLogo: !this.mobileScreen,
    ChooseInterest: this.mobileScreen,
    CustomizationPreview: !this.mobileScreen,
    ItemToCustomize: !this.mobileScreen,
  }
  private apiBaseUrl: string =  process.env.VUE_APP_API_BASE_URL

  get isAuthenticated (): boolean {
    return this.$store.getters.isAuthenticated
  }
  get categories(): [] {
    return this.$store.getters.getCategories
  }

  getFillColors(){
    const url = '/product/colors?default_color=1'
    http.get(url).then((response: any) => {
      this.colors = JSON.parse(response.data.color_text)
    }).catch((e: any) => {
      console.log(e)
    });
  }

  public retrieveProducts(url = '/list/products', searchCall = false): void {
    if (this.nextPageUrl && !searchCall) {
      url = this.nextPageUrl
    }
    if(searchCall){
      this.products = []
    }

    if(this.hasProducts) {
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

  public uploadImage(e: any) {
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
        console.log(resp)
        this.logoUrl = this.apiBaseUrl+'/'+resp.data.file.logo_url
        let logo = {url: this.logoUrl, width: 100, height: 100, x: 100, y: 117, haveControls: true, side: 'front'}
        this.logos = this.logos.concat(logo)
        console.log(this.logos)
        this.hideModal()
      })
      .catch((e: any) => {
        console.log(e)
      })
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

</style>
