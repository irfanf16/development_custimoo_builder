import Vue from "vue";

const base_url = process.env.VUE_APP_API_BASE_URL
import Axios, { AxiosRequestConfig } from "axios"
import Store from './store'
const http = Axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL+"/api",
  headers: {
    "Content-type": "application/json",
  }
});

const noTokenRequest =  Axios.create({
  baseURL: base_url+"/api",
  headers: {
    "Content-type": "application/json"
  }
});

http.interceptors.request.use((request: AxiosRequestConfig ) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    request.headers.Authorization = `Bearer ${token}`
  }
  const jwtToken = localStorage.getItem(Vue.prototype.$jwtToken_localstorage_key)
  if (jwtToken) {
    request.headers.CustomerToken = `${jwtToken}`
  }
  else{
    request.headers.CustomerToken = ''
  }
  const browserToken = localStorage.getItem(Vue.prototype.$browserToken_localstorage_key)
  if (browserToken)
    request.headers.browserToken = browserToken
  else
    request.headers.browserToken = ''

  request.headers.subpageurl = `${ window.location.pathname}`

  return request
})

http.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if(error.response && 500 === error.response.status && error.response.data.message == 'Expired token') {
    localStorage.setItem(Vue.prototype.$jwtToken_localstorage_key, '');
    localStorage.setItem(Vue.prototype.$adminToken_localstorage_key, '');
    location.reload()
  }
  else if (401 === error.response.status) {
    localStorage.setItem(Vue.prototype.$jwtToken_localstorage_key, '');
    localStorage.setItem(Vue.prototype.$adminToken_localstorage_key, '');
   // location.reload()
  }
  else if (error.response.status === 420 ) {
    Store.dispatch('logoutCustomer')
  }
  else {
    return Promise.reject(error);
  }
});


export {http, noTokenRequest}
