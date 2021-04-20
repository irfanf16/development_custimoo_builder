<template>
  <div>
  <div class="customization-tabs">
    <b-tabs>
      <b-tab v-if="productDetails.is_logo_allowed == 1">
        <template #title>
          <div class="icon-holder">
            <font-awesome-icon :icon="['fas', 'image']"/>
          </div>
          Logo
        </template>
        <div class="logo-placement-tabs">
          <LogoPlacementTabs :numberOfLogosAllowed="productDetails.allowed_logos_count" :logosSetting="productDetails.logos_setting" />
        </div>
      </b-tab>
      <b-tab>
        <template #title>
          <div class="icon-holder">
            <font-awesome-icon :icon="['fas', 'fill-drip']"/>
          </div>
          Color
        </template>
        <div>
          <h2 class="fw-bold fz-16 p-3">Choose Color</h2>
          <div class="d-none d-lg-block">
            <ColorAccordion :productColors="productColors" />
          </div>
          <div class="d-lg-none">
            <ColorTabs />
          </div>
        </div>
      </b-tab>
      <b-tab>
        <template #title>
          <div class="icon-holder">
            <font-awesome-icon :icon="['fas', 'text-height']"/>
          </div>
          Text
        </template>
        <CustomizationText/>
      </b-tab>
      <b-tab>
        <template #title>
          <div class="icon-holder">
            <font-awesome-icon :icon="['fas', 'swatchbook']"/>
          </div>
          Style
        </template>
        <div class="collar-section p-4">
          <h2 class="fw-bold mb-2 fz-18">Choose Product</h2>
          <CollarStyle/>
        </div>
      </b-tab>
      <b-tab>
        <template #title>
          <div class="icon-holder">
            <font-awesome-icon :icon="['fas', 'user-friends']"/>
          </div>
          Team
        </template>
        <div class="team-roaster-area p-4">
          <h2 class="fw-bold mb-2 fz-18">Roster</h2>
          <EditRosterArea/>
        </div>
      </b-tab>
    </b-tabs>
  </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import ColorAccordion from '@/components/ColorAccordion.vue'
import LogoPlacementTabs from './LogoPlacementTabs.vue'
import CustomizationText from '@/components/CustomizationText.vue'
import CollarStyle from '@/components/CollarStyle.vue'
import EditRosterArea from '@/components/EditRosterArea.vue'
import UploadLogo from '@/components/UploadLogo.vue'

@Component<CustomizationProcess>({
  components: {
    ColorAccordion,
    LogoPlacementTabs,
    CustomizationText,
    CollarStyle,
    EditRosterArea,
    UploadLogo
  },
  mounted() {
    this.$store.dispatch('setCustomLogos')
    this.productColorsManipulation()
  },
  created() {
    console.log("mango")
    var obkects = document.getElementsByClassName("tab-pane");
    console.log(obkects)
    for(var i=0;i<obkects.length;i++){
      obkects[i].classList.remove('active')//.classList.remove('active');
    }

  }
})
export default class CustomizationProcess extends Vue {
  @Prop({required: true}) productDetails!: any

  get manageComponents(): [] {
    return this.$store.getters.getManageComponents
  }
  public productColors: any[] = []

  public productColorsManipulation(){
    this.productDetails.colors.forEach((colors: any, key: number) => {
      colors.color_text = JSON.parse(colors.color_text)
      colors.selectedColor = ""
      this.productColors = this.productColors.concat(colors)
    })
  }
}

</script>
