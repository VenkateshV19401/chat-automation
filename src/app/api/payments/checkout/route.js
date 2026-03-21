import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDb } from "@/lib/repositories/DatabaseRepository";
import { UserRepository } from "@/lib/repositories/UserRepository";
import { PLANS } from "@/lib/config/plans";
import { requireAuth } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  await connectDb();

  let authUser;
  try { authUser = requireAuth(request); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 401 }); }

  const { planId } = await request.json();
  const plan = PLANS[planId];

  if (!plan || !plan.stripePriceId) {
    return NextResponse.json({ error: "Invalid or free plan selected" }, { status: 400 });
  }

  const user = await UserRepository.findUserById(authUser.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  try {
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { userId: user.id, username: user.username },
      });
      customerId = customer.id;
      await UserRepository.updateUser(user.id, { stripeCustomerId: customerId });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?payment=success`,
      cancel_url: `${appUrl}/pricing?payment=cancelled`,
      metadata: { userId: user.id, planId },
      subscription_data: { metadata: { userId: user.id, planId } },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[payment] Checkout session error:", error.message);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
