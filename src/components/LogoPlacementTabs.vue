<template>
  <b-tabs>
    <b-tab v-for="(n, index) in numberOfLogos" :key="index" :class="{ active: index==0 }">
      <template #title>
        Logo {{ n }}
      </template>
      <div>
        <div class="logo-placement-area mb-4">
          <div class="logo-placement-holder mb-3">
            <div class="logo-holder">
              <img src="@/assets/images/logo-shirt.svg" alt="logo Shirt"/>
              <a href="#" class="remove-img">
                <font-awesome-icon :icon="['fas', 'trash-alt']"/>
              </a>
            </div>
            <div class="logo-placemet-content">
              <h4>Logo Placement</h4>
              <b-form-select v-model="selected" :options="options"></b-form-select>
            </div>
          </div>
          <button class="btn btn-secondary w-100 fw-bold">Save Logo to Locker Room</button>
        </div>
        <div class="logo-placement-area">
          <h4 class="mb-4">Color Extracted from Logo</h4>
          <div class="logo-placement-holder">
            <div class="logo-holder">
              <img src="@/assets/images/logo-shirt.svg" alt="logo Shirt"/>
              <a href="#" class="remove-img">
                <font-awesome-icon :icon="['fas', 'trash-alt']"/>
              </a>
            </div>
            <div class="logo-placemet-content">
              <h4>Logo Placement</h4>
              <b-form-select v-model="selected" :options="options"></b-form-select>
            </div>
          </div>
          <button class="btn btn-secondary w-100 fw-bold">Save Color to Locker Room</button>
        </div>
      </div>
    </b-tab>
  </b-tabs>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

@Component<LogoPlacementTabs>({
  mounted() {
    this.$store.dispatch('setCustomLogos')
  }
})
export default class LogoPlacementTabs extends Vue {
  @Prop({required: true}) numberOfLogos!: any
  public selected = null
  public options = [
    {value: null, text: 'Front'},
    {value: 'a', text: 'Back'}
  ]

  get customLogos(): [] {
    return this.$store.getters.getCustomLogos
  }
}
</script>
