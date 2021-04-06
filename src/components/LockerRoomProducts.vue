<template>
    <div class="products-holder d-flex flex-wrap">
        <div class="products-block">
            <div class="image-holder">
                <img src="/img/images/image-product.png" alt="Product 1" />
                <ul class="product-icons">
                    <li>
                        <a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                    </li>
                    <li>
                        <a id="share-button-2" href="#."><font-awesome-icon :icon="['fas', 'share-alt']" /></a>
                        <b-tooltip custom-class="share-tooltip" target="share-button-2" placement="bottom">
                            <div class="share-holder">
                                <h3>Copy link and Share</h3>
                                <div class="share-form">
                                    <b-form inline>
                                        <b-form-input
                                        id="inline-form-input-name"
                                        class="mb-2 mr-sm-2 mb-sm-0"
                                        placeholder="Jane Doe"
                                        ></b-form-input>
                                        <b-button variant="primary">Copy Link</b-button>
                                    </b-form>
                                </div>
                            </div>
                        </b-tooltip>
                    </li>
                    <li>
                        <a href="#."><font-awesome-icon :icon="['fas', 'edit']" /></a>
                    </li>
                </ul>
            </div>
            <div class="product-description">
                <p>Product Name Dolor Site Ament is Dummy</p>
            </div>
        </div>
        <div class="products-block">
            <div class="image-holder">
                <img src="/img/images/image-product.png" alt="Product 1" />
                <ul class="product-icons">
                    <li>
                        <a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                    </li>
                    <li>
                        <a id="share-button-3" href="#."><font-awesome-icon :icon="['fas', 'share-alt']" /></a>
                        <b-tooltip target="share-button-3" placement="bottom">
                            Hello <strong>World!</strong>
                        </b-tooltip>
                    </li>
                    <li>
                        <a href="#."><font-awesome-icon :icon="['fas', 'edit']" /></a>
                    </li>
                </ul>
            </div>
            <div class="product-description">
                <p>Product Name Dolor Site Ament is Dummy</p>
            </div>
        </div>
        <div class="products-block">
            <div class="image-holder">
                <img src="/img/images/image-product.png" alt="Product 1" />
                <ul class="product-icons">
                    <li>
                        <a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                    </li>
                    <li>
                        <a id="share-button-4" href="#."><font-awesome-icon :icon="['fas', 'share-alt']" /></a>
                        <b-tooltip target="share-button-4" placement="bottom">
                            Hello <strong>World!</strong>
                        </b-tooltip>
                    </li>
                    <li>
                        <a href="#."><font-awesome-icon :icon="['fas', 'edit']" /></a>
                    </li>
                </ul>
            </div>
            <div class="product-description">
                <p>Product Name Dolor Site Ament is Dummy</p>
            </div>
        </div>
        <div class="products-block">
            <div class="image-holder">
                <img src="/img/images/image-product.png" alt="Product 1" />
                <ul class="product-icons">
                    <li>
                        <a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                    </li>
                    <li>
                        <a id="share-button-5" href="#."><font-awesome-icon :icon="['fas', 'share-alt']" /></a>
                        <b-tooltip target="share-button-5" placement="bottom">
                            Hello <strong>World!</strong>
                        </b-tooltip>
                    </li>
                    <li>
                        <a href="#."><font-awesome-icon :icon="['fas', 'edit']" /></a>
                    </li>
                </ul>
            </div>
            <div class="product-description">
                <p>Product Name Dolor Site Ament is Dummy</p>
            </div>
        </div>
        <div class="products-block">
            <div class="image-holder">
                <img src="/img/images/image-product.png" alt="Product 1" />
                <ul class="product-icons">
                    <li>
                        <a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                    </li>
                    <li>
                        <a id="share-button-6" href="#."><font-awesome-icon :icon="['fas', 'share-alt']" /></a>
                        <b-tooltip target="share-button-6" placement="bottom">
                            Hello <strong>World!</strong>
                        </b-tooltip>
                    </li>
                    <li>
                        <a href="#."><font-awesome-icon :icon="['fas', 'edit']" /></a>
                    </li>
                </ul>
            </div>
            <div class="product-description">
                <p>Product Name Dolor Site Ament is Dummy</p>
            </div>
        </div>
        <div class="products-block">
            <div class="image-holder">
                <img src="/img/images/image-product.png" alt="Product 1" />
                <ul class="product-icons">
                    <li>
                        <a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                    </li>
                    <li>
                        <a id="share-button-7" href="#."><font-awesome-icon :icon="['fas', 'share-alt']" /></a>
                        <b-tooltip target="share-button-7" placement="bottom">
                            Hello <strong>World!</strong>
                        </b-tooltip>
                    </li>
                    <li>
                        <a href="#."><font-awesome-icon :icon="['fas', 'edit']" /></a>
                    </li>
                </ul>
            </div>
            <div class="product-description">
                <p>Product Name Dolor Site Ament is Dummy</p>
            </div>
        </div>
        <div class="products-block">
            <div class="image-holder">
                <img src="/img/images/image-product.png" alt="Product 1" />
                <ul class="product-icons">
                    <li>
                        <a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                    </li>
                    <li>
                        <a id="share-button-8" href="#."><font-awesome-icon :icon="['fas', 'share-alt']" /></a>
                        <b-tooltip target="share-button-8" placement="bottom">
                            Hello <strong>World!</strong>
                        </b-tooltip>
                    </li>
                    <li>
                        <a href="#."><font-awesome-icon :icon="['fas', 'edit']" /></a>
                    </li>
                </ul>
            </div>
            <div class="product-description">
                <p>Product Name Dolor Site Ament is Dummy</p>
            </div>
        </div>
        <div class="products-block">
            <div class="image-holder">
                <img src="/img/images/image-product.png" alt="Product 1" />
                <ul class="product-icons">
                    <li>
                        <a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                    </li>
                    <li>
                        <a id="share-button-9" href="#."><font-awesome-icon :icon="['fas', 'share-alt']" /></a>
                        <b-tooltip target="share-button-9" placement="bottom">
                            Hello <strong>World!</strong>
                        </b-tooltip>
                    </li>
                    <li>
                        <a href="#."><font-awesome-icon :icon="['fas', 'edit']" /></a>
                    </li>
                </ul>
            </div>
            <div class="product-description">
                <p>Product Name Dolor Site Ament is Dummy</p>
            </div>
        </div>
        <div class="products-block">
            <div class="image-holder">
                <img src="/img/images/image-product.png" alt="Product 1" />
                <ul class="product-icons">
                    <li>
                        <a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                    </li>
                    <li>
                        <a id="share-button-10" href="#."><font-awesome-icon :icon="['fas', 'share-alt']" /></a>
                        <b-tooltip target="share-button-10" placement="bottom">
                            Hello <strong>World!</strong>
                        </b-tooltip>
                    </li>
                    <li>
                        <a href="#."><font-awesome-icon :icon="['fas', 'edit']" /></a>
                    </li>
                </ul>
            </div>
            <div class="product-description">
                <p>Product Name Dolor Site Ament is Dummy</p>
            </div>
        </div>
        <div class="products-block">
            <div class="image-holder">
                <img src="/img/images/image-product.png" alt="Product 1" />
                <ul class="product-icons">
                    <li>
                        <a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                    </li>
                    <li>
                        <a id="share-button-11" href="#."><font-awesome-icon :icon="['fas', 'share-alt']" /></a>
                        <b-tooltip target="share-button-11" placement="bottom">
                            Hello <strong>World!</strong>
                        </b-tooltip>
                    </li>
                    <li>
                        <a href="#."><font-awesome-icon :icon="['fas', 'edit']" /></a>
                    </li>
                </ul>
            </div>
            <div class="product-description">
                <p>Product Name Dolor Site Ament is Dummy</p>
            </div>
        </div>
        <div class="products-block">
            <div class="image-holder">
                <img src="/img/images/image-product.png" alt="Product 1" />
                <ul class="product-icons">
                    <li>
                        <a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                    </li>
                    <li>
                        <a id="share-button-12" href="#."><font-awesome-icon :icon="['fas', 'share-alt']" /></a>
                        <b-tooltip target="share-button-12" placement="bottom">
                            Hello <strong>World!</strong>
                        </b-tooltip>
                    </li>
                    <li>
                        <a href="#."><font-awesome-icon :icon="['fas', 'edit']" /></a>
                    </li>
                </ul>
            </div>
            <div class="product-description">
                <p>Product Name Dolor Site Ament is Dummy</p>
            </div>
        </div>
        <div class="products-block">
            <div class="image-holder">
                <img src="/img/images/image-product.png" alt="Product 1" />
                <ul class="product-icons">
                    <li>
                        <a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                    </li>
                    <li>
                        <a id="share-button-13" href="#."><font-awesome-icon :icon="['fas', 'share-alt']" /></a>
                        <b-tooltip target="share-button-13" placement="bottom">
                            Hello <strong>World!</strong>
                        </b-tooltip>
                    </li>
                    <li>
                        <a href="#."><font-awesome-icon :icon="['fas', 'edit']" /></a>
                    </li>
                </ul>
            </div>
            <div class="product-description">
                <p>Product Name Dolor Site Ament is Dummy</p>
            </div>
        </div>
        <div class="products-block">
            <div class="image-holder">
                <img src="/img/images/image-product.png" alt="Product 1" />
                <ul class="product-icons">
                    <li>
                        <a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                    </li>
                    <li>
                        <a id="share-button-14" href="#."><font-awesome-icon :icon="['fas', 'share-alt']" /></a>
                        <b-tooltip target="share-button-14" placement="bottom">
                            Hello <strong>World!</strong>
                        </b-tooltip>
                    </li>
                    <li>
                        <a href="#."><font-awesome-icon :icon="['fas', 'edit']" /></a>
                    </li>
                </ul>
            </div>
            <div class="product-description">
                <p>Product Name Dolor Site Ament is Dummy</p>
            </div>
        </div>
        <div class="products-block">
            <div class="image-holder">
                <img src="/img/images/image-product.png" alt="Product 1" />
                <ul class="product-icons">
                    <li>
                        <a class="remove" href="#."><font-awesome-icon :icon="['fas', 'trash-alt']" /></a>
                    </li>
                    <li>
                        <a id="share-button-15" href="#."><font-awesome-icon :icon="['fas', 'share-alt']" /></a>
                        <b-tooltip target="share-button-15" placement="bottom">
                            Hello <strong>World!</strong>
                        </b-tooltip>
                    </li>
                    <li>
                        <a href="#."><font-awesome-icon :icon="['fas', 'edit']" /></a>
                    </li>
                </ul>
            </div>
            <div class="product-description">
                <p>Product Name Dolor Site Ament is Dummy</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

    import { Component, Vue } from 'vue-property-decorator'
    @Component<LockerRoomProducts>({})
    export default class LockerRoomProducts extends Vue {}

</script>

<style lang="scss" scoped>
    .products-holder{
        .products-block{
            flex: 0 0 18%;
            max-width: 18%;
            margin: 0 0.65rem 25px;
            .image-holder{
                position: relative;
                overflow: hidden;
                margin: 0 0 15px;
                img{
                    display: block;
                    max-width: 100%;
                    margin: 0 auto;
                    height: auto;
                }
                .product-icons{
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    position: absolute;
                    right: 5px;
                    top: 5px;
                    z-index: 1;
                    li{
                        display: block;
                        margin: 0 0 5px;
                    }
                    a{
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: center;
                        align-items: center;
                        width: 30px;
                        height: 30px;
                        color: #219f84;
                        background: #fff;
                        border-radius: 50%;
                        &.remove{
                            background: #F8E1E2;
                            color: #D53943;
                        }
                    }
                }
            }
        }
    }
    
</style>