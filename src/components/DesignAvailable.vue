<template>
  <div>
    <b-tabs v-if="selectedProduct.productstyles.length && selectedProduct.productstyles[styleIndex].design_categories.length">
      <b-tab @click="handleAllTabClick" title="All"></b-tab>

      <!-- Only show category tabs in normal mode -->
      <b-tab
        v-for="(category, category_index) in selectedProduct.productstyles[styleIndex].design_categories"
        @click="handleCategoryChange(category_index)"
        :key="category_index"
        :title="category.category_name"
      />
    </b-tabs>

    <div class="available-designs-section px-3 px-lg-0" ref="designs" v-if="selectedProduct">

      <template v-if="selectedProduct?.productstyles?.[styleIndex] &&
         filteredDesigns.length">
        <div class="design-col" v-for="(design, index) in filteredDesigns" :key="`${design.id}-${currentCategoryIndex}`" :id="index" :class="{'selected_design': design.id == selectedDesignId}" ref="design_item">
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
            <Scene :canvasWidth="150" :canvasHeight="150" :measurement-ratio="selectedProduct.measurement_ratio" :ref="`design_scene_${design.id}`"
                   :front="{
                      textureUrl: storageUrl+design.front_design.file_thumbnail_url, file_extension:design.front_design.file_extension,
                      safe_zone_url: design.frontsafezone_design? storageUrl+design.frontsafezone_design.file_url : '',
                      boundary_url: design.frontboundary_design? storageUrl+design.frontboundary_design.file_url : '',
                      models: selectedProduct.productstyles[effectiveStyleIndex(design)].front_models
                    }"
                   :svg_parts="design.svg_parts"
                   :backTextureUrl="design.back_design? design.back_design.file_thumbnail_url: ''"
                   :backTextrueExtension="design.back_design? design.back_design.file_extension: ''"
                   :logos="selectedProduct.productstyles[effectiveStyleIndex(design)].logo"
                   :logosSettings="selectedProduct.logos_setting" :logoAllowed="Boolean(selectedProduct.is_logo_allowed)" :logosLimit="selectedProduct.allowed_logos_count"
                   :productNamesSetting="selectedProduct.productnames" :productColors="selectedProduct.colors" :colorGrouping="JSON.parse(design.front_design.color_group)"
                   :productType="selectedProduct.product_type" :product_id="selected_product_id" :product_index="selectedProductIndex" :products_fonts="products_fonts"
                   :design_id="design.id" :visual_addons="selectedProduct.productstyles[effectiveStyleIndex(design)].customized_addons"
            />
          </a>
          <div v-else :style="{width: design_width+ 'px', height: design_height+ 'px'}"></div>
          <h3>{{ design.design_name }}</h3>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Mixins} from 'vue-property-decorator'
import Scene from '@/components/Scene.vue'
import {HideUpdateLockerButton} from "@/mixins/SelectedProductMixin";
import {LogoUploaderColors} from "@/mixins/LogoUploaderColors";
import {getDomDocument} from "@/helpers/Helpers";

@Component({
  components: {
    Scene
  },
  watch: {
  styleIndex() {
    this.currentCategoryIndex = 0
    console.log('styleIndex watch', this.$store.getters.getCurrentStyleIndex)
    this.loadDesignsByStyleIndex()
  }
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
  public currentCategoryIndex = 0
  public filteredDesigns: Array<any> = []
  public observer: IntersectionObserver | null = null

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
  get styleIndex(): number {
    const idx = this.$store.getters.getCurrentStyleIndex
    return typeof idx === 'number' ? idx : 0
  }
  public effectiveStyleIndex(design: Record<string, any>): number {
    if (this.$store.getters.getDesignBrowseMode === 'ALL' && typeof design._styleIndex === 'number') {
      return design._styleIndex
    }
    return this.styleIndex
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


  mounted() {
    this.$eventBus.$on("product_designs_selection_reset", this.handleProductDesignsSelectionInfoReset)
    // clear per-component loader when the 3D scene reports it is visible
    this.$eventBus.$on('three-scene-loaded', this.onThreeSceneLoaded)
    this.first_load = true
    this.$nextTick(() => {
      const canvas = (this.$refs['design_canvas'] as any)?.[0]
      if (canvas) {
        this.design_width = canvas.clientWidth
        this.design_height = canvas.clientHeight
      }
    })
    // this.setupObserver()
     this.loadDesignsByStyleIndex()
  }


  beforeDestroy() {
    this.$eventBus.$off("product_designs_selection_reset")
    this.$eventBus.$off('three-scene-loaded', this.onThreeSceneLoaded)
    if (this.observer) {
      this.observer.disconnect()
    }
  }

  public setupObserver() {
    // Disconnect existing observer if any
    if (this.observer) {
      this.observer.disconnect()
    }

    // Create new observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Check if the target element is in view
        if (entry.isIntersecting) {
          if (this.design_times[entry.target.id]) clearTimeout(this.design_times[entry.target.id])
          const time_out = this.first_load? 0 : 800
          this.design_times[entry.target.id] = setTimeout(() => {
            // Load the content or perform your lazy loading logic
            Vue.set(this.filteredDesigns[entry.target.id], 'design_show_on_scroll', 1)
          }, time_out)
        } else {
          // elements are hiding here
          if (!this.first_load) {
            if (this.design_times[entry.target.id]) clearTimeout(this.design_times[entry.target.id])
            Vue.set(this.filteredDesigns[entry.target.id], 'design_show_on_scroll', 0)
          }
        }
      })
      setTimeout(() => {
        this.first_load = false
      }, 1000)
    })

    // Observe all design elements
    setTimeout(() => {
      const designItems = this.$refs['design_item'] as Record<any, any>[]
      if (designItems && designItems.length > 0) {
        designItems.forEach((design_element: HTMLDivElement) => {
          this.observer!.observe(design_element);
        })
      }
    }, 100)
  }
  public async changeDesign(index: number) {

    const selectedDesign = this.filteredDesigns[index]
    if (!selectedDesign) return
    const lastActiveProductData: Record<any, any> = {
      design_index: index,
      design_id: selectedDesign.id
    }
    if (this.$store.getters.getDesignBrowseMode === 'ALL') {
      lastActiveProductData.style_index = selectedDesign._styleIndex
      lastActiveProductData.style_id = this.selectedProduct.productstyles[selectedDesign._styleIndex].id

      this.$store.commit('CHANGE_STYLE_INDEX', selectedDesign._styleIndex)
    }
    this.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", lastActiveProductData)

    const targetStyleIndex = this.styleIndex
    const targetStyle = this.selectedProduct.productstyles[targetStyleIndex]
    targetStyle.productdesigns.forEach((d: any) =>
    Vue.set(d, 'design_show', 0)
    )
    const designIndex = targetStyle.productdesigns.findIndex(
    (d: any) => d.id === selectedDesign.id
    )
    if (designIndex === -1) return
    Vue.set(targetStyle.productdesigns[designIndex], 'design_show', 1)
    this.$store.dispatch('setSelectedProductDesignID', selectedDesign.id)
    await this.$nextTick()

  }

  public onThreeSceneLoaded(payload: {product_id?: number, design_id?: number|null}) {
    // clear per-component loader only when the loaded scene matches our selected product/design
    try {
      const currentSelectedDesign = this.$store.getters.getSelectedDesignId
      const currentProductId = this.selected_product_id
      if ((payload.design_id && currentSelectedDesign && payload.design_id == currentSelectedDesign) || (payload.product_id && payload.product_id == currentProductId)) {
        this.$store.commit('SET_START_LOAD_DESIGNS', false)
      }
    } catch (e) {
      // ignore
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

public handleAllTabClick() {
  const isAllMode = this.$store.getters.getDesignBrowseMode === 'ALL'
  if(isAllMode) {
    this.$store.commit('CHANGE_DESIGN_BROWSE_MODE', 'ALL')
  }
  this.loadDesignsByStyleIndex()
}
public handleCategoryChange(tab_index: number) {
  if(this.styleIndex < 0) return
  if (this.$store.getters.getDesignBrowseMode === 'ALL') return

  const currentCategory =
    this.selectedProduct.productstyles[this.styleIndex]?.design_categories?.[tab_index]

  this.currentCategoryIndex = tab_index

  this.filteredDesigns = currentCategory ?
    this.selectedProduct.productstyles[this.styleIndex].productdesigns.filter(
      (design: any) =>
        design.front_design.design_categories_pivot.some(
          (pivot: any) => pivot.design_category_id === currentCategory.id
        )
    ) : []


  this.filteredDesigns.forEach(d => {
    Vue.set(d, 'design_show_on_scroll', 0)
  })
  this.first_load = true
  this.$nextTick(() => {
    requestAnimationFrame(() => {
      this.setupObserver()
    })
  })
}
public loadDesignsByStyleIndex() {
  if(this.styleIndex < 0) return
  if (!this.selectedProduct?.productstyles?.length) return
   const isAllMode = this.$store.getters.getDesignBrowseMode === 'ALL'
  if (isAllMode) {
       this.filteredDesigns = this.getAllGroupedDesigns()

    // 🔥 IMPORTANT: reset lazy flags
    this.filteredDesigns.forEach(d => {
      Vue.set(d, 'design_show_on_scroll', 0)
    })

    // ❳ attach observer AFTER DOM is painted
    this.$nextTick(() => {
      requestAnimationFrame(() => {
        this.setupObserver()
      })
    })
  } else {
    this.filteredDesigns =
      this.selectedProduct.productstyles[this.styleIndex].productdesigns


    this.filteredDesigns.forEach(d => {
      Vue.set(d, 'design_show_on_scroll', 0)
    })

    this.$nextTick(() => {
      requestAnimationFrame(() => {
        this.setupObserver()
      })
    })
  }
}


public getAllGroupedDesigns(): Array<any> {
  if (!this.selectedProduct || !this.selectedProduct.productstyles) return []

  const map: Record<string, any[]> = {}

  this.selectedProduct.productstyles.forEach((style: any, styleIndex: number) => {
    style.productdesigns.forEach((design: any) => {
      const key = design.design_name?.toLowerCase() || 'unknown'

      if (!map[key]) map[key] = []

      map[key].push({
        ...design,
        _styleIndex: styleIndex
      })
    })
  })

  const result: any[] = []

  Object.keys(map).forEach((key) => {
    const sorted = map[key].sort((a, b) => a._styleIndex - b._styleIndex)
    result.push(...sorted)
  })

  return result
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
