import Vue from "vue";
import { authenticateUser } from './helpers/Helpers';

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

function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Invalid JWT token');
    return null;
  }
}


let isAuthenticating = false;

http.interceptors.request.use(async (request: AxiosRequestConfig ) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    request.headers.Authorization = `Bearer ${token}`
  }
  const jwtToken: string | null = localStorage.getItem(Vue.prototype.$jwtToken_localstorage_key)
  const refresh_token: string | null = localStorage.getItem(Vue.prototype.$refreshToken_localstorage_key)
  let tokenToUse: string | null = jwtToken;

  if (jwtToken) {
    const decodedToken = parseJwt(jwtToken);

    if (!decodedToken) {
      console.warn('Invalid token format');
      tokenToUse = refresh_token;
    } else {

      if(!decodedToken.exp) {
        tokenToUse = jwtToken;
      } else {
        const nowInSeconds = Math.floor(Date.now() / 1000);

        if (decodedToken.exp < nowInSeconds) {
          tokenToUse = refresh_token;
          if (refresh_token && !isAuthenticating) {
            isAuthenticating = true;
            try {
              await authenticateUser(refresh_token, true);
            } catch (e) {
              console.error('Error during authenticateUser:', e);
            } finally {
              isAuthenticating = false;
            }
          }
          // Optionally, you can throw or reject here to prevent the request with expired token
          // return Promise.reject(new Error('JWT expired'));
        } else {
          // JWT is valid
        }
      }
    }
    request.headers.CustomerToken = `${tokenToUse}`
  } else {
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
