<template>
  <div class="page-wrapper m-lg-4" v-cloak>
    <div class="order-wrapper">
      <div class="d-flex justify-content-between align-items-center">
        <div class="fs-4 font-weight-bolder order-title p-2">Order # 12331</div>
<!--        <div class="fs-4 font-weight-bolder order-title p-2 chevron"><BIconChevronDown /></div>-->
      </div>

      <b-tabs content-class="mt-3">
        <b-tab :key="i" v-for="(item, i) in 3">
          <template #title>
            Factory {{item}}
          </template>

          <div class="order-flow">
            <div class="order-step active">
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
        </b-tab>
      </b-tabs>

      <div class="order-activities">
        <div class="activity-status">
          <div class="activity-icon">
            <BIconLightning />
          </div>

          <div class="activity-content">
            <div class="activity-title">
              Artwork Created
              <span class="date-time">
                  12-Feb-2022 14:40
                </span>
            </div>
            <div class="images-grid p-2 d-flex gap-1">
              <div class="d-flex flex-wrap gap-1">
                <img src="img/images/image-product.png" alt="" :key="item" v-for="item in 7">
              </div>
              <div class="actions">
                <button class="btn reject" @click="$modal.show('rejection-modal')"><BIconXSquareFill /></button>
                <button class="btn approve"><BIconCheckSquareFill /></button>
              </div>
            </div>

            <div class="p-2">
              <div class="comment-box d-flex gap-1">
              <span class="comment-avatar close"><BIconX /></span>
              <span class="comment-avatar">YR</span>
                <b-form-textarea rows="2" placeholder="Write your comment here..." />
                <button class="align-self-end btn btn-dark bordered">
                  <BIconChatDots />
                </button>
              </div>
            </div>

            <div class="comment-button text-left px-2" v-if="false">
              <a href="#!" class="text-info"><BIconChatDots /> Add comment</a>
            </div>
          </div>
        </div>
        <div class="activity-status">
          <div class="activity-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z"/>
              <path fill-rule="evenodd" d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z"/>
            </svg>
          </div>

          <div class="activity-content">
            <div class="activity-title">
              Artwork Rejected
              <span class="date-time">
                  12-Feb-2022 14:40
                </span>
            </div>
            <div class="image-feedback p-2">
              <div class="feedback-row d-flex flex-column">
                <div class="feedback-images">
                  <img src="img/images/image-product.png" alt="" :key="item" v-for="item in 7">
                </div>
                <div class="feedback-text fs-2">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci, consequuntur eos iusto omnis quia voluptate? Aliquam...
                </div>
              </div>
            </div>

            <div class="comment-button text-left px-2">
              <a href="#!" class="text-info"><BIconChatDots /> Add comment</a>
            </div>
          </div>
        </div>
        <div class="activity-status">
          <div class="activity-icon">
            <BIconCheck2 />
          </div>

          <div class="activity-content">
            <div class="activity-title">
              Artwork Approved
              <span class="date-time">
                12-Feb-2022 14:40
              </span>
            </div>
            <div class="activity-text p-2 fs-2 text-muted">
              Your artwork is approved by the factory.
            </div>

            <div class="comment-button d-flex text-left px-2 gap-2">
              <button class="btn btn-secondary fs-2"><BIconUpload class="mr-1" /> Upload Design Sample</button>
              <a href="#!" class="text-info align-self-end"><BIconChatDots /> Add comment</a>
            </div>

            <div class="comment-row px-2 pb-2 d-flex gap-1 mt-3">
              <div class="d-flex gap-1">
                <span class="comment-avatar">GY</span>
                <div class="comment-msg">
                  <div class="comment-action">
                    <button>
                      <BIconChevronDown />
                    </button>
                  </div>
                  Peyo da artwork c, saaleyo approve te karna e pena c taanu. 😏
                </div>
              </div>
              <div class="comment-time">
                12:30 PM
              </div>
            </div>

            <div class="comment-row px-2 pb-2 d-flex gap-1 mt-3">
              <div class="d-flex gap-1">
                <span class="comment-avatar" style="background: tomato">AN</span>
                <div class="comment-msg">
                  <div class="comment-quote">
                    Peyo da artwork c, saaleyo approve te karna e pena c taanu. 😏
                  </div>
                  <div class="comment-action">
                    <button>
                      <BIconChevronDown />
                    </button>
                  </div>
                  Ah g ku nai enj e gal ae, je taada artwork nai approve karna te fer kida karna ae. 🙇‍♂️🙇
                </div>
              </div>
              <div class="comment-time">
                12:30 PM
              </div>
            </div>
          </div>
        </div>
        <div class="activity-status">
          <div class="activity-icon">
            <BIconXDiamond />
          </div>

          <div class="activity-content">
            <div class="activity-title">
              Design Sample
              <span class="date-time">
                12-Feb-2022 14:40
              </span>
            </div>
            <div class="images-grid p-2 d-flex gap-1">
              <div class="d-flex flex-wrap gap-1">
                <img src="img/images/image-product.png" alt="" :key="item" v-for="item in 7">
              </div>
              <div class="actions" v-if="false">
                <button class="btn reject" @click="$modal.show('rejection-modal')"><BIconXSquareFill /></button>
                <button class="btn approve"><BIconCheckSquareFill /></button>
              </div>
            </div>

            <div class="comment-button text-left px-2">
              <a href="#!" class="text-info"><BIconChatDots /> Add comment</a>
            </div>
          </div>
        </div>
        <div class="activity-status">
          <div class="activity-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z"/>
              <path fill-rule="evenodd" d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z"/>
            </svg>
          </div>

          <div class="activity-content">
            <div class="activity-title">
              Design Sample Rejected
              <span class="date-time">
                  12-Feb-2022 14:40
                </span>
            </div>
            <div class="image-feedback p-2">
              <div class="feedback-row d-flex flex-column">
                <div class="feedback-images">
                  <img src="img/images/image-product.png" alt="" :key="item" v-for="item in 7">
                </div>
                <div class="feedback-text fs-2">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci, consequuntur eos iusto omnis quia voluptate? Aliquam...
                </div>
              </div>
            </div>

            <div class="comment-button d-flex text-left px-2 gap-2">
              <button class="btn btn-secondary fs-2"><BIconUpload class="mr-1" /> Upload Design Sample</button>
              <a href="#!" class="text-info align-self-end"><BIconChatDots /> Add comment</a>
            </div>
          </div>
        </div>
        <div class="activity-status">
          <div class="activity-icon">
            <BIconCheck2 />
          </div>

          <div class="activity-content">
            <div class="activity-title">
              Design Sample Approved
              <span class="date-time">
                12-Feb-2022 14:40
              </span>
            </div>
            <div class="activity-text p-2 fs-2 text-muted">
              Your design sample is approved by the customer.
            </div>

            <div class="comment-button d-flex text-left px-2 gap-2">
              <button class="btn btn-secondary fs-2"><BIconPrinter class="mr-1" /> Put In Production</button>
              <a href="#!" class="text-info align-self-end"><BIconChatDots /> Add comment</a>
            </div>

            <div class="comment-row px-2 pb-2 d-flex gap-1 mt-3">
              <div class="d-flex gap-1">
                <span class="comment-avatar">GY</span>
                <div class="comment-msg">
                  <div class="comment-action">
                    <button>
                      <BIconChevronDown />
                    </button>
                  </div>
                  Thanks for approving the sample design. 😊
                </div>
              </div>
              <div class="comment-time">
                12:30 PM
              </div>
            </div>

            <div class="comment-row px-2 pb-2 d-flex gap-1 mt-3">
              <div class="d-flex gap-1">
                <span class="comment-avatar" style="background: tomato">AN</span>
                <div class="comment-msg">
                  <div class="comment-quote">
                    Thanks for approving the sample design. 😊
                  </div>
                  <div class="comment-action">
                    <button>
                      <BIconChevronDown />
                    </button>
                  </div>
                  You Welcome buddy! 👍
                </div>
              </div>
              <div class="comment-time">
                12:30 PM
              </div>
            </div>
          </div>
        </div>
        <div class="activity-status">
          <div class="activity-icon">
            <BIconPrinter />
          </div>

          <div class="activity-content">
            <div class="activity-title">
              In Production
              <span class="date-time">
                12-Feb-2022 14:40
              </span>
            </div>
            <div class="activity-text p-2 fs-2 text-muted">
              Your artwork is in production.
            </div>

            <div class="comment-button d-flex text-left px-2 gap-2">
              <button class="btn btn-secondary fs-2"><BIconTruck class="mr-1" /> Enter Shipping Details</button>
              <a href="#!" class="text-info align-self-end"><BIconChatDots /> Add comment</a>
            </div>
          </div>
        </div>
        <div class="activity-status">
          <div class="activity-icon">
            <BIconTruck />
          </div>

          <div class="activity-content">
            <div class="activity-title">
              Order Shipped
              <span class="date-time">
                12-Feb-2022 14:40
              </span>
            </div>
            <div class="activity-text p-2 fs-2 text-muted">
              The shipping no is 530483849.
            </div>

            <div class="comment-button d-flex text-left px-2 gap-2">
              <button class="btn btn-secondary fs-2"><BIconCursor class="mr-1" /> Track Order</button>
              <a href="#!" class="text-info align-self-end"><BIconChatDots /> Add comment</a>
            </div>
          </div>
        </div>
        <div class="activity-status">
          <div class="activity-icon">
            <BIconCartCheck />
          </div>

          <div class="activity-content">
            <div class="activity-title">
              Order Completed
              <span class="date-time">
                12-Feb-2022 14:40
              </span>
            </div>
            <div class="activity-text p-2 fs-2 text-muted">
              The order is completed successfully.
            </div>

            <div class="comment-button d-flex text-left px-2 gap-2">
              <a href="#!" class="text-info align-self-end"><BIconChatDots /> Add comment</a>
            </div>
          </div>
        </div>
      </div>
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


@Component<Order>({
  components: {

  },
})

export default class Order extends Mixins() {

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
          display: flex;
          gap: 10px;
          img{
            height: 100px;
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

    textarea{
      border: none;
      resize: none;
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
  }

  .comment-row{
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
        white-space: nowrap;
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
