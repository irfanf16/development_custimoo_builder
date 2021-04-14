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
              <template v-if="customLogos.length >= n">
                <img :src="apiBaseUrl+'/'+customLogos[index].url" alt="logo Shirt"/>
                <a href="#" class="remove-img">
                  <font-awesome-icon :icon="['fas', 'trash-alt']"/>
                </a>
              </template>
              <template v-else>
                <img src="@/assets/images/logo-shirt.svg" alt="logo Shirt"/>
              </template>

            </div>
            <div class="logo-placemet-content">
              <h4>Logo Placement</h4>
              <template v-if="customLogos.length >= n">
              <b-form-select v-model="customLogos[index].side" :options="options"></b-form-select>
              </template>
<!--              <b-form-select v-model="selected" :options="options"></b-form-select>-->
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
    console.log(this.customLogos)
  }
})
export default class LogoPlacementTabs extends Vue {
  @Prop({required: true}) numberOfLogos!: any

  private apiBaseUrl: string = process.env.VUE_APP_API_BASE_URL
  public selected = 'front'
  public options = [
    {value: 'front', text: 'Front'},
    {value: 'back', text: 'Back'}
  ]

  get customLogos(): [] {
    return this.$store.getters.getCustomLogos
  }
}
</script>
