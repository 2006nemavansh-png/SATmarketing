"use client";

import { useEffect, useState } from "react";
import {
  fetchPitches,
  insertPitch,
  updatePitch,
  deletePitch,
  Pitch,
} from "@/lib/supabase";
import PitchMessage from "@/components/PitchMessage";

const STORAGE_KEY = "sat-marketing-name";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function PitchApp({ name }: { name: string }) {
  const [tab, setTab] = useState<"track" | "message">("track");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Pitch[]>([]);
  const [searching, setSearching] = useState(false);
  const [all, setAll] = useState<Pitch[]>([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "az">(
    "newest"
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadAll() {
    const data = await fetchPitches();
    setAll(data);
  }

  useEffect(() => {
    loadAll();

    // Poll for updates so a reply logged by any teammate shows up for
    // everyone without a manual refresh, and refresh immediately whenever
    // someone comes back to a backgrounded tab.
    const interval = setInterval(loadAll, 5000);
    const onVisible = () => {
      if (document.visibilityState === "visible") loadAll();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    setSearching(true);
    const handle = setTimeout(() => {
      const q = trimmed.toLowerCase();
      setResults(
        all
          .filter((p) => p.company_name.toLowerCase().includes(q))
          .sort((a, b) => {
            const aStarts = a.company_name.toLowerCase().startsWith(q);
            const bStarts = b.company_name.toLowerCase().startsWith(q);
            if (aStarts !== bStarts) return aStarts ? -1 : 1;
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          })
          .slice(0, 50)
      );
      setSearching(false);
    }, 150);
    return () => clearTimeout(handle);
  }, [query, all]);

  const exactMatch = results.find(
    (r) => r.company_name.trim().toLowerCase() === query.trim().toLowerCase()
  );

  async function logPitch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSaving(true);
    setStatus(null);
    const { error } = await insertPitch({
      company_name: trimmed,
      pitched_by: name,
      notes: notes.trim() || null,
    });
    setSaving(false);

    if (error) {
      if (error.code === "23505") {
        setStatus({
          type: "err",
          text: "That company's reply was just logged by someone else. Refresh and check.",
        });
      } else {
        setStatus({ type: "err", text: "Could not save. Try again." });
      }
      return;
    }

    setStatus({ type: "ok", text: `Logged "${trimmed}" — reply received.` });
    setQuery("");
    setNotes("");
    setResults([]);
    loadAll();
  }

  function startEdit(r: Pitch) {
    if (r.pitched_by !== name) return;
    setEditingId(r.id);
    setEditCompanyName(r.company_name);
    setEditNotes(r.notes ?? "");
    setEditError("");
    setConfirmingDelete(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError("");
    setConfirmingDelete(false);
  }

  async function confirmDelete() {
    if (!editingId) return;
    setDeleting(true);
    setEditError("");
    const { error } = await deletePitch(editingId);
    setDeleting(false);

    if (error) {
      setEditError("Could not delete. Try again.");
      return;
    }

    setEditingId(null);
    setConfirmingDelete(false);
    loadAll();
  }

  async function saveEdit() {
    const trimmed = editCompanyName.trim();
    if (!trimmed || !editingId) return;
    setEditSaving(true);
    setEditError("");
    const { error } = await updatePitch(editingId, {
      company_name: trimmed,
      notes: editNotes.trim() || null,
    });
    setEditSaving(false);

    if (error) {
      setEditError(
        error.code === "23505"
          ? "Another logged reply already uses that company name."
          : "Could not save. Try again."
      );
      return;
    }

    setEditingId(null);
    loadAll();
  }

  const teammates = Array.from(new Set(all.map((p) => p.pitched_by))).sort();

  const visibleList = all
    .filter((p) => !filterName || p.pitched_by === filterName)
    .sort((a, b) => {
      if (sortOrder === "az") {
        return a.company_name.localeCompare(b.company_name);
      }
      const diff =
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortOrder === "oldest" ? diff : -diff;
    });

  function switchUser() {
    window.localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          SAT Marketing
        </h1>
        <button
          onClick={switchUser}
          className="self-start rounded-md py-1.5 text-sm text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:self-auto sm:px-2 dark:text-slate-400 dark:hover:text-slate-100"
        >
          Pitching as{" "}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {name}
          </span>{" "}
          · switch
        </button>
      </div>

      <div className="mt-6 flex gap-2 text-sm" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "track"}
          className={`flex-1 rounded-md px-3 py-2 font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
            tab === "track"
              ? "bg-indigo-700 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          }`}
          onClick={() => setTab("track")}
        >
          Search &amp; log replies
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "message"}
          className={`flex-1 rounded-md px-3 py-2 font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
            tab === "message"
              ? "bg-indigo-700 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          }`}
          onClick={() => setTab("message")}
        >
          Generate pitch message
        </button>
      </div>

      {tab === "message" && <PitchMessage />}

      {tab === "track" && (
        <>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900">
        <label
          htmlFor="company-search"
          className="text-sm font-medium text-slate-800 dark:text-slate-200"
        >
          Search a company before messaging them
        </label>
        <input
          id="company-search"
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none placeholder:text-slate-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          placeholder="Type a company name..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setStatus(null);
          }}
        />
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          Only log a company once they&apos;ve actually replied — sending the
          DM alone doesn&apos;t count, since we can&apos;t know in advance
          who&apos;ll respond.
        </p>

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
                already replied — being handled by{" "}
                <span className="font-semibold">{r.pitched_by}</span> since{" "}
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
            No matches — no reply logged for this company yet.
          </p>
        )}

        {!exactMatch && query.trim() && (
          <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 dark:border-slate-700">
            <label htmlFor="pitch-notes" className="sr-only">
              Notes
            </label>
            <input
              id="pitch-notes"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none placeholder:text-slate-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button
              onClick={logPitch}
              disabled={saving}
              className="w-full rounded-md bg-indigo-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
            >
              {saving ? "Saving..." : `Log "${query.trim()}" as replied`}
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
          Companies that replied{" "}
          <span className="font-normal text-slate-500 dark:text-slate-400">
            ({all.length})
          </span>
        </h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Visible to the whole team, updates live as replies are logged.
        </p>

        {all.length > 0 && (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="filter-name" className="sr-only">
                Filter by teammate
              </label>
              <select
                id="filter-name"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              >
                <option value="">All teammates</option>
                {teammates.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="sort-order" className="sr-only">
                Sort order
              </label>
              <select
                id="sort-order"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value as "newest" | "oldest" | "az")
                }
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="az">Company A–Z</option>
              </select>
            </div>
          </div>
        )}

        <div className="mt-3 space-y-2">
          {all.length === 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No replies logged yet.
            </p>
          )}
          {all.length > 0 && visibleList.length === 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No replies match this filter.
            </p>
          )}
          {visibleList.map((r) => {
            const isMine = r.pitched_by === name;
            const isEditing = editingId === r.id;

            if (isEditing) {
              return (
                <div
                  key={r.id}
                  className="rounded-md border border-indigo-300 bg-indigo-50 px-3 py-3 text-sm dark:border-indigo-700 dark:bg-indigo-950/30"
                >
                  <label htmlFor={`edit-name-${r.id}`} className="sr-only">
                    Company name
                  </label>
                  <input
                    id={`edit-name-${r.id}`}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    value={editCompanyName}
                    onChange={(e) => setEditCompanyName(e.target.value)}
                  />
                  <label htmlFor={`edit-notes-${r.id}`} className="sr-only">
                    Notes
                  </label>
                  <input
                    id={`edit-notes-${r.id}`}
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="Notes (optional)"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
                  {editError && (
                    <p className="mt-2 text-sm font-medium text-red-700 dark:text-red-400">
                      {editError}
                    </p>
                  )}

                  {confirmingDelete ? (
                    <div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/30">
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        Delete this reply for good?
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={confirmDelete}
                          disabled={deleting}
                          className="flex-1 rounded-md bg-red-700 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                        >
                          {deleting ? "Deleting..." : "Yes, delete"}
                        </button>
                        <button
                          onClick={() => setConfirmingDelete(false)}
                          disabled={deleting}
                          className="flex-1 rounded-md bg-slate-200 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={saveEdit}
                        disabled={editSaving || !editCompanyName.trim()}
                        className="flex-1 rounded-md bg-indigo-700 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                      >
                        {editSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={editSaving}
                        className="flex-1 rounded-md bg-slate-200 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setConfirmingDelete(true)}
                        disabled={editSaving}
                        title="Delete this reply"
                        aria-label="Delete this reply"
                        className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={r.id}
                onClick={() => startEdit(r)}
                role={isMine ? "button" : undefined}
                tabIndex={isMine ? 0 : undefined}
                onKeyDown={(e) => {
                  if (isMine && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    startEdit(r);
                  }
                }}
                title={isMine ? "Click to edit" : undefined}
                className={`rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${
                  isMine
                    ? "cursor-pointer transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:hover:bg-indigo-950/20"
                    : ""
                }`}
              >
                <span className="font-semibold">{r.company_name}</span>
                <span className="text-slate-600 dark:text-slate-400">
                  {" "}
                  · handled by {r.pitched_by} · replied{" "}
                  {formatDate(r.created_at)}
                </span>
                {r.notes && (
                  <p className="mt-1 text-slate-600 dark:text-slate-400">
                    Notes: {r.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
