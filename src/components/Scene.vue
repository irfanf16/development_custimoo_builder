<template>
  <div style="display: flex; justify-content: center;">
    <canvas ref="front" id="front" class="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    <canvas v-if="back" ref="back" id="back" class="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { fabric } from 'fabric'
import { Group } from 'fabric/fabric-impl'

@Component<Scene>({
  mounted () {
    this.loadScene(this.front, this.frontCanvas, 'front')
    if(this.back) {
      this.loadScene(this.back, this.backCanvas, 'back')
    }

    const self = this
    // setTimeout(() => {
    //   console.log(self.fillColors)
    //   if(self.fillColors){
    //     self.changeColor()
    //   }
    // }, 3000)
  }
})

export default class Scene extends Vue {
  @Prop({required: true}) readonly front!: Record<string, unknown>;
  @Prop({required: false}) readonly back!: Record<string, unknown>;
  @Prop({required: false}) readonly logos !: [Record<string, any>];
  @Prop({required: false}) readonly logosSettings !: Record<any, any>
  @Prop({required: false}) readonly logoAllowed !: boolean
  @Prop({required: false}) readonly logosLimit !: number
  @Prop({required: false}) readonly productColors !: [Record<string, any>];
  @Prop({required: false, default: 260}) readonly mainCanvasWidth!: number;
  @Prop({required: false, default: 290}) readonly mainCanvasHeight!: number;
  @Prop({required: false, default: 260}) readonly canvasWidth!: number;
  @Prop({required: false, default: 290}) readonly canvasHeight!: number;
  private frontCanvas !: fabric.Canvas
  private backCanvas !: fabric.Canvas
  private frontTexture !: any
  private backTexture !: any
  private apiBaseUrl: string = process.env.VUE_APP_API_BASE_URL
  private logoObjects: any[] =[]
  private logosLoaded = true
  private mounted = false
  private frontModel: any
  private backModel: any

  get fillColors(): [Record<any, any>] {
    return this.$store.getters.getDefaultFilledColors
  }
  get customLogos(): [Record<any, any>] {
    return this.$store.getters.getCustomLogos
  }

  @Watch('customLogos', {
    immediate: true, deep: true
  })
  customLogosChanged(newVal: [Record<any, any>], oldVal: [Record<any, any>]) {
    if(this.mounted) {
      const self = this
      this.logoObjects.forEach((logoObject) => {
        let deleteLogo = true
        newVal.forEach((logo) => {
          if(self.apiBaseUrl+'/'+logo.url == logoObject._element.src){
            deleteLogo = false
          }
        })
        if(deleteLogo) {
          self.frontCanvas.remove(logoObject)
          if(self.backCanvas) {
            self.backCanvas.remove(logoObject)
          }
        }
      })

      newVal.forEach((logo) => {
        let addLogo = true
        this.logoObjects.forEach((logoObject) => {
          if(self.apiBaseUrl+'/'+logo.url == logoObject._element.src){
            addLogo = false
            if(logoObject.left != logo.x_axis) {
              logoObject.left = logo.x_axis
              if(logo.side == 'back') {
                self.backCanvas.renderAll()
              } else {
                self.frontCanvas.renderAll()
              }
            }else if(logoObject.top != logo.y_axis) {
              logoObject.top = logo.y_axis
              if(logo.side == 'back') {
                self.backCanvas.renderAll()
              } else {
                self.frontCanvas.renderAll()
              }
            }
          }
        })
        if(addLogo && logo.url) {
          self.addLogos([logo], self.frontCanvas)
        }
      })
    }
  }

  public async loadScene (ImageData: any, canvas: fabric.Canvas, side: string) {
    let element = this.$refs.front as HTMLCanvasElement
    if(side === 'back'){
      element = this.$refs.back as HTMLCanvasElement;
    }
    canvas = new fabric.Canvas(element)
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center'

    let model: any
    fabric.Image.fromURL(ImageData.modelUrl,  (img: any) => {
      img.scaleToHeight(canvas.getHeight() - 10).set({
        hasControls: false,
        selectable: false,
        evented: false,
        globalCompositeOperation: 'overlay'
      });
      img.center().setCoords()
      model = img
      if(side == 'back'){
        self.backModel = img
      }else{
        self.frontModel = img
      }
    })

    let texture: any
    fabric.loadSVGFromURL(ImageData.textureUrl, function (objects: any, options: any) {
      // console.log(objects)
      const img = fabric.util.groupSVGElements(objects) as Group
      img.scaleToHeight(canvas.getHeight() - 10).set({
        hasControls: false,
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true
      })

      // img._objects.forEach((element: any) => {
      //   if(element.id === 'Laces') {
      //     element.globalCompositeOperation = 'destination-out'
      //   }
      // })
      img.center().setCoords();
      texture = img
      if(side === 'back'){
        self.backTexture = texture
        self.backCanvas = canvas
      }else{
        self.frontTexture = texture
        self.frontCanvas = canvas
      }
    })

    const self = this

    let logos = this.logos
    if(this.customLogos){
      logos = logos.concat(this.customLogos) as [Record<any, any>]
    }

    if(logos.length) {
      logos = logos.filter((logo: Record<any, any>) => logo.side == side && logo.url) as [Record<any, any>]
      if (logos.length) {
        this.logosLoaded = false
        await this.addLogos(logos, canvas)
      }
    }

    const timer = setInterval(() => {
      if(model && texture && self.logosLoaded) {
        canvas.add(texture)
        self.logoObjects.forEach((logoObject) => {
          canvas.add(logoObject)
        })
        canvas.add(model)

        canvas.viewportCenterObject(texture)
        canvas.viewportCenterObject(model)
        canvas.renderAll()
        self.mounted = true
        clearInterval(timer)
      }
    }, 1000)
    canvas.on('object:modified', (e) => {
      self.objectMove(e)
    })
  }

  public objectMove(e: any) {
    const self = this;
    this.customLogos.forEach((logo, index) => {
      console.log(self.apiBaseUrl+'/'+logo.url)
      if(self.apiBaseUrl+'/'+logo.url == e.target._element.src){
        if(e.action == 'drag') {
          self.$store.dispatch('updateCustomLogoAttribute', {index: index, attribute: 'x_axis', value: e.target.left})
          self.$store.dispatch('updateCustomLogoAttribute', {index: index, attribute: 'y_axis', value: e.target.top})
        }
      }
    })
  }

  public async addLogos(logos: [Record<any, any>], canvas: fabric.Canvas) {
    const self = this
    logos.forEach((logo: Record<any, any>, index: number) => {
      logo.haveControls = logo.haveControls == 0? false : true
      let planeUrl = this.apiBaseUrl + '/' + logo.url
      let url = planeUrl.trim().split(' ').join('%20')
      fabric.Image.fromURL(url, (img: any) => {
        img.scaleToWidth(canvas.getWidth() / self.mainCanvasWidth * logo.width)
          .set({
            left: canvas.getWidth() / self.mainCanvasWidth * logo.x_axis,
            top: canvas.getHeight() / self.mainCanvasHeight * logo.y_axis,
            selectable: logo.haveControls,
            hasControls: logo.haveControls,
            hasBorders: logo.haveControls,
            evented: logo.haveControls,
            globalCompositeOperation: 'source-atop'
          })
        self.logoObjects.push(img)
        if (index + 1 == logos.length) {
          self.logosLoaded = true
        }
        if (self.mounted) {
          let model = self.frontModel
          if (logo.side == 'back') {
            canvas = self.backCanvas
            model = self.backModel
          }

          canvas.add(img)
          model.bringToFront()
          canvas.renderAll()
        }
      })
    })
  }

  public changeColor() {
    const self = this

    const svgGroupIds = this.frontTexture.getObjects().map((item : Record<any, any>) => item.id)
      .filter((value: string, index: number, self: Record<any, any>) => self.indexOf(value) === index)

    let colorsByGroup = []
    let useColorIndex = 0
    svgGroupIds.forEach((groupId: string) => {
      colorsByGroup.push({id: groupId, color: self.fillColors[useColorIndex].color})
    })
    console.log(svgGroupIds)

    this.frontTexture.getObjects().forEach((item: Record<any, any>) => {
      if(item.id == 'Base') {
        item.set('fill', self.fillColors[0].color);
      }
    });
    this.frontCanvas.renderAll()
  }
}
</script>

<style scoped>
</style>
