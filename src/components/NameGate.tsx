"use client";

import { useEffect, useState } from "react";
import { supabase, TeamMember } from "@/lib/supabase";

const STORAGE_KEY = "sat-marketing-name";

export default function NameGate({
  onNamed,
}: {
  onNamed: (name: string) => void;
}) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selected, setSelected] = useState("");
  const [newName, setNewName] = useState("");
  const [mode, setMode] = useState<"pick" | "new">("pick");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      onNamed(saved);
      return;
    }
    supabase
      .from("team_members")
      .select("*")
      .order("name", { ascending: true })
      .then(({ data }) => {
        setMembers(data ?? []);
        setMode(data && data.length > 0 ? "pick" : "new");
        setLoading(false);
      });
  }, [onNamed]);

  async function confirmExisting() {
    if (!selected) return;
    window.localStorage.setItem(STORAGE_KEY, selected);
    onNamed(selected);
  }

  async function confirmNew() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setError("");
    const { error: insertError } = await supabase
      .from("team_members")
      .insert({ name: trimmed });

    if (insertError && insertError.code !== "23505") {
      setError("Could not save your name. Try again.");
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, trimmed);
    onNamed(trimmed);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">SAT Marketing</h1>
        <p className="mt-1 text-sm text-slate-500">
          Who&apos;s pitching today?
        </p>

        {members.length > 0 && (
          <div className="mt-4 flex gap-2 text-sm">
            <button
              className={`rounded-md px-3 py-1 ${
                mode === "pick"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
              onClick={() => setMode("pick")}
            >
              Pick my name
            </button>
            <button
              className={`rounded-md px-3 py-1 ${
                mode === "new"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
              onClick={() => setMode("new")}
            >
              I&apos;m new
            </button>
          </div>
        )}

        {mode === "pick" && members.length > 0 ? (
          <div className="mt-4 space-y-3">
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Select your name...</option>
              {members.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
            <button
              onClick={confirmExisting}
              disabled={!selected}
              className="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Enter your full name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmNew()}
            />
            <button
              onClick={confirmNew}
              disabled={!newName.trim()}
              className="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Save and continue
            </button>
          </div>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
