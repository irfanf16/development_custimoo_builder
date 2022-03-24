<template>
  <modal name="orderChat" class="orderChat" :width="1000"
           :resizable="true"
           :scrollable="true"
           height="auto"
           :reset="true"
            >
      <div class="modal-header d-flex w-100 align-items-center justify-content-between">
        <span class="fs-3 font-weight-bold">Order ID: 235354</span>
        <span class="fs-5 font-weight-bold cursor-pointer modal-close" @click="hide"><BIconX /></span>
      </div>
      <div class="modal-body">
        <b-tabs id="page-content">
          <template v-for="(factory, ind) in items">
          <b-tab :title="`Factory ${factory.factory_name}`" :key="ind">
            <div class="d-flex align-items-stretch factory-chat">
              <div class="padding w-100">
                <div class="d-flex justify-content-center w-100">
                  <div class="w-100">
                    <div class="ps-container ps-theme-default ps-active-y theme-scroll chat-content" style="overflow-y: scroll !important; height:400px !important;">
                      <template v-if="factory.messages">
                      <template  v-for="(message, i) in JSON.parse(factory.messages.messages)">
                        <div  class="media media-chat" :key="`message-${i}`" :class="message.from  == 'factory' ? 'media-chat-reverse':''">
                        <img class="avatar" src="https://img.icons8.com/color/36/000000/administrator-male.png" alt="...">
                        <div class="media-body">
                          <div class="message">
                            <template v-if="message">
                              {{ message.message }}
                            </template>
                            <template  v-for="(urls, inn) in message.file_urls" >
                            <div v-if="message.file_urls" class="attachments theme-scroll-h" :key="`file-${inn}`">
                              <img width="100" height="100" :src="storageUrl+urls.url" alt="">
                            </div>
                            </template>
                          </div>
                          <!--                  <p class="meta"><time datetime="2018">23:58</time></p>-->
                        </div>
                      </div>
                      </template>
                      </template>

                      <div class="ps-scrollbar-x-rail" style="left: 0px; bottom: 0px;">
                        <div class="ps-scrollbar-x" tabindex="0" style="left: 0px; width: 0px;"></div>
                      </div>
                      <div class="ps-scrollbar-y-rail" style="top: 0px; height: 0px; right: 2px;">
                        <div class="ps-scrollbar-y" tabindex="0" style="top: 0px; height: 2px;"></div>
                      </div>
                    </div>
                    <div class="publisher bt-1 border-light">
                      <img class="avatar avatar-xs" src="https://img.icons8.com/color/36/000000/administrator-male.png" alt="...">
                      <input class="publisher-input" v-on:keyup.enter="sendMessage(factory, ind)" v-model="text" type="text" placeholder="Write something">
                      <!--              <span class="publisher-btn file-group"><i class="fa fa-paperclip file-browser"></i>-->
                      <button class="attach-file">
                        <BIconPaperclip />
                        <input  type="file"  @change="uploadImage" multiple>
                      </button>
                      <!--              </span>-->
                      <a @click="sendMessage(factory, ind)"  class="publisher-btn text-info" data-abc="true"><i class="fa fa-paper-plane"></i></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </b-tab>
          </template>
        </b-tabs>
      </div>
    </modal>
</template>

<script lang="ts">
import {Component, Mixins, Vue} from "vue-property-decorator";
import {http} from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";

@Component<OrderChat>({
  mounted(){
    console.log("customer", this.customer.id)
    window.Echo.channel(`customer_factory_chat.${this.customer.id}`).listen('SendMessageEvent',  (e: Record<any,any>) => {
      console.log(e.content)
      let fact_id = e.content.fact_id
      let ind = this.items.findIndex((item:Record<any, any>)=> item.factory_id == fact_id)
      if (ind != -1){
        console.log(ind)
        Vue.set(this.items[ind] , 'messages', e.content)
      }
    })
  }
})
export default class OrderChat extends Mixins(ErrorMessages) {
  public order_id = 0
  private screenWidth = (window.screen.availWidth - 100)
  private storageUrl = process.env.VUE_APP_STORAGE_URL
  public customer_id = 0
  public items:Record<any, any> = []
  public messages:any[] = []
  public text = ''
  public fileObject: Record<any, any> = {}
  public files: Record<any, any> = []
  get customer():Record<any, any>{
    return  this.$store.getters.getCustomer
  }

  public async show(oid:number, cid:number, items:Record<any, any>){
    this.order_id = oid
    this.customer_id = cid
    if (items.status == 200){
      this.items = items.data.messages
    }
    this.$modal.show('orderChat')
  }
  // public getChat(oid:number){
  //
  // }
  public hide(){
    this.$modal.hide('orderChat')
  }
  public async sendMessage(facotry:Record<any, any>, ind:number) {

    if (this.text || this.fileObject.name){
      let user_id = 0
      if (facotry){
        console.log(facotry)
        user_id = facotry.user_id
      }
      let message = {
        from:'customer',
        message: this.text
      }
      let fd = new FormData()
      let header = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
      fd.append( 'files', this.fileObject as Blob)
      fd.append('order_id', this.order_id)
      fd.append('customer_id', this.customer_id)
      fd.append('message', message.message)
      fd.append('from', message.from)
      fd.append('user_id', user_id)
      const res = await http.post('chat/send', fd, header)
      if (res.status == 201){
        Vue.set(this.items[ind] , 'messages', res.data.message)
        this.text = ''
        this.fileObject = {}
        user_id = 0
      }
    }else{
      this.showError("Please input something")
    }
  }
  public uploadImage(e: any) {
    this.fileObject = e.target.files[0];
  }

}
</script>

<style scoped lang="scss">
body {
  background-color: #f9f9fa
}

.card-header>*:last-child {
  margin-right: 0
}

.card-header>* {
  margin-left: 8px;
  margin-right: 8px
}

.ps-container {
  position: relative
}

.ps-container {
  -ms-touch-action: auto;
  touch-action: auto;
  overflow: hidden !important;
  -ms-overflow-style: none
}

.media-chat {
  padding-right: 64px;
  margin-bottom: 0
}

.media {
  padding: 16px 12px;
  -webkit-transition: background-color .2s linear;
  transition: background-color .2s linear
}

.media .avatar {
  flex-shrink: 0
}

.avatar {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 36px;
  line-height: 36px;
  text-align: center;
  border-radius: 100%;
  background-color: #f5f6f7;
  color: #8b95a5;
  text-transform: uppercase
}

.media-chat .media-body {
  -webkit-box-flex: initial;
  flex: initial;
  display: table
}

.media-body {
  min-width: 0
}

.media-chat .media-body .message {
  position: relative;
  padding: 6px 8px;
  margin: 4px 0;
  background-color: #f5f6f7;
  border-radius: 3px;
  font-weight: 100;
  color: #9b9b9b
}

.media>* {
  margin: 0 8px
}

.media-chat .media-body .message.meta {
  background-color: transparent !important;
  padding: 0;
  opacity: .8
}

.media-meta-day {
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  align-items: center;
  margin-bottom: 0;
  color: #8b95a5;
  opacity: .8;
  font-weight: 400
}

.media {
  padding: 16px 12px;
  -webkit-transition: background-color .2s linear;
  transition: background-color .2s linear
}

.media-meta-day::before {
  margin-right: 16px
}

.media-meta-day::before,
.media-meta-day::after {
  content: '';
  -webkit-box-flex: 1;
  flex: 1 1;
  border-top: 1px solid #ebebeb
}

.media-meta-day::after {
  content: '';
  -webkit-box-flex: 1;
  flex: 1 1;
  border-top: 1px solid #ebebeb
}

.media-meta-day::after {
  margin-left: 16px
}

.media-chat.media-chat-reverse {
  padding-right: 12px;
  padding-left: 64px;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: reverse;
  flex-direction: row-reverse
}

.media-chat {
  padding-right: 64px;
  margin-bottom: 0
}

.media {
  padding: 16px 12px;
  -webkit-transition: background-color .2s linear;
  transition: background-color .2s linear
}

.media-chat.media-chat-reverse .media-body .message {
  float: right;
  clear: right;
  background-color: #1e8f77;
  color: #fff;
}

.media-chat .media-body .message {
  position: relative;
  padding: 6px 8px;
  margin: 4px 0;
  background-color: #f5f6f7;
  border-radius: 3px;
  text-align: left;
  max-width: 600px;
}

.media-chat .media-body .message .attachments {
  display: flex;
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid rgba(0,0,0,0.1);
  width: 100%;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 7px;
}
.media-chat .media-body .message .attachments img{
  border-radius: 5px;
}

.media-chat.media-chat-reverse .media-body .message .attachments {
  flex-direction: row-reverse;
}

.border-light {
  border-color: #f1f2f3 !important
}

.bt-1 {
  border-top: 1px solid #ebebeb !important
}

.publisher {
  position: relative;
  display: -webkit-box;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  padding: 12px 20px;
  background-color: #f9fafb
}

.publisher>*:first-child {
  margin-left: 0
}

.publisher>* {
  margin: 0 8px
}

.publisher-input {
  -webkit-box-flex: 1;
  flex-grow: 1;
  border: none;
  outline: none !important;
  background-color: transparent
}

button,
input,
optgroup,
select,
textarea {
  font-family: Roboto, sans-serif;
  font-weight: 300
}

.publisher-btn {
  background-color: transparent;
  border: none;
  color: #8b95a5;
  font-size: 16px;
  cursor: pointer;
  overflow: -moz-hidden-unscrollable;
  -webkit-transition: .2s linear;
  transition: .2s linear
}

.file-group {
  position: relative;
  overflow: hidden
}

.publisher-btn {
  background-color: transparent;
  border: none;
  color: #cac7c7;
  font-size: 16px;
  cursor: pointer;
  overflow: -moz-hidden-unscrollable;
  -webkit-transition: .2s linear;
  transition: .2s linear
}

.file-group input[type="file"] {
  position: absolute;
  opacity: 0;
  z-index: -1;
  width: 40px
}

.text-info {
  color: #219F84 !important
}

.orderChat{
  .modal-body{
    //background: #eee;
    padding: 0;
  }

  .attach-file{
    border: none;
    background: transparent;
    color: #219F84;
    position: relative;
    height: 25px;
    width: 20px;
    overflow: hidden;
    padding: 0 30px 0 0;
    //background: red;
    font-size: 1.2rem;
    border-right: 1px solid rgba(0,0,0,0.1);

    input{
      position: absolute;
      appearance: none;
      height: 1000px;
      width: 1000px;
      opacity: 0;
      top: 0;
      left: 0;
      cursor: pointer;
    }
  }
}

.factory-listing{
  min-width: 250px;
  background: #fff;
  text-align: left;

  .list-heading{
    font-size: 1.2rem;
  }
}
</style>
