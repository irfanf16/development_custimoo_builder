<template>
    <b-tabs>
      <!-- <template v-if="productModels.length > 1"> -->
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
                        <template v-if="selectedProduct.productstyles > 1">
                          <b-button :key="i"  v-if="model.model_styles.includes(style.id)" variant="outline-light" @click="changeStyleIndex(i)"><img :src="apiBaseUrl+'/'+style.front.file_url " /></b-button>
                        </template>
                      </template>
                    </div>
                </div>
                <div class="choose-stuff" v-if="selectedProduct.addons.length > 0">
                    <h2 class="fw-bold mb-3 fz-18">Choose Stuff</h2>
                    <div class="stuff-row" v-for="(item, i) in selectedProduct.addons" :key="i">
                        <b-form-checkbox size="lg">{{ item.addon.name }}</b-form-checkbox>
                        <span class="charges">+${{item.addon.price}}</span>
                    </div>
                </div>
            </div>
        </b-tab>
        <!-- </template> -->
    </b-tabs>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import {http} from "@/httpCommon";

    @Component<CollarStyle>({

    })

    export default class CollarStyle extends Vue {
      private apiBaseUrl = process.env.VUE_APP_API_BASE_URL
      @Prop({required: true}) productModels!: any

      get selectedProduct(): Record<any, any>{
        return this.$store.getters.getSelectedProduct
      }
      get styleIndex():number{
        return  this.$store.getters.getCurrentStyleIndex;
      }
      public changeStyleIndex(i:number){
        const currentDesign = this.selectedProduct.productstyles[this.styleIndex].productdesigns.filter((item: Record<any, any>) => {
          return item.design_show
        })
        if(currentDesign.length){
          const design_name = currentDesign[0].design_name
          let designFound = false;
          const newDesign = this.selectedProduct.productstyles[i].productdesigns.forEach((item: Record<any, any>) => {
            if(item.design_name == design_name) {
              designFound  = true
              Vue.set(item, 'design_show', 1)
            } else {
              Vue.set(item, 'design_show', 0)
            }
          })
          if (!designFound){
            this.selectedProduct.productstyles[i].productdesigns.forEach((item:Record<any, any>, index:number) =>{
              if (index ==0 ){
                Vue.set(this.selectedProduct.productstyles[i].productdesigns[0], 'design_show', 1)
              }else{
                Vue.set(this.selectedProduct.productstyles[i].productdesigns[index], 'design_show', 0);
              }
            })
          }
        }
        this.$store.commit('CHANGE_STYLE_INDEX', i);
      }
    }
</script>
