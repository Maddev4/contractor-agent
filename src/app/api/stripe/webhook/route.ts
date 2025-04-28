import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAgent } from "@/lib/supabase";
import { Agent } from "@/types/Agent";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const questions = JSON.parse(session.metadata?.questions || "[]");

    try {
      const agentResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/agents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ questions }),
        }
      );

      if (!agentResponse.ok) {
        throw new Error("Failed to create agent");
      }

      const agentData = await agentResponse.json();
      const agent: Agent = {
        user_id: session.metadata?.user_id || "",
        phone_number: session.metadata?.phone_number || "",
        twilio_phone_number: agentData.phone_number || "",
        llm_id: agentData.llm_id,
        retell_id: agentData.agent_id,
        questions,
      };

      await createAgent(agent);
    } catch (error) {
      console.error("Error creating agent after payment:", error);
      return NextResponse.json(
        { error: "Failed to create agent after payment" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
