<template>
    <div class="customization-text-area">
        <div class="px-3 pt-3 p-lg-4">
            <h2 class="fw-bold mb-2 fz-18">Player Name</h2>
            <b-form>
                <h4 class="mt-1 mt-lg-3 mb-2 fz-16">Player Name</h4>
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
                </div>
            </b-form>
            <h4 class="mt-3 mb-2 fz-16">Select Color</h4>
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
                    <!-- <div class="color-header">
                        <h3>Color Two</h3>
                        <a href="#" @click="showColor()" class="close"><font-awesome-icon :icon="['fas', 'times']" /></a>
                    </div> -->
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

    import { Component, Vue } from 'vue-property-decorator'
    @Component<CustomizationText>({})
    export default class CustomizationText extends Vue {
        public selected= null
        public options= [
          { value: null, text: 'Please Select' },
          { value: 'a', text: 'TYpe 1' }
        ]

        private colorTextActive = false

        public showColor() {
            this.colorTextActive = !this.colorTextActive
        }
    }

</script>