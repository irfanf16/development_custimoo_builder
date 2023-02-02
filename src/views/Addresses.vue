<template>
  <div class="page-wrapper m-lg-4">
    <div class="loader" v-if="showLoader"><img src="@assets/images/loading.gif" /></div>
    <div v-else class="container-fluid bg-white">
      <div class="text-left">
        <h1 class="h3">Address Book</h1>
      </div>
      <hr class="border border-secondary" />
      <div class="container-fluid">
        <div class="row">
          <div class="col-12 col-md-4  col-lg-2  border-right">
            <div class="col  my-4">
              <router-link to="dashboard" class="btn btn-outline-secondary w-100">My Account</router-link>
            </div>
            <div class="col  my-4">
              <button type="button" class="btn btn-outline-secondary w-100">My profile settings</button>
            </div>
            <div class="col  my-4">
              <router-link to="address" class="btn btn-outline-secondary w-100">Address book</router-link>
            </div>
          </div>
          <div class="col-12 col-md-8  col-lg-10">
            <div class="d-flex justify-content-end my-2">
              <router-link to="dashboard" class="btn btn-secondary light mx-2">Back</router-link>
              <button class="btn btn-secondary text-nowrap mx-2" @click="addAddressModalShow">New Address</button>
            </div>
            <table class="mt-4" v-if="!addresses">
              <tr>
                <td colspan="2">No addresses added yet</td>
              </tr>
            </table>
            <table class="mt-4" v-else>
              <thead class="bg-dark">
                <tr>
                  <td class="border-0 text-white font-weight-bold py-3">
                    <p class="ml-2">Address</p>
                  </td>
                  <td class="border-0 text-white font-weight-bold py-3" style="width: 200px; max-width: 200px; word-wrap: break-word;">
                    <p class="ml-2">Actions</p>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="address in addresses" :key="address.id">
                  <td class="pl-2">
                    <p class="h6">{{ address.first_name + ' ' + address.last_name }}</p>
                    <p class="h6" v-if="address.address1">{{ address.address1 }}</p>
                    <p class="h6" v-if="address.address2">{{ address.address2 }}</p>
                    <p class="h6" v-if="address.phone_number">{{ address.phone_number }}</p>
                    <p class="h6">{{ address.city + ' ' + address.zip_code }}</p>
                    <p class="h6">{{ address.country.name }}</p>
                  </td>
                  <td class="text-center pl-2" style="width: 200px; max-width: 200px; word-wrap: break-word; vertical-align: middle;">
                    <button class="btn btn-dark light mx-2" @click="editAddressModalShow(address)">Edit</button>
                    <button class="btn btn-success mx-2" @click="deleteAddress(address)"
                      v-if="address.default != 1 || address.default != true">Delete</button>
                    <button class="btn btn-dark mx-2" v-else :disabled="true">Default</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddAddressModal ref="add-address-modal" @actionAfterAddressSave="actionAfterAddressSave" />
      <EditAddressModal ref="update-address-modal" @actionAfterAddressSave="actionAfterAddressSave" />
      <confirm-modal message="Do you really want to delete?" cancel_text="Cancel" confirm_text="Yes"
        name="delete-address" ref="delete-address"></confirm-modal>
    </div>

  </div>
</template>

<script lang="ts">

import { Component, Mixins, Vue } from 'vue-property-decorator'
import { http } from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";
import ConfirmModal from "@/components/ConfirmModal.vue";
import AddAddressModal from "@/components/AddAddressModal.vue";
import EditAddressModal from "@/components/EditAddressModal.vue";



@Component<Addresses>({
  components: {
    ConfirmModal,
    AddAddressModal,
    EditAddressModal
  },
  created() {
    this.getAddressDetails();
  }
})

export default class Addresses extends Mixins(ErrorMessages) {

  public showLoader = false
  public addresses = null;
  public store = {};
  public ref = this.$refs as Record<any, any>

  getAddressDetails(): void {
    this.showLoader = true;
    http.get(`/addresses`).then((response: any) => {
      this.addresses = response.data.result
      this.showLoader = false
    })
      .catch((e: any) => {
        this.showLoader = false
        this.showError(e.response.data.message)
      });
  }

  addAddressModalShow(): void {
    this.ref['add-address-modal'].show()
  }

  editAddressModalShow(address: Record<any, any>): void {
    this.ref['update-address-modal'].updateForm(address);
    this.ref['update-address-modal'].show()
  }

  // public showConfirm(){
  //   this.ref['delete-address'].showConfirm()
  // }

  async deleteAddress(address: Record<any, any>) {
    const response = await this.ref['delete-address'].showConfirm();
    if (response) {
      const url = `addresses/${address.id}`
      http.delete(url).then(async (response: Record<any, any>) => {
        this.getAddressDetails();
        this.showToast(response.data.message, 'success')
      }).catch((e: any) => {
        this.showError(e);
        this.ref['cartModal'].hide();
      });
    }
  }
  async actionAfterAddressSave() {
    if (this.$route.query && Number(this.$route.query.cart) == 1) {
      this.$store.commit('SHOW_CART_MODAL', true);
      this.$router.push({ name: 'Home' })
    }

    await this.getAddressDetails();
  }

}
</script>

<style lang="scss" scoped>
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td,
th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}
</style>
