<template>
  <div class="p-2">
    <div class="comment-box">
      <template  v-if="action=='reply'">
        <div class="parent-message-section">
          {{comment_obj.message}}
          <div :key="`parent_message-${parent_object_file_index}`" v-for="(parent_object_file, parent_object_file_index) in comment_obj.files">
            <template v-if="['jpg', 'jpeg', 'png'].includes(parent_object_file.extension.toLowerCase())">
              <img :src="`${storage_url}${parent_object_file.url}`" :alt="parent_object_file.url">
            </template>
           <template v-if="['pdf', 'ai', 'eps', 'svg'].includes(parent_object_file.extension.toLowerCase())">
              <a :href="`${storage_url}${parent_object_file.url}`" target="_blank" :download="parent_object_file.name">
                <img width="50" height="50" src="/img/images/file.png" :alt="parent_object_file.name">
                <span>{{parent_object_file.name}}.{{parent_object_file.extension}}</span>
              </a>
            </template>
          </div>
        </div>
      </template>
      <div class="d-flex gap-1">
        <span class="comment-avatar close" @click="hideCommentBox"><BIconX/></span>
        <span class="comment-avatar">
          {{ (`${customer.first_name} ${customer.last_name}`) | initials }}
        </span>
        <b-form-textarea rows="2" placeholder="Write your comment here..."
                         v-model="comment_message"/>
        <div class="d-flex justify-content-end gap-1">
          <button class="align-self-end btn btn-dark bordered file-button">
            <input type="file" multiple @change="uploadFiles($event)" :disabled="adding_comment">
            <BIconPaperclip/>
          </button>
          <button class="align-self-end btn btn-dark bordered" @click="handleCommentAction" :disabled="adding_comment"
                  :title="adding_comment ? action == 'edit' ? 'Updating comment' : 'Adding comment' :  action == 'edit' ? 'Update comment' : 'Add new comment'">
            <b-icon-arrow-right-short scale="1.4"/>
          </button>
        </div>
      </div>

      <div class="mt-2 upload-images">
        <div :key="`comment_file_preview-${comment_file_index}`" v-for="(comment_file, comment_file_index) in comment_files">
          <span class="delete-image" @click="removeUploadedFile(comment_file_index)"><BIconXCircle/></span>
          <template v-if="['jpg', 'jpeg', 'png'].includes(comment_file.extension.toLowerCase())">
            <img :src="comment_file.file_preview" alt="">
          </template>
          <template v-if="['pdf', 'ai', 'eps', 'svg'].includes(comment_file.extension.toLowerCase())">
            <img src="/img/images/file.png" alt="" @click="previewPdf(comment_file)">
            <span>{{comment_file.name}}</span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {Component, Prop, Mixins} from 'vue-property-decorator'
import {handleResponseException, logData} from "@/helpers/Helpers";
import {http} from "@/httpCommon";
import moment from "moment";
import ErrorMessages from "@/mixins/ErrorMessages";


@Component<AddUpdateComment>({
  components: {

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

    }
  },
  created() {
    let self = this;
    if(self.comment_obj) {
      //if action type is edit then it means we are editing existing comment
      if(self.action == "edit") {
        self.comment_message = self.comment_obj.message;
        self.comment_obj.files.forEach((comment_obj_file: Record<any, any>) => {
          self.comment_files.push({
            file: comment_obj_file.url, file_preview: `${self.storage_url}${comment_obj_file.url}`, name: comment_obj_file.name, extension: comment_obj_file.extension
          })
        })
      } else if(self.action == "reply") { //if action type is reply then it means we are adding reply to existing comment
        self.parent_message = self.comment_obj.message;
        self.parent_message_id = self.comment_obj.id;
      }
    }
  }
})
export default class AddUpdateComment extends  Mixins(ErrorMessages) {
  /*
  * props section starts
  * */
  @Prop({required: false}) readonly comment_obj !: Record<any, any>
  @Prop({required: true}) readonly url !: string
  @Prop({required: false, default: 'add'}) readonly action !: string
  /*
  * props section ends
  * */

  /*
  * Store section start
  * */

  public customer =  this.$store.getters.getCustomer;

  /*
  * Store section ends
  * */

  /*
  * data section starts
  * */
  public storage_url = process.env.VUE_APP_STORAGE_URL
  public logData = logData;
  public comment_message:string|null = null;
  public comment_files: Record<any, any>[] = [];
  public removed_files: File[] = [];
  public parent_message: null|string= null;
  public parent_message_id: null|number = null;
  public adding_comment = false;
  /*
  * data section ends
  * */

  async uploadFiles(event: Record<any, any>) {
    let self = this;
    let uploaded_files = event.target.files;
    let allowed_file_types = ["jpg", "jpeg", "pdf", 'png', 'ai', 'eps', 'svg']
    let rejected_files = [];
    for (let uploaded_file of uploaded_files) {
      let file_name = uploaded_file.name;
      let file_extension = file_name.substring(file_name.lastIndexOf('.') + 1).toLowerCase();
      if(allowed_file_types.includes(file_extension)) {
        let file_preview = await self.createFilePreview(uploaded_file)
        self.comment_files.push({
          file: uploaded_file, file_preview: file_preview, name: file_name, extension: file_extension
        })
      } else {
        rejected_files.push(file_name)
      }
    }
    let rejected_files_length = rejected_files.length;
    if(rejected_files_length > 0) {
      console.warn(`Uploaded files(${rejected_files_length}) has been rejected. The rejected files are`+ rejected_files.toString())
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


  previewPdf(pdf_file_object: Record<any, any>) {
    const pdfWindow:Record<any,any>|null = window.open("");
    // let data = '<object data="' + pdf_file_object.file_preview + '" width="100%" height="100%">';
    let data = `<object data="${pdf_file_object.file_preview}" width="100%" height="100%">
                    <embed ng-srs="${pdf_file_object.file_preview}" width="100%" height="100%"></embed>
                </object>`;
    pdfWindow?.document.write(data);
  }

  async getPayloadData() {
    let self = this;
    let form_data = new FormData();
    if(self.comment_message) {
      form_data.append('message', self.comment_message);
    }
    self.comment_files.forEach((comment_file: Record<any, any>) => {
      //this check is due to that file can have string or file object. String will be in case when we user edit comment and we need to show existing file
      if (comment_file.file.constructor.name == "File") {
        form_data.append('files[]', comment_file.file);
      }
    });
    self.removed_files.forEach((removed_file: File) => {
      form_data.append('removed_files[]', removed_file);
    });
    if(self.parent_message_id) {
     if(self.parent_message) {
       form_data.append('parent_message', self.parent_message);
     }
      form_data.append('parent_message_id', self.parent_message_id.toString());
    }
    return form_data;
  }

  async handleCommentAction() {
    let self = this;
    if(self.comment_message || self.comment_files.length >0) {
      self.adding_comment = true;
      let form_data = await self.getPayloadData();
      http.post(self.url, form_data).then((successResponse: Record<any, any>) => {
        let response_data = successResponse.data;

        if(response_data.success == true) {
          self.$emit("commentActionCompleted", response_data.result.item_activity_comment);
          self.hideCommentBox();
        } else {
          self.showToast(response_data.message, "error")
        }
        self.adding_comment = false;

      }).catch((errorResponse: any) => {
        self.adding_comment = false;
        handleResponseException(errorResponse)
      })
    } else {
      alert("Can not add empty comment")
    }

  }


  removeUploadedFile(file_index: number) {
    let self = this;
    let remove_file = self.comment_files[file_index];
    //if removed file type is string then it means user is deleting existing file of comment and we remove it from database
    if(self.action == "edit" && remove_file.file.constructor.name == "String") {
      self.removed_files.push(self.comment_files[file_index].file)
    }
    self.comment_files.splice(file_index, 1);
  }

  hideCommentBox() {
    this.$emit('hideCommentBox')
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
