<template>
  <div class="h-100">
    <div class="customization-tabs" :class="{'is-mobile': mobileScreen}">
      <b-tabs ref="customization-tabs" v-model="tabIndex" :key="selectedProduct.allow_name_number">
        <div class="myscroll" ref="myscroll">
          <b-tab v-if="selectedProduct.is_logo_allowed == 1" :key="selectedProduct.product_type">
            <template #title>
              <a @click="setHideTab('logoHide', true)" >
                <span :class="{'no-vector-logos': vectorImageConstraint? non_vector_logos_count > 0  : false }">
                  <span v-if="vectorImageConstraint? non_vector_logos_count > 0 : false" v-b-tooltip="`Logo uploaded are not in vector format`" class="logos-error">
                    <b-icon-exclamation-circle-fill />
                  </span>
                  <span class="icon-holder">
                    <font-awesome-icon style="size: 1em" :icon="['fas', 'image']"/>
                  </span>
                  Logo
                </span>
              </a>
            </template>
            <div class="logo-placement-tabs">
              <LogoPlacementTab />
            </div>
          </b-tab>
          <b-tab v-if="selectedProduct.product_type !== 'personalized'">
            <button @click="setHideTab('colorHide', !hideTab.colorHide)" class="tab-close-btn d-lg-none"></button>
            <template #title>
              <a @click="setHideTab('colorHide', true)" >
                <span class="icon-holder">
                  <font-awesome-icon :icon="['fas', 'fill-drip']"/>
                </span>
                Color
              </a>
            </template>
            <div v-if="hideTab.colorHide">
              <h2 class="fw-bold fz-16 p-3 d-none d-lg-block">Choose Color</h2>
              <product-extracted-colors />
              <div class="d-none d-lg-block">
                <ColorAccordion :tabIndex="tabIndex" :productColors="productColors" :key="selectedProduct.id" />
              </div>
              <!--            for mobile-->
              <div class="color-tabs d-lg-none">
                <ColorTabs :productColors="productColors"/>
              </div>
            </div>
          </b-tab>
          <b-tab v-if="selectedProduct.allow_name_number && selectedProduct.preview_custom_texts">
            <button @click="setHideTab('textHide', !hideTab.textHide)" class="tab-close-btn d-lg-none"></button>
            <template #title>
              <a @click="setHideTab('textHide', true)" >
                <span class="icon-holder">
                  <font-awesome-icon :icon="['fas', 'text-height']"/>
                </span>
                Text
              </a>
            </template>
            <div class="d-none d-lg-block">
                <CustomizationText :customTextIndex="customTextIndex" :productColors="productColors" :key="selectedProduct.id" />
            </div>
          </b-tab>
          <b-tab>
            <button @click="setHideTab('styleHide', !hideTab.styleHide)" class="tab-close-btn d-lg-none"></button>
            <template #title>
              <a @click="setHideTab('styleHide', true)" >
              <span class="icon-holder">
                <font-awesome-icon :icon="['fas', 'swatchbook']"/>
              </span>
                Style
              </a>
            </template>
            <div class="collar-section p-4" v-if="hideTab.styleHide">
              <CollarStyle/>
            </div>
          </b-tab>
          <b-tab>
            <button @click="setHideTab('teamHide', !hideTab.teamHide)" class="tab-close-btn d-lg-none"></button>
            <template #title>
              <a @click="setHideTab('teamHide', true)" >
              <span class="icon-holder">
                <BIconFileTextFill />
              </span>
                Summary
              </a>
            </template>
            <div class="team-roaster-area p-4" v-if="hideTab.teamHide">
              <h2 class="fw-bold mb-2 fz-18">{{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}}</h2>
              <div class="d-flex gap-2" v-show="!getProductEditInfoObject.editing || ( getProductEditInfoObject.editing && getProductEditInfoObject.type != 'order_product')">
                <b-button class="d-none d-lg-block" @click="show">Edit {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}}</b-button>
                <!--      <button class="btn btn-secondary light" v-if="isCustomerAuthenticated && company.platform != 'cdnExceptLogin'" @click="shareRoster">Share {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'roster' }} url</button>-->
              </div>

              <div>
                <OrderSummary :products_fonts="products_fonts" :product-sizes="productSizes" />
              </div>
            </div>
          </b-tab>
        </div>
      </b-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop, Vue, Watch} from 'vue-property-decorator'
import ColorAccordion from '@/components/ColorAccordion.vue'
import LogoPlacementTab from '@/components/Logo/LogoPlacementTab.vue'
import CustomizationText from '@/components/CustomizationText.vue'
import CollarStyle from '@/components/CollarStyle.vue'
import EditRosterAreaTab from '@/components/EditRosterAreaTab.vue'
import ColorTabs from '@/components/ColorTabs.vue'
import {RosterDetailsGlobal} from "@/mixins/LockerProduct";
import CustomizationTabsMixin from "@/mixins/CustomizationTabsMixin";
import {filter} from "lodash"
import ModalAction from "@/mixins/ModalAction";
import OrderSummary from "@/components/OrderSummary.vue";
import ProductExtractedColors from './ProductExtractedColors.vue'

@Component<CustomizationTabs>({
  components: {
    OrderSummary,
    ColorAccordion,
    LogoPlacementTab,
    CustomizationText,
    CollarStyle,
    EditRosterAreaTab,
    ColorTabs,
    ProductExtractedColors
  },
  beforeDestroy() {
    const self: Record<any, any> = this;
    self.$eventBus.$off("setTotalTabs", this.setTotalTabs)
  },
  mounted() {
    (this.$refs['myscroll'] as Record<any, any>).addEventListener('scroll', ($event:Record<any, any>)=>{$event.stopPropagation()});
    (this.$refs['myscroll'] as Record<any, any>).addEventListener('mousewheel', ($event:Record<any, any>)=>{$event.stopPropagation()});
    (this.$refs['myscroll'] as Record<any, any>).addEventListener('touchmove', ($event:Record<any, any>)=>{$event.stopPropagation()}, { passive: true });
    this.$eventBus.$on('handleNonVectorCustomLogosCount',this.notVectorLogosCount);
    this.$store.dispatch('setCustomLogos');
    this.productColorsManipulation();
    this.fontsColorsManipulation();
    this.fontsList();
    const self: Record<any, any> = this;
    self.$eventBus.$on("setTotalTabs", this.setTotalTabs)
    this.setTotalTabs();
  },
})
export default class CustomizationTabs extends Mixins(RosterDetailsGlobal, CustomizationTabsMixin, ModalAction) {
  @Prop({ required: true }) readonly products_fonts!: Record<any, any>
  @Prop({required: true}) isColorShuffled!: boolean
  @Prop({required: true}) customTextIndex!: number
  private mobileScreen = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  public showLoader = false
  public text_add_count = 0
  public set = false
  public previous_tab='';
  public ref = this.$refs as Record<any, any>
  public non_vector_logos_count = 0

  public styling = {
    scrollbar: {
      width: "100%",
      height: "calc(100vh - 220px)"
    },
  }
  @Prop({required: false, default:0}) tabIndexNew!: number

  get company(): Record<any, any>{
    return this.$store.getters.getCompany
  }

  get maintabindex(){
    return this.$store.getters.getMainTab
  }
  get manageComponents(): Record<any, any> {
    return this.$store.getters.getManageComponents
  }

  get customLogos(): Record<any, any> {
    return this.$store.getters.getCustomLogos()
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts()
  }

  get productSizes(){
    return this.selectedProduct.sizes[0].json_data
  }

  get products(): [Record<any, any>] {
    return this.$store.getters.getProducts
  }

  get getProductEditInfoObject() {
    return this.$store.getters.getProductEditInfoObject
  }
  get productNames() {
    return this.$store.getters.getSelectedProduct.productnames;
  }

  get vectorImageConstraint():boolean{
    return this.$store.getters.getFactorySettings(this.selectedProduct.factory_id)?.vector_image_constraint
  }


  public tabIndex = 0


  get hideTab(): Record<any, any> {
    return this.$store.getters.getHideTab
  }
  get lockerColors(){
    return this.$store.getters.getLockerColors
  }

  @Watch('tabIndexNew', {
    immediate: true, deep: true
  })

  tabIndexNewChanged() {
    this.tabIndex = this.tabIndexNew
  }

  @Watch('tabIndex', {
    immediate: true, deep: true
  })

  tabIndexChanged() {
    this.$emit('tabIndexChange', this.tabIndex);
  }

  @Watch('selectedProduct', {
    deep: false
  })

  selectedProductChanged() {
    this.productColorsManipulation()
    this.fontsList()
  }

  @Watch('lockerColors', {
    deep: true
  })


  lockerColorsChanged(newval:any, old:any) {
    this.productColorsManipulation()
  }

  @Watch('logoColors', {
    deep: true
  })


  logoColorsChanged(newval:any, old:any) {
    this.productColorsManipulation()
  }

  public async show(){
    this.showVModal('rostermodal')
  }


  public setTotalTabs() {
    this.$store.dispatch('setMainTotalTabs', (this.$refs['customization-tabs'] as Record<any, any>)?.getTabs().length-2)
  }

  public setHideTab(index: string, value: boolean) {
    if(this.previous_tab === '' || this.previous_tab === 'teamHide'){
      this.handleRosterItemFocus(0);
    }
    this.$store.dispatch('setHideTab', {index: index, value: value})
    this.previous_tab = index;
  }


  public addTab(index: number) {
    let text = {
      text: '',
      type: 'name',
      width: 50,
      height: 50,
      x_axis: 300,
      y_axis: 180,
      rotation: 0,
      name_of_placement: this.selectedProduct.productnames[0].name_of_placement,
      haveControls: true,
      outlineEnabled: true,
      side: 'front',
      fontFamily: this.fontOptions[0] ? this.fontOptions[0].value : '',
      fillColor: this.firstColor.value,
      fillColorPantone: this.firstColor.name,
      outLineColor: this.secondColor.value,
      outLineColorPantone: this.secondColor.name,
      outLineWidth: 0,
      add_type: 'manual',
    }
    this.$store.dispatch('setCustomTexts', {follow:true, index: this.customTexts.length, text: text, prd_id:this.selectedProduct.id})
  }
  public removeTab(index:number, prd_id:number){
    let payload  = {
      index: index,
      product_id :prd_id
    }
    this.$store.dispatch('updateCustomTextAttribute', {index: index, on_all: false, attribute: 'text', value: ''})
    this.$store.commit('REMOVE_CUSTOMIZATION_TEXT_ELEMENT', payload)
  }

  public notVectorLogosCount(){
    const custom_logos = this.$store.getters.koivna
    let non_vector_logos_count = 0
    if(custom_logos && custom_logos.length > 0) {
      const non_vector_logos = filter(custom_logos, (custom_logo: Record<any, any>) => {
        // return (custom_logo.original_logo_url && custom_logo.is_vector == false) ? true : false
        return custom_logo.is_vector == false && custom_logo.url
      })
      non_vector_logos_count = non_vector_logos.length
    }
    this.non_vector_logos_count =  non_vector_logos_count
  }

}
</script>

<style lang="scss" scoped>
.tab-close-btn {
  display: block;
  width: 100%;
  max-width: 100px;
  margin: 10px auto 0;
  height: 4px;
  background: #DFE5E8;
  border-radius: 10px;
  border: none;
}
.loader{
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  background: rgba(255,255,255,1);
  z-index: 1030;
  img{
    max-width: 7%;
    display: block;
    margin: 0 auto;
    height: auto;
  }
}

.scroll-area {
  position: relative;
  max-height: 73vh;
  overflow-y: auto;
}

.myscroll{
  height: calc(100vh - 255px);
  overflow-y: auto;

  &::-webkit-scrollbar{
    width: 7px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(33, 159, 132, 0.267);
    border-radius: 100px;
  }

  scrollbar-color: #219F84 #f1f1f1;
  scrollbar-width: thin;

  &:hover{
    &::-webkit-scrollbar-thumb {
      background: #219F84;
    }
  }
}
</style>
