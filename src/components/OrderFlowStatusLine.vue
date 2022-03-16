<template>
  <div class="order-flow">
    <div class="order-step" :class="item_status == FACTORYREVIEW ? 'active' : ''">
      Order<br>Created
    </div>
    <div class="order-step" :class="item_status == FACTORYAPPROVED ? 'active' : ''">
      Artwork<br>Approval
    </div>
    <div class="order-step" :class="(item_status == CUSTOMERREVIEW
            || item_status == CUSTOMERREJECTED || item_status == CUSTOMERAPPROVED ) ? 'active' : ''">
      Sample<br>Design
    </div>
    <div class="order-step" :class="(item_status == ORDERINPRODUCTION) ? 'active' : ''">
      In<br>Production
    </div>
    <div class="order-step" :class="(item_status == ORDERSHIPPED) ? 'active' : ''">
      Order<br>Shipped
    </div>
    <div class="order-step" :class="(item_status == ORDERCOMPLETED) ? 'active' : ''">
      Order<br>Completed
    </div>
  </div>

</template>
<script>
const FACTORYREVIEW = "submitted_for_factory_review"
const FACTORYAPPROVED = "factory_approved"
const FACTORYREJECTED = "factory_rejected"
const CUSTOMERREVIEW = "submitted_for_customer_review"
const CUSTOMERAPPROVED = "customer_approved"
const CUSTOMERREJECTED = "customer_rejected"
const ORDERINPRODUCTION = "in_production"
const ORDERSHIPPED = "shipped"
const ORDERCOMPLETED = "completed"

export default {
    props: {
        item_status:null
    },
  data(){
      return {
        FACTORYREVIEW : FACTORYREVIEW,
        FACTORYAPPROVED : FACTORYAPPROVED,
        FACTORYREJECTED : FACTORYREJECTED,
        CUSTOMERREVIEW : CUSTOMERREVIEW,
        CUSTOMERAPPROVED : CUSTOMERAPPROVED,
        CUSTOMERREJECTED : CUSTOMERREJECTED,
        ORDERINPRODUCTION : ORDERINPRODUCTION,
        ORDERSHIPPED : ORDERSHIPPED,
        ORDERCOMPLETED : ORDERCOMPLETED,
      }
  }
}
</script>
