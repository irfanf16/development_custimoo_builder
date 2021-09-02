<template>
  <div>
    <div class="loader" v-if="showLoader"><img src="../../src/assets/images/loading.gif"/></div>
    <div v-if="collection">
      <div id="collectionPdfContainer">
        <div class="pdf_cover">
          <div class="pdf_collection">
            <h1>{{collection.name}}</h1>
          </div>

          <div class="logo">
            <img src="../../src/assets/logo.png" alt="Logo">
          </div>
        </div>

        <div class="pdf_page">
          <table class="print-table">
            <tbody>
            <tr>
              <td colspan="3" class="pdf_collection">
                <h1>{{ collection.name }} </h1>
              </td>
            </tr>
            <tr v-for="(products_chunks,idx)  in collection.collection_products" :key="idx">
              <td v-for="(collection_product, idxs) in products_chunks" :key="idxs">
                <template v-if="collection_product.allow_title && collection_product.product_locker_room && collection_product.product_locker_room.model_description">
                  <div style="font-weight: 600; font-size: larger; word-wrap: break-word" v-html="collection_product.product_locker_room.model_description.model_name">
                  </div>
                </template>
                <template v-else="">
                  <div style="font-weight: 600; font-size: larger; word-wrap: break-word; opacity: 0" >
                    N/A
                  </div>
                </template>

                <div style="word-wrap: break-word">
                  {{collection_product.product_locker_room ? collection_product.product_locker_room.product_name : '' }}
                </div>
                <div>
                  <table class="images-holder">
                    <tbody>
                    <tr>
                      <td><img :src="`${collection_product.product_locker_room.locker_product_images_folder}/front.png`" alt=""></td>
                      <td><img :src="`${collection_product.product_locker_room.locker_product_images_folder}/back.png`" alt=""></td>
                    </tr>
                    </tbody>
                  </table>
                </div>

                <div class="pdf_description" v-if="collection_product.allow_description">
                  <strong>Product Info: </strong>
                  <span v-html="collection_product.product_locker_room.model_description.product_model_description"></span>
                </div>
                <div class="pdf_description"><strong>Description: </strong>
                  {{ collection_product.product_note }}
                </div>
                <div class="pdf_price" v-if="collection_product.allow_price && collection_product.product_price"><strong>Price: </strong>
                  {{collection_product.product_price}}
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

</template>

<script lang="ts">
import {Component, Mixins, Vue} from 'vue-property-decorator'
import {http} from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";



@Component<CollectionViewPDF>({
  components: {},
  mounted() {
    this.getCollection()
  }
})

export default class CollectionViewPDF extends Mixins(ErrorMessages) {

  public showLoader = false
  public storageUrl = process.env.VUE_APP_STORAGE_URL
  public collection = null;

  getCollection(): void {
    this.showLoader = true
    const collection_id = this.$route.params.collection_id;
    http.get(`/collection/${collection_id}/view`).then((response: any) => {
        this.collection = response.data.result.collection
        this.showLoader = false
      })
      .catch((e: any) => {
        this.showLoader = false
        this.showError(e.response.data.message)
        this.$router.push('/')
      });
  }

}
</script>

<style lang="css" scoped>
@import url("../assets/css/collectionPdf.css");
</style>
