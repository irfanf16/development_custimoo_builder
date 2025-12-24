<template>
  <modal
    :width="1200"
    :height="'auto'"
    :shiftY="0"
    name="passwordModal"
    class="password-modal"
    :reset="true"
    :draggable="false"
    :clickToClose="false"
  >
    <div class="modal-content">
       <div class="centered-content p-5">
        <div class="logo-container">
          <img :src="firstProductFrontImage" alt="Logo"  class="logo-img" v-if="firstProductFrontImage"/>
        </div>
           <h2 class="font-weight-bold mb-2 fs-4" v-if="ShopName">{{  ShopName }}</h2>
           <p class="text-muted mb-4">
          Enter the password to access this exclusive shop
        </p>
         <form @submit.prevent="submitPassword">
          <div class="form-group mb-3">
            <div class="input-group">
              <input
                id="password"
                :type="passwordVisible ? 'text' : 'password'"
                class="form-control"
                placeholder="Password"
                v-model="password"
              />
               <div class="input-group-append">
            <span class="input-group-text" @click="togglePasswordVisibility" style="cursor: pointer;">
              <b-icon-eye v-if="!passwordVisible"></b-icon-eye>
          <b-icon-eye-slash v-else></b-icon-eye-slash>
        </span>
      </div>
            </div>
          </div>
          <div v-if="errorMessage" class="text-danger mb-3">
                  {{ errorMessage }}
          </div>
          <button type="submit" class="btn btn-primary w-100 py-2 mt-3">
            Enter Shop
          </button>
        </form>
       </div>
    </div>
  </modal>
</template>

<script lang="ts">
import { Component, Mixins , Prop } from "vue-property-decorator";
import { BIconEye, BIconEyeSlash } from "bootstrap-vue";
import ErrorMessages from "@/mixins/ErrorMessages";

@Component({
  components: {
    BIconEye,
    BIconEyeSlash,
  },
})
export default class PasswordModal extends Mixins(ErrorMessages) {
  @Prop({ type: Object, required: false }) readonly MerchantShopData!: Record<string, any>;
  public storageUrl = process.env.VUE_APP_STORAGE_URL;
  public passwordVisible = false;
  private password = "";
  private errorMessage = "";
  get ShopName(): string {
    return this.MerchantShopData?.preview_name ? this.MerchantShopData?.name || "Shop" : '';
  }

  get firstProductFrontImage(): string {
    const imageUrl = this.MerchantShopData?.preview_logo ? `${this.storageUrl}${this.MerchantShopData?.logo || ""}`: "";
    return imageUrl;
  }

  public show(): void {
    this.$modal.show("passwordModal");
  }

  public hide(): void {
    this.$modal.hide("passwordModal");
    this.password = "";
    this.errorMessage = "";
  }

  public togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  private submitPassword(): void {
    if(!this.password){
      this.showError('Please input password')
      return
    }
    this.$emit("submit", this.password);
  }
}
</script>

<style scoped lang="scss">
.modal-content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.centered-content{
  text-align: center;
  margin: auto;
  padding: 5rem;
}

.logo-container {
 max-width: 100px;
 margin: 0 auto;
}

.logo-img {
  width: 100%;
  height: auto;
  display: block;
  margin-bottom: 1rem;
}

:deep(.vm--overlay) {
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.2);
}
</style>
