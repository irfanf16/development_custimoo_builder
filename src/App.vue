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
  },
  async mounted() {
    const token = this.$router.currentRoute.query.token
    if (token){
      let customer = await this.$store.dispatch('getCustomerFromToken', token)
      if (customer){
        let payload = {
          access_token: token,
          user: customer
        }
        this.$store.commit('SET_CUSTOMER', payload)
        this.$router.push({name: 'Home'})
        this.$store.commit('RESET_STORE')
      }else{
        alert('no customer')
      }
    }
  }
}
</script>

<style lang="scss">
* {
  touch-action: manipulation;
}
@import '@/assets/scss/custom';

#app {
  font-family: 'Ubuntu', sans-serif;
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
