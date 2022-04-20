<template>
    <header v-if="$route.name != 'CollectionUrl'" id="header" class="shadow py-3 py-lg-0">
        <b-container fluid>
            <b-row class="align-items-center py-4">
                <b-col cols="6" lg="2">
                    <div class="logo">
                        <img src="@/assets/images/logo.svg" alt="Shirt Customizer" />
                    </div>
                </b-col>
                <b-col cols="6" lg="10">
                    <div v-if="false" class="d-flex flex-wrap justify-content-end justify-content-lg-between">
                        <b-nav class="align-items-center text-uppercase">
                            <li class="nav-item">DESIGN HUMMEL</li>
                        </b-nav>
                        <b-nav class="align-items-center justify-content-end text-uppercase" v-if="isCustomerAuthenticated">
                          <li class="nav-item"><router-link class="nav-link" active-class="active" :to="'/'" exact>Customizer</router-link></li>
                          <li class="nav-item"><router-link class="nav-link" active-class="active" :to="'/customer-orders'">Orders</router-link></li>
                          <li class="nav-item"><router-link class="nav-link" active-class="active" :to="'/dashboard'">My Account</router-link></li>
                        </b-nav>
                    </div>
                </b-col>
            </b-row>
        </b-container>
    </header>
</template>

<script>

export default {
    name: 'Header',
    components: {},
    computed:{
      isCustomerAuthenticated: function () {
        return this.$store.getters.isCustomerAuthenticated;
      }
    }
}
</script>

<style lang="scss" scoped>
    #header{
        .nav{
          font-weight: 700;
          font-size: 1.25em;
        }
      .logo{
        img{
          display: block;
          max-width: 100%;
          margin: 0;
          height: auto;
        }
      }
    }
    .header-links{
        text-align: right;
        img{
            display: block;
            max-width: 100%;
            float: right;
        }
    }
    .nav-item .nav-link.router-link-exact-active.active{
      color:#219f84;
    }
    .nav-item .nav-link.active{
      color:#219f84;
    }
</style>
