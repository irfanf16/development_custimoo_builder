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
      <ConfirmOrderTab />
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
<!--              <button class="btn btn-secondary fw-bold w-100" @click="generateSVG" >Generate SVG</button>-->
              <button v-if="!isLoading"  class="btn btn-secondary fw-bold w-100" @click="addToCart" :disabled="canvasImage.scene == null">
                <template v-if="getProductEditInfoObject.editing">
                  <template v-if="getProductEditInfoObject.type == 'cart_product'">
                    Update Cart
                  </template>
                  <template v-else>
                    Update Item
                  </template>
                </template>
                <template v-else>
                  Add to Cart
                </template>
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
import {
  getActiveProductData,
  urlToBase64,
  getFileExtensionType,
  fontsList,
  handleResponseException
} from "@/helpers/Helpers";
import LoginForm from '@/components/LoginForm.vue'
import {LockerProducts, handleMainProducts, ProductsQueryParamsMixin, exitEditMode} from "@/mixins/LockerProduct";

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

export default class OrderDetailsTab extends Mixins(ErrorMessages, ModalAction, handleMainProducts, ProductsQueryParamsMixin, exitEditMode)  {
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

  get getProductEditInfoObject() {
    return this.$store.getters.getProductEditInfoObject
  }
  public roster_detail: Record<any,any> = [];

  public production_file_info: Record<any,any> = {};

  public font_file : Record<any,any>[] = [];

  public storage_url:string = process.env.VUE_APP_STORAGE_URL;

  public svg_pattern_last_value_y = 0;

  public logo_pattern_last_value_y = 0;

  public INCH_TO_CENTIMETER = 2.54;

  get updateOrderItemProducts() {
    return this.$store.getters.getUpdateOrderItemProducts
  }

  get company(): Record<any, any>{
    return this.$store.getters.getCompany
  }

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }
  // get editCart(): Record<any, any> {
  //   return this.$store.getters.getEditCart
  // }

  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails()
  }

  get logoColors(): [Record<any, any>] {
    return this.$store.getters.getLogosColors
  }

  get getLastActiveProductData() {
    return this.$store.getters.getLastActiveProductData
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
  // public async generateSVG(){
  //   let cart_product:Record<any,any> = await getActiveProductData();
  //   if(cart_product){
  //     if(Object.prototype.hasOwnProperty.call(cart_product,'production_url') && cart_product.production_url){
  //       let content:string = await this.fetchUrlContent(cart_product?.production_url);
  //       let production_content = await this.parseSvgString(content,cart_product as Record<any,any>);
  //       cart_product.svg_content = production_content;
  //     }
  //   }else{
  //     return false;
  //   }
  //   console.log(cart_product.roster_detail);
  //   console.log(cart_product.svg_content);
  // }
  public async addToCart() {
    let self: Record<any, any> = this;
    try {
      this.isLoading = true;
     let cart_product:Record<any,any> = await getActiveProductData();
     if(cart_product){
       if(Object.prototype.hasOwnProperty.call(cart_product,'production_url') && cart_product.production_url){
         let content:string = await this.fetchUrlContent(cart_product?.production_url);
         let production_content = await this.parseSvgString(content,cart_product as Record<any,any>);
         cart_product.svg_content = production_content;
       }
     }else{
        return false;
     }
     this.$store.dispatch('setRevertRosterBOOL',true);

      let post_data = {
        factory_product: cart_product
      };
      let url = "carts"
      let cart_edit_mode = false;
      if(this.getProductEditInfoObject.editing && this.getProductEditInfoObject.type == "cart_product") {
        cart_edit_mode = true
        post_data.factory_product.id = this.getProductEditInfoObject.cart_product_info.cart_item_product.id
        url = `carts/cart-items/${this.getProductEditInfoObject.cart_product_info.cart_item_id}/update`
      }

      let santacart = true;
      let company_domain = this.company.company_domain;

      let platform = this.company.platform;
      let ecommerce_cart_id = null;
      let ecom_url = company_domain + '/wp-admin/admin-ajax.php';

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
        http.post(url, post_data).then(async (res: any) => {
          console.log("response", res.data.success)
          if (res.data.success == true){
            console.log("response if", res.data.success, cart_edit_mode)
            let product_edit_info_obj = self.$store.getters.getProductEditInfoObject;
            let api_res:Record<any, any> = res.data.result
            self.$store.dispatch('addToCart',api_res.items)
            // self.$store.dispatch('setEditCart', {key:'cartId',value:0});
            // self.$store.dispatch('setEditCart', {key:'cartItemId',value:''});
            await self.exitFromEditMode()
            self.showToast(res.data.message, 'SUCCESS');
            self.$store.dispatch('addedToCart', true)
            if(platform === 'wordpress'){
              let update_cart_id_data = new FormData();
              update_cart_id_data.append('santa_cart_id', api_res.new_created_id);
              update_cart_id_data.append('woocom_cart_id', ecommerce_cart_id);
              update_cart_id_data.append('action', 'add_custimoo_cart_id');
              if(cart_edit_mode) {
                await self.exitFromEditMode()
              }
               http.post(ecom_url, update_cart_id_data).then((res: any) => {
                 window.location.href = company_domain + '/cart'
              }).catch(err => {
                self.showErrorArr(err.response.data.errors)
              });

            }
            else {
              if(cart_edit_mode) {
                await self.exitFromEditMode()
                let query_params = await self.setQueryParams
                self.retrieveProducts(query_params);
              }
            }
            self.isLoading = false;
          }
          else {
            if(res.data.status_code === 422){
              self.showErrorValidation(res.data.errors);
            }
            if(cart_edit_mode) {
              await self.exitFromEditMode()
              let query_params = await self.setQueryParams
              self.retrieveProducts(query_params);
            }
          }
          self.showToast(res.data.message, res.data.success ? "SUCCESS" : "ERROR")
          self.isLoading = false

        }).catch(async errorResponse => {
          self.isLoading = false
          handleResponseException(errorResponse)
          if(cart_edit_mode) {
            await self.exitFromEditMode()
            let query_params = await self.setQueryParams
            self.retrieveProducts(query_params);
          }
        })
      }

    }
    catch (e) {
      console.error('error in add to cart',e)
      self.isLoading = false
    }
  }

  public async retrieveProducts() {
    let self = this;

    let url = `/list/products?customized=${this.getLastActiveProductData.customized}&personalized=${this.getLastActiveProductData.personalized}`;
    if(this.getLastActiveProductData.search_products) {
      url +=` &title=${this.getLastActiveProductData.search_products}`
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
        custom_logo_svgs.push({
          width:custom_logo_svg.width,
          height:custom_logo_svg.height,
          svg: custom_logo_svg.toSVG(),
          scaleX:custom_logo_svg.scaleX,
          scaleY:custom_logo_svg.scaleY
        });
      }
    }
    order_detail.custom_logo_svgs = custom_logo_svgs
    return order_detail;
  }

  public async fetchUrlContent(url:string) {
    if(url) {
      let fetch_content = await fetch(url);
      let url_content   = await fetch_content.text();
      return url_content;
    } else {
      return "";
    }
  }

  public async parseSvgString(svg_string:string, factory_product_content: Record<any,any>) {
    if(svg_string.substring(0, svg_string.lastIndexOf("</g>")) !== '') {
      let self = this;
      let production_content = "";

      svg_string = svg_string.substring(0, svg_string.lastIndexOf("</g>"));

      let factory_product:Record<any,any> = await this.parseFactoryProduct(factory_product_content);
      svg_string += `${this.getSVGPattern(factory_product.roster_detail,factory_product.measurement_ratio)}\n`

      if((factory_product.custom_logos.length >= 1)){
        let custom_logos_without_base64 = factory_product.custom_logos.filter((custom_logo:Record<any,any>) => {
          return ((custom_logo.url != null || custom_logo.url != ""))
        })
        if(custom_logos_without_base64.length > 0){
          let custom_logos = await this.$store.dispatch('converturlToBase64',{custom_logos:custom_logos_without_base64});
          svg_string += `${await this.getLogoPattern(custom_logos.data.custom_logos,factory_product.measurement_ratio)}`
        }
      }
      svg_string += `\n</g>\n</svg>`;
      let svg_doc = await this.getDocFromString(svg_string);
      this.production_file_info = {
        width: $(svg_doc).find("svg").eq(0).attr("width"),
        height: $(svg_doc).find("svg").eq(0).attr("height")
      }
      let scaled_file_info = {
        width : parseFloat(this.production_file_info.width),
        height : this.logo_pattern_last_value_y?this.logo_pattern_last_value_y:this.svg_pattern_last_value_y,
      };


      //Applying Color on SVG Start
      this.applyColorToSVG(factory_product,svg_doc);
      //Applying Color on SVG End

      //Add Fonts to SVgs Start
      let font_file = fontsList(this.selectedProduct);
      if(font_file.length > 0){
        let font_style = this.generateFontFile(font_file);
        $(svg_doc).find("svg").eq(0).prepend(font_style)
      }
      //Add Fonts to SVgs End

      //Add Front and Back Images Shown on SVG Start
      //Back Image
      let group_back_image_tag = this.getGroupImageTag(factory_product,self.production_file_info,'back_image');
      $(svg_doc).find("g").eq(0).prepend(group_back_image_tag)
      //Front Image
      let group_front_image_tag = this.getGroupImageTag(factory_product,self.production_file_info,'front_image');
      $(svg_doc).find("g").eq(0).prepend(group_front_image_tag)
      //Add Front and Back Images Side wise to svg End

      $(svg_doc).find("svg").eq(0).attr({"width": (scaled_file_info.width * 2) + 'px', height: scaled_file_info.height + 'px'});
      let view_box = svg_doc?.querySelector('svg')?.getAttribute('viewBox');
      let view_box_dimensions = view_box?.split(" ");
      svg_doc?.querySelector('svg')?.setAttribute('viewBox',`${view_box_dimensions[0]} ${view_box_dimensions[1]} ${parseFloat(self.production_file_info.width) * 2} ${this.logo_pattern_last_value_y?this.logo_pattern_last_value_y:this.svg_pattern_last_value_y}`);
      production_content = await this.serializer(svg_doc);
      return production_content;
    }
    else{
      return null;
    }

    // self.$emit("update:production_file_obj", self.production_file_obj)
  }

  public async parseFactoryProduct(factory_product : Record<any, any>){
    let default_svg_object = {
      svg : null,
      placement : null,
      width : null,
      height : null,
      scaleX : null,
      scaleY : null,
      rotation:null,
      original_height: null,
    };
    let empty_text = this.getDocFromString(`<g style="transform: rotate(0deg)"></g>`);

    for (let index = 0; index < factory_product.roster_detail.length; index++) {
      let detail = factory_product.roster_detail[index]
      if(detail) {
        if(Object.prototype.hasOwnProperty.call(detail,'svgs')){
          if(Object.prototype.hasOwnProperty.call(detail.svgs,'name') && detail.svgs.name.svg){
            let group_name_svg = await this.getDocFromString(detail.svgs.name.svg);
            let svg_name_text = group_name_svg.querySelector('text');
            if(svg_name_text){
              svg_name_text?.setAttribute('font-size',`${detail.svgs.name.original_height}cm`);
            }
            let tspan_name = svg_name_text? svg_name_text.querySelector('tspan') : null;
            if(tspan_name){
              tspan_name.setAttribute('x','0');
              tspan_name.setAttribute('y','0');
            }
            detail.svgs.name.text_svg = svg_name_text? await this.serializer(svg_name_text) : await this.serializer(empty_text);
          }
          else{
            let svg_object : Record<any,any> = {};
            svg_object['name'] = default_svg_object;
            if(Object.prototype.hasOwnProperty.call(detail.svgs,'number')){
              svg_object['number'] = detail.svgs.number;
            }
            else{
              svg_object['number'] = default_svg_object;
            }
            detail.svgs = svg_object;
            detail.svgs.name.text_svg = await this.serializer(empty_text);
          }
          if(Object.prototype.hasOwnProperty.call(detail.svgs,'number') && detail.svgs.number.svg){
            let group_number_svg = await this.getDocFromString(detail.svgs.number.svg);
            let svg_number_text = group_number_svg.querySelector('text');
            if(svg_number_text){
              svg_number_text?.setAttribute('font-size',`${detail.svgs.number.original_height}cm`);
            }
            let tspan_number = svg_number_text?svg_number_text?.querySelector('tspan') : null;
            if(tspan_number){
              tspan_number?.setAttribute('x','0');
              tspan_number?.setAttribute('y','0');
            }
            detail.svgs.number.text_svg = svg_number_text? await this.serializer(svg_number_text) : await this.serializer(empty_text);
          }
          else{
            let svg_object : Record<any,any> = {};
            svg_object['number'] = default_svg_object;
            if(Object.prototype.hasOwnProperty.call(detail.svgs,'name')){
              svg_object['name'] = detail.svgs.name;
            }
            else{
              svg_object['name'] = default_svg_object;
            }
            svg_object['name'] = detail.svgs.name;
            detail.svgs = svg_object;
            detail.svgs.number.text_svg = await this.serializer(empty_text);
          }
          Object.assign(factory_product.roster_detail[index], detail)
        }
        else {
          let svg_object: Record<any, any> = {};
          svg_object['name'] = default_svg_object;
          svg_object['number'] = default_svg_object;
          detail.svgs = svg_object;
          Object.assign(factory_product.roster_detail[index], detail)
        }
      }
    }
    return factory_product;
  }

  public serializer(svg_doc: SVGTextElement | Document) {
    return new Promise((resolve) => {
      const xml = new XMLSerializer()
      const xml_string = xml.serializeToString(svg_doc)
      resolve(xml_string)
    })
  }

  public applyColorToSVG(factory_product:Record<any,any>, svg_doc:Record<any,any>){
    factory_product.svg_groups.forEach((svg_group_item:Record<any,any>) => {
      $(svg_doc).find(`[id][fill]`).each  (function(doc_item) {
        let doc_elem_id = $(this).attr("id");
        if(doc_elem_id) {
          doc_elem_id = doc_elem_id.search("_") >= 0 ? doc_elem_id.substring(0, doc_elem_id.search("_")) : doc_elem_id
          if(doc_elem_id.toLowerCase() == svg_group_item.id.toLowerCase()) {
            $(this).attr("fill", svg_group_item.color);
          }
        }
      })
    })
  }
  public generateFontFile(font_file:Record<any,any>[]){
    let font_style = document.createElementNS("http://www.w3.org/2000/svg","style");
    for(let font of font_file){
      font_style.innerHTML += ` @font-face{ font-family: ${font.text}; src: url('${font.url}');  }`;
    }
    return font_style;
  }
  public getGroupImageTag(factory_product:Record<any,any>,production_file_info:Record<any,any>,image_side:string){
    let group_image_tag = document.createElementNS("http://www.w3.org/2000/svg","g");
    group_image_tag.setAttribute('transform',`matrix(1 0 0 1 ${parseFloat(production_file_info.width)} ${(image_side === 'front_image')? ((parseFloat(production_file_info.width)/2) + 500) : 0 })`);
    let back_image = document.createElementNS("http://www.w3.org/2000/svg","image");
    back_image.setAttribute('xlink:href',`${factory_product[image_side]}`);
    back_image.setAttribute('height',`${(parseFloat(production_file_info.height)/2)}px`);
    back_image.setAttribute('width',`${(parseFloat(production_file_info.height)/2)}px`);
    group_image_tag.appendChild(back_image);
    return group_image_tag;
  }
  public getSVGPattern(values:Record<any,any>,measurement_ratio:number){
    return `
                <g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 0 ${5000})" style="font-weight: bold;">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">Name </tspan>
                    </text>
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="${1000}" y="0">Number </tspan>
                    </text>
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="${2000}" y="0">Size </tspan>
                    </text>
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="${3000}" y="0">Name Height </tspan>
                    </text>
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="${4000}" y="0">Number Height </tspan>
                    </text>
                </g>
        ${values.map((value:Record<any,any>,index:number) => {
      return `
                <g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 0 ${5000})">
                ${Object.prototype.hasOwnProperty.call(value,'svgs')?
                  `<g transform="matrix(1 0 0 1 0 ${500 + index * 1000})">
                      <g style="transform: rotate(${value.svgs.name.rotation?value.svgs.name.rotation : '0'}deg)">${value.svgs.name.text_svg}</g>
                   </g>`
                :
                  `<g transform="matrix(1 0 0 1 0 ${500 + index * 1000})">
                      <g style="transform: rotate(0deg)"></g>
                   </g>`
                }
                ${Object.prototype.hasOwnProperty.call(value, 'svgs') ?
                  `<g transform="matrix(1 0 0 1 1000 ${500 + index * 1000})" >
                        <g style="transform: rotate(${value.svgs.number.rotation ? value.svgs.number.rotation : '0'}deg)">${value.svgs.number.text_svg}</g>
                    </g>`
                  :
                  `<g transform="matrix(1 0 0 1 1000 ${500 + index * 1000})">
                      <g style="transform: rotate(0deg)"></g>
                   </g>`
                  }
                ${Object.prototype.hasOwnProperty.call(value, 'size') ?
                `<g transform="matrix(1 0 0 1 2000 ${500 + index * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">${value.size ? value.size : ''} </tspan>
                    </text>
                </g>`
                :
                `<g transform="matrix(1 0 0 1 2000 ${500 + index * 1000})">
                        <g style="transform: rotate(0deg)"></g>
                 </g>`
               }
                ${Object.prototype.hasOwnProperty.call(value, 'svgs') ?
                `<g transform="matrix(1 0 0 1 3000 ${500 + index * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">${value.svgs.name.original_height ? value.svgs.name.original_height + 'cm /' + parseFloat(value.svgs.name.original_height / this.INCH_TO_CENTIMETER).toFixed(2) + 'in' : ''} </tspan>
                    </text>
                </g>`
                :
                `<g transform="matrix(1 0 0 1 3000 ${500 + index * 1000})">
                        <g style="transform: rotate(0deg)"></g>
                 </g>`
                }
                ${Object.prototype.hasOwnProperty.call(value, 'svgs') ?
                  `<g transform="matrix(1 0 0 1 4000 ${500 + index * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">${value.svgs.number.original_height? value.svgs.number.original_height + 'cm /' + parseFloat(value.svgs.number.original_height/this.INCH_TO_CENTIMETER).toFixed(2) + 'in' : ''} </tspan>
                    </text>
                </g>`
                  :
                  `<g transform="matrix(1 0 0 1 4000 ${500 + index * 1000})">
                        <g style="transform: rotate(0deg)"></g>
                    </g>`
                }
                ${this.svg_pattern_last_value_y = ((500 + index * 1000) + 5000)}
                </g>`

    })
    }
        `
  }
  async getLogoPattern(values:Record<any,any>,measurement_ratio:string) {
    let svg_group_el = `
        <g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 0 ${this.svg_pattern_last_value_y + 500})" style="font-weight: bold;">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">Logo </tspan>
                    </text>
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="${1000}" y="0">Side </tspan>
                    </text>
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="${2000}" y="0">Size </tspan>
                    </text>
                </g>
       `;
    let index = 0;
    for(let index in values) {
      let value = values[index];
      let original_url = Object.prototype.hasOwnProperty.call(value,'original_logo_url') && value.original_logo_url;
      let updated_url = original_url?value.original_logo_url:value.url;
      let has_base64 = Object.prototype.hasOwnProperty.call(value,'base_64')?true:false;
      if(updated_url !== null && updated_url !== "" && updated_url !== undefined){
        if(getFileExtensionType('raster', updated_url) ){
          if(has_base64){
            svg_group_el += `
                <g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 0 ${this.svg_pattern_last_value_y + 500})">
                <g transform="matrix(1 0 0 1 0 ${250 + index * 1000})">
                    ${updated_url?`<g style="transform: rotate(${value.rotation}deg)"><image xlink:href="${value.base_64}" height="${(value.actualHeight * value.scaleY)/measurement_ratio}px" width="${(value.actualWidth * value.scaleX)/measurement_ratio}px"/></g>`:''}
                </g>
                <g transform="matrix(1 0 0 1 1000 ${500 + index * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">${value.side? value.side : ''} </tspan>
                    </text>
                </g>
                <g transform="matrix(1 0 0 1 2000 ${500 + index * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">${value.originalWidth? value.originalWidth + 'cm x' + value.originalHeight + 'cm /' + parseFloat(value.originalWidth/this.INCH_TO_CENTIMETER).toFixed(2) + 'in x' + parseFloat(value.originalHeight/this.INCH_TO_CENTIMETER).toFixed(2) + 'in' : ''} </tspan>
                    </text>
                </g>
                ${this.logo_pattern_last_value_y = (((500 + index * 1000) + (this.svg_pattern_last_value_y + 500)) + 500 +((value.actualHeight * value.scaleY)/measurement_ratio))}
                </g>`
          }
        } else {
          svg_group_el += `
                <g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 0 ${this.svg_pattern_last_value_y + 500})">
                <g transform="matrix(1 0 0 1 0 ${250 + index * 1000})">
                    ${updated_url?`<g style="transform: rotate(${value.rotation}deg)"><image xlink:href="${this.storage_url}${updated_url}" height="${(value.actualHeight * value.scaleY)/measurement_ratio}px" width="${(value.actualWidth * value.scaleX)/measurement_ratio}px"/></g>`:''}
                </g>
                <g transform="matrix(1 0 0 1 1000 ${500 + index * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">${value.side? value.side : ''} </tspan>
                    </text>
                </g>
                <g transform="matrix(1 0 0 1 2000 ${500 + index * 1000})">
                    <text xml:space="preserve" font-family="gibson-bold-webfont" font-size="95.78" font-style="bold" paint-order="stroke">
                        <tspan x="0" y="0">${value.originalWidth? value.originalWidth + 'cm x' + value.originalHeight + 'cm /' + parseFloat(value.originalWidth/this.INCH_TO_CENTIMETER).toFixed(2) + 'in x' + parseFloat(value.originalHeight/this.INCH_TO_CENTIMETER).toFixed(2) + 'in' : ''} </tspan>
                    </text>
                </g>
                ${this.logo_pattern_last_value_y = (((500 + index * 1000) + (this.svg_pattern_last_value_y + 500)) + 500 +((value.actualHeight * value.scaleY)/measurement_ratio))}
                </g>`
        }
        ++index;
      }
    }
    return svg_group_el;
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
