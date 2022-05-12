<template>
  <div id="santa" v-cloak>
    <Header />
    <Navbar />
    <router-view/>
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop, Vue, Watch} from 'vue-property-decorator'
import Header from '@/components/Header.vue';
import Navbar from '@/components/Navbar.vue';
import {LockerProducts} from "@/mixins/LockerProduct";

import Echo from "laravel-echo";
import {http} from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";
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
    Header,
    Navbar
  },
  async mounted() {
    await this.$store.dispatch('getPlatform');
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

    window.Echo.channel(`notification.${this.enviorment}.${customer.id}`).listen('RoasterUpdatedEvent',  (e: Record<any,any>) => {
      this.$store.commit('UPDATE_NOTIFICATIONS', e.notification)
    })
    window.Echo.channel(`order_activity_for_user_${this.enviorment}_${customer.id}`).listen('OrderActivityEvent',  (e: Record<any,any>) => {
      this.$store.commit('UPDATE_NOTIFICATIONS', e.notification)
    })
    window.Echo.channel(`Notify_to_user_${this.enviorment}_${customer.id}`).listen('NotifyUser',  (e: Record<any,any>) => {
      this.$store.commit('UPDATE_NOTIFICATIONS', e.notification)
    })
    window.Echo.channel(`orderfile.${customer.id}`).listen('OrderFileCreatedEvent',  (e: Record<any,any>) => {
      if(e.design_file.length) {
        this.downloadPdfFile(e.design_file)
      } else {
        this.showError('Pdf file could not be created')
      }
    })
  }
})
export default class App extends Mixins(LockerProducts,ErrorMessages) {
  public storageUrl = process.env.VUE_APP_STORAGE_URL
  public enviorment = process.env.VUE_APP_SOCKET_ENV
  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  @Watch('isCustomerAuthenticated')
  async isCustomerAuthenticatedChanged(newVal: boolean, oldVaL: boolean){
    if(newVal) {
      await this.$store.dispatch('GET_LOCKER_PRODUCTS')
    }
  }

  public downloadPdfFile(file_url:string) {
    http.get('pdf/download?file_url='+this.storageUrl+file_url,{responseType:'blob'}).then((res:Record<any, any>) => {
      let blob = new Blob([res.data],{type:res.headers['content-type']})
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = 'order_design.pdf';
      link.click();
      this.showToast('Pdf file created','SUCCESS')
    })
  }

}
</script>

<style lang="scss">
* {
  touch-action: manipulation;
}
@import '@/assets/scss/custom';

#santa {
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
