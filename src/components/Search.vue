<template>
  <div>
    <div class="nav-customize-area">
      <b-nav class="d-flex flex-wrap align-items-center">
        <b-nav-item class="search-opener">
          <b-button v-b-toggle.collapse-1 variant="primary">
            <font-awesome-icon :icon="['fas', 'search']"/>
          </b-button>
        </b-nav-item>
        <!-- <b-nav-item @click="searchProducts(0, 'category_id')">All</b-nav-item>
        <b-nav-item v-for="category in categoryListing" @click="searchProducts(category.id, 'category_id')"
                    :key="category.id">{{ category.category_name.toUpperCase() }}
        </b-nav-item> -->
      </b-nav>

      <b-collapse id="collapse-1" class="mt-2">
        <b-card>
          <b-nav-form>
            <b-form-input v-model="search" class="mr-sm-2" placeholder="Search"></b-form-input>
            <b-button class="search-button" @click="searchProducts(search, 'search')" variant="outline-success"
                      type="button">Search
            </b-button>
          </b-nav-form>
        </b-card>
      </b-collapse>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator'
    @Component<Search>({})
    export default class Search extends Vue {
      public search = ''
      @Prop({required: true}) categoryListing!: any

      public searchProducts(param: string, type: string){
        this.$emit('search', param, type)
      }
    }
</script>

<style scoped lang="scss">
.nav-customize-area {
  .form-inline{
    justify-content: space-between;
    .form-control{
      width: 70%;
    }
    .btn-outline-success{
      border-color: #219F84;
      color: #219F84;
      font-size: 0.8rem;
    }
  }
  @media only screen and (min-width: 992px){margin: 0 0 15px;}
  .nav-item {
    font-size: 12px;
    font-weight: 600;
    margin-right: 15px;
    @media only screen and (min-width: 992px){
      font-size: 10px;
    }
    @media only screen and (min-width: 1170px) {
      font-size: 12px;
    }

    &:last-child{margin-right: 0;}

    &.search-opener {
      .nav-link {
        border-bottom: none;

        &:hover {
          border-bottom: none;
        }
      }
    }

    .nav-link {
      padding: 0.5rem;
      border-bottom: 1px solid #EFF2F4;

      &:hover {
        color: #03142e;
        border-bottom: 1px solid #219F84;
      }
    }

    .btn {
      background: none;
      padding: 0;
      border: none;
      color: #03142E;
      font-weight: 700;
      border-bottom: none;

      svg {
        fill: #03142E;
      }

      &:focus {
        outline: none;
        box-shadow: none;
      }
    }
  }
  .nav{
      
        position: absolute;
        right: 10px;
        top: 8px;
        z-index: 1;
        @media only screen and (min-width: 992px){
          top: 38px;
        }
      
    }
}
</style>
