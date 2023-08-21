<template>
  <div>
    <div>
        <div>
          <div><span class="font-weight-bold fs-2">{{ selectedProduct.display_name }}</span> <span class="read_more" @click="toggle_read(currentStyle)" :data-index="currentStyle"><BIconChevronDown /></span></div>
          <div style="display: none" v-html="sku_information.description">
          </div>
        </div>
    </div>

    <div class="choose-collar mb-3">
      <div class="font-weight-bold fs-2 title">Choose Option</div>

      <div v-if="selectedProduct.productstyles.length > 1" class="choose-collar mb-3">
        <h2 class="fw-bold mb-2 fz-18">Choose option</h2>
        <div class="collar-designs">
          <template v-for="(style, i) in selectedProduct.productstyles">
            <template v-if="selectedProduct.productstyles.length > 1">
              <b-button :key="i" :class="{'active': styleIndex === i}" variant="outline-light" @click="changeStyleIndex(i)">
                <template v-if="style.front_models.length > 0">
                  <img :src="storageUrl+style.front_models[0].file_url " height="100" />
               </template>
              </b-button>
            </template>
          </template>
        </div>
      </div>
    </div>

    <div class="pt-1 mt-1" style="border-top: 1px solid #eee" v-if="selectedProduct.addons">
      <div class="font-weight-bold fs-2">Choose Stuff</div>
      <div class="fade-right">
        <div class="pt-1 d-flex align-items-center gap-1 hide-scroll" style="overflow-x: auto">
          <label v-for="(item, i) in selectedProduct.addons" :key="i">
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
})

export default class Collars extends Vue {
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  private currentStyle = 0;

  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }
  get styleIndex():number{
    return  this.$store.getters.getCurrentStyleIndex;
  }
  get sku_information(){
    return this.$store.getters.getSkuInformation
  }

  private toggle_read(index:number){
    $(`.read_more:eq(${index})`).toggleClass('flip_vertical')
    $(`.read_more:eq(${index})`).parent("div").next("div").slideToggle('fast')
  }

  public changeStyleIndex(i: number) {
    (this.$parent!.$parent as Record<any, any>).isFront = true

    const currentDesign = this.selectedProduct.productstyles[this.styleIndex].productdesigns.filter((item: Record<any, any>) => {
      return item.design_show
    })
    if(currentDesign.length){
      const design_name = currentDesign[0].design_name
      let designFound = false;
      this.selectedProduct.productstyles[i].productdesigns.forEach((item: Record<any, any>) => {
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
