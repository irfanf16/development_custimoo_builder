export interface SubscriptionDetails {
    id: number
    company_id: number
    plan_name: string
    plan_description: any
    plan_images: any
    pricing_type: string
    price_id: string
    amount: string
    currency: string
    billing_period: string
    custom_interval_days: number
    trial_days: number
    stripe_coupon_id: string
    coupon_type: string
    discount: string
    apply_to_specific_products: number
    coupon_duration: string
    coupon_start_date: string
    coupon_end_date: string
    coupon_max_redemptions: any
    coupon_use_customer_facing_code: number
    coupon_customer_facing_code: string
    subscription_id: any
    subscription_start_date: any
    subscription_end_date: any
    created_at: string
    updated_at: string
}


export interface SubscriptionRequest {
    price_id: string,
    success_url: string,
    cancel_url: string,
    trial_days: number | null,
    coupon_id: null | string,
}