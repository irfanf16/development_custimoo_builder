<template>
  <div id="app" class="container">
    <div class="row" style="margin-bottom: 60px">
      <div class="col-md-2" style="">
        <img src="../assets/images/custimoo_black_vertical.png" style="width: 200px; height: 30px" alt="Company Logo"
          class="logo mt-5">
      </div>
    </div>
    <div class="row">
      <!-- <div class="col-md-6">
        <div class="col-lg-12 mx-auto">
          <div class="p-5">
            <div>
              <form>
                <div class="mb-4" role="form">
                  <div>
                    <label for="card_number"  class="text-muted mb-1 d-block text-left">Card number</label>
                    <div class="position-relative">
                      <div class="input-with-image">
                        <input required="" v-model="card_number" @input="formatCardNumber"
                               maxlength="19" placeholder="XXXX XXXX XXXX XXXX"
                               :class="{ 'invalid-input': (!isValidCardNumber || !card_number) && formSubmitted }">
                      </div>
                    </div>
                  </div>
                  <div class="d-flex">
                    <div class="w-50">
                      <input required="" id="expiry_date" v-model="expiry_date" @input="formatExpiry"
                             :class="{ 'invalid-input': (!isValidExpiryDate || !expiry_date) && formSubmitted }"
                             maxlength="5"  class="border px-4 px-5 border-gray rounded-bottom border-top-0 p-2 py-2 px-4 w-100 focus:outline-none focus:ring-0" style="outline: none; box-shadow: none;" placeholder="MM / YY">
                    </div>
                    <div class="w-50">
                      <input required id="cvv" v-model="cvv" @input="validateCVV" maxlength="4" :class="{ 'invalid-input': (!isValidCVV || !cvv) && formSubmitted  }" class="border px-4 px-5 border-gray rounded-bottom border-left-0 border-top-0 p-2 py-2 px-4 w-100 focus:outline-none focus:ring-0"
                             style="outline: none; box-shadow: none;" placeholder="CVC">
                    </div>
                  </div>
                </div>
                <div class="mb-4">
                  <div class="position-relative">
                    <label for="cardName" class="text-secondary mb-1 d-block text-left">Card holder name</label>
                    <input id="cardholderName" v-model="cardholder_name" @input="validateCardholderName" :class="{ 'invalid-input': (!isValidCardholderName || !cardholder_name) && formSubmitted }" placeholder="John Doe"  class="w-100 rounded border border-gray px-4 py-2 focus:ring-0 focus:border-black no-outline">
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div> -->
      <div class="col-md-6 col-12 mx-auto">
        <div class="card" v-if="!paymentSuccess">
          <div>
            <div style="text-align: left">
              <p class="">Here's the deal:</p>
              <h2 v-if="subscription_detail?.amount" class="font-weight-bold text-dark" style="font-size: 32px">
                {{ subscription_detail.amount }} {{ subscription_detail.currency.toUpperCase() }}
                <span style="text-transform: capitalize;">{{ subscription_detail.billing_period }}</span>
              </h2>
            </div>
            <hr class="border-gray-300 my-4 lg:my-6 xl:my-8">
            <div class="d-flex justify-content-between">
              <p style="font-size: 18px; color: gray;" class="text-gray-500">
                {{ subscription_detail?.plan_name }}
              </p>
              <p style="font-size: 18px; color: gray;" class="text-gray-500 uppercase">
                {{ subscription_detail?.amount }} {{ subscription_detail?.currency.toUpperCase() }}
              </p>
            </div>
            <div class="mt-4">
              <button v-if="subscription_detail?.id" :disabled="showLoader" @click="subscribePayment"
                style="font-size: 22px"
                class="d-inline-flex justify-content-center align-items-center border rounded py-2 px-4 border-dark bg-dark text-white w-100">
                <span>Subscribe <img style="width: 20px; height: 20px" v-if="showLoader"
                    src="@assets/images/loading.gif" /></span>
              </button>
              <p v-if="subscription_detail?.discount" class="mt-4" style="font-size: 20px; color: black;">
                {{ subscription_detail?.discount }}{{ subscription_detail.coupon_type === 'percentage' ?
                  '%' : subscription_detail.currency.toUpperCase() }} discount
              </p>
              <p v-if="subscription_detail?.trial_days" class="mt-1" style="font-size: 20px; color: black;">
                Trial valid for: {{ `${subscription_detail?.trial_days > 1 ? subscription_detail?.trial_days + ' days' :
                  subscription_detail?.trial_days + ' day'}` }}
              </p>
              <p class="text-gray-400 text-sm mb-2 antialiased mt-4 text-center">
                By confirming your subscription, you allow Custimoo ApS to charge
                your card for this payment and future payments in accordance with their terms.
                You can always cancel your subscription.
              </p>
            </div>
          </div>
        </div>

        <div v-else class="text-center bg-success-light p-5">
          <h2 class="text-success h2 ">Payment Successful!</h2>
          <p class="mt-3">Thank you. You will be redirected shortly.</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { http } from "@/httpCommon";
import ErrorMessages from "@/mixins/ErrorMessages";
import { SubscriptionDetails, SubscriptionRequest } from "@/models/SubscriptionDetails";
import { Component, Mixins, Vue, Watch } from 'vue-property-decorator';

@Component<Payment>({
  components: {},
  async mounted() {
    
    this.showLoader = true;
    const hash = window.location.hash;
    const queryIndex = hash.indexOf('?');

    if (queryIndex !== -1) {
      const rawQuery = decodeURIComponent(hash.substring(queryIndex + 1));

      let paymentStatus = '';
      let sessionId = '';

      if (rawQuery.includes('payment_status=success&session_id=')) {
        const match = rawQuery.match(/payment_status=success&session_id=(.+)/);
        if (match) {
          paymentStatus = 'success';
          sessionId = match[1];
        }
      } else if (rawQuery.includes('payment_status=cancelled')) {
        paymentStatus = 'cancelled';
      }

      if (paymentStatus === 'success' && sessionId) {
        this.sessionId = sessionId;
        this.paymentSuccess = true;

        setTimeout(() => {
          this.$router.push({ name: 'home' });
        }, 3000);
        return;
      }

      if (paymentStatus === 'cancelled') {
        this.showToast("Payment was cancelled.", "warning");
      }
    }
    this.getPaymentData();
  }

})
export default class Payment extends Mixins(ErrorMessages) {

  // public card_number = ''
  // public expiry_date = ''
  // public cvv = ''
  // public cardholder_name = ''
  // public isValidCardNumber = true
  // public isValidExpiryDate = true
  // public isValidCVV = true
  // public isValidCardholderName = true
  // public formSubmitted = false

  // public subscription_status = false
  // public discount_days = 0
  // public plan_term_text = ''
  // public calculated_price = ''
  // public discount_text = ''
  // public plan_term: Record<any, any> = {}
  public paymentSuccess = false;
  public sessionId: string | null = null;

  public subscription_detail: SubscriptionDetails | null = null;
  public showLoader = false
  // @Watch('card_number')
  // onCardNumberChange(newValue: string, oldValue: string) {
  //   this.validateCardNumber();
  // }

  // @Watch('expiry_date')
  // onExpiryDateChange(newValue: string, oldValue: string) {
  //   this.validateExpiryDate();
  // }

  // public formatCardNumber(event) {
  //   let formattedValue = event.target.value.replace(/[^\d]/g, '');
  //   formattedValue = formattedValue.replace(/(\d{4})/g, '$1 ').trim();
  //   this.card_number = formattedValue;
  // }

  // public formatExpiry(event) {
  //   let formattedValue = event.target.value.replace(/[^\d]/g, '');
  //   if (formattedValue.length > 2) {
  //     formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2);
  //   }
  //   this.expiry_date = formattedValue;
  // }

  // public validateCardNumber() {
  //   const pattern = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/;
  //   this.isValidCardNumber = pattern.test(this.card_number);
  // }

  // public validateExpiryDate() {
  //   if (!this.expiry_date) {
  //     this.isValidExpiryDate = false;
  //     return;
  //   }

  //   const [month, year] = this.expiry_date.split('/').map(Number);

  //   const currentDate = new Date();
  //   const currentYear = currentDate.getFullYear() % 100;
  //   const currentMonth = currentDate.getMonth() + 1;

  //   this.isValidExpiryDate = year >= currentYear && year <= 99 && month >= 1 && month <= 12;

  //   if (year === currentYear) {
  //     this.isValidExpiryDate = this.isValidExpiryDate && month >= currentMonth;
  //   }
  // }

  // validateCVV() {
  //   const pattern = /^\d{3,4}$/;
  //   this.isValidCVV = pattern.test(this.cvv);
  // }

  // validateCardholderName() {
  //   const pattern = /^[a-zA-Z ]+$/;
  //   this.isValidCardholderName = pattern.test(this.cardholder_name);
  // }

  public async getPaymentData() {
    this.showLoader = true;
    await http.get<{ result: { company_subscription_detail: SubscriptionDetails; customer_id?: string; } }>('get-subscription-details').then((successResponse) => {
      let response_data = successResponse.data;
      if (response_data.result.company_subscription_detail) {
        this.subscription_detail = response_data.result.company_subscription_detail;
      }
    }).catch((errorResponse) => {
      this.showToast(errorResponse, 'error')
    }).finally(() => {
      this.showLoader = false;
    })
  }

  async subscribePayment() {
    //  this.formSubmitted = true;
    //   if (
    //     this.card_number &&
    //     this.expiry_date &&
    //     this.cvv &&
    //     this.cardholder_name &&
    //     this.isValidCardNumber &&
    //     this.isValidExpiryDate &&
    //     this.isValidCVV &&
    //     this.isValidCardholderName
    //   ){

    //     const form_data = {
    //       card_number: this.card_number.replace(/\s/g, ''), // Remove spaces from card number
    //       card_expiry_month: parseInt(this.expiry_date.split('/')[0]),
    //       card_expiry_year: parseInt(this.expiry_date.split('/')[1]),
    //       cvv: this.cvv,
    //       cardholder_name: this.cardholder_name
    //     };

    this.showLoader = true;
    let page_url = '#/payment';
    let payload: SubscriptionRequest = {
      cancel_url: `${page_url}?payment_status=cancelled`,
      success_url: `${page_url}?payment_status=success`,
      coupon_id: this.subscription_detail?.stripe_coupon_id ?? null,
      price_id: this.subscription_detail!.price_id,
      trial_days: this.subscription_detail!.trial_days ?? null
    }
    await http.post('create-subscription', payload).then((response) => {
      if (response.data) {
        window.location.href = response.data.result.company_subscription_detail.url;
      }
    }).catch((errorResponse) => {
      this.showLoader = false;
      this.showToast(errorResponse, 'error')
    })
    // }
    //else {
    // this.showToast('Card validation error', 'error')
    // }
    return;
  }
}
</script>

<style scoped>
.invalid-input {
  border: 1px solid red !important;
}

#custom-button {
  height: 30px;
  outline: 1px solid grey;
  background-color: green;
  padding: 5px;
  color: white;
}

#card-error {
  color: red;
}

.logo {
  display: block;
  margin: 20px auto;
  /* Add margin around the logo */
}

.card {
  background-color: rgb(248 248 248 / 1);
  padding: 2rem;
  border-radius: 0.5rem;
  border: none;
}

.logo {
  display: block;
  margin: 0 auto;
}

.form-container {
  margin-bottom: 20px;
}

.card-text {
  text-align: left;
  /* Align card text to the left */
}

.btn-subscribe {
  display: block;
  margin: 0 auto;
  /* Center the button */
}

.input-with-image {
  position: relative;
}

.input-with-image input {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 30px 8px 10px;
  /* Adjust padding to accommodate the image */
  width: 100%;
  box-sizing: border-box;
  outline: none;
  /* Remove default input focus outline */
}

.input-with-image img {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  height: 20px;
  /* Adjust height as needed */
}
</style>
