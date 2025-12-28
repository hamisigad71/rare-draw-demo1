// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";
import { logger } from "./logger.ts";

export interface UserProfile {
  id: string; // Clerk user ID (e.g., user_2abc...)
  username: string;
  email: string | null;
  avatar_url: string | null;
  badges: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Get user profile by Clerk user ID
 */
export async function getUserProfile(
  clerkUserId: string
): Promise<UserProfile | null> {
  const log = logger.withContext({ module: "user-helpers", clerkUserId });
  // Get Supabase credentials - try custom first, fall back to auto-injected
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("CUSTOM_SUPABASE_SERVICE_KEY") || 
                             Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    log.error("Missing Supabase credentials", {
      hasUrl: Boolean(supabaseUrl),
      hasServiceKey: Boolean(supabaseServiceKey),
    });
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", clerkUserId)
    .single();

  if (error) {
    log.error("Error fetching user profile", { error });
    return null;
  }

  log.info("Fetched user profile", { profileFound: Boolean(data) });
  return data;
}
