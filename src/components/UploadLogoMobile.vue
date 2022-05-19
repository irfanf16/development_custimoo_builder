<template>
<!--  <div class="upload-logo-opener">-->
<!--    <span class="close" @click="hideAll"><BIconX /></span>-->

<!--    <div class="logo-option-area mb-3" v-if="customLogos[customLogoIndex] && customLogos[customLogoIndex].url">-->
<!--      <b-form-checkbox  v-model="customLogos[customLogoIndex].is_transparent" @change="toggleLogoBackground">-->
<!--        Remove Logo Background-->
<!--      </b-form-checkbox>-->

  <div style="padding-bottom: 10px" class="upload-logo-opener" v-if="customLogos">

    <div class="logo-option-area mb-3 mt-3" v-if="customLogos[customLogoIndex] && customLogos[customLogoIndex].url">

<!--      <b-form-group label="Individual radios" v-slot="{ ariaDescribedby }">
        <b-form-radio @change="changeLogoBackground" v-model="customLogos[customLogoIndex].logo_background" :aria-describedby="ariaDescribedby" name="logo-background" value="A">Remove Logo Background</b-form-radio>
        <b-form-radio @change="changeLogoBackground" v-model="customLogos[customLogoIndex].logo_background" :aria-describedby="ariaDescribedby" name="logo-background" value="B">Remove Smart Logo Background</b-form-radio>
      </b-form-group>-->

      <div class="w-100 text-left position-relative logo-edit-btn-updated">
        <div class="d-sm-block d-lg-block continue-btn-holder pt-1" style="padding: 0">
          <b-button v-if="!mobileScreen" @click="openLogoEditor"  class="logo-editor-button" variant="secondary">Logo Editor</b-button>
          <LogoEditorModal @updateLogoFromLogoEditor="updateLogoFromLogoEditor" :customLogoIndex="this.customLogoIndex" ref="logoEditorModal" :logo_id="customLogos[customLogoIndex].id" />
        </div>
      </div>
    </div>


    <div class="btn btn-secondary modal-handler" >
      <div class="upload-box position-relative" :style="{overflow: customLogos[customLogoIndex].url ? 'visible' : 'hidden'}">
        <div class="loader relative" v-if="showLoader"><img src="../../src/assets/images/loading.gif" /></div>
        <div class="uploaded-logo-holder" v-if="showImage && customLogos[customLogoIndex] && customLogos[customLogoIndex].url">
          <img :src="storageUrl+customLogos[customLogoIndex].url+'?nocache=1'" width="100%"/>
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
    <b-button v-if="mobileScreen" style="position:absolute; left: 66px; top: 93px; width: auto" @click="openLogoEditor"  class="logo-editor-button" variant="secondary">
      <b-icon-pencil />
    </b-button>


    <modal :width="500" :resizable="true" :scrollable="true" height="auto" :reset="true"
           :shiftY="0" name="upload-logo-disclaimer" id="upload-logo-disclaimer" size="md" :hide-footer="true"
           :hide-header="true" class="upload-logo-disclaimer" ref="upload-logo-disclaimer">
      <div class="modal-header d-flex justify-content-between">
        <span class="fs-5 font-weight-bold">Attention!</span>
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hideVModal('upload-logo-disclaimer')"><BIconX /></span>
      </div>
      <div class="modal-body">
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
        <div class="upload-logo-buttons d-flex gap-1">
          <button class="btn btn-secondary light text-center justify-content-center p-2" @click="hideModal">Cancel</button>
          <button v-if="this.uploadType=='click'" class="btn btn-secondary text-center justify-content-center p-2" style="background: #219F84; color: #fff" @click="uploadLogoBtn">Confirm and Upload</button>
          <button v-if="this.uploadType=='drag'" class="btn btn-secondary text-center justify-content-center p-2" style="background: #219F84; color: #fff" @click="uploadLogoDraged">Confirm and Upload</button>
        </div>
      </div>
    </modal>
  </div>
</template>

<script lang="ts">

import {Component, Prop, Watch, Vue, Mixins} from 'vue-property-decorator'
import {http} from "@/httpCommon"
import {getClosestColor} from '@/pantoneColor'
import rgbHex from 'rgb-hex'
import ErrorMessages from "@/mixins/ErrorMessages";
import $ from "jquery";
import {fileToBase64, getLogoObject, setLogoSettings} from "../helpers/Helpers"
import LogoEditorModal from "@/components/LogoEditorModal.vue";
import ModalAction from "@/mixins/ModalAction";

@Component<UploadLogo>({
  components: {LogoEditorModal},
  mounted() {
      if (localStorage.getItem('logo_modal_status') == null) {
        this.open_modal = true
      } else {
        this.open_modal = false
      }
 }
})
export default class UploadLogo extends Mixins(ErrorMessages, ModalAction) {
  public status = 'accepted'
  public open_modal!: boolean
  public mounted!: boolean
  public colors: any = [];
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public ref = this.$refs as Record<any, any>
  public imageColors: any[] = []
  public showLoader = false;
  public mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  public fileObject: Record<any, any> = {}
  public uploadType = 'click'

  @Prop({ required: true }) customLogoIndex!: number
  @Prop({ required: false, default: true }) showImage!: boolean
  @Prop({ required: false, default: true }) showActions!: boolean

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  private hideAll(){
    this.$store.dispatch('setActiveTab', -1);
    $(".sideNav li a").removeClass('active')
  }

  @Watch('customLogos', {
    deep: true
  })
  customLogosChanged(newVal: [Record<any, any>]) {
    if (this.customLogos[0] && !this.customLogos[0].url) {
      let inputRef = this.$refs.fileInput as Record<any, any>
      inputRef.value = null;
    }
    if (this.customLogos[0] && this.logoUrl != this.customLogos[0].url) {
      this.getLogoColors()
    }
  }

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
  public openLogoEditor() {
    //set logo id and default image of logo
    this.$store.dispatch('editLogo',{key:'id',value:this.customLogos[this.customLogoIndex].id,api_call:false})
    this.$store.dispatch('editLogo',{key:'base64',value:this.customLogos[this.customLogoIndex].base64_logo,api_call:false})
    this.$store.dispatch('editLogo',{key:'originalBase64',value:this.customLogos[this.customLogoIndex].base64_logo,api_call:false})
    this.$store.dispatch('toggleLogoCheck', {type:'color',val:false})
    this.$store.dispatch('toggleLogoCheck', {type:'background',val:false})
    this.showVModal('logo-modal')
  }

  public showModal() {
    this.showVModal('upload-logo-disclaimer')
  }

  public hideModal() {
    this.hideVModal('upload-logo-disclaimer')
  }

  get customLogos(): Record<any, any>[] {
    return this.$store.getters.getCustomLogos()
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

  public onClickUpload(e: Event){
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
    fd.append('file', img as Blob)
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
        custom_logo.original_logo_url = resp.data.file.original_logo_url;
        custom_logo.is_smart_transparent = false;
        custom_logo.url = resp.data.file.logo_url;
        custom_logo.id = resp.data.file.id;
        let getLogos = []
        if (this.customLogos.length > 1){
          getLogos = this.customLogos.slice(0, -1)
        }else{
          getLogos = this.customLogos
        }
        this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomLogoObject)), action: 'customLogos' })
        this.$store.commit('SET_COLORS_FROM_RECENT',false)
        this.$store.commit('customLogos', custom_logo)
        this.hideModal()
        this.getLogoColors()
        this.$store.commit('SET_RECENT_LOGOS');
        this.showLoader = false;

        if(this.customLogoIndex == 0) {
          //update team logo url in all product logos
          this.$store.dispatch('setTeamLogoUrl',custom_logo)
        }

      })
      .catch((error: any) => {
        console.log(error)
        this.showLoader = false;
        this.showError(error);
      })
  }

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
    let add_extra_colors = 4 - uniqueColors.length;
    if(uniqueColors.length < 4) {
      while(add_extra_colors > 0 ) {
        this.imageColors.push({hex: null, pantone: null, name: null})
        --add_extra_colors;
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

  public updateLogoFromLogoEditor(colors = []) {
    this.colors = colors
    this.getLogoColors()
  }
}

</script>

<style lang="scss" scoped>
.upload-logo-opener {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 15px 25px 15px 0;
  text-align: center;
  color: #808895;
  //border-radius: 20px 20px 0 0;
  background: #fff;
  box-shadow: 0 0 7px rgba(0, 0, 0, 0.1);
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
      display: flex;
      align-items: center;
      justify-content: center;

      img{
        display: inline-flex;
        width: auto;
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

.upload-logo-opener .logo-editor-button{
  background: #219F84 !important;
  color: #fff !important;
  font-size: 14px !important;
  padding: 8px !important;
  display: flex;
  gap: 7px;
  align-items: center;
  justify-content: center;

  @media only screen and (max-width: 767px){
    width: 100%;
  }
}
.logo-edit-btn-updated{
  top: 6rem;
  @media only screen and (max-width: 767px){
    top: 5rem;
  }
}

.loader {
  &.relative {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 1070;
    height: 100%;
    width: 100%;
    background: rgba(255, 255, 255, 0.9);
    padding: 10px;
  }

  &.global {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 99999;
    height: 100%;
    width: 100%;
    background: rgba(255, 255, 255, 1);
  }

  img{
    max-width: 35px !important;

  }
}
</style>
