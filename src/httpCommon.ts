
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
  const jwtToken = localStorage.getItem('jwtToken') ? localStorage.getItem('jwtToken') : 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvY3VzdGltb28udGVzdCIsImF1ZCI6Imh0dHBzOlwvXC9jdXN0aW1vby50ZXN0IiwiaWF0IjoxNjUxOTg1Njc4LCJleHAiOjE2NTcxNjk2NzgsInN1YiI6ODgsImNsaWVudF9pZCI6IiIsInNjb3BlIjoiIiwibWV0YWRhdGEiOnsiZmlyc3RfbmFtZSI6Inlhc2lyIiwibGFzdF9uYW1lIjoicmFzb29sIiwiZW1haWwiOiJ5YXNpci5kZXYxQGdtYWlsLmNvbSJ9fQ.pITiqq0RPBpg8fKgWuwXiFp2g9gvw7rLJY07wdBz_9I'
  if (jwtToken) {
    request.headers.CustomerToken = `${jwtToken}`
  }
  else{
    request.headers.CustomerToken = ''
  }
  const browserToken = localStorage.getItem('browserToken')
  if (browserToken)
    request.headers.browserToken = browserToken
  else
    request.headers.browserToken = ''

  return request
})

http.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if (401 === error.response.status) {
    localStorage.setItem('jwtToken', '');
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
