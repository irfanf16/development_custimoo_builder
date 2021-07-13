<template>
    <b-modal ref="my-modal" id="modal-center-addlockerroom" centered scrollable size="xl" title="Add to Locker Room" content-class="lockerroom-modal">
        <div class="lockerroom-header">
            <div class="locker-opener">
                <b-button v-for="(locker, index) in lockers" :key="index" variant="secondary" @click="showButton(locker.id, index)"  v-bind:class="tabIndex === index ? 'active' : '' ">{{ locker.room_name }}<a class="remove" @click="deleteRoom(locker.id, index)"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a></b-button>
               </div>
            <div class="create-lockerroom">
                <b-button class="create-btn" variant="secondary" v-b-modal.modal-center-createlockerroom><span>Create New </span>+</b-button>
                <CreateLockerRoomModal @lockerAdded="lockerAdded" />
            </div>
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

    </b-modal>
</template>

<script lang="ts">

import {Component, Vue, Watch} from 'vue-property-decorator'
    import LockerRoomProducts from '@/components/LockerRoomProducts.vue'
    import CreateLockerRoomModal from '@/components/CreateLockerRoomModal.vue'
    @Component<AddLockerRoomModal>({
        components: {
            LockerRoomProducts,
            CreateLockerRoomModal
        }
    })
    export default class AddLockerRoomModal extends Vue {
      public locker_selected = true;
      public room_id = 0;
      public product_name = '';
      public ref = this.$refs as Record<any, any>
      public tabIndex = 0

      get customTexts(): [Record<any, any>] {
        return this.$store.getters.getCustomTexts
      }
      get lockers():[Record<any, any>]{
        return this.$store.getters.getLockers;
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
      public showButton(id:number, index:number){
        this.locker_selected = false;
        this.room_id = id;
        this.tabIndex = index
      }
      public lockerAdded(){
        let index = this.lockers.length -1
        this.tabIndex = index
        if (this.lockers[index]){
          this.room_id = this.lockers[index].id
        }
      }
      public async saveToLocker(){
        if (this.isCustomerAuthenticated) {
          const currentDesign = this.selectedProduct.productstyles[this.styleIndex].productdesigns.filter((item: Record<any, any>) => {
            return item.design_show
          })
          if (this.product_name == ''){
            alert('product name is required')
            return false
          }
          let locker = {
            room_id: this.room_id,
            product_id: this.selectedProduct.product_id,
            product_name: this.product_name,
            style_id: this.selectedProduct.productstyles[this.styleIndex].id,
            design_id: currentDesign[0].id,
            custom_logos: this.customLogos,
            text: this.customTexts,
            colors: this.logoColors,
            defaultcolors: this.defaultColors,
            groupcolors: this.groupColors
          }
         let res = await this.$store.dispatch("SAVE_TO_LOCKER", locker);
          if (res == ''){
            this.ref['my-modal'].hide();
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
          await this.$store.dispatch('deleteRoom', {id: id, index: index});
          this.tabIndex = 0
          if (this.lockers[0]){
            this.room_id = this.lockers[0].id
          }
        }
      }
      public showSaveToLockerRoomModal() {
        this.ref['my-modal'].show()
      }
    }

</script>

<style lang="scss" scoped>
    .lockerroom-header{
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        .locker-opener{
            max-width: 90%;
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
                margin: 0 5px 10px;
                position: relative;
                background: none;
                border-color: rgba(3,20,46,0.13);
                color: #03142E;
                font-size: 0.8rem;
                @media only screen and (min-width: 992px){
                    padding: 10px 30px;
                    margin: 0 10px 10px;
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
                font-weight: 700px;
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
