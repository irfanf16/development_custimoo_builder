<template>
    <modal ref="create-modal" name="create-modal" hide-footer id="modal-center-createlockerroom" centered scrollable size="xl" title="Create Locker Room" content-class="lockerroom-modal create-lockerroom-modal">
        <div class="pt-4 design-name-form">
            <b-form inline @submit.prevent="createLocker">
                <label for="inline-form-input-productname" class="w-100 d-block mb-2">Name</label>
                <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
                    <b-input-group>
                        <b-form-input id="inline-form-input-productname" v-model="name"  placeholder="Locker Room Name"></b-form-input>
                    </b-input-group>
                    <b-button variant="primary" @click="createLocker">Create</b-button>
                </div>
            </b-form>
        </div>
    </modal>
</template>

<script lang="ts">

import {Component, Mixins, Vue} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";
    // @Component<CreateLockerRoomModal>({
    // })
   @Component
    export default class CreateLockerRoomModal extends Mixins(ErrorMessages) {
      public name = ''
      public ref = this.$refs as Record<any, any>

      public async createLocker(){
        if(this.name == ''){
          this.showError('please input locker name')
          return false
        }
        let res = await this.$store.dispatch('createLocker', this.name);
        if (res.status == 201){
          this.name = ''
          await this.$store.dispatch('GET_LOCKER_PRODUCTS');
          this.hideModal()
          this.$emit('lockerAdded')
       }else if (res.status == 422){
         this.showError(res.message)
       }
      }
      public showModal(){
        this.$modal.show('create-modal')
      }
      public hideModal(){
        this.$modal.hide('create-modal');
      }
    }

</script>

<style lang="scss" scoped>
    .lockerroom-header{
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        .locker-opener{
            max-width: 80%;
            padding: 0 30px;
            font-size: 18px;
            position: relative;
            .btn{
                padding: 10px 30px;
                margin: 0 10px 10px;
                position: relative;
                background: none;
                border-color: rgba(3,20,46,0.13);
                color: #03142E;
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
                    width: 30px;
                    height: 30px;
                    font-size: 12px;
                    color: #D53943;
                    background: #F8E1E2;
                    border-radius: 50%;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: center;
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
                &.arrow-right{
                    left: auto;
                    right: 0;
                }
            }
        }
        .create-lockerroom{
            .btn{
                padding: 10px 30px;
                font-size: 14px;
                color: #219f84;
                background: #E7F4F1;
                border-color: #E7F4F1;
            }
        }
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
