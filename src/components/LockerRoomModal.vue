<template>
    <b-modal id="modal-center-lockerroom" centered scrollable size="xl" title="Locker Room" content-class="lockerroom-modal">
        <div class="lockerroom-header">
            <div class="locker-opener">
                <a href="#." class="arrow arrow-left"><font-awesome-icon :icon="['fas', 'arrow-left']" /></a>
                <b-button variant="secondary" class="active">Locker 1</b-button>
                <b-button variant="secondary">Locker 2<a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a></b-button>
                <b-button variant="secondary">Locker 3<a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a></b-button>
                <a href="#." class="arrow arrow-right"><font-awesome-icon :icon="['fas', 'arrow-right']" /></a>
            </div>
            <div class="create-lockerroom">
                <b-button class="create-btn" variant="secondary">Create New</b-button>
            </div>
        </div>
        <div class="lockerroom-tabs">
            <div>
                <b-card no-body>
                    <b-tabs card>
                        <b-tab title="Products" active>
                            <LockerRoomProducts />
                        </b-tab>
                        <b-tab title="Assets">
                            <b-card-text>Tab contents 2</b-card-text>
                        </b-tab>
                        <b-tab title="Colors">
                            <b-card-text>Tab contents 2</b-card-text>
                        </b-tab>
                    </b-tabs>
                </b-card>
            </div>
        </div>
    </b-modal>
</template>

<script lang="ts">

    import { Component, Vue } from 'vue-property-decorator'
    import LockerRoomProducts from '@/components/LockerRoomProducts.vue'
    @Component<CustomizationPreviewProcess>({
        components: {
            LockerRoomProducts
        }
    })
    export default class CustomizationPreviewProcess extends Vue {}

</script>

<style lang="scss" scoped>
    .lockerroom-header{
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        .locker-opener{
            max-width: 80%;
            padding: 0 30px;
            font-size: 18px;
            position: relative;
            .btn{
                padding: 10px 30px;
                margin: 0 10px 10px;
                position: relative;
                background: none;
                border-color: rgba(3,20,46,0.13);
                color: #03142E;
                &.active,
                &:hover{
                    background: #219f84;
                    color: #fff;
                    border-color: #219f84;
                }
                .remove{
                    position: absolute;
                    right: -10px;
                    top: -14px;
                    width: 30px;
                    height: 30px;
                    font-size: 12px;
                    color: #D53943;
                    background: #F8E1E2;
                    border-radius: 50%;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: center;
                }
            }
            .arrow{
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                z-index: 1;
                color: #219f84;
                font-size: 15px;
                &.arrow-right{
                    left: auto;
                    right: 0;
                }
            }
        }
        .create-lockerroom{
            .btn{
                padding: 10px 30px;
                font-size: 14px;
                color: #219f84;
                background: #E7F4F1;
                border-color: #E7F4F1;
            }
        }
    }
    
    
</style>