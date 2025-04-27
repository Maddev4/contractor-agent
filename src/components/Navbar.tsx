import Link from "next/link";
import { useAtomValue } from "jotai";
import { sessionAtom, profileAtom } from "@/lib/atom";
import { Button } from "@/components/ui/Button";

export default function Navbar() {
  const session = useAtomValue(sessionAtom);
  const profile = useAtomValue(profileAtom);

  const isAuthenticated = session && profile;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Contractor Agent
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-600 px-3 py-2 rounded-md text-sm font-medium">
                  Welcome, {profile.name}
                </span>
                <Link href="/profile">
                  <Button variant="outline">Profile</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
