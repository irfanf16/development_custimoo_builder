<template>
  <div>
    <canvas ref="front" id="front" className="canvas" width="400" height="500"></canvas>
    <canvas ref="back" id="back" className="canvas" width="400" height="500"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { fabric } from 'fabric'
import { Image } from 'fabric/fabric-impl'

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

    fabric.Image.fromURL(ImageData.modelUrl, function (img: any) {
      img.scale(0.3).set({
        opacity: 0.41,
        left: 192,
        top: 255,
        'hasControls': false,
        'selectable': false,
        'evented': false,
      });

      canvas.add(img)
      canvas.renderAll()
    })

    fabric.loadSVGFromURL(ImageData.textureUrl, function (objects: any, options: any) {
      const objFront = fabric.util.groupSVGElements(objects, options)
      objFront.scale(0.3).set({
        left: 190,
        top: 250,
        hasControls: false,
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true
      })

      canvas.setBackgroundImage(objFront as Image, function () {
        console.log('function done')
      })
    })

    fabric.Image.fromURL('./img/images/ladybug.png', function (img: any) {

      img.scale(0.5).set({
        left: 170,
        top: 170,
        opacity: 1,
        'selectable': true,
        'hasControls': true,
        'evented': true,
        globalCompositeOperation: 'source-atop',
      })

      img.hasControls = img.hasBorders = true;
      canvas.add(img);
      canvas.bringToFront(img);
    });
  }
}
</script>

<style scoped>
</style>
