<template>
    <b-modal id="modal-center-lockerroom" centered scrollable size="xl" title="Locker Room" content-class="lockerroom-modal">
        <b-tabs content-class="mt-3">
          <template v-for="(room, i) in getLockerProducts">
            <b-tab :title="room.room_name"  :key="i">
                <div class="lockerroom-tabs">
                    <div>
                        <b-card no-body>
                            <b-tabs card changed="currentTabs">
                              <b-tab title="Products">
                                <div class="products-holder d-lg-flex flex-wrap">
                                    <template v-for="(product, ind) in room.product">
                                        <div :key="ind" class="products-block">
                                            <Scen.products-blocke   :canvas-width="300" :canvas-height="360" :front="{textureUrl: apiBaseUrl+'/'+ product.design.front_design.file_url, modelUrl: apiBaseUrl+'/'+ product.style.front.file_url}" :logos="product.style.logo.concat(JSON.parse(product.custom_logos))" />
                                        </div>
                                    </template>
                                </div>
                              </b-tab>
                                <b-tab title="Assets">
                                    <b-card-text>Tab contents 2</b-card-text>
                                </b-tab>
                                <b-tab title="Colors">
                                    <b-card-text>Tab contents 2</b-card-text>
                                </b-tab>
                            </b-tabs>
                        </b-card>
                    </div>
                </div>
            </b-tab>
              </template>

        </b-tabs>
        <!-- <div class="lockerroom-header">
            <div class="locker-opener">
                <a href="#." class="arrow arrow-left"><font-awesome-icon :icon="['fas', 'arrow-left']" /></a>
                <b-button variant="secondary" class="active">Locker 1</b-button>
                <b-button variant="secondary">Locker 2<a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a></b-button>
                <b-button variant="secondary">Locker 3<a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a></b-button>
                <a href="#." class="arrow arrow-right"><font-awesome-icon :icon="['fas', 'arrow-right']" /></a>
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
      get getLockerProducts():Record<any, any>{
        return this.$store.getters.getLockerProducts;
      }
      get products():[Record<any, any>]{
        return this.$store.getters.getProducts
      }
      get lockers():Record<any, any>{
        return  this.$store.getters.getLockers;
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



</style>
