<template>
    <modal ref="sale-representative-modal" name="sale-representative-modal" id="modal-center-sale-representative-modal"
           @opened="setCustomerDefaultAdmin" :clickToClose="false"
           size="xl" class="lockerroom-modal">
      <div class="modal-header d-flex justify-content-between">
        <span class="fs-4 font-weight-bold">Select Sale Representative</span>
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hideVModal('sale-representative-modal')"><BIconX /></span>
      </div>
        <div class="pt-4 design-name-form">
            <b-form inline>
                <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
                    <b-input-group>
                      <b-form-select v-model="admin_salesrep_id"  :options="getRepresentative" ></b-form-select>
                    </b-input-group>
                    <b-button variant="primary" @click="submit">Get Quote</b-button>
                </div>
            </b-form>
        </div>
    </modal>
</template>

<script lang="ts">

import {Component, Mixins, Prop, Vue} from 'vue-property-decorator'
    import ErrorMessages from "@/mixins/ErrorMessages";
    import ModalAction from "@/mixins/ModalAction";

   @Component
    export default class AdminSalesRepresentativeModal extends Mixins(ErrorMessages, ModalAction) {
      public saleRepresentaive = []
      public admin_salesrep_id = null;
      public ref = this.$refs as Record<any, any>



      get getRepresentative(){
        this.saleRepresentaive =  this.$store.getters.getAdminSalesRep;
        let optionArray: Record<any, any>[] = [];

        if(this.saleRepresentaive.length > 0){
          optionArray.push({ value: null, text: 'Please select a sale representative' })
          this.saleRepresentaive.forEach((item:any) => {
            optionArray.push({ value: item.id, text: `${item.name} (${item.email})` })
          })
        }
        return optionArray;
      }

      public setCustomerDefaultAdmin() {
        const customer = this.$store.getters.getCustomer;
        this.admin_salesrep_id = customer.admin_salesrep_id;
      }

      public async submit(){

        let from = this.$store.getters.getSalesRepModalFrom;
        if(!this.admin_salesrep_id){
          this.showToast("Please select a sale representative",'error')
        }else{
          this.hideVModal('sale-representative-modal');

           if(from == 'order') {
             this.$emit('submitOrderQuote', {'admin_salesrep_id':this.admin_salesrep_id})
           } else if(from == 'cart') {
             this.$emit('submitCartQuote', {'admin_salesrep_id':this.admin_salesrep_id})
           }

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
        padding: 20px;
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
