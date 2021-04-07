<template>
  <div id="app">
    <Header />
    <router-view/>
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Vue from 'vue'
import {http, noTokenRequest} from "@/httpCommon";
import store from "@/store/index";
import axios from "axios";

export default{
  name: 'App',
  components: {
    Header
  },
  store: store,
  beforeCreate() { this.$store.commit('initialiseStore');},
  data: function () {
    return {
      instance: '',
      accessToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvZGV2LmN1c3RvbWl6ZS5uaW5qYSIsImF1ZCI6Imh0dHBzOlwvXC9kZXYuY3VzdG9taXplLm5pbmphIiwiaWF0IjoxNjE3Nzk1NjA2LCJleHAiOjE2MTc3OTYyMDYsInN1YiI6IjFfMTE3IiwiY2xpZW50X2lkIjoiRGV2XzEyX0N1c3RvbWl6ZV9OaW5qYSIsInNjb3BlIjoiIiwiaHR0cHM6XC9cL2FwaS5raXRidWlsZGVyLmNvLnVrXC9lbWFpbCI6Inlhc2lyLmRldjFAZ21haWwuY29tIiwiaHR0cHM6XC9cL2FwaS5raXRidWlsZGVyLmNvLnVrXC9kaXNwbGF5bmFtZSI6Inlhc2lyIHJhc29vbCIsImh0dHBzOlwvXC9hcGkua2l0YnVpbGRlci5jby51a1wvbWV0YWRhdGEiOnsiZmlyc3ROYW1lIjoieWFzaXIiLCJsYXN0TmFtZSI6InJhc29vbCJ9fQ.UO7xT3LnCGxkAahpivroBA8AOtg-s9JgoS8Cjd6hSVRRQWMU9hx-pmwQW8AYadkIDwBXqtYcak7pv9qiwMO7T_PjN871rICsjRwp6KCKu2ycgMYlfIem2nZlhV2fuM2oZfnuSN0IQT1rGhjWEs-4RJ0hznjmmVtuOOMLOVSa8INpfQazTvqok7Mv08p_TSWAf8PHXE_YCvvMf4fRJG-2lhzagVlDSEneDSI2iTfoGbmqYg1BPPz5cWzIO8DdJb-bw2vWe7GnqfldiLeTX8cp1y4TF6cD9URZ1IqwrxLZNhXicK4lvmWO0Ds_NMjx7OfnZluoFAbfYjGUXpeXg9lirQ"
    }
  },
  mounted() {
    // this.instance = axios.create({
    //   baseURL: "http://api.custimoo.com/api",
    //   headers: {
    //     "Content-type": "application/json"
    //   }
    // })

    this.getJwtToken()
  },
  methods: {
    getJwtToken: function (){
      // console.log(this.instance)
      let url = "https://dev.customize.ninja/index.php?route=account/kbauthtoken"
      let config = {
        crossDomain: true,
        headers: {'Access-Control-Allow-Origin': '*'}
      };
        noTokenRequest.get(url, config).then((response) => {
          console.log(response)
        }).catch((e) => {
          console.log(e)
        });
    }
  }
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
