"use client";

import Image from "next/image";
import { useAtomValue } from "jotai";
import { sessionAtom, profileAtom } from "@/lib/atom";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { createAgent } from "@/lib/supabase";
import { Agent } from "@/types/Agent";

export default function ProfilePage() {
  const session = useAtomValue(sessionAtom);
  const profile = useAtomValue(profileAtom);

  const [editProfile, setEditProfile] = useState(profile);

  const [phoneNumber, setPhoneNumber] = useState(
    profile?.agent?.phone_number || ""
  );
  const [isEditing, setIsEditing] = useState(false);

  if (!session || !profile) {
    return null;
  }

  const handleSave = async () => {
    const agent: Agent = {
      user_id: session.user.id,
      phone_number: phoneNumber,
      twilio_phone_number: editProfile?.agent?.twilio_phone_number || "",
      llm_id: editProfile?.agent?.llm_id || "default",
      retell_id: editProfile?.agent?.retell_id || "default",
      questions: editProfile?.agent?.questions || [],
    };
    await createAgent(agent);

    setEditProfile({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar,
      plan: profile.plan,
      agent,
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Profile Image */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden">
            <Image
              src={
                profile.avatar ||
                "https://ionicframework.com/docs/img/demos/avatar.svg"
              }
              alt={profile.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* User Info */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
            <p className="text-gray-500 mt-1">{profile.email}</p>
          </div>

          {/* Bio and Phone Number */}
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="phoneNumber"
                className="text-lg font-semibold text-gray-900"
              >
                Phone Number
              </Label>
              {isEditing ? (
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full"
                />
              ) : (
                <p className="text-gray-700">{phoneNumber}</p>
              )}
            </div>

            {isEditing ? (
              <Button onClick={handleSave} className="w-full">
                Save
              </Button>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                variant="secondary"
                className="w-full"
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
