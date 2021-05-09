<template>
    <header id="header" class="shadow py-3">
        <b-container fluid>
            <b-row>
                <b-col cols="2">
                    <div class="logo">
                        <a href="/"><img src="@/assets/images/logo.svg" alt="Shirt Customizer" /></a>
                    </div>
                </b-col>
                <b-col cols="10 d-none d-lg-block">
                    <div>
                        <b-nav class="justify-content-end align-items-center">
                            <li class="nav-item"><router-link class="nav-link" to="#">New</router-link></li>
                            <li class="nav-item"><router-link class="nav-link" to="#">Snickers</router-link></li>
                            <li class="nav-item"><router-link class="nav-link" to="#">Hockey</router-link></li>
                            <li class="nav-item"><router-link class="nav-link" to="#">Sale</router-link></li>
                            <li class="nav-item"><router-link class="nav-link" to="#">Sking</router-link></li>
                            <router-link class="btn btn-secondary ml-3" to="/">Customizer</router-link>
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
    components: {

    }
}
</script>


