<template>
    <div class="confirm-order-area">
        <b-container class="order-details-holder my-5 bg-white border">
            <b-row class="align-items-center p-3 order-details-header border-bottom">
                <b-col class="text-left">
                    <h1>Confirm Your Order</h1>
                </b-col>
                <b-col class="text-right">
                    <div class="header-buttons">
                        <b-button variant="outline-secondary">Edit Your Design</b-button>
                        <b-button variant="outline-secondary">Save to locker room</b-button>
                        <a href="#."><font-awesome-icon :icon="['fas', 'share-alt']" /></a>
                    </div>
                </b-col>
            </b-row>
            <b-row>
                <b-col md="6" class="border-right">
                    <OrderAccordion />
                </b-col>
                <b-col md="6">
                    <div class="roster-preview-area">
                        <CustomizationPreview :designs="products[designsIndex]" />
                        <OrderDetails />
                    </div>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import OrderAccordion from '@/components/OrderAccordion.vue'
    import CustomizationPreview from '@/components/CustomizationPreview.vue'
    import OrderDetails from '@/components/OrderDetails.vue'
    import ApiDataService from "@/services/ApiDataService";


    @Component<ConfirmOrder>({
        components: {
            OrderAccordion,
            CustomizationPreview,
            OrderDetails
        },
        mounted() {
            this.retrieveProducts()
        }
    })
    
    export default class ConfirmOrder extends Vue {
        public selected= null
        public options= [
          { value: 'a', text: 'SM' },
          { value: 'a', text: 'MD' },
          { value: 'a', text: 'LG' },
          { value: 'a', text: 'XL' },
          { value: 'a', text: '2XL' },
          { value: null, text: '3XL' }
        ]

        private products : any[] = []
        private company_id !: string
        private product_id !: string

        public designsIndex = 0

        retrieveProducts(): void {
            this.product_id = '1'
            this.company_id = '1'
            let param = '?product_id='+this.product_id+'&company_id='+this.company_id
            ApiDataService.getAll(param)
            .then((response: any) => {
                this.products = response.data.products.data;
            })
            .catch((e: any) => {
                console.log(e)
            });
        }

        public changeProduct(designsIndex :number){
            this.designsIndex = designsIndex
        }
    }
</script>

<style lang="scss" scoped>
    .order-details-holder{
        h1{
            font-size: 30px;
            font-weight: 700;
        }
        .header-buttons{
            .btn{
                margin-right: 15px;
                color: #000;
                &:hover{
                    background: #219F84;
                    color: #fff;
                    border-color: #219F84;
                }
            }
        }
        .roster-preview-area{
            flex: 0 0 100%;
            max-width: 100%;
        }
        
    }
</style>
