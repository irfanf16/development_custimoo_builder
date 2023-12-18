<template>
  <div class="page-wrapper m-lg-4" v-cloak>
    <div v-if="showLoader" class="loader">
      <img src="@assets/images/loading.gif" />
    </div>
    <div class="order-wrapper" v-if="order && order.id">
      <div class="d-flex justify-content-between align-items-center">
        <div class="fs-4 font-weight-bolder order-title p-2">Order # {{ order.order_no }}</div>
        <div class="font-weight-bolder d-flex order-title p-2">
          <button class="btn btn-dark mx-2 cursor-pointer fs-2" @click.stop="cancelOrder(order)"
                  v-if="order.items[order.items.length-1].status === FACTORYREVIEW">Cancel order</button>

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
                              <button class="order-detail-btn btn btn-secondary btn-sm" title="Buy again"
                                      v-if="order_item.factory_products[activity_item_index].can_reorder && (company.platform == 'wordpress' || company.platform == 'shopify')"
                                      @click.stop="reorder(order,order_item.id, order_item.factory_products[activity_item_index])"
                                      style="padding: 3px 5px !important;" :key="`reorder-btn-${activity_item_index}`">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" style="width:1em;height:1em" viewBox="0 0 291.53 305.26">
                                  <g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path d="M168.59,63.92v3c0,15.41,0,30.83,0,46.24,0,9.14,5.18,16.15,13.42,18.28a25.67,25.67,0,0,0,6.13.69q28.49.08,57,0c3.87,0,7.74-.47,12-.75-.53,2.78-1,5.54-1.57,8.28q-2.52,12.62-5.11,25.2c-1.19,5.73-4.31,8.27-10.16,8.28q-32.41,0-64.84,0H92.94c.71,4,1.34,7.59,2,11.23,1.08,5.93,2.32,11.84,3.2,17.8.35,2.32,1.13,2.95,3.45,2.95q63.16-.12,126.34-.06c1.43,0,2.86,0,4.29,0,2.64.1,4.39,1.6,4.52,4.24a93.65,93.65,0,0,1,0,9.77c-.13,2.47-1.69,3.84-4.16,4.09a23.76,23.76,0,0,1-2.39.06H92.86c-6.69,0-9.79-2.46-11-9.06Q75.69,180.62,69.65,147q-4.91-26.94-9.84-53.87Q53.69,59.38,47.66,25.64c-.37-2.07-1.07-2.86-3.33-2.84-12.72.13-25.43.07-38.14.06C1.5,22.86,0,21.4,0,16.78c0-2.46,0-4.93,0-7.39C.12,6.54,1.82,4.77,4.68,4.77q25.16-.06,50.3,0c4.78,0,7.94,3.24,8.87,8.36,2.89,16.09,5.86,32.16,8.7,48.26.35,2,1,2.56,3,2.56q44.94-.11,89.87,0Z"/><path d="M204.56,45.8c.78.86,1.26,1.43,1.79,2,3.42,3.43,6.87,6.84,10.27,10.29,2.71,2.76,2.7,5,0,7.83-1.76,1.82-3.55,3.64-5.4,5.38-2.39,2.26-4.79,2.3-7.14,0q-14.2-14.11-28.29-28.33a8.87,8.87,0,0,1,.08-12.84q14.09-14.24,28.31-28.32c2.33-2.32,4.51-2.32,6.9-.09,2,1.84,3.88,3.77,5.75,5.71,2.48,2.58,2.48,4.91-.05,7.48-3.39,3.46-6.85,6.86-10.27,10.29-.54.55-1.05,1.13-2,2.13,1.38.06,2.27.13,3.17.13,12.47,0,24.94-.06,37.42,0,19.49.12,35.86,10.9,42.94,28.13a45.34,45.34,0,0,1-40.58,62.81c-20,.6-40,.16-60,.14-3.44,0-5.09-1.76-5.17-5.18,0-2.39,0-4.77,0-7.15,0-4.34,1.59-5.92,5.89-5.92,19.22,0,38.45,0,57.68,0a27.21,27.21,0,0,0,27.35-29.7C272,56.6,260.73,46,245.93,45.67c-13.26-.32-26.54-.08-39.81-.08C205.76,45.59,205.39,45.69,204.56,45.8Z"/><path d="M68.4,273.25a31.85,31.85,0,1,1,31.15,32C82.41,305.11,68.29,290.6,68.4,273.25Zm31.72-13.46a13.61,13.61,0,1,0,13.78,13.49A13.7,13.7,0,0,0,100.12,259.79Z"/><path d="M209.5,305.26a31.89,31.89,0,1,1,31.86-31.77A31.91,31.91,0,0,1,209.5,305.26Zm-13.56-32a13.62,13.62,0,1,0,13.69-13.49A13.51,13.51,0,0,0,195.94,273.29Z"/></g></g>
                                </svg>
                              </button>
                              <button class="order-detail-btn btn btn-secondary btn-sm" title="Download images"
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
                        <div class="feedback-text align-items-start mt-1 gap-1 d-flex"
                             v-if="order_item.factory_products[activity_item_index].addons && order_item.factory_products[activity_item_index].addons.length > 0" >
                          <div><strong class="fs-1 font-weight-bold">Addons:</strong></div>
                          <div>
                            <ul class="list-unstyled d-flex flex-wrap mt-1 mb-0 gap-1" style="max-width: 350px">
                              <template v-for="factory_product_addon in order_item.factory_products[activity_item_index].addons">
                                <span class="badge badge-secondary fs-1"
                                    :key="`factory_product_${order_item.factory_products[activity_item_index].id}_addon_${factory_product_addon.addon_id}`"
                                >
                                {{  factory_product_addon.title }}
                              </span>
                              </template>
                            </ul>
                          </div>
                        </div>
                        <div class="feedback-text" v-if="(item_status_activity.status == ORDERSHIPPED  && activity_item_index == 0 && order_item.tracking_no)" :key="`afd-${activity_item_index}`">The shipping no is <strong style="font-weight:bold">{{order_item.tracking_no}}</strong>.</div>
                        <template v-else>
                          <div class="feedback-text" :key="`afd-${activity_item_index}`" v-if="activity_item.message && activity_item.message!='' ">{{activity_item.message}}</div>
                        </template>
                        <template v-if="item_status_activity.status == FACTORYREVIEW">
                          <span>{{makeReorderMessage(activity_item.factory_product_id, order_item.factory_products)}}</span>
                        </template>
                      </div>
                    </div>

                    <template v-if="item_status_activity_index==0">
                      <div class="actions" v-if="item_status_activity.status == FACTORYREJECTED">
                        <button class="btn btn-secondary" @click="updateOrderProducts(order_item, item_status_activity.id)">Edit Products</button>
                      </div>

                      <div class="actions" v-if="order_item.status == CUSTOMERREVIEW && item_status_activity.status == CUSTOMERREVIEW">
                        <button class="btn btn-secondary" @click="showSampleDesigns(order_item, order_item_index, item_status_activity_index)">Take action</button>
                      </div>
                    </template>

                  </div>

                  <div class="comment-row px-2 pb-2 d-flex gap-1 mt-1"
                       v-if="order.general_comments && item_status_activity_index === 0">
                    <strong class="font-weight-bold">General Comments:</strong>
                    <span class="text-muted">{{ order.general_comments }}</span>
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
                              <cite class="fs-2 font-italic" title="Source Title">
                                <template v-if="activity_comment.parent_message">
                                  {{ activity_comment.parent_message }}
                                </template>
                                <template v-else>
                                  Click me to go to parent
                                </template>
                              </cite>
                            </footer>
                          </blockquote>
                          <div class="d-flex gap-1 align-items-start comment-images">
                          <template v-for="(activity_comment_file, activity_comment_file_index) in activity_comment.files">
                              <template v-if="['png', 'jpg', 'jpeg'].includes(activity_comment_file.extension)">
                                <a :key="`activity_comment_file_${activity_comment_file_index}`"
                                   :href="`${storage_url}${activity_comment_file.url}`" target="_blank">
                                  <img :key="`activity_comment_file_${activity_comment_file_index}`"
                                     :src="`${storage_url}${activity_comment_file.url}`" :alt="`${activity_comment_file.name}`" width="100">
                                </a>
                              </template>

                            <template v-if="['pdf', 'ai', 'eps', 'svg'].includes(activity_comment_file.extension.toLowerCase())">
                              <a :key="`activity_comment_file_${activity_comment_file_index}`" :href="`${storage_url}${activity_comment_file.url}`" :download="activity_comment_file.name" target="_blank">
                                <img width="50" height="50" src="/img/images/file.png" :alt="activity_comment_file.name">
                                <span>{{activity_comment_file.name}}.{{activity_comment_file.extension}}</span>
                              </a>
                            </template>
                          </template>
                          </div>
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
    <confirm-modal :message="cancel_confirm_message" ref="confirm_order_cancel" name="confirm_order_cancel"></confirm-modal>
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
  urlToBase64, getDomDocument, initiateLocalStorageKeys, authenticateUser
} from "@/helpers/Helpers";
import AddUpdateComment from "@/components/AddUpdateComment.vue";
import ActivityStatusIcons from "@/components/ActivityStatusIcons.vue";
import OrderFlowStatusLine from "@/components/OrderFlowStatusLine.vue";
import moment from "moment";
import * as markerjs2 from 'markerjs2';
import ErrorMessages from "@/mixins/ErrorMessages";
import {findIndex, debounce, filter} from "lodash";
import {getCompany} from "@/helpers/Helpers";
import ConfirmModal from "@/components/ConfirmModal.vue";


@Component<OrderDetail>({
  async mounted() {
    await initiateLocalStorageKeys();
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
       let jwttoken = localStorage.getItem(Vue.prototype.$jwtToken_localstorage_key);
       let customer:any = localStorage.getItem(Vue.prototype.$customer_localstorage_key);
       if(jwttoken != null && jwttoken != '' ) {
         if(customer == null || customer == '') {
           await authenticateUser(jwttoken, true);
           customer_authenticated = true;
         }else {
           let payload = { jwtToken: '', access_token : '',  customer : {}};
           payload.jwtToken = jwttoken;
           payload.access_token = jwttoken;
           payload.customer = JSON.parse(customer);
           this.$store.commit('SET_CUSTOMER', payload);
           customer_authenticated = true;
         }
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
    ConfirmModal,
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
  public reorder_product:Record<any,any> = {};
  public selectedReorderImage = null;

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
  public cancel_confirm_message =  `Are you sure that you want to cancel this order?`

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

  public async cancelOrder(order:Record<any, any>){
    this.cancel_confirm_message = `<h3 class="text-primary">Order no: <strong class="font-weight-bold">${order.order_no}</strong></h3> Are you sure that you want to cancel this order?`
    const confirm_modal = (this.$refs['confirm_order_cancel'] as Record<any, any>);
    const confirm = await confirm_modal.showConfirm();

    if(confirm){
      this.showLoader = true;
      http.put(`customer-orders/cancel/${order.id}`).then(async (res:Record<any, any>) => {
        console.log('res', res.data)
        if(res.data.success){
          await this.getOrderDetail();
          this.showToast(res.data.message, 'success');
        }else{
          this.showToast('ERROR! Could not cancel the order, please try again.', 'error')
        }

        this.showLoader = false;
      })
    }
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

  reorder(order, order_item_id, reorder_product) {
    if(reorder_product && reorder_product.product_id) {
      let redirect_url = (this.company.customizer_page_url) ? `${this.company.company_domain}/${this.company.customizer_page_url}/#/?` :  `${this.company.company_domain}/#/?` ;
      redirect_url += `is_reorder=true&order_id=${order.id}&order_number=${order.order_no}&order_item_id=${order_item_id}&`
      redirect_url += `factory_product_id=${reorder_product.id}&active_product_id=${reorder_product.product_id}&`
      redirect_url += `style_id=${reorder_product.style_id}&design_id=${reorder_product.design_id}`;
      window.location.href = redirect_url;
    } else {
      this.showToast('Please select product.', 'error');
    }
  }

  makeReorderMessage(factory_product_id, factory_products) {
    let factory_product = factory_products.find(item => item.id == factory_product_id);
    let message = '';
    if(factory_product) {
      if(factory_product.reorder_data) {
        const reorder_data = factory_product.reorder_data;
        message = `Note: Reorder of order #${reorder_data.order_number} `;
        if(reorder_data.roster_change == true && reorder_data.design_change == true) {
          message += 'with design and roster changes.';
        } else if(reorder_data.roster_change == true && reorder_data.design_change == false) {
          message += 'with roster changes.';
        } else if(reorder_data.roster_change == false && reorder_data.design_change == true) {
          message += 'with design changes.';
        } else {
          message += 'with no modifications';
        }
      }
    }

    return message;
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

  updateOrderProducts(order_item: Record<any, any>, order_item_status_activity: number) {
    this.$store.dispatch('resetStore')
    const first_factory_product = order_item.factory_products[0];
    let self:Record<any, any> = this;
    let query_param_obj: Record<any, any> = {
      customized:true, personalized:true, active_product_type: 'order_product', active_product_id: first_factory_product.product_id,
      item_id: order_item.id, activity_id: order_item_status_activity, style_id :first_factory_product.style_id,
      design_id : first_factory_product.design_id, factory_product_active_index : 0, paginate: false
    }
    if(this.company.platform == "wordpress" || this.company.platfrom == "shopify") {
      const query_string = new URLSearchParams(query_param_obj).toString();
      window.location.href = `${this.company.company_domain}/customizer/#/?${query_string}`;
    } else {
      self.$router.push({ path: "/", query: query_param_obj });
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
                case "customer":
                  return "Customer";
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
.loader{
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  background: rgba(255,255,255,0.9);
  z-index: 1030;
  img{
    max-width: 7%;
    display: block;
    margin: 0 auto;
    height: auto;
  }
  [v-cloak] {
    display: none !important;
  }
}

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

    &+.feedback-text{
      border-top: 1px solid #ccc;
    }
  }

}

/* Reorder css */
.product-item {
  display: inline-block;
  margin-right: 20px; /* Adjust spacing between product items */
}
.product-item label {
  cursor: pointer;
}
.product-item img {
  width: 100px; /* Adjust image width as needed */
  height: 100px; /* Adjust image height as needed */
  border: 2px solid transparent;
}
.product-item img.selected {
  border-color: blue; /* Adjust border color as needed */
}
.product-item img.selected {
  border-color: blue; /* Adjust border color as needed */
}
.product-item img.disabled {
  cursor: not-allowed;
  opacity: 0.5; /* Adjust the opacity for disabled images as needed */
}
.reorder-button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>
