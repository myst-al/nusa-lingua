import { createClient } from "@supabase/supabase-js";
import { env } from "../env.js";

/**
 * Supabase admin client (service role).
 * Hanya untuk operasi admin/server-side. Jangan expose ke client.
 *
 * Untuk verify user JWT, kita pakai jose (lihat middleware/auth.ts).
 */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
