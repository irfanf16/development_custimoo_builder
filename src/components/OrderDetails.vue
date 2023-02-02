<template>
  <div>
    <div class="loader" v-if="showLoader"><img src="@assets/images/loading.gif" /></div>

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
              <b-button v-if="isCustomerAuthenticated" variant="outline-secondary" @click="getLockers">Share {{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'roster' }} url</b-button>
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
import AddLockerRoomModal from "@/components/AddLockerRoomModal.vue";
import ErrorMessages from "@/mixins/ErrorMessages";
import ProductionScene from '@/components/ProductionScene.vue'
import { unitConversion } from '@/helpers/Helpers'

type DOMParserSupportedType = "application/xhtml+xml" | "application/xml" | "image/svg+xml" | "text/html" | "text/xml";

@Component<OrderDetails>({
  components: {
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
  public ref = this.$refs as Record<any, any>
  public shared_url = ""
  public production_file_obj = { url: null, content: null }
  public showLoader = false

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
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

  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  public buyNow() {
    this.$router.push('/confirm-order')
  }

  get customLogos(): [Record<any, any>] {
    return this.$store.getters.getCustomLogos().filter((custom_logo:any) => !(custom_logo == null || custom_logo.url == ""));
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts()
  }

  get svgGroups(): [Record<any, any>] {
    return this.$store.getters.getSvgGroups
  }

  get editStatus():boolean{
    return  this.$store.getters.getEditStatus
  }
  get company(): Record<any, any>{
    return this.$store.getters.getCompany
  }

  public async getLockers() {
    if (!this.editStatus){
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
      this.showToast('Shareable link was copied to your clipboard.', 'success');
    } catch (err) {
      alert('Oops, unable to copy');
    }
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
