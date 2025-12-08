import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.STRIPE_API_KEY || "sk_test_placeholder_for_build",
  {
    apiVersion: "2025-07-30.basil",
    typescript: true,
  }
);
