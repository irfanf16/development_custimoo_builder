<template>
  <modal name="add-designs-to-locker-room"
         :width="screenWidth"
         :resizable="true"
         :scrollable="true"
         height="auto"
         :reset="true"
         @opened="handleModalOpenEvent"
         :shiftY="0"
         :clickToClose="false"
         class="absolute-modals"
         id="modal-center-addlockerroom" hide-footer centered size="xl" modal-class="add_locker"
         content-class="lockerroom-modal">
    <div class="modal-header d-flex justify-content-between">
      <span class="fs-5 font-weight-bold">Save your design <span
        v-if="$store.getters.getIsShareDesign">before sharing</span></span>
      <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="handleModalCloseEvent"><BIconX/></span>
    </div>
    <div class="p-4">
      <div class="lockerroom-header">
        <div class="locker-opener w-100 theme-scroll-h" style="max-width: 100%; overflow-x: auto">
          <b-button style="white-space: nowrap" v-for="(locker, index) in lockers" :key="index" variant="secondary"
                    @click="showButton(locker.id, index)" v-bind:class="tabIndex === index ? 'active' : '' ">
            {{ locker.room_name }}
            <a class="remove" @click="deleteRoom(locker.id, index)">
            <font-awesome-icon :icon="['fas', 'trash-alt']"/>
          </a>
          </b-button>
          <span class="btn btn-secondary light add_new_locker_btn" style="white-space: nowrap"
                @click="showVModal('create-modal')">
            Add <BIconPlus/>
          </span>
        </div>
        <CreateLockerRoomModal @lockerAdded="lockerAdded"/>
      </div>

      <div class="batch-locker-scene-container container-fluid my-2">
        <div class="row justify-content-center justify-content-md-start">
          <template v-for="(design, designIndex) in productSelectedDesignsData">
            <div class="col-10 col-sm-8 col-md-6 col-lg-4 mb-5" :key="`bulk-save-products-${designIndex}`">
              <div class="batch-locker-design-wrapper">
                <div class="batch-locker-scene-wrapper my-2">
                  <Scene v-if="design.back_design" :measurement-ratio="selectedProduct.measurement_ratio"
                         :ref="`product-selected-design-${designIndex}-ref`" :key="`product-selected-design-${designIndex}`"
                         :front="{
                                      textureUrl: storageUrl+design.front_design.file_base_url, file_extension:design.front_design.file_extension,
                                      safe_zone_url: design.frontsafezone_design? storageUrl+design.frontsafezone_design.file_url : '',
                                      boundary_url: design.frontboundary_design? storageUrl+design.frontboundary_design.file_url : '',
                                      models: selectedProduct.productstyles[styleIndex].front_models
                                   }"
                         :back="{
                                      textureUrl: storageUrl+design.back_design.file_base_url, file_extension:design.back_design.file_extension,
                                      safe_zone_url: design.backsafezone_design? storageUrl+design.backsafezone_design.file_url : '',
                                      boundary_url: design.backboundary_design? storageUrl+design.backboundary_design.file_url : '',
                                      models: selectedProduct.productstyles[styleIndex].back_models
                                   }"
                         :logos="selectedProduct.productstyles[styleIndex].logo" :logosSettings="selectedProduct.logos_setting"
                         :logoAllowed="Boolean(selectedProduct.is_logo_allowed)" :logosLimit="selectedProduct.allowed_logos_count"
                         :productNamesSetting="selectedProduct.productnames" :productColors="selectedProduct.colors"
                         :colorGrouping="JSON.parse(design.front_design.color_group)" :productType="selectedProduct.product_type"
                         :product_id="selectedProduct.id" :product_index="selectedProductIndex" :products_fonts="products_fonts"
                         :design_id="design.id"
                  />
                  <Scene  v-else class="view-back" :measurement-ratio="selectedProduct.measurement_ratio"
                          :ref="`product-selected-design-${designIndex}-ref`" :key="`product-selected-design-${designIndex}`"
                          :front="{
                                      textureUrl: storageUrl+design.front_design.file_base_url, file_extension:design.front_design.file_extension,
                                      safe_zone_url: design.frontsafezone_design? storageUrl+design.frontsafezone_design.file_url : '',
                                      boundary_url: design.frontboundary_design? storageUrl+design.frontboundary_design.file_url : '',
                                      models: selectedProduct.productstyles[styleIndex].front_models
                                   }"
                          :logos="selectedProduct.productstyles[styleIndex].logo" :logosSettings="selectedProduct.logos_setting"
                          :logoAllowed="Boolean(selectedProduct.is_logo_allowed)"
                          :logosLimit="selectedProduct.allowed_logos_count" :productNamesSetting="selectedProduct.productnames"
                          :productColors="selectedProduct.colors"
                          :colorGrouping="JSON.parse(design.front_design.color_group)" :productType="selectedProduct.product_type"
                          :product_id="selectedProduct.id" :product_index="selectedProductIndex" :products_fonts="products_fonts"
                          :design_id="design.id"
                  />
                </div>
                <div class="d-flex justify-content-center align-items-center my-2">
                  <b-input-group style="width: 300px">
                    <b-form-input id="inline-form-input-productname" v-model="design.suggested_product_name" :key="`product-selected-design-${designIndex}-input`"  placeholder="Product Name"></b-form-input>
                  </b-input-group>
                </div>
              </div>

            </div>


          </template>
        </div>
      </div>
      <confirm-modal name="confirm-locker-modal" message="Do you really want to exit without saving the changes"
                     cancel_text="No" confirm_text="Yes" ref="confirm-locker-modal"></confirm-modal>

      <div class="loader" v-if="showLoader"><img src="@assets/images/loading.gif"/></div>
    </div>
    <div class="modal-footer">
      <div class="d-flex align-items-center justify-content-end w-100 gap-1">

        <b-button v-if="!loadingLocker" variant="secondary" @click="saveDesignsToLockerRoom">Save To Locker Room</b-button>
        <b-button v-else class="mx-2 px-5" variant="secondary" :disabled="true">
          <img width="20" height="20" src="@assets/images/loading.gif"/>
        </b-button>
      </div>
    </div>
  </modal>
</template>
<script lang="ts">
import {Component, Mixins, Prop, Vue, Watch} from 'vue-property-decorator'
import CreateLockerRoomModal from '@/components/CreateLockerRoomModal.vue'
import ErrorMessages from "@/mixins/ErrorMessages";
import ConfirmModal from "@/components/ConfirmModal.vue";
import LockerRoom from "@/components/LockerRoom.vue";
import ModalAction from "@/mixins/ModalAction";
import Scene from "@/components/Scene.vue";
import {getImageFromCanvas, getLockerColors, santaClone} from "@/helpers/Helpers";
import {http} from "@/httpCommon";
import {reject} from "lodash";
import {success} from "concurrently/dist/src/defaults";

@Component<AddProductWithDesignsToLockerRoom>({
  components: {
    Scene,
    ConfirmModal,
    LockerRoom,
    CreateLockerRoomModal
  },
})
export default class AddProductWithDesignsToLockerRoom extends Mixins(ErrorMessages, ModalAction) {
  @Prop({required: false, default: false}) rosterUrl !: boolean
  @Prop({ required: true }) readonly products_fonts!: Record<any, any>[]
  @Prop({
    required: false, default: () => {
    }
  }) locker_room_product: Record<any, any>
  @Prop({required: false, default: ''}) locker_room_product_type: string  //possible values are order_product, collection_product
  async recallProducts() {
    if (!(this.locker_room_product_type === 'collection_product')) {
      this.showLoader = true;
      await this.$store.dispatch('GET_LOCKER_PRODUCTS')
      this.showLoader = false;
      if (this.roomWithProducts.length) {
        this.productData = this.roomWithProducts[0].product
        this.tabIndex = 0
      }
    }
  }

  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public showLoader = false
  private baseUrl = location.host + "/#/"
  public room_id = this.lockers.length ? this.lockers[0].id : 0
  public product_name = '';
  public ref = this.$refs as Record<any, any>
  public tabIndex = this.$store.getters.getLockerActiveTabIndex
  public productData: any[] = []
  private screenWidth = (window.screen.availWidth - 100)
  public locker_room_action = {
    created: true,
    saved: false,
  };
  public loadingLocker = false

public errors = [];
  @Watch('lockers', {
    deep: true
  })
  lockersChanged() {
    if (this.lockers.length > 0 && !this.room_id) {
      this.room_id = this.lockers[0].id
    }
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts()
  }

  get lockers(): [Record<any, any>] {
    return this.$store.getters.getLockers;
  }

  get roomWithProducts(): Record<any, any> {
    const room = this.$store.getters.getLockerProducts
    return room
  }

  get productSelectedDesignsData() {
    let product_selected_designs: Record<any, any>[] = []
    const product_selected_designs_info = this.$store.getters.getProductSelectionDesignInfo;
    if(product_selected_designs_info.selection_mode) {
      const selected_product = this.$store.getters.getSelectedProduct
      if(selected_product) {
        const display_name = selected_product.display_name
        const selected_product_style_index: number = this.$store.getters.getCurrentStyleIndex
        const selected_product_designs: Record<any, any>[] = santaClone(selected_product.productstyles[selected_product_style_index].productdesigns)
        let existing_name_count = this.roomWithProducts[this.tabIndex].product.filter((locker_room_product) => {
          return  locker_room_product.product_name?.includes(display_name)
        }).length
        product_selected_designs_info.selected_designs.forEach((selected_design_index: number) => {
          let name_suffix = existing_name_count == 0 ? '' : existing_name_count + 1;
          const suggested_name = name_suffix ? `${display_name} - ${existing_name_count}` : display_name;
          selected_product_designs[selected_design_index].suggested_product_name = suggested_name
          product_selected_designs.push(selected_product_designs[selected_design_index])
          ++existing_name_count;
        })

      }
    }
    return product_selected_designs
  }

  get selectedProductIndex(): number {
    return this.$store.getters.getSelectedIndex
  }

  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get styleIndex(): number {
    return this.$store.getters.getCurrentStyleIndex;
  }

  get customLogos(): [] {
    return this.$store.getters.getCustomLogos()
  }

  get customer(): Record<any, any> {
    return this.$store.getters.getCustomer
  }

  get defaultColors(): [Record<any, any>] {
    return this.$store.getters.getDefaultColors
  }

  get logoColors(): [] {
    return this.$store.getters.getLogosColors;
  }

  get groupColors(): [Record<any, any>] {
    return this.$store.getters.getGroupColors
  }

  get productRosterDetail(): [Record<any, any>] {
    return this.$store.getters.getProductRosters()
  }

  get canvasImage() {
    return this.$store.getters.getCanvasImage
  }

  public async showButton(id: number, index: number) {
    if (this.locker_room_product_type === 'collection_product' && this.locker_room_action.created) {
      const ok = await this.ref['confirm-locker-modal'].showConfirm()
      if (ok) {
        await this.$store.dispatch('deleteRoom', {id: this.room_id, index: index});
        this.locker_room_action.created = false;
        this.locker_room_action.saved = false;
        this.product_name = "";
        await this.$store.dispatch('getLockers')
        this.room_id = id;
        this.tabIndex = index
        this.$store.commit('Change_Locker_Active_Tab', this.tabIndex)
        this.productData = this.roomWithProducts[index].product
      }
    } else {
      this.room_id = id;
      this.tabIndex = index
      this.$store.commit('Change_Locker_Active_Tab', this.tabIndex)
      this.productData = this.roomWithProducts[index].product
    }

  }

  public lockerAdded() {
    let index = this.lockers.length - 1
    this.tabIndex = index
    if (this.lockers[index]) {
      this.room_id = this.lockers[index].id
      this.productData = this.roomWithProducts[index].product;
    }
  }

  public async deleteRoom(id: number, index: number) {
    if (confirm('You are going to delete associated product')) {
      let res = await this.$store.dispatch('deleteRoom', {id: id, index: index});
      if (res == true) {
        this.showToast('room deleted', 'success')
        this.tabIndex = 0
        if (this.lockers[0]) {
          this.room_id = this.lockers[0].id
          this.productData = this.roomWithProducts[0].product
        }
      } else {
        this.showError(res);
      }
    }
  }

  public async createLocker(name: string) {
    return new Promise<Record<any, any>>(async (resolve) => {
      let res: Record<any, any> = this.$store.dispatch('createLocker', name);
      if (res.status == 201) {
        this.$store.dispatch('GET_LOCKER_PRODUCTS');
        this.lockerAdded()
      } else if (res.status == 422) {
        this.showError(res.message)
      }
      resolve(res);
    });
  }

  public async handleModalOpenEvent() {
    await this.$store.dispatch('GET_LOCKER_PRODUCTS')
  }

  public validateProductNames(productNames, customer_id, room_id): Record<any, any>{
    return new Promise((resolve, reject) => {
      http.post('products/validate', { product_names: productNames, customer_id: customer_id, room_id:room_id })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    })
  }

  public async handleModalCloseEvent() {
    if (this.locker_room_product_type === 'collection_product' && this.locker_room_action.created) {
      const ok = await this.ref['confirm-locker-modal'].showConfirm()
      if (ok) {
        let lockerRoomIndex = this.roomWithProducts.findIndex((locker_product) => {
          return locker_product.id === this.room_id
        });
        await this.$store.dispatch('deleteRoom', {id: this.room_id, index: lockerRoomIndex});
        this.locker_room_action.created = false;
        this.locker_room_action.saved = false;
        this.product_name = "";
        await this.$store.dispatch('getLockers');
        this.hideVModal('add-designs-to-locker-room');
        this.$emit('genImages', true)
      }

    } else {
      this.hideVModal('add-designs-to-locker-room');
      this.$emit('genImages', true)
    }

  }

  public showSaveToLockerRoomModal() {
    this.showVModal('add-designs-to-locker-room')
    this.recallProducts();
  }

  public async saveDesignsToLockerRoom() {
    const locker_design_data: Record<any, any> = [];
    this.loadingLocker = true;
    const suggestedProductNames = this.productSelectedDesignsData.map(
      (productSelectedDesign) => productSelectedDesign.suggested_product_name
    );

    let response : Record<any, any> = await this.validateProductNames(suggestedProductNames, this.customer.id, this.room_id);
    if(!response.data.success){
      const {errors} = response.data;
      let errorArr: Record<any, any>[] = [];
      Object.keys(errors).map((field:string) => {
        let error:Record<any, any>[] = [];
        error.push(errors[field]);
        errorArr.push(error);
      });
      this.showErrorArr(errorArr,3000);
      this.loadingLocker = false;
      return;
    }

    const fixed_logo_index = this.$store.getters.getFixedLogoIndex;
    const product_rosters = this.$store.getters.getProductRosters();

    try {
      for (const [productSelectedDesignIndex, productSelectedDesign] of this.productSelectedDesignsData.entries()) {
        const scene_ref = this.$refs[`product-selected-design-${productSelectedDesignIndex}-ref`]?.[0]
        const front_image_base64 = await this.getImageFromCanvasAsPromise('front', {}, scene_ref);
        const back_image_base64 = await this.getImageFromCanvasAsPromise('back', {}, scene_ref);
        const svg_groups = this.$refs[`product-selected-design-${productSelectedDesignIndex}-ref`]?.[0].svgGroups;
        let default_colors = []
        let group_colors = {}
        if(scene_ref) {
          //@ts-ignore
          default_colors = scene_ref?.appliedDefaultColors
          group_colors = scene_ref?.appliedGroupColors
        }
        if(!front_image_base64 && !back_image_base64){
          this.showToast(`Front image and Back image is undefined for Product Design ${productSelectedDesign.id}`,"error")
          return;
        }
        if(!svg_groups){
          this.showToast(`svg groups are undefined for Product Design ${productSelectedDesign.id}`,"error")
          return;
        }

        locker_design_data.push({
          roster_url: this.rosterUrl,
          room_id: this.room_id,
          product_id: this.selectedProduct.product_id,
          product_name: productSelectedDesign.suggested_product_name,
          style_id: this.selectedProduct.productstyles[this.styleIndex].id,
          design_id: productSelectedDesign.id,
          custom_logos: this.customLogos,
          text: this.customTexts,
          colors: this.logoColors,
          defaultcolors: default_colors,
          groupcolors: group_colors,
          locker_front_png: front_image_base64,
          locker_back_png: back_image_base64,
          product_roster_detail: product_rosters,
          fixed_logo_index: fixed_logo_index,
          svgcolors: svg_groups
        })
      }

      const savePromises = locker_design_data.map((lockerDesignData) => {
        return this.$store.dispatch('SAVE_TO_LOCKER', lockerDesignData).then((response) => {
          return response; // Return the response for Promise.all
        }).catch((error) => {
          return error
        });
      });

      await Promise.all(savePromises);
      this.$store.commit("RESET_PRODUCT_DESIGNS_SELECTION_INFO")
      this.loadingLocker = false
      await getLockerColors();
      this.$store.commit("Change_Locker_Tabs_Index", 0);
      this.showToast("Designs saved successfully","success");
      this.productSelectedDesignsData.map(
        (productSelectedDesign) => productSelectedDesign.suggested_product_name = ""
      );
      this.hideVModal('add-designs-to-locker-room');
    } catch (error) {
      this.showToast("Designs saved successfully","error");
      this.loadingLocker = false
      this.hideVModal('add-designs-to-locker-room');
      // Handle the error appropriately, e.g., display a user-friendly message
    }
  }

  async getImageFromCanvasAsPromise(side, options, canvasRef) {
    const imageData = await (getImageFromCanvas(side, options, canvasRef).split(',')[1]);
    return imageData; // Return the base64 string
  }
}

</script>

<style lang="scss" scoped>
.controls {
  flex-direction: column;
  right: 0;
  left: auto;
  gap: 5px;
  height: 100%;

  & > div:last-child {
    margin-top: auto;
  }

  .btn {
    height: 30px !important;
    width: 30px !important;
    display: flex !important;
    align-items: center;
    justify-content: center;
    font-size: .8em;

    @media (max-width: 600px) {
      font-size: 0.6rem;
      height: 20px !important;
      width: 20px !important;
      padding: 0;
    }
  }
}

.loader {
  position: absolute;
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

  img {
    max-width: 7%;
    display: block;
    margin: 0 auto;
    height: auto;
  }
}

.lockerroom-modal .add_new_locker {
  //.btn {
  //  font-size: 1em !important;
  //  line-height: normal;
  //}
}

.lockerroom-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  .locker-opener {
    padding: 15px;
    font-size: 18px;
    position: relative;
    overflow-x: auto;
    white-space: nowrap;
    @media only screen and (min-width: 992px) {
      max-width: 100%;
      padding: 14px 30px;
      max-width: 80%;
      overflow: hidden;
      white-space: inherit;
    }

    .btn {
      padding: 5px 10px;
      position: relative;
      background: none;
      border-color: rgba(3, 20, 46, 0.13);
      color: #03142E;
      font-size: 0.8rem;
      @media only screen and (min-width: 992px) {
        padding: 10px 30px;
        font-size: 1rem;
      }

      &.active,
      &:hover {
        background: #219f84;
        color: #fff;
        border-color: #219f84;
      }

      .remove {
        position: absolute;
        right: -10px;
        top: -14px;
        width: 20px;
        height: 20px;
        font-size: 9px;
        color: #D53943;
        background: #F8E1E2;
        border-radius: 50%;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        @media only screen and (min-width: 992px) {
          width: 30px;
          height: 30px;
          font-size: 12px;
        }
      }
    }

    .arrow {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
      color: #219f84;
      font-size: 15px;
      display: none;
      @media only screen and (min-width: 992px) {
        display: inline-block;
      }

      &.arrow-right {
        left: auto;
        right: 0;
      }
    }
  }

  .create-lockerroom {
    .btn {
      padding: 0;
      font-size: 24px;
      line-height: 1;
      font-weight: 700;
      color: #fff;
      background: #219f84;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      border: none;
      @media only screen and (min-width: 992px) {
        padding: 10px 30px;
        border-radius: 0.25rem;
        width: auto;
        height: auto;
        font-size: 14px;
        font-weight: 400;
      }

      span {
        @media only screen and (max-width: 991px) {
          display: none;
        }
      }
    }
  }

}

.save-btn-holder {
  padding: 15px 40px;
  text-align: center;
}

.design-name-form {
  label {
    font-size: 16px;
  }

  .input-group {
    flex: 0 0 55%;
    max-width: 55%;
    @media only screen and (min-width: 1024px) {
      flex: 0 0 78%;
      max-width: 78%;
    }
  }

  .btn {
    flex: 0 0 40%;
    max-width: 40%;
    background: #219f84;
    border-color: #219f84;
    @media only screen and (min-width: 1024px) {
      flex: 0 0 20%;
      max-width: 20%;
    }
  }
}




</style>
