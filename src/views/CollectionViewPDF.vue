<template>
  <div>
    <div class="loader" v-if="showLoader"><img src="../../src/assets/images/loading.gif"/></div>
    <embed v-bind:src="pdf_path" width="800px" height="2100px"/>
  </div>

</template>

<script lang="ts">
import {Component, Mixins, Vue} from 'vue-property-decorator'
import {http} from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";


@Component<CollectionViewPDF>({
  components: {},
  mounted() {
    this.getCollectionPDF()
  }
})

export default class CollectionViewPDF extends Mixins(ErrorMessages) {

  public showLoader = false
  public storageUrl = process.env.VUE_APP_STORAGE_URL
  public pdf_path = ''

  getCollectionPDF(): void {
    this.showLoader = true
    const collection_name = this.$route.params.collection_name;
    if (collection_name) {
      let param = `get/collection/pdf?collection_name=${collection_name}&storage_url=${this.storageUrl}`
      http.get(param)
        .then((response: any) => {
          this.pdf_path = response.data.data
          this.showLoader = false
        })
        .catch((e: any) => {
          this.showLoader = false
          this.showError(e.response.data.message)
          this.$router.push('/')
        });
    } else {
      const error = 'Invalid Link'
      this.showError(error)
      setTimeout(() => {
        this.$router.push('/')
      }, 1000)
    }
  }

}
</script>

<style lang="scss" scoped>
.order-details-holder {
  h1 {
    font-size: 24px;
    font-weight: 700;
    @media only screen and (min-width: 1024px) {
      font-size: 30px;
    }
  }

  .header-buttons {
    .btn {
      margin-right: 10px;
      color: #000;
      font-size: 0.8rem;
      @media only screen and (min-width: 768px) {
        font-size: 1rem;
        margin-right: 15px;
      }

      &:hover {
        background: #219F84;
        color: #fff;
        border-color: #219F84;
      }
    }
  }

  .roster-preview-area {
    flex: 0 0 100%;
    max-width: 100%;
  }

}
</style>
