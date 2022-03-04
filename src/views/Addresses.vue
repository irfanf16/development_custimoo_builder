<template>
  <div class="page-wrapper m-lg-4">
    <div class="loader" v-if="showLoader"><img src="../../src/assets/images/loading.gif"/></div>
    <div v-else class="container-fluid bg-white">
      <div class="text-left">
        <h1 class="h3">Address Book</h1>
      </div>
      <hr class="border border-secondary"/>
      <div class="container-fluid">
        <div class="row">
          <div class="col-8">
            <table v-if="!addresses">
              <tr>
                <td colspan="2">No addresses added yet</td>
              </tr>
            </table>
            <table v-else>
              <tr v-for="address in addresses" :key="address.id">
                <td>
                  <p>{{ address.first_name + ' ' + address.last_name}}</p>
                  <p v-if="address.address1">{{ address.address1 }}</p>
                  <p v-if="address.address2">{{ address.address2 }}</p>
                  <p v-if="address.phone_number">{{ address.phone_number }}</p>
                  <p>{{ address.city + ' ' + address.zip_code}}</p>
                  <p>{{ address.country.name }}</p>
                </td>
                <td class="text-right">
                  <button class="btn btn-success mx-2" @click="editAddressModalShow(address)">Edit</button>
                  <button class="btn btn-success mx-2" @click="deleteAddress(address)" v-if="address.default != 1 || address.default != true">Delete</button>
                  <button class="btn btn-secondary mx-2" v-else :disabled="true">Default</button>
                </td>
              </tr>
            </table>
            <div class="row d-flex justify-content-between my-2">
              <div class="col">
                <router-link to="dashboard" class="btn btn-success w-50">Back</router-link>
              </div>
              <div class="col">
                <button class="btn btn-success w-50 text-nowrap" @click="addAddressModalShow">New Address</button>
              </div>
            </div>
          </div>
          <div class="col-4">
            <div class="row">
              <div class="col my-2">
                <router-link to="dashboard"  class="btn btn-outline-secondary w-50">My Account</router-link>
              </div>
            </div>
            <div class="row">
              <div class="col my-2">
                <button type="button" class="btn btn-outline-secondary w-50">My profile settings</button>
              </div>
            </div>
            <div class="row">
              <div class="col my-2">
                <router-link to="address" class="btn btn-outline-secondary w-50">Address book</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddAddressModal ref="add-address-modal"  @actionAfterAddressSave="actionAfterAddressSave"  />
      <EditAddressModal  ref="update-address-modal" @actionAfterAddressSave="actionAfterAddressSave"  />
      <confirm-modal message="Do you really want to delete?" cancel_text="Cancel" confirm_text="Yes" name="delete-address" ref="delete-address"></confirm-modal>
    </div>

  </div>
</template>

<script lang="ts">

import {Component, Mixins, Vue} from 'vue-property-decorator'
import {http} from "@/httpCommon";
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
      console.log(response);
      this.addresses = response.data.result
      this.showLoader = false
    })
      .catch((e: any) => {
        this.showLoader = false
        this.showError(e.response.data.message)
      });
  }

  addAddressModalShow():void{
    this.ref['add-address-modal'].show()
  }

  editAddressModalShow(address:Record<any,any>):void{
    this.ref['update-address-modal'].updateForm(address);
    this.ref['update-address-modal'].show()
  }

  // public showConfirm(){
  //   this.ref['delete-address'].showConfirm()
  // }

  async deleteAddress(address:Record<any,any>){
    const response = await this.ref['delete-address'].showConfirm();
    console.log(address);
    if(response){
      const url = `addresses/${address.id}`
      http.delete(url).then(async (response:Record<any,any>) => {
        this.getAddressDetails();
        this.showToast(response.data.message, 'SUCCESS')
      }).catch((e:any)=>{
        console.log(e);
        this.showError(e);
        this.ref['cartModal'].hide();
      });
    }
  }
  async actionAfterAddressSave(){
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

td, th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}

</style>
