import {http, noTokenRequest} from "@/httpCommon";
import { Module } from "vuex";
const Main:Module<any, any> = {
  actions: {
    setJwtToken() {
      if(!localStorage.getItem('jwtToken')) {
        const url = "https://dev.customize.ninja/index.php?route=account/kbauthtoken"
        const config = {
          crossDomain: true,
          headers: {'Access-Control-Allow-Origin': '*'}
        };
        noTokenRequest.get(url, config).then((response: any) => {
          if (response.data.accessToken) {
            localStorage.setItem('jwtToken', response.data.accessToken)
          }
        }).catch((e) => {
          console.log(e)
        });
      }
    },
    setBrowserToken(){
      if(!localStorage.getItem('browserToken')) {
        let browserTokenString = ''
        for (let i = 0; i < 8; i++) {
          browserTokenString += Math.random().toString(16).slice(-4)
        }
        localStorage.setItem('browserToken', browserTokenString)
      }
    }
  }
}
export default Main;

