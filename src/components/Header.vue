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
                    <div class="d-flex flex-wrap justify-content-end justify-content-lg-start">
                        <b-nav class="align-items-center text-uppercase">
                            <li class="nav-item">DESIGN HUMMEL</li>
<!--                            <li class="nav-item"><router-link class="nav-link" to="#">Women</router-link></li>-->
<!--                            <li class="nav-item"><router-link class="nav-link" to="#">Kids</router-link></li>-->
<!--                            <li class="nav-item"><router-link class="nav-link" to="#">Sports</router-link></li>-->
<!--                            <li class="nav-item"><router-link class="nav-link" to="#">Karma</router-link></li>-->
<!--                            <li class="nav-item"><router-link class="nav-link" to="#">Copenhagen 2021</router-link></li>-->
                            <!-- <router-link class="btn btn-secondary ml-3" to="/">Customizer</router-link> -->
                        </b-nav>
                    </div>
                </b-col>
<!--                <b-col cols="4 d-none d-lg-block">-->
<!--                    <div class="header-links">-->
<!--                        <img class="d-block" src="@/assets/images/img-header-links.png" alt="" />-->
<!--                    </div>-->
<!--                </b-col>-->
            </b-row>
        </b-container>
    </header>
</template>

<script>

export default {
    name: 'Header',
    components: {

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
</style>
