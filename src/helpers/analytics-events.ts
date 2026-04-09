import Vue from "vue";
import Store from "@/store";

/**
 * 🔹 Step 1: Define event constants
 * Keep all event names in one place so you don’t mistype them in components
 */
export const GTAGEVENTS = {
  ADD_TO_CART: "add_to_cart",
  DOWNLOAD_PDF: "download_pdf",
  CONFIRM_ORDER: "confirm_order",
  SHARE_DESIGN: "share_design"
} as const;

export type EventName = typeof GTAGEVENTS[keyof typeof GTAGEVENTS];
type EventParams = Record<string, any>;

/**
 * 🔹 Step 2: General analytics event for Admin
 * Pushes into GTM dataLayer → forwarded to Admin’s GA4
 */
export function trackEvent(eventName: EventName, params: EventParams = {}) {
  const company = Store.getters.getCompany;

  const eventData = {
    event: eventName,
    company: company?.company_name || "Unknown", // log company for grouping in GA4
    ...params,
  };

  // Ensure dataLayer exists
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push(eventData);

  if (process.env.NODE_ENV !== "production") {
    console.log("[Analytics Debug] trackEvent", eventData);
  }
}

/**
 * 🔹 Step 3: Vendor-specific Google Ads conversion
 * Calls gtag directly → bypasses GTM
 */
export function fireGtagConversion() {
  const companySendToMap: Record<number, string> = {
    123: "AW-756319592/EJQ0CL_62-saEOiK0ugC"
  };

  const company = Store.getters.getCompany;
  const sendTo = companySendToMap[company.id];

  if (!sendTo) {
    console.warn("[Analytics] No conversion mapping found for company", company);
    return;
  }

  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "conversion", { send_to: sendTo });

    if (process.env.NODE_ENV !== "production") {
      console.log("[Analytics Debug] fireGtagConversion", sendTo);
    }
  } else {
    console.warn("[gtag] gtag is not available");
  }
}
