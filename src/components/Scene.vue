<template>
  <div class="loading-holder">
    <div class="loader" v-if="showLoader"><img src="@assets/images/loading.gif" /></div>
    <div class="canvas-area-holder" :class="{ 'fix-space': !mobileScreen }"
      style="display: flex; justify-content: space-between;">
      <a @click="setShowSmall('back')" class="scene-container" :class="{ 'show-small': showSmall.front }">
        <canvas ref="front" id="scene-front" class="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
        <div class="d-flex gap-2 align-items-center justify-content-center position-relative">
          <a v-if="sku_information.image_url && mainPreview" class="btn btn-secondary fs-2 btn-sm main_size_guide_btn"
             title="Size Guide"
             :href="`${storage_url}${sku_information.image_url}`"
             target="_blank"
          >
            <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet">
              <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                 fill="currentColor" stroke="none">
                <path d="M3855 5101 c-26 -16 -1647 -1637 -3328 -3326 -459 -462 -527 -534 -527 -560 0 -26 75 -105 593 -622 519 -519 596 -593 622 -593 26 0 255 225
              1967 1938 1713 1712 1938 1941 1938 1967 0 26 -74 103 -593 622 -466 467 -597 593 -617 593 -14 0 -38 -9 -55 -19z m565 -686 l515 -515 -327 -327 -328 -328
              -368 368 c-326 325 -371 367 -399 367 -40 0 -71 -27 -79 -68 -7 -33 -1 -39 365 -405 l371 -372 -230 -230 -230 -230 -223 223 c-209 208 -225 222 -259 222
              -28 0 -42 -7 -57 -26 -43 -54 -38 -61 204 -304 l225 -225 -232 -232 -233 -233 -365 365 c-337 336 -369 365 -400 365 -44 0 -80 -33 -80 -74 0 -27 44 -75 367
              -398 l368 -368 -227 -227 -228 -228 -223 223 c-199 198 -227 222 -255 222 -41 0 -82 -38 -82 -77 0 -22 40 -68 220 -248 121 -121 220 -225 220 -230 0 -6
              -101 -111 -225 -235 l-225 -225 -362 362 c-200 198 -373 364 -386 368 -47 14 -102 -30 -102 -83 0 -9 164 -181 365 -382 201 -201 365 -370 365 -375 0 -6
              -149 -159 -330 -340 l-330 -330 -518 518 -517 517 1855 1855 c1020 1020 1857 1855 1860 1855 3 0 237 -232 520 -515z"/>
              </g>
            </svg>

            <span class="ml-1" style="font-size: smaller"><template v-if="!mobileScreen">Size </template>Guide</span>
          </a>

          <h2>Front</h2>
          <div v-if="mainPreview" style="margin-top: 20px" class="d-flex align-items-center gap-1" :class="{'zooming-controls': mobileScreen}">
            <a class="zoom_in_out" @click="zoomInOut('front', 'in')">
              <b-icon-zoom-in />
            </a>
            <a class="zoom_in_out" @click="zoomInOut('front', 'out')">
              <b-icon-zoom-out />
            </a>
          </div>
        </div>
      </a>

      <a @click="setShowSmall('front')" class="scene-container" :class="{ 'show-small': showSmall.back }" v-if="back">
        <canvas v-if="back" ref="back" id="scene-back" class="canvas" :width="canvasWidth"
          :height="canvasHeight"></canvas>
        <div class="d-flex gap-2 align-items-center justify-content-center position-relative">
          <a v-if="sku_information.image_url && mainPreview && mobileScreen" class="btn btn-secondary fs-2 btn-sm main_size_guide_btn"
             title="Size Guide"
             :href="`${storage_url}${sku_information.image_url}`"
             target="_blank"
          >
            <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512.000000 512.000000" preserveAspectRatio="xMidYMid meet">
              <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                 fill="currentColor" stroke="none">
                <path d="M3855 5101 c-26 -16 -1647 -1637 -3328 -3326 -459 -462 -527 -534 -527 -560 0 -26 75 -105 593 -622 519 -519 596 -593 622 -593 26 0 255 225
              1967 1938 1713 1712 1938 1941 1938 1967 0 26 -74 103 -593 622 -466 467 -597 593 -617 593 -14 0 -38 -9 -55 -19z m565 -686 l515 -515 -327 -327 -328 -328
              -368 368 c-326 325 -371 367 -399 367 -40 0 -71 -27 -79 -68 -7 -33 -1 -39 365 -405 l371 -372 -230 -230 -230 -230 -223 223 c-209 208 -225 222 -259 222
              -28 0 -42 -7 -57 -26 -43 -54 -38 -61 204 -304 l225 -225 -232 -232 -233 -233 -365 365 c-337 336 -369 365 -400 365 -44 0 -80 -33 -80 -74 0 -27 44 -75 367
              -398 l368 -368 -227 -227 -228 -228 -223 223 c-199 198 -227 222 -255 222 -41 0 -82 -38 -82 -77 0 -22 40 -68 220 -248 121 -121 220 -225 220 -230 0 -6
              -101 -111 -225 -235 l-225 -225 -362 362 c-200 198 -373 364 -386 368 -47 14 -102 -30 -102 -83 0 -9 164 -181 365 -382 201 -201 365 -370 365 -375 0 -6
              -149 -159 -330 -340 l-330 -330 -518 518 -517 517 1855 1855 c1020 1020 1857 1855 1860 1855 3 0 237 -232 520 -515z"/>
              </g>
            </svg>

            <span class="ml-1" style="font-size: smaller"><template v-if="!mobileScreen">Size </template>Guide</span>
          </a>
          <h2>Back</h2>
          <div style="margin-top: 20px" class="d-flex align-items-center gap-1" :class="{'zooming-controls': mobileScreen}" v-if="mainPreview">
            <a class="zoom_in_out" @click="zoomInOut('back', 'in')">
              <b-icon-zoom-in />
            </a>
            <a class="zoom_in_out" @click="zoomInOut('back', 'out')">
              <b-icon-zoom-out />
            </a>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop, Vue} from 'vue-property-decorator'
import {fabric} from 'fabric'
import {getClosestColor} from '@/pantoneColor'
import rgbHex from 'rgb-hex'
import {
  checkIsEmpty,
  getColorType,
  getDefaultColorsObject,
  getSelectedProductPantones,
  hideLockerProductUpdateButton, santaClone,
  setUndoRedoItems,
  unitConversion,
  selectedDesign, getPermutation
} from '@/helpers/Helpers'
import {find} from "lodash";
import {HideUpdateLockerButton} from '@/mixins/SelectedProductMixin'
import CustomLogosMixin from '@/mixins/CustomLogosMixin'
import hexRgb from "hex-rgb";
import SceneMixin from "@/mixins/SceneMixin";

@Component<Scene>({
  beforeDestroy() {
    const self: Record<any, any> = this;
    self.$eventBus.$off("customTextUpdated", this.addTextsNew)
    if((this.mainPreview && this.mobileScreen) || this.fromRosterModal) {
      self.$eventBus.$off("rosterTextUpdated", this.addTextsNew)
    }
    if(this.mainPreview) {
      self.$eventBus.$off("storeCanvasImage", this.storeCanvasImage)
    }
    if(this.selectedProductId == this.product_id) {
      self.$eventBus.$off("addAddons", this.addAddons)
    }
    self.$eventBus.$off("customTextRemoved", this.deleteExistingTextsFromCanvas)
    self.$eventBus.$off("resetTextsCanvas", this.resetTextsFromCanvas)
    self.$eventBus.$off("handleCustomLogoUpdatedEvent", this.addLogo)
    self.$eventBus.$off("customLogoResetAndAdd", this.resetAndAddLogos)
    self.$eventBus.$off("fixedLogoResetAndAdd", this.resetAndAddFixedLogos)
    self.$eventBus.$off("customLogoRemoved", this.deleteExistingLogoFromCanvas)
    self.$eventBus.$off("resetLogosCanvas", this.resetLogosFromCanvas)
    self.$eventBus.$off("changeDefaultColors", this.changeDefaultColorsEvent)
    self.$eventBus.$off("changeGroupColors", this.changeGroupColorsEvent)
    self.$eventBus.$off("useProductOriginalColors", this.setInitialColors)
    self.$eventBus.$off("changeColors", this.changeColors)
    self.$eventBus.$off("customTextStoreUpdated", this.customTextStoreUpdatedHandler)
    self.$eventBus.$off("customLogoStoreUpdated", this.customLogoStoreUpdatedHandler)
    if (this.front_time) {
      clearTimeout(this.front_time)
    }
    if (this.back_time) {
      clearTimeout(this.back_time)
    }
    if (this.mounted_time) {
      clearTimeout(this.mounted_time)
    }
  },
  async mounted() {
    this.sceneMountedAction()
  }
})

export default class Scene extends Mixins(HideUpdateLockerButton, CustomLogosMixin, SceneMixin) {
  @Prop({ required: true }) readonly front!: Record<string, unknown>;
  @Prop({ required: false }) readonly back!: Record<string, unknown>;
  @Prop({ required: false }) readonly backTextureUrl!: string;
  @Prop({ required: false }) readonly backTextrueExtension !: string;
  @Prop({ required: false }) readonly logos !: [Record<string, any>];
  @Prop({ required: false, default: () => { return [] } }) readonly texts !: [Record<string, any>];
  @Prop({ required: false, default: () => { return [] } }) readonly productNamesSetting !: [Record<any, any>]
  @Prop({ required: false, default: false }) readonly logoAllowed !: boolean
  @Prop({ required: false }) readonly logosLimit !: number
  @Prop({ required: true, default: 10 }) readonly measurementRatio!: number;
  @Prop({ required: false, default: 600 }) readonly mainCanvasWidth!: number;
  @Prop({ required: false, default: 600 }) readonly mainCanvasHeight!: number;
  @Prop({ required: false, default: 600 }) readonly canvasWidth!: number;
  @Prop({ required: false, default: 600 }) readonly canvasHeight!: number;
  @Prop({ required: false, default: true }) readonly canvasSelection!: boolean;
  @Prop({ required: false, default: 'customized' }) readonly productType!: string;
  @Prop({ required: false }) readonly colorGrouping!: Record<any, any>;
  @Prop({ required: true }) readonly products_fonts!: Record<any, any>;
  @Prop({required: false, default: false}) readonly selectedDesign!: boolean;

  private frontCanvas !: fabric.Canvas
  private backCanvas !: fabric.Canvas
  private front_zoom_point: fabric.Point
  private back_zoom_point: fabric.Point
  private last_canvas_pointer: fabric.Point
  private frontDesign !: any
  private backDesign !: any
  private default_view_port: number[]
  private front_safe_zone: fabric.Image[] = []
  private back_safe_zone: fabric.Image[] = []
  private front_boundary: fabric.Image[] = []
  private back_boundary: fabric.Image[] = []
  private addon_objects: fabric.Group[][] = []
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  private custom_logo_objects: any[] = []
  private fixed_logo_objects: any[] = []
  private mounted = false
  private front_models: fabric.Image[]= []
  private back_models: fabric.Image[] = []
  private showSmall = { front: false, back: this.mobileScreen }
  private svgGroups: any[] = []
  private initialSvgGroups: any[] = []
  public dimTextFront = new fabric.Text('', {
    fontSize: 20,
    backgroundColor: '#fff',
    hasControls: false,
    selectable: false,
    evented: false,
    originX: 'center',
    originY: 'center',
    lockMovementX: true,
    lockMovementY: true,
    visible: false,
    fontFamily: 'Ubuntu'
  })
  public dimTextBack!: fabric.Text
  public fabric_control_visibility = { tl: false, bl: false, tr: true, br: true, ml: false, mb: false, mr: false, mt: false, mtr: false }
  public showLoader = true
  public other_side_logos: any[] = []
  public other_side_fixed_logos: any[] = []
  public otherSideTexts: any[] = []
  public ctx: any = {}
  public verticalLines: Record<any, any>[] = []
  public horizontalLines: Record<any, any>[] = []
  public aligningLineOffset = 5
  public aligningLineMargin = 4
  public aligningLineWidth = 3
  public aligningLineColor = 'rgb(110, 243, 204)'
  public viewportTransform: any
  public drawLines = false
  public is_front_dragging = false
  public is_back_dragging = false
  public product_custom_texts: Record<any, any>[] = []
  public product_custom_text_objects: Record<any, any>[][] = []
  private storage_url = process.env.VUE_APP_STORAGE_URL
  private front_time
  private back_time
  private mounted_time

  get initializingProductData() {
    return this.$store.getters.getInitializingProductData
  }
  get fillColors(): [Record<any, any>] {
    return this.$store.getters.getDefaultFilledColors
  }

  get getColorType() : string {
    return this.$store.getters.getSetting('color_type');
  }

  get custom_logos(): [Record<any, any>] {
    let product_id = this.product_id ? this.product_id : this.selectedProductId
    return this.$store.getters.getCustomLogos(product_id)
  }

  get groupColors(): [Record<any, any>] {
    return this.$store.getters.getGroupColors
  }

  get styleIndex():number{
    return this.$store.getters.getCurrentStyleIndex;
  }

  get productCustomTexts(): Record<any, any>[] {
    return this.$store.getters.productCustomTexts(this.product_id)
  }

  get sku_information(){
    return this.$store.getters.getSkuInformation
  }

  public storeCanvasImage() {
    this.$store.commit('STORE_CANVAS_IMAGE', {
      front: this.$refs.front,
      back: this.$refs.back,
      scene: this
    })
  }

  public sceneMountedAction() {
    if(!this.initializingProductData && !this.mounted) {
      if (this.mounted_time) {
        clearTimeout(this.mounted_time)
      }
      if (this.back) {
        this.dimTextBack = new fabric.Text('', {
          fontSize: 20,
          backgroundColor: '#fff',
          hasControls: false,
          selectable: false,
          evented: false,
          originX: 'center',
          originY: 'center',
          lockMovementX: true,
          lockMovementY: true,
          visible: false,
          fontFamily: 'Ubuntu'
        })
      }
      let frontPromise = this.loadScene(this.front, 'front')
      frontPromise.then(() => {
        if (this.back) {
          this.loadScene(this.back, 'back')
          this.renderControls()
        }
      })
    } else if(!this.mounted) {
      this.mounted_time = setTimeout(() => {
        this.sceneMountedAction()
      }, 500)
    }
  }

  public eventAction(item: Record<any, any>, object: Record<any, any>, otherSideObject: Record<any, any>) {
    object.center()
    object.set({
      left: this.canvasWidth / this.mainCanvasWidth * item.x_axis,
      top: this.canvasHeight / this.mainCanvasHeight * item.y_axis
    })
    object.rotate(item.rotation as number)
    let multiplyBy = object.text? 1 : this.canvasWidth / this.mainCanvasWidth
    object.scaleX = item.scaleX * multiplyBy
    object.scaleY = item.scaleY * multiplyBy

    if (otherSideObject) {
      const left = otherSideObject.left
      const top = otherSideObject.top
      otherSideObject.center()
      otherSideObject.set({
        left: left,
        top: top
      })
      otherSideObject.scaleX = item.scaleX * multiplyBy
      otherSideObject.scaleY = item.scaleY * multiplyBy
      otherSideObject.rotate(-item.rotation as number)
    }

    object.setCoords()

    this.applyClipPath(object as fabric.Image|fabric.Group, object.side)
    this.frontCanvasRender()
  }

  public getSvgGroupColors(svg_group: string) {
    if(svg_group && this.product?.svg_group_color_container && this.product.svg_group_color_container[svg_group]) {
      return this.product.svg_group_color_container[svg_group]
    }
    return this.productColors[0]
  }

  public async changeColors() {
    if(this.mounted) {
      await this.callChangeColors()
    }
  }

  public async callChangeColors() {
    await this.changeDefaultColors()
    await this.changeGroupColors()
  }

  public changeGroupColorsEvent() {
    let render_time = 0
    if(!this.mainPreview) {
      render_time = this.getRandom()
    }
    this.changeGroupColors(render_time)
  }

  public async changeGroupColors(render_time = 300) {
    if(this.productType == 'customized') {
      if (Object.keys(this.appliedGroupColors).length) {
        let defaultColors = this.defaultColors.filter((color: Record<any, any>) => color.color) as [Record<any, any>]
        let groupColors = this.appliedGroupColors

        this.svgGroups.forEach((svgGroup: Record<any, any>, svgIndex: number) => {
          if (groupColors[svgGroup.id]) {
            if (svgGroup.gradient_colors) {
              if(groupColors[svgGroup.id].gradient_colors) {
                groupColors[svgGroup.id].gradient_colors.forEach((gradient_color, gradient_color_index) => {
                  const final_color = this.getGroupColorBySvgGroup(svgGroup.id as string, gradient_color_index)
                  svgGroup.gradient_colors[gradient_color_index].color = final_color.color
                  svgGroup.gradient_colors[gradient_color_index].pantone = final_color.pantone
                  svgGroup.gradient_colors[gradient_color_index].name = final_color.name
                })
              } else { // here we are changing color for first gradient if other product same group change color without gradient
                if (svgGroup.gradient_colors[0]) {
                  const final_color = this.getGroupColorBySvgGroup(svgGroup.id as string)
                  svgGroup.gradient_colors[0].color = final_color.color
                  svgGroup.gradient_colors[0].pantone = final_color.pantone
                  svgGroup.gradient_colors[0].name = final_color.name
                }
              }
            } else {
              const final_color = this.getGroupColorBySvgGroup(svgGroup.id as string, groupColors[svgGroup.id].gradient_colors? 0 : null)
              svgGroup.color = final_color.color
              svgGroup.name = final_color.name
              svgGroup.pantone = final_color.pantone
            }
            if (this.mainPreview) {
              this.$store.dispatch('updateSvgGroups', {
                index: svgIndex,
                ...svgGroup
              })
            }
          } else if (!defaultColors.length) {
            if (this.initialSvgGroups[svgIndex]) {
              Object.assign(this.svgGroups[svgIndex], this.initialSvgGroups[svgIndex])

              if (this.mainPreview) {
                this.$store.dispatch('updateSvgGroups', {
                  index: svgIndex,
                  ...svgGroup
                })
              }
            }
          }
        })

        this.logos.forEach((logo, index) => {
          if(logo.is_customizable) {
            if(groupColors[`${logo.placement_title}`]) {
              this.changeFixedLogoColor(index, groupColors[`${logo.placement_title}`].color)
            }
          }
        })

        if(this.addon_objects.length) {
          this.addon_objects.forEach((addon_objects_by_placement: Record<any, any>[]) => {
            addon_objects_by_placement.forEach((addon_object) => {
              addon_object._objects.forEach((item: Record<any, any>) => {
                if (item.id && item.fill) {
                  item.id = item.id.toLowerCase()
                  if (groupColors[item.id]) {
                    if (item.fill.gradientUnits) {
                      item.fill.colorStops.forEach((gradient: Record<any, any>, gradient_index: number) => {
                        const final_color = this.getGroupColorBySvgGroup(item.id as string, gradient_index)
                        gradient.color = final_color.color
                      })
                      item.set('fill', new fabric.Gradient(item.fill));
                    } else {
                      const final_color = this.getGroupColorBySvgGroup(item.id as string)
                      item.set('fill', final_color.color)
                    }
                  } else {
                    if(this.initialSvgGroups[item.id]) {
                      if (item.fill.gradientUnits) {
                        item.fill.colorStops.forEach((gradient: Record<any, any>, gradient_index: number) => {
                          if (this.initialSvgGroups[item.id][gradient_index]) {
                            gradient.color = this.initialSvgGroups[item.id][gradient_index].color
                          }
                        })
                        item.set('fill', new fabric.Gradient(item.fill));
                      } else {
                        item.set('fill', this.initialSvgGroups[item.id].color)
                      }
                    }
                  }
                }
              })
            })
          })
        }

        let designs: any = []
        designs.push(this.frontDesign._objects ? this.frontDesign._objects : [this.frontDesign])
        if(this.back) {
          designs.push(this.backDesign._objects ? this.backDesign._objects : [this.backDesign])
        }

        designs.forEach((design) => {
          design.forEach((item: Record<any, any>) => {
            if(item.id) {
              item.id = item.id.toLowerCase()
              if (groupColors[item.id]) {
                if (item.fill && item.fill.gradientUnits) {
                  if(groupColors[item.id].gradient_colors) {
                    groupColors[item.id].gradient_colors.forEach((gradient_color, gradient_color_index) => {
                      if (item.fill.colorStops[gradient_color_index]) {
                        const final_color = this.getGroupColorBySvgGroup(item.id as string, gradient_color_index)
                        item.fill.colorStops[gradient_color_index].color = final_color.color
                      }
                    })
                  } else {
                    if (item.fill.colorStops[0]) {
                      const final_color = this.getGroupColorBySvgGroup(item.id as string)
                      item.fill.colorStops[0].color = final_color.color
                    }
                  }
                  item.set('fill', new fabric.Gradient(item.fill))
                } else {
                  const final_color = this.getGroupColorBySvgGroup(item.id as string, groupColors[item.id].gradient_colors? 0 : null)
                  item.set('fill', final_color.color)
                }
              } else if (!defaultColors.length) {
                this.svgGroups.forEach((svgGroup: Record<any, any>, svgIndex: number) => {
                  if (svgGroup.id == item.id) {
                    if (item.fill && item.fill.gradientUnits) {
                      item.fill.colorStops.forEach((gradient: Record<any, any>, gradient_index: number) => {
                        if (this.initialSvgGroups[svgIndex][gradient_index]) {
                          gradient.color = this.initialSvgGroups[svgIndex][gradient_index].color
                        }
                      })
                      item.set('fill', new fabric.Gradient(item.fill));
                    } else {
                      item.set('fill', this.initialSvgGroups[svgIndex].color)
                    }
                  }
                })
              }
            }
          })
        })

        if(this.colorGrouping) {
          this.unHideColorGrouping(render_time)
        } else {
          if(this.back) {
            this.backCanvasRender(render_time)
          }
          this.frontCanvasRender(render_time)
        }
      }
    }
  }

  public changeFixedLogoColor(logo_index: number, color: string, default_colors: Record<any, any> = {}) {
    this.fixed_logo_objects.forEach((fixed_logo_object) => {
      if(fixed_logo_object.fixed_logo_index == logo_index){
        const logo_objects = fixed_logo_object._objects ? fixed_logo_object._objects : [fixed_logo_object]
        logo_objects.forEach((item) => {
          item.set({ fill: color });
        })

        this.svgGroups.forEach((svgGroup: Record<any, any>, svgIndex: number) => {
          if (svgGroup.id == `${this.logos[logo_index].placement_title}`) {
            let final_color;
            if(Object.entries(default_colors).length) {
              final_color = this.getDefaultColorBySvgGroup(`${this.logos[logo_index].placement_title}`, default_colors)
            } else {
              final_color = this.getGroupColorBySvgGroup(`${this.logos[logo_index].placement_title}` as string, null)
            }
            svgGroup.color = final_color.color
            svgGroup.name = final_color.name
            svgGroup.pantone = final_color.pantone

            if (this.mainPreview) {
              this.$store.dispatch('updateSvgGroups', {
                index: svgIndex,
                ...svgGroup
              })
            }
          }
        })
      }
    })
  }

  public areColorsEqual(defaultColors, logoColors, property = 'color') {
    const sortedDefaultColors = JSON.stringify(defaultColors.slice().sort((a, b) => (a[property] > b[property] ? 1 : -1)))
    const sortedLogoColors = JSON.stringify(logoColors.slice().sort((a, b) => (a[property] > b[property] ? 1 : -1)))

    return sortedDefaultColors === sortedLogoColors;
  }

  public setLockedDesign() {
    this.$store.commit('SET_LOCKED_DESIGN', {
      design_id: this.design_id, default_color: santaClone(this.appliedDefaultColors), group_color: santaClone(this.appliedGroupColors)
    })
  }

  public async changeDefaultColors(render_time = 300): Promise<void> {
    if(this.productType == 'customized') {
      let defaultColors = this.appliedDefaultColors
      if (defaultColors.length) {
        let appliedDefaultColors: any = [];
        let useColorIndex = 0
        const sequences = getPermutation(this.shuffle_color_number, this.parts.length)
        sequences.forEach((sequence: number) => {
          const svg_part = this.parts[sequence]
          if(svg_part) {
            const [part, index] = svg_part.split('_')
            const gradient_color_index = parseInt(index) - 1 as number
            const svgIndex = this.svgGroups.findIndex(group => group.id === part)
            if(svgIndex !== -1) {
              const svgGroup = this.svgGroups[svgIndex]
              if(this.product.svg_group_color_container && this.product.svg_group_color_container[svgGroup.id]) {
                const product_part_colors = this.product.svg_group_color_container[svgGroup.id].json_data
                useColorIndex = this.findClosestColor(product_part_colors, defaultColors)
              }
              let final_color;
              if(svgGroup.gradient_colors) {
                final_color = this.getDefaultColorBySvgGroup(svgGroup.id, defaultColors[useColorIndex])
                svgGroup.gradient_colors[gradient_color_index].color = final_color.color
                svgGroup.gradient_colors[gradient_color_index].pantone = final_color.pantone
                svgGroup.gradient_colors[gradient_color_index].name = final_color.name
                if (Array.isArray(appliedDefaultColors[svgGroup.id])) {
                  appliedDefaultColors[part].push(final_color.color);
                } else {
                  appliedDefaultColors[part] = [final_color.color];
                }
              } else {
                final_color = this.getDefaultColorBySvgGroup(svgGroup.id, defaultColors[useColorIndex])
                appliedDefaultColors[part] = final_color.color
                svgGroup.color = final_color.color
                svgGroup.pantone = final_color.pantone
                svgGroup.name = final_color.name
              }
              if (this.mainPreview) {
                this.$store.dispatch('updateSvgGroups', {
                  index: svgIndex,
                  ...svgGroup
                })
              }
            }
            useColorIndex++
            if (useColorIndex >= defaultColors.length) {
              useColorIndex = 0
            }
          }
        })

        let design = this.frontDesign._objects ? this.frontDesign._objects : [this.frontDesign]
        design.forEach((item: Record<any, any>) => {
          if(item.id) {
            item.id = item.id.toLowerCase()
            if (appliedDefaultColors[item.id] && item.fill && item.fill.gradientUnits) {
              item.fill.colorStops.forEach((gradient: Record<any, any>, gradient_index: number) => {
                gradient.color = appliedDefaultColors[item.id][gradient_index]
              })
              item.set('fill', new fabric.Gradient(item.fill));
            } else if (appliedDefaultColors[item.id]) {
              item.set('fill', appliedDefaultColors[item.id])
            }
          }
        })

        if(this.addon_objects.length) {
          this.addon_objects.forEach((addon_objects_by_placement: Record<any, any>[]) => {
            addon_objects_by_placement.forEach((addon_object) => {
              addon_object._objects.forEach((item: Record<any, any>) => {
                if (item.id) {
                  item.id = item.id.toLowerCase()
                  if (appliedDefaultColors[item.id] && item.fill && item.fill.gradientUnits) {
                    item.fill.colorStops.forEach((gradient: Record<any, any>, gradient_index: number) => {
                      gradient.color = appliedDefaultColors[item.id][gradient_index]
                    })
                    item.set('fill', new fabric.Gradient(item.fill));
                  } else if (appliedDefaultColors[item.id]) {
                    item.set('fill', appliedDefaultColors[item.id])
                  }
                }
              })
            })
          })
        }

        this.logos.forEach((logo, index) => {
          if(logo.is_customizable) {
            if (appliedDefaultColors[`${logo.placement_title}`]) {
              useColorIndex++
              if (useColorIndex >= defaultColors.length) {
                useColorIndex = 0
              }
              this.changeFixedLogoColor(index, appliedDefaultColors[`${logo.placement_title}`], defaultColors[useColorIndex])
            }
          }
        })


        if (this.back) {
          design = this.backDesign._objects ? this.backDesign._objects : [this.backDesign]
          design.forEach((item: Record<any, any>) => {
            if(item.id) {
              item.id = item.id.toLowerCase()
              if (appliedDefaultColors[item.id] && item.fill && item.fill.gradientUnits) {
                item.fill.colorStops.forEach((gradient: Record<any, any>, gradient_index: number) => {
                  gradient.color = appliedDefaultColors[item.id][gradient_index]
                })
                item.set('fill', new fabric.Gradient(item.fill));
              } else if (appliedDefaultColors[item.id]) {
                item.set('fill', appliedDefaultColors[item.id])
              }
            }
          })
        }
        if(this.colorGrouping) {
          this.unHideColorGrouping(render_time)
        } else {
          if(this.back) {
            this.backCanvasRender(render_time)
          }
          this.frontCanvasRender(render_time)
        }
      }
    }
  }

  public findClosestColor(product_part_colors, defaultColors) {
    let group_color_index
    let least_color_difference = 765 // the color difference can not be exceeded more the 255 + 255 + 255 = 765
    const defaultColorsRGB = defaultColors.map((color: Record<any, any>) => hexRgb(color.color))
    const productPartColorsRGB = product_part_colors.map((color: Record<any, any>) => hexRgb(color.value))
    defaultColorsRGB.forEach((default_color, default_color_index) => {
      productPartColorsRGB.forEach((product_part_color) => {
        // Calculate the Euclidean distance
        const diff = Math.sqrt(
          Math.pow(default_color.red - product_part_color.red, 2) +
          Math.pow(default_color.green - product_part_color.green, 2) +
          Math.pow(default_color.blue - product_part_color.blue, 2)
        );
        if(diff < least_color_difference) {
          least_color_difference = diff
          group_color_index = default_color_index
        }
      })
    })

    return group_color_index;
  }

  public frontCanvasRender(render_time = 300) :void {
    if (this.front_time) clearTimeout(this.front_time);
    this.front_time = setTimeout(() => {
      this.frontCanvas.requestRenderAll()

      if((this.mainPreview && !this.back) || this.mobileScreen) {
        this.$store.commit('SET_START_LOAD_DESIGNS', true)
        this.$store.commit('SET_START_LOAD_PRODUCTS', true)
      }
    }, render_time);
  }

  public backCanvasRender(render_time = 300) :void {
    if (this.back_time) clearTimeout(this.back_time)

    this.back_time = setTimeout(() => {
      this.backCanvas.requestRenderAll()

      if(this.mainPreview || this.mobileScreen) {
        this.$store.commit('SET_START_LOAD_DESIGNS', true)
        this.$store.commit('SET_START_LOAD_PRODUCTS', true)
      }
    }, render_time);
  }

  public setInitialColors(): void {
    let defaultSvgGroups: Record<any, any> = {}
    this.initialSvgGroups.forEach((svgGroup: Record<any, any>, index: number) => {
      defaultSvgGroups[svgGroup.id] = svgGroup
    })

    let appliedDefaultColors: string[]|string[][] = []
    this.svgGroups.forEach((svgGroup: Record<any, any>, index: number) => {
      if(Object.keys(defaultSvgGroups).length && defaultSvgGroups[svgGroup.id]) {
        if(svgGroup.gradient_colors) {
          let gradient_colors: string[] = []
          svgGroup.gradient_colors.forEach((gradient_color, gradient_color_index) => {
            gradient_colors.push(defaultSvgGroups[svgGroup.id].gradient_colors[gradient_color_index].color)
            gradient_color.color = defaultSvgGroups[svgGroup.id].gradient_colors[gradient_color_index].color
            gradient_color.pantone = defaultSvgGroups[svgGroup.id].gradient_colors[gradient_color_index].pantone
            gradient_color.name = defaultSvgGroups[svgGroup.id].gradient_colors[gradient_color_index].name
          })
          appliedDefaultColors[svgGroup.id] = gradient_colors
        } else {
          appliedDefaultColors[svgGroup.id] = defaultSvgGroups[svgGroup.id].color
          svgGroup.color = defaultSvgGroups[svgGroup.id].color
          svgGroup.pantone = defaultSvgGroups[svgGroup.id].pantone
          svgGroup.name = defaultSvgGroups[svgGroup.id].name
        }
      }
    })

    let design = this.frontDesign._objects? this.frontDesign._objects : [this.frontDesign]
    design.forEach((item: Record<any, any>) => {
      if(item.id) {
        item.id = item.id.toLowerCase()
        if (appliedDefaultColors[item.id] && item.fill && item.fill.gradientUnits) {
          item.fill.colorStops.forEach((gradient: Record<any, any>, gradient_index: number) => {
            gradient.color = appliedDefaultColors[item.id][gradient_index]
          })
          item.set('fill', new fabric.Gradient(item.fill));
        } else if (appliedDefaultColors[item.id]) {
          item.set('fill', appliedDefaultColors[item.id])
        }
      }
    })
    let render_time = 0
    if(!this.mainPreview) {
      render_time = this.getRandom()
    }
    this.frontCanvasRender(render_time)

    if (this.back) {
      design = this.backDesign._objects? this.backDesign._objects : [this.backDesign]
      design.forEach((item: Record<any, any>) => {
        if(item.id) {
          item.id = item.id.toLowerCase()
          if (appliedDefaultColors[item.id] && item.fill && item.fill.gradientUnits) {
            item.fill.colorStops.forEach((gradient: Record<any, any>, gradient_index: number) => {
              gradient.color = appliedDefaultColors[item.id][gradient_index]
            })
            item.set('fill', new fabric.Gradient(item.fill));
          } else if (appliedDefaultColors[item.id]) {
            item.set('fill', appliedDefaultColors[item.id])
          }
        }
      })
      this.backCanvasRender(render_time)
    }

    this.resetAndAddFixedLogos()
  }

  public async unHideColorGrouping(render_time = 300) {
    if (this.colorGrouping) {
      for (let key in this.colorGrouping) {
        const distinguishPart = this.svgGroups.filter((svgGroup: Record<any, any>) => { return svgGroup.id == key.toLowerCase() })
        this.colorGrouping[key].forEach((comparePartId: string) => {
          const comparePart = this.svgGroups.filter((svgGroup: Record<any, any>) => { return svgGroup.id == comparePartId.toLowerCase() })
          if (distinguishPart.length && comparePart.length && distinguishPart[0].color == comparePart[0].color) {
            let changeColor: Record<any, any> = {}
            for (let index in this.productColors) {
              let colors = this.productColors[index].json_data
              for (let i in colors) {
                if (colors[i].value != comparePart[0].color) {
                  changeColor = colors[i]
                  break
                }
              }
              if (Object.keys(changeColor).length) {
                break
              }
            }
            if (!Object.keys(changeColor).length) {
              let pantone_product_id = 0;
              if(this.product_id){
                pantone_product_id = this.product_id;
              }
              const selectProductPantonesList = getSelectedProductPantones(pantone_product_id)
              const closestColor = getClosestColor('#000000', selectProductPantonesList, getColorType(key, this.product_id));
              changeColor = { value: closestColor.hex, name: closestColor.name, pantone: closestColor.pantone }
            }
            let design = this.frontDesign._objects? this.frontDesign._objects : [this.frontDesign]
            design.forEach((item: Record<any, any>) => {
              item.id = item.id.toLowerCase()
              if (key.toLowerCase() == item.id) {
                item.set('fill', changeColor.value);
              }
            })
            if (this.back) {
              design = this.backDesign._objects? this.backDesign._objects : [this.backDesign]
              design.forEach((item: Record<any, any>) => {
                item.id = item.id.toLowerCase()
                if (key.toLowerCase() == item.id) {
                  item.set('fill', changeColor.value);
                }
              })
            }

            this.svgGroups.forEach((svgGroup: Record<any, any>, svgIndex: number) => {
              if (svgGroup.id == key.toLowerCase()) {
                svgGroup.color = changeColor.value
                svgGroup.name = changeColor.name
                svgGroup.pantone = changeColor.pantone

                if (this.mainPreview) {
                  this.$store.dispatch('updateSvgGroups', {
                    index: svgIndex,
                    ...svgGroup
                  })
                }
              }
            })
          }
        })
      }
      this.frontCanvasRender(render_time)
      if(this.back) {
        this.backCanvasRender(render_time)
      }
    }
  }

  public async getSvgGroups() {
    this.svgGroups = []
    this.initialSvgGroups = []
    let design = this.frontDesign._objects? this.frontDesign._objects : [this.frontDesign]
    design.forEach((item: Record<any, any>) => {
      if(item.id) {
        item.id = item.id.toLowerCase()
        if (!item.id.includes('noncustomizable') && !item.id.includes('inside') && !this.containsObject({id: item.id})) {
          let count = 1
          if (item.id == 'base') {
            count = 100000 // to make base always at first color position
          }
          const selectProductPantonesList = getSelectedProductPantones(this.product_id, item.id)
          if (item.fill && item.fill.gradientUnits) {
            let gradient_colors: Record<any, any>[] = []
            item.fill.colorStops.forEach((color_stop: Record<any, any>) => {
              if (color_stop.color.includes('rgb')) {
                color_stop.color = rgbHex(color_stop.color).includes('#') ? rgbHex(color_stop.color) : '#' + rgbHex(color_stop.color);
              }
              let pantoneColor: Record<any, any> = {pantone: '', name: ''}
              if (this.mainPreview) {
                pantoneColor = getClosestColor(color_stop.color, selectProductPantonesList, getColorType(item.id, this.product_id))
              }
              gradient_colors.push({color: color_stop.color, pantone: pantoneColor.pantone, name: pantoneColor.name})
            })

            this.svgGroups.push({id: item.id, count: count, gradient_colors: gradient_colors})
          } else if(item.fill) {
            if (item.fill.includes('rgb')) {
              item.fill = rgbHex(item.fill as string).includes('#') ? rgbHex(item.fill as string) : '#' + rgbHex(item.fill as string)
            }
            let pantoneColor: Record<any, any> = {pantone: '', name: ''}
            if (this.mainPreview) {
              pantoneColor = getClosestColor(item.fill as string, selectProductPantonesList, getColorType(item.id, this.product_id))
            }

            this.svgGroups.push({
              id: item.id,
              color: item.fill,
              count: count,
              pantone: pantoneColor.pantone,
              name: pantoneColor.name
            })
          }
        }
      }
    })

    if (this.backDesign) {
      design = this.backDesign._objects? this.backDesign._objects : [this.backDesign]
      design.forEach((item: Record<any, any>) => {
        if(item.id) {
          item.id = item.id.toLowerCase()
          if (!item.id.includes('noncustomizable') && !item.id.includes('inside') && !this.containsObject({id: item.id})) {
            let count = 1
            if (item.id == 'base') {
              count = 100000 // to make base always at first color position
            }
            const selectProductPantonesList = getSelectedProductPantones(this.product_id, item.id)
            if (item.fill && item.fill.gradientUnits) {
              let gradient_colors: Record<any, any>[] = []
              item.fill.colorStops.forEach((color_stop: Record<any, any>) => {
                if (color_stop.color.includes('rgb')) {
                  color_stop.color = rgbHex(color_stop.color).includes('#') ? rgbHex(color_stop.color) : '#' + rgbHex(color_stop.color);
                }
                let pantoneColor: Record<any, any> = {pantone: '', name: ''}
                if (this.mainPreview) {
                  pantoneColor = getClosestColor(color_stop.color, selectProductPantonesList, getColorType(item.id, this.product_id))
                }
                gradient_colors.push({
                  color: color_stop.color,
                  pantone: pantoneColor.pantone,
                  name: pantoneColor.name
                })
              })

              this.svgGroups.push({id: item.id, count: count, gradient_colors: gradient_colors})
            } else {
              if (item.fill.includes('rgb')) {
                item.fill = rgbHex(item.fill as string).includes('#') ? rgbHex(item.fill as string) : '#' + rgbHex(item.fill as string);
              }
              let pantoneColor: Record<any, any> = {pantone: '', name: ''}
              if (this.mainPreview) {
                pantoneColor = getClosestColor(item.fill as string, selectProductPantonesList, getColorType(item.id, this.product_id))
              }

              this.svgGroups.push({
                id: item.id,
                color: item.fill,
                count: count,
                pantone: pantoneColor.pantone,
                name: pantoneColor.name
              })
            }
          }
        }
      })
    }

    this.svgGroups = this.svgGroups.sort((a, b) => (a.count < b.count) ? 1 : -1)
    this.initialSvgGroups = JSON.parse(JSON.stringify(this.svgGroups))

    if (this.mainPreview) {
      await this.$store.dispatch('setSvgGroups', this.svgGroups)
    }

    if(!this.parts) {
      this.parts = this.svgGroups.map(group => group.id)
    }

    if(!this.logos.length) {
      this.callChangeColors()
    }

    this.showLoader = false
  }

  public containsObject(obj: Record<any, any>): boolean {
    for (let i = 0; i < this.svgGroups.length; i++) {
      if (this.svgGroups[i].id == obj.id) {
        return true
      }
    }
    return false
  }

  public loadScene(ImageData: Record<any, any>, side: string) {
    return new Promise((resolve) => {
      this.mounted = false
      let element = this.$refs.front as HTMLCanvasElement
      if (side === 'back') {
        element = this.$refs.back as HTMLCanvasElement
      }
      let canvas = new fabric.Canvas(element, {
        enableRetinaScaling: true
      })
      if (side == 'back') {
        this.backCanvas = canvas
      } else {
        this.frontCanvas = canvas
      }
      // fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center' as string

      (fabric.Image.prototype as Record<any, any>).getBase64 = function() {
        let el = fabric.util.createCanvasElement() as Record<any, any>
        el.width  = this._element.naturalWidth || this._element.width;
        el.height = this._element.naturalHeight || this._element.height;
        el.getContext("2d").drawImage(this._element, 0, 0);
        return el.toDataURL();
      }

      let models: fabric.Image[] = []
      let promises = []
      if (this.productType == 'customized') {
        ImageData.models.forEach((model) => {
          let url = model.thumb_sm_url
          if(this.mainPreview) {
            url = model.file_url
          }
          promises.push(this.addModel(url, model.composition, side) as never)
        })
      }

      promises.push(this.addDesign(ImageData.textureUrl, side, ImageData.file_extension) as never)

      if (this.backTextureUrl && side == 'front') {
        promises.push(this.addDesign(this.storageUrl + this.backTextureUrl, 'back', this.backTextrueExtension) as never)
      }

      const self: Record<any, any> = this

      Promise.all(promises).then(async (values) => {
        let design = this.frontDesign
        models = this.front_models
        if (side == 'back') {
          design = this.backDesign
          models = this.back_models
        }

        canvas.add(design)
        canvas.viewportCenterObject(design)

        if (this.productType == 'customized') {
          models.forEach((model: fabric.Image) => {
            canvas.add(model)
            canvas.viewportCenterObject(model)
          })
        }

        if (side == 'back') {
          canvas.add(self.dimTextBack)
          this.backCanvasRender()
        } else {
          canvas.add(self.dimTextFront)
          this.frontCanvasRender()
        }

        if(side == 'front') {
          this.addBoundary([ImageData.safe_zone_url, ImageData.boundary_url], side)
        }
        if (!this.back || (this.back && side == 'back')) {
          if(this.mainPreview) {
            self.$eventBus.$emit('setTotalTabs')
          }
          if (ImageData.file_extension == 'svg' && this.productType == 'customized') {
            this.getSvgGroups()
          } else {
            this.showLoader = false
          }

          await this.addFixedLogos()

          await this.addAddons(300)

          this.addBoundary([ImageData.safe_zone_url, ImageData.boundary_url], side).then(() => {
            let logos: Record<any, any>[] = []
            if (this.custom_logos && this.logoAllowed) {
              let custom_logos = JSON.parse(JSON.stringify(this.custom_logos))
              if (this.logosLimit) {
                custom_logos = this.custom_logos.slice(0, this.logosLimit) as [Record<any, any>]
              }
              logos = logos.concat(custom_logos) as [Record<any, any>]
            }
            if (logos.length) {
              logos.forEach((logo: Record<any, any>) => {
                if (logo && logo.url) {
                  this.addLogo(logo, true)
                }
              })
            }

            if(this.productCustomTexts) {
              this.productCustomTexts.forEach((custom_text: Record<any, any>, index: number) => {
                if(custom_text.value) {
                  const text = { value: custom_text, custom_text_index: index }
                  this.addTextsNew(text, true)
                }
              })
            }

            if (this.mainPreview && this.selectedProductId == this.product_id) {
              this.setProductionSVG()
              this.storeCanvasImage()
              setTimeout(() => {
                this.$store.commit('SET_CANVAS_READY', true);
              }, 500)
            }
            this.listenEvents()
            this.mounted = true
          })
        }
        resolve('done')
      })
      canvas.renderOnAddRemove = false

      if(this.mainPreview && this.selectedProductId == this.product_id) {
        canvas.on('object:modified', async (e: Record<any, any>) => {
          const fabric_object = e.target;
          if(fabric_object.get("type") == "text") {
            await setUndoRedoItems('customTexts', 'modified')
            this.handleCustomTextModifiedEvent(e.target)
          } else {
            await setUndoRedoItems('customLogos', 'modified')
            this.handleCustomLogoModifiedEvent(e.target)
          }
          let objects = canvas.getObjects('line');
          for (let i in objects) {
            canvas.remove(objects[i]);
          }
          this.drawLines = false
          this.addToOtherSide(e.target, side)
          this.hideLockerProductUpdateButton()
        })

        let ctx = canvas.getSelectionContext()

        canvas.on('mouse:up', (opt) => {
          this.is_back_dragging = false
          this.is_front_dragging = false
          this.verticalLines.length = 0
          this.horizontalLines.length = 0
        })

        canvas.on('mouse:down', (opt) => {
          this.is_back_dragging = false
          this.is_front_dragging = false
          if(opt.target == null) {
            this.last_canvas_pointer = canvas.getPointer(opt.e, false) as fabric.Point
            const pointer = canvas.getPointer(opt.e, false) as fabric.Point
            if(side == 'back') {
              this.back_zoom_point = pointer
              this.is_back_dragging = true
            } else {
              this.front_zoom_point = pointer
              this.is_front_dragging = true
            }
          }
        })

        canvas.on('mouse:move', (opt) => {
          if(this.is_back_dragging || this.is_front_dragging) {
            const e = opt.e as Record<any, any>;
            const pointer = canvas.getPointer(opt.e, false) as fabric.Point
            let movement = new fabric.Point(Math.trunc((this.last_canvas_pointer.x - pointer.x) / -2), Math.trunc((this.last_canvas_pointer.y - pointer.y) / -2))
            this.last_canvas_pointer = pointer

            if(this.is_back_dragging) { // while dragging canvas side change so that's why it put in if else
              let scale_by = -5 / this.backCanvas.getZoom() // scale by this number to move object into same direction where mouse goes
              this.back_zoom_point.x = this.back_zoom_point.x + (movement.x * scale_by) / this.backCanvas.getZoom()
              this.back_zoom_point.y = this.back_zoom_point.y + (movement.y * scale_by) / this.backCanvas.getZoom()
              this.zoomCanvas('back', this.backCanvas.getZoom()) // manage panning with zoom move to point
            } else if(this.is_front_dragging) {
              let scale_by = -5 / this.frontCanvas.getZoom() // scale by this number to move object into same direction where mouse goes
              this.front_zoom_point.x = this.front_zoom_point.x + (movement.x * scale_by) / this.frontCanvas.getZoom()
              this.front_zoom_point.y = this.front_zoom_point.y + (movement.y * scale_by) / this.frontCanvas.getZoom()
              this.zoomCanvas('front', this.frontCanvas.getZoom()) // manage panning with zoom move to point
            }

            e.preventDefault()
            e.stopPropagation()
          }
        })

        canvas.on('before:render', () => {
          if ((canvas as Record<any, any>).contextTop) {
            canvas.clearContext((canvas as Record<any, any>).contextTop);
          }
        });

        canvas.on('after:render', () => {
          for (let i = self.verticalLines.length; i--;) {
            this.drawVerticalLine(self.verticalLines[i], ctx)
          }
          for (let i = self.horizontalLines.length; i--;) {
            this.drawHorizontalLine(self.horizontalLines[i], ctx)
          }
          self.verticalLines.length = self.horizontalLines.length = 0;
        })

        this.default_view_port = canvas.viewportTransform as number[]

        canvas.on('mouse:wheel', (opt) => {
          this.zoomCanvasEvent(opt, canvas, side)
        })

        let vertical_line = new fabric.Line([self.canvasWidth / 2, 0, self.canvasWidth / 2, self.canvasHeight], {
          stroke: '#6EF3CC',
          strokeWidth: 4,
          strokeDashArray: [5, 5],
        })
        let horizontal_line = new fabric.Line([0, (self.canvasHeight / 2), self.canvasWidth, (self.canvasHeight / 2)], {
          stroke: '#6EF3CC',
          strokeWidth: 4,
          strokeDashArray: [5, 5],
        })

        canvas.on('object:moving', (e: Record<any, any>) => {
          let center = this.frontDesign.getCenterPoint()
          if(side == 'back') {
            center = this.backDesign.getCenterPoint()
          }
          const relativeWidth = center.x
          const relativeHeight = center.y
          this.objectScaling(e, side)
          let customObj: Record<any, any> = this.getCustomObjectsLength(canvas)
          if (customObj.logoLength + customObj.textLength >= 1) {
            this.addGuideLine(e, canvas, vertical_line, horizontal_line, relativeWidth, relativeHeight)
            this.addGuideForMultipleObjects(canvas, e.target)
          }
          this.applyClipPath(e.target, side)
        })

        canvas.on('object:scaling', (e: Record<any, any>) => {
          let dimText = this.dimTextFront
          if (e.target.side.toLowerCase() == 'back') {
            dimText = this.dimTextBack
          }
          this.showDimensions(e, dimText)
        });

        canvas.on('selection:created', (e: Record<any, any>) => {
          this.setActiveTab(e.selected[0])
        })

        canvas.on('selection:updated', (e: Record<any, any>) => {
          this.setActiveTab(e.selected[0])
        })
      }
    })
  }

  public listenEvents() {
    const self: Record<any, any> = this;
    self.$eventBus.$on("customTextUpdated", this.addTextsNew)
    if((this.mainPreview && this.mobileScreen) || this.fromRosterModal) {
      self.$eventBus.$on("rosterTextUpdated", this.addTextsNew)
    }
    if(this.mainPreview) {
      self.$eventBus.$on("storeCanvasImage", this.storeCanvasImage)
    }
    if(this.selectedProductId == this.product_id) {
      self.$eventBus.$on("addAddons", this.addAddons)
    }
    self.$eventBus.$on("customTextRemoved", this.deleteExistingTextsFromCanvas)
    self.$eventBus.$on("resetTextsCanvas", this.resetTextsFromCanvas)
    self.$eventBus.$on("handleCustomLogoUpdatedEvent", this.addLogo)
    self.$eventBus.$on("customLogoResetAndAdd", this.resetAndAddLogos) // some time on edit product is already loaded so load scene is not called then this function called
    self.$eventBus.$on("fixedLogoResetAndAdd", this.resetAndAddFixedLogos)
    self.$eventBus.$on("customLogoRemoved", this.deleteExistingLogoFromCanvas)
    self.$eventBus.$on("resetLogosCanvas", this.resetLogosFromCanvas)
    self.$eventBus.$on("changeDefaultColors", this.changeDefaultColorsEvent)
    self.$eventBus.$on("changeGroupColors", this.changeGroupColorsEvent)
    self.$eventBus.$on("useProductOriginalColors", this.setInitialColors)
    self.$eventBus.$on("changeColors", this.changeColors)
    self.$eventBus.$on("customTextStoreUpdated", this.customTextStoreUpdatedHandler)
    self.$eventBus.$on("customLogoStoreUpdated", this.customLogoStoreUpdatedHandler)
  }

  public customTextStoreUpdatedHandler(indexes: Record<any, any>, from_3d = false) {
    const self: Record<any, any> = this;
    if((from_3d || !this.mainPreview) && this.selectedProductId == this.product_id) {
      const text = this.product_custom_texts[indexes.custom_text_index].items[indexes.custom_text_item_index]
      if(text && self.product_custom_text_objects[indexes.custom_text_index] && self.product_custom_text_objects[indexes.custom_text_index][indexes.custom_text_item_index]) {
        const textObject = self.product_custom_text_objects[indexes.custom_text_index][indexes.custom_text_item_index]
        const otherSideObject = self.product_custom_text_objects[indexes.custom_text_index + '' + indexes.custom_text_item_index]
        this.eventAction(text, textObject, otherSideObject)
      }
    }
  }

  public customLogoStoreUpdatedHandler(logo_index: number, from_3d = false) {
    if((from_3d || !this.mainPreview) && this.selectedProductId == this.product_id) {
      const logo = this.$store.getters.selectedProductCustomLogos[logo_index]
      if(logo && this.custom_logo_objects[logo_index]) {
        const logoObject = this.custom_logo_objects[logo_index]
        const otherSideObject = this.other_side_logos[logo_index]
        this.eventAction(logo, logoObject, otherSideObject)
      }
    }
  }

  public setActiveTab(selected: Record<any, any>) {
    let self: Record<any, any> = this;
    let [active_text_index, active_jersey_part] = [selected.custom_text_index, selected.custom_text_item_index]
    if(!this.fromRosterModal){
      if(selected.type == 'logo') {
        this.$store.dispatch('setTabMain',{value:0})
      }else if(selected.type == 'text'){
        this.$store.dispatch('setTabMain',{value:2});
        // self.$eventBus.$emit("customTextTabChanged", (selected.text_index) as number)
        setTimeout(() => {
          self.$eventBus.$emit("customTextTabChanged", (selected.text_index) as number);
        }, 500);
        // this.$emit('setCustomTextIndex', selected.text_index);
        (this as Record<any, any>).$eventBus.$emit('setActiveJerseyPart', active_text_index, active_jersey_part);
      }

      if(selected.side.toLowerCase() == 'back'){
        this.frontCanvas.discardActiveObject()
        this.frontCanvasRender()
      }else{
        if(this.back) {
          this.backCanvas.discardActiveObject()
          this.backCanvasRender()
        }
      }
    }
  }

  public zoomInOut(side: string, in_out: string) {
    let canvas = this.frontCanvas
    if(side == 'back') {
      canvas = this.backCanvas
      if(this.back_zoom_point == undefined) {
        this.back_zoom_point = {x: 300, y: 300} as fabric.Point
      }
    } else {
      if(this.front_zoom_point == undefined) {
        this.front_zoom_point = {x: 300, y: 300} as fabric.Point
      }
    }

    let zoom = canvas.getZoom() + .2
    if(in_out == 'out') {
      zoom = canvas.getZoom() - .2
    }
    this.zoomCanvas(side, zoom)
  }

  public zoomCanvasEvent(opt: fabric.IEvent<WheelEvent>, canvas: fabric.Canvas, side: string) {
    let delta = opt.e.deltaY;
    let pointer = canvas.getPointer(opt.e) as fabric.Point;
    // let pointer = {x: opt.e.clientX, y: opt.e.clientY} as fabric.Point;
    if(side == 'back') {
      this.back_zoom_point = pointer
    } else {
      this.front_zoom_point = pointer
    }

    let zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;

    this.zoomCanvas(side, zoom)

    opt.e.preventDefault()
    opt.e.stopPropagation()
  }

  public zoomCanvas(side: string, zoom: number) {
    let dim_text = this.dimTextFront
    let canvas = this.frontCanvas
    let pointer = this.front_zoom_point
    if(side == 'back') {
      dim_text = this.dimTextBack
      canvas = this.backCanvas
      pointer = this.back_zoom_point
    }

    if (zoom > 4) zoom = 4;
    if (zoom < 1) {
      zoom = 1;
    }
    canvas.viewportTransform = JSON.parse(JSON.stringify(this.default_view_port));
    canvas.zoomToPoint({
      x: pointer.x,
      y: pointer.y
    }, zoom)

    canvas.requestRenderAll()

    dim_text.scaleX = 1 / zoom;
    dim_text.scaleY = 1 / zoom;
  }

  public getCustomObjectsLength(canvas: Record<any, any>) {
    let logoLength = 0
    let textLength = 0
    canvas.getObjects().forEach((obj: Record<any, any>) => {
      if ('logo_index' in obj) {
        logoLength++
      }
      if ('custom_text_index' in obj) {
        textLength++
      }
    })
    return { logoLength, textLength }
  }
  public addGuideLine(e: Record<any, any>, canvas: Record<any, any>, vertical_line: Record<any, any>, horizontal_line: Record<any, any>, relativeWidth: number, relativeHeight: number) {
    if (!this.drawLines) {
      canvas.add(vertical_line);
      canvas.add(horizontal_line);
      this.drawLines = true
    }

    let actObj = e.target;
    let coords = actObj.getCenterPoint()
    let left = coords.x;
    let top = coords.y;

    if (parseInt(left) >= relativeWidth - 2 && parseInt(left) <= relativeWidth + 2) {
      vertical_line.set({
        stroke: '#6EF3CC',
        strokeWidth: 4,
        strokeDashArray: []
      })
    }
    else {
      vertical_line.set({
        stroke: '#6EF3CC',
        strokeWidth: 4,
        strokeDashArray: [5, 5]
      })
    }

    if (parseInt(top) >= relativeHeight - 2 && parseInt(top) <= relativeHeight + 2) {
      horizontal_line.set({
        stroke: '#6EF3CC',
        strokeWidth: 4,
        strokeDashArray: [],
      })
    }
    else {
      horizontal_line.set({
        stroke: '#6EF3CC',
        strokeWidth: 4,
        strokeDashArray: [5, 5],
      })
    }
  }

  public addGuideForMultipleObjects(canvas: fabric.Canvas, selectedObject: Record<any, any>) {
    this.viewportTransform = canvas.viewportTransform
    let canvasObjects = canvas.getObjects()
    let activeObjectCenter = selectedObject.getCenterPoint()
    let activeObjectLeft = activeObjectCenter.x
    let activeObjectTop = activeObjectCenter.y
    let activeObjectBoundingRect = selectedObject.getBoundingRect()
    let activeObjectHeight = activeObjectBoundingRect.height / this.viewportTransform[3]
    let activeObjectWidth = activeObjectBoundingRect.width / this.viewportTransform[0]
    let horizontalInTheRange = false
    let verticalInTheRange = false

    if (!this.viewportTransform) return;

    // It should be trivial to DRY this up by encapsulating (repeating) creation of x1, x2, y1, and y2 into functions,
    // but we're not doing it here for perf. reasons -- as this a function that's invoked on every mouse move

    for (let i = canvasObjects.length; i--;) {
      if (canvasObjects[i] === selectedObject) continue;

      if ('logo_index' in canvasObjects[i] || 'custom_text_index' in canvasObjects[i]) {
        let objectCenter = canvasObjects[i].getCenterPoint(),
          objectLeft = objectCenter.x,
          objectTop = objectCenter.y,
          objectBoundingRect = canvasObjects[i].getBoundingRect(),
          objectHeight = objectBoundingRect.height / this.viewportTransform[3],
          objectWidth = objectBoundingRect.width / this.viewportTransform[0];

        // snap by the horizontal center line
        if (this.isInRange(objectLeft, activeObjectLeft)) {
          verticalInTheRange = true;
          this.verticalLines.push({
            x: objectLeft,
            y1: (objectTop < activeObjectTop)
              ? (objectTop - objectHeight / 2 - this.aligningLineOffset)
              : (objectTop + objectHeight / 2 + this.aligningLineOffset),
            y2: (activeObjectTop > objectTop)
              ? (activeObjectTop + activeObjectHeight / 2 + this.aligningLineOffset)
              : (activeObjectTop - activeObjectHeight / 2 - this.aligningLineOffset)
          });
          selectedObject.setPositionByOrigin(new fabric.Point(objectLeft, activeObjectTop), 'center', 'center');
        }

        // snap by the left edge
        if (this.isInRange(objectLeft - objectWidth / 2, activeObjectLeft - activeObjectWidth / 2)) {
          verticalInTheRange = true;
          this.verticalLines.push({
            x: objectLeft - objectWidth / 2 + 10,
            y1: (objectTop < activeObjectTop)
              ? (objectTop - objectHeight / 2 - this.aligningLineOffset)
              : (objectTop + objectHeight / 2 + this.aligningLineOffset),
            y2: (activeObjectTop > objectTop)
              ? (activeObjectTop + activeObjectHeight / 2 + this.aligningLineOffset)
              : (activeObjectTop - activeObjectHeight / 2 - this.aligningLineOffset)
          });
          selectedObject.setPositionByOrigin(new fabric.Point(objectLeft - objectWidth / 2 + activeObjectWidth / 2, activeObjectTop), 'center', 'center');
        }

        // snap by the right edge
        if (this.isInRange(objectLeft + objectWidth / 2, activeObjectLeft + activeObjectWidth / 2)) {
          verticalInTheRange = true;
          this.verticalLines.push({
            x: objectLeft + objectWidth / 2 - 11,
            y1: (objectTop < activeObjectTop)
              ? (objectTop - objectHeight / 2 - this.aligningLineOffset)
              : (objectTop + objectHeight / 2 + this.aligningLineOffset),
            y2: (activeObjectTop > objectTop)
              ? (activeObjectTop + activeObjectHeight / 2 + this.aligningLineOffset)
              : (activeObjectTop - activeObjectHeight / 2 - this.aligningLineOffset)
          });
          selectedObject.setPositionByOrigin(new fabric.Point(objectLeft + objectWidth / 2 - activeObjectWidth / 2, activeObjectTop), 'center', 'center');
        }

        // snap by the vertical center line
        if (this.isInRange(objectTop, activeObjectTop)) {
          horizontalInTheRange = true;
          this.horizontalLines.push({
            y: objectTop,
            x1: (objectLeft < activeObjectLeft)
              ? (objectLeft - objectWidth / 2 - this.aligningLineOffset)
              : (objectLeft + objectWidth / 2 + this.aligningLineOffset),
            x2: (activeObjectLeft > objectLeft)
              ? (activeObjectLeft + activeObjectWidth / 2 + this.aligningLineOffset)
              : (activeObjectLeft - activeObjectWidth / 2 - this.aligningLineOffset)
          });
          selectedObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop), 'center', 'center');
        }

        // snap by the top edge
        if (this.isInRange(objectTop - objectHeight / 2, activeObjectTop - activeObjectHeight / 2)) {
          horizontalInTheRange = true;
          this.horizontalLines.push({
            y: objectTop - objectHeight / 2 + 10,
            x1: (objectLeft < activeObjectLeft)
              ? (objectLeft - objectWidth / 2 - this.aligningLineOffset)
              : (objectLeft + objectWidth / 2 + this.aligningLineOffset),
            x2: (activeObjectLeft > objectLeft)
              ? (activeObjectLeft + activeObjectWidth / 2 + this.aligningLineOffset)
              : (activeObjectLeft - activeObjectWidth / 2 - this.aligningLineOffset)
          });
          selectedObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop - objectHeight / 2 + activeObjectHeight / 2), 'center', 'center');
        }

        // snap by the bottom edge
        if (this.isInRange(objectTop + objectHeight / 2, activeObjectTop + activeObjectHeight / 2)) {
          horizontalInTheRange = true;
          this.horizontalLines.push({
            y: objectTop + objectHeight / 2 - 11,
            x1: (objectLeft < activeObjectLeft)
              ? (objectLeft - objectWidth / 2 - this.aligningLineOffset)
              : (objectLeft + objectWidth / 2 + this.aligningLineOffset),
            x2: (activeObjectLeft > objectLeft)
              ? (activeObjectLeft + activeObjectWidth / 2 + this.aligningLineOffset)
              : (activeObjectLeft - activeObjectWidth / 2 - this.aligningLineOffset)
          });
          selectedObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop + objectHeight / 2 - activeObjectHeight / 2), 'center', 'center');
        }
      }
    }

    if (!horizontalInTheRange) {
      this.horizontalLines.length = 0;
    }
    if (!verticalInTheRange) {
      this.verticalLines.length = 0;
    }
  }

  public drawVerticalLine(coords: any, ctx: CanvasRenderingContext2D) {
    this.drawLine(
      coords.x + 0.5,
      coords.y1 > coords.y2 ? coords.y2 : coords.y1,
      coords.x + 0.5,
      coords.y2 > coords.y1 ? coords.y2 : coords.y1, ctx);
  }

  public drawHorizontalLine(coords: any, ctx: any) {
    this.drawLine(
      coords.x1 > coords.x2 ? coords.x2 : coords.x1,
      coords.y + 0.5,
      coords.x2 > coords.x1 ? coords.x2 : coords.x1,
      coords.y + 0.5, ctx)
  }

  public drawLine(x1: number, y1: number, x2: number, y2: number, ctx: CanvasRenderingContext2D) {
    let originXY = fabric.util.transformPoint(new fabric.Point(x1, y1), this.viewportTransform as any[])
    let dimensions = fabric.util.transformPoint(new fabric.Point(x2, y2), this.viewportTransform as any[])
    ctx.save()
    ctx.lineWidth = this.aligningLineWidth;
    ctx.strokeStyle = this.aligningLineColor;
    ctx.setLineDash([5, 5]);
    ctx.beginPath()

    ctx.moveTo(originXY.x, originXY.y)

    ctx.lineTo(dimensions.x, dimensions.y)
    ctx.stroke()
    ctx.restore()
  }

  public isInRange(value1: number, value2: number) {
    value1 = Math.round(value1);
    value2 = Math.round(value2);
    for (let i = value1 - this.aligningLineMargin, len = value1 + this.aligningLineMargin; i <= len; i++) {
      if (i === value2) {
        return true;
      }
    }
    return false;
  }

  public objectScaling(e: Record<any, any>, side: string) { // bound object to do not move out from product
    let design = this.frontDesign
    let canvas = this.frontCanvas
    if (side == 'back') {
      design = this.backDesign
      canvas = this.backCanvas
    }

    let zoom_point = this.front_zoom_point
    if (side == 'back') {
      zoom_point = this.back_zoom_point
    }
    let zoom = canvas.getZoom();
    if (zoom != 1 && zoom_point != undefined && zoom_point.x && zoom_point.y) {
      canvas.zoomToPoint({
        x: zoom_point.x,
        y: zoom_point.y
      }, 1);
    }

    const modelBoundingRect = design.getBoundingRect()
    let boundingRect = {
      left: modelBoundingRect.left,
      right: modelBoundingRect.left + modelBoundingRect.width,
      top: modelBoundingRect.top,
      bottom: modelBoundingRect.top + modelBoundingRect.height,
    }

    if(e.target.left >= boundingRect.right + (e.target.width * e.target.scaleX / 4)) { // object goes right
      e.target.left = boundingRect.right + (e.target.width * e.target.scaleX / 4)
    }
    else if(e.target.left < boundingRect.left - (e.target.width * e.target.scaleX / 4)) { // object goes left
      e.target.left = boundingRect.left - (e.target.width * e.target.scaleX / 4)
    }
    if(e.target.top < boundingRect.top + (e.target.height * e.target.scaleY / 3)) { // object goes top
      e.target.top = boundingRect.top + (e.target.height * e.target.scaleY / 3)
    }
    else if(e.target.top >= boundingRect.bottom - (e.target.height * e.target.scaleY / 3)){ // object goes bottom
      e.target.top = boundingRect.bottom  - (e.target.height * e.target.scaleY / 3)
    }

    let centerPoint = e.target.getCenterPoint()
    if (canvas.isTargetTransparent(design, centerPoint.x, centerPoint.y)) {
      const boundingDistance = {
        left: Math.abs(boundingRect.left - centerPoint.x),
        top: Math.abs(boundingRect.top - centerPoint.y),
        right: Math.abs(boundingRect.right - centerPoint.x),
        bottom: Math.abs(boundingRect.bottom - centerPoint.y)
      } as Record<any, any>

      let other_move_to = 'left'
      Object.keys(boundingDistance).forEach((key: string) => {
        if (boundingDistance[key] > boundingDistance[other_move_to]) {
          other_move_to = key
        }
      })
      let moveTo = 'left'
      if(boundingDistance.right > boundingDistance.left) {
        moveTo = 'right'
      }

      let direction = this.targetNonTransparentVH(canvas, design, e.target.left, e.target.top, e.target.width, e.target.scaleX, moveTo, other_move_to)

      e.target.left = direction.left
    }

    if (zoom_point != undefined && zoom_point.x && zoom_point.y) {
      canvas.zoomToPoint({
        x: zoom_point.x,
        y: zoom_point.y
      }, zoom);
    }
    e.target.scaleX = e.target.scaleX + 0.0000000000000001

    let dimText = this.dimTextFront
    if (side == 'back') {
      dimText = this.dimTextBack
      this.backCanvasRender()
    } else {
      this.frontCanvasRender()
    }
    this.showDimensions(e, dimText)
  }

  public targetNonTransparentVH(canvas: fabric.Canvas, model: any, pointX: number, pointY: number, width: number, scaleX: number, moveTo: string, other_move_to: string) {
    let direction = this.targetNonTransparent(canvas, model, pointX, pointY, width, scaleX, moveTo)
    if(direction.max_call <= 0 && moveTo != other_move_to) {
      if(other_move_to == 'bottom') {
        pointY++
      } else {
        pointY--
      }
      direction = this.targetNonTransparentVH(canvas, model, pointX, pointY, width, scaleX, moveTo, other_move_to)
    }
    return direction
  }

  public targetNonTransparent(canvas: fabric.Canvas, model: any, pointX: number, pointY: number, width: number, scaleX: number, moveTo: string, max_call = 600): Record<any, any> {
    let pointXCompare = pointX + (width * scaleX / 4)
    if(moveTo == 'left') {
      pointXCompare = pointX - (width * scaleX / 4)
    }
    max_call--
    if(canvas.isTargetTransparent(model, pointXCompare, pointY) && max_call > 0) { // add a max call condition to avoid unlimited recursive calls and max_call value 600 as the max canvas size
      if(moveTo == 'left') {
        pointX = pointX - 1
      } else if(moveTo == 'right') {
        pointX = pointX + 1
      } else if(moveTo == 'top') {
        pointY = pointY - 1
      } else {
        pointY = pointY + 1
      }
      return this.targetNonTransparent(canvas, model, pointX, pointY, width, scaleX, moveTo, max_call)
    }
    else {
      const viewportMatrix = canvas.viewportTransform as Record<any, any>;
      pointX = pointX + viewportMatrix[4]
      pointY = pointY + viewportMatrix[5]
      return {left: pointX, top: pointY, max_call: max_call}
    }
  }

  public addToOtherSide(target: any, side: string, clone_again = false) {
    side = side.toLowerCase()
    if(this.back && this.frontCanvas && this.backCanvas) {
      let design = this.frontDesign
      let canvas = this.frontCanvas
      let zoom_point = this.front_zoom_point
      if (side == 'back') {
        design = this.backDesign
        canvas = this.backCanvas
        zoom_point = this.back_zoom_point
      }

      let zoom = canvas.getZoom();
      if(zoom != 1 && zoom_point != undefined && zoom_point.x && zoom_point.y) {
        canvas.zoomToPoint({
          x: zoom_point.x,
          y: zoom_point.y
        }, 1);
      }

      let add_index
      if (target.type == 'text') {
        add_index = target.custom_text_index + '' + target.custom_text_item_index
      } else if(target.type == 'logo') {
        add_index = target.logo_index
      } else {
        add_index = target.fixed_logo_index
      }

      const modelBoundingRect = design.getBoundingRect()
      let boundingRect = {
        left: modelBoundingRect.left,
        right: modelBoundingRect.left + modelBoundingRect.width,
        top: modelBoundingRect.top,
        bottom: modelBoundingRect.top + modelBoundingRect.height,
      }

      let centerPoint = target.getCenterPoint()

      let boundingDistance = {
        left: Math.abs(boundingRect.left - centerPoint.x),
        top: Math.abs(boundingRect.top - centerPoint.y),
        right: Math.abs(boundingRect.right - centerPoint.x),
        bottom: Math.abs(boundingRect.bottom - centerPoint.y)
      } as Record<any, any>

      let actualNearTo = 'left'
      Object.keys(boundingDistance).forEach((key: string) => {
        if (boundingDistance[key] < boundingDistance[actualNearTo]) {
          actualNearTo = key
        }
      })

      boundingDistance = {
        left: Math.abs(boundingRect.left - centerPoint.x),
        top: Math.abs(boundingRect.top - centerPoint.y) + 100,
        right: Math.abs(boundingRect.right - centerPoint.x),
        bottom: Math.abs(boundingRect.bottom - centerPoint.y) + 100
      } as Record<any, any>

      let nearTo = 'left'
      Object.keys(boundingDistance).forEach((key: string) => {
        if (boundingDistance[key] < boundingDistance[nearTo]) {
          nearTo = key
        }
      })
      let moreToWords = 'left'
      if(boundingDistance.right < boundingDistance.left) {
        moreToWords = 'right'
      }

      let checkPointX = target.left + (target.width * target.scaleX / 2)
      if (nearTo == 'left') {
        checkPointX = target.left - (target.width * target.scaleX / 2)
      }

      let checkPointY = centerPoint.y
      if(actualNearTo == 'top') {
        checkPointY = target.top - (target.height * target.scaleY / 3)
      }

      let otherSideObjects = this.other_side_fixed_logos
      if (target.custom_text_index != undefined) {
        otherSideObjects = this.otherSideTexts
      } else if(target.logo_index != undefined) {
        otherSideObjects = this.other_side_logos
      }
      if (canvas.isTargetTransparent(design, checkPointX, checkPointY)) {
        let addLeft
        let addTop
        const model_start = (design.left - ((design.width * design.scaleX) / 2)) - 1
        const model_end = (design.left + ((design.width * design.scaleX) / 2)) + 1
        const width = target.width * target.scaleX;
        const height = target.height * target.scaleY;
        if(actualNearTo == 'top') { // todo may be find the direction from top for other side canvas to fix both side size mismatch issue
          const direction = this.targetNonTransparent(canvas, design, centerPoint.x, centerPoint.y - height , 0, 1, 'bottom')
          addTop = direction.top - checkPointY
          addLeft = this.canvasWidth - target.left
        } else if (moreToWords == 'left') {
          const direction = this.targetNonTransparent(canvas, design, checkPointX, centerPoint.y, 0, 1, 'right')
          const directionFromRight = this.targetNonTransparent(canvas, design, model_end, checkPointY, 0, 1, 'left')
          const outside = direction.left - checkPointX
          const modelSpaceLeft = directionFromRight.left + (width / 2) - 3
          addLeft = modelSpaceLeft - outside
          addTop = target.top
        } else {
          const direction = this.targetNonTransparent(canvas, design, target.left+ width, target.top, 0, 1, 'left')
          const directionFromRight = this.targetNonTransparent(canvas, design, model_start, centerPoint.y, 0, 1, 'right')
          const outside = checkPointX - direction.left
          const modelSpaceRight = directionFromRight.left - (width / 2) - 3
          addLeft = modelSpaceRight + outside
          addTop = target.top
        }

        if(zoom != 1 && zoom_point != undefined && zoom_point.x && zoom_point.y) {
          canvas.zoomToPoint({
            x: zoom_point.x,
            y: zoom_point.y
          }, zoom);
        }

        if(clone_again) {
          if (otherSideObjects[add_index]) {
            if (side == 'back') {
              this.frontCanvas.remove(otherSideObjects[add_index])
            } else {
              if (this.back) {
                this.backCanvas.remove(otherSideObjects[add_index])
              }
            }
            delete otherSideObjects[add_index]
          }
        }
        if (otherSideObjects[add_index]) {
          otherSideObjects[add_index].left = addLeft
          otherSideObjects[add_index].top = addTop
          if(actualNearTo == 'top') {
            otherSideObjects[add_index].flipX = true
            otherSideObjects[add_index].flipY = true
          } else {
            otherSideObjects[add_index].flipX = false
            otherSideObjects[add_index].flipY = false
          }
          otherSideObjects[add_index].scaleX = target.scaleX
          otherSideObjects[add_index].scaleY = target.scaleY
          otherSideObjects[add_index].angle = -target.angle
          if (side == 'back') {
            this.frontCanvasRender()
          } else {
            if (this.back) {
              this.backCanvasRender()
            }
          }
        } else {
          let objectAdd
          if(target.type == "text") {
            target.clone((cloned) => {
              objectAdd = cloned;
            })
          } else {
            objectAdd = fabric.util.object.clone(target)
          }

          if(actualNearTo == 'top') {
            objectAdd.flipX = true
            objectAdd.flipY = true
          }
          objectAdd.left = addLeft
          objectAdd.top = addTop
          objectAdd.angle = -objectAdd.angle
          objectAdd.hasControls = false
          objectAdd.selectable = false
          objectAdd.evented = false
          objectAdd.originX = 'center'
          objectAdd.originY = 'center'
          if(add_index != undefined) {
            otherSideObjects[add_index] = objectAdd
          }
          if (side == 'back') {
            // objectAdd.clipPath = this.clip_path_front
            this.frontCanvas.add(objectAdd)
            if (this.productType == 'customized') {
              this.front_models.forEach((model: fabric.Image) => {
                model.bringToFront()
              })
            }
            this.frontCanvasRender()
          } else {
            if (this.back) {
              this.backCanvas.add(objectAdd)
              if (this.productType == 'customized') {
                this.back_models.forEach((model: fabric.Image) => {
                  model.bringToFront()
                })
              }
              this.backCanvasRender()
            }
          }
        }
        this.applyClipPath(otherSideObjects[add_index], side == 'back'? 'front' : 'back', target.excluded_clip_id)
      } else {
        if(zoom != 1 && zoom_point != undefined && zoom_point.x && zoom_point.y) {
          canvas.zoomToPoint({
            x: zoom_point.x,
            y: zoom_point.y
          }, zoom);
        }
        if (otherSideObjects[add_index]) {
          if (side == 'back') {
            this.frontCanvas.remove(otherSideObjects[add_index])
            this.frontCanvasRender()
          } else {
            if (this.back) {
              this.backCanvas.remove(otherSideObjects[add_index])
              this.backCanvasRender()
            }
          }
          delete otherSideObjects[add_index]
        }
      }
    }
  }

  public async addModel(modelUrl: string, composition: string, side: string) {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(this.storageUrl + modelUrl + '?nocache=2', async (img: any) => {
        if(img.width > img.height) {
          img.scaleToWidth(this.canvasWidth - 10)
        } else {
          img.scaleToHeight(this.canvasHeight - 10)
        }
        img.set({
          hasControls: false,
          selectable: false,
          evented: false,
          originX: 'center',
          originY: 'center',
          globalCompositeOperation: composition
        })

        img.center().setCoords()
        if (side == 'back') {
          this.back_models.push(img)
        } else {
          this.front_models.push(img)
        }
        resolve('done')
      }, { crossOrigin: 'Anonymous' })
    })
  }

  public async addAddons(render_time = 0) {
    let promises: Promise<unknown>[] = []
    const grouped_addons = this.visual_addons['grouped_addons'];
    const ungrouped_addons = this.visual_addons['ungrouped_addons'];
    for (const [key, addons] of Object.entries(grouped_addons) as [string: any]) {
      addons?.forEach((addon: Record<any, any>) => {
        if(addon.selected) {
          if(!this.addon_objects[addon.addon_id]?.length) {
            addon.customized_sku_info.forEach((addon_file: Record<any, any>) => {
              addon_file.placement = addon_file.placement.toLowerCase()
              if(addon_file.placement == "front" || addon_file.placement == 'back') {
                promises.push(this.addAddon(this.storageUrl + addon_file.file_url, addon_file.placement, addon.addon_id))
              }
            })
          }
        } else {
          this.removeAddon(addon.addon_id)
        }
      })
    }
    ungrouped_addons?.forEach((addon: Record<any, any>) => {
      addon.customized_sku_info.forEach((addon_file: Record<any, any>) => {
        if(addon.selected) {
          if(!this.addon_objects[addon.addon_id]?.length) {
            addon_file.placement = addon_file.placement.toLowerCase()
            if (addon_file.placement == "front" || addon_file.placement == 'back') {
              promises.push(this.addAddon(this.storageUrl + addon_file.file_url, addon_file.placement, addon.addon_id))
            }
          }
        } else {
          this.removeAddon(addon.addon_id)
        }
      })
    })

    await Promise.all(promises).then(() => {
      this.setAddonParts()
      if(this.groupColors.length || this.defaultColors) {
        this.callChangeColors()
      }
      this.moveAddonsBehindLogos()

      this.frontCanvasRender(render_time)
      if (this.back) {
        this.backCanvasRender(render_time)
      }
    })
  }

  public moveAddonsBehindLogos() {
    this.custom_logo_objects.forEach((logo_object) => {
      logo_object.bringToFront()
    })
    this.product_custom_text_objects.forEach((custom_text_objects: Record<any, any>[]) => {
      custom_text_objects?.forEach((custom_text_object) => {
        custom_text_object?.bringToFront()
      })
    })
    if (this.productType == 'customized') {
      this.front_models.forEach((model: fabric.Image) => {
        model.bringToFront()
      })
      if(this.back) {
        this.back_models.forEach((model: fabric.Image) => {
          model.bringToFront()
        })
      }
    }
  }

  public removeAddon(addon_id: number) {
    this.addon_objects[addon_id]?.forEach((addon_object) => {
      this.frontCanvas.remove(addon_object)
      if(this.back) {
        this.backCanvas.remove(addon_object)
      }
    })
    this.addon_objects[addon_id] = []
  }

  public addAddon(addonUrl: string, side: string, addon_id) {
    return new Promise((resolve, reject) => {
      fabric.loadSVGFromURL(addonUrl, (objects, options) => {
        options.crossOrigin = 'Anonymous'
        objects.forEach((item: Record<any, any>) => {
          if (item.type === 'image') {
            (item as fabric.Image).set({
              globalCompositeOperation: 'multiply'
            });
          }
        })

        const img = fabric.util.groupSVGElements(objects) as fabric.Group
        if(side == 'front' || (this.back && side == 'back')) {
          let canvas = this.frontCanvas
          let design = this.frontDesign
          if (side == 'back') {
            canvas = this.backCanvas
            design = this.backDesign
          }

          img.set({
            left: design.left,
            top: design.top,
            scaleX: design.scaleX,
            scaleY: design.scaleY,
            hasControls: false,
            selectable: false,
            evented: false,
            originX: 'center',
            originY: 'center',
            lockMovementX: true,
            lockMovementY: true,
          })

          canvas.add(img)
        }
        if(!this.addon_objects[addon_id]) {
          this.addon_objects[addon_id] = []
        }
        this.addon_objects[addon_id].push(img);
        resolve('done')
      })
    })
  }

  public setAddonParts() {
    // first remove all existing addon parts
    this.svgGroups = this.svgGroups.filter(group => group.addon_index === undefined);
    this.addon_objects.forEach((addon_objects_by_placement: Record<any, any>, index) => {
      addon_objects_by_placement.forEach((addon_object) => {
        addon_object._objects.forEach((item: Record<any, any>) => {
          if (item.type === 'image') {
            (item as fabric.Image).set({
              globalCompositeOperation: 'multiply'
            });
          }
          if(item.id && item.fill && typeof item.fill === 'string') {
            if(item.id.indexOf('_') !== -1) {
              item.id = item.id.substring(0, item.id.indexOf('_'))
            }
            item.id = item.id.toLowerCase()
            if (!item.id.includes('noncustomizable') && !item.id.includes('inside') && !this.containsObject({id: item.id})) {
              if (item.fill.includes('rgb')) {
                item.fill = rgbHex(item.fill as string).includes('#') ? rgbHex(item.fill as string) : '#' + rgbHex(item.fill as string)
              }

              const selectProductPantonesList = getSelectedProductPantones(this.product_id)
              const pantoneColor = getClosestColor(item.fill as string, selectProductPantonesList, getColorType('', this.product_id))

              this.svgGroups.push({
                id: item.id,
                color: item.fill,
                count: 0,
                pantone: pantoneColor.pantone,
                name: pantoneColor.name,
                addon_index: index
              })
              this.svgGroups = this.svgGroups.sort((a, b) => (a.count < b.count) ? 1 : -1)

              if (!this.parts.includes(item.id)) {
                this.parts.push(item.id);
              }
            }
          }
        })
      })
    })
    if (this.mainPreview) {
      this.$store.dispatch('setSvgGroups', this.svgGroups)
    }
  }

  public addDesign(designUrl: string, side: string, file_ext: string) {
    return new Promise((resolve, reject) => {
      if (file_ext == 'svg') {
        fabric.loadSVGFromURL(designUrl, (objects: any, options: any) => {
          options.crossOrigin = 'Anonymous'
          const img = fabric.util.groupSVGElements(objects) as fabric.Group
          if(img.width! > img.height!) {
            img.scaleToWidth(this.canvasWidth - 10)
          } else {
            img.scaleToHeight(this.canvasHeight - 10)
          }

          img.set({
            hasControls: false,
            selectable: false,
            evented: false,
            lockMovementX: true,
            lockMovementY: true,
            originX: 'center',
            originY: 'center'
          })

          // img._objects.forEach((element: any) => {
          //   if(element.id === 'Laces') {
          //     element.globalCompositeOperation = 'destination-out'
          //   }
          // })
          img.center().setCoords();

          if (side == 'back') {
            this.backDesign = img
          } else {
            this.frontDesign = img
          }
          resolve('done')
        })
      } else {
        fabric.Image.fromURL(designUrl, async (img: any) => {
          if(img.width > img.height) {
            img.scaleToWidth(this.canvasWidth - 10)
          } else {
            img.scaleToHeight(this.canvasHeight - 10)
          }
          img.set({
            hasControls: false,
            selectable: false,
            evented: false,
            originX: 'center',
            originY: 'center',
            lockMovementX: true,
            lockMovementY: true
          })
          img.center().setCoords()

          if (side == 'back') {
            this.backDesign = img
          } else {
            this.frontDesign = img
          }
          resolve('done')
        }, { crossOrigin: 'Anonymous' })
      }
    })
  }

  public addBoundary(boundary_images: string[], side: string) {
    return new Promise((resolve, reject) => {
      let canvas = this.frontCanvas
      let design = this.frontDesign
      if(side == 'back') {
        canvas = this.backCanvas
        design = this.backDesign
      }
      boundary_images.forEach((url: string, index: number) => {
        if(url) {
          fabric.loadSVGFromURL(url, (img: any, options: any) => {
            options.crossOrigin = 'Anonymous'

            const boundaries_clip = fabric.util.groupSVGElements(img) as fabric.Group
            canvas.viewportCenterObject(boundaries_clip)
            boundaries_clip.set({
              scaleX: design.scaleX,
              scaleY: design.scaleY,
              hasControls: false,
              selectable: false,
              evented: false,
              originX: 'center',
              originY: 'center',
              lockMovementX: true,
              lockMovementY: true,
              absolutePositioned: true,
              inverted: true,
            })

            boundaries_clip.center().setCoords();

            if(!index) { // as the first index is always safe zone
              if (side == 'back') {
                this.back_safe_zone = boundaries_clip._objects as fabric.Image[]
              } else {
                this.front_safe_zone = boundaries_clip._objects as fabric.Image[]
              }
            } else {
              if (side == 'back') {
                this.back_boundary = boundaries_clip._objects as fabric.Image[]
              } else {
                this.front_boundary = boundaries_clip._objects as fabric.Image[]
              }
            }

            if(!boundary_images[1] || (boundary_images[1] && index == 1)) {
              resolve('done')
            }
          })
        } else {
          if(!boundary_images[1] || (boundary_images[1] && index == 1)) {
            resolve('done')
          }
        }
      })
    })
  }

  public async applyClipPath(logo_or_text: fabric.Image|fabric.Group, side: string, excluded_clip_id = '') {
    let boundaries = this.front_boundary
    let safe_zone = this.front_safe_zone
    let canvas = this.frontCanvas
    let design = this.frontDesign
    let zoom_point = this.front_zoom_point
    if(side.toLowerCase() == 'back') {
      boundaries = this.back_boundary
      safe_zone = this.back_safe_zone
      canvas = this.backCanvas
      design = this.backDesign
      zoom_point = this.back_zoom_point
    }

    let apply_boundary: fabric.Image[] = [];
    if(safe_zone) {
      apply_boundary = this.cloneFabricObjects(safe_zone)
    }

    let zoom = canvas.getZoom();
    if(zoom != 1 && zoom_point != undefined && zoom_point.x && zoom_point.y) {
      canvas.zoomToPoint({
        x: zoom_point.x,
        y: zoom_point.y
      }, 1);
    }

    if(boundaries) {
      const checkPointX = logo_or_text.left as number
      const checkPointY = logo_or_text.top as number

      const boundaries_clip = fabric.util.groupSVGElements(this.cloneFabricObjects(boundaries)) as fabric.Group
      boundaries_clip.set({
        scaleX: design.scaleX,
        scaleY: design.scaleY,
        hasControls: false,
        selectable: false,
        evented: false,
        originX: 'center',
        originY: 'center',
        lockMovementX: true,
        lockMovementY: true,
        absolutePositioned: true,
        inverted: true,
      })
      boundaries_clip.center().setCoords()
      canvas.viewportCenterObject(boundaries_clip)

      let clipped_parts
      if(excluded_clip_id) {
        clipped_parts = boundaries_clip._objects.filter((boundary) => {
          const boundary_id = boundary['id'].substring(0, boundary['id'].indexOf('_'))
          return excluded_clip_id != boundary_id
        })
      } else {
        clipped_parts = this.findClippedParts(logo_or_text, boundaries_clip._objects as fabric.Image[], canvas, checkPointX, checkPointY);
      }
      apply_boundary.push(...clipped_parts)
    }

    if(apply_boundary) {
      const clip = fabric.util.groupSVGElements(apply_boundary) as fabric.Group
      clip.set({
        scaleX: design.scaleX,
        scaleY: design.scaleY,
        hasControls: false,
        selectable: false,
        evented: false,
        originX: 'center',
        originY: 'center',
        lockMovementX: true,
        lockMovementY: true,
        absolutePositioned: true,
        inverted: true
      })
      clip.center().setCoords()
      canvas.viewportCenterObject(clip)

      logo_or_text.clipPath = clip
      // canvas.add(clip)
      // canvas.requestRenderAll()
      if(zoom != 1 && zoom_point != undefined && zoom_point.x && zoom_point.y) {
        canvas.zoomToPoint({
          x: zoom_point.x,
          y: zoom_point.y
        }, zoom);
      }
    }
  }

  private findClippedParts(logo_or_text: fabric.Image|fabric.Group, boundaries: fabric.Image[], canvas: fabric.Canvas, checkPointX: number, checkPointY: number, max_call = 60) {
    let apply_boundary: fabric.Image[] = []
    let found_excluded = false
    boundaries.forEach((boundary: fabric.Image) => {
      if (found_excluded || canvas.isTargetTransparent(boundary, checkPointX, checkPointY)) {
        apply_boundary.push(boundary);
      } else {
        Vue.set(logo_or_text, 'excluded_clip_id', boundary['id'].substring(0, boundary['id'].indexOf('_')))
        found_excluded = true
      }
    });
    if(!found_excluded && max_call) { // at least one part must fonde as excluded where logo or text should show otherwise call findClippedParts function again with change of x point
      if(checkPointX < this.canvasWidth/2) {
        checkPointX++
      } else {
        checkPointX--
      }
      apply_boundary = this.findClippedParts(logo_or_text, boundaries, canvas, checkPointX, checkPointY, --max_call)
    }

    return apply_boundary;
  }

  public addSvgLogos(logo: Record<any, any>, index: number): Promise<boolean> {
    return new Promise((resolve) => {
      if (logo.side == 'front' || (logo.side == 'back' && this.back)) {
        let logoUrl = encodeURI((this.storageUrl + logo.url).trim()) + '?nocache=11'
        fabric.loadSVGFromURL(logoUrl, (objects: any, options: any) => {
          options.crossOrigin = 'Anonymous'
          const img = fabric.util.groupSVGElements(objects) as fabric.Group
          img.scaleToHeight(this.canvasHeight / this.mainCanvasHeight * logo.height as number)
          img.set({
            left: this.canvasWidth / this.mainCanvasWidth * logo.x_axis,
            top: this.canvasHeight / this.mainCanvasHeight * logo.y_axis,
            angle: logo.rotation < 0? 360 - logo.rotation : logo.rotation  as number,
            hasControls: false,
            selectable: false,
            evented: false,
            originX: 'center',
            originY: 'center',
            lockMovementX: true,
            lockMovementY: true,
            globalCompositeOperation: 'source-atop'
          })

          if(logo.is_customizable) {
            const id = logo.placement_title
            if(!this.containsObject({id: id})) {
              let fill_color = ''
              const logo_objects = img._objects ? img._objects : [img]
              logo_objects.forEach((item: any) => {
                if (item.fill && typeof item.fill === 'string') {
                  if (item.fill.includes('rgb')) {
                    item.fill = rgbHex(item.fill as string).includes('#') ? rgbHex(item.fill as string) : '#' + rgbHex(item.fill as string)
                  }
                  if (!fill_color) { // get the first fill color from fixed logo
                    fill_color = item.fill
                    const selectProductPantonesList = getSelectedProductPantones(this.product_id)
                    const pantoneColor = getClosestColor(item.fill as string, selectProductPantonesList, getColorType('', this.product_id))

                    this.svgGroups.push({
                      id: id,
                      color: item.fill,
                      count: 0,
                      pantone: pantoneColor.pantone,
                      name: pantoneColor.name,
                      logo_index: index
                    })
                    this.svgGroups = this.svgGroups.sort((a, b) => (a.count < b.count) ? 1 : -1)

                    if(this.mainPreview) {
                      this.$store.dispatch('setSvgGroups', this.svgGroups)
                    }

                    if (!this.parts.includes(item.id)) {
                      this.parts.push(item.id);
                    }
                  }
                }
              })
            }
          }

          let models = this.front_models
          let canvas = this.frontCanvas
          if (logo.side == 'back') {
            canvas = this.backCanvas
            models = this.back_models
          }

          canvas.add(img)
          if (this.productType == 'customized') {
            models.forEach((model: fabric.Image) => {
              model.bringToFront()
            })
          }
          Object.assign(img, {
            fixed_logo_index: logo.fixed_logo_index,
            side: logo.side,
            type: 'fixed_logo'
          })
          const render_time = 300
          this.fixed_logo_objects.push(img)
          if (logo.side == 'back') {
            this.backCanvasRender()
          } else {
            this.frontCanvasRender()
          }
          setTimeout(() => {
            this.addToOtherSide(img, logo.side)
          }, render_time * 4)
          resolve(true)
        })
      } else {
        resolve(true)
      }
    })
  }

  public async resetAndAddFixedLogos() {
    if(this.mounted) {
      await this.resetFixedLogosFromCanvas()
      this.addFixedLogos()
    }
  }

  public addFixedLogos() {
    if (this.logos.length) {
      let promises: Promise<boolean>[] = []
      this.logos.forEach((logo: Record<any, any>, index: number) => {
        let is_fixed_logos_all: boolean
        if(this.selectedProductId == this.product_id) {
          is_fixed_logos_all = this.product.productstyles[this.styleIndex].is_fixed_logos_all
        } else {
          is_fixed_logos_all = this.product.productstyles[0].is_fixed_logos_all
        }

        this.svgGroups = this.svgGroups.filter(item => !Object.prototype.hasOwnProperty.call(item, 'logo_index'));
        if(this.mainPreview) {
          this.$store.dispatch('setSvgGroups', this.svgGroups)
        }
        this.initialSvgGroups = JSON.parse(JSON.stringify(this.svgGroups))

        if(is_fixed_logos_all || (!is_fixed_logos_all && logo.is_default)) {
          if (logo && logo.url) {
            logo.fixed_logo_index = index
            promises.push(this.addSvgLogos(logo, index))
          }
        }
      })
      Promise.all(promises).then(() => {
        if(this.groupColors.length || this.defaultColors) {
          this.callChangeColors()
        }
      })
    }
  }

  public async resetFixedLogosFromCanvas() {
    if(this.selectedProductId == this.product_id && this.fixed_logo_objects) {
      for (let objectIndex = 0; objectIndex < this.fixed_logo_objects.length; objectIndex++) {
        const fixed_logo = this.fixed_logo_objects[objectIndex]
        if(fixed_logo) {
          this.frontCanvas.remove(fixed_logo)
          if(this.back) {
            this.backCanvas.remove(fixed_logo)
          }
          const otherSideLogo = this.other_side_fixed_logos[objectIndex]
          if(otherSideLogo) {
            this.frontCanvas.remove(otherSideLogo)
            if(this.back) {
              this.backCanvas.remove(otherSideLogo)
            }
          }
        }
      }
      this.frontCanvasRender()
      if(this.back && this.backCanvas) {
        this.backCanvasRender()
      }
      this.fixed_logo_objects = []
      this.other_side_fixed_logos = []
    }
  }

  public async resetAndAddLogos() {
    if(this.mounted) {
      await this.resetLogosFromCanvas()
      let logos: Record<any, any>[] = []
      if (this.custom_logos && this.logoAllowed) {
        let custom_logos = JSON.parse(JSON.stringify(this.custom_logos))
        if (this.logosLimit) {
          custom_logos = this.custom_logos.slice(0, this.logosLimit) as [Record<any, any>]
        }
        logos = logos.concat(custom_logos) as [Record<any, any>]
      }
      if (logos.length) {
        logos.forEach((logo: Record<any, any>) => {
          if (logo && logo.url) {
            this.addLogo(logo)
          }
        })
      }
    }
  }

  public addLogo(logo: Record<any, any>, from_load = false) {
    logo = this.custom_logos ? this.custom_logos[logo.logo_index] : {}
    if(!checkIsEmpty(logo) && logo && logo.product_id == this.product_id && (this.mounted || from_load)) {
      if(this.custom_logo_objects[logo.logo_index as number]) {
        this.deleteExistingLogoFromCanvas(logo.logo_index)
      }
      if (logo.url && (logo.side == 'front' || (logo.side == 'back' && this.back)) && !this.custom_logo_objects[logo.logo_index as number]) {
       if(this.mainPreview && !from_load) {
         this.$store.commit('SET_UPDATING_LOGO', true)
       }
        if (logo.customLogo) {
          this.custom_logo_objects[logo.logo_index as number] = true
        }
        logo.haveControls = Boolean(logo.haveControls)
        let logoUrl = encodeURI((this.storageUrl + logo.url).trim()) + '?nocache=11'
        fabric.Image.fromURL(logoUrl, async (img: any) => {
          const aspect_ratio = img.width / img.height
          if(aspect_ratio > 1) {
            img.scaleToWidth(this.canvasHeight / this.mainCanvasHeight * logo.height as number)
          } else {
            img.scaleToHeight(this.canvasHeight / this.mainCanvasHeight * logo.height as number)
          }
          img.set({
            left: this.canvasWidth / this.mainCanvasWidth * logo.x_axis,
            top: this.canvasHeight / this.mainCanvasHeight * logo.y_axis,
            angle: logo.rotation < 0 ? 360 - logo.rotation : logo.rotation as number,
            centeredScaling: true,
            selectable: this.canvasSelection,
            //selectable: !this.canvasSelection ? this.canvasSelection : logo.haveControls,
            hasControls: logo.haveControls,
            hasBorders: false,
            evented: true,
            originX: 'center',
            originY: 'center',
            globalCompositeOperation: 'source-atop',
            lockScalingFlip: true,
            padding: 15,
            cornerSize: 30,
            type: "logo",
          })

          if (logo.scaleX && logo.scaleY) {
            img.scaleX = this.canvasWidth / this.mainCanvasWidth * logo.scaleX
            img.scaleY = this.canvasHeight / this.mainCanvasHeight * logo.scaleY
          }

          let models = this.front_models
          let canvas = this.frontCanvas
          let dimText = this.dimTextFront
          if (logo.side == 'back') {
            canvas = this.backCanvas
            models = this.back_models
            dimText = this.dimTextBack
          }

          img.setControlsVisibility(this.fabric_control_visibility)

          await this.applyClipPath(img, logo.side);

          Object.assign(img, {
            logo_index: logo.logo_index,
            side: logo.side
          })
          canvas.add(img)
          if (this.productType == 'customized') {
            models.forEach((model: fabric.Image) => {
              model.bringToFront()
            })
          }
          let render_time = 0
          if(from_load) {
            render_time = 300
          } else if(!this.mainPreview) {
            render_time = this.getRandom()
          }
          if (logo.side == 'back') {
            this.backCanvasRender(render_time)
          } else {
            this.frontCanvasRender(render_time)
          }

          if (this.mainPreview && this.selectedProductId == this.product_id) {
            const converted_width = unitConversion(img.width * img.scaleX * this.measurementRatio)
            const converted_height = unitConversion(img.height * img.scaleY * this.measurementRatio)
            this.$store.commit('SET_PRODUCT_CUSTOM_LOGOS', {
              custom_logo_index: logo.logo_index,
              data: {
                actualWidth: img.width,
                actualHeight: img.height,
                originalWidth: converted_width!.value,
                originalHeight: converted_height!.value
              }
            })
          }
          this.custom_logo_objects[logo.logo_index as number] = img

          img.on('selected', (e: Record<any, any>) => {
            this.$root.$emit('changeLogoTabIndex', logo.logo_index);
            this.showDimensions(e, dimText)
          })
          canvas.on('selection:cleared', () => {
            dimText.set({
              visible: false
            })
          })

          setTimeout(() => {
            this.addToOtherSide(img, logo.side)
          }, render_time * 4)
          this.$store.commit('SET_UPDATING_LOGO', false)
        }, { crossOrigin: 'Anonymous' })
      }
    }
  }

  public async resetLogosFromCanvas() {
    if(this.custom_logo_objects) {
      for (let objectIndex = 0; objectIndex < this.custom_logo_objects.length; objectIndex++) {
        const custom_logo = this.custom_logo_objects[objectIndex]
        if(custom_logo) {
          this.frontCanvas.remove(custom_logo)
          if(this.back) {
            this.backCanvas.remove(custom_logo)
          }
          const otherSideLogo = this.other_side_logos[objectIndex]
          if(otherSideLogo) {
            this.frontCanvas.remove(otherSideLogo)
            if(this.back) {
              this.backCanvas.remove(otherSideLogo)
            }
          }
        }
      }
      this.frontCanvasRender()
      if(this.back && this.backCanvas) {
        this.backCanvasRender()
      }
      this.custom_logo_objects = []
      this.other_side_logos = []
    }
  }

  public async deleteExistingLogoFromCanvas(custom_logo_index: number) {
    if(custom_logo_index == 0 || this.custom_logos[custom_logo_index] && this.custom_logos[custom_logo_index].product_id == this.product_id) {
      const custom_logo = this.custom_logo_objects[custom_logo_index]
      if (custom_logo) {
        this.frontCanvas.remove(custom_logo)
        if (this.back) {
          this.backCanvas.remove(custom_logo)
        }
        const other_side_logo = this.other_side_logos[custom_logo_index]
        if (other_side_logo) {
          this.frontCanvas.remove(other_side_logo)
          if (this.back) {
            this.backCanvas.remove(other_side_logo)
          }
          this.other_side_logos[custom_logo_index] = null
        }
        this.frontCanvasRender()
        if (this.back) {
          this.backCanvasRender()
        }
      }
      this.custom_logo_objects[custom_logo_index] = null
    }
  }

  public showDimensions(e: any, dimText: Record<any, any>) {
    let object = e.target;
    const width = (object.width as number * object.scaleX * this.measurementRatio)
    const height = (object.height as number * object.scaleY * this.measurementRatio)
    if (width != 0 || height != 0) {
      const converted_width = unitConversion(width)
      const converted_height = unitConversion(height)
      if(object.type == 'text') {
        const stroke_width = object.strokeWidth * object.scaleX * this.measurementRatio
        converted_width.value = (parseFloat(converted_width.value) + parseFloat(unitConversion(stroke_width).value)).toFixed(1)
        converted_height.value = (parseFloat(converted_height.value) + parseFloat(unitConversion(stroke_width).value)).toFixed(1)
      }
      dimText.set({
        left: object.left,
        top: object.top + ((object.height * object.scaleY) / 2) + dimText.height * dimText.scaleY + 20,
        text: 'Size (W)' + converted_width!.value + converted_width!.unit + ' x (H)' + converted_height!.value + converted_height!.unit,
        visible: true
      }).bringToFront()
    }
  }

  public async resetTextsFromCanvas() {
    if(this.product_custom_text_objects) {
      for (let objectIndex = 0; objectIndex < this.product_custom_text_objects.length; objectIndex++) {
        const custom_text = this.product_custom_text_objects[objectIndex] as Record<any, any>
        if(custom_text != null) {
          for(let i = 0; i < custom_text.length; i++) {
            this.frontCanvas.remove(custom_text[i])
            if(this.back) {
              this.backCanvas.remove(custom_text[i])
            }
            const otherSideText = this.otherSideTexts[objectIndex + '' + i]
            if(otherSideText) {
              this.frontCanvas.remove(otherSideText)
              if(this.back) {
                this.backCanvas.remove(otherSideText)
              }
            }
          }
        }
      }
      this.frontCanvasRender()
      if(this.back && this.backCanvas) {
        this.backCanvasRender()
      }
      this.product_custom_text_objects = []
      this.otherSideTexts = []
    }
  }

  public async deleteExistingTextsFromCanvas(custom_text_index:  number, remove_custom_text_object = true) {
    const self: Record<any, any> = this;
    const custom_text = self.product_custom_text_objects[custom_text_index]
    if(custom_text) {
      for(let i = 0; i < custom_text.length; i++) {
        self.frontCanvas.remove(custom_text[i])
        if(this.back) {
          self.backCanvas.remove(custom_text[i])
        }
        const otherSideText = this.otherSideTexts[custom_text_index + '' + i]
        if(otherSideText) {
          this.frontCanvas.remove(otherSideText)
          if(this.back) {
            this.backCanvas.remove(otherSideText)
          }
        }
      }
      this.frontCanvasRender()
      if (this.back) {
        this.backCanvasRender()
      }
    }
    /*
    * remove_custom_text_object will be true only when we remove custom text that has been manuallya dded
    * */
    if(remove_custom_text_object) {
      self.product_custom_text_objects.splice(custom_text_index, 1)
    } else {
      self.product_custom_text_objects[custom_text_index] = null
    }
  }
 /*
 * This method check if custom text have following products. If yes then add custom text to the follwoing product
 * */
  public async isCustomTextAllowed(custom_text_index: number) {
    let custom_text = this.product_custom_texts[custom_text_index];
    let is_custom_text_allowed = this.product_id == custom_text.product_id;
    if(Object.prototype.hasOwnProperty.call(custom_text, "following_product_ids") && custom_text.following_product_ids.includes(this.product_id)) {
      const following_product_custom_text = this.allProductsCustomTexts[this.product_id]?.[custom_text_index];
      is_custom_text_allowed = following_product_custom_text && following_product_custom_text.type == custom_text.type
    }
    return is_custom_text_allowed;
  }

  public async addTextsNew(custom_text_info: Record<any, any>, from_load = false) {
    if(!this.selectedProduct.preview_custom_texts) {
      return false
    }
    if(this.mounted || from_load) {
      const custom_text_index = custom_text_info.custom_text_index;
      if(this.allProductsCustomTexts[this.product_id] && this.allProductsCustomTexts[this.product_id][custom_text_index]) {
        const self: Record<any, any> = this
        await this.syncCustomTextsWithCustomTextsObjects()
        if(custom_text_info.emitter == 'add_button') {
          /* in case of add button we just need to execute method syncCustomTextsWithCustomTextsObjects() that's why returning here  */
          return false;
        }
        self.product_custom_texts[custom_text_index] = custom_text_info.value;

        let add_custom_text = await this.isCustomTextAllowed(custom_text_index);
        if(add_custom_text) {
          let render_time = 0
          if(from_load) {
            render_time = 300
          } else if(!this.mainPreview) {
            render_time = this.getRandom()
          }
          let custom_text = this.allProductsCustomTexts[this.product_id][custom_text_index];
          let render_front_canvas = false;
          let render_back_canvas = false;
          /*
           * delete existing texts first and re render them
           * */
          if (self.product_custom_text_objects[custom_text_index]) {
            await this.deleteExistingTextsFromCanvas(custom_text_index, false)
          }
          if (Object.keys(custom_text).length && custom_text.value) {
            custom_text.items.forEach((custom_text_item: Record<any, any>, customTextItemIndex: number) => {
              if ((custom_text_item.placement.toLowerCase() == 'back' && self.backCanvas) || custom_text_item.placement.toLowerCase() == 'front') {
                let fabric_text: fabric.Text | fabric.Group | Record<any, any>
                if ((this.mainPreview || this.fromRosterModal) && this.selectedProductId == this.product_id) {
                  let font = this.products_fonts[custom_text.font_family]
                  if(!font) {
                    font = this.products_fonts[Object.keys(this.products_fonts)[0]]
                  }
                  if (font) {
                    const path = font.opentype_font.getPath(custom_text.value, 0, 0, 72, {features: { liga: true, rlig: true }})

                    let textSvg = '<?xml version="1.0" encoding="utf-8"?>\n' +
                      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xml:space="preserve">\n'
                    textSvg += path.toSVG()
                    textSvg += '\n</svg>'

                    fabric.loadSVGFromString(textSvg, (objects: any) => {
                      fabric_text = fabric.util.groupSVGElements(objects) as fabric.Group | Record<any, any>
                      fabric_text.scaleToHeight(custom_text_item.height as number)
                      fabric_text.set({
                        left: self.canvasWidth / self.mainCanvasWidth * custom_text_item.x_axis,
                        top: self.canvasHeight / self.mainCanvasHeight * custom_text_item.y_axis,
                        angle: custom_text_item.rotation < 0? 360 - custom_text_item.rotation : custom_text_item.rotation  as number,
                        centeredScaling: true,
                        selectable: this.canvasSelection,
                        hasControls: true,
                        hasBorders: false,
                        evented: true,
                        originX: 'center',
                        originY: 'center',
                        globalCompositeOperation: 'source-atop',
                        fill: custom_text_item.color,
                        stroke: custom_text_item.outline_color,
                        strokeWidth: parseInt(custom_text_item.outline_width),
                        paintFirst: 'stroke',
                        lockScalingFlip: true,
                        padding: 15,
                        cornerSize: 30,
                        placement: custom_text_item.placement,
                        visible: custom_text_item.selected,
                        custom_text_index: custom_text_index,
                        custom_text_item_index: customTextItemIndex,
                        type: "text",
                        side: custom_text_item.placement,
                        text_index: custom_text_index,
                        manually_added: custom_text.manually_added,
                      })

                      if (custom_text_item.scaleX && custom_text_item.scaleY) {
                        fabric_text.scaleX = custom_text_item.scaleX
                        fabric_text.scaleY = custom_text_item.scaleY
                      } else {
                        custom_text_item.scaleX = fabric_text.scaleX
                        custom_text_item.scaleY = fabric_text.scaleY
                        custom_text_item.width = fabric_text.width
                        custom_text_item.height = fabric_text.height
                      }
                      const converted_width = unitConversion(fabric_text.width * fabric_text.scaleX * this.measurementRatio)
                      const converted_height = unitConversion(fabric_text.height * fabric_text.scaleY * this.measurementRatio)
                      const outline_width_converted = unitConversion(fabric_text.strokeWidth * fabric_text.scaleX * this.measurementRatio)
                      custom_text_item.actualWidth = fabric_text.width
                      custom_text_item.actualHeight = fabric_text.height
                      custom_text_item.originalWidth = converted_width!.value
                      custom_text_item.originalHeight = converted_height!.value
                      custom_text_item.outline_width_converted = outline_width_converted!.value

                      this.applyClipPath(fabric_text as fabric.Group, custom_text_item.placement)

                      self.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", {index: custom_text_index, value: { items: custom_text.items }})

                      fabric_text.setControlsVisibility(this.fabric_control_visibility)
                      if (!self.product_custom_text_objects[custom_text_index]) {
                        self.product_custom_text_objects[custom_text_index] = [];
                        self.product_custom_text_objects[custom_text_index][customTextItemIndex] = null;
                      }
                      self.product_custom_text_objects[custom_text_index][customTextItemIndex] = fabric_text
                      if (custom_text_item.placement.toLowerCase() == 'front') {
                        self.frontCanvas.add(fabric_text)
                        render_front_canvas = true
                        fabric_text.on('selected', (e: Record<any, any>) => {
                          this.showDimensions(e, self.dimTextFront)
                        })
                        self.frontCanvas.on('selection:cleared', () => {
                          self.dimTextFront.set({
                            visible: false
                          })
                        })
                      } else {
                        self.backCanvas.add(fabric_text)
                        render_back_canvas = true
                        fabric_text.on('selected', (e: Record<any, any>) => {
                          this.showDimensions(e, self.dimTextBack)
                        })
                        self.backCanvas.on('selection:cleared', () => {
                          self.dimTextBack.set({
                            visible: false
                          })
                        })
                      }
                      if(this.back) {
                        this.backCanvasRender(render_time)
                      } else {
                        this.frontCanvasRender(render_time)
                      }
                      setTimeout(() => {
                        this.addToOtherSide(fabric_text, custom_text_item.placement, true)
                      }, render_time * 4)
                    })
                  }
                }
                else {
                  fabric_text = new fabric.Text(custom_text.value, {
                    left: self.canvasWidth / self.mainCanvasWidth * custom_text_item.x_axis,
                    top: self.canvasHeight / self.mainCanvasHeight * custom_text_item.y_axis,
                    angle: custom_text_item.rotation < 0? 360 - custom_text_item.rotation : custom_text_item.rotation  as number,
                    centeredScaling: true,
                    selectable: this.canvasSelection,
                    hasControls: true,
                    hasBorders: false,
                    evented: true,
                    originX: 'center',
                    originY: 'center',
                    globalCompositeOperation: 'source-atop',
                    //todo sometime font family is null
                    fontFamily: custom_text.font_family ? custom_text.font_family : 'Ubuntu',
                    fontSize: self.canvasHeight / self.mainCanvasHeight * custom_text_item.height,
                    fill: custom_text_item.color,
                    paintFirst: 'stroke',
                    lockScalingFlip: true,
                    padding: 15,
                    cornerSize: 30,
                    _fontSizeMult: .835,
                    placement: custom_text_item.placement,
                    visible: custom_text_item.selected,
                    custom_text_index: custom_text_index,
                    custom_text_item_index: customTextItemIndex,
                    side: custom_text_item.placement,
                    text_index: custom_text_index,
                    manually_added: custom_text.manually_added
                  } as fabric.TextOptions)
                  fabric_text.scaleToHeight(custom_text_item.height as number)
                  if (custom_text_item.scaleX && custom_text_item.scaleY) {
                    fabric_text.scaleX = custom_text_item.scaleX
                    fabric_text.scaleY = custom_text_item.scaleY
                  }

                  fabric_text.setControlsVisibility(this.fabric_control_visibility)
                  if (!self.product_custom_text_objects[custom_text_index]) {
                    self.product_custom_text_objects[custom_text_index] = [];
                    self.product_custom_text_objects[custom_text_index][customTextItemIndex] = null;
                  }
                  self.product_custom_text_objects[custom_text_index][customTextItemIndex] = fabric_text

                  if (custom_text_item.placement.toLowerCase() == 'front') {
                    self.frontCanvas.add(fabric_text)
                    render_front_canvas = true
                  } else {
                    self.backCanvas.add(fabric_text)
                    render_back_canvas = true
                  }
                  this.applyClipPath(fabric_text as fabric.Group, custom_text_item.placement)
                }
              }
            })
          }
          if (render_front_canvas) {
            if (this.productType == 'customized') {
              this.front_models.forEach((model: fabric.Image) => {
                model.bringToFront()
              })
            }
            this.frontCanvasRender(render_time)
          }
          if (render_back_canvas) {
            if (this.productType == 'customized') {
              this.back_models.forEach((model: fabric.Image) => {
                model.bringToFront()
              })
            }
            this.backCanvasRender(render_time)
          }
        }
      }
    }
  }

  public async syncCustomTextsWithCustomTextsObjects() {
    let custom_texts_count = this.$store.getters.getCustomTexts().length
    let difference = custom_texts_count - this.product_custom_text_objects.length
    if(difference > 0) {
      for(let i=1; i <= difference; i++) {
        this.product_custom_text_objects.push(null as never)
      }
    }
  }

  public handleCustomTextModifiedEvent(fabric_object: Record<any, any>) {
    let self: Record<any, any> = this;
    const custom_text_index =  fabric_object.get("custom_text_index");
    const custom_text_item_index =  fabric_object.get("custom_text_item_index");
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].x_axis = fabric_object.get("left");
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].y_axis = fabric_object.get("top");
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].x_axis_3d = 0;
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].y_axis_3d = 0;
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].rotation = fabric_object.get("angle");
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].scaleX = fabric_object.get("scaleX");
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].scaleY = fabric_object.get("scaleY");
    this.frontCanvasRender()
    const width = (fabric_object.get('width') as number * fabric_object.get('scaleX') * this.measurementRatio)
    const height = (fabric_object.get('height') as number * fabric_object.get('scaleY') * this.measurementRatio)
    const outline_width = (fabric_object.get('strokeWidth') as number * fabric_object.get('scaleX') * this.measurementRatio)
    const converted_width = unitConversion(width)
    const converted_height = unitConversion(height)
    const outline_width_converted = unitConversion(outline_width)
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].originalWidth = converted_width!.value;
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].originalHeight = converted_height!.value;
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].outline_width_converted = outline_width_converted!.value;
    self.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", {index: custom_text_index, value: self.product_custom_texts[custom_text_index]})
    self.$eventBus.$emit("customTextStoreUpdated", {custom_text_index: custom_text_index, custom_text_item_index: custom_text_item_index});
  }

  public async handleCustomLogoModifiedEvent(fabric_object: Record<any, any>) {
    let self: Record<any, any> = this;
    const logo_index =  fabric_object.get("logo_index");
    if(this.custom_logos[logo_index]) {
      const width = (fabric_object.get('width') as number * fabric_object.get('scaleX') * this.measurementRatio)
      const height = (fabric_object.get('height') as number * fabric_object.get('scaleY') * this.measurementRatio)
      const converted_width = unitConversion(width)
      const converted_height = unitConversion(height)

      this.$store.commit('SET_PRODUCT_CUSTOM_LOGOS', {
        custom_logo_index: fabric_object.get("logo_index"),
        data: {
          x_axis: fabric_object.get("left"),
          y_axis: fabric_object.get("top"),
          x_axis_3d: 0,
          y_axis_3d: 0,
          rotation: fabric_object.get("angle"),
          scaleX: fabric_object.get("scaleX"),
          scaleY: fabric_object.get("scaleY"),
          actualWidth: fabric_object.get('width'),
          actualHeight: fabric_object.get('height'),
          originalWidth: converted_width!.value,
          originalHeight: converted_height!.value,
        }
      })
    }
    self.$eventBus.$emit("customLogoStoreUpdated", logo_index);
  }

  public setShowSmall(side: string): void {
    if (this.mobileScreen && this.backCanvas) {
      if (side == 'back') {
        Vue.set(this.showSmall, 'back', true)
        Vue.set(this.showSmall, 'front', false)
      } else {
        Vue.set(this.showSmall, 'front', true)
        Vue.set(this.showSmall, 'back', false)
      }
    }
  }

  public setProductionSVG() {
    let productionSVGs: Record<any, any> = {}
    productionSVGs.front = this.frontCanvas
    if (this.backCanvas) {
      productionSVGs.back = this.backCanvas
    }
    this.$store.dispatch('setProductionSVGs', productionSVGs)
  }
}
</script>

<style lang="scss" scoped>
.available-designs-section {

  .canvas-area-holder,
  .fix-space {
    a {
      flex: 0 0 100%;
      max-width: 100%;
      //&:last-child{display: none;}
    }
  }
}

.canvas-area-holder {
  a {
    h2 {
      display: none;
    }
  }

  .main_size_guide_btn{
    display: none;
  }
}

.customization-area {
  .canvas-area-holder {
    a {
      h2 {
        display: block;
        text-align: center;
      }
    }

    .main_size_guide_btn{
      display: block;
    }
  }
}

.loader {
  position: absolute;
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
  background: rgba(255, 255, 255, 0.99);
  z-index: 998;

  img {
    max-width: 15%;
    display: block;
    margin: 0 auto;
    height: auto;
  }
}
.zoom_in_out {
  font-size: 20px;
  display: flex;
  width: 30px;
  height: 28px;
  border-radius: 5px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: var(--theme-color);
  color: white !important;
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */

  &:active{
    color: var(--theme-color) !important;
    background: var(--theme-color-light);
  }
}

.main_size_guide_btn{
  position: absolute;
  left: 0;
  top: 0;
  transform: translateY(50%);
  color: #fff !important;
}
</style>
