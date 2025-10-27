<template>
  <div class="preview-wrapper">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="title">Preview: {{ title }}</div>
      <div class="segmented" role="tablist" aria-label="Device selector">
        <button
          :class="['tab', { active: mode === 'laptop' }]"
          @click="setMode('laptop')"
        >
          <svg width="1em" height="1em" viewBox="0 0 34 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.75 29H17M17 29H22.25M17 29V23.75M17 23.75H29.25C30.1783 23.75 31.0685 23.3813 31.7249 22.7249C32.3813 22.0685 32.75 21.1783 32.75 20.25V4.5C32.75 3.57174 32.3813 2.6815 31.7249 2.02513C31.0685 1.36875 30.1783 1 29.25 1H4.75C3.82174 1 2.9315 1.36875 2.27513 2.02513C1.61875 2.6815 1.25 3.57174 1.25 4.5V20.25C1.25 21.1783 1.61875 22.0685 2.27513 22.7249C2.9315 23.3813 3.82174 23.75 4.75 23.75H17Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button
          :class="['tab', { active: mode === 'mobile' }]"
          @click="setMode('mobile')"
        >
          <svg width="1em" height="1em" fill="none" viewBox="0 0 24 34" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.625 27.5H9.375M4.4995 32.75H19.5005C21.156 32.75 22.5 31.3395 22.5 29.6V4.4C22.5 2.6605 21.156 1.25 19.5005 1.25H4.4995C2.84225 1.25 1.5 2.6605 1.5 4.4V29.6C1.5 31.3395 2.84225 32.75 4.4995 32.75Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
    <!-- Stage -->
    <div class="stage" ref="stage">
      <div class="device-wrapper">
        <div ref="deviceScale" class="device-scale">
          <div :class="['device', mode]">
            <iframe
              v-if="previewUrl"
              :src="previewUrl"
              title="Route Preview"
            ></iframe>
          </div>
          <img v-if="mode === 'laptop'" src="@/assets/images/laptop-preview.png" class="preview-device">
          <img v-else src="@/assets/images/mobile-preview.png" class="preview-device">
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Mixins, Component} from "vue-property-decorator";
import ErrorMessages from "@/mixins/ErrorMessages";

@Component<ShopPreview>({
  mounted() {
    setTimeout(()=>{
      window.addEventListener("resize", this.fit);
      this.$nextTick(this.fit);
    },1000)

    this.previewUrl = `${this.company.company_domain}/#/merchant-shop/${this.$route.params.slug}`;
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.fit);
  },
})

export default class ShopPreview extends  Mixins(ErrorMessages) {
  public mode = 'laptop';
  public previewUrl = `${this.company.company_domain}/#/merchant-shop/${this.$route.params.slug}`;

  get company() {
    return this.$store.getters.getCompany
  }
  setMode(mode) {
    this.mode = mode;
    this.$nextTick(this.fit);
  }

  fit() {
    const rect = (this.$refs?.stage as Record<any, any>)?.getBoundingClientRect();
    const sizes: Record<'laptop' | 'mobile' , [number, number]> = {
      laptop: [1280, 750],
      mobile: [390, 795],
    };
    const [w, h] = sizes[this.mode];
    const scale = Math.min((rect.width - 40) / w, (rect.height - 40) / h, 1);

    // SAFE access without optional chaining
    const el = (this.$refs as any).deviceScale as HTMLElement | undefined;
    if (el && el.style) {
      el.style.transform = `scale(${scale})`;
    }
  }

}
</script>

<style scoped>
/* Same styles as before (simplified for brevity) */
.preview-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
}
.title {
  position: absolute;
  left: 0;
  font-weight: 600;
  color: #c6d0dc;
}

.segmented button {
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  height: 50px;
  width: 50px;
  margin-top: 10px;
  font-size: 20px;
  margin-left: 7px;
  margin-right: 7px;
}
.segmented .active {
  background: var(--theme-color-light);
  color: var(--theme-color);
}
.stage {
  flex: 1;
  display: grid;
  place-items: center;
  border-radius: 18px;
  overflow: visible;
  margin-top: 60px;
}
.device-wrapper {
  display: grid;
  place-items: center;
}
.device-scale {
  transform-origin: top center;
}
.device {
  background: #fff;
  overflow: visible;
  position: relative;
}
.device.laptop {
  width: 1280px;
  height: 750px;
}
.device.mobile {
  width: 390px;
  height: 795px;
  border-radius: 40px;
  overflow: hidden;
}
iframe {
  width: 100%;
  height: 100%;
  border: 0;
}
.preview-device{
  position: absolute;
  z-index: 9;
  width: calc(100% + 28%);
  left: -14%;
  top: -7%;
  pointer-events: none;
}
.mobile + .preview-device{
  width: calc(100% + 7%);
  left: -5%;
  top: -2%;
  pointer-events: none;
}
</style>
