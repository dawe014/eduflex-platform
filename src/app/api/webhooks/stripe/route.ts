import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("STRIPE_WEBHOOK_ERROR", error);

    if (error instanceof Stripe.errors.StripeError) {
      return new NextResponse(`Webhook Error: ${error.message}`, {
        status: 400,
      });
    } else if (error instanceof Error) {
      return new NextResponse(`Webhook Error: ${error.message}`, {
        status: 400,
      });
    } else {
      return new NextResponse(`Webhook Error: An unknown error occurred`, {
        status: 400,
      });
    }
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session?.metadata?.userId;
  const courseId = session?.metadata?.courseId;

  if (event.type === "checkout.session.completed") {
    if (!userId || !courseId) {
      return new NextResponse(
        `Webhook Error: Missing metadata for checkout session ID ${session.id}`,
        {
          status: 400,
        }
      );
    }

    console.log(
      `✅ Payment successful! Creating enrollment for user ${userId} in course ${courseId}`
    );

    try {
      await db.enrollment.create({
        data: {
          courseId: courseId,
          userId: userId,
        },
      });
    } catch (dbError) {
      console.error("DATABASE_ENROLLMENT_ERROR:", dbError);
      return new NextResponse(
        "Internal Server Error: Could not create enrollment.",
        { status: 500 }
      );
    }
  } else {
    console.log(`Received unhandled event type: ${event.type}`);
    return new NextResponse(
      `Webhook Error: Unhandled event type ${event.type}`,
      { status: 200 }
    );
  }

  return new NextResponse(null, { status: 200 });
}
