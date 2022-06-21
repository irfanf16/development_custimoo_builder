<template>
  <div :class="{'single-model-mobile': productModels.length === 1}">
    <div class="font-weight-bold fs-2 title">Choose Product</div>
    <div class="fade-right products">
      <div class="d-flex align-items-center gap-1 pt-1 pb-2 hide-scroll" v-if="productModels" style="overflow-x: auto;">
        <label class="button_radio" v-for="(item, index) in productModels" :key="index" :class="{'mr-4': index == (productModels.length)-1}">
          <input checked type="radio" name="style" />
          <span>
              <BIconCheckCircleFill />
              <span>{{ item.model_name }}</span>
            </span>
        </label>
      </div>
    </div>

    <div>
      <template>
        <div>
          <div><span class="font-weight-bold fs-2">{{ productModels[currentStyle].model_name }}</span> <span class="read_more" @click="toggle_read(currentStyle)" :data-index="currentStyle"><BIconChevronDown /></span></div>
          <div style="display: none" v-html="productModels[currentStyle].product_model_description">
          </div>
        </div>
      </template>
    </div>

    <div class="choose-collar mb-3">
      <div class="font-weight-bold fs-2 title">Choose Option</div>

      <div v-if="selectedProduct.productstyles.length > 1" class="choose-collar mb-3">
        <h2 class="fw-bold mb-2 fz-18">Choose option</h2>
        <div class="collar-designs">
          <template v-for="(style, i) in selectedProduct.productstyles">
            <template v-if="selectedProduct.productstyles.length > 1">
              <b-button :key="i"  v-if="productModels[currentStyle].model_styles.includes(style.id)" :class="{'active': styleIndex === i}" variant="outline-light" @click="changeStyleIndex(i)">
                <img :src="storageUrl+style.front.file_url " height="100" />
              </b-button>
            </template>
          </template>
        </div>
      </div>
    </div>

    <div class="pt-1 mt-1" style="border-top: 1px solid #eee" v-if="productModels[currentStyle].addons">
      <div class="font-weight-bold fs-2">Choose Stuff</div>
      <div class="fade-right">
        <div class="pt-1 d-flex align-items-center gap-1 hide-scroll" style="overflow-x: auto">
          <label v-for="(item, i) in productModels[currentStyle].addons" :key="i">
            <img :src="storageUrl+style.front.file_url " />
            <input type="checkbox" name="style"/>
            <span>
              <BIconCheckCircleFill/>
              <span>{{ item.addon.name }}</span>
              <span class="mx-1">-</span>
              <span>${{item.addon.price}}</span>
            </span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import {http} from "@/httpCommon";
import {default as $} from "jquery";

@Component<Collars>({
  mounted() {
    console.log('productModels', this.productModels)
  }
})

export default class Collars extends Vue {
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  @Prop({required: true}) productModels!: any

  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }
  get styleIndex():number{
    return  this.$store.getters.getCurrentStyleIndex;
  }

  private currentStyle = 0;

  private toggle_read(index:number){
    $(`.read_more:eq(${index})`).toggleClass('flip_vertical')
    $(`.read_more:eq(${index})`).parent("div").next("div").slideToggle('fast')
  }

  public selectModelStyle(modelIndex: number) {
    this.$store.commit('SET_SELECTED_MODEL_INDEX', modelIndex)
    for (let styleIndex = 0; styleIndex < this.selectedProduct.productstyles.length; styleIndex++) {
      if (this.productModels[modelIndex].model_styles.includes(this.selectedProduct.productstyles[styleIndex].id)) {
        if(styleIndex != this.styleIndex) {
          this.changeStyleIndex(styleIndex)
          break;
        }
      }
    }
  }
  public changeStyleIndex(i: number) {
    (this.$parent.$parent as Record<any, any>).isFront = true

    const currentDesign = this.selectedProduct.productstyles[this.styleIndex].productdesigns.filter((item: Record<any, any>) => {
      return item.design_show
    })
    if(currentDesign.length){
      const design_name = currentDesign[0].design_name
      let designFound = false;
      const newDesign = this.selectedProduct.productstyles[i].productdesigns.forEach((item: Record<any, any>) => {
        if(item.design_name.toLowerCase() == design_name.toLowerCase()) {
          designFound  = true
          Vue.set(item, 'design_show', 1)
          this.$store.dispatch('setSelectedProductDesignID',item.id)
        } else {
          Vue.set(item, 'design_show', 0)
        }
      })
      if (!designFound){
        if(!this.selectedProduct.productstyles[i].productdesigns.filter((design: Record<any, any>) => design.design_show).length) {
          this.selectedProduct.productstyles[i].productdesigns.forEach((item:Record<any, any>, index:number) =>{
            if (index ==0 ){
              Vue.set(this.selectedProduct.productstyles[i].productdesigns[0], 'design_show', 1)
              this.$store.dispatch('setSelectedProductDesignID',this.selectedProduct.productstyles[i].productdesigns[0].id)
            }else{
              Vue.set(this.selectedProduct.productstyles[i].productdesigns[index], 'design_show', 0);
            }
          })
        }
      }
    }
    this.$store.commit('CHANGE_STYLE_INDEX', i);
  }
}
</script>

<style lang="scss" scoped>
.fontList{
  div{
    color: #999;

    &.activeFont{
      color: #121212;
      font-weight: bold;
    }
  }
}
.selected-color{
  height: 15px;
  width: 15px;
  border-radius: 10000px;
  background: transparent;
  display: inline-block;
  box-shadow: 0px 1px 5px rgba(0,0,0,0.4);
}

.single-model-mobile{
  .title,.products{
    display: none;
  }
}

.collar-designs{
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  .btn{
    border-color: #ececec;

    &.active{
      animation: border-blink 2s infinite ease-in-out alternate;
    }
  }
}

@keyframes border-blink {
  from{
    border-color: rgba(33, 159, 132, 0.85);
  }
  to{
    border-color: #cbf4eb;
  }
}
</style>
