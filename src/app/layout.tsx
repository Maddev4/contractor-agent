"use client";

import { useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { checkSession } from "@/lib/supabase";
import { sessionAtom, profileAtom, isLoadingAtom } from "@/lib/atom";
import { useAtom, useSetAtom } from "jotai";
import { useRouter, usePathname } from "next/navigation";
import "./globals.css";
import Navbar from "@/components/Navbar";

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
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const result = await checkSession();
        if (result) {
          setAtomSession(result.session);
          setAtomProfile(result.profile);
        } else {
          if (!isAuthPage && pathname !== "/") {
            router.push("/auth/signin");
          }
        }
      } catch (error) {
        console.error("Auth check failed", error);
        if (!isAuthPage && pathname !== "/") {
          router.push("/auth/signin");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, isAuthPage]);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        {!isAuthPage && <Navbar />}
        <main className="min-h-screen">
          {isLoading ? (
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            children
          )}
        </main>
      </body>
    </html>
  );
}
