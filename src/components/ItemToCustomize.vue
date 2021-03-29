<template>
    <div class="item-to-customize text-left py-5">
        <h2 class="fw-bold mb-2 fz-18">Select Item to Customize</h2>
        <div class="customization-nav-area">
            <Search />
        </div>
        <SelectItemCarousel />
        <h2 class="fw-bold mt-5 mb-2 fz-18">Designs Available</h2>
        <DesignAvailable />
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import Search from '@/components/Search.vue'
    import SelectItemCarousel from '../components/SelectItemCarousel.vue'
    import DesignAvailable from '../components/DesignAvailable.vue'


@Component<ItemToCustomize>({
    components: {
        Search,
        SelectItemCarousel,
        DesignAvailable
    }
})
    export default class ItemToCustomize extends Vue {}
</script>