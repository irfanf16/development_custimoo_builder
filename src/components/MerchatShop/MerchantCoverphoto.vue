<template>
  <div class="cover-photo-container">
    <img
      class="cover-photo-image"
      :src="`${storageUrl}${coverPhoto}`"
      alt="Store Cover"
    />
    <div class="cover-photo-overlay"></div>
    <slot name="shop-name"></slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class CoverPhoto extends Vue {
  @Prop({ type: String, required: true }) readonly coverPhoto!: string;
  public storageUrl = process.env.VUE_APP_STORAGE_URL;
}
</script>

<style scoped>
.cover-photo-container {
  position: relative;
  width: 100%;
  height: 12rem;
  overflow: hidden;
}

.cover-photo-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(17, 24, 39, 0.4) 0%, transparent 60%);
}

@media (min-width: 640px) {
  .cover-photo-container {
    height: 16rem;
  }
}

@media (min-width: 768px) {
  .cover-photo-container {
    height: 20rem;
  }
}
</style>
