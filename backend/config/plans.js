// ============================================================
// PLANS CONFIG — edit this file to change limits, prices, features
// To change a limit: edit the number below
// To change a price: update in Stripe dashboard AND update stripePriceId below
// ============================================================

export const PLANS = {
  free: {
    name: "Free",
    maxAutomations: 2,
    maxRepliesPerMonth: 100,
    canSendDM: true,
    stripePriceId: null,
    priceUsd: 0,
    features: ["2 automations", "100 replies/month", "Comment + DM replies"],
  },
  pro: {
    name: "Pro",
    maxAutomations: 20,
    maxRepliesPerMonth: 5000,
    canSendDM: true,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "",
    priceUsd: 19.99,
    features: ["20 automations", "5,000 replies/month", "Comment + DM replies", "Priority support"],
  },
  business: {
    name: "Business",
    maxAutomations: Infinity,
    maxRepliesPerMonth: Infinity,
    canSendDM: true,
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID || "",
    priceUsd: 49.99,
    features: ["Unlimited automations", "Unlimited replies", "Comment + DM replies", "Priority support", "Custom branding"],
  },
};

export function getPlan(planName) {
  return PLANS[planName] || PLANS.free;
}

export function getPublicPlans() {
  return Object.entries(PLANS).map(([key, plan]) => ({
    id: key,
    name: plan.name,
    maxAutomations: plan.maxAutomations === Infinity ? "Unlimited" : plan.maxAutomations,
    maxRepliesPerMonth: plan.maxRepliesPerMonth === Infinity ? "Unlimited" : plan.maxRepliesPerMonth,
    priceUsd: plan.priceUsd,
    features: plan.features,
  }));
}
