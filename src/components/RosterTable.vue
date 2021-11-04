<template>
  <div class="players-table mt-3 hide-scroll h-100">
    <table class="table table-bordered table-striped roster-data">
      <thead>
      <tr>
        <th>Name</th>
        <th>No</th>
        <th>Size</th>
        <th>Qty</th>
        <th>Delete</th>
      </tr>
      </thead>
      <tbody>
      <template v-for="(roster, index) in rosterDetails" >
        <tr :key="index">
        <td style="width: auto;">
          <b-form-input
            class="text-center" ref="myInputs"
             v-model="roster.text" />
        </td>
        <td style="width: auto; text-align: center">
          <b-form-input
            class="text-center" ref="myInputs"
             v-model="roster.number" />
        </td>
        <td style="width: auto; text-align: center">
          <b-form-select ref="myInputs" v-model="roster.size" :options="productSizes"></b-form-select>
        </td>
        <td style="width: auto; text-align: center">
          <b-form-input
            class="text-center" ref="myInputs"
            placeholder="0" v-model="roster.quantity"
          ></b-form-input>
        </td>
        <td  class="fs-2" style="width: 40px; word-spacing: 10px; text-align: center; color: #fff; background: rgba(250,0,0,0.7)"><BIconX v-if="rosterDetails.length > 1" @click="removeIndex(index)" /></td>
      </tr>
      </template>
      </tbody>
    </table>
    <div class="text-right mt-2">
      <button @click="addPlayers(roster)" class="btn btn-secondary light rounded-circle p-0 fs-4 d-inline-flex align-items-center justify-content-center" style="height: 35px; width: 35px">
        <BIconPlus />
      </button>
      <b-button variant="primary"  @click="saveRoster(productId)">Save Roster</b-button>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
import readXlsxFile from "read-excel-file";
import {default as $} from "jquery";
import {http} from "@/httpCommon";

@Component<RosterTable>({
  mounted() {
    this.roster.push(this.obj)
  },
})
export default class RosterTable extends Vue {
  @Prop({required: true}) productSizes!: any
  @Prop({required: true, default: 0}) productId!: number
  @Prop({required: true, default: []}) rosterDetails: Record<any, any>;
  private roster: any[] = []
  public fileData: Record<any, any>[] = []
  public selected = this.productSizes[0]
  public firstColor!: Record<any, any>
  public secondColor!: Record<any, any>
  public currentIcon = 'eye-slash'
  public ref = this.$refs as Record<any, any>
  public obj = {
    text:'',
    number:'',
    size:'SM',
    quantity:5,
    information:''
  };
  public rosters:any[]=[]
  public fontsColors: any[] = []
  public fontOptions: Record<any, any>[] = []

  get selectedProduct(): Record<any, any>{
    return this.$store.getters.getSelectedProduct
  }

  get customText():Record<any, any>[]{
    return this.$store.getters.getCustomTexts;
  }
  get eyeIndex():number{
    return this.$store.getters.getEyeIndex;
  }

  public addPlayers(obj:Record<any, any>) {
    this.$emit('addPlayer');
  }
  public isActive = false;
  public myFilter() {
    this.isActive = !this.isActive
  }

  public removeIndex(ind:number){
    this.rosterDetails.splice(ind, 1)
  }
  public saveRoster(id:number){
    http.post('update/roster', {id:id, roster: this.rosterDetails}).then((res) => {
      if (res.status == 201){
        this.$router.push('/')
      }
    }).catch((err)=>{
      console.log(err)
    })
  }

}
</script>

<style lang="scss" scoped>
.roster-upload-area{
  overflow: hidden;
  margin: 0 0 15px;
  padding: 0;
  h3{
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 10px;
  }
  .btn{
    margin: 0 0 10px;
    svg{
      fill: #fff;
      color: #fff;
    }
    &:hover{
      svg{
        fill: #219f84;
        color: #219f84;
      }
    }
  }
}
.roster-template-area{
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  .btn-secondary{
    font-size: 14px;
    color: #219F84;
    background: #E7F4F1;
    font-weight: 500;
    flex: 0 0 48%;
    max-width: 48%;
    border-color: #E7F4F1;
    transition: all 0.3s ease;
    position: relative;
    &:hover{
      background: #219f84;
      color: #fff;
      a{color: #fff;}
    }
    .custom-file{
      position: absolute;
      right: 22%;
      left: 0;
      top: 0;
      bottom: 0;
      opacity: 0;
      margin: 0;
      width: auto;
    }
    a{
      color: #219f84;
      margin: 0 0 0 3px;
      &:hover{
        color: #fff;
      }
    }
  }
}

.roster-data{
  thead{
    tr{
      th{
        text-align: left;
      }
    }
  }
  tbody{
    tr{
      td{
        padding: 0;
        vertical-align: middle;

        input, select{
          border: none;
          background: transparent;
          text-align: left !important;
        }

        input::placeholder{
          color: #ccc !important;
        }
        input::-moz-placeholder{
          color: #ccc !important;
        }
      }
    }
  }
}
</style>
