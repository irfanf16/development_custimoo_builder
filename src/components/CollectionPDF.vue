<template>
  <div v-if="showPdf && collection" class="position-relative">
    <div class="loader" v-if="showLoader"><img src="@assets/images/loading.gif"/></div>
    <div v-if="getCoverImage()" class="pdf_background_container" :ref="'pdf_page_header'">
      <div v-if="!fullWidthCoverImage" class="cover-image-banner" :style="{ width: coverImageDimensions.width + 'px', height: coverImageDimensions.height + 'px' }">
        <img style="height: 100%; width: 100%" :src="`${storageUrl}${getCoverImage()}?q=11`" crossorigin="anonymous">
        <h2 class="collection_title_cover">{{ collection.name }}</h2>
      </div>
      <div v-else-if="fullWidthCoverImage" style="position: absolute; z-index: 99; height: 100%; width: 100%">
        <img style="height: 100%; width: 100%" :src="`${storageUrl}${getCoverImage()}?q=11`" crossorigin="anonymous">
        <h1 style="position: absolute; top: 0; left: 40%; margin: 10px; color: white;">{{ collection.name }}</h1>
      </div>
      <div v-if="collection.collection_products && collection?.collection_products[0]?.product_locker_room.logo_colors !== null"
           style="height: 100%;display: flex;transform: rotate(54.8deg) scale(2.7);">
        <div v-for="(color, index) in getLogoColors()" :key="index"
             :style="{ backgroundColor: color.hex, width: getLogoColors().length === 4 ? '7.5%' : getLogoColors().length === 3? '15%' : 'auto',
            flex: index == 0 || index == getLogoColors().length - 1 ? '1' : null
          }">
        </div>
      </div>
      <div v-else style="height: 100%; display: flex">
        <div style="background-color: silver; flex: 1"></div>
      </div>
    </div>
    <div :ref="'pdf_pages_wrapper'">
      <template v-for="(groupProducts) in groupProductsById()">
        <template v-for="(groupOfFourProducts) in groupProducts">
          <div :ref="'pdf_page'" class="pdf_page" v-if="groupOfFourProducts">
            <div class="pdf_page_header pt-5 px-4">
              <h1 class="header_left" style="width: 70%; text-align: left;">
                {{ groupOfFourProducts[0].product_locker_room.product.sku.sku_id }}
              </h1>
              <div class="pdf_headers_logos">
                <div v-for="(logo, idx) in collection.logos" :key="idx">
                  <img style="max-height: 100px; width: auto; height: auto" :src="`${storageUrl}${logo.path}?q=133`"
                       crossorigin="anonymous" alt=""/>
                </div>
              </div>
            </div>
            <div style="display: flex">
              <div style="max-width: 30%" class="px-4">
                <div style="display: flex; flex-direction: column; gap: 20px; margin-top: 5%;">
                  <div>
                    <h3 style="text-align: start; width: 100%">Technical Details:</h3>
                    <p v-html="groupOfFourProducts[0].product_locker_room.product.sku.description"
                       style="text-align: start"></p>
                  </div>
                  <div>
                    <h3 style="text-align: start">Size Guide:</h3>
                    <div style="column-count: 2" v-if="groupOfFourProducts[0]?.product_locker_room.product.sizes?.length > 0">
                      <p v-for="(size, index) in groupOfFourProducts[0].product_locker_room.product.sizes[0]?.json_data"
                         :key="index" style="text-align: start">
                        {{ size.name }}
                      </p>
                    </div>
                    <div v-else>
                      <p style="text-align: start">No sizes available</p>
                    </div>
                  </div>
                </div>
              </div>
              <div
                style="max-width: 80%; display: grid; grid-template-rows: repeat(2, minmax(0, 1fr)); grid-template-columns: repeat(2, minmax(0, 1fr));">
                <div v-for="(collection_product, idxs) in groupOfFourProducts" :key="idxs" class="product_page pt-3">
                  <div style="font-family: sans-serif;">
                    <b-container>
                      <b-row>
                        <b-col style="padding: 0 !important;">
                          <div class="position-relative overflow-hidden download-design">
                            <img
                              :src="`${storageUrl+collection_product.product_locker_room.locker_product_images_folder}/front.png?q=${collection_product.product_locker_room.random_string + '33'}`"
                              alt="" crossorigin="anonymous"/>
                          </div>
                        </b-col>
                        <b-col style="padding: 0 !important;">
                          <div v-if="collection_product.product_locker_room.design?.back_design_id" class="position-relative overflow-hidden download-design">
                            <img
                              :src="`${storageUrl+collection_product.product_locker_room.locker_product_images_folder}/back.png?q=${collection_product.product_locker_room.random_string + '1'}`"
                              crossorigin="anonymous" alt=""/>
                          </div>
                        </b-col>
                      </b-row>
                      <template
                        v-if="collection_product.product_locker_room && collection_product.product_locker_room.model_description">
                        <div v-if="collection_product.allow_description &&
                             (collection_product.product_locker_room.model_description.product_model_description ||
                              collection_product.product_locker_room.model_description.product_model_description != '')"
                             class="pdf_description">
                          <strong>Product Info: </strong>
                          <template
                            v-if="collection_product.product_locker_room.model_description.product_model_description">
                            <span
                              v-html="collection_product.product_locker_room.model_description.product_model_description"></span>
                          </template>
                        </div>
                      </template>
                      <div class="pdf_nickname border-0" v-if="collection_product.product_nickname">
                        <strong>Product Nickname: </strong>
                        {{ collection_product.product_nickname }}
                      </div>
                      <div v-if="collection_product.product_note != ''" class="pdf_description border-0">
                        <strong>Description: </strong>
                        {{ collection_product.product_note }}
                      </div>
                      <div class="pdf_price border-0" v-if="collection_product.product_price">
                        <strong>Price: </strong>
                        {{ collection_product.product_price }}
                      </div>
                    </b-container>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';
import CollectionViewPDF from "@/views/CollectionViewPDF.vue";
import html2pdf from 'html2pdf.js'

@Component<CollectionPDF>({
})

export default class CollectionPDF extends Vue {
  @Prop({required: true}) collection: Record<any, any>;
  public storageUrl = process.env.VUE_APP_STORAGE_URL;
  public fullWidthCoverImage = false;
  public coverImageDimensions = {width: null, height: null}
  public showLoader = false
  public showPdf = false

  get collectionImageMerchant() {
    if (this.isJSONString(this.$store.getters.getSetting('collection_image_merchant'))) {
      return JSON.parse(this.$store.getters.getSetting('collection_image_merchant'))
    } else {
      return this.$store.getters.getSetting('collection_image_merchant')
    }
  }

  get collectionImageAdmin() {
    if (this.isJSONString(this.$store.getters.getSetting('collection_image_admin'))) {
      return JSON.parse(this.$store.getters.getSetting('collection_image_admin'))
    } else {
      return this.$store.getters.getSetting('collection_image_admin')
    }
  }

  get mobileScreen(): boolean {
    return this.$store.getters.getManageComponents.mobileScreen
  }

  get iPad(): boolean {
    return this.$store.getters.getManageComponents.iPad
  }

  public generateCollectionPDF() {
    this.showLoader = true;
    this.showPdf = true;
    let scale = 4
    let page_size = 8
    if(this.mobileScreen || this.iPad) {
      scale = 1
      page_size = 2
    }
    const options = {
      margin: [0, 0, 0, 0],
      filename: this.collection.name + '.pdf',
      image: {
        type: "jpeg",
        quality: 1.0,
      },
      html2canvas: {
        scale: scale,
        dpi: 192,
        allowTaint: true,
        useCORS: true,
        letterRendering: true,
        svgRendering: true
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "landscape",
        compress: true,
      },
    }
    setTimeout(() => {
      const pages = this.$refs.pdf_page as (Element | Vue)[];
      const pdf_pages_wrapper = this.$refs.pdf_pages_wrapper as Element;

      (async () => {
        let doc = html2pdf().set(options).from(this.$refs.pdf_page_header).toPdf();

        for (let n = 0; n < pages.length; n += page_size) {
          const fourth_page = n + (page_size - 1);
          const four_pages = pdf_pages_wrapper.querySelectorAll(`.pdf_page:nth-child(n+${n}):nth-child(-n+${fourth_page})`);

          const container = document.createElement('div');

          four_pages.forEach(page => {
            container.appendChild(page.cloneNode(true));
          });

          await doc.get('pdf').then(
            pdf => {
              pdf.addPage();
            }
          ).from(container).toContainer().toCanvas().toPdf();
        }

        await doc.save();
      })()
        .then(() => {
          this.showLoader = false;
          this.showPdf = false;
        })
        .catch(error => {
          // Handle any errors
          console.error('Error generating PDF:', error);
        });
    })
  }

  public getLogoColors() {
    return this.collection ? JSON.parse(this.collection.collection_products[0]?.product_locker_room.logo_colors) : []
  }

  public groupProductsById() {
    const collectionProducts = this.collection.collection_products;

    let groupedByProductId = {};
    let groupKeys = {}
    let key = 0
    collectionProducts?.forEach((product: Record<any, any>) => {
      if(!groupKeys[product.product_locker_room.product_id]) {
        groupKeys[product.product_locker_room.product_id] = JSON.stringify(key)
        key++
      }
      if(!groupedByProductId[groupKeys[product.product_locker_room.product_id]]) {
        groupedByProductId[groupKeys[product.product_locker_room.product_id]] = []
      }
      groupedByProductId[groupKeys[product.product_locker_room.product_id]].push(product)
    })

    const chunkedProducts: Array<Array<any>> = [];
    for (const productId in groupedByProductId) {
      const products = groupedByProductId[productId];
      const chunked: Array<Array<any>> = [];
      for (let i = 0; i < products.length; i += 4) {
        chunked.push(products.slice(i, i + 4));
      }
      chunkedProducts[productId] = chunked;
    }
    return chunkedProducts;
  }

  public getCoverImage() {
    if (this.collectionImageMerchant && this.collectionImageAdmin) {
      if (!this.collectionImageMerchant?.is_custom_collection) {
        const index = this.collectionImageMerchant?.selection_index;
        if (!this.collectionImageAdmin[index]?.full_width) {
          this.fullWidthCoverImage = false
          this.coverImageDimensions.width = this.collectionImageAdmin[index]?.dimension.width;
          this.coverImageDimensions.height = this.collectionImageAdmin[index]?.dimension.height;
        } else {
          this.fullWidthCoverImage = true
        }
        return this.collectionImageAdmin[index]?.img_url
      } else {
        if (!this.collectionImageMerchant.collection[0].full_width) {
          this.fullWidthCoverImage = false
          this.coverImageDimensions.width = this.collectionImageMerchant.collection[0].dimension.width;
          this.coverImageDimensions.height = this.collectionImageMerchant.collection[0].dimension.height;
        } else {
          this.fullWidthCoverImage = true
        }
        return this.collectionImageMerchant?.collection[0].img_url
      }
    }
  }

  isJSONString(str) {
    try {
      JSON.parse(str);
      return true;
    } catch (error) {
      return false;
    }
  }
}
</script>

<style lang="css" scoped src="@assets/css/collectionPdf.css"></style>
