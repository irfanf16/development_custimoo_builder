<template>
  <div id="app" v-cloak>
    <Header />
    <router-view/>
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop, Vue, Watch} from 'vue-property-decorator'
import Header from '@/components/Header.vue';
import {LockerProducts} from "@/mixins/LockerProduct";

import Echo from "laravel-echo";
window.io = require('socket.io-client');

// console.log(localStorage.getItem('access_tokens'))
window.Echo = new Echo({
  broadcaster: "socket.io",
  transports: ['websocket', 'polling', 'flashsocket'],
  host: window.location.hostname + ':6001',
  auth: {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('access_token'),
    },
  },
});

@Component<App>({
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
        if(!localStorage.getItem('browserToken')){
          await this.$store.dispatch('setBrowserToken')
        }
        this.$router.push({name: 'Home'})
        this.$store.commit('RESET_STORE')
      }else{
        alert('no customer')
      }
      this.$store.commit('SET_RECENT_LOGOS')
    }
    const customer =  this.$store.getters.getCustomer;
    window.Echo.channel(`notification.${customer.id}`).listen('RoasterUpdatedEvent',  (e) => {
      this.$store.commit('UPDATE_NOTIFICATIONS', e.notification)
    })
  }
})
export default class App extends Mixins(LockerProducts) {
  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  @Watch('isCustomerAuthenticated')
  async isCustomerAuthenticatedChanged(newVal: boolean, oldVaL: boolean){
    if(newVal) {
      await this.$store.dispatch('GET_LOCKER_PRODUCTS')
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
