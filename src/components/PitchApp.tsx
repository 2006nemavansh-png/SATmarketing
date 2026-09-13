"use client";

import { useEffect, useState } from "react";
import { supabase, Pitch } from "@/lib/supabase";

const STORAGE_KEY = "sat-marketing-name";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function PitchApp({ name }: { name: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Pitch[]>([]);
  const [searching, setSearching] = useState(false);
  const [recent, setRecent] = useState<Pitch[]>([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  async function loadRecent() {
    const { data } = await supabase
      .from("pitches")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setRecent(data ?? []);
  }

  useEffect(() => {
    loadRecent();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    setSearching(true);
    const handle = setTimeout(async () => {
      const { data } = await supabase
        .from("pitches")
        .select("*")
        .ilike("company_name", `%${trimmed}%`)
        .order("created_at", { ascending: false })
        .limit(10);
      setResults(data ?? []);
      setSearching(false);
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  const exactMatch = results.find(
    (r) => r.company_name.trim().toLowerCase() === query.trim().toLowerCase()
  );

  async function logPitch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSaving(true);
    setStatus(null);
    const { error } = await supabase.from("pitches").insert({
      company_name: trimmed,
      pitched_by: name,
      notes: notes.trim() || null,
    });
    setSaving(false);

    if (error) {
      if (error.code === "23505") {
        setStatus({
          type: "err",
          text: "That company was just logged by someone else. Refresh and check.",
        });
      } else {
        setStatus({ type: "err", text: "Could not save. Try again." });
      }
      return;
    }

    setStatus({ type: "ok", text: `Logged "${trimmed}" as pitched.` });
    setQuery("");
    setNotes("");
    setResults([]);
    loadRecent();
  }

  function switchUser() {
    window.localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">SAT Marketing</h1>
        <button
          onClick={switchUser}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          Pitching as <span className="font-medium">{name}</span> · switch
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="text-sm font-medium text-slate-700">
          Search a company before you pitch
        </label>
        <input
          autoFocus
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Type a company name..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setStatus(null);
          }}
        />

        {searching && (
          <p className="mt-2 text-sm text-slate-400">Searching...</p>
        )}

        {!searching && query.trim() && results.length > 0 && (
          <div className="mt-3 space-y-2">
            {results.map((r) => (
              <div
                key={r.id}
                className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm"
              >
                <span className="font-medium">{r.company_name}</span>{" "}
                already pitched by{" "}
                <span className="font-medium">{r.pitched_by}</span> on{" "}
                {formatDate(r.created_at)}
                {r.notes && (
                  <p className="mt-1 text-slate-500">Notes: {r.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {!searching && query.trim() && results.length === 0 && (
          <p className="mt-3 text-sm text-emerald-600">
            No matches — this company hasn&apos;t been pitched yet.
          </p>
        )}

        {!exactMatch && query.trim() && (
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button
              onClick={logPitch}
              disabled={saving}
              className="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              {saving ? "Saving..." : `Log "${query.trim()}" as pitched`}
            </button>
          </div>
        )}

        {status && (
          <p
            className={`mt-3 text-sm ${
              status.type === "ok" ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {status.text}
          </p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-medium text-slate-700">
          Recently pitched
        </h2>
        <div className="mt-3 space-y-2">
          {recent.length === 0 && (
            <p className="text-sm text-slate-400">No pitches logged yet.</p>
          )}
          {recent.map((r) => (
            <div
              key={r.id}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <span className="font-medium">{r.company_name}</span> ·{" "}
              {r.pitched_by} · {formatDate(r.created_at)}
              {r.notes && (
                <p className="mt-1 text-slate-500">Notes: {r.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
