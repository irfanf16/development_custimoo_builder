<template>
    <div class="order-details-area">
        <div class="qty-area">
            <h2 class="fw-bold fz-18">Qty.</h2>
            <div class="qty-details" v-for="(roster,index) in rosterDetails" :key="index">
<!--                <div class="order-row">-->
<!--                    <div class="size">{{ roster.size }}</div>-->
<!--                    <div class="total-qty">{{ roster.quantity }}</div>-->
<!--                </div>-->
            </div>
            <div class="order-row total">
                <div class="total">Total</div>
                <div class="total-qty">{{ total }}</div>
            </div>
        </div>
<!--        <div class="choose-stuff">-->
<!--            <h2 class="fw-bold mb-3 fz-18 d-none d-lg-block">Choose Stuff</h2>-->
<!--            <div class="stuff-row">-->
<!--                <b-form-checkbox size="sm">Fight strap</b-form-checkbox>-->
<!--                <span class="charges">+$5</span>-->
<!--            </div>-->
<!--            <div class="stuff-row">-->
<!--                <b-form-checkbox size="sm">Embroidery</b-form-checkbox>-->
<!--                <span class="charges">+$15</span>-->
<!--            </div>-->
<!--            <div class="stuff-row">-->
<!--                <b-form-checkbox size="sm">Capt Patch</b-form-checkbox>-->
<!--                <span class="charges">+$50</span>-->
<!--            </div>-->
<!--        </div>-->
<!--        <div class="pricing-are">-->
<!--            <h2 class="fw-bold fz-18 d-none d-lg-block">Price</h2>-->
<!--            <div class="order-details">-->
<!--                <div class="order-row">-->
<!--                    <div class="order-text">-->
<!--                        Shipping &#38; Handling-->
<!--                    </div>-->
<!--                    <div class="cost-area">$20.00</div>-->
<!--                </div>12-->
<!--                <div class="order-row">-->
<!--                    <div class="order-text">-->
<!--                        Total VAT-->
<!--                    </div>-->
<!--                    <div class="cost-area">$16.00</div>-->
<!--                </div>-->
<!--                <div class="order-row">-->
<!--                    <div class="order-text">-->
<!--                        The Damage-->
<!--                    </div>-->
<!--                    <div class="cost-area">$152.95</div>-->
<!--                </div>-->
<!--                <div class="order-row total">-->
<!--                    <div class="order-text">-->
<!--                        Total-->
<!--                    </div>-->
<!--                    <div class="cost-area">$188.95</div>-->
<!--                </div>-->
<!--                <div class="order-row">-->
<!--                    <button class="btn btn-secondary fw-bold w-100">Buy Now</button>-->
<!--                </div>-->
<!--            </div>-->
<!--        </div>-->
    </div>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'

    @Component<OrderDetails>({})

    export default class OrderDetails extends Vue {
      get rosterDetails(): [Record<any, any>] {
        return this.$store.getters.getRosterDetails
      }
      get total():number{
        let total = 0;
        this.rosterDetails.forEach((item)=>{
          total = total + parseInt(item.quantity);
        })
        return total;
      }
    }
</script>
