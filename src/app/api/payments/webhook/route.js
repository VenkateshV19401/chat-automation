import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDb } from "@/lib/repositories/DatabaseRepository";
import { UserRepository } from "@/lib/repositories/UserRepository";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  await connectDb();
  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("[payment] Webhook signature failed:", error.message);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  console.log(`[payment] Stripe event: ${event.type}`);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      if (userId && planId) {
        await UserRepository.updateUser(userId, {
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
        await UserRepository.updateUser(userId, {
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
      const user = await UserRepository.findUserByStripeCustomerId(customerId);
      if (user) {
        console.warn(`[payment] Payment failed for user ${user.username}`);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
