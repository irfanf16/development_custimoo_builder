<template>
  <div class="page-wrapper m-lg-4">
    <div class="loader" v-if="showLoader"><img src="../../src/assets/images/loading.gif"/></div>
    <div v-else class="container-fluid bg-white h-100">
<!--      <div class="text-left">-->
<!--        <h1 class="h1">Dashboard</h1>-->
<!--      </div>-->
<!--      <hr class="border border-secondary"/>-->
      <div class="row">
        <div class="col-6">
          <div class="row">
            <div class="col">
              <div class="card mb-3 bg-success text-white" style="max-width: 540px;">
                <router-link :to="'customer-orders'" class="my-orders">
                  <div class="row no-gutters">
                    <div class="col-md-4 d-flex align-items-center justify-content-center border-right">
                      <i class="fa-solid fa-shirt" style="font-size: 5rem"></i>
                    </div>
                    <div class="col-md-8">
                      <div class="card-body">
                        <h5 class="card-title h1">{{ counters?counters.orders_count:0 }}</h5>
                        <p class="card-text h2">My Orders</p>
                      </div>
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="card mb-3 bg-primary text-white" style="max-width: 540px;">
                <router-link :to="'customer-orders?filter=submitted_for_customer_review'" class="my-orders">
                  <div class="row no-gutters">
                    <div class="col-md-4 d-flex align-items-center justify-content-center border-right">
                      <i class="fa-solid fa-file-image" style="font-size: 5rem"></i>
                    </div>
                    <div class="col-md-8">
                      <div class="card-body">
                        <h5 class="card-title h1">{{ counters?counters.pending_approval_count:0 }}</h5>
                        <p class="card-text h2">Pending Approvals</p>
                      </div>
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col">
                <div class="card mb-3 bg-danger text-white" style="max-width: 540px;">
                  <router-link :to="'customer-orders?filter=shipped'" class="my-orders">
                    <div class="row no-gutters">
                      <div class="col-md-4 d-flex align-items-center justify-content-center border-right">
                        <i class="fas fa-shipping-fast" style="font-size: 5rem"></i>
                      </div>
                      <div class="col-md-8">
                        <div class="card-body">
                          <h5 class="card-title h1">{{ counters?counters.track_my_orders_count:0 }}</h5>
                          <p class="card-text h2">Track my orders</p>
                        </div>
                      </div>
                    </div>
                  </router-link>
                </div>
            </div>
          </div>
<!--          <div class="row">-->
<!--            <div class="col">-->
<!--              <div class="card mb-3 bg-warning text-white" style="max-width: 540px;">-->
<!--                <div class="row no-gutters">-->
<!--                  <div class="col-md-4">-->
<!--                    <img src="https://images-na.ssl-images-amazon.com/images/I/51FCoSE%2BUrL.jpg" alt="shirt" class="img-fluid">-->
<!--                  </div>-->
<!--                  <div class="col-md-8">-->
<!--                    <div class="card-body">-->
<!--                      <h5 class="card-title h1"></h5>-->
<!--                      <p class="card-text h2">Profile Settings</p>-->
<!--                    </div>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
        </div>
        <div class="col-6">
<!--          <div class="row">-->
<!--            <div class="col my-4">-->
<!--              <button type="button" class="btn btn-outline-secondary w-50">My orders</button>-->
<!--            </div>-->
<!--          </div>-->
          <div class="row">
            <div class="col my-4">
              <router-link to="dashboard"  class="btn btn-outline-secondary w-50">My Account</router-link>
            </div>
          </div>
          <div class="row">
            <div class="col my-4">
              <button type="button" class="btn btn-outline-secondary w-50">My profile settings</button>
            </div>
          </div>
          <div class="row">
            <div class="col my-4">
              <router-link to="address" class="btn btn-outline-secondary w-50">Address book</router-link>
            </div>
          </div>
<!--          <div class="row">-->
<!--            <div class="col my-4">-->
<!--              <button type="button" class="btn btn-outline-secondary w-50">Messages</button>-->
<!--            </div>-->
<!--          </div>-->
<!--          <div class="row">-->
<!--            <div class="col my-4">-->
<!--              <router-link :to=" store.hasOwnProperty('url')?store.url:''" class="btn btn-success w-50">Contact {{ store.hasOwnProperty('name')? store.name : '' }}</router-link>-->
<!--            </div>-->
<!--          </div>-->
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {Component, Mixins, Vue} from 'vue-property-decorator'
import {http} from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";


@Component<Dashboard>({
  components: {},
  created() {
    this.getDashboardDetails();
  }
})

export default class Dashboard extends Mixins(ErrorMessages) {

  public showLoader = false
  public counters = null;
  public store = {};

  getDashboardDetails(): void {
    this.showLoader = true;
    http.get(`/dashboards`).then((response: any) => {
      console.log(response);
      this.counters = response.data.result
      this.showLoader = false
    })
      .catch((e: any) => {
        this.showLoader = false
        this.showError(e.response.data.message)
      });
  }

}
</script>

<style lang="scss" scoped>
a.my-orders{
  text-decoration: none;
  color:white;
}
a.my-orders:hover{
  color:#2c3e50;
  opacity: 0.7;
}
</style>
