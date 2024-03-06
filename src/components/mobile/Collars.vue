<template>
  <div>
    <div>
        <div>
          <div class="d-flex align-items-center gap-1">
            <span class="font-weight-bold fs-2">{{ selectedProduct.display_name }}</span>
            <span class="read_more d-inline-flex" style="transition: 0.3s all ease"
                  :style="{'transform': show_read_more ? 'rotate(180deg)': 'rotate(0deg)'}" @click="toggle_read">
              <BIconChevronDown />
            </span>
          </div>
          <div style="max-height: 0; overflow: hidden; transition: 0.5s all ease"
               :style="{'max-height': show_read_more ? '700px': '0'}"
               v-html="sku_information.description">
          </div>
        </div>
    </div>

    <div class="choose-collar mb-3">
      <div v-if="selectedProduct.productstyles.length > 1" class="choose-collar mb-3">
        <h2 class="fw-bold mb-2 fs-2">Choose option</h2>
        <div class="collar-designs">
          <template v-for="(style, i) in selectedProduct.productstyles">
            <template v-if="selectedProduct.productstyles.length > 1">
              <b-button :key="i" :class="{'active': styleIndex === i}" variant="outline-light" @click="changeStyleIndex(i)">
                <template v-if="style.front_models.length > 0">
                  <img v-if="style.style_icon_url" :src="storageUrl+style.style_icon_url" alt="Collar" :key="`style_icon${i}`"
                       style="max-width: 97px; object-fit: contain"/>
                  <img v-else :src="storageUrl+style.front_models[0].file_url"  alt="Collar" :key="`front_style_image${i}`"
                       style="height: 100px; max-width: 97px; object-fit: contain" />
               </template>
              </b-button>
            </template>
          </template>
        </div>
      </div>
    </div>

    <div class="choose-stuff" v-if="selectedProduct.active_addons.length > 0">
      <h2 class="fw-bold mb-3 fz-18">Addons</h2>
      <div class="stuff-row addons d-flex gap-2 pb-2 theme-scroll-h" style="overflow-x: auto">
        <div class="addon d-inline-flex gap-1" :class="{'selected': addon.selected}" v-for="addon in selectedProduct.active_addons"
             :key="addon.id">
          <b-form-checkbox size="sm" v-model="addon.selected"   @change="handleAddonSelectionUpdate">
            {{ addon.title }}
            <span class="charges" v-if="productPriceObject && productPriceObject.show_price">+ {{addon.currencies[0].symbol}}{{addon.currencies[0].price}}</span>
          </b-form-checkbox>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator'
import {changeSelectedProduct} from "@/mixins/LockerProduct"
import {handleProductPriceUpdate} from "@/helpers/Helpers";

@Component<Collars>({
})

export default class Collars extends Mixins(changeSelectedProduct) {
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  private show_read_more = false;

  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }
  get styleIndex():number{
    return  this.$store.getters.getCurrentStyleIndex;
  }
  get sku_information(){
    return this.$store.getters.getSkuInformation
  }

  private toggle_read(){
    this.show_read_more = !this.show_read_more;
  }

  get productPriceObject() {
    return this.$store.getters.getProductPriceObject
  }

  handleAddonSelectionUpdate(): void {
    handleProductPriceUpdate()
  }
}
</script>

<style lang="scss" scoped>
.fontList{
  div{
    color: #999;

    &.activeFont{
      color: #121212;
      font-weight: bold;
    }
  }
}
.selected-color{
  height: 15px;
  width: 15px;
  border-radius: 10000px;
  background: transparent;
  display: inline-block;
  box-shadow: 0px 1px 5px rgba(0,0,0,0.4);
}

.collar-designs{
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: stretch;

  .btn{
    border-color: #ececec;

    &.active{
      animation: border-blink 2s infinite ease-in-out alternate;
    }
  }
}

@keyframes border-blink {
  from{
    border-color: rgba(33, 159, 132, 0.85);
  }
  to{
    border-color: #cbf4eb;
  }
}
</style>
