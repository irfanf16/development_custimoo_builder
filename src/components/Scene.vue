<template>
  <div class="loading-holder">
    <div class="canvas-area-holder" :class="{ 'fix-space': !manageComponents.mobileScreen}" style="display: flex; justify-content: space-between;">
      <a @click="setShowSmall('back')" :class="{'show-small' : showSmall.front}">
        <canvas ref="front" id="front" class="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
        <h2>Front</h2>
      </a>
      <a @click="setShowSmall('front')" :class="{'show-small' : showSmall.back}">
        <canvas v-if="back" ref="back" id="back" class="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
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
        visible: false
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
      let target = transform.target;
      let canvas = target.canvas;
      if('textIndex' in target) {
        self.$store.dispatch('updateCustomTextAttribute', {index: target.textIndex, attribute: 'text', value: ''})
      }else {
        self.$store.dispatch('deleteCustomLogo', {index: target.logoIndex})
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
  @Prop({required: false}) readonly logos !: [Record<string, any>];
  @Prop({required: false, default: () => { return [] }}) readonly texts !: [Record<string, any>];
  @Prop({required: false, default: () => { return [] }}) readonly lockerDefaultColors !: [Record<string, any>];
  @Prop({required: false, default:  () => { return {} }}) readonly lockerGroupColors !: Record<string, any>;
  @Prop({required: false, default: () => { return [] }}) readonly logosSettings !: [Record<any, any>]
  @Prop({required: false, default: () => { return [] }}) readonly productNamesSetting !: [Record<any, any>]
  @Prop({required: false}) readonly logoAllowed !: boolean
  @Prop({required: false}) readonly logosLimit !: number
  @Prop({required: false}) readonly productColors !: [Record<string, any>];
  @Prop({required: true, default: 10}) readonly measurementRatio!: number;
  @Prop({required: false, default: 600}) readonly mainCanvasWidth!: number;
  @Prop({required: false, default: 600}) readonly mainCanvasHeight!: number;
  @Prop({required: false, default: 600}) readonly canvasWidth!: number;
  @Prop({required: false, default: 600}) readonly canvasHeight!: number;
  @Prop({required: false, default: false}) readonly mainPreview!: boolean;
  @Prop({required: false, default: true}) readonly canvasSelection!: boolean;
  @Prop({required: false}) readonly colorGrouping!: Record<any, any>;
  private frontCanvas !: fabric.Canvas
  private backCanvas !: fabric.Canvas
  private frontTexture !: any
  private backTexture !: any
  private apiBaseUrl = process.env.VUE_APP_API_BASE_URL
  private logoObjects: any[] = []
  private customLogoObjects: any[] = []
  private customTextObjects: any[] = []
  private mounted = false
  private frontModel: any
  private backModel: any
  private showSmall = { front: false, back: this.manageComponents.mobileScreen }
  private svgGroups: any[] = []
  public dimTextFront = new fabric.Text('', {
    fontSize: 20,
    backgroundColor: '#fff',
    hasControls: false,
    selectable: false,
    evented: false,
    lockMovementX: true,
    lockMovementY: true,
    visible: false
  })
  public dimTextBack!: fabric.Text
  public showLoader = true
  public otherSideLogos: any[] = []
  public otherSideTexts: any[] = []
  public logoIndex = 0
  public textIndex = 0

  get fillColors(): [Record<any, any>] {
    return this.$store.getters.getDefaultFilledColors
  }

  get customLogos(): [Record<any, any>] {
    return this.$store.getters.getCustomLogos
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts
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

  @Watch('customLogos', {
    deep: true
  })
  customLogosChanged(newVal: [Record<any, any>]) {
    if(this.mounted && this.logoAllowed) {
      const self = this
      newVal.forEach((logo: Record<any, any>, index: number) => {
        let logoUrl = logo? (self.apiBaseUrl + '/' + logo.url).trim().split(' ').join('%20') : ''
        if(logo && ((this.customLogoObjects[logo.logoIndex] && logo.side != this.customLogoObjects[logo.logoIndex].side) || (this.customLogoObjects[logo.logoIndex] && !logo.url) || (this.customLogoObjects[logo.logoIndex] && this.customLogoObjects[logo.logoIndex]._element.src != logoUrl))){
          self.frontCanvas.remove(this.customLogoObjects[logo.logoIndex])
          if (self.backCanvas) {
            self.backCanvas.remove(this.customLogoObjects[logo.logoIndex])
          }
          this.customLogoObjects[logo.logoIndex] = null
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

              this.eventAction(logo, logoObject, otherSideObject)
              addLogo = false
            }

            if (addLogo && logo.url) {
              const finalLogo = JSON.parse(JSON.stringify(logo))

              if (!logo.action && self.logosSettings[index]) {
                finalLogo.width = self.logosSettings[index].width
                finalLogo.height = self.logosSettings[index].height
                finalLogo.x_axis = self.logosSettings[index].x_axis
                finalLogo.y_axis = self.logosSettings[index].y_axis
                finalLogo.rotation = self.logosSettings[index].rotation
              }

              let backLogosCount = 0
              if (!this.backCanvas) {
                backLogosCount = self.customLogos.filter((item: Record<any, any>) => {
                  return item && item.side == 'back'
                }).length
              }

              if (self.logosLimit && self.customLogoObjects.filter((item: Record<any, any>) => item).length < self.logosLimit - backLogosCount) {
                self.addLogos([finalLogo], index)
              } else if (!self.logosLimit) {
                self.addLogos([finalLogo], index)
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
      newVal.forEach((text: Record<any, any>) => {
        if((this.customTextObjects[text.textIndex] && text.side != this.customTextObjects[text.textIndex].side) || (this.customTextObjects[text.textIndex] && !text.text)){
          self.frontCanvas.remove(this.customTextObjects[text.textIndex])
          if (self.backCanvas) {
            self.backCanvas.remove(this.customTextObjects[text.textIndex])
          }
          this.customTextObjects[text.textIndex] = null
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
            canvas.renderAll()

            this.eventAction(text, textObject, otherSideObject)
            addText = false
          }

          if (addText && text.text != '') {
            let finalText = JSON.parse(JSON.stringify(text))
            if (!text.action && self.productNamesSetting[index]) {
              finalText.width = self.productNamesSetting[index].width
              finalText.height = self.productNamesSetting[index].height
              finalText.x_axis = self.productNamesSetting[index].x_axis
              finalText.y_axis = self.productNamesSetting[index].y_axis
              finalText.rotation = self.productNamesSetting[index].rotation
            }
            self.addTexts([finalText], index)
          }
        }
      })
    }
  }

  @Watch('defaultColors', {
    deep: true
  })
  defaultColorsChanged(newVal: [Record<any, any>]) {
    if(this.mounted) {
      let defaultColors = this.defaultColors.filter((color:Record<any, any>) => color.color) as [Record<any, any>]
      if(defaultColors.length) {
        this.changeDefaultColors(defaultColors)
      }
    }
  }

  @Watch('groupColors', {
    deep: true, immediate: false
  })
  groupColorsChanged(newVal: Record<any, any>) {
    if(this.mounted) {
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
    this.frontTexture.getObjects().forEach((item: Record<any, any>) => {
      item.id = item.id.toLowerCase()
      if (groupColors[item.id]) {
        item.set('fill', groupColors[item.id].color);
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
            pantone: groupColors[item.id].pantone
          })
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
              pantone: groupColors[item.id].pantone
            })
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
        this.$store.dispatch('updateSvgGroups', { index: index, color: defaultColors[useColorIndex].color, pantone: defaultColors[useColorIndex].pantone })
      }
      svgGroup.color = defaultColors[useColorIndex].color
      svgGroup.pantone = defaultColors[useColorIndex].pantone

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
              changeColor = {value: closestColor.hex, name: closestColor.pantone}
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
                svgGroup.pantone = changeColor.name
              }
            })
            if (this.mainPreview) {
              this.$store.dispatch('updateSvgGroups', {
                index: svgIndex,
                color: changeColor.value,
                pantone: changeColor.name
              })
            }
          }
        })
      }
    }
  }


  public getSvgGroups(): void {
    this.svgGroups = []
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
          this.svgGroups.push({ id: item.id, color: item.fill, count: count, pantone: pantoneColor.pantone })
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
            this.svgGroups.push({ id: item.id, color: item.fill, count: count, pantone: pantoneColor.pantone })
          }
        }
      })
    }

    this.svgGroups = this.svgGroups.sort((a, b) => (a.count < b.count) ? 1 : -1)

    if (this.mainPreview) {
      this.$store.dispatch('setSvgGroups', this.svgGroups)
    }

    if(this.lockerDefaultColors.length) {
      let lockerDefaultColors = this.lockerDefaultColors.filter((color:Record<any, any>) => color.color) as [Record<any, any>]
      if(lockerDefaultColors.length) {
        this.changeDefaultColors(lockerDefaultColors)
      }
    }
    else if(this.defaultColors.length) {
      let defaultColors = this.defaultColors.filter((color:Record<any, any>) => color.color) as [Record<any, any>]
      if(defaultColors.length) {
        this.changeDefaultColors(defaultColors)
      }
    }

    if(Object.keys(this.lockerGroupColors).length) {
      this.changeGroupColor(this.lockerGroupColors)
    }
    else if(Object.keys(this.groupColors).length) {
      this.changeGroupColor(this.groupColors)
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
      element = this.$refs.back as HTMLCanvasElement;
    }
    let canvas = new fabric.Canvas(element)
    if (side == 'back') {
      this.backCanvas = canvas
    } else {
      this.frontCanvas = canvas
    }

    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center'

    let model: any
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
        self.backModel = img
      } else {
        self.frontModel = img
      }
    }, { crossOrigin: 'Anonymous'})

    this.addTexture(ImageData.textureUrl, side)

    if(this.backTextureUrl) {
      this.addTexture(this.apiBaseUrl + '/' + this.backTextureUrl, 'back')
    }

    const self = this

    const timer = setInterval(() => {
      let texture = self.frontTexture
      if (side == 'back') {
        texture = self.backTexture
      }
      if (model && texture && (!self.backTextureUrl || (self.backTextureUrl && self.backTexture))) {
        if (!self.back || (self.back && side == 'back')) {
          self.getSvgGroups()
        }
        canvas.add(texture)
        canvas.viewportCenterObject(texture)
        self.logoObjects.forEach((logoObject) => {
          canvas.add(logoObject)
        })
        self.customLogoObjects.forEach((logoObject) => {
          canvas.add(logoObject)
        })
        self.customTextObjects.forEach((textObject) => {
          canvas.add(textObject)
        })

        canvas.add(model)
        canvas.viewportCenterObject(model)
        if (side == 'back') {
          canvas.add(self.dimTextBack)
        } else {
          canvas.add(self.dimTextFront)
        }
        canvas.renderAll()

        if(!self.back || (self.back && side == 'back')) {
          if(self.logos.length) {
            setTimeout(() => {
              self.addLogos(self.logos)
            }, 200)
          }
          let logos: Record<any, any>[] = []

          if (self.customLogos && self.logoAllowed) {
            let customLogos = self.customLogos
            if (self.logosLimit) {
              customLogos = self.customLogos.slice(0, self.logosLimit) as [Record<any, any>]
            }
            customLogos.forEach((item: Record<any, any>, index: number) => {
              if (item && (!item.action && self.logosSettings[index])) {
                item.width = self.logosSettings[index].width
                item.height = self.logosSettings[index].height
                item.x_axis = self.logosSettings[index].x_axis
                item.y_axis = self.logosSettings[index].y_axis
                item.rotation = self.logosSettings[index].rotation

                if(self.mainPreview) {
                  self.$store.dispatch('updateCustomLogoWithoutTrigger', {
                    index: index,
                    data: {
                      width: self.logosSettings[index].width,
                      height: self.logosSettings[index].height,
                      x_axis: self.logosSettings[index].x_axis,
                      y_axis: self.logosSettings[index].y_axis,
                      rotation: self.logosSettings[index].rotation
                    }
                  })
                }
              }
            })
            logos = logos.concat(customLogos) as [Record<any, any>]
          }
          if (logos.length) {
            self.addLogos(logos as [Record<any, any>])
          }

          if (self.customTexts.length || self.texts.length) {
            let texts = self.texts
            self.customTexts.forEach((item: Record<any, any>, index: number) => {
              if (!item.action && self.productNamesSetting[index]) {
                item.width = self.productNamesSetting[index].width
                item.height = self.productNamesSetting[index].height
                item.x_axis = self.productNamesSetting[index].x_axis
                item.y_axis = self.productNamesSetting[index].y_axis
                item.rotation = self.productNamesSetting[index].rotation

                if(self.mainPreview) {
                  self.$store.dispatch('updateCustomTextWithoutTrigger', {
                    index: index,
                    data: {
                      width: self.productNamesSetting[index].width,
                      height: self.productNamesSetting[index].height,
                      x_axis: self.productNamesSetting[index].x_axis,
                      y_axis: self.productNamesSetting[index].y_axis,
                      rotation: self.productNamesSetting[index].rotation
                    }
                  })
                }
              }
            })
            texts = texts.concat(self.customTexts) as [Record<any, any>]
            self.addTexts(texts)
          }
          this.showLoader = false
          self.mounted = true
        }

        if (self.mainPreview) {
          self.setProductionSVG()
        }
        clearInterval(timer)
      }
    }, 1000)
    canvas.on('object:modified', (e) => {
      self.objectMove(e, side)
      self.addToOtherSide(e.target, side)
    })
    canvas.on('object:moving', (e) => {
      self.objectScaling(e, side)
    });
  }

  public objectScaling(e: any, side: string) {
    let model = this.frontModel
    let canvas = this.frontCanvas
    if(side == 'back') {
      model = this.backModel
      canvas = this.backCanvas
    }

    const modelBoundingRect = model.getBoundingRect()
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
    if(canvas.isTargetTransparent(model, centerPoint.x, centerPoint.y)) {
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

      let direction = this.targetNonTransparent(canvas, model, e.target.left, e.target.top, moveTo)

      e.target.left = direction.left
    }

    let dimText = this.dimTextFront
    if(e.target.side == 'back') {
      dimText = this.dimTextBack
    }
    this.showDimensions(e, dimText)
  }

  public addToOtherSide(target: any, side: string) {
    if(side == 'front' || (this.back && side == 'back')) {
      let model = this.frontModel
      let canvas = this.frontCanvas
      if (side == 'back' && this.back) {
        model = this.backModel
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
      console.log(nearTo)

      let otherSideObjects = this.otherSideLogos
      if(target.text) {
        otherSideObjects = this.otherSideTexts
      }
      if (canvas.isTargetTransparent(model, checkPointX, centerPoint.y)) {
        console.log('comes here')
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
            this.frontModel.bringToFront()
          } else {
            if(this.back) {
              this.backCanvas.add(objectAdd)
              this.backModel.bringToFront()
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

  public objectMove(e: any, side: string) {
    const self = this;
    if(e.target.text) {
      this.customTexts.forEach((text, index) => {
        if(e.target.textIndex == index) {
          if (e.action == 'drag') {
            self.$store.dispatch('updateCustomTextAttribute', {
              index: index,
              attribute: 'x_axis',
              value: e.target.left
            })
            self.$store.dispatch('updateCustomTextAttribute', {
              index: index,
              attribute: 'y_axis',
              value: e.target.top
            })
          } else if (e.action == 'scale' || e.action == 'scaleX' || e.action == 'scaleY') {
            const width = e.target.width * e.target.scaleX;
            const height = e.target.height * e.target.scaleY;
            const outLineWidth = e.target.strokeWidth * e.target.scaleX
            self.$store.dispatch('updateCustomTextAttribute', {
              index: index,
              attribute: 'scaleX',
              value: e.target.scaleX
            })
            self.$store.dispatch('updateCustomTextAttribute', {
              index: index,
              attribute: 'originalWidth',
              value: Math.floor(width * this.measurementRatio)
            })
            self.$store.dispatch('updateCustomTextAttribute', {
              index: index,
              attribute: 'scaleY',
              value: e.target.scaleY
            })
            self.$store.dispatch('updateCustomTextAttribute', {
              index: index,
              attribute: 'originalHeight',
              value: Math.floor(height * this.measurementRatio)
            })
            self.$store.dispatch('updateCustomTextAttribute', {
              index: index,
              attribute: 'originalOutLineWidth',
              value: outLineWidth * this.measurementRatio
            })
          } else if (e.action == 'rotate') {
            self.$store.dispatch('updateCustomTextAttribute', {
              index: index,
              attribute: 'rotation',
              value: e.target.angle
            })
          }
          self.$store.dispatch('updateCustomTextAttribute', {
            index: index,
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
          let logoUrl = (self.apiBaseUrl + '/' + logo.url).trim().split(' ').join('%20')
          if (logoUrl == e.target._element.src) {
            if (e.action == 'drag') {
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

  public addTexture (textureUrl: string, side: string): void {
    const self = this
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
        self.backTexture = img
      } else {
        self.frontTexture = img
      }
    })
  }

  public addLogos(logos: [Record<any, any>], logoIndex: null|number = null) {
    const self = this
    logos.forEach((logo: Record<any, any>, index: number) => {
      if(logo && logo.url) {
        if (logoIndex == null) {
          logoIndex = index
        }
        if ('logoIndex' in logo) {
          logoIndex = logo.logoIndex
        } else {
          if (this.mainPreview) {
            self.$store.dispatch('updateCustomLogoWithoutTrigger', {
              index: logoIndex,
              data: {
                logoIndex: logoIndex,
              }
            })
          }
        }
        if (logo.side == 'front' || (logo.side == 'back' && self.back)) {
          logo.haveControls = Boolean(logo.haveControls)
          let logoUrl = (self.apiBaseUrl + '/' + logo.url).trim().split(' ').join('%20')
          fabric.Image.fromURL(logoUrl, (img: any) => {
            img.scaleToWidth(self.canvasWidth / self.mainCanvasWidth * logo.width as number)
            img.set({
              left: self.canvasWidth / self.mainCanvasWidth * logo.x_axis,
              top: self.canvasHeight / self.mainCanvasHeight * logo.y_axis,
              angle: logo.rotation as number,
              centeredScaling: true,
              selectable: !this.canvasSelection ? this.canvasSelection : logo.haveControls,
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
              img.scaleX = self.canvasWidth / self.mainCanvasWidth * logo.scaleX
              img.scaleY = self.canvasHeight / self.mainCanvasHeight * logo.scaleY
            }

            let model = self.frontModel
            let canvas = self.frontCanvas
            let dimText = this.dimTextFront
            if (logo.side == 'back') {
              canvas = self.backCanvas
              model = self.backModel
              dimText = self.dimTextBack
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
            model.bringToFront()
            canvas.renderAll()

            this.addToOtherSide(img, logo.side)

            if (logo.customLogo) {
              if (this.mainPreview) {
                const width = Math.floor(img.width * img.scaleX * this.measurementRatio)
                const height = Math.floor(img.height * img.scaleY * this.measurementRatio)
                self.$store.dispatch('updateCustomLogoWithoutTrigger', {
                  index: index,
                  data: {
                    originalWidth: width,
                    originalHeight: height
                  }
                })
              }
              self.customLogoObjects[logoIndex as number] = img
            } else {
              self.logoObjects.push(img)
            }

            img.on('selected', (e: Record<any, any>) => {
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
    })
  }

  public showDimensions(e: any, dimText: Record<any, any>) {
    let object = e.target;
    dimText.set({
      left: object.left,
      top: object.top + ((object.height * object.scaleY) / 2) + dimText.height * dimText.scaleY + 20,
      angle: object.angle,
      text: 'Size: '+ Math.floor(object.width * object.scaleX * this.measurementRatio) + 'cm x ' + Math.floor(object.height * object.scaleY * this.measurementRatio) + 'cm',
      visible: true
    }).bringToFront()
  }

  public addTexts(texts: [Record<any, any>], textIndex: null | number = null) {
    const self = this
    texts.forEach((text: Record<any, any>, index: number) => {
      if(textIndex == null) {
        textIndex = index
      }
      if('textIndex' in text) {
        textIndex = text.textIndex
      } else {
        if(this.mainPreview) {
          self.$store.dispatch('updateCustomTextWithoutTrigger', {
            index: textIndex,
            data: {
              textIndex: textIndex,
            }
          })
        }
      }
      if(text.text != '' && (text.side == 'front' || (text.side == 'back' && self.back))) {
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

        textBox.set('height', self.canvasHeight / self.mainCanvasHeight * text.width)
        if(text.scaleX && text.scaleY) {
          textBox.scaleX = self.canvasWidth / self.mainCanvasWidth * text.scaleX
          textBox.scaleY = self.canvasHeight / self.mainCanvasHeight * text.scaleY
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
        model.bringToFront()
        canvas.renderAll()

        this.addToOtherSide(textBox, text.side)

        if(this.mainPreview) {
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
    })
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
      &:last-child{display: none;}
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
  z-index: 9999;
  img{
    max-width: 15%;
    display: block;
    margin: 0 auto;
    height: auto;
  }
}
</style>
