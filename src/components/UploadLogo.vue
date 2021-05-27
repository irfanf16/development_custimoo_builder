<template>
  <div class="upload-logo-opener">
<!--    <b-button v-b-modal.modal-center>-->
    <div v-if="customLogos.length && customLogos[0].url && manageComponents.BasicCustomization">
      <a class="remove-img" @click="deleteFirstLogo">
        <font-awesome-icon :icon="['fas', 'trash-alt']"/>
      </a>
    </div>
    <div class="btn btn-secondary modal-handler" @click="modalHandler">
      <div class="upload-box">
<!--        <div v-if="logoUrl && manageComponents.BasicCustomization">-->
<!--          <img :src="logoUrl" width="100%"/>-->
        <div v-if="customLogos.length && customLogos[0].url && manageComponents.BasicCustomization">
          <img :src="apiBaseUrl+'/'+customLogos[0].url" width="100%"/>
<!--          <a class="remove-img" @click="deleteFirstLogo">-->
<!--            <font-awesome-icon :icon="['fas', 'trash-alt']"/>-->
<!--          </a>-->
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
    </div>
<!--    </b-button>-->
    <b-modal ref="myModal" content-class="upload-logo-disclaimer" id="modal-center" centered title="Upload Logo">
      <p class="mb-3">By uploading an image, you guarantee that your use of the image does not infringe any rights or laws. You may
        review Customizer’s design rejection reasons <a href="#">HERE</a>.</p>
        <div class="mb-2">
          <b-form-checkbox
            id="checkbox-1"
            v-model="status"
            name="checkbox-1"
            value="accepted"
            unchecked-value="not_accepted"
          >
            Confirm for all logos
          </b-form-checkbox>

        </div>
      <div class="upload-logo-buttons">
        <b-button class="btn-cancel" @click="hideModal">Cancel</b-button>
        <input type="file" name="logos" ref="fileInput" @change="uploadLogoImage" class="fileLoader"
               accept="image/*">
        <b-button class="btn-upload" @click="uploadLogoBtn">Confirm and Upload logo</b-button>
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">

import {Component, Prop, Watch, Vue} from 'vue-property-decorator'
import {http} from "@/httpCommon"

@Component<UploadLogo>({
  mounted() {
    this.$store.dispatch('setJwtToken')
    this.$store.dispatch('setBrowserToken')
    if(this.customLogos.length){
      if (this.customLogos[this.customLogoIndex].url == '') {
        this.modalHandler()
      }
    }
  }
})
export default class UploadLogo extends Vue {
  public status= 'not_accepted'
  @Prop({required: true}) customLogoIndex!: any
  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }

  @Watch('logoUrl', {
    immediate: true, deep: true
  })

  logoUrlChanged() {
    if(Object.keys(this.customLogos).length) {
      const firstImage = Object.values(this.customLogos)[0] as Record<any, any>
      let customLogoUrl = firstImage.url
      if(customLogoUrl != '') {
        this.logoUrl = this.apiBaseUrl + '/' + customLogoUrl
      } else {
        this.logoUrl = ''
      }
    }
  }

  private jwtToken !: string
  private apiBaseUrl = process.env.VUE_APP_API_BASE_URL
  public logoUrl = ''
  public ref = this.$refs as Record<any, any>

  public uploadLogoBtn() {
    this.ref.fileInput.click()
  }

  public showModal() {
    this.ref.myModal.show()
  }

  public hideModal() {
    this.ref.myModal.hide()
  }

  get customLogos(): Record<any, any>[] {
    return this.$store.getters.getCustomLogos
  }

  get manageComponents(): [] {
    return this.$store.getters.getManageComponents
  }

  public modalHandler(){
    let manageComponent = this.manageComponents as Record<any, any>
    if(manageComponent.AdvanceCustomization) {
      this.showModal()
    }
    if(manageComponent.BasicCustomization) {
        this.showModal()
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
        haveControls: Boolean(!logoSetting.is_locked),
        side: logoSetting.side,
        customLogo: true
      }
      this.$store.dispatch('setCustomLogos', logo)
    }
  }

  public uploadLogoImage(e: any) {
    if(this.customLogos.length === 0) {
      this.customLogoInit()
    }
    let img = e.target.files[0]
    let fd = new FormData()
    let header = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
    fd.append('file', img)
    fd.append('product_id', this.selectedProduct.product_id)
    http.post('/customer/upload/logo', fd, header)
      .then(resp => {
        this.logoUrl = this.apiBaseUrl + '/' + resp.data.file.logo_url
        let payload = [{
          index: this.customLogoIndex,
          attribute: 'url',
          value: resp.data.file.logo_url
        },{
          index: this.customLogoIndex,
          attribute: 'id',
          value: resp.data.file.id
        }];
        payload.forEach((data) => {
          this.$store.dispatch('updateCustomLogoAttribute', data)
        })

        if (!this.jwtToken) {
          localStorage.setItem('isAssociation', 'true')
        }
        this.hideModal()
        this.$emit("logoChange")
      })
      .catch((e: any) => {
        console.log(e)
      })
  }

  public deleteFirstLogo() {
    let payload = {
      index: 0
    }
    this.$store.dispatch('deleteCustomLogo', payload)
  }
}

</script>

<style lang="scss" scoped>
    .upload-logo-opener{
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 15px;
        text-align: center;
        color: #808895;
        border-radius: 20px 20px 0 0;
        background: #fff;
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
        z-index: 9;
        @media only screen and (min-width: 992px){
            position: absolute;
            border-radius: 0;
            background: none;
            border-top: 1px solid #dee2e6;
            box-shadow: none;
            padding: 20px;
        }
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
            @media only screen and (min-width: 992px){
                margin: 0 auto;
            }
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
            flex-direction: column;
            overflow: hidden;
            @media only screen and (min-width: 992px){
              width: 64px;
              height: 64px;
            }
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
                @media only screen and (min-width: 992px){
                    font-size: 20px;
                }
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
      .remove-img {
        position: absolute;
        right: 194px;
        top: 20px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #F8E1E2;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        font-size: 10px;
        color: #D53943;
      }
    }

  .upload-box {
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
    @media only screen and (min-width: 1200px) {
      width: 74px;
      height: 74px;
      font-size: 10px;
    }
    @media only screen and (min-width: 1366px) {
      width: 84px;
      height: 84px;
      font-size: 12px;
    }

    .icon-holder {
      font-size: 24px;
      @media only screen and (min-width: 1366px) {
        font-size: 32px;
      }
    }

    .remove-img {
      position: absolute;
      right: 194px;
      top: 20px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #F8E1E2;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      font-size: 10px;
      color: #D53943;
    }
  }

  .upload-logo-content {
    padding: 5px 0 5px 8px;
    text-align: left;
    @media only screen and (min-width: 1200px) {
      padding: 10px;
    }

    h3 {
      font-size: 13px;
      color: #03142E;
      font-weight: 600;
      @media only screen and (min-width: 1200px) {
        font-size: 14px;
      }
      @media only screen and (min-width: 1366px) {
        font-size: 16px;
      }
    }

    h4 {
      font-size: 12px;
      color: #03142E;
      font-weight: 400;
      @media only screen and (min-width: 1200px) {
        font-size: 14px;
      }
    }
  }

.fileLoader {
  display: none;
}
</style>
