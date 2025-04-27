import { Agent } from "./Agent";
type Profile = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  agent?: Agent;
};

export type { Profile };
