import Vue from 'vue'
import { BTab } from 'bootstrap-vue'

declare module 'vue/types/vue' {
  interface Vue {
    switchLockerTab?: (index: number) => void
  }
}