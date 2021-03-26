<template>
    <div class="item-to-customize text-left py-5">
        <h2 class="fw-bold mb-2 fz-18">Select Item to Customize</h2>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
@Component<ItemToCustomize>({
})
    export default class ItemToCustomize extends Vue {}
</script>