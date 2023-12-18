<template>
  <div class="activity-icon">
    <template v-if="activity_status == FACTORYREVIEW">
      <BIconLightning />
    </template>
    <template v-else-if="activity_status == FACTORYAPPROVED">
      <BIconCheck2 />
    </template>
    <template v-else-if="activity_status == FACTORYREJECTED">
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z"/>
        <path fill-rule="evenodd" d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z"/>
      </svg>
    </template>
    <template v-else-if="activity_status == CUSTOMERREVIEW">
      <BIconXDiamond />
    </template>
    <template v-else-if="activity_status == CUSTOMERAPPROVED">
      <BIconCheck2 />
    </template>
    <template v-else-if="activity_status == CUSTOMERREJECTED">
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z"/>
        <path fill-rule="evenodd" d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z"/>
      </svg>
    </template>
    <template v-else-if="activity_status == ORDERINPRODUCTION">
      <BIconPrinter />
    </template>
    <template v-else-if="activity_status == ORDERSHIPPED">
      <BIconTruck />
    </template>
    <template v-else-if="activity_status == ORDERCOMPLETED">
      <BIconCartCheck />
    </template>
    <template v-else-if="activity_status == ORDERCANCELLED">
      <BIconX />
    </template>
    <template v-else>
      <BIconLightningFill />
    </template>
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
const ORDERCANCELLED = "order_cancel"
const ORDERCOMPLETED = "completed"

export default {
    props: {
        activity_status: null
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
        ORDERCANCELLED : ORDERCANCELLED,
      }
  }
}
</script>
