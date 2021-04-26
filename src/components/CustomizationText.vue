<template>
  <div class="customization-text-area">
    <div class="p-4">
      <h2 class="fw-bold mb-2 fz-18">Player Name</h2>
      <b-form>
        <b-form-input
          id="inline-form-input-name"
          class="mb-2 mr-sm-2 mb-sm- 0"
          placeholder="Type Here"
        ></b-form-input>
        <h4 class="mt-3 mb-2 fz-16">Font Type</h4>
        <div class="font-type-area">
          <div class="type-block">
            <b-form-select v-model="selected" :options="options"></b-form-select>
          </div>
          <div class="arc-block">
            <b-form-checkbox>Arc Text</b-form-checkbox>
          </div>
          <div class="arc-field">
            <b-form-input
              id="inline-form-input-name"
              class="mb-2 mr-sm-2 mb-sm-0"
              placeholder="50 %"
            ></b-form-input>
          </div>
        </div>
      </b-form>
      <div class="text-color-holder" :class="{ active: colorTextActive }">
        <a href="#." v-on:click="showColor()">
          <div class="text-color-box">
            <div class="color-circle"></div>
            <strong>Fill Color</strong>
          </div>
        </a>
        <a href="#." v-on:click="showColor()">
          <div class="text-color-box">
            <div class="color-circle"></div>
            <strong>Outline Color</strong>
          </div>
        </a>
        <div class="color-holder">
          <div class="color-header">
            <h3>Color Two</h3>
            <a href="#" @click="showColor()" class="close">
              <font-awesome-icon :icon="['fas', 'times']"/>
            </a>
          </div>
          <div class="color-container">
            <div class="color-box"></div>
            <div class="color-box"></div>
            <div class="color-box"></div>
            <div class="color-box"></div>
            <div class="color-box"></div>
            <div class="color-box"></div>
            <div class="color-box"></div>
            <div class="color-box"></div>
            <div class="color-box"></div>
            <div class="color-box"></div>
            <div class="color-box"></div>
            <div class="color-box"></div>
            <div class="color-box"></div>
            <div class="color-box"></div>
            <div class="color-box"></div>
            <div class="color-box"></div>
            <div class="color-box"></div>
            <div class="color-box"></div>
            <div class="color-box"></div>
            <div class="color-box"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {Component, Prop, Vue} from 'vue-property-decorator'

@Component<CustomizationText>({
  mounted() {
    this.fontsList()
  }
})
export default class CustomizationText extends Vue {
  @Prop({required: true}) productFonts!: any

  public selected = null
  public options = [
    {value: null, text: 'Please Select'}
  ]
  public fontFaces: any[] = []
  private colorTextActive = false
  private apiBaseUrl: string = process.env.VUE_APP_API_BASE_URL

  public fontsList() {
    this.productFonts.forEach((fonts: any, key: number) => {
      console.log(fonts)
      let fontNameParam = fonts.file_url.split('/').reverse()
      fontNameParam = fontNameParam[0].split('.')
      console.log(fontNameParam[0])
      let fontName = fontNameParam[0].replace('-', ' ').toUpperCase()
      let font = {
        value: fontNameParam[0],
        text: fontName
      }
      this.options = this.options.concat([font])

      let fontUrl = this.apiBaseUrl+'/'+fonts.file_url
      this.fontFaces = this.fontFaces.concat()

      let fontStyle = document.createElement('link')
      fontStyle.setAttribute('href', fontUrl)
      fontStyle.setAttribute('rel', 'stylesheet')
      document.head.appendChild(fontStyle)
    })
  }

  public showColor() {
    this.colorTextActive = !this.colorTextActive
  }
}

</script>
