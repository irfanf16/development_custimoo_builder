<template>
  <div class="d-none">
    <div id="collectionPdfContainer">
      <div class="pdf_cover">
        <div class="pdf_collection">
          <h1>{{ collectionData.name }}</h1>
        </div>

        <div class="logo">
          <img src="../assets/logo.png" alt="Logo">
        </div>
      </div>

      <template v-if="collectionData && collectionData.collection_products.length">
        <template v-for="(products, index)  in collectionData.collection_products">
          <div class="pdf_page" :key="index">
            <table class="print-table">
              <tbody>
              <tr>
                <td colspan="3" class="pdf_collection">
                  <h1>{{ collectionData.name }}</h1>
                </td>
              </tr>
              <tr>
                <td v-for="(product, i) in products" :key="index+''+i">
                  <div v-if="product.allow_title && product.product_locker_room.model_description" style="font-weight: 600; font-size: larger">
                    {{ product.product_locker_room.model_description.model_name }}
                  </div>
                  <div v-else style="opacity: 0">N /A</div>

                  <div v-if="product.product_nickname != ''">
                    {{ product.product_nickname }}
                  </div>
                  <div v-else style="opacity: 0">N /A</div>
                  <div class="image-holder" id="both-svg" style="text-align: center;">
                    <Scene v-if="product.product_locker_room.design.back_design" :measurement-ratio="product.product_locker_room.design.measurement_ratio" :productType="product.product_locker_room.product_type" :colorGrouping="JSON.parse(product.product_locker_room.design.front_design.color_group)"
                           :front="{textureUrl: storageUrl+product.product_locker_room.design.front_design.file_url, modelUrl: product.product_locker_room.style.front ? storageUrl+product.product_locker_room.style.front.file_url : ''}"
                           :back="{textureUrl: product.product_locker_room.design.back_design ? storageUrl+product.product_locker_room.design.back_design.file_url: '', modelUrl: product.product_locker_room.style.back ? storageUrl+product.product_locker_room.style.back.file_url : ''}"
                           :lockerDefaultColors="JSON.parse(product.product_locker_room.defaultcolors)" :lockerGroupColors="JSON.parse(product.product_locker_room.groupcolors)" :logos="product.product_locker_room.style.logo.concat(JSON.parse(product.product_locker_room.custom_logos))"
                           :productNamesSetting="product.product_locker_room.productnames" :canvasSelection="false" :canvasWidth="170" :canvasHeight="200" :preSetData="true" />
                    <Scene v-else class="view-back" :measurement-ratio="product.product_locker_room.design.measurement_ratio" :productType="product.product_locker_room.product_type" :colorGrouping="JSON.parse(product.product_locker_room.design.front_design.color_group)"
                           :front="{textureUrl: storageUrl+product.product_locker_room.design.front_design.file_url, modelUrl: product.product_locker_room.style.front ? storageUrl+product.product_locker_room.style.front.file_url : ''}"
                           :lockerDefaultColors="JSON.parse(product.product_locker_room.defaultcolors)" :lockerGroupColors="JSON.parse(product.product_locker_room.groupcolors)"
                           :logos="product.product_locker_room.style.logo.concat(JSON.parse(product.product_locker_room.custom_logos))"
                           :productNamesSetting="product.product_locker_room.productnames" :canvasSelection="false" :canvasWidth="170" :canvasHeight="200" :preSetData="true" />
                  </div>

                  <div class="pdf_description" v-if="product.product_locker_room.model_description   && product.allow_description" v-html="'<strong>Product Info: </strong>'+ product.product_locker_room.model_description.product_model_description"></div>
                  <div class="pdf_description" v-if="product.product_note != ''" v-html="'<strong>Description: </strong>'+ product.product_note"></div>
                  <div class="pdf_price" v-if="product.product_price != '' && product.allow_price" v-html="'<strong>Price: </strong>'+ product.product_price"></div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>
<script lang="ts">

import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import Scene from "@/components/Scene.vue";
import CustomizationPreview from '@/components/CustomizationPreview.vue'

@Component<DesignCollectionPdfView>({
  components: {
    Scene, CustomizationPreview
  },
})

export default class DesignCollectionPdfView extends Vue {
  mounted() {
    console.log("mountedsss", this.collectionData);
  }
  @Prop({required: false, default: true}) readonly canvasSelection!: boolean;
  @Prop({required: true}) collectionData!: Record<any, any>

  private storageUrl = process.env.VUE_APP_STORAGE_URL

  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }
  get styleIndex():number{
    return  this.$store.getters.getCurrentStyleIndex;
  }

}
</script>

<style scoped>
@page{
  margin: 0 !important;
  padding: 0 !important;
  size: letter landscape;
}

.pdf_cover{
  position: relative;
  background: url('../assets/pdf_cover.jpg') no-repeat center;
  background-size: cover !important;
  width: 11in;
  height: 8.499in;
  page-break-before: avoid !important;
  page-break-after: avoid !important;
}

.pdf_cover .pdf_collection h1{
  color: #fff;
  text-shadow: 0 0 10px rgba(0,0,0,0.5);
}

.pdf_page{
  background-size: cover !important;
  width: 11in;
  height: 8.499in;
  background: url("../assets/page_background.png") no-repeat center;
  /*page-break-after: always !important;*/
  /*page-break-inside: avoid !important;*/
  page-break-after: avoid !important;
}


.pdf_page .print-table{
  border: none;
  color: #121212;
  table-layout: fixed;
  width: 100%;
}
.pdf_page .print-table td{
  width: 33.33333333%;
}

.pdf_page .print-table tr:first-child td{
  padding-bottom: 0.3in;
}
.pdf_page .print-table tr,
.pdf_page .print-table td{
  background: none;
  border: none;
  text-align: center;
}

.pdf_page .print-table td:nth-child(2){
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
}

.pdf_collection h1{
  font-size: 0.3in;
  text-align: center;
  padding-top: 0.35in;
  color: #121212;
  font-weight: 600;
}

.pdf_page .pdf_description,
.pdf_page .pdf_price{
  padding: 0.1in;
  border-radius: 5pt;
  border: 1px solid #999;
  text-align: center;
  margin-top: 0.1in;
  color: #333;
}

.pdf_page .pdf_description{
  text-align: left;
}

.logo{
  padding: 0.1in 0 0 0.45in;
}
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
  page-break-inside: avoid !important;
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

.loader {
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
  z-index: 9999;

img {
  max-width: 7%;
  display: block;
  margin: 0 auto;
  height: auto;
}

}

</style>
