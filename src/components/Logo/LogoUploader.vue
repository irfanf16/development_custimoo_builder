<template>
  <div style="padding-bottom: 10px" class="upload-logo-opener">
    <logo-editor :custom-logo-index="customLogoIndex" :custom-logo="customLogo" />
    <div class="btn btn-secondary modal-handler" >
      <div class="upload-box position-relative" :class="{'pulse-animation': !customLogo.url}" :style="{overflow: customLogo.url ? 'visible' : 'hidden'}">
        <div class="loader relative" v-if="showLoader"><img src="../../../src/assets/images/loading.gif" /></div>
        <div class="uploaded-logo-holder" v-if="customLogo.url">
          <img :src="`${storageUrl}${customLogo.url}?nocache=1`" width="100%"/>
        </div>
        <div v-else>
          <div class="icon-holder">
            <font-awesome-icon :icon="['fas', 'image']"/>
          </div>
          <slot name="upload_text">Upload Logo</slot>
        </div>
        <div class="remove-img" v-if="customLogo.url">
          <a @click="removeLogo">
            <font-awesome-icon :icon="['fas', 'trash-alt']"/>
          </a>
        </div>
        <input  :style="{display: customLogo.url ? 'none':  'block'}"
                type="file"
                name="logos" ref="logoUploadInput"
                @change="handleInputChange"
                @click="handleInputOnClick"
                @drop="handleInputOnDrag($event)"
                class="fileLoader"
                accept="image/*,application/postscript,application/pdf">
      </div>
    </div>
    <LogoDisclaimerModal @disclaimer-accepted="handleDisclaimerAction" @hide-disclaimer-modal="handleDisclaimerModalHideEvent"/>

  </div>
</template>

<script lang="ts">

import {Component, Prop, Watch, Vue, Mixins} from 'vue-property-decorator'
import {http} from "@/httpCommon"
import ErrorMessages from "@/mixins/ErrorMessages";
import {getLogoSettingsObject, processColorsCustom, recentLogoDefaultObject} from '@/helpers/Helpers'
import LogoEditor from "@/components/Logo/LogoEditor.vue";
import ModalAction from "@/mixins/ModalAction";
import LogoDisclaimerModal from "@/components/Logo/LogoDisclaimerModal.vue";
import CustomLogosMixin from "@/mixins/CustomLogosMixin";

@Component<LogoUploader>({
  components: { LogoDisclaimerModal, LogoEditor },
  mounted() {
    const logo_disclaimer_info = localStorage.getItem("logoDisclaimerInfo")
    if(logo_disclaimer_info) {
      this.logoDisclaimerInfo = JSON.parse(logo_disclaimer_info)
    }
 }
})
export default class LogoUploader extends Mixins(ErrorMessages, ModalAction, CustomLogosMixin) {

  /*
  * props starts here
  * */

  @Prop({ required: true }) customLogoIndex!: number
  @Prop({ required: true }) customLogo!: Record<any, any>

  /*
  * props ends here
  * */

  /*
  * data props starts here
  * */

  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public showLoader = false;
  public mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  public logoDisclaimerInfo = { accepted: false, show_again: true, user_id: null }
  public handlingDisclaimerAction = false
  public logo_allowed_extensions = ['jpg','gif','png','jpeg','pdf','eps','ai']
  public logo_file: File | null = null

  /*
  * data props ends here
  * */

  /*
  * computed props starts
  * */

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get recentLogos() {
    return this.$store.getters.getRecentLogos
  }

  /*
  * computed props ends
  * */

  /*
  * methods starts
  * */

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

  public handleInputOnClick(e: Event){
    /*
    * if manually triggered click event then do nothing. like in case of method handleDisclaimerAction() we are manually triggering click  event.
    * In that case do nothing
    * */
    if(this.handlingDisclaimerAction) {
      return false
    } else {
      if(this.showLogoDisclaimer()) {
        e.preventDefault()
        return false
      }
    }
  }

  public handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement
    let logo_file = target.files && target.files.length ? target.files[0] : null
    if(logo_file) {
      if(this.validateLogoFile(logo_file)) {
        this.uploadLogo(logo_file)
      } else {
        target.value = '';
        console.log('files', target.files)
      }
    }
  }

  public handleInputOnDrag(e: any) {
    // this.logo_file have file then it means user have accepted logo disclaimer so now simply upload file to server
    if(this.logo_file) {
      this.uploadLogo(this.logo_file)
      return false
    } else {
      const target = e.target as HTMLInputElement
      let logo_file = e.dataTransfer.files[0]
      if(this.validateLogoFile(logo_file)) {
        if(this.showLogoDisclaimer()) {
          e.preventDefault()
          // if logo disclaimer is shown then save uploaded file to public property (logo_file). When user accept the disclaimer then upload file to server
          this.logo_file = e.dataTransfer.files[0]
        } else {
          this.uploadLogo(logo_file)
        }
      } else {
        target.value = '';
      }
    }
  }

  public handleDisclaimerModalHideEvent() {
    this.$modal.hide('logo-disclaimer-modal')
    this.logo_file = null
  }

  public handleDisclaimerAction(show_disclaimer_again: boolean) {
    this.handlingDisclaimerAction = true
    this.logoDisclaimerInfo.accepted = true
    this.logoDisclaimerInfo.show_again = show_disclaimer_again
    localStorage.setItem('logoDisclaimerInfo', JSON.stringify(this.logoDisclaimerInfo));
    this.$modal.hide('logo-disclaimer-modal')
    if(this.logo_file) {
      this.uploadLogo(this.logo_file)
    } else {
      let input_element = this.$refs.logoUploadInput as HTMLInputElement
      input_element.click()
    }
    this.handlingDisclaimerAction = false
  }

  public validateLogoFile(logo_file: File) {
    const extension = logo_file.name.toLowerCase().split('.').pop() as string;
    let is_allowed = this.logo_allowed_extensions.includes(extension)
    if(!is_allowed) {
      this.showToast(`The file must be a file of type: ${this.logo_allowed_extensions.join(', ')}.`,'Error');
    }
    return is_allowed;
  }

  public uploadLogo(logo_file: File) {
    let self: Record<any, any> = this;
    let form_data = new FormData()
    form_data.append('file', logo_file)
    form_data.append('product_id', this.selectedProduct.product_id)
    this.showLoader = true;
    http.post('/customer/upload/logo', form_data).then(async resp => {
      //empty logo_file when file is uploaded
      this.logo_file = null
      let response_data = resp.data
      if(response_data.success) {
        let logo_data = response_data.result.customer_logo
        if(this.customLogoIndex == 0) {
          logo_data.is_team_logo = true
          let logo_colors = processColorsCustom(logo_data.logo_colors)
          this.$store.commit('SET_LOGO_COLORS_INFO', {
            data: { colors: logo_colors, extracted_colors: JSON.parse(JSON.stringify(logo_colors)) }
          })
          this.addRemoveTeamLogoOnAllProducts('add', logo_data)
        } else {
          this.customLogo.is_team_logo = false
          this.customLogo.transparent_logo = logo_data.transparent_logo_url;
          this.customLogo.smart_transparent_logo = logo_data.smart_transparent_logo_url;
          this.customLogo.original_logo_url = logo_data.original_logo_url;
          this.customLogo.is_smart_transparent = false;
          this.customLogo.url = logo_data.logo_url;
          this.customLogo.id = logo_data.id;
        }
        this.$store.commit('SET_RECENT_LOGOS', {data: recentLogoDefaultObject(logo_data)})
        self.$eventBus.$emit('handleCustomLogoUpdatedEvent', this.customLogo)
      } else {
        this.showError(response_data.message);
        return false
      }
      const inputRef = this.$refs.logoUploadInput as Record<any, any>
      inputRef.value = null;
      this.showLoader = false;
    })
      .catch((error: any) => {
        const inputRef = this.$refs.logoUploadInput as Record<any, any>
        inputRef.value = null;
        this.showLoader = false;
        this.showError(error);
      })
  }

  public removeLogo() {
    const self: Record<any, any> = this;
    self.$eventBus.$emit("customTextRemoved", this.customLogoIndex)
    if(this.customLogoIndex == 0) {
      this.addRemoveTeamLogoOnAllProducts('remove')
    }
    //check if logo setting at given index exists then get that else get logo default object
    let logo_setting_at_index = this.selectedProduct.logos_setting[this.customLogoIndex] ? this.selectedProduct.logos_setting[this.customLogoIndex] : {}
    logo_setting_at_index = {...logo_setting_at_index, ...getLogoSettingsObject(), ...{logo_index: this.customLogoIndex}}
    /*
    * As we can not directly assign customLogo value because it is prop coming from parent component.
    * So here we loop through it's properties to update values
    * */
    for (const [logo_object_key, logo_object_value] of Object.entries(logo_setting_at_index)) {
      this.customLogo[logo_object_key] = logo_object_value
    }
  }

  /*
  * methods ends
  * */
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
