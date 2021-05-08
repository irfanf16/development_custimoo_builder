<template>
  <div class="interest-area">
    <h2 class="fw-bold mb-3 fz-18 text-left">Please Choose Your Interests</h2>
    <div class="interest-btn-holder d-flex flex-wrap justify-content-between align-items-center">
      <b-button @click="searchProducts(0, 'category_id')">
        <div class="icon-holder">
          <font-awesome-icon :icon="['fas', 'tshirt']"/>
        </div>
        <strong>All</strong></b-button>
      <b-button v-for="(category, index) in categories" :key="index"
                @click="searchProducts(category.id, 'category_id')">
        <div class="icon-holder"><img :src="apiBaseUrl+'/'+category.image_url" width="22px"></div>
        <strong>{{ category.category_name.toUpperCase() }}</strong></b-button>
    </div>
    <button @click="showDesign()" class="btn btn-secondary w-100 fw-bold">Show Me Design</button>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import manageComponents from '@/store/modules/main'

@Component<ChooseInterest>({})
export default class ChooseInterest extends Vue {
  @Prop({required: true}) categories!: any

  private apiBaseUrl = process.env.VUE_APP_API_BASE_URL

  get manageComponents(): Record<any, any> {
    return this.$store.getters.getManageComponents
  }

  public searchProducts(param: string, type: string) {
    this.$emit('search', param, type)
  }

  public showDesign() {
    if (this.manageComponents.mobileScreen) {
      this.$store.dispatch('setManageComponents', {index: 'ChooseColor', value: false})
      this.$store.dispatch('setManageComponents', {index: 'ChooseInterest', value: false})
      this.$store.dispatch('setManageComponents', {index: 'ItemToCustomize', value: true})
      this.$store.dispatch('setManageComponents', {index: 'LogoArea', value: true})
    }
  }
}
</script>

<style lang="scss" scoped>
.interest-area {
  max-width: 300px;
  margin: 0 auto;
}

.interest-btn-holder {
  .btn {
    flex: 0 0 47%;
    max-width: 47%;
    margin: 0 0 20px;
    background: none;
    color: #03142E;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    border-color: #DCDEE2;
    background: #fff;

    .icon-holder {
      width: 38px;
      height: 38px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      background: #E7F4F1;
      border-radius: 50%;
      color: #219F84;
      font-size: 22px;
      margin-right: 6px;
    }

    strong {
      width: 50%;
    }
  }
}
</style>
