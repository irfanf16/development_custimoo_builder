<template>
  <div>
    <canvas ref="factory_cuttings" id="factory-cuttings" class="canvas"></canvas>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
const fabric = () => import("fabric")
/*import {fabric} from 'fabric'*/

@Component<ProductionScene>({
  created() {
    let self = this;
    setTimeout(() => {
      this.initializeCanvas();
    }, 2000)
    console.log("mounted")
  }
})

export default class ProductionScene extends Vue {

  @Prop({required: false, default: 600}) readonly canvasWidth!: number;
  @Prop({required: false, default: 600}) readonly canvasHeight!: number;
  private factory_cuttings_canvas: null|fabric.Canvas = null;
  private svg_elems_group: null|Record<any, any> = null;

  //computed values starts
  get groupColors(){
    return this.$store.getters.getGroupColors
  }
  //computed values ends

  //watchers starts
 /* @Watch('groupColors', { immediate: true, deep: true })
  onGroupColorsChanged(newVal:Record<any, any>, oldVal:Record<any, any>) {
    console.log('change color')
    //as in this case we are mutating array object instead of replacing with new object that's why newVal and oldVal have same values. This is Vue caveat
    let self = this;
    if(self.svg_elems_group) {
      console.log('in if')
      self.svg_elems_group.getObjects().forEach((svg_elem:Record<any, any>) => {
        let elem_id = svg_elem.id.toLowerCase();
        if(elem_id) {
          let elem_name = elem_id.search("_") >=0 ? elem_id.substring(0,elem_id.search("_")) : elem_id;
          let color_group = self.groupColors[elem_name];
          if(color_group) {
            console.log("itemss", svg_elem);
            svg_elem.set("fill", color_group.color);
          }
        }
      })
      self.factory_cuttings_canvas?.calcOffset();
      self.factory_cuttings_canvas?.renderAll()
    }
  }*/
  //watchers ends




  initializeCanvas() {
    let self = this;
    let factory_cuttings_elem = this.$refs.factory_cuttings as HTMLCanvasElement
    console.log("refs", factory_cuttings_elem);
    this.factory_cuttings_canvas = new fabric.Canvas(factory_cuttings_elem);
    fabric.loadSVGFromURL("https://custimoo.s3.us-east-1.amazonaws.com/files/1/container/24/7/Swirly/1635320021-Production.svg", (objects: any, options: any) => {
      console.log("elems", objects, options)
      self.svg_elems_group = fabric.util.groupSVGElements(objects) as fabric.Group
      self.svg_elems_group.scaleToWidth(this.factory_cuttings_canvas?.getWidth() - 10)
      self.factory_cuttings_canvas.add(self.svg_elems_group);
    })
  }

  setFactoryCuttingColors() {
    console.log('change color')
    //as in this case we are mutating array object instead of replacing with new object that's why newVal and oldVal have same values. This is Vue caveat
    let self = this;
    if(self.svg_elems_group) {
      console.log('in if')
      self.svg_elems_group.getObjects().forEach((svg_elem:Record<any, any>) => {
        let elem_id = svg_elem.id.toLowerCase();
        if(elem_id) {
          let elem_name = elem_id.search("_") >=0 ? elem_id.substring(0,elem_id.search("_")) : elem_id;
          let color_group = self.groupColors[elem_name];
          if(elem_name == "sleeves") {
            console.log("elem_id", elem_name, elem_id);
            svg_elem.set("fill", "#ccc");
          }
        }
      })
      self.factory_cuttings_canvas?.calcOffset();
      self.factory_cuttings_canvas?.renderAll()
    }

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
