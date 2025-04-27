"use client";

import { useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { checkSession } from "@/lib/supabase";
import { sessionAtom, profileAtom, isLoadingAtom } from "@/lib/atom";
import { useAtom, useSetAtom } from "jotai";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const setAtomSession = useSetAtom(sessionAtom);
  const setAtomProfile = useSetAtom(profileAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const result = await checkSession();
        console.log(result);
        if (result) {
          setAtomSession(result.session);
          setAtomProfile(result.profile);
        } else {
          console.log(result);
        }
      } catch (error) {
        console.error("Auth check failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
