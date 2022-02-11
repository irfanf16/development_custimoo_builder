<template>
  <div>
    <canvas ref="factory_cuttings" id="factory-cuttings" :width="canvasWidth" :height="canvasHeight"></canvas>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {fabric as fabrics} from 'fabric'

@Component<ProductionScene>({
  mounted() {
    let self = this;
    self.initializeCanvas();
  }
})

export default class ProductionScene extends Vue {

  @Prop({required: false, default: 500}) readonly canvasWidth!: number;
  @Prop({required: false, default: 500}) readonly canvasHeight!: number;
  private factory_cuttings_canvas!: fabrics.Canvas
  private svg_elems_group: null|Record<any, any> = null;
  private production_svg_url: string|null = null;
  private storage_url = process.env.VUE_APP_STORAGE_URL;
  public svg_file_options: Record<any, any> = {
    width: null,
    height: null
  };

  //computed values starts

  get svgGroups() {
    return this.$store.getters.getSvgGroups
  }

  get selectedProduct(){
    return this.$store.getters.getSelectedProduct
  }

  get productStyleIndex(){
    return this.$store.getters.getCurrentStyleIndex;
  }
  //computed values ends

  //watchers starts
  @Watch('svgGroups', { deep: true })
  onSvgGroupsChanged(newVal:Record<any, any>, oldVal:Record<any, any>) {
    this.setFactoryCuttingColors();
  }

  @Watch('selectedProduct', {immediate: true, deep: true })
  onSelectedProductChanged(newVal:Record<any, any>, oldVal:Record<any, any>) {
    let self = this;
    if(newVal && self.selectedProduct) {
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
    let self = this;
    let factory_cuttings_elem = self.$refs.factory_cuttings as HTMLCanvasElement
    self.factory_cuttings_canvas = new fabrics.Canvas(factory_cuttings_elem);
  }

  loadSvgFromUrl(url=null) {
    let self = this;
    if(self.production_svg_url) {
      fabrics.loadSVGFromURL(`${self.production_svg_url}`, (objects: any, options: any) => {
        options.crossOrigin = 'Anonymous'
        self.svg_file_options.width = options.width;
        self.svg_file_options.height = options.height;
        let svg_elems_group = self.svg_elems_group = fabrics.util.groupSVGElements(objects) as fabrics.Group
        let svg_elems_group_scaled_width = self.factory_cuttings_canvas?.getHeight() - 50;
        self.svg_elems_group?.scaleToWidth(svg_elems_group_scaled_width).set({
          hasControls: false,
          selectable: false,
          evented: false
        })
        self.factory_cuttings_canvas?.clear();
        self.factory_cuttings_canvas?.add(svg_elems_group);
        self.svg_elems_group?.center();
        self.factory_cuttings_canvas?.renderAll();
        this.setFactoryCuttingColors();
      })
    }
  }

  setFactoryCuttingColors() {
    let self = this;
    //as in this case we are mutating array object instead of replacing with new object that's why newVal and oldVal have same values. This is Vue caveat
    if(self.svg_elems_group) {
      self.svg_elems_group.getObjects().forEach((svg_elem:Record<any, any>) => {
        let elem_id = svg_elem.id.toLowerCase();
        if(elem_id) {
          let elem_name = elem_id.search("_") >=0 ? elem_id.substring(0,elem_id.search("_")) : elem_id;
          self.svgGroups.forEach((svg_group_item:Record<any, any>) => {
            if(svg_group_item.id == elem_name) {
              svg_elem.set("fill", svg_group_item.color);
            }
          })
        }
      })
      self.factory_cuttings_canvas?.renderAll();
    }

  }

  setProductionSvgUrl(selected_product: Record<any, any>) {
    let self = this;
    let product_style = selected_product.productstyles[self.productStyleIndex];
    let product_style_active_design = product_style.productdesigns.filter((product_design:Record<any, any>) => {
      return product_design.design_show;
    });
    if(product_style_active_design.length > 0) {
      product_style_active_design = product_style_active_design[0]
    } else {
      product_style_active_design = null;
    }
    if(product_style_active_design && product_style_active_design.production_design) {
      self.production_svg_url = `${self.storage_url}${product_style_active_design.production_design.file_url}.svg`;
    } else {
      self.production_svg_url = null;
      self.svg_elems_group = null;
      self.factory_cuttings_canvas?.clear();
    }
  }

  canvasToImage(type = 'png', download = false, download_as = 'factory_cuttings') {
    let self = this;
    let base_64_image = (self.$refs as Record<any,any>).factory_cuttings.toDataURL(type)
    if(download) {
      let a = document.createElement("a");
      a.href =  base_64_image;
      a.download = `${download_as}.${type}`;
      a.click();
    } else {
      return base_64_image;
    }
  }
  async canvasToSvg() {
    let self = this;
    if(self.production_svg_url) {
      return {
        svg: self.factory_cuttings_canvas?.toSVG(),
        options: self.svg_file_options
      };
    } else {
      return undefined;
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
