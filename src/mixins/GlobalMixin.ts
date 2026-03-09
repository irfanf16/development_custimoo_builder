import Vue from "vue";
import { logData } from "@/helpers/Helpers";
import { Component } from "vue-property-decorator";

@Component<GlobalMixin>({

})
export default class GlobalMixin extends Vue {
  public logData = logData.bind(this)
}
