<template>
  <b-tabs>
    <b-tab v-for="(n, index) in customLogos" :key="index" :class="{ active: index==0 }">
      <template #title>
        Logo {{ index+1 }}
        <div v-if="index != 0">
          <a href="#" class="remove-logo" @click="removeLogoTab(index)">
            <font-awesome-icon :icon="['fas', 'trash-alt']"/>
          </a>
        </div>
      </template>
      <div>
        <div class="logo-placement-area mb-4">
          <div class="logo-placement-holder mb-3">
            <div class="logo-holder">
              <template v-if="customLogos[index].url != ''">
                <img :src="apiBaseUrl+'/'+customLogos[index].url" alt="logo Shirt"/>
                <a href="#" class="remove-img" @click="deleteLogo(index)">
                  <font-awesome-icon :icon="['fas', 'trash-alt']"/>
                </a>
              </template>
              <template v-else>
                <img src="@/assets/images/logo-shirt.svg" alt="logo Shirt"/>
              </template>
            </div>
            <div class="logo-placemet-content">
              <h4>Logo Placement</h4>
              <b-form-select v-model="customLogos[index].side" :options="options"></b-form-select>
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
    <b-tab v-if="customLogos.length < numberOfLogosAllowed" @click="addTab">
      <template #title>
        Logo +
      </template>
    </b-tab>
  </b-tabs>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

@Component<LogoPlacementTabs>({
  mounted() {
    this.$store.dispatch('setCustomLogos')
    if(!this.logos_setting.length){
      this.logos_setting = this.logos_setting.apend({
        width: 100,
        height: 100,
        x_axis: 150,
        y_axis: 190,
        haveControls: true,
        side: 'front'
      })
    }
  }
})
export default class LogoPlacementTabs extends Vue {
  @Prop({required: true}) numberOfLogosAllowed!: number
  @Prop({required: true}) logos_setting!: any

  public numberOfLogos = 1

  private apiBaseUrl: string = process.env.VUE_APP_API_BASE_URL
  public selected = 'front'
  public options = [
    {value: 'front', text: 'Front'},
    {value: 'back', text: 'Back'}
  ]

  get customLogos(): [] {
    return this.$store.getters.getCustomLogos
  }

  public addTab(){
    if(this.numberOfLogos < this.numberOfLogosAllowed) {
      let logoSetting = this.logos_setting[0]
      let logo = {
        url: '',
        width: logoSetting.width,
        height: logoSetting.height,
        x_axis: logoSetting.x_axis,
        y_axis: logoSetting.y_axis,
        haveControls: Boolean(logoSetting.is_locked),
        side: logoSetting.side
      }
      this.$store.dispatch('setCustomLogos', logo)
    }
  }
  public removeLogoTab(index: number){
    this.customLogos.splice(index, 1);
  }

  public deleteLogo(index: number) {
    let payload = {
      index: index,
      attribute: 'url',
      value: ''
    }
    this.$store.dispatch('updateCustomLogoAttribute', payload)
  }
}
</script>

<style lang="scss" scoped>
.nav-tabs {
  .nav-item {
    .nav-link {
      .remove-logo {
        position: absolute;
        //right: 135px;
        top: 158px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #F8E1E2;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        font-size: 10px;
        color: #D53943;
      }
    }
  }
}
</style>
