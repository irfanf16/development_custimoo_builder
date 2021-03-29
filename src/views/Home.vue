<template>
  <div class="page-wrapper m-4 bg-white border">
    <b-container fluid>
      <b-row>
        <b-col cols="3" class="text-left border-right py-5">
            <ChooseColor />
        </b-col>
        <b-col cols="6" class="border-right d-flex flex-wrap align-items-center h-100vh">
          <div class="customization-area p-5">
            <CustomizationPreview />
            <b-button class="mt-5" variant="secondary">Continue</b-button>
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
import ChooseColor from '@/components/ChooseColor.vue'
import CustomizationPreview from '@/components/CustomizationPreview.vue'
import ItemToCustomize from '@/components/ItemToCustomize.vue'


@Component<Home>({
  components: {
    ChooseColor,
    CustomizationPreview,
    ItemToCustomize
  }
})

export default class Home extends Vue {}
</script>

