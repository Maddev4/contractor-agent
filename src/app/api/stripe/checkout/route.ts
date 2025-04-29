import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

console.log(process.env.STRIPE_WEBHOOK_SECRET);

export async function POST(request: Request) {
  try {
    const { questions, user_id, phone_number } = await request.json();

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Contractor Agent Creation",
              description:
                "Create your custom contractor agent with AI capabilities",
            },
            unit_amount: 9900, // $99.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${
        process.env.NEXT_PUBLIC_BASE_URL
      }/build-agent?success=true&questions=${encodeURIComponent(
        JSON.stringify(questions)
      )}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/build-agent?canceled=true`,
      metadata: {
        questions: JSON.stringify(questions),
        user_id,
        phone_number: phone_number || "",
      },
      payment_intent_data: {
        metadata: {
          user_id,
          questions: JSON.stringify(questions),
        },
      },
      customer_email: user_id.includes("@") ? user_id : undefined,
    });

    console.log("Checkout session created:", session.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
