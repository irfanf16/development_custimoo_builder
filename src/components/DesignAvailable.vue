<template>
  <div class="available-designs-section" v-if="productDesignsData">
    <div class="design-col" v-for="design in productDesignsData.productstyles[0].productdesigns" :key="design.id">
      <a href="#.">
        <Scene :canvas-height="73" :canvas-width="59" :front="{textureUrl: apiBaseUrl+'/'+ design.front_design.file_url, modelUrl: apiBaseUrl+'/'+ productDesignsData.productstyles[0].front.file_url}"/>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator'
  import Scene from '@/components/Scene.vue'

  @Component<DesignAvailable>({
    components: {
      Scene
    }
  })

  export default class DesignAvailable extends Vue {
    @Prop({required: true}) productDesignsData !: any
    private apiBaseUrl: string =  process.env.VUE_APP_API_BASE_URL
  }
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
