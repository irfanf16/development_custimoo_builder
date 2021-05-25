<template>
  <div class="accordion my-3" role="tablist">
    <b-card no-body>
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button block v-b-toggle.accordion-1 class="p-3"><span class="text">Colors</span> <span class="accordion-icon"></span></b-button>
      </b-card-header>
      <b-collapse id="accordion-1" visible accordion="my-accordion" role="tabpanel">
        <b-card-body>
            <div class="order-selected-colors d-flex flex-wrap align-items-center">
                <button>
                    <span>Primary</span>
                    <span class="color-circle"></span>
                    <span class="text-uppercase">#ffc658</span>
                </button>
                <button>
                    <span>Primary</span>
                    <span class="color-circle"></span>
                    <span class="text-uppercase">#ffc658</span>
                </button>
                <button>
                    <span>Primary</span>
                    <span class="color-circle"></span>
                    <span class="text-uppercase">#ffc658</span>
                </button>
                <button>
                    <span>Primary</span>
                    <span class="color-circle"></span>
                    <span class="text-uppercase">#ffc658</span>
                </button>
                <button>
                    <span>Primary</span>
                    <span class="color-circle"></span>
                    <span class="text-uppercase">#ffc658</span>
                </button>
            </div>
        </b-card-body>
      </b-collapse>
    </b-card>

    <b-card no-body>
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button block v-b-toggle.accordion-2 class="p-3"><span class="text">Roster</span> <span class="accordion-icon"></span></b-button>
      </b-card-header>
      <b-collapse id="accordion-2" accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <div class="overflow-hidden roster-details-table">
              <div class="roster-row head d-flex flex-wrap align-items-center justify-content-between">
                  <span class="name">Name</span>
                  <span>No</span>
                  <span>Size</span>
                  <span>Qty</span>
              </div>
              <div class="roster-row d-flex flex-wrap align-items-center justify-content-between">
                  <span class="name">Brandon</span>
                  <span>18</span>
                  <span>3XL</span>
                  <span>1</span>
              </div>
              <div class="roster-row d-flex flex-wrap align-items-center justify-content-between">
                  <span class="name">Brandon</span>
                  <span>18</span>
                  <span>3XL</span>
                  <span>1</span>
              </div>
              <div class="roster-row d-flex flex-wrap align-items-center justify-content-between">
                  <span class="name">Brandon</span>
                  <span>18</span>
                  <span>3XL</span>
                  <span>1</span>
              </div>
              <div class="roster-row d-flex flex-wrap align-items-center justify-content-between">
                  <span class="name">Brandon</span>
                  <span>18</span>
                  <span>3XL</span>
                  <span>1</span>
              </div>
          </div>
        </b-card-body>
      </b-collapse>
    </b-card>

    <b-card no-body>
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button block v-b-toggle.accordion-3 class="p-3"><span class="text">Style</span> <span class="accordion-icon"></span></b-button>
      </b-card-header>
      <b-collapse id="accordion-3" accordion="my-accordion" role="tabpanel">
        <b-card-body class="border-top">
            <div class="order-collar-style d-flex flex-wrap align-items-center text-left">
                <div class="image-holder">
                    <img src="@/assets/images/collar-style2.svg" alt="Collar" />
                </div>
                <div class="collar-details">
                    <strong>2000 Series</strong>
                    <div class="d-flex flex-wrap align-items-center">
                        <div class="category mr-3">Embroidery</div>
                        <div class="price">+$15</div>
                    </div>
                </div>
            </div>
        </b-card-body>
      </b-collapse>
    </b-card>

    <b-card no-body>
      <b-card-header header-tag="header" class="p-1" role="tab"> 
        <b-button block v-b-toggle.accordion-4 class="p-3"><span class="text">Logos</span> <span class="accordion-icon"></span></b-button>
      </b-card-header>
      <b-collapse id="accordion-4" accordion="my-accordion" role="tabpanel">
        <b-card-body class="border-top">
            <div class="order-logo-holder d-flex flex-wrap justify-content-between align-items-center">
                <div class="logo-area d-flex flex-wrap align-items-center border p-3">
                    <div class="image-holder border mr-3">
                        <img src="@/assets/images/logo-shirt.svg" alt="logo" />
                    </div>
                    <div class="text-left">
                        <span class="d-block mb-1">Logo Placement</span>
                        <span>Front</span>
                    </div>
                </div>
                <div class="logo-area d-flex flex-wrap align-items-center border p-3">
                    <div class="image-holder border mr-3">
                        <img src="@/assets/images/logo-shirt.svg" alt="logo" />
                    </div>
                    <div class="text-left">
                        <span class="d-block mb-1">Logo Placement</span>
                        <span>Front</span>
                    </div>
                </div>
            </div>
        </b-card-body>
      </b-collapse>
    </b-card>
  </div>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator'
    @Component<OrderAccordion>({})
    export default class OrderAccordion extends Vue {}
</script>

<style lang="scss" scoped>
    .order-selected-colors{
        justify-content: space-between;
        @media only screen and (min-width: 768px){
            justify-content: flex-start;
        }
        button{
            background: none;
            border: 1px solid #E1E6EA;
            padding: 10px;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            margin: 0 5px 10px;
            font-size: 12px;
            @media only screen and (min-width: 768px){
                font-size: 14px;
            }
            .color-circle{
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #FFC658;
                position: relative;
                margin: 0 3px;
                &:before{
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
    .roster-details-table{
        margin: -1.25rem;
        .roster-row{
            padding: 1.25rem;
            border-bottom: 1px solid #E1E6EA;
            &:first-child{border-top: 1px solid #E1E6EA;;}
            &.head{font-weight: 600;}
            span.name{
                width: 40%;
                text-align: left;
            }
            span{
                width: 20%;
                text-align: left;
                text-align: center;
            }
        }
    }
    .order-collar-style{
        overflow: hidden;
        .image-holder{
            border: 1px solid #EDF2F6;
            padding: 10px;
            width: 72px;
            height: 66px;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            margin: 0 15px 0 0;
            img{
                display: block;
                max-width: 100%;
                margin: 0 auto;
                height: auto;
            }
        }
        .collar-details{
            strong{
                display: block;
                font-weight: 600;
                margin: 0 0 10px;
            }
        }
    }
    .order-logo-holder{
        .logo-area{
            flex: 0 0 48%;
            max-width: 48%;
            border-radius: 5px;
        }
    }
</style>