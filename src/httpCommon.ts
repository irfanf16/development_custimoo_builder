import axios from "axios"

export default axios.create({
  baseURL: "http://api.custimoo.com/api",
  headers: {
    "Content-type": "application/json",
    'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
  }
});
