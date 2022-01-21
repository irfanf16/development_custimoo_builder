<template>
  <div class="loading-holder">
    <div class="canvas-area-holder" :class="{ 'fix-space': !manageComponents.mobileScreen}" style="display: flex; justify-content: space-between;">
      <a @click="setShowSmall('back')" :class="{'show-small' : showSmall.front}">
        <canvas ref="front" id="scene-front" class="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
        <h2>Front</h2>
      </a>
      <a @click="setShowSmall('front')" :class="{'show-small' : showSmall.back}" v-if="back">
        <canvas v-if="back" ref="back" id="scene-back" class="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
        <h2>Back</h2>
      </a>
    </div>
    <div class="loader" v-if="showLoader"><img src="../../src/assets/images/loading.gif" /></div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Watch, Vue} from 'vue-property-decorator'
import {fabric} from 'fabric'
import {getClosestColor} from '@/pantoneColor'
import rgbHex from 'rgb-hex'
import {setLogoSettings} from "@/helpers/Helpers";

@Component<Scene>({
  mounted() {
    if(this.back) {
      this.dimTextBack = new fabric.Text('', {
        fontSize: 20,
        backgroundColor: '#fff',
        hasControls: false,
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
        visible: false,
        fontFamily: 'Ubuntu'
      })
    }
    const self = this
    this.loadScene(this.front, 'front')
    if (this.back) {
      this.loadScene(this.back, 'back')
    }

    let scaleImg = document.createElement('img');
    scaleImg.src = "./img/images/scale.png";
    let fabricObj: Record<any, any> = fabric
    fabricObj.Object.prototype.controls.br = new fabricObj.Control({
      x: 0.5,
      y: 0.5,
      cursorStyle: 'nw-resize',
      actionHandler: fabricObj.controlsUtils.scalingEqually,
      actionName: 'scale',
      render: renderIconScale,
      withConnection: true
    })

    function renderIconScale(ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: Record<any, any>, fabricObject: Record<any, any>) {
      let size = 30;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabricObj.util.degreesToRadians(fabricObject.angle as number));
      ctx.drawImage(scaleImg, -size / 2, -size / 2, size, size);
      ctx.restore();
    }

    let rotationImg = document.createElement('img');
    rotationImg.src = "./img/images/rotate.png";
    fabricObj.Object.prototype.controls.tr = new fabricObj.Control({
      x: 0.5,
      y: -0.5,
      cursorStyle: 'crosshair',
      actionHandler: fabricObj.controlsUtils.rotationWithSnapping,
      actionName: 'rotate',
      render: renderIconRotation,
      withConnection: true
    })

    function renderIconRotation(ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: Record<any, any>, fabricObject: Record<any, any>) {
      let size = 30;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabricObj.util.degreesToRadians(fabricObject.angle as number));
      ctx.drawImage(rotationImg, -size / 2, -size / 2, size, size);
      ctx.restore();
    }

    let deleteImg = document.createElement('img');
    deleteImg.src = "./img/images/remove.png";

    //custom
    fabricObj.Object.prototype.controls.deleteControl = new fabricObj.Control({
      x: -0.5,
      y: -0.5,
      cursorStyle: 'pointer',
      mouseUpHandler: deleteObject,
      actionName: 'remove',
      render: renderIconDelete,
      withConnection: true
    })

    function renderIconDelete(ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: Record<any, any>, fabricObject: Record<any, any>) {
      let size = 30;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabricObj.util.degreesToRadians(fabricObject.angle as number));
      ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size);
      ctx.restore();
    }

    function deleteObject(eventData: Record<any, any>, transform: Record<any, any>) {
      console.log('delete')
      let target = transform.target;
      let canvas = target.canvas;
      if('textIndex' in target) {
        self.$store.dispatch('updateCustomTextAttribute', {index: target.textIndex, on_all: true, attribute: 'text', value: ''})
      }else {
        let logo = setLogoSettings(target.logoIndex);
        logo.logoIndex = target.logoIndex;
        self.$store.commit('customLogos', logo)
        self.$store.commit('SET_LOGO_COLORS', []);
        self.$store.commit('SET_INITIAL_LOGO_COLORS', []);
      }
      canvas.remove(target);
      canvas.requestRenderAll();
    }
  }
})

export default class Scene extends Vue {
  @Prop({required: true}) readonly front!: Record<string, unknown>;
  @Prop({required: false}) readonly back!: Record<string, unknown>;
  @Prop({required: false}) readonly backTextureUrl!: string;
  @Prop({required: false}) readonly backTextrueExtension !: string;
  @Prop({required: false}) readonly logos !: [Record<string, any>];
  @Prop({required: false, default: () => { return [] }}) readonly texts !: [Record<string, any>];
  @Prop({required: false, default: () => { return [] }}) readonly lockerDefaultColors !: [Record<string, any>];
  @Prop({required: false, default:  () => { return {} }}) readonly lockerGroupColors !: Record<string, any>;
  @Prop({required: false}) readonly product_id !: number
  @Prop({required: false}) readonly carousel !: string
  @Prop({required: false, default: () => { return [] }}) readonly productNamesSetting !: [Record<any, any>]
  @Prop({required: false, default: false}) readonly logoAllowed !: boolean
  @Prop({required: false, default: false}) readonly preSetData !: boolean
  @Prop({required: false, default: true}) readonly multipleLogo !: boolean
  @Prop({required: false}) readonly logosLimit !: number
  @Prop({required: false}) readonly productColors !: [Record<string, any>];
  @Prop({required: true, default: 10}) readonly measurementRatio!: number;
  @Prop({required: false, default: 600}) readonly mainCanvasWidth!: number;
  @Prop({required: false, default: 600}) readonly mainCanvasHeight!: number;
  @Prop({required: false, default: 600}) readonly canvasWidth!: number;
  @Prop({required: false, default: 600}) readonly canvasHeight!: number;
  @Prop({required: false, default: false}) readonly mainPreview!: boolean;
  @Prop({required: false, default: true}) readonly canvasSelection!: boolean;
  @Prop({required: false, default: 'customized'}) readonly productType!: string;
  @Prop({required: false}) readonly colorGrouping!: Record<any, any>;
  private frontCanvas !: fabric.Canvas
  private backCanvas !: fabric.Canvas
  private frontTexture !: any
  private backTexture !: any
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  private logoObjects: any[] = []
  private customLogoObjects: any[] = []
  private customTextObjects: any[] = []
  private mounted = false
  private frontModel: any
  private backModel: any
  private showSmall = { front: false, back: this.manageComponents.mobileScreen }
  private svgGroups: any[] = []
  private initialSvgGroups: any[] = []
  public dimTextFront = new fabric.Text('', {
    fontSize: 20,
    backgroundColor: '#fff',
    hasControls: false,
    selectable: false,
    evented: false,
    lockMovementX: true,
    lockMovementY: true,
    visible: false,
    fontFamily: 'Ubuntu'
  })
  public dimTextBack!: fabric.Text
  public showLoader = true
  public otherSideLogos: any[] = []
  public otherSideTexts: any[] = []
  public logoIndex = 0
  public textIndex = 0
  public ctx:any = {}
  public verticalLines:Record<any, any>[] = []
  public horizontalLines:Record<any, any>[] = []
  public aligningLineOffset = 5
  public aligningLineMargin = 4
  public aligningLineWidth = 3
  public aligningLineColor = 'rgb(110, 243, 204)'
  public viewportTransform:any
  public drawLines = false

  get fillColors(): [Record<any, any>] {
    return this.$store.getters.getDefaultFilledColors
  }

  get customLogos(): [Record<any, any>] {
    let product_id = this.product_id? this.product_id : this.selectedProductId
    return this.$store.getters.getCustomLogos(product_id)
  }

  get customTexts(): [Record<any, any>] {
    let product_id = this.product_id? this.product_id : this.selectedProductId
    return this.$store.getters.getCustomTexts(product_id)
  }

  get manageComponents(): Record<any, any> {
    return this.$store.getters.getManageComponents
  }

  get defaultColors(): [Record<any, any>] {
    return this.$store.getters.getDefaultColors.filter((defaultColor: Record<any, any>) => { return defaultColor.color })
  }

  get groupColors() : [Record<any, any>] {
    return this.$store.getters.getGroupColors
  }

  get mainSvgGroups(): [Record<any, any>] {
    return this.$store.getters.getSvgGroups
  }

  get selectedProductId(): number {
    return this.$store.getters.getSelectedProductId
  }

  @Watch('customLogos', {
    deep: true
  })
  customLogosChanged(newVal: [Record<any, any>]) {
    if(this.mounted && this.logoAllowed) {
      const self = this
      if(this.customLogoObjects.length != this.customLogos.filter((logo: Record<any, any>) => logo && logo.url).length) {
        let deleteIndex: number[] = []
        this.customLogoObjects.forEach((item: Record<any, any>, index: number) => {
          if(item && (!this.customLogos[item.logoIndex] || this.customLogos[item.logoIndex].url == '' || this.customLogos[item.logoIndex].url == null)) {
            this.frontCanvas.remove(this.customLogoObjects[item.logoIndex])
            if (this.backCanvas) {
              this.backCanvas.remove(this.customLogoObjects[item.logoIndex])
            }
            if(this.otherSideLogos[item.logoIndex]) {
              this.frontCanvas.remove(this.otherSideLogos[item.logoIndex])
              if (this.backCanvas) {
                this.backCanvas.remove(this.otherSideLogos[item.logoIndex])
              }
              this.otherSideLogos[item.logoIndex] = null
            }
            deleteIndex.push(index)
          }
        })
       /* deleteIndex.forEach((item: number) => {
          Vue.delete(this.customLogoObjects, item)
        })*/
      }
      newVal.forEach((logo: Record<any, any>, index: number) => {
        let logoUrl = logo? (this.storageUrl + logo.url).trim().split(' ').join('%20') : ''
        if(logo && ((this.customLogoObjects[logo.logoIndex] && this.customLogoObjects[logo.logoIndex]._element && logo.side != this.customLogoObjects[logo.logoIndex].side) || (this.customLogoObjects[logo.logoIndex] && this.customLogoObjects[logo.logoIndex]._element && !logo.url) || (this.customLogoObjects[logo.logoIndex] && this.customLogoObjects[logo.logoIndex]._element && this.customLogoObjects[logo.logoIndex]._element.src != logoUrl))){
          self.frontCanvas.remove(this.customLogoObjects[logo.logoIndex])
          if (self.backCanvas) {
            self.backCanvas.remove(this.customLogoObjects[logo.logoIndex])
          }
          this.customLogoObjects[logo.logoIndex] = null
          if(this.mainPreview) {
            this.$store.commit("UPDATE_CUSTOM_LOGO_OBJECTS", {index: logo.logoIndex, data: null});
          }
          if(this.otherSideLogos[index]) {
            this.frontCanvas.remove(this.otherSideLogos[index])
            if (this.backCanvas) {
              this.backCanvas.remove(this.otherSideLogos[index])
            }
            this.otherSideLogos[index] = null
          }
        } else {
          if(!logo && this.customLogoObjects[index]) {
            this.frontCanvas.remove(this.customLogoObjects[index])
            if (this.backCanvas) {
              this.backCanvas.remove(this.customLogoObjects[index])
            }
            this.customLogoObjects[index] = null
            if(this.mainPreview) {
              this.$store.commit("UPDATE_CUSTOM_LOGO_OBJECTS", {index: index, data: null});
            }
            if(this.otherSideLogos[index]) {
              this.frontCanvas.remove(this.otherSideLogos[index])
              if (this.backCanvas) {
                this.backCanvas.remove(this.otherSideLogos[index])
              }
              this.otherSideLogos[index] = null
            }
          }
        }
      })

      newVal.forEach((logo: Record<any, any>, index: number) => {
        if(logo) {
          if ((logo.side == 'back' && self.backCanvas) || logo.side == 'front') {
            let addLogo = true
            if (this.customLogoObjects[logo.logoIndex] && this.customLogoObjects[logo.logoIndex]._element) {
              const logoObject = this.customLogoObjects[logo.logoIndex]
              const otherSideObject = this.otherSideLogos[logo.logoIndex]

              if(logo.haveControls) {
                this.eventAction(logo, logoObject, otherSideObject)
              }
              addLogo = false
            }

            if (addLogo && logo.url) {
              let backLogosCount = 0
              if (!this.backCanvas) {
                backLogosCount = this.customLogos.filter((item: Record<any, any>) => {
                  return item && item.side == 'back'
                }).length
              }

              if (this.logosLimit && this.customLogoObjects.filter((item: Record<any, any>) => item).length < this.logosLimit - backLogosCount) {
                this.addLogos(logo, index)
              } else if (!this.logosLimit) {
                this.addLogos(logo, index)
              }
            }
          }
        }
      })
    }
  }

  @Watch('customTexts', {
    deep: true, immediate: true
  })
  customTextsChanged(newVal: [Record<any, any>]) {
    if (this.mounted) {
      const self = this
      if(!newVal.filter((item: Record<any, any>) => item.text).length) {
        this.customTextObjects.forEach((customTextObject: fabric.Object, index: number) => {
          self.frontCanvas.remove(customTextObject)
          if (self.backCanvas) {
            self.backCanvas.remove(customTextObject)
          }
          this.customTextObjects[index] = null
          if(this.mainPreview) {
            this.$store.commit("UPDATE_CUSTOM_TEXT_OBJECTS", {index: index, data: null})
          }
        })
        this.otherSideTexts.forEach((otherSideText: fabric.Object, index: number) => {
          self.frontCanvas.remove(otherSideText)
          if (self.backCanvas) {
            self.backCanvas.remove(otherSideText)
          }
          this.otherSideTexts[index] = null
        })
      }
      newVal.forEach((text: Record<any, any>) => {
        if((this.customTextObjects[text.textIndex] && text.side != this.customTextObjects[text.textIndex].side) || (this.customTextObjects[text.textIndex] && !text.text)){
          self.frontCanvas.remove(this.customTextObjects[text.textIndex])
          if (self.backCanvas) {
            self.backCanvas.remove(this.customTextObjects[text.textIndex])
          }
          this.customTextObjects[text.textIndex] = null
          if(this.mainPreview) {
            this.$store.commit("UPDATE_CUSTOM_TEXT_OBJECTS", {index: text.textIndex, data: null})
          }
          if(this.otherSideTexts[text.textIndex]) {
            self.frontCanvas.remove(this.otherSideTexts[text.textIndex])
            if (self.backCanvas) {
              self.backCanvas.remove(this.otherSideTexts[text.textIndex])
            }
            this.otherSideTexts[text.textIndex] = null
          }
        }
      })

      newVal.forEach((text, index) => {
        if ((text.side == 'back' && self.backCanvas) || text.side == 'front') {
          let addText = true
          if (this.customTextObjects[text.textIndex] && this.customTextObjects[text.textIndex].text != '') {
            let textObject = this.customTextObjects[text.textIndex]
            const otherSideObject = this.otherSideTexts[text.textIndex]
            let canvas = this.frontCanvas
            if (text.side == 'back') {
              canvas = this.backCanvas
            }
            textObject.text = text.text
            textObject.fontFamily = text.fontFamily
            textObject.set('fill', text.fillColor)
            textObject.set('stroke', text.outLineColor)
            textObject.set('strokeWidth', parseInt(text.outLineWidth))
            textObject.set('strokeWidth', parseInt(text.outLineWidth))
            canvas.renderAll()

            this.eventAction(text, textObject, otherSideObject)
            addText = false
          }

          if (addText && text.text != '') {
            let finalText = JSON.parse(JSON.stringify(text))
            if (!text.action && self.productNamesSetting[index] && !text.textIndex) {
              finalText.width = self.productNamesSetting[index].width
              finalText.height = self.productNamesSetting[index].height
              finalText.x_axis = self.productNamesSetting[index].x_axis
              finalText.y_axis = self.productNamesSetting[index].y_axis
              finalText.rotation = self.productNamesSetting[index].rotation
            }
            self.addTexts(finalText, index)
          }
        }
      })
    }
  }

  @Watch('defaultColors', {
    deep: true
  })
  defaultColorsChanged(newVal: [Record<any, any>]) {
    if(this.productType == 'customized' && this.mounted) {
      let defaultColors = this.defaultColors.filter((color:Record<any, any>) => color.color) as [Record<any, any>]
      if(defaultColors.length) {
        this.changeDefaultColors(defaultColors)
      }else{
        this.setInitialColors();
      }
    }
  }

  @Watch('groupColors', {
    deep: true, immediate: false
  })
  groupColorsChanged(newVal: Record<any, any>) {
    if(this.productType == 'customized' && this.mounted) {
      this.changeGroupColor(newVal)
    }
  }

  public eventAction(item: Record<any, any>, object: Record<any, any>, otherSideObject: Record<any, any>) {
    if (item.action == 'drag') {
      object.center() //add center because all events only trigger if use it in fabric js.
      object.set({
        left: this.canvasWidth / this.mainCanvasWidth * item.x_axis,
        top: this.canvasHeight / this.mainCanvasHeight * item.y_axis
      })
    } else if (item.action == 'scale' || item.action == 'scaleX' || item.action == 'scaleY') {
      object.center()
      object.set({
        left: this.canvasWidth / this.mainCanvasWidth * item.x_axis,
        top: this.canvasHeight / this.mainCanvasHeight * item.y_axis
      })
      object.scaleX = this.canvasWidth / this.mainCanvasWidth * item.scaleX
      object.scaleY = this.canvasHeight / this.mainCanvasHeight * item.scaleY
      if(otherSideObject) {
        const left = otherSideObject.left
        const top = otherSideObject.top
        otherSideObject.center()
        otherSideObject.set({
          left: left,
          top: top
        })
        otherSideObject.scaleX = this.canvasWidth / this.mainCanvasWidth * item.scaleX
        otherSideObject.scaleY = this.canvasHeight / this.mainCanvasHeight * item.scaleY
      }
    } else if (item.action == 'rotate') {
      object.center()
      object.set({
        left: this.canvasWidth / this.mainCanvasWidth * item.x_axis,
        top: this.canvasHeight / this.mainCanvasHeight * item.y_axis
      })
      object.rotate(item.rotation as number)
      if(otherSideObject) {
        const left = otherSideObject.left
        const top = otherSideObject.top
        otherSideObject.center()
        otherSideObject.set({
          left: left,
          top: top
        })
        otherSideObject.rotate(item.rotation as number)
      }
    }
    object.setCoords()
  }

  public changeGroupColor (groupColors: Record<any, any>): void {
    let defaultColors = this.defaultColors.filter((color:Record<any, any>) => color.color) as [Record<any, any>]
    this.frontTexture.getObjects().forEach((item: Record<any, any>) => {
      item.id = item.id.toLowerCase()
      if (groupColors[item.id]) {
        item.set('fill', groupColors[item.id].color)
        let svgIndex = 0
        this.svgGroups.forEach((svgGroup: Record<any, any>, index: number) => {
          if (svgGroup.id == item.id) {
            svgIndex = index
            svgGroup.color = groupColors[item.id].color
            svgGroup.pantone = groupColors[item.id].pantone
          }
        })
        if (this.mainPreview) {
          this.$store.dispatch('updateSvgGroups', {
            index: svgIndex,
            color: groupColors[item.id].color,
            pantone: groupColors[item.id].pantone,
            name: groupColors[item.id].name
          })
        }
      }else if (!defaultColors.length) {
        let svgIndex = 0
        this.svgGroups.forEach((svgGroup: Record<any, any>, index: number) => {
          if (svgGroup.id == item.id) {
            svgIndex = index
          }
        })
        if(this.svgGroups[svgIndex].color != this.initialSvgGroups[svgIndex].color) {
          item.set('fill', this.initialSvgGroups[svgIndex].color)
          if(!this.back) {
            Object.assign(this.svgGroups[svgIndex], this.initialSvgGroups[svgIndex])
          }
        }
      }
    })
    this.frontCanvas.renderAll()
    if (this.back) {
      this.backTexture.getObjects().forEach((item: Record<any, any>) => {
        item.id = item.id.toLowerCase()
        if (groupColors[item.id]) {
          item.set('fill', groupColors[item.id].color);
          if (this.mainPreview) {
            let svgIndex = 0
            this.svgGroups.forEach((svgGroup: Record<any, any>, index: number) => {
              if (svgGroup.id == item.id) {
                svgIndex = index
              }
            })
            this.$store.dispatch('updateSvgGroups', {
              index: svgIndex,
              color: groupColors[item.id].color,
              pantone: groupColors[item.id].pantone,
              name: groupColors[item.id].name
            })
          }
        }else if (!defaultColors.length) {
          let svgIndex = 0
          this.svgGroups.forEach((svgGroup: Record<any, any>, index: number) => {
            if (svgGroup.id == item.id) {
              svgIndex = index
            }
          })
          if(this.svgGroups[svgIndex].color != this.initialSvgGroups[svgIndex].color) {
            item.set('fill', this.initialSvgGroups[svgIndex].color)
            Object.assign(this.svgGroups[svgIndex], this.initialSvgGroups[svgIndex])
          }
        }
      })
      this.backCanvas.renderAll()
    }
    this.unHideColorGrouping()
  }

  public changeDefaultColors (defaultColors: [Record<any, any>]): void {
    let appliedDefaultColors: string[] = []
    let useColorIndex = 0
    this.svgGroups.forEach((svgGroup: Record<any, any>, index: number) => {
      appliedDefaultColors[svgGroup.id] = defaultColors[useColorIndex].color
      if (this.mainPreview) {
        this.$store.dispatch('updateSvgGroups',
          {
            index: index,
            color: defaultColors[useColorIndex].color,
            pantone: defaultColors[useColorIndex].pantone,
            name: defaultColors[useColorIndex].name
          })
      }
      svgGroup.color = defaultColors[useColorIndex].color
      svgGroup.pantone = defaultColors[useColorIndex].pantone
      svgGroup.name = defaultColors[useColorIndex].name

      useColorIndex++
      if(useColorIndex >= defaultColors.length) {
        useColorIndex = 0
      }
    })

    this.frontTexture.getObjects().forEach((item: Record<any, any>) => {
      item.id = item.id.toLowerCase()
      if (appliedDefaultColors[item.id]) {
        item.set('fill', appliedDefaultColors[item.id]);
      }
    })
    this.frontCanvas.renderAll()

    if(this.back) {
      this.backTexture.getObjects().forEach((item: Record<any, any>) => {
        item.id = item.id.toLowerCase()
        if (appliedDefaultColors[item.id]) {
          item.set('fill', appliedDefaultColors[item.id]);
        }
      })
      this.backCanvas.renderAll()
    }
    this.unHideColorGrouping()
  }

  public setInitialColors (): void {
    let defaultSvgGroups: Record<any, any> = {}
    this.initialSvgGroups.forEach((svgGroup: Record<any, any>, index: number) => {
        defaultSvgGroups[svgGroup.id] = svgGroup
    })

    let appliedDefaultColors: string[] = []
    this.svgGroups.forEach((svgGroup: Record<any, any>, index: number) => {
      appliedDefaultColors[svgGroup.id] = defaultSvgGroups[svgGroup.id].color
      if (this.mainPreview) {
        this.$store.dispatch('updateSvgGroups',
          {
            index: index,
            color: defaultSvgGroups[svgGroup.id].color,
            pantone: defaultSvgGroups[svgGroup.id].pantone,
            name: defaultSvgGroups[svgGroup.id].name
          })
      }
      svgGroup.color = defaultSvgGroups[svgGroup.id].color
      svgGroup.pantone = defaultSvgGroups[svgGroup.id].pantone
      svgGroup.name = defaultSvgGroups[svgGroup.id].name
    })

    this.frontTexture.getObjects().forEach((item: Record<any, any>) => {
      item.id = item.id.toLowerCase()
      if (appliedDefaultColors[item.id]) {
        item.set('fill', appliedDefaultColors[item.id]);
      }
    })
    this.frontCanvas.renderAll()

    if(this.back) {
      this.backTexture.getObjects().forEach((item: Record<any, any>) => {
        item.id = item.id.toLowerCase()
        if (appliedDefaultColors[item.id]) {
          item.set('fill', appliedDefaultColors[item.id]);
        }
      })
      this.backCanvas.renderAll()
    }
  }

  public unHideColorGrouping() {
    if(this.colorGrouping) {
      for(let key in this.colorGrouping) {
        const distinguishPart = this.svgGroups.filter((svgGroup: Record<any, any>) => { return svgGroup.id == key.toLowerCase() })
        this.colorGrouping[key].forEach((comparePartId: string) => {
          const comparePart = this.svgGroups.filter((svgGroup: Record<any, any>) => { return svgGroup.id == comparePartId.toLowerCase() })
          if(distinguishPart.length && comparePart.length && distinguishPart[0].color == comparePart[0].color) {
            let changeColor: Record<any, any> = {}
            for(let index in this.productColors) {
              let colors = JSON.parse(this.productColors[index].color_text)
              for (let i in colors) {
                if(colors[i].value != comparePart[0].color) {
                  changeColor = colors[i]
                  break
                }
              }
              if(Object.keys(changeColor).length) {
                break
              }
            }
            if(!Object.keys(changeColor).length) {
              const closestColor = getClosestColor('#000000')
              changeColor = {value: closestColor.hex, name: closestColor.name, pantone: closestColor.pantone}
            }
            this.frontTexture.getObjects().forEach((item: Record<any, any>) => {
              item.id = item.id.toLowerCase()
              if (key.toLowerCase() == item.id) {
                item.set('fill', changeColor.value);
              }
            })
            this.frontCanvas.renderAll()
            if(this.back) {
              this.backTexture.getObjects().forEach((item: Record<any, any>) => {
                item.id = item.id.toLowerCase()
                if (key.toLowerCase() == item.id) {
                  item.set('fill', changeColor.value);
                }
              })
              this.backCanvas.renderAll()
            }
            let svgIndex = 0
            this.svgGroups.forEach((svgGroup: Record<any, any>, index: number) => {
              if (svgGroup.id == key.toLowerCase()) {
                svgIndex = index
                svgGroup.color = changeColor.value
                svgGroup.name = changeColor.name
                svgGroup.pantone = changeColor.pantone
              }
            })
            if (this.mainPreview) {
              this.$store.dispatch('updateSvgGroups', {
                index: svgIndex,
                color: changeColor.value,
                name: changeColor.name,
                pantone: changeColor.pantone
              })
            }
          }
        })
      }
    }
  }

  public getSvgGroups(): void {
    this.svgGroups = []
    this.initialSvgGroups = []
    this.frontTexture.getObjects().forEach((item: Record<any, any>) => {
      item.id = item.id.toLowerCase()
      if(!this.containsObject({ id: item.id })) {
        let count = 1
        if(item.id == 'base') {
          count = 100000 // to make base always at first color position
        }
        if(!item.id.includes('inside')) {
          if(item.fill.includes('rgb')) {
            item.fill = rgbHex(item.fill)
          }
          const pantoneColor = getClosestColor(item.fill)
          this.svgGroups.push({ id: item.id, color: item.fill, count: count, pantone: pantoneColor.pantone, name: pantoneColor.name })
        }
      }
    })

    if(this.backTexture) {
      this.backTexture.getObjects().forEach((item: Record<any, any>) => {
        item.id = item.id.toLowerCase()
        if(!this.containsObject({ id: item.id })) {
          let count = 1
          if(item.id == 'base') {
            count = 100000 // to make base always at first color position
          }
          if(!item.id.includes('inside')) {
            if(item.fill.includes('rgb')) {
              item.fill = rgbHex(item.fill)
            }
            const pantoneColor = getClosestColor(item.fill)
            this.svgGroups.push({ id: item.id, color: item.fill, count: count, pantone: pantoneColor.pantone, name: pantoneColor.name })
          }
        }
      })
    }

    this.svgGroups = this.svgGroups.sort((a, b) => (a.count < b.count) ? 1 : -1)
    this.initialSvgGroups = JSON.parse(JSON.stringify(this.svgGroups))

    if (this.mainPreview) {
      this.$store.dispatch('setSvgGroups', this.svgGroups)
    }

    if(this.productType == 'customized' && this.lockerDefaultColors.length) {
      let lockerDefaultColors = this.lockerDefaultColors.filter((color:Record<any, any>) => color.color) as [Record<any, any>]
      if(lockerDefaultColors.length) {
        this.changeDefaultColors(lockerDefaultColors)
      }
    }
    else if(this.productType == 'customized' && this.defaultColors.length) {
      let defaultColors = this.defaultColors.filter((color:Record<any, any>) => color.color) as [Record<any, any>]
      if(defaultColors.length) {
        this.changeDefaultColors(defaultColors)
      }
    }

    if(Object.keys(this.lockerGroupColors).length) {
      if(this.productType == 'customized') {
        this.changeGroupColor(this.lockerGroupColors)
      }
    }
    else if(Object.keys(this.groupColors).length && !this.lockerDefaultColors.length) {
      if(this.productType == 'customized') {
        this.changeGroupColor(this.groupColors)
      }
    }
  }

  public containsObject(obj: Record<any, any>): boolean {
    for (let i = 0; i < this.svgGroups.length; i++) {
      if( this.svgGroups[i].id == obj.id) {
        return true
      }
    }
    return false
  }

  public loadScene(ImageData: Record<any, any>, side: string): void {
    this.mounted = false
    let element = this.$refs.front as HTMLCanvasElement
    if (side === 'back') {
      element = this.$refs.back as HTMLCanvasElement
    }
    let canvas = new fabric.Canvas(element)
    if (side == 'back') {
      this.backCanvas = canvas
    } else {
      this.frontCanvas = canvas
    }
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center'

    let model: any
    if(this.productType == 'customized') {
      fabric.Image.fromURL(ImageData.modelUrl, (img: any) => {
        img.scaleToHeight(canvas.getHeight() - 10).set({
          hasControls: false,
          selectable: false,
          evented: false,
          globalCompositeOperation: 'multiply'
          // globalCompositeOperation: 'overlay'
        })
        img.center().setCoords()
        model = img
        if (side == 'back') {
          this.backModel = img
        } else {
          this.frontModel = img
        }
      }, { crossOrigin: 'Anonymous' })
    } else {
      model = true
    }


    this.addTexture(ImageData.textureUrl, side, ImageData.file_extension)

    if(this.backTextureUrl && side == 'front') {
      this.addTexture(this.storageUrl + this.backTextureUrl, 'back', this.backTextrueExtension)
    }

    const self = this

    const timer = setInterval(() => {
      let texture = this.frontTexture
      if (side == 'back') {
        texture = this.backTexture
      }
      if (model && texture && (!this.backTextureUrl || (this.backTextureUrl && this.backTexture))) {
        if (ImageData.file_extension == 'svg' && this.productType == 'customized' && (!this.back || (this.back && side == 'back'))) {
          this.getSvgGroups()
        }
        canvas.add(texture)
        canvas.viewportCenterObject(texture)
        this.logoObjects.forEach((logoObject) => {
          canvas.add(logoObject)
        })
        this.customLogoObjects.forEach((logoObject) => {
          canvas.add(logoObject)
        })
        this.customTextObjects.forEach((textObject) => {
          canvas.add(textObject)
        })

        if(this.productType == 'customized') {
          canvas.add(model)
          canvas.viewportCenterObject(model)
        }
        if (side == 'back') {
          canvas.add(self.dimTextBack)
        } else {
          canvas.add(self.dimTextFront)
        }
        canvas.renderAll()

        if(!this.back || (this.back && side == 'back')) {
          if(this.logos.length) {
            this.logos.forEach((logo: Record<any, any>, index: number) => {
              if(logo && logo.url) {
                this.addLogos(logo, index)
              }
            })
          }
          if(!this.preSetData) {
            let logos: Record<any, any>[] = []
            if (this.customLogos && this.logoAllowed) {
              let customLogos = JSON.parse(JSON.stringify(this.customLogos))
              if (this.logosLimit) {
                customLogos = this.customLogos.slice(0, this.logosLimit) as [Record<any, any>]
              }
              logos = logos.concat(customLogos) as [Record<any, any>]
            }
            if (logos.length) {
              logos.forEach((logo: Record<any, any>, index: number) => {
                if(logo && logo.url) {
                  this.addLogos(logo, index)
                }
              })
            }
          }
          if (this.customTexts.length || this.texts.length) {
            let texts = this.texts
            texts = texts.concat(this.customTexts) as [Record<any, any>]
            texts.forEach((text: Record<any, any>, index: number) => {
              this.addTexts(text, index)
            })
          }
          this.showLoader = false
          this.mounted = true
        }

        if (this.mainPreview) {
          this.setProductionSVG()
          this.$store.commit('STORE_CANVAS_IMAGE', {front: this.$refs.front, back: this.$refs.back})
        }
        clearInterval(timer)
      }
    }, 1000)
    canvas.on('object:modified', (e: Record<any, any>) => {
      var objects = canvas.getObjects('line');
      for (let i in objects) {
        canvas.remove(objects[i]);
      }
      this.drawLines = false
      self.objectMove(e, side)
      self.addToOtherSide(e.target, side)
    })

    var ctx = canvas.getSelectionContext()

    canvas.on('mouse:up', function() {
      self.verticalLines.length = self.horizontalLines.length = 0;
      canvas.renderAll();
    });
    canvas.on('before:render', function() {
      if(canvas.contextTop) {
        canvas.clearContext(canvas.contextTop);
      }
    });

    canvas.on('after:render', function() {
      for (let i = self.verticalLines.length; i--; ) {
        self.drawVerticalLine(self.verticalLines[i],ctx);
      }
      for (let i = self.horizontalLines.length; i--; ) {
        self.drawHorizontalLine(self.horizontalLines[i],ctx);
      }
      self.verticalLines.length = self.horizontalLines.length = 0;
    });

    canvas.on('mouse:down', () => {
      this.viewportTransform = canvas.viewportTransform;
    });

    let vertical_line = new fabric.Line([self.canvasWidth/2,0,self.canvasWidth/2,self.canvasHeight], {
      stroke: '#6EF3CC',
      strokeWidth:4,
      strokeDashArray: [5, 5],
    })
    let horizontal_line = new fabric.Line([0,(self.canvasHeight/2),self.canvasWidth,(self.canvasHeight/2)], {
      stroke: '#6EF3CC',
      strokeWidth:4,
      strokeDashArray: [5, 5],
    })
    let relativeCanvasWidth = self.canvasWidth/2 - 20
    let relativeCanvasHeight = self.canvasHeight/2 - 20

    canvas.on('object:moving', (e: Record<any, any>) => {
      self.objectScaling(e, side)
      let customObj:Record<any, any> = this.getCustomObjectsLength(canvas)
      if(customObj.logoLength + customObj.textLength == 1)
        this.addGuideLine(e,canvas,vertical_line,horizontal_line,relativeCanvasWidth,relativeCanvasHeight)

      self.addGuideForMultipleObjects(canvas,e.target)
    })

    canvas.on('object:scaling', (e: Record<any, any>) => {
      let dimText = this.dimTextFront
      if (e.target.side == 'back') {
        dimText = this.dimTextBack
      }
      this.showDimensions(e, dimText)
    });
  }
  public getCustomObjectsLength(canvas:Record<any, any>) {
    let logoLength = 0
    let textLength = 0
    canvas.getObjects().forEach((obj:Record<any, any>) => {
      if('logoIndex' in obj) {
        logoLength++
      }
      if('textIndex' in obj) {
        textLength++
      }
    })
    return {logoLength,textLength}
  }
  public addGuideLine(e: Record<any, any>, canvas: Record<any, any>,vertical_line:Record<any, any>,horizontal_line:Record<any, any>,relativeCanvasWidth:number,relativeCanvasHeight:number) {

    if(!this.drawLines) {
      canvas.add(vertical_line);
      canvas.add(horizontal_line);
      this.drawLines = true
    }

    let actObj = e.target;
    let coords = actObj.calcCoords();

    let left = coords.tl.x;
    let top = coords.tl.y;


    let  height = e.target.height * e.target.scaleY
    let width = e.target.width * e.target.scaleX
    width = Math.trunc(width/2)
    height = Math.trunc(height/2)

    if(parseInt(left) >= relativeCanvasWidth-width && parseInt(left) <= (relativeCanvasWidth-width)+5) {
      vertical_line.set({
        stroke: '#6EF3CC',
        strokeWidth:4,
        strokeDashArray: []
      })
      canvas.renderAll()
    }
    else {
      vertical_line.set({
        stroke: '#6EF3CC',
        strokeWidth:4,
        strokeDashArray: [5,5]
      })
      canvas.renderAll()
    }

    if(parseInt(top) >= relativeCanvasHeight-height && parseInt(top) <= (relativeCanvasHeight-height)+5 ) {
      horizontal_line.set({
        stroke: '#6EF3CC',
        strokeWidth:4,
        strokeDashArray: [],
      })
      canvas.renderAll();
    }
    else {
      horizontal_line.set({
        stroke: '#6EF3CC',
        strokeWidth:4,
        strokeDashArray: [5,5],
      })
      canvas.renderAll();
    }
  }

  public addGuideForMultipleObjects(canvas:Record<any, any>,selectedObject:Record<any, any>) {
    var activeObject = selectedObject,
      canvasObjects = canvas.getObjects(),
      activeObjectCenter = activeObject.getCenterPoint(),
      activeObjectLeft = activeObjectCenter.x,
      activeObjectTop = activeObjectCenter.y,
      activeObjectBoundingRect = activeObject.getBoundingRect(),
      activeObjectHeight = activeObjectBoundingRect.height / this.viewportTransform[3],
      activeObjectWidth = activeObjectBoundingRect.width / this.viewportTransform[0],
      horizontalInTheRange = false,
      verticalInTheRange = false,
      transform = canvas._currentTransform;

    if (!transform) return;

    // It should be trivial to DRY this up by encapsulating (repeating) creation of x1, x2, y1, and y2 into functions,
    // but we're not doing it here for perf. reasons -- as this a function that's invoked on every mouse move

    for (var i = canvasObjects.length; i--; ) {
      if (canvasObjects[i] === activeObject) continue;

      if('logoIndex' in canvasObjects[i] || 'textIndex' in canvasObjects[i]) {

        var objectCenter = canvasObjects[i].getCenterPoint(),
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
          activeObject.setPositionByOrigin(new fabric.Point(objectLeft, activeObjectTop), 'center', 'center');
        }

        // snap by the left edge
        if (this.isInRange(objectLeft - objectWidth / 2, activeObjectLeft - activeObjectWidth / 2)) {
          verticalInTheRange = true;
          this.verticalLines.push({
            x: objectLeft - objectWidth / 2 +10,
            y1: (objectTop < activeObjectTop)
              ? (objectTop - objectHeight / 2 - this.aligningLineOffset)
              : (objectTop + objectHeight / 2 + this.aligningLineOffset),
            y2: (activeObjectTop > objectTop)
              ? (activeObjectTop + activeObjectHeight / 2 + this.aligningLineOffset)
              : (activeObjectTop - activeObjectHeight / 2 - this.aligningLineOffset)
          });
          activeObject.setPositionByOrigin(new fabric.Point(objectLeft - objectWidth / 2 + activeObjectWidth / 2, activeObjectTop), 'center', 'center');
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
          activeObject.setPositionByOrigin(new fabric.Point(objectLeft + objectWidth / 2 - activeObjectWidth / 2, activeObjectTop), 'center', 'center');
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
          activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop), 'center', 'center');
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
          activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop - objectHeight / 2 + activeObjectHeight / 2), 'center', 'center');
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
          activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop + objectHeight / 2 - activeObjectHeight / 2), 'center', 'center');
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

  public drawVerticalLine(coords:any,ctx:CanvasRenderingContext2D) {
    this.drawLine(
      coords.x + 0.5,
      coords.y1 > coords.y2 ? coords.y2 : coords.y1,
      coords.x + 0.5,
      coords.y2 > coords.y1 ? coords.y2 : coords.y1, ctx);
  }

  public drawHorizontalLine(coords:any,ctx:any) {
    this.drawLine(
      coords.x1 > coords.x2 ? coords.x2 : coords.x1,
      coords.y + 0.5,
      coords.x2 > coords.x1 ? coords.x2 : coords.x1,
      coords.y + 0.5,ctx);
  }

  public drawLine(x1:number, y1:number, x2:number, y2:number,ctx:CanvasRenderingContext2D) {
    ctx.save();
    ctx.lineWidth = this.aligningLineWidth;
    ctx.strokeStyle = this.aligningLineColor;
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    ctx.moveTo(((x1+this.viewportTransform[4])), ((y1+this.viewportTransform[5])));
    ctx.lineTo(((x2+this.viewportTransform[4])), ((y2+this.viewportTransform[5])));
    ctx.stroke();
    ctx.restore();
  }

  public isInRange(value1:number, value2:number) {
    value1 = Math.round(value1);
    value2 = Math.round(value2);
    for (var i = value1 - this.aligningLineMargin, len = value1 + this.aligningLineMargin; i <= len; i++) {
      if (i === value2) {
        return true;
      }
    }
    return false;
  }


  public objectScaling(e: Record<any, any>, side: string) {
    let texture = this.frontTexture
    let canvas = this.frontCanvas
    if(side == 'back') {
      texture = this.backTexture
      canvas = this.backCanvas
    }

    const modelBoundingRect = texture.getBoundingRect()
    let boundingRect = {
      left: modelBoundingRect.left,
      right: modelBoundingRect.left + modelBoundingRect.width,
      top: modelBoundingRect.top,
      bottom: modelBoundingRect.top + modelBoundingRect.height,
    }

    if(e.target.left > boundingRect.right - (e.target.width / 4)) {
      e.target.left = boundingRect.right - (e.target.width / 4)
    }
    else if(e.target.left < boundingRect.left + (e.target.width / 4)) {
      e.target.left = boundingRect.left + (e.target.width / 4)
    }
    if(e.target.top > boundingRect.bottom - (e.target.height / 6)){
      e.target.top = boundingRect.bottom - (e.target.height / 6)
    }
    else if(e.target.top < boundingRect.top + (e.target.height / 6)) {
      e.target.top = boundingRect.top + (e.target.height / 6)
    }

    let centerPoint = e.target.getCenterPoint()
    if(canvas.isTargetTransparent(texture, centerPoint.x, centerPoint.y)) {
      const boundingDistance = {
        left: Math.abs(boundingRect.left - centerPoint.x),
        right: Math.abs(boundingRect.right - centerPoint.x)
      } as Record<any, any>

      let moveTo = 'left'
      Object.keys(boundingDistance).forEach((key: string) => {
        if(boundingDistance[key] > boundingDistance[moveTo]) {
          moveTo = key
        }
      })

      let direction = this.targetNonTransparent(canvas, texture, e.target.left, e.target.top, moveTo)

      e.target.left = direction.left
    }

    let dimText = this.dimTextFront
    if(e.target.side == 'back') {
      dimText = this.dimTextBack
    }
    this.showDimensions(e, dimText)
  }

  public addToOtherSide(target: any, side: string) {
    if(side == 'back' || (this.back && side == 'front')) {
      let model = this.frontTexture
      let canvas = this.frontCanvas
      if (side == 'back' && this.back) {
        model = this.backTexture
        canvas = this.backCanvas
      }

      let addIndex = 0
      if (target.text) {
        addIndex = target.textIndex
      } else {
        addIndex = target.logoIndex
      }

      const modelBoundingRect = model.getBoundingRect()
      let boundingRect = {
        left: modelBoundingRect.left,
        right: modelBoundingRect.left + modelBoundingRect.width,
        top: modelBoundingRect.top,
        bottom: modelBoundingRect.top + modelBoundingRect.height,
      }

      let centerPoint = target.getCenterPoint()
      const boundingDistance = {
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

      const width = target.width * target.scaleX;
      let checkPointX = target.left + width / 2
      if (nearTo == 'left') {
        checkPointX = target.left - width / 2
      }

      let otherSideObjects = this.otherSideLogos
      if(target.text) {
        otherSideObjects = this.otherSideTexts
      }
      if (canvas.isTargetTransparent(model, checkPointX, centerPoint.y)) {
        let addLeft = 0
        let addTop = 0
        const model_start = (model.left - ((model.width * model.scaleX) / 2)) - 1
        const model_end = (model.left + ((model.width * model.scaleX) / 2)) + 1
        const width = target.width * target.scaleX;
        if (nearTo == 'left') {
          const direction = this.targetNonTransparent(canvas, model, checkPointX, centerPoint.y, 'right')
          const directionFromRight = this.targetNonTransparent(canvas, model, model_end, centerPoint.y, 'left')
          const outside = direction.left - checkPointX
          const modelSpaceLeft = directionFromRight.left + (width / 2) + 10
          addLeft = modelSpaceLeft - outside
          addTop = target.top
        } else {
          const direction = this.targetNonTransparent(canvas, model, target.left + width, target.top, 'left')
          const directionFromRight = this.targetNonTransparent(canvas, model, model_start, centerPoint.y, 'right')
          const outside = checkPointX - direction.left
          const modelSpaceRight = directionFromRight.left - (width / 2) - 10
          addLeft = modelSpaceRight + outside
          addTop = target.top
        }

        if (otherSideObjects[addIndex]) {
          otherSideObjects[addIndex].left = addLeft
          otherSideObjects[addIndex].top = addTop
          if (side == 'back') {
            this.frontCanvas.renderAll()
          } else {
            if(this.back) {
              this.backCanvas.renderAll()
            }
          }
        } else {
          let objectAdd = fabric.util.object.clone(target)
          objectAdd.left = addLeft
          objectAdd.top = addTop
          objectAdd.hasControls = false
          objectAdd.selectable = false
          objectAdd.evented = false
          otherSideObjects[addIndex] = objectAdd
          if (side == 'back') {
            this.frontCanvas.add(objectAdd)
            if(this.productType == 'customized') {
              this.frontModel.bringToFront()
            }
          } else {
            if(this.back) {
              this.backCanvas.add(objectAdd)
              if(this.productType == 'customized') {
                this.backModel.bringToFront()
              }
            }
          }
        }
      } else {
        if (otherSideObjects[addIndex]) {
          if (side == 'back') {
            this.frontCanvas.remove(otherSideObjects[addIndex])
          } else {
            if(this.back) {
              this.backCanvas.remove(otherSideObjects[addIndex])
            }
          }
          otherSideObjects.splice(addIndex, 1)
        }
      }
    }
  }

  public targetNonTransparent(canvas: fabric.Canvas, model: fabric.Image, pointX: number, pointY: number, moveTo: string): Record<any, any> {
    if(canvas.isTargetTransparent(model, pointX, pointY)) {
      if(moveTo == 'left') {
        pointX = pointX - 1
      } else {
        pointX = pointX + 1
      }
      return this.targetNonTransparent(canvas, model, pointX, pointY, moveTo)
    } else {
      return {left: pointX, top: pointY}
    }
  }

  public targetTransparent(canvas: fabric.Canvas, model: fabric.Image, pointX: number, pointY: number, moveTo: string): Record<any, any> {
    if(canvas.isTargetTransparent(model, pointX, pointY)) {
      if(moveTo == 'left') {
        pointX = pointX - 1
      } else {
        pointX = pointX + 1
      }
      return this.targetTransparent(canvas, model, pointX, pointY, moveTo)
    } else {
      return {left: pointX, top: pointY}
    }
  }

  public updateLogoObject(obj:Record<any, any>,update_obj:Record<any, any>) {

    Object.keys(obj).map(function(key, index) {
      obj[key].forEach((logo:Record<any, any>,logo_index:number) => {
        let logo_obj = obj[key][logo_index]
        obj[key][logo_index] = {...logo_obj, ...update_obj}
      })
    });
    return obj;
  }

  public updateTextObject(obj:Record<any, any>,update_obj:Record<any, any>) {

    Object.keys(obj).map(function(key, index) {
      obj[key].forEach((logo:Record<any, any>,logo_index:number) => {
        let logo_obj = obj[key][logo_index]
        obj[key][logo_index] = {...logo_obj, ...update_obj}
      })
    });
    return obj;
  }

  public objectMove(e: any, side: string) {
    const self = this;
    if(e.target.text) {
      this.customTexts.forEach((text, index) => {
        if(e.target.textIndex == index) {
          if (e.action == 'drag') {
            let before_update = this.updateTextObject(JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)),{'action':e.action})
            this.$store.commit('UPDATE_UNDO', { data: before_update, action: 'customTexts' })
            self.$store.dispatch('updateCustomTextAttribute', {
              index: index,
              on_all: false,
              attribute: 'x_axis',
              value: e.target.left
            })
            self.$store.dispatch('updateCustomTextAttribute', {
              index: index,
              on_all: false,
              attribute: 'y_axis',
              value: e.target.top
            })
          } else if (e.action == 'scale' || e.action == 'scaleX' || e.action == 'scaleY') {
            let before_update = this.updateTextObject(JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)),{'action':e.action})
            self.$store.commit('UPDATE_UNDO', { data: before_update, action: 'customTexts' })
            const width = e.target.width * e.target.scaleX;
            const height = e.target.height * e.target.scaleY;
            const outLineWidth = e.target.strokeWidth * e.target.scaleX
            self.$store.dispatch('updateCustomTextAttribute', {
              index: index,
              on_all: false,
              attribute: 'scaleX',
              value: e.target.scaleX
            })
            self.$store.dispatch('updateCustomTextAttribute', {
              index: index,
              on_all: false,
              attribute: 'originalWidth',
              value: Math.floor(width * this.measurementRatio)
            })
            self.$store.dispatch('updateCustomTextAttribute', {
              index: index,
              on_all: false,
              attribute: 'scaleY',
              value: e.target.scaleY
            })
            self.$store.dispatch('updateCustomTextAttribute', {
              index: index,
              on_all: false,
              attribute: 'originalHeight',
              value: Math.floor(height * this.measurementRatio)
            })
            self.$store.dispatch('updateCustomTextAttribute', {
              index: index,
              on_all: false,
              attribute: 'originalOutLineWidth',
              value: outLineWidth * this.measurementRatio
            })
          } else if (e.action == 'rotate') {
            let before_update = this.updateTextObject(JSON.parse(JSON.stringify(this.$store.getters.getCustomTextObject)),{'action':e.action})
            this.$store.commit('UPDATE_UNDO', { data: before_update, action: 'customTexts' })
            self.$store.dispatch('updateCustomTextAttribute', {
              index: index,
              on_all: false,
              attribute: 'rotation',
              value: e.target.angle
            })
          }
          self.$store.dispatch('updateCustomTextAttribute', {
            index: index,
            on_all: false,
            attribute: 'action',
            value: e.action
          })
          let dimText = this.dimTextFront
          if(e.target.side == 'back') {
            dimText = this.dimTextBack
          }
          this.showDimensions(e, dimText)
        }
      })
    } else {
      this.customLogos.forEach((logo, index) => {
        if(logo) {
          let logoUrl = (this.storageUrl + logo.url).trim().split(' ').join('%20')
          if (logoUrl == e.target._element.src && logo.logoIndex == e.target.logoIndex) {
            if (e.action == 'drag') {
              let before_update = this.updateLogoObject(JSON.parse(JSON.stringify(this.$store.getters.getCustomLogoObject)),{'action':e.action})
              self.$store.commit('UPDATE_UNDO', { data: before_update, action: 'customLogos' })
              self.$store.dispatch('updateCustomLogoAttribute', {
                index: index,
                attribute: 'x_axis',
                value: e.target.left
              })
              self.$store.dispatch('updateCustomLogoAttribute', {
                index: index,
                attribute: 'y_axis',
                value: e.target.top
              })
            } else if (e.action == 'scale' || e.action == 'scaleX' || e.action == 'scaleY') {
              let before_update = this.updateLogoObject(JSON.parse(JSON.stringify(this.$store.getters.getCustomLogoObject)),{'action':e.action})
              self.$store.commit('UPDATE_UNDO', { data: before_update, action: 'customLogos' })
              const width = e.target.width * e.target.scaleX;
              const height = e.target.height * e.target.scaleY;
              self.$store.dispatch('updateCustomLogoAttribute', {
                index: index,
                attribute: 'scaleX',
                value: e.target.scaleX
              })
              self.$store.dispatch('updateCustomLogoAttribute', {
                index: index,
                attribute: 'originalWidth',
                value: Math.floor(width * this.measurementRatio)
              })
              self.$store.dispatch('updateCustomLogoAttribute', {
                index: index,
                attribute: 'scaleY',
                value: e.target.scaleY
              })
              self.$store.dispatch('updateCustomLogoAttribute', {
                index: index,
                attribute: 'originalHeight',
                value: Math.floor(height * this.measurementRatio)
              })
            } else if (e.action == 'rotate') {
              let before_update = this.updateLogoObject(JSON.parse(JSON.stringify(this.$store.getters.getCustomLogoObject)),{'action':e.action})
              self.$store.commit('UPDATE_UNDO', { data: before_update, action: 'customLogos' })
              self.$store.dispatch('updateCustomLogoAttribute', {
                index: index,
                attribute: 'rotation',
                value: e.target.angle
              })
            }
            self.$store.dispatch('updateCustomLogoAttribute', {
              index: index,
              attribute: 'action',
              value: e.action
            })
            let dimText = this.dimTextFront
            if (e.target.side == 'back') {
              dimText = this.dimTextBack
            }
            this.showDimensions(e, dimText)
          }
        }
      })
    }
  }

  public addTexture (textureUrl: string, side: string, file_ext: string): void {
    const self = this
    if(file_ext == 'svg'){
      fabric.loadSVGFromURL(textureUrl, (objects: any, options: any) => {
        options.crossOrigin = 'Anonymous'
        const img = fabric.util.groupSVGElements(objects) as fabric.Group
        img.scaleToHeight(self.frontCanvas.getHeight() - 10).set({
          hasControls: false,
          selectable: false,
          evented: false,
          lockMovementX: true,
          lockMovementY: true,
        })

        // img._objects.forEach((element: any) => {
        //   if(element.id === 'Laces') {
        //     element.globalCompositeOperation = 'destination-out'
        //   }
        // })
        img.center().setCoords();

        if (side == 'back') {
          this.backTexture = img
        } else {
          this.frontTexture = img
        }
      })
    }else{
      fabric.Image.fromURL(textureUrl, (img: any) => {
       // console.log(img)
        img.scaleToHeight(self.frontCanvas.getHeight() - 10).set({
          hasControls: false,
          selectable: false,
          evented: false,
          lockMovementX: true,
          lockMovementY: true
        })
        img.center().setCoords()


        if (side == 'back') {
          this.backTexture = img
        } else {
          this.frontTexture = img
        }
      }, { crossOrigin: 'Anonymous' })
    }

  }

  public addLogos(logo: Record<any, any>, logoIndex: null|number = null) {
    if ('logoIndex' in logo) {
      logoIndex = logo.logoIndex
    } else {
      this.$store.dispatch('updateCustomLogoWithoutTrigger', {
        index: logoIndex,
        data: {
          logoIndex: logoIndex,
        }
      })
    }


    if ((logo.side == 'front' || (logo.side == 'back' && this.back)) && (this.multipleLogo || (!this.multipleLogo && logoIndex as number == 0)) && !this.customLogoObjects[logoIndex as number]) {
      if (logo.customLogo) {
        this.customLogoObjects[logoIndex as number] = true
      }
      logo.haveControls = Boolean(logo.haveControls)
      let logoUrl = (this.storageUrl + logo.url).trim().split(' ').join('%20')
      fabric.Image.fromURL(logoUrl, (img: any) => {
        img.scaleToWidth(this.canvasWidth / this.mainCanvasWidth * logo.width as number)
        img.set({
          left: this.canvasWidth / this.mainCanvasWidth * logo.x_axis,
          top: this.canvasHeight / this.mainCanvasHeight * logo.y_axis,
          angle: logo.rotation as number,
          centeredScaling: true,
          selectable: this.canvasSelection,
          //selectable: !this.canvasSelection ? this.canvasSelection : logo.haveControls,
          hasControls: logo.haveControls,
          hasBorders: false,
          evented: logo.haveControls,
          crossOrigin: 'Anonymous',
          globalCompositeOperation: 'source-atop',
          lockScalingFlip: true,
          padding: 15,
          cornerSize: 30
        })

        if (logo.scaleX && logo.scaleY) {
          img.scaleX = this.canvasWidth / this.mainCanvasWidth * logo.scaleX
          img.scaleY = this.canvasHeight / this.mainCanvasHeight * logo.scaleY
        }

        let model = this.frontModel
        let canvas = this.frontCanvas
        let dimText = this.dimTextFront
        if (logo.side == 'back') {
          canvas = this.backCanvas
          model = this.backModel
          dimText = this.dimTextBack
        }

        img.setControlsVisibility({
          tl: false,
          bl: false,
          tr: true,
          br: true,
          ml: false,
          mb: false,
          mr: false,
          mt: false,
          mtr: false
        })

        Object.assign(img, {
          logoIndex: logoIndex,
          side: logo.side
        })
        canvas.add(img)
        if(this.productType == 'customized') {
          model.bringToFront()
        }
        canvas.renderAll()

        this.addToOtherSide(img, logo.side)

        if (logo.customLogo) {
          if (this.mainPreview) {
            const width = Math.floor(img.width * img.scaleX * this.measurementRatio)
            const height = Math.floor(img.height * img.scaleY * this.measurementRatio)
            this.$store.dispatch('updateCustomLogoWithoutTrigger', {
              index: logoIndex,
              data: {
                originalWidth: width,
                originalHeight: height,
                scaleX: img.scaleX,
                scaleY: img.scaleY,
              }
            })
          }
          this.customLogoObjects[logoIndex as number] = img
          if(this.mainPreview) {
            this.$store.commit("UPDATE_CUSTOM_LOGO_OBJECTS", {index: logoIndex, data: img});
          }
        } else {
          this.logoObjects.push(img)
        }

        img.on('selected', (e: Record<any, any>) => {
          this.$root.$emit('changeLogoTabIndex', logoIndex);
          this.showDimensions(e, dimText)
        })
        canvas.on('selection:cleared', () => {
          dimText.set({
            visible: false
          })
        })
      }, { crossOrigin: 'Anonymous' })
    }
  }

  public showDimensions(e: any, dimText: Record<any, any>) {
    let object = e.target;

    let width = object.width * object.scaleX * this.measurementRatio;
    let height = object.height * object.scaleY * this.measurementRatio;

    if(width != 0 || height != 0){
      dimText.set({
        left: object.left,
        top: object.top + ((object.height * object.scaleY) / 2) + dimText.height * dimText.scaleY + 20,
        text: 'Size '+ width.toFixed(1) + 'cm x ' + height.toFixed(1) + 'cm',
        visible: true
      }).bringToFront()
    }


  }

  public addTexts(text: Record<any, any>, textIndex: null | number = null) {
    const self = this
    if('textIndex' in text) {
      textIndex = text.textIndex
    } else {
      let product_id = this.product_id? this.product_id : this.selectedProductId
      this.$store.dispatch('updateCustomTextWithoutTrigger', {
        index: textIndex,
        product_id: product_id,
        data: {
          textIndex: textIndex,
        }
      })
    }
    if(text.text && text.text != '' && (text.side == 'front' || (text.side == 'back' && self.back)) && !this.customTextObjects[textIndex as number]) {
      let textBox = new fabric.Text(text.text, {
        left: self.canvasWidth / self.mainCanvasWidth * text.x_axis,
        top: self.canvasHeight / self.mainCanvasHeight * text.y_axis,
        angle: text.rotation as number,
        centeredScaling: true,
        selectable: this.canvasSelection,
        hasControls: true,
        hasBorders: false,
        evented: true,
        globalCompositeOperation: 'source-atop',
        fontFamily: text.fontFamily,
        fill: text.fillColor,
        stroke: text.outLineColor,
        strokeWidth: parseInt(text.outLineWidth),
        paintFirst: 'stroke',
        lockScalingFlip: true,
        padding: 15,
        cornerSize: 30,
        fontSize: self.canvasHeight / self.mainCanvasHeight * text.width
      })

      textBox.set('height', this.canvasWidth / this.mainCanvasWidth * text.width)
      if(text.scaleX && text.scaleY) {
        textBox.scaleX = this.canvasWidth / this.mainCanvasWidth * text.scaleX
        textBox.scaleY = this.canvasHeight / this.mainCanvasHeight * text.scaleY
      }

      let canvas = self.frontCanvas
      let model = self.frontModel
      let dimText = self.dimTextFront
      if (text.side == 'back') {
        canvas = self.backCanvas
        model = self.backModel
        dimText = self.dimTextBack
      }
      textBox.setControlsVisibility({
        tl: false,
        bl: false,
        tr: true,
        br: true,
        ml: false,
        mb: false,
        mr: false,
        mt: false,
        mtr: false
      })

      Object.assign(textBox, {
        textIndex: textIndex,
        side: text.side
      })
      self.customTextObjects[textIndex as number] = textBox
      canvas.add(textBox)
      if(this.productType == 'customized') {
        model.bringToFront()
      }
      canvas.renderAll()

      this.addToOtherSide(textBox, text.side)

      if(this.mainPreview) {
        self.$store.commit("UPDATE_CUSTOM_TEXT_OBJECTS", {index: textIndex, data: textBox});
        const scaleX = textBox.scaleX as number
        const scaleY = textBox.scaleY as number
        const width = Math.floor(textBox.width as number * scaleX * this.measurementRatio)
        const height = Math.floor(textBox.height as number * scaleY * this.measurementRatio)
        const outLineWidth = textBox.strokeWidth as number * this.measurementRatio
        self.$store.dispatch('updateCustomTextWithoutTrigger', {
          index: textIndex,
          data: {
            originalWidth: width,
            originalHeight: height,
            originalOutLineWidth: outLineWidth,
            scaleX: textBox.scaleX,
            scaleY: textBox.scaleY
          }
        })
      }

      textBox.on('selected', (e: Record<any, any>) => {
        this.showDimensions(e, dimText)
      })
      canvas.on('selection:cleared', () => {
        dimText.set({
          visible: false
        })
      })
    }
  }

  public setShowSmall(side: string): void {
    if(this.manageComponents.mobileScreen && this.backCanvas) {
      if(side == 'back') {
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
.available-designs-section{
  .canvas-area-holder,
  .fix-space {
    a{
      flex: 0 0 100%;
      max-width: 100%;
      //&:last-child{display: none;}
    }
  }
}
.canvas-area-holder{
  a{
    h2{
      display: none;
    }
  }
}
.loader{
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
  background: rgba(255,255,255,0.9);
  z-index: 1030;
  img{
    max-width: 15%;
    display: block;
    margin: 0 auto;
    height: auto;
  }
}
</style>
