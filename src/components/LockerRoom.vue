<template>
  <b-tabs content-class="mt-3">
    <template v-for="(room, i) in getLockerProducts">
      <b-tab :key="i" :active="tabIndex === i">
        <template #title>
          <span @click="changeColor">{{ room.room_name }}</span>
          <a class="remove-tab" @click="deleteRoom(room.id, i)">
            <font-awesome-icon :icon="['fas', 'trash-alt']"/>
          </a>
        </template>
        <div class="lockerroom-tabs">
          <div>
            <b-card no-body>
              <b-tabs card changed="currentTabs">
                <b-tab title="Products">
                  <div class="products-holder d-lg-flex flex-lg-wrap">
                    <template v-for="(product, ind) in room.product">
                      <div :key="ind" class="products-block">
                        <div class="image-holder">
                          <a>
                            <Scene :measurement-ratio="product.design.measurement_ratio"
                                   :front="{textureUrl: storageUrl+product.design.front_design.file_url, modelUrl: storageUrl+product.style.front.file_url}"
                                   :backTextureUrl="product.design.back_design? product.design.back_design.file_url: ''"
                                   :lockerDefaultColors="JSON.parse(product.defaultcolors)"
                                   :lockerGroupColors="JSON.parse(product.groupcolors)"
                                   :logos="product.style.logo.concat(JSON.parse(product.custom_logos))"
                                   :productNamesSetting="product.productnames" :canvasSelection="false"/>
                          </a>
                          <ul class="product-icons">
                            <li>
                              <a class="remove" @click="deleteProduct(i, ind, product.id)">
                                <font-awesome-icon :icon="['fas', 'trash-alt']"/>
                              </a>
                            </li>
                            <li>
                              <b-button :id="'share'+ind"
                                        @click="product.shared_url === undefined || product.shared_url === null  ? shareProduct(product, ind, i): ''">
                                <font-awesome-icon :icon="['fas', 'share-alt']"/>
                              </b-button>
                              <b-tooltip :target="'share'+ind" custom-class="share-tooltip" placement="bottom"
                                         triggers="focus">
                                <div class="share-holder">
                                  <h3>Copy link and Share</h3>
                                  <div class="share-form">
                                    <b-form inline>
                                      <b-form-input :id="'copy-'+ind"
                                                    :value="product.shared_url !== 'undefined'  ?  baseUrl + product.shared_url : ''"

                                      ></b-form-input>
                                      <b-button variant="primary" @click="copyLink(product, ind) ">Copy Link</b-button>
                                    </b-form>
                                  </div>
                                </div>
                              </b-tooltip>
                            </li>
                            <li class="d-none d-lg-block">
                              <a @click="editProduct(i, ind)">
                                <font-awesome-icon :icon="['fas', 'edit']"/>
                              </a>
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
                    <div :key="inda" class="assets-logo-block">
                      <img :src="storageUrl+logo.logo_url "/>
                      <button @click="addToCustomLogos(logo)" class="use-logo-btn">Use</button>
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
                    <div class="color-holder" v-if="colors">
                      <div class="color-container">
                        <template v-for="(item, ix) in colors">
                          <div :key="`item_${ix}`">
                            <div class="color-box"
                                 :style="{backgroundColor: item.value}" :key="`${ix}`">
                            </div>
                            <span> {{ item.name }} </span>
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
      <b-button class="create-btn" variant="secondary" v-b-modal.modal-center-createlockerroom><span>Create New </span>+
      </b-button>
      <CreateLockerRoomModal @lockerAdded="lockerAdded"/>
    </div>
  </b-tabs>
</template>

<script lang="ts">
import {Component, Mixins, Vue, Watch} from 'vue-property-decorator'
    import LockerRoomProducts from '@/components/LockerRoomProducts.vue'
    import CreateLockerRoomModal from '@/components/CreateLockerRoomModal.vue'
    import ErrorMessages from "@/mixins/ErrorMessages";
    import Scene from "@/components/Scene.vue"

@Component<LockerRoom>({
  components: {
    LockerRoomProducts,
    Scene,
    CreateLockerRoomModal
  }
})
export default class LockerRoom extends Mixins(ErrorMessages) {
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  private baseUrl = location.host + '/#/'
  public ref = this.$refs as Record<any, any>
  public colors: [] = []
  public tabIndex = 0
  public url = ''

  get getLockerProducts (): Record<any, any> {
    return this.$store.getters.getLockerProducts
  }

  get products (): [Record<any, any>] {
    return this.$store.getters.getProducts
  }

  get customLogos (): [Record<any, any>] {
    return this.$store.getters.getCustomLogos
  }

  get lockers (): Record<any, any> {
    return this.$store.getters.getLockers
  }

  get selectedProduct (): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get customer (): Record<any, any> {
    return this.$store.getters.getCustomer
  }

  public lockerAdded () {
    setTimeout(() => {
      let index = this.getLockerProducts.length - 1
      this.tabIndex = index
    }, 1000)
  }

  public showLockerRoomModal () {
    this.ref['locker-modal'].show()
  }

  public async editProduct (lockerIndex: number, productIndex: number) {
    const product_id = this.getLockerProducts[lockerIndex].product[productIndex].product_id
    const element = this.getLockerProducts[lockerIndex].product[productIndex]
    let res = await this.$store.dispatch('ADD_CUSTOMIZED_PRODUCT', product_id)
    if (res == true) {
      let ind = this.products.length - 1
      await this.$store.dispatch('setSelectedIndex', { selectedIndex: ind })
      let selectedIndex = this.selectedProduct.productstyles.findIndex((x: Record<any, any>) => x.id === element.style_id)
      await this.$store.commit('CHANGE_STYLE_INDEX', selectedIndex)
      await this.$store.dispatch('OVERRIDE_CUSTOM_LOGOS', JSON.parse(element.custom_logos))
      await this.$store.dispatch('OVERRIDE_CUSTOM_TEXT', JSON.parse(element.text))
      await this.$store.dispatch('overRideDefaultColors', JSON.parse(element.defaultcolors))
      await this.$store.dispatch('overRideGroupColors', JSON.parse(element.groupcolors))
      await this.$store.dispatch('setColorSectionVisibility')
      this.selectedProduct.productstyles[selectedIndex].productdesigns.forEach((item: Record<any, any>) => {
        if (item.id == element.design_id) {
          Vue.set(item, 'design_show', 1)
          this.$store.dispatch('setSelectedProductDesignID', item.id)
        } else {
          Vue.set(item, 'design_show', 0)
        }
      })
      this.ref['locker-modal'].hide()
    }
  }

  public async shareProduct (product: Record<any, any>, ind: number, lockerIndex: number) {
    try {
      let payload = {
        type: 'locker',
        id: product.id,
        customer_id: this.customer ? this.customer.id : '',
        product_id: this.selectedProduct.product_id
      }
      let shared_url = ''
      if (product.shared_url) {
        shared_url += product.shared_url
      } else {
        let res = await this.$store.dispatch('shareProduct', payload)
        shared_url += res.data.url
        Vue.set(this.getLockerProducts[lockerIndex].product[ind], 'shared_url', shared_url)
      }
    } catch (error) {
      console.log(error)
    }
  }

  public copyLink (product: Record<any, any>, ind: number) {
    let testingCodeToCopy = document.querySelector('#copy-' + ind) as Record<any, any>
    testingCodeToCopy.select()
    try {
      document.execCommand('copy')
      this.showToast('Shareable link was copied to your clipboard.', 'SUCCESS')
    } catch (err) {
      alert('Oops, unable to copy')
    }
  }

  public async deleteProduct (i: number, ind: number, id: number) {
    await this.$store.dispatch('deleteRoomProduct', {
      room_index: i,
      product_index: ind,
      id: id
    })
  }

  public async deleteRoom (id: number, index: number) {
    if (confirm('You are going to delete associated product')) {
      await this.$store.dispatch('deleteRoom', {
        id: id,
        index: index
      })
      this.showToast('Room Deleted', 'SUCCESS')
    }
  }

  public fetchColors (i: number, ind: number) {
    this.colors = JSON.parse(this.getLockerProducts[ind].folders[i].color)
  }

  public changeColor () {
    this.colors = []
  }

  public addToCustomLogos (currentLogo: Record<any, any>) {
    if (this.customLogos.length < this.selectedProduct.allowed_logos_count) {
      let index = this.customLogos.length
      let logo = {
        id: currentLogo.id,
        url: currentLogo.logo_url,
        width: this.selectedProduct.logos_setting[index].width,
        height: this.selectedProduct.logos_setting[index].height,
        x_axis: this.selectedProduct.logos_setting[index].x_axis,
        y_axis: this.selectedProduct.logos_setting[index].y_axis,
        rotation: this.selectedProduct.logos_setting[index].rotation as number,
        haveControls: Boolean(!this.selectedProduct.logos_setting[index].is_locked),
        side: this.selectedProduct.logos_setting[index].side,
        customLogo: true,
        is_transparent: false
      }
      this.$store.dispatch('setCustomLogos', logo)
    } else {
      alert('logo upload limit exceed')
    }
    this.ref['locker-modal'].hide()

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
