<template>
  <div id="app" v-cloak>
    <Header />
    <router-view/>
  </div>
</template>

<script>
import Header from '@/components/Header.vue';

export default{
  name: 'App',
  components: {
    Header
  }
}
</script>

<style lang="scss">
* {
  touch-action: manipulation;
}
@import '@/assets/scss/custom';

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

[v-cloak] {display: none}
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
