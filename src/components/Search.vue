<template>
  <div>
    <div class="nav-customize-area">
      <b-nav class="d-flex flex-wrap justify-content-between align-items-center">
        <b-nav-item class="search-opener">
          <b-button v-b-toggle.collapse-1 variant="primary">
            <font-awesome-icon :icon="['fas', 'search']"/>
          </b-button>
        </b-nav-item>
        <b-nav-item @click="searchProducts(0, 'category_id')">All</b-nav-item>
        <b-nav-item v-for="category in categoryListing" @click="searchProducts(category.id, 'category_id')"
                    :key="category.id">{{ category.category_name.toUpperCase() }}
        </b-nav-item>
      </b-nav>

      <b-collapse id="collapse-1" class="mt-2">
        <b-card>
          <b-nav-form>
            <b-form-input v-model="search" class="mr-sm-2" placeholder="Search"></b-form-input>
            <b-button @click="searchProducts(search, 'search')" variant="outline-success" class="my-2 my-sm-0"
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

      public searchProducts(param, type){
        this.$emit('search', param, type)
      }
    }
</script>

<style scoped lang="scss">
.nav-customize-area {
  margin: 0 0 15px;

  .nav-item {
    font-size: 10px;
    @media only screen and (min-width: 1170px) {
      font-size: 12px;
    }

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
}
</style>
