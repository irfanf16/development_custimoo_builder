<template>
  <div v-if="selectedProduct">
    <b-tabs class="upload_logo mobile">
      <b-tab v-for="(custom_logo, customLogoIndex) in customLogos" :active="custom_logo_tab_index == customLogoIndex"
             :key="`custom_logo_${customLogoIndex}`" @click="custom_logo_tab_index = customLogoIndex">
        <template #title>
          <span>{{ customLogoIndex == 0 ? 'Team Logo' : 'logo ' + customLogoIndex }}</span>
          <div v-if="customLogoIndex > 0">
            <span class="close" @click="removeLogoTab(customLogoIndex)"><BIconX /></span>
          </div>
        </template>
        <div class="logo-uploader-main">
          <div class="tabs-logo-container">
            <div class="logo-placement-area mb-3 mb-lg-4 pt-0">
              <div class="logo-placement-holder mb-lg-3" :class="custom_logo.url ? 'hasLogo': 'noLogo'">
                <div class="logo-holder">
                  <LogoUploaderMobile :customLogoIndex="customLogoIndex" :showImage="true" :showActions="true"
                                    :ref="'logoUploadModalOpener'+customLogoIndex" :customLogo="custom_logo" :key="'top'+customLogoIndex">
                    <span slot="upload_text">Click to upload logo or drag a file here</span>
                  </LogoUploaderMobile>
                  <div class="logo-placemet-content">
                    <b-button :class="{'invisible': !getRecentLogos.length > 0}" class="logo-editor-button py-2" @click="showRecentLogos = true" style="line-height: normal;" size="sm" variant="secondary">
                        Logos
                    </b-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="logo-placement-area extracted-color-area" style="margin-top: 10px;"
               v-if="custom_logo.url">
            <div class="d-flex gap-1 align-items-center justify-content-between">
              <span>Logo placement</span>
              <template v-if="custom_logo.side == 'front'">
                <button class="btn btn-secondary btn-sm py-1 fs-1" @click="handleLogoPlacementChange('back', customLogoIndex)">
                  <b-icon-arrow-repeat />
                  Back
                </button>
              </template>
              <template v-else>
                <button class="btn btn-secondary btn-sm py-1 fs-1" @click="handleLogoPlacementChange('front', customLogoIndex)">
                  <b-icon-arrow-repeat />
                  Front
                </button>
              </template>

            </div>
            <div class="logo-placement-area extracted-color-area" style="margin-top: 15px;" v-if="customLogoIndex ==0  && selectedProduct.product_type == 'customized'">
              <h4 v-if="customLogos[0].url" class="mb-3 d-flex align-items-center justify-content-between mb-lg-4">
                <div>
                  Color Extracted from Logo
                </div>
              </h4>
              <div class="mb-lg-3 w-100">
                <div class="color-holder" style="margin-top: -10px; padding-top: 10px;">
                  <div class="color-container">
                    <div class="color-box" v-for="(imageColor, icIdx) in logoColorsInfo.colors"
                         @click="selectLogoColor(imageColor, +icIdx)" :title="imageColor.name"
                         :class="{'active-swatch' : icIdx==selectedSwatchIndex, 'noColor': !imageColor.hex}"
                         :style="{background: imageColor.hex ? imageColor.hex : '#fff'}" :key="icIdx">
                      <template v-if="imageColor.hex">
                          <span class="removeColor" @click.stop="deleteLogoColor(icIdx)">
                            <BIconX />
                          </span>
                      </template>
                      <template v-else>
                        <BIconPlus class="addColor" />
                      </template>
                      <span class="selected" @click="deleteLogoColor(icIdx)">
                            <BIconCheck />
                          </span>
                    </div>

                    <div v-if="active_logo_color_index >= 0" class="mobile-other">
                      <span class="close" @click="hideOther"><BIconX /></span>
                      <h2>Choose a color</h2>
                      <LogoColorTabsNew v-if="active_logo_color_index >= 0" @setSwatchColor="setSwatchColor" :productColors="product_colors"
                                        :logoColorIndex="active_logo_color_index"
                      />
                    </div>

                    <div v-if="showRecentLogos" class="mobile-other recent-logos-mobile">
                      <span class="close" @click="hideRecentLogosHandler"><BIconX /></span>
                      <div>
                        <template v-if="customLogos && customLogos.length > 0">
                          <recent-logos :custom-logo-index="customLogoIndex" :custom-logo="customLogos[customLogoIndex]"/>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="d-flex align-items-center justify-content-center gap-1">
                  <b-button @click="useLogoColors" class="use-btn flex-shrink-1" style="white-space: nowrap; max-width: 200px" v-if="!logoColorsInfo.using_logo_colors">
                    Logo Colors
                  </b-button>
                  <b-button @click="useOriginalColors" class="use-btn flex-shrink-1" style="white-space: nowrap; max-width: 200px" v-else>
                    Original Colors
                  </b-button>
                  <b-button class="use-btn flex-shrink-1" @click="shuffleLogoColors" :class="!logoColorsInfo.using_logo_colors ? 'invisible': 'pulse-animation'"
                            variant="secondary"><b-icon-shuffle />
                  </b-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </b-tab>

      <template #tabs-end>
        <template v-if="(selectedProduct.allowed_logos_count == 0 || customLogos && customLogos.length < selectedProduct.allowed_logos_count)">
          <li @click="addLogoTab" class="add_text_tab" style="font-size: 0.9em">Add <BIconPlus/></li>
        </template>
        <div v-if="showRecentLogos" class="mobile-other recent-logos-mobile">
          <span class="dragControl" v-touch-options="{touchClass: 'active'}" v-touch:moving="resizeTab(0)"></span>

          <span class="close" @click="showRecentLogos = false"><BIconX /></span>
          <div>
            <template v-if="customLogos && customLogos.length > 0">
              <recent-logos :custom-logo-index="custom_logo_tab_index" :custom-logo="customLogos[custom_logo_tab_index]"/>
            </template>
          </div>
        </div>
      </template>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop} from 'vue-property-decorator'
import UploadLogo from "@/components/UploadLogo.vue"
import SaveLogoModal from "@/components/SaveLogoModal.vue"
import SaveColorModal from "@/components/SaveColorModal.vue"
import LogoColorTabsNew from "@/components/LogoColorTabsNew.vue"
import RecentLogos from "@/components/Logo/RecentLogos.vue";
import {LogoUploaderColors} from "@/mixins/LogoUploaderColors";
import LogoUploaderMobile from "@/components/Logo/LogoUploaderMobile.vue";
import {LogoPlacementTabMixin} from "@/mixins/LogoPlacementTabMixin";
import Vue from "vue";
import LogoExtractedColors from "@/components/Logo/LogoExtractedColors.vue";
import {getDomDocument, getProductColors} from "@/helpers/Helpers";

@Component<LogoPlacementMobile>({
  components: {
    LogoExtractedColors,
    LogoUploaderMobile,
    RecentLogos,
    UploadLogo,
    SaveLogoModal,
    SaveColorModal,
    LogoColorTabsNew
  },
  mounted() {
    this.product_colors = getProductColors();
    const logo_disclaimer_info = localStorage.getItem(Vue.prototype.$logoDisclaimerInfo_localstorage_key)
    if(logo_disclaimer_info) {
      this.logoDisclaimerInfo = JSON.parse(logo_disclaimer_info)
    }
  }
})

export default class LogoPlacementMobile extends Mixins(LogoUploaderColors, LogoPlacementTabMixin) {
  public showRecentLogos = false
  public selectedSwatchIndex = -1
  public showLogoColors = false
  public product_colors: Record<any, any>[] = []



  public hideOther() {
    this.showLogoColors = false
    this.$emit('showOther', this.showLogoColors);
    this.selectedSwatchIndex = -1;
    this.selectLogoColor({},-1)
  }

  private hideRecentLogosHandler(){
    this.showRecentLogos = false
    this.$emit('showOther', false);
  }

  private resizeTab(idx: number){
    return (e:Record<any, any>) => {
      let cursorPosition = e.changedTouches && e.changedTouches[0].clientY;
      if(cursorPosition <= 15){
        cursorPosition = 15
      }else if(cursorPosition >= window.screen.availHeight - 190){
        cursorPosition = window.screen.availHeight - 190
      }
      const main_doc = getDomDocument() as Record<any, any>
      let element = main_doc.querySelector('.recent-logos-mobile') as Record<any, any>;
      if(!element){
        let shadow_dom = (this.$root as Record<any,any>).$options.shadowRoot;
        element = shadow_dom.querySelector('.recent-logos-mobile') as Record<any, any>;
      }
      element.style.top = cursorPosition + 'px';
    }
  }
}
</script>

<style lang="scss" scoped>
.logo-uploader-main{
  @media (max-width: 600px) {
    display: flex;
  }
}

.dragControl{
  position: absolute;
  height: 13px;
  width: 100px;
  top: 7px;
  left: 0;
  right: 0;
  margin: 0 auto;
  background: #dbdbdb;
  border-radius: 10px;
  z-index: 10;
  box-shadow: 1px 1px 0 0px #ccc, inset 0 0 3px 1px #eee;
  display: block;
}
.dragControl.active{
  background: lightblue;
  box-shadow: 1px 1px 0 0px #ccc, inset 0 0 3px 1px aliceblue;
}
</style>
