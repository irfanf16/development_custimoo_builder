<template>
    <div class="customization-preview-process">
      <header class="preview-area-header py-4">
        <div class="buttons-preview text-left">
          <b-button variant="outline-secondary">Locker room</b-button>
          <b-button variant="outline-secondary">Save to locker room</b-button>
          <b-button variant="outline-secondary">Buy Now</b-button>
        </div>
        <ul class="preview-header-icons">
          <li><a href="#."><font-awesome-icon :icon="['fas', 'share-alt']" /></a></li>
          <li><a href="#."><font-awesome-icon :icon="['fas', 'redo-alt']" /></a></li>
        </ul>
      </header>
      <div class="undo-btn-area text-left pt-3">
        <b-button variant="outline-secondary mr-2">Undo</b-button>
        <b-button variant="outline-secondary">Redo</b-button>
      </div>
      <div class="preview-area-customize">
        <div class="preview-section p-3 d-flex flex-wrap justify-content-center align-items-center">
            <div class="image-holder"><img src="@/assets/images/shirt-front.svg" alt="Front View" /></div>
            <div class="image-holder"><img src="@/assets/images/shirt-back.svg" alt="Back View" /></div>
        </div>
      </div>
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
@Component<CustomizationPreviewProcess>({
})
    export default class CustomizationPreviewProcess extends Vue {}
</script>

<style scoped lang="scss">
  .customization-preview-process{
    .undo-btn-area{
      .btn{
        color: #000;
        border-color: #DDDFE3;
        font-size: 12px;
        font-weight: 600;
        &:hover{
          color: #fff;
        }
      }
    }
    .preview-area-header{
      margin: 0 -15px;
      padding: 26px 15px;
      border-bottom: 1px solid #EDF2F6;
      min-height: 91px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      .btn{
        margin: 0 15px 0 0;
        font-size: 14px;
        font-weight: 600;
        color: #000;
        border-color: #DDDFE3;
        border-radius: 5px;
        &:hover{color: #fff;}
      }
      .preview-header-icons{
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        align-items: center;
        font-size: 18px;
        list-style: none;
        li{margin: 0 0 0 12px;}
      }
    }
  }
  .preview-section{
    overflow: hidden;
    max-width: 610px;
    margin: 0 auto;
    .image-holder{
      margin: 0 1%;
      flex: 0 0 48%;
      max-width: 48%;
      img{
        display: block;
        max-width: 100%;
        margin: 0 auto;
        height: auto;
      }
    }
  }
  .preview-area-customize{
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    height: 60vh;
  }
  
</style>