"use client";

import { Geist } from "next/font/google";
import Link from "next/link";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${geist.variable} font-sans min-h-screen bg-gradient-to-br from-background to-muted flex flex-col justify-between p-4`}
    >
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-block">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Contractor Agent
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your trusted partner in construction management
              </p>
            </Link>
          </div>
          <div className="card shadow-lg animate-fade-in pb-10">{children}</div>
        </div>
      </div>
      <footer className="text-center text-sm text-muted-foreground mt-8">
        © {new Date().getFullYear()} Contractor Agent. All rights reserved.
      </footer>
    </div>
  );
}
