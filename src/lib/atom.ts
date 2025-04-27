import { atom } from "jotai";
import { Profile } from "@/types/Auth";
import { Session } from "@supabase/supabase-js";

export const isLoadingAtom = atom<boolean>(true);
export const profileAtom = atom<Profile | null>(null);
export const sessionAtom = atom<Session | null>(null);
export const errorAtom = atom<string | null>(null);
