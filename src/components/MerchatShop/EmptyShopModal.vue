<template>
  <modal
    :width="700"
    :height="'auto'"
    :shiftY="0"
    name="emptyShop"
    class="password-modal"
    :reset="true"
    :draggable="false"
    :clickToClose="false"
  >
    <div class="modal-content">
      <div class="centered-content p-5">
        <h1 class="font-weight-bold mb-2 fs-4">{{ shopMessage }}</h1>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import {Component, Mixins, Prop} from "vue-property-decorator";
import { BIconEye, BIconEyeSlash } from "bootstrap-vue";
import ErrorMessages from "@/mixins/ErrorMessages";

@Component({
  components: {
    BIconEye,
    BIconEyeSlash,
  },
})
export default class EmptyShopModal extends Mixins(ErrorMessages) {
  public  errorMessage = "No products for this shop";
  @Prop({ type: String, default: "No products" }) public shopMessage!: string;
  public show(): void {
    this.$modal.show("emptyShop");
  }
  public hide(): void {
    this.$modal.hide("emptyShop");
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
:deep(.vm--overlay) {
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.2);
}
</style>
