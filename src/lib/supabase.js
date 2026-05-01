import { createClient } from "@supabase/supabase-js";

const normalizeSupabaseUrl = (url) =>
  url.trim().replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseUrl = rawSupabaseUrl ? normalizeSupabaseUrl(rawSupabaseUrl) : "";
const supabaseKey = (import.meta.env.VITE_SUPABASE_KEY ?? "").trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase =
  isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
      })
    : null;
