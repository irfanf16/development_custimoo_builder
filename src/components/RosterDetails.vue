<template>
  <div class="roster-section">
    <div class="roster-row mb-2">
      <div class="align-left">
        <div class="hide-show"></div>
        <div class="roster-name">Name</div>
        <div class="shirt-no">No</div>
        <div class="shirt-size">Size</div>
      </div>
      <div class="align-right">
        <div class="qty">Qty</div>
        <div class="remove"></div>
      </div>
    </div>
    <template v-for="(roster, index) in rosterDetails">
    <div class="roster-row mb-2"  :key="index">
      <div class="align-left">
        <div class="hide-show">
          <a  @click="changeText(roster.text)">
            <font-awesome-icon :icon="['fas', 'eye-slash']"/>
          </a>
        </div>
        <div class="roster-name">
          <b-form-input
            ref="myInputs"

            placeholder="Name" v-model="roster.text"
          ></b-form-input>
        </div>
        <div class="shirt-no">
          <b-form-input ref="myInputs"

            class="text-center"
            placeholder="00" v-model="roster.number"
          ></b-form-input>
        </div>
        <div class="shirt-size">
          <b-form-select ref="myInputs" v-model="roster.size" :options="productSizes"></b-form-select>
        </div>
      </div>
      <div class="align-right">
        <div class="qty">
          <b-form-input

            class="text-center" ref="myInputs"
            placeholder="0" v-model="roster.quantity"
          ></b-form-input>
        </div>
        <div class="remove">
          <a @click="removeIndex(index, roster.text)">
            <font-awesome-icon :icon="['fas', 'trash-alt']"/>
          </a>
        </div>
      </div>

    </div>
    </template>

    <div class="roster-row mb-2 button-holder">
      <button class="btn btn-secondary fw-bold pl-4 pr-4 pl-lg-5 pr-lg-5" @click="addPlayer(roster)">Add Player</button>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'

@Component<RosterDetails>({})
export default class RosterDetails extends Vue {
  @Prop({required: true}) productSizes!: any
  private roster: any[] = []
  public selected = this.productSizes[0]
  public obj = {
    text:'',
    number:'',
    size:'SM',
    quantity:5,
    information:''
  };
  public rosters:any[]=[]
  public ref = this.$refs as Record<any, any>

  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails
  }
  get customText():[Record<any, any>]{
    return this.$store.getters.getCustomTexts;
  }

  public addPlayer(obj:Record<any, any>) {
    // let d =0;
    // for (let i in this.rosterDetails[ind]){
    //   if (this.rosterDetails[ind][i] == ""){
    //     this.ref.myInputs[d].focus();
    //   }
    //   d++;
    // }
    this.$emit('addPlayer');
  }
  public removeIndex(ind:number, text:string){
    if (this.customText.length>0){
      if (this.customText[0].text  == text){
        this.$store.dispatch('updateCustomTextAttribute', {index: 0, attribute: 'text', value: ''})
      }
    }
    this.$store.dispatch('removeRoster', ind);
  }
  public changeText(text:string){
      this.$store.dispatch('updateCustomTextAttribute', {index: 0, attribute: 'text', value: text})
  }
}
</script>
