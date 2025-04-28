"use client";

import { useState } from "react";
import { useAtomValue } from "jotai";
import { sessionAtom, profileAtom } from "@/lib/atom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { updateAgent } from "@/lib/supabase";
import { Agent } from "@/types/Agent";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

export default function BuildAgentPage() {
  const router = useRouter();
  const session = useAtomValue(sessionAtom);
  const profile = useAtomValue(profileAtom);
  const [questions, setQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      const agentResponse = await fetch('/api/agents', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ questions })
      });

      if (!agentResponse.ok) {
        throw new Error("Failed to create agent")
      }

      const agentData = await agentResponse.json();
      const agent: Agent = {
        user_id: session.user.id,
        phone_number: profile.agent?.phone_number || "",
        twilio_phone_number: agentData.phone_number || "",
        llm_id: agentData.llm_id,
        retell_id: agentData.agent_id,
        questions,
      };
      await updateAgent(agent);

      router.push('/');

      // Handle success (e.g., show success message, redirect, etc.)
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
                {isLoading ? "Creating..." : "Create Agent"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
