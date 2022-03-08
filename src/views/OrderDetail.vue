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
                  12-Feb-2022 14:40
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
                  <template v-if="item_status_activity.add_comment">
                    <div class="p-2">
                      <div class="comment-box">
                        <div class="d-flex gap-1">
                          <span class="comment-avatar close" @click="item_status_activity.add_comment = false"><BIconX/></span>
                          <span class="comment-avatar">{{ order.customer_name | initials }}</span>
                          <b-form-textarea rows="2" placeholder="Write your comment here..."
                                           v-model="item_status_activity.comment_object.message"/>
                          <div class="d-flex justify-content-end gap-1">
                            <button class="align-self-end btn btn-dark bordered file-button">
                              <input :id="`item_status_activity_${item_status_activity.id}_uploader`" type="file"
                                     multiple
                                     @change="uploadFiles($event, 'add' , item_status_activity)">
                              <BIconPaperclip/>
                            </button>
                            <button class="align-self-end btn btn-dark bordered"
                                    @click="addComment(item_status_activity)">
                              <BIconChatDots/>
                            </button>
                          </div>
                        </div>

                        <div class="mt-2 upload-images">
                          <div :key="`comment_file_preview-${comment_file_preview_index}`"
                               v-for="(comment_file_preview, comment_file_preview_index) in item_status_activity.comment_object.files">
                            <span class="delete-image"
                                  @click="removePreviewFileFrom('item_status_activity',item_status_activity.comment_object, comment_file_preview_index)"><BIconXCircle/></span>
                            <img :src="comment_file_preview.file_preview" alt="">
                          </div>
                        </div>
                      </div>
                    </div>

                  </template>
                  <template v-for="(activity_comment, activity_comment_index) in item_status_activity.comments">
                    <div class="comment-row px-2 pb-2 d-flex gap-1 mt-3" :key="`activity_comment_${activity_comment_index}`"
                         v-if="!activity_comment.edit_comment && !activity_comment.reply_comment">
                      <div class="d-flex gap-1">
                      <span class="comment-avatar">
                        {{ activity_comment.user ? `${activity_comment.user.first_name} ${activity_comment.user.last_name}` : "" | initials }}
                      </span>
                        <div class="comment-msg">
                          <div class="comment-action" style="right: -165px">
                            <ul class="fs-1 d-flex gap-2">
                              <li>
                                <a @click="activity_comment.reply_comment = !activity_comment.reply_comment">
                                  <BIconReply/>
                                  Reply
                                </a>
                              </li>
                              <li>
                                <a @click="editComment(activity_comment)">
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
                          <template v-for="(activity_comment_file, activity_comment_file_index) in activity_comment.files">
                            <img :key="`activity_comment_file_${activity_comment_file_index}`"
                                 :src="`${storage_url}${activity_comment_file.url}`" :alt="`${activity_comment_file.name}`" width="100">
                          </template>
                          {{ activity_comment.message }}
                        </div>
                      </div>
                      <div class="comment-time">
                        {{ activity_comment.created_at | formatDate('HH:mm Do MMM YY ') }}
                      </div>
                    </div>
                    <!--  edit comment starts -->
                    <template v-if="activity_comment.edit_comment">
                      <div class="p-2" :key="`activity_comment-edit-${activity_comment_index}`">
                        <div class="comment-box">
                          <div class="d-flex gap-1">
                            <span class="comment-avatar close"
                                  @click="activity_comment.edit_comment = !activity_comment.edit_comment"><BIconX/></span>
                            <span class="comment-avatar">{{ order.customer_name | initials }}</span>
                            <b-form-textarea rows="2" placeholder="Write your comment here..."
                                             v-model="activity_comment.edited_comment_object.message"/>
                            <div class="d-flex justify-content-end gap-1">
                              <button class="align-self-end btn btn-dark bordered file-button">
                                <input :id="`item_status_activity_${activity_comment.id}_uploader`" type="file" multiple
                                       @change="uploadFiles($event, 'edit', activity_comment)">
                                <BIconPaperclip/>
                              </button>
                              <button class="align-self-end btn btn-dark bordered"
                                      @click="updateComment(item_status_activity, activity_comment_index)">
                                <BIconChatDots/>
                              </button>
                            </div>
                          </div>
                          <div class="mt-2 upload-images">
                            <template
                              v-for="(edit_comment_file_preview, edit_comment_file_preview_index) in activity_comment.edited_comment_object.files">
                              <div :key="`edit_comment_file_preview-${edit_comment_file_preview_index}`">
                                <span class="delete-image"
                                      @click="removePreviewFileFrom('edit', activity_comment, edit_comment_file_preview_index)"><BIconXCircle/></span>
                                <img :src="`${edit_comment_file_preview.file_preview}`" alt="">
                              </div>
                            </template>
                          </div>
                        </div>
                      </div>
                    </template>
                    <!--  edit comment ends -->

                    <!--  add reply starts -->
                    <template v-if="activity_comment.reply_comment">
                      {{activity_comment.message}}
                      <template v-for="(parent_activity_comment_file, parent_activity_comment_file_index) in activity_comment.files">
                        <img :key="`parent_activity_comment_file_${parent_activity_comment_file_index}`"
                             :src="`${storage_url}${parent_activity_comment_file.url}`" :alt="`${parent_activity_comment_file.name}`" width="100">
                      </template>
                      <div class="p-2" :key="`activity_comment-reply-${activity_comment_index}`">
                        <div class="comment-box">
                          <div class="d-flex gap-1">
                            <span class="comment-avatar close"
                                  @click="activity_comment.reply_comment = !activity_comment.reply_comment"><BIconX/></span>
                            <span class="comment-avatar">{{ order.customer_name | initials }}</span>
                            <b-form-textarea rows="2" placeholder="Write your comment here..."
                                             v-model="activity_comment.reply_comment_object.message"/>
                            <div class="d-flex justify-content-end gap-1">
                              <button class="align-self-end btn btn-dark bordered file-button">
                                <input :id="`item_status_activity_${activity_comment.id}_uploader`" type="file" multiple
                                       @change="uploadFiles($event, 'reply', activity_comment)">
                                <BIconPaperclip/>
                              </button>
                              <button class="align-self-end btn btn-dark bordered"
                                      @click="addCommentReply(item_status_activity, activity_comment, activity_comment_index)">
                                <BIconChatDots/>
                              </button>
                            </div>
                          </div>
                          <div class="mt-2 upload-images">
                            <template
                              v-for="(reply_comment_file_preview, reply_comment_file_preview_index) in activity_comment.reply_comment_object.files">
                              <div :key="`reply_comment_file_preview-${reply_comment_file_preview_index}`">
                                <span class="delete-image"
                                      @click="removePreviewFileFrom('reply', activity_comment, reply_comment_file_preview_index)"><BIconXCircle/></span>
                                <img :src="`${reply_comment_file_preview.file_preview}`" alt="">
                              </div>
                            </template>
                          </div>
                        </div>
                      </div>
                    </template>
                    <!--  add reply ends -->

                  </template>
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
import {handleResponseException, logData} from "@/helpers/Helpers";
import moment from "moment";


@Component<OrderDetail>({
  mounted() {
    let self = this;
    self.getOrderDetail();
  },
  components: {},
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

  async addComment(item_status_activity: Record<any, any> ) {
    let self = this;
    self.handleActivityCommentAction("add", item_status_activity).then((successResponse: Record<any, any>) => {
      let response_data = successResponse.data;
      item_status_activity.comments.unshift(response_data.result.item_activity_comment);
      item_status_activity.add_comment = false
      item_status_activity.comment_object = self.getAddCommentDefaultObject()
    }).catch((errorResponse: any) => {
      handleResponseException(errorResponse)
    })
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

  editComment(activity_comment: Record<any, any>) {
    let self = this;
    activity_comment.edit_comment = !activity_comment.edit_comment
    activity_comment.edited_comment_object.message = activity_comment.message;
    activity_comment.edited_comment_object.files = [];
    if (activity_comment.files.length > 0) {
      activity_comment.files.forEach((activity_comment_file: Record<any, any>) => {
        //file_info key basically is used for storing uploaded files through input type file. As in case of editing comment we need to show existing files.
        // So in this case we will place string (file path) because in edit mode we have existing files paths instead of file objects.
        activity_comment.edited_comment_object.files.push({
          file_info: activity_comment_file.url,
          file_preview: `${self.storage_url}${activity_comment_file.url}`
        });
      })
    }
  }

  updateComment(item_status_activity: Record<any, any>, comment_index: number) {
    let self = this;
    let activity_comment = item_status_activity.comments[comment_index]
    self.handleActivityCommentAction("edit", activity_comment).then((successResponse: Record<any, any>) => {
      let response_data = successResponse.data;
      self.$set(item_status_activity.comments, comment_index, response_data.result.item_activity_comment)
    }).catch((errorResponse: any) => {
      handleResponseException(errorResponse)
    })
  }

  addCommentReply(item_status_activity:Record<any, any>,comment_object:Record<any, any>, comment_index: number) {
    let self = this;
    self.handleActivityCommentAction("reply", comment_object).then((successResponse: Record<any, any>) => {
      let response_data = successResponse.data;
      item_status_activity.comments.unshift(response_data.result.item_activity_comment);
      comment_object.reply_comment = false
      item_status_activity.reply_comment_object = {
        "message": null, "files": []
      }
    }).catch((errorResponse: any) => {
      handleResponseException(errorResponse)
    })
  }


  async handleActivityCommentAction(action: string, comment_container_object: Record<any, any>) {
    let item_activity_id = null;
    let url: null|string = null;
    let comment_message = null;
    let comment_files = [];
    let form_data = new FormData();
    //in case of add comment_container_object have order_item_activities table object
    if(action == "add") {
      item_activity_id = comment_container_object.id;
      url = `order_item/${item_activity_id}/comment`
      comment_message = comment_container_object.comment_object.message;
      comment_files = comment_container_object.comment_object.files;
    }
    //in case of edit comment_container_object have order_item_activity_comments table object
    else if (action == "edit") {
      //while editing comment append comment id that is going to be edited
      url = `order_item/${comment_container_object.order_item_activity_id}/comment/${comment_container_object.id}`;
      comment_container_object.edited_comment_object.removed_files.forEach((removed_file: string) => {
        form_data.append('removed_files[]', removed_file);
      })
      comment_message = comment_container_object.edited_comment_object.message;
      comment_files = comment_container_object.edited_comment_object.files;
    } else {
      //while editing comment append comment id that is going to be edited
      url = `order_item/${comment_container_object.order_item_activity_id}/comment/${comment_container_object.id}`;
      form_data.append("parent_message_id", comment_container_object.id);
      form_data.append("parent_message", comment_container_object.message);
      comment_message = comment_container_object.reply_comment_object.message;
      comment_files = comment_container_object.reply_comment_object.files;
    }
    form_data.append('message', comment_message);
    if (comment_files.length > 0) {
      comment_files.forEach((comment_file: Record<any, any>) => {
        //this check is due to that file_info can have string or file object. String will be in case when we user edit comment and we need to show existing file
        if (comment_file.file_info.constructor.name == "File") {
          form_data.append('files[]', comment_file.file_info);
        }
      });
    }

    return http.post(url, form_data);

  }

  //this method represents edited_comment_object column of Model OrderActivityComment. This column is dynamically added to work on frontend
  getDefaultEditedCommentObject() {
    return {
      message: null, files: [], removed_files: []
    }
  }

  async uploadFiles(event: Record<any, any>, type: string, files_container_object: Record<any, any>) {
    let self = this;
    //in case of add order_item_activity object is passed. In case of edit order_item_activity_comments object is passed
    let key_name = null;
    if(type == "add") {
      key_name = "comment_object"
    } else if(type == "edit") {
      key_name = "edited_comment_object"
    } else {
      key_name = "reply_comment_object"
    }
    let comment_files_container = files_container_object[key_name];
    let uploaded_files = event.target.files;
    for (let uploaded_file of uploaded_files) {
      let file_preview = await self.createFilePreview(uploaded_file)
      comment_files_container.files.push({file_info: uploaded_file, file_preview: file_preview})
    }
    event.target.files = null;
  }

  async createFilePreview(file: File) {
    let result_base64 = await new Promise((resolve) => {
      let fileReader = new FileReader();
      fileReader.onload = (e) => resolve(fileReader.result);
      fileReader.readAsDataURL(file);
    });
    return result_base64;
  }

  getAddCommentDefaultObject() {
    return {
      message: null,
      files: []
    }
  }


  public removePreviewFileFrom(type: string, files_container_object: Record<any, any>, file_index: number) {
    if (type == "item_status_activity") {
      files_container_object.files.splice(file_index, 1);
    } else if(type == "edit") { //in case of editing comment
      let file_info = files_container_object.edited_comment_object.files[file_index].file_info;
      //file_info contains string or file object. In case of string it will be the path of existing file. While in case of file object new file is uploaded.
      //So if file_info contains string then it means that comment existing file needs to be removed.
      if (file_info.constructor.name == "String") {
        files_container_object.edited_comment_object.removed_files.push(file_info);
      }
      files_container_object.edited_comment_object.files.splice(file_index, 1);
    }
  }

  public removeFileFromInput(input_id: string, index: number) {
    const data_transfer_object = new DataTransfer()
    const input = document.getElementById(input_id) as HTMLInputElement
    const {files} = input

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (index !== i)
        data_transfer_object.items.add(file) // here you exclude the file. thus removing it.
    }
    input.files = data_transfer_object.files // Assign the updates list
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
