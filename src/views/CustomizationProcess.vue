<template>
    <div class="page-wrapper m-4 bg-white border">
    <b-container fluid>
      <b-row>
        <b-col cols="3" class="text-left border-right py-3">
            <CustomizationTabs />
        </b-col>
        <b-col cols="6" class="border-right">
          <div class="customization-area">
            <CustomizationPreviewProcess />
            <div class="continue-btn-holder pt-5">
                <b-button class="mx-2 px-5 back-btn" variant="secondary">Back</b-button>
                <b-button class="mx-2 px-5" variant="secondary">Next</b-button>
            </div>
          </div>
        </b-col>
        <b-col cols="3">
          <ItemToCustomize />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import ItemToCustomize from '@/components/ItemToCustomize.vue'
    import CustomizationPreviewProcess from '@/components/CustomizationPreviewProcess.vue'
    import CustomizationTabs from '@/components/CustomizationTabs.vue'

    @Component<CustomizationProcess>({
        components: {
            ItemToCustomize,
            CustomizationTabs,
            CustomizationPreviewProcess
        }
    })
    export default class CustomizationProcess extends Vue {}

</script>
