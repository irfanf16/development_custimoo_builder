<script lang="ts">
import axios from "axios"

export default axios({
  baseURL: "http://api.custimoo.com/api",
  headers: {
    "Content-type": "application/json"
  }
})
</script>
