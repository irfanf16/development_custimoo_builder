<template>
  <div>
    <template v-if="production_file_obj.content != null">
      <span  v-html="production_file_obj.content"></span>
    </template>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {fabric as fabrics} from 'fabric'
import $ from "jquery";

type DOMParserSupportedType = "application/xhtml+xml" | "application/xml" | "image/svg+xml" | "text/html" | "text/xml";

@Component<ProductionScene>({

})

export default class ProductionScene extends Vue {
  private production_file_obj: Record<any, any> = {
    url: null,
    content: null
  };
  private storage_url = process.env.VUE_APP_STORAGE_URL;

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
  async onSvgGroupsChanged(newVal:Record<any, any>, oldVal:Record<any, any>) {
    if(this.production_file_obj.url) {
      await this.parseSvgString(this.production_file_obj.content);
    }
  }

  @Watch('selectedProduct', {immediate: true, deep: true })
  onSelectedProductChanged(newVal:Record<any, any>, oldVal:Record<any, any>) {
    let self = this;
    if(newVal && self.selectedProduct) {
      self.setProductionSvgUrl(newVal);
    }
  }
  //watchers ends


  public async setProductionSvgUrl(selected_product: Record<any, any>) {
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
      self.production_file_obj.url = `${self.storage_url}${product_style_active_design.production_design.file_url}.svg`;
      self.production_file_obj.content = await self.fetchUrlContent(self.production_file_obj.url);
      await self.parseSvgString(self.production_file_obj.content)
    } else {
      await self.resetProductionFileObj();
    }
  }

  public async parseSvgString(svg_string: string) {
    let self = this;
    let svg_doc = await self.getDocFromString(svg_string)
    self.svgGroups.forEach((svg_group_item:Record<any, any>) => {
      $(svg_doc).find(`[id][fill]`).each(function(doc_item) {
        let doc_elem_id = $(this).attr("id");
        if(doc_elem_id) {
          doc_elem_id = doc_elem_id.search("_") >= 0 ? doc_elem_id.substring(0, doc_elem_id.search("_")) : doc_elem_id
          if(doc_elem_id.toLowerCase() == svg_group_item.id.toLowerCase()) {
            $(this).attr("fill", svg_group_item.color);
          }
        }
      })
    })
    self.production_file_obj.content = new XMLSerializer().serializeToString(svg_doc);
    self.$emit("update:production_file_obj", self.production_file_obj)
  }

  public async resetProductionFileObj() {
    this.production_file_obj = {
      url: null, content: null
    };
    this.$emit("update:production_file_obj", this.production_file_obj)
  }

  public async fetchUrlContent(url:string) {
    let fetch_content = await fetch(url);
    let url_content   = await fetch_content.text();
    return url_content;
  }

  public async getDocFromString(doc_string: string, type:DOMParserSupportedType ="image/svg+xml") {
    let parser = new DOMParser();
    return  parser.parseFromString(doc_string, type);
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
