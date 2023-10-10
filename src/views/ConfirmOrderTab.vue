<template>
    <div class="confirm-order-area">
      <OrderAccordionTab />
    </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
    import OrderAccordionTab from '@/components/OrderAccordionTab.vue'
    import CustomizationPreview from '@/components/CustomizationPreview.vue'
    import OrderDetailsTab from '@/components/OrderDetailsTab.vue'
    import SaveDesignModal from '@/components/SaveDesignModal.vue'
    import {http} from "@/httpCommon";
    import AddLockerRoomModal from "@/components/AddLockerRoomModal.vue";



    @Component<ConfirmOrderTab>({
        components: {
          AddLockerRoomModal,
          OrderAccordionTab,
          CustomizationPreview,
          OrderDetailsTab,
          SaveDesignModal
        }
    })

    export default class ConfirmOrderTab extends Vue {
      public selected= null
      public ref = this.$refs as Record<any, any>
        public options= [
          { value: 'a', text: 'SM' },
          { value: 'a', text: 'MD' },
          { value: 'a', text: 'LG' },
          { value: 'a', text: 'XL' },
          { value: 'a', text: '2XL' },
          { value: null, text: '3XL' }
        ]

        private products : Record<any,any>[] = []
        private company_id !: string
        private product_id !: string

        public designsIndex = 0

      get manageComponents(): Record<any, any> {
        return this.$store.getters.getManageComponents
      }

      public async getLockers(){
        await this.$store.dispatch("getLockers");
        this.ref['saveToLockerModal'].showSaveToLockerRoomModal()
      }

      public homeScreen() {
        this.$router.push('/')

        if(this.manageComponents.mobileScreen){
          this.$store.commit('SET_HIDE_COLOR_SECTION', true)
        }

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
