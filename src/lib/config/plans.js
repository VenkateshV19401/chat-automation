// ============================================================
// PLANS CONFIG — static defaults, overridden by MongoDB if configured
// Admin panel can modify plans at runtime via /admin/plans
// ============================================================

import { connectDb } from "@/lib/repositories/DatabaseRepository";
import { PlanConfig } from "@/lib/models/PlanConfig";

const DEFAULT_PLANS = {
  free: {
    name: "Free",
    maxAutomations: 1,
    maxRepliesPerMonth: 20,
    canSendDM: true,
    stripePriceId: null,
    priceInr: 0,
    features: ["1 automation", "20 replies/month", "Comment + DM replies"],
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
    maxAutomations: -1,
    maxRepliesPerMonth: -1,
    canSendDM: true,
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID || "",
    priceInr: 1499,
    features: ["Unlimited automations", "Unlimited replies", "Comment + DM replies", "Priority support", "Custom branding"],
  },
};

function normalizePlan(plan) {
  return {
    ...plan,
    maxAutomations: plan.maxAutomations === -1 ? Infinity : plan.maxAutomations,
    maxRepliesPerMonth: plan.maxRepliesPerMonth === -1 ? Infinity : plan.maxRepliesPerMonth,
  };
}

export async function getPlan(planName) {
  try {
    await connectDb();
    const doc = await PlanConfig.findOne({ planId: planName }).lean();
    if (doc) return normalizePlan(doc);
  } catch (_err) {
    // fallback to static
  }
  const plan = DEFAULT_PLANS[planName] || DEFAULT_PLANS.free;
  return normalizePlan(plan);
}

export async function getAllPlans() {
  try {
    await connectDb();
    const docs = await PlanConfig.find().lean();
    if (docs.length > 0) {
      const plans = {};
      for (const doc of docs) {
        plans[doc.planId] = normalizePlan(doc);
      }
      return plans;
    }
  } catch (_err) {
    // fallback to static
  }
  const plans = {};
  for (const [key, plan] of Object.entries(DEFAULT_PLANS)) {
    plans[key] = normalizePlan(plan);
  }
  return plans;
}

export async function getPublicPlans() {
  const allPlans = await getAllPlans();
  return Object.entries(allPlans).map(([key, plan]) => ({
    id: key,
    name: plan.name,
    maxAutomations: plan.maxAutomations === Infinity ? "Unlimited" : plan.maxAutomations,
    maxRepliesPerMonth: plan.maxRepliesPerMonth === Infinity ? "Unlimited" : plan.maxRepliesPerMonth,
    priceInr: plan.priceInr,
    features: plan.features,
  }));
}

export { DEFAULT_PLANS };
