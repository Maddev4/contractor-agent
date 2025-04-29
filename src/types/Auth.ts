import { Agent } from "./Agent";

type Profile = {
  id: string;
  email: string;
  name: string;
  plan: "FREE" | "PAID";
  avatar?: string;
  agent?: Agent;
};

export type { Profile };
