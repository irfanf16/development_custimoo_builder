<template>
  <div class="page-wrapper m-lg-4" v-cloak>
    <div class="order-wrapper" v-if="order">
      <div class="d-flex justify-content-between align-items-center">
        <div class="fs-4 font-weight-bolder order-title p-2">Order # {{ order.order_no }}</div>
      </div>
      <b-tabs content-class="mt-3">
        <b-tab :key="`order_item_${order_item_index}`" v-for="(order_item, order_item_index) in order.items">
          <template #title>
            {{ order_item.factory_name }}
          </template>

          <div class="order-flow">
            <div class="order-step" :class="order_item.status == 'created' ? 'active' : ''">
              Order<br>Created
            </div>
            <div class="order-step">
              Artwork<br>Approval
            </div>
            <div class="order-step">
              Sample<br>Design
            </div>
            <div class="order-step">
              In<br>Production
            </div>
            <div class="order-step">
              Order<br>Shipped
            </div>
            <div class="order-step">
              Order<br>Completed
            </div>
          </div>
          <div class="order-activities">
            <template v-for="(item_status_activity, item_status_activity_index) in order_item.status_activities">
              <div class="activity-status" :key="`item_status_activity_${item_status_activity_index}`">
                <div class="activity-icon">
                  <BIconLightningFill/>
                </div>

                <div class="activity-content">
                  <div class="activity-title">
                    {{ item_status_activity.message }}
                    <span class="date-time">
                  {{ item_status_activity.created_at | formatDate('HH:mm Do MMM YY ')  }}
                </span>
                  </div>
                  <div class="images-grid p-2 d-flex gap-1">
                    <div class="d-flex flex-wrap gap-1">
                      <template v-for="(activity_item) in item_status_activity.activity_items">
                        <template v-for="(activity_file, activity_file_index) in activity_item.activity_files">
                          <img :src="`${storage_url}${activity_file.url}`" alt=""
                               :key="`activity_file_${activity_file_index}-${activity_file.name}`">
                        </template>

                      </template>
                    </div>
                    <div class="actions">
                      <button class="btn reject" @click="$modal.show('rejection-modal')">
                        <BIconXSquareFill/>
                      </button>
                      <button class="btn approve">
                        <BIconCheckSquareFill/>
                      </button>
                    </div>
                  </div>
                  <div class="comment-button text-left px-2">
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
                        <div class="comment-msg">
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
                                <a @click="activity_comment.edit_comment = !activity_comment.edit_comment">
                                  <BIconPencil/>
                                  Edit
                                </a>
                              </li>
                              <li>
                                <a @click="deleteComment(activity_comment,item_status_activity)">
                                  <BIconTrash/>
                                  Delete
                                </a>
                              </li>
                            </ul>
                          </div>
                        <!-- Comment action buttons ends -->

                          <blockquote class="blockquote mb-0">
                            <footer class="blockquote-footer" v-if="activity_comment.parent_message_id">
                              <cite title="Source Title">{{ activity_comment.parent_message }}</cite>
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
                          <p> {{ activity_comment.message }}</p>

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
                                      v-on:commentActionCompleted="handleCommentActionCompleted($event, item_status_activity, activity_comment_index)"
                                      :comment_obj="activity_comment" :url="`order_item/${item_status_activity.id}/comment`"
                    ></AddUpdateComment>
                    <!--  add reply ends -->

                  </template>
                  <!-- Comment listing ends -->
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
           name="rejection-modal" ref="rejection-modal" id="modal-center-lockerroom" size="xl" :hide-footer="true"
           title="Locker Room"
           @close="$store.commit('Change_Locker_Active_Tab', 0)">
      <div class="modal-header fs-4 d-flex justify-content-between p-3">
        <div class="font-weight-bold pl-1">
          Reject Artwork
        </div>
        <span class="modal-close cursor-pointer" @click="$modal.hide('rejection-modal')">
          <BIconX/>
        </span>
      </div>

      <div class="d-flex align-items-center justify-content-between gap-1 py-4 px-3 m-auto">
        <div class="fs-5">
          <BIconChevronLeft/>
        </div>
        <div>
          <img src="img/images/image-product.png" alt="" class="w-100">
        </div>
        <div class="fs-5">
          <BIconChevronRight/>
        </div>
      </div>

      <div class="p-4 text-left">
        <div class="fs-4">Write your feedback</div>
        <div class="mt-2">
          <b-textarea placeholder="Please write your feedback here..." rows="5"></b-textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary light" @click="$modal.hide('rejection-modal')">Cancel</button>
        <button class="btn btn-secondary">Reject</button>
      </div>
    </modal>
  </div>
</template>

<script lang="ts">

import {Component, Mixins} from 'vue-property-decorator'
import {http} from "@/httpCommon";
import {handleResponseException, logData, pathInfo} from "@/helpers/Helpers";
import AddUpdateComment from "@/components/AddUpdateComment.vue";
import moment from "moment";


@Component<OrderDetail>({
  mounted() {
    let self = this;
    self.getOrderDetail();
  },
  components: {
    AddUpdateComment
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

export default class OrderDetail extends Mixins() {
  public storage_url = process.env.VUE_APP_STORAGE_URL
  private order_id = this.$route.params.order_id;
  private order = null;
  public logData = logData

  getOrderDetail() {
    let self = this;
    let url = `order/${self.order_id}`
    http.get(url)
      .then((successResponse: Record<any, any>) => {
        let response_data = successResponse.data;
        self.order = response_data.result;
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

            button {
              padding: 0;
              border: none;
              font-size: 1.3rem;
              transition: 0.2s ease all;

              &:hover {
                opacity: 0.85;
              }

              &.reject {
                color: #D53943;
              }

              &.approve {
                color: #219F84;
              }
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
</style>
