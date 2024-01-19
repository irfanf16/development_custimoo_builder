<template>
  <div style="padding-bottom: 10px" class="upload-logo-opener">
    <logo-editor :custom-logo-index="customLogoIndex" :custom-logo="customLogo" />
    <div class="btn btn-secondary modal-handler" >
      <div class="upload-box position-relative" :class="{'pulse-animation': !customLogo.url}" :style="{overflow: customLogo.url ? 'visible' : 'hidden'}">
        <div class="loader relative" v-if="showLoader"><img src="@assets/images/loading.gif" /></div>
        <div class="uploaded-logo-holder" v-if="customLogo.url && !replaceLogo">
          <img :src="`${storageUrl}${customLogo.url}?nocache=1`" width="100%"/>
        </div>
        <div v-else>
          <div class="icon-holder">
            <font-awesome-icon :icon="['fas', 'image']"/>
          </div>
          <slot name="upload_text">Upload Logo</slot>
        </div>
        <div class="remove-img" v-if="customLogo.url && !replaceLogo">
          <a @click="removeLogo(customLogoIndex)">
            <font-awesome-icon :icon="['fas', 'trash-alt']"/>
          </a>
        </div>
        <input  :style="{display: customLogo.url && !replaceLogo ? 'none':  'block'}"
                type="file"
                name="logos" ref="logoUploadInput"
                @change="handleInputChange($event, replaceLogo, customLogo, customLogoIndex)"
                @click="handleInputOnClick($event, replaceLogo, customLogo, customLogoIndex)"
                @drop="handleInputOnDrag($event, replaceLogo, customLogo, customLogoIndex)"
                class="fileLoader"
                :accept="replaceLogo ? 'application/postscript,application/pdf,application/eps,image/eps,image/tiff' : 'image/*,application/postscript,application/pdf'"
        >
      </div>
    </div>
    <LogoDisclaimerModal @disclaimer-accepted="handleDisclaimerAction" @hide-disclaimer-modal="handleDisclaimerModalHideEvent"/>

  </div>
</template>

<script lang="ts">

import {Component, Prop, Mixins} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";
import {LogoUploaderMixin} from "@/mixins/LogoUploaderMixin";
import LogoEditor from "@/components/Logo/LogoEditor.vue";
import ModalAction from "@/mixins/ModalAction";
import LogoDisclaimerModal from "@/components/Logo/LogoDisclaimerModal.vue";
import CustomLogosMixin from "@/mixins/CustomLogosMixin";
import Vue from "vue";


@Component<LogoUploader>({
  components: { LogoDisclaimerModal, LogoEditor },
  mounted() {
    const logo_disclaimer_info = localStorage.getItem(Vue.prototype.$logoDisclaimerInfo_localstorage_key)
    if(logo_disclaimer_info) {
      this.logoDisclaimerInfo = JSON.parse(logo_disclaimer_info)
    }
 }
})
export default class LogoUploader extends Mixins(ErrorMessages, ModalAction, CustomLogosMixin, LogoUploaderMixin) {

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
