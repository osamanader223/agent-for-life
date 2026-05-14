import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase credentials: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
    );
  }
  _client = createClient(url, key);
  return _client;
}

// Proxy so existing `supabaseAdmin.from(...)` calls work unchanged,
// but the client is only instantiated on first actual use (not at import time).
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get: (_target, prop) => (getClient() as unknown as Record<string, unknown>)[prop as string],
});
