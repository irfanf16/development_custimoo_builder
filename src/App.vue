<template>
  <div id="santa" v-cloak>
    <Header v-if="is_hummel" />
    <Navbar />
    <router-view/>
  </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop, Vue, Watch} from 'vue-property-decorator'
import Header from '@/components/Header.vue';
import Navbar from '@/components/Navbar.vue';
import {LockerProducts} from "@/mixins/LockerProduct";

// import Echo from "laravel-echo";
// window.io = require('socket.io-client');
import {http} from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";
import CommonImportMixin from '@/mixins/CommonImportMixin'

// console.log(localStorage.getItem('access_tokens'))
// if(process.env.VUE_APP_ENABLE_SOCKET == undefined) {
//   window.Echo = new Echo({
//     broadcaster: "socket.io",
//     transports: ['websocket', 'polling', 'flashsocket'],
//     host: window.location.hostname + ':6001',
//     auth: {
//       headers: {
//         Authorization: 'Bearer ' + localStorage.getItem('access_token'),
//       },
//     },
//   });
// }

//todo remove this code after a while as this is used to remove pwa cache
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister()
} })

@Component<App>({
  components: {
    Header,
    Navbar
  },
  mixins: [CommonImportMixin],
  async mounted() {

    // const customer =  this.$store.getters.getCustomer;

  // if(process.env.VUE_APP_ENABLE_SOCKET == undefined) {
  //   window.Echo.channel(`notification.${this.enviorment}.${customer.id}`).listen('RoasterUpdatedEvent',  (e: Record<any,any>) => {
  //     this.$store.commit('UPDATE_NOTIFICATIONS', e.notification)
  //   })
  //   window.Echo.channel(`order_activity_for_user_${this.enviorment}_${customer.id}`).listen('OrderActivityEvent',  (e: Record<any,any>) => {
  //     this.$store.commit('UPDATE_NOTIFICATIONS', e.notification)
  //   })
  //   window.Echo.channel(`Notify_to_user_${this.enviorment}_${customer.id}`).listen('NotifyUser',  (e: Record<any,any>) => {
  //     this.$store.commit('UPDATE_NOTIFICATIONS', e.notification)
  //   })
  //   window.Echo.channel(`orderfile.${customer.id}`).listen('OrderFileCreatedEvent',  (e: Record<any,any>) => {
  //     if(e.design_file.length) {
  //       this.downloadPdfFile(e.design_file)
  //     } else {
  //       this.showError('Pdf file could not be created')
  //     }
  //   })
  // }
  }
})
export default class App extends Mixins(LockerProducts,ErrorMessages) {
  public storageUrl = process.env.VUE_APP_STORAGE_URL
  public enviorment = process.env.VUE_APP_SOCKET_ENV
  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }
  get is_hummel() : boolean {
    return this.$store.getters.getCompany.id === 1
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
      this.showToast('Pdf file created','success')
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
  background: #fff;
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
