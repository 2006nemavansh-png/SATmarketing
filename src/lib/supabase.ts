// A thin fetch() wrapper around Supabase's REST API (PostgREST) instead of
// the @supabase/supabase-js SDK. Our needs are a handful of plain selects
// and inserts, but the full SDK bundles auth, storage, and functions
// clients we never use — over 150KB of gzipped JS the app doesn't need,
// which meaningfully slowed first load on mobile. These are public,
// RLS-protected client keys (not secrets) — safe to ship to the browser.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://qasbvikudnnnqaocbayp.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_Uu6jT499aqt914-sokdtkA_IWtQrRvB";

const REST_URL = `${SUPABASE_URL}/rest/v1`;

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

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

export type RestError = { code?: string; message?: string };

async function parseError(res: Response): Promise<RestError> {
  try {
    return await res.json();
  } catch {
    return { message: res.statusText };
  }
}

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const res = await fetch(`${REST_URL}/team_members?select=*&order=name.asc`, {
    headers,
  });
  if (!res.ok) return [];
  return res.json();
}

export async function insertTeamMember(
  name: string
): Promise<{ error: RestError | null }> {
  const res = await fetch(`${REST_URL}/team_members`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) return { error: await parseError(res) };
  return { error: null };
}

export async function fetchPitches(): Promise<Pitch[]> {
  const res = await fetch(`${REST_URL}/pitches?select=*&order=created_at.desc`, {
    headers,
  });
  if (!res.ok) return [];
  return res.json();
}

export async function insertPitch(pitch: {
  company_name: string;
  pitched_by: string;
  notes: string | null;
}): Promise<{ error: RestError | null }> {
  const res = await fetch(`${REST_URL}/pitches`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify(pitch),
  });
  if (!res.ok) return { error: await parseError(res) };
  return { error: null };
}

export async function updatePitch(
  id: string,
  updates: { company_name: string; notes: string | null }
): Promise<{ error: RestError | null }> {
  const res = await fetch(`${REST_URL}/pitches?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) return { error: await parseError(res) };
  return { error: null };
}

export async function deletePitch(
  id: string
): Promise<{ error: RestError | null }> {
  const res = await fetch(`${REST_URL}/pitches?id=eq.${id}`, {
    method: "DELETE",
    headers: { ...headers, Prefer: "return=minimal" },
  });
  if (!res.ok) return { error: await parseError(res) };
  return { error: null };
}
