// ============================================================
// PLANS CONFIG — edit this file to change limits, prices, features
// To change a limit: edit the number below
// To change a price: update in Stripe dashboard AND update stripePriceId below
// ============================================================

export const PLANS = {
  free: {
    name: "Free",
    maxAutomations: 1,
    maxRepliesPerMonth: 20,
    canSendDM: true,
    stripePriceId: null,
    priceInr: 0,
    features: ["5 automations", "100 replies/month", "Comment + DM replies"],
  },
  pro: {
    name: "Pro",
    maxAutomations: 20,
    maxRepliesPerMonth: 5000,
    canSendDM: true,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "",
    priceInr: 499,
    features: ["20 automations", "5,000 replies/month", "Comment + DM replies", "Priority support"],
  },
  business: {
    name: "Business",
    maxAutomations: Infinity,
    maxRepliesPerMonth: Infinity,
    canSendDM: true,
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID || "",
    priceInr: 1499,
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
    priceInr: plan.priceInr,
    features: plan.features,
  }));
}
