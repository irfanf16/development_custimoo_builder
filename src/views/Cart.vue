<template>
  <div class="page-wrapper m-lg-4" v-cloak>
    cart page
  </div>
</template>

<script lang="ts">

import {Component, Mixins} from 'vue-property-decorator'


@Component<Cart>({
  components: {

  },
})

export default class Cart extends Mixins() {

}
</script>

<style lang="scss" scoped>

</style>
