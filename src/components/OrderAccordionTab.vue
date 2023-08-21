<template>
  <div class="accordion my-3" role="tablist">
    <b-card no-body v-if="selectedProduct.product_type != 'personalized' ">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button block v-b-toggle.accordion-1 class="p-3 d-flex align-items-center justify-content-between"><span class="d-block">Colors</span> <span
          class="accordion-icon"></span></b-button>
      </b-card-header>
      <b-collapse id="accordion-1" visible accordion="my-accordion" role="tabpanel">
        <b-card-body class="p-0">
          <div class="order-selected-colors">
            <button class="px-4" v-for="(svgColor, index) in svgGroups" :key="index">
              <span class="text-uppercase color-title">{{ svgColor.id }}</span>
              <template v-if="svgColor.gradient_colors">
                <span class="color-circle" :style="{ background : gradient_color_string(svgColor.gradient_colors) }" style="box-shadow: 0 0 0 1px #000 inset"></span>
                <div class="text-left ml-1" style="font-size: 12px">
                  <span class="text-uppercase d-block">
                    <template v-for="(gradient_color, g_index) in svgColor.gradient_colors">
                      {{ gradient_color.pantone }} {{ gradient_color.name }} <template v-if="g_index < svgColor.gradient_colors.length - 1">/</template>
                    </template>
                  </span>
                </div>
              </template>
              <template v-else>
                <span class="color-circle" :style="{background: svgColor.color}" style="box-shadow: 0 0 0 1px #000 inset"></span>
                <div class="text-left ml-1" style="font-size: 12px">
                  <span class="text-uppercase d-block">
                    {{ svgColor.pantone }} {{ svgColor.name }}
                  </span>
                </div>
              </template>
            </button>
          </div>
        </b-card-body>
      </b-collapse>
    </b-card>

    <b-card no-body v-if="product_roster_detail && product_roster_detail.length > 0">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button block v-b-toggle.accordion-2 class="p-3 d-flex align-items-center justify-content-between"><span class="d-block">{{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}}</span> <span
          class="accordion-icon"></span></b-button>
      </b-card-header>
      <b-collapse id="accordion-2" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <div class="overflow-hidden roster-details-table">
            <div class="roster-row head d-flex align-items-center justify-content-between">
              <span v-if="checkIndex('name') != -1" class="name">Name</span>
              <span v-if="checkIndex('number') != -1">No</span>
              <span>Size</span>
              <span>Qty</span>
            </div>
            <template v-for="(roster, key) in product_roster_detail">
              <div :key="key" class="roster-row cursor-pointer d-flex align-items-center justify-content-between" :class="{'activeRow': active_roster_index === key}" @click="handleRosterItemFocus(key)">
                <span v-if="checkIndex('name') != -1" class="name">{{ roster.text }}</span>
                <span v-if="checkIndex('number') != -1" >{{ roster.number }}</span>

                <span>{{ roster.size }}</span>
                <span>{{ roster.quantity }}</span>
              </div>
            </template>
          </div>
        </b-card-body>
      </b-collapse>
    </b-card>

    <template>
      <b-card no-body>
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-button block v-b-toggle.accordion-3 class="p-3 d-flex align-items-center justify-content-between"><span class="d-block">Style</span> <span
            class="accordion-icon"></span></b-button>
        </b-card-header>
        <b-collapse id="accordion-3" accordion="my-accordion" role="tabpanel">
          <b-card-body class="border-top">
            <div class="order-collar-style d-flex flex-wrap align-items-center text-left">
              <div class="image-holder" v-if="selectedProduct.productstyles[styleIndex]">
                <template v-if="selectedProduct.productstyles[styleIndex].front_models.length > 0">
                  <img :src="storageUrl+selectedProduct.productstyles[styleIndex].front_models[0].file_url" alt="Collar"/>
                </template>
              </div>
              <div class="collar-details">
                <strong v-if="selectedProduct.productstyles[styleIndex]">{{selectedProduct.productstyles[styleIndex].name }}</strong>
                <div class="d-flex flex-wrap align-items-center" v-for="(item, i) in selectedProduct.addons" :key="i">
                  <div class="category mr-3">{{ item.addon.name }}</div>
                  <div class="price">+${{ item.addon.price }}</div>
                </div>
              </div>
            </div>
            <div class="order-collar-style d-flex flex-column text-left mt-2">
              <strong style="font-weight: bold;">{{ selectedProduct.display_name }}</strong>
              <div v-html="sku_information.description" style="font-size: small;" class="my-1"></div>
            </div>
          </b-card-body>
        </b-collapse>
      </b-card>
    </template>

    <b-card no-body v-if="customLogos && customLogos.length > 0">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button block v-b-toggle.accordion-4 class="p-3 d-flex align-items-center justify-content-between"><span class="d-block">Logos</span> <span
          class="accordion-icon"></span></b-button>
      </b-card-header>
      <b-collapse id="accordion-4" accordion="my-accordion" role="tabpanel">
        <b-card-body class="border-top">
          <div class="order-logo-holder gap-1 d-flex flex-wrap justify-content-between align-items-center">
            <template v-for="(logo, index) in customLogos">
              <div class="logo-area d-flex bg-light flex-wrap align-items-center border position-relative p-3 mb-4" :key="index" v-if="logo && logo.url">
                <div class="image-holder text-center w-100">
                  <img :src="storageUrl+logo.url" alt="logo" style="max-width: 80px" />
                </div>
                <div class="text-left">
                  <div class="d-flex mt-1 badge badge-light align-items-center w-100 fs-1">
                    <span class="d-block">Logo Placement:</span>
                    <span class="d-block text-uppercase ml-1">{{ logo.side }}</span>
                  </div>
                  <div class="d-flex badge badge-light">
                    Size:
                    <span class="ml-1">{{ logo.originalWidth + (settings && settings.unit) }}</span>
                    <span class="ml-1">x</span>
                    <span class="ml-1">{{ logo.originalHeight + (settings && settings.unit) }}</span>
                  </div>
                </div>

                <div class="vector-logo-error d-flex justify-content-between" v-if="vectorImageConstraint? !logo.is_vector && logo.url  : false">Logo is not vector <span @click="()=>showVModal('replace-logo')" class="text-info cursor-pointer fw-bold">Replace</span></div>
              </div>
            </template>

          </div>
        </b-card-body>
      </b-collapse>
    </b-card>

    <b-card no-body v-if="customLogos && customLogos.length > 0">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button block v-b-toggle.accordion-5 class="p-3 d-flex align-items-center justify-content-between"><span class="d-block">Text & Number Sizes</span> <span
          class="accordion-icon"></span></b-button>
      </b-card-header>
      <b-collapse id="accordion-5" accordion="my-accordion" role="tabpanel">
        <b-card-body class="border-top">
          <div class="order-logo-holder">
            <div v-if="customTexts && maintabindex > 2" class="overflow-hidden roster-details-table">
              <div class="roster-row head d-flex flex-wrap align-items-center justify-content-between">
                <span class="name">Field</span>
                <span>Height</span>
<!--                <span>Width</span>-->
              </div>
              <template v-for="(text, index) in customTexts">
                <div :key="index" v-if="text.text" class="roster-row d-flex flex-wrap align-items-center justify-content-between">
                  <span class="name">FAISAL</span>
                  <span class="name">{{ text.name_of_placement }}</span>
                  <span>{{ unit_conversion(text.originalWidth)  + ' x ' + unit_conversion(text.originalHeight) }}</span>
                </div>
              </template>
            </div>
          </div>
        </b-card-body>
      </b-collapse>
    </b-card>
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop, Vue} from 'vue-property-decorator'
import {filter, findIndex} from 'lodash'
import { unitConversion } from '@/helpers/Helpers'
import {RosterDetailsGlobal} from "@/mixins/LockerProduct";
import ModalAction from "@/mixins/ModalAction";

@Component<OrderAccordionTab>({
  mounted(){
    this.$eventBus.$on('handleNonVectorCustomLogosCount',this.notVectorLogosCount);
  }
})
export default class OrderAccordionTab extends Mixins(RosterDetailsGlobal, ModalAction) {
  private activeRow = 0
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  private non_vector_logos_count = 0

  public customLogosExists = false;

  get maintabindex(){
    return this.$store.getters.getMainTab
  }
  get company(): Record<any, any>{
    return this.$store.getters.getCompany
  }

  get product_roster_detail(): [Record<any, any>] {
    return this.$store.getters.getProductRosters()
  }
  get getCustomTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts(this.selectedProduct)
  }

  get selectedProduct(): Record<any, any> {
    return this.$store.getters.getSelectedProduct
  }

  get customLogos(): Record<any, any> [] {
    return this.$store.getters.getCustomLogos();
  }

  get settings(){
    return this.$store.getters.getSetting('measurement_unit');
  }

  get customTexts(): [Record<any, any>] {
    return this.$store.getters.getCustomTexts().filter((custom_text:any) => (custom_text && custom_text.value != ""));
  }

  get svgGroups(): [Record<any, any>] {
    return this.$store.getters.getSvgGroups
  }

  get styleIndex(): number {
    return this.$store.getters.getCurrentStyleIndex
  }
  get sku_information(){
    return this.$store.getters.getSkuInformation
  }

  get vectorImageConstraint():boolean{
    return this.$store.getters.getFactorySettings(this.selectedProduct.factory_id)?.vector_image_constraint
  }

  public gradient_color_string(gradient_colors: Record<any, any>[]) {
    let css_color = 'linear-gradient(90deg';
    gradient_colors.forEach((gradient_color: Record<any, any>) => {
      css_color += ',' + gradient_color.color
    })
    css_color += ')'
    return css_color
  }

  public checkIndex(text_type: string) {
    return findIndex(this.customTexts, { type: text_type })
  }

  public unit_conversion(value: number): string {
    const converted = unitConversion(value)
    return converted!.value + converted!.unit
  }

  public notVectorLogosCount(){
    const custom_logos = this.$store.getters.koivna
    let non_vector_logos_count = 0
    if(custom_logos && custom_logos.length > 0) {
      const non_vector_logos = filter(custom_logos, (custom_logo: Record<any, any>) => {
        // return (custom_logo.original_logo_url && custom_logo.is_vector == false) ? true : false
        return custom_logo.is_vector == false && custom_logo.url
      })
      non_vector_logos_count = non_vector_logos.length
    }
    this.non_vector_logos_count =  non_vector_logos_count
  }
}
</script>

<style lang="scss" scoped>
.vector-logo-error{
  position: absolute;
  bottom: -24px;
  border-radius: 0 0 4px 4px;
  left: 0;
  right: 0;
  padding: 5px;
  background: rgba(255,0,0,0.1);
  color: #D53943;
  font-size: 11px;
}
.order-selected-colors {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  align-items: center;
  width: 100%;

  button {
    display: flex;
    border: none;
    background: none;
    width: 100%;
    align-items: center;
    padding-top: 5px;
    padding-bottom: 5px;
    border-top: 1px solid lightgray;

    .color-title{
      width: 100%;
      max-width: 100px;
      text-align: left;
      font-weight: bold;
      font-size: 14px;
    }

    .color-circle {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #FFC658;
      position: relative;
      margin-top: 1px;
      flex-shrink: 0;

      &:before {
        position: absolute;
        content: '';
        left: 1px;
        right: 1px;
        top: 1px;
        bottom: 1px;
        border-radius: 50%;
        border: 3px solid #fff;
        z-index: 1;
      }
    }
  }
}

.roster-details-table {
  margin: -1.25rem;

  .roster-row {
    padding: 0.5rem 1.25rem;
    border-bottom: 1px solid #E1E6EA;

    &:first-child {
      border-top: 1px solid #E1E6EA;
    }

    &:nth-child(even) {
      background: #E1E6EA;
    }

    &.head {
      font-weight: 600;
    }

    span.name {
      width: 60%;
      text-align: left;
    }

    span {
      width: 40%;
      text-align: left;
      text-align: center;
    }
  }
}

.order-collar-style {
  overflow: hidden;

  .image-holder {
    border: 1px solid #EDF2F6;
    padding: 10px;
    width: 72px;
    height: 66px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    margin: 0 15px 0 0;

    img {
      display: block;
      max-width: 100%;
      margin: 0 auto;
      height: auto;
    }
  }

  .collar-details {
    strong {
      display: block;
      font-weight: 600;
      margin: 0 0 10px;
    }
  }
}

.order-logo-holder {
  .logo-area {
    flex: 0 0 48%;
    max-width: 48%;
    border-radius: 5px;
  }
}

.roster-details-table .roster-row.activeRow{
  background:  #E7F4F1;
  color: #219F84;
  animation: animRow 0.7s infinite alternate;
  font-weight: bold;
}
@keyframes animRow {
  from{
    background:  #E7F4F1;
  }
  to{
    background: #d0f5ea;
  }
}
</style>
