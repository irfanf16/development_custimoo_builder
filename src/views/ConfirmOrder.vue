<template>
    <div class="confirm-order-area">
        <b-container class="order-details-holder my-5 bg-white">
            <b-row>
                <b-col>
                    <h1>Confirm Your Order</h1>
                </b-col>
                <b-col>
                    <div class="header-buttons">
                        <b-button variant="outline-secondary">Locker room</b-button>
                        <b-button variant="outline-secondary">Save to locker room</b-button>
                        <a href="#."><font-awesome-icon :icon="['fas', 'share-alt']" /></a>
                    </div>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'

    @Component<ConfirmOrder>({})
    
    export default class ConfirmOrder extends Vue {}
</script>

<style lang="scss" scoped>
    .order-details-holder{
        border: 1px solid #EDF2F6;
    }
</style>
