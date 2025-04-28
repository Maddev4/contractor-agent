import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(request: Request) {
  try {
    const { questions } = await request.json();

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
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
