<template>
  <div class="card card-body align-items-center justify-content-center" style="min-height: 85vh;">
    <div class="text-danger fs-10">
      <b-icon-exclamation-triangle></b-icon-exclamation-triangle>
    </div>
    <div class="mt-2 fs-2">
      {{company.inactive_message ? company.inactive_message : 'Customizer is not active from the admin, please contact the admin.'}}
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'

@Component<Deactive>({
  components: {
  },
  beforeMount() {
    if(this.company.status == 1){
      this.$router.replace('/')
    }
  }
})
export default class Deactive extends Vue {
  get company(){
    return this.$store.getters.getCompany
  }
}
</script>
