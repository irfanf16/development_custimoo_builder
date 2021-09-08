
const base_url = process.env.VUE_APP_API_BASE_URL
import Axios, { AxiosRequestConfig } from "axios"

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
  const jwtToken = localStorage.getItem('jwtToken')
  if (jwtToken) {
    request.headers.CustomerToken = `${jwtToken}`
  }
  else{
    request.headers.CustomerToken = ''
  }
  const browser_token = localStorage.getItem('browser_token')
  if (browser_token)
    request.headers.browser_token = browser_token
  else
    request.headers.browser_token = ''

  return request
})

http.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if (401 === error.response.status) {
    localStorage.setItem('access_token', '');
    localStorage.setItem('jwtToken', '');
    location.reload()
  } else {
    return Promise.reject(error);
  }
});


export {http, noTokenRequest}
