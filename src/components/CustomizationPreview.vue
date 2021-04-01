<template>
    <div class="preview-section p-3 d-flex flex-wrap justify-content-center align-items-center" v-if="designs">
      <template v-for="design in designs.productstyles[0].productdesigns">
        <div v-if="design.is_default == 1" class="image-holder" :key="'front'+design.id">
          <Scene :canvas-width="235" :canvas-height="290" :front="{textureUrl: apiBaseUrl+'/'+ design.front_design.file_url, modelUrl: apiBaseUrl+'/'+ designs.productstyles[0].front.file_url}"/>
        </div>
        <div class="image-holder" :key="'back'+design.id">

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
    },
    created() {
      console.log(this.designs)
      const self = this
      setTimeout(function (){
        console.log(self.designs)
      }, 1000)
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
      flex: 0 0 48%;
      max-width: 48%;
      img{
        display: block;
        max-width: 100%;
        margin: 0;
        height: auto;
      }
    }
  }
</style>
