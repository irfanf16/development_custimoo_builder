<template>
  <div class="page-wrapper m-4 bg-white border">
    <b-container fluid>
      <b-row>
        <b-col cols="3" class="text-left border-right py-5 overflow-hidden">
          <ChooseColor :colors="colors"/>
            <div class="upload-logo-opener">
                <b-button v-b-modal.modal-center>
                  <div class="upload-box">
                    <div class="icon-holder"><font-awesome-icon :icon="['fas', 'image']" /></div>
                    Upload Logo
                  </div>
                  <div class="upload-logo-content">
                    <h3>Upload Logo Image</h3>
                    <h4>Image Requirements</h4>
                    <p>Need High Res Image</p>
                  </div>
                </b-button>
                <b-modal content-class="upload-logo-disclaimer" id="modal-center" centered title="Upload Logo">
                    <p>By uploading an image, you guarantee that your use of the image does not infringe any rights or laws. You may review Customizer’s design rejection reasons <a href="#">HERE</a>.</p>
                    <div class="upload-logo-buttons">
                      <b-button class="btn-cancel">Cancel</b-button>
                      <b-button class="btn-upload">Confirm and Upload logo</b-button>
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
import http from "../httpCommon"
import axios from "axios";

@Component<Home>({
  components: {
    ChooseColor,
    CustomizationPreview,
    ItemToCustomize
  },
  mounted() {
    this.instance = axios.create({
      baseURL: "http://api.custimoo.com/api",
      headers: {
        "Content-type": "application/json"
      }
    });
    this.login()
    this.retrieveProducts()
    this.getCategoriesColors()
  }
})

export default class Home extends Vue {
  private products : any[] = []
  private categories : any[] = []
  private colors : any[] = []
  private nextPageUrl !: string
  public designsIndex = 0
  public hasProducts = true
  public category_id !: string
  public search = ''
  public default_color = true
  public product_id !: number
  public provider_id = 'oVXYIzKY'
  private instance !: any

  async login(url = '/company/login'): void {
    await this.instance.post(url, {
      provider_id: this.provider_id
    }).then((response: any) => {
      localStorage.setItem('access_token', response.data.accessToken)
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
        // this.categories = response.data.categories
        this.nextPageUrl = response.data.products.next_page_url
        if (!response.data.products.next_page_url) {
          this.hasProducts = false
        }
      }).catch((e: any) => {
        console.log(e)
      });
    }
  }

  public getCategoriesColors(defaultColor = true): void {
    let url = '/product/colors?'
    if(defaultColor){
      url += 'default_color=' + this.default_color
    }
    else if (this.product_id){
      url += 'product_id=' + this.product_id
    }

    http.get(url).then((response: any) => {
      this.categories = response.data.data.categories
      this.colors = JSON.parse(response.data.data.color.color_text)
    }).catch((e: any) => {
      console.log(e)
    });
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

</style>
