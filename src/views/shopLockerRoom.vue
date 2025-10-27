<template>
  <div class="page-wrapper m-lg-4" v-cloak>
    <LockerRoomModal ref="lockerModal" />
  </div>
</template>

<script lang="ts">

import {Component, Mixins} from 'vue-property-decorator'
import LockerRoomModal from '@/components/LockerRoomModal.vue';
import ModalAction from "@/mixins/ModalAction";


@Component<shopLockerRoom>({
  components: {
    LockerRoomModal
  },
})

export default class shopLockerRoom extends Mixins(ModalAction) {
  async mounted() {
    await this.$store.dispatch('GET_LOCKER_PRODUCTS', 'fetch_all=true')
    this.showVModal('locker-modal')
  }

  get roomWithProducts(): Record<any, any> {
    return this.$store.getters.getLockerProducts
  }
}
</script>

<style lang="scss" scoped>

</style>
