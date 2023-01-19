<template>
  <modal name="add-to-lockerroom"
         :width="screenWidth"
         :resizable="true"
         :scrollable="true"
         height="auto"
         :reset="true"
         @opened="$emit('genImages')"
         @closed="$emit('genImages', true)"
         :shiftY="0"
         id="modal-center-addlockerroom" hide-footer centered size="xl"  modal-class="add_locker" content-class="lockerroom-modal">
    <div class="modal-header d-flex justify-content-between">
      <span class="fs-5 font-weight-bold">Save your design <span v-if="$store.getters.getIsShareDesign">before sharing</span></span>
      <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hideVModal('add-to-lockerroom')"><BIconX /></span>
    </div>
    <div class="p-4">
      <div class="lockerroom-header">
        <div class="locker-opener w-100" style="max-width: 100%; overflow-x: auto">
          <b-button style="white-space: nowrap" v-for="(locker, index) in lockers" :key="index" variant="secondary" @click="showButton(locker.id, index)"  v-bind:class="tabIndex === index ? 'active' : '' ">{{ locker.room_name }}<a class="remove" @click="deleteRoom(locker.id, index)"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a></b-button>
          <span class="btn btn-secondary light add_new_locker_btn" @click="showVModal('create-modal')">Add <BIconPlus /></span>
        </div>
<!--            <div class="add_new_locker">-->
<!--              -->
<!--            </div>-->
<!--                <b-button class="create-btn" variant="secondary" ><span>Create New </span>+</b-button>-->
            <CreateLockerRoomModal @lockerAdded="lockerAdded" />
      </div>

      <div class="d-flex gap-4 flex-wrap flex-row-reverse">
        <div class="bg-light rounded pt-3 text-center" style="flex-basis: calc(40% - 2rem)">
          <div class="fs-3 font-weight-bold">Design Preview</div>

          <div v-if="frontPreview !== '' || backPreview !== ''" class="d-flex py-4 gap-1 flex-grow-0">
            <div>
              <img style="max-width: 100%" :src="frontPreview">
            </div>
            <div>
              <img style="max-width: 100%" :src="backPreview">
            </div>
          </div>
        </div>
        <div style="flex-basis: 60%">
          <div class="pt-4 design-name-form" v-if="lockers.length > 0">
            <b-form inline>
              <label for="inline-form-input-productname" class="w-100 d-block mb-2 text-left">Product Name</label>
              <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
                <b-input-group>
                  <b-form-input id="inline-form-input-productname" v-model="product_name"  placeholder="Type Here"></b-form-input>
                </b-input-group>
                <b-button variant="primary" @click="saveToLocker()">Save Design</b-button>
              </div>
            </b-form>
          </div>
          <div class="grid grid-6 gap-3 w-100 mt-4">
            <div v-for="(product, ind) in productData" :key="ind" class="products-block">
              <label :key="ind" class="w-100" :class="product.class ? 'selected': ''" @click="product.class == undefined ? product.class = false : null; product.class = !product.class">
                <div class="image-holder position-relative">
                  <div>
                    <div class="d-flex align-items-center justify-content-between position-absolute controls">
                      <div>
                        <a v-b-tooltip.hover title="Delete design" class="btn remove" @click="deleteProduct(ind, product.id)"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                      </div>
                      <div>
                        <a v-if="product.design && product.design.back_design_count > 0" v-b-tooltip.hover :title="product.is_back_img ? 'Show front' : 'Show back' " class="btn btn-secondary light rounded-circle" @click="swapDesign(ind)" style="font-size: 1em">
                          <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrows-rotate" class="svg-inline--fa fa-arrows-rotate fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 16c-17.67 0-32 14.31-32 32v74.09C392.1 66.52 327.4 32 256 32C161.5 32 78.59 92.34 49.58 182.2c-5.438 16.81 3.797 34.88 20.61 40.28c16.89 5.5 34.88-3.812 40.3-20.59C130.9 138.5 189.4 96 256 96c50.5 0 96.26 24.55 124.4 64H336c-17.67 0-32 14.31-32 32s14.33 32 32 32h128c17.67 0 32-14.31 32-32V48C496 30.31 481.7 16 464 16zM441.8 289.6c-16.92-5.438-34.88 3.812-40.3 20.59C381.1 373.5 322.6 416 256 416c-50.5 0-96.25-24.55-124.4-64H176c17.67 0 32-14.31 32-32s-14.33-32-32-32h-128c-17.67 0-32 14.31-32 32v144c0 17.69 14.33 32 32 32s32-14.31 32-32v-74.09C119.9 445.5 184.6 480 255.1 480c94.45 0 177.4-60.34 206.4-150.2C467.9 313 458.6 294.1 441.8 289.6z"></path></svg>
                        </a>
                      </div>
                    </div>
                    <img class="w-100" :src="storageUrl+product.product_url" alt="">
                  </div>
                </div>
                <div class="d-none d-lg-block product-description text-center">
                  <p>{{ product.product_name }}</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

        <confirm-modal message="Do you really want to delete" cancel_text="Cancel" confirm_text="Yes" ref="reset-modal"></confirm-modal>
      <div class="loader" v-if="showLoader"><img src="../../src/assets/images/loading.gif" /></div>
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
import { getImageFromCanvas } from '@/helpers/Helpers'
import { Canvas } from 'fabric/fabric-impl'
    @Component<AddLockerRoomModal>({
        components: {
          ConfirmModal,
          LockerRoom,
          CreateLockerRoomModal
        },
    })
    export default class AddLockerRoomModal extends Mixins(ErrorMessages, ModalAction) {
      @Prop({required: false, default: true}) readonly close_on_add !: boolean
      @Prop({required: false, default: false})  rosterUrl !: boolean
      @Prop({required: true})  frontPreview !: string
      @Prop({required: true})  backPreview !: string
      async recallProducts(){
        this.showLoader = true;
        await this.$store.dispatch('GET_LOCKER_PRODUCTS')
        this.showLoader = false;
        if (this.roomWithProducts.length){
          this.productData = this.roomWithProducts[0].product
          this.tabIndex = 0
        }
      }
      private storageUrl = process.env.VUE_APP_STORAGE_URL
      public showLoader = false
      private baseUrl = location.host+"/#/"
      public room_id = this.lockers.length? this.lockers[0].id : 0
      public product_name = '';
      public ref = this.$refs as Record<any, any>
      public tabIndex = this.$store.getters.getLockerActiveTabIndex
      public productData: any[] = []
      private screenWidth = (window.screen.availWidth - 100)

      get customTexts(): [Record<any, any>] {
        return this.$store.getters.getCustomTexts()
      }
      get lockers():[Record<any, any>]{
        return this.$store.getters.getLockers;
      }
      get roomWithProducts():Record<any, any>{
        const room = this.$store.getters.getLockerProducts
        return room
      }
      @Watch('lockers', {
        deep: true
      })
      lockersChanged() {
        if (this.lockers.length > 0 && !this.room_id){
          this.room_id = this.lockers[0].id
        }
      }
      get isCustomerAuthenticated(): boolean {
        return this.$store.getters.isCustomerAuthenticated
      }
      get selectedProduct(): Record<any, any>{
        return this.$store.getters.getSelectedProduct
      }
      get styleIndex():number{
        return  this.$store.getters.getCurrentStyleIndex;
      }
      get customLogos(): [] {
        return this.$store.getters.getCustomLogos()
      }
      get defaultColors() : [Record<any, any>] {
        return this.$store.getters.getDefaultColors
      }
      get logoColors():[]{
        return  this.$store.getters.getLogosColors;
      }
      get groupColors() : [Record<any, any>] {
        return this.$store.getters.getGroupColors
      }
      get productModels(): Record<any, any> {
        return this.$store.getters.getProductModels;
      }
      get productRosterDetail(): [Record<any, any>] {
        return this.$store.getters.getProductRosters()
      }
      get mainProductType():string{
        let selected_product = this.selectedProduct.productstyles[this.styleIndex].productdesigns.filter((design:Record<any, any>) => design.design_show == 1)[0];
        return selected_product.back_design ?  "front_back" : "front";
      }
      get canvasImage() {
        return this.$store.getters.getCanvasImage
      }
      public showButton(id:number, index:number){
        this.room_id = id;
        this.tabIndex = index
        this.$store.commit('Change_Locker_Active_Tab', this.tabIndex)
        this.productData = this.roomWithProducts[index].product
      }
      public lockerAdded(){
        let index = this.lockers.length -1
        this.tabIndex = index
        if (this.lockers[index]){
          this.room_id = this.lockers[index].id
          this.productData = this.roomWithProducts[index].product;
        }
      }

      public async saveToLocker(){
        this.showLoader = true
        const modelIndex = this.$store.getters.getSelectedModelIndex
        if (this.isCustomerAuthenticated) {
          const currentDesign = this.selectedProduct.productstyles[this.styleIndex].productdesigns.filter((item: Record<any, any>) => {
            return item.design_show
          })
          if (this.product_name == ''){
            this.showError('product name is required')
            this.showLoader = false
            return false
          }
          this.canvasImage.front = (getImageFromCanvas('front') as string ).split(',')[1]
          this.canvasImage.back = (getImageFromCanvas('back') as string )?.split(',')[1]
          let locker_front_png = this.canvasImage.front
          let locker_back_png = this.canvasImage.back
          let distinct:Record<any, any> = []
          let svgGroups = this.$store.getters.getSvgGroups
          let unique:any = [];
          for( let i = 0; i < svgGroups.length; i++ ){
            if( !unique[svgGroups[i].color]){
              distinct.push({value: svgGroups[i].color, name: svgGroups[i].name});
              unique[svgGroups[i].color] = 1;
            }
          }
          let locker = {
            roster_url: this.rosterUrl,
            room_id: this.room_id,
            product_id: this.selectedProduct.product_id,
            model_id: this.productModels[modelIndex].id,
            product_name: this.product_name,
            style_id: this.selectedProduct.productstyles[this.styleIndex].id,
            design_id: currentDesign[0].id,
            custom_logos: this.customLogos,
            text: this.customTexts,
            colors: this.logoColors,
            defaultcolors: this.defaultColors,
            groupcolors: this.groupColors,
            locker_front_png: locker_front_png,
            locker_back_png: locker_back_png,
            product_roster_detail: this.productRosterDetail,
            svgcolors: distinct
          }
         let res = await this.$store.dispatch("SAVE_TO_LOCKER", locker).catch(errorResponse => {
           this.showLoader = false
           this.showError(errorResponse);
         });
          if (res && res.status == 201){
            let is_customized = this.$store.getters.getCustomized
            let is_personalized = this.$store.getters.getPersonalized

            this.$store.commit("SET_PRODUCT_EDIT_INFO_OBJECT", {
              editing: true, type: "locker_product", filters: { customized: is_customized, personalized: is_personalized, search_products: ''},
              locker_product_info: { product_id: locker.product_id, locker_product_id: res.data.data.product_locker_id, style_id: locker.style_id,
                design_id: locker.design_id},
              cart_product_info: null, order_product_info: null
            })

            if (this.rosterUrl){
              this.$root.$emit('rostershared', res.data.data.roster_shared_url)
            }
              this.showToast('Design saved successfully', 'success')
              this.product_name = ''
              this.$store.commit("Change_Locker_Tabs_Index", this.tabIndex)
              if(this.close_on_add) {
                this.hideVModal('add-to-lockerroom');
                this.showLoader = false
              } else {
                // if(!this.$store.getters.getIsShareDesign){
                //   this.$emit('open-locker-room', this.tabIndex);
                // }else{
                //   this.hideVModal('add-to-lockerroom');
                // }
                this.hideVModal('add-to-lockerroom');
              }
          }else{
            //as the exception has been caught above so here we just need to return if there is any error in api response
            return
          }
        }else{
          this.showError("please login first");
          return
        }
          this.$store.commit('setActiveLockerProduct', (this.productData.length - 1));
          if(this.$store.getters.getIsShareDesign){
            (this.$parent as Record<any, any>).shareDesign();
          }
        this.$store.commit('setIsShareDesign', false);
      }
      public async shareDesignUrl(product:Record<any,any>){
        const modelIndex = this.$store.getters.getSelectedModelIndex
        const currentDesign = this.selectedProduct.productstyles[this.styleIndex].productdesigns.filter((item: Record<any, any>) => {
            return item.design_show
        })
        this.product_name = this.selectedProduct.product_name;
        this.canvasImage.front = (getImageFromCanvas('front') as string ).split(',')[1]
        this.canvasImage.back = (getImageFromCanvas('back') as string )?.split(',')[1]
        let locker_front_png = this.canvasImage.front
        let locker_back_png = this.canvasImage.back
        let distinct:Record<any, any> = []
        let svgGroups = this.$store.getters.getSvgGroups
        let unique:any = [];
        for( let i = 0; i < svgGroups.length; i++ ){
            if( !unique[svgGroups[i].color]){
              distinct.push({value: svgGroups[i].color, name: svgGroups[i].name});
              unique[svgGroups[i].color] = 1;
            }
        }
        let locker = {
            roster_url: this.rosterUrl,
            room_id: null,
            product_id: this.selectedProduct.product_id,
            model_id: this.productModels[modelIndex].id,
            product_name: this.product_name,
            style_id: this.selectedProduct.productstyles[this.styleIndex].id,
            design_id: currentDesign[0].id,
            custom_logos: this.customLogos,
            text: this.customTexts,
            colors: this.logoColors,
            defaultcolors: this.defaultColors,
            groupcolors: this.groupColors,
            locker_front_png: locker_front_png,
            locker_back_png: locker_back_png,
            product_roster_detail: this.productRosterDetail,
            svgcolors: distinct
          }
        let res = await this.$store.dispatch("SHARE_DESIGN_URL", locker);

          console.log(res);
          if (res.status == 201){
            Vue.set(product, 'shared_url', res.data.url);
            this.$emit('showPopper','shareDesign');
          }else{
            this.showLoader = false
            this.showError(res);
          }
      }
      public async deleteRoom(id:number, index:number){
        if (confirm('You are going to delete associated product')){
          let res = await this.$store.dispatch('deleteRoom', {id: id, index: index});
          if (res == true){
            this.showToast('room deleted', 'success')
            this.tabIndex = 0
            if (this.lockers[0]){
              this.room_id = this.lockers[0].id
              this.productData = this.roomWithProducts[0].product
            }
          }else{
            this.showError(res);
          }
        }
      }
      public showSaveToLockerRoomModal() {
        this.showVModal('add-to-lockerroom')
        this.recallProducts();
      }
      // public saveBeforeShareDesign() {
      //   this.showVModal('add-to-lockerroom');
      //   this.recallProducts();
      // }
      public async deleteProduct(ind:number, id:number){
        let room_index = this.roomWithProducts.findIndex((room:Record<any, any>) => room.id == this.room_id)
        const ok = await this.ref['reset-modal'].showConfirm()
        if (ok) {
          let res = await this.$store.dispatch('deleteRoomProduct', {room_index: room_index, product_index: ind, id:id});
          if (res == true){
            this.showToast('Product Deleted', 'success')
          }else{
            this.showError(res)
          }
        }
      }
      public swapDesign(productIndex: number){

        let product: Record<any, any> = this.productData[productIndex];

        if(product.is_back_img==0){
          product.is_back_img = 1
          product.product_url = product.product_back_url
        }else{
          product.is_back_img = 0
          product.product_url = product.product_front_url
        }
        this.productData[productIndex] = product;
      }
    }

</script>

<style lang="scss" scoped>
.controls{
  flex-direction: column;
  right: 0;
  left: auto;
  gap: 5px;
  height: 100%;

  &>div:last-child{
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
.loader{
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
  background: rgba(255,255,255,0.9);
  z-index: 1030;
  img{
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
    .lockerroom-header{
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        .locker-opener{
            padding: 15px;
            font-size: 18px;
            position: relative;
            overflow-x: auto;
            white-space: nowrap;
            @media only screen and (min-width: 992px){
                max-width: 100%;
                padding: 14px 30px;
                max-width: 80%;
                overflow: hidden;
                white-space: inherit;
            }
            .btn{
                padding: 5px 10px;
                position: relative;
                background: none;
                border-color: rgba(3,20,46,0.13);
                color: #03142E;
                font-size: 0.8rem;
                @media only screen and (min-width: 992px){
                    padding: 10px 30px;
                    font-size: 1rem;
                }
                &.active,
                &:hover{
                    background: #219f84;
                    color: #fff;
                    border-color: #219f84;
                }
                .remove{
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
                    @media only screen and (min-width: 992px){
                        width: 30px;
                        height: 30px;
                        font-size: 12px;
                    }
                }
            }
            .arrow{
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                z-index: 1;
                color: #219f84;
                font-size: 15px;
                display: none;
                @media only screen and (min-width: 992px){
                    display: inline-block;
                }
                &.arrow-right{
                    left: auto;
                    right: 0;
                }
            }
        }
        .create-lockerroom{
            .btn{
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
                @media only screen and (min-width: 992px){
                    padding: 10px 30px;
                    border-radius: 0.25rem;
                    width: auto;
                    height: auto;
                    font-size: 14px;
                    font-weight: 400;
                }
                span{
                    @media only screen and (max-width: 991px){display: none;}
                }
            }
        }

    }
    .save-btn-holder{
          padding: 15px 40px;
          text-align: center;
        }
.design-name-form{
        label{font-size: 16px;}
        .input-group{
            flex: 0 0 55%;
            max-width: 55%;
          @media only screen and (min-width: 1024px){
            flex: 0 0 78%;
            max-width: 78%;
          }
        }
        .btn{
            flex: 0 0 40%;
            max-width: 40%;
            background: #219f84;
            border-color: #219f84;
          @media only screen and (min-width: 1024px){
            flex: 0 0 20%;
            max-width: 20%;
          }
        }
    }


</style>
