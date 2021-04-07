<template>
    <div class="interest-area">
        <h2 class="fw-bold mb-3 fz-18 text-left">Please Choose Your Interests</h2>
        <div>
            <b-button><div class="icon-holder"><font-awesome-icon :icon="['fas', 'futbol']"/></div> Soccer</b-button>
            <b-button><div class="icon-holder"><font-awesome-icon :icon="['fas', 'hockey-puck']"/></div> Hockey</b-button>
            <b-button><div class="icon-holder"><font-awesome-icon :icon="['fas', 'baseball-ball']"/></div> Baseball</b-button>
            <b-button><div class="icon-holder"><font-awesome-icon :icon="['fas', 'tshirt']"/></div> Accessories</b-button>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    @Component<ChooseInterest>({})
    export default class ChooseInterest extends Vue{}
</script>

<style lang="scss" scoped>
    .interest-area{
        max-width: 300px;
        margin: 0 auto;
    }
</style>