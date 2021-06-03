<template>
  <div>
    <b-button class="d-none d-lg-block" v-b-modal.modal-scrollable>Edit Roster</b-button>

    <b-modal id="modal-scrollable" scrollable title="Roster" content-class="roster-modal" size="xl"
             footer-class="hide-modal-footer d-none">
      <div class="d-flex flex-wrap justify-content-between">
        <RosterDetails :productSizes="sizeOptions" @addPlayer="rosterDetailsInit"/>
        <div class="roster-preview-area">
          <CustomizationPreview :designs="products[designsIndex]"/>
          <OrderDetails/>
        </div>
      </div>
    </b-modal>

    <div class="d-lg-none">
      <RosterDetails @addPlayer="rosterDetailsInit" :productSizes="productSizes"/>
    </div>
    <div class="team-order-details">
      <OrderDetails/>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import CustomizationPreview from '@/components/CustomizationPreview.vue'
import OrderDetails from '@/components/OrderDetails.vue'
import RosterDetails from '@/components/RosterDetails.vue'
import {http} from "@/httpCommon";
import readXlsxFile from "read-excel-file";
import Scene from "@/components/Scene.vue"


@Component<EditRosterArea>({
  components: {
    CustomizationPreview,
    OrderDetails,
    RosterDetails,
    Scene
  },
  mounted() {
    this.setProductSizes()
    this.$nextTick(() => {
      if (!this.rosterDetails.length) {
        this.rosterDetailsInit()
      }
    })
  }
})

export default class EditRosterArea extends Vue {
  @Prop({required: true}) productSizes!: any
  private products: any[] = []
  private company_id !: string
  private product_id !: string
  public designsIndex = 0
  public sizeOptions: Record<any, any>[] = []
  public fileData: Record<any, any>[] = []
  public apiBaseUrl = process.env.VUE_APP_API_BASE_URL

  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails
  }

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get styleIndex(): number {
    return this.$store.getters.getCurrentStyleIndex;
  }

  retrieveProducts(): void {
    this.product_id = '1'
    this.company_id = '1'
    let param = '?product_id=' + this.product_id + '&company_id=' + this.company_id
    http.get(param)
      .then((response: any) => {
        this.products = response.data.products.data;
      })
      .catch((e: any) => {
        console.log(e)
      });
  }

  public rosterDetailsInit() {
    let payload = {
      text: '',
      number: null,
      size: this.sizeOptions[0].value ? this.sizeOptions[0].value : '',
      quantity: 1,
      information: ''
    }
    this.$store.dispatch('setRosterDetails', {index: this.rosterDetails.length, roster: payload})
  }

  public setProductSizes() {
    this.productSizes.forEach((size: any, key: number) => {
      let sizes = {value: size.name, text: size.name}
      this.sizeOptions = this.sizeOptions.concat([sizes])
    })
  }

  public changeProduct(designsIndex: number) {
    this.designsIndex = designsIndex
  }

  public getOccurence(val: string) {
    let count = (val.match(/\*/g) || []).length;
    return count
  }


}

</script>


