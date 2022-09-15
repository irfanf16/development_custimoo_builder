<template>
  <div style="padding-bottom: 10px" class="upload-logo-opener" v-if="customLogos">
    <div class="btn btn-secondary modal-handler" >
      <div class="upload-box position-relative" :class="{'pulse-animation': true}">
        <div class="loader relative" v-if="showLoader"><img src="../../../src/assets/images/loading.gif" /></div>
        <div class="uploaded-logo-holder" v-if="'name' != 'name'">
          <img :src="storageUrl+customLogos[customLogoIndex].url+'?nocache=1'" width="100%"/>
        </div>
        <div v-else>
          <div class="icon-holder">
            <font-awesome-icon :icon="['fas', 'image']"/>
          </div>
          <slot name="upload_text">Upload Logo</slot>
        </div>
        <div class="remove-img">
          <a>
            <font-awesome-icon :icon="['fas', 'trash-alt']"/>
          </a>
        </div>
        <input  :style="{display: 'block'}"
                type="file"
                name="logos" ref="logoUploadInput"
                @change="uploadLogo"
                @click="onClickUpload"
                @drop="onDragUpload"
                class="fileLoader"
                accept="image/*,application/postscript,application/pdf">
      </div>
    </div>
    <b-button v-if="mobileScreen" style="position:absolute; left: 0; top: -38px; width: auto" @click="openLogoEditor"  class="logo-editor-button" variant="secondary">
      <b-icon-pencil fl /> Edit Logo
    </b-button>
    <LogoDisclaimerModal @disclaimer-accepted="handleDisclaimerAction"/>

  </div>
</template>

<script lang="ts">

import {Component, Prop, Watch, Vue, Mixins} from 'vue-property-decorator'
import {http} from "@/httpCommon"
import {getClosestColor} from '@/pantoneColor'
import rgbHex from 'rgb-hex'
import ErrorMessages from "@/mixins/ErrorMessages";
import $ from "jquery";
import {
  getSelectedProductPantones,
  getUploadedLogoObject, processColorsCustom,
  setLogoSettings
} from '@/helpers/Helpers'
import LogoEditorModal from "@/components/LogoEditorModal.vue";
import ModalAction from "@/mixins/ModalAction";
import LogoDisclaimerModal from "@/components/Logo/LogoDisclaimerModal.vue";

@Component<LogoUploader>({
  components: {LogoEditorModal, LogoDisclaimerModal},
  mounted() {
    const logo_disclaimer_info = localStorage.getItem("logoDisclaimerInfo")
    if(logo_disclaimer_info) {
      this.logoDisclaimerInfo = JSON.parse(logo_disclaimer_info)
    }
 }
})
export default class LogoUploader extends Mixins(ErrorMessages, ModalAction) {
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
  public logoDisclaimerInfo = {
    accepted: false, show_again: true, user_id: null
  }
  public handlingDisclaimerAction = false
  public logo_allowed_extensions = ['jpg','gif','png','jpeg','pdf','eps','ai']

  @Prop({ required: true }) customLogoIndex!: number

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
    this.$store.dispatch('editLogo',{key: 'id', value:this.customLogos[this.customLogoIndex].id, api_call:false})
    this.$store.dispatch('editLogo',{key: 'image', value: this.customLogos[this.customLogoIndex].url, api_call:false})
    this.$store.dispatch('editLogo',{key: 'originalImage', value:this.customLogos[this.customLogoIndex].original_logo, api_call:false})
    this.$store.dispatch('toggleLogoCheck', {type: 'color', val:false})
    this.$store.dispatch('toggleLogoCheck', {type: 'background', val:false})
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

  showLogoDisclaimer() {
    let show_disclaimer = this.logoDisclaimerInfo.accepted ? false : true;
    if(this.logoDisclaimerInfo.accepted == true) {
      show_disclaimer = this.logoDisclaimerInfo.show_again
    }
    if(show_disclaimer) {
      this.$modal.show('logo-disclaimer-modal')
    }
    return show_disclaimer
  }

  public onClickUpload(e: Event){
    this.uploadType = 'click';
    /*
    * if manually triggered click event then do nothing. like in case of method handleDisclaimerAction() we are manually triggering click  event.
    * In that case do nothing
    * */
    if(this.handlingDisclaimerAction) {
      return false;
    } else {
      let show_disclaimer = this.showLogoDisclaimer()
      if(show_disclaimer) {
        e.preventDefault()
      }
    }
  }

  public handleDisclaimerAction(show_disclaimer_again: boolean) {
    this.handlingDisclaimerAction = true
    this.logoDisclaimerInfo.accepted = true
    this.logoDisclaimerInfo.show_again = show_disclaimer_again
    localStorage.setItem('logoDisclaimerInfo', JSON.stringify(this.logoDisclaimerInfo));
    this.$modal.hide('logo-disclaimer-modal')
    this.manuallyShowFileUploader = false
    this.$refs.logoUploadInput.click()
    this.handlingDisclaimerAction = false
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

  public validateLogoFile(logo_file: File) {
    const extension = logo_file.name.toLowerCase().split('.').pop() as string;
    let is_allowed = this.logo_allowed_extensions.includes(extension)
    if(!is_allowed) {
      this.showToast(`The file must be a file of type: ${this.logo_allowed_extensions.join(', ')}.`,'Error');
    }
    return is_allowed;
  }

  public uploadLogo(e: Event) {
    const target = e.target as HTMLInputElement
    let logo_file = target.files && target.files.length ? target.files[0] : null
    if(logo_file) {
      if(this.validateLogoFile(logo_file)) {
        console.log('validate')
      } else {
        target.value = '';
        console.log('files', target.files)
      }
    }
  }





  public  processLogoImage() {
    let custom_logo = JSON.parse(JSON.stringify(this.customLogos[this.customLogoIndex]));
    custom_logo.logoIndex = this.customLogoIndex;
    let img = this.fileObject
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
    fd.append('file', img as Blob)
    fd.append('product_id', this.selectedProduct.product_id)
    this.showLoader = true;
      http.post('/customer/upload/logo', fd, header)
      .then(async resp => {
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
        custom_logo.upload = true
        let logo_colors = processColorsCustom(this.colors)
        custom_logo.logo_colors = logo_colors
        let customObj = await getUploadedLogoObject(resp.data.file)
        this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomLogoObject)), action: 'customLogos' })
        this.$store.commit('SET_COLORS_FROM_RECENT',false)
        custom_logo.adding_tab = false
        let payload = {
          customObj : customObj,
          custom_logo: custom_logo
        }
        this.$store.commit('customLogos', payload)
        this.hideModal()
        await this.getLogoColors()
        this.$store.commit('SET_RECENT_LOGOS');
        this.showLoader = false;

        if(this.customLogoIndex == 0) {
          //update team logo url in all product logos
          this.$store.dispatch('setTeamLogoUrl', payload)
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
    const selectProductPantonesList = getSelectedProductPantones()
    uniqueColors.forEach((color: string) => {

      let pantoneColor = getClosestColor(color, selectProductPantonesList)
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
    logo.removeLogo = true
    let payload = {
      custom_logo : logo
    }
    this.$store.commit('customLogos', payload)
    this.$store.commit('SET_LOGO_COLORS', []);
    this.$store.commit('SET_INITIAL_LOGO_COLORS', []);
  }

  public toggleLogoBackground(type:string,val:boolean) {
    let payload = {index:this.customLogoIndex,type,val}
    if(this.customLogos[this.customLogoIndex]){
      this.$store.dispatch('toggleLogoBackgroud', payload)
    }
  }

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
  padding: 15px;
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
    background: rgb(205, 205, 205);
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
  padding: 8px 15px !important;
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
    padding: 20px;
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
}
</style>
