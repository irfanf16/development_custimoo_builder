const base_url = process.env.VUE_APP_API_BASE_URL
import Axios, { AxiosRequestConfig } from "axios"

const http = Axios.create({
  baseURL: "http://api.custimoo.com/api",
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
    request.headers.CustomerToken = `Bearer ${jwtToken}`
  }
  else{
    // request.headers.CustomerToken = `Bearer ${process.env.VUE_APP_JWT_TOKEN}`
    request.headers.BrowserToken = localStorage.getItem('browserToken')
  }

  return request
})

export {http, noTokenRequest}
