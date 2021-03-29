<template>
    <carousel class="select-item-slider" :items="4" :margin="20" :loop="true" :center="true" :touchDrag="true" :dots="false">

        <a href="#.">
            <img src="@/assets/images/slide-img-1.png" alt="Shirt 1" />
        </a>
        <a href="#.">
            <img src="@/assets/images/slide-img-1.png" alt="Shirt 2" />
        </a>
        <a href="#.">
            <img src="@/assets/images/slide-img-1.png" alt="Shirt 3" />
        </a>
        <a href="#.">
            <img src="@/assets/images/slide-img-1.png" alt="Shirt 4" />
        </a>
        <a href="#.">
            <img src="@/assets/images/slide-img-1.png" alt="Shirt 5" />
        </a>

    </carousel>
</template>

<script>

import carousel from 'vue-owl-carousel'

export default {
    components: { carousel },
}

</script>

<style lang="scss" scoped>

</style>