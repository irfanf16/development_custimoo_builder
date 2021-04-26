<template>
    <div class="preview-section p-3 d-flex flex-wrap justify-content-center align-items-center" v-if="designs">
      <template v-for="design in designs.productstyles[0].productdesigns">
        <div v-if="design.design_show == 1" class="image-holder" :key="'front'+design.id">
          <Scene v-if="designs.productstyles[0].back" :canvas-width="260" :canvas-height="290" :front="{textureUrl: apiBaseUrl+'/'+ design.front_design.file_url, modelUrl: apiBaseUrl+'/'+ designs.productstyles[0].front.file_url}" :back="{textureUrl: apiBaseUrl+'/'+ design.back_design.file_url, modelUrl: apiBaseUrl+'/'+ designs.productstyles[0].back.file_url}" :logos="designs.productstyles[0].logo" :logosSettings="design.logos_setting" :logoAllowed="Boolean(design.is_logo_allowed)" :logosLimit="design.allowed_logos_count" :productColors="design.colors" />
          <Scene v-else :canvas-width="290" :canvas-height="360" :front="{textureUrl: apiBaseUrl+'/'+ design.front_design.file_url, modelUrl: apiBaseUrl+'/'+ designs.productstyles[0].front.file_url}" :logos="designs.productstyles[0].logo" :logosSettings="design.logos_setting" :logoAllowed="Boolean(design.is_logo_allowed)" :logosLimit="design.allowed_logos_count" :productColors="design.colors"/>
        </div>
      </template>
    </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator'
  import Scene from "@/components/Scene.vue"

  @Component<CustomizationPreview>({
    components: {
      Scene
    }
  })
  export default class CustomizationPreview extends Vue {
    @Prop({required: true}) designs!: any
    private apiBaseUrl: string =  process.env.VUE_APP_API_BASE_URL
  }
</script>

<style scoped lang="scss">
  .preview-section{
    overflow: hidden;
    .image-holder{
      margin: 0 1%;
      img{
        display: block;
        max-width: 100%;
        margin: 0;
        height: auto;
      }
    }
  }
</style>
