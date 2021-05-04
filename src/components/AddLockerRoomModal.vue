<template>
    <b-modal id="modal-center-addlockerroom" centered scrollable size="xl" title="Add to Locker Room" content-class="lockerroom-modal">
        <div class="lockerroom-header">
            <div class="locker-opener">
                <a href="#." class="arrow arrow-left"><font-awesome-icon :icon="['fas', 'arrow-left']" /></a>
                <b-button variant="secondary" class="active">Locker 1</b-button>
                <b-button variant="secondary">Locker 2<a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a></b-button>
                <b-button variant="secondary">Locker 3<a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a></b-button>
                <a href="#." class="arrow arrow-right"><font-awesome-icon :icon="['fas', 'arrow-right']" /></a>
            </div>
            <div class="create-lockerroom">
                <b-button class="create-btn" variant="secondary" v-b-modal.modal-center-createlockerroom><span>Create New </span>+</b-button>
                <CreateLockerRoomModal />
            </div>
        </div>
    </b-modal>
</template>

<script lang="ts">

    import { Component, Vue } from 'vue-property-decorator'
    import LockerRoomProducts from '@/components/LockerRoomProducts.vue'
    import CreateLockerRoomModal from '@/components/CreateLockerRoomModal.vue'
    @Component<AddLockerRoomModal>({
        components: {
            LockerRoomProducts,
            CreateLockerRoomModal
        }
    })
    export default class AddLockerRoomModal extends Vue {}

</script>

<style lang="scss" scoped>
    .lockerroom-header{
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        .locker-opener{
            max-width: 90%;
            padding: 15px;
            font-size: 18px;
            position: relative;
            overflow-x: auto;
            white-space: nowrap;
            @media only screen and (min-width: 992px){
                max-width: 100%;
                padding: 14px 30px;
                max-width: 80%;
            }
            .btn{
                padding: 5px 10px;
                margin: 0 5px 10px;
                position: relative;
                background: none;
                border-color: rgba(3,20,46,0.13);
                color: #03142E;
                font-size: 0.8rem;
                @media only screen and (min-width: 992px){
                    padding: 10px 30px;
                    margin: 0 10px 10px;
                    font-size: 1rem;
                }
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
                    width: 20px;
                    height: 20px;
                    font-size: 9px;
                    color: #D53943;
                    background: #F8E1E2;
                    border-radius: 50%;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: center;
                    @media only screen and (min-width: 992px){
                        width: 30px;
                        height: 30px;
                        font-size: 12px;
                    }
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
                display: none;
                @media only screen and (min-width: 992px){
                    display: inline-block;
                }
                &.arrow-right{
                    left: auto;
                    right: 0;
                }
            }
        }
        .create-lockerroom{
            .btn{
                padding: 0;
                font-size: 24px;
                line-height: 1;
                font-weight: 700px;
                color: #fff;
                background: #219f84;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                align-items: center;
                border: none;
                @media only screen and (min-width: 992px){
                    padding: 10px 30px;
                    color: #219f84;
                    background: #E7F4F1;
                    border: 1px solid #E7F4F1;
                    border-radius: 0.25rem;
                    width: auto;
                    height: auto;
                    font-size: 14px;
                    font-weight: 400;
                }
                span{
                    @media only screen and (max-width: 991px){display: none;}
                }
            }
        }
    }
    
    
</style>