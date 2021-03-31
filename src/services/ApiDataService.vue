<script lang="ts">
import http from "../httpCommon.vue"

class ApiDataService {
  getAll(payload: string) {
    return http.get(`/list/products${payload}`)
  }
  getSingle(payload: string) {
    return http.get(`/product/colors${payload}`)
  }
  // get(id: string) {
  //   return http.get(`/tutorials/${id}`);
  // }
}

export default new ApiDataService()
</script>
