<template>
    <b-modal ref="my-modal" id="modal-center-savecolormodal" centered scrollable size="xl" title="Add to Locker Room" content-class="lockerroom-modal">
      <b-tabs content-class="mt-3">
        <b-tab>
          <template #title>
            test
            <a class="remove-tab" @click="deleteRoom(room.id, i)">
                <font-awesome-icon :icon="['fas', 'trash-alt']"/>
            </a>
          </template>
          <div class="pt-lg-4 folder-wrapper">
            <h3 class="w-100 d-block mb-3 mb-lg-4 text-bold">Select Recent Folder</h3>
            <div class="d-flex flex-wrap">
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
            </div>
          </div>
        </b-tab>
        <b-tab>
          <template #title>
            test
            <a class="remove-tab" @click="deleteRoom(room.id, i)">
                <font-awesome-icon :icon="['fas', 'trash-alt']"/>
            </a>
          </template>
          <div class="pt-lg-4 folder-wrapper">
            <h3 class="w-100 d-block mb-3 mb-lg-4 text-bold">Select Recent Folder</h3>
            <div class="d-flex flex-wrap">
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
            </div>
          </div>
        </b-tab>
        <b-tab>
          <template #title>
            test
            <a class="remove-tab" @click="deleteRoom(room.id, i)">
                <font-awesome-icon :icon="['fas', 'trash-alt']"/>
            </a>
          </template>
          <div class="pt-lg-4 folder-wrapper">
            <h3 class="w-100 d-block mb-3 mb-lg-4 text-bold">Select Recent Folder</h3>
            <div class="d-flex flex-wrap">
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
              <a href="#." class="text-center d-block">
                <font-awesome-icon :icon="['fas', 'folder']"/>
                <span class="folder-name d-block">Folder Name</span>
              </a>
            </div>
          </div>
        </b-tab>
      </b-tabs>
        
        
        <div class="pt-4 design-name-form">
            <b-form inline>
                <label for="inline-form-input-productname" class="w-100 d-block mb-2">Color Group Name</label>
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

    import { Component, Vue } from 'vue-property-decorator'
    import LockerRoomProducts from '@/components/LockerRoomProducts.vue'
    import CreateLockerRoomModal from '@/components/CreateLockerRoomModal.vue'
    @Component<SaveColorModal>({
        components: {
            LockerRoomProducts,
            CreateLockerRoomModal
        }
    })
    export default class SaveColorModal extends Vue {
      public locker_selected = true;
      public room_id = 0;
      public product_name = '';
      public ref = this.$refs as Record<any, any>

      get customTexts(): [Record<any, any>] {
        return this.$store.getters.getCustomTexts
      }
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
      get logoColors():[]{
        return  this.$store.getters.getLogosColors;
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
            product_name: this.product_name,
            style_id: this.selectedProduct.productstyles[this.styleIndex].id,
            design_id: currentDesign[0].id,
            custom_logos: this.customLogos,
            text: this.customTexts,
            colors: this.logoColors
          }
          this.$store.dispatch("SAVE_TO_LOCKER", locker);
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
                max-width: 100%;
                padding: 14px 0;
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

    .folder-wrapper{
      h3{
        font-weight: 600;
        @media only screen and (min-width: 992px){
          font-size: 20px;
        }
      }
      a{
        margin: 0 10px 12px;
        font-size: 10px;
        flex: 0 0 18%;
        max-width: 18%;
        @media only screen and (min-width: 768px){
          font-size: 14px;
          flex: 0 0 9%;
          max-width: 9%;
        }
        svg{
          font-size: 32px;
          display: block;
          margin: 0 auto 10px;
          fill: #219f84;
          color: #219f84;
          @media only screen and (min-width: 768px){
            font-size: 46px;
          }
        }
      }
    }

    

</style>
