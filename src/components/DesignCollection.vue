<template>
  <b-tabs content-class="mt-3">
    <template v-for="(room, i) in getLockerProducts">
      <b-tab  :key="i" :active="tabIndex === i">
        <template #title>
          <span @click="changeColor">{{room.room_name}}</span>
          <a class="remove-tab" @click="deleteRoom(room.id, i)">
            <font-awesome-icon :icon="['fas', 'trash-alt']"/>
          </a>
        </template>
        <div class="lockerroom-tabs">
          <div>
            <b-card no-body>
              <div>asasdsdasdasdsad</div>
            </b-card>
          </div>
        </div>
      </b-tab>
    </template>
  </b-tabs>
</template>

<script lang="ts">
import {Component, Mixins, Vue, Watch} from 'vue-property-decorator'
    import LockerRoomProducts from '@/components/LockerRoomProducts.vue'
    import CreateLockerRoomModal from '@/components/CreateLockerRoomModal.vue'
    import ErrorMessages from "@/mixins/ErrorMessages";
    import Scene from "@/components/Scene.vue"

@Component<DesignCollection>({
  components: {
    LockerRoomProducts,
    Scene,
    CreateLockerRoomModal
  }
})
export default class DesignCollection extends Mixins(ErrorMessages) {
  private title = '';
  private product_nickname = '';
  private description = 'pre';
  private product_note = '';
  private order_number = '';
  private design = () => this.designCollections();
  private style = {};

  public get designCollections(){
    return this.$store.getters.getDesignCollections
  }

  public addDesignCollections(){
    this.$store.dispatch('addDesignCollection', {
      title: this.title,
      product_nickname: this.product_nickname,
      description: this.description,
      product_note: this.product_note,
      order_number: this.order_number,
      design: this.design(),
      style: this.style,
    })
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
        flex-wrap: nowrap;
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
                  .btn,
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
                    border: none;
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
                margin: 0;
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
                    gap: 35px;
                }
                @media only screen and (min-width: 768px){
                    gap: 25px;
                }
                @media only screen and (min-width: 1200px){
                    gap: 7px;
                }
                @media only screen and (min-width: 1274px){
                    gap: 7px;
                }
              .color-box{
                margin: 0 auto 5px;
              }
            }
        }
        .color-folder-holder{
            overflow-y: auto;
            max-height: 20vh;
            @media only screen and (min-width: 768px){max-height: 50vh;}
        }
    }

    .assets-logo-block{
      position: relative;
      &:hover{
        .use-logo-btn{transform: scale(1);}
      }
    }

    .use-logo-btn{
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1;
      color: #fff;
      text-transform: uppercase;
      font-size: 1.5rem;
      transition: all 0.3s ease;
      transform: scale(0);
      width: 100%;
      border: none;
    }





</style>
