<template>
  <div>
    <div class="position-relative" v-if="collection_logo">
      <div class="loader relative" v-if="show_loader">
        <img src="@assets/images/loading.gif" style="max-width: 50%" />
      </div>
      <div v-if="collection_logo.path" class="position-relative">
        <a class="btn remove position-absolute" style="right: -5px; top: 5px; padding: 0; height: 24px; width: 24px" @click="removeLogo" v-if="!show_loader">
          <b-icon-x></b-icon-x>
        </a>
        <img v-if="recent_logo_preview !==''" :src="`${recent_logo_preview}`" :alt="collection_logo.name" class="border"
             style="max-height: 130px; border-color: #ccc; background-color: #ddd; margin-top: 20px; object-fit: contain; padding: 10px; width: 100%; border-radius: 7px"/>
        <img v-else :src="`${collection_logo.path}`" :alt="collection_logo.name" class="border"
             style="max-height: 130px; border-color: #ccc; background-color: #ddd; margin-top: 20px; object-fit: contain; padding: 10px; width: 100%; border-radius: 7px"/>
      </div>
      <div style="padding-bottom: 10px" class="upload-logo-opener" v-else>
        <div class="btn btn-secondary modal-handler">
          <div class="upload-box position-relative" :class="{'pulse-animation': true}"
               :style="{overflow: false ? 'visible' : 'hidden'}">
            <div class="uploaded-logo-holder" v-if="collection_logo.path">
              <img :src="`${storage_url}${collection_logo.path}`"/>
            </div>
            <div v-else>
              <div class="icon-holder">
                <font-awesome-icon :icon="['fas', 'image']"/>
              </div>
              <slot name="upload_text">Upload Logo</slot>
            </div>
            <template>
              <input @change="handleFileChange($event)" ref="logoUploader"
                     type="file"
                     name="logos"
                     class="fileLoader">
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="text-right cursor-pointer" v-if="currentUploader == logoIndex" @click="$emit('setCurrentUploader', -1)">Recent Logos <b-icon-dash /></div>
    <div class="text-right cursor-pointer" v-else @click="$emit('setCurrentUploader', logoIndex)">Recent Logos <b-icon-plus /></div>
    <div v-if="recentLogos.length && currentUploader == logoIndex" class="grid grid-3 mt-2" style="max-width: 100%; gap: 10px">
      <div :key="recentLogoIndex" class="h-100 w-100 d-flex align-items-center justify-content-center"
           v-for="(recent_logo, recentLogoIndex) in recentLogos"
           style="border: 1px solid #ccc; background-color: #ddd; padding: 5px"
      >
        <img @click="handleLogoChange(recent_logo)" style="height: auto; width: auto; max-width: 100%; cursor: pointer; max-height: 100%"
             :src="storageUrl+recent_logo.logo_url+'?nocache=1'" alt="not working"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {Component, Prop, Mixins} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";
import LogoEditor from "@/components/Logo/LogoEditor.vue";
import ModalAction from "@/mixins/ModalAction";
import LogoDisclaimerModal from "@/components/Logo/LogoDisclaimerModal.vue";
import {http} from "@/httpCommon";
import {getCollectionLogoDefaultObj} from "@/helpers/Helpers";

@Component<CollectionLogoUploader>({
  components: {LogoDisclaimerModal, LogoEditor},
})
export default class CollectionLogoUploader extends Mixins(ErrorMessages, ModalAction) {
  @Prop({required: true}) collection_logo!: Record<any, any>
  @Prop({required: true}) collection_id!: number
  @Prop({required: false}) logoIndex!: number
  @Prop({required: true}) currentUploader!: number

  private storage_url = process.env.VUE_APP_STORAGE_URL
  public show_loader = false
  public recent_logo_preview = ''
  private storageUrl = process.env.VUE_APP_STORAGE_URL

  public handleFileChange(event: Event) {
    const file_input = event.target as HTMLInputElement;
    if (file_input.files && file_input.files.length > 0) {
      this.collection_logo.file = file_input.files[0]
    } else {
      this.collection_logo.file = null
    }
    if(this.collection_logo.file) {
      const valid_logo: boolean = this.validateLogo()
      if(!valid_logo) {
        this.collection_logo.file = null
        file_input.value = ''
        return false
      }
      this.collection_logo.path = URL.createObjectURL(this.collection_logo.file)
      this.collection_logo.collection_id = this.collection_id
    }

   // this.addRemoveLogo()
  }

  public async handleLogoChange(recent_logo){
    await this.removeLogo()
    this.collection_logo.path = recent_logo.logo_url
    this.collection_logo.extension = recent_logo.logo_url.split('.').pop()
    this.collection_logo.name = recent_logo.logo_name
    this.collection_logo.size = 0
    this.collection_logo.is_recent_logo = true
    this.collection_logo.collection_id = this.collection_id
    this.recent_logo_preview = this.storage_url + recent_logo.logo_url
  }

  public validateLogo(): boolean {
    const file_extension = this.collection_logo.file.name.split('.').pop()?.toLowerCase() as string;
    const valid_extension = ['jpg','gif','png','jpeg', 'svg'].includes(file_extension)
    if(!valid_extension) {
      this.showError(`Can not upload load with extension ${file_extension}. Allowed extensions are (jpg, gif, png, jpeg, svg)`)
    }
    return valid_extension
  }


  get recentLogos() {
    return this.$store.getters.getRecentLogos
  }

  public removeLogo() {
    this.$emit('logo-deleted', this.collection_logo.sort_order)
  }
}

</script>

<style lang="scss" scoped>
.upload-logo-opener {
  position: static;
  padding: 0 !important;
  text-align: center;
  color: #808895;
  //border-radius: 20px 20px 0 0;
  background: #fff;
  box-shadow: 0 0 7px rgba(0, 0, 0, 0.1);
  width: 100%;
  z-index: 9;
  @media only screen and (min-width: 992px) {
    border-radius: 0;
    background: none;
    box-shadow: none;
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
    padding: 0 !important;
    font-size: 10px;
    max-width: 100%;
    @media only screen and (min-width: 768px) {
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
    //width: 68px;
    //height: 68px;
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
    width: 100%;
    @media only screen and (min-width: 992px) {
      //width: 64px;
      //height: 64px;
    }
    @media only screen and (min-width: 1200px) {
      //width: 74px;
      //height: 74px;
      font-size: 10px;
    }
    @media only screen and (min-width: 1366px) {
      //width: 84px;
      //height: 84px;
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

    .uploaded-logo-holder {
      height: 100%;
      max-width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
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
  max-width: 100%;
  width: 160px;
  height: 100px;
  border: 1px dashed #dee2e6;
  border-radius: 5px;
  padding: 10px 5px;
  font-size: 9px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  @media only screen and (min-width: 1200px) {
    //width: 74px;
    //height: 74px;
    font-size: 10px;
  }
  @media only screen and (min-width: 1366px) {
    //width: 84px;
    //height: 84px;
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

.logo-option-area {
  max-width: 285px;
  margin: 0 auto;
  text-align: left;
}

.upload-logo-opener .logo-editor-button {
  background: #219F84 !important;
  color: #fff !important;
  font-size: 14px !important;
  padding: 8px 15px !important;
  display: flex;
  gap: 7px;
  align-items: center;
  justify-content: center;

  @media only screen and (max-width: 767px) {
    width: 100%;
  }
}

.logo-edit-btn-updated {
  top: 6rem;
  @media only screen and (max-width: 767px) {
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
