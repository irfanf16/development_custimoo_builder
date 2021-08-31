<template>
    <b-modal ref="my-modal" id="modal-center-addlockerroom" hide-footer centered scrollable size="lg" title="Add to Locker Room" modal-class="add_locker" content-class="lockerroom-modal">
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
                <div class="d-flex w-100 align-items-center justify-content-between position-absolute">
                  <div>
                    <b-form-checkbox   v-bind:value="product.id"></b-form-checkbox>
                  </div>
                  <div>
                    <a v-b-tooltip.hover title="Delete design" class="btn remove" @click="deleteProduct(ind, product.id)"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
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
    </b-modal>
</template>

<script lang="ts">

import {Component, Mixins, Vue, Watch} from 'vue-property-decorator'
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
      async mounted(){
        await this.$store.dispatch('GET_LOCKER_PRODUCTS')
        this.productData = this.roomWithProducts[0].product
      }
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
        return this.$store.getters.getLockerProducts
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
        return this.$store.getters.getCustomLogos
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
        console.log(this.productData)
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
        const modelIndex = this.$store.getters.getSelectedModelIndex
        if (this.isCustomerAuthenticated) {
          const currentDesign = this.selectedProduct.productstyles[this.styleIndex].productdesigns.filter((item: Record<any, any>) => {
            return item.design_show
          })
          if (this.product_name == ''){
            alert('product name is required')
            return false
          }
        let locker_front_png = this.$parent.ref.mainScene[0].$refs.front.toDataURL("image/png").split(',')[1];
          let locker_back_png = null;
          if(this.mainProductType == "front_back") {
            locker_back_png = this.$parent.ref.mainScene[0].$refs.back.toDataURL("image/png").split(',')[1]
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
          if (res == ''){
            this.showToast('Design saved successfully', 'SUCCESS')
            this.product_name = ''
          }else{
            alert(res);
          }
        }else{
          alert("please login first");
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
    }

</script>

<style lang="scss" scoped>
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
