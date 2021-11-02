<template>
  <div>
    <canvas ref="factory_cuttings" id="factory-cuttings" :width="canvasWidth" :height="canvasHeight"></canvas>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {fabric} from 'fabric'

@Component<ProductionScene>({
  mounted() {
    let self = this;
    self.initializeCanvas();
  }
})

export default class ProductionScene extends Vue {

  @Prop({required: false, default: 600}) readonly canvasWidth!: number;
  @Prop({required: false, default: 600}) readonly canvasHeight!: number;
  private factory_cuttings_canvas: null|fabric.Canvas = null;
  private svg_elems_group: null|Record<any, any> = null;
  private production_svg_url = null;
  private storage_url = process.env.VUE_APP_STORAGE_URL;

  //computed values starts
  get groupColors(){
    return this.$store.getters.getGroupColors
  }

  get selectedProduct(){
    return this.$store.getters.getSelectedProduct
  }

  get productStyleIndex(){
    return this.$store.getters.getCurrentStyleIndex;
  }
  //computed values ends

  //watchers starts
  @Watch('groupColors', { deep: true })
  onGroupColorsChanged(newVal:Record<any, any>, oldVal:Record<any, any>) {
    //as in this case we are mutating array object instead of replacing with new object that's why newVal and oldVal have same values. This is Vue caveat
    let self = this;
    self.setFactoryCuttingColors();
  }

  @Watch('selectedProduct', {immediate: true, deep: true })
  onSelectedProductChanged(newVal:Record<any, any>, oldVal:Record<any, any>) {
    let self = this;
    console.log("newval before", newVal, oldVal)
    if(newVal && self.selectedProduct) {
      console.log("newval", newVal.id)
      if(self.factory_cuttings_canvas) {
        self.setProductionSvgUrl(newVal);
        self.loadSvgFromUrl();
      } else {
        self.initializeCanvas();
        self.setProductionSvgUrl(newVal);
        self.loadSvgFromUrl();
      }
    }
  }
  //watchers ends

  initializeCanvas() {
    console.log("initializeCanvas")
    let self = this;
    let factory_cuttings_elem = self.$refs.factory_cuttings as HTMLCanvasElement
    self.factory_cuttings_canvas = new fabric.Canvas(factory_cuttings_elem);
  }

  loadSvgFromUrl(url=null) {
    let self = this;
    console.log("loading svg", self.factory_cuttings_canvas)
    let factory_cuttings_canvas = self.factory_cuttings_canvas;
    factory_cuttings_canvas.clear();
    console.log("loading svg if")
    fabric.loadSVGFromURL(`${self.production_svg_url}`, (objects: any, options: any) => {
      options.crossOrigin = 'Anonymous'
      let svg_elems_group = self.svg_elems_group = fabric.util.groupSVGElements(objects) as fabric.canvas
      self.svg_elems_group?.scaleToWidth(factory_cuttings_canvas.getWidth() - 10)
      self.factory_cuttings_canvas?.add(svg_elems_group);
      factory_cuttings_canvas.renderAll();
      this.setFactoryCuttingColors();
    })

  }

  setFactoryCuttingColors() {
    let self = this;
    //as in this case we are mutating array object instead of replacing with new object that's why newVal and oldVal have same values. This is Vue caveat
    if(self.svg_elems_group) {
      self.svg_elems_group.getObjects().forEach((svg_elem:Record<any, any>) => {
        let elem_id = svg_elem.id.toLowerCase();
        if(elem_id) {
          let elem_name = elem_id.search("_") >=0 ? elem_id.substring(0,elem_id.search("_")) : elem_id;
          let color_group = self.groupColors[elem_name];
          if(color_group) {
            svg_elem.set("fill", color_group.color);
          }
        }
      })
      self.factory_cuttings_canvas.renderAll();
    }

  }

  setProductionSvgUrl(selected_product) {
    let self = this;
    console.log("setProductionSvgUrl", selected_product)
    let product_style = selected_product.productstyles[self.productStyleIndex];
    let product_style_active_design = product_style.productdesigns.filter((product_design) => {
      return product_design.design_show;
    });
    if(product_style_active_design.length > 0) {
      product_style_active_design = product_style_active_design[0]
    } else {
      product_style_active_design = null;
    }
    if(product_style_active_design && product_style_active_design.production_design) {
      self.production_svg_url = `${self.storage_url}${product_style_active_design.production_design.file_url}.svg`;
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
