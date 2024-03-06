<template>
  <div class="loading-holder">
    <div class="loader" v-if="showLoader"><img src="@assets/images/loading.gif" /></div>
    <div class="canvas-area-holder" :class="{ 'fix-space': !manageComponents.mobileScreen }" style="display: flex; justify-content: space-between;">
      <div id="canvas_container">
        <canvas ref="canvas" id="canvas" class="canvas" :width="canvasResolution" :height="canvasResolution"></canvas>
      </div>
      <div ref="renderer" id="renderer"></div>
    </div>
  </div>
</template>

<script lang="ts">
const logo = { //test logo object
  "id": 36361,
  "rotation": 0,
  "originalWidth": "5.8",
  "originalHeight": "5.8",
  "width": 0,
  "height": 40,
  "name_of_placement": "Chest",
  "side": "front",
  "x_axis": 282.2173913043478,
  "y_axis": 209.26086956521738,
  "is_locked": 0,
  "logo_name": "A9cfihbb_811utg_5lk.png",
  "original_logo": "1/guest/logos/A9cfihbb811utg5lk16956300077MtG2DXUnZ.png",
  "transparent_logo": "1/guest/logos/A9cfihbb811utg5lk16956300077MtG2DXUnZ_transparent.png",
  "smart_transparent_logo": "1/guest/logos/A9cfihbb811utg5lk16956300077MtG2DXUnZ_smart_transparent.png",
  "original_logo_url": "1/guest/logos/A9cfihbb811utg5lk16956300077MtG2DXUnZ.png",
  "is_smart_transparent": false,
  "url": "1/guest/logos/A9cfihbb811utg5lk16956300077MtG2DXUnZ_png.png",
  "haveControls": true,
  "is_replace_success": false,
  "logo_index": 0,
  "is_vector": false,
  "logos_follows_product": 0,
  "created_at": "2023-10-31T15:32:39.000000Z",
  "updated_at": "2023-10-31T15:32:39.000000Z",
  "actualWidth": 543,
  "actualHeight": 542,
  "scaleX": 0.07366482504604217,
  "scaleY": 0.07366482504604052
}

import {Component, Mixins, Prop, Vue} from 'vue-property-decorator'
import {fabric} from 'fabric'
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import {getClosestColor} from '@/pantoneColor'
import rgbHex from 'rgb-hex'
import {
  checkIsEmpty, getColorType, getDeviceInfo,
  getSelectedProductPantones,
  unitConversion
} from '@/helpers/Helpers'
import {HideUpdateLockerButton} from '@/mixins/SelectedProductMixin'
import CustomLogosMixin from '@/mixins/CustomLogosMixin'
import {Object3D, Texture} from "three";

@Component<ThreeDScene>({
  beforeDestroy() {
    const self = this
    self.$eventBus.$off("customTextUpdated", this.addTextsNew)
    self.$eventBus.$off("customTextRemoved", this.deleteExistingTextsFromCanvas)
    self.$eventBus.$off("resetTextsCanvas", this.resetTextsFromCanvas)
    self.$eventBus.$off("handleCustomLogoUpdatedEvent", this.addLogo)
    self.$eventBus.$off("customLogoResetAndAdd", this.resetAndAddLogos) // some time on edit product is already loaded so load scene is not called then this function called
    self.$eventBus.$off("fixedLogoResetAndAdd", this.resetAndAddFixedLogos)
    self.$eventBus.$off("customLogoRemoved", this.deleteExistingLogoFromCanvas)
    self.$eventBus.$off("resetLogosCanvas", this.resetLogosFromCanvas)
    self.$eventBus.$off("changeDefaultColors", this.changeDefaultColorsEvent)
    self.$eventBus.$off("changeGroupColors", this.changeGroupColors)
    self.$eventBus.$off("useProductOriginalColors", this.setInitialColors)
    self.$eventBus.$off("changeColors", this.changeColors)
  },
  async mounted() {
    this.loadScene(this.imageData)
  }
})

export default class ThreeDScene extends Mixins(HideUpdateLockerButton, CustomLogosMixin) {
  @Prop({ required: true }) readonly imageData!: Record<string, unknown>
  @Prop({ required: false }) readonly logos !: [Record<string, any>];
  @Prop({ required: false, default: () => { return [] } }) readonly texts !: [Record<string, any>];
  @Prop({ required: false }) readonly product_id !: number
  @Prop({ required: false }) readonly product_index !: number
  @Prop({ required: false, default: () => { return [] } }) readonly productNamesSetting !: [Record<any, any>]
  @Prop({ required: false, default: false }) readonly logoAllowed !: boolean
  @Prop({ required: false }) readonly logosLimit !: number
  @Prop({ required: false }) readonly productColors !: [Record<string, any>];
  @Prop({ required: true, default: 10 }) readonly measurementRatio!: number;
  @Prop({ required: false, default: 2048 }) readonly mainCanvasResolution!: number;
  @Prop({ required: false, default: 2048 }) readonly canvasResolution!: number;
  @Prop({ required: false, default: 512 }) readonly containerWidth!: number;
  @Prop({ required: false, default: 512 }) readonly containerHeight!: number;
  @Prop({ required: false, default: false }) readonly mainPreview!: boolean;
  @Prop({ required: false, default: true }) readonly canvasSelection!: boolean;
  @Prop({ required: false, default: 'customized' }) readonly productType!: string;
  @Prop({ required: false }) readonly colorGrouping!: Record<any, any>;
  @Prop({ required: true }) readonly products_fonts!: Record<any, any>;
  @Prop({required: false, default: false}) readonly fromRosterModal!: boolean;

  private fabric_canvas_resolution: 1200
  private scene = new THREE.Scene()
  private camera !: THREE.Camera
  private renderer = new THREE.WebGLRenderer({ 'alpha': false, 'antialias': true })
  private container!: HTMLDivElement
  private controls!: OrbitControls
  private raycaster = new THREE.Raycaster()
  private onClickPosition = new THREE.Vector2()
  private mouse = new THREE.Vector2()
  private isMobile = false
  private device_info = getDeviceInfo()
  private last_known_image_pos = {left: 0, top: 0}
  private canvas !: fabric.Canvas
  private design !: any
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  private custom_logo_objects: any[] = []
  private fixed_logo_objects: any[] = []
  private mounted = false
  private model!: Object3D
  private texture!: Texture
  private svgGroups: any[] = []
  private initialSvgGroups: any[] = []
  public showLoader = true
  public product_custom_texts: Record<any, any>[] = []
  public product_custom_text_objects: Record<any, any>[] | null[] = []
  private storage_url = process.env.VUE_APP_STORAGE_URL
  public fabric_control_visibility = { tl: false, bl: false, tr: true, br: true, ml: false, mb: false, mr: false, mt: false, mtr: false }

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

  get manageComponents(): Record<any, any> {
    return this.$store.getters.getManageComponents
  }

  get defaultColors(): [Record<any, any>] {
    return this.$store.getters.getDefaultColors.filter((defaultColor: Record<any, any>) => { return defaultColor.color })
  }

  get groupColors(): [Record<any, any>] {
    return this.$store.getters.getGroupColors
  }

  get selectedProductId(): number {
    return this.$store.getters.getSelectedProductId
  }

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get styleIndex():number{
    return this.$store.getters.getCurrentStyleIndex;
  }

  get productCustomTexts(): Record<any, any>[] {
    if(this.product_id) {
      return this.$store.getters.productCustomTexts(this.product_id)
    }
    return []
  }

  get allProductsCustomTexts(): Record<any, any> {
    return this.$store.getters.productCustomTexts()
  }

  get is_safari(): boolean {
    return this.$store.getters.getIsSafari
  }

  get sku_information(){
    return this.$store.getters.getSkuInformation
  }

  public getSvgGroupColors(svg_group: string) {
    if(svg_group && this.selectedProduct.svg_group_color_container && this.selectedProduct.svg_group_color_container[svg_group]) {
      return this.selectedProduct.svg_group_color_container[svg_group]
    }
    return false
  }

  public async changeColors() {
    if(this.mounted) {
      await this.changeDefaultColors()
      await this.changeGroupColors()
    }
  }

  public async changeGroupColors() {
    if(this.productType == 'customized') {
      if (Object.keys(this.groupColors).length) {
        let defaultColors = this.defaultColors.filter((color: Record<any, any>) => color.color) as [Record<any, any>]
        let groupColors = this.groupColors
        let design = this.design._objects ? this.design._objects : [this.design]
        design.forEach((item: Record<any, any>) => {
          if(item.id) {
            item.id = item.id.toLowerCase()
            if (groupColors[item.id]) {
              if (item.fill && item.fill.gradientUnits && groupColors[item.id].gradient_colors) {
                groupColors[item.id].gradient_colors.forEach((gradient_color, gradient_color_index) => {
                  const final_color = this.getGroupColorBySvgGroup(item.id as string, gradient_color_index)
                  item.fill.colorStops[gradient_color_index].color = final_color.color
                })
                item.set('fill', new fabric.Gradient(item.fill))
              } else {
                const final_color = this.getGroupColorBySvgGroup(item.id as string)
                item.set('fill', final_color.color)
              }
              this.svgGroups.forEach((svgGroup: Record<any, any>, index: number) => {
                if (svgGroup.id == item.id) {
                  if (svgGroup.gradient_colors) {
                    groupColors[item.id].gradient_colors.forEach((gradient_color, gradient_color_index) => {
                      const final_color = this.getGroupColorBySvgGroup(item.id as string, gradient_color_index)
                      svgGroup.gradient_colors[gradient_color_index].color = final_color.color
                      svgGroup.gradient_colors[gradient_color_index].pantone = final_color.pantone
                      svgGroup.gradient_colors[gradient_color_index].name = final_color.name
                    })
                  } else {
                    const final_color = this.getGroupColorBySvgGroup(item.id as string)
                    svgGroup.color = final_color.color
                    svgGroup.name = final_color.name
                    svgGroup.pantone = final_color.pantone
                  }
                }
              })
            } else if (!defaultColors.length) {
              this.svgGroups.forEach((svgGroup: Record<any, any>, index: number) => {
                if (svgGroup.id == item.id) {
                  if (item.fill && item.fill.gradientUnits) {
                    item.fill.colorStops.forEach((gradient: Record<any, any>, gradient_index: number) => {
                      if (this.initialSvgGroups[index][gradient_index]) {
                        gradient.color = this.initialSvgGroups[index][gradient_index].color
                      }
                    })
                    item.set('fill', new fabric.Gradient(item.fill));
                  } else {
                    item.set('fill', this.initialSvgGroups[index].color)
                  }
                  Object.assign(this.svgGroups[index], this.initialSvgGroups[index])
                }
              })
            }
          }
        })
        this.canvas.requestRenderAll()
        this.unHideColorGrouping()
      }
    }
  }

  public getGroupColorBySvgGroup(svg_group: string, gradient_color_index: number|null = null) {
    let groupColor
    if(gradient_color_index != null) {
      groupColor = this.groupColors[svg_group].gradient_colors[gradient_color_index]
    } else {
      groupColor = this.groupColors[svg_group]
    }
    let final_color
    if(this.getSvgGroupColors(svg_group) && !this.getSvgGroupColors(svg_group).json_data.some(color => color.value === groupColor.color)) {
      const selectProductPantonesList = getSelectedProductPantones(this.product_id, svg_group)
      final_color = getClosestColor(groupColor.color as string, selectProductPantonesList, getColorType(svg_group, this.product_id))
      final_color.color = final_color.hex
    } else {
      final_color = groupColor
    }
    return final_color
  }

  public getDefaultColorBySvgGroup(svg_group: string, defaultColorOriginal) {
    let final_color
    if(this.getSvgGroupColors(svg_group) && !this.getSvgGroupColors(svg_group).json_data.some(color => color.value === defaultColorOriginal.color)) {
      const selectProductPantonesList = getSelectedProductPantones(this.product_id, svg_group)
      final_color = getClosestColor(defaultColorOriginal.color as string, selectProductPantonesList, getColorType(svg_group, this.product_id))
      final_color.color = final_color.hex
    } else {
      final_color = defaultColorOriginal
    }
    return final_color
  }

  public changeDefaultColorsEvent() {
    this.changeDefaultColors()
  }

  public async changeDefaultColors(): Promise<void> {
    if(this.productType == 'customized') {
      let defaultColors = this.defaultColors.filter((color: Record<any, any>) => color.color) as [Record<any, any>]
      if (defaultColors.length) {
        let appliedDefaultColors: string[]|string[][] = []
        let useColorIndex = 0
        this.svgGroups.forEach((svgGroup: Record<any, any>, index: number) => {
          if(svgGroup.gradient_colors) {
            let gradient_colors: string[] = []
            svgGroup.gradient_colors.forEach((gradient_color, gradient_color_index) => {
              const final_color = this.getDefaultColorBySvgGroup(svgGroup.id, defaultColors[useColorIndex])
              gradient_colors.push(final_color.color)
              svgGroup.gradient_colors[gradient_color_index].color = final_color.color
              svgGroup.gradient_colors[gradient_color_index].pantone = final_color.pantone
              svgGroup.gradient_colors[gradient_color_index].name = final_color.name
              useColorIndex++
              if (useColorIndex >= defaultColors.length) {
                useColorIndex = 0
              }
            })
            appliedDefaultColors[svgGroup.id] = gradient_colors
          } else {
            const final_color = this.getDefaultColorBySvgGroup(svgGroup.id, defaultColors[useColorIndex])
            appliedDefaultColors[svgGroup.id] = final_color.color
            svgGroup.color = final_color.color
            svgGroup.pantone = final_color.pantone
            svgGroup.name = final_color.name
            useColorIndex++
            if (useColorIndex >= defaultColors.length) {
              useColorIndex = 0
            }
          }
        })

        let design = this.design._objects ? this.design._objects : [this.design]
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
        this.canvas.requestRenderAll()
        this.unHideColorGrouping()
      }
    }
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

    let design = this.design._objects? this.design._objects : [this.design]
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
    this.canvas.requestRenderAll()
  }

  public unHideColorGrouping() {
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
            let design = this.design._objects? this.design._objects : [this.design]
            design.forEach((item: Record<any, any>) => {
              item.id = item.id.toLowerCase()
              if (key.toLowerCase() == item.id) {
                item.set('fill', changeColor.value);
              }
            })
            this.canvas.requestRenderAll()
            let svgIndex = 0
            let svgGroupId = null;
            this.svgGroups.forEach((svgGroup: Record<any, any>, index: number) => {
              if (svgGroup.id == key.toLowerCase()) {
                svgIndex = index
                svgGroupId = svgGroup.id
                svgGroup.color = changeColor.value
                svgGroup.name = changeColor.name
                svgGroup.pantone = changeColor.pantone
              }
            })
          }
        })
      }
    }
  }

  public async getSvgGroups() {
    this.svgGroups = []
    this.initialSvgGroups = []
    let design = this.design._objects? this.design._objects : [this.design]
    design.forEach((item: Record<any, any>) => {
      if(item.id) {
        item.set('id', item.id.split('_')[0])
        item.id = item.id.toLowerCase()
        if (!item.id.includes('noncustomizable') && !item.id.includes('inside') && !this.containsObject({id: item.id})) {
          let count = 1
          if (item.id == 'base') {
            count = 100000 // to make base always at first color position
          }
          if (item.fill && item.fill.gradientUnits) {
            let gradient_colors: Record<any, any>[] = []
            item.fill.colorStops.forEach((color_stop: Record<any, any>) => {
              if (color_stop.color.includes('rgb')) {
                color_stop.color = rgbHex(color_stop.color).includes('#') ? rgbHex(color_stop.color) : '#' + rgbHex(color_stop.color);
              }
              let pantoneColor: Record<any, any> = {pantone: '', name: ''}
              gradient_colors.push({color: color_stop.color, pantone: pantoneColor.pantone, name: pantoneColor.name})
            })

            this.svgGroups.push({id: item.id, count: count, gradient_colors: gradient_colors})
          } else {
            if (item.fill.includes('rgb')) {
              item.fill = rgbHex(item.fill as string).includes('#') ? rgbHex(item.fill as string) : '#' + rgbHex(item.fill as string)
            }
            let pantoneColor: Record<any, any> = {pantone: '', name: ''}

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

    this.svgGroups = this.svgGroups.sort((a, b) => (a.count < b.count) ? 1 : -1)
    this.initialSvgGroups = JSON.parse(JSON.stringify(this.svgGroups))

    await this.changeDefaultColors()

    await this.changeGroupColors()

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

  public loadScene(ImageData: Record<any, any>) {
    this.mounted = false

    this.container = this.$refs.renderer as HTMLDivElement

    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
    this.camera.position.set(0, 0.5, 11.5);

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.3
    this.renderer.setSize(this.containerWidth, this.containerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)

    // this.camera.updateProjectionMatrix()
    this.container.appendChild(this.renderer.domElement)

    this.scene.background = new THREE.Color(0xffffff);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(0, 20, 50);
    this.scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight2.position.set(0, 20, -50);
    this.scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight3.position.set(-20, 20, 0);
    this.scene.add(directionalLight3);

    const directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight4.position.set(20, 20, 0);
    this.scene.add(directionalLight4);

    const element = this.$refs.canvas as HTMLCanvasElement
    this.canvas = new fabric.Canvas(element)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.minDistance = -500
    this.controls.maxDistance = 500
    this.controls.target.set(0, 0, 0)
    this.controls.update()

    this.texture = new THREE.CanvasTexture(element)
    this.texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()

    let promises = []
    promises.push(this.addModel(ImageData.model_url, ImageData.texture_url) as never)
    promises.push(this.addDesign(ImageData.design_url +'.'+ ImageData.file_extension) as never)

    Promise.all(promises).then((values) => {
      this.getSvgGroups()

      this.addFixedLogos()

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

      this.scene.add(this.model)
      this.renderScene()
      this.controls.update()
      this.animate()

      this.listenEvents()
      this.showLoader = false
      this.mounted = true
    })
  }

  public listenEvents() {
    const self: Record<any, any> = this;
    self.$eventBus.$on("customTextUpdated", this.addTextsNew)
    self.$eventBus.$on("customTextRemoved", this.deleteExistingTextsFromCanvas)
    self.$eventBus.$on("resetTextsCanvas", this.resetTextsFromCanvas)
    self.$eventBus.$on("handleCustomLogoUpdatedEvent", this.addLogo)
    self.$eventBus.$on("customLogoResetAndAdd", this.resetAndAddLogos) // some time on edit product is already loaded so load scene is not called then this function called
    self.$eventBus.$on("fixedLogoResetAndAdd", this.resetAndAddFixedLogos)
    self.$eventBus.$on("customLogoRemoved", this.deleteExistingLogoFromCanvas)
    self.$eventBus.$on("resetLogosCanvas", this.resetLogosFromCanvas)
    self.$eventBus.$on("changeDefaultColors", this.changeDefaultColorsEvent)
    self.$eventBus.$on("changeGroupColors", this.changeGroupColors)
    self.$eventBus.$on("useProductOriginalColors", this.setInitialColors)
    self.$eventBus.$on("changeColors", this.changeColors)
  }

  public async addModel(modelUrl: string, designUrl: string) {
    return new Promise((resolve, reject) => {
      const gltfLoader = new GLTFLoader(undefined)
      gltfLoader.load(this.storage_url + modelUrl, (gltf) => {
        this.model = gltf.scene.children[0]
        this.model['material'] = new THREE.MeshPhongMaterial({ 'map': this.texture })
        this.model['material'].shininess = 10
        this.model['material'].needsUpdate = true


        this.canvas.on("after:render", () => {
          this.model['material'].needsUpdate = true
          this.model['material'].map.needsUpdate = true
        })

        if (this.model['material'].normalMap) return
        // add normal map to the material
        const textureLoader = new THREE.TextureLoader()
        const normalMap = textureLoader.load(this.storage_url + designUrl)
        normalMap.flipY = false;
        this.model['material'].normalMap = normalMap

        this.model['material'].side = THREE.DoubleSide
        this.model['material'].metalness = 0.99

        this.model['material'].needsUpdate = true
        this.model['material'].map.needsUpdate = true

        resolve('done')
      })
    })
  }

  public addDesign(designUrl: string) {
    return new Promise((resolve, reject) => {
      fabric.loadSVGFromURL(this.storage_url + designUrl, (objects: any, options: any) => {
        options.crossOrigin = 'Anonymous'
        const img = fabric.util.groupSVGElements(objects) as fabric.Group
        img.set({
          hasControls: false,
          selectable: false,
          evented: false,
          lockMovementX: true,
          lockMovementY: true,
          flipY: true
        })

        img.scaleToHeight(this.canvasResolution as number).set({
          left: 0x0,
          top: 0x0
        }).setCoords()

        this.design = img

        this.canvas.add(img).renderAll()
        img.sendBackwards()

        this.design = img

        resolve('done')
      })
    })
  }

  public renderScene() {
    this.renderer.render(this.scene, this.camera)
  }

  public animate() {
    requestAnimationFrame(this.animate)
    this.texture.needsUpdate = true
    this.controls.update()
    this.renderScene()
  }

  public addSvgLogos(logo: Record<any, any>) {
    let logoUrl = encodeURI((this.storageUrl + logo.url).trim()) + '?nocache=11'
    fabric.loadSVGFromURL(logoUrl, (objects: any, options: any) => {
      options.crossOrigin = 'Anonymous'
      const img = fabric.util.groupSVGElements(objects) as fabric.Group
      img.scaleToHeight(this.canvasResolution / this.canvasResolution * logo.height as number)
      img.set({
        left: this.canvasResolution / this.mainCanvasResolution * logo.x_axis,
        top: this.canvasResolution / this.mainCanvasResolution * logo.y_axis,
        angle: logo.rotation < 0? this.oppositeAngle(360 - logo.rotation) : this.oppositeAngle(logo.rotation)  as number,
        hasControls: false,
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
        globalCompositeOperation: 'source-atop',
      })

      this.canvas.add(img)
      Object.assign(img, {
        fixed_logo_index: logo.fixed_logo_index,
        side: logo.side,
        type: 'fixed_logo'
      })
      this.fixed_logo_objects.push(img)
      this.canvas.requestRenderAll()
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
      this.logos.forEach((logo: Record<any, any>, index: number) => {
        const is_fixed_logos_all =  this.selectedProduct.productstyles[this.styleIndex].is_fixed_logos_all
        if(is_fixed_logos_all || (is_fixed_logos_all == false && logo.is_default))
          if (logo && logo.url) {
            logo.fixed_logo_index = index
            this.addSvgLogos(logo)
          }
      })
    }
  }

  public async resetFixedLogosFromCanvas() {
    if(this.selectedProductId == this.product_id && this.fixed_logo_objects) {
      for (let objectIndex = 0; objectIndex < this.fixed_logo_objects.length; objectIndex++) {
        const fixed_logo = this.fixed_logo_objects[objectIndex]
        if(fixed_logo) {
          this.canvas.remove(fixed_logo)
        }
      }
      this.canvas.requestRenderAll()
      this.fixed_logo_objects = []
    }
  }

  public addLogo(logo: Record<any, any>, from_load = false, testing = false) {
    if(!testing) {
      logo = this.custom_logos ? this.custom_logos[logo.logo_index] : {}
    }
    if(testing || (!checkIsEmpty(logo) && logo && logo.product_id == this.product_id && (this.mounted || from_load))) {
      if(this.custom_logo_objects[logo.logo_index as number]) {
        this.deleteExistingLogoFromCanvas(logo.logo_index)
      }
      if (logo.url && !this.custom_logo_objects[logo.logo_index as number]) {
        if (logo.customLogo) {
          this.custom_logo_objects[logo.logo_index as number] = true
        }
        logo.haveControls = Boolean(logo.haveControls)
        let logoUrl = encodeURI((this.storageUrl + logo.url).trim()) + '?nocache=11'
        fabric.Image.fromURL(logoUrl, async (img: any) => {
          const aspect_ratio = img.width / img.height
          if(aspect_ratio > 1) {
            img.scaleToWidth(this.canvasResolution / this.canvasResolution * (logo.height) as number)
          } else {
            img.scaleToHeight(this.canvasResolution / this.canvasResolution * (logo.height) as number)
          }
          img.set({
            left: 1120,
            top: 1340,
            angle: logo.rotation < 0? this.oppositeAngle(360 - logo.rotation) : this.oppositeAngle(logo.rotation)  as number,
            selectable: true,
            hasControls: true,
            hasBorders: true,
            evented: true,
            globalCompositeOperation: 'source-atop',
            padding: 15,
            cornerSize: 30,
            flipX: true,
            type: "logo",
          })

          img.setControlsVisibility(this.fabric_control_visibility)

          Object.assign(img, {
            logo_index: logo.logo_index,
            side: logo.side
          })
          this.canvas.add(img)
          // if (this.productType == 'customized') {
          //   models.forEach((model: fabric.Image) => {
          //     model.bringToFront()
          //   })
          // }
          this.canvas.requestRenderAll()

          this.custom_logo_objects[logo.logo_index as number] = img

          img.on('selected', (e: Record<any, any>) => {
            this.$root.$emit('changeLogoTabIndex', logo.logo_index)
          })

          this.renderScene()

          this.addGetPointerToFabricPrototype()
        }, { crossOrigin: 'Anonymous' })
      }
    }
  }

  public oppositeAngle(angle) {
    return (180 - angle + 360) % 360;
  }

  public async deleteExistingLogoFromCanvas(custom_logo_index: number) {
    if(custom_logo_index == 0 || this.custom_logos[custom_logo_index] && this.custom_logos[custom_logo_index].product_id == this.product_id) {
      const custom_logo = this.custom_logo_objects[custom_logo_index]
      if (custom_logo) {
        this.canvas.remove(custom_logo)
        this.canvas.requestRenderAll()
      }
      this.custom_logo_objects[custom_logo_index] = null
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

  public async resetLogosFromCanvas() {
    if(this.custom_logo_objects) {
      for (let objectIndex = 0; objectIndex < this.custom_logo_objects.length; objectIndex++) {
        const custom_logo = this.custom_logo_objects[objectIndex]
        if(custom_logo) {
          this.canvas.remove(custom_logo)
        }
      }
      this.canvas.requestRenderAll()
      this.custom_logo_objects = []
    }
  }

  public async resetTextsFromCanvas() {
    if(this.product_custom_text_objects) {
      for (let objectIndex = 0; objectIndex < this.product_custom_text_objects.length; objectIndex++) {
        const custom_text = this.product_custom_text_objects[objectIndex] as Record<any, any>
        if(custom_text != null) {
          for(let i = 0; i < custom_text.length; i++) {
            this.canvas.remove(custom_text[i])
          }
        }
      }
      this.canvas.requestRenderAll()
      this.product_custom_text_objects = []
    }
  }

  public async deleteExistingTextsFromCanvas(custom_text_index:  number, remove_custom_text_object = true) {
    const self: Record<any, any> = this;
    const custom_text = self.product_custom_text_objects[custom_text_index]
    if(custom_text) {
      for(let i = 0; i < custom_text.length; i++) {
        self.canvas.remove(custom_text[i])
      }
      this.canvas.requestRenderAll()
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

        this.product_custom_texts[custom_text_index] = custom_text_info.value;

        let add_custom_text = await this.isCustomTextAllowed(custom_text_index);
        if(add_custom_text) {
          let custom_text = this.allProductsCustomTexts[this.product_id][custom_text_index];
          /*
           * delete existing texts first and re render them
           * */
          if (this.product_custom_text_objects[custom_text_index]) {
            await this.deleteExistingTextsFromCanvas(custom_text_index, false)
          }
          if (Object.keys(custom_text).length && custom_text.value) {
            custom_text.items.forEach((custom_text_item: Record<any, any>, customTextItemIndex: number) => {
              let fabric_text: fabric.Text | fabric.Group | Record<any, any>

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
                    left: 1120,
                    top: 1240,
                    angle: custom_text_item.rotation < 0? this.oppositeAngle(360 - custom_text_item.rotation) : this.oppositeAngle(custom_text_item.rotation)  as number,
                    flipX: true,
                    centeredScaling: true,
                    selectable: true,
                    hasControls: true,
                    hasBorders: true,
                    evented: true,
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
                    manually_added: custom_text.manually_added
                  })

                  fabric_text.setControlsVisibility(this.fabric_control_visibility)

                  if(this.product_id == this.selectedProductId) {
                    this.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", {index: custom_text_index, value: { items: this.product_custom_texts[custom_text_index].items }})
                  }

                  if (!this.product_custom_text_objects[custom_text_index]) {
                    this.product_custom_text_objects[custom_text_index] = []
                    self.product_custom_text_objects[custom_text_index][customTextItemIndex] = null
                  }
                  self.product_custom_text_objects[custom_text_index][customTextItemIndex] = fabric_text

                  self.canvas.add(fabric_text)
                  fabric_text.bringToFront()
                  this.canvas.renderAll()

                  this.addGetPointerToFabricPrototype()
                })
              }
            })
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
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].rotation = fabric_object.get("angle");
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].scaleX = fabric_object.get("scaleX");
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].scaleY = fabric_object.get("scaleY");
    this.canvas.requestRenderAll()
    const width = (fabric_object.get('width') as number * fabric_object.get('scaleX') * this.measurementRatio)
    const height = (fabric_object.get('height') as number * fabric_object.get('scaleY') * this.measurementRatio)
    const converted_width = unitConversion(width)
    const converted_height = unitConversion(height)
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].originalWidth = converted_width!.value;
    self.product_custom_texts[custom_text_index].items[custom_text_item_index].originalHeight = converted_height!.value;
    self.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", {index: custom_text_index, value: self.product_custom_texts[custom_text_index]})
    self.$eventBus.$emit("customTextStoreUpdated", {custom_text_index: custom_text_index, custom_text_item_index: custom_text_item_index});
  }


  addGetPointerToFabricPrototype() {
    const self = this
    /*******
     * Listeners event
     */
    fabric.Canvas.prototype.getPointer = function (e, ignoreZoom) {
      if (this._absolutePointer && !ignoreZoom) {
        self.controls.enabled = false;
        return this._absolutePointer;
      }
      if (this._pointer && ignoreZoom) {
        if (self.controls.enabled === false) {
          self.controls.enabled = true;
        }
        return this._pointer;
      }
      let simEvt, pointer, cssScale
      let upperCanvasEl = this.upperCanvasEl
      let bounds = upperCanvasEl.getBoundingClientRect()
      let boundsWidth = bounds.width || 0
      let boundsHeight = bounds.height || 0
      if (e.touches != undefined) {
        simEvt = new MouseEvent({
          'touchstart': 'mousedown',
          'touchmove': 'mousemove',
          'touchend': 'mouseup'
        }[e.type], {
          bubbles: true,
          cancelable: true,
          view: window,
          detail: 1,
          screenX: Math.round(e.changedTouches[0].screenX),
          screenY: Math.round(e.changedTouches[0].screenY),
          clientX: Math.round(e.changedTouches[0].clientX),
          clientY: Math.round(e.changedTouches[0].clientY),
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
          metaKey: false,
          button: 0,
          relatedTarget: null
        })
        pointer = fabric.util.getPointer(simEvt, upperCanvasEl)
      } else {
        pointer = fabric.util.getPointer(e, upperCanvasEl)
      }

      if (!boundsWidth || !boundsHeight) {
        if ('top' in bounds && 'bottom' in bounds) {
          boundsHeight = Math.abs(bounds.top - bounds.bottom);
        }
        if ('right' in bounds && 'left' in bounds) {
          boundsWidth = Math.abs(bounds.right - bounds.left);
        }
      }
      this.calcOffset();
      pointer.x = pointer.x - this._offset.left;
      pointer.y = pointer.y - this._offset.top;
      /* BEGIN PATCH CODE */
      if (e.target !== this.upperCanvasEl) {
        let positionOnScene;
        if (self.isMobile == true) {
          positionOnScene = getPositionOnSceneTouch(self.container, e);
          if (positionOnScene) {
            pointer.x = positionOnScene.x;
            pointer.y = positionOnScene.y;
          }
        } else {
          positionOnScene = getPositionOnScene(self.container, e);
          if (positionOnScene) {
            pointer.x = positionOnScene.x;
            pointer.y = positionOnScene.y;
          }
        }
      }
      /* END PATCH CODE */
      if (!ignoreZoom) {
        pointer = this.restorePointerVpt(pointer);
      }

      if (boundsWidth === 0 || boundsHeight === 0) {
        cssScale = { width: 1, height: 1 };
      }
      else {
        cssScale = {
          width: upperCanvasEl.width / boundsWidth,
          height: upperCanvasEl.height / boundsHeight
        };
      }

      return {
        x: pointer.x * cssScale.width,
        y: pointer.y * cssScale.height
      };
    }



    //container.addEventListener('mousedown', onMouseEvt, ![]),
    self.container.addEventListener('mousedown', onMouseEvt, false)
    if (self.device_info.is_mobile) {
      self.isMobile = true;
      self.container.addEventListener("touchstart", onTouch, false)
    }

    self.canvas.on('mouse:down', function (event) {
      const x = event.e.clientX - self.canvas['_offset'].left
      const y = event.e.clientY - self.canvas['_offset'].top
      // console.log(`X: ${x}, Y: ${y}`)
    });


    //fixing bug when object is dropped outside of 3d model
    self.canvas.on('object:moving', function(evt) {
      let array = getMousePosition(self.container, evt.e.clientX, evt.e.clientY);
      self.onClickPosition.fromArray(array);
      let intersects = getIntersects(self.onClickPosition, self.scene.children);
      if(intersects.length === 0) {
        //return to the last known position
        let active_object = self.canvas.getActiveObject()
        if(active_object) {
          active_object.left = self.last_known_image_pos.left as number
          active_object.top = self.last_known_image_pos.top as number
          active_object.setCoords()
        }
      } else {
        self.last_known_image_pos = {left: evt.target? evt.target.left as number : 0, top: evt.target? evt.target.top as number : 0}
      }
    })


    /**
     * Event handlers
     */
    function onTouch(evt) {
      evt.preventDefault();
      const positionOnScene = getPositionOnSceneTouch(self.container, evt);
      if (positionOnScene) {
        //const canvasRect = self.canvas._offset;
        const simEvt = new MouseEvent(evt.type, {
          clientX: positionOnScene.x,
          clientY: positionOnScene.y,
        });
        self.canvas['upperCanvasEl'].dispatchEvent(simEvt)
      }
    }

    function getPositionOnSceneTouch(sceneContainer, evt) {
      let array = getMousePosition(sceneContainer, evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);
      self.onClickPosition.fromArray(array);
      let intersects = getIntersects(self.onClickPosition, self.scene.children);
      if (intersects.length > 0 && intersects[0].uv) {
        let uv = intersects[0].uv;
        intersects[0].object['material'].map.transformUv(uv);
        let circle = new fabric.Circle({
          radius: 3,
          left: getRealPosition("x", uv.x),
          top: getRealPosition("y", uv.y),
          fill: "white",
        });
        return {
          x: getRealPosition("x", uv.x),
          y: getRealPosition("y", uv.y),
        };
      } else {
        self.controls.enabled = !![];
      }
      return null;
    }

    function onMouseEvt(evt) {
      evt.preventDefault();
      const positionOnScene = getPositionOnScene(self.container, evt)
      if (positionOnScene) {
        //const canvasRect = self.canvas._offset;
        const simEvt = new MouseEvent(evt.type, {
          clientX: positionOnScene.x,
          clientY: positionOnScene.y
        });
        self.canvas['upperCanvasEl'].dispatchEvent(simEvt);
      }
    }

    /**
     * Three.js Helper functions
     */
    function getPositionOnScene(sceneContainer, evt) {
      let array = getMousePosition(self.container, evt.clientX, evt.clientY)
      self.onClickPosition.fromArray(array)
      let intersects = getIntersects(self.onClickPosition, self.scene.children)
      if (intersects.length > 0 && intersects[0].uv) {
        const uv = intersects[0].uv
        intersects[0].object['material'].map.transformUv(uv)
        return {
          x: getRealPosition('x', uv.x),
          y: getRealPosition('y', uv.y)
        }
      } else {
        self.controls.enabled = true;
      }
      return null
    }

    function getRealPosition(axis, value) {
      let CORRECTION_VALUE = axis === "x" ? 4.5 : 5.5;
      // Value * number(should be equal to canvas width)
      return Math.round(value * self.canvasResolution) - CORRECTION_VALUE;
    }

    let getMousePosition = function (dom, x, y) {
      let rect = dom.getBoundingClientRect();
      return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
    };

    let getIntersects = function (point, objects) {
      self.mouse.set(point.x * 2 - 1, -(point.y * 2) + 1);
      self.raycaster.setFromCamera(self.mouse, self.camera);
      return self.raycaster.intersectObjects(objects);
    }
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

#canvas_container {
  display: none;
  user-select: none;
  position: relative;
}
</style>
