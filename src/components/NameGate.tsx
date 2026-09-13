"use client";

import { useEffect, useState } from "react";
import { fetchTeamMembers, insertTeamMember, TeamMember } from "@/lib/supabase";

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
    fetchTeamMembers().then((data) => {
      setMembers(data);
      setMode(data.length > 0 ? "pick" : "new");
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
    const { error: insertError } = await insertTeamMember(trimmed);

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
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          SAT Marketing
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Who&apos;s pitching today?
        </p>

        {members.length > 0 && (
          <div className="mt-4 flex gap-2 text-sm" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "pick"}
              className={`flex-1 rounded-md px-3 py-2 font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                mode === "pick"
                  ? "bg-indigo-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
              onClick={() => setMode("pick")}
            >
              Pick my name
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "new"}
              className={`flex-1 rounded-md px-3 py-2 font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                mode === "new"
                  ? "bg-indigo-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
              onClick={() => setMode("new")}
            >
              I&apos;m new
            </button>
          </div>
        )}

        {mode === "pick" && members.length > 0 ? (
          <div className="mt-4 space-y-3">
            <label htmlFor="name-select" className="sr-only">
              Select your name
            </label>
            <select
              id="name-select"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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
              className="w-full rounded-md bg-indigo-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <label htmlFor="new-name" className="sr-only">
              Your full name
            </label>
            <input
              id="new-name"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none placeholder:text-slate-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              placeholder="Enter your full name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmNew()}
            />
            <button
              onClick={confirmNew}
              disabled={!newName.trim()}
              className="w-full rounded-md bg-indigo-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
            >
              Save and continue
            </button>
          </div>
        )}
        {error && (
          <p className="mt-2 text-sm font-medium text-red-700 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
