import {
  getExtensionsFor,
  getLogoUpdatedProps,
  hideLockerProductUpdateButton,
  processColorsCustom,
  recentLogoDefaultObject,
  santaClone,
  setUndoRedoItems
} from '@/helpers/Helpers';
import { http } from "@/httpCommon";
import CustomLogosMixin from "@/mixins/CustomLogosMixin";
import Vue from "vue";
import { Component, Mixins, Prop } from "vue-property-decorator";

@Component
export class LogoUploaderMixin extends Mixins(CustomLogosMixin) {

  /*
  * props starts here
  * */

  @Prop({ required: true }) customLogoIndex!: number
  @Prop({ required: true }) customLogo!: Record<any, any>
  @Prop({ required: false }) replaceLogo!: boolean

  /*
  * props ends here
  * */

  /*
  * data props starts here
  * */

  public showLoader = false;
  public logoDisclaimerInfo = { accepted: false, show_again: true, user_id: null }
  public handlingDisclaimerAction = false
  public logo_file: File | null = null

  public storageUrl = process.env.VUE_APP_STORAGE_URL
  public mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  public logo_allowed_extensions = ['jpg','gif','png','jpeg','pdf','eps','ai']

  /*
  * data props ends here
  * */
  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  public showLogoDisclaimer() {
    const self: Record<any, any> = this;
    let show_disclaimer = this.logoDisclaimerInfo.accepted ? false : true;
    if(this.logoDisclaimerInfo.accepted == true) {
      show_disclaimer = this.logoDisclaimerInfo.show_again
    }
    if(show_disclaimer) {
      self.$modal.show('logo-disclaimer-modal')
    }
    return show_disclaimer
  }

  public handleInputOnClick(e: Event, replaceLogo?:boolean, customLogo?:Record<any, any>, customLogoIndex?:number){
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

  public async handleInputChange(e: Event, replaceLogo: boolean, customLogo?:Record<any, any>, customLogoIndex?:number) {
    const target = e.target as HTMLInputElement
    const logo_file = target.files && target.files.length ? target.files[0] : null
    if(logo_file) {
      if(await this.validateLogoFile(logo_file, replaceLogo)) {
        this.uploadLogo(logo_file, replaceLogo, customLogo, customLogoIndex)
      } else {
        target.value = '';
      }
    }
  }

  public async handleInputOnDrag(e: any, replaceLogo: boolean, customLogo?:Record<any, any>, customLogoIndex?:number) {
    // this.logo_file have file then it means user have accepted logo disclaimer so now simply upload file to server
    this.preventDragDefaults(e);
    if(this.logo_file) {
      this.uploadLogo(this.logo_file, replaceLogo, customLogo, customLogoIndex)
      return false
    } else {
      const target = e.target as HTMLInputElement
      const logo_file = e.dataTransfer.files[0]
      if(await this.validateLogoFile(logo_file, replaceLogo)) {
        if(this.showLogoDisclaimer()) {
          e.preventDefault()
          // if logo disclaimer is shown then save uploaded file to public property (logo_file). When user accept the disclaimer then upload file to server
          this.logo_file = e.dataTransfer.files[0]
        } else {
          this.uploadLogo(logo_file, replaceLogo, customLogo, customLogoIndex)
        }
      } else {
        target.value = '';
      }
    }
  }

  public preventDragDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  public handleDisclaimerModalHideEvent() {
    const self: Record<any, any> = this;
    self.$modal.hide('logo-disclaimer-modal')
    this.logo_file = null
  }

  public handleDisclaimerAction(show_disclaimer_again: boolean) {
    const self: Record<any, any> = this;
    this.handlingDisclaimerAction = true
    this.logoDisclaimerInfo.accepted = true
    this.logoDisclaimerInfo.show_again = show_disclaimer_again
    localStorage.setItem(Vue.prototype.$logoDisclaimerInfo_localstorage_key, JSON.stringify(this.logoDisclaimerInfo));
    self.$modal.hide('logo-disclaimer-modal')
    if(this.logo_file) {
      this.uploadLogo(this.logo_file)
    } else {
      const input_element = this.$refs.logoUploadInput as HTMLInputElement
      input_element.click()
    }
    this.handlingDisclaimerAction = false
  }

  public getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  public async validateLogoFile(logo_file: File, replaceLogo = false) {
    const self: Record<any, any> = this;
    const extension = logo_file.name.toLowerCase().split('.').pop() as string;
    let logo_allowed_extensions = getExtensionsFor()
    if(replaceLogo) {
      logo_allowed_extensions = getExtensionsFor('vector')
    }
    let is_allowed = logo_allowed_extensions.includes(extension)
    if(!is_allowed) {
      self.showToast(`The file must be a file of type: ${logo_allowed_extensions.join(', ')}.`,'Error');
      return false;
    }

    const raster_extensions = getExtensionsFor('raster')
    if (raster_extensions.includes(extension)) {
      if (logo_file.size > 20 * 1024 * 1024 ) { // 20MB in bytes
       self.showToast('The file size must not be greater than 20MB.', 'Error');
       is_allowed = false;
      } else {
        const {width, height} = await this.getImageDimensions(logo_file);
        if (width > 4096 || height > 4096) {
          const text = 'This logo is very large. Consider rescaling the logo to less than 4096x4096 pixels. You can continue with the upload but it may take a very long time to process. Continue?'
          await self.$santaModal.show({
            icon: 'confirm', text: text, confirm_text: 'Confirm', cancel_text: 'Cancel',
          },self).then((confirmation) => {
            if(confirmation){
              self.$santaModal.hide();
              is_allowed = true
            } else {
              is_allowed = false
            }
          })
        }
      }
    }
    return is_allowed;
  }

  public async uploadLogo(logo_file: File, replaceLogo = false, customLogo?: Record<any, any>, customLogoIndex?: number) {
    const self: Record<any, any> = this;
    const form_data = new FormData()
    form_data.append('file', logo_file)
    form_data.append('product_id', this.selectedProduct.product_id)
    this.showLoader = true;
    this.$store.commit('SET_UPDATING_LOGO', true)
    http.post('/customer/upload/logo', form_data).then(async resp => {
      //empty logo_file when file is uploaded
      this.logo_file = null
      const response_data = resp.data
      if(response_data.success) {
        const logo_data = response_data.result.customer_logo
        const unprocessed_logo_color = santaClone(logo_data.logo_colors)
        logo_data.is_replace_success =  replaceLogo ? true : false
        await setUndoRedoItems('customLogos', 'added')
        const logo_colors = processColorsCustom(logo_data.logo_colors, 4, 'logo_color_type')
        const product_logo_colors = processColorsCustom(logo_data.logo_colors, 4)

        logo_data.logo_colors = logo_colors
        if(customLogoIndex == 0) {
          this.$store.commit('SET_LOGO_COLORS_INFO', {
            data: { colors: product_logo_colors, extracted_colors: JSON.parse(JSON.stringify(product_logo_colors)) }
          })
          await this.addRemoveTeamLogoOnAllProducts('add', logo_data)
        } else {
          const custom_logos_updated_props = getLogoUpdatedProps(logo_data)
          delete customLogo!.scaleX
          delete customLogo!.scaleY
          this.$store.commit('SET_CUSTOM_LOGOS', {
            logo_index: customLogoIndex, custom_logos: {...customLogo, ...custom_logos_updated_props}
          })
        }
        this.$store.commit('SET_RECENT_LOGOS', {data: recentLogoDefaultObject({...logo_data, ...{logo_colors: unprocessed_logo_color}})})
        self.$eventBus.$emit('handleCustomLogoUpdatedEvent', customLogo)
        self.$eventBus.$emit('handleNonVectorCustomLogosCount')
        this.$emit('logo-uploaded', customLogo)
      } else {
        self.showError(response_data.message);
        self.showLoader = false;
        return false
      }
      const inputRef = this.$refs.logoUploadInput as Record<any, any>
      inputRef.value = null;
      await hideLockerProductUpdateButton(false)
      this.showLoader = false;
      this.$store.commit('SET_UPDATING_LOGO', false)
      this.$store.commit('SET_LOGO_COLORS_INFO', {data: {using_logo_colors: false, is_shuffled: false}})
    })
      .catch((error: any) => {
        const inputRef = this.$refs.logoUploadInput as Record<any, any>
        inputRef.value = null;
        this.showLoader = false;
        this.$store.commit('SET_UPDATING_LOGO', false)
        self.showError(error);
      })
  }
}
