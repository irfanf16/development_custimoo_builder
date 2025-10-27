<template>
  <div class="shop-name-overlay">
    <h1 class="shop-name">{{ name }}</h1>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class ShopName extends Vue {
  @Prop({ type: String, required: true }) readonly name!: string;
}
</script>

<style scoped>
.shop-name-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.shop-name {
  font-size: clamp(1.2rem, 5vw, 2.5rem);
  font-weight: bold;
  margin: 0;
  padding: 0;
}
</style>
