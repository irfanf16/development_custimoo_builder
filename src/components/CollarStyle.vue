<template>
    <b-tabs>
      <div class="collar-area">
          <div class="collar-description">
              <h3>{{ selectedProduct.display_name }}</h3>
              <div v-html="sku_information.description"></div>
          </div>
        <div v-if="false && selectedProduct.productstyles.length > 1 && company.platform == 'wordpress'" class="choose-collar mb-3">
          <h2 class="fw-bold mb-2 fz-18 d-flex justify-content-between">
            <span>Price from 350DK</span>
            <span class="cursor-pointer theme-color text-underline" @click="()=>viewPrices = true" v-if="!viewPrices"><span class="fs-2">View all prices</span></span>
            <span class="cursor-pointer theme-color text-underline" @click="()=>viewPrices = false" v-else><span class="fs-2">Hide all prices</span></span>
          </h2>
          <div class="price-table" v-if="viewPrices">
            <b-table :items="items" striped small sticky-header head-variant="dark" />
          </div>
        </div>
        <div><hr /></div>
          <div v-if="selectedProduct.productstyles.length > 1" class="choose-collar mb-3">
            <h2 class="fw-bold mb-2 fz-18">Choose option</h2>
              <div class="collar-designs">
                <template v-for="(style, i) in selectedProduct.productstyles">
                  <div :key="i+'collar'" class="text-center">
                      <b-button :key="'front_style_' + i" :class="{'active': styleIndex === i}"
                                variant="outline-light" @click="styleIndex === i ? '' : changeStyleIndex(i)">
                        <img v-if="style.style_icon_url" :src="storageUrl+style.style_icon_url" alt="Collar" :key="'style_icon' + i"/>
                        <img v-else :src="storageUrl+style.front_models[0].file_url" alt="Collar" :key="'front_style_image' + i"/>
                      </b-button>
                      <span class="mt-1 d-inline-flex" :key="'style_name' + i">{{style.name}}</span>
                  </div>
                </template>
              </div>
          </div>
          <div class="choose-stuff" v-if="selectedProduct.addons.length > 0">
              <h2 class="fw-bold mb-3 fz-18">Choose Stuff</h2>
              <div class="stuff-row" v-for="(item, i) in selectedProduct.addons" :key="i">
                  <b-form-checkbox size="lg">{{ item.addon.name }}</b-form-checkbox>
                  <span class="charges">+${{item.addon.price}}</span>
              </div>
          </div>
      </div>
    </b-tabs>
</template>

<script lang="ts">
import {Component, Prop, Vue, Mixins} from 'vue-property-decorator'
import {findIndex} from "lodash";
import {HideUpdateLockerButton} from "@/mixins/SelectedProductMixin";
import {hideLockerProductSaveBtn} from "@/helpers/Helpers";
    @Component<CollarStyle>({
    })

    export default class CollarStyle extends Mixins(HideUpdateLockerButton) {
      private storageUrl = process.env.VUE_APP_STORAGE_URL
      private viewPrices = false
      private items = [
        { quantity: '1 - 3', price_per_item: '433DK' },
        { quantity: '4 - 7', price_per_item: '400DK' },
        { quantity: '8 - 12', price_per_item: '390DK' },
        { quantity: '13 - 17', price_per_item: '350DK' }
      ]

      get selectedProduct(): Record<any, any>{
        return this.$store.getters.getSelectedProduct
      }

      get getLastActiveProductData() {
        return this.$store.getters.getLastActiveProductData
      }

      get styleIndex():number{
        return this.$store.getters.getCurrentStyleIndex;
      }

      get company(){
        return this.$store.getters.getCompany
      }

      get sku_information(){
        return this.$store.getters.getSkuInformation
      }

      public changeStyleIndex(i: number) {
        const currentDesign = this.selectedProduct.productstyles[this.styleIndex].productdesigns.filter((item: Record<any, any>) => {
          return item.design_show
        })
        if(currentDesign.length){
          const design_name = currentDesign[0].design_name
          let designFound = false;
          const newDesign = this.selectedProduct.productstyles[i].productdesigns.forEach((item: Record<any, any>) => {
            if(item.design_name.toLowerCase() == design_name.toLowerCase()) {
              designFound  = true
              Vue.set(item, 'design_show', 1)
              this.$store.dispatch('setSelectedProductDesignID',item.id)
            } else {
              Vue.set(item, 'design_show', 0)
            }
          })
          this.hideLockerProductUpdateButton(true)
          if (!designFound){
            if(!this.selectedProduct.productstyles[i].productdesigns.filter((design: Record<any, any>) => design.design_show).length) {
              this.selectedProduct.productstyles[i].productdesigns.forEach((item:Record<any, any>, index:number) =>{
                if (index ==0 ){
                  Vue.set(this.selectedProduct.productstyles[i].productdesigns[0], 'design_show', 1)
                  this.$store.dispatch('setSelectedProductDesignID',this.selectedProduct.productstyles[i].productdesigns[0].id)
                }else{
                  Vue.set(this.selectedProduct.productstyles[i].productdesigns[index], 'design_show', 0);
                }
              })
            }
          }
        }
        this.$store.commit('CHANGE_STYLE_INDEX', i);
        let design_index = findIndex(this.selectedProduct.productstyles[i].productdesigns, "design_show")
        this.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", {style_index: i, style_id: this.selectedProduct.productstyles[i].id,
          design_index:   design_index, design_id: this.selectedProduct.productstyles[i].productdesigns[design_index].id
        })
        hideLockerProductSaveBtn()
      }
    }
</script>

<style lang="scss">
.collar-section{
  .tabs{
    &>div:first-child{
      margin-bottom: 15px;
      padding-top: 10px;

      &::-webkit-scrollbar {
        height: 3px;
      }

      &::-webkit-scrollbar-track {
        background: #f1f1f1;
      }

      &::-webkit-scrollbar-thumb {
        background: #219F84;
      }

      scrollbar-color: #219F84 #f1f1f1;
      scrollbar-width: thin;

      &>ul{
        display: flex;
        justify-content: flex-start;
        gap: 10px;
        margin-bottom: 0;

        li {
          a {
            //white-space: nowrap;
            position: relative;
            color: #333 !important;

            svg{
              position: absolute;
              top: -5px;
              right: -7px;
              fill: #189076;
              opacity: 0;
              transition: 0.2s all ease;
              background: #fff;
              transition: 0.2s ease-in-out opacity;
              flex-shrink: 0 !important;
            }

            &.active{
              border-color: #189076 !important;
              color: #189076 !important;

              svg{
                opacity: 1;
              }
            }
          }
        }
      }
    }
  }
}

</style>
