<template>
    <b-modal ref="my-modal" id="modal-center-addlockerroom" centered scrollable size="xl" title="Add to Locker Room" content-class="lockerroom-modal">
        <div class="lockerroom-header">
            <div class="locker-opener">
                <b-button v-for="(locker, index) in lockers" :key="index" variant="secondary" @click="showButton(locker.id)"   class="active">{{locker.room_name}}</b-button>
<!--                <b-button variant="secondary">Locker 2<a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a></b-button>-->
<!--                <b-button variant="secondary">Locker 3<a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a></b-button>-->
               </div>
            <div class="create-lockerroom">
                <b-button class="create-btn" variant="secondary" v-b-modal.modal-center-createlockerroom><span>Create New </span>+</b-button>
                <CreateLockerRoomModal />
            </div>
        </div>
      <div class="save-btn-holder"><b-button variant="secondary"  :disabled="locker_selected" @click="saveToLocker()">Save to Locker room </b-button></div>

    </b-modal>
</template>

<script lang="ts">

    import { Component, Vue } from 'vue-property-decorator'
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
      public ref = this.$refs as Record<any, any>

      get lockers(){
        return this.$store.getters.getLockers;
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
      public showButton(id:number){
        this.locker_selected = false;
        this.room_id = id;
      }
      public saveToLocker(){
        if (this.isCustomerAuthenticated) {
          const currentDesign = this.selectedProduct.productstyles[this.styleIndex].productdesigns.filter((item: Record<any, any>) => {
            return item.design_show
          })
          let locker = {
            room_id: this.room_id,
            product_id: this.selectedProduct.product_id,
            style_id: this.selectedProduct.productstyles[this.styleIndex].id,
            design_id: currentDesign[0].id,
            custom_logos: this.customLogos,
            text:'',
            colors:''
          }
          this.$store.dispatch("SAVE_TO_LOCKER", locker);
          this.ref['my-modal'].hide();
        }else{
          alert("please login first");
        }
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
                    color: #219f84;
                    background: #E7F4F1;
                    border: 1px solid #E7F4F1;
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
        }


</style>
