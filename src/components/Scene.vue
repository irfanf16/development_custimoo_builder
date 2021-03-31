<template>
  <div style="display: flex">
    <canvas ref="front" id="front" className="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    <canvas ref="back" id="back" className="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
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
  }
})

export default class Scene extends Vue {
  @Prop({required: true}) readonly front!: Record<string, unknown>;
  @Prop({required: false}) readonly back!: Record<string, unknown>;
  @Prop({required: false, default: () => { return [{url: './img/images/logo.png', width: 100, height: 100, x: 170, y: 117}]}}) readonly logos !: [Record<string, any>];
  @Prop({required: false, default: 400}) readonly mainCanvasWidth!: number;
  @Prop({required: false, default: 400}) readonly mainCanvasHeight!: number;
  @Prop({required: false, default: 400}) readonly canvasWidth!: number;
  @Prop({required: false, default: 400}) readonly canvasHeight!: number;
  private frontCanvas !: fabric.Canvas
  private backCanvas !: fabric.Canvas
  private frontTexture !: any
  private backTexture !: any

  public loadScene (ImageData: any, canvas: fabric.Canvas, side: string) {
    let element = this.$refs.front as HTMLCanvasElement
    if(side === 'back'){
      element = this.$refs.back as HTMLCanvasElement;
    }
    canvas = new fabric.Canvas(element)
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center'

    let model: any
    fabric.Image.fromURL(ImageData.modelUrl,  (img: any) => {
      img.scaleToWidth(canvas.getWidth() - 10).scaleToHeight(canvas.getHeight() - 10).set({
        hasControls: false,
        selectable: false,
        evented: false,
        globalCompositeOperation: 'overlay'
      });
      img.center().setCoords()
      model = img
    }, null, { crossOrigin: 'anonymous'})

    let texture: any
    fabric.loadSVGFromURL(ImageData.textureUrl, function (objects: any, options: any) {
      const img = fabric.util.groupSVGElements(objects, options) as Group
      img.scaleToWidth(canvas.getWidth() - 10).scaleToHeight(canvas.getHeight() - 10).set({
        hasControls: false,
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
      })
      img._objects.forEach((element: any) => {
        if(element.id === 'Laces') {
          element.globalCompositeOperation = 'destination-out'
        }
      })
      img.center().setCoords();
      texture = img
      if(side === 'back'){
        self.frontTexture = texture
      }else{
        self.backTexture = texture
      }
    }, null, { crossOrigin: 'anonymous'})

    let logoObjects: any[] =[]
    const self = this

    if(this.logos) {
      this.logos.forEach((logo: Record<any, any>) => {
        fabric.Image.fromURL(logo.url, (img: any) => {
          img.scaleToWidth(canvas.getWidth() / self.mainCanvasWidth * logo.width)
            .scaleToHeight(canvas.getHeight() / self.mainCanvasHeight * logo.height)
            .set({
              left: canvas.getWidth() / self.mainCanvasWidth * logo.x,
              top: canvas.getHeight() / self.mainCanvasHeight * logo.y,
              selectable: true,
              hasControls: true,
              hasBorders: true,
              evented: true,
              globalCompositeOperation: 'source-atop'
            })

          logoObjects.push(img)
        }, null, { crossOrigin: 'anonymous'})
      })
    }

    setTimeout(() => {
      canvas.add(texture)
      logoObjects.forEach((logoObject)=> {
        canvas.add(logoObject)
      })

      canvas.add(model)

      canvas.viewportCenterObject(texture)
      canvas.viewportCenterObject(model)
      canvas.renderAll()
    }, 1000)

  }

  // public changeColor() {
  //   this.objFront.getObjects().forEach(function(e) {
  //
  //     if(i >= myObj.colors.length){
  //       i = 0;
  //     }
  //     //console.log(e);
  //     //console.log(i);
  //     //console.log(myObj.colors);
  //     color = myObj.colors[i].color;
  //
  //     e.set('fill', color);
  //
  //     i++;
  //   });
  // }
}
</script>

<style scoped>
</style>
