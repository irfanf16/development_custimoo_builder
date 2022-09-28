<template>
  <div class="overflow-auto">
    <div class="order-flow">
      <div class="order-step" :class="order_created ? 'active' : ''">
        Order<br>Created
      </div>
      <div class="order-step" :class="artwork_approval ? 'active' : ''">
        Artwork<br>Approval
      </div>
      <div class="order-step" :class="sample_design ? 'active' : ''">
        Sample<br>Design
      </div>
      <div class="order-step" :class="in_production ? 'active' : ''">
        In<br>Production
      </div>
      <div class="order-step" :class="shipped ? 'active' : ''">
        Order<br>Shipped
      </div>
      <div class="order-step" :class="completed ? 'active' : ''">
        Order<br>Completed
      </div>
    </div>
  </div>
</template>
<script>
const FACTORYREVIEW = "submitted_for_factory_review"
const ORDERAPPROVE = "order_approve"
const ORDERCANCEL = "order_cancel"
const FACTORYAPPROVED = "factory_approved"
const FACTORYREJECTED = "factory_rejected"
const CUSTOMERREVIEW = "submitted_for_customer_review"
const CUSTOMERAPPROVED = "customer_approved"
const CUSTOMERREJECTED = "customer_rejected"
const ORDERINPRODUCTION = "in_production"
const ORDERSHIPPED = "shipped"
const ORDERCOMPLETED = "completed"

export default {
  mounted() {
    this.setStatuses()
  },
  props: {
    item_status: null
  },
  data() {
    return {
      FACTORYREVIEW: FACTORYREVIEW,
      ORDERAPPROVE: ORDERAPPROVE,
      ORDERCANCEL: ORDERCANCEL,
      FACTORYAPPROVED: FACTORYAPPROVED,
      FACTORYREJECTED: FACTORYREJECTED,
      CUSTOMERREVIEW: CUSTOMERREVIEW,
      CUSTOMERAPPROVED: CUSTOMERAPPROVED,
      CUSTOMERREJECTED: CUSTOMERREJECTED,
      ORDERINPRODUCTION: ORDERINPRODUCTION,
      ORDERSHIPPED: ORDERSHIPPED,
      ORDERCOMPLETED: ORDERCOMPLETED,

      order_created: false,
      artwork_approval: false,
      sample_design: false,
      in_production: false,
      shipped: false,
      completed: false,
    }
  },
  methods: {
    setStatuses() {
     this.resetStatuses();
      if(this.item_status == FACTORYREVIEW || this.item_status ==  ORDERAPPROVE || this.item_status == ORDERCANCEL){
        this.order_created = true
      }else if(this.item_status == FACTORYAPPROVED){
        this.order_created = true
        this.artwork_approval = true
      }else if(this.item_status == CUSTOMERREVIEW
        || this.item_status == CUSTOMERREJECTED || this.item_status == CUSTOMERAPPROVED){
        this.order_created = true
        this.artwork_approval = true
        this.sample_design = true
      }else if(this.item_status == ORDERINPRODUCTION ){
        this.order_created = true
        this.artwork_approval = true
        this.sample_design = true
        this.in_production = true
      }else if(this.item_status == ORDERSHIPPED ){
        this.order_created = true
        this.artwork_approval = true
        this.sample_design = true
        this.in_production = true
        this.shipped = true
      }else if(this.item_status == ORDERCOMPLETED ){
        this.order_created = true
        this.artwork_approval = true
        this.sample_design = true
        this.in_production = true
        this.shipped = true
        this.completed = true
      }
    },
    resetStatuses() {
      this.order_created = false
      this.artwork_approval = false
      this.sample_design = false
      this.in_production = false
      this.shipped = false
      this.completed = false
    }
  },
  watch:{
    item_status :
      {
        handler: function (val, oldVal) {
          this.setStatuses(); // call it in the context of your component object
        },
        deep: true
      }
  }
}
</script>
