import { createClient } from "@supabase/supabase-js";

// These are public, RLS-protected client keys (not secrets) — safe to ship
// to the browser. Env vars can override them for a different environment.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://qasbvikudnnnqaocbayp.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_Uu6jT499aqt914-sokdtkA_IWtQrRvB";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type TeamMember = {
  id: string;
  name: string;
  created_at: string;
};

export type Pitch = {
  id: string;
  company_name: string;
  pitched_by: string;
  notes: string | null;
  created_at: string;
};
