<template>
  <div class="logo-option-area">
    <div style="padding-bottom: 10px" class="upload-logo-opener">
      <div class="logo-option-area mb-3 mt-3" v-if="customLogo.url">
        <div class="w-100 text-left position-relative logo-edit-btn-updated">
          <div class="d-sm-block d-lg-block continue-btn-holder pt-1" style="padding: 0">
            <b-button v-if="!mobileScreen" @click="showVModal('logo-editor-modal')" class="logo-editor-button" variant="secondary">Logo Editor</b-button>
          </div>
        </div>
      </div>
    </div>
    <b-button v-if="mobileScreen" style="position:absolute; left: 0; top: -38px; width: auto" @click="showVModal('logo-editor-modal')"  class="logo-editor-button" variant="secondary">
      <b-icon-pencil fl /> Edit Logo
    </b-button>
    <modal name="logo-editor-modal" ref="logo-editor-modal" :width="screenWidth" :resizable="true" :scrollable="true" height="auto"
           :reset="true" :shiftY="0" id="modal-center-savecolormodal" hide-footer centered size="xl" class="edit-logo-modal"
           @before-open="logo_editor_obj.image_url = customLogo.original_logo">
      <div class="w-100 modal-header d-block">
        <div>
          <div class="fs-5 text-center text-secondary font-weight-bold">Logo Editor</div>
          <div class="text-center">
            You can alter the appearance of a logo, select a function from the list on the left
          </div>
        </div>
        <span @click="cancelEditing" class="fs-5 modal-close position-absolute text-muted cursor-pointer"
              style="top: 5px; right: 7px">
        <BIconX />
      </span>
      </div>

      <div class="loader" v-if="showLoader"><img :src="'@/assets/images/loading.gif'" /></div>
      <div class="p-5">
        <div class="d-flex flex-column flex-md-row w-100 gap-3">
          <div style="flex-basis: 50%; padding-top: 27px" class="checkboxes_container">
            <div>
              <b-form-checkbox v-model="logo_editor_obj.remove_background" :checked="logo_editor_obj.remove_background"
                               @change="handleRemoveBackground($event)">
                Remove background
              </b-form-checkbox>

              <div class="child-check" v-if="logo_editor_obj.remove_background">
                <b-form-group v-slot="{ ariaDescribedby }">
                  <b-form-radio :aria-describedby="ariaDescribedby" name="logo-background" v-model="logo_editor_obj.remove_background_type"
                                value="transparent" @change="logo_editor_obj.image_url = customLogo.transparent_logo">Remove Logo Background</b-form-radio>
                  <b-form-radio :aria-describedby="ariaDescribedby" name="logo-background" v-model="logo_editor_obj.remove_background_type"
                                value="smart_transparent" @change="logo_editor_obj.image_url = customLogo.smart_transparent_logo">Remove Smart Logo Background</b-form-radio>
                </b-form-group>
              </div>

            </div>
            <div>
              <b-form-checkbox :checked="logo_editor_obj.recolor_logo" v-model="logo_editor_obj.recolor_logo" @change="handleRecolorLogo($event)">
                Recolor Logo
              </b-form-checkbox>

              <div class="child-check text-left" v-if="logo_editor_obj.recolor_logo">
                <div>
                  <b-button style="width:36px !important; height: 36px; display: inline-block" class="color-circle"
                            :id="'colors-' + customLogoIndex" @click="showVModal('logo-color-modal')"
                            :style="{ background: logo_editor_obj.color }">
                  </b-button>
                  <modal name="logo-color-modal" ref="logo-color-modal" :resizable="true" :scrollable="true" height="auto"
                         :reset="true" :shiftY="0" id="modal-center-savecolormodal" hide-footer centered size="xl"
                         class="edit-logo-modal">
                    <div class="w-100 modal-header d-block">
                      <div>
                        <div class="fs-5 text-center text-secondary font-weight-bold">Logo Color</div>
                        <div class="text-center">
                          Select any palette to recolor your logo
                        </div>
                      </div>
                    </div>
                    <ColorTabs modalRef="logo-color-modal" :productColors="product_color_files" onlyColorsTabs="true"
                               @setColorOfLogo="handleLogoColorUpdate" />
                  </modal>
                </div>

              </div>
            </div>
          </div>

          <div style="flex-basis: 50%">
            <div class="text-center fs-3" style="line-height: 1">Preview</div>
            <div class="d-flex align-items-center justify-content-center mt-2 p-3"
                 style="background: #cdcdcd; flex-basis: 50%;height: 206px">
              <img :src="`${storageUrl}${logo_editor_obj.image_url}`" style="max-height: 100%; max-width: 100%" />
            </div>
          </div>
        </div>

        <div class="text-right">
          <div class="d-inline-flex align-items-center justify-content-center mt-3 gap-2">
            <b-button @click="cancelEditing" variant="secondary" class="use-btn light flex-shrink-1"
                      style="white-space: nowrap; max-width: 200px">
              <template>Cancel</template>
            </b-button>
            <b-button @click="useLogo()" class="use-btn flex-shrink-1" style="white-space: nowrap; max-width: 200px">
              <template> Save and use this Logo</template>
            </b-button>
          </div>
        </div>

      </div>

    </modal>
  </div>
</template>

<script lang="ts">

import {Component, Prop, Watch, Vue, Mixins} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";
import LogoEditorModal from "@/components/LogoEditorModal.vue";
import ModalAction from "@/mixins/ModalAction";
import LogoDisclaimerModal from "@/components/Logo/LogoDisclaimerModal.vue";
import ColorTabs from "@/components/ColorTabs.vue";
import {http} from "@/httpCommon";
import {getUploadedLogoObject} from "@/helpers/Helpers";

@Component<LogoEditor>({
  components: {LogoEditorModal, LogoDisclaimerModal, ColorTabs},
  mounted() {
    this.getProductFilesColors()
  }
})
export default class LogoEditor extends Mixins(ErrorMessages, ModalAction) {

  /*
  * props starts here
  * */

  @Prop({ required: true }) customLogoIndex!: number
  @Prop({ required: true }) customLogo!: Record<any, any>

  /*
  * props ends here
  * */

  /*
  * computed props starts here
  * */

  get lockerColors() {
    return this.$store.getters.getLockerColors
  }
  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  /*
  * computed props ends here
  * */

  get showOriginalLogo() {
    return this.logo_editor_obj.remove_background == false && this.logo_editor_obj.recolor_logo == false
  }

  /*
  * data props starts here
  * */
  public storageUrl = process.env.VUE_APP_STORAGE_URL
  public mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  public screenWidth = 1200
  public showLoader = false;
  public logo_editor_obj = {
    remove_background: false,
    remove_background_type: '',
    smart_remove_background: false,
    image_url: '',
    recolor_logo: false,
    color: '#000000'
  }
  public product_color_files: Record<any, any>[] = []



  /*
  * data props ends here
  * */

  /*
  * methods starts here
  * */

  public handleRemoveBackground(updated_val: boolean, type: string) {
    if(updated_val == false) {
      this.logo_editor_obj.remove_background_type = ''
      /*
      * if both remove_background and recolor_logo is unchecked then show original image
      * */
      if(this.showOriginalLogo)
        this.logo_editor_obj.image_url = this.customLogo.original_logo
    }
  }

  public handleRecolorLogo(updated_val: boolean) {
    if(updated_val == false) {
      if(this.showOriginalLogo) {
        this.logo_editor_obj.image_url = this.customLogo.original_logo
      }
    }
  }

  public getProductFilesColors() {
    this.selectedProduct.colors.forEach((color_file: Record<any, any>) => {
      const color_file_data = {name: color_file.file_name.substr(0, color_file.file_name.indexOf('.')), color_text: color_file.json_data, selectedColor: ''}
      this.product_color_files.push(color_file_data)
    })
    this.lockerColors.forEach((locker_color: Record<any, any>) => {
      this.product_color_files.push({name: locker_color.name, color_text: locker_color.color_text, selectedColor: ''})
    })
  }

  public handleLogoColorUpdate(updated_color: string) {
    http.post('edit-logo', { logo_id: this.customLogo.id, type: 'floodfill', image: this.logo_editor_obj.image_url, color: updated_color }).then((successResponse: Record<any, any>) => {
      this.logo_editor_obj.image_url = successResponse.data.logo
      this.logo_editor_obj.color = updated_color
    }).catch((e: any) => {
      this.showError(e.response.data.message)
    });
  }

  public useLogo() {
    this.showLoader = true
    let custom_logo = JSON.parse(JSON.stringify(this.customLogo[this.customLogoIndex]));
    let data = new FormData();
    data.append("logo_id", custom_logo.id);
    data.append("logo", this.$store.getters.getLogoEditor.image);
    data.append("product_id", this.$store.getters.getSelectedProduct.id);
    http.post('/customer/update/logo', data)
      .then(async resp => {
        const colors = resp.data.colors;
        custom_logo.original_logo = resp.data.file.logo_url;
        custom_logo.transparent_logo = resp.data.file.transparent_logo_url;
        custom_logo.smart_transparent_logo = resp.data.file.smart_transparent_logo_url;
        custom_logo.is_smart_transparent = false;
        custom_logo.url = resp.data.file.logo_url;
        custom_logo.id = resp.data.file.id;
        let customObj = await getUploadedLogoObject(resp.data.file)
        this.$store.commit('UPDATE_UNDO', { data: JSON.parse(JSON.stringify(this.$store.getters.getCustomLogoObject)), action: 'customLogos' })
        this.$store.commit('SET_COLORS_FROM_RECENT', false)
        custom_logo.adding_tab = false
        let payload = {
          customObj : customObj,
          custom_logo: custom_logo
        }
        this.$store.commit('customLogos', payload)
        this.$emit('updateLogoFromLogoEditor', colors)
        this.$store.commit('SET_RECENT_LOGOS');


        if (this.customLogoIndex == 0) {
          //update team logo url in all product logos
          this.$store.dispatch('setTeamLogoUrl', payload)
        }
        this.showToast('Logo Applied', 'SUCCESS')
        this.showLoader = false
        this.hideVModal('logo-modal')
      }).catch((e) => {
      this.showLoader = false
      this.showError('Something went wrong')
      console.log('exception', e)
    })
  }


  public cancelEditing() {
    this.$store.dispatch('unsetLogoEditor')
    this.hideVModal('logo-editor-modal')
  }

  /*
  * methods ends here
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
.customization-tabs .logo-placement-tabs .logo-placement-holder .logo-holder .edit-logo-modal .loader img{
  max-width: 110px;
}
.lockerroom-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  .locker-opener {
    max-width: 90%;
    padding: 15px;
    font-size: 18px;
    position: relative;
    overflow-x: auto;
    white-space: nowrap;

    @media only screen and (min-width: 992px) {
      padding: 14px 0;
      max-width: 80%;
      overflow: hidden;
      white-space: inherit;
    }

    .btn {
      padding: 5px 10px;
      margin: 0 5px 10px;
      position: relative;
      background: none;
      border-color: rgba(3, 20, 46, 0.13);
      color: #03142E;
      font-size: 0.8rem;

      @media only screen and (min-width: 992px) {
        padding: 10px 30px;
        margin: 0 10px 10px;
        font-size: 1rem;
      }

      &.active,
      &:hover {
        background: #219f84;
        color: #fff;
        border-color: #219f84;
      }

      .remove {
        position: absolute;
        right: -10px;
        top: -14px;
        width: 20px;
        height: 20px;
        font-size: 9px;
        color: #D53943;
        background: #F8E1E2;
        border-radius: 50%;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;

        @media only screen and (min-width: 992px) {
          width: 30px;
          height: 30px;
          font-size: 12px;
        }
      }
    }

    .arrow {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
      color: #219f84;
      font-size: 15px;
      display: none;

      @media only screen and (min-width: 992px) {
        display: inline-block;
      }

      &.arrow-right {
        left: auto;
        right: 0;
      }
    }
  }

  .create-lockerroom {
    .btn {
      padding: 0;
      font-size: 24px;
      line-height: 1;
      font-weight: 700px;
      color: #fff;
      background: #219f84;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      border: none;

      @media only screen and (min-width: 992px) {
        padding: 10px 30px;
        color: #219f84;
        background: #E7F4F1;
        border: 1px solid #E7F4F1;
        border-radius: 0.25rem;
        width: auto;
        height: auto;
        font-size: 14px;
        font-weight: 400;
      }

      span {
        @media only screen and (max-width: 991px) {
          display: none;
        }
      }
    }
  }

}

.save-btn-holder {
  padding: 15px 40px;
  text-align: center;
}

.design-name-form {
  label {
    font-size: 16px;
  }

  .input-group {
    flex: 0 0 55%;
    max-width: 55%;

    @media only screen and (min-width: 992px) {
      flex: 0 0 78%;
      max-width: 78%;
    }
  }

  .btn {
    flex: 0 0 40%;
    max-width: 40%;
    background: #219f84;
    border-color: #219f84;

    @media only screen and (min-width: 992px) {
      flex: 0 0 20%;
      max-width: 20%;
    }
  }
}

.folder-wrapper {
  h3 {
    font-weight: 600;

    @media only screen and (min-width: 992px) {
      font-size: 20px;
    }
  }

  a {
    margin: 0 10px 12px;
    font-size: 10px;
    flex: 0 0 18%;
    max-width: 18%;

    @media only screen and (min-width: 768px) {
      font-size: 14px;
      flex: 0 0 9%;
      max-width: 9%;
    }

    svg {
      font-size: 32px;
      display: block;
      margin: 0 auto 10px;
      fill: #219f84;
      color: #219f84;

      @media only screen and (min-width: 768px) {
        font-size: 46px;
      }
    }
  }
}

.checkboxes_container {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &>div {
    padding: 7px 10px;
    border-radius: 4px;

    &:hover {
      background: #f5f5f5;
    }
  }

  .child-check {
    padding: 7px 7px 7px 25px;
  }
}
</style>
