<template>
  <modal name="logo-modal" ref="logo-modal" :width="screenWidth" :resizable="true" :scrollable="true" height="auto"
    :reset="true" :shiftY="0" id="modal-center-savecolormodal" hide-footer centered size="xl" class="edit-logo-modal">
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

    <div class="loader" v-if="showLoader"><img src="../../src/assets/images/loading.gif" /></div>
    <div class="p-5">
      <div class="d-flex flex-column flex-md-row w-100 gap-3">
        <div style="flex-basis: 50%; padding-top: 27px" class="checkboxes_container">
          <div>
            <b-form-checkbox :checked="this.$store.getters.getBackgroundCheck"
              @change="toggleLogoCheck('background', $event)">
              Remove background
            </b-form-checkbox>

            <div class="child-check" v-if="this.$store.getters.getBackgroundCheck">
              <b-form-group v-slot="{ ariaDescribedby }">
                <b-form-radio v-model="removeBackgroundRadio" :aria-describedby="ariaDescribedby" name="logo-background"
                  value="transparent" @change="toggleRadio">Remove Logo Background</b-form-radio>
                <b-form-radio v-model="removeBackgroundRadio" :aria-describedby="ariaDescribedby" name="logo-background"
                  value="smart_transparent" @change="toggleRadio">Remove Smart Logo Background</b-form-radio>
              </b-form-group>
            </div>

          </div>
          <div>
            <b-form-checkbox :checked="this.$store.getters.getColorCheck" @change="toggleLogoCheck('color', $event)">
              Recolor Logo
            </b-form-checkbox>

            <div style="width: 50%" class="child-check" v-if="this.$store.getters.getColorCheck">
              <div>
                <!-- <b-button style="width:36px !important; height: 36px;" class="color-circle"
                  :id="'colors-' + customLogoIndex" @click="toggleColorTabs()" :style="{ background: selectedColor }">
                </b-button>
                <b-popover :show.sync="colorTabClick" :target="'colors-' + customLogoIndex" custom-class="share-tooltip"
                  triggers="click">
                  <span @click="closeColorTabs" class="modal-close">
                    <BIconX />
                  </span>
                  <ColorTabs :productColors="productColors" onlyColorsTabs="true" @setColorOfLogo="setColorOfLogo" />
                </b-popover> -->
                <b-button style="width:36px !important; height: 36px;" class="color-circle"
                  :id="'colors-' + customLogoIndex" @click="toggleLogoColorModal()"
                  :style="{ background: selectedColor }">
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
                  <ColorTabs modalRef="logo-color-modal" :productColors="productColors" onlyColorsTabs="true"
                    @setColorOfLogo="setColorOfLogo" />
                </modal>
              </div>

            </div>
          </div>
        </div>

        <div style="flex-basis: 50%">
          <div class="text-center fs-3" style="line-height: 1">Preview</div>
          <div class="d-flex align-items-center justify-content-center mt-2 p-3"
            style="background: #cdcdcd; flex-basis: 50%;height: 206px">
            <img :src="storageUrl + logoEditorObj.image" style="max-height: 100%; max-width: 100%" />
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

</template>

<script lang="ts">

import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator'
import CreateLockerRoomModal from '@/components/LogoEditorModal.vue'

import ColorTabs from "@/components/ColorTabs.vue";
import { http } from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";
import ModalAction from "@/mixins/ModalAction";
import { getUploadedLogoObject } from '@/helpers/Helpers'
@Component<LogoEditorModal>({
  components: {
    ColorTabs,
    CreateLockerRoomModal
  },
  mounted() {
    this.getColors()
  }
})
export default class LogoEditorModal extends Mixins(ErrorMessages, ModalAction) {
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public timeout = 0;
  public locker_selected = true;
  public colorTabClick = false;
  public room_id = 0;
  public folder_name = '';
  public ref = this.$refs as Record<any, any>
  public imageColors: any[] = []
  public colors: any = [];
  public productColors: any[] = []
  public showLoader = false;
  private screenWidth = 1200
  public selectedColor = '#000000'
  @Prop({ required: true }) logo_id!: number
  @Prop({ required: true }) customLogoIndex!: number


  public showButton(id: number) {
    this.locker_selected = false;
    this.room_id = id;

  }

  public toggleLogoCheck(type: string, val: boolean) {
    let payload = { type, val }
    this.$store.dispatch('toggleLogoCheck', payload)
  }

  public async setColorOfLogo(color: string) {
    this.selectedColor = color
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(async () => {
      //search function
      let res = await this.getLogoFromServer(this.logo_id, 'floodfill', this.$store.getters.getLogoEditor.image, color)
      await this.$store.dispatch('editLogo', { key: 'image', value: res.data.logo })
    }, 300);

  }
  public cancelEditing() {
    this.$store.dispatch('unsetLogoEditor')
    this.hideVModal('logo-modal')
  }
  public useLogo() {
    this.showLoader = true
    let custom_logo = JSON.parse(JSON.stringify(this.customLogos[this.customLogoIndex]));
    let data = new FormData();
    data.append("logo", this.$store.getters.getLogoEditor.image);
    data.append("product_id", this.$store.getters.getSelectedProduct.id);
    http.post('/customer/update/logo', data)
      .then(async resp => {
        this.colors = resp.data.colors;
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
        this.$emit('updateLogoFromLogoEditor', this.colors)
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


  public showLogoModal() {
    this.ref['logo-modal'].show();
  }

  public hideLogoModal() {
    this.ref['logo-modal'].hide();
  }

  get getShowColorsLogoEditor() {
    return this.$store.getters.getShowColorsLogoEditor
  }
  get lockerColors() {
    return this.$store.getters.getLockerColors
  }
  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }
  get removeBackgroundRadio() {
    return this.$store.getters.getRemoveBackgroundRadio
  }
  set removeBackgroundRadio(val: any) {
    //console.log('setter called',val)
  }

  get logoEditorObj() {
    return this.$store.getters.getLogoEditor
  }
  get customLogos(): Record<any, any>[] {
    return this.$store.getters.getCustomLogos()
  }


  public async toggleRadio(type: string) {
    let res = await this.getLogoFromServer(this.logo_id, type, this.$store.getters.getLogoEditor.originalImage)
    await this.$store.dispatch('editLogo', { key: 'image', value: res.data.logo })

  }

  public getLogoFromServer(logo_id: number, type: string, image = '', color = '') {
    return http.post('edit-logo', { logo_id, type, image, color })
  }

  public getColors() {
    this.productColors = []
    this.selectedProduct.colors.forEach((colors: any, key: number) => {
      let finalColor = { color_text: [], selectedColor: "", name: colors.file_name.substr(0, colors.file_name.indexOf('.')) }
      finalColor.color_text = JSON.parse(colors.json_data)
      this.productColors = this.productColors.concat(finalColor)
    })
    let locker_colors = this.lockerColors
    locker_colors = locker_colors.map((locker_color: any) => {
      if (locker_color.color_text) {
        if (typeof locker_color.color_text == 'string') {
          locker_color.color_text = JSON.parse(locker_color.color_text)
        }
        return locker_color
      }
    })
    this.productColors = this.productColors.concat(locker_colors)

  }
  public toggleColorTabs() {
    this.colorTabClick = !this.colorTabClick
    console.log("open", this.colorTabClick)
  }
  public closeColorTabs() {
    this.colorTabClick = false
    console.log("close", this.colorTabClick)
  }

  public toggleLogoColorModal() {
    console.log("dksdksl")
    this.showVModal("logo-color-modal")
  }

}
</script>

<style lang="scss" scoped>
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
