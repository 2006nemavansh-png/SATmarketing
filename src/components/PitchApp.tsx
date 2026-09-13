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
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          SAT Marketing
        </h1>
        <button
          onClick={switchUser}
          className="rounded-md px-2 py-1 text-sm text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-slate-400 dark:hover:text-slate-100"
        >
          Pitching as{" "}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {name}
          </span>{" "}
          · switch
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <label
          htmlFor="company-search"
          className="text-sm font-medium text-slate-800 dark:text-slate-200"
        >
          Search a company before you pitch
        </label>
        <input
          id="company-search"
          autoFocus
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          placeholder="Type a company name..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setStatus(null);
          }}
        />

        {searching && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Searching...
          </p>
        )}

        {!searching && query.trim() && results.length > 0 && (
          <div className="mt-3 space-y-2">
            {results.map((r) => (
              <div
                key={r.id}
                className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100"
              >
                <span className="font-semibold">{r.company_name}</span>{" "}
                already pitched by{" "}
                <span className="font-semibold">{r.pitched_by}</span> on{" "}
                {formatDate(r.created_at)}
                {r.notes && (
                  <p className="mt-1 text-amber-900 dark:text-amber-200">
                    Notes: {r.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {!searching && query.trim() && results.length === 0 && (
          <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            No matches — this company hasn&apos;t been pitched yet.
          </p>
        )}

        {!exactMatch && query.trim() && (
          <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 dark:border-slate-700">
            <label htmlFor="pitch-notes" className="sr-only">
              Notes
            </label>
            <input
              id="pitch-notes"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button
              onClick={logPitch}
              disabled={saving}
              className="w-full rounded-md bg-indigo-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
            >
              {saving ? "Saving..." : `Log "${query.trim()}" as pitched`}
            </button>
          </div>
        )}

        {status && (
          <p
            className={`mt-3 text-sm font-medium ${
              status.type === "ok"
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {status.text}
          </p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Recently pitched
        </h2>
        <div className="mt-3 space-y-2">
          {recent.length === 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No pitches logged yet.
            </p>
          )}
          {recent.map((r) => (
            <div
              key={r.id}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <span className="font-semibold">{r.company_name}</span>
              <span className="text-slate-600 dark:text-slate-400">
                {" "}
                · {r.pitched_by} · {formatDate(r.created_at)}
              </span>
              {r.notes && (
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  Notes: {r.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
