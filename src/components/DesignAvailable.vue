<template>
    <div class="available-designs-section">
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
        <div class="design-col">
            <a href="#."><img src="@/assets/images/slide-img-1.png" alt="design 1" /></a>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'

    @Component<DesignAvailable>({})

    export default class DesignAvailable extends Vue {}

</script>

<style scoped lang="scss">
    .available-designs-section{
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        max-height: 50vh;
        overflow: hidden;
        overflow-y: auto;
        &:after{
            content: '';
            flex: auto;
        }
        .design-col{
            flex: 0 0 23%;
            max-width: 23%;
            margin-bottom: 10px;
            &:last-child{margin-left: 10px;}
            a{display: block;}
            img{
                display: block;
                max-width: 100%;
                margin: 0;
                height: auto;
            }
        }
    }
</style>