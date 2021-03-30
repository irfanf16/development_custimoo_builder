<template>
  <div>
    <canvas ref="front" id="front" className="canvas" width="400" height="500"></canvas>
    <canvas ref="back" id="back" className="canvas" width="400" height="500"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { fabric } from 'fabric'

@Component<Scene>({
  mounted () {
    this.loadScene(this.front, this.frontCanvas, 'front')
    this.loadScene(this.back, this.backCanvas, 'back')
  }
})

export default class Scene extends Vue {
  private frontCanvas !: fabric.Canvas
  private backCanvas !: fabric.Canvas
  private front = {textureUrl: './img/images/HoodieDesign_2.svg', modelUrl: './img/images/HoodieTemplateFront.png'}
  private back = {textureUrl: './img/images/HoodieDesign_2.svg', modelUrl: './img/images/HoodieTemplateFront.png'}

  public loadScene (ImageData: any, canvas: fabric.Canvas, side: string) {
    let element = this.$refs.front as HTMLCanvasElement
    if(side === 'back'){
      element = this.$refs.back as HTMLCanvasElement;
    }
    canvas = new fabric.Canvas(element)
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center'

    let model !: any
    fabric.Image.fromURL(ImageData.modelUrl,  (img: any) => {
      img.scale(0.3).set({
        hasControls: false,
        selectable: false,
        evented: false,
        globalCompositeOperation: 'overlay'
      });
      img.center().setCoords()
      model = img
    })

    let texture !: any
    fabric.loadSVGFromURL(ImageData.textureUrl, function (objects: any, options: any) {
      const objFront = fabric.util.groupSVGElements(objects, options)
      objFront.scale(0.3).set({
        hasControls: false,
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
      })
      objFront._objects.forEach((element: any) => {
        if(element.id === 'Laces') {
          element.globalCompositeOperation = 'destination-out'
        }
      })
      objFront.center().setCoords();
      texture = objFront
    })

    let logo !: any
    fabric.Image.fromURL('./img/images/logo.png', (img: any) => {

      img.scaleToWidth(100).scaleToHeight(100).set({
        left: 170,
        top: 170,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        evented: true,
        globalCompositeOperation: 'source-atop'
      })

      logo = img;
    })

    setTimeout(() => {
      canvas.add(texture)
      canvas.add(logo)
      canvas.add(model)

      canvas.viewportCenterObject(texture);
      canvas.viewportCenterObject(model);
      canvas.renderAll();

      canvas.renderAll()
    }, 1000)

  }
}
</script>

<style scoped>
</style>
