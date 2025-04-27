"use client";

import Link from "next/link";
import { useAtom } from "jotai";
import { sessionAtom } from "@/lib/atom";
import SignUp from "@/components/auth/SignUp";

export default function SignUpPage() {
  const [session] = useAtom(sessionAtom);

  if (session) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          You are already signed in
        </h2>
        <Link
          href="/"
          className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
        >
          Go to home page
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            href="/auth/signin"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignUp />
        </div>
      </div>
    </div>
  );
}
