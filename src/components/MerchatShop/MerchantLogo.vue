<template>
  <div class="store-logo-wrapper">
    <img class="store-logo" :src="`${storageUrl}${logo}`" alt="Profile Picture" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class MerchantLogo extends Vue {
  public storageUrl = process.env.VUE_APP_STORAGE_URL;
  @Prop({ type: String, required: true }) readonly logo!: string;
}
</script>
<style scoped>
.store-logo-wrapper {
  width: 8rem;
  height: 8rem;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.store-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (min-width: 640px) {
  .store-logo-wrapper {
    width: 10rem;
    height: 10rem;
  }
}

@media (min-width: 768px) {
  .store-logo-wrapper {
    width: 12rem;
    height: 12rem;
    margin-left: 5rem;
  }
}
</style>
