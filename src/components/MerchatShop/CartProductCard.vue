<template>
  <b-card class="product-card w-100">
    <div class="row gap-1">
      <!-- Product Images -->
      <div
        class="product-image rounded text-center me-3 col-auto flex-grow-1 p-3"
      >
        <b-img
          :src="`${storageUrl}${activeImage}`"
          fluid
          alt="Product"
          class="mb-2 product-main-image"
        />
        <div class="d-sm-flex d-none justify-content-center gap-1">
          <b-img
            v-for="(thumb, i) in thumbs"
            :key="i"
            :src="`${storageUrl}${thumb}`"
            thumbnail
            height="40"
            width="40"
            class="cursor-pointer product_thumb"
            :class="{
              active: thumb === activeImage,
            }"
            @click="selectThumb(thumb)"
          />
        </div>
      </div>

      <!-- Product Info -->
      <div class="col-12 col-lg-8  d-flex justify-content-between flex-column product-info">
        <div class="d-flex flex-column gap-1">
          <!-- Title + Delete -->
          <div class="d-flex justify-content-between">
            <h5 class="heading">{{ product.name }}</h5>
            <b-button
              variant="link"
              size="sm"
              class="text-danger p-0"
              @click="removeCard"
            >
              <b-icon icon="trash" class="text-muted"></b-icon>
            </b-button>
          </div>

          <!-- Design ID + Quantity -->
          <div class="d-flex justify-content-between text-muted small">
            <span>Design ID: {{ product.design_id }}</span>
            <span>Total: {{ cumulativeQty }}</span>
          </div>

          <!-- Price -->
            <div class="text-danger fw-bold fs-large">{{cumulativeQty}} x {{ product.price }} =  {{ totalPrice }} {{ currency }}</div>
        </div>

        <!-- Accordions -->
        <div class="accordion" role="tablist">
          <!-- Addons Accordion -->
          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block v-b-toggle="'addons-' + productIndex" class="p-3">
                <span class="text">Addons</span>
                <!-- <span class="accordion-icon"></span> -->
                <b-icon-chevron-down class="accordion-icon" font-scale="0.8" />
              </b-button>
            </b-card-header>
            <b-collapse
              :id="'addons-' + productIndex"
              accordion="product-accordion"
              role="tabpanel"
            >
              <b-card-body>
                <div v-if="product.addons.length">
                  <ul class="w-100">
                    <li v-for="(addon, i) in product.addons" :key="i"  class="d-flex justify-content-between">
                      <span>{{ addon.name }}</span>
                      <span>{{ addon.price }} {{ currency }}</span>
                    </li>
                  </ul>
                </div>
                <div v-else class="text-muted small">No addons available</div>
              </b-card-body>
            </b-collapse>
          </b-card>

          <!-- Detail Accordion -->
          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block v-b-toggle="'detail-' + productIndex" class="p-3">
                <span class="text">Detail</span>
               <b-icon-chevron-down class="accordion-icon" font-scale="0.8" />
              </b-button>
            </b-card-header>
            <b-collapse
              :id="'detail-' + productIndex"
              accordion="product-accordion"
              role="tabpanel"
            >
              <b-card-body>
                <RosterDetailsTable
                  :players="rosters"
                  :sizes="product.sizes"
                  :isCart="true"
                  @updatePlayerField="updatePlayerField"
                  @addPlayer="addPlayerToRoster"
                  @removePlayer="removePlayer"
                  @changeQty="changeQty"
                />
              </b-card-body>
            </b-collapse>

          </b-card>
        </div>
      </div>
    </div>
  </b-card>
</template>

<script lang="ts">
import RosterTabMixin from "@/mixins/RosterTabMixin";
import { Component, Mixins, Prop } from "vue-property-decorator";
import RosterDetailsTable from "./RosterDetailsTable.vue";
import {createDefaultPlayer} from "@/helpers/Helpers";

@Component({
  components: { RosterDetailsTable },
})
export default class CardProductCard extends Mixins(RosterTabMixin) {
  @Prop({ required: true }) readonly product!: any;
  @Prop({required: true}) productIndex!: number
  public storageUrl = process.env.VUE_APP_STORAGE_URL;

  activeImage = "";
  thumbs: string[] = [];

  created() {
    this.activeImage = this.product.front_image ?? "";
    this.thumbs = [this.product.front_image, this.product.back_image].filter(
      Boolean
    );
  }
  get totalPrice() {
    return this.product.roster_detail.reduce(
      (sum, item) => sum + (item.quantity || 0) * this.product.price,
      0
    );
  }
  get rosters() {
    return this.product.roster_detail ?? [];
  }

  get cumulativeQty(): number {
    return this.rosters.reduce((sum, r) => sum + (r.quantity || 0), 0);
  }

  get currency():string{
    return this.$store.getters.getShopCurrency;
  }

  selectThumb(src: string) {
    this.activeImage = src;
  }
  removeCard() {
    this.$store.commit("REMOVE_CART_PRODUCT", {
      index: this.productIndex,
      productId: this.product.id,
    });
  }
  updatePlayerField(payload: {
    index: number;
    key?: string;
    value?: any;
    fields?: Record<string, any>;
  }) {
    const { index, key, value , fields } = payload;
    if (fields && typeof fields === 'object') {
      Object.entries(fields).forEach(([fieldKey, fieldValue]) => {
        this.$store.commit('SET_CART_PRODUCT_UPDATE_PLAYER_FIELD', {
          productIndex: this.productIndex,
          index,
          key: fieldKey,
          value: fieldValue,
        });
      });
    } else if (key !== undefined) {
      this.$store.commit('SET_CART_PRODUCT_UPDATE_PLAYER_FIELD', {
        productIndex: this.productIndex,
        index,
        key,
        value,
      });
    }
  }
  addPlayerToRoster() {
    const newPlayer = createDefaultPlayer(this.product.sizes);
    this.$store.commit("SET_CART_PRODUCT_ADD_PLAYER", {
      productIndex: this.productIndex,
      player: newPlayer,
    });
  }

  removePlayer(index: number) {
    this.$store.commit("SET_CART_PRODUCT_REMOVE_PLAYER", {
      index,
      productIndex: this.productIndex
    });
  }

  changeQty(index: number, change: number) {
    this.$store.commit("SET_CART_PRODUCT_CHANGE_QTY", {
      productIndex: this.productIndex,
      index,
      change,
    });
  }
}
</script>

<style scoped lang="scss">
.product-card {
  background: #fff;
  border: none !important;
  .card-body {
    padding: 0px 1.25rem !important;
  }
}
.product-image {
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 0 1 22%;
  min-width: 180px;
}

.product-main-image {
  width: 100%;
  height: 180px;
  object-fit: contain;
}

.product_thumb {
  padding: 5px;
  border: 0.5px solid #cbcbcb;
  background-color: transparent;
}
.product_thumb.active {
  background-color: #ffffff;
  border: 0.5px solid #000;
}
.cursor-pointer {
  cursor: pointer;
}

.heading {
  font-size: 20px;
  font-weight: 400;
  @media screen and (max-width: 768px) {
    font-size: 16px;
  }
}
.accordion {
  padding: 0px;
  .card {
    border: 0px !important;
    border-bottom: 1px solid #cbcbcb !important;
    &:is(.card-header button.not-collapsed) {
      border: 0px !important;
    }
    .card-header {
      border: none !important;
      background-color: white;
      padding: 0px !important;
      button {
        background-color: white;
        color: black;
        font-size: 18px;
        font-weight: 400;
        border: none;
        display: flex;
        justify-content: space-between;
        padding: 5px !important;
        border-bottom: 1px solid #cbcbcb !important;
        border-radius: 0px !important;
      }
    }
    .card-body {
      padding: 0 !important;
    }
  }
}
</style>
