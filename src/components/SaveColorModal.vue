<template>
    <b-modal ref="my-modal" hide-footer id="modal-center-savecolormodal" centered scrollable size="xl" title="Add Color to Locker Room" content-class="lockerroom-modal">
      <b-tabs content-class="mt-3">
        <template v-for="(room, i) in getLockerProducts">
        <b-tab :key="i">
          <template #title >
            <a @click="changeRoom(room.id)">{{room.room_name}}</a>
          </template>
          <div class="pt-lg-4 folder-wrapper">
            <h3 class="w-100 d-block mb-3 mb-lg-4 text-bold">Select Recent Folder</h3>
            <div class="d-flex flex-wrap">
              <template v-for="(folder, i) in room.folders">
                <a class="text-center d-block" @click="changeFolder(folder.folder_name)" :key="i">
                  <font-awesome-icon :icon="['fas', 'folder']"/>
                  <span class="folder-name d-block">{{ folder.folder_name }}</span>
                </a>
              </template>
            </div>
          </div>
        </b-tab>
        </template>
        <div class="create-lockerroom">
            <b-button class="create-btn" variant="secondary" v-b-modal.modal-center-createlockerroom><span>Create New </span>+</b-button>
            <CreateLockerRoomModal />
        </div>
      </b-tabs>

        <div class="pt-4 design-name-form">
            <b-form inline>
                <label for="inline-form-input-productname" class="w-100 d-block mb-2">Color Group Name</label>
                <div class="w-100 d-flex flex-wrap justify-content-between align-items-center">
                    <b-input-group>
                        <b-form-input id="inline-form-input-productname" v-model="folder_name"  placeholder="Type Here"></b-form-input>
                    </b-input-group>
                    <b-button variant="primary"  @click="saveFolder" >Save Color</b-button>
                </div>
            </b-form>
        </div>

    </b-modal>
</template>

<script lang="ts">

import {Component, Vue, Watch} from 'vue-property-decorator'
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
      public folder_name = '';
      public ref = this.$refs as Record<any, any>

      public showColorModal(){
        this.ref['my-modal'].show();
      }

      get getLockerProducts():Record<any, any>{
        return this.$store.getters.getLockerProducts;
      }
      @Watch('getLockerProducts', {
        deep: true
      })
      getLockerProductsChanged() {
        if (this.getLockerProducts.length > 0 && !this.room_id){
          this.room_id = this.getLockerProducts[0].id
        }
      }

      get lockers(){
        return this.$store.getters.getLockers;
      }
      get isCustomerAuthenticated(): boolean {
        return this.$store.getters.isCustomerAuthenticated
      }
      get logoColors():[]{
        return  this.$store.getters.getLogosColors;
      }

      public showButton(id:number){
        this.locker_selected = false;
        this.room_id = id;
      }

      public changeFolder(folder:string, id:number){
        this.folder_name = folder;
      }
      public changeRoom(id:number){
        this.room_id = id;
        console.log(this.room_id)
      }
      public async saveFolder(){
        if (this.room_id == 0){
          alert('select room first');
          return false;
        }
        let productColors = []
        this.logoColors.forEach((item:Record<any, any>) => {
          let obj = {
            name: item.pantone, value: item.hex
          }
          productColors.push(obj)
        })

       let saved = await this.$store.dispatch('storeFolder', {folder_name: this.folder_name, room_id: this.room_id, colors: this.logoColors});
        if (saved == true){
          await this.$store.dispatch('getLockerRoomColors')
          this.folder_name = ''
          this.ref['my-modal'].hide();
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
          @media only screen and (min-width: 992px){
            flex: 0 0 78%;
            max-width: 78%;
          }
        }
        .btn{
            flex: 0 0 40%;
            max-width: 40%;
            background: #219f84;
            border-color: #219f84;
          @media only screen and (min-width: 992px){
            flex: 0 0 20%;
            max-width: 20%;
          }
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
