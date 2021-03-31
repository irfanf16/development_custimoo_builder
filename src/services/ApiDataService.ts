import http from "../httpCommon"

class ApiDataService {
  getAll(payload: string) {
    return http.get(`/list/products${payload}`)
  }
  getSingle(payload: string) {
    return http.get(`/product/colors${payload}`)
  }
}

export default new ApiDataService()
