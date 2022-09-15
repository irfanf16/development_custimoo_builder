<template>
    <ul class="d-flex gap-3 main-nav">
      <li class="position-relative" v-if="isCustomerAuthenticated && (company.platform == 'self' || company.platform == 'cdnExceptLogin') && showCartIcon">
        <a  class="icon mr-0" @click="openCartModal">
          <font-awesome-icon :icon="['fas', 'cart-arrow-down']" /><span class="notification-counter"> {{ cartItemsCount}}</span>
        </a>
      </li>
      <li>
        <router-link class="d-inline-flex align-items-center fs-2 font-weight-bolder" active-class="active" :to="'/'" exact>
          <svg style="width:1.3em;height:1.3em" viewBox="0 0 24 24">
            <path fill="currentColor" d="M16,21H8A1,1 0 0,1 7,20V12.07L5.7,13.12C5.31,13.5 4.68,13.5 4.29,13.12L1.46,10.29C1.07,9.9 1.07,9.27 1.46,8.88L7.34,3H9C9,4.1 10.34,5 12,5C13.66,5 15,4.1 15,3H16.66L22.54,8.88C22.93,9.27 22.93,9.9 22.54,10.29L19.71,13.12C19.32,13.5 18.69,13.5 18.3,13.12L17,12.07V20A1,1 0 0,1 16,21M20.42,9.58L16.11,5.28C15.8,5.63 15.43,5.94 15,6.2C14.16,6.7 13.13,7 12,7C10.3,7 8.79,6.32 7.89,5.28L3.58,9.58L5,11L8,9H9V19H15V9H16L19,11L20.42,9.58Z" />
          </svg>
          Customizer
        </router-link>
      </li>
      <li v-if="isCustomerAuthenticated && (company.platform !== 'self' || (company.platform == 'self' && customerPermissions.includes('place-order')))">
        <router-link class="d-inline-flex align-items-center fs-2 font-weight-bolder" active-class="active" :to="'/customer-orders'">
          <svg style="width:1.3em;height:1.3em" viewBox="0 0 24 24">
            <path fill="currentColor" d="M2,10.96C1.5,10.68 1.35,10.07 1.63,9.59L3.13,7C3.24,6.8 3.41,6.66 3.6,6.58L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.66,6.72 20.82,6.88 20.91,7.08L22.36,9.6C22.64,10.08 22.47,10.69 22,10.96L21,11.54V16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V10.96C2.7,11.13 2.32,11.14 2,10.96M12,4.15V4.15L12,10.85V10.85L17.96,7.5L12,4.15M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V12.69L14,15.59C13.67,15.77 13.3,15.76 13,15.6V19.29L19,15.91M13.85,13.36L20.13,9.73L19.55,8.72L13.27,12.35L13.85,13.36Z" />
          </svg>
          Orders
        </router-link>
      </li>
      <li v-if="isCustomerAuthenticated">
        <router-link class="d-inline-flex align-items-center fs-2 font-weight-bolder" active-class="active" :to="'/dashboard'">
          <svg style="width:1.3em;height:1.3em" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,6A2,2 0 0,0 10,8A2,2 0 0,0 12,10A2,2 0 0,0 14,8A2,2 0 0,0 12,6M12,13C14.67,13 20,14.33 20,17V20H4V17C4,14.33 9.33,13 12,13M12,14.9C9.03,14.9 5.9,16.36 5.9,17V18.1H18.1V17C18.1,16.36 14.97,14.9 12,14.9Z" />
          </svg>
          My Account
        </router-link>
      </li>
      <li class="dropdown-nav" v-if="false">
        <b-dropdown size="lg"  variant="link" toggle-class="text-decoration-none" no-caret>
          <template #button-content>
            <a class="d-inline-flex align-items-center fs-2 font-weight-bolder">
              <svg style="width:1.3em;height:1.3em" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,6A2,2 0 0,0 10,8A2,2 0 0,0 12,10A2,2 0 0,0 14,8A2,2 0 0,0 12,6M12,13C14.67,13 20,14.33 20,17V20H4V17C4,14.33 9.33,13 12,13M12,14.9C9.03,14.9 5.9,16.36 5.9,17V18.1H18.1V17C18.1,16.36 14.97,14.9 12,14.9Z" />
              </svg>
              My Account
            </a>
          </template>
          <router-link class="nav-link fs-2" active-class="active" :to="'/dashboard'">Dashboard</router-link>
          <router-link class="nav-link fs-2" active-class="active" :to="'/dashboard'">Logout</router-link>
        </b-dropdown>
      </li>
    </ul>
</template>

<script>
import ModalAction from "@/mixins/ModalAction";
export default {
    name: 'Navbar',
    mixins:[ModalAction],
    components: {},
    computed:{
      isCustomerAuthenticated: function () {
        return this.$store.getters.isCustomerAuthenticated;
      },
      showCartIcon:function(){
        return this.$store.getters.getCartIconShow;
      },
      cartItemsCount:function(){
        return this.$store.getters.getCartItemsCount
      },
      company: function (){
        return this.$store.getters.getCompany
      },
      customerPermissions(){
        return this.$store.getters.getCustomerPermissions
      }

    },
    methods:{
      openCartModal(){
        if(this.cartItemsCount > 0) {
          this.showVModal('cart-modal')
        }
      }
  }
}
</script>

<style lang="scss" scoped>
  .main-nav{
    justify-content: center;
    background: rgba(17, 17, 17, 0.25);
    padding: 15px 20px;
    transition: 0.3s ease all;

    &:hover{
      background: rgba(17, 17, 17, 1);
    }

    @media (min-width: 991px) {
      justify-content: right;
    }

    & > li {
      display: inline-flex;

      a {
        text-decoration: none;
        color: #fff;
        font-size: 16px;

        &:hover{
          color: #FF4E00;
        }
      }
      .active {
        color: #FF4E00;;
      }
      & > a {
        gap: 5px;
        line-height: 1;
      }

      &.dropdown-nav {
        .nav-link{
          & + .nav-link{
            border-top: 1px solid #ccc;
          }
        }
      }
    }
  }
</style>
