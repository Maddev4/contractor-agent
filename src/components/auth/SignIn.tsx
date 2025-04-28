"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserProfile, signInWithEmail } from "@/lib/supabase";
import { useAtom, useSetAtom } from "jotai";
import { errorAtom, isLoadingAtom, sessionAtom, profileAtom } from "@/lib/atom";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useAtom(errorAtom);
  const [loading, setLoading] = useAtom(isLoadingAtom);
  const setAtomSession = useSetAtom(sessionAtom);
  const setAtomProfile = useSetAtom(profileAtom);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await signInWithEmail(email, password);
      if (error) throw error;
      setAtomSession(data.session);
      const profile = await getUserProfile(email);
      setAtomProfile(profile);
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
        />
      </div>

      {error && (
        <div className="text-sm text-destructive animate-fade-in">{error}</div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="ml-2">Signing in...</span>
          </div>
        ) : (
          "Sign In"
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-primary hover:text-primary/90 transition-colors"
        >
          Sign up
        </Link>
      </div>
    </form>
  );
}
