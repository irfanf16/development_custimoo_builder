<template>
  <b-modal ref="my-modal" id="modal-center-addlockerroom" hide-footer centered scrollable size="xl" title="Add to Locker Room" modal-class="add_locker" content-class="lockerroom-modal">
        <div class="lockerroom-header">
            <div class="locker-opener">
              <b-button v-for="(locker, index) in lockers" :key="index" variant="secondary" @click="showButton(locker.id, index)"  v-bind:class="tabIndex === index ? 'active' : '' ">{{ locker.room_name }}<a class="remove" @click="deleteRoom(locker.id, index)"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a></b-button>
            </div>
            <div class="add_new_locker">
              <span class="btn btn-secondary light" v-b-modal.modal-center-createlockerroom>Add <BIconPlus /></span>
            </div>
<!--                <b-button class="create-btn" variant="secondary" ><span>Create New </span>+</b-button>-->
                <CreateLockerRoomModal @lockerAdded="lockerAdded" />
        </div>
        <div class="pt-4 design-name-form" v-if="lockers.length > 0">
            <b-form inline>
                <label for="inline-form-input-productname" class="w-100 d-block mb-2">Product Name</label>
                <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
                    <b-input-group>
                        <b-form-input id="inline-form-input-productname" v-model="product_name"  placeholder="Type Here"></b-form-input>
                    </b-input-group>
                  <b-button variant="primary" :disabled="locker_selected" @click="saveToLocker()">Save Design</b-button>
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
                   <a v-if="product.design.back_design_count > 0" v-b-tooltip.hover :title="product.is_back_img ? 'Show front' : 'Show back' " class="btn btn-secondary light rounded-circle" @click="swapDesign(ind)" style="font-size: 1em">
                     <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrows-rotate" class="svg-inline--fa fa-arrows-rotate fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 16c-17.67 0-32 14.31-32 32v74.09C392.1 66.52 327.4 32 256 32C161.5 32 78.59 92.34 49.58 182.2c-5.438 16.81 3.797 34.88 20.61 40.28c16.89 5.5 34.88-3.812 40.3-20.59C130.9 138.5 189.4 96 256 96c50.5 0 96.26 24.55 124.4 64H336c-17.67 0-32 14.31-32 32s14.33 32 32 32h128c17.67 0 32-14.31 32-32V48C496 30.31 481.7 16 464 16zM441.8 289.6c-16.92-5.438-34.88 3.812-40.3 20.59C381.1 373.5 322.6 416 256 416c-50.5 0-96.25-24.55-124.4-64H176c17.67 0 32-14.31 32-32s-14.33-32-32-32h-128c-17.67 0-32 14.31-32 32v144c0 17.69 14.33 32 32 32s32-14.31 32-32v-74.09C119.9 445.5 184.6 480 255.1 480c94.45 0 177.4-60.34 206.4-150.2C467.9 313 458.6 294.1 441.8 289.6z"></path></svg>
                   </a>
                   </div>
                </div>
                <img class="w-100" :src="product.product_url" alt="">
               </div>
            </div>
            <div class="d-none d-lg-block product-description text-center">
              <p>{{ product.product_name }}</p>
            </div>
          </label>
        </div>
      </div>
      <confirm-modal message="Do you really want to delete" cancel_text="Cancel" confirm_text="Yes" ref="reset-modal"></confirm-modal>
    <div class="loader" v-if="showLoader"><img src="../../src/assets/images/loading.gif" /></div>
    </b-modal>
</template>

<script lang="ts">
import {Component, Mixins, Prop, Vue, Watch} from 'vue-property-decorator'
import LockerRoomProducts from '@/components/LockerRoomProducts.vue'
import CreateLockerRoomModal from '@/components/CreateLockerRoomModal.vue'
import ErrorMessages from "@/mixins/ErrorMessages";
import ConfirmModal from "@/components/ConfirmModal.vue";
import LockerRoom from "@/components/LockerRoom.vue";
    @Component<AddLockerRoomModal>({
        components: {
          ConfirmModal,
          LockerRoom,
            LockerRoomProducts,
            CreateLockerRoomModal
        },
    })
    export default class AddLockerRoomModal extends Mixins(ErrorMessages) {
      @Prop({required: false, default: true}) readonly close_on_add !: boolean
      async recallProducts(){
        await this.$store.dispatch('GET_LOCKER_PRODUCTS')
        if (this.roomWithProducts.length){
          this.productData = this.roomWithProducts[0].product
          this.tabIndex = 0
        }
      }
      public showLoader = false
      private baseUrl = location.host+"/#/"
      public locker_selected = true;
      public room_id = 0;
      public product_name = '';
      public ref = this.$refs as Record<any, any>
      public tabIndex = 0
      public productData: any[] = []

      get customTexts(): [Record<any, any>] {
        return this.$store.getters.getCustomTexts
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
          this.locker_selected = false
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
      get mainProductType():string{
        let selected_product = this.selectedProduct.productstyles[this.styleIndex].productdesigns.filter((design:Record<any, any>) => design.design_show == 1)[0];
        return selected_product.back_design ?  "front_back" : "front";
      }
      public showButton(id:number, index:number){
        this.locker_selected = false;
        this.room_id = id;
        this.tabIndex = index
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
            return false
          }
        let locker_front_png = null
          let locker_back_png = null;
          if (this.$parent.$refs.product_preview !==undefined){
            locker_front_png = this.$parent.$refs.product_preview.$refs.mainScene[0].$refs.front.toDataURL("image/png").split(',')[1]
            if(this.mainProductType == "front_back") {
              locker_back_png = this.$parent.$refs.product_preview.$refs.mainScene[0].$refs.back.toDataURL("image/png").split(',')[1]
            }
          }else if(this.$parent.ref.mainScene !==undefined){
            locker_front_png = this.$parent.ref.mainScene[0].$refs.front.toDataURL("image/png").split(',')[1];
            if(this.mainProductType == "front_back") {
              locker_back_png = this.$parent.ref.mainScene[0].$refs.back.toDataURL("image/png").split(',')[1]
            }
          }
          let locker = {
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
            locker_back_png: locker_back_png
          }
         let res = await this.$store.dispatch("SAVE_TO_LOCKER", locker);
          if (res.status == 201){
            this.showToast('Design saved successfully', 'SUCCESS')
            this.product_name = ''
            this.$store.commit("Change_Locker_Tabs_Index", this.tabIndex)
            if(this.close_on_add) {
              this.ref['my-modal'].hide();
              this.showLoader = false
            } else {
              this.$emit('open-locker-room');
            }

          }else{
            this.showLoader = false
            this.showError(res);
          }
        }else{
          this.showError("please login first");
        }
      }
      public async deleteRoom(id:number, index:number){
        if (confirm('You are going to delete associated product')){
          let res = await this.$store.dispatch('deleteRoom', {id: id, index: index});
          if (res == true){
            this.showToast('room deleted', 'SUCCESS')
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
        this.ref['my-modal'].show()
        this.recallProducts();
      }
      public async deleteProduct(ind:number, id:number){
        let room_index = this.roomWithProducts.findIndex((room:Record<any, any>) => room.id == this.room_id)
        const ok = await this.ref['reset-modal'].showConfirm()
        if (ok) {
          let res = await this.$store.dispatch('deleteRoomProduct', {room_index: room_index, product_index: ind, id:id});
          if (res == true){
            this.showToast('Product Deleted', 'SUCCESS')
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
