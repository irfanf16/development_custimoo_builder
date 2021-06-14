<template>
    <b-modal ref="my-modal" id="modal-center-savelogomodal" size="lg" centered scrollable title="Save Logo" content-class="lockerroom-modal">
        <div class="lockerroom-header">
            <div class="locker-opener">
                <b-button v-for="(locker, index) in lockers" :key="index" variant="secondary" @click="showButton(locker.id, index)"   v-bind:class="tabIndex === index ? 'active' : '' ">{{locker.room_name}}<a class="remove" @click="deleteRoom(locker.id, index)"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a></b-button>
<!--                <b-button variant="secondary">Locker 2<a class="remove" href="#"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a></b-button>-->
<!--                <b-button variant="secondary">Locker 3<a class="remove" href="#"><font-awesome-icon :ico  n="['fas', 'trash-alt']" /></a></b-button>-->
            </div>
            <div class="create-lockerroom">
                <b-button class="create-btn" variant="secondary" v-b-modal.modal-center-createlockerroom><span>Create New </span>+</b-button>
                <CreateLockerRoomModal />
            </div>
        </div>

        <div class="pt-4 design-name-form text-center">
            <b-button variant="primary" :disabled="locker_selected" @click="saveLogo(logoIndex)">Save Logo</b-button>
        </div>

    </b-modal>
</template>

<script lang="ts">

import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
    import LockerRoomProducts from '@/components/LockerRoomProducts.vue'
    import CreateLockerRoomModal from '@/components/CreateLockerRoomModal.vue'
    @Component<SaveLogoModal>({
        components: {
            LockerRoomProducts,
            CreateLockerRoomModal
        },
      mounted() {
          this.room_id = this.lockers[0].id;
          this.locker_selected = false
      }
    })
    export default class SaveLogoModal extends Vue {
      public locker_selected = true;
      public room_id = 0;
      public product_name = '';
      public ref = this.$refs as Record<any, any>
      public tabIndex = 0
      @Prop({required: true}) logoIndex!: number

      get customLogos(): [Record<any, any>] {
        return this.$store.getters.getCustomLogos
      }
      get customTexts(): [Record<any, any>] {
        return this.$store.getters.getCustomTexts
      }
      get lockers():[Record<any, any>]{
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

      get logoColors():[]{
        return  this.$store.getters.getLogosColors;
      }
      public showButton(id:number, index:number){
        this.locker_selected = false;
        this.room_id = id;
        this.tabIndex = index
      }
      public async saveLogo(index:number){
        if (this.isCustomerAuthenticated) {
          let logo = {
            id: null,
            room_id: 0
          };
           logo.id = this.customLogos[index].id;
           logo.room_id = this.room_id;
           await this.$store.dispatch('saveLogo', logo);
           this.ref['my-modal'].hide();
        }else{
          alert("please login first");
        }
      }
      public async deleteRoom(id:number, index:number){
        await this.$store.dispatch('deleteRoom', {id: id, index: index});
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
                padding: 14px 0 0;
                max-width: 80%;
            }
            .btn{
                padding: 0.5rem 1rem;
                margin: 0 5px 10px;
                position: relative;
                background: none;
                border-color: rgba(3,20,46,0.13);
                color: #03142E;
                font-size: 0.8rem;
                @media only screen and (min-width: 992px){
                    margin: 0 10px 10px;
                    font-size: 14px;
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
                    top: -10px;
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
                        width: 20px;
                        height: 20px;
                        font-size: 10px;
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
            &::-webkit-scrollbar{
              height: 5px;
            }
            &::-webkit-scrollbar-track {
              background: transparent;
            }
            &::-webkit-scrollbar-thumb {
              background: #219F84;
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
          text-align: center;
        }
.design-name-form{
        label{font-size: 16px;}
        .input-group{
            flex: 0 0 55%;
            max-width: 55%;
        }
        .btn{
            flex: 0 0 44%;
            max-width: 44%;
            background: #219f84;
            border-color: #219f84;
        }
    }


</style>
