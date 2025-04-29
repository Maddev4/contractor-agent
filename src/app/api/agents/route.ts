import { generatePrompt } from "@/lib/openai";
import { fetchApi } from "@/lib/utils";
import { NextResponse } from "next/server";
import { createAgent } from "@/lib/supabase";
import { Agent } from "@/types/Agent";

export async function POST(request: Request) {
  try {
    const { questions, user_id, phone_number } = await request.json();

    console.log(typeof questions);

    // Generate the prompt using OpenAI
    const general_prompt = await generatePrompt(questions);

    // Create LLM
    const llmBody = {
      model: "gpt-4o",
      general_prompt: general_prompt,
      general_tools: [
        {
          type: "end_call",
          name: "end_call",
          description: "End the call with user.",
        },
        {
          type: "custom",
          name: "log_data",
          description:
            "Send all collected information to n8n. Extract following data from transcript.\n- responses: Name, Email, Phone\n- property: Type, Scope, Material\n- budget\n- timeline\n- followUp\n- summary",
          url: "https://ihatemissedcalls.app.n8n.cloud/webhook/1be4ed24-75e6-47ab-9536-674a54e3bcb1",
          speak_during_execution: true,
          speak_after_execution: true,
          parameters: {
            type: "object",
            required: [
              "responses",
              "property",
              "budget",
              "timeline",
              "followUp",
              "summary",
            ],
            properties: {
              property: {
                type: "object",
                required: ["type", "scope", "material"],
                properties: {
                  type: {
                    type: "string",
                    description:
                      "Property type like Primary residence, a Rental and Another property",
                  },
                  material: {
                    type: "string",
                    description:
                      "Property Material looks like clean, modern, durable, low-maintenance, etc.",
                  },
                  scope: {
                    type: "string",
                    description:
                      "Property Scope like square footage, and number of linear feet",
                  },
                },
              },
              summary: {
                type: "string",
                description: "Summary about the property",
              },
              responses: {
                type: "object",
                required: ["name", "email", "phone"],
                properties: {
                  name: {
                    type: "string",
                    minLength: 1,
                  },
                  phone: {
                    type: "string",
                    pattern: "^\\+[1-9]\\d{1,14}$",
                    description: "Phone number in E.164 format",
                  },
                  email: {
                    type: "string",
                    format: "email",
                  },
                },
              },
              timeline: {
                type: "string",
                description: "Property Timeline",
              },
              followUp: {
                type: "string",
                description: "Follow Up Contractor: call, text or email",
              },
              budget: {
                type: "string",
                description: "Property Budget",
              },
            },
            _schema: "http://json-schema.org/draft-07/schema#",
          },
        },
      ],
      begin_message: "",
    };

    const llmResponse = await fetchApi("/create-retell-llm", {
      method: "POST",
      body: JSON.stringify(llmBody),
    });

    console.info("LLM Created:", llmResponse.llm_id);

    // Create Agent
    const agentBody = {
      response_engine: {
        type: "retell-llm",
        llm_id: llmResponse.llm_id,
      },
      voice_id: "11labs-Adrian",
      agent_name: "Contractor Agent",
      interruption_sensitivity: 0.7,
    };

    const agentResponse = await fetchApi("/create-agent", {
      method: "POST",
      body: JSON.stringify(agentBody),
    });

    console.info("Agent Created:", agentResponse.agent_id);

    // Create Phone Number
    const phoneBody = {
      inbound_agent_id: agentResponse.agent_id,
    };

    const phoneResponse = await fetchApi("/create-phone-number", {
      method: "POST",
      body: JSON.stringify(phoneBody),
    });

    console.info("Phone Created:", phoneResponse.phone_number);

    // Create agent in database
    const agent: Agent = {
      user_id,
      phone_number,
      twilio_phone_number: phoneResponse.phone_number,
      llm_id: llmResponse.llm_id,
      retell_id: agentResponse.agent_id,
      questions,
    };

    await createAgent(agent);

    return NextResponse.json({
      success: true,
      agent_id: agentResponse.agent_id,
      llm_id: llmResponse.llm_id,
      phone_number: phoneResponse.phone_number,
    });
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
