<template>
  <div>
    <LoginForm ref="loginModal"   />
<!--    <div class="well custom d-flex gap-1 mt-3 position-relative" v-if="shared_url">-->
    <div class="well custom d-flex gap-1 mt-3 position-relative" v-if="false">
      <b-input-group class="w-100">
        <b-form-input ref="shared_url_link" class="w-100" v-model="shared_url" ></b-form-input>
      </b-input-group>
      <b-button class="btn btn-secondary fw-bold w-auto" style="white-space: nowrap" @click="copyLink">Copy URL</b-button>
      <button class="closeBtn" @click="closeCopyUrl">
        <BIconX />
      </button>
    </div>

    <div>
      <ConfirmOrderTab :changeText="changeText" />
    </div>
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
<!--          <button  class="btn btn-secondary fw-bold w-100" @click="addToCart">-->
<!--            Add to Cart-->
<!--          </button>-->

          <template v-if="isCustomerAuthenticated">
            <template v-if="$store.getters.getUpdateOrderItemProducts == null">
              <button v-if="!isLoading"  class="btn btn-secondary fw-bold w-100" @click="addToCart" :disabled="canvasImage.scene == null">
                {{ editCart.cartId > 0 ? 'Update Item' : 'Add to Cart'}}
              </button>
              <button v-else  class="btn btn-secondary fw-bold w-100" :disabled="true" >
                <img width="20" height="20" src="../../src/assets/images/loading.gif" />
              </button>
            </template>
          </template>
          <template v-else>
            <button  @click="setActionBeforeLogin('addToCart')" :key="'loginmodal'"   class="btn btn-secondary fw-bold w-100">Add to Cart</button>
          </template>


        </div>
      </div>
    </div>
    <div class="d-none">
      <ProductionScene ref="production-scene" v-bind:production_file_obj.sync="production_file_obj"/>
    </div>
    <div class="loader" v-if="showLoader"><img src="../../src/assets/images/loading.gif" /></div>
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop} from 'vue-property-decorator'
import html2pdf from "html2pdf.js"
import {default as $} from 'jquery';
import {http} from "@/httpCommon";
import ConfirmOrderTab from "@/views/ConfirmOrderTab.vue";
import AddLockerRoomModal from "@/components/AddLockerRoomModal.vue";
import ErrorMessages from "@/mixins/ErrorMessages";
import ModalAction from "@/mixins/ModalAction";
import ProductionScene from '@/components/ProductionScene.vue'
import { getActiveProductData } from "@/helpers/Helpers";
import LoginForm from '@/components/LoginForm.vue'
import {LockerProducts, handleMainProducts} from "@/mixins/LockerProduct";

import {compact} from 'lodash';

type DOMParserSupportedType = "application/xhtml+xml" | "application/xml" | "image/svg+xml" | "text/html" | "text/xml";

@Component<OrderDetailsTab>({
  components: {
    ProductionScene,
    AddLockerRoomModal, ConfirmOrderTab,
    LoginForm
  },
  mounted(){
    this.$root.$on('rostershared', (val:string) =>{
      this.shared_url = val
    })
  },
  created() {
    this.$root.$refs.Order_Details = this;
  }
})

export default class OrderDetailsTab extends Mixins(ErrorMessages, ModalAction, handleMainProducts)  {
  @Prop({required: true}) changeText: any
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
  public isLoading = false;

  get updateOrderItemProducts() {
    return this.$store.getters.getUpdateOrderItemProducts
  }

  get company(): Record<any, any>{
    return this.$store.getters.getCompany
  }

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }
  get editCart(): Record<any, any> {
    return this.$store.getters.getEditCart
  }

  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails()
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

  public openAddToLocker () {
    this.$emit('open-add-to-locker')
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

  get svgGroups(): [Record<any, any>] {
    return this.$store.getters.getSvgGroups
  }


  get productionSVGs(): Record<any, any> {
    return this.$store.getters.getProductionSVGs
  }

  get editStatus():boolean{
    return  this.$store.getters.getEditStatus
  }

  get customLogos(): [Record<any, any>] {
    return this.$store.getters.getCustomLogos()
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts()
  }

  get actionBeforeLogin(): string {
    return this.$store.getters.getActionBeforeLogin
  }

  get customTextObjects(): Record<any, any>[] {
    return this.$store.getters.customTextObjects;
  }
  get customLogoObjects(): Record<any, any>[] {
    return compact(this.$store.getters.customLogoObjects);
  }
  get defaultColors() : [Record<any, any>] {
    return this.$store.getters.getDefaultColors
  }

  get groupColors() : [Record<any, any>] {
    return this.$store.getters.getGroupColors
  }
  public setActionBeforeLogin(type: string) {
    this.$store.commit("ACTION_BEFORE_LOGIN", type);
    this.$store.commit('SET_SELECTION_MODE',{
      readonly:false,
      collectionAddmoreMode:false,
      eventProductMode:false,
      eventCollectionMode:false
    })
    this.gotoLogin()
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

  public gotoLogin(){
    if (this.company.platform == 'self'){
      this.$modal.show('loginModal')
    }
    else{
      if(this.company.login_code.type == 'url') {
        window.location.href = this.company.login_code.action
      } else {
        eval(this.company.login_code.action)
      }
    }
  }

  public async addToCart() {
    try {
      this.isLoading = true;
     let cart_product = await getActiveProductData();
     this.$store.dispatch('setRevertRosterBOOL',true);

     if(cart_product == null) {
       return false;
     }
      let post_data = {
        factory_product: cart_product
      };
      let url = "carts"
      if(this.$store.getters.getEditCart.cartId > 0) {
        post_data.factory_product.id = this.$store.getters.getEditCart.cartItemId
        url = `carts/cart-items/${this.$store.getters.getEditCart.cartId}/update`
      }

      let santacart = true;
      let company_domain = this.company.company_domain;
      console.log("platform", this.company)
      let platform = this.company.platform;
      let ecommerce_cart_id = null;
      let ecom_url = company_domain + '/wp-admin/admin-ajax.php';
      console.log()

      if(platform === 'wordpress'){
        if(cart_product.sync_id === "" || cart_product.ecommerce_post_id === ""){
          return false;
        }

        let ecom_form_data = new FormData();

        let ecommerce_update_id = this.$route.query.update_item;
        if(ecommerce_update_id){
          ecom_form_data.append('action', 'custimoo_update_cart');
          ecom_form_data.append('update_item', ecommerce_update_id);
        }else{
          ecom_form_data.append('action', 'custimoo_add_to_cart');
          ecom_form_data.append('product_name', cart_product.product_name);
        }

        ecom_form_data.append('product_id', cart_product.ecommerce_post_id);
        ecom_form_data.append('quantity', this.total);
        ecom_form_data.append('product_front_image', cart_product.front_image);

        await http.post(ecom_url, ecom_form_data).then((res: any) => {
          if(!res.data.status){
            santacart = false
            this.showToast(res.data.message, 'ERROR');
          }else{
            ecommerce_cart_id = res.data.ecommerce_cart_id;
          }
        }).catch(err => {
          santacart = false
          this.isLoading = false
          this.showErrorArr(err.response.data.errors)
        });

        post_data.factory_product.ecommerce_cart_id = ecommerce_cart_id;
      }


      if(santacart){
        this.isLoading = true;
        http.post(url, post_data).then((res: any) => {
          if (res.data.success == true){
            let edit_cart = this.$store.getters.getEditCart.cartId > 0;
            let api_res:Record<any, any> = res.data.result
            this.$store.dispatch('addToCart',api_res.items)
            this.$store.dispatch('setEditCart', {key:'cartId',value:0});
            this.$store.dispatch('setEditCart', {key:'cartItemId',value:''});
            this.showToast(res.data.message, 'SUCCESS');
            if(platform === 'wordpress'){
              let update_cart_id_data = new FormData();
              update_cart_id_data.append('santa_cart_id', api_res.new_created_id);
              update_cart_id_data.append('woocom_cart_id', ecommerce_cart_id);
              update_cart_id_data.append('action', 'add_custimoo_cart_id');

               http.post(ecom_url, update_cart_id_data).then((res: any) => {
                 window.location.href = company_domain + '/cart'
              }).catch(err => {
                this.showErrorArr(err.response.data.errors)
              });

            } else {
              if(edit_cart) {
                this.retrieveProducts();
              }
            }
            this.isLoading = false;
          }else{
            if(res.data.status_code === 422){
              this.showErrorValidation(res.data.errors);
              this.isLoading = false
            }
            else{
              this.showError(res)
              this.isLoading = false
            }
          }
        }).catch(err => {
          this.isLoading = false
          this.showErrorArr(err.response.data.errors)
        })
      }

    }
    catch (e) {
      console.error('error in add to cart',e)
      this.isLoading = false
    }
  }

  public async retrieveProducts(url:string|null=null) {
    let self = this;
    let sync_id = this.$route.query.sync_id;
    if(url == null) {
      url = `/list/products`;
    }
    let url_obj = new URL(`${process.env.VUE_APP_API_BASE_URL}${url}`);
    if(!url_obj.searchParams.has("customized")) {
      url_obj.searchParams.append('customized', this.$store.getters.getCustomized)
    }
    if(!url_obj.searchParams.has("personalized")) {
      url_obj.searchParams.append('personalized', this.$store.getters.getPersonalized)
    }
    if(self.search_products && !url_obj.searchParams.has("title")) {
      url_obj.searchParams.append('title', self.search_products)
    }
    if(this.$route.query.update_order_product) {
      url_obj.searchParams.append('update_order_product', this.$route.query.update_order_product);
      url_obj.searchParams.append('order_item_id', this.$route.query.order_item_id);
      url_obj.searchParams.append('activity_id', this.$route.query.activity_id);
      //this.$router.replace('/')
    }
    url = url_obj.pathname + url_obj.search;
    if(sync_id) {
      if(url.indexOf("?") > 0) {
        url += `&sync_id=${sync_id}`;
      } else {
        url = `?sync_id=${sync_id}`;
      }
    }
    http.get(url).then(async (response: Record<any, any>) => {
      if(response.data.products.data.length > 0 ){
        await self.handleMainProducts(response);
        if(self.updateOrderItemProducts) {
          await self.updateFactoryProduct(self.updateOrderItemProducts.factory_products[self.updateOrderItemProducts.active_index]);
        }

        if(self["showLoader"] || self["searchLoader"]) {
          self.showLoader = false;
          await self.$store.dispatch('setSearchLoader', false)
        }
      }else{
        this.showError("No Product Found")
        self.showLoader = false
        await self.$store.dispatch('setSearchLoader', false)
      }
    }, (error) => {
      console.error("Error while getting order detail", error?.response?.data?.message)
    })
  }


   public async  generateProductionPdf() {
    let self = this;
    self.showLoader = true;
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
      form_data.append('production_cutting_file', new File([new Blob([(self.production_file_obj as Record<any,any>).content])], "production_cutting_file.svg", {
        type: "image/svg+xml",
      }));
    }
    form_data.append("product_id", product_id);
    form_data.append("product_style_id", product_style_id);
    form_data.append("product_design_id", product_design_id);
    form_data.append("product_model_id", product_model_id.toString());
    let order_detail = await self.getOrderDetail();
    this.canvasImage.scene.frontCanvas.discardActiveObject().renderAll()
    this.canvasImage.scene.backCanvas.discardActiveObject().renderAll()
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
          .then(async function(pdfAsString: string) {
            form_data.append("order_file", pdfAsString)
            await http.post('orders/create', form_data).then(() => {
              self.showLoader = false
            }).catch(error => {
              self.showLoader = false
              console.log("Error wilde creating order", error)
            });
          }).save('final_design');

      }
    })
  }

  public async getDocFromString(doc_string: string, type:DOMParserSupportedType ="image/svg+xml") {
    let parser = new DOMParser();
    return  parser.parseFromString(doc_string, type);
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
      await this.$store.dispatch("getLockers");
      this.$emit('open-add-to-locker')
    }else{
      let res  = await this.$store.dispatch('regenerateRosterLink', { id: this.$store.getters.getEditProductId })
      this.shared_url = res.data
    }
  }
  public closeCopyUrl(){
    this.shared_url = ""
  }
  public copyLink() {
    let toCopy = this.$refs['shared_url_link'] as Record<any, any>
    toCopy = toCopy[0].$el as Record<any, any>
    toCopy.select()
    try {
      document.execCommand('copy');
      this.closeCopyUrl();
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
    order_detail.custom_texts = this.customTexts.filter((custom_text) => custom_text.text.length > 0);
    order_detail.custom_logos = self.customLogos;
    if(self.$store.getters.getUsingColorLogos) {
      order_detail.logo_colors = self.logoColors
    }
    let custom_text_objects = compact(this.customTextObjects);
    let custom_logo_objects = compact(this.customLogoObjects);
    let custom_text_svgs = [];
    for (const custom_text_object of custom_text_objects) {
      if (custom_text_object.constructor.name == "klass") {
        custom_text_svgs.push(custom_text_object.toSVG());
      }
    }
    order_detail.custom_text_svgs = custom_text_svgs
    let custom_logo_svgs = [];
    for (const custom_logo_svg of custom_logo_objects) {
      if(custom_logo_svg.constructor.name == "klass") {
        custom_logo_svgs.push(custom_logo_svg.toSVG());
      }
    }
    order_detail.custom_logo_svgs = custom_logo_svgs
    return order_detail;
  }

}
</script>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap');
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
  background: rgba(255, 255, 255, 0.9);
  z-index: 1030;
}

img {
  max-width: 7%;
  display: block;
  margin: 0 auto;
  height: auto;
}

.closeBtn{
  background: firebrick;
  color: #fff;
  height: 20px;
  width: 20px;
  cursor: pointer;
  padding: 0;
  margin: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -10px;
  right: -10px;
  border-radius: 1000px;
  font-size: 1rem;
}
</style>
