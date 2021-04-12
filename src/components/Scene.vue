<template>
  <div style="display: flex">
    <canvas ref="front" id="front" class="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    <canvas v-if="back" ref="back" id="back" class="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
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
  @Prop({required: false, default: 260}) readonly mainCanvasWidth!: number;
  @Prop({required: false, default: 290}) readonly mainCanvasHeight!: number;
  @Prop({required: false, default: 260}) readonly canvasWidth!: number;
  @Prop({required: false, default: 290}) readonly canvasHeight!: number;
  private frontCanvas !: fabric.Canvas
  private backCanvas !: fabric.Canvas
  private frontTexture !: any
  private backTexture !: any
  private apiBaseUrl: string = process.env.VUE_APP_API_BASE_URL

  get fillColors(): [Record<any, any>] {
    return this.$store.getters.getDefaultFilledColors
  }

  public loadScene (ImageData: any, canvas: fabric.Canvas, side: string) {
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
    })

    let texture: any
    fabric.loadSVGFromURL(ImageData.textureUrl, function (objects: any, options: any) {
      // console.log(objects)
      if(side == 'back'){
        objects = objects.filter((object: Record<any, any>) => object.id.includes('back'))
      }else {
        objects = objects.filter((object: Record<any, any>) => !object.id.includes('back'))
      }
      if(side == 'front'){
        // options.height = 1350
      }
      console.log(options)
      const img = fabric.util.groupSVGElements(objects) as Group
      img.scaleToHeight(canvas.getHeight() - 10).set({
        hasControls: false,
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true
      })

      img._objects.forEach((element: any) => {
        if(element.id === 'Laces') {
          element.globalCompositeOperation = 'destination-out'
        }
      })
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

    let logoObjects: any[] =[]
    const self = this

    let logosLoaded = true
    if(this.logos) {
      const logos = this.logos.filter((logo: Record<any, any>) => logo.side == side)
      if (logos.length) {
        logosLoaded = false
        logos.forEach((logo: Record<any, any>, index: number) => {
          let planeUrl = this.apiBaseUrl+'/'+logo.url
          let url = planeUrl.trim().split(' ').join('%20')
          fabric.Image.fromURL(url, (img: any) => {
            img.scaleToWidth(canvas.getWidth() / self.mainCanvasWidth * logo.width)
              .scaleToHeight(canvas.getHeight() / self.mainCanvasHeight * logo.height)
              .set({
                left: canvas.getWidth() / self.mainCanvasWidth * logo.x_axis,
                top: canvas.getHeight() / self.mainCanvasHeight * logo.y_axis,
                selectable: logo.haveControls,
                hasControls: logo.haveControls,
                hasBorders: logo.haveControls,
                evented: logo.haveControls,
                globalCompositeOperation: 'source-atop'
              })
            logoObjects.push(img)
            if (index + 1 == logos.length) {
              logosLoaded = true
            }
          })
        })
      }
    }

    const timer = setInterval(() => {
      if(model && texture && logosLoaded) {
        canvas.add(texture)
        logoObjects.forEach((logoObject) => {
          canvas.add(logoObject)
        })
        canvas.add(model)

        canvas.viewportCenterObject(texture)
        canvas.viewportCenterObject(model)
        canvas.renderAll()
        clearInterval(timer)
      }
    }, 1000)
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

    this.frontTexture.getObjects().forEach(function(item: Record<any, any>) {
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
