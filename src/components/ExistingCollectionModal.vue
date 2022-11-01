<template>
    <b-modal ref="existing-collection-modal" hide-footer id="modal-center-existingCollection" centered scrollable size="xl" title="Add To Existing Collection" content-class="lockerroom-modal create-lockerroom-modal">
        <div class="pt-4 design-name-form">
            <b-form inline>
                <label for="inline-form-input-productname" class="w-100 d-block mb-2">Name</label>
                <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
                    <b-input-group>
                      <b-form-select v-model="collection_id"  :options="getCollections" ></b-form-select>
                    </b-input-group>
                    <b-button variant="primary" @click="addExisting">Add</b-button>
                </div>
            </b-form>
        </div>
    </b-modal>
</template>

<script lang="ts">

import {Component, Mixins, Vue} from 'vue-property-decorator'
    import ErrorMessages from "@/mixins/ErrorMessages";

   @Component
    export default class ExistingCollectionModal extends Mixins(ErrorMessages) {
      public collections = []
      public collection_id = null;
      public ref = this.$refs as Record<any, any>

      get getCollections(){
        let collections =  this.$store.getters.getCollections;
        let optionArray: Record<any, any>[] = [];

        if(collections.length > 0){
          optionArray.push({ value: null, text: 'Please select an option' })
          collections.forEach((item:any) => {
            optionArray.push({ value: item.id, text: item.name })
          })
        }
        return optionArray;
      }

      public async addExisting(){
        if(!this.collection_id){
          this.showToast("Please select a collection",'error')
        }else{
          const payload = {"attribute":"collection_id","value":this.collection_id}
          this.$store.commit('SET_SELECTED_COLLECTION_PRODUCTS',payload)
          this.ref['existing-collection-modal'].hide();
          this.$emit('existingCollection')
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
