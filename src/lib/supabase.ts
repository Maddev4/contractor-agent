import { createClient } from "@supabase/supabase-js";
import { Profile } from "@/types/Auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUpWithEmail = async (email: string, password: string) => {
  const {
    data: { session },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return session;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  localStorage.clear();
};

export const checkSession = async () => {
  const session = await getSession();
  if (!session) return null;

  const profile = await getUserProfile();
  return { session, profile };
};

export const getUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

export const getUserProfile = async () => {
  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .single();
  if (error) throw error;
  return profile;
};

export const updateUserProfile = async (profile: Profile) => {
  const { data: updatedProfile, error } = await supabase
    .from("users")
    .upsert(profile);
  if (error) throw error;
  return updatedProfile;
};
