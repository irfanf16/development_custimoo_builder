<template>
    <div class="vld-parent">
        <loading :active="isLoading"
                 :can-cancel="true"
                 :on-cancel="onCancel"
                 :is-full-page="fullPage"/>

    </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
    import Loading from 'vue-loading-overlay'
    import 'vue-loading-overlay/dist/vue-loading.css'

    @Component<LazyLoader>({
        components: {
            Loading
        },
      mounted() {
        if(this.loader){
          this.doAjax()
        }
      }
    })

    export default class LazyLoader extends Vue {
      @Prop({required: false}) loader!: any
      public isLoading = false
      public fullPage = true

      @Watch('loader', {
        deep: true
      })
      loaderChanged() {
        if(this.loader){
          this.doAjax()
        }
      }
        public doAjax() {
          this.isLoading = true;
          // simulate AJAX
          setTimeout(() => {
            this.isLoading = false
          }, 2000)
        }

        public onCancel() {
            console.log('User cancelled the loader.')
        }
    }
</script>
