<template>
  <div class="accordion my-3" role="tablist">
    <b-card no-body v-if="selectedProduct.product_type != 'personalized' ">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button block v-b-toggle.accordion-1 class="p-3 d-flex align-items-center justify-content-between"><span class="text">Colors</span> <span
          class="accordion-icon"></span></b-button>
      </b-card-header>
      <b-collapse id="accordion-1" visible accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <div class="order-selected-colors">
            <button v-for="(svgColor, index) in svgGroups" :key="index">
              <span class="text-uppercase color-title">{{ svgColor.id }}</span>
              <span class="color-circle" :style="{background: svgColor.color}"></span>
              <span class="text-left">
                <span class="text-uppercase d-block">{{ svgColor.pantone }}</span>
                <span class="text-uppercase d-block">{{ svgColor.name }}</span>
              </span>
            </button>
          </div>
        </b-card-body>
      </b-collapse>
    </b-card>

    <b-card no-body v-if="product_roster_detail && product_roster_detail.length > 0">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button block v-b-toggle.accordion-2 class="p-3 d-flex align-items-center justify-content-between"><span class="text">{{company.login_code && company.login_code.hasOwnProperty('roster_name')? company.login_code.roster_name : 'Roster' | TitleCase}}</span> <span
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
          <b-button block v-b-toggle.accordion-3 class="p-3 d-flex align-items-center justify-content-between"><span class="text">Style</span> <span
            class="accordion-icon"></span></b-button>
        </b-card-header>
        <b-collapse id="accordion-3" accordion="my-accordion" role="tabpanel">
          <b-card-body class="border-top">
            <div class="order-collar-style d-flex flex-wrap align-items-center text-left"
                 v-for="(model, index)  in productModels" :key="index">
              <div class="image-holder"
                   v-if="selectedProduct.productstyles[styleIndex] && model.model_styles.includes(selectedProduct.productstyles[styleIndex].id)">
                <img :src="storageUrl+selectedProduct.productstyles[styleIndex].front.file_url " alt="Collar"/>
              </div>
              <div class="collar-details">
                <strong v-if="selectedProduct.productstyles[styleIndex]">{{selectedProduct.productstyles[styleIndex].name }}</strong>
                <div class="d-flex flex-wrap align-items-center" v-for="(item, i) in selectedProduct.addons" :key="i">
                  <div class="category mr-3">{{ item.addon.name }}</div>
                  <div class="price">+${{ item.addon.price }}</div>
                </div>
              </div>
            </div>
            <div class="order-collar-style d-flex flex-column text-left mt-2" v-if="productModels[modelIndex]">
              <strong style="font-weight: bold;">{{productModels[modelIndex].model_name}}</strong>
              <div v-html="productModels[modelIndex].product_model_description" style="font-size: small;" class="my-1"></div>
            </div>
          </b-card-body>
        </b-collapse>
      </b-card>
    </template>

    <b-card no-body v-if="customLogos.length > 0">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button block v-b-toggle.accordion-4 class="p-3 d-flex align-items-center justify-content-between"><span class="text">Logos</span> <span
          class="accordion-icon"></span></b-button>
      </b-card-header>
      <b-collapse id="accordion-4" accordion="my-accordion" role="tabpanel">
        <b-card-body class="border-top">
          <div class="order-logo-holder d-flex flex-wrap justify-content-between align-items-center">
            <template v-for="(logo, index) in customLogos">
              <div class="logo-area d-flex flex-wrap align-items-center border p-3" :key="index" v-if="logo && logo.url">
                <div class="image-holder border mr-3">
                  <img :src="storageUrl+logo.url" alt="logo" width="80px" />
                </div>
                <div class="text-left">
                  <span class="d-block mb-1">Logo Placement</span>
                  <span class="text-uppercase">{{ logo.side }}</span>
                  <div class="d-flex mt-1 badge badge-light">
                    Size:
                    <span class="ml-1">{{ unit_conversion(logo.originalWidth) }}</span>
                    <span class="ml-1">x</span>
                    <span class="ml-1">{{ unit_conversion(logo.originalHeight) }}</span>
                  </div>
                </div>

              </div>
            </template>

          </div>
        </b-card-body>
      </b-collapse>
    </b-card>

    <b-card no-body v-if="customLogos.length > 0">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button block v-b-toggle.accordion-5 class="p-3 d-flex align-items-center justify-content-between"><span class="text">Text & Number Sizes</span> <span
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
import { findIndex } from 'lodash'
import { unitConversion } from '@/helpers/Helpers'
import {RosterDetailsGlobal} from "@/mixins/LockerProduct";

@Component<OrderAccordionTab>({})
export default class OrderAccordionTab extends Mixins(RosterDetailsGlobal) {
  private activeRow = 0
  private storageUrl = process.env.VUE_APP_STORAGE_URL

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

  get customLogos(): Record<any, any>[] {
    let custom_logos = this.$store.getters.getCustomLogos()
    if(custom_logos) {
      return this.$store.getters.getCustomLogos().filter((custom_logo:any) => (custom_logo && custom_logo.url != ""))
    } else {
      return []
    }
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

  get productModels(): Record<any, any> {
    return this.$store.getters.getProductModels
  }
  get modelIndex(): Record<any,any>{
    return this.$store.getters.getSelectedModelIndex;
  }


  public checkIndex(text_type: string) {
    return findIndex(this.customTexts, { type: text_type })
  }

  public unit_conversion(value: number): string {
    const converted = unitConversion(value)
    return converted.value + converted.unit
  }
}
</script>

<style lang="scss" scoped>
.order-selected-colors {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  @media only screen and (min-width: 768px) {
    justify-content: flex-start;
  }

  button {
    background: none;
    border: 1px solid #E1E6EA;
    padding: 18px 10px 5px;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 3px;
    font-size: 12px;
    margin-top: 15px;
    border-radius: 5px;
    position: relative;

    @media only screen and (min-width: 768px) {
      font-size: 14px;
    }

    .color-title{
      position: absolute;
      padding: 5px 10px;
      background: #E1E6EA;
      color: #333;
      z-index: 10;
      top: -15px;
      left: 10px;
      border-radius: 3px;
      font-weight: 500;
      font-size: 0.73vw;
    }

    .color-circle {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #FFC658;
      position: relative;
      margin-top: 1px;

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
