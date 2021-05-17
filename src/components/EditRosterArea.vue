<template>
  <div>
    <b-button class="d-none d-lg-block" v-b-modal.modal-scrollable>Edit Roster</b-button>

    <b-modal id="modal-scrollable" scrollable title="Roster" content-class="roster-modal" size="xl"
             footer-class="hide-modal-footer d-none">
      <div class="d-flex flex-wrap justify-content-between">
        <RosterDetails :productSizes="sizeOptions" @addPlayer="rosterDetailsInit"/>
        <div class="roster-preview-area">
          <div class="roster-template-area">
            <button class="btn btn-secondary fw-bold">Download Roster Template <a href="#" v-b-tooltip.hover
                                                                                  title="Enter roster in excel file">
              <font-awesome-icon :icon="['fas', 'info-circle']"/>
            </a></button>

            <button type="upload" name="Upload Template"  @change="onChange"  class="btn btn-secondary fw-bold" accept="image/x-png,image/jpeg,pdf">Upload Roster Template
              <b-form-file  class="mb-2"></b-form-file>
              <a href="#" v-b-tooltip.hover title="Upload the template here to populate the roster">
              <font-awesome-icon :icon="['fas', 'info-circle']"/>
            </a></button>
          </div>
          <template v-for="design in selectedProduct.productstyles[styleIndex].productdesigns">
            <div v-if="design.design_show == 1" class="image-holder" :key="'front'+design.id">
              <Scene v-if="selectedProduct.productstyles[styleIndex].back" :canvas-width="300" :canvas-height="360"
                     :front="{textureUrl: apiBaseUrl+'/'+ design.front_design.file_url, modelUrl: apiBaseUrl+'/'+ selectedProduct.productstyles[styleIndex].front.file_url}"
                     :back="{textureUrl: apiBaseUrl+'/'+ design.back_design.file_url, modelUrl: apiBaseUrl+'/'+ selectedProduct.productstyles[styleIndex].back.file_url}"
                     :logos="selectedProduct.productstyles[styleIndex].logo"
                     :productColors="selectedProduct.colors"  />

              <Scene v-else class="view-back" :canvas-width="300" :canvas-height="360"
                     :front="{textureUrl: apiBaseUrl+'/'+ design.front_design.file_url, modelUrl: apiBaseUrl+'/'+ selectedProduct.productstyles[styleIndex].front.file_url}"
                     :logos="selectedProduct.productstyles[styleIndex].logo"
                      :productColors="selectedProduct.colors"  />
            </div>
          </template>
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
  public fileData: Record<any, any>[] = []
  public apiBaseUrl =  process.env.VUE_APP_API_BASE_URL

  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails
  }
  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }
  get styleIndex():number{
    return  this.$store.getters.getCurrentStyleIndex;
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
      quantity: 1,
      information:''
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
  public getOccurence(val:string){
    let count = (val.match(/\*/g) || []).length;
    return count
  }
  public onChange(event){
    let status = true;
    let files = event.target.files ? event.target.files[0] : null;
    readXlsxFile(files).then((rows) => {
      if (rows[0].length != 5){
        alert("please upload valid file")
        return false
      }
      for (let i in rows[0]){
        if (i == 1){
          let count = this.getOccurence(rows[0][i]);
          if (count != 1 || rows[0][i] != "SIZE*"){
            status = false
            break;
          }
        }
        if (i == 2){
          let count = this.getOccurence(rows[0][i]);
          if (count != 2 || rows[0][i] != "NAME ON PRODUCT**"){
            status = false
            break;
          }
        }
        if (i == 4){
          let count = this.getOccurence(rows[0][i]);
          if (count != 3 || rows[0][i] != "OTHER INFORMATION***"){
            status = false
            break;
          }
        }
      }
      if (status == true) {
        rows.forEach((item, index) => {
          let obj = {
            text: '',
            number: '',
            size: '',
            quantity: 1,
            information: ''
          };
          if (index > 0) {
            for (let i in item) {
              if (i == 1) {
                obj.size   = item[i];
              }
              if (i == 2) {
                obj.text = item[i];
              }
              if (i == 3) {
                obj.number = item[i];
              }
              if (i == 4) {
                obj.information = item[i];
              }
            }
            this.fileData.push(obj);
          }
        })
        this.$store.dispatch('updateRoster', this.fileData);
      }else{
        alert("please upload a valid file");
      }
    })
  }
}

</script>
