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
import { supabase } from "@/lib/supabase";

export default function BuildAgentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useAtomValue(sessionAtom);
  const profile = useAtomValue(profileAtom);
  const [questions, setQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "canceled" | null
  >(null);

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const questionsParam = searchParams.get("questions");

    if (success === "true") {
      setPaymentStatus("success");
      if (questionsParam) {
        setQuestions(JSON.parse(decodeURIComponent(questionsParam)));
      }
      // After successful payment, the webhook will be called automatically by Stripe
      // No need to manually call it from the client side
    } else if (canceled === "true") {
      setPaymentStatus("canceled");
    }
  }, [searchParams, router]);

  useEffect(() => {
    const channel = supabase.channel("public:messages");

    channel.on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
      console.log(payload);
    })

    return () => {
      supabase.removeChannel(channel);
    }
  }, [])

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
                  Your agent is being created. You will be redirected to the
                  home page in a few seconds...
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
