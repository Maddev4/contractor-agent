import { createClient } from "@supabase/supabase-js";
import { Profile } from "@/types/Auth";
import { Agent } from "@/types/Agent";

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
  if (!session.user.email) return null;
  const profile = await getUserProfile(session.user.email);
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

export const getUserProfile = async (email: string) => {
  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  if (error) throw error;

  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("*")
    .eq("user_id", profile.id);
  if (agentError) throw agentError;

  if (agent.length) {
    profile.agent = agent[0];
  }
  return profile;
};

export const updateUserProfile = async (profile: Profile) => {
  const { data: updatedProfile, error } = await supabase
    .from("users")
    .upsert(profile);
  if (error) throw error;
  return updatedProfile;
};

export const createAgent = async (agent: Agent) => {
  const { data, error } = await supabase
    .from("agents")
    .insert([
      {
        phone_number: agent.phone_number,
        twilio_phone_number: agent.twilio_phone_number,
        llm_id: agent.llm_id,
        retell_id: agent.retell_id,
        questions: agent.questions,
        user_id: agent.user_id,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateAgent = async (agent: Agent) => {
  const { data, error } = await supabase
    .from("agents")
    .upsert(agent, {
      onConflict: 'phone_number',
      ignoreDuplicates: false
    });
  if (error) throw error;
  return data;
};

export const deleteAgent = async (id: string) => {
  const { error } = await supabase.from("agents").delete().eq("id", id);
  if (error) throw error;
  return true;
};
