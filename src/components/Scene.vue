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
    this.loadScene(this.front, 'front')
    if(this.back) {
      this.loadScene(this.back, 'back')
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
  @Prop({required: false, default: 300}) readonly mainCanvasWidth!: number;
  @Prop({required: false, default: 360}) readonly mainCanvasHeight!: number;
  @Prop({required: false, default: 300}) readonly canvasWidth!: number;
  @Prop({required: false, default: 360}) readonly canvasHeight!: number;
  private frontCanvas !: fabric.Canvas
  private backCanvas !: fabric.Canvas
  private frontTexture !: any
  private backTexture !: any
  private apiBaseUrl: string = process.env.VUE_APP_API_BASE_URL
  private logoObjects: any[] =[]
  private customLogoObjects: any[] =[]
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
          if(self.backCanvas) {
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
            if (addLogo && logo.url) {
              if (!logo.action && self.logosSettings[index]) {
                finalLogo.width = self.canvasWidth / self.mainCanvasWidth * self.logosSettings[index].width
                finalLogo.height = self.canvasWidth / self.mainCanvasWidth * self.logosSettings[index].height
                finalLogo.x_axis = self.canvasWidth / self.mainCanvasWidth * self.logosSettings[index].x_axis
                finalLogo.y_axis = self.canvasWidth / self.mainCanvasWidth * self.logosSettings[index].y_axis
                finalLogo.rotation = self.canvasWidth / self.mainCanvasWidth * self.logosSettings[index].rotation
              }
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
    this.mounted = true
  }

  public loadScene (ImageData: any, side: string) {
    let element = this.$refs.front as HTMLCanvasElement
    if(side === 'back'){
      element = this.$refs.back as HTMLCanvasElement;
    }
    let canvas = new fabric.Canvas(element)
    if(side == 'back') {
      this.backCanvas = canvas
    }else {
      this.frontCanvas = canvas
    }

    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center'

    let model: any
    fabric.Image.fromURL(ImageData.modelUrl,  (img: any) => {
      img.scaleToHeight(canvas.getHeight() - 10).set({
        hasControls: false,
        selectable: false,
        evented: false,
        globalCompositeOperation: 'multiply'
        // globalCompositeOperation: 'overlay'
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
      }else{
        self.frontTexture = texture
      }
    })

    const self = this

    const timer = setInterval(() => {
      if(model && texture) {
        canvas.add(texture)
        self.logoObjects.forEach((logoObject) => {
          canvas.add(logoObject)
        })
        self.customLogoObjects.forEach((logoObject) => {
          canvas.add(logoObject)
        })
        canvas.add(model)

        canvas.viewportCenterObject(texture)
        canvas.viewportCenterObject(model)
        canvas.renderAll()

        let logos = this.logos
        if(this.customLogos && this.logoAllowed){
          let customLogos = this.customLogos
          if(this.logosLimit) {
            customLogos = this.customLogos.slice(0, this.logosLimit) as [Record<any, any>]
          }
          customLogos.forEach((item: Record<any, any>, index: number) => {
            if(!item.action && self.logosSettings[index]) {
              item.width = self.canvasWidth / self.mainCanvasWidth * self.logosSettings[index].width
              item.height = self.canvasWidth / self.mainCanvasWidth * self.logosSettings[index].height
              item.x_axis = self.canvasWidth / self.mainCanvasWidth * self.logosSettings[index].x_axis
              item.y_axis = self.canvasWidth / self.mainCanvasWidth * self.logosSettings[index].y_axis
              item.rotation = self.canvasWidth / self.mainCanvasWidth * self.logosSettings[index].rotation
            }
          })
          logos = logos.concat(customLogos) as [Record<any, any>]
        }
        if(logos.length) {
          logos = logos.filter((logo: Record<any, any>) => logo.side == side && logo.url) as [Record<any, any>]
          if (logos.length) {
            this.addLogos(logos)
          }
        }

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
      let logoUrl = (self.apiBaseUrl+'/'+logo.url).trim().split(' ').join('%20')
      if(logoUrl == e.target._element.src){
        if(e.action == 'drag') {
          self.$store.dispatch('updateCustomLogoAttribute', { index: index, attribute: 'x_axis', value: e.target.left })
          self.$store.dispatch('updateCustomLogoAttribute', { index: index, attribute: 'y_axis', value: e.target.top })
        }else if(e.action == 'scale' || e.action == 'scaleX' || e.action == 'scaleY') {
          self.$store.dispatch('updateCustomLogoAttribute', { index: index, attribute: 'scaleX', value: e.target.scaleX })
          self.$store.dispatch('updateCustomLogoAttribute', { index: index, attribute: 'scaleY', value: e.target.scaleY })
        }else if(e.action == 'rotate') {
          self.$store.dispatch('updateCustomLogoAttribute', { index: index, attribute: 'rotation', value: e.target.angle })
        }
        self.$store.dispatch('updateCustomLogoAttribute', { index: index, attribute: 'action', value: e.action })

        // this.mounted = false
      }
    })
  }

  public async addLogos(logos: [Record<any, any>]) {
    const self = this
    logos.forEach((logo: Record<any, any>) => {
      let model = self.frontModel
      let canvas = self.frontCanvas
      if (logo.side == 'back') {
        canvas = self.backCanvas
        model = self.backModel
      }
      logo.haveControls = Boolean(logo.haveControls)
      let logoUrl = (self.apiBaseUrl+'/'+logo.url).trim().split(' ').join('%20')
      fabric.Image.fromURL(logoUrl, (img: any) => {
        img.set({
            left: self.canvasWidth / self.mainCanvasWidth * logo.x_axis,
            top: self.canvasHeight / self.mainCanvasHeight * logo.y_axis,
            scaleX: self.canvasWidth / self.mainCanvasWidth * logo.width / img.width,
            scaleY: self.canvasHeight / self.mainCanvasHeight * logo.height / img.height,
            angle: logo.rotation as number,
            centeredScaling: true,
            selectable: logo.haveControls,
            hasControls: logo.haveControls,
            hasBorders: logo.haveControls,
            evented: logo.haveControls,
            globalCompositeOperation: 'source-atop'
          })

        if(logo.customLogo){
          img.side = logo.side
          self.customLogoObjects.push(img)
        }else {
          self.logoObjects.push(img)
        }

        canvas.add(img)
        model.bringToFront()
        canvas.renderAll()
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
