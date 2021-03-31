<template>
  <div class="page-wrapper m-4 bg-white border">
    <b-container fluid>
      <b-row>
        <b-col cols="3" class="text-left border-right py-5 overflow-hidden">
            <ChooseColor />
            <div class="upload-logo-opener">
                <b-button v-b-modal.modal-center>
                  <div class="upload-box">
                    <div class="icon-holder"><font-awesome-icon :icon="['fas', 'image']" /></div>
                    Upload Logo
                  </div>
                  <div class="upload-logo-content">
                    <h3>Upload Logo Image</h3>
                    <h4>Image Requirments</h4>
                    <p>Need High Res Image</p>
                  </div>
                </b-button>
                <b-modal ok-title="Confirm and Upload logo" content-class="upload-logo-disclaimer" id="modal-center" centered title="Upload Logo">
                    <p>By uploading an image, you guarantee that your use of the image does not infringe any rights or laws. You may review Customizer’s design rejection reasons <a href="#">HERE</a>.</p>
                </b-modal>
            </div>
        </b-col>
        <b-col cols="6" class="border-right d-flex flex-wrap align-items-center h-100vh justify-content-center">
          <div class="customization-area p-5">
            <CustomizationPreview />
            <b-button class="mt-5" variant="secondary">Continue</b-button>
          </div>
        </b-col>
        <b-col cols="3">
          <ItemToCustomize :productListing="products" />
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
import ApiDataService from "@/services/ApiDataService";

@Component<Home>({
  components: {
    ChooseColor,
    CustomizationPreview,
    ItemToCustomize
  },
  mounted() {
    this.retrieveProducts()
  }
})

export default class Home extends Vue {
  private products : any[] = []
  private company_id !: string
  private product_id !: string

  retrieveProducts(): void {
    this.product_id = '1'
    this.company_id = '1'
    let param = '?product_id='+this.product_id+'&company_id='+this.company_id
    ApiDataService.getAll(param)
      .then((response: any) => {
        setTimeout(function(){
          console.log(response.data);
        }, 2000)
        this.products = response.data.products.data;
      })
      .catch((e: any) => {
        console.log(e)
      });
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
