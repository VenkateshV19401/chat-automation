import Stripe from "stripe";
import { config } from "../config/config.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { UsageRepository } from "../repositories/UsageRepository.js";
import { getPlan, getPublicPlans, PLANS } from "../config/plans.js";

const stripe = new Stripe(config.stripeSecretKey);

// GET /payments/plans — public, no auth
export function getPlans(_req, res) {
  res.json(getPublicPlans());
}

// GET /payments/usage — requireAuth
export function getUsage(req, res) {
  const user = UserRepository.findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const plan = getPlan(user.plan);
  const usage = UsageRepository.getMonthlyUsage(user.id);

  res.json({
    plan: user.plan || "free",
    planName: plan.name,
    usage: {
      repliesSent: usage.repliesSent,
      maxRepliesPerMonth: plan.maxRepliesPerMonth === Infinity ? null : plan.maxRepliesPerMonth,
      automationsCount: 0, // filled by client from /automations
      maxAutomations: plan.maxAutomations === Infinity ? null : plan.maxAutomations,
    },
  });
}

// POST /payments/checkout — requireAuth
export async function createCheckoutSession(req, res) {
  const { planId } = req.body;
  const plan = PLANS[planId];

  if (!plan || !plan.stripePriceId) {
    return res.status(400).json({ error: "Invalid or free plan selected" });
  }

  const user = UserRepository.findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  try {
    // Create or reuse Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { userId: user.id, username: user.username },
      });
      customerId = customer.id;
      UserRepository.updateUser(user.id, { stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode:   "subscription",
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${config.frontendUrl}/dashboard?payment=success`,
      cancel_url: `${config.frontendUrl}/pricing?payment=cancelled`,
      metadata: { userId: user.id, planId },
      subscription_data: { metadata: { userId: user.id, planId } },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("[payment] Checkout session error:", error.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
}

// POST /payments/portal — requireAuth
export async function createPortalSession(req, res) {
  const user = UserRepository.findUserById(req.user.id);
  if (!user || !user.stripeCustomerId) {
    return res.status(400).json({ error: "No active subscription found" });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${config.frontendUrl}/dashboard`,
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error("[payment] Portal session error:", error.message);
    res.status(500).json({ error: "Failed to create portal session" });
  }
}

// POST /payments/webhook — raw body, no auth
export async function handleStripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripeWebhookSecret);
  } catch (error) {
    console.error("[payment] Webhook signature failed:", error.message);
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  console.log(`[payment] Stripe event: ${event.type}`);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      if (userId && planId) {
        UserRepository.updateUser(userId, {
          plan: planId,
          stripeSubscriptionId: session.subscription,
          planActivatedAt: new Date().toISOString(),
        });
        console.log(`[payment] Plan activated: ${planId} for user ${userId}`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;
      if (userId) {
        UserRepository.updateUser(userId, {
          plan: "free",
          stripeSubscriptionId: null,
          planActivatedAt: null,
        });
        console.log(`[payment] Subscription cancelled, downgraded to free: ${userId}`);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      const user = UserRepository.findUserByStripeCustomerId(customerId);
      if (user) {
        console.warn(`[payment] Payment failed for user ${user.username} — keeping current plan until Stripe retries`);
      }
      break;
    }

    default:
      break;
  }

  res.json({ received: true });
}
