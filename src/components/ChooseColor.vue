<template>
    <div class="choose-color-holder">
        <h2 class="fw-bold mb-3 fz-18">Choose Color</h2>
        <div class="choose-color d-flex flex-wrap justify-content-between">
            <a href="#.">
                <div>
                    <div class="color-circle"></div>
                    <strong>Color One</strong>
                </div>
            </a>
            <a href="#.">
                <div>
                    <div class="color-circle"></div>
                    <strong>Color One</strong>
                </div>
            </a>
            <a href="#.">
                <div>
                    <div class="color-circle"></div>
                    <strong>Color One</strong>
                </div>
            </a>
            <a href="#.">
                <div>
                    <div class="color-circle"></div>
                    <strong>Color One</strong>
                </div>
            </a>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
@Component<ChooseColor>({
})
    export default class ChooseColor extends Vue {}
</script>

<style scoped lang="scss">
    .choose-color-holder{
        max-width: 300px;
        margin: 0 auto;
    }
    .choose-color{
        a{
            display: block;
            width: 140px;
            height: 140px;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            border: 1px solid #DCDEE2;
            margin: 0 0 20px;
            border-radius: 6px;
            font-weight: 700;
            &:hover{text-decoration: none;}
        }
        .color-circle{
            border-radius: 50%;
            width: 72px;
            height: 72px;
            background: #FFC658;
            border: 1px solid #EFF2F4;
            position: relative;
            margin: 0 0 12px;
            &:before{
                position: absolute;
                content: '';
                left: 0;
                right: 0;
                bottom: 0;
                top: 0;
                z-index: 1;
                border: 6px solid #fff;
                border-radius: 50%;
            }
        }
    }
</style>