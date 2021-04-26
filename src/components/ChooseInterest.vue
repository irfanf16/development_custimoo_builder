<template>
    <div class="interest-area">
        <h2 class="fw-bold mb-3 fz-18 text-left">Please Choose Your Interests</h2>
        <div class="interest-btn-holder d-flex flex-wrap justify-content-between align-items-center">
            <b-button><div class="icon-holder"><font-awesome-icon :icon="['fas', 'futbol']"/></div> <strong>Soccer</strong></b-button>
            <b-button><div class="icon-holder"><font-awesome-icon :icon="['fas', 'hockey-puck']"/></div> <strong>Hockey</strong></b-button>
            <b-button><div class="icon-holder"><font-awesome-icon :icon="['fas', 'baseball-ball']"/></div> <strong>Baseball</strong></b-button>
            <b-button><div class="icon-holder"><font-awesome-icon :icon="['fas', 'tshirt']"/></div> <strong>Accessories</strong></b-button>
        </div>
        <button @click="showDesign()" class="btn btn-secondary w-100 fw-bold">Show Me Design</button>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import manageComponents from '@/store/modules/main'
    @Component<ChooseInterest>({})
    export default class ChooseInterest extends Vue{
      get manageComponents(): Record<any, any> {
        return this.$store.getters.getManageComponents
      }

      public showDesign() {
            if(this.manageComponents.mobileScreen){
                this.$store.dispatch('setManageComponents', {index: 'ChooseColor', value: false})
                this.$store.dispatch('setManageComponents', {index: 'ChooseInterest', value: false})
                this.$store.dispatch('setManageComponents', {index: 'ItemToCustomize', value: true})
                this.$store.dispatch('setManageComponents', {index: 'LogoArea', value: true})
            } 
      }
    }
</script>

<style lang="scss" scoped>
    .interest-area{
        max-width: 300px;
        margin: 0 auto;
    }
    .interest-btn-holder{
        .btn{
            flex: 0 0 47%;
            max-width: 47%;
            margin: 0 0 20px;
            background: none;
            color: #03142E;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            border-color: #DCDEE2;
            background: #fff;
            .icon-holder{
                width: 38px;
                height: 38px;
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                align-items: center;
                background: #E7F4F1;
                border-radius: 50%;
                color: #219F84;
                font-size: 22px;
                margin-right: 6px;
            }
            strong{
                width: 50%;
            }
        }
    }
</style>
