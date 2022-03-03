<template>
  <div class="page-wrapper m-lg-4" v-cloak>
    <div class="order-wrapper" v-if="order">
      <div class="d-flex justify-content-between align-items-center">
        <div class="fs-4 font-weight-bolder order-title p-2">Order # {{order.order_no}}</div>
      </div>

      <b-tabs content-class="mt-3">
        <b-tab :key="`oi-${oiIdx}`" v-for="(order_item, oiIdx) in order.items">
          <template #title>
            {{order_item.factory_name}}
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
          <template v-for="(item_status_activity, isaIdx) in order_item.status_activities">
            <div class="activity-status" :key="`isa-${isaIdx}`">
              <div class="activity-icon">
                <BIconLightningFill />
              </div>

              <div class="activity-content">
                <div class="activity-title">
                  {{item_status_activity.status}}
                  <span class="date-time">
                  12-Feb-2022 14:40
                </span>
                </div>
                <div class="images-grid p-2 d-flex gap-1">
                  <div class="d-flex flex-wrap gap-1">
                    <template v-for="(activity_file, fuIdx) in item_status_activity.files">
                      <img :src="`${storage_url}${activity_file.url}`" alt="" :key="`fu-${fuIdx}`" >
                    </template>
                  </div>
                  <div class="actions">
                    <button class="btn reject" @click="$modal.show('rejection-modal')"><BIconXSquareFill /></button>
                    <button class="btn approve"><BIconCheckSquareFill /></button>
                  </div>
                </div>
                <div class="comment-button text-left px-2">
                  <a class="text-info" @click="item_status_activity.add_comment = !item_status_activity.add_comment"><BIconChatDots /> Add comment</a>
                </div>
                <template v-if="item_status_activity.add_comment">
                  <div class="p-2">
                    <div class="comment-box">
                      <div class="d-flex gap-1">
                        <span class="comment-avatar close"  @click="item_status_activity.add_comment = false"><BIconX /></span>
                        <span class="comment-avatar">{{order.customer_name | initials}}</span>
                        <b-form-textarea rows="2" placeholder="Write your comment here..." v-model="item_status_activity.comment_object.message"/>
                        <div class="d-flex justify-content-end gap-1">
                          <button class="align-self-end btn btn-dark bordered file-button">
                            <input :id="`item_status_activity_${item_status_activity.id}_uploader`" type="file" multiple @change="uploadFiles($event, item_status_activity)">
                            <BIconPaperclip />
                          </button>
                          <button class="align-self-end btn btn-dark bordered" @click="addComment(item_status_activity)">
                            <BIconChatDots />
                          </button>
                        </div>
                      </div>

                      <div class="mt-2 upload-images">
                        <div :key="`cfpIdx-${cfpIdx}`" v-for="(comment_file_preview, cfpIdx) in item_status_activity.comment_object.files">
                          <span class="delete-image" @click="item_status_activity.comment_object.files.splice(cfpIdx, 1)"><BIconXCircle /></span>
                          <img :src="comment_file_preview.file_preview" alt="">
                        </div>
                      </div>
                    </div>
                  </div>

                </template>
                <template v-for="(activity_comment, acIdx) in item_status_activity.comments">
                  <div class="comment-row px-2 pb-2 d-flex gap-1 mt-3" :key="`acIdx-${acIdx}`">
                    <div class="d-flex gap-1">
                      <span class="comment-avatar">
                        {{activity_comment.user ? `${activity_comment.user.first_name} ${activity_comment.user.last_name}`  : ""  | initials}}
                      </span>
                      <div class="comment-msg">
                        <div class="comment-action" style="right: -165px">
                          <ul class="fs-1 d-flex gap-2">
                              <li><a href="#!"><BIconReply /> Reply</a></li>
                              <li><a href="#!"><BIconPencil /> Edit</a></li>
                              <li><a href="#!"><BIconTrash /> Delete</a></li>
                          </ul>
                        </div>
                        <template v-for="(comment_file, cfIdx) in activity_comment.files">
                          <img :key="`cfIdx-${cfIdx}`" :src="`${storage_url}${comment_file.url}`" :alt="`${comment_file.name}`" width="100">
                        </template>
                        {{activity_comment.message}}
                      </div>
                    </div>
                    <div class="comment-time">
                      {{activity_comment.created_at | formatDate('HH:mm Do MMM YY ')}}
                    </div>
                  </div>
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
           name="rejection-modal" ref="rejection-modal" id="modal-center-lockerroom" size="xl" :hide-footer="true" title="Locker Room"
           @close="$store.commit('Change_Locker_Active_Tab', 0)">
      <div class="modal-header fs-4 d-flex justify-content-between p-3">
        <div class="font-weight-bold pl-1">
          Reject Artwork
        </div>
        <span class="modal-close cursor-pointer" @click="$modal.hide('rejection-modal')">
          <BIconX />
        </span>
      </div>

      <div class="d-flex align-items-center justify-content-between gap-1 py-4 px-3 m-auto">
        <div class="fs-5">
          <BIconChevronLeft />
        </div>
        <div>
          <img src="img/images/image-product.png" alt="" class="w-100">
        </div>
        <div class="fs-5">
          <BIconChevronRight />
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
import {handleResponseException} from "@/helpers/Helpers";
import moment from "moment";


@Component<OrderDetail>({
  mounted() {
    let self = this;
    self.getOrderDetail();
  },
  components: {

  },
  filters: {
    initials(value: string) {
      if(value) {
        let value_array = value.split(" ");

        // Select the first letter of the name
        let first_letter = value.charAt(0);
        let last_letter = "";
        if(value_array.length > 1) {
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
      if(!format) {
        format = "MM-DD-YYYY"
      }
      return moment(value).format(format)
    }
  }
})

export default class OrderDetail extends Mixins() {
  public storage_url = process.env.VUE_APP_STORAGE_URL
  private order_id =  this.$route.params.order_id;
  private order = null;

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
    let comment_object = item_status_activity.comment_object;
    if(comment_object.message) {
      let form_data = new FormData();
      form_data.append('message', comment_object.message);
      if(comment_object.files.length > 0 ) {
        comment_object.files.forEach((comment_file: Record<any, any>) => {
          form_data.append('files[]', comment_file.file_info);
        });
      }
      let url = `order_item/${item_status_activity.id}/add_comment`
      http.post(url, form_data)
        .then((successResponse: Record<any, any>) => {
          let response_data = successResponse.data;
          item_status_activity.comments.unshift(response_data.result.item_activity_comment);
          item_status_activity.comment_object = self.getAddCommentDefaultObject()
        }).catch((errorResponse: any) => {
        handleResponseException(errorResponse)
      });
    } else {
      alert("Can not send empty message");
    }
  }

  async uploadFiles(event: Record<any, any>, item_status_activity: Record<any, any> ) {
    let self = this;
    let uploaded_files = event.target.files;
    for(let uploaded_file of uploaded_files) {
      let file_preview = await self.createFilePreview(uploaded_file)
      item_status_activity.comment_object.files.push({file_info: uploaded_file, file_preview: file_preview})
    }
    event.target.files = null;
  }

  async createFilePreview(file:File) {
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


  public removePreviewFile(item_status_activity: Record<any, any>, file_index: number) {
    item_status_activity.comment_object.files.splice(file_index, 1);
    let input_id = `item_status_activity_${item_status_activity.id}_uploader`;

  }

  public removeFileFromInput(input_id: string, index: number) {
    const data_transfer_object = new DataTransfer()
    const input = document.getElementById(input_id) as HTMLInputElement
    const { files } = input

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
@mixin avatar{
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

.order-wrapper{
  padding: 10px;
  background: #efefef;

  .order-title{
    text-align: left;
  }

  .chevron{
    transform: rotate(-180deg);
    transition: 0.3s all ease;
  }
  .collapsed{
    .chevron{
      transform: rotate(0deg);
    }
  }

  .order-activities{
    background: #fff;
    border: 1px solid #ddd;
    padding: 0.75rem 1rem;
    text-align: left;
    border-radius: 5px;

    .activity-icon{
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

    .activity-status{
      display: flex;
      align-items: flex-start;
      position: relative;

      &:after{
        content: "";
        background: #219F84;
        display: block;
        position: absolute;
        width: 1px;
        left: 20px;
        top: 40px;
        bottom: -2rem;
      }

      &+.activity-status{
        margin-top: 2rem;
      }

      &:last-child{
        &:after{
          display: none;
        }
      }

      &.active{
        .activity-icon{
          background: #219F84;
          color: #fff;
        }
      }
      .activity-content{
        max-width: 100%;

        .activity-title{
          padding-left: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          margin-top: 0.5rem;

          .date-time{
            color: #999;
            margin-left: 5px;
            font-weight: normal;
            font-size: smaller;
            white-space: nowrap;
          }
        }

        .images-grid{
          .actions{
            display: inline-flex;
            align-items: flex-start;
            gap: 7px;

            button{
              padding: 0;
              border: none;
              font-size: 1.3rem;
              transition: 0.2s ease all;

              &:hover{
                opacity: 0.85;
              }

              &.reject{
                color: #D53943;
              }
              &.approve{
                color: #219F84;
              }
            }
          }
          img{
            height: 150px;
            border-radius: 4px;

            @media (max-width: 600px){
              height: auto;
              width: calc(50% - 0.5rem);
            }
          }
        }
      }

      .feedback-row{
        padding: 0.5rem 0.7rem;
        display: inline-flex;
        gap: 0.7rem;
        background: #E1E6EA;
        border-radius: 5px;
        flex-shrink: 0;
        transition: 0.2s ease all;
        cursor: pointer;

        &:hover{
          box-shadow: inset 0 0 0 1000px rgba(0,0,0,0.1);
        }

        .feedback-images{
          img{
            height: 100px;

            @media (max-width: 600px){
              height: auto;
              width: calc(33.333333% - 0.34rem);
            }
          }
        }
      }
    }
  }

  .comment-box{
    width: 100%;
    max-width: 600px;
    background: #efefef;
    padding:0.7rem;
    border-radius: 5px;
    border: 1px solid #e6e6e6;
    position: relative;

    @media (max-width: 600px) {
      flex-direction: column;
    }

    textarea{
      border: none;
      resize: none;

      @media (max-width: 600px) {
        height: 110px;
        font-size: 1rem;
      }
    }

    .comment-avatar{
      @include avatar;

      &.close{
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

    button{
      flex-shrink: 0;
    }

    .upload-images{
      display: flex;
      gap: 7px;
      max-width: 100%;
      overflow-x: auto;

      &>div{
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80px;
        border-radius: 5px;
        overflow: hidden;
        position: relative;
        flex-shrink: 0;

        .delete-image{
          position: absolute;
          z-index: 100;
          top: 1px;
          right: 3px;
          cursor: pointer;
        }

        img{
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 100%;
        }
      }
    }
  }

  .comment-row{
    max-width: 100%;

    @media (max-width: 600px) {
      flex-direction: column;
    }

    .comment-avatar{
      @include avatar;
      background: #42b983;
    }

    .comment-msg{
      background: #E1E6EA;
      padding: 0.5rem 1.5rem 0.5rem 0.7rem;
      border-radius: 5px;
      display: flex;
      flex-direction: column;
      position: relative;
      width: 100%;
      flex-shrink: 1;
      max-width: 800px;

      .comment-action{
        position: absolute;
        right: 5px;
        top: 3px;

        button{
          padding: 0;
          border: none;
          background: none;
        }
      }

      .comment-quote{
        background: rgba(255,255,255,0.9);
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

    .comment-time{
      text-align: right;
      font-size: 0.9em;
      white-space: nowrap;
      color: rgba(0,0,0,0.4);
      align-self: flex-end;
    }
  }
}
</style>
