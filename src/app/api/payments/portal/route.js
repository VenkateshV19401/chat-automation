import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDb } from "@/lib/repositories/DatabaseRepository";
import { UserRepository } from "@/lib/repositories/UserRepository";
import { requireAuth } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  await connectDb();

  let authUser;
  try { authUser = requireAuth(request); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 401 }); }

  const user = await UserRepository.findUserById(authUser.id);
  if (!user || !user.stripeCustomerId) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/dashboard`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[payment] Portal session error:", error.message);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
