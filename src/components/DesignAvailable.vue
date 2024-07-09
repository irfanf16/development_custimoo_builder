<template>
  <div class="available-designs-section px-3 px-lg-0" ref="designs" v-if="selectedProduct">
    <template v-if="selectedProduct.productstyles[styleIndex]">
      <div class="design-col" v-for="(design, index) in selectedProduct.productstyles[styleIndex].productdesigns" :key="design.id" :id="index" :class="{'selected_design': design.id == selectedDesignId}" ref="design_item">
        <div class="d-flex justify-content-between">
          <template>
            <label :class="{ 'select-design-checkbox': !mobileScreen, 'custom-checkbox': isCustomerAuthenticated }">
              <input v-if="isCustomerAuthenticated" type="checkbox" :value="index" @change="handleActiveProductDesignSelection($event, index)" class="design-available-product-design-selection">
              <span></span>
            </label>
          </template>
          <button @click="handleLockDesign(design.id)" class="btn d-inline-flex" :class="{'btn-gray': !locked_designs[design.id], 'btn-active': locked_designs[design.id], 'lock-design-icon': !mobileScreen}">
            <font-awesome-icon :icon="['fas', 'lock']" class="design-available-product-design-selection"/>
          </button>
        </div>
        <a @click="changeDesign(index); showPreview()" v-if="(first_load && index < 4) || design.design_show_on_scroll" ref="design_canvas">
          <Scene canvas-width="150" canvas-height="150" :measurement-ratio="selectedProduct.measurement_ratio" :ref="`design_scene_${design.id}`"
                 :front="{
                    textureUrl: storageUrl+design.front_design.file_thumbnail_url, file_extension:design.front_design.file_extension,
                    safe_zone_url: design.frontsafezone_design? storageUrl+design.frontsafezone_design.file_url : '',
                    boundary_url: design.frontboundary_design? storageUrl+design.frontboundary_design.file_url : '',
                    models: selectedProduct.productstyles[styleIndex].front_models
                  }"
                 :backTextureUrl="design.back_design? design.back_design.file_thumbnail_url: ''"
                 :backTextrueExtension="design.back_design? design.back_design.file_extension: ''"
                 :logos="selectedProduct.productstyles[styleIndex].logo"
                 :logosSettings="selectedProduct.logos_setting" :logoAllowed="Boolean(selectedProduct.is_logo_allowed)" :logosLimit="selectedProduct.allowed_logos_count"
                 :productNamesSetting="selectedProduct.productnames" :productColors="selectedProduct.colors" :colorGrouping="JSON.parse(design.front_design.color_group)"
                 :productType="selectedProduct.product_type" :product_id="selected_product_id" :product_index="selectedProductIndex" :products_fonts="products_fonts"
                 :design_id="design.id"/>
        </a>
        <div v-else :style="{width: design_width+ 'px', height: design_height+ 'px'}"></div>
        <h3>{{ design.design_name }}</h3>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Mixins} from 'vue-property-decorator'
import Scene from '@/components/Scene.vue'
import {HideUpdateLockerButton} from "@/mixins/SelectedProductMixin";
import {LogoUploaderColors} from "@/mixins/LogoUploaderColors";
import {getDomDocument} from "@/helpers/Helpers";

@Component<DesignAvailable>({
  components: {
    Scene
  },
  mounted() {
    this.$eventBus.$on("product_designs_selection_reset", this.handleProductDesignsSelectionInfoReset)
    this.first_load = true
    this.design_width = (this.$refs['design_canvas'] as Record<any, any>)[0].clientWidth
    this.design_height = (this.$refs['design_canvas'] as Record<any, any>)[0].clientHeight;
    setTimeout(() => {
      (this.$refs['design_item'] as Record<any, any>[]).forEach((design_element: HTMLDivElement) => {
        observer.observe(design_element);
      })
    }, 1000)

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Check if the target element is in view
        if (entry.isIntersecting) {
          if (this.design_times[entry.target.id]) clearTimeout(this.design_times[entry.target.id])
          const time_out = this.first_load? 0 : 800
          this.design_times[entry.target.id] = setTimeout(() => {
            // Load the content or perform your lazy loading logic
            Vue.set(this.selectedProduct.productstyles[this.styleIndex].productdesigns[entry.target.id], 'design_show_on_scroll', 1)
          }, time_out)
        } else {
          // elements are hiding here
          if (!this.first_load) {
            if (this.design_times[entry.target.id]) clearTimeout(this.design_times[entry.target.id])
            Vue.set(this.selectedProduct.productstyles[this.styleIndex].productdesigns[entry.target.id], 'design_show_on_scroll', 0)
          }
        }
      })
      setTimeout(() => {
        this.first_load = false
      }, 1000)
    })
  },
  beforeDestroy() {
    this.$eventBus.$off("product_designs_selection_reset")
  }
})

export default class DesignAvailable extends Mixins(HideUpdateLockerButton, LogoUploaderColors) {
  @Prop({ required: true }) readonly products_fonts!: Record<any, any>

  private storageUrl = process.env.VUE_APP_STORAGE_URL
  @Prop() activeTab!: number;
  public first_load = true
  public design_width = 0
  public design_height = 0
  public design_times = []

  get locked_designs() {
    return this.$store.getters.getLockedDesigns()
  }

  get mobileScreen(): boolean {
    return this.$store.getters.getManageComponents.mobileScreen
  }
  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }
  get selected_product_id(): number{
    return this.$store.getters.getSelectedProductId
  }
  get selectedProductIndex(): number{
    return this.$store.getters.getSelectedIndex
  }
  get selectedDesignId(): number{
    return this.$store.getters.getSelectedDesignId
  }
  get styleIndex():number{
    return  this.$store.getters.getCurrentStyleIndex;
  }

  get getLastActiveProductData(): Record<any, any> {
    return this.$store.getters.getLastActiveProductData
  }

  get logoColorsInfo() {
    return this.$store.getters.getLogoColorsInfo();
  }

  get getProductSelectionDesignInfo(): Array<any> {
    return this.$store.getters.getProductSelectionDesignInfo
  }

  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }


  public changeDesign(index: number) {
    if(this.selectedDesignId != this.selectedProduct.productstyles[this.styleIndex].productdesigns[index].id) {
      if(this.logoColorsInfo.using_logo_colors) {
        this.useLogoColors(false)
      }
      this.$store.commit('SET_LAST_ACTIVE_PRODUCT_DATA', {
        design_index: index, design_id: this.selectedProduct.productstyles[this.styleIndex].productdesigns[index].id
      })
      this.$store.commit('Change_Locker_Tabs_Index', undefined)
      this.$store.dispatch('setActiveTab', -1)
      this.$store.commit('SET_SHUFFLE', false)
      this.selectedProduct.productstyles[this.styleIndex].productdesigns.forEach((design: any, key: number) => {
        if (index == key) {
          Vue.set(design, 'design_show', 1)
          this.$store.dispatch('setSelectedProductDesignID', design.id);
        } else {
          Vue.set(design, 'design_show', 0)
        }
      })
      this.hideLockerProductUpdateButton()
    }
  }

  public showPreview() {
    if(this.mobileScreen){
      this.$store.dispatch('setManageComponents', {index: 'CustomizationPreview', value: true})
      this.$store.dispatch('setManageComponents', {index: 'ItemToCustomize', value: false})
    }
  }

  public handleActiveProductDesignSelection(event, design_index) {
    const action = event.target.checked ? "add" : "remove"
    this.$store.commit("UPDATE_product_designs_selection_info", { action, design_index })
  }

  public handleProductDesignsSelectionInfoReset() {
    const product_design_selection_info = this.$store.getters.getProductSelectionDesignInfo
    if(!product_design_selection_info.selection_mode) {
      const checkedCheckboxes: NodeListOf<HTMLInputElement> = getDomDocument()?.querySelectorAll('input.design-available-product-design-selection:checked');
      checkedCheckboxes.forEach((checkbox: HTMLInputElement) => {
        checkbox.checked = false;
      });
    }
  }

  public handleLockDesign(design_id) {
    const self: Record<any, any> = this;
    if(this.locked_designs[design_id]) {
      this.$store.commit('UNSET_LOCKED_DESIGN', design_id)
      self.$eventBus.$emit("changeColors")
    } else {
      (this.$refs[`design_scene_${design_id}`] as Record<any, any>)[0].setLockedDesign()
    }
  }
}
</script>

<style scoped lang="scss">
.available-designs-section {
  display: flex;
  flex-wrap: wrap;
  // justify-content: space-between;
  align-items: stretch;
  //max-height: 15vh;
  overflow: hidden;
  overflow-y: auto;
  padding-bottom: 13vh;
  //@media only screen and (min-width: 350px){
  //  max-height: 36vh;
  //}
  //@media only screen and (min-width: 374px){
  //  max-height: 32vh;
  //}
  //@media only screen and (min-width: 410px){
  //  max-height: 38vh;
  //}
  //@media only screen and (min-width: 768px){
  //  max-height: 52vh;
  //}

  @media only screen and (min-width: 992px){
    max-height: 50vh;
    padding-bottom: 0;
  }
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

  // &:after {
  //   content: '';
  //   flex: auto;
  // }

  .lock-design-icon {
    opacity: 0;
    padding: 1px 12px 6px 12px;
  }

  .design-col {
    &:hover {
      .select-design-checkbox {
        opacity: 1;
        span {
          opacity: 1;
        }
      }
      .lock-design-icon {
        opacity: 1;
      }
    }

    margin-bottom: 10px;
    flex-basis: 33.33%;
    max-width: 33.33%;
    padding: 5px;
    border-radius: 5px;

    a {
      display: block;
      position: relative;
      z-index: 1;
    }

    h3{
      text-align: center;
      padding: 7px 0 0;
      text-transform: uppercase;
      overflow: hidden;
      font-size: 0.65rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      word-break: break-all;
      word-wrap: break-word;

        @media only screen and (min-width: 768px){
          font-size: 0.85rem;
        }
        @media only screen and (min-width: 1024px){
          font-size: 0.6rem;
        }
      }

    img {
      display: block;
      max-width: 100%;
      margin: 0;
      height: auto;
    }

  }
  .select-design-checkbox{
    input{
      display: none;
    }

    span{
      opacity: 0;
      display: block;

      &::after, &::before{
        opacity: 0;
        display: block;
      }
    }

    input + span {
      opacity: 0;
    }

    input:checked + span {
      opacity: 1;


      &::after, &::before{
        opacity: 1;
      }
    }
  }

  .custom-checkbox{
    input{
      display: none;
    }

    span{
      display: block;
      height: 20px;
      width: 20px;
      border: 1px solid #ccc;
      border-radius: 4px;
      position: relative;
      cursor: pointer;

      &::after, &::before{
        content: '';
        display: none;
        position: absolute;
        width: 2px;
        background-color: #fff;
      }

      &::before {
        height: 10px;
        left: 10px;
        top: 4px;
        transform: rotate(45deg);
      }

      &::after {
        height: 6px;
        left: 5px;
        top: 8px;
        transform: rotate(-45deg);
      }
    }

    input:checked + span {
      background: var(--theme-color);
      border-color: var(--theme-color);

      &::after, &::before{
        display: block;
      }
    }
  }
  .btn-gray {
    color: gray;
  }
  .btn-active {
    color: #219F84 !important;
    opacity: 1;
  }
}
</style>
