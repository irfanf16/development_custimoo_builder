<template>
    <div class="customization-tabs">
        <b-tabs>
            <b-tab active>
                <template #title>
                    <div class="icon-holder"><font-awesome-icon :icon="['fas', 'image']" /></div>
                    Logo
                </template>
                <div class="logo-placement-tabs">
                    <logo-placement-tabs />
                </div>
            </b-tab>
            <b-tab>
                <template #title>
                    <div class="icon-holder"><font-awesome-icon :icon="['fas', 'fill-drip']" /></div>
                    Color
                </template>
                <div>
                    <h2 class="fw-bold fz-16 p-3">Choose Color</h2>
                    <color-accordion />
                </div>
            </b-tab>
            <b-tab>
                <template #title>
                    <div class="icon-holder"><font-awesome-icon :icon="['fas', 'text-height']" /></div>
                    Text
                </template>
                <p class="p-3">Tab contents 2</p>
            </b-tab>
            <b-tab>
                <template #title>
                    <div class="icon-holder"><font-awesome-icon :icon="['fas', 'swatchbook']" /></div>
                    Style
                </template>
                <p class="p-3">Tab contents 2</p>
            </b-tab>
            <b-tab>
                <template #title>
                    <div class="icon-holder"><font-awesome-icon :icon="['fas', 'user-friends']" /></div>
                    Team
                </template>
                <p class="p-3">Tab contents 2</p>
            </b-tab>
        </b-tabs>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import ColorAccordion from '@/components/ColorAccordion.vue'
import LogoPlacementTabs from './LogoPlacementTabs.vue'
    @Component<CustomizationProcess>({
        components: {
            ColorAccordion,
            LogoPlacementTabs
        }
    })
    export default class CustomizationProcess extends Vue {
        
    }

</script>
