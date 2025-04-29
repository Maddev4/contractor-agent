import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        // Handle successful payment
        // console.log("Payment successful for session:", session.id);
        // Access your metadata
        const user_id = session.metadata?.user_id;
        const questions = session.metadata?.questions;
        const phone_number = session.metadata?.phone_number;

        console.log("User ID:", user_id);
        console.log("Questions:", questions);
        console.log("Phone Number:", phone_number);

        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/agents`, {
            method: "POST",
            body: JSON.stringify({
              questions,
              user_id,
              phone_number,
            }),
          });
        } catch (error) {
          console.error("Error creating agent:", error);
        }

        // TODO: Implement your post-payment logic here
        // For example: Create the agent, send confirmation emails, etc.
        break;

      // Add other event types as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
