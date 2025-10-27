<template>
  <div class="merchant-shop">
    <div class="loader" v-if="showLoader"><img style="width: 100px" src="@assets/images/loading.gif" /></div>
    <header>
      <div class="icons">
        <BIcon v-if="!showSearch" icon="search" class="text-white" @click="handleSearchClick" :class="{ 'opacity-50 cursor-not-allowed': isPurchaseModalOpen || isCartModalOpen }" />
         <div v-else style="max-width: 250px; width: 80%; flex-shrink: 1;" class="search-bar">
          <b-input-group>
              <b-form-input
                v-model="searchQuery"
                 type="text"
                 style="height: 33px;"
                 placeholder="Search"
                 @input="handleSearchQueryChange"
                 @keyup.enter="handleSearchQueryChange"
                 :disabled="isPurchaseModalOpen && isCartModalOpen"
             />
            <template #append>
            <b-input-group-text
              style="height: 33px; cursor: pointer"
              >
            <strong class="text-secondary" @click="toggleSearch">X</strong>
            </b-input-group-text>
          </template>
          </b-input-group>
          </div>
        <span @click="openShopCartModal" class="icon">
          <font-awesome-icon
            :icon="['fas', 'cart-arrow-down']"
            class="text-white"
          />
          <span class="notification-counter"> {{ cartItemsCount }}</span></span
        >
    </div>
    </header>

    <div class="media-container">
  <div
    v-if="shopNotExists"
    class="empty-shop-background"
  />
  <div v-else>
    <CoverPhoto
      :coverPhoto="shopCover"
    >
      <template #shop-name>
        <ShopName :name="shopName" />
      </template>
    </CoverPhoto>

    <div class="profile-info-container">
      <div class="profile-content">
         <div v-if="isInitialLoading || !shopLogo" class="logo-placeholder"></div>
         <MerchantLogo
           v-else
           :logo="shopLogo"
         ></MerchantLogo>
      </div>
    </div>
  </div>
</div>
    <div class="container product-section pb-5">
      <div class="row gap-y-4" v-if="products.length">
        <div
          v-for="(product, index) in products"
          :key="index"
          class="col-lg-4 col-md-6 col-12"
        >
          <ProductCard :key="`product-${index}-card-${Math.random()}`"
            @openPurchaseModal="(prod) => openPurchaseModal(prod)"
            :product="product" :currency="currency"
          />
        </div>
      </div>
        <div
          v-if="products.length === 0"
          class="col-12 text-center py-5"
          style="font-weight: bold;"
        >
          <h1 class="text-muted">No products found.</h1>
      </div>
    </div>
    <PurchaseModal
      ref="purchaseModal"
      :product="currentProduct"
      @addToCart="addToCart"
      @resetProduct="resetProduct"
      @hide="isPurchaseModalOpen = false"
    />
    <ShopCartModal ref="shopCartModal" @openLoginModal="openLoginModal" @hide="isCartModalOpen = false" />
    <PasswordModal  ref="passwordModal" @submit="verifyPassword"  :MerchantShopData="MerchantShopData"/>
    <EmptyShopModal :shopMessage="shopMessage"  ref="emptyShopModal"/>
    <MerchantLoginForm ref="MerchantLoginFormModal" />
  </div>
</template>

<script lang="ts">
import CoverPhoto from "@/components/MerchatShop/MerchantCoverphoto.vue";
import MerchantLogo from "@/components/MerchatShop/MerchantLogo.vue";
import ProductCard from "@/components/MerchatShop/MerchantProductCard.vue";
import PurchaseModal from "@/components/MerchatShop/MerchantPurchaseModal.vue";
import ShopName from "@/components/MerchatShop/MerchantShopName.vue";
import ShopCartModal from "@/components/MerchatShop/ShopCartModal.vue";
import PasswordModal from "@/components/MerchatShop/MerchantPasswordModal.vue";
import MerchantLoginForm from "@/components/MerchatShop/MerchantLoginForm.vue";
import { BIcon } from "bootstrap-vue";
import {Component, Mixins, Vue} from "vue-property-decorator";
import {http} from "@/httpCommon";
import EmptyShopModal from "@/components/MerchatShop/EmptyShopModal.vue";
import ErrorMessages from "@/mixins/ErrorMessages";
import {handleResponseException} from "@/helpers/Helpers";


@Component({
  components: {
    CoverPhoto,
    MerchantLogo,
    ShopName,
    ProductCard,
    PurchaseModal,
    ShopCartModal,
    PasswordModal,
    MerchantLoginForm,
    EmptyShopModal
  },
})
export default class MerchantShop extends  Mixins(ErrorMessages) {
  products: Record<string, any> = []
  public showLoader = false
  public currentProduct: Record<string, any> | null = null;
  public slug = "";
  public shopName = "";
  public currency = "";
  public shopMessage = "";
  public shopCover = "";
  public shopLogo = "";
  public showSearch = false;
  public searchQuery = "";
   public isInitialLoading = true;
  public shopNotExists = false;
  public searchTimer:ReturnType<typeof setTimeout>;
  public isPurchaseModalOpen = false;
  public MerchantShopData: Record<string, any> = {};
  public isCartModalOpen = false;



  async created() {
    this.slug = this.$route.params.slug;
    await this.fetchShopProducts(null);
    this.rebuildProducts()
  }

  get shopCartItems(): Record<any, any> {
    return this.$store.getters.getShopCartItems;
  }
  public handleSearchQueryChange() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.fetchShopProducts();
    }, 500);
  }

  public async fetchProducts(password: string | null = null) {
    this.showLoader = true;
    const headers: Record<string, string> = {};
    const savedPassword = localStorage.getItem("shopAccessToken");
    if (savedPassword && !password) {
      headers["X-Shop-Password"] = savedPassword;
    } else if (password) {
      headers["X-Shop-Password"] = password;
    }
    let url = `/customer/shop/${this.slug}`
    if(this.searchQuery) {
      url += `?search=${this.searchQuery}`
    }
    return http.get(url, { headers })
      .then(({data}) => {
        const response = data.result
        if (response.status !== "live") {
          if (password) (this.$refs.passwordModal as any).hide();
          (this.$refs.emptyShopModal as any).show();
          this.products = [];
          this.shopNotExists = true;
          return;
        }
        this.shopName = response.name
         if (this.isInitialLoading) {
          this.shopCover = response.cover_photo
          this.shopLogo = response.logo
          this.isInitialLoading = false
        }
        const shopInfo = {
          name: response.name,
          logo: response.logo,
        };
        this.$store.commit("SET_SHOP_INFO", shopInfo);
        this.products = response.products;
        this.currency = response.currency?.symbol
        if(this.currency){
          this.$store.commit("SET_SHOP_CURRENCY", this.currency)
        }
        if (password) {
          localStorage.setItem("shopAccessToken", password);
        }
        (this.$refs.passwordModal as any).hide();
      }).catch((err) => {
      switch (err.response?.status) {
        case 400:{
          this.MerchantShopData = err?.response?.data?.shop
          this.$nextTick(() => {
            (this.$refs.passwordModal as any).show();
            });
          break;
        }
        case 403:{
          this.showToast(err.response.data.message, 'error')
          localStorage.removeItem("shopAccessToken")
          this.$nextTick(() => {
            (this.$refs.passwordModal as any).show();
          });
          break;
        }
        case 404:{
          (this.$refs.emptyShopModal as any).show();
          this.shopMessage = err.response.data.message
          this.shopNotExists = true;
          break;
        }
        default:{
          this.showToast(err.response.data.message, 'error')
        }
      }
    }).finally(()=>{
      this.showLoader = false
    });
  }
  async fetchShopProducts(password: string | null = null) {
    return this.fetchProducts(password)
  }
  private validateRoster(product: any, roster: any[]) {
    const validRoster: any[] = [];
    roster.forEach((r) => {
      const sizeData = product.sizes.find((s: any) => s.name === r.size);
      if (!sizeData) {
        return;
      }
      if (!product.manage_inventory &&  product.product_locker_room_id) {
        validRoster.push(r);
      } else if (product.manage_inventory && sizeData.stock >= r.quantity) {
        validRoster.push(r);
      } else {
        console.warn(
          `Removed roster for size ${r.size}, qty=${r.quantity}, stock=${sizeData.stock}`
        );
      }
    });
    return validRoster;
  }
  private rebuildProducts():void{
    if (localStorage.getItem('orderJustPlaced')) {
      localStorage.removeItem('orderJustPlaced');
      localStorage.removeItem('cartData');
      return;
    }
    this.$store.commit("EMPTY_CART_ONLY");
    const shopCartItems = this.shopCartItems
    if (!shopCartItems || shopCartItems.length === 0) {
      return;
    }
    if(shopCartItems.length > 0){
      shopCartItems.forEach((item: any) => {
        const product = this.products.find(p => p.id === item.shop_product_id);
        if (product) {
          // const validatedRoster = this.validateRoster(product, item.roster_details);
          const cart_product = {
            ...product,
            sizes: product.sizes || [],
            selected_size: item.selected_size,
            roster_detail: item.roster_details,
            existingCart: true,
            cart_uid: Date.now() + Math.random()
          };
          this.$store.commit("SET_SHOP_PRODUCTS_CART_REBUILD", cart_product);
        }
      });
    }
  }
  public async verifyPassword(password: string) {
    await this.fetchShopProducts(password);
  }
  public openPurchaseModal(product: Record<any, any>): void {
    this.showSearch = false;
    this.isPurchaseModalOpen = true;
    this.currentProduct = product;
    (this.$refs.purchaseModal as any).show();
  }
 public resetProduct(): void{
   this.currentProduct = null
 }
  public handleSearchClick(): void {
    if (this.isPurchaseModalOpen || this.isCartModalOpen) return;
      this.toggleSearch();
  }
  public toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      if (this.searchQuery !== "") {
        this.handleSearchQueryChange();
      }
      this.searchQuery = "";
    }

  }
  public addToCart(): void {
      (this.$refs.purchaseModal as any).hide();
      this.isPurchaseModalOpen = false;
      this.isCartModalOpen = true;
      (this.$refs.shopCartModal as any).show();
  }
  public openShopCartModal(): void {
    this.isCartModalOpen = true;
    (this.$refs.shopCartModal as any).show();
  }

  public openPasswordModal(): void {
    (this.$refs.passwordModal as any).show();
  }

  public openLoginModal(): void {
    (this.$refs.shopCartModal as any).hide();
    this.isCartModalOpen = false;
    (this.$refs.MerchantLoginFormModal as any).show();
  }
  get cartItemsCount(): number {
    return this.$store.getters.getCurrentShopCart.products.length ?? 0;
  }
  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }
}
</script>

<style scoped>
.empty-shop-background {
  width: 100%;
  height: 250px;
  background: #c8c8c8;
  border-radius: 6px;
}

.cover-photo-placeholder,
.logo-placeholder {
  background: #e5e5e5;
  position: relative;
  overflow: hidden;
}

.cover-photo-placeholder {
  width: 100%;
  height: 250px;
  border-radius: 6px;
}

.logo-placeholder {
  width: 120px;
  height: 120px;
  margin-left: 3rem;
  border: 3px solid #fff;
}



.loader {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  z-index: 1030;
}
.merchant-shop {
  width: 100%;
}

.profile-info-container {
  position: relative;
  margin-top: -4rem;
  padding: 0 1rem;
}

.media-container {
  position:relative;
  top:-50px
}

.profile-content {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
}

.product-section {
  margin-top: 2rem;
}

@media (min-width: 640px) {
  .profile-info-container {
    margin-top: -5rem;
    padding: 0 1.5rem;
  }
  .profile-content {
    gap: 1.5rem;
  }
}

@media (min-width: 768px) {
  .profile-info-container {
    margin-top: -6rem;
    padding: 0 2rem;
  }
  .profile-content {
    gap: 1.5rem;
  }
}

@media (max-width: 767px) {
  .search-bar .input-group {
    border: 2px solid #e0e0e0;
    border-radius: 50px;
    overflow: hidden;
    margin-top: 71px;
    background: transparent;
    opacity: 0.9;
    transition: all 0.3s ease-in-out;
  }
}

header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #00000060;
  height: 50px;
  display: flex;
  justify-content: flex-end;
}

header .icons {
  display: flex;
  gap: 20px;
  align-items: center;
  height: 100%;
}
.icon {
  cursor: pointer;
  margin-right: 50px;
  line-height: 10px;
  position: relative;
}

.icon span.notification-counter {
  position: absolute;
  left: 100%;
  bottom: 100%;
  background: #fff;
  color: #000;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 10.5px;
  width: 16px;
  height: 16px;
  margin: 0 0 -8px -8px;
  padding: 0;
  border-radius: 20px;
  box-shadow: 0 0 0 1px #fff;
  line-height: 1;
}


.search-bar .input-group {
  border: 2px solid #e0e0e0;
  border-radius: 50px;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
}

.search-bar .form-control {
  border: none !important;
  box-shadow: none !important;
}

.search-bar .input-group-text {
  border: none !important;
  background: #fff !important;
  cursor: pointer;
}


</style>
