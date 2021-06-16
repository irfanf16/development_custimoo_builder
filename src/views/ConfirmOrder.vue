<template>
    <div class="confirm-order-area">
        <b-container class="order-details-holder my-lg-5 bg-white border">
            <b-row class="align-items-center p-3 order-details-header border-bottom">
                <b-col cols="12" lg="6" class="text-left mb-3 mb-lg-0">
                    <h1>Confirm Your Design</h1>
                </b-col>
                <b-col cols="12" lg="6" class="text-left text-lg-right">
                    <div class="header-buttons">
                        <b-button to="/" variant="outline-secondary">Edit Your Design</b-button>
<!--                        <SaveDesignModal />-->
                        <b-button variant="outline-secondary" v-b-modal.modal-center-addlockerroom @click="getLockers">Save to locker room</b-button>
                        <AddLockerRoomModal />
                        <a href="#"><font-awesome-icon :icon="['fas', 'share-alt']" /></a>
                    </div>
                </b-col>
            </b-row>
            <b-row>
                <b-col md="6" class="border-right">
                    <OrderAccordion />
                </b-col>
                <b-col md="6">
                    <div class="roster-preview-area">
                        <CustomizationPreview :designs="products[designsIndex]" :canvasSelection="false" />
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
    import SaveDesignModal from '@/components/SaveDesignModal.vue'
    import {http} from "@/httpCommon";
    import AddLockerRoomModal from "@/components/AddLockerRoomModal.vue";


    @Component<ConfirmOrder>({
        components: {
          AddLockerRoomModal,
            OrderAccordion,
            CustomizationPreview,
            OrderDetails,
            SaveDesignModal
        },
        mounted() {
            // this.retrieveProducts()
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
            http.get(param)
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

      public async getLockers(){
        await this.$store.dispatch("getLockers");
      }
    }
</script>

<style lang="scss" scoped>
    .order-details-holder{
        h1{
            font-size: 24px;
            font-weight: 700;
            @media only screen and (min-width: 1024px){
                font-size: 30px;
            }
        }
        .header-buttons{
            .btn{
                margin-right: 10px;
                color: #000;
                font-size: 0.8rem;
                @media only screen and (min-width: 768px){
                    font-size: 1rem;
                  margin-right: 15px;
                }
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
