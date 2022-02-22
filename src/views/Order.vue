<template>
  <div class="page-wrapper m-lg-4" v-cloak>

    <div class="order-wrapper">
      <div class="d-flex justify-content-between align-items-center" v-b-toggle.accordion-0>
        <div class="fs-4 font-weight-bolder order-title p-2">
          {{ order.created_at | reformDate }}
          Order  {{ order.order_no }}
          {{order.product_names ? order.product_names : ''}}
        </div>
        <div class="fs-4 font-weight-bolder order-title p-2 chevron"><BIconChevronDown /></div>
      </div>
      <b-collapse :id="`accordion-${index}`" accordion="my-accordion" role="tabpanel">
        <b-tabs content-class="mt-3">
          <template v-if="order">
            <b-table striped hover :fields="items" :items="order.factories">

            </b-table>
          </template>
        </b-tabs>

        <div class="order-activities">
          <div class="activity-status active">
            <div class="activity-icon">
              <BIconLightningFill />
            </div>

            <div class="activity-content">
              <div class="activity-title">
                Order Created
                <span class="date-time">
                  12-Feb-2022 14:40
                </span>
              </div>
              <div class="images-grid p-2 d-flex gap-1">
                <div class="d-flex flex-wrap gap-1">
                  <img src="img/images/image-product.png" alt="">
                  <img src="img/images/image-product.png" alt="">
                  <img src="img/images/image-product.png" alt="">
                  <img src="img/images/image-product.png" alt="">
                  <img src="img/images/image-product.png" alt="">
                  <img src="img/images/image-product.png" alt="">
                </div>
                <div class="actions">
                  <button class="btn reject" @click="$modal.show('rejection-modal')"><BIconXSquareFill /></button>
                  <button class="btn approve"><BIconCheckSquareFill /></button>
                </div>
              </div>
            </div>
          </div>
          <div class="activity-status active">
            <div class="activity-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z"/>
                <path fill-rule="evenodd" d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z"/>
              </svg>
            </div>

            <div class="activity-content">
              <div class="activity-title">
                Order Rejected
                <span class="date-time">
                  12-Feb-2022 14:40
                </span>
              </div>
              <div class="image-feedback d-flex flex-wrap p-2 gap-1">
                <div class="feedback-row" :key="item" v-for="item in 3">
                  <div class="feedback-image">
                    <img src="img/images/image-product.png" alt="">
                  </div>
                  <div class="feedback-text">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci, consequuntur eos iusto omnis quia voluptate? Aliquam...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </b-collapse>
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

import {Component, Mixins, Prop, Vue} from 'vue-property-decorator'
import moment from "moment";
Vue.filter('reformDate', function(value:string) {
  if (value) {
    return moment(value).format('MM/DD/YYYY')
  }
})

@Component<Order>({
  components: {

  },
})

export default class Order extends Mixins() {
  @Prop({required: true}) order!: Record<any, any>
  @Prop({required: true}) index!: number
  public items:Record<any, any>=[
    {key: 'name', label: 'Factory Name'},
    {key: 'actions', label: 'Order Detail'},]
}
</script>

<style lang="scss" scoped>
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
        max-width: 300px;
        flex-shrink: 0;
        transition: 0.2s ease all;
        cursor: pointer;

        &:hover{
          box-shadow: inset 0 0 0 1000px rgba(0,0,0,0.1);
        }

        .feedback-image{
          img{
            height: 100px;
          }
        }
      }
    }
  }
}
</style>
