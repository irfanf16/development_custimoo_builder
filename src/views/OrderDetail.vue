<template>
  <div class="page-wrapper m-lg-4" v-cloak>
    <div class="loader global" v-if="showLoader" ><img style="width: 100px" src="require('@/assets/images/loading.gif')" /></div>
    <div class="order-wrapper" v-if="order && order.id">
      <div class="d-flex justify-content-between align-items-center">
        <div class="fs-4 font-weight-bolder order-title p-2">Order # {{ order.order_no }}</div>
        <div class="font-weight-bolder order-title p-2">
          <button class="btn p-0 fs-5 btn-dark" @click="$router.push({path: '/customer-orders'})" title="Go Back" style="line-height: 0">
            <b-icon-arrow-left-short />
          </button>
        </div>
      </div>
      <b-tabs content-class="mt-3">
        <b-tab :key="`order_item_${order_item_index}`" v-for="(order_item, order_item_index) in order.items">
          <template #title>
            {{ 'Factory ' + parseInt(order_item_index + 1) }}
          </template>

          <OrderFlowStatusLine :item_status="order_item.status" />

          <div class="order-activities">
            <template v-for="(item_status_activity, item_status_activity_index) in order_item.status_activities">
              <div class="activity-status" :class="status_icons[item_status_activity.status]"
                   :key="`item_status_activity_${item_status_activity_index}`">
                <div  class="activity-status" :key="`item_status_activity_${item_status_activity_index}`">
                <ActivityStatusIcons :activity_status="item_status_activity.status" />

                <div class="activity-content">
                  <div class="activity-title">
                    {{
                        item_status_activity.status === FACTORYREVIEW && (item_status_activity_index + 1) !== order_item.status_activities.length ?
                        "Artwork Updated" :
                        activityStatus[item_status_activity.status].title
                    }}
                    <span class="date-time">
                      {{ item_status_activity.created_at | formatDate('HH:mm Do MMM YY ')  }}
                    </span>
                  </div>
                  <div class="activity-text p-2 fs-2 text-muted">
                    {{ activityStatus[item_status_activity.status].message }}
                  </div>

                  <div class="images-grid p-2 d-flex gap-1 w-100">
                    <div class="d-flex align-items-stretch flex-wrap gap-1">
                      <div class="feedback-block" :key="activity_item_index" v-for="(activity_item, activity_item_index) in item_status_activity.activity_items">
                        <div class="feedback-images" v-if="activity_item.activity_files"
                             @click="showPreview(activity_item)" style="cursor:pointer;">
                          <img :key="activity_file_index" v-for="(activity_file, activity_file_index) in activity_item.activity_files"
                               :src="`${storage_url}${activity_file.url}`" alt="">
                          <template>
                            <div class="actions nested-actions" :key="`details-btn-${activity_item_index}`">
                              <button class="order-detail-btn btn btn-secondary btn-sm"
                                      @click.stop="downloadStatusActivityImages(activity_item.activity_files)" style="padding: 3px 5px !important;" :key="`preview-btn-${activity_item_index}`">
                                <svg style="width:1em;height:1em" viewBox="0 0 24 24">
                                  <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                                </svg>
                              </button>

                              <button class="btn btn-secondary btn-sm" title="View details" style="padding: 3px 5px !important;"
                                      @click.stop="showActivityItemDetail(order_item_index, item_status_activity_index, activity_item_index)">
                                <b-icon-list-ul />
                              </button>
                            </div>

                          </template>
                        </div>
                        <div class="feedback-text" v-if="(item_status_activity.status == ORDERSHIPPED  && activity_item_index == 0 && order_item.tracking_no)" :key="`afd-${activity_item_index}`">The shipping no is <strong style="font-weight:bold">{{order_item.tracking_no}}</strong>.</div>
                        <template v-else>
                          <div class="feedback-text" :key="`afd-${activity_item_index}`" v-if="activity_item.message && activity_item.message!='' ">{{activity_item.message}}</div>
                        </template>
                      </div>
                    </div>

                    <template v-if="item_status_activity_index==0">
                      <div class="actions" v-if="item_status_activity.status == FACTORYREJECTED">
                        <button class="btn btn-secondary" @click="updateOrderProducts(order_item.id, item_status_activity.id)">Edit Products</button>
                      </div>

                      <div class="actions" v-if="order_item.status == CUSTOMERREVIEW && item_status_activity.status == CUSTOMERREVIEW">
                        <button class="btn btn-secondary" @click="showSampleDesigns(order_item, order_item_index, item_status_activity_index)">Take action</button>
                      </div>
                    </template>

                  </div>


                  <div class="comment-button text-left px-2" v-if="item_status_activity_index == 0">
                    <a class="text-info" @click="item_status_activity.add_comment = !item_status_activity.add_comment">
                      <BIconChatDots/>
                      Add comment</a>
                  </div>
                  <!-- add comment starts -->
                  <template v-if="item_status_activity.add_comment">
                    <AddUpdateComment :url="`order_item/${item_status_activity.id}/comment`"
                            v-on:hideCommentBox = "hideCommentBox(item_status_activity, 'add_comment')"
                            v-on:commentActionCompleted = "item_status_activity.comments.unshift($event)"
                    ></AddUpdateComment>

                  </template>
                  <!-- add comment ends -->

                  <!-- Comment listing starts -->
                  <template v-for="(activity_comment, activity_comment_index) in item_status_activity.comments">
                    <div class="comment-row px-2 pb-2 d-flex gap-1 mt-3" :key="`activity_comment_${activity_comment_index}`"
                         v-if="!activity_comment.edit_comment && !activity_comment.reply_comment">
                      <div class="d-flex gap-1">
                      <span class="comment-avatar">
                        {{ activity_comment.user ? `${activity_comment.user.first_name} ${activity_comment.user.last_name}` : "" | initials }}
                      </span>
                        <div class="comment-msg" :id="`comment-${activity_comment.id}-box`">
                        <!-- Comment action buttons starts -->
                          <div class="comment-action" style="right: -165px">
                            <ul class="fs-1 d-flex gap-2">
                              <li>
                                <a @click="activity_comment.reply_comment = !activity_comment.reply_comment">
                                  <BIconReply/>
                                  Reply
                                </a>
                              </li>
                              <li>
                                <a v-if="canPerformCommentAction(activity_comment)" @click="activity_comment.edit_comment = !activity_comment.edit_comment">
                                  <BIconPencil/>
                                  Edit
                                </a>
                              </li>
                              <li>
                                <a v-if="canPerformCommentAction(activity_comment)" @click="deleteComment(activity_comment,item_status_activity)">
                                  <BIconTrash/>
                                  Delete
                                </a>
                              </li>
                            </ul>
                          </div>
                        <!-- Comment action buttons ends -->

                          <blockquote class="blockquote mb-0">
                            <footer class="blockquote-footer" v-if="activity_comment.parent_message_id" style="cursor: pointer"
                                    @click="goToMessage(activity_comment.parent_message_id)">
                              <cite title="Source Title">
                                <template v-if="activity_comment.parent_message">
                                  {{ activity_comment.parent_message }}
                                </template>
                                <template v-else>
                                  Click me to go to parent
                                </template>
                              </cite>
                            </footer>
                          </blockquote>
                          <template v-for="(activity_comment_file, activity_comment_file_index) in activity_comment.files">
                            <template v-if="['png', 'jpg', 'jpeg'].includes(activity_comment_file.extension)">
                              <img :key="`activity_comment_file_${activity_comment_file_index}`"
                                   :src="`${storage_url}${activity_comment_file.url}`" :alt="`${activity_comment_file.name}`" width="100">
                            </template>

                            <template v-if="['pdf', 'ai', 'eps', 'svg'].includes(activity_comment_file.extension.toLowerCase())">
                              <a :key="`activity_comment_file_${activity_comment_file_index}`" :href="`${storage_url}${activity_comment_file.url}`" :download="activity_comment_file.name" target="_blank">
                                <img width="50" height="50" src="/img/images/file.png" :alt="activity_comment_file.name">
                                <span>{{activity_comment_file.name}}.{{activity_comment_file.extension}}</span>
                              </a>
                            </template>
                          </template>
                          <p> {{ activity_comment.message }} </p>
                          <div class="d-flex justify-content-end">
                            <span> <small class="text-muted">{{ evaluateRole(activity_comment) }}</small> </span>
                          </div>
                        </div>
                      </div>
                      <div class="comment-time">
                        {{ activity_comment.created_at | formatDate('HH:mm Do MMM YY ') }}
                      </div>
                    </div>
                    <!--  edit comment starts -->
                    <template v-if="activity_comment.edit_comment">
                      <AddUpdateComment :key="`activity_comment-edit-${activity_comment_index}`" action="edit"
                                        v-on:hideCommentBox = "hideCommentBox(activity_comment, 'edit_comment')"
                                        v-on:commentActionCompleted="handleCommentActionCompleted($event, item_status_activity, activity_comment_index)"
                                        :comment_obj="activity_comment" :url="`order_item/${item_status_activity.id}/comment/${activity_comment.id}`"
                      ></AddUpdateComment>
                    </template>
                    <!--  edit comment ends -->

                    <!--  add reply starts -->
                    <AddUpdateComment :key="`activity_comment-edit-${activity_comment_index}`" action="reply" v-if="activity_comment.reply_comment"
                                      v-on:hideCommentBox = "hideCommentBox(activity_comment, 'reply_comment')"
                                      v-on:commentActionCompleted = "item_status_activity.comments.unshift($event)"
                                      :comment_obj="activity_comment" :url="`order_item/${item_status_activity.id}/comment`"
                    ></AddUpdateComment>
                    <!--  add reply ends -->

                  </template>
                  <!-- Comment listing ends -->
                </div>
              </div>
              </div>
            </template>
          </div>
        </b-tab>
      </b-tabs>
    </div>

    <modal :width="1000"
           :resizable="true"
           :scrollable="true"
           height="auto"
           :reset="true"
           name="customer-review-modal" ref="customer-review-modal" id="modal-center-lockerroom" size="xl" :hide-footer="true"
           @close="$store.commit('Change_Locker_Active_Tab', 0)"  @opened="showMarkerActionButtons">
      <div class="modal-header fs-4 d-flex justify-content-between p-3">
        <div class="d-flex align-items-center gap-2">
          <div class="font-weight-bold pl-1">
            Artwork Approval
          </div>

          <span class="badge badge-dark font-weight-lighter" style="line-height: normal">
            {{activity_navigation_index+1}} / {{activity_items.activity_item_data.length}}
          </span>
        </div>

        <div class="d-flex justify-content-end" style="flex-grow: 8;">
          <button class="btn btn-secondary light mx-1" @click="$modal.hide('customer-review-modal')">Cancel</button>
          <template v-if="activity_items.activity_item_data[activity_navigation_index] && activity_items.activity_item_data[activity_navigation_index].action">
            <span v-if="activity_items.activity_item_data[activity_navigation_index].action == 'accept'" class="mx-1">Accepted</span>
            <span v-else class="mx-1">Rejected</span>
          </template>
          <template v-else>
            <button class="btn btn-secondary mx-1" @click="approveRejectDesigns('accept')">Accept</button>
            <button class="btn btn-secondary mx-1" @click="approveRejectDesigns('reject')">Reject</button>
          </template>
        </div>
        <span class="modal-close cursor-pointer" @click="$modal.hide('customer-review-modal')">
          <BIconX />
        </span>
      </div>

      <template v-if="activity_items.activity_item_data[activity_navigation_index]">

        <div class="d-flex align-items-center justify-content-between gap-1 py-4 px-3 m-auto">
          <div class="fs-5">
            <BIconChevronLeft @click="navigateActivitySlider('back')" />
          </div>

          <div v-for="(actFile, fileInd) in activity_items.activity_item_data[activity_navigation_index].files" :key="`actfile-${fileInd}`">
            <div :id="`markerAreaDiv${fileInd}${activity_navigation_index}`" :key="`markerAreaDiv${fileInd}${activity_navigation_index}`"></div>
            <img @click="showMarkerArea(fileInd)" :ref="`designImage${fileInd}${activity_navigation_index}`" :key="`designImage${fileInd}${activity_navigation_index}`" :src="`${actFile.file}`" alt="" class="w-100" style="max-height: 500px" crossorigin="anonymous">
          </div>


          <div class="fs-5">
            <BIconChevronRight @click="navigateActivitySlider('next')" />
          </div>
        </div>

        <div class="p-4 text-left">
          <div class="fs-4">Write your feedback</div>
          <div class="mt-2">
            <b-textarea v-model="activity_items.activity_item_data[activity_navigation_index].message" placeholder="Please write your feedback here..." rows="5"></b-textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary light" @click="$modal.hide('customer-review-modal')">Cancel</button>

          <template v-if="activity_items.activity_item_data[activity_navigation_index].action">
            <span v-if="activity_items.activity_item_data[activity_navigation_index].action == 'accept'">Accepted</span>
            <span v-else>Rejected</span>
          </template>
          <template v-else>
            <button class="btn btn-secondary" @click="approveRejectDesigns('accept')">Accept</button>
            <button class="btn btn-secondary" @click="approveRejectDesigns('reject')">Reject</button>
          </template>
        </div>

      </template>



    </modal>

    <modal :adaptive="true"
           height="auto"
           :minWidth="1300"
           :scrollable="true"
           name="product-preview" ref="product-preview" :hide-footer="true">

      <div class="modal-header fs-4 d-flex justify-content-between p-3">
        <div class="font-weight-bold pl-1">
          Preview Images
        </div>

        <span class="modal-close cursor-pointer" @click="$modal.hide('product-preview')">
              <BIconX />
            </span>
      </div>

      <div class="px-3 pt-3 d-flex justify-content-center">
        <div class="badge badge-light fs-2 p-2 text-muted"> <b-icon-search class="text-info"></b-icon-search> Please hover over the images to zoom!</div>
      </div>
      <div class="d-flex w-100 justify-content-center gap-1 py-4 px-3">
        <zoom-on-hover :img-normal="this.storage_url+this.front_preview" :img-zoom="this.storage_url+this.front_preview" :scale="2"></zoom-on-hover>
        <zoom-on-hover :img-normal="this.storage_url+this.back_preview" :img-zoom="this.storage_url+this.back_preview" :scale="2"></zoom-on-hover>
      </div>
    </modal>

    <modal :width="1300"
           :resizable="true"
           :scrollable="true"
           height="auto"
           :reset="true"
           name="order-detail" ref="order-detail" id="order-detail" size="xl" :hide-footer="true" @closed="activity_item_info = getOrderItemStatusActivityInfoDefaultObject()">

      <div class="modal-header fs-4 d-flex justify-content-between p-3">
        <div class="font-weight-bold pl-1">
          Order Details
        </div>
        <span class="modal-close cursor-pointer" @click="$modal.hide('order-detail')">
          <BIconX />
        </span>
      </div>
      <template v-if="order && activity_item_info.factory_product">
        <b-row class="mt-3 mx-2">
          <b-col class="col-2">
            <strong>Company:</strong> {{order.hasOwnProperty('company_name')?order.company_name: ""}}
          </b-col>
          <b-col class="col-2">
            <strong>Customer:</strong> {{order.customer.first_name + order.customer.last_name}}
          </b-col>
          <b-col class="col-2">
            <strong>Email:</strong> {{order.customer.email}}
          </b-col>
          <b-col class="col-2">
            <strong>Product:</strong> {{activity_item_info.factory_product.product_name}}
          </b-col>
          <b-col class="col-2">
            <a :href="`${storage_url}${order.design_file}`"  class="btn btn-dark mx-1" v-if="order.design_file">Download Pdf</a>
          </b-col>
          <b-col class="col-2">
            <a :href="`${api_url}/order/${order_id}/product/${activity_item_info.factory_product.id}/export`"
               :download="`order_${order.order_no}_product_${activity_item_info.factory_product.product_name}.xlsx`"
               class="btn btn-dark mx-1"
            >
              Download Excel
            </a>
          </b-col>
        </b-row>
        <b-row class="mt-3 mx-2">
          <b-col class="col-6 order-detail-roster">
            <h4>Roster Detail</h4>
            <template>
              <b-table
                :items="activity_item_info.factory_product.product_roster_detail"
                :fields="roster_headers"
                hover
                sorter
                class="bg-gray-200"
              >
                <template #cell(number)="data">
                  <template v-if="data.item.number">
                    <img style="height: 27px;" :alt="data.item.number"
                      :src="`data:image/svg+xml;charset=utf-8,${encodeURIComponent(activity_item_info.factory_product
                        .product_custom_text_objects.roster[data.index].number.items[0].svg)}`"
                    />
                  </template>
                </template>
                <template #cell(name)="data">
                  <template v-if="data.item.text">
                    <img :alt="data.item.text"
                      :src="`data:image/svg+xml;charset=utf-8,${encodeURIComponent(activity_item_info.factory_product
                        .product_custom_text_objects.roster[data.index].name.items[0].svg)}`"  style="height: 27px;"
                      />
                  </template>
                </template>
              </b-table>
            </template>
            <template v-if="activity_item_info.factory_product.product_roster_detail.length == 0">
              <b-row class="bg-gray-200">
                <b-col class="col-12">
                  No roster exists
                </b-col>
              </b-row>
            </template>
          </b-col>
          <b-col class="col-6">
            <div class="d-flex justify-content-between">
              <h4>Production Image</h4>
            </div>

            <div class="w-100 mt-3">
              <div class="d-flex align-items-center justify-content-center w-100 gap-1">
                <img class="flex-shrink-1" style="max-width: calc(50% - 0.5rem);" alt=""
                     :key="`item-${activity_item_info.item_index}-status-${activity_item_info.status_activity_index}-item-
                        ${activity_item_info.status_activity_item_index}-file-0`"
                     :src="`${storage_url}${order.items[activity_item_info.item_index].status_activities[activity_item_info.status_activity_index]
                     .activity_items[activity_item_info.status_activity_item_index].activity_files[0].url}`">
                <img class="flex-shrink-1" style="max-width: calc(50% - 0.5rem);" alt=""
                     :key="`item-${activity_item_info.item_index}-status-${activity_item_info.status_activity_index}-item-
                        ${activity_item_info.status_activity_item_index}-file-1`"
                     :src="`${storage_url}${order.items[activity_item_info.item_index].status_activities[activity_item_info.status_activity_index]
                        .activity_items[activity_item_info.status_activity_item_index].activity_files[1].url}`">
              </div>

              <div class="px-3 pb-3 d-flex mt-1 justify-content-center">
                <button class="btn btn-dark text-white" v-if="!loadingPreviewImages" @click="downloadStatusActivityImages()">Download Preview Images</button>
                <button class="btn btn-dark text-white" v-else disabled><b-icon-arrow-counterclockwise class="b-icon-animation-spin-reverse" /> Please wait...</button>
              </div>
            </div>


          </b-col>
        </b-row>

      </template>


    </modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Mixins, Prop} from 'vue-property-decorator'
import {http} from "@/httpCommon";
import $ from 'jquery'
import ZoomOnHover from "vue-zoom-on-hover";
Vue.use(ZoomOnHover);
import {
  handleResponseException,
  logData,
  activityStatus,
  urlToBase64, getDomDocument
} from "@/helpers/Helpers";
import AddUpdateComment from "@/components/AddUpdateComment.vue";
import ActivityStatusIcons from "@/components/ActivityStatusIcons.vue";
import OrderFlowStatusLine from "@/components/OrderFlowStatusLine.vue";
import moment from "moment";
import * as markerjs2 from 'markerjs2';
import ErrorMessages from "@/mixins/ErrorMessages";
import {findIndex, debounce, filter} from "lodash";
import {getCompany} from "@/helpers/Helpers";


@Component<OrderDetail>({
  async mounted() {
    this.activity_item_info = this.getOrderItemStatusActivityInfoDefaultObject()
    this.api_url = `${process.env.VUE_APP_API_BASE_URL}/api`
    await getCompany();

    let self = this;
    let comment_id = null;
    this.isWebComponent = this.$root.$options.name == 'shadow-root'

     if(this.company.platform == "wordpress") {
       if(this.ecommerce_order_id) {
         this.order_id = this.ecommerce_order_id;
       } else {
         this.order_id = this.$route.query.order_id;
       }
     } else if(this.company.platform == "shopify") {
       this.order_id = this.ecommerce_order_id;
     }
     else {
      this.order_id = this.$route.params.order_id;
    }
    comment_id = this.$route.query.comment_id;

     let customer_authenticated = this.isCustomerAuthenticated;
     if(!customer_authenticated) {
       let jwttoken = localStorage.getItem("jwtToken");
       let customer = localStorage.getItem("customer");
       if(jwttoken != null && jwttoken != '' && customer != null && customer != '') {
         let payload = { jwtToken: '', access_token : '',  customer : {}};
         payload.jwtToken = jwttoken;
         payload.access_token = jwttoken;
         payload.customer = JSON.parse(customer);
         this.$store.commit('SET_CUSTOMER', payload);
         customer_authenticated = true;
       }
     }


     if(customer_authenticated){
       await self.getOrderDetail();
       if(comment_id) {
         let timer = setInterval(function() {
           self.goToMessage(Number(comment_id))
           if( document.getElementById(`comment-${comment_id}-box`)) {
             clearInterval(timer)
           }
         }, 2000)
       }
     }

  },
  components: {
    AddUpdateComment,
    OrderFlowStatusLine,
    ActivityStatusIcons
  },
  filters: {
    initials(value: string) {
      if (value) {
        let value_array = value.split(" ");

        // Select the first letter of the name
        let first_letter = value.charAt(0);
        let last_letter = "";
        if (value_array.length > 1) {
          last_letter = value_array[value_array.length - 1].charAt(0);
        }
        let initial_letters = first_letter + last_letter;
        // Return the initials
        return initial_letters.toUpperCase();
      } else {
        return "";
      }
    },
    formatDate(value: string, format: string) {
      if (!format) {
        format = "MM-DD-YYYY"
      }
      return moment(value).format(format)
    }
  }
})

export default class OrderDetail extends Mixins(ErrorMessages) {
  @Prop({required: false}) ecommerce_order_id!: number
  public storage_url = process.env.VUE_APP_STORAGE_URL
  private order_id = null;
  private order:Record<any,any> = {};
  public logData = logData
  public activityStatus = activityStatus
  public showLoader = false
  public isWebComponent = false

  // -------- Order Status Constants
  public FACTORYREVIEW = "submitted_for_factory_review"
  public ORDERAPPROVE = "order_approve"
  public ORDERCANCEL = "order_cancel"
  public FACTORYAPPROVED = "factory_approved"
  public FACTORYREJECTED = "factory_rejected"
  public CUSTOMERREVIEW = "submitted_for_customer_review"
  public CUSTOMERAPPROVED = "customer_approved"
  public CUSTOMERREJECTED = "customer_rejected"
  public ORDERINPRODUCTION = "in_production"
  public ORDERSHIPPED = "shipped"
  public ORDERCOMPLETED = "completed"
  public status_icons:Record<any, any> = {
    submitted_for_factory_review: 'submitted_for_factory_review',
    factory_approved: 'factory_approved',
    order_cancel: 'order_cancel',
    factory_rejected: 'factory_rejected',
    submitted_for_customer_review: 'submitted_for_customer_review',
    customer_approved: 'customer_approved',
    customer_rejected: 'customer_rejected',
    in_production: 'in_production',
    shipped: 'shipped',
    completed: 'completed'
  }

  /*
  * data props starts
  * */

  public activity_navigation_index = 0
  public activity_items :Record<any, any> = {
    order_item_id:null,
    order_item_index:null,
    activity_item_data: []
  }
  public ref = this.$refs as Record<any, any>;
  public markerActive = false
  public auth_customer = this.$store.getters.getCustomer
  // this data prop is being initialized in mounted method
  public activity_item_info: Record<any, any> = {}
  public front_preview = ''
  public back_preview = ''
  public loadingPreviewImages = false
  public product_texts: any = []
  public custom_logos: any = []
  public roster_headers = [
    {key: 'size', label: 'Size'}, {key: 'quantity', label: 'Quantity'}, {key: 'number', label: 'Number'}, {key: 'name', label: 'Name'}
  ]
  public api_url =  ''

  /*
  * data props ends
  * */

  get company():Record<any, any>{
    return this.$store.getters.getCompany
  }
  get isCustomerAuthenticated(): boolean {
    return this.$store.getters.isCustomerAuthenticated
  }

  getOrderItemStatusActivityInfoDefaultObject(values = {}) {
    const default_obj =  {
      item_index: null, status_activity_index: null, status_activity_item_index: null, factory_product: null
    }
    return {...default_obj, ...values}
  }


  async getOrderDetail() {
    let self = this;
    let url = `order/${self.order_id}`
    http.get(url)
      .then((successResponse: Record<any, any>) => {
        let response_data = successResponse.data;
        if(response_data.success == true) {
          self.order = response_data.result;
        } else {
          self.showToast(response_data.message, "error")
          self.$router.push({name: "CustomerOrders"})
        }
      }).catch((errorResponse: any) => {
      handleResponseException(errorResponse)
    });
  }

  async deleteComment(activity_comment: Record<any, any>, item_status_activity: Record<any, any>) {
    let url = `order_item/${activity_comment.id}/delete_comment`;
    let comment_index = item_status_activity.comments.indexOf(activity_comment);
    item_status_activity.comments.splice(comment_index, 1);
    http.delete(url)
      .then((successResponse: Record<any, any>) => {
        let response = successResponse.data;
      }).catch((errorResponse: any) => {
      item_status_activity.comments.push(activity_comment);
      handleResponseException(errorResponse)
    });
  }

  hideCommentBox(hide_comment_box_for_obj: Record<any, any>, obj_key: string) {
    this.$set(hide_comment_box_for_obj, obj_key, false);
  }

  handleCommentActionCompleted(event_data: Record<any, any>, activity_item: Record<any, any>, activity_item_comment_index: number) {
    let self = this;
    self.$set(activity_item.comments, activity_item_comment_index, event_data)
  }





  ///////////////// Activity Methods


  public showSampleDesigns(order_item: Record<any, any>, order_item_index :number, activity_item_index:number){
    this.$modal.show('customer-review-modal');
    this.activity_items.order_item_id = order_item.id
    this.activity_items.order_item_index = order_item_index

    let activity_item = Object.assign({}, order_item.status_activities[activity_item_index]);


    this.activity_items.activity_item_data = [];
    for(let actItem of activity_item.activity_items){
      let actObj:Record<any,any> = {};
      actObj.action = null;
      actObj.status = activity_item.status;
      actObj.message = '';
      actObj.files = [];
      actObj.factory_product_id = actItem.factory_product_id;
      for(let actfile of actItem.activity_files){
        let fileObj:Record<any,any> = {};
         fileObj.file = `${this.storage_url}${actfile.url}?nocache=${Math.random()}`;
        fileObj.file_type = null;
        actObj.files.push(fileObj);
      }
      this.activity_items.activity_item_data.push(actObj);
    }

    if(this.activity_items.activity_item_data.length > 0)
      this.activity_navigation_index = 0;


  }

  public submitActivity(submit_type:string) {
    this.showLoader = true;
    let form_data = this.activity_items;
    if(submit_type == 'form_data'){
      // form_data = null;
      form_data = new FormData();

      for (const key in this.activity_items) {

        if (key == 'activity_item_data') {
          this.activity_items[key].forEach((activity_file_obj:Record<any,any> , actIndx:number) => {
            for (const key2 in activity_file_obj) {
              if(key2 == 'files'){
                activity_file_obj[key2].forEach((activity_file:Record<any,any> , fileInd:number) => {
                  for(const key3 in activity_file){
                    form_data.append(key+'['+actIndx+']['+key2+']['+fileInd+']['+key3+']', this.activity_items[key][actIndx][key2][fileInd][key3]);
                  }
                });
              }else{

                form_data.append(key+'['+actIndx+']['+key2+']', this.activity_items[key][actIndx][key2]);
              }
            }
          });
        }
        else {
          form_data.append(key, this.activity_items[key]);
        }

      }
    }

    let url = `customer-orders/${this.activity_items.order_item_id}/order-activity`
    http.post(url, form_data)
      .then((successResponse) => {
        let response_data = successResponse.data;
        Vue.set(this.order.items, this.activity_items.order_item_index, response_data.result.order_item)
        this.$modal.hide('customer-review-modal');
        this.showLoader = false;
      }).catch((errorResponse) => {
      this.showLoader = false;
      console.log(errorResponse);
    });
  }
  public showMarkerArea(ref_index: number){
    this.markerActive = true
    let activityObj = this.activity_items.activity_item_data[this.activity_navigation_index];


    let image = (this.$refs as Record<any,any>)['designImage'+ref_index+this.activity_navigation_index][0];
    const markerArea:Record<any,any> = new markerjs2.MarkerArea(image)
    markerArea.addEventListener('render', (event:Record<any,any>) => {
      activityObj.files[ref_index].file = event.dataUrl
      activityObj.files[ref_index].file_type = 'encode'
    });
    if(this.isWebComponent) {
      let shadow_dom = (this.$root as Record<any,any>).$options.shadowRoot;
      markerArea.targetRoot = shadow_dom.getElementById('markerAreaDiv'+ref_index+this.activity_navigation_index);
      markerjs2.Style.styleSheetRoot = shadow_dom;
    } else {
      markerArea.targetRoot = document.getElementById('markerAreaDiv'+ref_index+this.activity_navigation_index);
    }
    markerArea.renderAtNaturalSize = true;
    markerArea.show();
  }
  public navigateActivitySlider(direction:string){

    let activityObj = this.activity_items.activity_item_data[this.activity_navigation_index];

    if(direction == 'next'){
      if(activityObj.action == null){
        this.showToast('Please accept or reject designs before navigate', 'error');
      }else{
        let limit = this.activity_items.activity_item_data.length;
        if((this.activity_navigation_index+1) < limit){
          this.activity_navigation_index ++
        }
        if(
          (this.activity_items.activity_item_data.length - 1) == this.activity_navigation_index
          && this.activity_items.activity_item_data[this.activity_navigation_index].action )
        {
          this.submitActivity('')
        }
      }
    }else{
      if((this.activity_navigation_index-1) >= 0) {
        this.activity_navigation_index--
      }
    }

    this.showMarkerActionButtons()
  }
  public approveRejectDesigns(action:string){

    let imageEdit = false
    if (this.markerActive){
      imageEdit = true
      $(".modal-header").next(".d-flex").children("div:not(.fs-5)").each(function(){
        $(this).find(".__markerjs2_toolbar-block:eq(2) .__markerjs2_toolbar_button_colors:eq(0)").trigger("click")
      })
    }

    this.markerActive = false
    setTimeout(() => {
      let activityObj = this.activity_items.activity_item_data[this.activity_navigation_index];
      if(action == 'reject'){
        if((activityObj.message == null || activityObj.message == '' ) && !imageEdit ){
          this.showToast('Please provide feedback before rejection','error');
        }else{
          this.activity_items.activity_item_data[this.activity_navigation_index].action = action;
          this.activity_items.activity_item_data[this.activity_navigation_index].status = this.CUSTOMERREJECTED;
          this.navigateActivitySlider('next')
        }
      }else if(action == 'accept'){
        this.activity_items.activity_item_data[this.activity_navigation_index].action = action;
        this.activity_items.activity_item_data[this.activity_navigation_index].status = this.CUSTOMERAPPROVED;
        this.navigateActivitySlider('next')
      }
    },1000)

  }

  updateOrderProducts(order_item_id: number, order_item_status_activity: number) {
    let self:Record<any, any> = this;
    if(this.company.platform == "wordpress") {
      let query_string = `update_order_product=true&order_item_id=${order_item_id}&activity_id=${order_item_status_activity}`
      window.location.href = `${this.company.company_domain}/customizer/#/?${query_string}`;
    } else{
      self.$router.push({path: "/", query: {update_order_product: true, order_item_id: order_item_id, activity_id: order_item_status_activity}});
    }
  }

  canPerformCommentAction(comment_obj: Record<any, any>) {
    let self = this;
    if(self.auth_customer) {
      return comment_obj.comment_by_id == self.auth_customer.id && comment_obj.comment_by == "App\\Models\\Customer";
    } else {
      return false;
    }
  }

  goToMessage(parent_message_id: number) {
    document.getElementById(`comment-${parent_message_id}-box`)?.scrollIntoView({
      behavior: 'smooth'
    });
  }
  async showMarkerActionButtons() {
    setTimeout(() => {
      this.showMarkerArea(0);
      this.showMarkerArea(1);
    }, 2000)
  }

  showPreview(activity_item){
    this.front_preview = `${activity_item.activity_files[0].url}`
    this.back_preview = `${activity_item.activity_files[1].url}`
    this.$modal.show('product-preview')
  }

  async downloadStatusActivityImages(activity_files: Record<any, any>[] = []) {
    const {item_index, status_activity_index, status_activity_item_index} = this.activity_item_info
    if(activity_files.length == 0) {
      activity_files = this.order.items[item_index].status_activities[status_activity_index].activity_items[status_activity_item_index].activity_files
    }
    const activity_files_paths = activity_files.map((activity_file: Record<any, any>) => {
      return activity_file.url
    })
    this.showLoader = true
    const base64_files = await urlToBase64(activity_files_paths)
    this.showLoader = false
    const dom_document = getDomDocument()
      base64_files.forEach((base64_file, base64_file_index) => {
        let activity_file = dom_document.createElement("a");
        activity_file.href = base64_file;
        activity_file.download = activity_files[base64_file_index].name
        activity_file.click();
      })
  }

  async showActivityItemDetail(item_index, status_activity_index, status_activity_item_index) {
    const order_item = this.order.items[item_index]
    const activity_item = order_item.status_activities[status_activity_index].activity_items[status_activity_item_index]
    const factory_product_index = findIndex(order_item.factory_products, ['id', activity_item.factory_product_id])
    const activity_item_info = {
      item_index: item_index, status_activity_index: status_activity_index, status_activity_item_index,
      factory_product: order_item.factory_products[factory_product_index]
    }
    this.activity_item_info = await this.getOrderItemStatusActivityInfoDefaultObject(activity_item_info)
    this.$modal.show('order-detail');
  }
  evaluateRole(activity_comment){
      if(Object.prototype.hasOwnProperty.call(activity_comment, "user")){
          if(Object.prototype.hasOwnProperty.call(activity_comment.user, "userroles")){
            if(activity_comment.user.userroles.length > 0){
              switch(activity_comment.user.userroles[0].name.toLowerCase()){
                case "factory":
                  return "Factory";
                case "admin":
                  return "Merchant";
                case "superadmin":
                  return "Custimoo Admin";
              }
            }
          }
          else{
            return "Customer";
          }

      }
      else{
        return "Customer"
      }
    }

}
</script>

<style lang="scss" scoped>
@mixin avatar {
  display: flex;
  font-size: 1rem;
  text-transform: uppercase;
  height: 30px;
  width: 30px;
  flex-shrink: 0;
  background: #009eda;
  color: #fff;
  align-items: center;
  justify-content: center;
  border-radius: 1000px;

  @media (max-width: 600px) {
    height: 25px;
    width: 25px;
    font-size: 0.8rem;
  }
}

.order-wrapper {
  padding: 10px;
  background: #efefef;

  .order-title {
    text-align: left;
  }

  .chevron {
    transform: rotate(-180deg);
    transition: 0.3s all ease;
  }

  .collapsed {
    .chevron {
      transform: rotate(0deg);
    }
  }

  .order-activities {
    background: #fff;
    border: 1px solid #ddd;
    padding: 0.75rem 1rem;
    text-align: left;
    border-radius: 5px;

    .activity-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      width: 40px;
      border: 1px solid #219F84;
      color: #219F84;
      font-size: 1.2rem;
      border-radius: 1000px;
      flex-shrink: 0;
    }

    .activity-status {
      display: flex;
      align-items: flex-start;
      position: relative;

      &:after {
        content: "";
        background: #219F84;
        display: block;
        position: absolute;
        width: 1px;
        left: 20px;
        top: 40px;
        bottom: -2rem;
      }

      & + .activity-status {
        margin-top: 2rem;
      }

      &:last-child {
        &:after {
          display: none;
        }
      }

      &.active {
        .activity-icon {
          background: #219F84;
          color: #fff;
        }
      }

      .activity-content {
        max-width: 100%;

        .activity-title {
          padding-left: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          margin-top: 0.5rem;

          .date-time {
            color: #999;
            margin-left: 5px;
            font-weight: normal;
            font-size: smaller;
            white-space: nowrap;
          }
        }

        .images-grid {
          .actions {
            display: inline-flex;
            align-items: flex-start;
            gap: 7px;

            .btn{
              white-space: nowrap;
            }
          }

          img {
            height: 150px;
            border-radius: 4px;

            @media (max-width: 600px) {
              height: auto;
              width: calc(50% - 0.5rem);
            }
          }
        }
      }

      .feedback-row {
        padding: 0.5rem 0.7rem;
        display: inline-flex;
        gap: 0.7rem;
        background: #E1E6EA;
        border-radius: 5px;
        flex-shrink: 0;
        transition: 0.2s ease all;
        cursor: pointer;

        &:hover {
          box-shadow: inset 0 0 0 1000px rgba(0, 0, 0, 0.1);
        }

        .feedback-images {
          img {
            height: 100px;

            @media (max-width: 600px) {
              height: auto;
              width: calc(33.333333% - 0.34rem);
            }
          }
        }
      }
    }
  }

  .comment-box {
    width: 100%;
    max-width: 600px;
    background: #efefef;
    padding: 0.7rem;
    border-radius: 5px;
    border: 1px solid #e6e6e6;
    position: relative;

    @media (max-width: 600px) {
      flex-direction: column;
    }

    textarea {
      border: none;
      resize: none;

      @media (max-width: 600px) {
        height: 110px;
        font-size: 1rem;
      }
    }

    .comment-avatar {
      @include avatar;

      &.close {
        background: #c80b0b;
        opacity: 0.9;
        height: 22px;
        width: 22px;
        font-size: 1.1rem;
        position: absolute;
        top: -11px;
        right: -11px;
        cursor: pointer;
      }
    }

    button {
      flex-shrink: 0;
    }

    .upload-images {
      display: flex;
      gap: 7px;
      max-width: 100%;
      overflow-x: auto;

      & > div {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80px;
        border-radius: 5px;
        overflow: hidden;
        position: relative;
        flex-shrink: 0;

        .delete-image {
          position: absolute;
          z-index: 100;
          top: 1px;
          right: 3px;
          cursor: pointer;
        }

        img {
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 100%;
        }
      }
    }
  }

  .comment-row {
    max-width: 100%;

    @media (max-width: 600px) {
      flex-direction: column;
    }

    .comment-avatar {
      @include avatar;
      background: #42b983;
    }

    .comment-msg {
      background: #E1E6EA;
      padding: 0.5rem 1.5rem 0.5rem 0.7rem;
      border-radius: 5px;
      display: flex;
      flex-direction: column;
      position: relative;
      width: 100%;
      flex-shrink: 1;
      max-width: 800px;

      .comment-action {
        position: absolute;
        right: 5px;
        top: 3px;

        button {
          padding: 0;
          border: none;
          background: none;
        }
      }

      .comment-quote {
        background: rgba(255, 255, 255, 0.9);
        padding: 0.3rem 0.5rem;
        font-style: italic;
        color: #777;
        border-radius: 5px;
        margin-bottom: 5px;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .comment-time {
      text-align: right;
      font-size: 0.9em;
      white-space: nowrap;
      color: rgba(0, 0, 0, 0.4);
      align-self: flex-end;
    }
  }
}

.feedback-block{
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  background: #eee;
  padding: 10px;
  border-radius: 7px;

  &:empty{
    display: none;
  }

  .feedback-images{
    display: flex;
    gap: 10px;
    padding: 7px;
    background: #fff;
    border-radius: 7px;
    overflow: hidden;
    align-items: flex-start;
  }

  .feedback-text{
    color: #555;
    font-size: 1rem;
    padding-top: 7px;
  }
}
</style>
