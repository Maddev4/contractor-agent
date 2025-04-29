import { Loader2 } from "lucide-react";

export function Loading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}