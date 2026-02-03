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
             <!-- ALL BUTTON -->
              <div class="collar-designs">
                 <div
                    class="text-center"
                    :key="'all-style'"
                    v-if="selectedProduct.merge_styles"
                  >
                    <b-button
                      :class="{ active: designBrowseMode === 'ALL' }"
                      variant="outline-light"
                      @click="setAllMode"
                    >
                      <span class="fw-bold text-dark">All</span>
                    </b-button>
                    <span class="mt-1 d-inline-flex">All</span>
                  </div>
                 <template v-for="(style, i) in selectedProduct.productstyles">
                    <div :key="i+'collar'" class="text-center">
                      <b-button
                       :class="{ active: styleIndex === i && designBrowseMode === 'STYLE' }"
                        variant="outline-light"
                        @click="changeStyleIndex(i)"
                      >
                        <img v-if="style.style_icon_url" :src="storageUrl+style.style_icon_url" />
                        <img v-else :src="storageUrl+style.front_models[0].file_url" />
                      </b-button>
                      <span class="mt-1 d-inline-flex">{{style.name}}</span>
                    </div>
                  </template>
              </div>
          </div>

          <div class="choose-stuff" v-if="selectedProduct.active_addons.length || Object.keys(customizedAddons.grouped_addons).length || customizedAddons.ungrouped_addons.length">
              <h2 class="fw-bold mb-3 fz-18">Addons</h2>
              <div class="stuff-row addons d-block gap-2">
                <template v-if="customizedAddons">
                  <template v-for="(grouped_addons, group_name) in customizedAddons.grouped_addons">
                    <h3>{{group_name}}</h3>
                    <div class="addon d-inline-flex gap-1" style="margin: 6px 8px" :class="{'selected': group_addon.selected}" v-for="(group_addon, gaIdx) in grouped_addons"
                         :key="group_addon.addon_id">
                      <b-form-checkbox size="lg" v-model="group_addon.selected" :name="`group-${group_name}-addon`"
                                       @change="handleAddonSelectionUpdate($event, gaIdx, group_name)">
                        {{ group_addon.sku_id }}
                        <span class="charges" v-if="productPriceObject && productPriceObject?.show_price && group_addon.currencies && group_addon.currencies[0]">+ {{group_addon.currencies[0].symbol}}{{group_addon.currencies[0].price}}</span>
                      </b-form-checkbox>
                    </div>
                  </template>
                  <hr v-if="Object.keys(customizedAddons.ungrouped_addons).length > 0"/>
                  <template v-for="(ungroup_addon, uaIdx) in customizedAddons.ungrouped_addons">
                    <div class="addon d-inline-flex gap-1" style="margin: 6px 8px" :class="{'selected': ungroup_addon.selected}"
                         :key="`ungroupe-${uaIdx}`">
                      <b-form-checkbox size="lg" v-model="ungroup_addon.selected"
                                       @change="handleAddonSelectionUpdate($event, uaIdx)">
                        {{ ungroup_addon.sku_id }}
                        <span class="charges" v-if="productPriceObject && productPriceObject.show_price && ungroup_addon.currencies && ungroup_addon.currencies[0]">+ {{ungroup_addon.currencies[0].symbol}}{{ungroup_addon.currencies[0].price}}</span>
                      </b-form-checkbox>
                    </div>
                  </template>
                </template>

                <template v-if="customizedAddons.ungrouped_addons.length > 0">
                  <hr />
                </template>
                <div class="addon d-inline-flex gap-1" :class="{'selected': addon.selected}" v-for="addon in selectedProduct.active_addons"
                     :key="addon.id">
                  <b-form-checkbox size="lg" v-model="addon.selected"   @change="handleAddonSelectionUpdate">
                    {{ addon.title }}
                    <span class="charges" v-if="productPriceObject && productPriceObject.show_price && addon.currencies && addon.currencies[0]">+ {{addon.currencies[0].symbol}}{{addon.currencies[0].price}}</span>
                  </b-form-checkbox>
                </div>
              </div>
          </div>

          <div v-if="selectedProduct.productstyles[styleIndex]?.logo.length && selectedProduct.productstyles[styleIndex].is_fixed_logos_all == false" class="choose-collar mt-4 mb-3">
            <h2 class="fw-bold mb-2 fz-18">Choose logo position</h2>
            <div class="collar-designs">
              <template v-for="(logo, index) in selectedProduct.productstyles[styleIndex].logo">
                <b-form-radio @change="changeFixedLogo(index)" v-model="logo.is_default" name="logo-position" :value="1">
                  <span class="mt-1 d-inline-flex" :key="'style_name' + index">
                    {{ logo.placement_title }}
                  </span>
                </b-form-radio>
              </template>
            </div>
          </div>
      </div>
    </b-tabs>
</template>

<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import {changeSelectedProduct} from "@/mixins/LockerProduct"
import {
  getProductAddonInfoDefaultObject,
  handleProductPriceUpdate, hideLockerProductUpdateButton,
  lastActiveProductDefaultObject
} from "@/helpers/Helpers";
import Store from "@/store";
    @Component<CollarStyle>({
    })

    export default class CollarStyle extends Mixins(changeSelectedProduct) {
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
      get designBrowseMode():string{
        return this.$store.getters.getDesignBrowseMode
      }

      get company(){
        return this.$store.getters.getCompany
      }

      get sku_information(){
        return this.$store.getters.getSkuInformation
      }

      get productPriceObject() {
        return this.$store.getters.getProductPriceObject
      }

      get customizedAddons() {
        return this.selectedProduct.productstyles[this.styleIndex]? this.selectedProduct.productstyles[this.styleIndex].customized_addons : {grouped_addons: [], ungrouped_addons: {}}
      }
      public async handleAddonSelectionUpdate(val, addon_index=-1, group_name='') {
        if(group_name) {
          this.selectedProduct.productstyles[this.styleIndex].customized_addons.grouped_addons[group_name].forEach((grouped_addon, groupedAddonIndex) => {
            if(val) {
              if(groupedAddonIndex != addon_index) {
                grouped_addon.selected = false;
              }
            }

          })
        }
        await handleProductPriceUpdate()
        await this.updateLastActiveProductAddonsInfo()
        const self: Record<any, any> = this
        self.$eventBus.$emit("addAddons")
        if(addon_index >= 0) {
          hideLockerProductUpdateButton()
        }
      }

      public updateLastActiveProductAddonsInfo() {
        const selected_product = Store.getters.getSelectedProduct
        const last_active_product_data = Store.getters.getLastActiveProductData
        const selected_product_id = selected_product.id
        const addons_info = getProductAddonInfoDefaultObject(selected_product_id)
        const { grouped_addons, ungrouped_addons } = selected_product.productstyles[this.styleIndex].customized_addons;
        selected_product.active_addons.forEach((active_addon: Record<any, any>) => {
          if(active_addon.selected) {
            addons_info[selected_product_id].simple_addons.push(active_addon.addon_id)
          }
        })
        ungrouped_addons.forEach((ungrouped_addon: Record<any, any>) => {
          if(ungrouped_addon.selected) {
            addons_info[selected_product_id].ungrouped_addons.push(ungrouped_addon.addon_id)
          }
        })
        for(const group_name in grouped_addons) {
          grouped_addons[group_name].forEach((grouped_addon: Record<any, any>) => {
            if(grouped_addon.selected) {
              addons_info[selected_product_id].grouped_addons[group_name] = grouped_addon.addon_id
            }
          })
        }
        const last_product_addons_info = last_active_product_data.addons_info
        last_product_addons_info[selected_product_id] = addons_info[selected_product_id]
        this.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", {addons_info: last_product_addons_info})
      }


      public changeFixedLogo(selectedIndex) {
        this.selectedProduct.productstyles[this.styleIndex].logo.forEach((logo, index) => {
          if (index !== selectedIndex) {
            logo.is_default = 0;
          }
        });
        this.$store.commit('SET_FIXED_LOGO_INDEX', selectedIndex);
        this.$store.commit("SET_LAST_ACTIVE_PRODUCT_DATA", { fixed_logo_index: selectedIndex });
        const self: Record<any, any> = this;
        self.$eventBus.$emit("fixedLogoResetAndAdd")
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
.addon{
  align-items: center;
  padding: 6px 8px;
  border-radius: 7px;
  background: #eee;
  border: 1px solid transparent;

  &.selected{
    background: var(--theme-color-light);
    border-color: var(--theme-color);
  }

  label{
    white-space: nowrap;
    display: flex;
    cursor: pointer;
    padding-top: 2px;

    &:before, &:after{
      margin-top: 2px;
    }
  }

  .charges{
    margin-left: 5px;
    padding-left: 5px;
    border-left: 1px solid #ddd;
    color: #666;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
