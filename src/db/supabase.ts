import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/env";

let client: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  if (!client) {
    const env = getSupabaseEnv();
    client = createClient(env.url, env.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return client;
}
