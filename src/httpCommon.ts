import axios from "axios"

export default axios.create({
  baseURL: "http://api.custimoo.com/api",
  headers: {
    "Content-type": "application/json"
  }
});
