<template>
  <div id="app">
    <Header />
    <router-view/>
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import {noTokenRequest} from "@/httpCommon";
import store from "@/store/index";

export default{
  name: 'App',
  components: {
    Header
  },
  store: store,
  data: function () {
    return {
    }
  },
}
</script>

<style lang="scss">
@import '@/assets/scss/custom';
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
