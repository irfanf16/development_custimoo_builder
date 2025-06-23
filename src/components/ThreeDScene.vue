<template>
  <div class="loading-holder">
    <div v-if="showLoader" class="loader"><img src="@assets/images/loading.gif"/></div>
    <div :class="{ 'fix-space': !manageComponents.mobileScreen }" class="canvas-area-holder"
         style="display: flex; justify-content: space-between;">
      <div id="canvas_container">
        <canvas id="canvas" ref="canvas" :height="canvasResolution" :width="canvasResolution" class="canvas"></canvas>
        <canvas id="temp_canvas" ref="temp_canvas" :height="canvasResolution" :width="canvasResolution"
                class="canvas"></canvas>
      </div>
      <div id="renderer" ref="renderer"></div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop, Vue} from 'vue-property-decorator'
import {fabric} from 'fabric'
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js"
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js"
import {getClosestColor} from '@/pantoneColor'
import rgbHex from 'rgb-hex'
import {
  checkIsEmpty, getColorType, getDefaultColorsObject, getDeviceInfo, getPermutation,
  getSelectedProductPantones, hideLockerProductUpdateButton, setUndoRedoItems,
  roundOff
} from '@/helpers/Helpers'
import {HideUpdateLockerButton} from '@/mixins/SelectedProductMixin'
import CustomLogosMixin from '@/mixins/CustomLogosMixin'
import {Object3D, Texture, Vector2, Vector3} from "three";
import SceneMixin from "@/mixins/SceneMixin";

@Component<ThreeDScene>({
  beforeDestroy() {
    const self: Record<any, any> = this;
    self.$eventBus.$off("customTextUpdated", this.addTexts)
    if ((this.mainPreview && this.mobileScreen) || this.fromRosterModal) {
      self.$eventBus.$off("rosterTextUpdated", this.addTexts)
    }
    if (this.mainPreview) {
      self.$eventBus.$off("storeCanvasImage", this.storeCanvasImage)
    }
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
    self.$eventBus.$off("sceneMountedAction", this.sceneMountedAction)
    self.$eventBus.$off("applyPattern", this.applyPattern)
    self.$eventBus.$off("applyAllPatterns", this.applyAllPatterns)

    //restore fabricjs function after remove
    this.removeGetPointerFromFabricPrototype()

    // dispose of all the 3D scene elements
    const cleanMaterial = material => {
      material.dispose()
      // dispose textures
      for (const key of Object.keys(material)) {
        const value = material[key]
        if (value && typeof value === 'object' && 'minFilter' in value) {
          value.dispose()
        }
      }
    }

    this.scene.traverse(object => {
      if (!object.isMesh) return

      object.geometry.dispose()

      if (object.material.isMaterial) {
        cleanMaterial(object.material)
      } else {
        // an array of materials
        for (const material of object.material) cleanMaterial(material)
      }
    })

    this.renderer.dispose()
    this.scene.clear()
    this.renderer.forceContextLoss()
  },
  async mounted() {
    const self: Record<any, any> = this;
    self.$eventBus.$off("sceneMountedAction", this.sceneMountedAction)
    self.$eventBus.$on("sceneMountedAction", this.sceneMountedAction)
    this.sceneMountedAction()
  }
})

export default class ThreeDScene extends Mixins(HideUpdateLockerButton, CustomLogosMixin, SceneMixin) {
  @Prop({required: true}) readonly imageData!: Record<string, unknown>
  @Prop({required: false, default: () => {return []}}) readonly texts !: [Record<string, any>]
  @Prop({required: false, default: () => {return []}}) readonly productNamesSetting !: [Record<any, any>]
  @Prop({required: false, default: false}) readonly logoAllowed !: boolean
  @Prop({required: false}) readonly logosLimit !: number
  @Prop({required: true, default: 10}) readonly measurementRatio!: number;
  @Prop({required: false, default: 2048}) readonly mainCanvasResolution!: number;
  @Prop({required: false, default: 2048}) readonly canvasResolution!: number;
  @Prop({required: false, default: 512}) readonly containerWidth!: number;
  @Prop({required: false, default: 512}) readonly containerHeight!: number;
  @Prop({required: false, default: 600}) readonly twoDCanvasWidth!: number;
  @Prop({required: false, default: 600}) readonly twoDCanvasHeight!: number;
  @Prop({required: false, default: true}) readonly canvasSelection!: boolean;
  @Prop({required: false, default: 'customized'}) readonly productType!: string;
  @Prop({required: false}) readonly colorGrouping!: Record<any, any>;
  @Prop({required: true}) readonly products_fonts!: Record<any, any>;
  public dimText = new fabric.Text('', {
    fontSize: 14,
    backgroundColor: '#fff',
    hasControls: false,
    selectable: false,
    evented: false,
    originX: 'center',
    originY: 'center',
    lockMovementX: true,
    lockMovementY: true,
    visible: false,
    fontFamily: 'Ubuntu',
    flipY: true,
  })
  public showLoader = true
  public positionOnScene = {x: 0, y: 0}
  public product_custom_texts: Record<any, any>[] = []
  public product_custom_text_objects: Record<any, any>[] | null[] = []
  public fabric_control_visibility = {
    tl: false,
    bl: false,
    tr: true,
    br: true,
    ml: false,
    mb: false,
    mr: false,
    mt: false,
    mtr: false
  }
  public originalCameraPosition = {x: 0, y: 0, z: 0} as Vector3
  private scene = new THREE.Scene()
  private camera !: THREE.PerspectiveCamera
  private frontCamera !: THREE.OrthographicCamera
  private backCamera !: THREE.OrthographicCamera
  private renderer = new THREE.WebGLRenderer({'alpha': false, 'antialias': true})
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
  private custom_logo_objects: any[] = []
  private mounted = false
  private model!: Object3D
  private texture!: Texture
  private initialSvgGroups: any[] = []
  private safe_zone: fabric.Group
  private patterns: Record<any, any> = {}

  get initializingProductData() {
    return this.$store.getters.getInitializingProductData
  }

  get fillColors(): [Record<any, any>] {
    return this.$store.getters.getDefaultFilledColors
  }

  get getColorType(): string {
    return this.$store.getters.getSetting('color_type');
  }

  get custom_logos(): [Record<any, any>] {
    let product_id = this.product_id ? this.product_id : this.selectedProductId
    return this.$store.getters.getCustomLogos(product_id)
  }

  get manageComponents(): Record<any, any> {
    return this.$store.getters.getManageComponents
  }

  get productCustomTexts(): Record<any, any>[] {
    if (this.product_id) {
      return this.$store.getters.productCustomTexts(this.product_id)
    }
    return []
  }

  get sku_information() {
    return this.$store.getters.getSkuInformation
  }

  get canvasWidthRatio() {
    return this.containerWidth / this.twoDCanvasWidth
  }

  get canvasHeightRatio() {
    return this.containerHeight / this.twoDCanvasHeight
  }

  public async sceneMountedAction() {
    if (!this.initializingProductData && !this.mounted) {
      await this.loadScene(this.imageData)

      this.renderControls()
    }
  }

  public storeCanvasImage() {
    this.$store.commit('STORE_CANVAS_IMAGE', {
      scene: this
    })
  }

  public async changeColors() {
    if (this.mounted) {
      await this.callChangeColors()
    }
  }

  public async callChangeColors() {
    await this.changeDefaultColors()
    await this.changeGroupColors()
  }

  public async changeGroupColors() {
    if (this.productType == 'customized') {
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

        this.logos.forEach((group_logos, index) => {
          group_logos.logos.forEach((logo, logo_index) => {
            if (logo.is_customizable && groupColors[`${logo.placement_title}`]) {
              this.changeFixedLogoColor(logo.id, logo.placement_title, groupColors[`${logo.placement_title}`].color)
            }
          })
        })
        let design = this.design._objects ? this.design._objects : [this.design]
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
        this.canvas.requestRenderAll()
        this.unHideColorGrouping()
      }
    }
  }

  public async changeDefaultColors(render_time = 300): Promise<void> {
    if (this.productType == 'customized') {
      let defaultColors = this.appliedDefaultColors
      if (defaultColors.length) {
        let appliedDefaultColors: any = []
        let useColorIndex = 0
        const sequences = getPermutation(this.shuffle_color_number, this.parts.length)
        sequences.forEach((sequence: number) => {
          const svg_part = this.parts[sequence]
          if (svg_part) {
            const [part, index] = svg_part.split('_');
            const gradient_color_index = parseInt(index) - 1 as number;
            const svgIndex = this.svgGroups.findIndex(group => group.id === part);
            if (svgIndex !== -1) {
              const svgGroup = this.svgGroups[svgIndex]
              if (svgGroup.gradient_colors) {
                const final_color = this.getDefaultColorBySvgGroup(svgGroup.id, defaultColors[useColorIndex])
                svgGroup.gradient_colors[gradient_color_index].color = final_color.color
                svgGroup.gradient_colors[gradient_color_index].pantone = final_color.pantone
                svgGroup.gradient_colors[gradient_color_index].name = final_color.name
                if (Array.isArray(appliedDefaultColors[svgGroup.id])) {
                  appliedDefaultColors[svgGroup.id].push(final_color.color);
                } else {
                  appliedDefaultColors[svgGroup.id] = [final_color.color];
                }
              } else {
                const final_color = this.getDefaultColorBySvgGroup(svgGroup.id, defaultColors[useColorIndex])
                appliedDefaultColors[svgGroup.id] = final_color.color
                svgGroup.color = final_color.color
                svgGroup.pantone = final_color.pantone
                svgGroup.name = final_color.name
              }
              if (this.mainPreview) {
                this.$store.dispatch('updateSvgGroups', {
                  index: index,
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

        let design = this.design._objects ? this.design._objects : [this.design]
        design.forEach((item: Record<any, any>) => {
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

        this.logos.forEach((group_logos, index) => {
          group_logos.logos.forEach((logo, logo_index) => {
            if (logo.is_customizable && appliedDefaultColors[`${logo.placement_title}`]) {
              useColorIndex++
              if (useColorIndex >= defaultColors.length) {
                useColorIndex = 0
              }
              this.changeFixedLogoColor(logo.id, logo.placement_title, appliedDefaultColors[`${logo.placement_title}`], defaultColors[useColorIndex])
            }
          })
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

    let appliedDefaultColors: string[] | string[][] = []
    this.svgGroups.forEach((svgGroup: Record<any, any>, index: number) => {
      if (Object.keys(defaultSvgGroups).length && defaultSvgGroups[svgGroup.id]) {
        if (svgGroup.gradient_colors) {
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

    let design = this.design._objects ? this.design._objects : [this.design]
    design.forEach((item: Record<any, any>) => {
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

    this.resetAndAddFixedLogos()
    this.canvas.requestRenderAll()
  }

  public unHideColorGrouping() {
    if (this.colorGrouping) {
      for (let key in this.colorGrouping) {
        const distinguishPart = this.svgGroups.filter((svgGroup: Record<any, any>) => { return svgGroup.id == key.toLowerCase() })
        this.colorGrouping[key].forEach((comparePartId: string) => {
          const comparePart = this.svgGroups.filter((svgGroup: Record<any, any>) => {
            return svgGroup.id == comparePartId.toLowerCase()
          })
          if (distinguishPart.length && comparePart.length && (distinguishPart[0].color == comparePart[0].color ||
            (distinguishPart[0].name && comparePart[0].name && distinguishPart[0].name == comparePart[0].name) ||
            (distinguishPart[0].pantone && comparePart[0].pantone && distinguishPart[0].pantone == comparePart[0].pantone))) {
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
              if (this.product_id) {
                pantone_product_id = this.product_id;
              }
              const selectProductPantonesList = getSelectedProductPantones(pantone_product_id)
              const closestColor = getClosestColor('#000000', selectProductPantonesList, getColorType(key, this.product_id));
              changeColor = {value: closestColor.hex, name: closestColor.name, pantone: closestColor.pantone}
            }
            let design = this.design._objects ? this.design._objects : [this.design]
            design.forEach((item: Record<any, any>) => {
              item.id = item.id.toLowerCase()
              if (key.toLowerCase() == item.id) {
                item.set('fill', changeColor.value);
              }
            })
            this.canvas.requestRenderAll()
            this.svgGroups.forEach((svgGroup: Record<any, any>, index: number) => {
              if (svgGroup.id == key.toLowerCase()) {
                svgGroup.color = changeColor.value
                svgGroup.name = changeColor.name
                svgGroup.pantone = changeColor.pantone

                if (this.mainPreview) {
                  this.$store.dispatch('updateSvgGroups', {
                    index: index,
                    ...svgGroup
                  })
                }
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
    let design = this.design._objects ? this.design._objects : [this.design]
    design.forEach((item: Record<any, any>) => {
      if (item.id) {
        item.set('id', item.id.split('_')[0])
        item.id = item.id.toLowerCase()
        if (!item.id.includes('noncustomizable') && !item.id.includes('inside') && !item.id.includes('anchor') && !this.containsObject({id: item.id})) {
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
          } else if (item.fill) {
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

    this.svgGroups = this.svgGroups.sort((a, b) => (a.count < b.count) ? 1 : -1)
    this.initialSvgGroups = JSON.parse(JSON.stringify(this.svgGroups))

    if (!this.parts) {
      this.parts = this.svgGroups.map(group => group.id)
    }

    if (this.mainPreview) {
      await this.$store.dispatch('setSvgGroups', this.svgGroups)
    }
 
    if (!this.logos.length) {
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

  public loadScene(ImageData: Record<any, any>) {
    this.mounted = false

    this.container = this.$refs.renderer as HTMLDivElement

    this.camera = new THREE.PerspectiveCamera(20, 1, 1, 10)
    this.camera.position.set(0, 0.5, 11.5);

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMapping = THREE.NoToneMapping
    this.renderer.setSize(this.containerWidth, this.containerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)

    // this.camera.updateProjectionMatrix()
    this.container.appendChild(this.renderer.domElement)

    this.scene.background = new THREE.Color(0xffffff);

    const light = new THREE.HemisphereLight(0xffffff, 0x080820, 1.4)
    this.scene.add(light)

    /*const intensity = 0.7;
    const directionalLight = new THREE.DirectionalLight(0xffffff, intensity);
    directionalLight.position.set(0, 20, 50);
    this.scene.add(directionalLight);

    // const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
    // this.scene.add( helper );

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, intensity);
    directionalLight2.position.set(0, 20, -50);
    this.scene.add(directionalLight2);

    // const helper2 = new THREE.DirectionalLightHelper( directionalLight2, 5 );
    // this.scene.add( helper2 );

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, intensity);
    directionalLight3.position.set(-20, 20, 0);
    this.scene.add(directionalLight3);

    // const helper3 = new THREE.DirectionalLightHelper( directionalLight3, 5 );
    // this.scene.add( helper3 );

    const directionalLight4 = new THREE.DirectionalLight(0xffffff, intensity);
    directionalLight4.position.set(20, 20, 0);
    this.scene.add(directionalLight4);

    // const helper4 = new THREE.DirectionalLightHelper( directionalLight4, 5 );
    // this.scene.add( helper4);
    */

    const element = this.$refs.canvas as HTMLCanvasElement
    this.canvas = new fabric.Canvas(element)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.minDistance = -500
    this.controls.maxDistance = 500
    this.controls.target.set(0, 0, 0)
    this.controls.update()

    if (!this.mainPreview) {
      this.controls.enableZoom = false;
    }

    this.texture = new THREE.CanvasTexture(element)
    this.texture.anisotropy = 1;

    let promises = []
    promises.push(this.addModel(ImageData.model_url, ImageData.texture_url) as never)
    promises.push(this.addDesign(ImageData.design_url + '.' + ImageData.file_extension) as never)

    Promise.all(promises).then(async (values) => {
      if(ImageData.safe_zone_url) {
        await this.addSafeZone(ImageData.safe_zone_url)
      }
      const self: Record<any, any> = this
      if (this.mainPreview) {
        self.$eventBus.$emit('setTotalTabs')
      }
      await this.getSvgGroups()

      await this.renderScene() // render scene must be call before calling any function that find position on 3d
      this.controls.update()
      this.animate()

      await this.addFixedLogos()

      await this.applyAllPatterns()

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
       
      if (this.productCustomTexts) {
        this.productCustomTexts.forEach((custom_text: Record<any, any>, index: number) => {
          if (custom_text.value) {
            const text = {value: custom_text, custom_text_index: index}
            this.addTexts(text, true)
          }
        })
      }

      this.canvas.add(this.dimText)
      this.canvas.on('selection:cleared', () => {
        this.dimText.set({
          visible: false
        })
      })
      this.canvas.on('object:scaling', (e: Record<any, any>) => {
        this.isObjectMoving = 0
        this.showDimensions(e)
      })
      this.canvas.on('object:moving', (e: Record<any, any>) => {
        this.isObjectMoving = 0
        this.showDimensions(e)
      })

      if (this.mainPreview && this.selectedProductId == this.product_id) {
        this.storeCanvasImage()
        this.canvas.on('object:modified', async (evt: Record<any, any>) => {
          this.logoOrTextModified(evt)
        })
        this.addGetPointerToFabricPrototype()
        setTimeout(() => {
          this.$store.commit('SET_CANVAS_READY', true);
        }, 500)
      }
      this.listenEvents()
      this.showLoader = false
      this.mounted = true
      this.$store.commit('SET_START_LOAD_DESIGNS', true)
      this.$store.commit('SET_START_LOAD_PRODUCTS', true)
    })
  }

  public async logoOrTextModified(evt: Record<any, any>) {
    const fabric_object = evt.target
    let vector = new THREE.Vector3()
    let side_changed = false
    if (evt.action == 'drag') {
      // minus correction values
      const x = evt.e.clientX + 4.5
      const y = evt.e.clientY + 5.5;
      ({vector, side_changed} = this.findPositionOn2D(x, y, fabric_object))

    }
    // vector is the variable to look
    if (fabric_object.get("type") == "text") {
      await setUndoRedoItems('customTexts', 'modified')
      this.handleCustomTextModifiedEvent(fabric_object, vector.x, vector.y, side_changed)
    } else {
      await setUndoRedoItems('customLogos', 'modified')
      this.handleCustomLogoModifiedEvent(fabric_object, vector.x, vector.y, side_changed)
    }
    this.hideLockerProductUpdateButton()
  }

  public listenEvents() {
    const self: Record<any, any> = this;
    self.$eventBus.$on("customTextUpdated", this.addTexts)
    if ((this.mainPreview && this.mobileScreen) || this.fromRosterModal) {
      self.$eventBus.$on("rosterTextUpdated", this.addTexts)
    }
    if (this.mainPreview) {
      self.$eventBus.$off("storeCanvasImage", this.storeCanvasImage)
    }
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
    self.$eventBus.$on("applyPattern", this.applyPattern)
    self.$eventBus.$on("applyAllPatterns", this.applyAllPatterns)
  }

  public fitCameraToCenteredObject(camera: THREE.PerspectiveCamera | THREE.OrthographicCamera, object: THREE.Object3D, offset: number, orbitControls: OrbitControls, renderer?: THREE.WebGLRenderer) {
    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(object);

    const size = new THREE.Vector3();
    boundingBox.getSize(size); // Get object size

    const center = new THREE.Vector3();
    boundingBox.getCenter(center); // Get object center

    if (camera instanceof THREE.PerspectiveCamera) {
      // PerspectiveCamera handling:
      const fov = camera.fov * (Math.PI / 180); // Convert vertical FOV to radians
      const fovh = 2 * Math.atan(Math.tan(fov / 2) * camera.aspect); // Horizontal FOV

      let dx = size.z / 2 + Math.abs(size.x / 2 / Math.tan(fovh / 2));
      let dy = size.z / 2 + Math.abs(size.y / 2 / Math.tan(fov / 2));
      let cameraZ = Math.max(dx, dy); // Compute distance for fitting

      if (offset !== undefined && offset !== 0) cameraZ *= offset; // Apply offset

      camera.position.set(0, 0, cameraZ); // Set camera position based on computed distance

      // Set the far plane to ensure the object is fully visible
      const minZ = boundingBox.min.z;
      const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;
      camera.far = cameraToFarEdge * 3;
      camera.updateProjectionMatrix(); // Update camera projection

      if (orbitControls !== undefined) {
        // set camera to rotate around the center
        orbitControls.target = new THREE.Vector3(0, 0, 0);
        // prevent camera from zooming out far enough to create far plane cutoff
        orbitControls.maxDistance = cameraToFarEdge
      }
    } else {
      const aspect = renderer ? renderer.domElement.width / renderer.domElement.height : 1;

      // Calculate the size of the bounding box for the object
      const boxSize = new THREE.Vector3();
      boundingBox.getSize(boxSize);

      // Set a minimum threshold for dimensions to avoid zero values
      const minDimensionThreshold = 0.1; // Minimum size to avoid zero dimensions
      const effectiveBoxSize = new THREE.Vector3(
        Math.max(boxSize.x, minDimensionThreshold),
        Math.max(boxSize.y, minDimensionThreshold),
        Math.max(boxSize.z, minDimensionThreshold)
      );

      // Use the largest dimension of the object for frustum height and add padding
      const maxDim = Math.max(effectiveBoxSize.x, effectiveBoxSize.y, effectiveBoxSize.z);

      // Set frustum height and width dynamically
      const frustumHeight = maxDim; // Frustum height is based on the largest dimension
      const frustumWidth = frustumHeight * aspect; // Adjust frustum width based on aspect ratio

      // Update the orthographic camera's frustum with correct aspect ratio
      camera.left = -frustumWidth / 2;
      camera.right = frustumWidth / 2;
      camera.top = frustumHeight / 2;
      camera.bottom = -frustumHeight / 2;

      // Set near and far planes based on object size
      camera.near = -maxDim * 2; // Ensure near plane covers object depth
      camera.far = maxDim * 2; // Ensure far plane covers object depth

      // Update the camera's position and orientation
      camera.position.set(center.x, center.y, maxDim); // Position the orthographic camera
      camera.lookAt(center); // Ensure the camera looks at the object center
      camera.updateProjectionMatrix(); // Update the projection matrix

      if (orbitControls) {
        // Ensure orbit controls are set to target the center of the object
        orbitControls.target.copy(center);
        orbitControls.update();
      }
    }
  }

  public resetCameraToOriginalPosition() {
    this.controls.reset()
    this.camera.position.set(this.originalCameraPosition.x, this.originalCameraPosition.y, this.originalCameraPosition.z)
  }

  public async addModel(modelUrl: string, designUrl: string) {
    return new Promise((resolve, reject) => {
      const gltfLoader = new GLTFLoader(undefined)
      gltfLoader.load(this.storage_url + modelUrl, (gltf) => {
        const object = gltf.scene.children[0];
        if (!(object instanceof THREE.Mesh)) {
          reject('The loaded model is not a mesh.');
          return;
        }
        this.model = object

        this.fitCameraToCenteredObject(this.camera, this.model, 0, this.controls, this.renderer);
        this.originalCameraPosition = this.camera.position.clone()

        this.frontCamera = new THREE.OrthographicCamera(-3.6, 3.6, 3.6, -3.6, 1, 10);
        this.fitCameraToCenteredObject(this.frontCamera, this.model, 0, this.controls, this.renderer)

        this.backCamera = this.frontCamera.clone()

        // Position the back camera directly opposite to the front camera's Z position
        this.backCamera.position.z = -this.frontCamera.position.z;

        // Ensure the back camera is facing the center of the model
        const center = new THREE.Vector3();
        const boundingBox = new THREE.Box3().setFromObject(this.model); // Get the bounding box of the model
        boundingBox.getCenter(center); // Get the center of the model

        // Make the back camera look at the center of the model
        this.backCamera.lookAt(center);

        this.scene.add(this.frontCamera)
        this.scene.add(this.backCamera)

        // todo part from master

        // this.scene.add(this.model)
        //
        // this.model['material'] = new THREE.MeshPhongMaterial({ 'map': this.texture })
        // this.model['material'].shininess = 10
        // this.model['material'].needsUpdate = true
        //
        // if (this.model['material'].normalMap) return
        // // add normal map to the material
        // const textureLoader = new THREE.TextureLoader()
        // const normalMap = textureLoader.load(this.storage_url + designUrl)
        // normalMap.flipY = false;
        // this.model['material'].normalMap = normalMap
        //
        // this.model['material'].side = THREE.DoubleSide
        // this.model['material'].metalness = 0.99
        //
        // this.model['material'].needsUpdate = true
        // this.model['material'].map.needsUpdate = true
        //
        // this.canvas.on("after:render", () => {
        //   this.model['material'].needsUpdate = true
        //   this.model['material'].map.needsUpdate = true
        // })


        // todo part from task-2988-AL

        // Create the front side material (Phong)
        const frontMaterial = new THREE.MeshPhongMaterial({map: this.texture});
        frontMaterial.shininess = 10;
        frontMaterial.needsUpdate = true;
        frontMaterial.side = THREE.FrontSide; // Only render the front side

        // Create the back side material (Basic white material)
        const backMaterial = new THREE.MeshStandardMaterial({color: 0xffffff});
        backMaterial.side = THREE.BackSide; // Only render the back side


        // First object: the front-facing material (Phong)
        //@ts-ignore
        const frontMesh = new THREE.Mesh(this.model.geometry, frontMaterial);
        frontMesh.position.copy(this.model.position);
        frontMesh.rotation.copy(this.model.rotation);
        frontMesh.scale.copy(this.model.scale);
        this.scene.add(frontMesh);

        // Second object: the back-facing material (Basic white)
        //@ts-ignore
        const backMesh = new THREE.Mesh(this.model.geometry, backMaterial);
        backMesh.position.copy(this.model.position);
        backMesh.rotation.copy(this.model.rotation);
        backMesh.scale.copy(this.model.scale);
        this.scene.add(backMesh);


        // Ensure materials are updated after rendering
        this.canvas.on("after:render", () => {
          frontMaterial.needsUpdate = true;
          if (frontMaterial.map) {
            frontMaterial.map.needsUpdate = true;
          }
        });

        // Add normal map to the front material
        const textureLoader = new THREE.TextureLoader();
        const normalMap = textureLoader.load(this.storage_url + designUrl);
        normalMap.flipY = false;
        frontMaterial.normalMap = normalMap;
        backMaterial.normalMap = normalMap;
        frontMaterial.needsUpdate = true;

        // todo end

        resolve('done')
      })
    })
  }

  public findMostLeftAndTopElements(design: fabric.Group) {
    if (!design || !design._objects) {
      return { maxLeft: 0, maxTop: 0 };
    }

    let maxLeft = Infinity;
    let maxTop = Infinity;

    design._objects.forEach((obj: any) => {
      const left = obj.left ?? 0;
      const top = obj.top ?? 0;

      if (left < maxLeft) {
        maxLeft = left;
      }
      if (top < maxTop) {
        maxTop = top;
      }
    })

    return {
      maxLeft: maxLeft === Infinity ? 0 : maxLeft,
      maxTop: maxTop === Infinity ? 0 : maxTop,
    };
  }

  public applyAnchorDifferences(design: fabric.Group) {
    // Find all objects with ID containing 'anchor' and group them
    const anchorObjects = design._objects?.filter(obj => (obj as any).id?.toLowerCase().includes('anchor')) as fabric.Image[];
    if (anchorObjects && anchorObjects.length > 0) {
      const anchorGroup = new fabric.Group(this.cloneFabricObjects(anchorObjects), {
        hasControls: false,
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
        flipY: true
      });

      // Scale the anchor group to match the canvas resolution
      anchorGroup.scaleToHeight(this.canvasResolution).set({
        left: 0x0,
        top: 0x0
      }).setCoords();

      design.set({
        scaleX: anchorGroup.scaleX,
        scaleY: anchorGroup.scaleY
      }).setCoords()

      const { maxLeft, maxTop } = this.findMostLeftAndTopElements(design);
      let diffX = 0;
      let diffY = 0;
      const anchorLeft = anchorObjects[0]?.left ?? 0;
      const anchorTop = anchorObjects[0]?.top ?? 0;
      // Calculate difference ensuring maxLeft/maxTop is treated as the smaller number
      if(maxLeft < 0 && anchorLeft < 0) {
        diffX = Math.abs(maxLeft - anchorLeft) * (anchorGroup.scaleX ?? 1);
      } else {
        diffX = Math.abs(anchorLeft - maxLeft) * (anchorGroup.scaleX ?? 1);
      }
      if(maxTop < 0 && anchorTop < 0) {
        diffY = Math.abs(maxTop - anchorTop) * (anchorGroup.scaleY ?? 1);
      } else {
        diffY = Math.abs(anchorTop - maxTop) * (anchorGroup.scaleY ?? 1);
      }
      
      // Adjust the design position to center it relative to the anchor
      const currentLeft = design.left ?? 0;
      const currentTop = design.top ?? 0;
      const designAndCanvasHeightDiff = design.getScaledHeight() - this.canvasResolution
      design.set({
        left: currentLeft - diffX,
        top: currentTop - (designAndCanvasHeightDiff - diffY)
      }).setCoords();
    }
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

        this.applyAnchorDifferences(img)
        this.canvas.add(img).requestRenderAll()
        img.sendBackwards()
        this.design = img

        resolve('done')
      })
    })
  }

  public renderScene(camera: THREE.OrthographicCamera | THREE.PerspectiveCamera = this.camera) {
    this.renderer.render(this.scene, camera)
  }

  public animate() {
    requestAnimationFrame(this.animate)
    this.texture.needsUpdate = true
    this.controls.update()
    this.renderScene()
  }

  public frontAnimate() {
    requestAnimationFrame(this.frontAnimate)
    this.texture.needsUpdate = true
    this.controls.update()
    this.renderScene(this.frontCamera)
  }

  public backAnimate() {
    requestAnimationFrame(this.backAnimate)
    this.texture.needsUpdate = true
    this.controls.update()
    this.renderScene(this.backCamera)
  }

  public async addSvgLogos(logo: Record<any, any>, index: string): Promise<boolean> {
    const threeDXPosition = this.canvasWidthRatio * logo.x_axis
    const threeDYPosition = this.canvasHeightRatio * logo.y_axis
    const fabricJSPoint = await this.findPositionOn3D(threeDXPosition, threeDYPosition, logo.side)
    return new Promise((resolve) => {
      let logoUrl = encodeURI((this.storage_url + logo.url).trim()) + '?nocache=11'
      fabric.loadSVGFromURL(logoUrl, (objects: any, options: any) => {
        options.crossOrigin = 'Anonymous'
        const img = fabric.util.groupSVGElements(objects) as fabric.Group
        img.scaleToHeight(logo.height as number / this.canvasHeightRatio)
        
        img.set({
          left: fabricJSPoint.x,
          top: fabricJSPoint.y,
          angle: logo.rotation < 0 ? this.oppositeAngle(360 - logo.rotation) : this.oppositeAngle(logo.rotation) as number,
          hasControls: false,
          selectable: false,
          evented: false,
          lockMovementX: true,
          lockMovementY: true,
          globalCompositeOperation: 'source-atop',
          originX: 'center',
          originY: 'center',
          flipX: true,
        })

        if (logo.is_customizable) {
          const id = `${logo.placement_title}`
          if (!this.containsObject({id: id})) {
            let fill_color = ''
            const logo_objects = img._objects? img._objects : [img]
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

                  if (this.mainPreview) {
                    this.$store.dispatch('setSvgGroups', this.svgGroups)
                  }

                  if (!this.parts.filter((part) => part == id)) {
                    this.parts.push(id)
                  }
                }
              }
            })
          }
        }

        this.canvas.add(img)
        Object.assign(img, {
          fixed_logo_index: logo.fixed_logo_index,
          side: logo.side,
          type: 'fixed_logo',
          url: logo.url,
          is_customizable: logo.is_customizable,
          placement_title: logo.placement_title
        })
        this.fixed_logo_objects[logo.fixed_logo_index] = img
        this.canvas.requestRenderAll()
        resolve(true)
      })
    })
  }

  public async resetAndAddFixedLogos() {
    if (this.mounted) {
      await this.resetFixedLogosFromCanvas()
      this.addFixedLogos()
    }
  }

  public reStackObjectsInCanvas(objects, order_key: string|null = null) {
    let sortedObjects = objects;
    if (order_key) {
      sortedObjects = objects.sort((a, b) => {
        if (a[order_key] < b[order_key]) return -1;
        if (a[order_key] > b[order_key]) return 1;
        return 0;
      });
    }
    sortedObjects.forEach((object) => {
      this.canvas.bringToFront(object)
    })
  }

  public async resetFixedLogosFromCanvas() {
    if (this.selectedProductId == this.product_id && this.fixed_logo_objects) {
      for (let objectIndex = 0; objectIndex < this.fixed_logo_objects.length; objectIndex++) {
        const fixed_logo = this.fixed_logo_objects[objectIndex]
        if (fixed_logo) {
          this.canvas.remove(fixed_logo)
        }
      }
      this.canvas.requestRenderAll()
      this.fixed_logo_objects = []
    }
  }

  public convertImageURLToBase64(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = url;

      img.onload = () => {
        const canvas = fabric.util.createCanvasElement() as Record<any, any>
        canvas.width = img.width
        canvas.height = img.height
        canvas.getContext('2d').drawImage(img, 0, 0)
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };

      img.onerror = (error) => {
        reject(error);
      };
    });
  }

  public async addLogo(logo: Record<any, any>, from_load = false) {
    logo = this.custom_logos ? this.custom_logos[logo.logo_index] : {}
    if (!checkIsEmpty(logo) && logo && logo.product_id == this.product_id && (this.mounted || from_load)) {
      if (this.custom_logo_objects[logo.logo_index as number]) {
        this.deleteExistingLogoFromCanvas(logo.logo_index)
      }
      if (logo.url && !this.custom_logo_objects[logo.logo_index as number]) {
        if (this.mainPreview && !from_load) {
          this.$store.commit('SET_UPDATING_LOGO', true)
        }
        if (logo.customLogo) {
          this.custom_logo_objects[logo.logo_index as number] = true
        }
        logo.haveControls = Boolean(logo.haveControls)
        let logoUrl = encodeURI((this.storage_url + logo.url).trim()) + '?nocache=11'
        const base64_logo = await this.convertImageURLToBase64(logoUrl) as string
        fabric.Image.fromURL(base64_logo, async (img: any) => {
          const aspect_ratio = img.width / img.height
          if (aspect_ratio > 1) {
            img.scaleToWidth(logo.height as number * this.canvasWidthRatio)
          } else {
            img.scaleToHeight(logo.height as number * this.canvasHeightRatio)
          }

          this.custom_logo_objects[logo.logo_index as number] = img
          Object.assign(img, {
            logo_index: logo.logo_index,
            side: logo.side
          })

          let fabricJSPoint = {x: 0, y: 0}
          if (logo.x_axis_3d && logo.y_axis_3d) {
            fabricJSPoint.x = logo.x_axis_3d
            fabricJSPoint.y = logo.y_axis_3d
          } else {
            const threeDXPosition = this.canvasWidthRatio * logo.x_axis
            const threeDYPosition = this.canvasHeightRatio * logo.y_axis
            fabricJSPoint = await this.findPositionOn3D(threeDXPosition, threeDYPosition, logo.side)
          }

          img.set({
            id: `logo_${logo.logo_index}`,
            left: fabricJSPoint.x,
            top: fabricJSPoint.y,
            angle: logo.rotation < 0 ? this.oppositeAngle(360 - logo.rotation) : this.oppositeAngle(logo.rotation) as number,
            selectable: true,
            hasControls: true,
            hasBorders: true,
            evented: true,
            globalCompositeOperation: 'source-atop',
            padding: 15,
            cornerSize: 30,
            flipX: true,
            type: "logo",
            centeredScaling: true,
            originX: 'center',
            originY: 'center',
          })

          if (logo.scaleX && logo.scaleY) {
            img.scaleX = logo.scaleX * this.canvasWidthRatio
            img.scaleY = logo.scaleY * this.canvasHeightRatio
          }

          if (this.mainPreview && this.selectedProductId == this.product_id) {
            const converted_width = this.getRealSize(img.width * img.scaleX)
            const converted_height = this.getRealSize(img.height * img.scaleY)
            this.$store.commit('SET_PRODUCT_CUSTOM_LOGOS', {
              custom_logo_index: logo.logo_index,
              data: {
                x_axis_3d: img.left,
                y_axis_3d: img.top,
                originalWidth: converted_width,
                originalHeight: converted_height
              }
            })
          }
          img.setControlsVisibility(this.fabric_control_visibility)
          img.clipPath = this.safe_zone
          this.canvas.add(img)
          this.canvas.requestRenderAll()

          img.on('selected', (e: Record<any, any>) => {
            this.$root.$emit('changeLogoTabIndex', logo.logo_index)
            this.showDimensions(e)
          })

          this.renderScene()

        }, {crossOrigin: 'Anonymous'})
      }
    }
  }

  public oppositeAngle(angle) {
    return (180 - angle + 360) % 360;
  }

  public async deleteExistingLogoFromCanvas(custom_logo_index: number) {
    if (custom_logo_index == 0 || this.custom_logos[custom_logo_index] && this.custom_logos[custom_logo_index].product_id == this.product_id) {
      const custom_logo = this.custom_logo_objects[custom_logo_index]
      if (custom_logo) {
        this.canvas.remove(custom_logo)
        this.canvas.requestRenderAll()
      }
      this.custom_logo_objects[custom_logo_index] = null
    }
  }

  public async resetAndAddLogos() {
    if (this.mounted) {
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
    if (this.custom_logo_objects) {
      for (let objectIndex = 0; objectIndex < this.custom_logo_objects.length; objectIndex++) {
        const custom_logo = this.custom_logo_objects[objectIndex]
        if (custom_logo) {
          this.canvas.remove(custom_logo)
        }
      }
      this.canvas.requestRenderAll()
      this.custom_logo_objects = []
    }
  }

  public showDimensions(e: any) {
    let object = e.target;
    const width = this.getRealSize(object.width * object.scaleX)
    const height = this.getRealSize(object.height * object.scaleY)
    if (width !== 0 || height !== 0) {
      let displayWidth = width;
      let displayHeight = height;
      const unit = this.$store.getters.getSetting('measurement_unit')?.unit;
      if (object.type == 'text') {
        const stroke_width = this.getRealSize(object.strokeWidth * object.scaleX)
        displayWidth = (parseFloat(width.toString()) + parseFloat(stroke_width.toString()));
        displayHeight = (parseFloat(height.toString()) + parseFloat(stroke_width.toString()));
      }
      this.dimText.set({
        left: object.left,
        top: object.top - (((object.height * object.scaleY) / 2) + (this.dimText.height as number) * (this.dimText.scaleY as number) + 20),
        text: 'Size (W)' + displayWidth.toFixed(1) + unit + ' x (H)' + displayHeight.toFixed(1) + unit,
        visible: true
      }).bringToFront();
      this.canvas.requestRenderAll();
      this.renderScene();
    }
  }

  public async resetTextsFromCanvas() {
    if (this.product_custom_text_objects) {
      for (let objectIndex = 0; objectIndex < this.product_custom_text_objects.length; objectIndex++) {
        const custom_text = this.product_custom_text_objects[objectIndex] as Record<any, any>
        if (custom_text != null) {
          for (let i = 0; i < custom_text.length; i++) {
            this.canvas.remove(custom_text[i])
          }
        }
      }
      this.canvas.requestRenderAll()
      this.product_custom_text_objects = []
    }
  }

  public async deleteExistingTextsFromCanvas(custom_text_index: number, remove_custom_text_object = true) {
    const self: Record<any, any> = this;
    const custom_text = self.product_custom_text_objects[custom_text_index]
    if (custom_text) {
      for (let i = 0; i < custom_text.length; i++) {
        self.canvas.remove(custom_text[i])
      }
      this.canvas.requestRenderAll()
    }
    /*
    * remove_custom_text_object will be true only when we remove custom text that has been manuallya dded
    * */
    if (remove_custom_text_object) {
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
    if (Object.prototype.hasOwnProperty.call(custom_text, "following_product_ids") && custom_text.following_product_ids.includes(this.product_id)) {
      const following_product_custom_text = this.allProductsCustomTexts[this.product_id]?.[custom_text_index];
      is_custom_text_allowed = following_product_custom_text && following_product_custom_text.type == custom_text.type
    }
    return is_custom_text_allowed;
  }

  public async addTexts(custom_text_info: Record<any, any>, from_load = false) {
    if (!this.selectedProduct.preview_custom_texts) {
      return false
    }
    if (this.mounted || from_load) {
      const custom_text_index = custom_text_info.custom_text_index;
      if (this.allProductsCustomTexts[this.product_id] && this.allProductsCustomTexts[this.product_id][custom_text_index]) {
        const self: Record<any, any> = this
        await this.syncCustomTextsWithCustomTextsObjects()
        if (custom_text_info.emitter == 'add_button') {
          /* in case of add button we just need to execute method syncCustomTextsWithCustomTextsObjects() that's why returning here  */
          return false;
        }

        this.product_custom_texts[custom_text_index] = custom_text_info.value;

        let add_custom_text = await this.isCustomTextAllowed(custom_text_index);
        if (add_custom_text) {
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
              if (!font) {
                font = this.products_fonts[Object.keys(this.products_fonts)[0]]
              }
              if (font) {
                const path = font.opentype_font.getPath(custom_text.value, 0, 0, 72, {
                  features: {
                    liga: true,
                    rlig: true
                  }
                })

                let textSvg = '<?xml version="1.0" encoding="utf-8"?>\n' +
                  '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" xml:space="preserve">\n'
                textSvg += path.toSVG()
                textSvg += '\n</svg>'

                if (!this.product_custom_text_objects[custom_text_index]) {
                  this.product_custom_text_objects[custom_text_index] = []
                  self.product_custom_text_objects[custom_text_index][customTextItemIndex] = null
                }

                fabric.loadSVGFromString(textSvg, async (objects: any) => {
                  fabric_text = fabric.util.groupSVGElements(objects) as fabric.Group | Record<any, any>
                  self.product_custom_text_objects[custom_text_index][customTextItemIndex] = fabric_text

                  let fabricJSPoint = {x: 0, y: 0}
                  if (custom_text_item.x_axis_3d && custom_text_item.y_axis_3d) {
                    fabricJSPoint.x = custom_text_item.x_axis_3d
                    fabricJSPoint.y = custom_text_item.y_axis_3d
                  } else {
                    const threeDXPosition = this.canvasWidthRatio * custom_text_item.x_axis
                    const threeDYPosition = this.canvasHeightRatio * custom_text_item.y_axis
                    fabricJSPoint = await this.findPositionOn3D(threeDXPosition, threeDYPosition, custom_text_item.placement)
                  }

                  fabric_text.scaleToHeight(custom_text_item.height as number * this.canvasHeightRatio)
                  fabric_text.set({
                    left: fabricJSPoint.x,
                    top: fabricJSPoint.y,
                    angle: custom_text_item.rotation < 0 ? this.oppositeAngle(360 - custom_text_item.rotation) : this.oppositeAngle(custom_text_item.rotation) as number,
                    flipX: true,
                    selectable: true,
                    hasControls: true,
                    hasBorders: true,
                    evented: true,
                    globalCompositeOperation: 'source-atop',
                    fill: custom_text_item.color,
                    stroke: custom_text_item.outline_color,
                    strokeWidth: parseInt(custom_text_item.outline_width) * this.canvasHeightRatio,
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
                    centeredScaling: true,
                    originX: 'center',
                    originY: 'center',
                  })

                  if (custom_text_item.scaleX && custom_text_item.scaleY) {
                    fabric_text.scaleX = custom_text_item.scaleX * this.canvasWidthRatio
                    fabric_text.scaleY = custom_text_item.scaleY * this.canvasHeightRatio
                  }

                  const converted_width = this.getRealSize(fabric_text.width * fabric_text.scaleX)
                  const converted_height = this.getRealSize(fabric_text.height * fabric_text.scaleY)
                  const outline_converted_width = this.getRealSize(fabric_text.strokeWidth * fabric_text.scaleX)
                  custom_text_item.originalWidth = converted_width
                  custom_text_item.originalHeight = converted_height
                  custom_text_item.outlineConvertedWidth = outline_converted_width
                  custom_text_item.x_axis_3d = fabric_text.left
                  custom_text_item.y_axis_3d = fabric_text.top

                  this.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", {
                    index: custom_text_index,
                    value: {items: custom_text.items}
                  })

                  fabric_text.setControlsVisibility(this.fabric_control_visibility)

                  fabric_text.on('selected', (e: Record<any, any>) => {
                    this.showDimensions(e)
                  })

                  fabric_text.clipPath = this.safe_zone
                  self.canvas.add(fabric_text)
                  fabric_text.bringToFront()
                  this.canvas.renderAll()
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
    if (difference > 0) {
      for (let i = 1; i <= difference; i++) {
        this.product_custom_text_objects.push(null as never)
      }
    }
  }

  public async handleCustomLogoModifiedEvent(fabric_object: Record<any, any>, x_axis: number, y_axis: number, side_changed) {
    this.isObjectMoving = 0
    const logo_index = fabric_object.get("logo_index");
    if (this.custom_logos[logo_index]) {
      const width = this.getRealSize(fabric_object.get('width') * fabric_object.get('scaleX'))
      const height = this.getRealSize(fabric_object.get('height') * fabric_object.get('scaleY'))
      const angle = fabric_object.get("angle") < 0 ? this.oppositeAngle(360 - fabric_object.get("angle")) : this.oppositeAngle(fabric_object.get("angle")) as number
      this.$store.commit('SET_PRODUCT_CUSTOM_LOGOS', {
        custom_logo_index: logo_index,
        data: {
          x_axis: x_axis ? x_axis : this.custom_logos[logo_index].x_axis,
          y_axis: y_axis ? y_axis : this.custom_logos[logo_index].y_axis,
          x_axis_3d: fabric_object.left,
          y_axis_3d: fabric_object.top,
          rotation: angle,
          scaleX: fabric_object.get("scaleX") / this.canvasWidthRatio,
          scaleY: fabric_object.get("scaleY") / this.canvasHeightRatio,
          originalWidth: width,
          originalHeight: height,
          side: fabric_object.side,
        }
      })
    }
    const self: Record<any, any> = this;
    if (side_changed) {
      self.$eventBus.$emit('handleCustomLogoUpdatedEvent', this.custom_logos[logo_index])
    } else {
      self.$eventBus.$emit("customLogoStoreUpdated", logo_index, true);
    }
  }

  public handleCustomTextModifiedEvent(fabric_object: Record<any, any>, x_axis, y_axis, side_changed) {
    this.isObjectMoving = 0
    const angle = fabric_object.get("angle") < 0 ? this.oppositeAngle(360 - fabric_object.get("angle")) : this.oppositeAngle(fabric_object.get("angle")) as number
    const custom_text_index = fabric_object.get("custom_text_index");
    const custom_text_item_index = fabric_object.get("custom_text_item_index")
    if (x_axis || y_axis) {
      this.product_custom_texts[custom_text_index].items[custom_text_item_index].x_axis = x_axis
      this.product_custom_texts[custom_text_index].items[custom_text_item_index].y_axis = y_axis
      this.product_custom_texts[custom_text_index].items[custom_text_item_index].x_axis_3d = fabric_object.left
      this.product_custom_texts[custom_text_index].items[custom_text_item_index].y_axis_3d = fabric_object.top
    }
    this.product_custom_texts[custom_text_index].items[custom_text_item_index].rotation = angle
    this.product_custom_texts[custom_text_index].items[custom_text_item_index].scaleX = fabric_object.get("scaleX") / this.canvasWidthRatio
    this.product_custom_texts[custom_text_index].items[custom_text_item_index].scaleY = fabric_object.get("scaleY") / this.canvasHeightRatio
    this.canvas.requestRenderAll()
    const width = this.getRealSize(fabric_object.get('width') * fabric_object.get('scaleX'))
    const height = this.getRealSize(fabric_object.get('height') * fabric_object.get('scaleY'))
    const outline_width = this.getRealSize(fabric_object.get('strokeWidth') * fabric_object.get('scaleX'))
    this.product_custom_texts[custom_text_index].items[custom_text_item_index].originalWidth = width;
    this.product_custom_texts[custom_text_index].items[custom_text_item_index].originalHeight = height;
    this.product_custom_texts[custom_text_index].items[custom_text_item_index].outlineConvertedWidth = outline_width;
    this.product_custom_texts[custom_text_index].items[custom_text_item_index].side = fabric_object.side;
    this.$store.commit("SET_PRODUCT_CUSTOM_TEXTS", {
      index: custom_text_index,
      value: this.product_custom_texts[custom_text_index]
    })
    const self: Record<any, any> = this;
    if (side_changed) {
      self.$eventBus.$emit("customTextUpdated", {
        emitter: "placement", custom_text_index: custom_text_index, custom_text_item_index: custom_text_item_index,
        value: this.product_custom_texts[custom_text_index]
      });
    } else {
      self.$eventBus.$emit("customTextStoreUpdated", {
        custom_text_index: custom_text_index,
        custom_text_item_index: custom_text_item_index
      }, true);
    }
  }

  public addSafeZone(url: string) {
    return new Promise((resolve) => {
      fabric.loadSVGFromURL(url, (img: any, options: any) => {
        options.crossOrigin = 'Anonymous'

        const safe_zone_clip = fabric.util.groupSVGElements(img) as fabric.Group
        this.canvas.viewportCenterObject(safe_zone_clip)
        safe_zone_clip.set({
          hasControls: false,
          selectable: false,
          evented: false,
          lockMovementX: true,
          lockMovementY: true,
          absolutePositioned: true,
          inverted: true,
          flipY: true
        })

        safe_zone_clip.scaleToHeight(this.canvasResolution as number).set({
          left: 0x0,
          top: 0x0
        }).setCoords()

        this.safe_zone = safe_zone_clip
        resolve(1)
      })
    })
  }

  public removeGetPointerFromFabricPrototype() {
    //restore fabric js function
    fabric.Canvas.prototype.getPointer = function (e, ignoreZoom) {
      // return cached values if we are in the event processing chain
      if (this._absolutePointer && !ignoreZoom) {
        return this._absolutePointer;
      }
      if (this._pointer && ignoreZoom) {
        return this._pointer;
      }
      var pointer = fabric.util.getPointer(e, this.upperCanvasEl),
        upperCanvasEl = this.upperCanvasEl,
        bounds = upperCanvasEl.getBoundingClientRect(),
        boundsWidth = bounds.width || 0,
        boundsHeight = bounds.height || 0,
        cssScale;
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
      if (!ignoreZoom) {
        pointer = this.restorePointerVpt(pointer);
      }
      var retinaScaling = this.getRetinaScaling();
      if (retinaScaling !== 1) {
        pointer.x /= retinaScaling;
        pointer.y /= retinaScaling;
      }
      if (boundsWidth === 0 || boundsHeight === 0) {
        // If bounds are not available (i.e. not visible), do not apply scale.
        cssScale = {width: 1, height: 1};
      } else {
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

  }

  public addGetPointerToFabricPrototype() {
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
          if (self.isObjectMoving < 4) {
            positionOnScene = getPositionOnSceneTouch(e);
            self.positionOnScene = positionOnScene
            self.isObjectMoving += 1
            if (positionOnScene) {
              pointer.x = positionOnScene.x;
              pointer.y = positionOnScene.y;
            }
          } else {
            pointer.x = self.positionOnScene?.x;
            pointer.y = self.positionOnScene?.y;
          }
        } else {
          if (self.isObjectMoving < 4) {
            positionOnScene = getPositionOnScene(e);
            self.positionOnScene = positionOnScene
            self.isObjectMoving += 1
            if (positionOnScene) {
              pointer.x = positionOnScene.x;
              pointer.y = positionOnScene.y;
            }
          } else {
            pointer.x = self.positionOnScene?.x;
            pointer.y = self.positionOnScene?.y;
          }
        }
      }
      /* END PATCH CODE */
      if (!ignoreZoom) {
        pointer = this.restorePointerVpt(pointer);
      }

      if (boundsWidth === 0 || boundsHeight === 0) {
        cssScale = {width: 1, height: 1};
      } else {
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
    self.container.addEventListener('mouseup', setObjectMoving, false)
    if (self.device_info.is_mobile) {
      self.isMobile = true;
      self.container.addEventListener("touchstart", onTouch, false)
      self.container.addEventListener("touchend", setObjectMoving, false)
    }

    //fixing bug when object is dropped outside of 3d model
    self.canvas.on('object:moving', function (evt) {
      self.isObjectMoving = 0
      let array = self.getMousePosition(self.container, evt.e.clientX, evt.e.clientY, true);
      self.onClickPosition.fromArray(array);
      let intersects = self.getIntersects(self.onClickPosition, self.scene.children, self.camera);
      if (intersects.length === 0) {
        //return to the last known position
        let active_object = self.canvas.getActiveObject()
        if (active_object) {
          active_object.left = self.last_known_image_pos.left as number
          active_object.top = self.last_known_image_pos.top as number
          active_object.setCoords()
        }
      } else {
        self.last_known_image_pos = {
          left: evt.target ? evt.target.left as number : 0,
          top: evt.target ? evt.target.top as number : 0
        }
      }
    })

    /**
     * Event handlers
     */
    function onTouch(evt) {
      evt.preventDefault();
      const positionOnScene = getPositionOnSceneTouch(evt);
      if (positionOnScene) {
        //const canvasRect = self.canvas._offset;
        const simEvt = new MouseEvent(evt.type, {
          clientX: positionOnScene.x,
          clientY: positionOnScene.y,
        });
        self.canvas['upperCanvasEl'].dispatchEvent(simEvt)
      }
    }

    function getPositionOnSceneTouch(evt) {
      let array = self.getMousePosition(self.container, evt.changedTouches[0].clientX, evt.changedTouches[0].clientY, true);
      self.onClickPosition.fromArray(array);
      let intersects = self.getIntersects(self.onClickPosition, self.scene.children, self.camera);
      if (intersects.length > 0 && intersects[0].uv) {
        let uv = intersects[0].uv;
        intersects[0].object['material'].map.transformUv(uv);
        return {
          x: self.getRealPosition("x", uv.x),
          y: self.getRealPosition("y", uv.y),
        };
      } else {
        self.controls.enabled = true;
      }
      return null;
    }

    function onMouseEvt(evt) {
      evt.preventDefault();
      const positionOnScene = getPositionOnScene(evt)
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
    function getPositionOnScene(evt) {
      // console.log(evt.clientX, evt.clientY, evt.offsetX, evt.offsetY, 'offset one is good')
      let array = self.getMousePosition(self.container, evt.clientX, evt.clientY, true)
      self.onClickPosition.fromArray(array)
      let intersects = self.getIntersects(self.onClickPosition, self.scene.children, self.camera)
      if (intersects.length > 0 && intersects[0].uv) {
        const uv = intersects[0].uv
        intersects[0].object['material'].map.transformUv(uv)
        return {
          x: self.getRealPosition('x', uv.x),
          y: self.getRealPosition('y', uv.y)
        }
      } else {
        self.controls.enabled = true;
      }
      return null
    }

    function setObjectMoving() {
      self.isObjectMoving = 0
    }
  }

  private getIntersects(point, objects, camera) {
    this.mouse.set(point.x * 2 - 1, -(point.y * 2) + 1);
    this.raycaster.setFromCamera(this.mouse, camera)
    // Debugging projection rays
    // this.scene.add(new THREE.ArrowHelper( this.raycaster.ray.direction, this.raycaster.ray.origin, 100, Math.random() * 0xffffff ));
    return this.raycaster.intersectObjects(objects, false);
  }

  private getMousePosition(dom, x, y, by_screen = false): [number, number] {
    let rect = dom.getBoundingClientRect();
    let screen_left = 0
    let screen_top = 0
    if (by_screen) {
      screen_left = rect.left
      screen_top = rect.top
    }
    return [(x - screen_left) / rect.width, (y - screen_top) / rect.height]
  }

  private getRealPosition(axis, value) {
    const CORRECTION_VALUE = axis === "x" ? 4.5 : 5.5;
    // Value * number(should be equal to canvas width)
    return Math.round(value * this.canvasResolution) - CORRECTION_VALUE;
  }

  // Function to find intersection point in Three.js and map to Fabric.js
  private async findPositionOn3D(x: number, y: number, side: string) {
    let camera = this.frontCamera
    if (side.toLowerCase() == 'back') {
      camera = this.backCamera
    }
    const point = this.getMousePosition(this.container, x, y)
    this.onClickPosition.fromArray(point)

    const intersects = this.getIntersects(this.onClickPosition, this.scene.children, camera)

    if (intersects.length > 0 && intersects[0].uv) {
      const uv = intersects[0].uv
      intersects[0].object['material'].map.transformUv(uv)
      return {
        x: this.getRealPosition('x', uv.x),
        y: this.getRealPosition('y', uv.y)
      }
    }

    return {x: 0, y: 0};
  }

  private findPositionOn2D(x: number, y: number, fabric_object) {
    let side_changed = false
    let vector = new THREE.Vector3()
    let array = this.getMousePosition(this.container, x, y, true)
    this.onClickPosition.fromArray(array)
    let intersects = this.getIntersects(this.onClickPosition, this.scene.children, this.camera)

    let side = "front"
    // this vector will store 2d screen coordinates, 3d dimension will be 0
    if (intersects.length > 0) {
      //find intersection point and map to 2d screen coordinates
      vector = intersects[0].point;

      //IF interscetion point is closer to back, we switch cameras
      if (vector.z < 0) {
        vector.project(this.backCamera);
        side = "back";
      } else {
        vector.project(this.frontCamera)
      }
      if (fabric_object.side.toLowerCase() != side) {
        fabric_object.side = side
        side_changed = true
      }
      // map to 2D screen space
      vector.x = Math.round((vector.x + 1) * this.containerWidth / 2)
      vector.y = Math.round((-vector.y + 1) * this.containerHeight / 2)
      vector.z = 0;

      let divided_by = 3
      if (fabric_object.type == 'logo') {
        divided_by = 1
      }
      vector.x += fabric_object.width * fabric_object.scaleX / divided_by
      vector.y += fabric_object.height * fabric_object.scaleY / divided_by

      // if (fabric_object.type == 'logo') {
      //   vector.x += fabric_object.width * fabric_object.scaleX
      //   vector.y += (fabric_object.height * this.canvasHeightRatio) * (fabric_object.scaleY * this.canvasHeightRatio)
      // } else {
      //   vector.x += (fabric_object.width / this.canvasWidthRatio) * (fabric_object.scaleX / this.canvasWidthRatio)
      //   vector.y += (fabric_object.height * this.canvasHeightRatio) * (fabric_object.scaleY * this.canvasHeightRatio)
      // }
    }
    return {vector: vector, side_changed: side_changed}
  }

  public async applyAllPatterns() {
    if (this.svgGroups) {
      await Promise.all(
        this.svgGroups.map((svgGroup: Record<any, any>) =>
          this.applyPattern(svgGroup.id, false)
        )
      )
    }
  }

  public removePattern(design: any, pattern_objects: any, svg_part) {
    const patternId = `pattern_group_${svg_part}`;
    design._objects = design._objects.filter(obj => obj.id !== patternId);
    this.regroupDesign(design._objects);

    delete pattern_objects[svg_part];
    if (!this.groupPatterns[svg_part]) {
      this.canvas.requestRenderAll();
    }
  }

  public async applyPattern(svg_part: string, re_stack = true): Promise<void> {
    if (this.patterns[svg_part]) {
      this.removePattern(this.design, this.patterns, svg_part)
    }

    if (this.groupPatterns[svg_part] && this.groupPatterns[svg_part].name && this.product.patterns && Object.entries(this.product.patterns).length) {
      const pattern_data = this.product.patterns[0].json_data.find(
        (obj) => obj.name === this.groupPatterns[svg_part].name
      );

      if (pattern_data) {
        // Check if pattern already exists in patterns object
        let pattern = this.patterns[svg_part];
        if (!pattern) {
          pattern = await this.setupPattern(svg_part, pattern_data, this.design);
          if (!pattern) {
            return Promise.resolve();
          }
        }

        const designObjects = this.design._objects ? this.design._objects : [this.design];
        designObjects.flat().forEach((designObject, index: number) => {
          if (designObject.id?.toLowerCase() === svg_part) {
            const latest_design_objects = this.design._objects
            const clipGroup = new fabric.Group(
              this.cloneFabricObjects(latest_design_objects),
              {
                hasControls: false,
                selectable: false,
                evented: false,
                lockMovementX: true,
                lockMovementY: true,
                absolutePositioned: true,
                flipY: true
              }
            );

            const pattern_id = `pattern_group_${svg_part}`
            const occurrence_count = latest_design_objects.filter(obj => obj.id === pattern_id).length;
            const object_number = index + occurrence_count
            const objectToClip = clipGroup._objects.filter((obj, clip_id) => clip_id !== object_number);

            objectToClip.forEach((obj) => clipGroup.remove(obj));
            
            clipGroup._objects[0].clipPath = undefined
            // @ts-ignore
            const originalMatrix = clipGroup._objects[0].calcTransformMatrix(true)
            Object.assign(clipGroup._objects[0], {
              originalMatrix: originalMatrix
            })

            clipGroup.scaleToHeight(this.canvasResolution as number).set({
              left: 0x0,
              top: 0x0
            }).setCoords()

            if(occurrence_count > 0) {
              pattern = fabric.util.object.clone(pattern)
            }
            Object.assign(pattern, {
              id: `pattern_${svg_part}_${occurrence_count}`
            })
            
            const patternRect = new fabric.Rect({
              left: designObject.left,
              top: designObject.top,
              width: designObject.width,
              height: designObject.height,
              hasControls: false,
              selectable: false,
              evented: false,
              originX: designObject.originX || 'left',
              originY: designObject.originY || 'top',
              lockMovementX: true,
              lockMovementY: true,
              absolutePositioned: true,
              fill: pattern,
            });

            patternRect.clipPath = clipGroup;

            Object.assign(patternRect, {
              id: pattern_id,
            })

            let design_with_rect = this.cloneFabricObjects(latest_design_objects)

            // @ts-ignore
            design_with_rect.splice(object_number + 1, 0, patternRect);

            this.regroupDesign(design_with_rect)

            this.patterns[svg_part] = patternRect;
          }
        });

        if (re_stack) {
          const all_fabric_object = [
            ...this.fixed_logo_objects,
            ...this.custom_logo_objects,
            ...this.product_custom_text_objects.flat(),
          ].filter((obj) => obj !== null && obj !== undefined)

          this.reStackObjectsInCanvas(all_fabric_object);
        }

        this.canvas.requestRenderAll();
      }
    }

    return Promise.resolve();
  }

  public regroupDesign(design_objects: fabric.Object[]) {
    let design = this.design
    let canvas = this.canvas
    const final_design = new fabric.Group(design_objects, {
      hasControls: false,
      selectable: false,
      evented: false,
      lockMovementX: true,
      lockMovementY: true,
      flipY: true
    })
    final_design.scaleToHeight(this.canvasResolution as number).set({
      left: 0x0,
      top: 0x0
    }).setCoords()

    canvas.remove(design)

    this.applyAnchorDifferences(final_design)
    canvas.add(final_design)
    final_design.sendToBack()

    this.design = final_design
  }

  generateProductionSVG() {
    const matrixReplacements = new Map<string, string>();

    this.design.getObjects().flat().forEach(designObject => {
      if (designObject.id?.includes('pattern_') && designObject.clipPath) {
        const clipObject = designObject.clipPath._objects[0];

        // Format both current and original matrices consistently
        const currentMatrix = clipObject.calcTransformMatrix()
          .map(n => roundOff(n)).join(' ');
        const originalMatrix = clipObject.originalMatrix
          .map(n => roundOff(n)).join(' ');

        matrixReplacements.set(currentMatrix, originalMatrix);
      }
    });

    let svg = this.canvas.toSVG()

    // Strip the DOCTYPE manually
    svg = svg.replace(/^\s*(<\?xml[^>]*>\s*)?(<!DOCTYPE[^>]*>\s*)?/i, '');

    matrixReplacements.forEach((original, current) => {
      const safePattern = current.replace(/\./g, '\\.').replace(/\-/g, '\\-');
      const regex = new RegExp(`matrix\\(${safePattern}\\)`, 'g');
      svg = svg.replace(regex, `matrix(${original})`);
    });

    svg = svg.replace(
      /(<svg[^>]*>)/i,
      `$1<g transform="scale(1,-1) translate(0, -${this.canvasResolution})">`
    ).replace(/<\/svg>/i, '</g></svg>');
    
    
    Object.keys(this.patterns).forEach((svg_part) => {
      const angle = this.groupPatterns[svg_part]?.angle;
      if (angle) {
        // Match pattern ID: SVGID_pattern_base_0, SVGID_pattern_sleeve_1, etc.
        const patternIdRegex = new RegExp(
          `<pattern([^>]+id="SVGID_pattern_${svg_part}_\\d+"[^>]*)>`,
          'g'
        );

        svg = svg.replace(patternIdRegex, (match, attrs) => {
          // If patternTransform already exists, replace it
          if (/patternTransform\s*=/.test(attrs)) {
            return `<pattern ${attrs.replace(/patternTransform="[^"]*"/, `patternTransform="rotate(${angle})"`)}>`;
          } else {
            // Otherwise add patternTransform attribute
            return `<pattern ${attrs} patternTransform="rotate(${angle})">`;
          }
        });
      }
    });
    return svg;
  }
  
  public getRealSize(px: number) {
    const unit = this.$store.getters.getSetting('measurement_unit')?.unit
    const pxScaled = px / this.design.scaleX;
    if (unit === 'cm') {
      return parseFloat((pxScaled / 28.3464567).toFixed(1));
    } else if (unit === 'inch') {
      return parseFloat((pxScaled / 72).toFixed(1));
    }
    return parseFloat((pxScaled).toFixed(1));
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

  .main_size_guide_btn {
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

    .main_size_guide_btn {
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

  &:active {
    color: var(--theme-color) !important;
    background: var(--theme-color-light);
  }
}

.main_size_guide_btn {
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
/* // for future use to hide 3d and show 2d canvas
#canvas_container > canvas {
  width: 948px !important;
  height: 948px !important;
}
#renderer {
  display: none;
}*/
</style>
