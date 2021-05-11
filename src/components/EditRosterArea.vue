<template>
  <div>
    <b-button class="d-none d-lg-block" v-b-modal.modal-scrollable>Edit Roster</b-button>

    <b-modal id="modal-scrollable" scrollable title="Roster" content-class="roster-modal" size="xl"
             footer-class="hide-modal-footer d-none d-lg-block">
      <div class="d-flex flex-wrap justify-content-between">
        <RosterDetails :productSizes="sizeOptions" @addPlayer="rosterDetailsInit"/>
        <div class="roster-preview-area">
          <div class="roster-template-area">
            <button class="btn btn-secondary fw-bold">Download Roster Template <a href="#" v-b-tooltip.hover
                                                                                  title="Enter roster in excel file">
              <font-awesome-icon :icon="['fas', 'info-circle']"/>
            </a></button>
            <button class="btn btn-secondary fw-bold">Upload Roster Template <a href="#" v-b-tooltip.hover
                                                                                title="Upload the template here to populate the roster">
              <font-awesome-icon :icon="['fas', 'info-circle']"/>
            </a></button>
          </div>
          <CustomizationPreview :designs="products[designsIndex]"/>
          <OrderDetails/>
        </div>
      </div>
    </b-modal>
    <div class="d-lg-none">
      <RosterDetails :productSizes="productSizes"/>
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

@Component<EditRosterArea>({
  components: {
    CustomizationPreview,
    OrderDetails,
    RosterDetails
  },
  mounted() {
    this.setProductSizes()
    this.$nextTick(() => {
      this.rosterDetailsInit()
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

  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails
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
      number: 0,
      size: this.sizeOptions[0].value ? this.sizeOptions[0].value : '',
      quantity: 0
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
}

</script>
