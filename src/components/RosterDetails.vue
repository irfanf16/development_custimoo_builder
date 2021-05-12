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
    <div class="roster-row mb-2" v-for="(roster, index) in rosterDetails" :key="index">
      <div class="align-left">
        <div class="hide-show">
          <a href="#">
            <font-awesome-icon :icon="['fas', 'eye-slash']"/>
          </a>
        </div>
        <div class="roster-name">
          <b-form-input
            id="inline-form-input-name"
            placeholder="Name"
          ></b-form-input>
        </div>
        <div class="shirt-no">
          <b-form-input
            id="inline-form-input-name"
            class="text-center"
            placeholder="00"
          ></b-form-input>
        </div>
        <div class="shirt-size">
          <b-form-select v-model="roster.size" :options="productSizes"></b-form-select>
        </div>
      </div>
      <div class="align-right">
        <div class="qty">
          <b-form-input
            id="inline-form-input-name"
            class="text-center"
            placeholder="0"
          ></b-form-input>
        </div>
        <div class="remove">
          <a href="#">
            <font-awesome-icon :icon="['fas', 'trash-alt']"/>
          </a>
        </div>
      </div>
    </div>
    <div class="roster-row mb-2 button-holder">
      <button class="btn btn-secondary fw-bold pl-4 pr-4 pl-lg-5 pr-lg-5" @click="addPlayer">Add Player</button>
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

  get rosterDetails(): [Record<any, any>] {
    return this.$store.getters.getRosterDetails
  }

  public addPlayer() {
    this.$emit('addPlayer')
  }
}
</script>
