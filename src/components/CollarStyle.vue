<template>
    <b-tabs>
        <b-tab v-for="(model, index)  in productModels" :key="index">
            <template #title>
              {{ model.model_name }}
            </template>
            <div class="collar-area">
                <div class="collar-description">
                    <h3>*   {{ model.model_name }}</h3>
                    <div v-html="model.product_model_description">  </div>
                </div>
                <div class="choose-collar mb-3">
                    <div class="collar-designs">
                      <template v-for="(style, i) in selectedProduct.productstyles">
                        <b-button :key="i" v-if="model.model_styles.includes(style.id)" variant="outline-light"><img :src="apiBaseUrl+'/'+style.front.file_url " /></b-button>
                      </template>
                    </div>
                </div>
                <div class="choose-stuff">
                    <h2 class="fw-bold mb-3 fz-18">Choose Stuff</h2>
                    <div class="stuff-row">
                        <b-form-checkbox size="lg">Fight strap</b-form-checkbox>
                        <span class="charges">+$5</span>
                    </div>
                    <div class="stuff-row">
                        <b-form-checkbox size="lg">Embroidery</b-form-checkbox>
                        <span class="charges">+$15</span>
                    </div>
                    <div class="stuff-row">
                        <b-form-checkbox size="lg">Capt Patch</b-form-checkbox>
                        <span class="charges">+$50</span>
                    </div>
                </div>
            </div>
        </b-tab>
    </b-tabs>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import {http} from "@/httpCommon";

    @Component<CollarStyle>({
      mounted() {
        this.getModels()
      }
    })

    export default class CollarStyle extends Vue {
      private apiBaseUrl: string = process.env.VUE_APP_API_BASE_URL
      public productModels:any[] = []
      get selectedProduct(): Record<any, any>{
        return this.$store.getters.getSelectedProduct
      }

      public async getModels(){
        await http.get("style/information/"+ this.selectedProduct.product_id).then((res:any)=>{
          this.productModels = res.data;
          console.log(this.styleModels);
        });
      }
      get styleModels(): number[]{
        let self = this;
        let styleModels: number[] = []
        for (let item in this.selectedProduct.productstyles){
          for (let data in this.selectedProduct.productstyles[item].style_models){
            if (!styleModels.includes(this.selectedProduct.productstyles[item].style_models[data].id)) {
              styleModels.push(this.selectedProduct.productstyles[item].style_models[data].id);
            }
          }
        }
        return styleModels;
      }
    }
</script>
