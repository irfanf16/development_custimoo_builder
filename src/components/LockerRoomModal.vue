<template>
    <b-modal ref="locker-modal" id="modal-center-lockerroom" scrollable size="xl" title="Locker Room" content-class="lockerroom-modal">
        <b-tabs content-class="mt-3">
          <template v-for="(room, i) in getLockerProducts">
            <b-tab :key="i">
                <template #title>
                    <span @click="changeColor">{{room.room_name}}</span>
                    <a class="remove-tab" @click="deleteRoom(room.id, i)">
                        <font-awesome-icon :icon="['fas', 'trash-alt']"/>
                    </a>
                </template>
                <div class="lockerroom-tabs">
                    <div>
                        <b-card no-body>
                            <b-tabs card changed="currentTabs">
                              <b-tab title="Products">
                                <div class="products-holder d-lg-flex flex-wrap">
                                    <template v-for="(product, ind) in room.product">
                                        <div :key="ind" class="products-block">
                                            <div class="image-holder">
                                          <a>
                                            <Scene :measurement-ratio="product.design.measurement_ratio"
                                              :front="{textureUrl: apiBaseUrl+'/'+ product.design.front_design.file_url, modelUrl: apiBaseUrl+'/'+ product.style.front.file_url}"
                                                :backTextureUrl="product.design.back_design? product.design.front_design.file_url: ''" :lockerDefaultColors="JSON.parse(product.defaultcolors)"
                                                 :lockerGroupColors="JSON.parse(product.groupcolors)" :logos="product.style.logo.concat(JSON.parse(product.custom_logos))" :productNamesSetting="product.productnames"  />
                                          </a>
                                          <ul class="product-icons">
                                                <li>
                                                    <a class="remove" @click="deleteProduct(i, ind, product.id)"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                                                </li>
                                                <li class="d-none d-lg-block">
                                                    <a :id="'share'+ind"><font-awesome-icon :icon="['fas', 'share-alt']" /></a>
                                                    <b-tooltip :target="'share'+ind" custom-class="share-tooltip" placement="bottom">
                                                        <div class="share-holder">
                                                            <h3>Copy link and Share</h3>
                                                            <div class="share-form">
                                                                <b-form inline>
                                                                    <b-form-input
                                                                    placeholder="https://www.aha.io/roadmapping/guide/product-management/what-is-a-product"
                                                                    ></b-form-input>
                                                                    <b-button variant="primary">Copy Link</b-button>
                                                                </b-form>
                                                            </div>
                                                        </div>
                                                    </b-tooltip>
                                                </li>
                                                <li class="d-none d-lg-block">
                                                    <a @click="editProduct(i, ind)"><font-awesome-icon :icon="['fas', 'edit']" /></a>
                                                </li>
                                            </ul>
                                          </div>
                                          <div class="d-none d-lg-block product-description text-center">
                                                <p>{{ product.product_name }}</p>
                                            </div>

                                        </div>
                                    </template>
                                </div>
                              </b-tab>
                                <b-tab title="Assets" class="assets-file">
                                  <template v-for="(logo, inda) in room.logos">
                                    <div :key="inda">
                                      <img :src="apiBaseUrl+'/'+logo.logo_url "/>
                                    </div>
                                  </template>
                                </b-tab>
                                <b-tab title="Colors">
                                    <div class="d-flex flex-wrap justify-content-between lockerroom-color-folders">
                                        <div class="pt-lg-2 folder-wrapper">
                                            <h3 class="w-100 d-block mb-3 mb-lg-4 text-bold">Select Folder</h3>
                                            <div class="d-flex flex-wrap color-folder-holder">
                                                <template v-for="(folder, inde) in room.folders">
                                                    <a href="#" class="text-center d-block" @click="fetchColors(inde, i)" :key="inde">
                                                        <font-awesome-icon :icon="['fas', 'folder']"/>
                                                        <span class="folder-name d-block">{{ folder.folder_name }}</span>
                                                    </a>
                                                </template>
                                            </div>
                                        </div>
                                        <div class="color-holder" v-if="colors.length > 0">
                                            <div class="color-container">
                                            <template v-for="(item, ix) in colors">
                                                <div class="color-box"
                                                    :style="{backgroundColor: item.hex}" :key="`${ix}`">
                                                </div>
                                            </template>
                                            </div>
                                        </div>
                                    </div>
                                </b-tab>
                            </b-tabs>
                        </b-card>
                    </div>
                </div>
            </b-tab>
              </template>
          <div class="create-lockerroom">
            <b-button class="create-btn" variant="secondary" v-b-modal.modal-center-createlockerroom><span>Create New </span>+</b-button>
            <CreateLockerRoomModal />
          </div>
        </b-tabs>
        <!-- <div class="lockerroom-header">
            <div class="locker-opener">
                <a href="#" class="arrow arrow-left"><font-awesome-icon :icon="['fas', 'arrow-left']" /></a>
                <b-button variant="secondary" class="active">Locker 1</b-button>
                <b-button variant="secondary">Locker 2<a class="remove" href="#"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a></b-button>
                <b-button variant="secondary">Locker 3<a class="remove" href="#"><font-awesome-icon :icon="['fas', 'trash-alt']" /></a></b-button>
                <a href="#" class="arrow arrow-right"><font-awesome-icon :icon="['fas', 'arrow-right']" /></a>
            </div>
            <div class="create-lockerroom">
                <b-button class="create-btn" variant="secondary"><span>Create New </span>+</b-button>
            </div>
        </div> -->
    </b-modal>
</template>

<script lang="ts">

    import { Component, Vue } from 'vue-property-decorator'
    import LockerRoomProducts from '@/components/LockerRoomProducts.vue'
    import CreateLockerRoomModal from '@/components/CreateLockerRoomModal.vue'
    import Scene from "@/components/Scene.vue"
    @Component<CustomizationPreviewProcess>({
        components: {
          LockerRoomProducts,
          Scene,
          CreateLockerRoomModal
        }
    })
    export default class CustomizationPreviewProcess extends Vue {
      public apiBaseUrl = process.env.VUE_APP_API_BASE_URL
      public ref = this.$refs as Record<any, any>
      public colors : [] = []
      get getLockerProducts():Record<any, any>{
        return this.$store.getters.getLockerProducts;
      }
      get products():[Record<any, any>]{
        return this.$store.getters.getProducts
      }
      get lockers():Record<any, any>{
        return  this.$store.getters.getLockers;
      }
      get selectedProduct(): Record<any, any>{
        return this.$store.getters.getSelectedProduct
      }

      public async editProduct(lockerIndex: number, productIndex: number){
        const product_id = this.getLockerProducts[lockerIndex].product[productIndex].product_id;
        const element = this.getLockerProducts[lockerIndex].product[productIndex];
        let res = await this.$store.dispatch('ADD_CUSTOMIZED_PRODUCT', product_id);
        if (res == true){
          let ind = this.products.length - 1;
          await this.$store.dispatch('setSelectedIndex', {selectedIndex:ind});
          let selectedIndex = this.selectedProduct.productstyles.findIndex((x:Record<any, any>) => x.id === element.style_id);
          await this.$store.commit('CHANGE_STYLE_INDEX', selectedIndex);
          await  this.$store.dispatch('OVERRIDE_CUSTOM_LOGOS', JSON.parse(element.custom_logos));
          await  this.$store.dispatch('OVERRIDE_CUSTOM_TEXT', JSON.parse(element.text));
          await  this.$store.dispatch('overRideDefaultColors', JSON.parse(element.defaultcolors));
          await  this.$store.dispatch('overRideGroupColors', JSON.parse(element.groupcolors));
          this.selectedProduct.productstyles[selectedIndex].productdesigns.forEach((item: Record<any, any>) => {
            if (item.id == element.design_id){
              Vue.set(item, 'design_show', 1)
            }else{
              Vue.set(item, 'design_show', 0)
            }
          });
          this.ref['locker-modal'].hide();
       }
      }
      public async deleteProduct(i:number, ind:number, id:number){
        await this.$store.dispatch('deleteRoomProduct', {room_index: i, product_index: ind, id:id});
      }
      public async deleteRoom(id:number, index:number){
        if (confirm('You are going to delete associated product')) {
          await this.$store.dispatch('deleteRoom', {id: id, index: index});
        }
      }
      public fetchColors(i:number, ind:number){
        this.colors = []
      this.colors = JSON.parse(this.getLockerProducts[ind].folders[i].color);
      }
      public changeColor(){
        this.colors = []
        alert("selected");
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

.products-holder{
        width: 100%;
        overflow-x: auto;
        white-space: nowrap;
        padding-top: 7px;
        @media only screen and (min-width: 992px){
            width: 100%;
            overflow-x: hidden;
            white-space: normal;
            padding-top: 0;
        }
        .products-block{
            flex: 0 0 22%;
            margin: 0 0.3rem 10px;
            display: inline-block;
            @media only screen and (min-width: 992px){
                margin: 0 0.6rem 25px;
                max-width: 22%;
            }
            @media only screen and (min-width: 1199px){
                flex: 0 0 18%;
                max-width: 18%;
            }
            .image-holder{
                position: relative;
                margin: 0 0 15px;
                @media only screen and (min-width: 992px){overflow: hidden;}
                img{
                    display: block;
                    max-width: 100%;
                    margin: 0 auto;
                    height: auto;
                }
                .product-icons{
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    position: absolute;
                    right: -5px;
                    top: -5px;
                    z-index: 1;
                    @media only screen and (min-width: 992px){
                        right: 5px;
                        top: 5px;
                    }
                    li{
                        display: block;
                        margin: 0 0 5px;
                    }
                    a{
                        display: flex !important;
                        flex-wrap: wrap;
                        justify-content: center;
                        align-items: center;
                        width: 20px !important;
                        height: 20px;
                        font-size: 9px;
                        color: #219f84;
                        background: #fff;
                        border-radius: 50%;
                        cursor: pointer;
                        @media only screen and (min-width: 992px){
                            width: 30px !important;
                            height: 30px;
                            font-size: 14px;
                        }
                        &.remove{
                            background: #F8E1E2;
                            color: #D53943;
                        }
                    }
                }
            }

        }
    }

    .products-holder{
        width: 100%;
        overflow-x: auto;
        white-space: nowrap;
        padding-top: 7px;
        @media only screen and (min-width: 992px){
            width: 100%;
            overflow-x: hidden;
            white-space: normal;
            padding-top: 0;
        }
        .products-block{
            flex: 0 0 22%;
            max-width: 22%;
            margin: 0 0.3rem 10px;
            display: inline-block;
            @media only screen and (min-width: 992px){
                margin: 0 0.6rem 25px;
            }
            @media only screen and (min-width: 1199px){
                flex: 0 0 18%;
                max-width: 18%;
            }
            .image-holder{
                position: relative;
                margin: 0 0 15px;
                @media only screen and (min-width: 992px){overflow: hidden;}
                img{
                    display: block;
                    max-width: 100%;
                    margin: 0 auto;
                    height: auto;
                }
                .product-icons{
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    position: absolute;
                    right: -5px;
                    top: -5px;
                    z-index: 1;
                    @media only screen and (min-width: 992px){
                        right: 5px;
                        top: 5px;
                    }
                    li{
                        display: block;
                        margin: 0 0 5px;
                    }
                    a{
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: center;
                        align-items: center;
                        width: 20px;
                        height: 20px;
                        font-size: 9px;
                        color: #219f84;
                        background: #fff;
                        border-radius: 50%;
                        @media only screen and (min-width: 992px){
                            width: 30px;
                            height: 30px;
                            font-size: 14px;
                        }
                        &.remove{
                            background: #F8E1E2;
                            color: #D53943;
                        }
                    }
                }
            }
        }
    }
    .lockerroom-color-folders{
        position: relative;
        .folder-wrapper{
            flex: 0 0 50%;
            max-width: 50%;
            @media only screen and (min-width: 1200px){
                flex: 0 0 70%;
                max-width: 70%;
            }
            h3{
                font-weight: 600;
                @media only screen and (min-width: 992px){
                font-size: 20px;
                }
            }
            a{
                margin: 0 10px 12px;
                font-size: 10px;
                flex: 0 0 38%;
                max-width: 38%;
                @media only screen and (min-width: 768px){
                    font-size: 10px;
                    flex: 0 0 19%;
                    max-width: 19%;
                }
                @media only screen and (min-width: 1200px){
                    font-size: 14px;
                    flex: 0 0 13%;
                    max-width: 13%;
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
        .color-holder{
            flex: 0 0 45%;
            max-width: 45%;
            position: absolute;
            right: 0;
            top: 0;
            width: 100%;
            height: 100%;
            max-height: 180px;
            @media only screen and (min-width: 768px){
                max-height: 300px;
                top: 50%;
                transform: translateY(-50%);
            }
            @media only screen and (min-width: 1200px){
                flex: 0 0 25%;
                max-width: 25%;
            }
            &::-webkit-scrollbar{
                display: none;
            }
            .color-container{
                gap: 7px;
                @media only screen and (min-width: 410px){
                    gap: 16px;
                }
                @media only screen and (min-width: 768px){
                    gap: 5px;
                }
                @media only screen and (min-width: 1024px){
                    gap: 9px;
                }
                @media only screen and (min-width: 1200px){
                    gap: 7px;
                }
                @media only screen and (min-width: 1274px){
                    gap: 16px;
                }
                @media only screen and (min-width: 1274px){
                    gap: 16px;
                }
            }
        }
        .color-folder-holder{
            overflow-y: auto;
            max-height: 20vh;
            @media only screen and (min-width: 768px){max-height: 50vh;}
        }
    }





</style>
