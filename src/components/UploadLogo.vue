<template>
  <div style="padding-bottom: 5px" class="upload-logo-opener" v-if="customLogos">
    <div class="logo-option-area mb-3 mt-3" v-if="customLogos[customLogoIndex] && customLogos[customLogoIndex].url">

<!--      <b-form-group label="Individual radios" v-slot="{ ariaDescribedby }">
        <b-form-radio @change="changeLogoBackground" v-model="customLogos[customLogoIndex].logo_background" :aria-describedby="ariaDescribedby" name="logo-background" value="A">Remove Logo Background</b-form-radio>
        <b-form-radio @change="changeLogoBackground" v-model="customLogos[customLogoIndex].logo_background" :aria-describedby="ariaDescribedby" name="logo-background" value="B">Remove Smart Logo Background</b-form-radio>
      </b-form-group>-->

      <div class="w-100 text-left pl-2" style="margin-top: 6rem">
        <div>
          <b-form-checkbox  v-model="customLogos[customLogoIndex].is_transparent" @change="toggleLogoBackground('transparent',$event)">
            Remove background color
          </b-form-checkbox>
        </div>
        <div class="mt-2">
          <b-form-checkbox  v-model="customLogos[customLogoIndex].is_smart_transparent" @change="toggleLogoBackground('smart_transparent',$event)">
            Smart remove background from logo
          </b-form-checkbox>
        </div>
      </div>
    </div>


    <div class="btn btn-secondary modal-handler" >
      <div class="upload-box position-relative" :style="{overflow: customLogos[customLogoIndex].url ? 'visible' : 'hidden'}">
        <div class="loader relative" v-if="showLoader"><img src="../../src/assets/images/loading.gif" /></div>
        <div class="uploaded-logo-holder" v-if="showImage && customLogos[customLogoIndex] && customLogos[customLogoIndex].url">
          <img crossorigin="anonymous" :src="storageUrl+customLogos[customLogoIndex].url+'?not-from-cache-please'" width="100%"/>
        </div>
        <div v-else>
          <div class="icon-holder">
            <font-awesome-icon :icon="['fas', 'image']"/>
          </div>
          <slot name="upload_text">Upload Logo</slot>
        </div>
        <div class="remove-img" v-if="showActions && customLogos[customLogoIndex] && customLogos[customLogoIndex].url">
          <a  @click="deleteLogo">
            <font-awesome-icon :icon="['fas', 'trash-alt']"/>
          </a>
        </div>
        <input  :style="{display: customLogos[customLogoIndex].url ? 'none' : 'block'}"
                type="file"
                name="logos" ref="fileInput"
                @change="uploadLogoImage"
                @click="onClickUpload"
                @drop="onDragUpload"
                class="fileLoader"
               accept="image/*,application/postscript,application/pdf">
      </div>

      <div class="upload-logo-content">
        <template v-if="customLogoIndex === 0">
          <h3>{{ customLogos[0] && customLogos[0].url? 'Replace Team Logo' : 'Upload Team Logo' }}</h3>
        </template>
        <template v-else>
          <h3>{{ customLogos[customLogoIndex] && customLogos[customLogoIndex].url? 'Replace Logo' : 'Upload Logo' }}</h3>
        </template>
        <h4>Image Requirements</h4>
        <p>Need High Res Image</p>
      </div>
    </div>


    <b-modal ref="myModal" content-class="upload-logo-disclaimer" id="modal-center" centered title="Upload Logo">
      <p class="mb-3">By uploading an image, you guarantee that your use of the image does not infringe any rights or
        laws. You may
        review Customizer’s design rejection reasons <a href="#">HERE</a>.</p>
      <div class="mb-2">
        <b-form-checkbox
          id="checkbox-1"
          v-model="status"
          name="checkbox-1"
          value="accepted"
          unchecked-value="not_accepted">
          Don't show again.
        </b-form-checkbox>
      </div>
      <div class="upload-logo-buttons">
        <b-button class="btn-cancel" @click="hideModal">Cancel</b-button>
        <b-button v-if="this.uploadType=='click'" class="btn-upload" @click="uploadLogoBtn">Confirm and Upload logo</b-button>
        <b-button v-if="this.uploadType=='drag'" class="btn-upload" @click="uploadLogoDraged">Confirm and Upload logo</b-button>
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">

import {Component, Prop, Watch, Vue, Mixins} from 'vue-property-decorator'
import {http} from "@/httpCommon"
import {getClosestColor} from '@/pantoneColor'
import rgbHex from 'rgb-hex'
import ErrorMessages from "@/mixins/ErrorMessages";
import {fileToBase64, getLogoObject, setLogoSettings} from "../helpers/Helpers"

@Component<UploadLogo>({
  mounted() {
      if (localStorage.getItem('logo_modal_status') == null) {
        this.open_modal = true
      } else {
        this.open_modal = false
      }
 }
})
export default class UploadLogo extends Mixins(ErrorMessages) {
  public status = 'accepted'
  public open_modal!: boolean
  public mounted!: boolean
  public colors: any = [];
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public ref = this.$refs as Record<any, any>
  public imageColors: any[] = []
  public showLoader = false;

  public fileObject: Record<any, any> = {}
  public uploadType = 'click'

  @Prop({ required: true }) customLogoIndex!: number
  @Prop({ required: false, default: true }) showImage!: boolean
  @Prop({ required: false, default: true }) showActions!: boolean

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  // @Watch('customLogos', {
  //   deep: true
  // })
  /* customLogosChanged(newVal: [Record<any, any>]) {
    if (this.customLogos[0] && !this.customLogos[0].url) {
      let inputRef = this.$refs.fileInput as Record<any, any>
      inputRef.value = null;
    }
    // if (this.customLogos[0] && this.logoUrl != this.customLogos[0].url) {
    //   if(!this.$store.getters.getColorsFromRecent)
    //     //this.getLogoColors()
    // }
  }*/

  public uploadLogoBtn() {
    if (this.status == 'accepted' && localStorage.getItem('logo_modal_status') == null) {
      localStorage.setItem('logo_modal_status', 'false')
      this.open_modal = false
      this.hideModal();
    }

    if(this.ref.fileInput) {
      this.ref.fileInput.click()
    }
  }

  public uploadLogoDraged() {
    if (this.status == 'accepted' && localStorage.getItem('logo_modal_status') == null) {
      localStorage.setItem('logo_modal_status', 'false')
      this.open_modal = false
      this.hideModal();
    }

    this.processLogoImage();

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

  get logoUrl(): Record<any, any>[] {
    return this.$store.getters.getLogoUrl
  }

/*  get manageComponents(): [] {
    return this.$store.getters.getManageComponents
  }*/

  public modalHandler() {
    if (this.open_modal) {
      this.showModal()
    } else {
      this.uploadLogoBtn()
    }
  }

  public onClickUpload(e){
    this.uploadType = 'click'
    if ((localStorage.getItem('logo_modal_status') == null)) {
      e.preventDefault()
      this.showModal()
    }
  }

  public onDragUpload(e: any) {
    e.preventDefault()
    this.fileObject = e.dataTransfer.files[0];
    this.uploadType = 'drag';
    if ((localStorage.getItem('logo_modal_status') == null)) {
      this.showModal()
    }else{
      this.processLogoImage();
    }
  }

  /*public customLogoInit(customLogoIndex: number | null = null) {
    if (this.selectedProduct && this.selectedProduct.is_logo_allowed == 1) {
      let logoSetting = this.selectedProduct.logos_setting[0]
      if(customLogoIndex) {
        logoSetting = this.selectedProduct.logos_setting[customLogoIndex]
      }
      if(!logoSetting) {
        logoSetting = {
          width: 200,
          x_axis: 150,
          y_axis: 190,
          rotation: 0,
          haveControls: true,
          side: 'front'
        }
      }

      let logo = {
        url: '',
        width: logoSetting.width,
        height: logoSetting.height,
        x_axis: logoSetting.x_axis,
        y_axis: logoSetting.y_axis,
        rotation: logoSetting.rotation,
        haveControls: Boolean(!logoSetting.is_locked),
        side: logoSetting.side,
        customLogo: true,
        logoIndex: customLogoIndex,
        is_transparent: false
      }
      this.$store.dispatch('setCustomLogos', logo)
    }
  }*/

  public uploadLogoImage(e: any) {
    this.fileObject = e.target.files[0];
    this.processLogoImage();
  }

  public processLogoImage() {

    let custom_logo = JSON.parse(JSON.stringify(this.customLogos[this.customLogoIndex]));
    custom_logo.logoIndex = this.customLogoIndex;
    let img = this.fileObject
    let file_extension = img.name.toLowerCase();
    if (!this.hasExtension(file_extension, ['.jpg','.gif','.png','jpeg','pdf','eps','ai'])) {
      this.showToast('The file must be a file of type: jpg, jpeg, png, pdf, eps, ai.','Error');
      return false;
    }
    fileToBase64(img).then(base64_string => {
      custom_logo.base64_logo = base64_string
    })

    let fd = new FormData()
    let header = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
    fd.append('file', img)
    fd.append('product_id', this.selectedProduct.product_id)
    this.showLoader = true;
      http.post('/customer/upload/logo', fd, header)
      .then(resp => {
        this.colors = resp.data.colors;
        const inputRef = this.$refs.fileInput as Record<any, any>
        inputRef.value = null;
        custom_logo.original_logo = resp.data.file.logo_url;
        custom_logo.transparent_logo = resp.data.file.transparent_logo_url;
        custom_logo.smart_transparent_logo = resp.data.file.smart_transparent_logo_url;
        custom_logo.is_smart_transparent = false;
        custom_logo.url = resp.data.file.logo_url;
        let getLogos = []
        if (this.customLogos.length > 1){
          getLogos = this.customLogos.slice(0, -1)
        }else{
          getLogos = this.customLogos
        }
        this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(getLogos)), action: 'customLogos' })
        this.$store.commit('SET_COLORS_FROM_RECENT',false)
        this.$store.commit('customLogos', custom_logo)
        this.hideModal()
        this.getLogoColors()
        this.$store.commit('SET_RECENT_LOGOS');
        this.showLoader = false;
      })
      .catch((error: any) => {
        console.log(error)
        this.showLoader = false;
        this.showError(error);
      })
  }

  /*public uploadLogoImage_back(e: any) {
    if (!this.customLogos[this.customLogoIndex]) {
      this.customLogoInit(this.customLogoIndex)
    }
    let img = e.target.files[0]
    let file_extension = img.name.toLowerCase();
    if (!this.hasExtension(file_extension, ['.jpg','.gif','.png','jpeg','pdf','eps','ai'])) {
      this.showToast('The file must be a file of type: jpg, jpeg, png, pdf, eps, ai.','Error');
      return false;
    }

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
        this.colors = resp.data.colors;
        const inputRef = this.$refs.fileInput as Record<any, any>
        inputRef.value = null;

        const original_logo = resp.data.file.logo_url;
        const transparent_logo = resp.data.file.transparent_logo_url;
        let logo_url = '';
        let is_transparent = false;

        if(this.customLogos[this.customLogoIndex].is_transparent===true){
          logo_url = transparent_logo;
          is_transparent = true;
        }else{
          logo_url = original_logo;
        }
        let getLogos = []
        if (this.customLogos.length > 1){
          getLogos = this.customLogos.slice(0, -1)
        }else{
          getLogos = this.customLogos
        }
        this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(getLogos)), action: 'customLogos' })
        let payload = [{
          index: this.customLogoIndex,
          attribute: 'url',
          value: logo_url
        },{
          index: this.customLogoIndex,
          attribute: 'id',
          value: resp.data.file.id
        },{
            index: this.customLogoIndex,
            attribute: 'is_transparent',
            value: is_transparent
          },
          {
            index: this.customLogoIndex,
            attribute: 'original_logo',
            value: original_logo
          },
          {
            index: this.customLogoIndex,
            attribute: 'transparent_logo',
            value: transparent_logo
          }

        ];
        this.$store.commit('SET_COLORS_FROM_RECENT',false)
        payload.forEach((data) => {
          this.$store.dispatch('updateCustomLogoAttribute', data)
        })
        this.hideModal()
        this.getLogoColors()
        this.$store.commit('SET_RECENT_LOGOS')
      })
      .catch((error: any) => {
        console.log(error)
        this.showError(error);
      })
  }*/

  public hasExtension(fileName : string, exts: any) : boolean {

    return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
  }

  public getLogoColors() {
      if (this.customLogos.length) {
      if (this.customLogos[0] && this.customLogos[0].url) {
        this.$store.dispatch("SET_LOGO_URL", {logoUrl: this.customLogos[0].url})
        if (this.colors.length){
          this.processColors(this.colors)
        }
      }
    }
  }

  async processColors(colors: []) {
    this.imageColors = []
    let uniqueColors: string[] = []
    colors.forEach((color: number[]) => {
      const hex = rgbHex(color[0], color[1], color[2])
      if ((!uniqueColors.includes(hex))) {
        uniqueColors.push(hex)
      }
    })
    let deletedCount = uniqueColors.length - 4
    uniqueColors.splice(4, deletedCount)

    uniqueColors.forEach((color: string) => {
     // console.log(color)
      let pantoneColor = getClosestColor(color)
      //console.log(JSON.parse(JSON.stringify(pantoneColor)))
      this.imageColors.push({hex: pantoneColor.hex, pantone: pantoneColor.pantone, name: pantoneColor.name})
    })
    let unique_colors_count = uniqueColors.length;
    if(unique_colors_count < 4) {
      while(unique_colors_count > 0 ) {
        this.imageColors.push({hex: null, pantone: null, name: null})
        --unique_colors_count;
      }
    }
    //only set logo colors if index is 0
    if(this.customLogoIndex == 0) {
      await this.$store.dispatch("SET_LOGO_COLORS", this.imageColors);
      await this.$store.dispatch("initialLogoColors", JSON.stringify(this.imageColors));
    }
  }

  public deleteLogo() {
    let inputRef = this.$refs.fileInput as Record<any, any>
    inputRef.value = null;
    let logo = setLogoSettings(this.customLogoIndex);
    logo.logoIndex = this.customLogoIndex;
    this.$store.commit('customLogos', logo)
    this.$store.commit('SET_LOGO_COLORS', []);
    this.$store.commit('SET_INITIAL_LOGO_COLORS', []);
  }

  public toggleLogoBackground(type:string,val:boolean) {
    let payload = {index:this.customLogoIndex,type,val}
    if(this.customLogos[this.customLogoIndex]){
      this.$store.dispatch('toggleLogoBackgroud', payload)
    }
  }
  // public changeLogoBackground(val) {
  //
  // }
}

</script>

<style lang="scss" scoped>
.upload-logo-opener {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 15px;
  text-align: center;
  color: #808895;
  border-radius: 20px 20px 0 0;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  z-index: 9;
  @media only screen and (min-width: 992px) {
    position: absolute;
    border-radius: 0;
    background: none;
    border-top: 1px solid #dee2e6;
    box-shadow: none;
    padding: 20px;
  }
  @media only screen and (min-width: 1200px) {
    padding: 30px;
    background: #fff;
  }

  .btn {
    background: none;
    color: #808895;
    border: none;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 0;
    font-size: 10px;
    max-width: 100%;
    @media only screen and (min-width: 768px){
      max-width: 300px;
      margin: 0 auto;
    }

    &.btn-secondary {
      &:active {
        background-color: transparent;
        border-color: transparent;
        color: #808895;
      }

      &:focus {
        box-shadow: none;
      }
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
    flex-direction: column;
    //overflow: hidden;
    position: relative;
    @media only screen and (min-width: 992px) {
      width: 64px;
      height: 64px;
    }
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
      @media only screen and (min-width: 992px) {
        font-size: 20px;
      }
      @media only screen and (min-width: 1366px) {
        font-size: 32px;
      }
    }
    .uploaded-logo-holder{
      height: 100%;
      max-width: 100%;
      img{
        display: block;
        height: auto;
        margin: 0 auto;
        max-width: 100%;
        max-height: 100%;
      }
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

  .remove-img {
    position: absolute;
    right: -10px;
    top: -10px;
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
    @media only screen and (min-width: 992px) {
      left: auto;
      top: -7px;
    }
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

  //.remove-img {
  //  position: absolute;
  //  left: auto;
  //  width: 20px;
  //  height: 20px;
  //  border-radius: 50%;
  //  background: #F8E1E2;
  //  //display: flex;
  //  //flex-wrap: wrap;
  //  //justify-content: center;
  //  //align-items: center;
  //  font-size: 10px;
  //  color: #D53943;
  //}
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
  display: block;
  position: absolute;
  appearance: none;
  width: 1000px;
  height: 1000px;
  left: 0;
  top: 0;
  z-index: 50;
  opacity: 0;
}
.logo-option-area{
  max-width: 285px;
  margin: 0 auto;
  text-align: left;
}
</style>
