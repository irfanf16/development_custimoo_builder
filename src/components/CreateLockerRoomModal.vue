<template>
    <modal ref="create-modal" name="create-modal" hide-footer id="modal-center-createlockerroom" centered scrollable size="xl" title="Create Locker Room" content-class="lockerroom-modal create-lockerroom-modal">
      <div class="modal-header d-flex justify-content-between">
        <span class="fs-4 font-weight-bold">Create Locker Room</span>
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hideVModal('create-modal')"><BIconX /></span>
      </div>
      <div class="p-4 design-name-form">
        <div class="loader global" v-if="showLoader"><img src="@assets/images/loading.gif" alt="loading...."/></div>
          <b-form inline @submit.prevent="createLocker">
              <label for="inline-form-input-productname" class="w-100 text-left d-block mb-2">Name</label>
              <div class="w-100 d-flex gap-2 flex-wrap align-items-center">
                  <b-input-group>
                      <b-form-input id="inline-form-input-productname" v-model="name"  placeholder="Locker Room Name"></b-form-input>
                  </b-input-group>
                  <div class="d-flex gap-2">
                    <b-button variant="secondary" class="w-100" @click="createLocker">Create</b-button>
                    <b-button variant="secondary" class="w-100 light" @click="hideVModal('create-modal')">Cancel</b-button>
                  </div>
              </div>
          </b-form>
      </div>
    </modal>
</template>

<script lang="ts">

import {Component, Mixins, Vue} from 'vue-property-decorator'
import ErrorMessages from "@/mixins/ErrorMessages";
import ModalAction from "@/mixins/ModalAction";
    // @Component<CreateLockerRoomModal>({
    // })
   @Component
    export default class CreateLockerRoomModal extends Mixins(ErrorMessages, ModalAction) {
      public name = ''
      public ref = this.$refs as Record<any, any>
      public showLoader = false;

      public async createLocker(){
        if(this.name == ''){
          this.showError('please input locker name')
          return false
        }
        this.showLoader = true;
        let res = await this.$store.dispatch('createLocker', this.name);
        if (res.status == 201){
          this.name = ''
          await this.$store.dispatch('GET_LOCKER_PRODUCTS').then((res) => {
            if (res) {
              this.$store.dispatch('GET_LOCKER_PRODUCTS', 'fetch_all=true')
            }
          });
          this.showLoader = false;
          this.hideVModal('create-modal')
          this.$emit('lockerAdded')
        }else if (res.status == 422){
          this.showLoader = false;
          this.showError(res.message)
       }
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
            flex: 0 0 60%;
            max-width: 60%;
            margin: 0;

          &+div{
            flex: 0 0 37%;
            max-width: 37%;
            margin: 0;
          }
        }
    }


</style>
