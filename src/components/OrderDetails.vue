<template>
  <div>
    <div class="loader" v-if="showLoader"><img src="../../src/assets/images/loading.gif" /></div>

    <div class="order-details-area">
      <div class="qty-area">
        <div class="qty-details" v-for="(roster,index) in rosterDetails" :key="index">
        </div>
        <div class="order-row total">
          <div class="total">Total</div>
          <div class="total-qty">{{ total }}</div>
        </div>
      </div>
      <div class="choose-stuff" v-if="selectedProduct.addons.length">
        <h2 class="fw-bold mb-3 fz-18 d-none d-lg-block">Choose Stuff</h2>
        <div class="stuff-row" v-for="(item, i) in selectedProduct.addons" :key="i">
          <b-form-checkbox size="sm">{{ item.addon.name }}</b-form-checkbox>
          <span class="charges">+${{ item.addon.price }}</span>
        </div>
      </div>
      <div class="pricing-are">
        <div class="order-details">
          <div class="order-row">
            <template v-if="isCustomerAuthenticated">
              <button class="btn btn-secondary fw-bold w-100 mb-2" @click="buyNow">Summary</button>
            </template>
            <template v-else>
              <b-button class="btn btn-secondary fw-bold w-100 mb-2" v-b-modal.modal-login>Summary</b-button>
            </template>
            <template>
              <b-button v-if="isCustomerAuthenticated" variant="outline-secondary"   @click="getLockers">Share roster url</b-button>
              <AddLockerRoomModal :rosterUrl="true"  ref="share" />
            </template>
            <template v-if="shared_url">
              <b-input-group>
                <b-form-input id="shared_url_link"   v-model="shared_url" ></b-form-input>
              </b-input-group>
              <b-button class="btn btn-secondary fw-bold w-100 mb-2" @click="copyLink">copy url</b-button>
            </template>
          </div>
          <button class="btn btn-secondary fw-bold w-100" v-if="$route.matched.some(({ name }) => name === 'ConfirmOrder')" @click="generateProductionPdf">Download Design File</button>
        </div>
      </div>
    </div>
    <div class="d-none">
      <ProductionScene ref="production-scene" v-bind:production_file_obj.sync="production_file_obj"/>
    </div>

<!--    <div class="d-none">
      <canvas width="600" height="600" ref="pdfFront" style="text-align: center; display: block">
      </canvas>
      <canvas width="600" height="600" ref="pdfBack" style="text-align: center; display: block">
      </canvas>
    </div>-->
  </div>
</template>

<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import {fabric} from 'fabric'
import html2pdf from "html2pdf.js"
import {default as $} from 'jquery';
import {http} from "@/httpCommon";
import DesignPdfView from "@/components/DesignPdfView.vue";
import AddLockerRoomModal from "@/components/AddLockerRoomModal.vue";
import ErrorMessages from "@/mixins/ErrorMessages";
import ProductionScene from '@/components/ProductionScene.vue'

type DOMParserSupportedType = "application/xhtml+xml" | "application/xml" | "image/svg+xml" | "text/html" | "text/xml";

@Component<OrderDetails>({
  components: {
    DesignPdfView,
    ProductionScene,
    AddLockerRoomModal
  },
  mounted(){
    this.$root.$on('rostershared', (val:string) =>{
      this.shared_url = val
    })
  }
})

export default class OrderDetails extends Mixins(ErrorMessages)  {
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public base64Logos: any[] = []
  public ref = this.$refs as Record<any, any>
  public pdf_front_image = null;
  public pdf_back_image = null;
  public showModal = false
  public shared_url = ""
  public production_file_obj = {
    url: null, content: null
  }

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails
  }

  get logoColors(): [Record<any, any>] {
    return this.$store.getters.getLogosColors
  }

  get total(): number {
    let sum = 0;
    if (this.rosterDetails){
      this.rosterDetails.forEach((item) => {
        sum += parseInt(item.quantity);
      })
    }
    return sum;
  }

  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  public buyNow() {
    this.$router.push('/confirm-order')
  }
  get canvasImage() {
    return this.$store.getters.getCanvasImage
  }

  public showLoader = false

  get customLogos(): [Record<any, any>] {
    return this.$store.getters.getCustomLogos().filter((custom_logo:any) => !(custom_logo == null || custom_logo.url == ""));
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts()
  }

  get svgGroups(): [Record<any, any>] {
    return this.$store.getters.getSvgGroups
  }


  get productionSVGs(): Record<any, any> {
    return this.$store.getters.getProductionSVGs
  }

  get editStatus():boolean{
    return  this.$store.getters.getEditStatus
  }


  public logosConversionToBase64() {
    const self = this
    self.base64Logos = []
    if (!self.customLogos.length) {
      self.htmlPdfGenerator()
    }
    self.customLogos.forEach((logos: Record<any, any>, index: number) => {
      if(logos.url) {
        let logoDimension = logos.originalHeight + 'cm x ' + logos.originalWidth + 'cm'
        self.toDataURLCustom(this.storageUrl+logos.url, (dataUrl: any) => {
          if (dataUrl) {
            self.base64Logos.push({'b64logo': dataUrl, 'logoSize': logoDimension})
            if (index == self.customLogos.length - 1) {
              self.htmlPdfGenerator()
            }
          }
        })
      }
    })
  }

   public async  generateProductionPdf() {
    let self = this;
    this.showLoader = true;
    let style_index = this.$store.getters.getCurrentStyleIndex;
    let selected_product = this.$store.getters.getSelectedProduct;
    const product_id = selected_product.product_id;
    let product_style = selected_product.productstyles[style_index];
    const product_style_id = product_style.id;
    let selectedDesign = product_style.productdesigns.filter((design: Record<any, any>) => design.design_show == 1);
    const product_design_id = selectedDesign[0].id;

    let product_models = this.$store.getters.getProductModels;
    let selected_model_index = this.$store.getters.getSelectedModelIndex;

    let product_model_id = 0;
    if(product_models.length > 0) {
      const selected_model = product_models[selected_model_index];
      product_model_id = selected_model.id;
    }
    let form_data = new FormData();
    if(self.production_file_obj.url) {
      form_data.append('original_file', new File([new Blob([(self.production_file_obj as Record<any,any>).content])], "original_file.svg", {
        type: "image/svg+xml",
      }));
    }
    form_data.append("product_id", product_id);
    form_data.append("product_style_id", product_style_id);
    form_data.append("product_design_id", product_design_id);
    form_data.append("product_model_id", product_model_id.toString());
    let order_detail = await self.getOrderDetail();
    form_data.append("order_detail", JSON.stringify(order_detail));
    let p2 = new Promise((resolve) => {
      this.pdf_front_image = this.canvasImage.ref_front.toDataURL("image/png")
      this.pdf_back_image = this.canvasImage.ref_back.toDataURL("image/png")
      resolve(1);
    });

    p2.then((value) => {
      if(value){
        const element = document.getElementById("production-pdf-html")
        const opt = {
          margin: [0, 0, 0, 0],
          filename: 'production.pdf',
          image: {type: "jpeg", quality: 1},

          jsPDF: {
            unit: "in",
            format: "letter",
            orientation: 'landscape'
          }
        };
        html2pdf().set(opt).from(element).toPdf().get("pdf")
          .output('datauristring')
          .then(function(pdfAsString: string) {
            form_data.append("order_file", pdfAsString)
            const res = http.post('orders/create', form_data);
          }).save('final_design');
        this.showLoader = false
      }
    })
  }

  public async getDocFromString(doc_string: string, type:DOMParserSupportedType ="image/svg+xml") {
    let parser = new DOMParser();
    return  parser.parseFromString(doc_string, type);
  }

  public generateProductionPdf_back(e: any) {
    this.showLoader = true
    $('meta[name=viewport]').attr('content', 'width=1024')
    let frontCanvas = this.productionSVGs.front
    let backCanvas = this.productionSVGs.back

    let front = new fabric.Canvas(this.$refs.pdfFront as HTMLCanvasElement)
    front.setHeight(600);
    front.setWidth(600);
    let back = new fabric.Canvas(this.$refs.pdfBack as HTMLCanvasElement)
    back.setHeight(600);
    back.setWidth(600);
    let emptyCallback = () => { console }
    front.loadFromJSON(JSON.stringify(frontCanvas), emptyCallback, emptyCallback)
    back.loadFromJSON(JSON.stringify(backCanvas), emptyCallback, emptyCallback)

    let front2dCtx = front.getContext()
    let back2dCtx = back.getContext()
    let front2D = $(front2dCtx.canvas)
    let back2D = $(back2dCtx.canvas)

    $(front2D).attr("id", "front-pdf")
    $(back2D).attr("id", "back-pdf")
    $(front2D).attr("class", "canvas")
    $(back2D).attr("class", "canvas")

    $.each($(front2D).data(), (i) => {
      $(front2D).removeAttr("data-" + i)
    })
    $.each($(back2D).data(), (i) => {
      $(back2D).removeAttr("data-" + i)
    })

    let frontViewPdf = front2D.get(0)
    let backViewPdf = back2D.get(0)

    $("#front-svg").html(frontViewPdf)
    $("#back-svg").html(backViewPdf)
    this.logosConversionToBase64()
  }

  public htmlPdfGenerator() {
    let style_index = this.$store.getters.getCurrentStyleIndex;
    let selected_product = this.$store.getters.getSelectedProduct;
    const product_id = selected_product.product_id;
    let product_style = selected_product.productstyles[style_index];
    const product_style_id = product_style.id;
    let selectedDesign = product_style.productdesigns.filter((design: Record<any, any>) => design.design_show == 1);
    const product_design_id = selectedDesign[0].id;

    let product_models = this.$store.getters.getProductModels;
    let selected_model_index = this.$store.getters.getSelectedModelIndex;

    let product_model_id = 0;
    if(product_models.length > 0) {
      const selected_model = product_models[selected_model_index];
      product_model_id = selected_model.id;
    }
    let order_payload = {
      product_id,
      product_style_id,
      product_design_id,
      product_model_id,
      order_file: ''
    }

    setTimeout(() => {
      const element = document.getElementById("production-pdf-html")
      const opt = {
        margin: [15, 10, 25, 10],
        filename: 'production.pdf',
        image: {type: "jpeg", quality: 1},
        html2canvas: {
          dpi: 192,
          scale: 4,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: "mm",
          format: "letter",
          orientation: 'landscape'
        }
      };
      html2pdf()
        .set(opt)
        .from(element)
        .toPdf()
        .get("pdf")
        .output('datauristring')
        .then(function(pdfAsString: string) {
          order_payload.order_file = pdfAsString;
          const res = http.post('orders/create', order_payload);
        })
        .save()

      $('meta[name=viewport]').attr('content', 'width=device-width')
      this.showLoader = false
    }, 1000)
  }

  public toDataURLCustom(url: string, callback: any) {
    let xhr = new XMLHttpRequest()
    xhr.onload = function () {
      let reader = new FileReader()
      reader.onloadend = function () {
        callback(reader.result)
      }
      reader.readAsDataURL(xhr.response)
    }
    xhr.open('GET', url)
    xhr.responseType = 'blob'
    xhr.send()
  }
  public async getLockers(){
    if (!this.editStatus){
      alert("athun khul rya")
      await this.$store.dispatch("getLockers");
      this.ref['share'].showSaveToLockerRoomModal()
    }else{
      let res  = await this.$store.dispatch('regenerateRosterLink', { id: this.$store.getters.getEditProductId })
      this.shared_url = res.data
    }
  }
  public copyLink() {
    let testingCodeToCopy = document.querySelector("#shared_url_link") as Record<any, any>
    testingCodeToCopy.select()
    try {
      document.execCommand('copy');
      this.shared_url = ""
      this.showToast('Shareable link was copied to your clipboard.', 'SUCCESS');
    } catch (err) {
      alert('Oops, unable to copy');
    }
  }

  public async getOrderDetail() {
    let self = this;
    let order_detail: { [key: string]: Record<any, any> } = {}
    order_detail.roster_detail = self.rosterDetails;
    order_detail.svg_groups = self.svgGroups;
    order_detail.custom_texts = self.customTexts;
    order_detail.custom_logos = self.customLogos;
    //if logo colors are being used then we will send it otherwise not
    if(self.$store.getters.getUsingColorLogos) {
      order_detail.logo_colors = self.logoColors
    }
    return order_detail;
  }
}
</script>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap');
/*body {*/
/* min-width: 320px;*/
/* overflow-x: hidden;*/
/* width: 100%;*/
/* font-family: 'Ubuntu', sans-serif;*/
/* font-size: 14px;*/
/* line-height: 1.3;*/
/* background: #fff;*/
/* color: #03142E;*/
/* margin: 0;*/
/* box-sizing: border-box;*/
/*}*/
div {
  box-sizing: border-box;
}

ol, ul {
  list-style: none;
  box-sizing: border-box;
}

blockquote, q {
  quotes: none;
}

blockquote:before, blockquote:after,
q:before, q:after {
  content: '';
  content: none;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
  border-collapse: collapse;
  width: 100%;
}


td, th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #dddddd;
}

a {
  color: #75b4e4;
  text-decoration: none;
  box-sizing: border-box;
}

#production-pdf-html,
#wrapper {
  width: 100%;
  overflow: hidden;
  margin: 0;
  padding: 10px;
  position: relative;
  max-width: 1020px;
  margin: 0 auto;
}

#header {
  overflow: hidden;
  padding: 0;
  margin: 0;
  position: relative;
}

#header .year {
  font-weight: 700;
  background: #000;
  color: #fff;
  padding: 0;
  display: inline-block;
  vertical-align: middle;
  max-width: 7%;
  width: 100%;
  text-align: center;
  font-size: 24px;
  padding: 2px;
}

#header .header-content {
  background: #009eda;
  color: #000;
  text-align: center;
  display: inline-block;
  vertical-align: middle;
  max-width: 77%;
  width: 100%;
  font-size: 20px;
  position: relative;
  padding: 5px;
}

#header .header-content:before {
  position: absolute;
  content: '';
  right: -20px;
  top: 0;
  border: 20px solid transparent;
  border-top: 30px solid #fff;
}

#header .logo {
  display: inline-block;
  vertical-align: middle;
  max-width: 15%;
  width: 100%;
  position: relative;
  z-index: 1;
  padding: 5px;
}

#header .logo svg {
  width: 100%;
  height: auto;
  display: block;
}

#main {
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.image-holder {
  overflow: hidden;
  align-items: center;
  padding: 20px 0;
  /*max-width: 600px;*/
  margin: 0 auto;
}

.image-holder .image-area {
  display: inline-block;
  vertical-align: middle;
  width: 100%;
  max-width: 47%;
  margin: 0 1%;
}

.image-holder .image-area image,
.image-holder .image-area svg {
  display: block;
  width: 100% !important;
  height: auto !important;
  margin: 0 auto !important;
}

.two-columns {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.two-columns .left-col {
  flex: 0 0 65%;
  max-width: 65%;
}

.two-columns .product-details-area {
  margin: 0;
  overflow: hidden;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.two-columns .details-col {
  flex: 0 0 48%;
  max-width: 48%;
}

.two-columns h2 {
  font-size: 24px;
  font-weight: 700;
  padding: 0;
  border: 2px solid #03142E;
  padding: 5px 10px;
  margin-bottom: 15px;
  position: relative;
}

.two-columns h2:before {
  position: absolute;
  content: '';
  right: -3px;
  top: -3px;
  border-top: 47px solid #fff;
  border-left: 33px solid transparent;
  z-index: 1;
}

.two-columns h2:after {
  position: absolute;
  content: '';
  right: 14px;
  top: -6px;
  bottom: -6px;
  background: #03142E;
  width: 2px;
  z-index: 2;
  transform: rotate(-35deg);
}

.two-columns .colors-area {
  overflow: hidden;
  padding: 0;
  margin: 0;
}

.two-columns .color-block {
  max-width: 45%;
  width: 100%;
  vertical-align: top;
  display: inline-block;
  margin: 0 0 10px;
}

.two-columns .color-box {
  width: 35px;
  height: 35px;
  vertical-align: top;
  display: inline-block;
  background: #03142E;
  margin: 0 10px 0 0;
}

.two-columns .color-details {
  max-width: 80px;
  width: 100%;
  font-size: 12px;
  vertical-align: top;
  display: inline-block;
}

.logo-area .logo-holder {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 0 2px;
}

.logo-area .logo-block {
  flex: 0 0 48%;
  max-width: 48%;
  padding: 20px 20px 40px;
  border: 1px solid #03142E;
  margin: 0 0 2px 0;
  min-height: 120px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  position: relative;
}

.logo-area .logo-block p {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  border-top: 1px solid #03142e;
  z-index: 1;
  padding: 5px;
  text-align: center;
}

.logo-area .logo-block:last-child {
  margin-left: 0;
}

.logo-area .logo-block img,
.logo-area .logo-block svg {
  display: block;
  height: auto;
  width: 100%;
  margin: 0 auto;
  max-width: 50px;
}

.two-columns .right-col {
  flex: 0 0 30%;
  max-width: 30%;
}

.name-no-details {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 0 0 10px;
}

.name-no-details .text-details {
  flex: 0 0 50%;
  max-width: 50%;
}

.name-no-details .color-details {
  flex: 0 0 45%;
  max-width: 45%;
}

.name-no-details .text-details span {
  display: block;
  margin: 0 0 7px;
}

.name-no-details .color-details-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin: 0 0 10px;
}

.name-no-details .color-details-wrapper .color-box {
  height: 15px;
}

.name-no-details .color-name-details {
  flex: 0 0 50px;
  max-width: 50px;
}
.loader{
  position: fixed;
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
  background: #fff;
  z-index: 1030;
}

img {
  max-width: 7%;
  display: block;
  margin: 0 auto;
  height: auto;
}
</style>
