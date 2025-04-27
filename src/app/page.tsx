"use client";

import Link from "next/link";
import { useAtomValue } from "jotai";
import { sessionAtom, profileAtom } from "@/lib/atom";

const NavLink = ({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) => (
  <Link href={href} className={className}>
    {children}
  </Link>
);

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="pt-6">
    <div className="flow-root bg-white rounded-lg px-6 pb-8">
      <div className="-mt-6">
        <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
          {icon}
        </span>
        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
          {title}
        </h3>
        <p className="mt-5 text-base text-gray-500">{description}</p>
      </div>
    </div>
  </div>
);

export default function Home() {
  const session = useAtomValue(sessionAtom);
  const profile = useAtomValue(profileAtom);

  const isAuthenticated = session && profile;

  const renderHero = () => (
    <div className="text-center">
      <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
        <span className="block">
          {isAuthenticated ? "Welcome Back to" : "Revolutionize Your"}
        </span>
        <span className="block text-indigo-600 pt-6">
          {isAuthenticated
            ? "Your Contractor Dashboard"
            : "Contracting Business"}
        </span>
      </h1>
      <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
        {isAuthenticated
          ? "Manage your projects, connect with clients, and grow your business."
          : "Streamline your workflow, connect with clients, and boost your productivity with our all-in-one contractor management platform."}
      </p>
      <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
        <div className="rounded-md shadow">
          <NavLink
            href={isAuthenticated ? "/build-agent" : "/auth/signup"}
            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
          >
            {isAuthenticated ? "Go Build Your Agent" : "Start Free Trial"}
          </NavLink>
        </div>
        {!isAuthenticated && (
          <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
            <NavLink
              href="/features"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
            >
              Explore Features
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );

  const renderFeatures = () => (
    <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <FeatureCard
        icon={
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        }
        title="Smart Project Management"
        description="Organize tasks, track progress, and collaborate seamlessly with our AI-powered project management tools."
      />
      <FeatureCard
        icon={
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        }
        title="Client Relationship Management"
        description="Build stronger relationships with clients through our integrated CRM system and communication tools."
      />
      <FeatureCard
        icon={
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        }
        title="Financial Management"
        description="Simplify invoicing, track expenses, and manage your finances with our secure and user-friendly tools."
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {renderHero()}
        {renderFeatures()}
      </main>
    </div>
  );
}
