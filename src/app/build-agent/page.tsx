"use client";

import { useState, useEffect } from "react";
import { useAtomValue } from "jotai";
import { sessionAtom, profileAtom } from "@/lib/atom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useSearchParams, useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { CheckCircle, XCircle } from "lucide-react";
import { supabase, updateUserProfile } from "@/lib/supabase";
import { Agent } from "@/types/Agent";

export default function BuildAgentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useAtomValue(sessionAtom);
  const profile = useAtomValue(profileAtom);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "canceled" | null
  >(null);

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const questionsParam = searchParams.get("questions");

    if (success === "true") {
      setPaymentStatus("success");
      setIsCreatingAgent(true);
      if (questionsParam) {
        setQuestions(JSON.parse(decodeURIComponent(questionsParam)));
      }
      updateUserProfile({
        id: profile?.id || "",
        email: profile?.email || "",
        name: profile?.name || "",
        avatar: profile?.avatar || "",
        plan: "PAID",
      });
      // After successful payment, the webhook will be called automatically by Stripe
      // No need to manually call it from the client side
    } else if (canceled === "true") {
      setPaymentStatus("canceled");
    }
  }, [searchParams, router]);

  useEffect(() => {
    const channel = supabase.channel("public:messages");

    channel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "agents",
          filter: `user_id=eq.${session?.user.id}`,
        },
        (payload) => {
          console.log("Agent updated:", payload);
          setAgent(payload.new as Agent);
          setIsCreatingAgent(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user.id, router]);

  if (!session || !profile) {
    return null;
  }

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, newQuestion.trim()]);
      setNewQuestion("");
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleCreateAgent = async () => {
    setIsLoading(true);
    try {
      const checkoutResponse = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions,
          user_id: session.user.id,
          phone_number: profile.agent?.phone_number || "",
        }),
      });

      if (!checkoutResponse.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await checkoutResponse.json();
      window.location.href = url;
    } catch (error) {
      console.error("Failed to create agent:", error);
      // Handle error (e.g., show error message)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Build Your Agent</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentStatus === "success" && (
              <Alert className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Payment Successful!</AlertTitle>
                <AlertDescription>
                  {isCreatingAgent && !agent
                    ? "Creating your agent... Please wait..."
                    : agent
                    ? "Your agent is ready! Reviewing details..."
                    : "Agent creation complete!"}
                </AlertDescription>
              </Alert>
            )}
            {paymentStatus === "canceled" && (
              <Alert variant="destructive" className="mb-4">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Payment Canceled</AlertTitle>
                <AlertDescription>
                  Your payment was canceled. You can try again.
                </AlertDescription>
              </Alert>
            )}
            {paymentStatus === "success" && agent && (
              <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium">Agent Details:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Phone Number:</div>
                  <div>{agent.phone_number}</div>

                  <div className="text-gray-600">Twilio Number:</div>
                  <div>{agent.twilio_phone_number}</div>

                  <div className="text-gray-600">LLM ID:</div>
                  <div className="truncate">{agent.llm_id}</div>

                  <div className="text-gray-600">Retell ID:</div>
                  <div className="truncate">{agent.retell_id}</div>

                  <div className="text-gray-600">Questions:</div>
                  <div>
                    <ul className="list-disc list-inside">
                      {agent.questions.map((q, i) => (
                        <li key={i} className="truncate">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Redirecting to home page in 3 seconds...
                </p>
              </div>
            )}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="question">Add a Question</Label>
                <div className="flex space-x-2">
                  <Input
                    id="question"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Enter a question for your agent"
                  />
                  <Button onClick={handleAddQuestion}>Add</Button>
                </div>
              </div>

              {questions.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Questions</Label>
                  <div className="space-y-2">
                    {questions.map((question, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span>{question}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveQuestion(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleCreateAgent}
                disabled={questions.length === 0 || isLoading}
                className="w-full"
              >
                {isLoading ? "Processing..." : "Create Agent ($99)"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
