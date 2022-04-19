<template>
  <div class="page-wrapper m-lg-4" v-cloak>
    <div class="order-wrapper" v-if="order">
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
            {{ order_item.factory_name }}
          </template>

          <OrderFlowStatusLine :item_status="order_item.status" />

          <div class="order-activities">
            <template v-for="(item_status_activity, item_status_activity_index) in order_item.status_activities">
              <div v-if="(item_status_activity.status != ORDERCOMPLETED)" class="activity-status" :class="status_icons[item_status_activity.status]" :key="`item_status_activity_${item_status_activity_index}`">
                <div  class="activity-status" :key="`item_status_activity_${item_status_activity_index}`">
                <ActivityStatusIcons :activity_status="item_status_activity.status" />

                <div class="activity-content">
                  <div class="activity-title">
                    {{ item_status_activity.message }}
                    <span class="date-time">
                  {{ item_status_activity.created_at | formatDate('HH:mm Do MMM YY ')  }}
                </span>
                  </div>
                  <div class="images-grid p-2 d-flex gap-1 w-100">
                    <div class="d-flex align-items-stretch flex-wrap gap-1">
                      <div class="feedback-block" :key="activity_itm_ind" v-for="(activity_item, activity_itm_ind) in item_status_activity.activity_items">
                        <div class="feedback-images" v-if="activity_item.activity_files">
                          <img :key="activity_file_index" v-for="(activity_file, activity_file_index) in activity_item.activity_files" :src="`${storage_url}${activity_file.url}`" alt="">
                        </div>
                        <div class="feedback-text" v-if="(item_status_activity.status == ORDERSHIPPED  && activity_itm_ind == 0 && order_item.tracking_no)" :key="`afd-${activity_itm_ind}`">The shipping no is <strong style="font-weight:bold">{{order_item.tracking_no}}</strong>.</div>
                        <template v-else>
                          <div class="feedback-text" :key="`afd-${activity_itm_ind}`" v-if="activity_item.message && activity_item.message!='' ">{{activity_item.message}}</div>
                        </template>


                      </div>
                    </div>

                    <template v-if="item_status_activity_index==0">
                      <div class="actions" v-if="item_status_activity.status == FACTORYREJECTED">
                        <button class="btn btn-secondary" @click="updateOrderProducts(order_item_index, item_status_activity_index)">Edit Products</button>
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
                            <template v-if="activity_comment_file.extension.toLowerCase() == 'pdf'">
                              <a :key="`activity_comment_file_${activity_comment_file_index}`" :href="activity_comment_file.file_preview" download target="_blank">
                                <img src="/img/images/pdf-placeholer.png" alt="">
                              </a>
                            </template>
                          </template>
                          <p> {{ activity_comment.message }} </p>

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
      <div class="loader" v-if="showLoader" ><img style="width: 100px" src="../../src/assets/images/loading.gif" /></div>
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
            <img crossorigin="anonymous" @click="showMarkerArea(fileInd)" :ref="`designImage${fileInd}${activity_navigation_index}`" :key="`designImage${fileInd}${activity_navigation_index}`"  :src="`${actFile.file}`" alt="" class="w-100" style="max-height: 500px">
          </div>


<!--          <div class="fs-5" v-if="(activity_items.activity_item_data.length - 1) != activity_navigation_index">-->
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {Component, Mixins} from 'vue-property-decorator'
import {http} from "@/httpCommon";
import $ from 'jquery'
import {handleResponseException, logData, pathInfo} from "@/helpers/Helpers";
import AddUpdateComment from "@/components/AddUpdateComment.vue";
import ActivityStatusIcons from "@/components/ActivityStatusIcons.vue";
import OrderFlowStatusLine from "@/components/OrderFlowStatusLine";
import moment from "moment";
import * as markerjs2 from 'markerjs2';
import ErrorMessages from "@/mixins/ErrorMessages";
import {findIndex, debounce, filter} from "lodash";


@Component<OrderDetail>({
  async mounted() {
    let self = this;
    await self.getOrderDetail();
    let comment_id = this.$route.query.comment_id;
    if(comment_id) {
      let timer = setInterval(function() {
        self.goToMessage(Number(comment_id))
        if( document.getElementById(`comment-${comment_id}-box`)) {
          clearInterval(timer)
        }
      }, 2000)
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
  public storage_url = process.env.VUE_APP_STORAGE_URL
  private order_id = this.$route.params.order_id;
  private order:Record<any,any> = {};
  public logData = logData
  public showLoader = false

  // -------- Order Status Constants
  public FACTORYREVIEW = "submitted_for_factory_review"
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
    factory_rejected: 'factory_rejected',
    submitted_for_customer_review: 'submitted_for_customer_review',
    customer_approved: 'customer_approved',
    customer_rejected: 'customer_rejected',
    in_production: 'in_production',
    shipped: 'shipped',
    completed: 'completed'
  }

  //data props starts
  public activity_sample_files = []
  public activity_navigation_index = 0
  public activity_items :Record<any, any> = {
    order_item_id:null,
    order_item_index:null,
    activity_item_data: []
  }

  public ref = this.$refs as Record<any, any>;
  public activity_data:Record<any,any>={
    order_item_id: null,
    status:null,
    message:null
  }
  public markerActive = false

  public auth_customer = this.$store.getters.getCustomer

  //data props ends



  async getOrderDetail() {
    console.log("i9nside")
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
         fileObj.file = `${this.storage_url}${actfile.url}`;
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
      //handleResponseException(errorResponse)
    });
  }
  public resetActivityData(){
    this.activity_data.order_item_id = null
    this.activity_data.status = null
    this.activity_sample_files = []
    this.activity_data.message = null
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
    markerArea.targetRoot = document.getElementById('markerAreaDiv'+ref_index+this.activity_navigation_index);
    markerArea.renderAtNaturalSize = true;
    markerArea.show();
    //markerArea.close();
  }
  public navigateActivitySlider(direction:string){

    let activityObj = this.activity_items.activity_item_data[this.activity_navigation_index];

    if(direction == 'next'){
      if(activityObj.action == null){
        this.showToast('Please accept or reject designs before navigate');
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

  updateOrderProducts(order_item_index: number, item_status_activity_index: number) {
    let self = this;
    let order_item = JSON.parse(JSON.stringify(self.order.items[order_item_index]));
    let order_item_status_activity = order_item.status_activities[item_status_activity_index];
    let update_factory_product_ids: string[] = [];
    order_item_status_activity.activity_items.forEach((activity_item: Record<any, any>) => {
      update_factory_product_ids.push(activity_item.factory_product_id);
    })
    let factory_products = filter( order_item.factory_products, function(factory_product: Record<any, any>) {
      return findIndex(update_factory_product_ids, (update_factory_product_id) => {
        return update_factory_product_id == factory_product.id
      }) >= 0 ? true : false;
    })
    //active_index key represents the product index that is currently being updated
    let update_order_item_products_data = {
      'active_index': 0, order_item_id: order_item.id, factory_id: order_item.factory_id, factory_products: factory_products,
      activity_items: order_item_status_activity.activity_items
    }
    self.$store.dispatch("updateOrderItemProducts", update_order_item_products_data);
    self.$router.push("/");
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
    console.log("goto message",document.getElementById(`comment-${parent_message_id}-box`))
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
