<template>
  <div class="product-card">
    <div class="product-card-body">
      <div class="product-image-wrapper">

        <div v-if="loading" class="small-loader">
          <img src="@/assets/images/loading.gif" alt="loading" />
        </div>


        <img  v-show="!loading"  @load="onImageLoad" :src="`${storageUrl}${activeImage}`" class="product-image" />
        <button class="spin-button" @click="toggleImage" v-if="product?.back_image">
          <img src="@/assets/images/rotate-icon.svg" alt="rotator" />
        </button>
      </div>

      <button class="purchase-button" @click="openPurchaseModal">
        Purchase
      </button>
    </div>

    <div class="product-details">
      <div class="product-text-row">
        <h5 class="product-title">{{ product?.name }}</h5>
        <div class="product-price" v-if="getShopInfo?.isPriceVisible">{{ currency }} {{ product?.price }}</div>
      </div>
      <p class="product-description" v-html="product?.description"></p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";



@Component({})
export default class ProductCard extends Vue {
  @Prop({ type: Object, required: true, default: null }) readonly product!: Record<string, any>;
  @Prop({ type: String, required: true }) readonly currency!: string;

  private activeImage = this.product.front_image;
  public storageUrl = process.env.VUE_APP_STORAGE_URL;
  public loading = true;
  formatPrice(value: number): string {
    return `C$${value.toFixed(2)}`;
  }

  public openPurchaseModal(): void {
    this.$emit("openPurchaseModal", this.product);
  }
  public toggleImage(): void {
    this.loading = true;
    this.activeImage =
      this.activeImage === this.product?.front_image
        ? this.product?.back_image
        : this.product?.front_image;
  }
   public onImageLoad(): void {
    this.loading = false;
     console.log("loading", this.loading)
  }

  get getShopInfo(): Record<any, any> {
    return this.$store.getters.getShopInfo;
  }
}
</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  background-color: transparent;
  width: 100%;
}

.product-card-body {
  position: relative;
  background-color: rgba(245, 245, 245, 255);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  padding-bottom: 50px;
  transition: box-shadow 0.3s ease;
  width: 100%;
  height: 330px;
}

.product-card-body:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.product-image-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  flex-grow: 1;
}
.product-image {
  max-width: 100%;
  width: 250px;
  height: auto;
  display: block;
  object-fit: contain;
}

.small-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.small-loader img {
  width: 35px;
  height: 35px;
}

.spin-button {
  position: absolute;
  top: 80%;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 18px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: top 0.3s ease, background-color 0.3s ease;
}

.purchase-button {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 0);
  width: 90%;
  background-color: #000000;
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  opacity: 1;
  visibility: visible;
  transition: opacity 0.3s ease, transform 0.3s ease;
  margin-bottom: 12px;
}

/* Desktop hover behavior - hide by default, show on hover */
@media (min-width: 768px) {
  .purchase-button {
    opacity: 0;
    visibility: hidden;
    transform: translate(-50%, 50%);
  }

  .product-card-body:hover .purchase-button {
    opacity: 1;
    visibility: visible;
    transform: translate(-50%, 0);
  }

  .spin-button {
    top: 100%;
    background-color: rgba(255, 255, 255, 0.7);
  }

  .product-card-body:hover .spin-button {
    top: 80%;
    background-color: rgba(255, 255, 255, 0.9);
  }
}

.product-details {
  padding-top: 24px;
}

.product-text-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-title {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  color: #333;
}

.product-price {
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  color: #333;
}

.product-description {
  font-size: 0.875rem;
  color: #777;
  margin: 4px 0 0;
}

/* @media (min-width: 992px) and (max-width: 1200px) {
  .product-card{
    width: ;
  }
} */
</style>
