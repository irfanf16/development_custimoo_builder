<template>
  <div class="canvas-area-holder" :class="{ 'fix-space': !manageComponents.mobileScreen}" style="display: flex; justify-content: space-between;">
    <a @click="setShowSmall('back')" :class="{'show-small' : showSmall.front}">
      <canvas ref="front" id="front" class="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    </a>
    <a @click="setShowSmall('front')" :class="{'show-small' : showSmall.back}">
      <canvas v-if="back" ref="back" id="back" class="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    </a>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Watch, Vue} from 'vue-property-decorator'
import {fabric} from 'fabric'
import getClosestColor from '@/pantoneColor'
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
      x: 0.6,
      y: 0.6,
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
      x: 0.6,
      y: -0.6,
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
      x: -0.6,
      y: -0.6,
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
        self.customLogos.forEach((logo, index) => {
          let logoUrl = (self.apiBaseUrl+'/'+logo.url).trim().split(' ').join('%20')
          if(logoUrl == target._element.src){
            self.$store.dispatch('updateCustomLogoAttribute', { index: index, attribute: 'url', value: '' })
          }
        })
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
      this.customLogoObjects.forEach((logoObject, index) => {
        let deleteLogo = true
        newVal.forEach((logo: Record<any, any>) => {
          let logoUrl = (self.apiBaseUrl+'/'+logo.url).trim().split(' ').join('%20')
          if(logoUrl == logoObject._element.src && logo.side == logoObject.side){
            deleteLogo = false
          }
        })
        if(deleteLogo) {
          this.customLogoObjects.splice(index, 1)
          self.frontCanvas.remove(logoObject)
          if (self.backCanvas) {
            self.backCanvas.remove(logoObject)
          }
        }
      })

      newVal.forEach((logo: Record<any, any>, index: number) => {
        if((logo.side == 'back' && self.backCanvas) || logo.side == 'front') {
          let addLogo = true
          this.customLogoObjects.forEach((logoObject) => {
            let logoUrl = (self.apiBaseUrl + '/' + logo.url).trim().split(' ').join('%20')
            if (logoUrl == logoObject._element.src) {
              addLogo = false

              if (logo.action == 'drag') {
                logoObject.center() //add center because all events only trigger if use it in fabric js.
                logoObject.set({
                  left: self.canvasWidth / self.mainCanvasWidth * logo.x_axis,
                  top: self.canvasHeight / self.mainCanvasHeight * logo.y_axis
                })
              }else if(logo.action == 'scale' || logo.action == 'scaleX' || logo.action == 'scaleY'){
                logoObject.center()
                logoObject.set({
                  left: self.canvasWidth / self.mainCanvasWidth * logo.x_axis,
                  top: self.canvasHeight / self.mainCanvasHeight * logo.y_axis
                })
                logoObject.scaleX = self.canvasWidth / self.mainCanvasWidth * logo.scaleX
                logoObject.scaleY = self.canvasHeight / self.mainCanvasHeight * logo.scaleY
              } else if(logo.action == 'rotate') {
                logoObject.center()
                logoObject.set({
                  left: self.canvasWidth / self.mainCanvasWidth * logo.x_axis,
                  top: self.canvasHeight / self.mainCanvasHeight * logo.y_axis
                })
                logoObject.rotate(logo.rotation as number)
              }
              logoObject.setCoords()
            }
          })
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
            if(!this.backCanvas) {
              backLogosCount = self.customLogos.filter((item) => { return item.side == 'back'}).length
            }

            if(self.logosLimit && self.customLogoObjects.length < self.logosLimit - backLogosCount) {
              self.addLogos([finalLogo])
            }else if(!self.logosLimit) {
              self.addLogos([finalLogo])
            }
          }
        }
      })
    }
  }

  @Watch('customTexts', {
    deep: true
  })
  customTextsChanged(newVal: [Record<any, any>]) {
    if (this.mounted) {
      const self = this
      newVal.forEach((text: Record<any, any>, index: number) => {
        self.customTextObjects.forEach((textObject, dIndex) => {
          if((textObject.textIndex == index && text.side != textObject.side) || (textObject.textIndex == index && !text.text)){
            self.customTextObjects.splice(dIndex, 1)
            self.frontCanvas.remove(textObject)
            if (self.backCanvas) {
              self.backCanvas.remove(textObject)
            }
          }
        })
      })

      newVal.forEach((text, index) => {
        if ((text.side == 'back' && self.backCanvas) || text.side == 'front') {
          let addText = true
          self.customTextObjects.forEach((textObject) => {
            if ('textIndex' in textObject && textObject.text) {
              if(textObject.textIndex == index) {
                let canvas = this.frontCanvas
                if (text.side == 'back') {
                  canvas = this.backCanvas
                }
                textObject.text = text.text
                textObject.fontFamily = text.fontFamily
                textObject.set('fill', text.fillColor)
                textObject.set('stroke', text.outLineColor)
                textObject.set('strokeWidth', text.outLineWidth)
                canvas.renderAll()

                if (text.action == 'drag') {
                  textObject.center() //add center because all events only trigger if use it in fabric js.
                  textObject.set({
                    left: self.canvasWidth / self.mainCanvasWidth * text.x_axis,
                    top: self.canvasHeight / self.mainCanvasHeight * text.y_axis
                  })
                } else if (text.action == 'scale' || text.action == 'scaleX' || text.action == 'scaleY') {
                  textObject.center()
                  textObject.set({
                    left: self.canvasWidth / self.mainCanvasWidth * text.x_axis,
                    top: self.canvasHeight / self.mainCanvasHeight * text.y_axis
                  })
                  textObject.scaleX = self.canvasWidth / self.mainCanvasWidth * text.scaleX
                  textObject.scaleY = self.canvasHeight / self.mainCanvasHeight * text.scaleY
                } else if (text.action == 'rotate') {
                  textObject.center()
                  textObject.set({
                    left: self.canvasWidth / self.mainCanvasWidth * text.x_axis,
                    top: self.canvasHeight / self.mainCanvasHeight * text.y_axis
                  })
                  textObject.rotate(text.rotation as number)
                }
                textObject.setCoords()
                addText = false
              }
            }
          })
          if (addText && text.text) {
            if (!text.action && self.productNamesSetting[index]) {
              text.width = self.productNamesSetting[index].width
              text.height = self.productNamesSetting[index].height
              text.x_axis = self.productNamesSetting[index].x_axis
              text.y_axis = self.productNamesSetting[index].y_axis
              text.rotation = self.productNamesSetting[index].rotation
            }
            self.addTexts([text], index)
          }
        }
      })
    }
  }

  @Watch('defaultColors', {
    deep: true
  })
  defaultColorsChanged(newVal: [Record<any, any>]) {
    this.changeDefaultColors(newVal)
  }

  @Watch('groupColors', {
    deep: true
  })
  groupColorsChanged(newVal: Record<any, any>) {
    this.changeGroupColor(newVal)
  }

  public changeGroupColor (groupColors: Record<any, any>): void {
    this.frontTexture.getObjects().forEach((item: Record<any, any>) => {
      item.id = item.id.toLowerCase()
      if (groupColors[item.id]) {
        item.set('fill', groupColors[item.id].color);
        if (this.mainPreview) {
          let svgIndex = 0
          this.svgGroups.forEach((svgGroup: Record<any, any>, index: number) => {
            if(svgGroup.id == item.id) {
              svgIndex = index
            }
          })
          this.$store.dispatch('updateSvgGroups', { index: svgIndex, color: groupColors[item.id].color, pantone: groupColors[item.id].pantone })
        }
      }
    })
    this.frontCanvas.renderAll()

    if(this.back) {
      this.backTexture.getObjects().forEach((item: Record<any, any>) => {
        item.id = item.id.toLowerCase()
        if (groupColors[item.id]) {
          item.set('fill', groupColors[item.id].color);
          if (this.mainPreview) {
            let svgIndex = 0
            this.svgGroups.forEach((svgGroup: Record<any, any>, index: number) => {
              if(svgGroup.id == item.id) {
                svgIndex = index
              }
            })
            this.$store.dispatch('updateSvgGroups', { index: svgIndex, color: groupColors[item.id].color, pantone: groupColors[item.id].pantone })
          }
        }
      })
      this.backCanvas.renderAll()
    }
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
      }else {
        this.svgGroups.map((existingItem: Record<any, any>) => {
          if(existingItem.id == item.id){
            existingItem.count++
          }
        })
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
        }else {
          this.svgGroups.map((existingItem: Record<any, any>) => {
            if(existingItem.id == item.id){
              existingItem.count++
            }
          })
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
      this.changeDefaultColors(this.defaultColors)
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
        crossOrigin: 'Anonymous',
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
          let logos = self.logos

          if (self.customLogos && self.logoAllowed) {
            let customLogos = self.customLogos
            if (self.logosLimit) {
              customLogos = self.customLogos.slice(0, self.logosLimit) as [Record<any, any>]
            }
            customLogos.forEach((item: Record<any, any>, index: number) => {
              if (!item.action && self.logosSettings[index]) {
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
            logos = logos.filter((logo: Record<any, any>) => logo.url) as [Record<any, any>]
            if (logos.length) {
              setTimeout(() => {
                self.addLogos(logos)
              }, 100)
            }
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
            setTimeout(() => {
              self.addTexts(texts)
            }, 100)
          }
        }

        if (self.mainPreview) {
          self.setProductionSVG()
        }
        self.mounted = true
        clearInterval(timer)
      }
    }, 1000)
    canvas.on('object:modified', (e) => {
      self.objectMove(e, side)
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
        if(boundingDistance[key] < boundingDistance[moveTo]) {
          moveTo = key
        }
      })

      let direction = this.targetNonTransparent(canvas, model, e.target.left, e.target.top, moveTo)

      e.target.left = direction.left
    }

    // centerPoint = e.target.getCenterPoint()
    // const width = e.target.width * e.target.scaleX;
    // if(canvas.isTargetTransparent(model, e.target.left + width / 2, centerPoint.y)){
    //   this.addToOtherSide(e, side, boundingRect, canvas, model)
    // }

    let dimText = this.dimTextFront
    if(e.target.side == 'back') {
      dimText = this.dimTextBack
    }
    let scale = 1.6
    if(e.target.text) {
      scale = 1.3
    }
    this.showDimensions(e, dimText, scale)
  }

  public otherSideObjects: any[] = []
  public addToOtherSide(e: any, side: string, boundingRect: Record<any, any>, canvas: fabric.Canvas, model: fabric.Image) {
    const centerPoint = e.target.getCenterPoint()

    const boundingDistance = {
      left: Math.abs(boundingRect.left + e.target.width),
      top: Math.abs(boundingRect.top + centerPoint.y),
      right: Math.abs(boundingRect.right + centerPoint.x),
      bottom: Math.abs(boundingRect.bottom + centerPoint.y)
    } as Record<any, any>

    let moveTo = 'left'
    Object.keys(boundingDistance).forEach((key: string) => {
      if(boundingDistance[key] < boundingDistance[moveTo]) {
        moveTo = key
      }
    })
    console.log(moveTo)
    if(moveTo == 'left') {
      let objectAdd = fabric.util.object.clone(e.target)
      const width = objectAdd.width * objectAdd.scaleX;
      let direction = this.targetNonTransparent(canvas, model, objectAdd.left + width, objectAdd.top, 'right')
      const outside = objectAdd.left + objectAdd.width - direction.left
      objectAdd.left = Math.abs(this.canvasWidth - direction.left - objectAdd.width + outside)
      console.log(objectAdd.left)

      this.otherSideObjects.forEach((logo, index) => {
        console.log(logo)
      })
      if(side == 'back') {
        this.frontCanvas.add(objectAdd)
      } else {
        console.log(objectAdd)
        this.otherSideObjects.push(objectAdd)
        this.backCanvas.add(objectAdd)
      }
    }
  }

  public targetNonTransparent(canvas: fabric.Canvas, model: fabric.Image, pointX: number, pointY: number, moveTo: string): Record<any, any> {
    if(canvas.isTargetTransparent(model, pointX, pointY)) {
      if(moveTo == 'left') {
        pointX = pointX + 1
      } else if(moveTo == 'right') {
        pointX = pointX - 1
      }
      return this.targetNonTransparent(canvas, model, pointX, pointY, moveTo)
    }
    return {left: pointX, top: pointY}
  }

  public objectMove(e: any, side: string) {
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

    const centerPoint = e.target.getCenterPoint()
    if(canvas.isTargetTransparent(model, centerPoint.x, centerPoint.y)) {
      const boundingDistance = {
        left: Math.abs(boundingRect.left - centerPoint.x),
        right: Math.abs(boundingRect.right - centerPoint.x)
      } as Record<any, any>

      let moveTo = 'left'
      Object.keys(boundingDistance).forEach((key: string) => {
        if(boundingDistance[key] < boundingDistance[moveTo]) {
          moveTo = key
        }
      })

      let direction = this.targetNonTransparent(canvas, model, e.target.left, e.target.top, moveTo)

      e.target.left = direction.left
    }
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
            const height = e.target.width * e.target.scaleY;
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
          this.showDimensions(e, dimText, 1.3)
        }
      })
    } else {
      this.customLogos.forEach((logo, index) => {
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
            const height = e.target.width * e.target.scaleY;
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
          if(e.target.side == 'back') {
            dimText = this.dimTextBack
          }
          this.showDimensions(e, dimText, 1.6)
        }
      })
    }
  }

  public addTexture (textureUrl: string, side: string): void {
    const self = this
    fabric.loadSVGFromURL(textureUrl, function (objects: any, options: any) {
      const img = fabric.util.groupSVGElements(objects) as fabric.Group
      img.scaleToHeight(self.frontCanvas.getHeight() - 10).set({
        hasControls: false,
        selectable: false,
        evented: false,
        crossOrigin: 'Anonymous',
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

  public addLogos(logos: [Record<any, any>]) {
    const self = this
    logos.forEach((logo: Record<any, any>, index: number) => {
      if(logo.side == 'front' || (logo.side == 'back' && self.back)) {
        logo.haveControls = Boolean(logo.haveControls)
        let logoUrl = (self.apiBaseUrl + '/' + logo.url).trim().split(' ').join('%20')
        fabric.Image.fromURL(logoUrl, (img: any) => {
          img.scaleToWidth(self.canvasWidth / self.mainCanvasWidth * logo.width as number)
          img.set({
            left: self.canvasWidth / self.mainCanvasWidth * logo.x_axis,
            top: self.canvasHeight / self.mainCanvasHeight * logo.y_axis,
            angle: logo.rotation as number,
            centeredScaling: true,
            selectable: logo.haveControls,
            hasControls: logo.haveControls,
            hasBorders: logo.haveControls,
            evented: logo.haveControls,
            crossOrigin: 'Anonymous',
            globalCompositeOperation: 'source-atop',
            lockScalingFlip: true
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
          canvas.add(img)
          model.bringToFront()
          canvas.renderAll()

          if (this.mainPreview) {
            const width = Math.floor(img.width * this.measurementRatio)
            const height = Math.floor(img.height * this.measurementRatio)
            self.$store.dispatch('updateCustomLogoWithoutTrigger', {
              index: index,
              data: {
                originalWidth: width,
                originalHeight: height
              }
            })
          }

          if (logo.customLogo) {
            img.side = logo.side
            self.customLogoObjects.push(img)
          } else {
            self.logoObjects.push(img)
          }

          img.on('selected', (e: Record<any, any>) => {
            this.showDimensions(e, dimText, 1.6)
          })
          canvas.on('selection:cleared', () => {
            dimText.set({
              visible: false
            })
          })
        }, { crossOrigin: 'Anonymous'})
      }
    })
  }

  public showDimensions(e: any, dimText: fabric.Text, scale: number) {
    let object = e.target;
    dimText.set({
      left: object.left,
      top: object.top + object.height * object.scaleY / scale,
      text: 'Size: '+ Math.floor(object.width * object.scaleX * this.measurementRatio) + 'cm x ' + Math.floor(object.height * object.scaleY * this.measurementRatio) + 'cm',
      visible: true
    }).bringToFront()
  }

  public async addTexts(texts: [Record<any, any>], addIndex: number|null = null) {
    const self = this
    texts.forEach((text: Record<any, any>, index: number) => {
      if(text.text && (text.side == 'front' || (text.side == 'back' && self.back))) {
        let textBox = new fabric.Text(text.text, {
          left: self.canvasWidth / self.mainCanvasWidth * text.x_axis,
          top: self.canvasHeight / self.mainCanvasHeight * text.y_axis,
          angle: text.rotation as number,
          centeredScaling: true,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          evented: true,
          globalCompositeOperation: 'source-atop',
          fontFamily: text.fontFamily,
          fill: text.fillColor,
          stroke: text.outLineColor,
          strokeWidth: text.outLineWidth,
          paintFirst: 'stroke',
          lockScalingFlip: true
        })

        textBox.scaleToHeight(self.canvasWidth / self.mainCanvasWidth * text.width)
        if(text.scaleX && text.scaleY) {
          textBox.scaleX = self.canvasWidth / self.mainCanvasWidth * text.scaleX
          textBox.scaleY = self.canvasHeight / self.mainCanvasHeight * text.scaleY
        }
        let finalIndex = index
        if (addIndex !== null) {
          finalIndex = addIndex
        }
        Object.assign(textBox, {
          textIndex: finalIndex,
          side: text.side
        })

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

        self.customTextObjects[finalIndex] = textBox
        canvas.add(textBox)
        model.bringToFront()
        canvas.renderAll()

        if(this.mainPreview) {
          const width = Math.floor(textBox.width as number * this.measurementRatio)
          const height = Math.floor(textBox.height as number * this.measurementRatio)
          self.$store.dispatch('updateCustomTextWithoutTrigger', {
            index: index,
            data: {
              originalWidth: width,
              originalHeight: height
            }
          })
        }
        textBox.on('selected', (e: Record<any, any>) => {
          this.showDimensions(e, dimText, 1.3)
        })
        canvas.on('selection:cleared', () => {
          dimText.set({
            visible: false
          })
        })

      } else {
        let finalIndex = index
        if (addIndex !== null) {
          finalIndex = addIndex
        }
        this.customTextObjects[finalIndex] = {textIndex: finalIndex, side: text.side}
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
</style>
