<template>
    <header id="header" class="shadow py-3 py-lg-0">
        <b-container fluid>
            <b-row class="align-items-center">
                <b-col cols="2">
                    <div class="logo">
                        <a href="/"><img src="@/assets/images/logo.svg" alt="Shirt Customizer" /></a>
                    </div>
                </b-col>
                <b-col cols="6 d-none d-lg-block">
                    <div>
                        <b-nav class="align-items-center text-uppercase">
                            <li class="nav-item"><router-link class="nav-link" to="#">Men</router-link></li>
                            <li class="nav-item"><router-link class="nav-link" to="#">Women</router-link></li>
                            <li class="nav-item"><router-link class="nav-link" to="#">Kids</router-link></li>
                            <li class="nav-item"><router-link class="nav-link" to="#">Sports</router-link></li>
                            <li class="nav-item"><router-link class="nav-link" to="#">Karma</router-link></li>
                            <li class="nav-item"><router-link class="nav-link" to="#">Copenhagen 2021</router-link></li>
                            <!-- <router-link class="btn btn-secondary ml-3" to="/">Customizer</router-link> -->
                        </b-nav>
                    </div>
                </b-col>
                <b-col cols="4 d-none d-lg-block">
                    <div class="header-links">
                        <img class="d-block" src="@/assets/images/img-header-links.png" alt="" />
                    </div>
                </b-col>
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
        .nav{font-weight: 700;}
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
