<template>
  <div class="page-wrapper m-4 bg-white border">
    <b-container fluid>
      <b-row>
        <b-col cols="3" class="text-left border-right py-5 overflow-hidden">
          <ChooseColor :colors="colors"/>
            <div class="upload-logo-opener">
                <b-button v-b-modal.modal-center>
                  <div class="upload-box">
                    <div v-if="imagePath">
                      <img src="imagePath"/>
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
                      <input type="file" name="logos" ref="fileInput" @change="uploadImage" class="fileLoader">
                      <b-button class="btn-upload" @click="uploadLogo">Confirm and Upload logo</b-button>
                    </div>
                </b-modal>
            </div>
        </b-col>
        <b-col cols="6" class="border-right d-flex flex-wrap align-items-center h-100vh justify-content-center">
          <div class="customization-area p-5">
            <CustomizationPreview :designs="products[designsIndex]" />
            <b-button class="mt-5" variant="secondary">Continue</b-button>
          </div>
        </b-col>
        <b-col cols="3">
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
import { http } from "@/httpCommon"

@Component<Home>({
  components: {
    ChooseColor,
    CustomizationPreview,
    ItemToCustomize
  },
  mounted() {
    if (this.isAuthenticated) {
      this.retrieveProducts()
    }
    this.$store.commit('defaultFillColors')
    console.log(this.categories)
  }
})

export default class Home extends Vue {
  private products : any[] = []
  private nextPageUrl !: string
  public designsIndex = 0
  public hasProducts = true
  public category_id !: string
  public search = ''
  public default_color = true
  public product_id !: number
  public provider_id = 'oVXYIzKY'
  public imagePath = ''
  public ref = this.$refs as Record<any, any>

  get isAuthenticated (): boolean {
    return this.$store.getters.isAuthenticated
  }
  get colors(): [] {
    return this.$store.getters.getDefaultColors
  }
  get categories(): [] {
    return this.$store.getters.getCategories
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
    fd.append('image', img)
    http.post('/upload-image', fd, header)
    // http.post('/upload-image', fd)
      .then(resp => {
        this.imagePath = resp.data.path
      })
  }
}
</script>

<style lang="scss" scoped>
  .upload-logo-opener{
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 30px;
    text-align: center;
    border-top: 1px solid #dee2e6;
    color: #808895;
    .btn{
      background: none;
      color: #808895;
      border: none;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      padding: 0;
      font-size: 10px;
      max-width: 300px;
      margin: 0 auto;
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
      width: 84px;
      height: 84px;
      border: 1px dashed #dee2e6;
      border-radius: 5px;
      padding: 10px 5px;
      font-size: 12px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      .icon-holder{font-size: 32px;}
    }
    .upload-logo-content{
      padding: 10px;
      text-align: left;
      h3{
        font-size: 16px;
        color: #03142E;
        font-weight: 600;
      }
      h4{
        font-size: 14px;
        color: #03142E;
        font-weight: 400;
      }
    }
  }
  .fileLoader
  {
    display:none;
  }

</style>
